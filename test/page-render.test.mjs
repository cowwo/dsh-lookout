// dsh-notify-p · 设置页离线渲染冒烟
//
// 浏览器半的其它用例都是"源码审计 + 纯函数真值表"，跑不到 JSX 的渲染路径。
// 这里用一个能跑状态、副作用与 ref 的 React 桩，把真正的 MailNotifyPage 渲染出来，
// 断言**这一页现在的几件事**真的出现在 DOM 树里：
//   1. 发送测试邮件是常驻入口（判决条一处、凭据行一处），不再被"已就绪"门控；
//   2. 授权码未配置时状态条给的是「去填写」，按钮仍可用——点了能立刻拿到真实原因；
//   3. 点下去之后，RPC 当场返回的成败与原始报错就地显示；**没点过就什么都没有**——
//      投递账本与「最近一次投递」面板已整块删除，页面上不再有历史可看；
//   4. 显式保存：改草稿不写回、读数说清有几项没保存、点「保存」才发一条 mutate、
//      「放弃改动」回滚且不发 mutate、认领不到命名空间时才说"读不到配置"。
//
// 副作用是刻意跑的：凭据那一条链路会"写完之后再读一次"，桩里把它计次，
// 顺便验证自动复检真的会发生（页面不会停在「未配置」）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { runPart } from './merged-client-parts.mjs';

/** 设置命名空间里的一份"已经配好一半"的真实值：SMTP、收件人有了、授权码还没存。 */
const SETTINGS_VALUE = {
  enabled: true,
  recipients: 'me@qq.com',
  smtpHost: 'smtp.qq.com',
  smtpPort: 465,
  smtpSecure: 'tls',
  smtpUser: 'me@qq.com',
  smtpPasswordRef: 'DSH_MAIL_NOTIFY_SMTP_PASSWORD',
  notifyCompleted: true,
};

/** 真机上踩过的 QQ 550（From 头被整串 B-encode）。 */
const FAILED_SEND = {
  ok: false,
  error: '550 The "From" header is missing or invalid',
};

/**
 * 在元素树里找"带 onClick、且直接文本里含某段字"的节点。
 * 桩里的树是普通对象 { type, props, children }，所以自己走一遍就够。
 * @param {object|null} root 元素树
 * @param {string} label 按钮上的字
 * @returns {object|null} 命中的节点
 */
function findClickable(root, label) {
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (Array.isArray(node)) { stack.push(...node); continue; }
    if (node === null || typeof node !== 'object') continue;
    const children = Array.isArray(node.children) ? node.children : [];
    const hasLabel = children.some((child) => typeof child === 'string' && child.includes(label));
    if (hasLabel && typeof node.props?.onClick === 'function') return node;
    stack.push(...children);
  }
  return null;
}

/**
 * 在元素树里找第一个 props 满足条件的节点（按 id 找输入框 / 下拉 / 开关）。
 * @param {object|null} root 元素树
 * @param {Function} predicate props 判定
 * @returns {object|null} 命中的节点
 */
function findByProps(root, predicate) {
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (Array.isArray(node)) { stack.push(...node); continue; }
    if (node === null || typeof node !== 'object') continue;
    if (node.props && predicate(node.props) === true) return node;
    const children = Array.isArray(node.children) ? node.children : [];
    stack.push(...children);
  }
  return null;
}

/**
 * 在元素树里找**所有** props 满足条件的节点（数开关、数 chips 都要用）。
 * @param {object|null} root 元素树
 * @param {Function} predicate props 判定
 * @returns {object[]} 命中的节点
 */
function findAllByProps(root, predicate) {
  const hits = [];
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (Array.isArray(node)) { stack.push(...node); continue; }
    if (node === null || typeof node !== 'object') continue;
    if (node.props && predicate(node.props) === true) hits.push(node);
    const children = Array.isArray(node.children) ? node.children : [];
    stack.push(...children);
  }
  return hits;
}

/**
 * 装 bundle 并渲染设置页。
 * @param {object} [options] 覆盖预热状态
 * @param {object} [options.settings] 设置命名空间里的值
 * @param {boolean} [options.credentialsConfigured] 凭据是否已写入凭据库
 * @param {object} [options.testResponse] 发送测试邮件这次 RPC 的返回值
 * @param {boolean} [options.claimNamespace] 是否给出 schema 签名（false = 认领不到）
 * @param {boolean} [options.failSave] mutate 是否失败（用来验"失败不清空草稿"）
 * @param {boolean} [options.failCredentialWrite] 凭据库是否拒写（用来验半成功分开报）
 * @param {boolean} [options.describeFails] describe 是否失败（用来验 loadFailed 那一档）
 * @param {boolean} [options.conflictThenSucceed] 第一次 mutate 是否报 revision 冲突（隔离冲突恢复）
 * @returns {Promise<object>} 渲染句柄
 */
