// lib/download.js 的离线单测：不联网、不启服务，只用临时目录里的真文件。
//
// 一个假的宿主 ctx（connection.fetch.register 捕获路由、fs.resolve/stat/processPath 落到真文件系统、
// sessions.get 给一个固定 cwd），驱动真实的 handler。这样验证的是"判定逻辑 + 响应契约"，
// 而不是把实现抄一遍。
import test from 'node:test'
import assert from 'node:assert/strict'
import { createReadStream, mkdirSync, mkdtempSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
	DOWNLOAD_ROUTE,
	DOWNLOAD_ROUTE_PATH,
	contentDisposition,
	contentTypeOf,
	createDownloadHandler,
	registerDownloadRoute,
	sessionWorkspace,
} from '../lib/download.js'

const SESSION_ID = 'sess-a'
const HOST = 'http://127.0.0.1:3081'

/** 整套临时工作区：workspace（会话 cwd）+ outside（工作区之外）。 */
const base = mkdtempSync(join(tmpdir(), 'dsh-lookout-download-'))
const workspace = join(base, 'workspace')
const outside = join(base, 'outside')
mkdirSync(workspace, { recursive: true })
mkdirSync(outside, { recursive: true })
mkdirSync(join(workspace, 'sub'), { recursive: true })
writeFileSync(join(workspace, 'a.txt'), 'hello')
writeFileSync(join(workspace, '报告 1.md'), '# 标题')
writeFileSync(join(workspace, 'blob.bin'), 'xx')
writeFileSync(join(workspace, 'sub', 'nested.txt'), 'nested')
writeFileSync(join(outside, 'secret.txt'), 'secret')
symlinkSync(join(outside, 'secret.txt'), join(workspace, 'escape.txt'))
symlinkSync(outside, join(workspace, 'escape-dir'))

test.after(() => rmSync(base, { recursive: true, force: true }))

/**
 * 造一个像 ctx.fs 的假实现：路径原样传递，不做 realpath——
 * 这样"符号链接逃逸"能真的把责任压在 handler 自己的 realpath 上。
 * @param {{processed: number}} counters 调用计数
 * @returns {object} 假 fs 服务
 */
function makeFs(counters = { processed: 0, resolved: 0, stat: 0 }) {
	return {
		async resolve(path) {
			counters.resolved += 1
			return { displayPath: path, targetKey: path }
		},
		async stat(target) {
			counters.stat += 1
			try {
				const info = statSync(target.displayPath)
				return { type: info.isDirectory() ? 'directory' : 'file', size: info.size, version: 'v1' }
			} catch (error) {
				if (error.code === 'ENOENT') return undefined
				throw error
			}
		},
		processPath(target) {
			counters.processed += 1
			return target.displayPath
		},
		counters,
	}
}

/**
 * 造一个假 ctx：除了 fs/sessions，还给一个会捕获路由的 connection。
 * @param {{cwd?: string, readCounter?: {opened: number}, fsCounters?: object}} [options] 覆盖项
 * @returns {{ctx: object, routes: object[], counters: object, opened: () => number}}
 */
function makeCtx(options = {}) {
	const cwd = options.cwd ?? workspace
	const routes = []
	const readCounter = options.readCounter ?? { opened: 0 }
	const counters = options.fsCounters ?? { processed: 0, resolved: 0, stat: 0 }
	const ctx = {
		connection: {
			fetch: {
				register(route) {
					routes.push(route)
					return async () => {}
				},
			},
		},
		fs: makeFs(counters),
		sessions: {
			get(id) {
				return id === SESSION_ID ? { header: { id, cwd } } : undefined
			},
		},
		// 与 cordis 同形：inject 只把服务补齐后回调，effect 立即执行并回传清理函数
		inject(services, callback) {
			assert.deepEqual(services, ['connection', 'fs', 'sessions'])
			return callback(ctx)
		},
		effect(fn) {
			return fn()
		},
	}
	const openStream = (path) => {
		readCounter.opened += 1
		return createReadStream(path)
	}
	registerDownloadRoute(ctx, { createReadStream: openStream })
	assert.equal(routes.length, 1, '应当恰好注册一条路由')
	return { ctx, routes, counters, route: routes[0], opened: () => readCounter.opened }
}

/**
 * 拼一条请求 URL。
 * @param {Record<string, string>} params 查询参数
 * @returns {string} 绝对 URL
 */
function url(params) {
	return HOST + DOWNLOAD_ROUTE_PATH + '?' + new URLSearchParams(params).toString()
}

