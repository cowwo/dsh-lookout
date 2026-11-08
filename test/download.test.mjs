// lib/download.js 的离线单测：不联网、不启服务，只用临时目录里的真文件 + 可控时钟。
//
// 这条链路的要害：
//   · 票据只能用一次，但兑换出的「下载会话」要允许 IDM 那样拆 Range 多连接
//   · HEAD 只探路，绝不能消耗票据或建会话
//   · Range 的 206/416 边界（越界、后缀、多段、畸形、空文件）
//   · 越界路径与符号链接逃逸：签发时挡一次，下载时再挡一次
import test from 'node:test'
import assert from 'node:assert/strict'
import { createReadStream, mkdirSync, mkdtempSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
	DOWNLOAD_ROUTE_PATH,
	TICKET_ROUTE_PATH,
	contentDisposition,
	createTicketStore,
	parseRange,
	registerDownloadRoute,
	sessionWorkspace,
} from '../lib/download.js'

const SESSION_ID = 'sess-a'
const HOST = 'http://127.0.0.1:3081'

const base = mkdtempSync(join(tmpdir(), 'dsh-lookout-ticket-'))
const workspace = join(base, 'workspace')
const outside = join(base, 'outside')
mkdirSync(workspace, { recursive: true })
mkdirSync(outside, { recursive: true })
mkdirSync(join(workspace, 'sub'), { recursive: true })
const notes = join(workspace, 'notes.txt')
const CONTENT = 'abcdefghijklmnopqrstuvwxyz0123456789' // 36 字节
writeFileSync(notes, CONTENT)
writeFileSync(join(workspace, '报告 1.md'), '# 标题')
writeFileSync(join(workspace, 'empty.bin'), '')
writeFileSync(join(outside, 'secret.txt'), 'secret')
symlinkSync(join(outside, 'secret.txt'), join(workspace, 'escape.txt'))

test.after(() => rmSync(base, { recursive: true, force: true }))

/** 像 ctx.fs 的假实现：路径直传，stat/processPath 落到真文件系统。 */
function makeFs() {
	return {
		async resolve(path) {
			try {
				statSync(path)
			} catch (error) {
				if (error.code === 'ENOENT') throw Object.assign(new Error('not found'), { code: 'FS_NOT_FOUND' })
				throw error
			}
			return { displayPath: path, targetKey: path }
		},
		async stat(target) {
			const info = statSync(target.displayPath)
			return { type: info.isDirectory() ? 'directory' : 'file', size: info.size, version: 'v1' }
		},
		processPath(target) {
			return target.displayPath
		},
	}
}

function makeSessions(cwd = workspace) {
	return {
		get(id) { return id === SESSION_ID ? { header: { id, cwd } } : undefined },
		list() { return [{ header: { id: SESSION_ID, cwd } }] },
	}
}

/** 整套装置：假 ctx + 两条真实路由 + 可控时钟。 */
function makeHarness(options = {}) {
	const clock = { value: 1_700_000_000_000 }
	const store = createTicketStore({
		now: () => clock.value,
		sessionQuota: options.sessionQuota ?? 3,
		sweepInterval: 1e9,
	})
	const routes = []
	const ctx = {
		fs: options.fs ?? makeFs(),
		sessions: makeSessions(options.cwd ?? workspace),
		connection: { fetch: { register(route) { routes.push(route); return async () => {} } } },
		inject(services, callback) { return callback(ctx) },
		effect(fn) { return fn() },
	}
	registerDownloadRoute(ctx, { store, createReadStream, logger: options.logger })
	const ticketRoute = routes.find((route) => route.path === TICKET_ROUTE_PATH)
	const downloadRoute = routes.find((route) => route.path === DOWNLOAD_ROUTE_PATH)
	const issue = (path, sessionId = SESSION_ID) => ticketRoute.fetch(new Request(HOST + TICKET_ROUTE_PATH, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ sessionId, path }),
	}))
	const fetchDownload = (url, init = {}) => downloadRoute.fetch(new Request(HOST + url, init))
	return { ctx, clock, store, routes, ticketRoute, downloadRoute, issue, fetchDownload }
}

