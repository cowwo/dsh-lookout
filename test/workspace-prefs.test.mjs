import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  WORKSPACE_COLORS,
  WORKSPACE_PREFS_VERSION,
  emptyWorkspacePrefs,
  normalizeWorkspacePrefs,
  readWorkspacePrefs,
  workspacePrefsFilePath,
  writeWorkspacePrefs,
} from '../lib/icon/workspace-prefs.js';
import { FaviconCustomService } from '../lib/icon/index.js';

const DEFAULT_ENTRY = { tag: '', color: 'gray', pinned: false, hidden: false, pinAnchor: null };

function tempDir(prefix) {
  return mkdtempSync(join(tmpdir(), prefix));
}

test('normalizeWorkspacePrefs：完整文档原样保留，未知字段丢弃', () => {
  const doc = normalizeWorkspacePrefs({
    version: 99,
    workspaces: {
      ws1: { tag: ' 工作 ', color: 'blue', pinned: true, hidden: false, pinAnchor: 'wsp_x', extra: 'drop' },
      ws2: { tag: '后端', color: 'red' },
    },
  });

  assert.deepEqual(doc, {
    version: 1,
    workspaces: {
      ws1: { tag: '工作', color: 'blue', pinned: true, hidden: false, pinAnchor: 'wsp_x' },
      ws2: { tag: '后端', color: 'red', pinned: false, hidden: false, pinAnchor: null },
    },
  });
  assert.equal(doc.workspaces.ws1.extra, undefined);
});

test('normalizeWorkspacePrefs：坏类型一律降级默认，绝不抛错', () => {
  const badInputs = [null, undefined, 'nope', 42, [], { workspaces: null }, { workspaces: [] }, { workspaces: 'x' }];
  for (const input of badInputs) {
    assert.doesNotThrow(() => normalizeWorkspacePrefs(input));
    assert.deepEqual(normalizeWorkspacePrefs(input), emptyWorkspacePrefs());
  }

  const doc = normalizeWorkspacePrefs({
    workspaces: {
      kept: null,
      alsoKept: 'not-an-object',
      dirty: { tag: 42, color: 'pink', pinned: 'true', hidden: 1, pinAnchor: 5 },
      truthy: { tag: 'ok', color: 'cyan', pinned: true, hidden: true, pinAnchor: null },
    },
  });
  assert.deepEqual(doc.workspaces.kept, DEFAULT_ENTRY);
  assert.deepEqual(doc.workspaces.alsoKept, DEFAULT_ENTRY);
  assert.deepEqual(doc.workspaces.dirty, DEFAULT_ENTRY);
  assert.deepEqual(doc.workspaces.truthy, {
    tag: 'ok', color: 'cyan', pinned: true, hidden: true, pinAnchor: null,
  });
});

test('normalizeWorkspacePrefs：workspaceId 非空、不超过 200 字符', () => {
  const longId = 'x'.repeat(201);
  const doc = normalizeWorkspacePrefs({
    workspaces: {
      '': { tag: '空' },
      [longId]: { tag: '太长' },
      ['x'.repeat(200)]: { tag: '刚好' },
    },
  });
  assert.deepEqual(Object.keys(doc.workspaces), ['x'.repeat(200)]);
  assert.equal(doc.workspaces['x'.repeat(200)].tag, '刚好');
});

test('normalizeWorkspacePrefs：颜色只认白名单，非法回落 gray', () => {
  for (const color of WORKSPACE_COLORS) {
    assert.equal(normalizeWorkspacePrefs({ workspaces: { w: { color } } }).workspaces.w.color, color);
  }
  for (const color of ['pink', 'BLUE', '', null, 7]) {
    assert.equal(normalizeWorkspacePrefs({ workspaces: { w: { color } } }).workspaces.w.color, 'gray');
  }
});

