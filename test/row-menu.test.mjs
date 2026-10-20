// 文件树行「⋯」菜单（client/client.js 的 file row menu region）的离线测试。
//
// 这一段代码在合并文件的胶水层里，不在三份逐字节锁定的原插件段内，而且它只通过
// window.__ModuleLoader__ 注册的 apply() 间接暴露。这里按 //#region file row menu
// 标记切出同一份字节，用一个能手动推进时钟的假 window/document 执行，直接驱动
// rowMenuStart / rowMenuInstall。不联网、不启服务器、不真等 1.5 秒。
//
// 覆盖：注入 / 清理 / 菜单 / 复制 / 下载（含错误映射）/ 三重熔断与开关 / 健壮性 /
// CSS token 白名单；最后再加载整份 bundle，确认胶水层 apply() 确实先启动本功能。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const CLIENT_PATH = fileURLToPath(new URL('../client/client.js', import.meta.url));
const SOURCE = readFileSync(CLIENT_PATH, 'utf8');

/** 文件行菜单 region 的正文（含全部常量与函数，不含外层胶水）。 */
const REGION_START = SOURCE.indexOf('//#region file row menu');
if (REGION_START < 0) throw new Error('client.js 里找不到 file row menu region');
const REGION_BODY_START = SOURCE.indexOf('\n', REGION_START) + 1;
const REGION_END = SOURCE.indexOf('//#endregion', REGION_BODY_START);
if (REGION_END < 0) throw new Error('file row menu region 没有 //#endregion');
const REGION = SOURCE.slice(REGION_BODY_START, REGION_END);

const PRIMITIVES = '@deepseek-ai/dsh-client-ui-primitives';
const ENABLED_KEY = 'dsh-lookout:file-row-menu:enabled';
const DISMISSED_KEY = 'dsh-lookout:file-row-menu:gave-up-dismissed';
const ZH = {
  copyPath: '复制路径',
  download: '下载',
  folderUnsupported: '文件夹暂不支持',
  givingUp: '文件行「⋯」菜单连续注入失败，已自动停止；文件树本身不受影响。',
  dismiss: '不再提示',
  err401: '登录已过期，请刷新页面重新登录',
  err403: '没有权限读取这个文件',
  err404: '文件不存在或已被删除',
  err413: '文件超过 20MB，暂不支持下载',
  errNetwork: '下载失败，请检查连接',
};

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
    // 宿主行与行按钮的真实初值都是空串；先建出来，还原断言才能比 "original"。
    this.style = { position: '', paddingRight: '' };
    this.className = '';
    this.title = '';
    this.value = '';
    this.type = '';
    this.href = '';
    this.download = '';
    this.rel = '';
    this._text = '';
    this._listeners = new Map();
  }

  get firstChild() { return this.children[0] ?? null; }

  get isConnected() {
    let node = this;
    while (node !== null && node !== undefined) {
      if (node === this.ownerDocument.documentElement) return true;
      node = node.parentNode;
    }
    return false;
  }

  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(value) { if (value === true) this.setAttribute('disabled', ''); else this.removeAttribute('disabled'); }

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

  contains(node) {
    let current = node;
    while (current !== null && current !== undefined) {
      if (current === this) return true;
      current = current.parentNode;
    }
    return false;
  }

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

  click() {
    if (this.disabled) return;
    this.dispatchEvent({ type: 'click' });
  }

  focus() { this.ownerDocument.activeElement = this; }
  select() {}
  getBoundingClientRect() { return { width: 176, height: 80, top: 0, left: 0, right: 176, bottom: 80 }; }
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
    this.execCommand = undefined;
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
    if (typeof event.stopPropagation !== 'function') event.stopPropagation = () => { event._stopped = true; };
    const list = this._listeners.get(event.type);
    if (list !== undefined) for (const listener of [...list]) listener.call(this, event);
    return event.defaultPrevented !== true;
  }
}

// ------------------------------------------------------------ 假环境 / 时钟 ----

