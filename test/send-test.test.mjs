// dsh-notify-p · 命令行测试发送的离线测试
//
// 只测不碰网络的部分：参数解析、配置读取、凭据解析顺序，以及"配置不完整就地报错"
// 这条不连网络的路径。真的发信路径由 test/plugin.test.mjs 里的 Remote 用例覆盖
// （log 通道），以及 test/smtp.test.mjs 的假 SMTP 服务器覆盖。
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { parseArgs, readSettingsSection, readCredentialRefs, resolveCredentialFrom, dshHome } from './send-test.mjs';
import { sendTestMail, toDeliveryView } from '../lib/notify/test-send.js';
import { defaultConfig, smtpIssues } from '../lib/notify/config.js';
import { checkSenderConfig, resolveFrom, sendMail } from '../lib/notify/send/index.js';
import { startFakeSmtp } from './fake-smtp.mjs';

test('resolveFrom：走发件人清单解析；空清单回落到旧字段与 SMTP 用户名', () => {
  // 清单里选中的那条（按 activeSender 的地址选，不是按顺序取第一条）
  assert.equal(
    resolveFrom({ senders: [{ name: '运营', address: 'ops@x.com' }, { name: '私人', address: 'me@y.com' }], activeSender: 'me@y.com' }),
    '私人 <me@y.com>',
  );
  // 老配置（只有 senderName / fromAddress）行为与加清单之前完全一致
  assert.equal(resolveFrom({ senderName: '旧名', fromAddress: 'a@x.com' }), '旧名 <a@x.com>');
  // 清单与旧地址都空 → 退回 smtpUser（SMTP 是唯一通道，这条回退永远成立）
  assert.equal(resolveFrom({ senderName: '通知', smtpUser: 'me@qq.com' }), '通知 <me@qq.com>');
  assert.equal(resolveFrom({ senderName: '通知', smtpUser: '' }), '通知', '连用户名都没有就只给显示名');
  // 条目没写显示名 → 用配置里的显示名兜底
  assert.equal(resolveFrom({ senders: [{ address: 'a@x.com' }], senderName: '默认名' }), '默认名 <a@x.com>');
});

/** 造一个临时 DSH home。 */
function tempHome(settings, credentials) {
  const home = mkdtempSync(join(tmpdir(), 'dsh-notify-p-cli-'));
  if (settings !== undefined) writeFileSync(join(home, 'settings.yaml'), settings, 'utf8');
  if (credentials !== undefined) writeFileSync(join(home, '.credentials.yaml'), credentials, 'utf8');
  return home;
}

test('CLI：参数解析认得所有开关，未知参数被单独收集', () => {
  const { flags, unknown } = parseArgs([
    '--to', 'me@qq.com', '--smtp-host', 'smtp.qq.com',
    '--smtp-port', '465', '--smtp-secure', 'tls', '--smtp-user', 'me@qq.com',
    '--from', 'me@qq.com', '--sender-name', 'DSH', '--dry-run', '--json', '--nope',
  ]);
  assert.equal(flags.recipients, 'me@qq.com');
  assert.equal(flags.smtpHost, 'smtp.qq.com');
  assert.equal(flags.smtpPort, 465);
  assert.equal(flags.smtpSecure, 'tls');
  assert.equal(flags.smtpUser, 'me@qq.com');
  assert.equal(flags.fromAddress, 'me@qq.com');
  assert.equal(flags.senderName, 'DSH');
  assert.equal(flags.dryRun, true);
  assert.equal(flags.json, true);
  assert.deepEqual(unknown, ['--nope']);
});

test('CLI：--help 单独识别，不吞其它参数', () => {
  const { flags, unknown } = parseArgs(['--help']);
  assert.equal(flags.help, true);
  assert.deepEqual(unknown, []);
});

test('CLI：读 settings.yaml 的插件段；文件缺失/损坏都退化成空对象', () => {
  const good = tempHome('other-plugin:\n  a: 1\ndsh-notify-p:\n  transport: smtp\n  recipients: me@qq.com\n');
  assert.deepEqual(readSettingsSection(good), { transport: 'smtp', recipients: 'me@qq.com' });

  const missing = mkdtempSync(join(tmpdir(), 'dsh-notify-p-cli-'));
  assert.deepEqual(readSettingsSection(missing), {}, '没有 settings.yaml 时不该抛');

  const broken = tempHome('dsh-notify-p: [unclosed\n');
  assert.deepEqual(readSettingsSection(broken), {}, 'YAML 坏了也要退化成空对象');
});

