// 工作区置顶的离线测试。
//
// 置顶逻辑同样在合并文件的胶水层里（//#region workspace rows），这里切出同一份
// 字节，用可手动推进时钟的假 window/document 和一个假的 workspaces 服务直接驱动
// wsRowsInstall，不联网、不启服务器。
//
// 覆盖：置顶到最前的最少调用 / 已满足时零调用 / 多个置顶保持相对顺序 /
// 列表前面插入新工作区后自动重放 / 按锚点还原与锚点消失 / 子工作区不参与置顶 /
// 服务缺席只写偏好并降级 / insertBefore 失败只提示一次 / 自身移动的重入有上界。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const CLIENT_PATH = fileURLToPath(new URL('../client/client.js', import.meta.url));
const SOURCE = readFileSync(CLIENT_PATH, 'utf8');

const REGION_START = SOURCE.indexOf('//#region workspace rows');
if (REGION_START < 0) throw new Error('client.js 里找不到 workspace rows region');
const REGION_BODY_START = SOURCE.indexOf('\n', REGION_START) + 1;
const REGION_END = SOURCE.indexOf('//#endregion', REGION_BODY_START);
if (REGION_END < 0) throw new Error('workspace rows region 没有 //#endregion');
const REGION = SOURCE.slice(REGION_BODY_START, REGION_END);

const LOCAL_KEY = 'dsh-lookout.workspacePrefs';
const ENABLED_KEY = 'dsh-lookout:workspace-rows:enabled';
const DISMISSED_KEY = 'dsh-lookout:workspace-rows:gave-up-dismissed';

// ---------------------------------------------------------------- 假 DOM ----

/** 选择器只支持源码实际用到的形态：tag、[attr]、[attr="v"]、:not([attr])、逗号。 */
function matchesPart(element, part) {
  let rest = part.trim();
  if (rest === '') return false;
  const tag = /^([a-zA-Z][\w-]*)/.exec(rest);
  if (tag !== null) {
    if (element.tagName !== tag[1].toUpperCase()) return false;
    rest = rest.slice(tag[0].length);
  }
  while (rest.length > 0) {
    let match = /^\.([\w-]+)/.exec(rest);
    if (match !== null) {
      if (!String(element.className).split(/\s+/).includes(match[1])) return false;
      rest = rest.slice(match[0].length);
      continue;
    }
    match = /^\[([\w-]+)(?:="([^"]*)")?\]/.exec(rest);
    if (match !== null) {
      const value = element.getAttribute(match[1]);
      if (value === null) return false;
      if (match[2] !== undefined && value !== match[2]) return false;
      rest = rest.slice(match[0].length);
      continue;
    }
    match = /^:not\(\[([\w-]+)(?:="([^"]*)")?\]\)/.exec(rest);
    if (match !== null) {
      const value = element.getAttribute(match[1]);
      if (value !== null && (match[2] === undefined || value === match[2])) return false;
      rest = rest.slice(match[0].length);
      continue;
    }
    return false;
  }
  return true;
}

function matchesSelector(element, selector) {
  return selector.split(',').some((part) => matchesPart(element, part));
}

class FakeElement {
  constructor(document, tagName, namespace = null) {
    this.ownerDocument = document;
    this.tagName = tagName.toUpperCase();
    this.namespaceURI = namespace;
    this.attributes = new Map();
    this.children = [];
    this.parentNode = null;
    this.style = {};
    this.className = '';
    this.title = '';
    this.value = '';
    this.type = '';
    this._text = '';
    this._listeners = new Map();
  }

  get firstChild() { return this.children[0] ?? null; }
  get parentElement() { return this.parentNode; }
  get childNodes() { return this.children; }

  get isConnected() {
    let node = this;
    while (node !== null && node !== undefined) {
      if (node === this.ownerDocument.documentElement) return true;
      node = node.parentNode;
    }
    return false;
  }

  get textContent() {
    if (this.children.length > 0) return this.children.map((child) => child.textContent).join('');
    return this._text;
  }

  set textContent(value) {
    this.children = [];
    this._text = String(value);
  }

  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
  hasAttribute(name) { return this.attributes.has(name); }
  removeAttribute(name) { this.attributes.delete(name); }

  appendChild(child) {
    if (child.parentNode !== null) child.parentNode.removeChild(child);
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index >= 0) this.children.splice(index, 1);
    child.parentNode = null;
    return child;
  }

  insertAdjacentElement(position, element) {
    const parent = this.parentNode;
    if (position !== 'afterend' || parent === null) return null;
    if (element.parentNode !== null) element.parentNode.removeChild(element);
    const index = parent.children.indexOf(this);
    parent.children.splice(index + 1, 0, element);
    element.parentNode = parent;
    return element;
  }

  remove() { if (this.parentNode !== null) this.parentNode.removeChild(this); }

  closest(selector) {
    let node = this;
    while (node !== null && node !== undefined) {
      if (node instanceof FakeElement && matchesSelector(node, selector)) return node;
      node = node.parentNode;
    }
    return null;
  }

  matches(selector) { return matchesSelector(this, selector); }

  querySelectorAll(selector) {
    const found = [];
    const visit = (node) => {
      for (const child of node.children) {
        if (matchesSelector(child, selector)) found.push(child);
        visit(child);
      }
    };
    visit(this);
    return found;
  }

  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }

  addEventListener(type, listener) {
    if (!this._listeners.has(type)) this._listeners.set(type, []);
    this._listeners.get(type).push(listener);
  }

  removeEventListener(type, listener) {
    const list = this._listeners.get(type);
    if (list === undefined) return;
    this._listeners.set(type, list.filter((item) => item !== listener));
  }

  dispatchEvent(event) {
    if (event.target === undefined) event.target = this;
    if (typeof event.preventDefault !== 'function') event.preventDefault = () => { event.defaultPrevented = true; };
    if (typeof event.stopPropagation !== 'function') event.stopPropagation = () => { event._stopped = true; };
    let node = this;
    while (node !== null && node !== undefined) {
      const list = node._listeners?.get(event.type);
      if (list !== undefined) for (const listener of [...list]) listener.call(node, event);
      if (event._stopped === true) break;
      node = node.parentNode;
    }
    return event.defaultPrevented !== true;
  }

  click() { this.dispatchEvent({ type: 'click' }); }
}