async function renderPage(options = {}) {
  const settingsValue = options.settings ?? SETTINGS_VALUE;
  const credentialsConfigured = options.credentialsConfigured === true;
  const testResponse = options.testResponse ?? { ok: true, ms: 1200 };
  const claimNamespace = options.claimNamespace !== false;
  const failSave = options.failSave === true;
  const failCredentialWrite = options.failCredentialWrite === true;
  const describeFails = options.describeFails === true;
  const conflictThenSucceed = options.conflictThenSucceed === true;
  /** 服务端那本账的 revision：写在成功时往前挪一格，冲突时也一样（模拟"别人先改了"）。 */
  let serverRevision = 1;
  let entry;
  globalThis.window = {
    __ModuleLoader__: { load: (value) => { entry = value; } },
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  globalThis.document = {
    querySelector: () => null,
    createElement: () => ({ dataset: {}, style: {}, textContent: '' }),
    head: { appendChild: () => {} },
    addEventListener: () => {},
    removeEventListener: () => {},
    visibilityState: 'visible',
  };
  // 合并后 client/client.js = 三段逐字节保留 + 胶水层；本文件测的是 B 段的设置页，
  // 所以只执行 B 段（见 merged-client-parts.mjs 的说明）。
  runPart('b');

  const store = { values: [], refs: [], cleanups: new Map() };
  let cursor = 0;
  let effects = [];
  const React = {
    createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat(Infinity) }),
    Fragment: 'Fragment',
    useState(init) {
      const i = cursor += 1;
      if (store.values[i] === undefined) store.values[i] = typeof init === 'function' ? init() : init;
      return [store.values[i], (next) => {
        store.values[i] = typeof next === 'function' ? next(store.values[i]) : next;
      }];
    },
    useRef(init) {
      const i = cursor += 1;
      if (store.refs[i] === undefined) store.refs[i] = { current: init };
      return store.refs[i];
    },
    useCallback(fn) { cursor += 1; return fn; },
    useEffect(fn) { const i = cursor += 1; effects.push([i, fn]); },
  };

  const mod = entry.factory((id) => {
    if (id === 'react') return React;
    if (id === '@deepseek-ai/dsh-client-ui-primitives') return {};
    throw new Error(`未预期的 require：${id}`);
  });

  let section = null;
  const slots = {
    inject: (name, callback) => callback(),
    register: (options_, render) => { section = render; },
  };
  let credentialCalls = 0;
  const rpcCalls = [];
  const settingsCalls = { describe: 0, mutate: [], replace: [] };
  // 0.2.1-rc.2：ns 是 profile 入口 id，客户端不许写死——所以这里故意不叫 dsh-notify-p。
  // 真实 describe() 里的 schema 是 schema.toJSON() 快照（只有 uid/refs，没有 dict），
  // 所以认领只能靠 value 指纹：同时有 smtpHost 与 smtpPasswordRef 的那一项。
  const NAMESPACE_NS = 'lookout';
  const namespaceEntry = (revision, value) => ({
    ns: NAMESPACE_NS,
    schema: { uid: 5, refs: {} },
    revision,
    value,
  });
  const settingsRemote = {
    describe: async () => {
      settingsCalls.describe += 1;
      if (describeFails) {
        // 读失败：Host 侧 RemoteError 的真实形状（真 Error + code + details）。
        return {
          ok: false,
          error: Object.assign(new Error('设置服务暂时不可用'), {
            code: 'gateway/internal', details: {}, isDSHRemoteError: true,
          }),
        };
      }
      const entry = claimNamespace
        ? namespaceEntry(serverRevision, settingsValue)
        // 指纹对不上（value 里没有我们的字段）：这一页读不到本插件的配置（ns 字面相同也不算数）。
        : { ns: NAMESPACE_NS, schema: { uid: 9, refs: {} }, revision: 1, value: { model: 'x' } };
      return { ok: true, value: { namespaces: [entry] } };
    },
    mutate: async (ns, ops, revision) => {
      settingsCalls.mutate.push({ ns, ops, revision });
      if (failSave) throw new Error('revision 冲突，请重试');
      if (conflictThenSucceed && settingsCalls.mutate.length === 1) {
        // 别处已经把这份配置推走了：revision 真的变了，code 是 settings/conflict。
        serverRevision = Number(revision) + 1;
        return {
          ok: false,
          error: Object.assign(new Error('这份配置已被别处改动'), {
            code: 'settings/conflict',
            details: { ns, expected: revision, actual: serverRevision },
            isDSHRemoteError: true,
          }),
        };
      }
      serverRevision = Number(revision) + 1;
      return { ok: true, value: namespaceEntry(serverRevision, settingsValue) };
    },
    replace: async (ns, ops, revision) => {
      settingsCalls.replace.push({ ns, ops, revision });
      serverRevision = Number(revision) + 1;
      return { ok: true, value: namespaceEntry(serverRevision, settingsValue) };
    },
  };
  const credentialsRemote = {
    describe: async (refs) => {
      credentialCalls += 1;
      return { ok: true, value: Object.fromEntries(refs.map((ref) => [ref, { configured: credentialsConfigured }])) };
    },
    set: async (ref) => {
      if (failCredentialWrite) {
        return {
          ok: false,
          error: Object.assign(new Error('凭据库写入被拒'), {
            code: 'credential/rejected', details: { ref }, isDSHRemoteError: true,
          }),
        };
      }
      return { ok: true, value: null };
    },
    unset: async () => ({ ok: true, value: null }),
  };
  // 账本端点已删：除了 mailNotify/test，任何 RPC 都算越界（下面有用例断言这一点）。
  const rpc = {
    call: async (route, method) => {
      rpcCalls.push({ route, method });
      if (method === 'mailNotify/test') return { ok: true, value: testResponse };
      return { ok: false, error: `未预期的 RPC（账本已删）：${method}` };
    },
  };

  mod.apply({
    inject: (services, callback) => {
      if (services.includes('slots')) return callback({ slots });
      if (services.includes('locale')) {
        return callback({ locale: { register: () => {}, subscribe: () => () => {}, getSnapshot: () => ({ id: 'zh', revision: 1 }) } });
      }
      if (services.includes('connection')) return callback({ connection: { rpc } });
      return callback({ remote: { settings: settingsRemote, credentials: credentialsRemote } });
    },
    effect: (fn) => fn(),
  });

  /** 跑若干轮渲染 + 副作用，返回最后一轮的树。 */
  const render = async (rounds) => {
    let root = null;
    for (let round = 0; round < rounds; round += 1) {
      cursor = 0;
      effects = [];
      root = section({}).type(section({}).props);
      for (const [index, fn] of effects) {
        const cleanup = store.cleanups.get(index);
        if (typeof cleanup === 'function') cleanup();
        const next = fn();
        store.cleanups.set(index, typeof next === 'function' ? next : undefined);
      }
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => { setTimeout(resolve, 10); });
    }
    return root;
  };

  // 首轮：ready 初值就是"远程已注入"，load() 与凭据读取都是微任务，几轮就落地。
  let root = await render(4);

  /** 点一下页面上带某段文字的按钮，再让页面稳定下来。 */
  const click = async (label) => {
    const button = findClickable(root, label);
    assert.ok(button !== null, `页面上没有可点的「${label}」`);
    button.props.onClick();
    await new Promise((resolve) => { setTimeout(resolve, 10); });
    root = await render(2);
  };

  /**
   * 收尾：跑掉所有 effect 的清理函数。
   * 「已保存 · N 秒前」会开一个 1 秒的 interval，桩里没人清它——不清的话
   * node --test 全部用例跑完也不会退出（事件循环还被那个滴答占着）。
   * @returns {void}
   */
  const stop = () => {
    for (const [index, cleanup] of store.cleanups) {
      if (typeof cleanup === 'function') {
        try { cleanup(); } catch { /* best effort */ }
      }
      store.cleanups.delete(index);
    }
  };

  return {
    json: () => JSON.stringify(root ?? null),
    stop,
    /** 按 id 找控件（输入框 / 下拉 / 开关）。 */
    byId: (id) => findByProps(root, (props) => props.id === id),
    /** 按可见文字找可点节点（也用来读它的 disabled）。 */
    find: (label) => findClickable(root, label),
    /** 按 props 找第一个节点（问号按钮、折叠标题都靠它）。 */
    findBy: (predicate) => findByProps(root, predicate),
    /** 按 props 找全部节点（数开关、数 chips）。 */
    findAllBy: (predicate) => findAllByProps(root, predicate),
    /**
     * 页面上现在有几个**事件**开关（开关的 props 带 data-event）。
     * 总开关（data-master）不算事件开关，它由 master() 单独取。
     */
    switches: () => findAllByProps(root, (props) => typeof props.label === 'string'
      && typeof props.onChange === 'function' && props.checked !== undefined
      && props['data-event'] !== undefined),
    /** 通知时机第一行的总开关。 */
    master: () => findByProps(root, (props) => props['data-master'] === 'true'),
    /**
     * 页面上所有**可见文字**拼成的串（只走 children，不含 aria-label / title 等属性）。
     * 用来断言"这句话在版面上出现几次"——宿主原语常把 label 也渲染成文字，
     * 光数 JSON 会把属性里的同名词一起数进去，误判成重影。
     */
    text: () => {
      const walk = (node) => {
        if (node === null || node === undefined) return '';
        if (typeof node === 'string') return node;
        if (typeof node === 'number') return String(node);
        if (Array.isArray(node)) return node.map(walk).join('');
        if (typeof node !== 'object') return '';
        // 元素树里 children 是节点自身的一层数组（与 findByProps 的取法一致）。
        return walk(Array.isArray(node.children) ? node.children : null);
      };
      return walk(root);
    },
    /** 再渲染两轮，让刚点出来的状态落地。 */
    settle: async () => {
      await new Promise((resolve) => { setTimeout(resolve, 10); });
      root = await render(2);
    },
    settingsCalls: () => settingsCalls,
    credentialCalls: () => credentialCalls,
    rpcMethods: () => rpcCalls.map((item) => item.method),
    click,
    /** 改一个输入框的草稿值，再让页面稳定下来。 */
    edit: async (id, value) => {
      const field = findByProps(root, (props) => props.id === id);
      assert.ok(field !== null, `页面上没有 id=${id} 的控件`);
      field.props.onChange({ target: { value } });
      await new Promise((resolve) => { setTimeout(resolve, 10); });
      root = await render(2);
    },
  };
}

