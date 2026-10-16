// 合并后 client/client.js 的形状：一层 IIFE 胶水 + 三段原文件逐字节保留（A/B/C）+ 一次合并注册。
//
// 为什么需要这个 helper：
//   B 的浏览器半单测（test/client.test.mjs、test/page-render.test.mjs）测的目标是
//   「原 dsh-notify-p 的浏览器半」。合并后这份代码变成了合并文件里的一段（字节与
//   B 原文件逐字节一致），而胶水层把三段的 inject 取并集、把三段的 apply 串联，
//   并且不再对外暴露各段自己的 __internals。所以这两个文件按分隔注释切出 B 段单独
//   执行——测的还是同一份字节，只是取源位置从「整个文件」变成「文件里的一段」。
//
// 断言一个字没改；合并胶水本身由 test/merged-client.test.mjs 覆盖。
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** 合并后的浏览器半边文件路径。 */
export const CLIENT_PATH = fileURLToPath(new URL('../client/client.js', import.meta.url));

/** 合并后的浏览器半边全文（源码审计类断言继续用它）。 */
export const CLIENT_SOURCE = readFileSync(CLIENT_PATH, 'utf8');

/** 三段在合并文件里的分隔注释（原样，勿改）。 */
const MARKERS = {
	a: { start: '1/3 原 dsh-icon-custom', end: '2/3 原 dsh-notify-p' },
	b: { start: '2/3 原 dsh-notify-p', end: '3/3 原 dsh-session-info' },
};

/**
 * 切出合并文件里某一段的正文（含该段的 `window.__ModuleLoader__.load({...})`）。
 * @param {'a'|'b'} part 段名：a = 原 dsh-icon-custom；b = 原 dsh-notify-p
 * @returns {string} 该段正文，字节与原文件一致
 */
export function partSource(part) {
	const marker = MARKERS[part];
	if (marker === undefined) throw new Error(`未知的段名：${String(part)}`);
	const at = CLIENT_SOURCE.indexOf(marker.start);
	const next = CLIENT_SOURCE.indexOf(marker.end, at + marker.start.length);
	if (at < 0 || next < 0) throw new Error(`合并文件里找不到 ${part} 段的分隔注释`);
	// 正文从分隔注释那一行之后开始，到下一段分隔注释那一行之前结束。
	const from = CLIENT_SOURCE.indexOf('\n', CLIENT_SOURCE.indexOf('*/', at)) + 1;
	const to = CLIENT_SOURCE.lastIndexOf('\n', next) + 1;
	if (from <= 0 || to <= from) throw new Error(`${part} 段切出来是空的`);
	return CLIENT_SOURCE.slice(from, to);
}

/**
 * 在假环境里执行合并文件里的某一段（等价于原来整文件 `import()`，
 * 但只跑这一段；每次调用都重新执行，不落 ESM 缓存）。
 * @param {'a'|'b'} part 段名
 * @returns {void}
 */
export function runPart(part) {
	// 合并文件是被宿主当 ESM 加载的，所以这里按严格模式执行，语义一致。
	new Function(`"use strict";\n${partSource(part)}`)();
}