class FakeDocument {
  constructor(created) {
    this.created = created;
    this._listeners = new Map();
    this.documentElement = new FakeElement(this, 'html');
    this.head = new FakeElement(this, 'head');
    this.body = new FakeElement(this, 'body');
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
    this.activeElement = null;
  }

  createElement(tagName) {
    const element = new FakeElement(this, tagName);
    this.created.push(element);
    return element;
  }

  createElementNS(namespace, tagName) {
    const element = new FakeElement(this, tagName, namespace);
    this.created.push(element);
    return element;
  }

  querySelectorAll(selector) { return this.documentElement.querySelectorAll(selector); }
  querySelector(selector) { return this.documentElement.querySelector(selector); }

  addEventListener(type, listener) {
    if (!this._listeners.has(type)) this._listeners.set(type, []);
    this._listeners.get(type).push(listener);
  }

  removeEventListener(type, listener) {
    const list = this._listeners.get(type);
    if (list === undefined) return;
    this._listeners.set(type, list.filter((item) => item !== listener));
  }

  dispatchEvent(event) {
    if (event.target === undefined) event.target = this;
    if (typeof event.preventDefault !== 'function') event.preventDefault = () => { event.defaultPrevented = true; };
    const list = this._listeners.get(event.type);
    if (list !== undefined) for (const listener of [...list]) listener.call(this, event);
    return event.defaultPrevented !== true;
  }
}

// ------------------------------------------------------------ 假环境 / 时钟 ----