test('渲染冒烟：授权码未配置时，发送测试邮件仍是常驻入口（不挑状态）', async () => {
  const page = await renderPage();
  const json = page.json();
  // 判决条在这个形态下给的是「去填写」，但测试入口不该跟着消失。
  // 两处入口刻意并存：判决条（主按钮）+ 凭据行（文字链接，手刚离开输入框就能就地验证）。
  assert.equal(json.includes('还差'), true, '缺授权码时判决句要说清缺什么');
  assert.equal(json.includes('用已保存的配置真发一封'), true, '测试入口要带一句"点了会发生什么"，并说清用的是已保存配置');
  const buttonCount = (json.match(/发送测试邮件|重新测试/g) ?? []).length;
  assert.equal(buttonCount >= 2, true, `测试入口至少两处（判决条 + 凭据行），实际 ${String(buttonCount)}`);
});

// 反面：发送通道只剩 SMTP，页面上不该再有通道选择器，也不该出现「只记录 / Resend」。
test('渲染冒烟：不再有发送通道选择器，SMTP 字段照常出现', async () => {
  const json = (await renderPage()).json();
  assert.equal(json.includes('只记录'), false, '「只记录」通道必须从页面消失');
  assert.equal(json.includes('Resend'), false, 'Resend 通道必须从页面消失');
  assert.equal(json.includes('发送通道'), false, '通道选择器的分组标签必须消失');
  assert.equal(json.includes('发信方式'), true, '分组标题保留（原「怎么发」已改名）');
  assert.equal(json.includes('SMTP 主机'), true, 'SMTP 字段仍要出现在页面上');
  assert.equal(json.includes('SMTP 授权码'), true);
});

// 正面：账本删掉之后，"没点过"就该是干净的——页面上不该再有上一封的读数，
// 也不该再向 Host 要账本（mailNotify/state 端点已删除）。
test('渲染冒烟：没点过测试邮件时没有任何投递读数，也不再向 Host 要账本', async () => {
  const page = await renderPage({ credentialsConfigured: true });
  const json = page.json();
  for (const ghost of ['最近一次发送', '还没有试过', '投递账本', '上次发信失败']) {
    assert.equal(json.includes(ghost), false, `「${ghost}」是账本面板的残留，必须从页面消失`);
  }
  assert.deepEqual(page.rpcMethods(), [], '页面启动时不该再调 mailNotify/state');
});

// 正面：点一下就能拿到这次投递的真相（这是删掉账本之后唯一的一手证据）。
test('渲染冒烟：点「发送测试邮件」后，RPC 当场返回的成败与用时直接显示', async () => {
  const page = await renderPage({ credentialsConfigured: true, testResponse: { ok: true, ms: 1200 } });
  await page.click('发送测试邮件');
  const json = page.json();
  assert.equal(json.includes('已发送'), true, '成功要有明确结论，不能只剩一句"已发送"式的空话');
  assert.equal(json.includes('用时 1200 毫秒'), true, 'RPC 返回的耗时必须如实显示，否则等于只报了个 ok');
  assert.equal(json.includes('这次没发出去'), false);
  assert.deepEqual(page.rpcMethods(), ['mailNotify/test'], '只该有 test 这一条 RPC');
});

