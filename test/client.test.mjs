// dsh-notify-p · 浏览器半的离线测试
//
// 浏览器半没有构建步骤，所以这里直接把 client.js 当 browser bundle 装进一个假环境里跑：
//   - 桩掉 window.__ModuleLoader__ / document，拿到 factory 与它返回的模块对象
//   - 用假 cordis ctx 驱动 apply()，断言三类依赖各自独立注册
//   - 纯函数（收件人解析 / 状态推导 / 预设匹配）走真值表
//   - 静态审计 CSS：用到的每个 --dsw-alias-* 必须是宿主主题里真实存在的 token
//
// 最后两条是有意的"复发护栏"：
//   1. 三个不存在的 token（interact-primary / interact-secondary / border-secondary）会静默
//      退回硬编码浅色值，暗色模式整页失配——已被 CSS 审计永久拦住。
//   2. 凭据的写入目标必须由调用方给定，不能从草稿里猜 smtpPasswordRef——否则引用名一改，
//      存的值就会写错位置，而页面一直显示「未配置」。源码断言拦住它。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { partSource, runPart } from './merged-client-parts.mjs';

const SOURCE_PATH = fileURLToPath(new URL('../client/client.js', import.meta.url));
const SOURCE = readFileSync(SOURCE_PATH, 'utf8');

/** 合并文件里 B 段（原 dsh-notify-p）的正文：命名空间这类断言只该看这一段。 */
const PART_B = partSource('b');

/** 宿主主题里真实存在的 alias token（取自 dsh-client-ui-theme 的 token 表）。 */
const THEME_TOKENS = new Set([
  '--dsw-alias-bg-base', '--dsw-alias-bg-layer-1', '--dsw-alias-bg-layer-2', '--dsw-alias-bg-layer-3',
  '--dsw-alias-bg-mask-1', '--dsw-alias-bg-mask-2', '--dsw-alias-bg-mask-3', '--dsw-alias-bg-mask-drop',
  '--dsw-alias-bg-mask-photo', '--dsw-alias-bg-module-platform', '--dsw-alias-bg-multi-select',
  '--dsw-alias-bg-overlay', '--dsw-alias-bg-skeleton', '--dsw-alias-border-inverted',
  '--dsw-alias-border-inverted2', '--dsw-alias-border-l1', '--dsw-alias-border-l2',
  '--dsw-alias-border-l2-darkmode-thin', '--dsw-alias-border-l3', '--dsw-alias-border-l4',
  '--dsw-alias-brand-primary', '--dsw-alias-brand-primary-invert', '--dsw-alias-brand-text',
  '--dsw-alias-button-contrast-fill', '--dsw-alias-button-elevated-fill', '--dsw-alias-button-floating-fill',
  '--dsw-alias-button-floating-hover', '--dsw-alias-button-ghost-active-border',
  '--dsw-alias-button-ghost-active-fill', '--dsw-alias-button-ghost-active-hover',
  '--dsw-alias-button-info-fill', '--dsw-alias-button-info-hover', '--dsw-alias-button-primary-dimmed',
  '--dsw-alias-button-primary-fill', '--dsw-alias-button-primary-hover', '--dsw-alias-button-tool-bar-fill',
  '--dsw-alias-button-tool-bar-fill-invisible', '--dsw-alias-button-tool-bar-hover',
  '--dsw-alias-interactive-bg-active', '--dsw-alias-interactive-bg-hover',
  '--dsw-alias-interactive-bg-hover-accent', '--dsw-alias-interactive-bg-hover-danger',
  '--dsw-alias-interactive-bg-hover-solid', '--dsw-alias-label-caption', '--dsw-alias-label-dimmed',
  '--dsw-alias-label-primary', '--dsw-alias-label-primary-bluish', '--dsw-alias-label-primary-dimmed',
  '--dsw-alias-label-primary-foreground', '--dsw-alias-label-primary-inverted', '--dsw-alias-label-secondary',
  '--dsw-alias-label-tertiary', '--dsw-alias-link', '--dsw-alias-markdown-citation',
  '--dsw-alias-markdown-code-block', '--dsw-alias-markdown-code-block-banner',
  '--dsw-alias-markdown-code-segment-selected', '--dsw-alias-markdown-code-segment-unselected',
  '--dsw-alias-markdown-inline-code', '--dsw-alias-markdown-placeholder', '--dsw-alias-markdown-tag',
  '--dsw-alias-scrollbar-bg-l1', '--dsw-alias-scrollbar-bg-l2', '--dsw-alias-scrollbar-hover-l1',
  '--dsw-alias-scrollbar-hover-l2', '--dsw-alias-state-business-primary', '--dsw-alias-state-business-tertiary',
  '--dsw-alias-state-error-primary', '--dsw-alias-state-error-secondary', '--dsw-alias-state-success-primary',
  '--dsw-alias-state-success-secondary', '--dsw-alias-state-success-tertiary', '--dsw-alias-state-warn-label',
  '--dsw-alias-state-warn-primary', '--dsw-alias-state-warn-secondary', '--dsw-alias-state-warn-tertiary',
  '--dsw-alias-toast-bg', '--dsw-alias-tooltip-bg',
]);

/**
 * 把浏览器 bundle 装进假环境并取回 factory。
 * @returns {{ mod: object, cssText: string, consoleWarns: string[] }} 模块对象与注入的 CSS
 */
async function loadBundle() {
  const injected = [];
  const consoleWarns = [];
  const originalWarn = console.warn;
  globalThis.window = { __ModuleLoader__: { load: (entry) => { injected.push(entry); } } };
  globalThis.document = {
    querySelector: () => null,
    createElement: () => ({ dataset: {}, style: {}, textContent: '' }),
    head: { appendChild: (element) => { injected.push(element); } },
  };
  console.warn = (...args) => { consoleWarns.push(args.map(String).join(' ')); };
  try {
    // 合并后 client/client.js = 三段逐字节保留 + 胶水层；本文件测的是 B 段，
    // 所以只执行 B 段（见 merged-client-parts.mjs 的说明）。每次调用都重新执行，计数从零开始。
    runPart('b');
    assert.equal(injected.length >= 1, true, 'bundle 必须调用 window.__ModuleLoader__.load');
    const entry = injected.find((item) => item && item.factory !== undefined);
    assert.ok(entry, '必须注册一个带 factory 的模块');
    const mod = entry.factory((id) => {
      if (id === 'react') return {};
      if (id === '@deepseek-ai/dsh-client-ui-primitives') return {};
      throw new Error(`未预期的 require：${id}`);
    });
    const style = injected.find((item) => item && item.textContent !== undefined && item.textContent !== '');
    return { mod, cssText: style?.textContent ?? '', consoleWarns };
  } finally {
    console.warn = originalWarn;
  }
}