function createScheduler() {
  let now = 0;
  let sequence = 0;
  const timers = new Map();
  return {
    now: () => now,
    setTimeout(fn, delay) {
      const id = ++sequence;
      timers.set(id, { at: now + Number(delay || 0), fn, interval: 0 });
      return id;
    },
    setInterval(fn, delay) {
      const id = ++sequence;
      const period = Math.max(1, Number(delay || 0));
      timers.set(id, { at: now + period, fn, interval: period });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    clearInterval(id) { timers.delete(id); },
    tick(ms) {
      const target = now + Number(ms || 0);
      for (let guard = 0; guard < 10000; guard++) {
        let next = null;
        for (const [id, timer] of timers) {
          if (timer.at <= target && (next === null || timer.at < next.timer.at)) next = { id, timer };
        }
        if (next === null) break;
        now = next.timer.at;
        if (next.timer.interval > 0) next.timer.at = now + next.timer.interval;
        else timers.delete(next.id);
        next.timer.fn();
      }
      now = target;
    },
  };
}

function createEnv(options = {}) {
  const scheduler = createScheduler();
  const storage = new Map(Object.entries(options.storage ?? {}));
  const created = [];
  const warns = [];
  const observers = [];
  const document = new FakeDocument(created);
  const observerClass = options.noMutationObserver === true
    ? undefined
    : class {
        constructor(callback) { this.callback = callback; this.disconnected = false; this.observed = false; observers.push(this); }
        observe() { this.observed = true; }
        disconnect() { this.disconnected = true; this.observed = false; }
        takeRecords() { return []; }
        trigger() { if (!this.disconnected) this.callback([]); }
      };
  const window = {
    addEventListener() {},
    removeEventListener() {},
    setTimeout: scheduler.setTimeout,
    clearTimeout: scheduler.clearTimeout,
    setInterval: scheduler.setInterval,
    clearInterval: scheduler.clearInterval,
    localStorage: {
      getItem: (key) => (storage.has(key) ? storage.get(key) : null),
      setItem: (key, value) => { storage.set(key, String(value)); },
      removeItem: (key) => { storage.delete(key); },
    },
    MutationObserver: observerClass,
  };
  return {
    scheduler, document, window, observers, created, warns, storage,
    navigator: {},
    console: { warn: (...args) => { warns.push(args.map(String).join(' ')); } },
    Date: { now: () => scheduler.now() },
  };
}

// ------------------------------------------------------------ region 入口 ----

function regionApi(env) {
  const build = new Function(
    'window', 'document', 'navigator', 'console', 'Date',
    '"use strict";\n' + REGION + '\nreturn { wsRowsStart, wsRowsInstall, WS_ROWS_NS, WS_ROWS_ZH, WS_ROWS_EN, WS_ROWS_CSS, WS_COLORS, WS_PREFS_LOCAL_KEY, WS_ROWS_ENABLED_KEY, WS_ROWS_DISMISSED_KEY };',
  );
  return build(env.window, env.document, env.navigator, env.console, env.Date);
}

function fakeReact() {
  return {
    createElement(type, props, ...children) {
      return { type, props: Object.assign({}, props, { children }) };
    },
    useState(initial) { return [typeof initial === 'function' ? initial() : initial, () => {}]; },
    useEffect() {},
    useMemo(fn) { return fn(); },
    useCallback(fn) { return fn; },
  };
}

/** 假 ctx：记录 RPC、effect、settings.section 注册，并提供可选 uiWorkspace。 */
function createCtx(options = {}) {
  const rpcCalls = [];
  const effects = [];
  const registrations = [];
  const hostDoc = options.hostDoc ?? { version: 1, workspaces: {} };
  const rpc = options.rpc ?? (async (_path, method, payload) => {
    if (method === 'iconCustom/getWorkspacePrefs') return { ok: true, value: hostDoc };
    if (method === 'iconCustom/setWorkspacePrefs') return { ok: true, value: payload.args.request };
    return { ok: true, value: {} };
  });
  const ctx = {
    connection: { rpc: { call: (...args) => { rpcCalls.push(args); return rpc(...args); } } },
    get: (name) => (name === 'uiWorkspace' ? options.uiWorkspace : undefined),
    locale: options.locale,
    // cordis 的 effect 会立刻执行回调并登记它返回的清理函数；照这个语义来。
    effect(fn, label) { effects.push({ fn, label }); const dispose = fn(); return dispose; },
    slots: {
      inject(_name, fn) { fn(); },
      register(def, component) { registrations.push({ def, component }); return () => {}; },
    },
  };
  return { ctx, rpcCalls, effects, registrations };
}

function install(env, region, context, react = fakeReact()) {
  const controller = region.wsRowsInstall(context.ctx, (id) => {
    if (id === 'react') return react;
    throw new Error('未预期的 require: ' + id);
  });
  return controller;
}

/**
 * 侧栏：一个工作区 = div.groupSection > （宿主 HoverCard 包的）span > 工作区行。
 * HoverCard 会把锚点包进 span（真宿主就是这样），所以默认 wrapped=true；
 * wrapped=false 模拟未分组桶那条直接挂在 groupSection 下的路径。
 */
function makeSidebar(document, groups) {
  const root = document.createElement('div');
  root.setAttribute('data-slot', 'sidebar.workspaces');
  document.body.appendChild(root);
  const rows = [];
  const holderFor = (section, group) => {
    if (group.wrapped === false) return section;
    const holder = document.createElement('span');
    holder.className = 'HoverCard_root';
    section.appendChild(holder);
    return holder;
  };
  for (const group of groups) {
    const section = document.createElement('div');
    section.className = 'WorkspaceBrowser_groupSection';
    const holder = holderFor(section, group);
    const row = document.createElement('div');
    row.setAttribute('data-row-key', 'workspace:' + group.id);
    row.setAttribute('role', 'treeitem');
    if (group.title !== false) {
      const projectText = document.createElement('span');
      projectText.className = 'Rows_projectText';
      const title = document.createElement('span');
      title.className = 'Rows_title';
      title.textContent = group.name ?? group.id;
      projectText.appendChild(title);
      row.appendChild(projectText);
    }
    if (group.active === true) {
      const slot = document.createElement('span');
      slot.className = 'Rows_slot Rows_folderActive';
      row.appendChild(slot);
    }
    holder.appendChild(row);
    for (const session of group.sessions ?? []) {
      const sessionHolder = holderFor(section, group);
      const sessionRow = document.createElement('div');
      sessionRow.setAttribute('data-row-key', 'session:' + session.id);
      sessionRow.setAttribute('role', 'treeitem');
      if (session.selected === true) sessionRow.setAttribute('aria-selected', 'true');
      const text = document.createElement('span');
      text.className = 'Rows_title';
      text.textContent = session.id;
      sessionRow.appendChild(text);
      sessionHolder.appendChild(sessionRow);
    }
    root.appendChild(section);
    rows.push(row);
  }
  return { root, rows };
}

function docWith(entries) {
  return { version: 1, workspaces: entries };
}

function badgesIn(root) {
  return root.querySelectorAll('[data-lookout-ws-tag]');
}

function hideStyle(document) {
  return document.querySelector('style[data-plugin-css="lookout-workspace-hide"]');
}

function toastText(document) {
  const toast = document.querySelector('[data-lookout-ws-toast]');
  if (toast === null) return null;
  return toast.textContent;
}

async function flush() {
  for (let i = 0; i < 10; i++) await Promise.resolve();
}

// ------------------------------------------------- 假 workspaces 服务 ----

/**
 * 官方 Client Workspace 服务的最小假体：list.getSnapshot()/subscribe() 与
 * insertBefore(id, before)。frozen=true 模拟“宿主接受了调用却没真的移动”的
 * 病态实现（验证重入上界）；fail=true 模拟抛 commandError("reorder")。
 */
function createWorkspaceService(specs, options = {}) {
  const state = {
    items: specs.map((spec) => ({
      workspaceId: spec.id,
      path: spec.path ?? '/' + spec.id,
      title: spec.title ?? spec.id,
      sessionIds: [],
    })),
    listeners: new Set(),
    calls: [],
    fail: options.fail === true,
    frozen: options.frozen === true,
  };
  const notify = () => { for (const listener of [...state.listeners]) listener(); };
  const service = {
    list: {
      getSnapshot() { return { items: state.items.map((item) => ({ ...item })) }; },
      subscribe(listener) { state.listeners.add(listener); return () => state.listeners.delete(listener); },
    },
    async insertBefore(id, before) {
      state.calls.push(before === undefined ? [id] : [id, before]);
      if (state.fail) {
        // 真实宿主失败时会回滚并通知列表变化，这里照做，才能验证失败重试有上界。
        notify();
        throw new Error('commandError: reorder');
      }
      if (!state.frozen) {
        const item = state.items.find((entry) => entry.workspaceId === id);
        if (item === undefined) throw new Error('commandError: reorder (unknown ' + id + ')');
        const rest = state.items.filter((entry) => entry.workspaceId !== id);
        const at = before === undefined ? rest.length : rest.findIndex((entry) => entry.workspaceId === before);
        if (at < 0) throw new Error('commandError: reorder (unknown anchor ' + before + ')');
        rest.splice(at, 0, item);
        state.items = rest;
      }
      notify();
    },
  };
  return { service, state, notify };
}

function orderOf(state) {
  return state.items.map((item) => item.workspaceId);
}

/** 假 ctx：带 workspaces 注入；inject:false 模拟根本不能注入的旧宿主。 */
function createPinCtx(options = {}) {
  const rpcCalls = [];
  const effects = [];
  const registrations = [];
  const injectCalls = [];
  const hostDoc = options.hostDoc ?? { version: 1, workspaces: {} };
  const rpc = options.rpc ?? (async (_path, method, payload) => {
    if (method === 'iconCustom/getWorkspacePrefs') return { ok: true, value: hostDoc };
    if (method === 'iconCustom/setWorkspacePrefs') return { ok: true, value: payload.args.request };
    return { ok: true, value: {} };
  });
  const ctx = {
    connection: { rpc: { call: (...args) => { rpcCalls.push(args); return rpc(...args); } } },
    get: () => undefined,
    effect(fn, label) { effects.push({ fn, label }); return fn(); },
    slots: {
      inject(_name, fn) { fn(); },
      register(def, component) { registrations.push({ def, component }); return () => {}; },
    },
  };
  if (options.inject !== false) {
    ctx.inject = (deps, callback) => {
      injectCalls.push(deps);
      if (options.injectThrows === true) throw new Error('no inject');
      callback({ workspaces: options.service });
      return { dispose() {} };
    };
  }
  return { ctx, rpcCalls, effects, registrations, injectCalls };
}

/** 在假 React 元素树里找工作区表的控件。 */
function findElements(node, predicate, out = []) {
  if (node === null || node === undefined || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const child of node) findElements(child, predicate, out);
    return out;
  }
  if (predicate(node)) out.push(node);
  if (node.props !== undefined) findElements(node.props.children, predicate, out);
  return out;
}

