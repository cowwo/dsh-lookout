// 工作区标签 / 隐藏 / 设置表的离线测试。
//
// 这段代码在合并文件的胶水层里（不在三份逐字节锁定的原插件段内），只通过
// window.__ModuleLoader__ 注册的 apply() 暴露。这里按 //#region workspace rows
// 切出同一份字节，用可手动推进时钟的假 window/document 直接驱动
// wsRowsStart / wsRowsInstall，不联网、不启服务器。
//
// 覆盖：徽标注入与幂等 / 标签变化与清空 / 隐藏样式与当前会话保护 /
// 三重熔断与开关重置 / rail 与无行不计数 / RPC 失败回落本地缓存与保存失败只提示一次 /
// 设置表把改动写回偏好并在去抖后整份提交。
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

  insertBefore(node, reference) {
    if (node.parentNode !== null) node.parentNode.removeChild(node);
    const index = reference === null ? this.children.length : this.children.indexOf(reference);
    if (index < 0) return null;
    this.children.splice(index, 0, node);
    node.parentNode = this;
    return node;
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
    if (group.rowActions !== false) {
      const actions = document.createElement('span');
      actions.className = 'Rows_rowActions';
      const actionButton = document.createElement('button');
      actionButton.type = 'button';
      actions.appendChild(actionButton);
      row.appendChild(actions);
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

// ---------------------------------------------------------------- 用例 ----

test('徽标：有 tag 的工作区行注入一个徽标，重复扫描不重复，无 tag 的行没有', () => {
  const doc = docWith({ 'ws-a': { tag: '工作', color: 'blue' } });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  const region = regionApi(env);
  const sidebar = makeSidebar(env.document, [
    { id: 'ws-a', name: '项目甲' },
    { id: 'ws-b', name: '项目乙' },
  ]);
  const context = createCtx({ hostDoc: doc });
  install(env, region, context);

  const badge = sidebar.rows[0].querySelector('[data-lookout-ws-tag]');
  assert.ok(badge, 'ws-a 必须有徽标');
  assert.equal(badge.getAttribute('data-lookout-ws-tag'), 'ws-a');
  assert.equal(badge.getAttribute('data-color'), 'blue');
  assert.equal(badge.textContent, '工作');
  const dot = badge.querySelector('.dsh-lookout-ws-tag-dot');
  assert.ok(dot, '新建徽标必须带彩色圆点');
  assert.equal(badge.querySelectorAll('.dsh-lookout-ws-tag-dot').length, 1, '只有一个圆点');
  assert.equal(dot.getAttribute('aria-hidden'), 'true', '圆点只是装饰');
  assert.equal(badge.children[0], dot, '圆点在文字前面');
  assert.equal(badge.children[1], badge.querySelector('[data-lookout-ws-tag-text]'), '圆点后面紧跟文字节点');
  const textNode = badge.querySelector('[data-lookout-ws-tag-text]');
  assert.ok(textNode, '文本节点仍带 data-lookout-ws-tag-text');
  assert.equal(textNode.textContent, '工作');
  const row = sidebar.rows[0];
  const actions = row.querySelector('.Rows_rowActions');
  assert.ok(actions, '宿主行有 rowActions');
  assert.equal(badge.parentNode, row, '徽标是工作区行的直接子节点，不再塞进标题容器');
  assert.equal(row.children.indexOf(badge), row.children.indexOf(actions) - 1, '徽标紧邻 rowActions 之前，悬停时在「⋯」左边');
  assert.doesNotMatch(region.WS_ROWS_CSS, /:has\(> \.dsh-lookout-ws-tag\)/, '不再需要把标题容器改成横排');
  const css = region.WS_ROWS_CSS;
  assert.match(css, /\.dsh-lookout-ws-tag\{[^}]*margin-left:auto/, '徽标靠右对齐');
  assert.match(css, /\.dsh-lookout-ws-tag\{[^}]*flex:none/, '徽标不参与伸缩，名字先省略');
  assert.match(css, /\.dsh-lookout-ws-tag\{[^}]*gap:4px/, '圆点与文字之间留 4px');
  assert.match(css, /\.dsh-lookout-ws-tag\{[^}]*background:var\(--dsw-alias-bg-layer-2\)/, '灰底填充胶囊');
  assert.match(css, /\.dsh-lookout-ws-tag\{[^}]*color:var\(--dsw-alias-label-secondary\)/, '文字用宿主的次要文字色');
  assert.match(css, /\.dsh-lookout-ws-tag\{[^}]*border-radius:999px/, '整颗胶囊是圆角');
  assert.doesNotMatch(css, /\.dsh-lookout-ws-tag\{[^}]*border:1px solid/, '不再有描边');
  assert.doesNotMatch(css, /\.dsh-lookout-ws-tag\{[^}]*background:transparent/, '不再用透明底');
  assert.match(css, /\.dsh-lookout-ws-tag\{[^}]*max-width:9em/, '仍限制最大宽度');
  assert.match(css, /\.dsh-lookout-ws-tag\{[^}]*overflow:hidden/, '超长仍省略');
  assert.match(css, /\.dsh-lookout-ws-tag-dot\{[^}]*width:6px;height:6px;border-radius:50%/, '圆点是 6px 圆形');
  assert.match(css, /\.dsh-lookout-ws-tag-dot\{[^}]*background:#8b8d98/, '圆点默认灰色');
  const tagColors = {
    red: '#e5484d',
    orange: '#f76b15',
    yellow: '#d9a123',
    green: '#30a46c',
    cyan: '#00a2c7',
    blue: '#3e63dd',
    purple: '#8e4ec6',
    gray: '#8b8d98',
  };
  for (const [name, hex] of Object.entries(tagColors)) {
    assert.match(
      css,
      new RegExp('\\.dsh-lookout-ws-tag\\[data-color="' + name + '"\\] \\.dsh-lookout-ws-tag-dot\\{background:' + hex + ';\\}'),
      name + '：圆点着色为 ' + hex,
    );
  }
  assert.equal(sidebar.rows[1].querySelector('[data-lookout-ws-tag]'), null, 'ws-b 没有 tag，不许注入');

  // 宿主重渲染 → 观察器触发一轮：数量不增。
  env.scheduler.tick(300);
  env.observers[0].trigger();
  env.scheduler.tick(200);
  assert.equal(badgesIn(sidebar.root).length, 1, '重复扫描不许重复注入');

  // 宿主重渲染把徽标整个冲掉（React 重算行）→ 下一轮必须补回来。
  sidebar.rows[0].querySelector('[data-lookout-ws-tag]').remove();
  assert.equal(badgesIn(sidebar.root).length, 0);
  env.scheduler.tick(300);
  env.observers[0].trigger();
  env.scheduler.tick(200);
  assert.equal(badgesIn(sidebar.root).length, 1, '重渲染后必须补回徽标');
});

test('徽标：行没有 rowActions 时落在行末，仍然是行的直接子节点', () => {
  const doc = docWith({ 'ws-a': { tag: '工作', color: 'blue' } });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  const region = regionApi(env);
  const sidebar = makeSidebar(env.document, [{ id: 'ws-a', name: '项目甲', rowActions: false }]);
  const row = sidebar.rows[0];
  install(env, region, createCtx({ hostDoc: doc }));

  const badge = row.querySelector('[data-lookout-ws-tag]');
  assert.ok(badge, '没有 rowActions 也要有徽标');
  assert.equal(badge.parentNode, row, '徽标仍是行的直接子节点');
  assert.equal(row.children[row.children.length - 1], badge, '没有 rowActions 时追加到行末');
  assert.equal(badgesIn(sidebar.root).length, 1);
});

test('徽标：旧位置的徽标迁移到行内 rowActions 之前，不重建、不叠加', () => {
  const doc = docWith({ 'ws-a': { tag: '工作', color: 'blue' } });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  const region = regionApi(env);
  const sidebar = makeSidebar(env.document, [{ id: 'ws-a', name: '项目甲' }]);
  const row = sidebar.rows[0];
  const projectText = row.querySelector('.Rows_projectText');

  // 旧版本：徽标塞在 span.projectText 里、紧跟标题。
  const oldBadge = env.document.createElement('span');
  oldBadge.className = 'dsh-lookout-ws-tag';
  oldBadge.setAttribute('data-lookout-ws-tag', 'ws-a');
  oldBadge.setAttribute('data-color', 'blue');
  const oldDot = env.document.createElement('span');
  oldDot.className = 'dsh-lookout-ws-tag-dot';
  const oldText = env.document.createElement('span');
  oldText.className = 'dsh-lookout-ws-tag-text';
  oldText.setAttribute('data-lookout-ws-tag-text', '');
  oldText.textContent = '旧';
  oldBadge.appendChild(oldDot);
  oldBadge.appendChild(oldText);
  projectText.appendChild(oldBadge);

  install(env, region, createCtx({ hostDoc: doc }));

  const actions = row.querySelector('.Rows_rowActions');
  const badge = row.querySelector('[data-lookout-ws-tag]');
  assert.equal(badge, oldBadge, '旧节点要复用，不重新建一个');
  assert.equal(badge.parentNode, row, '徽标必须挪到行的直接子节点');
  assert.equal(row.children.indexOf(badge), row.children.indexOf(actions) - 1, '徽标在 rowActions 之前');
  assert.equal(badgesIn(sidebar.root).length, 1, '旧位置不许留下副本');
  assert.equal(badge.textContent, '工作', '迁移后照常更新文本');
  assert.equal(badge.querySelectorAll('.dsh-lookout-ws-tag-dot').length, 1, '旧圆点节点保留，照常显示，不因它抛错');

  // 行外的旧徽标（更极端的旧位置）也要收回到行内。
  sidebar.root.appendChild(badge);
  env.scheduler.tick(300);
  env.observers[0].trigger();
  env.scheduler.tick(200);
  assert.equal(badge.parentNode, row, '行外的旧徽标也要收回来');
  assert.equal(row.children.indexOf(badge), row.children.indexOf(actions) - 1, '收回后仍在 rowActions 之前');

  // 同一父节点但位置不对（例如跑到行首）也要纠正。
  row.insertBefore(badge, projectText);
  env.scheduler.tick(300);
  env.observers[0].trigger();
  env.scheduler.tick(200);
  assert.equal(row.children.indexOf(badge), row.children.indexOf(actions) - 1, '位置不对也要挪回 rowActions 之前');
  assert.equal(badgesIn(sidebar.root).length, 1, '纠正位置不许复制节点');
});

test('徽标：标签变化就地更新，清空后移除；颜色跟着变', () => {
  const doc = docWith({ 'ws-a': { tag: '旧', color: 'blue' } });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  const region = regionApi(env);
  const sidebar = makeSidebar(env.document, [{ id: 'ws-a', name: '项目甲' }]);
  const context = createCtx({ hostDoc: doc });
  const controller = install(env, region, context);

  const before = sidebar.rows[0].querySelector('[data-lookout-ws-tag]');
  assert.equal(before.textContent, '旧');

  controller.updateEntry('ws-a', { tag: '新名', color: 'red' });
  const after = sidebar.rows[0].querySelector('[data-lookout-ws-tag]');
  assert.equal(after, before, '同一个徽标节点就地更新，不许重建');
  assert.equal(after.textContent, '新名');
  assert.equal(after.getAttribute('data-color'), 'red');
  assert.equal(badgesIn(sidebar.root).length, 1);

  controller.updateEntry('ws-a', { tag: '' });
  assert.equal(badgesIn(sidebar.root).length, 0, 'tag 清空后徽标必须移除');
  assert.equal(controller.snapshot().workspaces['ws-a'], undefined, '空条目要被丢掉');
});

test('隐藏：为每个 hidden 工作区写一条整组隐藏规则，取消后立即恢复', () => {
  const doc = docWith({ 'ws-a': { hidden: true }, 'ws-b': { hidden: true } });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  const region = regionApi(env);
  makeSidebar(env.document, [{ id: 'ws-a' }, { id: 'ws-b' }]);
  const context = createCtx({ hostDoc: doc });
  const controller = install(env, region, context);

  const css = hideStyle(env.document).textContent;
  assert.match(css, /workspace:ws-a/, 'ws-a 必须有隐藏规则');
  assert.match(css, /workspace:ws-b/, 'ws-b 必须有隐藏规则');
  assert.match(css, /display:none!important/, '整组隐藏');
  assert.match(css, /div:has\(/, '用 :has() 命中 groupSection，不碰 React 的树');
  assert.match(css, />span>/, '宿主 HoverCard 把工作区行包在 span 里，规则必须覆盖这种形状');

  controller.updateEntry('ws-a', { hidden: false });
  const after = hideStyle(env.document).textContent;
  assert.doesNotMatch(after, /workspace:ws-a/, '取消隐藏后 ws-a 的规则必须消失');
  assert.match(after, /workspace:ws-b/, 'ws-b 仍然隐藏');
});

test('隐藏：当前选中会话所在的工作区永不被隐藏；其它组照常隐藏', () => {
  const doc = docWith({ 'ws-a': { hidden: true }, 'ws-b': { hidden: true } });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  const region = regionApi(env);
  makeSidebar(env.document, [
    { id: 'ws-a' },
    // 宿主形态：行被 HoverCard 的 span 包着。
    { id: 'ws-b', sessions: [{ id: 's-1', selected: true }] },
    // 未分组桶形态：行直接挂在 groupSection 下。
    { id: 'ws-c', wrapped: false, sessions: [{ id: 's-2', selected: true }] },
  ]);
  const context = createCtx({ hostDoc: docWith({ 'ws-a': { hidden: true }, 'ws-b': { hidden: true }, 'ws-c': { hidden: true } }) });
  install(env, region, context);

  const css = hideStyle(env.document).textContent;
  assert.match(css, /workspace:ws-a/, '不含当前会话的 ws-a 照常隐藏');
  assert.doesNotMatch(css, /workspace:ws-b/, '当前会话所在的 ws-b 不许隐藏（HoverCard 包裹形态）');
  assert.doesNotMatch(css, /workspace:ws-c/, '当前会话所在的 ws-c 不许隐藏（直接子节点形态）');
});

test('隐藏：未分组桶里的当前会话不该让隐藏整体失效', () => {
  const doc = docWith({ 'ws-a': { hidden: true } });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  const region = regionApi(env);
  makeSidebar(env.document, [
    { id: 'ws-a' },
    // 未分组桶：group.key 是空串，data-row-key 就是 "workspace:"。
    { id: '', wrapped: false, sessions: [{ id: 's-1', selected: true }] },
  ]);
  const context = createCtx({ hostDoc: doc });
  install(env, region, context);

  assert.match(hideStyle(env.document).textContent, /workspace:ws-a/,
    '当前会话在未分组桶里时，别的真实工作区照常隐藏');
});

test('隐藏：折叠组的 folderActive 标记也算当前会话保护', () => {
  const doc = docWith({ 'ws-a': { hidden: true }, 'ws-b': { hidden: true } });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  const region = regionApi(env);
  makeSidebar(env.document, [
    { id: 'ws-a' },
    { id: 'ws-b', active: true },
  ]);
  const context = createCtx({ hostDoc: doc });
  install(env, region, context);

  const css = hideStyle(env.document).textContent;
  assert.match(css, /workspace:ws-a/);
  assert.doesNotMatch(css, /workspace:ws-b/, '折叠组的当前会话靠 folderActive 保护');
});

test('隐藏：官方 uiWorkspace 指出的工作区及其父工作区也受保护', () => {
  const doc = docWith({ 'ws-child': { hidden: true }, 'ws-parent': { hidden: true } });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  const region = regionApi(env);
  makeSidebar(env.document, [{ id: 'ws-parent' }, { id: 'ws-child' }]);
  const items = [
    { workspaceId: 'ws-parent', path: '/root/work', sessionIds: [], title: 'parent' },
    { workspaceId: 'ws-child', path: '/root/work/sub', sessionIds: ['s-9'], title: 'child' },
  ];
  const uiWorkspace = {
    selection: { getSnapshot: () => ({ sessionId: 's-9' }) },
    workspaces: { list: { getSnapshot: () => ({ items }) } },
  };
  const context = createCtx({ hostDoc: doc, uiWorkspace });
  install(env, region, context);

  const css = hideStyle(env.document).textContent;
  assert.doesNotMatch(css, /workspace:ws-child/, '当前会话所在工作区必须保护');
  assert.doesNotMatch(css, /workspace:ws-parent/, '它的父工作区也必须保护');
});

test('熔断：连续 3 轮找不到落点即停止，只提示一次；开关可重置', () => {
  const doc = docWith({ 'ws-a': { tag: '工作' } });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  const region = regionApi(env);
  const sidebar = makeSidebar(env.document, [{ id: 'ws-a', title: false }]);
  const context = createCtx({ hostDoc: doc });
  const controller = install(env, region, context);

  assert.equal(toastText(env.document), null, '第一轮失败不打扰用户');
  assert.equal(env.warns.length, 1, '注入失败只 console.warn 一次');

  env.scheduler.tick(300);
  env.observers[0].trigger();
  env.scheduler.tick(200);
  assert.equal(toastText(env.document), null, '第二轮失败仍不打扰');

  env.scheduler.tick(300);
  env.observers[0].trigger();
  env.scheduler.tick(200);
  assert.match(String(toastText(env.document)), /工作区标签连续注入失败/, '第三轮提示一次');
  assert.equal(env.document.querySelectorAll('[data-lookout-ws-toast]').length, 1);
  assert.equal(env.observers[0].disconnected, true, '熔断后必须停止观察');

  env.scheduler.tick(300);
  env.observers[0].trigger();
  env.scheduler.tick(1000);
  assert.equal(env.document.querySelectorAll('[data-lookout-ws-toast]').length, 1, '不许重复提示');
  assert.equal(env.warns.length, 1, '也不许重复 warn');

  // 「不再提示」持久化。
  const dismiss = env.document.querySelector('[data-lookout-ws-toast]').querySelector('button');
  assert.equal(dismiss.textContent, region.WS_ROWS_ZH.dismiss);
  dismiss.click();
  assert.equal(env.storage.get(DISMISSED_KEY), '1');
  assert.equal(env.document.querySelectorAll('[data-lookout-ws-toast]').length, 0);

  // 设置里的开关重置熔断：补上标题落点后重新打开就能补回来。
  const projectText = env.document.createElement('span');
  projectText.className = 'Rows_projectText';
  const title = env.document.createElement('span');
  title.className = 'Rows_title';
  title.textContent = '项目甲';
  projectText.appendChild(title);
  sidebar.rows[0].appendChild(projectText);

  controller.setEnabled(true);
  assert.equal(badgesIn(sidebar.root).length, 1, '开关重置后必须重新注入');
});

test('样式：同名 style 已存在但内容过时，ensureStyleTag 就地刷新为新 CSS', () => {
  const doc = docWith({});
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(doc) } });
  // 模拟插件热更新：旧版本留下的 <style> 还在，但内容已经过时。
  const stale = env.document.createElement('style');
  stale.setAttribute('data-plugin', 'dsh-lookout');
  stale.setAttribute('data-plugin-css', 'lookout-workspace-rows');
  stale.textContent = '.dsh-lookout-ws-tag{display:none;}';
  env.document.head.appendChild(stale);

  const region = regionApi(env);
  makeSidebar(env.document, [{ id: 'ws-a' }]);
  install(env, region, createCtx({ hostDoc: doc }));

  const tags = env.document.querySelectorAll('style[data-plugin-css="lookout-workspace-rows"]');
  assert.equal(tags.length, 1, '不许重复插入同名 style');
  assert.equal(tags[0], stale, '复用已有节点，不新建');
  assert.equal(tags[0].textContent, region.WS_ROWS_CSS, '过时内容必须被新 CSS 覆盖');
});

test('locale：用自己的命名空间，不与文件行菜单抢 dsh-lookout（同名重复注册会抛）', () => {
  const registered = new Map();
  const locale = {
    register(ns, dicts) {
      const map = registered.get(ns) ?? new Map();
      for (const key of Object.keys(dicts)) {
        if (map.has(key)) throw new Error('locale namespace "' + ns + '" already has locale "' + key + '"');
      }
      for (const [key, value] of Object.entries(dicts)) map.set(key, value);
      registered.set(ns, map);
      return () => {};
    },
    bind(ns) { return (key) => registered.get(ns)?.get('zh')?.[key] ?? key; },
  };
  // 文件行菜单（先启动）已经占了 dsh-lookout 这个命名空间的 zh/en。
  locale.register('dsh-lookout', { zh: { nav: '文件行' }, en: { nav: 'File row' } });

  const env = createEnv({ storage: {} });
  const region = regionApi(env);
  makeSidebar(env.document, [{ id: 'ws-a' }]);
  const context = createCtx({ locale });
  assert.doesNotThrow(() => install(env, region, context));

  const own = registered.get(region.WS_ROWS_NS);
  assert.ok(own, '必须注册到自己的命名空间（否则 register 会抛、字典会丢）');
  assert.notEqual(region.WS_ROWS_NS, 'dsh-lookout');
  assert.equal(own.get('zh').nav, '工作区管理');
  assert.equal(own.get('en').nav, 'Workspaces');

  const registration = context.registrations.find((item) => item.def.id === 'lookout-workspaces');
  assert.equal(registration.def.label(), '工作区管理', '设置页标题走自己的字典');
});

test('rail / 无行 / 无容器：不算失败、不显示、不提示', () => {
  // 侧栏容器在，但一个工作区行都没有（rail 或空列表）。
  const emptyEnv = createEnv({ storage: {} });
  const emptyRegion = regionApi(emptyEnv);
  const emptySidebar = makeSidebar(emptyEnv.document, []);
  const emptyContext = createCtx();
  install(emptyEnv, emptyRegion, emptyContext);
  emptyEnv.scheduler.tick(5000);
  if (emptyEnv.observers.length > 0) {
    emptyEnv.observers[0].trigger();
    emptyEnv.scheduler.tick(500);
  }
  assert.equal(emptyEnv.warns.length, 0, '没有行不算失败');
  assert.equal(emptyEnv.document.querySelectorAll('[data-lookout-ws-toast]').length, 0);
  assert.equal(badgesIn(emptySidebar.root).length, 0);

  // 侧栏容器根本还没挂载：只轮询，不失败。
  const lateEnv = createEnv({ storage: {} });
  const lateRegion = regionApi(lateEnv);
  install(lateEnv, lateRegion, createCtx());
  lateEnv.scheduler.tick(5000);
  assert.equal(lateEnv.observers.length, 0, '没有容器不该建观察器');
  assert.equal(lateEnv.warns.length, 0);
  assert.equal(lateEnv.document.querySelectorAll('[data-lookout-ws-toast]').length, 0);
});

test('RPC：启动拉取失败时用本地缓存；拉取成功时采用宿主文档', async () => {
  const cached = docWith({ 'ws-a': { tag: '缓存', color: 'green' } });
  const offlineEnv = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(cached) } });
  const offlineRegion = regionApi(offlineEnv);
  const offlineBar = makeSidebar(offlineEnv.document, [{ id: 'ws-a' }, { id: 'ws-b' }]);
  install(offlineEnv, offlineRegion, createCtx({
    rpc: async () => { throw new Error('offline'); },
  }));
  await flush();
  const cachedBadge = offlineBar.rows[0].querySelector('[data-lookout-ws-tag]');
  assert.ok(cachedBadge, 'RPC 不可用时本地缓存必须顶上');
  assert.equal(cachedBadge.textContent, '缓存');
  assert.equal(offlineEnv.document.querySelectorAll('[data-lookout-ws-toast]').length, 0, '拉取失败不该刷提示');

  const host = docWith({ 'ws-b': { tag: '宿主', color: 'purple' } });
  const onlineEnv = createEnv({ storage: {} });
  const onlineRegion = regionApi(onlineEnv);
  const onlineBar = makeSidebar(onlineEnv.document, [{ id: 'ws-a' }, { id: 'ws-b' }]);
  install(onlineEnv, onlineRegion, createCtx({ hostDoc: host }));
  await flush();
  assert.equal(onlineBar.rows[1].querySelector('[data-lookout-ws-tag]').textContent, '宿主');
  assert.equal(JSON.parse(onlineEnv.storage.get(LOCAL_KEY)).workspaces['ws-b'].tag, '宿主', '采用后要写回本地缓存');
});

