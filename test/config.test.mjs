import test from 'node:test';
import assert from 'node:assert/strict';

import z from '@deepseek-ai/schemastery';

import {
  defaultConfig,
  isVolatileRef,
  MailSchema,
  parseRecipients,
  resolveConfig,
  smtpAccountHint,
  smtpIssues,
  SMTP_PRESETS,
  MIN_DURATION_MS,
  RATE_PER_MINUTE,
  SETTLE_MS,
} from '../lib/notify/config.js';
// 设置页读的是**包入口**的导出（entry.fiber.runtime.Config），所以必须从入口验，
// 不能只验 config.js 里那份（入口忘了再导出，设置页照样整页失联）。
import { Config } from '../lib/index.js';

/** cosmokit 的 volatile 引用协议键（与 cordis / schemastery 同一个全局符号）。 */
const VOLATILE_WRITE = Symbol.for('cosmokit.volatile.write');

/** 已整块删除的两条能力（发件人清单 / 邮件直达链接）留下的字段名。 */
const REMOVED_FIELDS = ['senders', 'activeSender', 'senderName', 'fromAddress', 'linkEnabled', 'publicBaseUrl'];

test('parseRecipients：一行一个，兼容逗号分号，去重去空、挑出非法项', () => {
  const { valid, invalid } = parseRecipients('a@x.com\nb@y.com, c@z.com; a@x.com\n\nnot-an-email\n');
  assert.deepEqual(valid, ['a@x.com', 'b@y.com', 'c@z.com']);
  assert.deepEqual(invalid, ['not-an-email']);
  assert.deepEqual(parseRecipients(''), { valid: [], invalid: [] });
  assert.deepEqual(parseRecipients(undefined), { valid: [], invalid: [] });
});

test('默认配置：SMTP 是唯一的发送方式 + 不打断的节奏默认值', () => {
  const config = defaultConfig();
  assert.equal(config.enabled, true);
  assert.equal(config.includeSubagents, false);
  // 发件人清单与「邮件直达链接」两条能力已整块删除：配置里不该再有它们的任何字段
  for (const field of REMOVED_FIELDS) {
    assert.equal(field in config, false, `${field} 已删除，不该再出现在配置里`);
  }
  // 节奏参数不再是配置字段（界面不暴露），改成模块级常量；值必须与原来的默认值一致
  assert.equal(SETTLE_MS, 1500);
  assert.equal(MIN_DURATION_MS, 2000);
  assert.equal(RATE_PER_MINUTE, 10);
  assert.equal('settleMs' in config, false, '合并窗口已硬编码，不该再出现在配置里');
  assert.equal('minDurationMs' in config, false, '短任务下限已硬编码，不该再出现在配置里');
  assert.equal('ratePerMinute' in config, false, '限流已硬编码，不该再出现在配置里');
  assert.equal('statePath' in config, false, '投递账本已删除，不该再出现在配置里');
  assert.equal(config.smtpPasswordRef, 'DSH_MAIL_NOTIFY_SMTP_PASSWORD');
  assert.equal(config.smtpPort, 465);
  assert.equal(config.smtpSecure, 'auto');
  // 通道概念已删：配置里不该再有 transport / transports / resend 的任何痕迹
  assert.equal('transport' in config, false);
  assert.equal('transports' in config, false);
  assert.equal('resendApiKeyRef' in config, false);
  assert.equal('resendApiBase' in config, false);
});

test('配置解析：组合层入口能覆盖 schema 默认值', () => {
  const config = defaultConfig();
  assert.equal(typeof config.recipients, 'string');
  assert.equal(config.recipients, '');
});

// ---------------------------------------------------------------------------
// 账号 / 服务商对不上：这是"点发送才报 535"的典型，应该在发信前就能看见
// ---------------------------------------------------------------------------

test('smtpAccountHint：QQ 服务器配 outlook 账号要报警', () => {
  const hint = smtpAccountHint({ smtpHost: 'smtp.qq.com', smtpUser: 'cowwo@outlook.com' });
  assert.match(hint, /smtp\.qq\.com/);
  assert.match(hint, /cowwo@outlook\.com/);
  assert.match(hint, /QQ/);
});