function fieldOf(tree, field, id) {
  return findElements(tree, (node) => node.props !== undefined
    && node.props['data-lookout-ws-field'] === field
    && (id === undefined || node.props['data-lookout-ws-id'] === id))[0] ?? null;
}

function settingsTree(context, region, items) {
  const registration = context.registrations.find((item) => item.def.id === 'lookout-workspaces');
  assert.ok(registration, '必须注册 settings.section');
  const t = (key, params) => region.WS_ROWS_ZH[key] ?? key;
  const wrapper = registration.component({ t, useWorkspaces: (selector) => selector({ items }) });
  return wrapper.type(wrapper.props);
}

// ---------------------------------------------------------------- 用例 ----

test('置顶：插到当前第一个之前，多个置顶保持原相对顺序；已满足时零调用', async () => {
  const doc = docWith({ 'ws-b': { pinned: true }, 'ws-c': { pinned: true } });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  const region = regionApi(env);
  const { service, state } = createWorkspaceService([{ id: 'ws-a' }, { id: 'ws-b' }, { id: 'ws-c' }]);
  const context = createPinCtx({ hostDoc: doc, service });
  const controller = install(env, region, context);

  env.scheduler.tick(1);
  await flush();
  assert.deepEqual(state.calls, [['ws-b', 'ws-a'], ['ws-c', 'ws-a']],
    '每个置顶项都插到“当前第一个”之前');
  assert.deepEqual(orderOf(state), ['ws-b', 'ws-c', 'ws-a'], '置顶在前，相对顺序保持 b → c');

  const settled = state.calls.length;
  await controller.pinNow();
  assert.equal(state.calls.length, settled, '顺序已满足时一次都不许调');
  assert.deepEqual(orderOf(state), ['ws-b', 'ws-c', 'ws-a']);
});