test('RPC：保存失败只提示一次，不随每次改动刷屏', async () => {
  const env = createEnv({ storage: {} });
  const region = regionApi(env);
  makeSidebar(env.document, [{ id: 'ws-a' }]);
  const context = createCtx({
    rpc: async (_path, method) => (method === 'iconCustom/getWorkspacePrefs'
      ? { ok: true, value: { version: 1, workspaces: {} } }
      : { ok: false, error: { message: 'denied' } }),
  });
  const controller = install(env, region, context);

  controller.updateEntry('ws-a', { tag: '一' });
  env.scheduler.tick(300);
  await flush();
  assert.equal(env.document.querySelectorAll('[data-lookout-ws-toast]').length, 1, '失败提示一次');
  assert.equal(env.warns.length, 1, '也只 warn 一次');

  controller.updateEntry('ws-a', { tag: '二' });
  env.scheduler.tick(300);
  await flush();
  assert.equal(env.document.querySelectorAll('[data-lookout-ws-toast]').length, 1, '后续失败不许再弹');
  assert.equal(env.warns.length, 1);

  const sent = context.rpcCalls.filter((call) => call[1] === 'iconCustom/setWorkspacePrefs');
  assert.equal(sent[sent.length - 1][2].args.request.workspaces['ws-a'].tag, '二', '整份文档提交');
  assert.equal(JSON.parse(env.storage.get(LOCAL_KEY)).workspaces['ws-a'].tag, '二', '本地缓存始终先落地');
});

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

