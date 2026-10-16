// dsh-notify-p · 配置层
//
// 一个 settings namespace 承载全部非机密配置（落 $DSH_HOME/settings.yaml），
// 机密（SMTP 授权码）只在这里存"引用名"，真值在凭据库
// （$DSH_HOME/.credentials.yaml 或同名环境变量）——settings 文档里永不出现密钥。
//
// 本文件只依赖 schemastery，不碰 cordis，便于单测。

import z from '@deepseek-ai/schemastery';

/** settings namespace；客户端卡片以同名 key 注册到 settings.plugin.item。 */
export const NAMESPACE = 'dsh-notify-p';

/** 默认凭据引用名（与 $DSH_HOME/.credentials.yaml 的键同名）。 */
export const DEFAULT_SMTP_PASSWORD_REF = 'DSH_MAIL_NOTIFY_SMTP_PASSWORD';

/** 发件人显示名的默认值（清单里某条留空显示名时也用它）。 */
export const DEFAULT_SENDER_NAME = 'DSH 通知 / DSH Notification';

/**
 * 本插件的完整配置 schema。
 * 每个字段都会出现在「设置 → 插件 → 插件配置 → 邮件通知」卡片上（中英并列）。
 */
export const MailSchema = z.object({
  /** 总开关。关掉后插件只订阅不动作。 */
  enabled: z.boolean().default(true),

  /** 收件人：一行一个（也接受逗号/分号分隔）。 */
  recipients: z.string().default(''),

  /**
   * 发件人显示名（**旧字段**，与 fromAddress 一起被 senders 取代）。
   * 留着是为了老配置照常发信；新配置只写 senders，见 senderList() 的迁移约定。
   */
  senderName: z.string().default(DEFAULT_SENDER_NAME),

  /**
   * 发件人地址（**旧字段**）；留空时按 transport 取默认（SMTP 用 smtpUser）。
   *
   * 写 senders 时必须**同一批 op 里清掉它**，否则删光的清单会让它复活。
   * @deprecated 用 senders + activeSender。
   */
  fromAddress: z.string().default(''),

  /**
   * 发件人清单：保存所有发件身份，发信时用 activeSender 选中的那条。
   *
   * 空数组的语义是"没设置过 vs 显式清空"分不清：settings 的 describe() 返回 schema 解析后的
   * 完整值，没写过 senders 的老配置读出来也是 `[]`，跟"用户删光了"长得一模一样。约定是
   * **非空才作数，空了回落到旧的 senderName/fromAddress**。
   *
   * 这里**允许删光**：设置页写列表时会在同一批 op 里把 fromAddress/senderName 一并清掉，
   * 刚删掉的那条不会借旧字段"复活"。
   */
  senders: z.array(z.object({
    /** 显示名；留空 = 用默认显示名，由 resolveSender 兜底（不把本地化默认值写进配置）。 */
    name: z.string().default(''),
    /** 邮箱地址；清单里的每条都必须是能用的 From。 */
    address: z.string(),
  })).default([]),

  /** 当前生效的发件人。**记地址而不是序号**——删掉前面一条时序号会整体错位。 */
  activeSender: z.string().default(''),

  /** 邮件里链接的对外地址，如 http://127.0.0.1:3081 或 https://dsh.example.com；留空则读 DSH_WEB_URL。 */
  publicBaseUrl: z.string().default(''),

  /** 是否在邮件里附带"直达会话"链接（需要另装 dsh-deeplink / dsh-session-link 才能被识别）。 */
  linkEnabled: z.boolean().default(true),

  /** 是否也通知子代理会话（默认关：一个 workflow 能扇出几十个子会话）。 */
  includeSubagents: z.boolean().default(false),

  /** 空闲合并窗口：turn/end 后再等这么久，期间若同会话又开新轮则合并成一封。 */
  settleMs: z.natural().default(1500),

  /** 短任务不打扰：会话总时长低于此值不发。 */
  minDurationMs: z.natural().default(2000),

  /** 全局发信速率上限（封/分钟），多会话并停时保护 SMTP。 */
  ratePerMinute: z.natural().default(10),

  /** 投递账本路径；留空 = $DSH_HOME/dsh-notify-p/state.json（排错时 cat 它）。 */
  statePath: z.string().default(''),

  // ---- SMTP（唯一的发送通道）----
  smtpHost: z.string().default(''),
  smtpPort: z.natural().max(65535).default(465),
  /** auto：465 走隐式 TLS，其余走 STARTTLS。 */
  smtpSecure: z.union([z.const('auto'), z.const('tls'), z.const('starttls'), z.const('plain')]).default('auto'),
  smtpUser: z.string().default(''),
  /** 凭据引用名，不是密码本身。 */
  smtpPasswordRef: z.string().default(DEFAULT_SMTP_PASSWORD_REF),

  // ---- 事件开关 ----
  notifyCompleted: z.boolean().default(true),
  notifyError: z.boolean().default(true),
  notifyBlocked: z.boolean().default(true),
  /** 只有 aborted.reason.kind === 'user'（真·你主动停止）才算。 */
  notifyAbortedByUser: z.boolean().default(false),
  /** 重启/热更/被父级取消 等系统中断。 */
  notifyInterrupted: z.boolean().default(false),
  notifyMaxTokens: z.boolean().default(false),
  notifyApproval: z.boolean().default(true),
});