test('渲染冒烟：测试邮件失败时，分类与原始报错都留在页面上，且原文只出现一次', async () => {
  const page = await renderPage({ credentialsConfigured: true, testResponse: FAILED_SEND });
  await page.click('发送测试邮件');
  const json = page.json();
  assert.equal(json.includes('这次没发出去'), true, '失败要直说没发出去');
  assert.equal(json.includes('发件人被拒'), true, '要给出分类，不能只甩原始报错');
  assert.equal(json.includes('550 The'), true, '原始报错不能只活在日志里');
  assert.equal((json.match(/550 The/g) ?? []).length, 1, '原始报错不该在标题与正文里各写一遍');
  assert.equal(json.includes('重新测试'), true, '失败之后按钮要变成「重新测试」');
});

test('渲染冒烟：授权码行给出「已保存 / 还没保存」与明文提示', async () => {
  const json = (await renderPage()).json();
  assert.equal(json.includes('SMTP 授权码'), true);
  assert.equal(json.includes('还没保存'), true);
  assert.equal(json.includes('不是登录密码'), true, '授权码不等同登录密码这件事要在原地说明');
});

test('渲染冒烟：凭据状态会被自动复检，页面不会停在「未配置」', async () => {
  const { credentialCalls } = await renderPage();
  assert.equal(credentialCalls() >= 2, true, `应至少复检一次（首读 + 复检），实际 ${String(credentialCalls())}`);
});

// 「已就绪」这个形态在真机上要一份真的授权码才到得了，所以在这里把分支钉住：
// 判决句与主按钮都必须跟着状态换，而不是换一条就被落下。
test('渲染冒烟：配齐之后判决条给「可以发信了」+ 主按钮', async () => {
  const json = (await renderPage({ credentialsConfigured: true })).json();
  assert.equal(json.includes('可以发信了'), true, '配齐了就要直说可以发信');
  assert.equal(json.includes('配置齐了'), true, '判决句要给出下一步：先发一封测试邮件');
  assert.equal(json.includes('发送测试邮件'), true, '已就绪时判决条要直接给出测试入口');
});

// 反面：账本删掉之后，「上次失败」这一档判定也一并删了——判决条只回答"配置齐不齐"，
// 上一次到底发没发出去交给测试结果行（它只活在内存里，刷新即消失）。
test('渲染冒烟：上次测试失败不改判决条——「上次发信失败」这一档已随账本删除', async () => {
  const page = await renderPage({
    credentialsConfigured: true,
    testResponse: { ok: false, error: '535 authentication failed' },
  });
  await page.click('发送测试邮件');
  const json = page.json();
  assert.equal(json.includes('上次发信失败'), false, '这一档判定依赖账本，必须删掉');
  assert.equal(json.includes('可以发信了'), true, '判决条只看配置齐不齐');
  assert.equal(json.includes('服务端拒绝了这组账号密码'), true, '失败原因要落在测试结果行里');
});

// 这一轮的界面变更：「可选设置 → 发件人与链接」整块删掉，标题、折叠区、清单、弹层、
// 链接开关一起走。桩渲染得到整棵元素树，所以"删干净"这件事在这里是能直接看见的——
// 特别是别把分组标题留下变成一个空壳。
test('渲染冒烟：「可选设置 / 发件人与链接」整块已删，不留空分组', async () => {
  const json = (await renderPage()).json();
  for (const ghost of ['可选设置', '发件人与链接', '添加发件人', '发信时用它', '将回退到默认发件人',
    '这里保存所有发件人', '邮件里带直达会话链接', '链接对外地址']) {
    assert.equal(json.includes(ghost), false, `「${ghost}」属于已删除的「可选设置」`);
  }
  // 保留下来的三组与页脚照旧在页面上。
  for (const kept of ['收件人', '发信方式', '通知时机', 'SMTP 主机', 'SMTP 授权码', '恢复全部默认']) {
    assert.equal(json.includes(kept), true, `「${kept}」必须保留`);
  }
  // 删掉的那一组是**手写的** <section class="dshmn-group">，剩下的三组都走 Card 组件
  // （视觉骨架这一轮把 Group 改成了三张描边卡片，类名同步换成 dshmn-card*）；
  // 桩不展开自定义组件，所以树里不该再出现手写的分组标题外壳（有标题没内容最典型）。
  assert.equal(json.includes('dshmn-groupTitle'), false, '手写的分组标题外壳应当整块消失，不留空标题');
});

// ── 本轮：显式保存 ──────────────────────────────────────────────────────────
// 这一组直接盯住「草稿 → 基线 → 保存」这条链：
//   改控件不写回 Host；保存只发一条 mutate 且用认领来的 ns；放弃改动一个写请求都不发。
test('渲染冒烟：没有改动时「保存」是禁用态，读数说「没有未保存的改动」', async () => {
  const page = await renderPage();
  const json = page.json();
  assert.equal(json.includes('没有未保存的改动'), true, '干净态要说清没有待保存的东西');
  assert.equal(page.find('保存').props.disabled, true, '没有改动时主按钮必须是禁用态');
  assert.equal(page.find('放弃改动').props.disabled, true, '没有改动时次按钮同样禁用');
  assert.deepEqual(page.settingsCalls().mutate, [], '打开页面不该自己写回');
});

test('渲染冒烟：改一项之后读数变成「有 1 项改动未保存」，且没有写回 Host', async () => {
  const page = await renderPage();
  await page.edit('dshmn-recipients', 'you@example.com');
  const json = page.json();
  assert.equal(json.includes('有 1 项改动未保存'), true, '脏读数要数清几项：只改了一个字段');
  assert.equal(json.includes('没有未保存的改动'), false);
  assert.equal(page.find('保存').props.disabled, false, '有改动时主按钮要点得动');
  assert.deepEqual(page.settingsCalls().mutate, [], '改草稿不该触发写回');
});

