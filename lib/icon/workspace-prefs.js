/**
 * dsh-lookout · 工作区偏好(标签/隐藏/置顶)的宿主半
 *
 * 只干两件事:
 *   1. 把任意脏输入夹成一份**完整、可安全落盘**的偏好文档;
 *   2. 在 $DSH_HOME/custom-favicon/workspace-prefs.json 上读/写这份文档。
 *
 * 设计约束(与 unread.js 的规则开关同一条思路):
 *   * normalize 永不抛错 —— 文件被手改坏、客户端版本对不上,都只降级成默认值,
 *     绝不因为一条偏好把图标/红点这些主功能一起带崩;
 *   * 写盘 best effort —— 调用方(index.js)吞掉落盘错误,内存里的偏好照常生效;
 *   * 文档整份覆盖 —— 客户端每次提交完整文档,宿主不保留任何"上一版残留"。
 *
 * 文档形状(version 固定为 1):
 *   { "version": 1, "workspaces": { "<workspaceId>": { "tag", "color",
 *     "pinned", "hidden", "pinAnchor" } } }
 */
import { readFileSync } from 'node:fs'
import { mkdir, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

/** 文档版本。未来改结构时靠它整份丢弃旧文档,而不是猜字段。 */
export const WORKSPACE_PREFS_VERSION = 1

/** 与 library.json / unread.json 同目录:custom-favicon/。 */
export const WORKSPACE_PREFS_FILE = 'workspace-prefs.json'

/** 标签颜色白名单。非法颜色一律落到 gray,不猜"最接近的颜色"。 */
export const WORKSPACE_COLORS = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'gray']

/** 非法/缺省颜色。 */
export const WORKSPACE_COLOR_DEFAULT = 'gray'

/** 标签最多 6 个 Unicode 字符(不是 UTF-16 单元:emoji 也只算一个)。 */
export const WORKSPACE_TAG_MAX = 6

/** 工作区 id 长度上限(与客户端约定一致)。 */
export const WORKSPACE_ID_MAX = 200

/** 危险对象键:绝不能通过 JSON 里的 `__proto__` 改到原型。 */
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

/** 空文档。文件缺失/损坏/版本未知时都用它。 */
export function emptyWorkspacePrefs() {
	return { version: WORKSPACE_PREFS_VERSION, workspaces: {} }
}

/** 只留可打印字符:去掉控制字符(Cc),再 trim。 */
export function normalizeTag(input) {
	if (typeof input !== 'string') return ''
	const cleaned = input.replace(/\p{Cc}/gu, '').trim()
	return [...cleaned].slice(0, WORKSPACE_TAG_MAX).join('')
}

/** 颜色白名单,非法回落 gray。 */
export function normalizeColor(input) {
	return WORKSPACE_COLORS.includes(input) ? input : WORKSPACE_COLOR_DEFAULT
}

/**
 * 夹一个工作区条目。未知字段丢弃,坏类型一律降级:
 * tag 非法 → '';color 非法 → 'gray';pinned/hidden 非 true → false;
 * pinAnchor 非 string → null。
 */
export function normalizeWorkspaceEntry(input) {
	const source = input !== null && typeof input === 'object' && !Array.isArray(input) ? input : {}
	return {
		tag: normalizeTag(source.tag),
		color: normalizeColor(source.color),
		// 只认真正的 true:字符串 'true' / 1 都不能把工作区置顶或藏起来。
		pinned: source.pinned === true,
		hidden: source.hidden === true,
		pinAnchor: typeof source.pinAnchor === 'string' ? source.pinAnchor : null
	}
}

/** 工作区 id 是否可用:非空 string,长度不超过 200。 */
export function isValidWorkspaceId(input) {
	return typeof input === 'string' && input.length > 0 && input.length <= WORKSPACE_ID_MAX
}

/**
 * 把任意输入夹成完整文档 —— 永不抛错。
 * @param {unknown} input - 可能是 null、数组、字符串、缺字段、字段类型全错的对象,或一份旧文档
 * @returns {{ version: 1, workspaces: Record<string, { tag: string, color: string, pinned: boolean, hidden: boolean, pinAnchor: string | null }> }}
 */
export function normalizeWorkspacePrefs(input) {
	const document = emptyWorkspacePrefs()
	if (input === null || typeof input !== 'object' || Array.isArray(input)) return document
	const workspaces = input.workspaces
	if (workspaces === null || typeof workspaces !== 'object' || Array.isArray(workspaces)) return document
	for (const [workspaceId, entry] of Object.entries(workspaces)) {
		if (!isValidWorkspaceId(workspaceId) || UNSAFE_KEYS.has(workspaceId)) continue
		document.workspaces[workspaceId] = normalizeWorkspaceEntry(entry)
	}
	return document
}

/** 偏好文件路径(与图标库同目录)。 */
export function workspacePrefsFilePath(storageDir) {
	return join(storageDir, WORKSPACE_PREFS_FILE)
}

/**
 * 读偏好文档。文件缺失、空文件、坏 JSON、版本/结构不对 —— 一律返回空文档,绝不抛错。
 * 同步读:与 index.js 其余"启动时读一次"的文件保持一致,调用方不必等 Promise。
 */
export function readWorkspacePrefs(filePath) {
	try {
		const raw = readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '')
		return normalizeWorkspacePrefs(JSON.parse(raw))
	} catch {
		return emptyWorkspacePrefs()
	}
}

/**
 * 原子写偏好文档:先写 `<file>.tmp`,再 rename 覆盖正式文件,
 * 这样进程在写一半时被杀也不会留下半截 JSON(照 unread-seen.json 的写法)。
 * 失败会 throw,由调用方决定是否吞掉 —— 偏好文件是 advisory(尽力而为)。
 */
export async function writeWorkspacePrefs(filePath, prefs) {
	const document = normalizeWorkspacePrefs(prefs)
	await mkdir(dirname(filePath), { recursive: true })
	const tmp = `${filePath}.tmp`
	await writeFile(tmp, JSON.stringify(document, null, 2))
	await rename(tmp, filePath)
	return document
}