/**
 * schema 默认值（也给 cordis 行 config 缺省时兜底）。
 * @returns {object} 完整默认配置
 */
export function defaultConfig() {
  return MailSchema({});
}

/**
 * 把（可选）组合层入口配置解析成完整配置。
 * @param {object} [entry] cordis 行的 config
 * @returns {object} 补齐默认值后的配置
 */
export function resolveConfig(entry) {
  return MailSchema(entry ?? {});
}

/**
 * 归一化发件人清单，并把**老配置迁移**成清单。
 *
 * 迁移规则：`senders` 非空就作数；为空且旧 `fromAddress` 有值时，合成唯一一条
 * `{ name: senderName, address: fromAddress }`。旧地址为空时**不迁移**——
 * 那时旧行为本来就是"回退到默认"，与"清单为空"完全等价，凭空造一条反而会改变行为。
 * @param {object} [config] 已解析配置（或任何带 senders / fromAddress 的对象）
 * @returns {{ name: string, address: string }[]} 去空、去重后的清单（可能为空）
 */
export function senderList(config) {
  const raw = Array.isArray(config?.senders) ? config.senders : [];
  const list = [];
  const seen = new Set();
  for (const entry of raw) {
    const address = String(entry?.address ?? '').trim();
    if (address === '') continue; // 地址是唯一必填项：没有地址的条目等于没配置
    const key = address.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    list.push({ name: String(entry?.name ?? '').trim(), address });
  }
  if (list.length > 0) return list;

  const address = String(config?.fromAddress ?? '').trim();
  if (address === '') return [];
  return [{ name: String(config?.senderName ?? '').trim(), address }];
}

/**
 * 解析"这次用哪个发件人"。
 *
 * 选中项按**地址**匹配；地址已被删掉（或压根没设过）就退回清单第一条。
 * 清单为空时回落到旧的 senderName/fromAddress，显示名再兜底到默认值——
 * 所以老配置一行都不用改，行为与加清单之前完全一致。
 * @param {object} [config] 已解析配置
 * @returns {{ name: string, address: string }} 生效的发件人；清单为空且无旧值时 address 为 ''
 */
export function resolveSender(config) {
  const list = senderList(config);
  const wanted = String(config?.activeSender ?? '').trim().toLowerCase();
  const picked = list.find((entry) => entry.address.toLowerCase() === wanted) ?? list[0];

  if (picked !== undefined) {
    const name = picked.name !== '' ? picked.name : String(config?.senderName ?? '').trim();
    return { name: name !== '' ? name : DEFAULT_SENDER_NAME, address: picked.address };
  }
  return { name: String(config?.senderName ?? '').trim() || DEFAULT_SENDER_NAME, address: '' };
}

/**
 * SMTP 缺什么（发信前能查出来的）。
 *
 * 只查"SMTP 特有"的必填项；收件人、发件人之类跟发送方式无关的，由调用方查一次，
 * 免得同一句话被重复报。
 * @param {object} config 已解析配置
 * @returns {string[]} 问题列表（空数组表示没发现明显问题）
 */
export function smtpIssues(config) {
  const issues = [];
  if (String(config?.smtpHost ?? '').trim() === '') {
    issues.push('SMTP 主机为空 / smtpHost is empty');
  }
  // 用户名不填，后面只会拿到一句 SMTP 原始报错；在这里拦住能直接说清缺什么。
  if (String(config?.smtpUser ?? '').trim() === '') {
    issues.push('SMTP 用户名为空（通常是你的完整邮箱地址）/ smtpUser is empty');
  }
  // 发件人地址不在这里报：拿不到时 SMTP 会退回 smtpUser（见 resolveFrom），那是合法的。
  return issues;
}

/**
 * 跟通道无关、只该报一次的问题。
 * @param {number} recipientCount 有效收件人数
 * @returns {string[]} 问题列表
 */
