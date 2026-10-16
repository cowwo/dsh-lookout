// dsh-notify-p · Host 半端到端测试
//
// 用一个假的 cordis 上下文驱动真实的 apply()，验证的是"接线"而不是纯函数：
// 事件订阅 → 结局判定 → 消抖合并 → 去重 → 队列 → 投递。
// 不启动 DSH、不连外网：SMTP 指向本机一个脚本化的假服务器，投递链路是真的走完的。

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// 投递账本会落盘：测试把它指向临时目录，绝不碰用户真实的 $DSH_HOME。
process.env.DSH_HOME = mkdtempSync(join(tmpdir(), 'dsh-notify-p-test-'));

import { apply, name, inject } from '../lib/notify/index.js';
import { startFakeSmtp } from './fake-smtp.mjs';

/** 整个文件共用一个假 SMTP 服务器；每个用例只关心"有没有投递成功"。 */
const fakeSmtp = await startFakeSmtp();
test.after(() => fakeSmtp.close());

/**
 * 造一个够用的假上下文。
 * @param {object} entry 组合层入口配置
 * @param {object[]} [sessions] 挂载前已存在的会话
 * @returns {object} 上下文与操作手柄
 */
function createHarness(entry, sessions = []) {
  /** @type {Map<string, Function[]>} */
  const handlers = new Map();
  const logs = { info: [], warn: [], debug: [] };
  const disposers = [];
  let current = { ...entry };

  const services = {
    sessions: { list: () => sessions },
    // sessionTitle 故意不给：验证退路（折叠 session/title 事件）
    credentials: {
      // 真实凭据服务的 resolve() 返回 { value, source }，不是裸字符串
      resolve: async (ref) => (ref === 'TEST_SMTP_CODE' ? { value: 'secret-code', source: 'file' } : undefined),
    },
    webServer: { port: 3081 },
  };

  const ctx = {
    logger: {
      info: (message) => logs.info.push(String(message)),
      warn: (message) => logs.warn.push(String(message)),
      debug: (message) => logs.debug.push(String(message)),
    },
    on(event, handler) {
      const list = handlers.get(event) ?? [];
      list.push(handler);
      handlers.set(event, list);
      return () => {};
    },
    effect(fn) {
      const disposer = fn();
      if (typeof disposer === 'function') disposers.push(disposer);
      return disposer;
    },
    plugin(service, config) {
      plugins.push({ service, config });
      return () => {};
    },
    get: (service) => services[service],
    sessions: services.sessions,
    settings: {
      installSection(owner, ns, schema, base, hooks) {
        // 真实的 installSection 在 attach 时把"已解析配置"的取值器交给消费者
        hooks.setSource(() => ({ ...base, ...current }));
      },
    },
  };

  /** ctx.plugin 注册的服务（Remote 服务用它抓） */
  const plugins = [];

  return {
    ctx,
    logs,
    plugins,
    /** 热改配置（验证卡片改了配置无需重启） */
    setConfig: (patch) => { current = { ...current, ...patch }; },
    /** 触发一个 cordis 事件 */
    emit: (event, ...args) => {
      for (const handler of handlers.get(event) ?? []) handler(...args);
    },
    dispose: () => { for (const disposer of disposers) disposer(); },
    /** 挂载前已存在的会话 */
    sessions,
  };
}

/** @returns {Promise<void>} 等到谓词为真或超时；超时时把 warn 日志一起带出来，才好定位 */
async function waitFor(predicate, timeoutMs = 500, logs = null) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  const detail = logs === null ? '' : `\nwarn: ${logs.warn.join('\n')}\ninfo: ${logs.info.join('\n')}`;
  throw new Error(`等待超时 / timed out waiting for condition${detail}`);
}

/** 过滤出真正"投递了一封"的日志行。 */
const deliveries = (logs) => logs.info.filter((line) => line.includes('已投递 / delivered'));

