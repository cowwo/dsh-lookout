/**
 * dsh-lookout · 宿主侧流式下载路由
 *
 * 一条精确的 Fetch 路由 `GET|HEAD /api/lookout.download`，把**某个会话 cwd 之内**的
 * 一个普通文件流式发给浏览器（内存恒定：createReadStream → Readable.toWeb → Response）。
 *
 * 三条硬约束（改代码时别动）：
 *   1. 路径逐段必须匹配 [A-Za-z0-9_$.-]+，且宿主强制 `/api/` 前缀——所以是
 *      `/api/lookout.download` 这个字面量，不能把参数拼进路径。
 *   2. **不要把 connection/fs 塞进 lib/index.js 顶层的 inject 数组**：那会让没有 web 载体的
 *      组合（CLI）一直等不到服务、卡死插件加载。这里用 ctx.inject 局部等待。
 *   3. 放行判定是"词法归一化 + realpath"两道：只有词法那道挡不住符号链接逃逸。
 *
 * 错误码：缺参/非绝对路径 400；越界或非普通文件 403；不存在 404；其它 500（只 warn 一次，不吐堆栈）。
 */
import { createReadStream, fstat } from 'node:fs'
import { realpath } from 'node:fs/promises'
import { Readable } from 'node:stream'
import { basename, isAbsolute, normalize, sep } from 'node:path'

/** 路由路径：宿主强制 /api/ 前缀，且每段要过 [A-Za-z0-9_$.-]+ 校验。 */
export const DOWNLOAD_ROUTE_PATH = '/api/lookout.download'

/** 同一路由路径的短名（老调用方只认这个名字）。 */
export const DOWNLOAD_ROUTE = DOWNLOAD_ROUTE_PATH

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
	return `attachment; filename="${asciiFileName(name)}"; filename*=UTF-8''${encodeURIComponent(name || 'download')}`
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
 * 取会话 cwd。字段名现场确认过：dsh-session 的 Session 上是 `session.header.cwd`
 * （SessionHeader.cwd，创建时校验必须是绝对路径字符串）；`meta.cwd` / `cwd` 只作兜底。
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
 * 统一的错误响应：纯文本 + 禁缓存。
 * @param {number} status HTTP 状态码
 * @param {string} message 一行说明（不吐内部细节）
 * @returns {Response} 响应
 */