test('置顶：已经是第一个时零调用', async () => {
  const doc = docWith({ 'ws-a': { pinned: true } });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  const region = regionApi(env);
  const { service, state } = createWorkspaceService([{ id: 'ws-a' }, { id: 'ws-b' }]);
  const context = createPinCtx({ hostDoc: doc, service });
  const controller = install(env, region, context);

  env.scheduler.tick(1);
  await flush();
  await controller.pinNow();
  assert.equal(state.calls.length, 0, '已经在最前，零调用');
});

test('置顶：最少动作，只移动不在正确前缀里的置顶项', async () => {
  const doc = docWith({ 'ws-p1': { pinned: true }, 'ws-p2': { pinned: true } });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  const region = regionApi(env);
  const { service, state } = createWorkspaceService([
    { id: 'ws-p1' }, { id: 'ws-a' }, { id: 'ws-p2' }, { id: 'ws-b' },
  ]);
  const context = createPinCtx({ hostDoc: doc, service });
  install(env, region, context);

  env.scheduler.tick(1);
  await flush();
  assert.deepEqual(state.calls, [['ws-p2', 'ws-a']], '只移动一个：p1 已经在正确位置');
  assert.deepEqual(orderOf(state), ['ws-p1', 'ws-p2', 'ws-a', 'ws-b']);
});