test('smtpAccountHint：同服务商自己的多个域名不算错', () => {
  assert.equal(smtpAccountHint({ smtpHost: 'smtp.qq.com', smtpUser: 'me@qq.com' }), '');
  assert.equal(smtpAccountHint({ smtpHost: 'smtp.qq.com', smtpUser: 'me@foxmail.com' }), '');
  assert.equal(smtpAccountHint({ smtpHost: 'smtp.office365.com', smtpUser: 'me@hotmail.com' }), '');
  assert.equal(smtpAccountHint({ smtpHost: 'smtp.mail.me.com', smtpUser: 'me@me.com' }), '');
  assert.equal(smtpAccountHint({ smtpHost: 'smtp.gmail.com', smtpUser: 'me@googlemail.com' }), '');
});

test('smtpAccountHint：大小写与前后的空白不影响判断', () => {
  assert.equal(smtpAccountHint({ smtpHost: ' SMTP.QQ.COM ', smtpUser: ' ME@QQ.COM ' }), '');
  assert.notEqual(smtpAccountHint({ smtpHost: 'SMTP.QQ.COM', smtpUser: 'me@OUTLOOK.com' }), '');
});

test('smtpAccountHint：不认识的主机 / 缺字段一律不吭声', () => {
  // 自建中继、企业内部服务器都是合法的，插件不该乱猜
  assert.equal(smtpAccountHint({ smtpHost: 'smtp.example.com', smtpUser: 'me@example.com' }), '');
  assert.equal(smtpAccountHint({ smtpHost: '', smtpUser: 'me@qq.com' }), '');
  assert.equal(smtpAccountHint({ smtpHost: 'smtp.qq.com', smtpUser: '' }), '');
  assert.equal(smtpAccountHint({ smtpHost: 'smtp.qq.com', smtpUser: 'not-an-email' }), '');
  assert.equal(smtpAccountHint(undefined), '');
});

test('预设表：每个预设都要有 name 与 domains，且 domains 与 user 后缀自洽', () => {
  for (const [id, preset] of Object.entries(SMTP_PRESETS)) {
    assert.equal(typeof preset.name, 'string', `${id} 缺 name`);
    assert.equal(Array.isArray(preset.domains) && preset.domains.length > 0, true, `${id} 缺 domains`);
    assert.equal(preset.domains.includes(preset.user.slice(1)), true, `${id} 的 domains 应包含自己的 user 后缀`);
  }
});

test('schema 声明的字段里不再有发件人/链接；老配置残留同名键也照常解析', () => {
  // schema 自己（空输入解析出来的键集合）不该再有这 6 个字段
  const declared = Object.keys(resolveConfig({}));
  for (const field of REMOVED_FIELDS) {
    assert.equal(declared.includes(field), false, `${field} 已从 schema 删除`);
  }
  // 老 settings.yaml 里残留的键不影响其余字段的解析：删字段不能把老配置整份弄坏
  const legacy = resolveConfig({
    recipients: 'me@qq.com',
    senders: [{ name: '旧', address: 'a@x.com' }],
    activeSender: 'a@x.com',
    senderName: '旧名',
    fromAddress: 'a@x.com',
    linkEnabled: true,
    publicBaseUrl: 'http://127.0.0.1:3081',
  });
  assert.equal(legacy.recipients, 'me@qq.com');
  assert.deepEqual(parseRecipients(legacy.recipients).valid, ['me@qq.com']);
});

test('smtpIssues：只查 SMTP 自己的必填项，不越界报别人的问题', () => {
  assert.deepEqual(smtpIssues({ smtpHost: 'smtp.qq.com', smtpUser: 'me@qq.com' }), []);
  assert.match(smtpIssues({ smtpHost: '', smtpUser: 'me@qq.com' })[0], /主机/);
  assert.match(smtpIssues({ smtpHost: 'smtp.qq.com', smtpUser: '' })[0], /用户名/);
  assert.equal(smtpIssues({ smtpHost: '', smtpUser: '' }).length, 2, '两个都缺就都报出来');
  // 发件地址固定用 smtpUser，所以没有"发件人地址为空"这类单独的问题
  assert.deepEqual(smtpIssues({ smtpHost: 'smtp.qq.com', smtpUser: 'me@qq.com' }), []);
});

// ---------------------------------------------------------------------------
// 设置页契约（ADR 0005）：入口导出 Config + 15 个字段全部 .volatile()
//
// 两件事少任何一件，设置页都会整页失联，但坏的位置不同：
//   * 没导出 Config   → dsh-settings 的 describe() 直接跳过本 entry（读不到也写不进）
//   * 字段没 volatile → volatileForm() 返回 undefined，同样被跳过；写回报 not volatile
// ---------------------------------------------------------------------------