function errorResponse(status, message) {
	return new Response(message, {
		status,
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'private, no-store',
		},
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
 * 造一个下载 handler。
 *
 * deps 只为一件事存在：单测要数"到底有没有真去读文件"。生产路径不传，用 node:fs 的真身。
 * @param {object} ctx 上下文（真实 ctx / inject 回调里的 scoped / {fs, sessions} 直给对象）
 * @param {{createReadStream?: typeof createReadStream}} [deps] 可替换的底层流工厂
 * @returns {(request: Request) => Promise<Response>} Fetch handler
 */
export function createDownloadHandler(ctx, deps = {}) {
	const openStream = typeof deps.createReadStream === 'function' ? deps.createReadStream : createReadStream

	return async function handleDownload(request) {
		try {
			const signal = request.signal
			const params = new URL(request.url).searchParams
			const sessionId = params.get('sessionId')
			const requestedPath = params.get('path')

			// —— 400：参数这一关先过，不合法就不碰文件系统 ——
			if (sessionId === null || sessionId.length === 0) return errorResponse(400, 'missing sessionId')
			if (requestedPath === null || requestedPath.length === 0) return errorResponse(400, 'missing path')
			if (!isAbsolute(requestedPath)) return errorResponse(400, 'path must be absolute')
			// 尾随分隔符是"目录写法"：按"没有这个文件"处理，别让它走到 stat 再变成 500。
			if (/[\\/]$/.test(requestedPath)) return errorResponse(404, 'file not found')

			const sessions = serviceOf(ctx, 'sessions')
			if (sessions === undefined) return errorResponse(500, 'download unavailable: missing sessions service')

			// —— 403：会话或它的 cwd 拿不到，就没有边界可谈 ——
			const cwd = sessionWorkspace(sessions, sessionId)
			if (cwd === null) return errorResponse(403, 'session cwd unavailable')

			// —— 第一道：词法归一化（挡 .. 这类纯文本穿越） ——
			const root = normalize(cwd)
			const candidate = normalize(requestedPath)
			if (!withinRoot(root, candidate)) return errorResponse(403, 'path outside session cwd')

			const fs = serviceOf(ctx, 'fs')
			if (typeof fs?.resolve !== 'function' || typeof fs?.stat !== 'function' || typeof fs?.processPath !== 'function') {
				return errorResponse(500, 'download unavailable: missing fs service')
			}

			let target
			let rootTarget
			try {
				target = await fs.resolve(candidate, { signal })
				rootTarget = await fs.resolve(root, { signal })
			} catch (error) {
				if (isNotFound(error)) return errorResponse(404, 'file not found')
				throw error
			}

			// —— 第二道：realpath 之后仍在范围内（挡符号链接逃逸） ——
			// 双保险：既信后端的 processPath（本地后端本身就是 realpath 结果），
			// 也自己 realpath 一次，后端换成非 realpath 的实现时这道闸照样有效。
			const realRoot = String(fs.processPath(rootTarget))
			const hostPath = String(fs.processPath(target))
			const [realRootPath, realTargetPath] = await Promise.all([realPathOrSelf(realRoot), realPathOrSelf(hostPath)])
			if (!withinRoot(realRootPath, realTargetPath)) return errorResponse(403, 'path outside session cwd after realpath')

			let info
			try {
				info = await fs.stat(target, signal)
			} catch (error) {
				if (isNotFound(error) || error?.code === 'ENOTDIR' || error?.code === 'EISDIR') return errorResponse(404, 'file not found')
				throw error
			}
			if (info === undefined) return errorResponse(404, 'file not found')
			if (info.type !== 'file') return errorResponse(403, 'not a regular file')

			const fileName = basename(candidate)
			const headers = {
				'content-type': contentTypeOf(fileName),
				'content-disposition': contentDisposition(fileName),
				'cache-control': 'private, no-store',
			}
			// 后端不保证给 size；缺了就不写 content-length（宁可不写，也不写一个假的 0）。
			let declaredSize = 0
			if (typeof info.size === 'number' && Number.isFinite(info.size) && info.size >= 0) {
				declaredSize = info.size
				headers['content-length'] = String(info.size)
			}

			// HEAD 只要头：同样的 status + headers，body 必须为空，且**不打开文件**。
			if (request.method === 'HEAD') return new Response(null, { status: 200, headers })

			const stream = openStream(realTargetPath)
			// 打开后用同一个 fd 复核一次大小：stat 与 open 之间被换掉的极端情况，
			// 宁可断流也不要发出一份长度对不上的响应。
			stream.once('open', (fd) => {
				if (declaredSize === 0) return
				try {
					fstat(fd, (error, stats) => {
						if (error === null && stats !== undefined && stats.size !== declaredSize) stream.destroy(new Error('size changed while downloading'))
					})
				} catch { /* best effort */ }
			})
			stream.on('error', (error) => {
				const code = error?.code ?? ''
				// 客户端主动取消/连接被掐断是常态，不该刷日志。
				if (code === 'ERR_STREAM_PREMATURE_CLOSE' || code === 'ECONNRESET' || code === 'EPIPE' || error?.name === 'AbortError') return
				console.warn('[dsh-lookout] download stream failed:', code !== '' ? code : (error?.message ?? error))
			})
			return new Response(Readable.toWeb(stream), { status: 200, headers })
		} catch (error) {
			// 500 只说一句，不带堆栈：日志里也不要整段内部路径。
			console.warn('[dsh-lookout] download route failed:', error?.message ?? error)
			return errorResponse(500, 'download failed')
		}
	}
}

/**
 * 把下载路由挂到 connection 上。
 *
 * 用 ctx.inject 局部等 connection/fs/sessions：缺任何一个就不注册，而不是让整个插件
 * 卡在加载阶段（那正是不能把它们塞进顶层 inject 的原因）。
 * @param {object} ctx 插件上下文
 * @param {{createReadStream?: typeof createReadStream}} [deps] 仅单测使用
 * @returns {void}
 */
const REGISTERED_CONNECTIONS = new WeakSet()

export function registerDownloadRoute(ctx, deps = {}) {
	const attach = (scoped) => {
		const connection = serviceOf(scoped, 'connection')
		if (typeof connection?.fetch?.register !== 'function') return
		// 同一个 connection 只挂一次：宿主对重复路径会直接抛错，抛在 apply 里会带崩整个插件。
		if (REGISTERED_CONNECTIONS.has(connection)) return
		const route = {
			path: DOWNLOAD_ROUTE_PATH,
			methods: ['GET', 'HEAD'],
			requestBody: 'buffered',
			fetch: createDownloadHandler(scoped, deps),
		}
		const register = () => {
			if (REGISTERED_CONNECTIONS.has(connection)) return
			try {
				const dispose = connection.fetch.register(route)
				REGISTERED_CONNECTIONS.add(connection)
				return dispose
			} catch (error) {
				// 已经被别人占了同名路径（或宿主换了校验）：记一条，不拖累插件加载。
				console.warn('[dsh-lookout] download route not registered:', error?.code ?? error?.message ?? error)
				return undefined
			}
		}
		// 包一层 effect：插件卸载时路由跟着撤掉。
		if (typeof scoped?.effect === 'function') scoped.effect(register, `dsh-lookout: ${DOWNLOAD_ROUTE_PATH}`)
		else register()
	}
	if (typeof ctx?.inject === 'function') ctx.inject(['connection', 'fs', 'sessions'], attach)
	else attach(ctx)
}