test('注册：路径 /api/lookout.download、方法 GET+HEAD、requestBody buffered', () => {
	const { route } = makeCtx()
	assert.equal(route.path, '/api/lookout.download')
	assert.equal(route.path, DOWNLOAD_ROUTE)
	assert.deepEqual(route.methods, ['GET', 'HEAD'])
	assert.equal(route.requestBody, 'buffered')
	assert.equal(typeof route.fetch, 'function')
})

test('GET 200：内容一致 + 头齐全（content-type / content-length / cache-control）', async () => {
	const { route } = makeCtx()
	const response = await route.fetch(new Request(url({ sessionId: SESSION_ID, path: join(workspace, 'a.txt') })))
	assert.equal(response.status, 200)
	assert.equal(await response.text(), 'hello')
	assert.equal(response.headers.get('content-length'), '5')
	assert.equal(response.headers.get('content-type'), 'text/plain')
	assert.equal(response.headers.get('cache-control'), 'private, no-store')
	assert.match(response.headers.get('content-disposition'), /^attachment; filename="a\.txt"; filename\*=UTF-8''a\.txt$/)
})

test('HEAD 200：头与 GET 一致、body 为空、且根本没打开文件', async () => {
	const { route, opened } = makeCtx()
	const head = await route.fetch(new Request(url({ sessionId: SESSION_ID, path: join(workspace, 'a.txt') }), { method: 'HEAD' }))
	assert.equal(head.status, 200)
	assert.equal(head.body, null)
	assert.equal(head.headers.get('content-length'), '5')
	assert.equal(head.headers.get('content-type'), 'text/plain')
	assert.equal(opened(), 0, 'HEAD 不许读文件')
	// 再走一次 GET，确认计数器本身是好的（不是"永远不涨"的假绿）
	await (await route.fetch(new Request(url({ sessionId: SESSION_ID, path: join(workspace, 'a.txt') })))).text()
	assert.equal(opened(), 1)
})

test('中文文件名：filename* 按 UTF-8 编码，ASCII 兜底不含非 ASCII', async () => {
	const { route } = makeCtx()
	const name = '报告 1.md'
	const response = await route.fetch(new Request(url({ sessionId: SESSION_ID, path: join(workspace, name) })))
	assert.equal(response.status, 200)
	const disposition = response.headers.get('content-disposition')
	assert.ok(disposition.includes("filename*=UTF-8''" + encodeURIComponent(name)), disposition)
	assert.ok(disposition.includes('filename="__ 1.md"'), disposition)
	assert.match(disposition, /filename="[\x20-\x7e]*"/, 'ASCII 兜底必须是纯 ASCII')
	assert.equal(response.headers.get('content-type'), 'text/markdown')
	assert.equal(await response.text(), '# 标题')
})

test('认不出的扩展名给 application/octet-stream', async () => {
	const { route } = makeCtx()
	const response = await route.fetch(new Request(url({ sessionId: SESSION_ID, path: join(workspace, 'blob.bin') })))
	assert.equal(response.status, 200)
	assert.equal(response.headers.get('content-type'), 'application/octet-stream')
	assert.equal(contentTypeOf('noext'), 'application/octet-stream')
	await response.text()
})

test('越界 403：cwd 之外的绝对路径，且有 .. 穿越时同样 403', async () => {
	const { route } = makeCtx()
	const direct = await route.fetch(new Request(url({ sessionId: SESSION_ID, path: join(outside, 'secret.txt') })))
	assert.equal(direct.status, 403)
	const traversal = await route.fetch(new Request(url({ sessionId: SESSION_ID, path: join(workspace, '..', 'outside', 'secret.txt') })))
	assert.equal(traversal.status, 403)
	const sibling = await route.fetch(new Request(url({ sessionId: SESSION_ID, path: workspace + '-evil/a.txt' })))
	assert.equal(sibling.status, 403, '同前缀的兄弟目录不算范围内')
})

test('符号链接逃逸 403：文件链接与目录链接都不放行', async () => {
	const { route } = makeCtx()
	const viaFile = await route.fetch(new Request(url({ sessionId: SESSION_ID, path: join(workspace, 'escape.txt') })))
	assert.equal(viaFile.status, 403)
	const viaDir = await route.fetch(new Request(url({ sessionId: SESSION_ID, path: join(workspace, 'escape-dir', 'secret.txt') })))
	assert.equal(viaDir.status, 403)
})