test('置顶：列表前面插入新工作区后自动重放，置顶回到最前', async () => {
  const doc = docWith({ 'ws-b': { pinned: true }, 'ws-c': { pinned: true } });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  const region = regionApi(env);
  const { service, state, notify } = createWorkspaceService([{ id: 'ws-a' }, { id: 'ws-b' }, { id: 'ws-c' }]);
  const context = createPinCtx({ hostDoc: doc, service });
  install(env, region, context);

  env.scheduler.tick(1);
  await flush();
  assert.deepEqual(orderOf(state), ['ws-b', 'ws-c', 'ws-a']);

  const before = state.calls.length;
  state.items.unshift({ workspaceId: 'ws-n', path: '/ws-n', title: 'new', sessionIds: [] });
  notify();
  env.scheduler.tick(500);
  await flush();
  assert.deepEqual(state.calls.slice(before), [['ws-b', 'ws-n'], ['ws-c', 'ws-n']],
    '新工作区顶到最前后必须自动重放');
  assert.deepEqual(orderOf(state), ['ws-b', 'ws-c', 'ws-n', 'ws-a']);

  const settled = state.calls.length;
  env.scheduler.tick(5000);
  await flush();
  assert.equal(state.calls.length, settled, '重放结束后不许再调用');
});

test('取消置顶：按 pinAnchor 还原到锚点后面', async () => {
  const env = createEnv({ storage: {} });
  const region = regionApi(env);
  const { service, state } = createWorkspaceService([{ id: 'ws-a' }, { id: 'ws-b' }, { id: 'ws-c' }]);
  const context = createPinCtx({ hostDoc: { version: 1, workspaces: {} }, service });
  const controller = install(env, region, context);

  env.scheduler.tick(1);
  await flush();
  assert.equal(state.calls.length, 0, '没有置顶时不动列表');

  controller.updateEntry('ws-c', { pinned: true });
  assert.equal(controller.snapshot().workspaces['ws-c'].pinAnchor, 'ws-b', '记录置顶前紧挨在前面的工作区');
  env.scheduler.tick(1);
  await flush();
  assert.deepEqual(state.calls, [['ws-c', 'ws-a']]);
  assert.deepEqual(orderOf(state), ['ws-c', 'ws-a', 'ws-b']);

  controller.updateEntry('ws-c', { pinned: false });
  await flush();
  assert.deepEqual(state.calls[state.calls.length - 1], ['ws-c'], '锚点 b 已是最后 → 追加到末尾');
  assert.deepEqual(orderOf(state), ['ws-a', 'ws-b', 'ws-c'], '回到原来的位置');
  assert.equal(controller.snapshot().workspaces['ws-c'], undefined, '取消置顶后偏好与锚点一起清掉');
});

