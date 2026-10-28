// dsh-notify-p · 配置层
//
// 全部非机密配置都来自组合层入口：$DSH_HOME/profiles/<profile>/cordis.patch.yml
// 里本插件 entry 的 `config:`（运行时以 volatile 引用交给 apply，见下面的 unwrapVolatile）。
// 机密（SMTP 授权码）只在这里存"引用名"，真值在凭据库
// （$DSH_HOME/.credentials.yaml 或同名环境变量）——配置文件里永不出现密钥。
//
// 本文件只依赖 schemastery，不碰 cordis，便于单测。

import z from '@deepseek-ai/schemastery';

/** 默认凭据引用名（与 $DSH_HOME/.credentials.yaml 的键同名）。 */
export const DEFAULT_SMTP_PASSWORD_REF = 'DSH_MAIL_NOTIFY_SMTP_PASSWORD';

/**
 * 发件人显示名（固定值）。
 *
 * 发件地址固定用 smtpUser——发件人清单与旧发件人字段已整块删除，
 * 这里只剩一个固定显示名，不再走任何配置字段。
 */
export const DEFAULT_SENDER_NAME = 'DSH 通知 / DSH Notification';

// ---- 节奏参数：界面不再暴露，硬编码 ----
//
// 这三个值以前是配置字段（settleMs / minDurationMs / ratePerMinute），
// 现在从 schema 里删掉了：设置页不再出现它们，行为与原来的默认值完全一致。
// 想改节奏请改这里的常量（需要重新加载插件）。

/** 空闲合并窗口：turn/end 后再等这么久，期间若同会话又开新轮则合并成一封。 */
export const SETTLE_MS = 1500;

/** 短任务不打扰：会话总时长低于此值不发（只对"完成"生效）。 */
export const MIN_DURATION_MS = 2000;

/** 全局发信速率上限（封/分钟），多会话并停时保护 SMTP。 */
export const RATE_PER_MINUTE = 10;

/**
 * 本插件的完整配置 schema。
 * 每个字段都会出现在「设置 → 插件 → 插件配置 → 邮件通知」卡片上（中英并列）。
 *
 * 发件人身份与「邮件直达链接」两条能力已整块删除：相关字段一条都不剩。
 * 发件地址固定用 smtpUser，邮件正文不带任何链接。
 *
 * ⚠️ 两条不能删的约束（DSH 0.2.x 的 settings 契约，见 docs/adr/0005）：
 *
 *   1. **本 schema 必须由入口模块（lib/index.js）以 `Config` 的名字导出**。
 *      dsh-settings 的 `schema(entry)` 只读 `entry.fiber.runtime.Config`；
 *      没有这个导出，`describe()` 直接跳过本 entry —— 设置页显示
 *      「这一页读不到本插件的配置」，读不到也写不进。
 *   2. **每个字段都必须 `.volatile()`**。settings 的 `volatileForm()` 只把
 *      `meta.volatile` 的字段算作可编辑：一个都没有时它返回 undefined，
 *      `describe()` 同样跳过；写回还会报 `has no volatile fields`。
 *
 * 附带后果（很重要，别当成 bug）：标了 volatile 的字段在 schemastery 校验时
 * 会被包成 **volatile 引用**（`{ get(), [Symbol.for('cosmokit.volatile.write')] }`），
 * 运行中的 config 对象里存的就是这种引用，见下面 `unwrapVolatile()` 的注释。
 */
export const MailSchema = z.object({
  /** 总开关。关掉后插件只订阅不动作。 */
  enabled: z.boolean().default(true).volatile(),

  /** 收件人：一行一个（也接受逗号/分号分隔）。 */
  recipients: z.string().default('').volatile(),

  /** 是否也通知子代理会话（默认关：一个 workflow 能扇出几十个子会话）。 */
  includeSubagents: z.boolean().default(false).volatile(),

  // ---- SMTP（唯一的发送通道；smtpUser 同时是发件地址）----
  smtpHost: z.string().default('').volatile(),
  smtpPort: z.natural().max(65535).default(465).volatile(),
  /** auto：465 走隐式 TLS，其余走 STARTTLS。 */
  smtpSecure: z.union([z.const('auto'), z.const('tls'), z.const('starttls'), z.const('plain')]).default('auto').volatile(),
  smtpUser: z.string().default('').volatile(),
  /** 凭据引用名，不是密码本身。 */
  smtpPasswordRef: z.string().default(DEFAULT_SMTP_PASSWORD_REF).volatile(),

  // ---- 事件开关 ----
  notifyCompleted: z.boolean().default(true).volatile(),
  notifyError: z.boolean().default(true).volatile(),
  notifyBlocked: z.boolean().default(true).volatile(),
  /** 只有 aborted.reason.kind === 'user'（真·你主动停止）才算。 */
  notifyAbortedByUser: z.boolean().default(false).volatile(),
  /** 重启/热更/被父级取消 等系统中断。 */
  notifyInterrupted: z.boolean().default(false).volatile(),
  notifyMaxTokens: z.boolean().default(false).volatile(),
  notifyApproval: z.boolean().default(true).volatile(),
});

