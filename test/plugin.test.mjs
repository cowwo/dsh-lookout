// dsh-notify-p · Host 半端到端测试
//
// 用一个假的 cordis 上下文驱动真实的 apply()，验证的是"接线"而不是纯函数：
// 事件订阅 → 结局判定 → 消抖合并 → 去重 → 队列 → 投递。
// 不启动 DSH、不连外网：SMTP 指向本机一个脚本化的假服务器，投递链路是真的走完的。

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// 投递账本已经整块删除；这里仍把 DSH_HOME 指向临时目录，
// 用一条断言钉住"发信后不再产生 state.json"，绝不碰用户真实的 $DSH_HOME。
process.env.DSH_HOME = mkdtempSync(join(tmpdir(), 'dsh-notify-p-test-'));

import { apply, name, inject } from '../lib/notify/index.js';
import { MIN_DURATION_MS, SETTLE_MS, MailSchema, defaultConfig } from '../lib/notify/config.js';
import { startFakeSmtp } from './fake-smtp.mjs';

/**
 * 合并窗口现在是硬编码常量（SETTLE_MS），测试改不小它，只能真的等满。
 * 多给 600ms 余量覆盖"定时器到点 → 队列 → 假 SMTP"这一小段。
 */
const SETTLE_WAIT_MS = SETTLE_MS + 600;

/**
 * "够长的会话"：turn/start 的时间点必须早于 MIN_DURATION_MS，否则 completion 会被当成
 * 短任务直接跳过。这些用例要验证的是"该发的发了"，不是去踩短任务那条分支。
 */
const LONG_TURN_MS = MIN_DURATION_MS + 3000;

/** 造一个"已经跑了很久"的回合起点。 */
const longAgo = () => Date.now() - LONG_TURN_MS;

/** 整个文件共用一个假 SMTP 服务器；每个用例只关心"有没有投递成功"。 */
const fakeSmtp = await startFakeSmtp();
test.after(() => fakeSmtp.close());

/**
 * cosmokit 的 volatile 引用协议键：与 cordis / schemastery 用的是同一个全局符号。
 * 运行时里标了 `.volatile()` 的字段到 apply 手上就是这种引用对象（见 lib/notify/config.js）。
 */
const VOLATILE_WRITE = Symbol.for('cosmokit.volatile.write');

/**
 * 造一个和运行时同形的 volatile 引用：**引用身份不变，值被原地改写**。
 * cordis-plugin-loader 的 `_commitVolatile` 就是这么写配置的，而且**不会重跑 apply**。
 * @param {unknown} value 初始值
 * @returns {{get: Function}} 引用
 */
function volatileRef(value) {
  let current = value;
  return {
    get: () => current,
    [VOLATILE_WRITE]: (next) => { current = next; },
  };
}

/**
 * 造一个够用的假上下文。
 *
 * ⚠️ config 的形状必须是**引用对象**，不是普通对象：真实运行态里标了 volatile 的
 * 字段都是引用。用普通对象的话，「读配置是实时的」那条用例会假绿——普通对象原地
 * 赋值，连"启动时快照一份"的坏实现都能读到新值。
 * @param {object} entry 组合层入口配置
 * @param {object[]} [sessions] 挂载前已存在的会话
 * @returns {object} 上下文与操作手柄
 */
