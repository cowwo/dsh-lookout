/**
 * dsh-lookout · 宿主侧票据下载路由
 *
 * 两条精确的 Fetch 路由：
 *   POST /api/lookout.ticket                   签发一次性票据（JSON in → JSON out）
 *   GET|HEAD /api/lookout.download?ticket=...  用票据换一个限时下载会话
 *
 * 为什么要有票据这一层：老路由把 sessionId/path 直接放在 query 里，任何能发请求的
 * 页面都能拼一条 URL 去读别人工作区里的文件。现在 URL 里只有一个不可猜的随机串，
 * 服务端只存它的 SHA-256，并且第一次 GET 之后就把票据换成"限时 + 限次"的会话。
 *
 * 五条硬约束（改代码时别动）：
 *   1. 路径逐段必须匹配 [A-Za-z0-9_$.-]+，且宿主强制 /api/ 前缀——所以是
 *      '/api/lookout.download' 这个字面量，不能把参数拼进路径。
 *   2. **不要把 connection/fs 塞进 lib/index.js 顶层的 inject 数组**：那会让没有 web 载体的
 *      组合（CLI）一直等不到服务、卡死插件加载。这里用 ctx.inject 局部等待。
 *   3. 放行判定是"词法归一化 + realpath"两道：只有词法那道挡不住符号链接逃逸。
 *   4. 票据只在服务端以 SHA-256 十六进制形式存在，日志里一个字都不许出现。
 *   5. 清理定时器必须 unref，disposer 必须把它清掉，否则插件卸载后进程退不出去。
 *
 * 错误码：
 *   签发：缺参/非绝对路径/JSON 坏掉 400；越界或非普通文件 403；不存在 404；其它 500。
 *   下载：缺 ticket 400；查不到（过期/不存在/已用尽，一律不区分）410；其它同上。
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { createReadStream, fstat } from 'node:fs'
import { realpath } from 'node:fs/promises'
import { Readable } from 'node:stream'
import { basename, isAbsolute, normalize, sep } from 'node:path'

/** 下载路由路径：宿主强制 /api/ 前缀，且每段要过 [A-Za-z0-9_$.-]+ 校验。 */
export const DOWNLOAD_ROUTE_PATH = '/api/lookout.download'

/** 同一路由路径的短名（老调用方只认这个名字）。 */
export const DOWNLOAD_ROUTE = DOWNLOAD_ROUTE_PATH

/** 签发路由路径。 */
export const TICKET_ROUTE_PATH = '/api/lookout.ticket'

/** 未兑换票据的存活时间：5 分钟。 */
export const TICKET_TTL_MS = 5 * 60 * 1000

/** 兑换后下载会话的存活时间：10 分钟。 */
export const SESSION_TTL_MS = 10 * 60 * 1000

/** 一个下载会话里允许的 GET 次数（首次兑换那次不计数）。 */
export const SESSION_QUOTA = 32

/** 同一个会话里最多存多少张未兑换票据，超出踢最旧的。 */
export const MAX_TICKETS_PER_SESSION = 32

/** 全局最多存多少条 entry（票据 + 会话共用）。 */
export const MAX_ENTRIES = 512

/** 空闲清理周期。 */
export const SWEEP_INTERVAL_MS = 60 * 1000

/** 认不出扩展名时一律给这个，避免浏览器瞎猜。 */
const DEFAULT_CONTENT_TYPE = 'application/octet-stream'

/**
 * 最小扩展名映射。只有一张表，不做内容嗅探：下载场景里"猜错"比"给 stream"更糟。
 * @type {Record<string, string>}
 */
const CONTENT_TYPES = {
	'.txt': 'text/plain',
	'.md': 'text/markdown',
	'.json': 'application/json',
	'.csv': 'text/csv',
	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'text/javascript',
	'.mjs': 'text/javascript',
	'.xml': 'application/xml',
	'.yaml': 'text/yaml',
	'.yml': 'text/yaml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml',
	'.pdf': 'application/pdf',
	'.zip': 'application/zip',
	'.gz': 'application/gzip',
	'.mp3': 'audio/mpeg',
	'.wav': 'audio/wav',
	'.mp4': 'video/mp4',
}

/**
 * 按扩展名给出 content-type。
 * @param {string} fileName 文件名（大小写不敏感）
 * @returns {string} MIME 类型；认不出给 application/octet-stream
 */