test('取消置顶：锚点后面还有工作区时插到锚点后面', async () => {
  const env = createEnv({ storage: {} });
  const region = regionApi(env);
  const { service, state } = createWorkspaceService([
    { id: 'ws-a' }, { id: 'ws-b' }, { id: 'ws-c' }, { id: 'ws-d' },
  ]);
  const context = createPinCtx({ hostDoc: { version: 1, workspaces: {} }, service });
  const controller = install(env, region, context);

  env.scheduler.tick(1);
  await flush();
  controller.updateEntry('ws-b', { pinned: true });
  env.scheduler.tick(1);
  await flush();
  assert.deepEqual(orderOf(state), ['ws-b', 'ws-a', 'ws-c', 'ws-d']);

  controller.updateEntry('ws-b', { pinned: false });
  await flush();
  assert.deepEqual(state.calls[state.calls.length - 1], ['ws-b', 'ws-c'], '插到锚点 a 的下一个 c 之前');
  assert.deepEqual(orderOf(state), ['ws-a', 'ws-b', 'ws-c', 'ws-d']);
});

test('取消置顶：锚点消失时保持原位、零调用、不崩', async () => {
  const env = createEnv({ storage: {} });
  const region = regionApi(env);
  const { service, state, notify } = createWorkspaceService([{ id: 'ws-a' }, { id: 'ws-b' }, { id: 'ws-c' }]);
  const context = createPinCtx({ hostDoc: { version: 1, workspaces: {} }, service });
  const controller = install(env, region, context);

  env.scheduler.tick(1);
  await flush();
  controller.updateEntry('ws-c', { pinned: true });
  env.scheduler.tick(1);
  await flush();
  assert.deepEqual(orderOf(state), ['ws-c', 'ws-a', 'ws-b']);

  state.items = state.items.filter((item) => item.workspaceId !== 'ws-b');
  notify();
  env.scheduler.tick(500);
  await flush();
  const before = state.calls.length;

  controller.updateEntry('ws-c', { pinned: false });
  await flush();
  assert.equal(state.calls.length, before, '锚点不存在时不许移动');
  assert.deepEqual(orderOf(state), ['ws-c', 'ws-a'], '保持当前位置');
  assert.equal(controller.snapshot().workspaces['ws-c'], undefined, '锚点清空');
});

test('子工作区：历史 pinned 被忽略但不清数据，设置表置灰并提示', async () => {
  const items = [
    { workspaceId: 'ws-parent', path: '/root/work', title: '父' },
    { workspaceId: 'ws-child', path: '/root/work/sub', title: '子' },
  ];
  const doc = docWith({ 'ws-child': { pinned: true } });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  const region = regionApi(env);
  const { service, state } = createWorkspaceService([
    { id: 'ws-parent', path: '/root/work' },
    { id: 'ws-child', path: '/root/work/sub' },
  ]);
  const context = createPinCtx({ hostDoc: doc, service });
  const controller = install(env, region, context);

  env.scheduler.tick(1);
  await flush();
  assert.equal(state.calls.length, 0, '子工作区的置顶不参与重排');
  assert.equal(controller.snapshot().workspaces['ws-child'].pinned, true, '历史数据不许清');

  const tree = settingsTree(context, region, items);
  const childPin = fieldOf(tree, 'pinned', 'ws-child');
  assert.ok(childPin, '子工作区要有置顶勾选框');
  assert.equal(childPin.props.disabled, true, '子工作区置顶框置灰');
  assert.equal(childPin.props.title, region.WS_ROWS_ZH.pinChildHint, '给一句提示');
  const parentPin = fieldOf(tree, 'pinned', 'ws-parent');
  assert.notEqual(parentPin.props.disabled, true, '根工作区可以置顶');
});

