// dsh-notify-p · 「发一封测试邮件」
//
// 三个入口共用这一份实现，避免"设置页测通了、命令行测不通"这种漂移：
//   1. 设置页状态条上的「发送测试邮件」→ Host Remote `mailNotify/test`
//   2. `node test/send-test.mjs`（不依赖 DSH 运行、不需要重启）
//   3. 单元测试
//
// 投递账本已删除（见 docs/adr/0003）：这里只发信、只把结果原样返回给调用方，
// 不落盘、不留历史，命令行与设置页因此天然不会互相覆盖。
import { OUTCOME } from './policy.js';
import { renderMail } from './render.js';
import { parseRecipients, recipientIssues } from './config.js';
import { sendMail } from './send/index.js';

/** 测试邮件的会话标题（收件人一眼能看出这是插件自己发的）。 */
export const TEST_TITLE = '测试邮件 / Test email';

/**
 * 把任意一条投递记录整理成固定形状。
 *
 * 形状必须稳定：typert 清单里声明的结果是 strict schema，缺字段会在浏览器侧炸。
 * `channels` 恒为一项（只剩 SMTP 一条通道），保留它是为了不改 typert 清单里
 * 声明的 strict schema：设置页只需要处理一种形状。
 * @param {object} entry 投递记录
 * @returns {{at: number, ok: boolean, transport: string, recipients: string[], subject: string, ms: number, error: string, channels: object[]}} 扁平结果
 */
export function toDeliveryView(entry) {
  const channels = Array.isArray(entry?.channels)
    ? entry.channels
      .filter((item) => item !== null && typeof item === 'object')
      .map((item) => ({
        transport: typeof item.transport === 'string' ? item.transport : '',
        ok: item.ok === true,
        ms: typeof item.ms === 'number' ? item.ms : 0,
        error: typeof item.error === 'string' ? item.error : '',
      }))
    : [];
  return {
    at: typeof entry?.at === 'number' ? entry.at : Date.now(),
    ok: entry?.ok === true,
    transport: typeof entry?.transport === 'string' ? entry.transport : '',
    recipients: Array.isArray(entry?.recipients) ? entry.recipients.filter((item) => typeof item === 'string') : [],
    subject: typeof entry?.subject === 'string' ? entry.subject : '',
    ms: typeof entry?.ms === 'number' ? entry.ms : 0,
    error: typeof entry?.error === 'string' ? entry.error : '',
    channels,
  };
}

/**
 * 按一份配置真的发一封测试邮件。
 *
 * 刻意绕开队列：测试要的是"现在告诉我通不通"，而不是排队等限流。
 * **勾了几个通道就测几个**——测试的意义就是验证当前这套配置。
 * 失败一律作为结果返回，不抛——调用方（设置页 / 命令行）需要拿到原因去显示。
 * @param {object} options 参数
 * @param {object} options.config 已解析配置（resolveConfig 的产物）
 * @param {object} [options.logger] 日志器
 * @param {(ref: string) => Promise<string|undefined>} [options.resolveCredential] 凭据解析
 * @returns {Promise<object>} 扁平结果（见 toDeliveryView）
 */
export async function sendTestMail(options) {
  const config = options?.config ?? {};
  const logger = options?.logger ?? {};
  const resolveCredential = options?.resolveCredential;
  const startedAt = Date.now();

  const { valid, invalid } = parseRecipients(config.recipients);
  if (invalid.length > 0) {
    logger.warn?.(`dsh-notify-p: 测试投递忽略无法识别的收件人 / ignored invalid recipients: ${invalid.join(', ')}`);
  }

  // 收件人问题与发送方式无关，就地返回：不抛，也不去连网络
  const globalIssues = recipientIssues(valid.length);
  if (globalIssues.length > 0) {
    return toDeliveryView({
      at: Date.now(),
      ok: false,
      transport: 'smtp',
      recipients: valid,
      subject: '',
      ms: Date.now() - startedAt,
      error: globalIssues.join('；'),
    });
  }

  const rendered = renderMail({
    outcome: OUTCOME.COMPLETED,
    sessionId: 'test',
    sessionTitle: TEST_TITLE,
    cwd: '',
    endedAt: Date.now(),
    durationMs: 0,
  });

  const summary = await sendMail(config, {
    to: valid,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  }, { logger, resolveCredential });

  if (summary.ok) {
    logger.info?.(`dsh-notify-p: 测试邮件已投递 / test delivered via ${summary.transport} → ${valid.join(', ')}`);
  } else {
    logger.warn?.(`dsh-notify-p: 测试投递失败 / test delivery failed: ${summary.error}`);
  }
  return toDeliveryView({
    at: Date.now(),
    ok: summary.ok,
    transport: summary.transport,
    recipients: valid,
    subject: rendered.subject,
    ms: summary.ms,
    error: summary.error,
    channels: summary.channels,
  });
}