test('CLI：读凭据库的 refs；records 段不算凭据', () => {
  const home = tempHome(undefined, [
    'version: 1',
    'records:',
    '  client-connection/browser-session:',
    '    kind: grant',
    '    payload: { version: 1, secret: abc }',
    'refs:',
    '  DSH_MAIL_NOTIFY_SMTP_PASSWORD: "the-code"',
    '  RESEND_API_KEY: re_xxx',
    '',
  ].join('\n'));
  const refs = readCredentialRefs(home);
  assert.deepEqual(refs, { DSH_MAIL_NOTIFY_SMTP_PASSWORD: 'the-code', RESEND_API_KEY: 're_xxx' });
  assert.deepEqual(readCredentialRefs(mkdtempSync(join(tmpdir(), 'dsh-notify-p-cli-'))), {});
});

test('CLI：凭据解析顺序是环境变量优先、其次凭据库', () => {
  const refs = { DSH_MAIL_NOTIFY_SMTP_PASSWORD: 'from-file' };
  process.env.DSH_MAIL_NOTIFY_SMTP_PASSWORD = 'from-env';
  try {
    assert.equal(resolveCredentialFrom('DSH_MAIL_NOTIFY_SMTP_PASSWORD', refs), 'from-env');
  } finally {
    delete process.env.DSH_MAIL_NOTIFY_SMTP_PASSWORD;
  }
  assert.equal(resolveCredentialFrom('DSH_MAIL_NOTIFY_SMTP_PASSWORD', refs), 'from-file');
  assert.equal(resolveCredentialFrom('MISSING_REF', refs), undefined);
  assert.equal(resolveCredentialFrom('', refs), undefined);
  assert.equal(resolveCredentialFrom(undefined, refs), undefined);
});

test('CLI：dshHome 跟随 DSH_HOME 环境变量', () => {
  const previous = process.env.DSH_HOME;
  process.env.DSH_HOME = '/tmp/some-home';
  try {
    assert.equal(dshHome(), '/tmp/some-home');
  } finally {
    if (previous === undefined) delete process.env.DSH_HOME;
    else process.env.DSH_HOME = previous;
  }
});

test('sendTestMail：配置不完整就地返回，不连网络也不抛', async () => {
  const result = await sendTestMail({ config: { ...defaultConfig(), transport: 'smtp', recipients: '' } });
  assert.equal(result.ok, false);
  assert.match(result.error, /收件人/);
  assert.equal(result.transport, 'smtp');
  assert.deepEqual(result.recipients, []);
});

test('sendTestMail：SMTP 缺用户名时也说清缺什么（不是等 535）', async () => {
  const result = await sendTestMail({
    config: { ...defaultConfig(), transport: 'smtp', recipients: 'me@qq.com', smtpHost: 'smtp.qq.com', smtpUser: '' },
  });
  assert.equal(result.ok, false);
  assert.match(result.error, /用户名/);
});

test('sendTestMail：真的走完整条渲染链路并经过 SMTP', async (t) => {
  const fake = await startFakeSmtp();
  t.after(() => fake.close());
  const lines = [];
  const result = await sendTestMail({
    config: {
      ...defaultConfig(),
      recipients: 'me@qq.com',
      smtpHost: '127.0.0.1',
      smtpPort: fake.port,
      smtpSecure: 'plain',
      smtpUser: 'me@qq.com',
    },
    logger: { info: (m) => lines.push(m), warn: (m) => lines.push(m), debug: () => {} },
    resolveCredential: () => Promise.resolve('auth-code'),
  });
  assert.equal(result.ok, true, `测试投递应当成功：${result.error}`);
  assert.equal(result.transport, 'smtp');
  assert.deepEqual(result.recipients, ['me@qq.com']);
  assert.match(result.subject, /\[DSH\]/);
  assert.equal(Number.isFinite(result.ms), true);
  assert.match(lines.join('\n'), /测试邮件已投递/);
  assert.ok(fake.received.lines.some((line) => line.startsWith('RCPT TO:<me@qq.com>')), '收件人真的进了 SMTP 会话');
});