test('签发：200 + url/expiresAt/filename/size，url 里只带 ticket', async () => {
	const harness = makeHarness()
	const response = await harness.issue(notes)
	assert.equal(response.status, 200)
	const body = await response.json()
	assert.match(body.url, /^\/api\/lookout\.download\?ticket=[A-Za-z0-9_-]+$/)
	assert.equal(body.filename, 'notes.txt')
	assert.equal(body.size, 36)
	assert.equal(body.expiresAt, harness.clock.value + 5 * 60 * 1000, '票据有效期 5 分钟')
	assert.equal(response.headers.get('cache-control'), 'no-store')
	assert.equal(response.headers.get('referrer-policy'), 'no-referrer')
})

test('签发：越界 403 / 不存在 404 / 缺参 400 / 尾斜杠 404 / 符号链接逃逸 403', async () => {
	const { issue } = makeHarness()
	assert.equal((await issue(join(outside, 'secret.txt'))).status, 403)
	assert.equal((await issue(join(workspace, 'nope.txt'))).status, 404)
	assert.equal((await issue(join(workspace, 'escape.txt'))).status, 403)
	assert.equal((await issue(join(workspace, 'notes.txt') + '/')).status, 404)
	assert.equal((await issue('relative/path.txt')).status, 400)
})

test('一次性兑换：票据首次 GET 建会话，同 token 还能继续用；配额用尽后 410', async () => {
	const { issue, fetchDownload } = makeHarness({ sessionQuota: 1 })
	const { url } = await (await issue(notes)).json()

	const first = await fetchDownload(url)
	assert.equal(first.status, 200)
	assert.equal(await first.text(), CONTENT)

	const second = await fetchDownload(url)
	assert.equal(second.status, 200, '配额内的第二次请求必须放行（IDM 分段）')

	const third = await fetchDownload(url)
	assert.equal(third.status, 410, '配额用尽后必须 410')
})

test('严格一次性：配额配成 0 时，第二次 GET 立刻 410', async () => {
	const { issue, fetchDownload } = makeHarness({ sessionQuota: 0 })
	const { url } = await (await issue(notes)).json()
	assert.equal((await fetchDownload(url)).status, 200)
	assert.equal((await fetchDownload(url)).status, 410)
})

test('HEAD 不消耗：连探 3 次后 GET 仍然可用；HEAD 带 Range 返回 206 且无 body', async () => {
	const { issue, fetchDownload } = makeHarness({ sessionQuota: 0 })
	const { url } = await (await issue(notes)).json()
	for (let i = 0; i < 3; i += 1) {
		const head = await fetchDownload(url, { method: 'HEAD' })
		assert.equal(head.status, 200)
		assert.equal(head.body, null)
		assert.equal(head.headers.get('accept-ranges'), 'bytes')
		assert.equal(head.headers.get('content-length'), '36')
	}
	const ranged = await fetchDownload(url, { method: 'HEAD', headers: { range: 'bytes=0-9' } })
	assert.equal(ranged.status, 206)
	assert.equal(ranged.headers.get('content-length'), '10')
	assert.equal(ranged.headers.get('content-range'), 'bytes 0-9/36')
	assert.equal(ranged.body, null)
	const get = await fetchDownload(url)
	assert.equal(get.status, 200, 'HEAD 之后票据必须还在')
})