test('渲染冒烟：点「保存」只发一条 mutate（认领来的 ns + 正确 ops），读数变「已保存」', async () => {
  const page = await renderPage();
  // 「已保存」会起一个走时钟；用例结束必须 stop()，否则进程不退出。
  try {
    await page.edit('dshmn-recipients', 'you@example.com');
    await page.click('保存');
    assert.deepEqual(page.settingsCalls().mutate, [{
      ns: 'lookout',
      ops: [{ op: 'set', path: ['recipients'], value: 'you@example.com' }],
      revision: 1,
    }], '一次保存只该有一条 mutate，且 ns 必须是 describe() 认领到的那个');
    const json = page.json();
    assert.equal(json.includes('已保存 · 刚刚'), true, '保存成功要有落盘读数');
    assert.equal(json.includes('项改动未保存'), false, '保存成功后不该还剩脏读数');
    assert.equal(page.find('保存').props.disabled, true, '保存成功后回到干净态');
  } finally {
    page.stop();
  }
});

test('渲染冒烟：放弃改动把草稿回滚到基线，且一个写请求都不发', async () => {
  const page = await renderPage();
  await page.edit('dshmn-recipients', 'you@example.com');
  await page.click('放弃改动');
  const json = page.json();
  assert.equal(json.includes('没有未保存的改动'), true, '放弃之后读数必须回到干净态');
  assert.equal(page.byId('dshmn-recipients').props.value, 'me@qq.com', '字段值必须回到基线');
  assert.deepEqual(page.settingsCalls().mutate, [], '放弃改动不该写回 Host');
  assert.deepEqual(page.settingsCalls().replace, []);
});

test('渲染冒烟：保存失败时读数给原因 + 重试，且不清空草稿', async () => {
  const page = await renderPage({ failSave: true });
  await page.edit('dshmn-recipients', 'you@example.com');
  await page.click('保存');
  const json = page.json();
  assert.equal(json.includes('保存失败：'), true, '失败要直说保存失败');
  assert.equal(json.includes('revision 冲突，请重试'), true, '原因要如实带出来');
  assert.equal(json.includes('重试'), true, '失败后要能就地重试');
  assert.equal(page.byId('dshmn-recipients').props.value, 'you@example.com', '失败不得清空草稿');
});

test('渲染冒烟：只有认领不到命名空间时才说「这一页读不到本插件的配置」', async () => {
  const served = await renderPage();
  assert.equal(served.json().includes('这一页读不到本插件的配置'), false,
    'ns 字面不是 dsh-notify-p 也要靠 schema 签名认领到，不能报读不到');

  const unserved = await renderPage({ claimNamespace: false });
  assert.equal(unserved.json().includes('这一页读不到本插件的配置'), true,
    'schema 签名对不上时才该说读不到配置');
  assert.deepEqual(unserved.settingsCalls().mutate, [], '读不到配置时不该有写请求');
});


// ── 本轮：冲突恢复 / 读失败 / 半成功 / 判决条口径 ─────────────────────────────
// 复核指出的五处，前四处各钉一条：不钉住就会退回去——
//   · 冲突只把报错塞进读数 → 重试必然再冲突，用户只能关掉设置页再进来；
//   · 读失败冒充"保存失败" → 「重试」去调 saveAll()，view===null 直接 return，按钮是死的；
//   · 一句"保存失败"抹掉已经成功的那一半 → 用户不知道到底该重做哪边；
//   · 判决条按草稿算 → 草稿填齐就说「可以发信了」，而测试邮件用的是已保存配置，一点就失败。
test('渲染冒烟：保存撞上 revision 冲突时自动重读，草稿不动，再点一次就成功', async () => {
  const page = await renderPage({ conflictThenSucceed: true, credentialsConfigured: true });
  try {
    await page.edit('dshmn-recipients', 'you@example.com');
    await page.click('保存');
    const conflicted = page.json();
    assert.equal(page.settingsCalls().describe, 2, '冲突之后必须自动重读一次（认领逻辑复用 load）');
    assert.equal(conflicted.includes('配置已被别处改动，已读到最新值，请再点一次保存'), true,
      '读数要说清"已读到最新值、再点一次保存"');
    assert.equal(conflicted.includes('已保存 · 刚刚'), false, '冲突不是保存成功，不许出现已保存读数');
    assert.equal(page.byId('dshmn-recipients').props.value, 'you@example.com',
      '自动重读不得冲掉用户刚填的草稿');
    assert.equal(conflicted.includes('有 1 项改动未保存'), false,
      '这一档由冲突提示占位，脏读数不必再叠一句');

    await page.click('保存');
    const retried = page.json();
    assert.equal(page.settingsCalls().mutate.length, 2, '再点一次才发第二次 mutate');
    assert.equal(page.settingsCalls().mutate[1].revision, 2,
      '重试必须用重读后的新 revision——拿旧 revision 重试等于必死');
    assert.equal(retried.includes('已保存 · 刚刚'), true, '第二次点保存应当成功');
    assert.equal(retried.includes('配置已被别处改动'), false, '成功之后冲突提示要消失');
    assert.equal(page.byId('dshmn-recipients').props.value, 'you@example.com', '落盘之后草稿留在原位');
  } finally {
    page.stop();
  }
});

test('渲染冒烟：读配置失败是独立一档——「重新读取」只重读，一个写请求都不发', async () => {
  const page = await renderPage({ describeFails: true });
  const json = page.json();
  assert.equal(json.includes('读不到本插件的配置：'), true, '读失败要说清是读不到配置');
  assert.equal(json.includes('设置服务暂时不可用'), true, '原因要如实带出来');
  assert.equal(json.includes('保存失败'), false, '读失败不是保存失败，别冒充它');
  assert.equal(page.find('重新读取') !== null, true, '读失败必须给「重新读取」');

  const describesBefore = page.settingsCalls().describe;
  await page.click('重新读取');
  assert.equal(page.settingsCalls().describe, describesBefore + 1, '「重新读取」只该再调一次 describe');
  assert.deepEqual(page.settingsCalls().mutate, [], '读失败时点重试不许写到 Host');
  assert.deepEqual(page.settingsCalls().replace, []);
  assert.equal(page.json().includes('读不到本插件的配置：'), true, '还读不到就还留在这一档');
});