export function recipientIssues(recipientCount) {
  return recipientCount === 0 ? ['收件人为空 / no recipients configured'] : [];
}

/** 常见邮箱的 SMTP 预设（设置页"一键填入"用）。domains 是这个服务商认的账号域名。 */
export const SMTP_PRESETS = {
  qq: { host: 'smtp.qq.com', port: 465, secure: 'tls', user: '@qq.com', name: 'QQ 邮箱', domains: ['qq.com', 'foxmail.com', 'vip.qq.com'] },
  '163': { host: 'smtp.163.com', port: 465, secure: 'tls', user: '@163.com', name: '163 邮箱', domains: ['163.com', '188.com', 'yeah.net'] },
  '126': { host: 'smtp.126.com', port: 465, secure: 'tls', user: '@126.com', name: '126 邮箱', domains: ['126.com'] },
  gmail: { host: 'smtp.gmail.com', port: 465, secure: 'tls', user: '@gmail.com', name: 'Gmail', domains: ['gmail.com', 'googlemail.com'] },
  outlook: { host: 'smtp.office365.com', port: 587, secure: 'starttls', user: '@outlook.com', name: 'Outlook', domains: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com'] },
  icloud: { host: 'smtp.mail.me.com', port: 587, secure: 'starttls', user: '@icloud.com', name: 'iCloud', domains: ['icloud.com', 'me.com', 'mac.com'] },
};

/**
 * 账号和服务商对不上时给一句人话。
 *
 * 用 QQ 的服务器 + outlook 的账号去认证，一定是 535 认证失败——但这个错误在发信前
 * 完全可以看出。只是**提示不是错误**：企业中继、同服务商别名都可能合法，所以不拦发送。
 * @param {object} config 已解析配置
 * @returns {string} 提示文案；没问题时返回空串
 */
export function smtpAccountHint(config) {
  const host = String(config?.smtpHost ?? '').trim().toLowerCase();
  const user = String(config?.smtpUser ?? '').trim().toLowerCase();
  if (host === '' || user === '') return '';
  const preset = Object.values(SMTP_PRESETS).find((item) => item.host === host);
  if (preset === undefined) return '';
  const at = user.lastIndexOf('@');
  if (at === -1) return '';
  const domain = user.slice(at + 1);
  if (preset.domains.includes(domain)) return '';
  return `${host} 是${preset.name}的服务器，但账号是 ${user}：这两者对不上，认证会失败。`
    + `要么把账号换成 ${preset.user} 结尾的邮箱，要么把服务商改成账号所属的那一家。`;
}

/**
 * 解析收件人：一行一个（兼容逗号/分号），去空、去重、丢弃明显不含 @ 的项。
 * @param {string} raw 用户填写的原始文本
 * @returns {{ valid: string[], invalid: string[] }}
 */
export function parseRecipients(raw) {
  const valid = [];
  const invalid = [];
  const seen = new Set();
  if (typeof raw !== 'string' || raw.trim() === '') return { valid, invalid };
  for (const chunk of raw.split(/[\n,;]+/)) {
    const addr = chunk.trim();
    if (addr === '') continue;
    const key = addr.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) invalid.push(addr);
    else valid.push(addr);
  }
  return { valid, invalid };
}

/**
 * 解析邮件里链接的基地址：优先用户配置，其次 DSH_WEB_URL，最后回退回环地址。
 * @param {object} config 已解析配置
 * @param {string} [webUrl] 运行时探测到的 Web GUI 地址
 * @returns {string} 不带结尾斜杠的基地址；都拿不到时返回空串
 */
export function resolveBaseUrl(config, webUrl) {
  const raw = typeof config?.publicBaseUrl === 'string' && config.publicBaseUrl.trim() !== ''
    ? config.publicBaseUrl
    : (typeof webUrl === 'string' ? webUrl : '');
  return String(raw).trim().replace(/\/+$/, '');
}

/**
 * 拼一条"直达会话"链接。
 *
 * 本插件**不实现** `?session=` 的接收端——那由 dsh-deeplink（或 dsh-session-link）负责。
 * 这里只负责把链接拼对放进正文。
 * @param {string} baseUrl 基地址（已去掉结尾斜杠）
 * @param {string} sessionId 会话 ID
 * @returns {string} 形如 http://127.0.0.1:3081/?session=session-xxxx；baseUrl 为空时返回空串
 */
export function sessionLink(baseUrl, sessionId) {
  if (typeof baseUrl !== 'string' || baseUrl === '') return '';
  if (typeof sessionId !== 'string' || sessionId === '') return '';
  return `${baseUrl}/?session=${encodeURIComponent(sessionId)}`;
}