test('过期：票据 5 分钟、会话 10 分钟，过后一律 410 且文案统一', async () => {
	const ticketCase = makeHarness()
	const issued = await (await ticketCase.issue(notes)).json()
	ticketCase.clock.value += 6 * 60 * 1000
	const expired = await ticketCase.fetchDownload(issued.url)
	assert.equal(expired.status, 410)
	assert.equal(await expired.text(), 'ticket gone')

	const sessionCase = makeHarness({ sessionQuota: 5 })
	const issued2 = await (await sessionCase.issue(notes)).json()
	assert.equal((await sessionCase.fetchDownload(issued2.url)).status, 200)
	sessionCase.clock.value += 11 * 60 * 1000
	assert.equal((await sessionCase.fetchDownload(issued2.url)).status, 410)
})

test('伪造/空票据：400 或 410，且不透露原因', async () => {
	const { fetchDownload } = makeHarness()
	assert.equal((await fetchDownload('/api/lookout.download')).status, 400)
	const forged = await fetchDownload('/api/lookout.download?ticket=forged-token')
	assert.equal(forged.status, 410)
	assert.equal(await forged.text(), 'ticket gone')
})

test('Range：206 + content-range + 内容切片（前段/开区间/后缀）', async () => {
	const { issue, fetchDownload } = makeHarness({ sessionQuota: 10 })
	const { url } = await (await issue(notes)).json()

	const first = await fetchDownload(url, { headers: { range: 'bytes=0-9' } })
	assert.equal(first.status, 206)
	assert.equal(first.headers.get('content-range'), 'bytes 0-9/36')
	assert.equal(await first.text(), 'abcdefghij')

	const rest = await fetchDownload(url, { headers: { range: 'bytes=26-' } })
	assert.equal(rest.status, 206)
	assert.equal(await rest.text(), '0123456789')

	const suffix = await fetchDownload(url, { headers: { range: 'bytes=-6' } })
	assert.equal(suffix.status, 206)
	assert.equal(await suffix.text(), '456789')
})

test('Range 非法：多段/越界/写反/畸形 → 416 且带 bytes */size', async () => {
	const { issue, fetchDownload } = makeHarness({ sessionQuota: 20 })
	const { url } = await (await issue(notes)).json()
	for (const bad of ['bytes=0-1,5-6', 'bytes=999-', 'bytes=20-10', 'bytes=--5', 'bytes=', 'bytes=-', 'bytes=abc']) {
		const response = await fetchDownload(url, { headers: { range: bad } })
		assert.equal(response.status, 416, bad)
		assert.equal(response.headers.get('content-range'), 'bytes */36', bad + ' 要带总长')
	}
})

test('空文件：GET 200 且 content-length 为 0；Range 一律 416', async () => {
	const { issue, fetchDownload } = makeHarness({ sessionQuota: 4 })
	const { url } = await (await issue(join(workspace, 'empty.bin'))).json()
	const full = await fetchDownload(url)
	assert.equal(full.status, 200)
	assert.equal(full.headers.get('content-length'), '0')
	assert.equal(await full.text(), '')
	const ranged = await fetchDownload(url, { headers: { range: 'bytes=0-' } })
	assert.equal(ranged.status, 416)
	assert.equal(ranged.headers.get('content-range'), 'bytes */0')
})

test('parseRange：真值表（含超大数字与非 bytes 单位）', () => {
	assert.deepEqual(parseRange(null, 36), { kind: 'none' })
	assert.deepEqual(parseRange('bytes=0-9', 36), { kind: 'range', start: 0, end: 9 })
	assert.deepEqual(parseRange('bytes=30-', 36), { kind: 'range', start: 30, end: 35 })
	assert.deepEqual(parseRange('bytes=-6', 36), { kind: 'range', start: 30, end: 35 })
	assert.deepEqual(parseRange('bytes=0-999', 36), { kind: 'range', start: 0, end: 35 })
	assert.deepEqual(parseRange('bytes=36-', 36), { kind: 'unsatisfiable' })
	assert.deepEqual(parseRange('bytes=0-1,2-3', 36), { kind: 'unsatisfiable' })
	assert.deepEqual(parseRange('bytes=0-99999999999999999999', 36), { kind: 'unsatisfiable' })
	assert.deepEqual(parseRange('items=0-1', 36), { kind: 'none' }, '非 bytes 单位按 RFC 忽略')
})

