// dsh-lookout · 命令行测试发送（真的发一封，不经过 DSH 运行进程）
//
// 为什么要有这个：设置页上的「发送测试邮件」依赖 Host Remote，而 typert 清单只在
// DSH **启动时**被扫描——刚装完/刚更新完必须先重启才点得到。这个脚本读同一份
// 组合层配置（$DSH_HOME/profiles/<profile>/cordis.patch.yml 里本插件 entry 的
// config）与同一个凭据库，因此可以立刻验证"我这套 SMTP 到底通不通"。
//
// 用法：
//   node test/send-test.mjs                     # 用 profile 里的配置真发一封
//   node test/send-test.mjs --to me@qq.com      # 临时换收件人
//   node test/send-test.mjs --dry-run           # 只打印会发什么、发给谁，不连网络
//   node test/send-test.mjs --smtp-host smtp.qq.com --smtp-user me@qq.com
//   node test/send-test.mjs --help
//
// 凭据解析顺序与插件运行时一致：环境变量 > $DSH_HOME/.credentials.yaml 的 refs。
// 它**不写投递账本**：正在运行的 DSH 进程持有内存账本，两边同时写只会互相覆盖。
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse as parseYaml } from 'yaml';

import { resolveConfig, smtpAccountHint } from '../lib/notify/config.js';
import { checkSenderConfig } from '../lib/notify/send/index.js';
import { sendTestMail } from '../lib/notify/test-send.js';

const USAGE = `dsh-lookout · 命令行测试发送

用法：node test/send-test.mjs [选项]

  --to <邮箱[,邮箱]>      收件人（覆盖配置里的 recipients）
  --smtp-host <主机>      --smtp-port <端口>   --smtp-secure <auto|tls|starttls|plain>
  --smtp-user <用户名>    发件地址就用它
  --dry-run               只打印将要发送的内容与目标，不连网络
  --json                  以 JSON 打印结果（便于脚本消费）
  --help

配置来源：$DSH_HOME/profiles/<profile>/cordis.patch.yml 里本插件 entry 的 config
          （不按写死的 id 匹配：config 里写了 smtpHost 或 smtpPasswordRef 的那条就是它）。
          找不到就跳过这段、改用 schema 默认值，并在输出里说明。
          命令行参数优先于文件里的值。
凭据来源：环境变量，其次 $DSH_HOME/.credentials.yaml 的 refs。
`;

/**
 * 解析命令行参数。
 * @param {string[]} argv 参数列表
 * @returns {{flags: object, unknown: string[]}} 解析结果
 */
export function parseArgs(argv) {
  const flags = { dryRun: false, json: false, help: false };
  const unknown = [];
  const take = (index) => (index + 1 < argv.length ? argv[index + 1] : undefined);
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--help': case '-h': flags.help = true; break;
      case '--dry-run': flags.dryRun = true; break;
      case '--json': flags.json = true; break;
      case '--to': flags.recipients = take(i); i += 1; break;
      case '--smtp-host': flags.smtpHost = take(i); i += 1; break;
      case '--smtp-port': flags.smtpPort = Number(take(i)); i += 1; break;
      case '--smtp-secure': flags.smtpSecure = take(i); i += 1; break;
      case '--smtp-user': flags.smtpUser = take(i); i += 1; break;
      default: unknown.push(arg); break;
    }
  }
  return { flags, unknown };
}

/** DSH home（默认 ~/.dsh，可用 DSH_HOME 覆盖）。 */
export function dshHome() {
  return typeof process.env.DSH_HOME === 'string' && process.env.DSH_HOME !== ''
    ? process.env.DSH_HOME
    : join(homedir(), '.dsh');
}

/**
 * 列出 $DSH_HOME/profiles/<profile>/cordis.patch.yml（可能装了多个 profile）。
 * 只返回真实存在的文件，按 profile 名排序，保证同一台机器每次读到的顺序一致。
 * @param {string} [home] DSH home
 * @returns {string[]} 候选文件路径
 */
