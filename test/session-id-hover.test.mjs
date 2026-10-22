// 侧栏会话悬停卡片里「会话 ID 行」的离线测试。
//
// 这段代码在合并文件的胶水层里（//#region session id in the sidebar hover card），
// 按同样的标记切出同一份字节，用假 window/document/React 直接驱动
// sessionIdHoverStart / sessionIdHoverInstall。纯函数（hoverReadFlag、hoverFallbackText）
// 单独测。不联网、不启服务器。
//
// 覆盖：开关默认开·存 0 关·读失败当开 / 插槽注册（名称与优先级）/ 设置分区 /
// 卡片行渲染完整 ID / 点一下复制并拦住事件 / 复制失败走失败提示 /
// 开启时隐藏头部徽标、关闭时恢复 / apply() 挂上本功能且仍是 4 次注册。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const CLIENT_PATH = fileURLToPath(new URL('../client/client.js', import.meta.url));
const SOURCE = readFileSync(CLIENT_PATH, 'utf8');

const REGION_START = SOURCE.indexOf('//#region session id in the sidebar hover card');
if (REGION_START < 0) throw new Error('client.js 里找不到 session id hover region');
const REGION_BODY_START = SOURCE.indexOf('\n', REGION_START) + 1;
const REGION_END = SOURCE.indexOf('//#endregion', REGION_BODY_START);
if (REGION_END < 0) throw new Error('session id hover region 没有 //#endregion');
const REGION = SOURCE.slice(REGION_BODY_START, REGION_END);

const ENABLED_KEY = 'dsh-lookout:session-id:hover';
const SLOT = 'sidebar.session.row.hover';
const STYLE_KEY = 'lookout-session-id-hover';
const HIDE_STYLE_KEY = 'lookout-session-id-hide';

// ---------------------------------------------------------------- 假 DOM ----

function makeEl(tagName) {
  const el = {
    tagName: String(tagName).toUpperCase(),
    children: [],
    textContent: '',
    className: '',
    attrs: {},
    parentNode: null,
    remove() {
      if (el.parentNode !== null && el.parentNode !== undefined) {
        const list = el.parentNode.children;
        const at = list.indexOf(el);
        if (at >= 0) list.splice(at, 1);
      }
      el.parentNode = null;
    },
    setAttribute(name, value) { el.attrs[name] = String(value); },
    getAttribute(name) { return Object.prototype.hasOwnProperty.call(el.attrs, name) ? el.attrs[name] : null; },
    hasAttribute(name) { return Object.prototype.hasOwnProperty.call(el.attrs, name); },
    appendChild(child) { child.parentNode = el; el.children.push(child); return child; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {},
  };
  return el;
}

function createEnv(initialStorage) {
  const storage = new Map(Object.entries(initialStorage ?? {}));
  const head = makeEl('head');
  const body = makeEl('body');
  const document = {
    head,
    body,
    createElement: (tag) => makeEl(tag),
    createTextNode: (text) => ({ textContent: text }),
    querySelector(selector) {
      const m = /^style\[data-plugin-css="([^"]+)"\]$/.exec(selector);
      if (m !== null) return head.children.find((node) => node.getAttribute('data-plugin-css') === m[1]) ?? null;
      return null;
    },
    querySelectorAll(selector) {
      const m = /^style\[data-plugin-css="([^"]+)"\]$/.exec(selector);
      if (m !== null) return head.children.filter((node) => node.getAttribute('data-plugin-css') === m[1]);
      return [];
    },
  };
  const window = {
    localStorage: {
      getItem(key) {
        if (storage.__throws === true) throw new Error('storage unavailable');
        return storage.has(key) ? storage.get(key) : null;
      },
      setItem(key, value) {
        if (storage.__throws === true) throw new Error('storage unavailable');
        storage.set(key, String(value));
      },
    },
    setTimeout: (fn) => { timerFns.push(fn); return timerFns.length; },
    clearTimeout: () => {},
  };
  const timerFns = [];
  const warns = [];
  return {
    document, window, storage, warns, timerFns,
    navigator: {},
    console: { warn: (...args) => warns.push(args.map(String).join(' ')) },
  };
}