/**
 * 最小可用的假 cordis 客户端上下文。
 * @param {{ failLocale?: boolean }} [opts] 开关
 * @returns {object} 假 ctx
 */
function fakeCtx(opts = {}) {
  const record = { injects: [], effects: [], registers: [], dicts: [], bound: [] };
  const slots = {
    inject(name, callback) { record.slotInject = name; callback(); return () => {}; },
    register(options, render) { record.registers.push({ options, render }); return () => {}; },
  };
  const locale = {
    register(ns, dicts) { record.dicts.push({ ns, dicts }); return () => {}; },
    bind(ns) { record.bound.push(ns); return (key) => key; },
    subscribe() { return () => {}; },
    getSnapshot() { return { id: 'zh', revision: 1 }; },
  };
  const ctx = {
    inject(services, callback) {
      record.injects.push(services);
      if (opts.failLocale === true && services.includes('locale')) throw new Error('locale 服务不可用');
      if (opts.failConnection === true && services.includes('connection')) throw new Error('connection 服务不可用');
      if (services.includes('locale')) callback({ locale });
      else if (services.includes('slots')) callback({ slots });
      else if (services.includes('connection')) callback({ connection: { rpc: { call: () => Promise.resolve({ ok: true, value: {} }) } } });
      else callback({ remote: { settings: {}, credentials: {} } });
    },
    effect(fn, label) { record.effects.push(label); return fn(); },
  };
  return { ctx, record };
}

test('浏览器半：factory 返回 inject 与 apply，且只硬依赖 slots', async () => {
  const { mod } = await loadBundle();
  assert.deepEqual(mod.inject, ['slots'], '页面注册只该依赖 slots（硬约束 1）');
  assert.equal(typeof mod.apply, 'function');
});

test('浏览器半：apply 分四次注册依赖，页面注册不依赖 locale / remote / connection', async () => {
  const { mod } = await loadBundle();
  const { ctx, record } = fakeCtx();
  mod.apply(ctx);
  assert.deepEqual(record.injects, [
    ['remote', 'remote.settings', 'remote.credentials'],
    ['connection'],
    ['locale'],
    ['slots'],
  ], '每类依赖必须各自独立 inject');
  assert.equal(record.registers.length, 1);
  const { options } = record.registers[0];
  assert.equal(options.name, 'settings.section');
  assert.equal(options.id, 'mail-notify');
  assert.equal(options.order, 60);
  assert.equal(typeof options.label, 'function', 'label 传函数，宿主才能在切语言时重新解析');
});

test('浏览器半：connection 不可用时页面照常注册，只是测试邮件不可用', async () => {
  const { mod } = await loadBundle();
  const { ctx, record } = fakeCtx({ failConnection: true });
  mod.apply(ctx);
  assert.equal(record.registers.length, 1, 'connection 挂了不能连带把页面带走');
});

test('浏览器半：locale 服务不可用时，设置页依旧注册', async () => {
  const { mod } = await loadBundle();
  const { ctx, record } = fakeCtx({ failLocale: true });
  mod.apply(ctx);
  assert.equal(record.registers.length, 1, 'locale 挂了不能连带把页面带走');
  assert.equal(record.dicts.length, 0);
});

test('浏览器半：注册 zh 与 en 两套字典，键集合必须完全一致', async () => {
  const { mod } = await loadBundle();
  const { ZH, EN } = mod.__internals;
  assert.deepEqual(Object.keys(ZH).sort(), Object.keys(EN).sort(), 'zh / en 文案键必须一一对应');
  for (const [key, value] of Object.entries(ZH)) {
    assert.equal(typeof value, 'string', `${key} 必须是字符串`);
    assert.notEqual(value.trim(), '', `${key} 不能是空文案`);
  }
});

test('浏览器半：文案不做中英同屏', async () => {
  const { mod } = await loadBundle();
  const { ZH, EN } = mod.__internals;
  // 旧形态是 `中文 / English` 拼在一行；这里拦住"汉字段 + 斜杠 + 两个以上拉丁词"的写法。
  // 要求右侧是多词英文句子，才不会误伤 `$DSH_HOME/dsh-notify-p/state.json` 这类路径，
  // 以及 `（QQ / 163 / Gmail）` 这类并列专有名词。
  const bilingual = /\p{Script=Han}[^/]{0,60}\/\s*[A-Za-z]+(?:\s+[A-Za-z]+)+/u;
  for (const [key, value] of Object.entries(ZH)) {
    assert.equal(bilingual.test(value), false, `zh.${key} 疑似中英同屏：${value}`);
  }
  for (const [key, value] of Object.entries(EN)) {
    assert.equal(/[\u4e00-\u9fff]/.test(value), false, `en.${key} 里混进了中文：${value}`);
  }
});

test('CSS 审计：用到的每个 --dsw-alias-* 都必须是宿主主题里真实存在的 token', async () => {
  const { cssText } = await loadBundle();
  const used = [...new Set([...cssText.matchAll(/--dsw-alias-[a-z0-9-]+/g)].map((m) => m[0]))];
  assert.equal(used.length > 0, true, 'CSS 必须用到主题 token');
  const unknown = used.filter((token) => !THEME_TOKENS.has(token));
  assert.deepEqual(unknown, [], `用了主题里不存在的 token（暗色模式会失配）：${unknown.join(', ')}`);
});