/** 手动推进的时钟：所有 setTimeout / setInterval / Date.now 都走它，测试不用真等。 */
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
  const objectUrls = [];
  const revokedUrls = [];
  const fetchCalls = [];
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
  let blobSequence = 0;
  let fetchImpl = options.fetch ?? (async () => ({ ok: true, status: 200, blob: async () => ({ size: 1 }) }));
  const window = {
    _listeners: new Map(),
    addEventListener(type, listener) {
      if (!this._listeners.has(type)) this._listeners.set(type, []);
      this._listeners.get(type).push(listener);
    },
    removeEventListener(type, listener) {
      const list = this._listeners.get(type);
      if (list !== undefined) this._listeners.set(type, list.filter((item) => item !== listener));
    },
    setTimeout: scheduler.setTimeout,
    clearTimeout: scheduler.clearTimeout,
    setInterval: scheduler.setInterval,
    clearInterval: scheduler.clearInterval,
    localStorage: {
      getItem: (key) => (storage.has(key) ? storage.get(key) : null),
      setItem: (key, value) => { storage.set(key, String(value)); },
      removeItem: (key) => { storage.delete(key); },
    },
    fetch: (...args) => { fetchCalls.push({ url: args[0], init: args[1] }); return fetchImpl(...args); },
    URL: {
      createObjectURL(blob) { const url = 'blob:fake-' + (++blobSequence); objectUrls.push({ url, blob }); return url; },
      revokeObjectURL(url) { revokedUrls.push(url); },
    },
    MutationObserver: observerClass,
    getComputedStyle: (element) => ({ position: element.style.position || 'static' }),
    innerWidth: 1200,
    innerHeight: 800,
  };
  return {
    scheduler, document, window, observers, created, warns, fetchCalls, objectUrls, revokedUrls, storage,
    navigator: options.navigator ?? {},
    console: { warn: (...args) => { warns.push(args.map(String).join(' ')); } },
    Date: { now: () => scheduler.now() },
    setFetch: (impl) => { fetchImpl = impl; },
  };
}

/** 从 region 建出可调用的入口；每次调用都是一套新的闭包。 */
function regionApi(env) {
  const build = new Function(
    'window', 'document', 'navigator', 'console', 'Date',
    '"use strict";\n' + REGION + '\nreturn { rowMenuStart, rowMenuInstall, ROW_MENU_CSS, ROW_MENU_ZH, ROW_MENU_EN };',
  );
  return build(env.window, env.document, env.navigator, env.console, env.Date);
}

/** 通过公开入口 rowMenuStart 安装，并从 ctx.effect 里取回 disposer。 */
function install(env, options = {}) {
  const api = regionApi(env);
  const effects = [];
  const ctx = options.ctx ?? {
    effect(fn, label) { effects.push({ fn, label }); },
  };
  const requireFn = options.require ?? ((id) => {
    if (id === 'react') return { createElement() {}, useState() {} };
    if (id === PRIMITIVES) return {};
    throw new Error('未预期的 require：' + id);
  });
  api.rowMenuStart(ctx, requireFn);
  const effect = effects.find((item) => item.label === 'dsh-lookout: file row menu');
  assert.ok(effect, 'rowMenuStart 必须把 disposer 交给 ctx.effect');
  const dispose = effect.fn();
  assert.equal(typeof dispose, 'function');
  return { api, dispose, effects };
}

/** 建 [data-files-body] 与若干行；默认每行带一个宿主行按钮。 */
function makeRows(document, specs) {
  const body = document.createElement('div');
  body.setAttribute('data-files-body', '');
  document.body.appendChild(body);
  const rows = specs.map((spec) => {
    const row = document.createElement('li');
    row.setAttribute('data-files-entry', spec.entry);
    row.setAttribute('data-files-path', spec.path);
    if (spec.button !== false) {
      const button = document.createElement('button');
      button.className = 'row';
      button.textContent = spec.label ?? spec.path.split('/').pop();
      if (spec.paddingRight !== false) button.style.paddingRight = '8px';
      row.appendChild(button);
    }
    body.appendChild(row);
    return row;
  });
  return { body, rows };
}

function menuButton(row) { return row.querySelector('[data-lookout-rowmenu]'); }

function openMenu(row) {
  const button = menuButton(row);
  assert.ok(button, '该行必须先有 ⋯ 按钮');
  button.click();
  return button;
}

function popupOf(document) { return document.querySelector('[data-lookout-rowmenu-pop]'); }

function itemOf(popup, index) { return popup.querySelectorAll('[role="menuitem"]')[index]; }

function toastText(document) {
  const toast = document.querySelector('[data-lookout-toast]');
  if (toast === null) return null;
  const text = toast.querySelector('.dsh-lookout-toast-text');
  return text === null ? toast.textContent : text.textContent;
}