export function contentTypeOf(fileName) {
	const dot = fileName.lastIndexOf('.')
	if (dot <= 0) return DEFAULT_CONTENT_TYPE
	return CONTENT_TYPES[fileName.slice(dot).toLowerCase()] ?? DEFAULT_CONTENT_TYPE
}

/**
 * content-disposition 里 filename="..." 那份的 ASCII 兜底：
 * 非可见 ASCII 与引号/反斜杠一律换成下划线，空名字退回 download。
 * @param {string} fileName 原始文件名
 * @returns {string} 纯 ASCII 文件名
 */
export function asciiFileName(fileName) {
	const cleaned = String(fileName).replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_').trim()
	return cleaned.length === 0 ? 'download' : cleaned
}

/**
 * 拼完整的 content-disposition：ASCII 兜底 + RFC 5987 的 filename*（真名，中文不丢）。
 * @param {string} fileName 原始文件名
 * @returns {string} 头值
 */
export function contentDisposition(fileName) {
	const name = String(fileName ?? '')
	return 'attachment; filename="' + asciiFileName(name) + '"; filename*=UTF-8\'\'' + encodeURIComponent(name || 'download')
}

/**
 * 判定 candidate 是否落在 root 之内（root 自身算在内）。两边都应是已归一化的绝对路径。
 * @param {string} root 边界目录
 * @param {string} candidate 待判定路径
 * @returns {boolean} 是否在范围内
 */
export function withinRoot(root, candidate) {
	if (candidate === root) return true
	const base = root.endsWith(sep) ? root : root + sep
	return candidate.startsWith(base)
}

/**
 * 读一个宿主服务：先用 Reflect.get（普通对象与 ctx 都吃），再退回 ctx.get。
 * @param {object} ctx 上下文（真实 ctx、inject 回调里的 scoped，或 {fs, sessions} 这类直给对象）
 * @param {string} name 服务名
 * @returns {any} 服务实例或 undefined
 */
function serviceOf(ctx, name) {
	const direct = Reflect.get(ctx, name)
	if (direct !== undefined && direct !== null) return direct
	return typeof ctx?.get === 'function' ? ctx.get(name) : undefined
}

/**
 * 取会话 cwd。字段名现场确认过：dsh-session 的 Session 上是 session.header.cwd
 * （SessionHeader.cwd，创建时校验必须是绝对路径字符串）；meta.cwd / cwd 只作兜底。
 * @param {object|undefined} session ctx.sessions.get() 的返回值
 * @returns {string|undefined} 绝对路径 cwd
 */
export function sessionCwd(session) {
	if (session === null || typeof session !== 'object') return undefined
	const candidates = [session.header?.cwd, session.meta?.cwd, session.cwd]
	for (const value of candidates) if (typeof value === 'string' && value.length > 0) return value
	return undefined
}

/**
 * 取某个会话的工作区目录（下载的边界）。先 get，拿不到再在 list 里按 id 匹配一次。
 * @param {object|undefined} sessions ctx.sessions
 * @param {string} sessionId 会话 id
 * @returns {string|null} 绝对路径，取不到给 null
 */
export function sessionWorkspace(sessions, sessionId) {
	if (sessions === null || typeof sessions !== 'object') return null
	if (typeof sessions.get === 'function') {
		const cwd = sessionCwd(sessions.get(sessionId))
		if (cwd !== undefined) return cwd
	}
	if (typeof sessions.list === 'function') {
		for (const session of sessions.list() ?? []) {
			if (session?.header?.id === sessionId || session?.id === sessionId) {
				const cwd = sessionCwd(session)
				if (cwd !== undefined) return cwd
			}
		}
	}
	return null
}

/**
 * realpath 的"宽容版"：路径不存在/无权限时原样返回，让后面的 stat 去定 404。
 * @param {string} path 绝对路径
 * @returns {Promise<string>} realpath，或原路径
 */
async function realPathOrSelf(path) {
	try {
		return await realpath(path)
	} catch {
		return path
	}
}

/**
 * 统一的安全响应头。所有出口（含错误页）都要带上这一份。
 * @param {Record<string, string>} [extra] 追加的头
 * @returns {Record<string, string>} 头对象
 */
function securityHeaders(extra = {}) {
	return {
		'cache-control': 'no-store',
		'referrer-policy': 'no-referrer',
		'x-content-type-options': 'nosniff',
		...extra,
	}
}