/**
 * 把假 SMTP 服务器收到的原始 MIME 解出可读正文。
 * 正文是 base64 的（见 lib/mime.js：中文主题走 RFC 2047、正文 base64），
 * 不解码就只能拿 base64 去比对，等于没验证。
 * @param {string} raw 服务器收到的 DATA 原文
 * @returns {string} 文本与 HTML 两段解码后拼起来的内容
 */
function decodeMailText(raw) {
  const out = [];
  for (const segment of String(raw).split(/\r?\n--/)) {
    if (!/Content-Transfer-Encoding: base64/i.test(segment)) continue;
    const body = segment.split(/\r?\n\r?\n/).slice(1).join('\r\n');
    const base64 = body.replace(/[^A-Za-z0-9+/=]/g, '');
    if (base64 !== '') out.push(Buffer.from(base64, 'base64').toString('utf8'));
  }
  return out.join('\n');
}

/**
 * 解出 RFC 2047 B-encode 的主题，拿来核对标题有没有进邮件。
 * 长主题会被切成多个 encoded-word，要全部解出来再拼。**先拼字节再解 UTF-8**——
 * 这才是解码器该做的顺序（每个 encoded-word 是一段八位组序列，不是一段文本）。
 */
function decodeSubject(raw) {
  // 先把 MIME 的折行展开（续行以空格/Tab 开头），否则长主题只能读到第一段
  const unfolded = String(raw).replace(/\r?\n[ \t]+/g, ' ');
  const hit = /^Subject: (.*)$/m.exec(unfolded);
  if (hit === null) return '';
  const words = [...hit[1].matchAll(/=\?UTF-8\?B\?([^?]+)\?=/g)];
  if (words.length === 0) return hit[1];
  return Buffer.concat(words.map((word) => Buffer.from(word[1], 'base64'))).toString('utf8');
}

const baseEntry = {
  enabled: true,
  recipients: 'me@example.com',
  // SMTP 指向本机的假服务器：secure=plain 才不会去谈 STARTTLS
  smtpHost: '127.0.0.1',
  smtpPort: fakeSmtp.port,
  smtpSecure: 'plain',
  smtpUser: 'me@example.com',
  smtpPasswordRef: 'TEST_SMTP_CODE',
  settleMs: 5,
  minDurationMs: 0,
  ratePerMinute: 100,
  publicBaseUrl: 'http://127.0.0.1:3081',
};

const session = {
  id: 'session-abc12345-0000-0000-0000-000000000000',
  header: { cwd: '/root/test/demo', createdAt: Date.now() - 60000 },
};

const turnEvent = (turn, reason, time = Date.now()) => ({ type: 'turn/end', time, data: { turn, reason } });

test('导出面：name / inject 符合 DSH 插件契约', () => {
  assert.equal(name, 'dsh-notify-p');
  assert.deepEqual(inject, ['sessions', 'settings']);
  assert.equal(typeof apply, 'function');
});

test('端到端：一轮完成 → 恰好投递一封，正文含会话标题与直达链接', async () => {
  const harness = createHarness(baseEntry);
  apply(harness.ctx, baseEntry);
  fakeSmtp.reset(); // 正文现在真的发到假服务器上，不再是 log 通道打进日志

  harness.emit('session/created', session);
  harness.emit('session/event', session, { type: 'turn/start', time: Date.now(), data: { turn: 1 } });
  harness.emit('session/event', session, { type: 'session/title', time: Date.now(), data: { title: '修复登录页', messageSeqs: [], source: 'fallback' } });
  harness.emit('session/event', session, turnEvent(1, { kind: 'completed' }));

  await waitFor(() => deliveries(harness.logs).length === 1, 500, harness.logs);
  assert.equal(deliveries(harness.logs).length, 1);

  const body = decodeMailText(fakeSmtp.received.data);
  assert.match(body, /修复登录页/);
  assert.match(decodeSubject(fakeSmtp.received.data), /修复登录页/,
    `主题也要带上会话标题；解出来是：${JSON.stringify(decodeSubject(fakeSmtp.received.data))}；`
    + `原始 Subject 行：${/^Subject: .*$/m.exec(fakeSmtp.received.data)?.[0] ?? '(没找到 Subject)'}`);
  assert.match(body, /http:\/\/127\.0\.0\.1:3081\/\?session=session-abc12345/);

  // 投递账本要真的落盘——这是插件日志不落 stdout 时唯一的"发没发出去"证据
  const ledger = JSON.parse(readFileSync(join(process.env.DSH_HOME, 'dsh-notify-p', 'state.json'), 'utf8'));
  assert.equal(ledger.counts.sent, 1);
  assert.equal(ledger.counts.failed, 0);
  assert.equal(ledger.recent.at(-1).transport, 'smtp');
  assert.match(ledger.recent.at(-1).subject, /修复登录页/);
  harness.dispose();
});