test('设置表：标签/颜色/置顶/隐藏改动写入偏好，并在去抖后整份提交给宿主', async () => {
  const initial = docWith({
    'ws-a': { tag: '甲', color: 'blue' },
    'ws-z': { tag: '失效' },
  });
  const env = createEnv({ storage: { [LOCAL_KEY]: JSON.stringify(initial) } });
  const region = regionApi(env);
  makeSidebar(env.document, [{ id: 'ws-a' }, { id: 'ws-b' }]);
  const context = createCtx({ hostDoc: initial });
  const controller = install(env, region, context);

  const registration = context.registrations.find((item) => item.def.id === 'lookout-workspaces');
  assert.ok(registration, '必须注册 settings.section');
  assert.equal(registration.def.order, 56);
  assert.equal(typeof registration.def.inject, 'function');

  const items = [
    { workspaceId: 'ws-a', title: '项目甲' },
    { workspaceId: 'ws-b', title: '项目乙' },
  ];
  const wrapper = registration.component({
    t: (key) => key,
    useWorkspaces: (selector) => selector({ items }),
  });
  const tree = wrapper.type(wrapper.props);
  assert.ok(findElements(tree, (node) => node.props !== undefined && node.props['data-lookout-ws-table'] !== undefined).length === 1, '必须有表格');

  const tagInput = fieldOf(tree, 'tag', 'ws-a');
  assert.ok(tagInput, '每行都有标签输入');
  assert.equal(tagInput.props.value, '甲');
  tagInput.props.onChange({ target: { value: '新标签' } });
  assert.equal(controller.snapshot().workspaces['ws-a'].tag, '新标签');

  fieldOf(tree, 'color', 'ws-a').props.onChange({ target: { value: 'purple' } });
  assert.equal(controller.snapshot().workspaces['ws-a'].color, 'purple');

  fieldOf(tree, 'pinned', 'ws-a').props.onChange({ target: { checked: true } });
  assert.equal(controller.snapshot().workspaces['ws-a'].pinned, true, '置顶只写 prefs');

  fieldOf(tree, 'hidden', 'ws-b').props.onChange({ target: { checked: true } });
  assert.equal(controller.snapshot().workspaces['ws-b'].hidden, true);
  assert.match(hideStyle(env.document).textContent, /workspace:ws-b/);

  // 标签最多 6 个字符，多余的截掉。
  fieldOf(tree, 'tag', 'ws-b').props.onChange({ target: { value: '一二三四五六七八' } });
  assert.equal(controller.snapshot().workspaces['ws-b'].tag, '一二三四五六');

  // 清理失效项：ws-z 不在实时列表里，必须被清掉。
  const cleanup = findElements(tree, (node) => node.props !== undefined && node.props['data-lookout-ws-cleanup'] !== undefined)[0];
  assert.ok(cleanup, '必须有「清理失效项」按钮');
  cleanup.props.onClick();
  assert.equal(controller.snapshot().workspaces['ws-z'], undefined, '失效项必须清掉');
  assert.notEqual(controller.snapshot().workspaces['ws-a'], undefined, '在用项不许误删');

  env.scheduler.tick(300);
  await flush();
  const sent = context.rpcCalls.filter((call) => call[1] === 'iconCustom/setWorkspacePrefs');
  assert.equal(sent.length, 1, '连续改动合并成一次整份提交');
  const request = sent[0][2].args.request;
  assert.equal(request.version, 1);
  assert.equal(request.workspaces['ws-a'].tag, '新标签');
  assert.equal(request.workspaces['ws-b'].hidden, true);
  assert.equal(request.workspaces['ws-z'], undefined);
  assert.equal(JSON.parse(env.storage.get(LOCAL_KEY)).workspaces['ws-a'].color, 'purple', '本地缓存同步更新');
});