/** 删字段（发件人清单 / 直达链接 / 节奏参数 / 投递账本）之后的终态默认值。 */
const EXPECTED_DEFAULTS = {
  enabled: true,
  recipients: '',
  includeSubagents: false,
  smtpHost: '',
  smtpPort: 465,
  smtpSecure: 'auto',
  smtpUser: '',
  smtpPasswordRef: 'DSH_MAIL_NOTIFY_SMTP_PASSWORD',
  notifyCompleted: true,
  notifyError: true,
  notifyBlocked: true,
  notifyAbortedByUser: false,
  notifyInterrupted: false,
  notifyMaxTokens: false,
  notifyApproval: true,
};

test('入口导出 Config：包入口可见、是 schemastery schema、与 MailSchema 是同一份', () => {
  assert.ok(Config, 'lib/index.js 必须在模块顶层导出 Config（settings 只读 entry.fiber.runtime.Config）');
  assert.equal(Config, MailSchema, '入口的 Config 必须是 config.js 里那份 MailSchema，不许复制一份');
  assert.equal(Config instanceof z, true, 'Config 必须是 schemastery schema 实例');
  assert.equal(Config.type, 'object', 'Config 必须是 object schema');
  assert.equal(typeof Config['~standard']?.validate, 'function', 'settings 走 standard-schema 校验');
  // 不是空壳：真能解析出完整默认值
  assert.deepEqual(resolveConfig(Config({})), EXPECTED_DEFAULTS);
});

test('Config 的 15 个字段全部 volatile（少一个，设置页就少一个能写的字段）', () => {
  const fields = Object.keys(Config.dict);
  assert.equal(fields.length, 15, '字段数必须正好 15');
  assert.deepEqual(fields.slice().sort(), Object.keys(EXPECTED_DEFAULTS).sort(), '字段集合必须与终态一致（不多不少）');
  for (const [name, field] of Object.entries(Config.dict)) {
    assert.equal(field.meta?.volatile, true, `${name} 必须标 .volatile()，否则 volatileForm() 会跳过整页`);
  }
  // toJSON() 也要带 meta.volatile：settings 服务按它投影可写表单
  const json = Config.toJSON();
  const root = json.refs[String(json.uid)];
  for (const [name, index] of Object.entries(root.dict)) {
    assert.equal(json.refs[String(index)].meta?.volatile, true, `toJSON() 里 ${name} 缺 meta.volatile`);
  }
});

test('默认值：15 个字段与删字段前的终态完全一致（一个都不许改）', () => {
  assert.deepEqual(defaultConfig(), EXPECTED_DEFAULTS);
  assert.deepEqual(resolveConfig({}), EXPECTED_DEFAULTS);
  assert.deepEqual(resolveConfig(undefined), EXPECTED_DEFAULTS);
  // schema 自己声明的默认值（设置页「恢复默认」读的就是这一份）
  const declared = Object.fromEntries(Object.entries(Config.dict).map(([name, field]) => [name, field.meta?.default]));
  assert.deepEqual(declared, EXPECTED_DEFAULTS);
});

test('resolveConfig：能拆 volatile 引用，且每次都读引用里的当前值（活配置的真相）', () => {
  /** 与 cordis 同形的 volatile 引用：身份不变，值可原地改写。 */
  const ref = (initial) => {
    let current = initial;
    return { get: () => current, [VOLATILE_WRITE]: (next) => { current = next; } };
  };

  const live = { smtpHost: ref('smtp.qq.com'), smtpPort: ref(465), enabled: ref(true) };
  const first = resolveConfig(live);
  assert.equal(first.smtpHost, 'smtp.qq.com');
  assert.equal(first.smtpPort, 465);
  assert.equal(first.enabled, true);
  // 出参永远是裸值：调用方（发信判定 / 渲染 / 测试邮件）不必再关心这层壳
  assert.equal(isVolatileRef(first.smtpHost), false);
  assert.equal(typeof first.smtpHost, 'string');

  // 原地改写引用（= 设置页保存的路径）之后，再读就是新值；"启动时快照"会在这里露馅
  live.smtpHost[VOLATILE_WRITE]('smtp.changed.example.com');
  assert.equal(resolveConfig(live).smtpHost, 'smtp.changed.example.com');

  // 入参不许被改写：它可能是 loader 正在用的那份 config
  assert.equal(isVolatileRef(live.smtpHost), true);
  assert.deepEqual(Object.keys(live), ['smtpHost', 'smtpPort', 'enabled']);

  // 回归护栏：引用直接喂回 schema 会校验失败，所以 resolveConfig 必须先拆壳
  assert.throws(() => MailSchema(live), /expected (string|boolean) but got \[object Object\]/);
});