/**
 * 统一的错误响应：纯文本 + 安全头（不吐内部细节）。
 * @param {number} status HTTP 状态码
 * @param {string} message 一行说明
 * @returns {Response} 响应
 */
function errorResponse(status, message) {
	return new Response(message, {
		status,
		headers: securityHeaders({ 'content-type': 'text/plain; charset=utf-8' }),
	})
}

/**
 * JSON 响应：签发接口与它的错误都用这一份，保证 content-type 与禁缓存一致。
 * @param {number} status HTTP 状态码
 * @param {unknown} payload 任意可序列化对象
 * @returns {Response} 响应
 */
function jsonResponse(status, payload) {
	return new Response(JSON.stringify(payload), {
		status,
		headers: securityHeaders({ 'content-type': 'application/json' }),
	})
}

/**
 * 把 fs 层的失败翻译成状态码：FS_NOT_FOUND / ENOENT 当"不存在"，其它交给外层 500。
 * @param {unknown} error 抛出的错误
 * @returns {boolean} 是否属于"不存在"
 */
function isNotFound(error) {
	const code = error !== null && typeof error === 'object' ? error.code : undefined
	return code === 'FS_NOT_FOUND' || code === 'ENOENT'
}

/**
 * 事件日志：只在调用方显式给了 logger 时才写，且只允许"事件 + 文件名"。
 * token / 哈希在任何情况下都不进日志——这一点由调用点的参数结构保证。
 * @param {object} deps 依赖包
 * @returns {(event: string, detail?: string) => void} 记录函数
 */
function createEventLogger(deps) {
	const sink = typeof deps?.logger === 'function' ? deps.logger : undefined
	return (event, detail) => {
		if (sink === undefined) return
		try {
			sink(event, detail)
		} catch {
			/* 日志不许影响主流程 */
		}
	}
}

// ───────────────────────── 票据 / 会话仓库 ─────────────────────────

/**
 * SHA-256(token) 的十六进制。服务端只存这个，原文一出生就丢。
 * @param {string} token 票据原文
 * @returns {string} 64 位小写十六进制
 */
export function hashToken(token) {
	return createHash('sha256').update(String(token)).digest('hex')
}

/**
 * 常量时间的十六进制比对：长度不等/非十六进制先返回假，再交给 timingSafeEqual。
 * @param {string} actual 候选值
 * @param {string} expected 期望值
 * @returns {boolean} 是否相等
 */
export function timingSafeEqualHex(actual, expected) {
	if (typeof actual !== 'string' || typeof expected !== 'string') return false
	if (actual.length !== expected.length || actual.length === 0) return false
	const left = Buffer.from(actual, 'hex')
	const right = Buffer.from(expected, 'hex')
	if (left.length === 0 || left.length !== right.length) return false
	return timingSafeEqual(left, right)
}

/**
 * 造一张票据仓库。注入时钟是为了让"过期"能在单测里被推进，而不是靠 sleep。
 *
 * entry 形态（票据期与会话期复用同一个对象，只换 kind）：
 *   { tokenHash, kind: 'ticket' | 'session', sessionId, path, filename, size,
 *     expiresAt, remaining, createdAt }
 *
 * @param {{
 *   now?: () => number,
 *   createToken?: () => string,
 *   ticketTtl?: number,
 *   sessionTtl?: number,
 *   sessionQuota?: number,
 *   maxPerSession?: number,
 *   maxEntries?: number,
 *   sweepInterval?: number,
 *   setInterval?: typeof setInterval,
 *   clearInterval?: typeof clearInterval,
 * }} [options] 覆盖项
 * @returns {object} 仓库
 */