test('渲染冒烟：配置写成功、授权码写失败——两半分开报，只给授权码的重试', async () => {
  const page = await renderPage({ failCredentialWrite: true });
  await page.edit('dshmn-recipients', 'you@example.com');
  await page.edit('dshmn-cred-smtp', 'abcd1234');
  await page.click('保存');
  const json = page.json();
  assert.equal(page.settingsCalls().mutate.length, 1, '配置那一半确实写进去了');
  assert.equal(json.includes('配置已保存，但授权码没写进去：'), true, '必须点出哪一半成了、哪一半没成');
  assert.equal(json.includes('凭据库写入被拒'), true, '失败原因要如实带出来');
  assert.equal(json.includes('已保存 · 刚刚'), false, '半成功不许显示「已保存」读数');
  assert.equal(page.find('重试授权码') !== null, true, '动作要指向失败的那一半');
  assert.equal(page.find('重试配置'), null, '配置已经成功了，不该再给它的重试');
});

test('渲染冒烟：授权码写成功、配置写失败——反向半成功同样分开报', async () => {
  const page = await renderPage({ failSave: true });
  await page.edit('dshmn-recipients', 'you@example.com');
  await page.edit('dshmn-cred-smtp', 'abcd1234');
  await page.click('保存');
  const json = page.json();
  assert.equal(json.includes('授权码已保存，但配置没写进去：'), true, '反向也要说清哪一半成了');
  assert.equal(json.includes('revision 冲突，请重试'), true, '失败原因要带出来');
  assert.equal(json.includes('已保存 · 刚刚'), false, '半成功不许显示「已保存」读数');
  assert.equal(page.find('重试配置') !== null, true, '动作要指向失败的那一半');
  assert.equal(page.find('重试授权码'), null, '授权码已经写进去了，不该再给它的重试');
});

test('渲染冒烟：判决条只看已保存的配置——草稿填齐但没保存时判决条不变', async () => {
  const page = await renderPage({
    credentialsConfigured: true,
    settings: { ...SETTINGS_VALUE, enabled: false },
  });
  try {
    assert.equal(page.json().includes('已关闭，不会发任何通知'), true, '基线是关的，判决条就该说关着');

    await page.click('启用');
    const drafting = page.json();
    assert.equal(drafting.includes('已关闭，不会发任何通知'), true,
      '草稿里打开了也不算数——判决条只认已保存值');
    assert.equal(drafting.includes('可以发信了'), false, '未保存的改动不许把判决条改成「可以发信」');
    assert.equal(drafting.includes('未保存的改动不参与判定'), true, '要说清这句判决不含草稿');
    assert.equal(drafting.includes('有 1 项改动未保存'), true, '草稿改动照常计入保存读数');

    await page.click('保存');
    const saved = page.json();
    assert.equal(saved.includes('可以发信了'), true, '落盘之后判决条才改口');
    assert.equal(saved.includes('未保存的改动不参与判定'), false, '没有未保存改动了，这句要收起来');
  } finally {
    page.stop();
  }
});

// 可忽略但顺手的一条：端口输入里的非法字符不该进草稿（Number('46a') 是 NaN）。
test('渲染冒烟：端口输入只收数字——非法字符不进草稿，也不搅乱脏计数', async () => {
  const page = await renderPage();
  // 端口与加密默认就在版面上（不再折进「更多」）。
  await page.edit('dshmn-smtp-port', '46a');
  assert.equal(page.json().includes('没有未保存的改动'), true, '非法输入不该记成一项改动');
  assert.equal(page.byId('dshmn-smtp-port').props.value, 465, '框里仍是上一次的合法值');
  await page.edit('dshmn-smtp-port', '587');
  assert.equal(page.byId('dshmn-smtp-port').props.value, 587, '合法数字照常进草稿');
  assert.equal(page.json().includes('有 1 项改动未保存'), true, '这时才算一项改动');
});


// ── 本轮：ui18 零折叠骨架（信息架构 + 交互重排）────────────────────────────
// 这一组每一条都是"看起来做了、其实没做"的重灾区，所以全部断言渲染出来的树：
//   ① 全页零折叠：没有折叠控件、没有「更多」、没有「还有 3 种情况」、没有问号按钮；
//   ② 端口与加密默认可见（不再折进「更多」）；
//   ③ 8 条事件说明默认可见，且每条都压到 ≤16 个中文字；
//   ④ 总开关在通知时机第一行，关掉后判决条改口、8 个事件开关变灰禁用但不隐藏；
//   ⑤ 8 个事件全关时判决条说「通知已全部关闭」，不再说「可以发信了」；
//   ⑥ 授权码有未保存草稿时，状态诚实地显示「有未保存的授权码」；
//   ⑦ 判决条的人话摘要随配置变化（服务商 · 主机 → 收件人 · 事件）；
//   ⑧ 吸底条常驻：脏时按钮可用、干净时禁用，且不承担脏读数；
//   ⑨ 保存读数按量级退化（320 秒 → 5 分钟前）。
test('渲染冒烟：全页零折叠——没有任何折叠控件，也没有折叠标题', async () => {
  const page = await renderPage();
  assert.equal(page.findBy((props) => props['aria-expanded'] !== undefined), null,
    '折叠控件（aria-expanded）必须整块消失');
  const json = page.json();
  for (const ghost of ['▸', '▾', '更多', '还有 3 种情况', 'dshmn-fold', '展开「']) {
    assert.equal(json.includes(ghost), false, '「' + ghost + '」属于已删除的折叠/问号交互');
  }
  // 折叠没了不等于内容没了：原来藏在折叠里的东西必须原地可见。
  assert.ok(page.byId('dshmn-smtp-port') !== null, '端口输入在版面上');
  assert.equal(page.switches().length, 8, '8 个事件开关全在版面上');
});