async function flush() {
  for (let i = 0; i < 10; i++) await Promise.resolve();
}

/** 典型五行：两个目录、两个文件、一个 other。 */
const FIVE_ROWS = [
  { entry: 'directory', path: '/root/work/src', label: 'src' },
  { entry: 'directory', path: '/root/work/docs', label: 'docs' },
  { entry: 'file', path: '/root/work/README.md', label: 'README.md' },
  { entry: 'file', path: '/root/work/报告 1.pdf', label: '报告 1.pdf' },
  { entry: 'other', path: '/root/work/__other__', label: 'other' },
];

// ---------------------------------------------------------------- 用例 ----

test('注入：file/directory 行各有一个 ⋯，other 行没有；重复扫描不重复，样式已让位', () => {
  const env = createEnv();
  const { rows } = makeRows(env.document, FIVE_ROWS);
  const { dispose } = install(env);
  env.scheduler.tick(200);

  assert.equal(env.document.querySelectorAll('[data-lookout-rowmenu]').length, 4, '只该注入 4 个（2 目录 + 2 文件）');
  for (const row of rows.slice(0, 4)) {
    assert.equal(row.querySelectorAll('[data-lookout-rowmenu]').length, 1, '每行有且仅有 1 个');
    assert.equal(row.style.position, 'relative', 'li 要成为 ⋯ 的定位参照');
    assert.equal(row.querySelector('button.row').style.paddingRight, '32px', '行按钮右侧要给 ⋯ 让位');
  }
  assert.equal(rows[4].querySelectorAll('[data-lookout-rowmenu]').length, 0, 'other 行不许注入');
  assert.equal(rows[4].querySelector('button.row').style.paddingRight, '8px', 'other 行的样式不许被改');

  // 宿主重渲染 → 观察器触发第二轮扫描：数量不增。
  env.scheduler.tick(300);
  env.observers[0].trigger();
  env.scheduler.tick(200);
  assert.equal(env.document.querySelectorAll('[data-lookout-rowmenu]').length, 4, '重复扫描不许重复注入');
  dispose();
});

test('清理：dispose 后按钮全移除、inline style 还原、观察器断开、浮层与 toast 移除', async () => {
  const env = createEnv({ fetch: async () => ({ ok: false, status: 500, blob: async () => ({}) }) });
  const { rows } = makeRows(env.document, FIVE_ROWS);
  const { dispose } = install(env);
  env.scheduler.tick(200);

  openMenu(rows[2]);
  env.scheduler.tick(0);
  assert.ok(popupOf(env.document), '先确认浮层已挂上');
  itemOf(popupOf(env.document), 1).click();
  await flush();
  assert.ok(toastText(env.document), '先确认 toast 已出现');

  dispose();

  assert.equal(env.document.querySelectorAll('[data-lookout-rowmenu]').length, 0, '所有 ⋯ 按钮必须移除');
  assert.equal(env.document.querySelectorAll('[data-lookout-rowmenu-pop]').length, 0, '浮层必须移除');
  assert.equal(env.document.querySelectorAll('[data-lookout-toast]').length, 0, 'toast 必须移除');
  assert.equal(env.document.querySelector('style[data-plugin-css="lookout-row-menu"]'), null, '样式标签必须移除');
  assert.equal(rows[0].style.position, '', 'li 的 inline position 必须还原');
  assert.equal(rows[2].querySelector('button.row').style.paddingRight, '8px', '行按钮的 inline paddingRight 必须还原');
  assert.equal(env.observers[0].disconnected, true, '观察器必须断开');
  // 再触发也不该复活。
  env.scheduler.tick(1000);
  assert.equal(env.document.querySelectorAll('[data-lookout-rowmenu]').length, 0);
});