export function createTicketStore(options = {}) {
	const now = typeof options.now === 'function' ? options.now : Date.now
	const ticketTtl = Number.isFinite(options.ticketTtl) ? options.ticketTtl : TICKET_TTL_MS
	const sessionTtl = Number.isFinite(options.sessionTtl) ? options.sessionTtl : SESSION_TTL_MS
	const sessionQuota = Number.isSafeInteger(options.sessionQuota) ? options.sessionQuota : SESSION_QUOTA
	const maxPerSession = Number.isSafeInteger(options.maxPerSession) ? options.maxPerSession : MAX_TICKETS_PER_SESSION
	const maxEntries = Number.isSafeInteger(options.maxEntries) ? options.maxEntries : MAX_ENTRIES
	const sweepInterval = Number.isFinite(options.sweepInterval) ? options.sweepInterval : SWEEP_INTERVAL_MS
	const issueToken = typeof options.createToken === 'function' ? options.createToken : () => randomBytes(32).toString('base64url')

	/** @type {Map<string, object>} key = SHA-256(token) 十六进制 */
	const entries = new Map()
	let timer

	/** 清掉所有已过期的 entry。 */
	const sweep = () => {
		const at = now()
		for (const [key, entry] of entries) if (entry.expiresAt <= at) entries.delete(key)
	}

	/** 第一次签发时才挂周期清理，并立刻 unref：绝不阻止进程退出。 */
	const ensureTimer = () => {
		if (timer !== undefined) return
		const schedule = typeof options.setInterval === 'function' ? options.setInterval : setInterval
		timer = schedule(() => {
			try {
				sweep()
			} catch {
				/* 清理失败不影响请求 */
			}
		}, sweepInterval)
		/** 定时器绝不能拖住进程退出。 */
		timer?.unref?.()
	}

	/**
	 * 按 hash 查一条 entry。过期即删；命中的那一条再用常量时间比一次哈希。
	 * @param {string} token 票据原文
	 * @returns {object|null} entry 或 null
	 */
	const lookup = (token) => {
		if (typeof token !== 'string' || token.length === 0) return null
		const tokenHash = hashToken(token)
		const entry = entries.get(tokenHash)
		if (entry === undefined) return null
		// Map 已经保证键相等，这里再比一次：把"比 token"这件事锁在常量时间实现里，
		// 而不是依赖 Map 的内部实现。
		if (!timingSafeEqualHex(tokenHash, entry.tokenHash)) return null
		if (entry.expiresAt <= now()) {
			entries.delete(entry.tokenHash)
			return null
		}
		return entry
	}

	/**
	 * 踢掉指定会话里最旧的未兑换票据，直到低于配额。
	 * @param {string} sessionId 会话 id
	 */
	const trimSessionTickets = (sessionId) => {
		const keys = []
		for (const [key, entry] of entries) {
			if (entry.kind === 'ticket' && entry.sessionId === sessionId) keys.push(key)
		}
		while (keys.length >= maxPerSession) entries.delete(keys.shift())
	}

	/** 全局超限时按插入顺序踢最旧的一条。 */
	const trimGlobal = () => {
		while (entries.size >= maxEntries) {
			const oldest = entries.keys().next()
			if (oldest.done === true) return
			entries.delete(oldest.value)
		}
	}

	return {
		/**
		 * 签一张票据。返回原文（只在这里出现一次）与过期时间。
		 * @param {{sessionId: string, path: string, filename: string, size?: number}} input 绑定信息
		 * @returns {{token: string, expiresAt: number}} 签发结果
		 */
		issue(input) {
			ensureTimer()
			sweep()
			const token = issueToken()
			const tokenHash = hashToken(token)
			trimSessionTickets(input.sessionId)
			trimGlobal()
			const createdAt = now()
			entries.set(tokenHash, {
				tokenHash,
				kind: 'ticket',
				sessionId: input.sessionId,
				path: input.path,
				filename: input.filename,
				size: input.size,
				expiresAt: createdAt + ticketTtl,
				remaining: 0,
				createdAt,
			})
			return { token, expiresAt: createdAt + ticketTtl }
		},

		/**
		 * 只看不动（HEAD 用）：过期/不存在都给 null，且不消费、不建会话。
		 * @param {string} token 票据原文
		 * @returns {object|null} entry 或 null
		 */
		peek: lookup,

		/**
		 * 原子地"消费票据 → 建下载会话"，或在既有会话里扣一次配额。
		 *
		 * - 票据期：kind 改成 'session'、续 10 分钟、remaining = 配额（本次不扣）。
		 * - 会话期：remaining > 0 则 -1；扣到 0 立刻删掉（之后 410）。
		 * - 过期 / 不存在 / 已用尽：null。
		 *
		 * 整个函数是同步的，Node 单线程下天然原子：不会出现"两个请求各拿到一半配额"。
		 * @param {string} token 票据原文
		 * @returns {object|null} 可用的 entry 或 null
		 */
		openForRead(token) {
			const entry = lookup(token)
			if (entry === null) return null
			if (entry.kind === 'ticket') {
				entry.kind = 'session'
				entry.expiresAt = now() + sessionTtl
				entry.remaining = sessionQuota
				// 配额为 0 表示"只允许这一次"：本次请求照常放行，但立刻让这条链接失效，
				// 免得它还能被 HEAD 探到（严格一次性场景）。
				if (sessionQuota === 0) entries.delete(entry.tokenHash)
				return entry
			}
			if (entry.remaining > 0) {
				entry.remaining -= 1
				if (entry.remaining === 0) entries.delete(entry.tokenHash)
				return entry
			}
			entries.delete(entry.tokenHash)
			return null
		},

		/**
		 * 当前 entry 数量（诊断用）。
		 * @returns {number} 条数
		 */
		size() {
			return entries.size
		},

		/** 清定时器 + 清数据；重复调用无害。 */
		dispose() {
			if (timer !== undefined) {
				const clear = typeof options.clearInterval === 'function' ? options.clearInterval : clearInterval
				try {
					clear(timer)
				} catch {
					/* 已经清过了 */
				}
				timer = undefined
			}
			entries.clear()
		},
	}
}