test('normalizeWorkspacePrefs：tag 去控制字符、trim，并按 Unicode 字符截断到 6', () => {
  const doc = normalizeWorkspacePrefs({
    workspaces: {
      controls: { tag: ' 工\u0000作\n室\t ' },
      long: { tag: 'abcdefgh' },
      emoji: { tag: '😀😀😀😀😀😀😀' },
    },
  });
  assert.equal(doc.workspaces.controls.tag, '工作室');
  assert.equal(doc.workspaces.long.tag, 'abcdef');
  assert.equal([...doc.workspaces.emoji.tag].length, 6);
  assert.equal(doc.workspaces.emoji.tag, '😀😀😀😀😀😀');
});

test('文件路径：与 library.json 同目录', () => {
  assert.equal(workspacePrefsFilePath('/tmp/fake-dsh-home/custom-favicon'), '/tmp/fake-dsh-home/custom-favicon/workspace-prefs.json');
  assert.equal(WORKSPACE_PREFS_VERSION, 1);
});

test('readWorkspacePrefs：文件缺失 / 空文件 / 坏 JSON / 结构不对 → 空文档', () => {
  const dir = tempDir('workspace-prefs-read-');
  const path = workspacePrefsFilePath(dir);

  assert.deepEqual(readWorkspacePrefs(path), emptyWorkspacePrefs());

  writeFileSync(path, '');
  assert.deepEqual(readWorkspacePrefs(path), emptyWorkspacePrefs());

  writeFileSync(path, '{ this is not json');
  assert.deepEqual(readWorkspacePrefs(path), emptyWorkspacePrefs());

  writeFileSync(path, JSON.stringify([]));
  assert.deepEqual(readWorkspacePrefs(path), emptyWorkspacePrefs());

  writeFileSync(path, JSON.stringify({ version: 1, workspaces: { w: { tag: 'ok' } } }));
  assert.deepEqual(readWorkspacePrefs(path), {
    version: 1,
    workspaces: { w: { tag: 'ok', color: 'gray', pinned: false, hidden: false, pinAnchor: null } },
  });
});

test('writeWorkspacePrefs：临时目录 roundtrip，原子写不留 .tmp', async () => {
  const dir = tempDir('workspace-prefs-write-');
  const path = join(dir, 'custom-favicon', 'workspace-prefs.json');
  const doc = normalizeWorkspacePrefs({
    version: 1,
    workspaces: { w: { tag: '工作', color: 'cyan', pinned: true, hidden: true, pinAnchor: 'a' } },
  });

  await writeWorkspacePrefs(path, doc);

  assert.deepEqual(readWorkspacePrefs(path), doc);
  assert.deepEqual(JSON.parse(readFileSync(path, 'utf8')), doc);
  assert.equal(existsSync(`${path}.tmp`), false);
});

test('端点：set 整份覆盖、get 返回副本且落盘；脏输入降级不抛错', async () => {
  const dir = tempDir('workspace-prefs-rpc-');
  const svc = Object.create(FaviconCustomService.prototype);
  svc.storageDir = dir;
  svc.workspacePrefsPath = workspacePrefsFilePath(dir);
  svc.workspacePrefs = emptyWorkspacePrefs();

  await svc.setWorkspacePrefs({
    version: 1,
    workspaces: {
      w1: { tag: ' 工作 ', color: 'purple', pinned: true },
      w2: { tag: 'x', color: 'nope' },
    },
  });

  const expected = {
    version: 1,
    workspaces: {
      w1: { tag: '工作', color: 'purple', pinned: true, hidden: false, pinAnchor: null },
      w2: { tag: 'x', color: 'gray', pinned: false, hidden: false, pinAnchor: null },
    },
  };
  assert.deepEqual(await svc.getWorkspacePrefs(), expected);
  assert.deepEqual(readWorkspacePrefs(svc.workspacePrefsPath), expected);
  assert.deepEqual(svc.workspacePrefs, expected);

  // get 返回的是副本：改返回值不能改到宿主内存。
  const view = await svc.getWorkspacePrefs();
  view.workspaces.w1.tag = '被改了';
  assert.equal((await svc.getWorkspacePrefs()).workspaces.w1.tag, '工作');

  // 整份覆盖：第二次没带 w1，w1 必须从内存和磁盘上一起消失。
  await svc.setWorkspacePrefs({ version: 1, workspaces: { w2: { tag: 'y' } } });
  assert.deepEqual(Object.keys((await svc.getWorkspacePrefs()).workspaces), ['w2']);
  assert.deepEqual(Object.keys(readWorkspacePrefs(svc.workspacePrefsPath).workspaces), ['w2']);

  // 脏条目也不抛错，降级成默认值。
  await svc.setWorkspacePrefs({ version: 1, workspaces: { w3: 'dirty' } });
  assert.deepEqual((await svc.getWorkspacePrefs()).workspaces.w3, DEFAULT_ENTRY);

  await assert.rejects(() => svc.setWorkspacePrefs(null), /workspaces/);
});