test('绑定文件：票据只能下签发时那一个文件（url 里没有 path 可换）', async () => {
	const { issue, fetchDownload } = makeHarness({ sessionQuota: 4 })
	const a = await (await issue(notes)).json()
	const b = await (await issue(join(workspace, '报告 1.md'))).json()
	assert.notEqual(a.url, b.url)
	assert.equal(await (await fetchDownload(a.url)).text(), CONTENT)
	assert.equal(await (await fetchDownload(b.url)).text(), '# 标题')
})

test('注册：两条路由路径/方法正确；重复注册幂等', () => {
	const harness = makeHarness()
	assert.equal(harness.routes.length, 2)
	assert.deepEqual(harness.ticketRoute.methods, ['POST'])
	assert.deepEqual(harness.downloadRoute.methods, ['GET', 'HEAD'])
	assert.doesNotThrow(() => registerDownloadRoute(harness.ctx, { store: harness.store, createReadStream }))
	assert.equal(harness.routes.length, 2, '重复注册必须幂等')
})

test('上限与清理：同会话未用票据不超过 32；dispose 后旧链接一律 410', async () => {
	const harness = makeHarness()
	for (let i = 0; i < 40; i += 1) assert.equal((await harness.issue(notes)).status, 200)
	assert.ok(harness.store.size() <= 32, '每会话未用票据上限 32，实际 ' + harness.store.size())

	const { url } = await (await harness.issue(notes)).json()
	assert.equal((await harness.fetchDownload(url)).status, 200)
	harness.store.dispose()
	assert.equal((await harness.fetchDownload(url)).status, 410)
})

test('辅助契约：contentDisposition 中文名、sessionWorkspace 回退', () => {
	assert.ok(contentDisposition('报告 1.md').includes("filename*=UTF-8''" + encodeURIComponent('报告 1.md')))
	assert.ok(contentDisposition('').includes('filename="download"'))
	assert.equal(sessionWorkspace({ get: () => undefined, list: () => [{ header: { id: 'x', cwd: '/tmp/x' } }] }, 'x'), '/tmp/x')
	assert.equal(sessionWorkspace(undefined, 'x'), null)
})
test('后端给不出 size：签发直接 500（宁可不签，也不发错区间长度）', async () => {
	const fs = makeFs()
	const original = fs.stat
	fs.stat = async (target) => {
		const info = await original(target)
		return { type: info.type, version: 'v1' }
	}
	const harness = makeHarness({ fs })
	assert.equal((await harness.issue(notes)).status, 500)
})

test('会话配额用尽后 HEAD 也拿不到：一律 410', async () => {
	const { issue, fetchDownload } = makeHarness({ sessionQuota: 0 })
	const { url } = await (await issue(notes)).json()
	assert.equal((await fetchDownload(url)).status, 200)
	assert.equal((await fetchDownload(url, { method: 'HEAD' })).status, 410)
})

test('日志脱敏：只出现事件与文件名，绝不出现 token 与哈希', async () => {
	const lines = []
	const harness = makeHarness({ logger: (event, detail) => lines.push(event + '|' + String(detail ?? '')) })
	const { url } = await (await harness.issue(notes)).json()
	await harness.fetchDownload(url)
	const token = new URL('http://x' + url).searchParams.get('ticket')
	assert.ok(token.length > 20)
	const joined = lines.join('\n')
	assert.ok(joined.includes('ticket.issued|notes.txt'), '签发要记事件与文件名')
	assert.ok(joined.includes('download.started|notes.txt'), '开始下载要记事件与文件名')
	assert.equal(joined.includes(token), false, 'token 绝不能进日志')
	assert.equal(/[0-9a-f]{64}/.test(joined), false, '哈希也不能进日志')
})