// ───────────────────────── Range ─────────────────────────

/**
 * 解析 Range 头。
 *
 * 只认 bytes=；支持 start-end / start- / -suffix。
 * 多段（含逗号）、越界、格式非法 → unsatisfiable（调用方回 416 + bytes * /size）。
 * 其它单位（如 items=）按 RFC 7233 忽略，当没带 Range 处理。
 *
 * @param {string|null|undefined} header Range 头原文
 * @param {number|undefined} size 文件总字节数；拿不到按 0 算（任何区间都不满足）
 * @returns {{kind: 'none'}|{kind: 'range', start: number, end: number}|{kind: 'unsatisfiable'}} 解析结果
 */
export function parseRange(header, size) {
	if (header === null || header === undefined) return { kind: 'none' }
	const raw = String(header).trim()
	if (raw.length === 0) return { kind: 'none' }
	const eq = raw.indexOf('=')
	if (eq < 0) return { kind: 'unsatisfiable' }
	if (raw.slice(0, eq).trim().toLowerCase() !== 'bytes') return { kind: 'none' }
	const spec = raw.slice(eq + 1).trim()
	if (spec.length === 0) return { kind: 'unsatisfiable' }
	// 多段：契约要求 416（客户端本来就是分段多线程下载，用不到多段响应）。
	if (spec.includes(',')) return { kind: 'unsatisfiable' }
	const match = /^(\d*)-(\d*)$/.exec(spec)
	if (match === null) return { kind: 'unsatisfiable' }
	const startText = match[1]
	const endText = match[2]
	if (startText.length === 0 && endText.length === 0) return { kind: 'unsatisfiable' }
	const total = typeof size === 'number' && Number.isFinite(size) && size >= 0 ? size : 0
	if (startText.length === 0) {
		const suffix = Number(endText)
		if (!Number.isSafeInteger(suffix) || suffix <= 0) return { kind: 'unsatisfiable' }
		if (total === 0) return { kind: 'unsatisfiable' }
		return { kind: 'range', start: Math.max(0, total - suffix), end: total - 1 }
	}
	const start = Number(startText)
	if (!Number.isSafeInteger(start) || start < 0 || start >= total) return { kind: 'unsatisfiable' }
	let end = total - 1
	if (endText.length > 0) {
		const parsed = Number(endText)
		if (!Number.isSafeInteger(parsed) || parsed < start) return { kind: 'unsatisfiable' }
		end = parsed > total - 1 ? total - 1 : parsed
	}
	return { kind: 'range', start, end }
}

// ───────────────────────── 路径放行 ─────────────────────────

/**
 * 把"会话 cwd + 一个绝对路径"变成可流式打开的宿主机真实路径。
 * 两道闸：词法归一化（挡 ..），realpath（挡符号链接逃逸）。
 *
 * @param {object} ctx 上下文
 * @param {{sessionId: string, requestedPath: string, signal?: AbortSignal}} options 请求要素
 * @returns {Promise<{ok: true, hostPath: string, fileName: string, size?: number}
 *   | {ok: false, response: Response}>} 结果或现成的错误响应
 */
