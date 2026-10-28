// dsh-notify-p · Host 半（入口）
//
// 一句话：会话干完活 / 出错 / 卡住 / 等你审批时，发一封邮件到你的邮箱，
// 正文写清"是哪个会话"（不带任何链接——"邮件直达会话"这条能力已整块删除）。
//
// 四条纪律（都来自对同类插件的调研，写在代码里免得以后改回去）：
//   1. aborted 必须按 cause 细分（重启/热更会以 disposed 结束回合，不是"你主动停止"）
//   2. 子代理会话默认跳过（一个 workflow 能扇出几十个子会话）
//   3. 一个会话的连续多轮只提醒一次（turn/end 后等 SETTLE_MS，期间又开新轮就取消）
//   4. 每个订阅处理器都要自吞异常：cordis 的 emit 是 stop-on-throw，
//      一个插件抛错会饿死排在后面的订阅者（含 DSH 自己的持久化/遥测）

import {
  resolveConfig,
  parseRecipients,
  recipientIssues,
  SETTLE_MS,
  MIN_DURATION_MS,
  RATE_PER_MINUTE,
} from './config.js';
import {
  OUTCOME,
  classifyTurnEnd,
  isOutcomeEnabled,
  shouldSkipSession,
  dedupeKey,
  errorKey,
  flattenError,
} from './policy.js';
import { renderMail } from './render.js';
import { createSendQueue } from './queue.js';
import { sendMail, MailSendError } from './send/index.js';
import { MailNotifyRemoteService } from './service.js';
import { sendTestMail } from './test-send.js';

export const name = 'dsh-notify-p';

/**
 * sessions：扫已有会话补标题、订阅会话事件。
 *
 * 这里**不 inject settings**：配置不是从 settings 服务读的，而是 apply 收到的
 * 入口 config（见下方 readConfig），凭据走 credentials 服务（可用时）或环境变量。
 * 代码里没有任何 `ctx.settings` 调用，多挂一个服务只会让人误判依赖。
 */
export const inject = ['sessions'];

/** 去重表上限，防长跑进程无界增长。 */
const SENT_LIMIT = 5000;

/**
 * 插件入口。
 *
 * 这里是最后一道保险：本插件的任何异常都不允许把 DSH 的启动带崩。
 * 真正的装配逻辑在 start() 里，外面只负责"兜住并降级"。
 * @param {import('@deepseek-ai/cordis').Context} ctx 插件上下文
 * @param {object} [entryConfig] cordis 行的 config（组合层 patch 里本插件 entry 的 config；缺省字段由 MailSchema 兜底）
 * @returns {void}
 */
export function apply(ctx, entryConfig) {
  try {
    start(ctx, entryConfig);
  } catch (error) {
    try {
      ctx?.logger?.warn?.(`dsh-notify-p: 启动失败，插件自行禁用（DSH 不受影响）/ failed to start, plugin disabled: ${String(error)}`);
    } catch {
      /* 连日志都打不出去也无所谓，绝不能往上抛 */
    }
  }
}

/**
 * 真正的装配逻辑。
 * @param {import('@deepseek-ai/cordis').Context} ctx 插件上下文
 * @param {object} [entryConfig] cordis 行的 config
 * @returns {void}
 */