test('P0-3：同一会话连续多轮只提醒一次（turn/start 取消合并窗口）', async () => {
  const harness = createHarness({ ...baseEntry, settleMs: 30 });
  apply(harness.ctx, baseEntry);

  harness.emit('session/created', session);
  harness.emit('session/event', session, turnEvent(1, { kind: 'completed' }));
  await new Promise((resolve) => setTimeout(resolve, 10)); // 还在窗口内
  harness.emit('session/event', session, { type: 'turn/start', time: Date.now(), data: { turn: 2 } });
  harness.emit('session/event', session, turnEvent(2, { kind: 'completed' }));

  await waitFor(() => deliveries(harness.logs).length === 1, 500, harness.logs);
  await new Promise((resolve) => setTimeout(resolve, 60)); // 等第一封的窗口也过期
  assert.equal(deliveries(harness.logs).length, 1, '两轮只该收到一封');
  harness.dispose();
});

test('去重：同一回合重复上报（agent/error + turn/end）只发一封', async () => {
  const harness = createHarness({ ...baseEntry, notifyError: true });
  apply(harness.ctx, baseEntry);
  fakeSmtp.reset();

  harness.emit('session/created', session);
  harness.emit('agent/error', { agent: { session }, turn: 7, step: 1, error: new Error('ECONNREFUSED') });
  harness.emit('session/event', session, turnEvent(7, { kind: 'error', error: { message: '扁平化', code: 'E_X' } }));
  harness.emit('session/event', session, turnEvent(7, { kind: 'error', error: { message: '扁平化', code: 'E_X' } }));

  await waitFor(() => deliveries(harness.logs).length === 1, 500, harness.logs);
  await new Promise((resolve) => setTimeout(resolve, 40));
  assert.equal(deliveries(harness.logs).length, 1);
  // agent/error 的原始文本优先于 turn/end 里扁平化的那个
  assert.match(decodeMailText(fakeSmtp.received.data), /ECONNREFUSED/);
  harness.dispose();
});

test('P0-2：子代理会话不发信；打开开关后才发', async () => {
  const harness = createHarness(baseEntry);
  apply(harness.ctx, baseEntry);
  const child = { id: 'session-child-9999', header: { cwd: '/tmp', origin: 'subagent' } };

  harness.emit('session/created', child);
  harness.emit('session/event', child, turnEvent(1, { kind: 'completed' }));
  await new Promise((resolve) => setTimeout(resolve, 40));
  assert.equal(deliveries(harness.logs).length, 0);

  harness.setConfig({ includeSubagents: true });
  harness.emit('session/event', child, turnEvent(2, { kind: 'completed' }));
  await waitFor(() => deliveries(harness.logs).length === 1, 500, harness.logs);
  harness.dispose();
});

test('P0-1：重启/热更导致的 aborted(disposed) 默认不发；user 主动停止默认也不发、开开关才发', async () => {
  const harness = createHarness(baseEntry);
  apply(harness.ctx, baseEntry);
  fakeSmtp.reset();
  harness.emit('session/created', session);

  harness.emit('session/event', session, turnEvent(1, { kind: 'aborted', reason: { kind: 'disposed' } }));
  harness.setConfig({ notifyAbortedByUser: true });
  harness.emit('session/event', session, turnEvent(1, { kind: 'aborted', reason: { kind: 'user' } }));

  await waitFor(() => deliveries(harness.logs).length === 1, 500, harness.logs);
  await new Promise((resolve) => setTimeout(resolve, 40));
  assert.equal(deliveries(harness.logs).length, 1, '只有 user 那次该发');
  const body = decodeMailText(fakeSmtp.received.data);
  assert.match(body, /你主动停止/);
  harness.dispose();
});