// ---- volatile 引用：读配置前必须先拆掉这层壳 ----
//
// 字段标了 .volatile() 之后，schemastery 在校验时把每个值包成 cosmokit 的
// **volatile 引用**（`Object.freeze({ get, [Symbol.for('cosmokit.volatile.write')] })`）。
// 这不是本插件的发明，是 DSH 0.2.x 的运行态真相：
//
//   * 插件拿到 config 时，标了 volatile 的字段已经是引用对象（不是裸值）；
//   * 设置页保存走 cordis-plugin-loader 的 `_commitVolatile`：它**原地**把新值写进
//     这些引用（`updateVolatile(ref, source)` → `ref[write](source.get())`），
//     **不会重跑 apply**。所以"每次读活的 config"= 每次都从引用里 `.get()`，
//     而不是把启动时解析出来的那份对象当真相。
//   * 反过来，把引用对象喂回 schema 会直接校验失败
//     （`$.smtpHost expected string but got [object Object]`），所以入参也要先拆壳。
//
// 用 `Symbol.for()` 取协议键：全局符号表是进程级的，不需要 import cosmokit
// （本插件的模块图刻意不出现 DSH 裸包名，理由见 lib/deps.js 那类注释）。

/** cosmokit volatile 引用协议键（与 cordis 用的是同一个全局符号）。 */
const VOLATILE_WRITE = Symbol.for('cosmokit.volatile.write');

/**
 * 判断一个值是不是 cosmokit 的 volatile 引用。
 * @param {unknown} value 候选值
 * @returns {boolean}
 */
export function isVolatileRef(value) {
  return value !== null
    && typeof value === 'object'
    && typeof value.get === 'function'
    && VOLATILE_WRITE in value;
}

/**
 * 递归拆掉 volatile 引用，返回**全新**的普通对象（绝不改动传进来的对象——
 * 它可能是 loader 正在用的那份 config）。
 * @template T
 * @param {T} value 可能含引用的值
 * @returns {T} 拆壳后的普通值
 */
export function unwrapVolatile(value) {
  if (isVolatileRef(value)) return unwrapVolatile(value.get());
  if (Array.isArray(value)) return value.map((item) => unwrapVolatile(item));
  if (value !== null && typeof value === 'object') {
    const proto = Object.getPrototypeOf(value);
    // 只递归普通对象：Date / Map / 类实例原样带过，免得把别的东西拆坏
    if (proto !== Object.prototype && proto !== null) return value;
    const out = {};
    for (const [key, child] of Object.entries(value)) out[key] = unwrapVolatile(child);
    return out;
  }
  return value;
}

/**
 * schema 默认值（也给 cordis 行 config 缺省时兜底）。
 * @returns {object} 完整默认配置
 */
export function defaultConfig() {
  return resolveConfig({});
}

/**
 * 把（可选）组合层入口配置解析成完整配置。
 *
 * 入参可以是：cordis 行 config（可能含 volatile 引用）、settings 读到的值、
 * 或者上一层的解析结果。出参**永远是裸值的普通对象**——调用方（发信判定、
 * 渲染、测试邮件）都按裸值用，谁也不必再关心 volatile 这层壳。
 * @param {object} [entry] cordis 行的 config（活的、可原地更新的那个对象）
 * @returns {object} 补齐默认值后的配置
 */
export function resolveConfig(entry) {
  // 先拆入参的壳（引用喂回 schema 会校验失败），再拆出参的壳（schema 会重新包上）
  return unwrapVolatile(MailSchema(unwrapVolatile(entry ?? {})));
}

/**
 * SMTP 缺什么（发信前能查出来的）。
 *
 * 只查"SMTP 特有"的必填项；收件人这类跟发送方式无关的，由调用方查一次，
 * 免得同一句话被重复报。
 *
 * 发件地址固定取 smtpUser（见 send/index.js 的 resolveFrom），所以"发件人地址为空"
 * 这件事不会单独出现：用户名查过就够了。
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