async function resolveTarget(ctx, options) {
	const sessions = serviceOf(ctx, 'sessions')
	if (sessions === undefined) return { ok: false, response: errorResponse(500, 'download unavailable: missing sessions service') }

	// —— 403：会话或它的 cwd 拿不到，就没有边界可谈 ——
	const cwd = sessionWorkspace(sessions, options.sessionId)
	if (cwd === null) return { ok: false, response: errorResponse(403, 'session cwd unavailable') }

	// —— 第一道：词法归一化（挡 .. 这类纯文本穿越） ——
	const root = normalize(cwd)
	const candidate = normalize(options.requestedPath)
	if (!withinRoot(root, candidate)) return { ok: false, response: errorResponse(403, 'path outside session cwd') }

	const fs = serviceOf(ctx, 'fs')
	if (typeof fs?.resolve !== 'function' || typeof fs?.stat !== 'function' || typeof fs?.processPath !== 'function') {
		return { ok: false, response: errorResponse(500, 'download unavailable: missing fs service') }
	}

	let target
	let rootTarget
	try {
		target = await fs.resolve(candidate, { signal: options.signal })
		rootTarget = await fs.resolve(root, { signal: options.signal })
	} catch (error) {
		if (isNotFound(error)) return { ok: false, response: errorResponse(404, 'file not found') }
		throw error
	}

	// —— 第二道：realpath 之后仍在范围内（挡符号链接逃逸） ——
	// 双保险：既信后端的 processPath（本地后端本身就是 realpath 结果），
	// 也自己 realpath 一次，后端换成非 realpath 的实现时这道闸照样有效。
	const realRoot = String(fs.processPath(rootTarget))
	const hostPath = String(fs.processPath(target))
	const [realRootPath, realTargetPath] = await Promise.all([realPathOrSelf(realRoot), realPathOrSelf(hostPath)])
	if (!withinRoot(realRootPath, realTargetPath)) {
		return { ok: false, response: errorResponse(403, 'path outside session cwd after realpath') }
	}

	let info
	try {
		info = await fs.stat(target, options.signal)
	} catch (error) {
		if (isNotFound(error) || error?.code === 'ENOTDIR' || error?.code === 'EISDIR') {
			return { ok: false, response: errorResponse(404, 'file not found') }
		}
		throw error
	}
	if (info === undefined) return { ok: false, response: errorResponse(404, 'file not found') }
	if (info.type !== 'file') return { ok: false, response: errorResponse(403, 'not a regular file') }

	// 后端不保证给 size；缺了就留 undefined，让调用方决定"不写长度"还是 500。
	const size = typeof info.size === 'number' && Number.isFinite(info.size) && info.size >= 0 ? info.size : undefined
	return { ok: true, hostPath: realTargetPath, fileName: basename(candidate), size }
}

/**
 * 给流挂两个保护：打开后复核大小、错误日志过滤掉客户端取消。
 * @param {import('node:stream').Readable} stream 文件流
 * @param {number|undefined} declaredSize 之前 stat 出来的总大小
 * @returns {void}
 */
function guardStream(stream, declaredSize) {
	stream.once('open', (fd) => {
		if (declaredSize === undefined) return
		try {
			fstat(fd, (error, stats) => {
				// stat 与 open 之间文件被换掉：宁可断流，也不发一份长度对不上的响应。
				if (error === null && stats !== undefined && stats.size !== declaredSize) {
					stream.destroy(new Error('size changed while downloading'))
				}
			})
		} catch {
			/* best effort */
		}
	})
	stream.on('error', (error) => {
		const code = error?.code ?? ''
		// 客户端主动取消/连接被掐断是常态，不该刷日志。
		if (code === 'ERR_STREAM_PREMATURE_CLOSE' || code === 'ECONNRESET' || code === 'EPIPE' || error?.name === 'AbortError') return
		console.warn('[dsh-lookout] download stream failed:', code !== '' ? code : (error?.message ?? error))
	})
}

// ───────────────────────── handlers ─────────────────────────

/**
 * 造签发 handler：校验 → 放行 → stat → 签票。
 *
 * @param {object} ctx 上下文
 * @param {{store?: object, now?: () => number, logger?: Function}} [deps] 依赖（store 供测试注入）
 * @returns {(request: Request) => Promise<Response>} Fetch handler
 */