test('服务缺席：标签/隐藏照常，置顶只写偏好并只 warn 一次', async () => {
  const doc = docWith({ 'ws-a': { tag: '甲' }, 'ws-b': { hidden: true } });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  const region = regionApi(env);
  const sidebar = makeSidebar(env.document, [{ id: 'ws-a', name: '项目甲' }, { id: 'ws-b', name: '项目乙' }]);
  const context = createPinCtx({ hostDoc: doc, inject: false });
  const controller = install(env, region, context);

  const badge = sidebar.rows[0].querySelector('[data-lookout-ws-tag]');
  assert.ok(badge, '没有 workspaces 服务也不许影响标签');
  assert.equal(badge.textContent, '甲');
  assert.match(hideStyle(env.document).textContent, /workspace:ws-b/, '隐藏照常工作');

  assert.doesNotThrow(() => controller.updateEntry('ws-a', { pinned: true }), '不许抛错');
  assert.equal(controller.snapshot().workspaces['ws-a'].pinned, true, '置顶勾选仍写 prefs');
  assert.equal(env.warns.length, 1, '只 console warn 一次');
  assert.match(env.warns[0], /工作区服务|置顶/);

  assert.doesNotThrow(() => controller.updateEntry('ws-b', { pinned: true }));
  assert.equal(env.warns.length, 1, '第二次不再 warn');
  await controller.pinNow();
  assert.equal(env.warns.length, 1);
});

test('服务缺席：旧宿主没有 ctx.inject 也不抛错，标签照常', async () => {
  const doc = docWith({ 'ws-a': { tag: '甲' } });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  const region = regionApi(env);
  const sidebar = makeSidebar(env.document, [{ id: 'ws-a', name: '项目甲' }]);
  const context = createPinCtx({ hostDoc: doc, injectThrows: true });

  assert.doesNotThrow(() => install(env, region, context), 'inject 抛错不许拖垮工作区功能');
  assert.ok(sidebar.rows[0].querySelector('[data-lookout-ws-tag]'), '标签照常注入');
  assert.equal(env.warns.length, 1, '只 warn 一次');
});

test('失败：insertBefore 抛错只 warn + toast 一次，不崩', async () => {
  const doc = docWith({ 'ws-c': { pinned: true } });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  const region = regionApi(env);
  const { service, state } = createWorkspaceService([{ id: 'ws-a' }, { id: 'ws-b' }, { id: 'ws-c' }], { fail: true });
  const context = createPinCtx({ hostDoc: doc, service });
  const controller = install(env, region, context);

  env.scheduler.tick(1);
  await flush();
  assert.equal(state.calls.length, 1);
  assert.equal(env.warns.length, 1, '失败只 warn 一次');
  assert.match(String(toastText(env.document)), /置顶没有生效/, 'toast 只提示一次');
  assert.equal(env.document.querySelectorAll('[data-lookout-ws-toast]').length, 1);

  const before = state.calls.length;
  await controller.pinNow();
  await flush();
  assert.equal(state.calls.length, before + 1, '再次尝试仍只发一次调用');
  assert.equal(env.warns.length, 1, '不再追加 warn');
  assert.equal(env.document.querySelectorAll('[data-lookout-ws-toast]').length, 1, '不再追加 toast');

  // 回滚会再通知列表变化：必须退避，且最多尝试 3 次后彻底停手。
  env.scheduler.tick(10000);
  await flush();
  assert.equal(state.calls.length, 3, '连续失败 3 次后停止重试：' + state.calls.length);
  env.scheduler.tick(10000);
  await flush();
  assert.equal(state.calls.length, 3, '停手后不再产生任何调用');
  assert.equal(env.warns.length, 1, '全程只 warn 一次');
});

test('重入：自己的移动引发列表变化时调用次数有上界，不会死循环', async () => {
  const doc = docWith({ 'ws-b': { pinned: true }, 'ws-c': { pinned: true } });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  const region = regionApi(env);
  // 宿主接受了调用却从不真的移动，还在每次调用后通知列表变化（最坏情况）。
  const { service, state } = createWorkspaceService([{ id: 'ws-a' }, { id: 'ws-b' }, { id: 'ws-c' }], { frozen: true });
  const context = createPinCtx({ hostDoc: doc, service });
  install(env, region, context);

  env.scheduler.tick(1);
  await flush();
  assert.ok(state.calls.length >= 1, '至少尝试过一次');
  assert.ok(state.calls.length <= 2, '一轮计划只执行一次，不因自身通知重复：' + state.calls.length);

  env.scheduler.tick(5000);
  await flush();
  assert.ok(state.calls.length <= 2, '长时间运行后调用次数仍有上界：' + state.calls.length);
  assert.deepEqual(orderOf(state), ['ws-a', 'ws-b', 'ws-c'], '宿主没移动时保持原顺序');
});