test('目录 403：普通目录不是可下载的文件', async () => {
	const { route } = makeCtx()
	const response = await route.fetch(new Request(url({ sessionId: SESSION_ID, path: join(workspace, 'sub') })))
	assert.equal(response.status, 403)
})

test('不存在 404：路径在范围内但文件没有', async () => {
	const { route } = makeCtx()
	const response = await route.fetch(new Request(url({ sessionId: SESSION_ID, path: join(workspace, 'nope.txt') })))
	assert.equal(response.status, 404)
})

test('400：缺 sessionId、缺 path、相对路径各一', async () => {
	const { route, counters } = makeCtx()
	const before = counters.resolved
	assert.equal((await route.fetch(new Request(url({ path: join(workspace, 'a.txt') })))).status, 400)
	assert.equal((await route.fetch(new Request(url({ sessionId: SESSION_ID })))).status, 400)
	assert.equal((await route.fetch(new Request(url({ sessionId: SESSION_ID, path: 'a.txt' })))).status, 400)
	assert.equal(counters.resolved, before, '参数不合法时不该去碰文件系统')
})

test('403：未知会话 / 会话没有 cwd', async () => {
	const unknown = makeCtx()
	const response = await unknown.route.fetch(new Request(url({ sessionId: 'sess-missing', path: join(workspace, 'a.txt') })))
	assert.equal(response.status, 403)

	const noCwd = makeCtx()
	noCwd.ctx.sessions.get = () => ({ header: { id: SESSION_ID } })
	const noCwdRoute = noCwd.routes[0]
	assert.equal((await noCwdRoute.fetch(new Request(url({ sessionId: SESSION_ID, path: join(workspace, 'a.txt') })))).status, 403)
})

test('500：内部异常只 warn 一次、不吐堆栈', async () => {
	const failing = createDownloadHandler({
		fs: {
			async resolve() { throw new Error('boom at /secret/internal/path') },
			async stat() { return undefined },
			processPath(target) { return target.displayPath },
		},
		sessions: { get: () => ({ header: { cwd: workspace } }) },
	})
	const warns = []
	const originalWarn = console.warn
	console.warn = (...args) => warns.push(args.join(' '))
	try {
		const response = await failing(new Request(url({ sessionId: SESSION_ID, path: join(workspace, 'a.txt') })))
		assert.equal(response.status, 500)
		assert.equal(await response.text(), 'download failed')
	} finally {
		console.warn = originalWarn
	}
	assert.equal(warns.length, 1, '一次请求只 warn 一次')
	assert.ok(!/\n\s+at /.test(warns[0]), '不许把堆栈写进日志')
})

test('sessionWorkspace / contentDisposition / withinRoot 的小契约', () => {
	const sessions = {
		get: () => undefined,
		list: () => [{ header: { id: 'b', cwd: '/tmp/b' } }, { header: { id: 'a', cwd: '/tmp/a' } }],
	}
	assert.equal(sessionWorkspace(sessions, 'a'), '/tmp/a')
	assert.equal(sessionWorkspace(sessions, 'missing'), null)
	assert.equal(sessionWorkspace(undefined, 'a'), null)
	assert.ok(contentDisposition('').includes('filename="download"'))
	assert.ok(contentDisposition('报告 1.md').includes("filename*=UTF-8''" + encodeURIComponent('报告 1.md')))
})
test('尾随分隔符：按"没有这个文件"处理（404，不是 500）', async () => {
	const { route } = makeCtx()
	const response = await route.fetch(new Request(url({ sessionId: SESSION_ID, path: join(workspace, 'a.txt') + '/' })))
	assert.equal(response.status, 404)
})

test('重复注册幂等：同一个 connection 上不会抛错、也不会挂第二条路由', () => {
	const { ctx, routes } = makeCtx()
	assert.doesNotThrow(() => registerDownloadRoute(ctx))
	assert.equal(routes.length, 1)
})

test('后端不给 size 时不写 content-length（不写假的 0）', async () => {
	const { ctx, route } = makeCtx()
	const originalStat = ctx.fs.stat
	ctx.fs.stat = async () => ({ type: 'file', version: 'v1' })
	try {
		const response = await route.fetch(new Request(url({ sessionId: SESSION_ID, path: join(workspace, 'a.txt') }), { method: 'HEAD' }))
		assert.equal(response.status, 200)
		assert.equal(response.headers.get('content-length'), null)
	} finally {
		ctx.fs.stat = originalStat
	}
})