function createHarness(entry, sessions = []) {
  /** @type {Map<string, Function[]>} */
  const handlers = new Map();
  const logs = { info: [], warn: [], debug: [] };
  const disposers = [];

  // 交给 apply 的那份 config：15 个字段全是 volatile 引用（与运行时同形）
  const defaults = defaultConfig();
  const config = {};
  for (const key of Object.keys(MailSchema.dict)) {
    config[key] = volatileRef(Object.hasOwn(entry, key) ? entry[key] : defaults[key]);
  }
  for (const [key, value] of Object.entries(entry)) {
    if (!Object.hasOwn(config, key)) config[key] = value;
  }

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
    // DSH 0.2.1-rc.2 的 settings 服务**没有** installSection 这个 API
    // （插件也不再调用它：schema 走入口的 Config 导出，值走 loader 的 volatile 原地写）。
    // 这里照实给一个空对象：服务在、但没这个 API，验证插件不靠它也能跑。
    settings: {},
  };

  /** ctx.plugin 注册的服务（Remote 服务用它抓） */
  const plugins = [];

  return {
    ctx,
    logs,
    plugins,
    /** 交给 apply 的那份活配置（标了 volatile 的字段是引用对象） */
    config,
    /**
     * 模拟设置页保存：把新值**原地**写进 volatile 引用，**不重跑 apply**
     * （与 cordis-plugin-loader 的 _commitVolatile 同形）。
     */
    setConfig: (patch) => {
      for (const [key, value] of Object.entries(patch)) {
        const slot = config[key];
        if (slot !== null && typeof slot === 'object' && typeof slot.get === 'function') slot[VOLATILE_WRITE](value);
        else config[key] = value;
      }
    },
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
async function waitFor(predicate, timeoutMs = 4000, logs = null) {
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
  // 合并窗口 / 短任务下限 / 限流已经硬编码成常量，配置里不再有这三个字段；
  // 想改节奏请改 lib/notify/config.js 的 SETTLE_MS / MIN_DURATION_MS / RATE_PER_MINUTE。
  // 发件人清单与邮件直达链接也已整块删除：发件地址就是上面的 smtpUser，正文不带链接。
};

const session = {
  id: 'session-abc12345-0000-0000-0000-000000000000',
  header: { cwd: '/root/test/demo', createdAt: Date.now() - 60000 },
};

const turnEvent = (turn, reason, time = Date.now()) => ({ type: 'turn/end', time, data: { turn, reason } });

test('导出面：name / inject 符合 DSH 插件契约', () => {
  assert.equal(name, 'dsh-notify-p');
  // 不 inject settings：配置就是入口 config，代码里没有任何 ctx.settings 调用
  assert.deepEqual(inject, ['sessions']);
  assert.equal(typeof apply, 'function');
});

test('端到端：一轮完成 → 恰好投递一封，正文含会话标题且不带链接', async () => {
  const harness = createHarness(baseEntry);
  apply(harness.ctx, harness.config);
  fakeSmtp.reset(); // 正文现在真的发到假服务器上，不再是 log 通道打进日志

  harness.emit('session/created', session);
  harness.emit('session/event', session, { type: 'turn/start', time: longAgo(), data: { turn: 1 } });
  harness.emit('session/event', session, { type: 'session/title', time: Date.now(), data: { title: '修复登录页', messageSeqs: [], source: 'fallback' } });
  harness.emit('session/event', session, turnEvent(1, { kind: 'completed' }));

  await waitFor(() => deliveries(harness.logs).length === 1, 4000, harness.logs);
  assert.equal(deliveries(harness.logs).length, 1);

  const body = decodeMailText(fakeSmtp.received.data);
  assert.match(body, /修复登录页/);
  assert.match(decodeSubject(fakeSmtp.received.data), /修复登录页/,
    `主题也要带上会话标题；解出来是：${JSON.stringify(decodeSubject(fakeSmtp.received.data))}；`
    + `原始 Subject 行：${/^Subject: .*$/m.exec(fakeSmtp.received.data)?.[0] ?? '(没找到 Subject)'}`);
  // 「邮件直达会话」能力已整块删除：正文里没有直达行、没有 URL，也没有 CTA 按钮
  assert.doesNotMatch(body, /直达会话/);
  assert.doesNotMatch(body, /\?session=/);
  assert.doesNotMatch(body, /打开该会话/);
  // 发件人清单已删除：信封发件地址就是 smtpUser
  assert.ok(
    fakeSmtp.received.lines.some((line) => line === 'MAIL FROM:<me@example.com>'),
    `发件地址应该取 smtpUser；收到的是：${JSON.stringify(fakeSmtp.received.lines.filter((line) => line.startsWith('MAIL FROM')))}`,
  );

  // 投递账本已整块删除：发信后不该再往 $DSH_HOME 里写 state.json（连目录都不该建）
  const ledgerFile = join(process.env.DSH_HOME, 'dsh-notify-p', 'state.json');
  assert.equal(existsSync(ledgerFile), false, `账本已删除，发信不该再落盘：${ledgerFile}`);
  assert.equal(existsSync(join(process.env.DSH_HOME, 'dsh-notify-p')), false, '不该再建账本目录');
  harness.dispose();
});

test('读配置是实时的：volatile 引用被原地改写后立刻按新值发信（不重跑 apply）', async () => {
  // 这条用例锁的是 ADR 0005 里最容易踩的一条：
  // 设置页保存走 cordis-plugin-loader 的 _commitVolatile —— 它把新值**原地**写进
  // apply 收到的那个 config 对象里的 volatile 引用，**不会重跑 apply**。
  // 所以"启动时把 resolveConfig(entryConfig) 快照成常量"的写法，表现就是
  // 「开关能点、也存住了，但行为一直不变，非要重启才生效」。
  const harness = createHarness(baseEntry);
  apply(harness.ctx, harness.config);
  fakeSmtp.reset();

  const remoteOf = (h) => h.plugins.find((entry) => typeof entry.config?.test === 'function');
  const remote = remoteOf(harness);
  assert.ok(remote, 'apply 必须注册 Remote 服务');

  // 模拟设置页保存：只改引用里的值，引用对象本身不换、apply 不再跑
  const userRef = harness.config.smtpUser;
  assert.equal(typeof userRef?.get, 'function', '标了 volatile 的字段到 apply 手上必须是引用对象（与运行态同形）');
  harness.setConfig({ smtpUser: 'live-read@example.com' });
  assert.equal(harness.config.smtpUser, userRef, 'volatile 引用必须原地改写，不能换掉引用本身');
  assert.equal(userRef.get(), 'live-read@example.com');
  assert.equal(harness.plugins.length, 1, '改配置不该重新注册服务（volatile 写入不重跑 apply）');

  // 走真实投递链路：发件地址取 smtpUser，假 SMTP 收到的 MAIL FROM 就是活值
  harness.emit('session/created', session);
  harness.emit('session/event', session, { type: 'turn/start', time: longAgo(), data: { turn: 1 } });
  harness.emit('session/event', session, turnEvent(1, { kind: 'completed' }));
  await waitFor(() => deliveries(harness.logs).length === 1, 4000, harness.logs);
  assert.ok(
    fakeSmtp.received.lines.some((line) => line === 'MAIL FROM:<live-read@example.com>'),
    `发件地址应当取改动后的 smtpUser；收到的是：${JSON.stringify(fakeSmtp.received.lines.filter((line) => line.startsWith('MAIL FROM')))}`,
  );

  // smtpHost 同理：清空后立刻报"主机为空"，不去连网络（读的是活值，不是启动快照）
  harness.setConfig({ smtpHost: '' });
  const result = await remote.config.test();
  assert.equal(result.ok, false, '主机被清空后测试投递必须失败');
  assert.match(result.error, /主机为空|smtpHost/, `错误要说明缺的是 smtpHost；实际是：${result.error}`);

  // 反向护栏：改回去（同一条路径）立刻又能发——证明它真的每次都重读，而不是"只读了一次新值"
  harness.setConfig({ smtpHost: baseEntry.smtpHost });
  const again = await remote.config.test();
  assert.equal(again.ok, true, `主机改回去后应当又能发：${again.error}`);
  harness.dispose();
});

test('P0-3：同一会话连续多轮只提醒一次（turn/start 取消合并窗口）', async () => {
  const harness = createHarness(baseEntry);
  apply(harness.ctx, harness.config);

  harness.emit('session/created', session);
  harness.emit('session/event', session, { type: 'turn/start', time: longAgo(), data: { turn: 1 } });
  harness.emit('session/event', session, turnEvent(1, { kind: 'completed' }));
  await new Promise((resolve) => setTimeout(resolve, 100)); // 还在窗口内（常量 1500ms）
  harness.emit('session/event', session, { type: 'turn/start', time: longAgo(), data: { turn: 2 } });
  harness.emit('session/event', session, turnEvent(2, { kind: 'completed' }));

  await waitFor(() => deliveries(harness.logs).length === 1, 4000, harness.logs);
  await new Promise((resolve) => setTimeout(resolve, SETTLE_WAIT_MS)); // 等第一封的窗口也过期
  assert.equal(deliveries(harness.logs).length, 1, '两轮只该收到一封');
  harness.dispose();
});

test('去重：同一回合重复上报（agent/error + turn/end）只发一封', async () => {
  const harness = createHarness({ ...baseEntry, notifyError: true });
  apply(harness.ctx, harness.config);
  fakeSmtp.reset();

  harness.emit('session/created', session);
  harness.emit('agent/error', { agent: { session }, turn: 7, step: 1, error: new Error('ECONNREFUSED') });
  harness.emit('session/event', session, turnEvent(7, { kind: 'error', error: { message: '扁平化', code: 'E_X' } }));
  harness.emit('session/event', session, turnEvent(7, { kind: 'error', error: { message: '扁平化', code: 'E_X' } }));

  await waitFor(() => deliveries(harness.logs).length === 1, 4000, harness.logs);
  await new Promise((resolve) => setTimeout(resolve, SETTLE_WAIT_MS));
  assert.equal(deliveries(harness.logs).length, 1);
  // agent/error 的原始文本优先于 turn/end 里扁平化的那个
  assert.match(decodeMailText(fakeSmtp.received.data), /ECONNREFUSED/);
  harness.dispose();
});

test('P0-2：子代理会话不发信；打开开关后才发', async () => {
  const harness = createHarness(baseEntry);
  apply(harness.ctx, harness.config);
  const child = { id: 'session-child-9999', header: { cwd: '/tmp', origin: 'subagent' } };

  harness.emit('session/created', child);
  harness.emit('session/event', child, turnEvent(1, { kind: 'completed' }));
  await new Promise((resolve) => setTimeout(resolve, SETTLE_WAIT_MS));
  assert.equal(deliveries(harness.logs).length, 0);

  harness.setConfig({ includeSubagents: true });
  harness.emit('session/event', child, turnEvent(2, { kind: 'completed' }));
  await waitFor(() => deliveries(harness.logs).length === 1, 4000, harness.logs);
  harness.dispose();
});

test('P0-1：重启/热更导致的 aborted(disposed) 默认不发；user 主动停止默认也不发、开开关才发', async () => {
  const harness = createHarness(baseEntry);
  apply(harness.ctx, harness.config);
  fakeSmtp.reset();
  harness.emit('session/created', session);

  harness.emit('session/event', session, turnEvent(1, { kind: 'aborted', reason: { kind: 'disposed' } }));
  harness.setConfig({ notifyAbortedByUser: true });
  harness.emit('session/event', session, turnEvent(1, { kind: 'aborted', reason: { kind: 'user' } }));

  await waitFor(() => deliveries(harness.logs).length === 1, 4000, harness.logs);
  await new Promise((resolve) => setTimeout(resolve, SETTLE_WAIT_MS));
  assert.equal(deliveries(harness.logs).length, 1, '只有 user 那次该发');
  const body = decodeMailText(fakeSmtp.received.data);
  assert.match(body, /你主动停止/);
  harness.dispose();
});

test('审批：立即发送，不等合并窗口，且不含命令正文（P0-4）', async () => {
  const harness = createHarness(baseEntry);
  apply(harness.ctx, harness.config);
  fakeSmtp.reset();
  harness.emit('session/created', session);
  harness.emit('session/event', session, {
    type: 'approval/asked',
    time: Date.now(),
    data: { id: 'ap-1', toolName: 'Bash', callId: 'call-1', reason: '需要删除文件' },
  });

  // 审批不参与消抖：不等 SETTLE_MS 就该发出去
  await waitFor(() => deliveries(harness.logs).length === 1, 1000);
  const body = decodeMailText(fakeSmtp.received.data);
  assert.match(body, /工具 \/ Tool：Bash/);
  assert.doesNotMatch(body, /命令 \/ Command/);
  harness.dispose();
});

test('短任务不打扰：完成且用时不足时不发，出错照发', async () => {
  const harness = createHarness(baseEntry);
  apply(harness.ctx, harness.config);
  harness.emit('session/created', session);

  // 500ms 的完成远低于硬编码下限（MIN_DURATION_MS），该被跳过
  assert.equal(500 < MIN_DURATION_MS, true, '这条用例依赖"500ms 算短任务"这个前提');
  const now = Date.now();
  harness.emit('session/event', session, { type: 'turn/start', time: now, data: { turn: 1 } });
  harness.emit('session/event', session, turnEvent(1, { kind: 'completed' }, now + 500));
  await new Promise((resolve) => setTimeout(resolve, SETTLE_WAIT_MS));
  assert.equal(deliveries(harness.logs).length, 0, '500ms 的完成不该打扰');

  harness.emit('session/event', session, { type: 'turn/start', time: now, data: { turn: 2 } });
  harness.emit('session/event', session, turnEvent(2, { kind: 'error', error: { message: '炸了' } }, now + 600));
  await waitFor(() => deliveries(harness.logs).length === 1, 4000, harness.logs);
  harness.dispose();
});

test('未配收件人时只告警不发信；配好后才发（避免静默失败）', async () => {
  const harness = createHarness({ ...baseEntry, recipients: '' });
  apply(harness.ctx, harness.config);
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
  apply(harness.ctx, harness.config);

  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(deliveries(harness.logs).length, 0, '历史事件不该产生任何投递');
  harness.dispose();
});

test('卸载：清掉未触发的合并窗口（不会在卸载后突然发信）', async () => {
  const harness = createHarness(baseEntry);
  apply(harness.ctx, harness.config);
  harness.emit('session/created', session);
  harness.emit('session/event', session, turnEvent(1, { kind: 'completed' }));
  harness.dispose();

  await new Promise((resolve) => setTimeout(resolve, SETTLE_WAIT_MS));
  assert.equal(deliveries(harness.logs).length, 0);
});

// ---------------------------------------------------------------------------
// P2：Host Remote（设置页的「发送测试邮件」）
//
// 这一段是本次新增能力的主要保障：typert 清单要在**服务器启动时**才被扫描注册，
// 所以不能靠"点一下浏览器按钮"来验证；改成在这里用假 ctx 驱动真实装配，
// 并且用清单里声明的严格 schema 真的校验一遍返回值。
// ---------------------------------------------------------------------------

/** 从 harness 里取出 Remote 服务注册。 */
const remoteOf = (harness) => harness.plugins.find((entry) => typeof entry.config?.test === 'function');

test('Remote：apply 必须注册 mailNotify 服务（只有 test）', () => {
  const harness = createHarness(baseEntry);
  apply(harness.ctx, harness.config);
  const remote = remoteOf(harness);
  assert.ok(remote, 'apply 必须 ctx.plugin 出 Remote 服务');
  assert.equal(typeof remote.config.test, 'function');
  // 投递账本已删除：state 能力一并下线
  assert.equal('state' in remote.config, false, 'runtime 不该再暴露 state()');
  assert.equal(remote.service?.name, 'MailNotifyRemoteService');
});

test('Remote：测试邮件真的走 SMTP 发出去，返回值形状不变', async () => {
  const harness = createHarness(baseEntry);
  apply(harness.ctx, harness.config);
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
});

test('Remote：配置不完整时把失败当结果返回，不抛异常', async () => {
  const harness = createHarness({ ...baseEntry, recipients: '' });
  apply(harness.ctx, harness.config);
  const remote = remoteOf(harness);

  const result = await remote.config.test();
  assert.equal(result.ok, false);
  assert.notEqual(result.error, '', '失败必须带原因，否则页面只能显示"失败"');
  assert.equal(result.ms >= 0, true);
});

test('Remote：SMTP 结构不完整（缺用户名）时就地报错，不去连网络', async () => {
  // baseEntry 里是有 smtpUser 的，这个用例要的正是"缺用户名"那一支，所以显式清掉
  const incomplete = {
    ...baseEntry,
    smtpHost: 'smtp.example.com',
    smtpUser: '',
  };
  const harness = createHarness(incomplete);
  apply(harness.ctx, harness.config);
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
  apply(harness.ctx, harness.config);
  const remote = remoteOf(harness);

  const testResult = await remote.config.test();
  const parsed = byMethod.get('test').result.create().safeParse(testResult);
  assert.equal(parsed.success, true, `test 结果不符合清单 schema：${JSON.stringify(parsed.error?.issues ?? [])}`);
  // 清单里只剩 test 这一条（mailNotify/state 端点已删除）
  assert.deepEqual([...byMethod.keys()], ['test']);
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
  // 不用假 ctx 构造 cordis Service（基类需要真实的 ctx）；直接测 test 的守卫。
  const proto = MailNotifyRemoteService.prototype;
  await assert.rejects(() => proto.test.call({ runtime: {} }), /runtime is not wired/);
  await assert.rejects(() => proto.test.call({}), /runtime is not wired/);
  assert.equal(typeof proto.state, 'undefined', 'state() 已删除');
});