export function createTicketHandler(ctx, deps = {}) {
	const store = deps.store ?? createTicketStore({ now: deps.now })
	const log = createEventLogger(deps)

	return async function handleTicket(request) {
		try {
			let payload
			try {
				payload = await request.json()
			} catch {
				return jsonResponse(400, { error: 'invalid json' })
			}
			if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
				return jsonResponse(400, { error: 'invalid body' })
			}

			const sessionId = payload.sessionId
			const requestedPath = payload.path
			// —— 400：参数这一关先过，不合法就不碰文件系统 ——
			if (typeof sessionId !== 'string' || sessionId.length === 0) return jsonResponse(400, { error: 'missing sessionId' })
			if (typeof requestedPath !== 'string' || requestedPath.length === 0) return jsonResponse(400, { error: 'missing path' })
			if (!isAbsolute(requestedPath)) return jsonResponse(400, { error: 'path must be absolute' })
			// 尾随分隔符是"目录写法"：按"没有这个文件"处理，别让它走到 stat 再变成 500。
			if (/[\\/]$/.test(requestedPath)) return jsonResponse(404, { error: 'file not found' })

			const resolved = await resolveTarget(ctx, { sessionId, requestedPath, signal: request.signal })
			if (resolved.ok !== true) return resolved.response

			// Range 需要确切大小，签票阶段就定死；拿不到就别签，免得后面算错区间。
			if (typeof resolved.size !== 'number') return jsonResponse(500, { error: 'file size unavailable' })

			const issued = store.issue({
				sessionId,
				path: resolved.hostPath,
				filename: resolved.fileName,
				size: resolved.size,
			})
			// 日志只写事件 + 文件名；token / 哈希绝不进日志。
			log('ticket.issued', resolved.fileName)
			return jsonResponse(200, {
				url: DOWNLOAD_ROUTE_PATH + '?ticket=' + issued.token,
				expiresAt: issued.expiresAt,
				filename: resolved.fileName,
				size: resolved.size,
			})
		} catch (error) {
			console.warn('[dsh-lookout] ticket route failed:', error?.message ?? error)
			return jsonResponse(500, { error: 'ticket failed' })
		}
	}
}

/**
 * 造下载 handler：票据 → 会话 → Range → 流。
 *
 * deps 只为一件事存在：单测要数"到底有没有真去读文件"、要注入时钟与仓库。
 * 生产路径不传，用 node:fs 的真身。
 *
 * @param {object} ctx 上下文
 * @param {{createReadStream?: typeof createReadStream, store?: object, now?: () => number, logger?: Function}} [deps] 依赖
 * @returns {(request: Request) => Promise<Response>} Fetch handler
 */
export function createDownloadHandler(ctx, deps = {}) {
	const openStream = typeof deps.createReadStream === 'function' ? deps.createReadStream : createReadStream
	const store = deps.store ?? createTicketStore({ now: deps.now })
	const log = createEventLogger(deps)

	return async function handleDownload(request) {
		try {
			const params = new URL(request.url).searchParams
			const token = params.get('ticket')
			// 只认 ticket：sessionId / path 一概不看，杜绝"用票据绕过边界"这条路。
			if (token === null || token.length === 0) return errorResponse(400, 'missing ticket')

			// 先只看不动：票据不存在/过期/用尽一律 410，且不区分原因（防枚举）。
			const peeked = store.peek(token)
			if (peeked === null) return errorResponse(410, 'ticket gone')

			const resolved = await resolveTarget(ctx, {
				sessionId: peeked.sessionId,
				requestedPath: peeked.path,
				signal: request.signal,
			})
			if (resolved.ok !== true) return resolved.response

			// GET 才消费；HEAD 只读头，不动配额、不建会话。
			let entry = peeked
			if (request.method === 'HEAD') {
				if (peeked.kind !== 'ticket') log('download.head', peeked.filename)
			} else {
				const opened = store.openForRead(token)
				if (opened === null) return errorResponse(410, 'ticket gone')
				entry = opened
				log('download.started', entry.filename)
			}

			const fileName = resolved.fileName.length > 0 ? resolved.fileName : (entry.filename ?? 'download')
			const size = resolved.size
			const headers = securityHeaders({
				'content-type': contentTypeOf(fileName),
				'content-disposition': contentDisposition(fileName),
				'accept-ranges': 'bytes',
			})

			const range = parseRange(request.headers.get('range'), size)
			if (range.kind === 'unsatisfiable') {
				return new Response(request.method === 'HEAD' ? null : 'range not satisfiable', {
					status: 416,
					headers: securityHeaders({
						'content-type': 'text/plain; charset=utf-8',
						'accept-ranges': 'bytes',
						'content-range': 'bytes */' + (typeof size === 'number' ? size : 0),
					}),
				})
			}
			if (range.kind === 'range') {
				headers['content-range'] = 'bytes ' + range.start + '-' + range.end + '/' + size
				headers['content-length'] = String(range.end - range.start + 1)
				// HEAD 带 Range：同样的 206 + 区间头，body 为空，且**不打开文件**。
				if (request.method === 'HEAD') return new Response(null, { status: 206, headers })
				const stream = openStream(resolved.hostPath, { start: range.start, end: range.end })
				guardStream(stream, size)
				return new Response(Readable.toWeb(stream), { status: 206, headers })
			}

			// 无 Range：全文件 200（保持现状）；size 未知就不写 content-length。
			if (typeof size === 'number') headers['content-length'] = String(size)
			if (request.method === 'HEAD') return new Response(null, { status: 200, headers })
			const stream = openStream(resolved.hostPath)
			guardStream(stream, size)
			return new Response(Readable.toWeb(stream), { status: 200, headers })
		} catch (error) {
			// 500 只说一句，不带堆栈：日志里也不要整段内部路径。
			console.warn('[dsh-lookout] download route failed:', error?.message ?? error)
			return errorResponse(500, 'download failed')
		}
	}
}