test('菜单：点 ⋯ 出现 role=menu 两项；文件行两项可用，文件夹行下载置灰并说明；外部点击与 Esc 关闭', () => {
  const env = createEnv();
  const { rows } = makeRows(env.document, FIVE_ROWS);
  const { dispose } = install(env);
  env.scheduler.tick(200);

  const fileRow = rows[2];
  const anchor = openMenu(fileRow);
  env.scheduler.tick(0);
  const fileMenu = popupOf(env.document);
  assert.ok(fileMenu, '点 ⋯ 必须出现浮层');
  assert.equal(fileMenu.getAttribute('role'), 'menu');
  const fileItems = fileMenu.querySelectorAll('[role="menuitem"]');
  assert.equal(fileItems.length, 2, '菜单恰好两项');
  assert.equal(fileItems[0].textContent, ZH.copyPath);
  assert.equal(fileItems[1].textContent, ZH.download);
  assert.equal(fileItems[0].getAttribute('aria-disabled'), null, '文件行复制可用');
  assert.equal(fileItems[1].getAttribute('aria-disabled'), 'false', '文件行下载可用');
  assert.equal(anchor.getAttribute('aria-expanded'), 'true');

  // 点外部关闭。
  env.document.dispatchEvent({ type: 'pointerdown', target: env.document.body });
  assert.equal(popupOf(env.document), null, '点外部必须关闭');
  assert.equal(anchor.getAttribute('aria-expanded'), 'false');

  // Esc 关闭并把焦点还给 ⋯。
  openMenu(fileRow);
  env.scheduler.tick(0);
  env.document.dispatchEvent({ type: 'keydown', key: 'Escape', target: env.document.body });
  assert.equal(popupOf(env.document), null, 'Esc 必须关闭');
  assert.equal(env.document.activeElement, anchor, 'Esc 后焦点回到 ⋯');

  // 文件夹行：下载不可用 + 说明文字。
  openMenu(rows[0]);
  env.scheduler.tick(0);
  const folderMenu = popupOf(env.document);
  const folderItems = folderMenu.querySelectorAll('[role="menuitem"]');
  assert.equal(folderItems.length, 2);
  assert.equal(folderItems[0].getAttribute('aria-disabled'), null, '文件夹仍可复制路径');
  assert.equal(folderItems[1].getAttribute('aria-disabled'), 'true', '文件夹下载必须置灰');
  assert.equal(folderItems[1].disabled, true);
  assert.match(folderMenu.textContent, new RegExp(ZH.folderUnsupported), '菜单里要说明文件夹暂不支持');
  dispose();
});

test('复制：writeClipboard 收到 data-files-path 原文；✓ 反馈 1.5 秒后还原（假时钟）', async () => {
  const written = [];
  const env = createEnv();
  const { rows } = makeRows(env.document, FIVE_ROWS);
  const { dispose } = install(env, {
    require: (id) => {
      if (id === PRIMITIVES) return { writeClipboard: async (text) => { written.push(text); return true; } };
      if (id === 'react') return { createElement() {}, useState() {} };
      throw new Error('未预期的 require：' + id);
    },
  });
  env.scheduler.tick(200);

  const path = rows[3].getAttribute('data-files-path');
  const anchor = openMenu(rows[3]);
  env.scheduler.tick(0);
  itemOf(popupOf(env.document), 0).click();
  await flush();

  assert.deepEqual(written, [path], '必须原样复制 data-files-path（不重拼、不改空格）');
  assert.equal(anchor.hasAttribute('data-lookout-copied'), true, '成功反馈用 data-lookout-copied 标记');
  assert.equal(anchor.firstChild.tagName, 'SVG');
  assert.equal(anchor.firstChild.querySelectorAll('path').length, 1, '✓ 图标（path）');
  assert.equal(toastText(env.document), null, '复制成功不该弹错误 toast');

  env.scheduler.tick(1499);
  assert.equal(anchor.hasAttribute('data-lookout-copied'), true, '1.5 秒内保持 ✓');
  env.scheduler.tick(1);
  assert.equal(anchor.hasAttribute('data-lookout-copied'), false, '1.5 秒后还原');
  assert.equal(anchor.firstChild.querySelectorAll('circle').length, 3, '还原成 ⋯ 图标（3 个圆点）');
  dispose();
});

test('下载：请求 api/file?path=编码后绝对路径 且 same-origin；成功创建 a[download]，文件名取路径末段', async () => {
  const env = createEnv();
  const { rows } = makeRows(env.document, FIVE_ROWS);
  const { dispose } = install(env);
  env.scheduler.tick(200);

  const path = rows[3].getAttribute('data-files-path');
  openMenu(rows[3]);
  env.scheduler.tick(0);
  itemOf(popupOf(env.document), 1).click();
  await flush();

  assert.equal(env.fetchCalls.length, 1, '只发一次请求');
  assert.equal(env.fetchCalls[0].url, 'api/file?path=' + encodeURIComponent(path));
  assert.equal(env.fetchCalls[0].init.credentials, 'same-origin');

  const anchors = env.created.filter((node) => node.tagName === 'A' && node.download !== '');
  assert.equal(anchors.length, 1, '成功时必须创建下载链接');
  assert.equal(anchors[0].download, '报告 1.pdf', '文件名 = 路径最后一段（解码后）');
  assert.equal(anchors[0].href, env.objectUrls[0].url);
  assert.equal(anchors[0].parentNode, null, '点击后链接要移除');

  env.scheduler.tick(1000);
  assert.deepEqual(env.revokedUrls, [env.objectUrls[0].url], '对象 URL 要回收');
  dispose();
});