export function profilePatchFiles(home = dshHome()) {
  const root = join(home, 'profiles');
  let names;
  try {
    names = readdirSync(root, { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .map((item) => item.name)
      .sort();
  } catch {
    return [];
  }
  const files = [];
  for (const name of names) {
    const file = join(root, name, 'cordis.patch.yml');
    try {
      if (statSync(file).isFile()) files.push(file);
    } catch {
      // 这个 profile 没有 patch 文件，换下一个
    }
  }
  return files;
}

/**
 * 从 profile 的 cordis.patch.yml 里取出本插件的 config（覆盖层）。
 *
 * 为什么不读旧的单文件配置：DSH 0.2.x 起组合层配置落在
 * $DSH_HOME/profiles/<profile>/cordis.patch.yml（旧文件只剩 .imported 备份，
 * 读它永远只读到改名前的默认值），而且 entry 的 id 随安装方式变化
 * （本机是 lookout，别处可能是别的名字）。
 * 所以**不按 id 匹配**：哪条 entry 的 config 里写了 smtpHost 或 smtpPasswordRef，
 * 哪条就是本插件。
 *
 * @param {string} [home] DSH home
 * @returns {{file: string|null, profile: string|null, entryId: string|null, config: object}}
 *   file 为 null 表示没找到；调用方要明说"跳过这一段"，不能装作读到了空配置
 */
export function readProfileConfig(home = dshHome()) {
  for (const file of profilePatchFiles(home)) {
    let parsed;
    try {
      parsed = parseYaml(readFileSync(file, 'utf8'));
    } catch {
      continue; // 这一份坏了就换下一份
    }
    const entries = Array.isArray(parsed) ? parsed : [parsed];
    for (const entry of entries) {
      if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) continue;
      const config = entry.config;
      if (config === null || typeof config !== 'object' || Array.isArray(config)) continue;
      if (!('smtpHost' in config) && !('smtpPasswordRef' in config)) continue;
      return {
        file,
        profile: basename(dirname(file)),
        entryId: typeof entry.id === 'string' ? entry.id : null,
        config,
      };
    }
  }
  return { file: null, profile: null, entryId: null, config: {} };
}

/**
 * 命令行参数转成配置覆盖层：只收本脚本支持的 5 个字段，其它开关（--dry-run 等）不进配置。
 * @param {object} flags parseArgs 的结果
 * @returns {object} 覆盖层
 */
export function overridesFromFlags(flags) {
  const overrides = {};
  for (const key of ['recipients', 'smtpHost', 'smtpPort', 'smtpSecure', 'smtpUser']) {
    if (flags?.[key] !== undefined) overrides[key] = flags[key];
  }
  return overrides;
}

/**
 * 给输出用的一句话：这份配置到底来自哪个文件。
 * @param {{file: string|null, profile: string|null, entryId: string|null}} found readProfileConfig 的结果
 * @returns {string} 人话
 */
export function describeConfigSource(found) {
  if (found?.file === null || found?.file === undefined) {
    return '未找到（$DSH_HOME/profiles/*/cordis.patch.yml 里没有含 smtpHost / smtpPasswordRef 的 entry，'
      + '已跳过文件叠加，改用 schema 默认值）';
  }
  const id = found.entryId === null ? '(entry 没有 id)' : found.entryId;
  return `${found.file}（profile ${found.profile}，entry ${id}）`;
}

/**
 * 读凭据库的 refs 段。
 * @param {string} [home] DSH home
 * @returns {Record<string, string>} 引用名到值
 */
export function readCredentialRefs(home = dshHome()) {
  try {
    const doc = parseYaml(readFileSync(join(home, '.credentials.yaml'), 'utf8'));
    const refs = doc?.refs;
    if (!refs || typeof refs !== 'object') return {};
    const out = {};
    for (const [key, value] of Object.entries(refs)) {
      if (typeof value === 'string' && value !== '') out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * 与插件运行时一致的凭据解析：环境变量优先，其次凭据库。
 * @param {string} ref 引用名
 * @param {Record<string, string>} refs 凭据库内容
 * @returns {string|undefined} 凭据值
 */
export function resolveCredentialFrom(ref, refs) {
  const key = typeof ref === 'string' ? ref.trim() : '';
  if (key === '') return undefined;
  const env = process.env[key];
  if (typeof env === 'string' && env !== '') return env;
  return refs[key];
}

/** 主流程。 */
async function main() {
  const { flags, unknown } = parseArgs(process.argv.slice(2));
  if (flags.help) {
    process.stdout.write(USAGE);
    return 0;
  }
  if (unknown.length > 0) {
    process.stderr.write(`未知参数 / unknown flags: ${unknown.join(', ')}\n\n${USAGE}`);
    return 2;
  }

  const home = dshHome();
  const profileConfig = readProfileConfig(home);
  // 叠加顺序：schema 默认值 < profile 文件里的 config < 命令行参数
  const config = resolveConfig({ ...profileConfig.config, ...overridesFromFlags(flags) });

  const refs = readCredentialRefs(home);
  const credentialValue = resolveCredentialFrom(config.smtpPasswordRef, refs);

  const logger = {
    info: (message) => { if (!flags.json) process.stdout.write(`${message}\n`); },
    warn: (message) => { if (!flags.json) process.stderr.write(`[warn] ${message}\n`); },
    debug: () => {},
  };

  if (!flags.json) {
    process.stdout.write(`配置来源 source : ${describeConfigSource(profileConfig)}\n`);
    const recipientCount = config.recipients.trim() === '' ? 0 : 1;
    const issues = checkSenderConfig(config, recipientCount);
    process.stdout.write('将要发送 / about to send:\n');
    process.stdout.write(`  主机 host      : ${config.smtpHost || '(空)'}:${config.smtpPort} (${config.smtpSecure})\n`);
    process.stdout.write(`  用户名 user    : ${config.smtpUser || '(空)'}\n`);
    process.stdout.write(`  收件人 to      : ${config.recipients.split(/[\n,;]+/).filter((x) => x.trim() !== '').join(', ') || '(空)'}\n`);
    process.stdout.write(`  凭据 ${config.smtpPasswordRef} : ${credentialValue === undefined ? '未找到（环境变量或凭据库都没有）' : `已找到（${credentialValue.length} 字符，不回显）`}\n`);
    const accountHint = smtpAccountHint(config);
    if (accountHint !== '') process.stdout.write(`  ⚠️ ${accountHint}\n`);
    if (issues.length > 0) process.stdout.write(`  ⚠️ 配置问题：${issues.join('；')}\n`);
    process.stdout.write('\n');
  }

  if (flags.dryRun) {
    if (!flags.json) process.stdout.write('--dry-run：不连网络，结束。\n');
    else process.stdout.write(`${JSON.stringify({ dryRun: true, configSource: profileConfig.file, recipients: config.recipients }, null, 2)}\n`);
    return 0;
  }

  const result = await sendTestMail({
    config,
    logger,
    resolveCredential: (ref) => Promise.resolve(resolveCredentialFrom(ref, refs)),
  });

  if (flags.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else if (result.ok) {
    process.stdout.write(`\n✅ 成功 / ok：${result.transport} → ${result.recipients.join(', ')}（${result.ms} 毫秒）\n`);
    process.stdout.write(`   主题：${result.subject}\n`);
  } else {
    process.stdout.write(`\n❌ 失败 / failed（${result.ms} 毫秒）\n   ${result.error}\n`);
  }
  return result.ok ? 0 : 1;
}

// 只在直接执行时跑 main，被 import 时（单测）不跑
if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then((code) => { process.exitCode = code; }).catch((error) => {
    process.stderr.write(`意外错误 / unexpected: ${String(error?.stack ?? error)}\n`);
    process.exitCode = 1;
  });
}