test('整份 bundle：胶水层 apply() 也挂上工作区标签功能（不依赖三份原插件段）', () => {
  const loads = [];
  const sandbox = {};
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.console = { warn() {} };
  sandbox.document = {
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ dataset: {}, style: {}, textContent: '', setAttribute() {}, appendChild() {} }),
    createElementNS: () => ({ dataset: {}, style: {}, textContent: '', setAttribute() {}, appendChild() {} }),
    head: { appendChild() {} },
    body: { appendChild() {} },
    addEventListener() {},
    removeEventListener() {},
  };
  sandbox.navigator = {};
  sandbox.localStorage = { getItem: () => null, setItem() {} };
  sandbox.setTimeout = () => 1;
  sandbox.clearTimeout = () => {};
  sandbox.setInterval = () => 1;
  sandbox.clearInterval = () => {};
  sandbox.fetch = async () => ({ ok: true, status: 200 });
  sandbox.URL = { createObjectURL: () => 'blob:x', revokeObjectURL() {} };
  sandbox.MutationObserver = class { observe() {} disconnect() {} };
  sandbox.__ModuleLoader__ = { load: (definition) => { loads.push(definition); } };

  vm.runInNewContext(SOURCE, sandbox, { filename: CLIENT_PATH });
  assert.equal(loads.length, 1);
  const mod = loads[0].factory(() => ({}));
  const effects = [];
  const ctx = {
    inject() { throw new Error('三份原插件段不需要真的启动'); },
    effect(fn, label) { effects.push({ fn, label }); },
  };
  try { mod.apply(ctx); } catch { /* 三份原插件段在这里被主动打断，不影响断言 */ }
  assert.equal(effects.some((item) => item.label === 'dsh-lookout: workspace rows'), true,
    'apply() 必须在跑三段原插件之前挂上工作区标签');
});