test('审批：立即发送，不等合并窗口，且不含命令正文（P0-4）', async () => {
  const harness = createHarness({ ...baseEntry, settleMs: 5000 });
  apply(harness.ctx, baseEntry);
  fakeSmtp.reset();
  harness.emit('session/created', session);
  harness.emit('session/event', session, {
    type: 'approval/asked',
    time: Date.now(),
    data: { id: 'ap-1', toolName: 'Bash', callId: 'call-1', reason: '需要删除文件' },
  });

  await waitFor(() => deliveries(harness.logs).length === 1, 300);
  const body = decodeMailText(fakeSmtp.received.data);
  assert.match(body, /工具 \/ Tool：Bash/);
  assert.doesNotMatch(body, /命令 \/ Command/);
  harness.dispose();
});

test('短任务不打扰：完成且用时不足时不发，出错照发', async () => {
  const harness = createHarness({ ...baseEntry, minDurationMs: 10000 });
  apply(harness.ctx, baseEntry);
  harness.emit('session/created', session);

  const now = Date.now();
  harness.emit('session/event', session, { type: 'turn/start', time: now, data: { turn: 1 } });
  harness.emit('session/event', session, turnEvent(1, { kind: 'completed' }, now + 500));
  await new Promise((resolve) => setTimeout(resolve, 40));
  assert.equal(deliveries(harness.logs).length, 0, '500ms 的完成不该打扰');

  harness.emit('session/event', session, { type: 'turn/start', time: now, data: { turn: 2 } });
  harness.emit('session/event', session, turnEvent(2, { kind: 'error', error: { message: '炸了' } }, now + 600));
  await waitFor(() => deliveries(harness.logs).length === 1, 500, harness.logs);
  harness.dispose();
});

test('未配收件人时只告警不发信；配好后才发（避免静默失败）', async () => {
  const harness = createHarness({ ...baseEntry, recipients: '' });
  apply(harness.ctx, baseEntry);
  harness.emit('session/created', session);
  harness.emit('session/event', session, turnEvent(1, { kind: 'completed' }));

  await waitFor(() => harness.logs.warn.some((line) => line.includes('收件人为空')));
  assert.equal(deliveries(harness.logs).length, 0);
  harness.dispose();
});

test('安全兜底：上下文残缺 / 依赖抛错时 apply 绝不抛（插件异常不能带崩 DSH 启动）', () => {
  // 最极端：连 ctx 都没有
  assert.doesNotThrow(() => apply(undefined, undefined));
  // 空对象 ctx
  assert.doesNotThrow(() => apply({}, {}));
  // 事件订阅直接抛
  assert.doesNotThrow(() => apply({
    logger: { info() {}, warn() {}, debug() {} },
    on() { throw new Error('no events here'); },
    effect() {},
    get() {},
  }, {}));
  // settings 注册抛 + 初始扫描抛
  const hostile = {
    logger: { info() {}, warn() {}, debug() {} },
    on() {},
    effect(fn) { return fn(); },
    get() { return undefined; },
    sessions: { list() { throw new Error('store exploded'); } },
    settings: { installSection() { throw new Error('schema rejected'); } },
  };
  assert.doesNotThrow(() => apply(hostile, { recipients: 'a@b.com' }));
});

test('挂载时的历史扫描只折叠标题，绝不补发历史（否则重启就会收到一堆旧邮件）', async () => {
  const historical = {
    id: 'session-old-0001',
    header: { cwd: '/tmp/old' },
    snapshotEvents: () => [
      { type: 'session/title', data: { title: '很久以前的会话' } },
      { type: 'turn/end', time: Date.now() - 100000, data: { turn: 1, reason: { kind: 'completed' } } },
    ],
  };
  const harness = createHarness(baseEntry, [historical]);
  apply(harness.ctx, baseEntry);

  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(deliveries(harness.logs).length, 0, '历史事件不该产生任何投递');
  harness.dispose();
});