test('端点：写盘失败也只吞掉写错误，内存偏好照常生效', async () => {
  const dir = tempDir('workspace-prefs-fail-');
  const blocker = join(dir, 'blocker');
  writeFileSync(blocker, 'not a directory');
  const svc = Object.create(FaviconCustomService.prototype);
  svc.storageDir = dir;
  svc.workspacePrefsPath = join(blocker, 'workspace-prefs.json');
  svc.workspacePrefs = emptyWorkspacePrefs();

  await assert.doesNotReject(() => svc.setWorkspacePrefs({
    version: 1,
    workspaces: { w: { tag: '工作', pinned: true } },
  }));
  assert.equal((await svc.getWorkspacePrefs()).workspaces.w.tag, '工作');
  assert.equal(existsSync(join(dir, 'workspace-prefs.json')), false);
});

test('端点：宿主重启后从磁盘恢复偏好', () => {
  const dir = tempDir('workspace-prefs-reload-');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'workspace-prefs.json'), JSON.stringify({
    version: 1,
    workspaces: { w: { tag: '重启', color: 'green', pinned: true, hidden: false, pinAnchor: null } },
  }));

  const svc = Object.create(FaviconCustomService.prototype);
  svc.workspacePrefsPath = workspacePrefsFilePath(dir);
  svc.workspacePrefs = emptyWorkspacePrefs();
  svc._loadWorkspacePrefs();
  assert.equal(svc.workspacePrefs.workspaces.w.tag, '重启');
});

test('typert 清单：get/set 声明齐全，结果能过严格 schema，脏请求不整份拒绝', async () => {
  const { TYPERT } = await import('../lib/typert.host.js');
  const byMethod = new Map(TYPERT.invocations.map((item) => [item.method, item]));

  const getInvocation = byMethod.get('getWorkspacePrefs');
  const setInvocation = byMethod.get('setWorkspacePrefs');
  assert.equal(getInvocation.service, 'iconCustom');
  assert.equal(setInvocation.namespace, 'iconCustom');
  assert.equal(setInvocation.parameters[0].name, 'request');

  const emojiDoc = normalizeWorkspacePrefs({ workspaces: { w: { tag: '😀😀😀😀😀😀😀' } } });
  assert.equal(getInvocation.result.create().safeParse(emojiDoc).success, true);

  // 请求 schema 只验形状，非法颜色/超长 tag 交端点 normalize 降级，而不是整份拒绝。
  const request = setInvocation.parameters[0].codec.create();
  assert.equal(request.safeParse({
    version: 1,
    workspaces: { w: { tag: 'x'.repeat(50), color: 'pink', pinned: 'yes' } },
  }).success, true);

  const methodNames = Object.getOwnPropertyNames(FaviconCustomService.prototype);
  for (const method of ['getWorkspacePrefs', 'setWorkspacePrefs']) {
    assert.equal(methodNames.includes(method), true, `服务上缺少 ${method}()`);
  }
});