test('CSS 审计：三个已证伪的 token 必须不再出现', async () => {
  const { cssText } = await loadBundle();
  for (const bogus of ['--dsw-alias-interact-primary', '--dsw-alias-interact-secondary', '--dsw-alias-border-secondary']) {
    assert.equal(cssText.includes(bogus), false, `${bogus} 在主题里不存在，会静默退回硬编码浅色值`);
  }
});

test('CSS 审计：全页零硬编码颜色，暗色完全交给主题 token', async () => {
  const { cssText } = await loadBundle();
  const hex = [...cssText.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
  assert.deepEqual(hex, [], `CSS 里不该出现硬编码颜色：${hex.join(', ')}`);
  for (const fn of ['rgb(', 'rgba(', 'hsl(']) {
    assert.equal(cssText.includes(fn), false, `不该出现硬编码颜色函数：${fn}`);
  }
});

test('CSS 审计：不许在 :root 上套 var() 别名', async () => {
  const { cssText } = await loadBundle();
  // 真踩过，而且是整页"做废"的根因：宿主把 --dsw-alias-* 定义在 **body** 上，
  // 而自定义属性里的 var() 是在**声明它的那个元素**上求值的。于是
  //   :root{--dshmn-surface:var(--dsw-alias-bg-layer-1)}
  // 在 html 上求值 → 找不到 → 整条链变成空值 → 结论卡背景 transparent（等于没有高亮块）、
  // 发丝线回退到 currentColor、输入框没有描边。规则里直接引用 token 才走继承链。
  const aliases = [...cssText.matchAll(/:root\s*\{[^}]*--[a-z-]+\s*:\s*var\(/g)].map((m) => m[0]);
  assert.deepEqual(aliases, [], ':root 上的 var() 别名会静默失效；直接在规则里引用 --dsw-alias-*');
});

test('CSS 审计：判决条必须落在宿主真实的 module 面上', async () => {
  const { cssText } = await loadBundle();
  // 浅色主题下 bg-layer-1 / bg-layer-2 / bg-layer-3 **全是纯白**，跟页面底色一模一样。
  // 所以"高亮块"只能用 bg-module-platform（#f5f6f7 / #353638）。这条拦住"又用白色当高亮"。
  const rule = /\.dshmn-verdict\{[^}]*\}/.exec(cssText)?.[0] ?? '';
  assert.notEqual(rule, '', '必须有 .dshmn-verdict 规则');
  assert.match(rule, /background:\s*var\(--dsw-alias-bg-module-platform\)/,
    '全页唯一的高亮块必须有真实底色（背景层 token 在浅色下都是白的）');
});

test('源码护栏：凭据写入目标必须由调用方给定，不能猜 smtpPasswordRef', () => {
  assert.equal(
    SOURCE.includes('commitCredential(ref)'),
    true,
    '凭据提交必须显式传引用名',
  );
  assert.equal(
    /draftRef\.current\.smtpPasswordRef\s*\?\?/.test(SOURCE),
    false,
    '不许从草稿里 fallback 出 smtpPasswordRef 当作写入目标（引用名一改就会写错位置）',
  );
});

test('源码护栏：客户端半边不再有 log / resend 通道的痕迹', () => {
  // 发送通道只剩 SMTP：任何 Resend、只记录、通道选择器都不该留在这一页。
  assert.equal(/resend/i.test(SOURCE), false, 'Resend 相关的 UI / 逻辑必须清干净');
  assert.equal(SOURCE.includes('simulated'), false, '不再有「只记录」那一档状态');
  assert.equal(/draft\.transport|draftRef\.current[^\n]*\.transport/.test(SOURCE), false, '不能再读草稿里的 transport');
  assert.equal(/'transport\.(label|log|smtp|resend)'/.test(SOURCE), false, '通道分段的文案键必须删干净');
  assert.equal(/act\.chooseTransport/.test(SOURCE), false, '不再有「选真实通道」这个动作');
});

test('源码护栏：每个开关的可访问名都来自文案，而不是字段 key', () => {
  assert.equal(/\blabel:\s*key\b/.test(SOURCE), false, 'aria-label 不能直接用字段 key');
  // 开关行改由页内 outcomeRow 拼（说明收进问号），可访问名从"标题文案键"来——
  // 仍然是文案、不是字段名，这一条盯的就是这个区别。
  assert.equal(/label:\s*t\(/.test(SOURCE), true, '开关的可访问名必须走文案');
});

test('纯函数：parseRecipients 与 Host 侧规则一致（去空、去重、分拣非法项）', async () => {
  const { parseRecipients } = (await loadBundle()).mod.__internals;
  assert.deepEqual(parseRecipients('a@b.com'), { valid: ['a@b.com'], invalid: [] });
  assert.deepEqual(parseRecipients('a@b.com\nc@d.com'), { valid: ['a@b.com', 'c@d.com'], invalid: [] });
  assert.deepEqual(parseRecipients('a@b.com, c@d.com; e@f.com'), { valid: ['a@b.com', 'c@d.com', 'e@f.com'], invalid: [] });
  assert.deepEqual(parseRecipients(' A@B.com \n a@b.com '), { valid: ['A@B.com'], invalid: [] }, '去重不分大小写');
  // 逗号是合法的分隔符，所以"逗号打成点"的笔误会裂成两段；这是与 Host 侧一致的既定行为，
  // 页面上会逐条列出，而不是笼统说一句"格式不对"。
  assert.deepEqual(parseRecipients('cowwo@outlook,com'), { valid: [], invalid: ['cowwo@outlook', 'com'] });
  assert.deepEqual(parseRecipients('nope\nyes@ok.com'), { valid: ['yes@ok.com'], invalid: ['nope'] });
  assert.deepEqual(parseRecipients(''), { valid: [], invalid: [] });
  assert.deepEqual(parseRecipients(undefined), { valid: [], invalid: [] });
  assert.deepEqual(parseRecipients('   \n , ; '), { valid: [], invalid: [] });
});

test('纯函数：deriveStatus 真值表覆盖每个状态分支', async () => {
  const { deriveStatus } = (await loadBundle()).mod.__internals;
  // 发送方式只有 SMTP，所以入参里也没有 transport；账本删掉之后也没有"上次失败"——
  // 状态集合就是下面这六个，判决只回答"配置齐不齐"。
  const base = { enabled: true, recipientCount: 1, host: 'smtp.qq.com', user: 'me@qq.com', credentialConfigured: true };
  assert.equal(deriveStatus({ ...base, enabled: false }), 'disabled');
  assert.equal(deriveStatus({ ...base, recipientCount: 0 }), 'needRecipients');
  assert.equal(deriveStatus({ ...base, host: '' }), 'needHost');
  assert.equal(deriveStatus({ ...base, host: '   ' }), 'needHost', '只有空白的地址等于没填');
  assert.equal(deriveStatus({ ...base, user: '' }), 'needUser', 'SMTP 缺用户名同样是没配完');
  assert.equal(deriveStatus({ ...base, user: '  ' }), 'needUser');
  assert.equal(deriveStatus({ ...base, credentialConfigured: false }), 'needCredential');
  assert.equal(deriveStatus({ ...base, host: '', credentialConfigured: false }), 'needHost', '先报主机，不越级报凭据');
  assert.equal(deriveStatus({ ...base, lastDelivery: { ok: false, error: '535' } }), 'ready',
    '投递历史已随账本删除：传进来也不再影响判决');
  assert.equal(deriveStatus(base), 'ready');
  assert.equal(deriveStatus(undefined), 'disabled');
  // 判定顺序：先关、再收件人、再 SMTP 的必填项
  assert.equal(deriveStatus({ ...base, enabled: false, recipientCount: 0, host: '' }), 'disabled');
  assert.equal(deriveStatus({ ...base, recipientCount: 0, host: '' }), 'needRecipients');
});

test('纯函数：预设匹配与按邮箱猜预设', async () => {
  const { matchPreset, presetForAddress, PRESETS } = (await loadBundle()).mod.__internals;
  assert.equal(matchPreset('smtp.qq.com')?.id, 'qq');
  assert.equal(matchPreset('SMTP.QQ.COM')?.id, 'qq', '匹配忽略大小写');
  assert.equal(matchPreset('  smtp.gmail.com '), PRESETS.find((p) => p.id === 'gmail'));
  assert.equal(matchPreset('smtp.example.com'), null);
  assert.equal(matchPreset(''), null);
  assert.equal(presetForAddress('me@outlook.com')?.id, 'outlook');
  assert.equal(presetForAddress('ME@QQ.COM')?.id, 'qq');
  assert.equal(presetForAddress('me@example.com'), null);
  assert.equal(presetForAddress('no-at-sign'), null);
});

test('纯函数：fmt 插值保留未知占位符', async () => {
  const { fmt } = (await loadBundle()).mod.__internals;
  assert.equal(fmt('共 {n} 个', { n: 3 }), '共 3 个');
  assert.equal(fmt('缺 {a} 和 {b}', { a: 'x' }), '缺 x 和 {b}');
  assert.equal(fmt('没有占位符'), '没有占位符');
});

test('纯函数：dotState 对不适用给 idle，而不是假警报', async () => {
  const { dotState } = (await loadBundle()).mod.__internals;
  assert.equal(dotState(true), 'done');
  assert.equal(dotState(false), 'warning');
  assert.equal(dotState(false, true), 'idle');
  assert.equal(dotState(true, true), 'idle');
});

test('源码护栏：发送测试邮件常驻，判决条主入口 + 凭据行弱入口两处并存', () => {
  // 曾经的形态：只有 statusKey 是 ready / lastFailed 时才渲染测试按钮，
  // 于是填了一半的人在页面上根本找不到"怎么验证"——而这恰恰是测试按钮最该出现的时候。
  assert.match(SOURCE, /const testButton = \(\s*[A-Za-z_$][A-Za-z0-9_$]*\s*\) => \{/, '必须有一个不挑状态的测试按钮构造函数');
  assert.equal(/statusKey === 'ready'[\s\S]{0,200}?act\.test/.test(SOURCE), false,
    '测试按钮不允许被 statusKey 门控');
  // 两处入口是刻意的，不是重复：判决条一处（主按钮，就绪/未就绪互斥）+ 凭据行一处
  // （文字链接，手刚离开授权码输入框就在原地验证，不必滚回页首）。删掉后者省不了高度，
  // 只会让人多滚一次——所以这里钉死"它必须还在"，防止后续"简化"又把它删掉。
  // 视觉骨架这一轮把判决条收成一个**主行动**（实心主按钮），所以源码里是两处调用点：
  // 判决条 + 凭据行。渲染出来「仍然只有两处」由 page-render.test.mjs 逐状态钉死
  // （就绪与未就绪各断言 === 2），这一条只保证源码里没有把任何一处丢掉。
  assert.equal((PART_B.match(/testButton\(/g) ?? []).length >= 2, true, '调用点至少两处（判决条一处 + 凭据行一处）');
  assert.equal(PART_B.includes("testButton({ variant: 'primary' })"), true, '判决条那一处必须是实心主按钮');
  assert.equal(PART_B.includes("testButton({ variant: 'link' })"), true, '凭据行的文字链接入口必须保留');
  assert.equal(SOURCE.includes("t('act.testHint')"), true, '常驻按钮要说清点了会发生什么');
});

// 本轮两处删除必须"删干净"：留着半截的 RPC 或半截的文案键，测试可能是绿的，
// 但页面还在向一个已经不存在的端点要账本。这里按字节把残留钉死。
test('源码护栏：投递账本与「高级」折叠区已整块删除', () => {
  // 账本：不再有 state 这条 RPC、不再有端点探活的告警、不再有「上次失败」这一档。
  assert.equal(/callRemote\('state'\)/.test(SOURCE), false, 'mailNotify/state 已随账本删除，客户端不能再调');
  assert.equal(SOURCE.includes('mailNotify 端点'), false, '端点探活的告警文案必须一起删');
  assert.equal(/lastFailed/.test(SOURCE), false, '「上次失败」这一档依赖账本，必须删掉');
  assert.equal(/evidence\.|最近一次发送|还没有试过/.test(SOURCE), false, '账本面板的读数键与标签必须删掉');
  assert.equal(SOURCE.includes("Host 未提供 mailNotify 能力"), true, '只有 test 一条 RPC 时，能力缺失仍要能报错');
  // 「高级」折叠区：四个旋钮（含时长下限）的字段名与折叠状态都不该再出现。
  for (const field of ['settleMs', 'minDurationMs', 'ratePerMinute', 'statePath', 'showAdvanced', 'customHost']) {
    assert.equal(SOURCE.includes(field), false, field + ' 属于已删除的「高级」/时长下限控件');
  }
  assert.equal(/group\.advanced|adv\./.test(SOURCE), false, '「高级」折叠区的文案键必须删掉');
  // 测试邮件的结果仍必须来自当场 RPC 返回，而不是账本快照。
  assert.equal(SOURCE.includes("callRemote('test')"), true, '发送测试邮件必须调 mailNotify/test');
  assert.equal(SOURCE.includes("t('test.sent')"), true, '成功结果要有自己的文案');
  assert.equal(SOURCE.includes("t('test.failed')"), true, '失败结果要有自己的文案');
});

// 本轮把「可选设置 → 发件人与链接」整块删了，顺手清了两处死代码（Sub 组件、test.transport）。
// 与账本那一轮同样的道理：留着半截的迁移函数或半个文案键，测试可能是绿的，
// 但页面上还挂着一块没有字段可绑的设置。这里按字节把残留钉死。
test('源码护栏：可选设置（发件人与链接）整块删除，Sub 与 test.transport 死代码一并清掉', () => {
  // 文案键：标题、清单、弹层、链接开关与地址提示，一套都不该留。
  for (const key of ['group.optional', 'group.sender', 'sender.name', 'sender.nameHint', 'sender.address',
    'sender.addressHint', 'sender.listLabel', 'sender.listHint', 'sender.empty', 'sender.add', 'sender.addTitle',
    'sender.editTitle', 'sender.save', 'sender.cancel', 'sender.inUse', 'sender.edit', 'sender.remove',
    'sender.nameUnset', 'sender.useThis', 'sender.issue.', 'link.enabled', 'link.base']) {
    assert.equal(SOURCE.includes(key), false, key + ' 属于已删除的「可选设置」');
  }
  // 实现：六个配置字段（Host 侧已删）、五个纯函数、五个页面回调和清单样式，一并清掉。
  for (const token of ['senders', 'activeSender', 'senderName', 'fromAddress', 'linkEnabled', 'publicBaseUrl',
    'migrateSenders', 'activeSenderAddress', 'senderIssue', 'senderCommit', 'senderRemove',
    'showSender', 'senderEdit', 'openSenderDialog', 'saveSenderDialog', 'pickSender', 'removeSender',
    'dshmn-sender']) {
    assert.equal(SOURCE.includes(token), false, token + ' 是已删除的发件人 / 链接实现');
  }
  // 死代码：Sub 组件定义后无人调用；test.transport 只有写入、全文件没有读取点。
  assert.equal(/function Sub\s*\(/.test(SOURCE), false, 'Sub 组件定义后无调用，属于死代码');
  assert.equal(/test\.transport/.test(SOURCE), false, 'test.transport 只写不读，属于死代码');
  assert.equal(/\btransport\s*:\s*''/.test(SOURCE), false, '测试态里不该再有 transport 字段');
});

test('源码护栏：凭据读失败要显形，不能静默停在「未配置」', () => {
  assert.equal(SOURCE.includes('setCredError'), true, '凭据状态读取失败必须有可见反馈');
  assert.equal(SOURCE.includes("t('save.credCheckFailed'"), true);
});

test('文案：代码里用到的键必须真的在字典里', async () => {
  const { mod } = await loadBundle();
  const { ZH, EN } = mod.__internals;
  // 死键审计只查了一个方向（字典里的键有没有人用），查不出反方向：
  // 代码里 t('recipients.placeholder') 而字典里没有这个键时，t() 会**把 key 原样返回**，
  // 于是页面上直接显示 "recipients.placeholder" 这串英文 —— 静态审计看不出来，只有渲染才暴露。
  const used = [...SOURCE.matchAll(/\bt\(\s*'([a-zA-Z][\w.]*)'/g)].map((m) => m[1]);
  assert.equal(used.length > 60, true, '至少该扫到几十个字面量键，否则是正则被改坏了');
  const missing = [...new Set(used)].filter((key) => !(key in ZH) || !(key in EN));
  assert.deepEqual(missing, [], `代码用了但字典里没有的键（页面上会显示原始 key）：${missing.join(', ')}`);
});

test('文案：字典里不允许留没人用的死键', async () => {
  const { mod } = await loadBundle();
  const { ZH } = mod.__internals;
  // 这几个键是按状态名动态拼出来的，静态扫描看不到，显式放行
  const dynamic = new Set([
    'status.disabled', 'status.needRecipients', 'status.needHost',
    'status.needUser', 'status.ready',
  ]);
  // 去掉两份字典本身之后，再看还有哪些键在代码里找不到
  const withoutDicts = SOURCE
    .replace(/const ZH = \{[\s\S]*?\n {4}\};/, '')
    .replace(/const EN = \{[\s\S]*?\n {4}\};/, '');
  // 模板串拼出来的键（t(`status.why.${key}`)）静态扫描同样看不到，要把固定前缀收集起来。
  // 真踩过：status.why.* 被当成死键删掉，页面直接显示原始 key。
  const prefixes = [...withoutDicts.matchAll(/t\(`([^`$]*)\$\{/g)].map((m) => m[1]);
  const unused = Object.keys(ZH).filter(
    (key) => !dynamic.has(key) && !prefixes.some((p) => p !== '' && key.startsWith(p)) && !withoutDicts.includes(`'${key}'`),
  );
  assert.deepEqual(unused, [], `字典里有没人用的死文案：${unused.join(', ')}`);
});

test('纯函数：账号域名与服务商对不上要能被看出来', async () => {
  const { accountMismatch, matchPreset, PRESETS } = (await loadBundle()).mod.__internals;
  const qq = matchPreset('smtp.qq.com');
  const outlook = matchPreset('smtp.office365.com');

  // 对不上：QQ 服务器 + outlook 账号（认证必然 535）
  assert.equal(accountMismatch(qq, 'cowwo@outlook.com'), true);
  // 对得上
  assert.equal(accountMismatch(qq, 'me@qq.com'), false);
  assert.equal(accountMismatch(qq, 'me@foxmail.com'), false, '同服务商的其他域名也算对得上');
  assert.equal(accountMismatch(outlook, 'me@hotmail.com'), false);
  // 大小写/空白
  assert.equal(accountMismatch(qq, ' ME@QQ.COM '), false);
  assert.equal(accountMismatch(qq, 'me@OUTLOOK.com'), true);
  // 没填 / 不成邮箱 / 没有预设：不吭声，别乱猜（自建中继是合法的）
  assert.equal(accountMismatch(qq, ''), false);
  assert.equal(accountMismatch(qq, 'not-an-email'), false);
  assert.equal(accountMismatch(null, 'me@qq.com'), false);
  // 预设表自洽：每个都带 domains
  for (const preset of PRESETS) {
    assert.equal(Array.isArray(preset.domains) && preset.domains.length > 0, true, `${preset.id} 缺 domains`);
  }
});

test('纯函数：预设推断用户名只在域名匹配时给值', async () => {
  const { userForPreset, matchPreset } = (await loadBundle()).mod.__internals;
  const qq = matchPreset('smtp.qq.com');
  assert.equal(userForPreset(qq, ['me@qq.com', 'other@outlook.com']), 'me@qq.com');
  assert.equal(userForPreset(qq, ['cowwo@outlook.com']), '', '收件人不是 QQ 邮箱就不能拿它当发件账号');
  assert.equal(userForPreset(qq, []), '');
  assert.equal(userForPreset(null, ['me@qq.com']), '');
});

// ── 本轮：DSH 0.2.1-rc.2 的设置模型 ─────────────────────────────────────────
// describe() 每一项的 ns 是 profile 入口 id（本插件是 lookout，不是老常量 dsh-notify-p），
// 所以客户端不能写死命名空间——只能按配置指纹认领自己的那一项。
// 注意：describe() 里的 schema 是 schema.toJSON() 快照（只有 uid/refs，没有 dict），
// 拿它当指纹永远认领不到——必须看 value 里的字段。
test('源码护栏：配置命名空间按 value 指纹认领，常量 NS 必须整块消失', () => {
  assert.equal(
    PART_B.includes("Object.hasOwn(d.value, 'smtpHost') && Object.hasOwn(d.value, 'smtpPasswordRef')"),
    true,
    '认领必须靠 value 指纹（smtpHost + smtpPasswordRef 是这一页独有的组合）',
  );
  assert.equal(
    PART_B.includes('d.schema.dict'),
    false,
    '不许拿 describe() 的 schema.dict 当指纹（toJSON 里没有 dict）',
  );
  assert.equal(PART_B.includes('item.ns === NS'), false, '不能再按写死的 ns 查找');
  assert.equal(PART_B.includes('const NS = '), false, '常量 NS 必须整块换掉');
  assert.equal(PART_B.includes('settings.mutate(NS'), false, '读写一律用认领到的 ns');
  assert.equal(PART_B.includes('settings.replace(NS'), false, '读写一律用认领到的 ns');
  assert.equal(PART_B.includes('bridge.settings.mutate(view.ns, ops, view.revision)'), true,
    'mutate 必须带发现到的 ns 与 revision');
  assert.equal(PART_B.includes('bridge.settings.replace(view.ns, {}, view.revision)'), true,
    '恢复默认同样用发现到的 ns');
});

// 编辑模型从「改一下立刻写」换成「显式保存」：控件只动草稿，写回只有 saveAll 一条路径。
test('源码护栏：显式保存——控件不再自动写回，写入口只有 saveAll 一条', () => {
  assert.equal(SOURCE.includes('commit([key])'), false, '按字段即时提交的 commit 必须删掉');
  assert.equal(SOURCE.includes("flush('"), false, '失焦兜底提交必须删掉');
  assert.equal(SOURCE.includes('TEXT_DEBOUNCE_MS'), false, '防抖写回已不存在，常量不许留');
  assert.equal(SOURCE.includes("'save.auto'"), false, '「改动即时生效」那套读数必须删掉');
  for (const key of ['act.save', 'act.discard', 'save.clean', 'save.saving', 'save.savedJust', 'save.retry']) {
    assert.equal(SOURCE.includes("t('" + key + "'"), true, key + ' 必须有对应的界面文案');
  }
  assert.equal(SOURCE.includes("t('save.dirty'"), true, '脏读数要报「有 N 项改动未保存」');
  // 一次保存只发一条 mutate；凭据的写入目标仍然由调用方给定。
  assert.equal(SOURCE.includes('const ops = diffOps(draftRef.current, baselineRef.current)'), true,
    '保存时取一次全量差异');
  assert.equal(SOURCE.includes('await commitCredential(ref)'), true, '凭据只在保存时按行写入');
  assert.equal(SOURCE.includes('draftRef.current.smtpPasswordRef ??'), false,
    '不许从草稿里 fallback 出 smtpPasswordRef 当作写入目标');
});

test('纯函数：diffOps 只吐与基线不同的字段，空值走 unset', async () => {
  const { diffOps } = (await loadBundle()).mod.__internals;
  assert.deepEqual(diffOps({ a: 1, b: 'x' }, { a: 1, b: 'x' }), [], '与基线一样就没有 ops');
  assert.deepEqual(diffOps({ a: 2 }, { a: 1 }), [{ op: 'set', path: ['a'], value: 2 }]);
  assert.deepEqual(diffOps({ a: 'x' }, {}), [{ op: 'set', path: ['a'], value: 'x' }]);
  assert.deepEqual(diffOps({ a: '' }, { a: 'x' }), [{ op: 'unset', path: ['a'] }]);
  assert.deepEqual(diffOps({}, { a: 'x' }), [{ op: 'unset', path: ['a'] }], '基线有、草稿没有 = 清掉覆盖');
  assert.deepEqual(diffOps({ a: null }, { a: 'x' }), [{ op: 'unset', path: ['a'] }]);
  assert.deepEqual(diffOps(undefined, undefined), []);
});

// ── 本轮：冲突恢复 / 读失败 / 半成功 / 判决条口径（源码级护栏） ────────────────
// 这四处各有一条"看起来做了、其实没做"的实现最容易混过去：
//   1. unwrap 把 RemoteError 的 code 丢掉 → 冲突无从判别，重试必然拿着旧 revision 再撞一次；
//   2. 读失败塞进 phase='error' → 读数冒充"保存失败"，而「重试」调 saveAll() 在 view===null 时直接 return；
//   3. 配置成功、凭据失败只报一句"保存失败" → 用户不知道哪一半已经落盘；
//   4. 判决条按草稿算 → 草稿填齐就说可以发信，测试邮件却用已保存配置，一点就失败。
test('源码护栏：冲突判别靠 RemoteError 的 code，读失败自成一档', () => {
  assert.equal(PART_B.includes("if (typeof error.code === 'string') failure.code = error.code;"), true,
    'unwrap 必须把 RemoteError 的 code 带出来（丢了就无从判别冲突）');
  assert.equal(PART_B.includes("code === 'settings/conflict'"), true,
    '冲突的判别码是 settings/conflict（settings 控制器的真实错误码）');
  assert.equal(PART_B.includes('await load({ preserveDraft: true })'), true,
    '冲突时复用 load 的认领逻辑自动重读：草稿不动、基线对齐、revision 换新');
  assert.equal(PART_B.includes("phase: 'loadFailed'"), true, '读配置失败必须是独立的一档');
  assert.equal(/phase === 'loadFailed'[\s\S]{0,400}?void load\(\)/.test(PART_B), true,
    '「重新读取」必须调 load()，不能调 saveAll()');
});

test('源码护栏：判决条按已保存配置（baseline）判定，并说明草稿不参与', () => {
  assert.equal(PART_B.includes('const savedRecipients = parseRecipients(baseline.recipients);'), true,
    '判决条的收件人数必须取 baseline');
  assert.equal(/const statusKey = deriveStatus\(\{\s*enabled: baseline\.enabled === true,/.test(PART_B), true,
    '判决条只认已保存的开关');
  assert.equal(PART_B.includes("t('status.unsavedDraft')"), true,
    '有未保存改动时要说明「未保存的改动不参与判定」');
  assert.equal(PART_B.includes("'act.testHint': '用已保存的配置真发一封"), true,
    '「发送测试邮件」的说明必须点明用的是已保存配置');
});

test('源码护栏：半成功分开报，两个方向各给各的重试', () => {
  for (const key of ['save.credFailed', 'save.configFailed', 'save.retryCred', 'save.retryConfig']) {
    assert.equal(PART_B.includes("t('" + key + "'"), true, key + ' 必须有对应文案');
  }
  assert.equal(PART_B.includes("phase: 'partialCred'"), true, '配置成了、凭据没成要自成一档');
  assert.equal(PART_B.includes("phase: 'partialConfig'"), true, '凭据成了、配置没成要自成一档');
});

test('源码护栏：恢复全部默认要清掉授权码草稿（否则立刻显示「有 1 项改动未保存」）', () => {
  const body = PART_B.slice(PART_B.indexOf('const resetAll'), PART_B.indexOf('const sendTest'));
  for (const call of ['setPwDraft({})', 'setPwClear({})', 'setPwEdit({})']) {
    assert.equal(body.includes(call), true, 'resetAll 必须清掉 ' + call);
  }
});

test('源码护栏：端口输入不接受非法字符（Number("46a") 是 NaN）', () => {
  assert.equal(PART_B.includes("!/^\\d+$/.test(raw)"), true, '端口只收数字，非法字符不进草稿');
  assert.equal(PART_B.includes("Number(event.target.value)"), false, '不再把原始输入直接 Number() 掉');
});


// ── 本轮：视觉与信息架构简化（中等档）────────────────────────────────────────
// 结构改动要留下痕迹，否则下一轮很容易"又长回去"。
test('源码护栏：BUILD 升到 ui17，判决条的保存组与旧折叠包装已删干净', () => {
  assert.equal(PART_B.includes("const BUILD = 'ui17';"), true, 'BUILD 必须升到 ui17（DOM 上的 data-build 是唯一能看出加载了哪一版的地方）');
  assert.equal(PART_B.includes('dshmn-verdictActions'), false, '判决条里的保存组（DOM + 样式）必须整块删掉');
  assert.equal(PART_B.includes('dshmn-disclose'), false, '旧折叠包装的样式与结构都不该留');
  assert.equal(PART_B.includes('function Disclosure('), false, '旧折叠组件已删（两处折叠都走页内 foldHead）');
  assert.equal(PART_B.includes('function Row('), false, '旧 Row 组件已删（开关行改成页内 outcomeRow）');
  assert.equal(PART_B.includes("h('header', { className: 'dshmn-head' }"), true, '页头是一个 header 容器（左标题右保存组）');
  assert.equal(/\.dshmn-chips\{[^}]*overflow-x:auto/.test(PART_B), true, '7 个预设必须排成一行横向滚动');
  assert.equal(/\.dshmn-two\{[^}]*grid-template-columns/.test(PART_B), true, '主机 + 用户名是两列');
  assert.equal(/\.dshmn-q\[aria-expanded=true\]/.test(PART_B), true, '问号要有展开态样式（点击后的反馈）');
});

// 这一轮只重做视觉骨架，字号阶梯换成宿主自己的网格（大小 / 行高 / 字重三条轴一起对）：
//   页标题 18/26·600 · 判决标题 18/26·600 · 卡片标题 14/22·500 · 行标题 14/22·400
//   字段标签 13/1.5·500（primary） · 说明 12/18 tertiary · chips 12/18 · 小读数 11/16
// 宿主全树 0 处 11.5px，所以这一条同时钉死「不许再出现半档字号」。
test('CSS 审计：字号阶梯落在宿主网格上，且全页没有半档字号', () => {
  const rule = (cls) => new RegExp('\\.' + cls + '\\{[^}]*\\}').exec(PART_B)?.[0] ?? '';
  const decl = (cls, prop) => new RegExp(prop + ':\\s*([^;}]+)').exec(rule(cls))?.[1]?.trim() ?? '';
  const size = (cls) => {
    const value = /^([\d.]+)px/.exec(decl(cls, 'font-size'));
    return value === null ? NaN : Number(value[1]);
  };
  const ladder = {
    pageTitle: size('dshmn-title'),
    verdictTitle: size('dshmn-verdictTitle'),
    cardTitle: size('dshmn-cardTitle'),
    rowTitle: size('dshmn-rowTitle'),
    label: size('dshmn-label'),
    hint: size('dshmn-hint'),
    chip: size('dshmn-segBtn'),
    stamp: size('dshmn-stamp'),
  };
  assert.deepEqual(ladder, {
    pageTitle: 18, verdictTitle: 18, cardTitle: 14, rowTitle: 14,
    label: 13, hint: 12, chip: 12, stamp: 11,
  }, '字号必须落在宿主网格上（18 / 14 / 13 / 12 / 11）');
  // 行高与字重是同一套层级的一部分：只看字号会漏掉「字号没降但行高不在网格上」那种怪。
  assert.deepEqual({
    title: decl('dshmn-title', 'font-weight'),
    titleLine: decl('dshmn-title', 'line-height'),
    cardWeight: decl('dshmn-cardTitle', 'font-weight'),
    cardLine: decl('dshmn-cardTitle', 'line-height'),
    rowWeight: decl('dshmn-rowTitle', 'font-weight'),
    rowLine: decl('dshmn-rowTitle', 'line-height'),
    labelWeight: decl('dshmn-label', 'font-weight'),
    labelLine: decl('dshmn-label', 'line-height'),
    hintLine: decl('dshmn-hint', 'line-height'),
    chipLine: decl('dshmn-segBtn', 'line-height'),
    stampLine: decl('dshmn-stamp', 'line-height'),
  }, {
    title: '600', titleLine: '26px',
    cardWeight: '500', cardLine: '22px',
    rowWeight: '400', rowLine: '22px',
    labelWeight: '500', labelLine: '1.5',
    hintLine: '18px', chipLine: '18px', stampLine: '16px',
  }, '行高与字重要和字号一起落在宿主网格上');
  assert.equal(cssTextIncludesHalfStep(), false, '宿主全树 0 处 11.5px，这一页也不许留半档字号');
});

/** PART_B 里是否还有 11.5 这种半档字号（写成函数是为了让上面的断言读起来像一句话）。 */
function cssTextIncludesHalfStep() {
  return PART_B.includes('font-size:11.5px') || PART_B.includes('font-size: 11.5px');
}

test('视觉骨架：三张描边卡片 + 760 内容列，段头线与页脚线整块删掉', () => {
  assert.equal((PART_B.match(/h\(Card, \{/g) ?? []).length, 3, '三张卡片：收件人 / 怎么发 / 什么时候发给我');
  assert.equal(PART_B.includes('dshmn-group'), false, '旧的「段头 + 发丝线」分组必须整块删掉');
  assert.match(PART_B, /\.dshmn-page\{[^}]*max-width:760px/, '内容列 max-width 760（宿主同款）');
  assert.match(PART_B, /\.dshmn-page\{[^}]*margin:0 auto/, '内容列居中');
  assert.match(PART_B, /\.dshmn-card\{[^}]*border:\.5px solid var\(--dsw-alias-border-l4\)/, '卡片靠 .5px 描边成立');
  assert.match(PART_B, /\.dshmn-card\{[^}]*border-radius:20px/, '卡片圆角 20');
  assert.match(PART_B, /\.dshmn-card\{[^}]*padding:14px 16px/, '卡片内边距 14 16');
  assert.equal(/\.dshmn-groupHead\{[^}]*border-bottom/.test(PART_B), false, '段头不许再画线');
  assert.equal(/\.dshmn-foot\{[^}]*border-top/.test(PART_B), false, '页脚不许再画线');
  assert.match(PART_B, /\.dshmn-row\{[^}]*padding:16px 0/, '开关行用 16px 上下内边距（宿主网格）');
  assert.match(PART_B, /\.dshmn-verdict \+ \.dshmn-card\{margin-top:16px\}/, '判决条与第一张卡片之间要有间距');
  assert.match(PART_B, /\.dshmn-card \+ \.dshmn-card\{margin-top:12px\}/, '卡片之间 gap 12');
  // 圆角只用宿主那几档；10 / 13 这种字面量一律不许再写。
  const radii = [...PART_B.matchAll(/border-radius:\s*([\d.]+)px/g)].map((m) => Number(m[1]));
  assert.deepEqual(radii.filter((value) => ![4, 8, 12, 16, 20, 28].includes(value)), [], '圆角只许 4/8/12/16/20/28');
  assert.equal(PART_B.includes('border-radius:50%'), true, '问号是圆点（50% 不算字面量档位）');
});

test('CSS 审计：判决条是三态 hero，竖条与标题色都由 state token 决定', () => {
  assert.equal(PART_B.includes('.dshmn-verdict[data-tone=done]{border-left-color:var(--dsw-alias-state-success-primary)}'), true);
  assert.equal(PART_B.includes('.dshmn-verdict[data-tone=warning]{border-left-color:var(--dsw-alias-state-warn-primary)}'), true);
  assert.equal(PART_B.includes('.dshmn-verdict[data-tone=idle]{border-left-color:var(--dsw-alias-label-tertiary)}'), true);
  assert.match(PART_B, /\.dshmn-verdict\{[^}]*border-left:3px solid/, '左侧 3px 状态色竖条');
  assert.match(PART_B, /\.dshmn-verdict\{[^}]*border-radius:20px/, '判决条圆角 20');
});