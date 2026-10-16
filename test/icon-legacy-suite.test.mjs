// 原 dsh-icon-custom 的 15 个回归脚本是「自跑自报」形态：`node test/<名字>.mjs`，
// 自己打印 ✓/✗ 并以 process.exit(0/1) 判定（原 package.json 的 npm test 就是这么串起来的）。
//
// 文件名不带 .test.mjs，所以 `node --test "test/*.test.mjs"` 收不到它们。
// 为了在合并包里仍然跑满这 15 个用例（且不改它们的文件名与断言），这里按原 npm test
// 的顺序逐个 spawn 子进程，退出码即判定；每个文件算一个子测试。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(TEST_DIR, '..');

/** 原 dsh-icon-custom/package.json 的 test 脚本顺序，一个不落。 */
const LEGACY_SUITE = [
	'app-badge',
	'notification-permission',
	'unread-panel',
	'unread-clear',
	'unread-rows',
	'unread-seen',
	'unread-host-sync',
	'running-mark',
	'running-panel',
	'running-subagents',
	'header-ring',
	'unread-subagents',
	'reveal',
	'reveal-persist',
	'hint-disclosure',
];

for (const name of LEGACY_SUITE) {
	test(`原 dsh-icon-custom 回归 / ${name}.mjs`, () => {
		const result = spawnSync(process.execPath, [join('test', `${name}.mjs`)], {
			cwd: PKG_ROOT,
			encoding: 'utf8',
		});
		const tail = (text) => (text ?? '').split('\n').slice(-25).join('\n');
		assert.equal(
			result.status,
			0,
			`${name}.mjs 退出码 ${String(result.status)}（信号 ${String(result.signal)}）\n`
				+ `--- 末尾 stdout ---\n${tail(result.stdout)}\n--- 末尾 stderr ---\n${tail(result.stderr)}`,
		);
	});
}