test('渲染冒烟：端口与加密默认可见，且都能改（不再折进「更多」）', async () => {
  const page = await renderPage();
  assert.ok(page.byId('dshmn-smtp-port') !== null, '端口输入默认就要在');
  assert.ok(page.byId('dshmn-smtp-secure') !== null, '加密下拉默认就要在');
  assert.equal(page.byId('dshmn-smtp-port').props.value, 465, '端口默认取已保存值');
  assert.equal(page.byId('dshmn-smtp-secure').props.value, 'tls', '加密默认取已保存值');
  await page.edit('dshmn-smtp-port', '587');
  assert.equal(page.byId('dshmn-smtp-port').props.value, 587, '端口改得动');
  await page.edit('dshmn-smtp-secure', 'starttls');
  assert.equal(page.byId('dshmn-smtp-secure').props.value, 'starttls', '加密改得动');
  assert.equal(page.json().includes('有 2 项改动未保存'), true, '端口 + 加密各算一项改动');
  // 四列网格：主机 / 端口 / 加密 / 用户名在同一个栅格里
  assert.ok(page.findBy((props) => props.className === 'dshmn-smtpGrid') !== null, '四个字段在同一个四列栅格里');
});

test('渲染冒烟：8 条事件说明默认可见，且每条 ≤16 个中文字', async () => {
  const page = await renderPage();
  const notes = page.findAllBy((props) => props.className === 'dshmn-eventNote')
    .map((node) => node.children[0])
    .sort();
  const expected = ['正常跑完时', '报错终止时', '等你补充信息时', '等你点审批时',
    '子代理也通知', '你按了停止', '系统中断时', '达到上限时'].sort();
  assert.deepEqual(notes, expected, '8 条说明必须常显在格子下方，一条不少');
  for (const note of expected) {
    assert.equal([...note].length <= 16, true, note + ' 超过 16 个中文字');
    assert.equal(page.json().includes(note), true, '渲染结果里要能看见「' + note + '」');
  }
});

test('渲染冒烟：8 个事件开关全在（三列网格、不分组），且每个都切得动', async () => {
  const page = await renderPage();
  assert.equal(page.switches().length, 8, '8 个开关一个不少（总开关不算事件开关）');
  assert.equal(page.json().includes('其他情况'), false, '不设「其他情况」小标题');
  assert.ok(page.findBy((props) => props.className === 'dshmn-events') !== null, '8 个格子落在同一个网格容器里');
  const labels = ['任务完成', '任务出错', '卡住', '等你审批', '也通知子代理',
    '你主动停止', '系统中断', '长度上限'];
  // 标题在**可见文字**里只许出现一次：宿主 Checkbox 会把 label 当可见文字渲染，
  // 之前因此出现过「☑ 任务完成 任务完成」的重影。
  // 注意不能用 JSON 计数——aria-label 里也带着同一个词，但那不是可见文字。
  const text = page.text();
  for (const label of labels) {
    assert.equal(text.split(label).length - 1 >= 1, true, '「' + label + '」必须出现在版面上');
  }
  assert.equal(text.split('任务完成').length - 1, 1, '「任务完成」在可见文字里只能出现一次（勾选框不许再渲染标题）');
  for (const label of labels) {
    const before = page.switches().find((item) => item.props.label === label);
    assert.ok(before !== undefined, '缺少「' + label + '」这一行');
    const next = before.props.checked !== true;
    before.props.onChange(next);
    await page.settle();
    const after = page.switches().find((item) => item.props.label === label);
    assert.equal(after.props.checked, next, '「' + label + '」切不动');
  }
  assert.equal(page.json().includes('有 8 项改动未保存'), true, '8 个开关各算一项改动');
  assert.equal(page.json().includes('7 项开启'), true, '卡片头读数跟着变（completed 本来开着，切完是 7 项开启）');
});

test('渲染冒烟：总开关在通知时机第一行——关掉后判决条改口，8 个事件开关变灰禁用', async () => {
  const page = await renderPage();
  try {
    const master = page.master();
    assert.ok(master !== null, '通知时机第一行要有总开关');
    assert.equal(master.props.checked, true, '默认按已保存值开着');
    assert.equal(page.json().includes('关闭后不再发送任何邮件'), true, '总开关要带一句说明');

    master.props.onChange(false);
    await page.settle();
    const events = page.switches();
    assert.equal(events.length, 8, '关掉总开关后事件开关不许被隐藏');
    for (const item of events) {
      assert.equal(item.props.disabled, true, '「' + item.props.label + '」应变灰禁用');
    }
    // 判决条只认已保存值：先保存，才轮到它改口。
    await page.click('保存');
    const json = page.json();
    assert.equal(json.includes('已关闭，不会发任何通知'), true, '总开关关掉并保存后，判决条要直说已关闭');
    assert.equal(json.includes('可以发信了'), false);
  } finally {
    page.stop();
  }
});

test('渲染冒烟：8 个事件全关时判决条说「通知已全部关闭」，不再说「可以发信了」', async () => {
  const page = await renderPage({
    credentialsConfigured: true,
    settings: { ...SETTINGS_VALUE, notifyCompleted: false },
  });
  const json = page.json();
  assert.equal(json.includes('通知已全部关闭'), true, '事件全关要单列一档判决');
  assert.equal(json.includes('至少打开一个事件才会收到邮件'), true, '要给出下一步：至少开一个');
  assert.equal(json.includes('可以发信了'), false, '事件全关时不许说可以发信');
  assert.equal(json.includes('全部关闭'), true, '通知时机卡片头的读数说「全部关闭」');
});

test('渲染冒烟：授权码有未保存草稿时，状态诚实显示「有未保存的授权码」', async () => {
  const page = await renderPage({ credentialsConfigured: true });
  const stateOf = () => JSON.stringify(page.findBy((props) => props.className === 'dshmn-credState'));
  assert.equal(stateOf().includes('已保存'), true, '存好了就先显示已保存');
  assert.equal(stateOf().includes('有未保存的授权码'), false);

  // 点一下只读框 = 「更换」：输入框展开，然后往里打字。
  page.findBy((props) => props.id === 'dshmn-cred-smtp').props.onFocus();
  await page.settle();
  await page.edit('dshmn-cred-smtp', 'abcd1234');

  const dirty = stateOf();
  assert.equal(dirty.includes('有未保存的授权码'), true, '有草稿就必须说清它还没保存');
  assert.equal(dirty.includes('已保存'), false, '有草稿时不许再自称「✓ 已保存」');
});