test('下载错误映射：401/413/404/403/500/网络异常逐字对应源码文案', async () => {
  const env = createEnv();
  const { rows } = makeRows(env.document, FIVE_ROWS);
  const { dispose } = install(env);
  env.scheduler.tick(200);

  const cases = [
    { status: 401, text: ZH.err401 },
    { status: 413, text: ZH.err413 },
    { status: 404, text: ZH.err404 },
    { status: 403, text: ZH.err403 },
    { status: 500, text: '下载失败（HTTP 500）' },
    { network: true, text: ZH.errNetwork },
  ];
  for (const item of cases) {
    env.setFetch(async () => {
      if (item.network === true) throw new Error('offline');
      return { ok: false, status: item.status, blob: async () => ({}) };
    });
    openMenu(rows[2]);
    env.scheduler.tick(0);
    itemOf(popupOf(env.document), 1).click();
    await flush();
    assert.equal(toastText(env.document), item.text, '状态 ' + (item.network === true ? 'network' : item.status) + ' 的提示必须逐字一致');
  }
  dispose();
});

test('熔断：连续 3 轮注入不进 → 停止观察、只提示一次；点「不再提示」写入 localStorage', () => {
  const env = createEnv();
  makeRows(env.document, [
    { entry: 'file', path: '/root/work/a.txt', button: false },
  ]);
  const { dispose } = install(env);
  env.scheduler.tick(200);
  assert.equal(toastText(env.document), null, '第一轮失败不打扰用户');
  assert.equal(env.warns.length, 1, '注入失败只 console.warn 一次');

  env.scheduler.tick(300);
  env.observers[0].trigger();
  env.scheduler.tick(200);
  assert.equal(toastText(env.document), null, '第二轮失败仍不打扰');

  env.scheduler.tick(300);
  env.observers[0].trigger();
  env.scheduler.tick(200);
  assert.equal(toastText(env.document), ZH.givingUp, '第三轮必须提示一次');
  assert.match(toastText(env.document), /文件树本身不受影响/);
  assert.equal(env.observers[0].disconnected, true, '熔断后必须停止观察');

  // 停止后再触发多少轮都只有这一条提示。
  const toastCount = env.document.querySelectorAll('[data-lookout-toast]').length;
  assert.equal(toastCount, 1);
  env.scheduler.tick(300);
  env.observers[0].trigger();
  env.scheduler.tick(2000);
  assert.equal(env.document.querySelectorAll('[data-lookout-toast]').length, 1, '不许重复提示');
  assert.equal(env.warns.length, 1, '也不许重复 warn');

  const toast = env.document.querySelector('[data-lookout-toast]');
  const dismiss = toast.querySelector('button');
  assert.equal(dismiss.textContent, ZH.dismiss);
  dismiss.click();
  assert.equal(env.storage.get(DISMISSED_KEY), '1', '「不再提示」必须持久化');
  assert.equal(env.document.querySelectorAll('[data-lookout-toast]').length, 0);
  dispose();
});

test('开关：localStorage 里 enabled=false 时安装后完全不注入', () => {
  const env = createEnv({ storage: { [ENABLED_KEY]: '0' } });
  const { rows } = makeRows(env.document, FIVE_ROWS);
  const { dispose } = install(env);
  env.scheduler.tick(5000);
  assert.equal(env.document.querySelectorAll('[data-lookout-rowmenu]').length, 0, '关闭后不许注入');
  assert.equal(env.observers.length, 0, '关闭后不该启动观察器');
  assert.equal(rows[0].style.position, '', '关闭后连样式都不该动');
  dispose();
});