test('卸载：清掉未触发的合并窗口（不会在卸载后突然发信）', async () => {
  const harness = createHarness({ ...baseEntry, settleMs: 60 });
  apply(harness.ctx, baseEntry);
  harness.emit('session/created', session);
  harness.emit('session/event', session, turnEvent(1, { kind: 'completed' }));
  harness.dispose();

  await new Promise((resolve) => setTimeout(resolve, 120));
  assert.equal(deliveries(harness.logs).length, 0);
});

// ---------------------------------------------------------------------------
// P2：Host Remote（设置页的「发送测试邮件」与「最近一次投递」）
//
// 这一段是本次新增能力的主要保障：typert 清单要在**服务器启动时**才被扫描注册，
// 所以不能靠"点一下浏览器按钮"来验证；改成在这里用假 ctx 驱动真实装配，
// 并且用清单里声明的严格 schema 真的校验一遍返回值。
// ---------------------------------------------------------------------------

/** 从 harness 里取出 Remote 服务注册。 */
const remoteOf = (harness) => harness.plugins.find((entry) => typeof entry.config?.test === 'function');

test('Remote：apply 必须注册 mailNotify 服务（test + state）', () => {
  const harness = createHarness(baseEntry);
  apply(harness.ctx, baseEntry);
  const remote = remoteOf(harness);
  assert.ok(remote, 'apply 必须 ctx.plugin 出 Remote 服务');
  assert.equal(typeof remote.config.test, 'function');
  assert.equal(typeof remote.config.state, 'function');
  assert.equal(remote.service?.name, 'MailNotifyRemoteService');
});

test('Remote：测试邮件真的走 SMTP 发出去，并落账本', async () => {
  const harness = createHarness(baseEntry);
  apply(harness.ctx, baseEntry);
  const remote = remoteOf(harness);

  const result = await remote.config.test();
  assert.equal(result.ok, true, `测试投递应当成功：${result.error}`);
  assert.equal(result.transport, 'smtp');
  assert.deepEqual(result.recipients, ['me@example.com']);
  assert.equal(result.error, '');
  assert.equal(Number.isFinite(result.ms), true);
  assert.equal(result.ms >= 0, true);
  assert.match(result.subject, /\[DSH\]/);
  assert.match(harness.logs.info.join('\n'), /测试邮件已投递/);

  const state = remote.config.state();
  assert.equal(state.counts.sent, 1);
  assert.equal(state.counts.failed, 0);
  assert.equal(state.recent.length, 1);
  assert.equal(state.recent[0].ok, true);
  assert.deepEqual(state.recent[0].recipients, ['me@example.com']);
});

test('Remote：配置不完整时把失败当结果返回，不抛异常', async () => {
  const harness = createHarness({ ...baseEntry, recipients: '' });
  apply(harness.ctx, { ...baseEntry, recipients: '' });
  const remote = remoteOf(harness);

  const result = await remote.config.test();
  assert.equal(result.ok, false);
  assert.notEqual(result.error, '', '失败必须带原因，否则页面只能显示"失败"');
  assert.equal(result.ms >= 0, true);

  const state = remote.config.state();
  assert.equal(state.counts.failed, 1);
  assert.equal(state.recent[0].ok, false);
});

test('Remote：SMTP 结构不完整（缺用户名）时就地报错，不去连网络', async () => {
  // baseEntry 里是有 smtpUser 的，这个用例要的正是"缺用户名"那一支，所以显式清掉
  const incomplete = {
    ...baseEntry,
    smtpHost: 'smtp.example.com',
    smtpUser: '',
  };
  const harness = createHarness(incomplete);
  apply(harness.ctx, incomplete);
  const remote = remoteOf(harness);

  const result = await remote.config.test();
  assert.equal(result.ok, false);
  assert.match(result.error, /用户名|smtpUser/);
  assert.equal(result.transport, 'smtp');
});