function start(ctx, entryConfig) {
  const logger = ctx.logger ?? console;

  // ---- 配置：**每次读活的**，绝不在装配时快照 ----
  //
  // 设置页保存走 cordis-plugin-loader 的 `_commitVolatile`：它把新值**原地**写进
  // apply 收到的那个 config 对象里的 volatile 引用，**不会重跑 apply**。
  // 所以这里若写成 `const entry = resolveConfig(entryConfig)` 再反复用它，
  // 表现就是「开关能点、也存住了，但插件行为一直不变，非要重启才生效」。
  //
  // 同理，这里也**不碰 settings 服务**：本插件不注册命名空间、不读 `ctx.settings`，
  // 配置就是 apply 收到的这份入口 config（schema 由 loader 从入口的 `Config` 导出取，
  // 见 lib/index.js）。所以 inject 里也不需要 settings——它缺席时本插件照常跑。
  //
  // 出参永远是裸值的普通对象：volatile 那层壳由 config.js 的 resolveConfig 拆掉。
  const readConfig = () => resolveConfig(entryConfig);

  // ---- 运行态 ----
  /** @type {Map<string, string>} 会话 id → 标题 */
  const titles = new Map();
  /** @type {Map<string, number>} 会话 id → 本轮回合开始时刻 */
  const turnStarts = new Map();
  /** @type {Map<string, {timer: NodeJS.Timeout, payload: object}>} 消抖窗口 */
  const pending = new Map();
  /** @type {Map<string, {turn: number|null, text: string}>} 会话 id → 最近一次 agent/error（比 turn/end 更原始） */
  const agentErrors = new Map();
  /** @type {Set<string>} 已发过的去重键 */
  const sent = new Set();

  const queue = createSendQueue({
    logger,
    limitPerMinute: () => RATE_PER_MINUTE,
  });

  // ---- Remote 服务：设置页的「发送测试邮件」----
  //
  // 走 Typert：清单在 lib/typert.host.js，由 dsh-typert-loader 在启动时扫描注册，
  // 浏览器侧通过 connection.rpc.call('/api', 'mailNotify/test') 调用。
  // 这里只把 runtime 递进去，服务本身不碰插件状态。
  try {
    ctx.plugin(MailNotifyRemoteService, {
      /** 立刻发一封测试邮件（不等合并窗口、不占限流额度）。 */
      test: async () => runTestDelivery(),
    });
  } catch (error) {
    logger.warn?.(`dsh-notify-p: Remote 服务注册失败，「发送测试邮件」不可用 / remote service registration failed: ${String(error)}`);
  }

  // ---- 小工具 ----

  /**
   * 按当前配置真的发一封测试邮件。
   *
   * 实现放在 lib/test-send.js：设置页、命令行（test/send-test.mjs）与单元测试共用同一份，
   * 免得"设置页测通了、命令行测不通"。返回值仍是同一份扁平结果（toDeliveryView 的形状）。
   * @returns {Promise<object>} 扁平结果
   */
  async function runTestDelivery() {
    return sendTestMail({
      config: readConfig(),
      logger,
      resolveCredential,
    });
  }

  /**
   * 解析凭据引用：优先凭据服务（叠加启动环境 > .credentials.yaml > .env），
   * 服务不可用时退回同名环境变量。绝不缓存，避免换 Key 要重启。
   * @param {string} ref 凭据引用名
   * @returns {Promise<string|undefined>}
   */
  async function resolveCredential(ref) {
    const key = typeof ref === 'string' ? ref.trim() : '';
    if (key === '') return undefined;
    const credentials = typeof ctx.get === 'function' ? ctx.get('credentials') : undefined;
    if (credentials !== undefined) {
      try {
        const hit = await credentials.resolve(key);
        const value = hit && typeof hit === 'object' ? hit.value : undefined;
        if (typeof value === 'string' && value !== '') return value;
      } catch (error) {
        logger.debug?.(`dsh-notify-p: 凭据解析失败 / credential resolve failed (${key}): ${String(error)}`);
      }
    }
    const env = process.env[key];
    return typeof env === 'string' && env !== '' ? env : undefined;
  }

  /**
   * 读会话标题：优先标题服务，其次本地折叠表，最后空串（渲染层会降级成 ID 前 8 位）。
   * @param {object} session 会话
   * @returns {string}
   */
  function readTitle(session) {
    const cached = titles.get(session.id);
    if (typeof cached === 'string' && cached !== '') return cached;
    const sessionTitle = typeof ctx.get === 'function' ? ctx.get('sessionTitle') : undefined;
    try {
      const snapshot = sessionTitle?.get?.(session);
      const title = snapshot && typeof snapshot.title === 'string' ? snapshot.title : '';
      if (title !== '') {
        titles.set(session.id, title);
        return title;
      }
    } catch (error) {
      logger.debug?.(`dsh-notify-p: sessionTitle.get 失败 / failed: ${String(error)}`);
    }
    return '';
  }

  /**
   * 标记已发；返回 false 表示这条已经发过。
   * 错误类只看 `会话+轮次`（把 turn/end(error) 与 agent/error 折叠成一封）。
   * @param {string} sessionId 会话 id
   * @param {number|null} turn 轮次
   * @param {string} outcome 结局
   * @returns {boolean}
   */
  function markSent(sessionId, turn, outcome) {
    const key = outcome === OUTCOME.ERROR ? errorKey(sessionId, turn) : dedupeKey(sessionId, turn, outcome);
    if (sent.has(key)) return false;
    sent.add(key);
    while (sent.size > SENT_LIMIT) {
      const oldest = sent.values().next().value;
      sent.delete(oldest);
    }
    return true;
  }

  /**
   * 取消某会话的消抖窗口。
   * @param {string} sessionId 会话 id
   * @param {string} why 取消原因（日志用）
   * @returns {boolean} 是否确实取消了
   */
  function cancelPending(sessionId, why) {
    const item = pending.get(sessionId);
    if (item === undefined) return false;
    clearTimeout(item.timer);
    pending.delete(sessionId);
    logger.debug?.(`dsh-notify-p: 合并窗口内会话继续工作，取消本次提醒 / coalesced (${sessionId}, ${why})`);
    return true;
  }

  /**
   * 安排一次提醒（先过消抖窗口）。
   * @param {object} session 会话
   * @param {object} payload 已判定的结局载荷
   * @returns {void}
   */
  function schedule(session, payload) {
    const sessionId = session.id;
    cancelPending(sessionId, 'superseded');
    const enriched = {
      ...payload,
      sessionTitle: readTitle(session),
      cwd: session.header?.cwd ?? '',
      sessionId,
    };
    const timer = setTimeout(() => {
      pending.delete(sessionId);
      try {
        fire(enriched);
      } catch (error) {
        logger.warn?.(`dsh-notify-p: 提醒发送异常 / fire threw: ${String(error)}`);
      }
    }, Math.max(0, SETTLE_MS));
    timer.unref?.();
    pending.set(sessionId, { timer, payload: enriched });
  }

  /**
   * 真正投递一封（已过消抖与去重）。
   * @param {object} payload 结局载荷
   * @returns {void}
   */
  function fire(payload) {
    if (!markSent(payload.sessionId, payload.turn ?? null, payload.outcome)) {
      logger.debug?.(`dsh-notify-p: 重复结局，跳过 / duplicate outcome, skipped (${payload.sessionId}, ${payload.outcome})`);
      return;
    }
    queue.enqueue({
      label: `${payload.outcome} ${payload.sessionId}`,
      run: () => deliver(payload),
    });
  }

  /**
   * 渲染并发送（走 SMTP）。
   * @param {object} payload 结局载荷
   * @returns {Promise<{subject: string, recipients: string[], transport: string, channels: object[]}>} 投递摘要
   */
  async function deliver(payload) {
    const cfg = readConfig();
    if (cfg.enabled !== true) return { subject: '', recipients: [], transport: 'disabled', channels: [] };

    const { valid, invalid } = parseRecipients(cfg.recipients);
    if (invalid.length > 0) {
      logger.warn?.(`dsh-notify-p: 忽略无法识别的收件人 / ignored invalid recipients: ${invalid.join(', ')}`);
    }
    // 收件人为空要抛出去：让队列把它记成一条失败并打出 warn，
    // 否则"没配收件人"会静默成功，用户永远不知道。
    const globalIssues = recipientIssues(valid.length);
    if (globalIssues.length > 0) {
      throw new MailSendError(`配置不完整，未发信 / incomplete config: ${globalIssues.join('；')}`, {
        code: 'CONFIG',
        retryable: false,
      });
    }

    const rendered = renderMail({
      outcome: payload.outcome,
      sessionId: payload.sessionId,
      sessionTitle: payload.sessionTitle,
      cwd: payload.cwd,
      turn: payload.turn ?? undefined,
      endedAt: payload.endedAt,
      durationMs: payload.durationMs,
      errorText: payload.detail,
      approval: payload.approval,
    });

    // 发信：拿不到地址、缺主机/用户名之类的问题都在 sendMail 里先查一遍，
    // 失败时带着码与可重试标记回来，交给队列决定要不要退避重试。
    const summary = await sendMail(cfg, {
      to: valid,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
    }, { logger, resolveCredential });

    if (!summary.ok) {
      const error = new MailSendError(summary.error, { code: 'CHANNEL', retryable: summary.retryable });
      // 把逐通道结果挂在错误上：排错时要看得出"哪个通道成了、哪个没成"，而不是一句合并后的黑箱。
      error.channels = summary.channels;
      error.transport = summary.transport;
      throw error;
    }

    logger.info?.(`dsh-notify-p: 已投递 / delivered via ${summary.transport} → ${valid.join(', ')} | ${rendered.subject}`);
    return { subject: rendered.subject, recipients: valid, transport: summary.transport, channels: summary.channels };
  }

  // ---- 事件判定 ----

  /**
   * 处理一轮结束。
   * @param {object} session 会话
   * @param {object} event turn/end 事件
   * @returns {void}
   */
  function onTurnEnd(session, event) {
    const cfg = readConfig();
    if (cfg.enabled !== true) return;
    if (shouldSkipSession(session, cfg)) return;

    const classified = classifyTurnEnd(event.data);
    if (classified === null) return;
    if (!isOutcomeEnabled(classified.outcome, cfg)) return;

    const turn = typeof event.data?.turn === 'number' ? event.data.turn : null;
    const endedAt = typeof event.time === 'number' ? event.time : Date.now();
    const startedAt = turnStarts.get(session.id);
    const durationMs = typeof startedAt === 'number' ? Math.max(0, endedAt - startedAt) : null;

    // 短任务不打扰只对"完成"生效：出错/卡住/审批永远值得打扰
    if (classified.outcome === OUTCOME.COMPLETED && durationMs !== null && durationMs < MIN_DURATION_MS) {
      logger.debug?.(`dsh-notify-p: 任务过短不打扰 / short task skipped (${durationMs}ms < ${MIN_DURATION_MS}ms)`);
      return;
    }

    // agent/error 通常先到、且带原始抛出值：用它覆盖 turn/end 里扁平化的报错文本。
    // 注意：这里**不能**"读一次就删"——同一回合可能有第二次 turn/end 上报，
    // 那会把已经排队的富文本又覆盖回扁平文本。靠 turn 号相等来防串味，
    // 真正的清理交给下一条 agent/error 覆盖或 session/disposed。
    let detail = classified.detail ?? '';
    const agentError = agentErrors.get(session.id);
    if (classified.outcome === OUTCOME.ERROR && agentError !== undefined) {
      if (turn === null || agentError.turn === null || agentError.turn === turn) {
        detail = agentError.text !== '' ? agentError.text : detail;
      }
    }

    schedule(session, {
      outcome: classified.outcome,
      turn,
      detail,
      endedAt,
      durationMs: durationMs ?? 0,
      cause: classified.cause,
    });
  }

  /**
   * 处理一条审批请求：立即发（审批是阻塞用户的，晚几分钟就没意义），不参与消抖。
   * @param {object} session 会话
   * @param {object} event approval/asked 事件
   * @returns {void}
   */
  function onApproval(session, event) {
    const cfg = readConfig();
    if (cfg.enabled !== true || cfg.notifyApproval !== true) return;
    if (shouldSkipSession(session, cfg)) return;

    const data = event.data ?? {};
    cancelPending(session.id, 'approval');
    fire({
      outcome: OUTCOME.APPROVAL,
      sessionId: session.id,
      turn: typeof data.turn === 'number' ? data.turn : null,
      sessionTitle: readTitle(session),
      cwd: session.header?.cwd ?? '',
      detail: '',
      endedAt: typeof event.time === 'number' ? event.time : Date.now(),
      durationMs: 0,
      // P0-4：approval/asked 只有 { id, toolName, callId, reason }，没有命令正文。
      // 要显示命令必须用 callId 回查 tool/call——第一期刻意不做，免得猜错。
      approval: {
        toolName: typeof data.toolName === 'string' ? data.toolName : '',
        reason: typeof data.reason === 'string' ? data.reason : '',
      },
    });
  }

  /**
   * 观察一条会话事件。
   * @param {object} session 会话
   * @param {object} event 事件
   * @param {{replay?: boolean}} [opts] replay=true 表示来自挂载时的历史扫描（只折叠状态，绝不发信）
   * @returns {void}
   */
  function observe(session, event, opts = {}) {
    const type = event?.type;
    if (type === 'session/title') {
      const title = event.data?.title;
      if (typeof title === 'string' && title !== '') titles.set(session.id, title);
      return;
    }
    if (type === 'turn/start') {
      turnStarts.set(session.id, typeof event.time === 'number' ? event.time : Date.now());
      if (opts.replay !== true) cancelPending(session.id, 'turn/start');
      return;
    }
    if (type === 'turn/end') {
      if (opts.replay === true) return; // 纪律：回放历史绝不发信
      onTurnEnd(session, event);
      return;
    }
    if (type === 'approval/asked') {
      if (opts.replay === true) return;
      onApproval(session, event);
    }
  }

  /**
   * 接管一个会话：只补标题（热更/重启不会重放 session/created）。
   * @param {object} session 会话
   * @returns {void}
   */
  function adopt(session) {
    if (typeof session?.id !== 'string') return;
    readTitle(session);
    if (titles.has(session.id)) return;
    try {
      const events = typeof session.snapshotEvents === 'function' ? session.snapshotEvents() : [];
      for (const event of events) {
        if (event?.type === 'session/title' && typeof event.data?.title === 'string' && event.data.title !== '') {
          titles.set(session.id, event.data.title);
        }
      }
    } catch (error) {
      logger.debug?.(`dsh-notify-p: 折叠会话标题失败 / failed to fold title: ${String(error)}`);
    }
  }

  // ---- 订阅（每个处理器自吞异常，绝不饿死其它订阅者）----

  ctx.on('session/created', (session) => {
    try {
      adopt(session);
    } catch (error) {
      logger.debug?.(`dsh-notify-p: session/created 处理失败: ${String(error)}`);
    }
  });

  ctx.on('session/event', (session, event) => {
    try {
      observe(session, event);
    } catch (error) {
      logger.warn?.(`dsh-notify-p: session/event 处理失败 / handler failed: ${String(error)}`);
    }
  });

  ctx.on('agent/error', (payload) => {
    try {
      const agent = payload?.agent;
      const sessionId = agent?.session?.id
        ?? (typeof agent?.sessionId === 'string' ? agent.sessionId : '')
        ?? (typeof payload?.session?.id === 'string' ? payload.session.id : '');
      if (typeof sessionId !== 'string' || sessionId === '') return;
      agentErrors.set(sessionId, {
        turn: typeof payload?.turn === 'number' ? payload.turn : null,
        text: flattenError(payload?.error),
      });
    } catch (error) {
      logger.debug?.(`dsh-notify-p: agent/error 处理失败: ${String(error)}`);
    }
  });

  ctx.on('session/disposed', (session) => {
    try {
      const sessionId = session?.id;
      if (typeof sessionId !== 'string') return;
      cancelPending(sessionId, 'disposed');
      turnStarts.delete(sessionId);
      agentErrors.delete(sessionId);
      titles.delete(sessionId);
    } catch (error) {
      logger.debug?.(`dsh-notify-p: session/disposed 处理失败: ${String(error)}`);
    }
  });

  // 挂载时扫一遍已有会话（只为补标题，不发信）
  try {
    for (const session of ctx.sessions.list()) adopt(session);
  } catch (error) {
    logger.warn?.(`dsh-notify-p: 初始会话扫描失败 / initial sweep failed: ${String(error)}`);
  }

  // 卸载时清掉未触发的定时器
  ctx.effect(() => () => {
    for (const item of pending.values()) clearTimeout(item.timer);
    pending.clear();
  }, 'dsh-notify-p: pending timers');

  // 启动日志读一次就够（readConfig 每次都会重新解析，别在这里连读四遍）
  const initial = readConfig();
  logger.info?.(`dsh-notify-p 已加载 / loaded（SMTP ${initial.smtpHost === '' ? '未配置' : initial.smtpHost}，`
    + `收件人 ${parseRecipients(initial.recipients).valid.length} 个）`);
}