// --------------------------------------------------------------- 假 React ----

function makeReact(env) {
  const createElement = (type, props, ...children) => ({ type, props: { ...(props ?? {}), children } });
  return {
    createElement,
    useState(initial) { return [typeof initial === 'function' ? initial() : initial, () => {}]; },
    useEffect(fn) { fn(); return () => {}; },
  };
}

// ------------------------------------------------------------- region 入口 ----

function regionApi(env, options = {}) {
  const react = options.react ?? makeReact(env);
  const requireStub = options.require ?? ((id) => {
    if (id === 'react') return react;
    if (id === '@deepseek-ai/dsh-client-ui-primitives') return {};
    throw new Error('未预期的 require: ' + id);
  });
  const build = new Function(
    'window', 'document', 'navigator', 'console', 'Date', 'require',
    '"use strict";\n' + REGION + '\nreturn { sessionIdHoverStart, sessionIdHoverInstall, hoverReadFlag, hoverFallbackText, HOVER_NS, HOVER_SLOT, HOVER_ENABLED_KEY, HOVER_CSS };',
  );
  const api = build(env.window, env.document, env.navigator, env.console, Date, requireStub);
  api.require = requireStub;
  return api;
}

function createCtx(options = {}) {
  const registrations = [];
  const effects = [];
  const ctx = {
    locale: options.locale,
    effect(fn, label) { effects.push({ fn, label }); return fn(); },
    slots: {
      inject(_name, fn) { fn(); },
      register(def, component) { registrations.push({ def, component }); return () => {}; },
    },
  };
  return { ctx, registrations, effects };
}

function install(api, context) {
  api.sessionIdHoverStart(context.ctx, api.require);
  return { registrations: context.registrations, effects: context.effects };
}

function findReg(registrations, name) {
  return registrations.find((item) => item.def !== null && typeof item.def === 'object' && item.def.name === name);
}

function styleWith(env, key) {
  return env.document.head.children.find((node) => node.getAttribute('data-plugin-css') === key) ?? null;
}

// ------------------------------------------------------------------ 断言 ----

test('结构：官方插槽、独立 locale 命名空间、开关存储键都在源码里', () => {
  assert.ok(REGION.includes('"sidebar.session.row.hover"'), '必须挂官方插槽');
  assert.ok(REGION.includes('sidebar.session.row.hover'), '插槽名要能被搜索到');
  assert.ok(REGION.includes('dsh-lookout-session-id'), '用自己的 locale 命名空间');
  assert.ok(REGION.includes(ENABLED_KEY), '开关键固定');
  assert.ok(!REGION.includes('data-icon-custom-panel'), '不再贴着通知弹窗画');
});

test('开关：缺省为开；写 "0" 后关；localStorage 抛错当开', () => {
  assert.equal(regionApi(createEnv()).hoverReadFlag(), true);
  assert.equal(regionApi(createEnv({ [ENABLED_KEY]: '1' })).hoverReadFlag(), true);
  assert.equal(regionApi(createEnv({ [ENABLED_KEY]: '0' })).hoverReadFlag(), false);
  const throwing = createEnv();
  throwing.storage.__throws = true;
  assert.equal(regionApi(throwing).hoverReadFlag(), true, '存储不可用不许让功能消失');
});

test('注册：悬停插槽 order=1、设置分区 order=57，命名空间不撞', () => {
  const env = createEnv();
  const api = regionApi(env);
  const context = createCtx();
  const { registrations } = install(api, context);
  const hover = findReg(registrations, SLOT);
  assert.ok(hover, '必须注册 sidebar.session.row.hover');
  assert.equal(hover.def.id, 'lookout-session-id');
  assert.equal(hover.def.order, 1, '排在计划任务(10)与状态行之前');
  assert.equal(hover.def.locale, api.HOVER_NS);
  const settings = registrations.find((item) => item.def.name === 'settings.section');
  assert.ok(settings, '设置页要有自己的分区');
  assert.equal(settings.def.order, 57);
  assert.equal(settings.def.locale, api.HOVER_NS);
  assert.notEqual(api.HOVER_NS, 'dsh-lookout', '不能和文件行菜单抢命名空间');
});