test('Remote：返回值必须能通过清单里声明的严格 schema', async () => {
  const { TYPERT } = await import('../lib/notify/typert.host.js');
  const byMethod = new Map(TYPERT.invocations.map((item) => [item.method, item]));

  const harness = createHarness(baseEntry);
  apply(harness.ctx, baseEntry);
  const remote = remoteOf(harness);

  const testResult = await remote.config.test();
  const parsed = byMethod.get('test').result.create().safeParse(testResult);
  assert.equal(parsed.success, true, `test 结果不符合清单 schema：${JSON.stringify(parsed.error?.issues ?? [])}`);

  const stateResult = remote.config.state();
  const parsedState = byMethod.get('state').result.create().safeParse(stateResult);
  assert.equal(parsedState.success, true, `state 结果不符合清单 schema：${JSON.stringify(parsedState.error?.issues ?? [])}`);
});

test('Remote：清单本身要过 typert-loader 的那几道校验，且与包名/导出对齐', async () => {
  const { TYPERT } = await import('../lib/notify/typert.host.js');
  const { TYPERT: EXPORTED } = await import('../lib/typert.host.js');
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

  // 合并后：B 的宿主清单留在 lib/notify/ 下（lib/ 逐字节保留，包名/行 id 仍是旧名），
  // 真正由 exports['./typert'] 交给 loader 的是合并清单 lib/typert.host.js（已换成新名）。
  assert.equal(TYPERT.package, 'dsh-notify-p', '子清单在 lib/notify/ 下，沿用 B 的旧包名');
  assert.equal(EXPORTED.package, pkg.name, '清单必须由导出它的包拥有');
  assert.equal(TYPERT.face, 'host');
  assert.equal(Array.isArray(TYPERT.schemas), true);
  assert.equal(pkg.exports['./typert'], './lib/typert.host.js', 'dsh-typert-loader 靠这个导出发现清单');

  // codec 必须是 strict + create() 工厂，且 create() 返回 zod v4 实例
  // （0.2.x 起裸 schema 字段已失效：loader 只认 create）
  for (const item of TYPERT.invocations) {
    assert.equal(item.result.mode, 'strict', `${item.method} 的 codec 必须是 strict`);
    assert.equal(typeof item.result.create, 'function', `${item.method} 的 codec 缺 create() 工厂`);
    assert.equal('_zod' in item.result.create(), true, `${item.method} 的 create() 没有返回 zod v4 实例`);
    assert.equal(item.service, 'mailNotify');
    assert.equal(item.namespace, 'mailNotify');
    assert.equal(item.invocation.kind, 'direct');
    assert.deepEqual(item.parameters, [], '参数必须为空数组，浏览器侧才敢传空 args');
    assert.equal(item.id, `dsh-notify-p#mailNotify/${item.method}`);
  }

  // 清单声明的方法必须真的存在于服务上（防止改名后浏览器打到空处）
  const { MailNotifyRemoteService } = await import('../lib/notify/service.js');
  const declared = TYPERT.invocations.map((item) => item.method).sort();
  const actual = Object.getOwnPropertyNames(MailNotifyRemoteService.prototype)
    .filter((key) => key !== 'constructor' && typeof MailNotifyRemoteService.prototype[key] === 'function')
    .sort();
  for (const method of declared) {
    assert.equal(actual.includes(method), true, `服务上没有清单声明的 ${method}()`);
  }
});

test('Remote：服务在 runtime 未接线时给出可读错误，而不是 undefined 崩溃', async () => {
  const { MailNotifyRemoteService } = await import('../lib/notify/service.js');
  // 不用假 ctx 构造 cordis Service（基类需要真实的 ctx）；直接测两个方法的守卫。
  const proto = MailNotifyRemoteService.prototype;
  await assert.rejects(() => proto.test.call({ runtime: {} }), /runtime is not wired/);
  await assert.rejects(() => proto.state.call({ runtime: {} }), /runtime is not wired/);
  await assert.rejects(() => proto.test.call({}), /runtime is not wired/);
});