test('toDeliveryView：字段齐全且类型稳定（typert 严格 schema 依赖这一点）', () => {
  assert.deepEqual(
    toDeliveryView({
      at: 5,
      ok: true,
      transport: 'log+smtp',
      recipients: ['a@b.com'],
      subject: 's',
      ms: 3,
      error: '',
      channels: [{ transport: 'log', ok: true, ms: 1, error: '' }],
    }),
    {
      at: 5,
      ok: true,
      transport: 'log+smtp',
      recipients: ['a@b.com'],
      subject: 's',
      ms: 3,
      error: '',
      channels: [{ transport: 'log', ok: true, ms: 1, error: '' }],
    },
  );
  // 脏输入也要补齐字段，而不是漏字段
  const dirty = toDeliveryView({ ok: 'yes', recipients: ['a', 2, null], at: 'now' });
  assert.equal(dirty.ok, false);
  assert.deepEqual(dirty.recipients, ['a']);
  assert.equal(typeof dirty.at, 'number');
  assert.equal(typeof dirty.ms, 'number');
  assert.equal(dirty.error, '');
  assert.equal(dirty.subject, '');
  assert.equal(dirty.transport, '');
  assert.deepEqual(dirty.channels, [], '老账本条目没有 channels：必须补成空数组，页面只处理一种形状');
  // channels 里的脏条目也要逐字段补齐（typert 是 strict schema，缺字段会在浏览器侧炸）
  const messy = toDeliveryView({ channels: [null, { ok: 'yes' }, { transport: 'smtp', ok: true, ms: 2, error: '' }] });
  assert.deepEqual(messy.channels, [
    { transport: '', ok: false, ms: 0, error: '' },
    { transport: 'smtp', ok: true, ms: 2, error: '' },
  ]);
  assert.deepEqual(toDeliveryView(undefined), {
    at: toDeliveryView(undefined).at, ok: false, transport: '', recipients: [], subject: '', ms: 0, error: '', channels: [],
  });
});

// ---------------------------------------------------------------------------
// 发送：只有 SMTP 一条路（「只记录」「Resend」两条通道已删除）
// ---------------------------------------------------------------------------

test('smtpIssues：只查 SMTP 自己的必填项', () => {
  assert.deepEqual(smtpIssues({ smtpHost: 'smtp.qq.com', smtpUser: 'me@qq.com' }), []);
  assert.match(smtpIssues({ smtpHost: '', smtpUser: 'me@qq.com' })[0], /主机/);
  assert.match(smtpIssues({ smtpHost: 'smtp.qq.com', smtpUser: '' })[0], /用户名/);
  assert.equal(smtpIssues({ smtpHost: '', smtpUser: '' }).length, 2);
});

test('checkSenderConfig：收件人与 SMTP 必填项一起报', () => {
  assert.deepEqual(checkSenderConfig({ smtpHost: 'smtp.qq.com', smtpUser: 'me@qq.com' }, 1), []);
  assert.match(checkSenderConfig({ smtpHost: 'smtp.qq.com', smtpUser: 'me@qq.com' }, 0)[0], /收件人/);
  assert.equal(checkSenderConfig({ smtpHost: '', smtpUser: '' }, 0).length, 3, '三个问题都要报出来，而不是只报第一个');
});

test('sendMail：缺配置就地报 CONFIG，不去连网络，也不重试', async () => {
  const lines = [];
  const config = { ...defaultConfig(), recipients: 'me@qq.com' };
  const summary = await sendMail(config, { to: ['me@qq.com'], subject: 's', text: 't' }, {
    logger: { info: (m) => lines.push(m), warn: (m) => lines.push(m), debug: () => {} },
  });
  assert.equal(summary.ok, false);
  assert.equal(summary.retryable, false, 'CONFIG 类失败不重试');
  assert.equal(summary.transport, 'smtp');
  assert.match(summary.error, /^smtp: /, '汇总要说清是哪条通道失败');
  assert.match(summary.error, /主机/);
  // 结果形状没变：账本与 typert 清单都按 channels[] 读
  assert.equal(summary.channels.length, 1);
  assert.equal(summary.channels[0].transport, 'smtp');
  assert.equal(summary.channels[0].ok, false);
});

test('sendTestMail：只有一条通道，channels 里恒为一项（账本与 typert 清单按它读）', async () => {
  const lines = [];
  const result = await sendTestMail({
    config: { ...defaultConfig(), smtpHost: '', recipients: 'me@qq.com' },
    logger: { info: (m) => lines.push(m), warn: (m) => lines.push(m), debug: () => {} },
  });
  assert.equal(result.ok, false, '缺主机：整体不算成功');
  assert.deepEqual(result.channels.map((item) => [item.transport, item.ok]), [['smtp', false]]);
  assert.equal(result.transport, 'smtp');
  assert.match(result.error, /smtp: /, '汇总要说清是哪条通道失败');
  assert.equal(result.subject.length > 0, true, '失败也要带主题：页面的读数靠它');
});
