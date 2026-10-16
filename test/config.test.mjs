import test from 'node:test';
import assert from 'node:assert/strict';

import { defaultConfig, DEFAULT_SENDER_NAME, parseRecipients, resolveBaseUrl, resolveSender, senderList, sessionLink, smtpAccountHint, smtpIssues, SMTP_PRESETS } from '../lib/notify/config.js';

test('parseRecipients：一行一个，兼容逗号分号，去重去空、挑出非法项', () => {
  const { valid, invalid } = parseRecipients('a@x.com\nb@y.com, c@z.com; a@x.com\n\nnot-an-email\n');
  assert.deepEqual(valid, ['a@x.com', 'b@y.com', 'c@z.com']);
  assert.deepEqual(invalid, ['not-an-email']);
  assert.deepEqual(parseRecipients(''), { valid: [], invalid: [] });
  assert.deepEqual(parseRecipients(undefined), { valid: [], invalid: [] });
});

test('resolveBaseUrl：用户配置优先，其次 DSH_WEB_URL，去掉结尾斜杠', () => {
  assert.equal(resolveBaseUrl({ publicBaseUrl: 'https://dsh.example.com/' }, 'http://127.0.0.1:3081'), 'https://dsh.example.com');
  assert.equal(resolveBaseUrl({ publicBaseUrl: '  ' }, 'http://127.0.0.1:3081'), 'http://127.0.0.1:3081');
  assert.equal(resolveBaseUrl({}, ''), '');
});

test('sessionLink：只拼链接，不做任何接收端处理', () => {
  assert.equal(
    sessionLink('http://127.0.0.1:3081', 'session-a25bd099'),
    'http://127.0.0.1:3081/?session=session-a25bd099',
  );
  assert.equal(sessionLink('', 'session-x'), '');
  assert.equal(sessionLink('http://h', ''), '');
});

test('默认配置：SMTP 是唯一的发送方式 + 不打断的节奏默认值', () => {
  const config = defaultConfig();
  assert.equal(config.enabled, true);
  assert.equal(config.includeSubagents, false);
  assert.equal(config.linkEnabled, true);
  assert.equal(config.settleMs, 1500);
  assert.equal(config.minDurationMs, 2000);
  assert.equal(config.ratePerMinute, 10);
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

test('senderList：老配置迁移成清单，新清单优先，去空去重', () => {
  // 老配置（只有 senderName / fromAddress）自动变成唯一一条，用户不用重填
  assert.deepEqual(senderList({ senderName: '旧名', fromAddress: 'a@x.com' }), [{ name: '旧名', address: 'a@x.com' }]);
  // 旧地址为空时**不迁移**：那时旧行为本来就是"回退默认"，凭空造一条反而改变行为
  assert.deepEqual(senderList({ senderName: '旧名', fromAddress: '' }), []);
  assert.deepEqual(senderList({}), []);
  // 新清单非空就作数，旧字段不再参与（否则删掉的会从旧字段复活）
  assert.deepEqual(
    senderList({ senders: [{ name: '新', address: 'b@y.com' }], senderName: '旧名', fromAddress: 'a@x.com' }),
    [{ name: '新', address: 'b@y.com' }],
  );
  // 去空（没地址的条目等于没配置）、按地址去重（不分大小写）、两头空白都去掉
  assert.deepEqual(
    senderList({ senders: [{ address: '   ' }, { name: ' A ', address: ' a@x.com ' }, { name: 'B', address: 'A@X.com' }] }),
    [{ name: 'A', address: 'a@x.com' }],
  );
});

test('resolveSender：选中项按地址匹配，找不到退回第一条，空清单回落到旧字段', () => {
  const list = { senders: [{ name: 'A', address: 'a@x.com' }, { name: 'B', address: 'b@y.com' }] };
  assert.deepEqual(resolveSender({ ...list, activeSender: 'b@y.com' }), { name: 'B', address: 'b@y.com' });
  assert.deepEqual(resolveSender({ ...list, activeSender: 'B@Y.COM' }), { name: 'B', address: 'b@y.com' }, '按地址匹配要大小写不敏感');
  assert.deepEqual(resolveSender({ ...list, activeSender: 'gone@z.com' }), { name: 'A', address: 'a@x.com' }, '选中的被删了要退回第一条，而不是留空');
  assert.deepEqual(resolveSender(list), { name: 'A', address: 'a@x.com' }, '没设过 activeSender 就用第一条');
  // 某条没写显示名 → 用配置里的 senderName 兜底，再兜底到默认名
  assert.deepEqual(resolveSender({ senders: [{ address: 'a@x.com' }], senderName: '兜底名' }), { name: '兜底名', address: 'a@x.com' });
  assert.deepEqual(resolveSender({ senders: [{ address: 'a@x.com' }], senderName: '' }), { name: DEFAULT_SENDER_NAME, address: 'a@x.com' });
  // 清单为空、旧字段也为空 → 默认显示名 + 空地址（空地址等于"用 SMTP 用户名"，行为与加清单之前一致）
  assert.deepEqual(resolveSender({}), { name: DEFAULT_SENDER_NAME, address: '' });
  // 老配置整条链路：一行都不用改
  assert.deepEqual(resolveSender({ senderName: '旧名', fromAddress: 'a@x.com' }), { name: '旧名', address: 'a@x.com' });
});

test('smtpIssues：只查 SMTP 自己的必填项，不越界报别人的问题', () => {
  assert.deepEqual(smtpIssues({ smtpHost: 'smtp.qq.com', smtpUser: 'me@qq.com' }), []);
  assert.match(smtpIssues({ smtpHost: '', smtpUser: 'me@qq.com' })[0], /主机/);
  assert.match(smtpIssues({ smtpHost: 'smtp.qq.com', smtpUser: '' })[0], /用户名/);
  assert.equal(smtpIssues({ smtpHost: '', smtpUser: '' }).length, 2, '两个都缺就都报出来');
  // 发件人地址不在这里报：拿不到时 SMTP 会退回 smtpUser，那是合法的
  assert.deepEqual(smtpIssues({ smtpHost: 'smtp.qq.com', smtpUser: 'me@qq.com', senders: [] }), []);
});