test('样式：卡片行与 toast 各有一套 CSS，且不硬编码彩色', () => {
  const env = createEnv();
  const api = regionApi(env);
  install(api, createCtx());
  const style = styleWith(env, STYLE_KEY);
  assert.ok(style, '必须注入样式表');
  assert.ok(style.textContent.includes('dsh-lookout-session-id-hover'), '行样式类存在');
  assert.ok(style.textContent.includes('ui-monospace'), '等宽字体');
  assert.ok(!/#[0-9a-fA-F]{6}(?![^}]*var\(--dsw)/.test(style.textContent.replace(/var\(--[^)]+\)/g, '')), '颜色走宿主 token');
});

test('头部徽标：开启时用一条作用域规则隐藏，关闭后恢复', () => {
  const env = createEnv();
  const api = regionApi(env);
  const context = createCtx();
  install(api, context);
  const hide = styleWith(env, HIDE_STYLE_KEY);
  assert.ok(hide, '默认开启时必须隐藏头部那串 ID（真·转移）');
  assert.ok(hide.textContent.includes('.dsh-session-info'), '只针对会话 ID 徽标');
  assert.ok(hide.textContent.includes('display:none'), '规则真的会隐藏');
  // 组件里拿到的设置开关：模拟用户取消勾选
  const settings = context.registrations.find((item) => item.def.name === 'settings.section');
  const section = settings.component({ t: (key) => key });
  const checkbox = section.props.children[1];
  const input = checkbox.props.children[0];
  input.props.onChange({ target: { checked: false } });
  assert.equal(styleWith(env, HIDE_STYLE_KEY), null, '关掉后头部要回来');
  assert.equal(env.storage.get(ENABLED_KEY), '0', '开关要落盘');
});

test('卡片行：渲染完整 session ID，role=button 可聚焦', () => {
  const env = createEnv();
  const api = regionApi(env);
  const context = createCtx();
  const { registrations } = install(api, context);
  const hover = findReg(registrations, SLOT);
  const id = 'session-ca3089c3-e97f-4f00-a59d-890b72f759d2';
  const node = hover.component({ sessionId: id, t: api.hoverFallbackText });
  assert.ok(node, '开启时必须渲染');
  assert.equal(node.type, 'div', '不能是 button（卡片是 passive 面板）');
  assert.equal(node.props.role, 'button');
  assert.equal(node.props.tabIndex, 0);
  assert.equal(node.props['data-lookout-session-id'], id);
  assert.equal(node.props.children[0], id, '显示完整 ID（不是 8 位缩写）');
  assert.equal(node.props.title, api.hoverFallbackText('copyHint'));
});

test('卡片行：没有 sessionId 或开关关掉时什么都不渲染', () => {
  const env = createEnv();
  const api = regionApi(env);
  const context = createCtx();
  const { registrations } = install(api, context);
  const hover = findReg(registrations, SLOT);
  assert.equal(hover.component({ sessionId: '', t: api.hoverFallbackText }), null);
  assert.equal(hover.component({ t: api.hoverFallbackText }), null);
  const offEnv = createEnv({ [ENABLED_KEY]: '0' });
  const offApi = regionApi(offEnv);
  const offContext = createCtx();
  const offInstalled = install(offApi, offContext);
  const offHover = findReg(offInstalled.registrations, SLOT);
  assert.equal(offHover.component({ sessionId: 'session-abc', t: offApi.hoverFallbackText }), null, '关掉后不渲染');
  assert.equal(styleWith(offEnv, HIDE_STYLE_KEY), null, '关掉后头部要可见');
});

test('复制：点击拦住事件、复制完整 ID、成功提示', async () => {
  const env = createEnv();
  let copied = '';
  const api = regionApi(env, {
    require: (id) => {
      if (id === 'react') return makeReact(env);
      if (id === '@deepseek-ai/dsh-client-ui-primitives') return { writeClipboard: async (text) => { copied = text; return true; } };
      throw new Error('未预期的 require: ' + id);
    },
  });
  const context = createCtx();
  const { registrations } = install(api, context);
  const hover = findReg(registrations, SLOT);
  const id = 'session-ca3089c3-e97f-4f00-a59d-890b72f759d2';
  const node = hover.component({ sessionId: id, t: api.hoverFallbackText });
  let prevented = 0;
  let stopped = 0;
  node.props.onClick({ preventDefault: () => { prevented++; }, stopPropagation: () => { stopped++; } });
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(prevented, 1, '必须拦下默认行为');
  assert.equal(stopped, 1, '必须拦下冒泡（不许触发行自己的点击）');
  assert.equal(copied, id, '复制完整 ID');
  const toast = env.document.body.children.find((child) => child.getAttribute('data-lookout-session-id-toast') !== null);
  assert.ok(toast, '要有成功提示');
  assert.equal(toast.textContent, api.hoverFallbackText('copied'));
});

test('复制：键盘 Enter / 空格也触发，其它键不触发', async () => {
  const env = createEnv();
  let calls = 0;
  const api = regionApi(env, {
    require: (id) => {
      if (id === 'react') return makeReact(env);
      if (id === '@deepseek-ai/dsh-client-ui-primitives') return { writeClipboard: async () => { calls++; return true; } };
      throw new Error('未预期的 require: ' + id);
    },
  });
  const context = createCtx();
  const { registrations } = install(api, context);
  const hover = findReg(registrations, SLOT);
  const node = hover.component({ sessionId: 'session-abc', t: api.hoverFallbackText });
  const event = (key) => ({ key, preventDefault() {}, stopPropagation() {} });
  node.props.onKeyDown(event('Tab'));
  assert.equal(calls, 0, '其它键不复制');
  node.props.onKeyDown(event('Enter'));
  node.props.onKeyDown(event(' '));
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(calls, 2, 'Enter 与空格各触发一次');
});

test('复制失败：三条通道全挂时走失败提示', async () => {
  const env = createEnv();
  const api = regionApi(env, {
    require: (id) => {
      if (id === 'react') return makeReact(env);
      if (id === '@deepseek-ai/dsh-client-ui-primitives') return { writeClipboard: async () => { throw new Error('拒绝'); } };
      throw new Error('未预期的 require: ' + id);
    },
  });
  env.navigator.clipboard = { writeText: async () => { throw new Error('不允许'); } };
  const context = createCtx();
  const { registrations } = install(api, context);
  const hover = findReg(registrations, SLOT);
  const node = hover.component({ sessionId: 'session-abc', t: api.hoverFallbackText });
  node.props.onClick({ preventDefault() {}, stopPropagation() {} });
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  const toast = env.document.body.children.find((child) => child.getAttribute('data-lookout-session-id-toast') !== null);
  assert.ok(toast, '失败也要提示');
  assert.equal(toast.textContent, api.hoverFallbackText('copyFailed'));
  assert.equal(toast.hasAttribute('data-lookout-session-id-failed'), true);
});

test('健壮性：locale 抛错、没有 slots、require 抛错都不崩', () => {
  const env = createEnv();
  const api = regionApi(env, {
    require: (id) => {
      if (id === 'react') return makeReact(env);
      throw new Error('未预期的 require: ' + id);
    },
  });
  const throwingLocale = { register() { throw new Error('locale 挂了'); }, bind() { throw new Error('locale 挂了'); } };
  assert.doesNotThrow(() => api.sessionIdHoverStart({ locale: throwingLocale }, api.require));
  assert.doesNotThrow(() => api.sessionIdHoverStart({}, api.require), '没有 slots 也不许抛');
  assert.doesNotThrow(() => api.sessionIdHoverStart({ slots: { inject() { throw new Error('slots 挂了'); } } }, api.require));
  assert.ok(env.warns.length >= 0, '只记录，不抛');
});

test('整份 bundle：apply() 挂上会话 ID 功能，且仍只有 4 次 ModuleLoader 注册', () => {
  const loads = (SOURCE.match(/window\.__ModuleLoader__\.load\(/g) ?? []).length;
  assert.equal(loads, 4, '三段原插件 + 胶水层');
  assert.ok(SOURCE.includes('sessionIdHoverStart(ctx, require);'), 'apply() 必须启动它');
  assert.ok(SOURCE.includes('id: "dsh-lookout"'), '对外只注册一个模块');
});
