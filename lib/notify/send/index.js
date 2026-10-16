// dsh-notify-p · 发送层入口
//
// 只有 SMTP 一条通道：send({ from, to, subject, text, html }) → { ok, id }
//
// 这里曾经有「只记录」与 Resend 两条通道，已删除。结果形状里的 `transport` 与 `channels[]`
// **刻意保留**：它同时是落盘账本的格式、typert 清单里声明的出参、以及设置页「最近一次发送」
// 的渲染依据，删通道不需要动这个契约。

import { createSmtpSender, MailSendError } from './smtp.js';
import { resolveSender, smtpIssues } from '../config.js';

export { MailSendError };

/**
 * 建 SMTP 发送器，并按"凭据引用名"解析出真值。
 * @param {object} config 已解析配置
 * @param {object} deps 依赖
 * @param {(ref: string) => Promise<string|undefined>} deps.resolveCredential 解析凭据引用
 * @param {object} [deps.logger] 日志器
 * @returns {Promise<{name: string, send: Function}>}
 */
export async function createSender(config, deps) {
  const logger = deps?.logger ?? {};
  const resolveCredential = deps?.resolveCredential;

  const ref = String(config.smtpPasswordRef ?? '').trim();
  const password = ref === '' || typeof resolveCredential !== 'function'
    ? undefined
    : await resolveCredential(ref);
  if (typeof password !== 'string' || password === '') {
    logger.warn?.(`dsh-notify-p: 凭据 "${ref}" 未配置，SMTP 发信会失败。`
      + `请写入 $DSH_HOME/.credentials.yaml 或设为同名环境变量 / credential "${ref}" is not configured.`);
  }
  return createSmtpSender({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    user: config.smtpUser,
    password: password ?? '',
    logger,
  });
}

/**
 * 拼发件人字符串。
 *
 * 地址优先用发件人清单里选中的那条；拿不到就退回 SMTP 用户名（这是老配置的行为）；
 * 两者都没有就只给显示名。
 * @param {object} config 已解析配置
 * @returns {string} "名字 <地址>"，或拿不到地址时只返回名字
 */
export function resolveFrom(config) {
  const sender = resolveSender(config);
  const name = sender.name;
  let address = sender.address;
  if (address === '') address = String(config.smtpUser ?? '').trim();
  if (address === '') return name;
  return name === '' ? address : `${name} <${address}>`;
}

/**
 * 发送前能查出来的配置问题（给日志一句中文可读提示，比等到 SMTP 层报错更早）。
 * @param {object} config 已解析配置
 * @param {number} recipientCount 有效收件人数
 * @returns {string[]} 问题列表（空数组表示没发现明显问题）
 */
export function checkSenderConfig(config, recipientCount) {
  const issues = [];
  if (recipientCount === 0) issues.push('收件人为空 / no recipients configured');
  issues.push(...smtpIssues(config));
  return issues;
}

/**
 * 发一封信（走 SMTP）。
 *
 * 返回值沿用原来「逐通道结果 + 汇总」的形状，只是 `channels` 现在恒为一项：
 * 设置页与账本都按这个形状读，改形状要连带改 typert 清单与已落盘的账本。
 * @param {object} config 已解析配置
 * @param {{to: string[], subject: string, text: string, html?: string}} message 邮件内容（不含 from）
 * @param {object} deps 依赖（logger / resolveCredential）
 * @returns {Promise<{ok: boolean, transport: string, ms: number, error: string, retryable: boolean, channels: object[]}>} 汇总
 */
export async function sendMail(config, message, deps = {}) {
  const logger = deps.logger ?? {};
  const startedAt = Date.now();
  let result;
  try {
    // 必填项先查：缺主机去连网络只会拿到一句更难读的错。
    const issues = smtpIssues(config);
    if (issues.length > 0) {
      throw new MailSendError(`配置不完整，未发信 / incomplete config: ${issues.join('；')}`, {
        code: 'CONFIG',
        retryable: false,
      });
    }
    const sender = await createSender(config, deps);
    await sender.send({ ...message, from: resolveFrom(config) });
    result = { transport: sender.name, ok: true, ms: Date.now() - startedAt, error: '', retryable: false };
  } catch (error) {
    logger.warn?.(`dsh-notify-p: SMTP 投递失败 / delivery failed: ${error?.message ?? String(error)}`);
    result = {
      transport: 'smtp',
      ok: false,
      ms: Date.now() - startedAt,
      error: error?.message ?? String(error),
      retryable: error?.retryable === true,
    };
  }
  return {
    ok: result.ok,
    transport: result.transport,
    ms: result.ms,
    error: result.ok ? '' : `smtp: ${result.error}`,
    retryable: result.retryable,
    channels: [result],
  };
}