// ───────────────────────── 注册 ─────────────────────────

/** 同一个 connection 只挂一次：宿主对重复路径会直接抛错。 */
const REGISTERED_CONNECTIONS = new WeakSet()

/**
 * 把签发 + 下载两条路由挂到 connection 上（同一个 effect 里，卸载时一并撤销）。
 *
 * 用 ctx.inject 局部等 connection/fs/sessions：缺任何一个就不注册，而不是让整个插件
 * 卡在加载阶段（那正是不能把它们塞进顶层 inject 的原因）。
 *
 * @param {object} ctx 插件上下文
 * @param {{createReadStream?: typeof createReadStream, store?: object, now?: () => number}} [deps] 仅单测使用
 * @returns {void}
 */
export function registerDownloadRoute(ctx, deps = {}) {
	const attach = (scoped) => {
		const connection = serviceOf(scoped, 'connection')
		if (typeof connection?.fetch?.register !== 'function') return
		// 同一个 connection 只挂一次：宿主对重复路径会直接抛错，抛在 apply 里会带崩整个插件。
		if (REGISTERED_CONNECTIONS.has(connection)) return

		const store = deps.store ?? createTicketStore({ now: deps.now })
		const ticketRoute = {
			path: TICKET_ROUTE_PATH,
			methods: ['POST'],
			requestBody: 'buffered',
			fetch: createTicketHandler(scoped, { ...deps, store }),
		}
		const downloadRoute = {
			path: DOWNLOAD_ROUTE_PATH,
			methods: ['GET', 'HEAD'],
			requestBody: 'buffered',
			fetch: createDownloadHandler(scoped, { ...deps, store }),
		}

		const register = () => {
			if (REGISTERED_CONNECTIONS.has(connection)) return undefined
			const disposers = []
			try {
				disposers.push(connection.fetch.register(ticketRoute))
				disposers.push(connection.fetch.register(downloadRoute))
				REGISTERED_CONNECTIONS.add(connection)
			} catch (error) {
				// 已经被别人占了同名路径（或宿主换了校验）：记一条，不拖累插件加载。
				console.warn('[dsh-lookout] download route not registered:', error?.code ?? error?.message ?? error)
				for (const dispose of disposers) {
					try {
						dispose?.()
					} catch {
						/* 回滚尽力而为 */
					}
				}
				store.dispose()
				return undefined
			}
			return () => {
				for (const dispose of disposers) {
					try {
						dispose?.()
					} catch {
						/* 撤销尽力而为 */
					}
				}
				// 清定时器 + 清票据：插件卸载后不留任何活物。
				store.dispose()
				REGISTERED_CONNECTIONS.delete(connection)
			}
		}

		// 包一层 effect：插件卸载时路由与定时器跟着撤掉。
		if (typeof scoped?.effect === 'function') scoped.effect(register, 'dsh-lookout: ' + DOWNLOAD_ROUTE_PATH)
		else register()
	}
	if (typeof ctx?.inject === 'function') ctx.inject(['connection', 'fs', 'sessions'], attach)
	else attach(ctx)
}