test('健壮性：require 取不到 primitives 不崩，复制走降级链', async () => {
  const clipboard = [];
  const env = createEnv({ navigator: { clipboard: { writeText: async (text) => { clipboard.push(text); } } } });
  const { rows } = makeRows(env.document, FIVE_ROWS);
  const { dispose } = install(env, {
    require: (id) => { throw new Error('模块加载失败：' + id); },
  });
  env.scheduler.tick(200);
  assert.equal(env.document.querySelectorAll('[data-lookout-rowmenu]').length, 4, 'primitives 缺失不影响注入');

  const path = rows[2].getAttribute('data-files-path');
  const anchor = openMenu(rows[2]);
  env.scheduler.tick(0);
  itemOf(popupOf(env.document), 0).click();
  await flush();
  assert.deepEqual(clipboard, [path], '降级到 navigator.clipboard');
  assert.equal(anchor.hasAttribute('data-lookout-copied'), true);
  dispose();

  // 第二条降级：clipboard API 也不可用时用 textarea + execCommand。
  const env2 = createEnv();
  const copied = [];
  env2.document.execCommand = (command) => {
    copied.push({ command, value: env2.document.activeElement?.value ?? '' });
    return true;
  };
  const rows2 = makeRows(env2.document, FIVE_ROWS).rows;
  const installed2 = install(env2, {
    require: (id) => {
      if (id === PRIMITIVES) return { writeClipboard: async () => { throw new Error('拒绝'); } };
      throw new Error('未预期的 require：' + id);
    },
  });
  env2.scheduler.tick(200);
  const path2 = rows2[2].getAttribute('data-files-path');
  openMenu(rows2[2]);
  env2.scheduler.tick(0);
  itemOf(popupOf(env2.document), 0).click();
  await flush();
  assert.deepEqual(copied, [{ command: 'copy', value: path2 }], '再降级到 execCommand(textarea)');
  installed2.dispose();
});

test('健壮性：document 缺 API / 没有 MutationObserver 都不抛', () => {
  // 缺 querySelector：整个安装必须被 rowMenuStart 吞掉，只告警。
  const broken = createEnv();
  broken.document.querySelector = undefined;
  const api = regionApi(broken);
  assert.doesNotThrow(() => api.rowMenuStart({ effect() {} }, () => { throw new Error('no primitives'); }));
  assert.equal(broken.warns.length, 1, '失败要留一条 warn');

  // 没有 MutationObserver：仍靠定时器完成首轮注入。
  const env = createEnv({ noMutationObserver: true });
  makeRows(env.document, FIVE_ROWS);
  const { dispose } = install(env);
  env.scheduler.tick(200);
  assert.equal(env.document.querySelectorAll('[data-lookout-rowmenu]').length, 4, '没有观察器也要能注入');
  dispose();
});

test('CSS 审计：新样式只使用宿主真实存在的 --dsw-alias-* token，且没有硬编码颜色', () => {
  const clientTest = readFileSync(new URL('./client.test.mjs', import.meta.url), 'utf8');
  const whitelist = new Set([...clientTest.matchAll(/'(--dsw-alias-[a-z0-9-]+)'/g)].map((match) => match[1]));
  assert.ok(whitelist.size > 50, '必须能从 client.test.mjs 读到 THEME_TOKENS 白名单');

  const env = createEnv();
  makeRows(env.document, FIVE_ROWS);
  const { api, dispose } = install(env);
  env.scheduler.tick(200);
  const styleTag = env.document.querySelector('style[data-plugin-css="lookout-row-menu"]');
  assert.ok(styleTag, '必须注入样式标签');
  const css = styleTag.textContent;
  assert.equal(css, api.ROW_MENU_CSS);
  const used = new Set([...css.matchAll(/var\((--dsw-alias-[a-z0-9-]+)\)/g)].map((match) => match[1]));
  assert.ok(used.size > 0, '样式里必须引用主题 token');
  for (const token of used) assert.equal(whitelist.has(token), true, '未在主题白名单里的 token：' + token);
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, '不许硬编码十六进制颜色');
  assert.doesNotMatch(css, /\brgba?\(/, '不许硬编码 rgb(a) 颜色');
  dispose();
});

test('整份 bundle：胶水层 apply() 先启动文件行菜单（不依赖三份原插件段）', () => {
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
  assert.equal(effects.some((item) => item.label === 'dsh-lookout: file row menu'), true,
    'apply() 必须在跑三段原插件之前挂上文件行菜单');
});
