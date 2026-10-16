// 合并后的浏览器半边（client/client.js）的合并契约测试。
//
// 锁三件事：
//   1. 合并形态：三段原文件各留下一次 `window.__ModuleLoader__.load(`，胶水层再来一次，
//      一共 4 次；对外只注册 1 个模块，id 是 dsh-lookout。
//   2. 三段原文件逐字节保留（整段都是原文件的子串）。
//   3. 胶水层的 factory 产出一个合法模块对象：inject 是数组、apply 是函数。
//
// 第 3 条用局部 vm context 执行合并文件，全部状态留在 context 里，不碰 globalThis。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const CLIENT_PATH = fileURLToPath(new URL('../client/client.js', import.meta.url));
const SOURCE = readFileSync(CLIENT_PATH, 'utf8');

/**
 * 三段原文件（A/B/C）的 client.js 逐字节副本，随包携带在 test/fixtures/ 下。
 * 断言只比对字节，不依赖任何旧插件目录的存在。
 */
const PART_SOURCES = [
	{ label: 'A · dsh-icon-custom', url: new URL('./fixtures/icon-custom.client.js', import.meta.url) },
	{ label: 'B · dsh-notify-p', url: new URL('./fixtures/notify.client.js', import.meta.url) },
	{ label: 'C · dsh-session-info', url: new URL('./fixtures/session-info.client.js', import.meta.url) },
];

/** `window.__ModuleLoader__.load(` 在合并文件里出现的次数。 */
const LOAD_CALLS = (SOURCE.match(/window\.__ModuleLoader__\.load\(/g) ?? []).length;

/** 合并后唯一对外注册的模块 id。 */
const MERGED_ID = 'dsh-lookout';

/** require 桩：三段只 require 这两个 id。 */
function requireStub(id) {
	if (id === 'react') return { createElement: () => ({}) };
	if (id === '@deepseek-ai/dsh-client-ui-primitives') return {};
	throw new Error(`未预期的 require：${id}`);
}

/** 造一个最小浏览器环境，收集 `window.__ModuleLoader__.load()` 的调用。 */
function browserSandbox() {
	const loads = [];
	const sandbox = {};
	// 浏览器语义：window 就是全局对象。
	sandbox.window = sandbox;
	sandbox.self = sandbox;
	sandbox.console = console;
	sandbox.document = {
		querySelector: () => null,
		querySelectorAll: () => [],
		createElement: () => ({ dataset: {}, style: {}, textContent: '' }),
		head: { appendChild: () => {} },
		body: { appendChild: () => {} },
		addEventListener: () => {},
		removeEventListener: () => {},
		visibilityState: 'visible',
	};
	sandbox.navigator = { userAgent: 'node', language: 'zh-CN' };
	sandbox.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
	sandbox.performance = { now: () => Date.now() };
	sandbox.setTimeout = setTimeout;
	sandbox.clearTimeout = clearTimeout;
	sandbox.setInterval = setInterval;
	sandbox.clearInterval = clearInterval;
	sandbox.requestAnimationFrame = (fn) => setTimeout(() => fn(Date.now()), 0);
	sandbox.cancelAnimationFrame = clearTimeout;
	sandbox.fetch = () => Promise.resolve({ ok: true, json: async () => ({}), text: async () => '' });
	sandbox.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {} });
	sandbox.MutationObserver = class {
		observe() {}
		disconnect() {}
		takeRecords() { return []; }
	};
	sandbox.__ModuleLoader__ = { load: (def) => { loads.push(def); } };
	return { sandbox, loads };
}

test('合并形态：window.__ModuleLoader__.load( 恰好出现 4 次', () => {
	assert.equal(LOAD_CALLS, 4, `实际出现 ${LOAD_CALLS} 次`);
});

test('逐字节保留：三段原文件的全文都是合并文件的子串', () => {
	for (const { label, url } of PART_SOURCES) {
		const original = readFileSync(fileURLToPath(url), 'utf8');
		assert.equal(original.length > 0, true, `${label} 原文件不该是空的`);
		assert.equal(SOURCE.includes(original), true, `${label} 的 client.js 必须逐字节出现在合并文件里`);
	}
});

test('胶水层：只注册一次 dsh-lookout，factory 产出 { inject: 数组, apply: 函数 }', () => {
	const hadGlobalWindow = Object.hasOwn(globalThis, 'window');
	const hadGlobalDocument = Object.hasOwn(globalThis, 'document');
	const { sandbox, loads } = browserSandbox();

	// 局部 vm context：全程不碰 globalThis，不需要事后清理。
	vm.runInNewContext(SOURCE, sandbox, { filename: CLIENT_PATH });

	assert.equal(loads.length, 1, `对外只该注册 1 次，实际 ${loads.length} 次`);
	const entry = loads[0];
	assert.equal(entry.id, MERGED_ID);
	assert.equal(typeof entry.factory, 'function');

	const mod = entry.factory(requireStub);
	assert.equal(Array.isArray(mod.inject), true, 'inject 必须是数组');
	assert.equal(typeof mod.apply, 'function', 'apply 必须是函数');

	// 不污染全局：vm context 之外一个 window / document 都不该多出来。
	assert.equal(Object.hasOwn(globalThis, 'window'), hadGlobalWindow, '不得往 globalThis 上挂 window');
	assert.equal(Object.hasOwn(globalThis, 'document'), hadGlobalDocument, '不得往 globalThis 上挂 document');
});