test('渲染冒烟：判决条的人话摘要随配置变化（服务商 · 主机 → 收件人 · 事件）', async () => {
  const summaryOf = (page) => page.findBy((props) => props.className === 'dshmn-verdictSummary').children[0];
  const qq = await renderPage();
  const net163 = await renderPage({
    settings: {
      ...SETTINGS_VALUE,
      smtpHost: 'smtp.163.com',
      recipients: 'a@163.com, b@163.com',
      notifyCompleted: false,
      notifyError: true,
      notifyApproval: true,
    },
  });
  assert.equal(summaryOf(qq), 'QQ 邮箱 · smtp.qq.com → me@qq.com · 跑完时通知',
    '摘要要认得预设名、主机、首个收件人与已开启的事件');
  assert.equal(summaryOf(net163), '163 邮箱 · smtp.163.com → 2 位收件人 · 出错、等审批时通知',
    '多收件人报个数，最多列两个事件名');
  assert.notEqual(summaryOf(qq), summaryOf(net163), '配置变了摘要必须跟着变');
});

test('渲染冒烟：吸底条常驻，脏时按钮可用、干净时两个都禁用，且不放脏读数', async () => {
  const page = await renderPage();
  const bar = () => page.findBy((props) => props.className === 'dshmn-savebar');
  assert.ok(bar() !== null, '吸底条要在版面上');
  assert.equal(findClickable(bar(), '保存').props.disabled, true, '干净态：吸底主按钮禁用');
  assert.equal(findClickable(bar(), '放弃改动').props.disabled, true, '干净态：吸底次按钮禁用');
  assert.equal(JSON.stringify(bar()).includes('没有未保存的改动'), false, '脏读数只放页头，不放吸底条');
  await page.edit('dshmn-recipients', 'you@example.com');
  assert.equal(findClickable(bar(), '保存').props.disabled, false, '有改动时吸底主按钮点得动');
  assert.equal(findClickable(bar(), '放弃改动').props.disabled, false, '有改动时吸底次按钮也点得动');
  await page.click('放弃改动');
  assert.equal(findClickable(bar(), '保存').props.disabled, true, '放弃之后又回到禁用');
});

test('渲染冒烟：保存读数按量级退化——320 秒说「5 分钟前」', async () => {
  const realNow = Date.now;
  const t0 = 1_700_000_000_000;
  Date.now = () => t0;
  const page = await renderPage({ credentialsConfigured: true });
  try {
    await page.edit('dshmn-recipients', 'you@example.com');
    await page.click('保存');
    assert.equal(page.json().includes('已保存 · 刚刚'), true, '刚存完就是刚刚');
    Date.now = () => t0 + 320_000;
    await page.settle();
    assert.equal(page.json().includes('已保存 · 5 分钟前'), true, '320 秒要说 5 分钟前');
    assert.equal(page.json().includes('秒前'), false, '不该让人去数 320 秒');
    Date.now = () => t0 + (60 * 60 * 1000) * 3;
    await page.settle();
    assert.equal(page.json().includes('已保存 · 3 小时前'), true, '超过一小时就按小时报');
    Date.now = () => t0 + (24 * 60 * 60 * 1000) * 2;
    await page.settle();
    assert.equal(page.json().includes('已保存 · 2 天前'), true, '超过一天就按天报');
  } finally {
    Date.now = realNow;
    page.stop();
  }
});

test('渲染冒烟：保存组在页头右上，判决条里不再有保存按钮', async () => {
  const page = await renderPage();
  const header = page.findBy((props) => props.className === 'dshmn-head');
  const verdict = page.findBy((props) => props.className === 'dshmn-verdict');
  assert.ok(header !== null && verdict !== null, '页头与判决条都要在');
  assert.equal(findClickable(header, '保存') !== null, true, '「保存」要落在页头');
  assert.equal(findClickable(header, '放弃改动') !== null, true, '「放弃改动」要和它并排');
  assert.equal(JSON.stringify(header).includes('没有未保存的改动'), true, '脏读数也在页头那一行');
  assert.equal(findClickable(verdict, '保存'), null, '判决条里不许再有保存按钮');
  assert.equal(findClickable(verdict, '放弃改动'), null, '判决条里也不许再有放弃改动');
  assert.equal(findClickable(verdict, '发送测试邮件') !== null, true, '判决条留下的是那一处测试入口');
});

test('渲染冒烟：「发送测试邮件」两处并存——判决条主按钮 + 凭据行文字链接', async () => {
  const ready = await renderPage({ credentialsConfigured: true });
  assert.equal((ready.json().match(/发送测试邮件/g) ?? []).length, 2,
    '就绪态两处：判决条那一处 + 授权码那一处（手刚离开输入框就在原地验证）');
  const drafting = await renderPage();
  const json = drafting.json();
  assert.equal((json.match(/发送测试邮件/g) ?? []).length, 2, '没配好时同样是两处，入口不挑状态');
  assert.equal((json.match(/重新测试/g) ?? []).length, 0, '没点过就不该出现「重新测试」');
});

test('渲染冒烟：7 个邮箱服务商全在（6 个预设 + 其他），一行 chips', async () => {
  const page = await renderPage();
  const chips = page.findAllBy((props) => props.active !== undefined && typeof props.onClick === 'function');
  assert.equal(chips.length, 7, '6 个预设 + 「其他」，实际 ' + String(chips.length));
  const json = page.json();
  for (const name of ['QQ 邮箱', '163 邮箱', '126 邮箱', 'Gmail', 'Outlook', 'iCloud', '其他']) {
    assert.equal(json.includes(name), true, '「' + name + '」不能少');
  }
  assert.equal(chips.filter((item) => item.props.active === true).length, 1, '同时只有一个服务商高亮');
});
