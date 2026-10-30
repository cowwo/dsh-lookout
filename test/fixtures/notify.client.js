// dsh-notify-p · 浏览器半（手写客户端包，无构建步骤）
//
// 形态：**左侧「设置」导航里独立一页**（settings.section，order 60 = 排在 icon 管理之后）。
//
// 这一页只回答两个问题：
//   1. 配好了吗   → 分组状态点（已配置 / 未配置 / 不适用）
//   2. 能发出去吗 → 顶部状态条 + 发送测试邮件（点了当场回执成败与原始报错）
// 其余一切让路：不额外套卡片、不加编号、不做中英同屏。
//
// 信息架构（ui18 = 零折叠骨架）：
//   内容列 max-width 760 居中；页头**吸顶**（标题 18/26·600 + 说明 13/20 + 右侧脏读数/保存/放弃改动）；
//   判决条 = 状态色 hero（bg-module-platform + 左侧 3px 状态色 + 18/26·600 标题 + 14/22 结论句
//     + 12/18 人话摘要 + 主按钮在右下）；
//   下面三张卡片：收件人 / 发信方式 / 通知时机（14/22·500 卡片标题 + 12/18 状态读数）；
//   **全页零折叠**：没有「▸ 更多」、没有「还有 3 种情况」、没有问号按钮——
//     端口 / 加密 / 主机 / 用户名宽屏一行四列（≤560px 两行两列）；
//     8 个事件开关三列网格（窄屏一列、不分组），说明常显在格子下方（一行 12/18）；
//     通知时机第一行是总开关（关闭后 8 个事件开关变灰禁用但不隐藏）；吸底条常驻「放弃 + 保存」。
//   字号阶梯全部落在宿主网格上（只用整像素档，不再有半档字号）；圆角只用 4/8/12/16/20/28。
//
// 编辑模型：**显式保存**。所有控件只改本地草稿，点「保存」才一次性写回：
//   - 配置字段：与基线不同的项合成一次 mutate(found.ns, ops, revision)
//   - 授权码：草稿只活在内存里，保存成功时才写凭据库（写入目标由那一行决定）
//   - 「放弃改动」把草稿整体回滚到基线；「恢复全部默认」不受保存按钮约束，立即生效
//
// 六条硬约束（前三条踩过，后三条是本轮修掉的）：
//   1. 注册页面只依赖 `slots`。远程命名空间 / locale 各开一个非阻塞的 ctx.inject 去填；
//      全部塞进同一个 inject 列表时，只要有一个服务当时不可用，回调就永远不触发——
//      页面会**静默消失**且没有任何报错。
//   2. Remote 方法返回 `{ ok, value }` 信封，不是裸值。
//   3. 全程兜异常：浏览器半出问题只该让这一页不可用，绝不能把设置面板带崩。
//   4. 凭据的写入目标必须由「哪一行」决定，不能从草稿里猜 `smtpPasswordRef`——
//      否则引用名一改，存的值就会写错位置，而页面一直显示「未配置」。
//   5. 只用宿主主题里真实存在的 token。`--dsw-alias-interact-*` / `--dsw-alias-border-secondary`
//      都不存在，写了会静默退回硬编码浅色值，暗色模式下整页失配。
//   6. 破坏性操作必须二次确认，且不与常规按钮同形。
window.__ModuleLoader__.load({
  id: 'dsh-notify-p',
  factory: (require) => {
    const React = require('react');
    const h = React.createElement;

    /** 宿主 UI 原语。取不到时降级为等价的最小实现，页面不该因为原语缺失而白屏。 */
    const P = (() => {
      try {
        return require('@deepseek-ai/dsh-client-ui-primitives') ?? {};
      } catch (error) {
        console.warn('[dsh-notify-p] 原语不可用，降级为内置实现 / primitives unavailable:', error);
        return {};
      }
    })();

    /** 只等必需服务：页面注册本身只需要 slots（硬约束 1）。 */
    const inject = ['slots'];

    /**
     * 文案字典的命名空间（宿主的 profile 入口 id）。
     *
     * **不是设置命名空间**：配置的 ns 每次都由 describe() 返回项里的 schema 签名认领
     * （见 load()），客户端不允许写死——profile 入口 id 换了，这里的所有读写都得跟着换。
     */
    const LOCALE_NS = 'lookout';

    /** Host Remote 的命名空间（与 lib/typert.host.js 清单一致）。 */
    const REMOTE_NS = 'mailNotify';

    // ---------------------------------------------------------------------------
    // 文案：zh 是内置兜底，en 走 locale 字典；界面永远只显示一种语言（不同屏并列）。
    // ---------------------------------------------------------------------------
    const ZH = {
      'group.status': '投递状态',
      'test.sent': '已发送',
      'test.sentMs': '用时 {ms} 毫秒',
      'test.failed': '这次没发出去',
      'cred.saved': '已保存',
      'cred.notSaved': '还没保存',
      'cred.draft': '有未保存的授权码',
      'cred.replace': '更换',
      'cred.clear': '清除',
      'cred.placeholder': '粘贴授权码',
      'err.auth': '服务端拒绝了这组账号密码',
      'err.authHint': '多半是授权码不对或过期了：QQ 邮箱要的是「授权码」而不是登录密码，重新生成一个再填。',
      'err.rejected': '发件人被拒',
      'err.rejectedHint': '收件服务器不接受这个发件人。发件地址由插件按服务端设置决定，确认这个邮箱被允许用来发信后再试。',
      'err.network': '连不上服务器',
      'err.networkHint': '检查主机名与端口；本机防火墙或公司网络也可能挡住 465 / 587。',
      'err.other': '发送失败',
      'err.otherCode': '发送失败（{code}）',
      'err.otherHint': '原始报错在下面，把它连同主机名一起看。',
      nav: '邮件通知',
      lead: '会话干完活、出错或卡住时，给你发一封邮件。',

      'save.clean': '没有未保存的改动',
      'save.dirty': '有 {n} 项改动未保存',
      'save.saving': '保存中…',
      'save.savedJust': '已保存 · 刚刚',
      'save.savedAgo': '已保存 · {n} 秒前',
      'save.savedMin': '已保存 · {n} 分钟前',
      'save.savedHour': '已保存 · {n} 小时前',
      'save.savedDay': '已保存 · {n} 天前',
      'save.error': '保存失败：{error}',
      'save.retry': '重试',
      'save.reload': '重新读取',
      // 读失败是**独立的一档**：它不是"保存失败"，重试也不该走保存那条路。
      'save.loadFailed': '读不到本插件的配置：{error}',
      // 冲突恢复：别人先改了 → 已自动重读，草稿没动，让用户再点一次。
      'save.conflictReloaded': '配置已被别处改动，已读到最新值，请再点一次保存',
      // 半成功：必须点出**哪一半**成功、哪一半没成，别用一句"保存失败"把成功的半吞掉。
      'save.credFailed': '配置已保存，但授权码没写进去：{error}',
      'save.configFailed': '授权码已保存，但配置没写进去：{error}',
      'save.credAlsoFailed': '授权码也没写进去：{error}',
      'save.retryCred': '重试授权码',
      'save.retryConfig': '重试配置',
      'save.checkingCred': '正在确认授权码是否已写入…',
      'save.credCheckFailed': '凭据状态读取失败：{error}',

      // 判决条只按已保存的配置判定，四档会给四句不同的话（总开关关 > 事件全关 > 缺配置 > 可以发）。
      'status.disabled': '已关闭，不会发任何通知',
      'status.allOff': '通知已全部关闭',
      'status.needRecipients': '还差一个收件人',
      'status.needHost': '还差 SMTP 服务器地址',
      'status.needUser': '还差 SMTP 用户名',
      'status.needCredential': '还差{cred}',
      'status.ready': '可以发信了',
      'status.notServed': '这一页读不到本插件的配置',

      // 判决下面那句人话。只说用户的事，不说实现的事。
      'status.why.disabled': '打开下面任意一种情况，才会开始通知你。',
      'status.why.allOff': '至少打开一个事件才会收到邮件。',
      'status.why.needRecipients': '没有收件邮箱，邮件没有地方可去。',
      'status.why.needHost': '还没填服务器地址。',
      'status.why.needUser': '多数邮箱要求用户名和授权码成对出现。',
      'status.why.needCredential': '没填它，服务端会拒收这封信。',
      'status.why.ready': '配置齐了。发一封测试邮件，确认服务端真的收下。',
      // 判决条只按已保存的配置判定，这句把口径说透，免得"我明明填好了"变成困惑。
      'status.unsavedDraft': '未保存的改动不参与判定。',

      'act.enable': '启用',
      'act.goFill': '去填写',
      'act.test': '发送测试邮件',
      'act.testing': '正在发送…',
      'act.retest': '重新测试',
      'act.needsRestart': '需要重启 DSH 后才能测试',
      // 明说用**哪一份**配置：测试走的是已保存配置，草稿还没落盘，别让人以为测的是屏幕上这些字。
      'act.testHint': '用已保存的配置真发一封到收件人，不用等某个会话干完。',
      'act.save': '保存',
      'act.discard': '放弃改动',
      'act.saveHint': '把这一页的改动一次性写回配置。',

      'group.recipients': '收件人',
      'group.transport': '发信方式',
      'group.outcomes': '通知时机',

      'recipients.label': '收件邮箱',
      'recipients.placeholder': 'you@qq.com',
      'recipients.hint': '一行一个，也接受逗号或分号分隔。',
      'recipients.ok': '{n} 个有效',
      'recipients.none': '还没填',
      'recipients.invalid': '格式不对，不会被发送：{list}',

      'transportState.done': '已配好',
      'transportState.todo': '还没配好',

      'smtp.note': '用自己的邮箱发（QQ / 163 / Gmail / Outlook / iCloud…），只需一个授权码。',

      'preset.label': '邮箱服务商',
      'preset.other': '其他',
      'preset.detected': '已按「{name}」填好',

      // 通知时机第一行：总开关。关掉之后 8 个事件开关变灰禁用（但不隐藏）。
      'notify.master': '邮件通知',
      'notify.masterHint': '关闭后不再发送任何邮件',

      'smtp.host': 'SMTP 主机',
      'smtp.port': '端口',
      'smtp.secure': '加密',
      'smtp.user': '用户名',
      'smtp.accountMismatch': '{host} 是{name}的服务器，但账号是 {user}：对不上，认证会失败。把账号换成 {suffix} 结尾的邮箱，或把服务商改成账号所属的那一家。',

      'cred.smtp': 'SMTP 授权码',
      'cred.smtpHint': '不是登录密码。只写进凭据库，永不回显；点「保存」时才写入。',
      'cred.smtpHelp': '怎么拿授权码？',
      'cred.smtpHelpTitle': '怎么拿 SMTP 授权码',
      'cred.smtpHelpBody': '授权码不是登录密码，是邮箱服务商单独发的口令（QQ 是 16 位）。\n\nQQ 邮箱：设置 → 账户 → 开启「POP3/SMTP 服务」→ 生成授权码。\n163 / 126：设置 → POP3/SMTP/IMAP → 开启服务 → 新增授权码。\nGmail：账号 → 安全性 → 两步验证 → 应用专用密码。\niCloud：Apple ID → 登录与安全 → App 专用密码。\nOutlook：账户 → 安全性 → 高级安全选项 → 应用密码。',
      'cred.helpClose': '知道了',

      // 8 个事件：标题是名词短语，说明压到一行（≤16 个中文字），常显在格子下方。
      'outcomes.completed': '任务完成',
      'outcomes.completedHint': '正常跑完时',
      'outcomes.error': '任务出错',
      'outcomes.errorHint': '报错终止时',
      'outcomes.blocked': '卡住',
      'outcomes.blockedHint': '等你补充信息时',
      'outcomes.approval': '等你审批',
      'outcomes.approvalHint': '等你点审批时',
      'outcomes.subagents': '也通知子代理',
      'outcomes.subagentsHint': '子代理也通知',
      'outcomes.aborted': '你主动停止',
      'outcomes.abortedHint': '你按了停止',
      'outcomes.interrupted': '系统中断',
      'outcomes.interruptedHint': '系统中断时',
      'outcomes.maxTokens': '长度上限',
      'outcomes.maxTokensHint': '达到上限时',
      'outcomes.countOn': '{n} 项开启',
      'outcomes.countOff': '全部关闭',

      // 判决条第三行的「人话摘要」用短名，一句话最多列两个事件。
      'short.completed': '跑完',
      'short.error': '出错',
      'short.blocked': '卡住',
      'short.approval': '等审批',
      'short.subagents': '子代理',
      'short.aborted': '停止',
      'short.interrupted': '中断',
      'short.maxTokens': '长度上限',

      'summary.line': '{provider} · {host} → {to} · {events}',
      'summary.noHost': '还没填主机',
      'summary.noRecipient': '还没填收件人',
      'summary.recipients': '{n} 位收件人',
      'summary.custom': '自定义',
      'summary.events': '{list}时通知',
      'summary.eventsMore': '{list} 等 {n} 项时通知',
      'summary.eventsOff': '通知已关闭',

      'danger.reset': '恢复全部默认',
      'danger.title': '恢复全部默认？',
      'danger.body': '这会清掉本插件在 profile 里的全部覆盖（收件人、事件开关、节奏参数都会回到默认），并立即生效——它不受「保存」按钮约束，这一页还没保存的草稿也会一起丢掉。',
      'danger.keep': '凭据库里已存的授权码不受影响。',
      'danger.ok': '恢复默认',
      'danger.cancel': '取消',
    };

    const EN = {
      'group.status': 'Delivery status',
      'test.sent': 'Sent',
      'test.sentMs': 'in {ms} ms',
      'test.failed': 'This send did not go out',
      'cred.saved': 'Saved',
      'cred.notSaved': 'Not saved yet',
      'cred.draft': 'An unsaved authorization code',
      'cred.replace': 'Replace',
      'cred.clear': 'Clear',
      'cred.placeholder': 'Paste the authorization code',
      'err.auth': 'The server rejected these credentials',
      'err.authHint': 'Usually a wrong or expired authorization code: QQ Mail needs an app code, not your login password. Generate a new one and paste it here.',
      'err.rejected': 'Sender rejected',
      'err.rejectedHint': 'The receiving server will not accept this sender. The From address comes from the plugin’s server-side settings; check that the mailbox is allowed to send.',
      'err.network': 'Cannot reach the server',
      'err.networkHint': 'Check the host and port; a local firewall or corporate network may block 465 / 587.',
      'err.other': 'Send failed',
      'err.otherCode': 'Send failed ({code})',
      'err.otherHint': 'The raw error is below — read it together with the host name.',
      nav: 'Mail notification',
      lead: 'Get one email when a session finishes, fails, or gets stuck.',

      'save.clean': 'No unsaved changes',
      'save.dirty': 'Unsaved changes: {n}',
      'save.saving': 'Saving…',
      'save.savedJust': 'Saved · just now',
      'save.savedAgo': 'Saved · {n}s ago',
      'save.savedMin': 'Saved · {n} min ago',
      'save.savedHour': 'Saved · {n} h ago',
      'save.savedDay': 'Saved · {n} d ago',
      'save.error': 'Save failed: {error}',
      'save.retry': 'Retry',
      'save.reload': 'Reload',
      'save.loadFailed': 'Cannot read this plugin’s settings: {error}',
      'save.conflictReloaded': 'The settings were changed elsewhere. The latest values are loaded — press Save again.',
      'save.credFailed': 'Settings saved, but the authorization code was not written: {error}',
      'save.configFailed': 'Authorization code saved, but the settings were not written: {error}',
      'save.credAlsoFailed': 'The authorization code was not written either: {error}',
      'save.retryCred': 'Retry the code',
      'save.retryConfig': 'Retry the settings',
      'save.checkingCred': 'Checking whether the code was written…',
      'save.credCheckFailed': 'Could not read the credential state: {error}',

      'status.disabled': 'Off — no notifications will be sent',
      'status.allOff': 'All notifications are off',
      'status.needRecipients': 'One recipient missing',
      'status.needHost': 'SMTP host missing',
      'status.needUser': 'SMTP user name missing',
      'status.needCredential': '{cred} missing',
      'status.ready': 'Ready to send',
      'status.notServed': 'This page cannot read the plugin settings',

      'status.why.disabled': 'Turn on any case below and notifications start.',
      'status.why.allOff': 'Turn on at least one event to get an email.',
      'status.why.needRecipients': 'Without a recipient address there is nowhere for the mail to go.',
      'status.why.needHost': 'No server address is set.',
      'status.why.needUser': 'Most providers want the user name and the authorization code together.',
      'status.why.needCredential': 'Without it the server will refuse the message.',
      'status.why.ready': 'Configuration is complete. Send a test email to confirm the server accepts it.',
      'status.unsavedDraft': 'Unsaved changes are not part of this verdict.',

      'act.enable': 'Turn on',
      'act.goFill': 'Fill it in',
      'act.test': 'Send a test email',
      'act.testing': 'Sending…',
      'act.retest': 'Test again',
      'act.needsRestart': 'Restart DSH to test',
      'act.testHint': 'Really sends one email to the recipients with the saved configuration, without waiting for a session to finish.',
      'act.save': 'Save',
      'act.discard': 'Discard changes',
      'act.saveHint': 'Writes every change on this page back in one go.',

      'group.recipients': 'Recipients',
      'group.transport': 'Sending method',
      'group.outcomes': 'When to notify',

      'recipients.label': 'Recipient addresses',
      'recipients.placeholder': 'you@qq.com, one per line',
      'recipients.hint': 'One per line; commas and semicolons also work.',
      'recipients.ok': '{n} valid',
      'recipients.none': 'None yet',
      'recipients.invalid': 'Bad format, will not be sent: {list}',

      'transportState.done': 'Configured',
      'transportState.todo': 'Not configured yet',

      'smtp.note': 'Send from your own mailbox (QQ / 163 / Gmail / Outlook / iCloud…). Only an authorization code is needed.',

      'preset.label': 'Mail provider',
      'preset.other': 'Other',
      'preset.detected': 'Filled in for “{name}”',

      'notify.master': 'Email notifications',
      'notify.masterHint': 'When off, no email is sent at all',

      'smtp.host': 'SMTP host',
      'smtp.port': 'Port',
      'smtp.secure': 'Security',
      'smtp.user': 'User name',
      'smtp.accountMismatch': '{host} is {name}’s server but the account is {user} — they do not match, so authentication will fail. Use a {suffix} address, or switch the provider to the account’s own.',

      'cred.smtp': 'SMTP authorization code',
      'cred.smtpHint': 'Not your login password. Written to the credential store only, never echoed; written when you press Save.',
      'cred.smtpHelp': 'How do I get one?',
      'cred.smtpHelpTitle': 'Getting an SMTP authorization code',
      'cred.smtpHelpBody': 'An authorization code is not your login password — the mail provider issues it separately.\n\nQQ Mail: Settings → Account → enable “POP3/SMTP service” → generate the code.\n163 / 126: Settings → POP3/SMTP/IMAP → enable the service → add an authorization code.\nGmail: Account → Security → 2-Step Verification → App passwords.\niCloud: Apple ID → Sign-In and Security → App-Specific Passwords.\nOutlook: Account → Security → Advanced security options → App password.',
      'cred.helpClose': 'Got it',

      'outcomes.completed': 'Task completed',
      'outcomes.completedHint': 'Finished normally',
      'outcomes.error': 'Task failed',
      'outcomes.errorHint': 'Ended with an error',
      'outcomes.blocked': 'Stuck',
      'outcomes.blockedHint': 'Needs your input',
      'outcomes.approval': 'Waiting for your approval',
      'outcomes.approvalHint': 'Waits for your approval',
      'outcomes.subagents': 'Subagents too',
      'outcomes.subagentsHint': 'Subagents too',
      'outcomes.aborted': 'You stopped it',
      'outcomes.abortedHint': 'You pressed stop',
      'outcomes.interrupted': 'Interrupted by the system',
      'outcomes.interruptedHint': 'System interrupt',
      'outcomes.maxTokens': 'Length cap',
      'outcomes.maxTokensHint': 'Hit the cap',
      'outcomes.countOn': '{n} on',
      'outcomes.countOff': 'All off',

      'short.completed': 'done',
      'short.error': 'error',
      'short.blocked': 'stuck',
      'short.approval': 'approval',
      'short.subagents': 'subagents',
      'short.aborted': 'stop',
      'short.interrupted': 'interrupt',
      'short.maxTokens': 'token cap',

      'summary.line': '{provider} · {host} → {to} · {events}',
      'summary.noHost': 'no host yet',
      'summary.noRecipient': 'no recipient yet',
      'summary.recipients': '{n} recipients',
      'summary.custom': 'Custom',
      'summary.events': 'notify on {list}',
      'summary.eventsMore': 'notify on {list} and {n} in all',
      'summary.eventsOff': 'notifications are off',

      'danger.reset': 'Reset everything to defaults',
      'danger.title': 'Reset everything to defaults?',
      'danger.body': 'This clears every override this plugin stored in the profile — recipients, event switches and pacing all return to defaults — and takes effect immediately, outside the Save button. Unsaved drafts on this page are dropped as well.',
      'danger.keep': 'Stored authorization codes are not affected.',
      'danger.ok': 'Reset',
      'danger.cancel': 'Cancel',
    };

    /**
     * 插值：把 `{name}` 换成 params[name]。缺值时保留原样，便于发现漏传。
     * @param {string} text 模板
     * @param {object} [params] 变量
     * @returns {string} 结果
     */
    function fmt(text, params) {
      if (params === undefined || params === null) return text;
      return text.replace(/\{(\w+)\}/g, (all, key) => (key in params ? String(params[key]) : all));
    }

    /** 远程持有者：apply 里填，页面与 callRemote 都读它。 */
    const remotesRef = { current: null };

    /** i18n 持有者：locale 服务迟到时先回退到中文，页面照常可用。 */
    const i18n = {
      locale: null,
      /** @param {string} key 文案键 @param {object} [params] 变量 @returns {string} 当前语言文案 */
      t(key, params) {
        const dict = this.locale === null ? ZH : (this.locale.getSnapshot?.().id === 'en' ? EN : ZH);
        return fmt(dict[key] ?? ZH[key] ?? key, params);
      },
    };

    // ---------------------------------------------------------------------------
    // 纯函数（无 React 依赖，便于单测）
    // ---------------------------------------------------------------------------

    /** 常见邮箱的 SMTP 预设，与 Host 侧 lib/config.js 的 SMTP_PRESETS 对齐。 */
    const PRESETS = [
      { id: 'qq', name: 'QQ 邮箱', host: 'smtp.qq.com', port: 465, secure: 'tls', suffix: '@qq.com', domains: ['qq.com', 'foxmail.com', 'vip.qq.com'] },
      { id: '163', name: '163 邮箱', host: 'smtp.163.com', port: 465, secure: 'tls', suffix: '@163.com', domains: ['163.com', '188.com', 'yeah.net'] },
      { id: '126', name: '126 邮箱', host: 'smtp.126.com', port: 465, secure: 'tls', suffix: '@126.com', domains: ['126.com'] },
      { id: 'gmail', name: 'Gmail', host: 'smtp.gmail.com', port: 465, secure: 'tls', suffix: '@gmail.com', domains: ['gmail.com', 'googlemail.com'] },
      { id: 'outlook', name: 'Outlook', host: 'smtp.office365.com', port: 587, secure: 'starttls', suffix: '@outlook.com', domains: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com'] },
      { id: 'icloud', name: 'iCloud', host: 'smtp.mail.me.com', port: 587, secure: 'starttls', suffix: '@icloud.com', domains: ['icloud.com', 'me.com', 'mac.com'] },
    ];

    /**
     * 8 个事件开关，一份真源：字段名 / 标题键 / 说明键 / 摘要短名。
     *
     * 通知时机卡片、卡片头读数、判决条的「事件全关」判定、人话摘要都读这一份表——
     * 各写一遍必然漂：加了第 9 个事件时会漏掉某处。顺序就是格子顺序。
     */
    const OUTCOME_FIELDS = [
      { field: 'notifyCompleted', title: 'outcomes.completed', hint: 'outcomes.completedHint', short: 'short.completed' },
      { field: 'notifyError', title: 'outcomes.error', hint: 'outcomes.errorHint', short: 'short.error' },
      { field: 'notifyBlocked', title: 'outcomes.blocked', hint: 'outcomes.blockedHint', short: 'short.blocked' },
      { field: 'notifyApproval', title: 'outcomes.approval', hint: 'outcomes.approvalHint', short: 'short.approval' },
      { field: 'includeSubagents', title: 'outcomes.subagents', hint: 'outcomes.subagentsHint', short: 'short.subagents' },
      { field: 'notifyAbortedByUser', title: 'outcomes.aborted', hint: 'outcomes.abortedHint', short: 'short.aborted' },
      { field: 'notifyInterrupted', title: 'outcomes.interrupted', hint: 'outcomes.interruptedHint', short: 'short.interrupted' },
      { field: 'notifyMaxTokens', title: 'outcomes.maxTokens', hint: 'outcomes.maxTokensHint', short: 'short.maxTokens' },
    ];

    /**
     * 解析收件人：一行一个（兼容逗号/分号），去空、去重、丢弃明显不含 @ 的项。
     * 规则必须与 Host 侧 lib/config.js 的 parseRecipients 保持一致。
     * @param {unknown} raw 用户填写的原始文本
     * @returns {{ valid: string[], invalid: string[] }}
     */
    function parseRecipients(raw) {
      const valid = [];
      const invalid = [];
      const seen = new Set();
      if (typeof raw !== 'string' || raw.trim() === '') return { valid, invalid };
      for (const chunk of raw.split(/[\n,;]+/)) {
        const addr = chunk.trim();
        if (addr === '') continue;
        const key = addr.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) invalid.push(addr);
        else valid.push(addr);
      }
      return { valid, invalid };
    }

    /**
     * 把投递失败的原因翻译成「该动哪里」。
     *
     * 页面只负责分类与建议，**不改写原文**：原始报错始终留在旁边（改不了才是真麻烦）。
     * 规则来自真实踩过的两类错误：认证类（535/534/530）与发件人被拒（550）。
     * @param {unknown} raw 原始报错
     * @returns {{kind: string, label: string, hint: string}} 分类结果
     */
    function classifySendError(raw) {
      const text = String(raw ?? '');
      const code = /(?:^|\D)([45]\d{2})(?:\D|$)/.exec(text)?.[1] ?? '';
      if (/535|534|530/.test(text) || /auth/i.test(text)) {
        return { kind: 'auth', label: i18n.t('err.auth'), hint: i18n.t('err.authHint') };
      }
      if (/^5\d{2}/.test(text) || /From.*(?:missing|invalid)|header/i.test(text)) {
        return { kind: 'from', label: i18n.t('err.rejected'), hint: i18n.t('err.rejectedHint') };
      }
      if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|network|timeout|socket/i.test(text)) {
        return { kind: 'network', label: i18n.t('err.network'), hint: i18n.t('err.networkHint') };
      }
      return {
        kind: 'other',
        label: code === '' ? i18n.t('err.other') : i18n.t('err.otherCode', { code }),
        hint: i18n.t('err.otherHint'),
      };
    }

    /**
     * 按主机名匹配预设。
     * @param {unknown} host SMTP 主机
     * @returns {object|null} 命中的预设
     */
    function matchPreset(host) {
      const value = String(host ?? '').trim().toLowerCase();
      if (value === '') return null;
      return PRESETS.find((preset) => preset.host === value) ?? null;
    }

    /**
     * 由邮箱地址猜预设（用于刚填完收件人就想一键配好的情形）。
     * @param {unknown} address 邮箱地址
     * @returns {object|null} 命中的预设
     */
    function presetForAddress(address) {
      const value = String(address ?? '').trim().toLowerCase();
      const at = value.lastIndexOf('@');
      if (at === -1) return null;
      const domain = value.slice(at + 1);
      return PRESETS.find((preset) => preset.suffix === `@${domain}`) ?? null;
    }

    /**
     * 账号域名是否不属于这个服务商。
     *
     * 用 QQ 的服务器配 outlook 的账号，认证必然 535；这个错误在点发送前就看得出来。
     * @param {object|null} preset 命中的预设
     * @param {unknown} user SMTP 用户名
     * @returns {boolean} true 表示对不上
     */
    function accountMismatch(preset, user) {
      if (preset === null || !Array.isArray(preset.domains)) return false;
      const value = String(user ?? '').trim().toLowerCase();
      const at = value.lastIndexOf('@');
      if (at === -1) return false;
      return !preset.domains.includes(value.slice(at + 1));
    }

    /**
     * 由收件人推断 SMTP 用户名：只有域名与服务商一致时才填。
     *
     * 预设里那个 `@qq.com` 后缀是"填入他该补什么"的提示，不能当成用户名写进配置——
     * 写进去就是个缺了名字的半成品，用户还得回来改。
     * @param {object} preset 命中的预设
     * @param {string[]} validRecipients 已通过校验的收件人
     * @returns {string} 可直接使用的用户名；推不出来时返回空串
     */
    function userForPreset(preset, validRecipients) {
      if (!preset) return '';
      const hit = (validRecipients ?? []).find((address) => String(address).toLowerCase().endsWith(preset.suffix));
      return hit === undefined ? '' : hit;
    }

    /** 状态条的取值只由「配置齐不齐」与「有没有事件要通知」决定；投递历史已随账本一起删除。 */
    const STATUS_TONE = {
      disabled: 'idle',
      allOff: 'warning',
      needRecipients: 'warning',
      needHost: 'warning',
      needUser: 'warning',
      needCredential: 'warning',
      ready: 'done',
    };

    /**
     * 推导状态条要显示哪个结论。纯函数，输入全部来自草稿与凭据状态。
     *
     * 优先级（上一档压住下一档，顺序就是这个人写下来的顺序）：
     *   总开关关闭 > 8 个事件全关 > 缺配置（收件人 / 主机 / 用户名 / 凭据）> 可以发信。
     * 总开关关着时谈"缺什么"没有意义；事件全关时谈「可以发信了」是骗人——信不会发出去。
     * 投递历史不参与：账本已删，这里只回答「配置齐不齐」。
     * @param {object} input 判定输入（不传 eventsOn 时跳过「事件全关」这一档）
     * @returns {string} 状态键
     */
    function deriveStatus(input) {
      const { enabled, eventsOn, recipientCount, host, user, credentialConfigured } = input ?? {};
      if (enabled !== true) return 'disabled';
      if (eventsOn === 0) return 'allOff';
      if (!(recipientCount > 0)) return 'needRecipients';
      if (String(host ?? '').trim() === '') return 'needHost';
      if (String(user ?? '').trim() === '') return 'needUser';
      if (credentialConfigured !== true) return 'needCredential';
      return 'ready';
    }

    /**
     * 草稿与基线的差异 → mutate 的 ops。
     *
     * 一次保存只发一条 mutate：ops 里只放与基线不同的字段，空值走 unset（清掉覆盖）。
     * @param {object} draft 当前草稿
     * @param {object} base 上一次落盘的基线
     * @returns {Array<{op: string, path: string[], value?: unknown}>} ops
     */
    function diffOps(draft, base) {
      const left = draft && typeof draft === 'object' ? draft : {};
      const right = base && typeof base === 'object' ? base : {};
      const ops = [];
      for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
        const value = left[key];
        if (value === right[key]) continue;
        if (value === '' || value === null || value === undefined) ops.push({ op: 'unset', path: [key] });
        else ops.push({ op: 'set', path: [key], value });
      }
      return ops;
    }

    /**
     * 某一组的状态点。不适用时给 idle——这一组本来就不参与，别画成告警。
     * @param {boolean} done 是否已配置好
     * @param {boolean} [notApplicable] 是否不适用
     * @returns {'done'|'warning'|'idle'} 状态点状态
     */
    function dotState(done, notApplicable) {
      if (notApplicable === true) return 'idle';
      return done === true ? 'done' : 'warning';
    }


    /**
     * 保存读数的"多久之前"。按量级退化，别让人去数 320 秒：
     *   <60 秒 → 刚刚 / N 秒前；<60 分 → N 分钟前；<24 时 → N 小时前；否则 N 天前。
     * @param {number} ms 距保存成功的毫秒数
     * @param {Function} t 文案函数
     * @returns {string} 读数
     */
    function agoText(ms, t) {
      const seconds = Math.max(0, Math.floor(ms / 1000));
      if (seconds < 60) return seconds === 0 ? t('save.savedJust') : t('save.savedAgo', { n: seconds });
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return t('save.savedMin', { n: minutes });
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return t('save.savedHour', { n: hours });
      return t('save.savedDay', { n: Math.floor(hours / 24) });
    }

    // ---------------------------------------------------------------------------
    // 样式
    //
    // 这一层上一版是坏的，根因写在这里，别再犯：
    //
    //   宿主把 --dsw-alias-* 定义在 **body** 上，不是 :root。而自定义属性里的 var()
    //   是在**声明它的那个元素**上求值的——所以以前那句
    //       :root{--dshmn-surface:var(--dsw-alias-bg-layer-1)}
    //   在 html 上求值时找不到 --dsw-alias-bg-layer-1，整条链变成空值。后果是：
    //   结论卡背景 transparent（浅色下页面本来就是白的 → "唯一的高亮块"根本不存在）、
    //   发丝线回退到 currentColor（用近黑文字色画分隔线）、输入框没有描边。
    //   实测证据见 ../.verify/probe-vars.mjs 与 《dsh-notify-p-设置页视觉重构.md》。
    //
    //   所以：**不要再套 var() 别名，规则里直接引用 --dsw-alias-***。token 在 body 上，
    //   面板是它的后代，直接引用按继承链正常求值，暗色自动跟着走。
    //
    // 量度（全部照抄宿主自己的设置页，别自己发明）：
    //   内容列 max-width 760 居中 · 页标题 18/26·600 · 卡片标题 14/22·500 · 行标题 14/22·400
    //   字段标签 13/20·500（primary） · 说明 12/18 tertiary · 小读数 11/16
    //   卡片 = .5px settings-card-stroke + settings-card-fill + radius 20 + padding 14 16 + gap 12
    //   行 = padding 16px 0 + 行自身 .5px border-l2（最后一行没有）；段头 / 页脚一律不画线
    //   填充面 = bg-module-platform（宿主"编辑器/选中态"用的就是这个；卡片另用 settings-card-fill）
    //
    // 纪律：全页零硬编码颜色（单测里有审计）。**状态色填充面只有判决条一处**；
    // 卡片的 fill / stroke 用宿主 settings 自己的 token（暗色下才不与页面同色）。
    // ---------------------------------------------------------------------------

    /** 一眼看出浏览器加载的是哪一版。放在根节点的 data-build 上，检查 DOM 可见，不占视觉。 */
    const BUILD = 'ui18';

    const CSS = `/* dsh-notify-p · 设置页样式（ui18 零折叠骨架；全页零硬编码颜色）
字号阶梯（每一档都落在宿主网格上，全页只用整像素档，不许半档）：
  页标题 18/26·600 ＝ 判决标题 18/26·600 > 卡片标题 14/22·500 > 行标题 14/22·400
  > 页头说明 13/20 ＝ 字段标签 13/20·500 ＝ chips 13/18 > 说明 12/18 > 小读数 11/16
骨架：内容列 max-width 760 居中；页头吸顶、吸底保存条常驻；三张卡片（card-fill 底 + card-stroke 描边）；
判决条是唯一的状态色填充面（bg-module-platform）+ 左侧 3px 状态色；页脚无边框。
线只长在行自己身上（.5px border-l2，最后一行没有），段头与页脚一律不画线。
**零折叠**：没有「▸ 更多」、没有「还有 3 种情况」、没有问号按钮——这一页所有内容默认都在。
圆角只用宿主那几档：卡片 / 判决条 20、输入框 12、chips 8。 */
.dshmn-page{display:flex;flex-direction:column;width:100%;max-width:760px;margin:0 auto;min-width:0;color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px}
.dshmn-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;line-height:16px;font-variant-numeric:tabular-nums}

/* ── 页头：吸顶常驻（自己带背景与内边距，滚过去不会盖住内容）───────────────
   内容 = 标题 + 一行说明 + 右侧动作组（脏读数 + 保存 + 放弃改动）。 */
.dshmn-head{position:sticky;top:0;z-index:2;display:flex;align-items:flex-start;justify-content:space-between;gap:12px 16px;margin:0 0 16px;padding:12px 0;min-width:0;flex-wrap:wrap;background:var(--dsw-alias-bg-layer-2)}
.dshmn-headText{display:flex;flex-direction:column;gap:8px;min-width:0;flex:1 1 auto}
.dshmn-title{margin:0;min-width:0;color:var(--dsw-alias-label-primary);font-size:18px;line-height:26px;font-weight:600}
.dshmn-lead{margin:0;min-width:0;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.dshmn-headActions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex:none;flex-wrap:wrap;min-width:0}
.dshmn-stamp{flex:none;display:inline-flex;align-items:center;gap:6px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;font-variant-numeric:tabular-nums}
.dshmn-stamp[data-tone=busy]{color:var(--dsw-alias-label-secondary)}
.dshmn-stamp[data-tone=error]{color:var(--dsw-alias-state-error-primary)}
.dshmn-stamp[data-tone=dirty]{color:var(--dsw-alias-label-primary)}

/* ── 判决条：全页唯一的状态色填充面，也是唯一的状态色 hero ─────────────────
   左侧 3px 竖条与标题色都由 data-tone 决定，颜色全部来自 state token（不硬编码）。
   四档 tone：done（可发信）/ warning（缺配置、事件全关）/ idle（总开关关闭）/ error。 */
/* 按钮：按宿主线上规则（.primary/.outline + .sm）自绘 —— 见 Button() 注释里为什么不能等宿主原语 */
.dshmn-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;box-sizing:border-box;
  height:28px;padding:0 10px;border:none;border-radius:8px;font-family:inherit;
  font-size:12px;line-height:18px;cursor:pointer;background:transparent;color:var(--dsw-alias-label-primary)}
.dshmn-btn[data-variant=primary]{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}
.dshmn-btn[data-variant=primary]:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}
.dshmn-btn[data-variant=outline]{border:.5px solid var(--dsw-alias-border-l3)}
.dshmn-btn[data-variant=outline]:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dshmn-btn:disabled{opacity:.5;cursor:not-allowed}
.dshmn-btn:focus-visible{outline:2px solid var(--dsw-alias-border-l3);outline-offset:2px}

.dshmn-verdict{display:flex;flex-direction:column;gap:8px;min-width:0;padding:18px 20px 16px;border-radius:20px;
  background:var(--dsw-alias-bg-module-platform);border-left:3px solid var(--dsw-alias-label-tertiary)}
.dshmn-verdict[data-tone=done]{border-left-color:var(--dsw-alias-state-success-primary)}
.dshmn-verdict[data-tone=warning]{border-left-color:var(--dsw-alias-state-warn-primary)}
.dshmn-verdict[data-tone=idle]{border-left-color:var(--dsw-alias-label-tertiary)}
.dshmn-verdict[data-tone=error]{border-left-color:var(--dsw-alias-state-error-primary)}
.dshmn-verdictHead{display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}
.dshmn-verdictTitle{margin:0;min-width:0;color:var(--dsw-alias-label-primary);font-size:18px;line-height:26px;font-weight:600}
.dshmn-verdict[data-tone=done] .dshmn-verdictTitle{color:var(--dsw-alias-state-success-primary)}
.dshmn-verdict[data-tone=warning] .dshmn-verdictTitle{color:var(--dsw-alias-state-warn-primary)}
.dshmn-verdict[data-tone=idle] .dshmn-verdictTitle{color:var(--dsw-alias-label-tertiary)}
.dshmn-verdict[data-tone=error] .dshmn-verdictTitle{color:var(--dsw-alias-state-error-primary)}
.dshmn-verdictWhy{margin:0;color:var(--dsw-alias-label-secondary);font-size:14px;line-height:22px}
/* 人话摘要：服务商 · 主机 → 收件人 · 已开启的事件。只说事实，不下判决。 */
.dshmn-verdictSummary{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;word-break:break-word}
.dshmn-verdictFoot{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-top:4px}
.dshmn-evidence{display:flex;flex-direction:column;gap:4px;min-width:0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dshmn-evidenceKey{color:var(--dsw-alias-label-tertiary)}
.dshmn-evidence[data-ok=false] .dshmn-evidenceKey{color:var(--dsw-alias-state-error-primary)}
.dshmn-evidence .dshmn-mono{color:var(--dsw-alias-label-secondary);word-break:break-all}

/* ── 三张卡片：card-stroke 描边 + card-fill 底（暗色下才不与页面同色）──────────
   描边 + radius 20 + padding 14 16 + 内部 gap 12，与宿主 settings 的 rowCard 同构。 */
.dshmn-card{display:flex;flex-direction:column;gap:12px;min-width:0;padding:14px 16px;
  background:var(--dsw-alias-settings-card-fill);border:.5px solid var(--dsw-alias-settings-card-stroke);border-radius:20px}
.dshmn-card + .dshmn-card{margin-top:12px}
.dshmn-verdict + .dshmn-card{margin-top:16px}
.dshmn-cardHead{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;min-width:0}
.dshmn-cardTitle{margin:0;color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px;font-weight:500}
.dshmn-cardState{flex:none;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;font-variant-numeric:tabular-nums}
.dshmn-cardBody{display:flex;flex-direction:column;min-width:0}
/* 卡片自己已经给了 14px 上内边距：里面的第一个元素不要再叠一层上边距 */
.dshmn-cardBody>:first-child{padding-top:0}
.dshmn-cardBody>:last-child{padding-bottom:0;border-bottom:none}

/* ── 行：线只长在行自己身上（.5px border-l2，最后一行没有），上下各 16px ────── */
.dshmn-item{display:flex;flex-direction:column;gap:8px;padding:16px 0;min-width:0;
  border-bottom:.5px solid var(--dsw-alias-border-l2)}
.dshmn-item:last-child{padding-bottom:0;border-bottom:none}
.dshmn-itemHead{display:flex;align-items:baseline;justify-content:space-between;gap:12px 16px;min-width:0;flex-wrap:wrap}
.dshmn-labelRow{display:inline-flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}

/* ── 通知时机：第一行总开关 + 8 个事件三列网格（窄屏一列，不分组）────────────── */
.dshmn-master{display:flex;flex-direction:column;gap:6px;min-width:0;padding:16px 0 12px;
  border-bottom:.5px solid var(--dsw-alias-border-l2)}
.dshmn-masterHead{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0}
.dshmn-events{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px 28px;min-width:0;padding-top:4px}
.dshmn-event{display:flex;flex-direction:column;gap:4px;min-width:0}
.dshmn-eventHead{display:flex;align-items:center;justify-content:flex-start;gap:8px;min-width:0;min-height:22px;cursor:pointer}
.dshmn-check{flex:none;width:16px;height:16px;margin:0;accent-color:var(--dsw-alias-brand-primary);cursor:pointer}
.dshmn-check:disabled{cursor:not-allowed;opacity:.5}
.dshmn-eventTitle{min-width:0;color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px;font-weight:400}
.dshmn-eventNote{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}

/* ── 字段：标签在上、控件满宽（宿主 settings 的字段同款）────────────────────── */
.dshmn-field{display:flex;flex-direction:column;gap:8px;min-width:0}
.dshmn-label{color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px;font-weight:500}
.dshmn-hint{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;max-width:44em}
.dshmn-error{margin:0;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;word-break:break-word}
.dshmn-credState{display:inline-flex;align-items:center;gap:6px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.dshmn-credState[data-ok=true]{color:var(--dsw-alias-state-success-primary)}
.dshmn-credActions{display:inline-flex;align-items:center;gap:12px;flex-wrap:wrap;min-width:0}
.dshmn-linkRow{display:flex;align-items:center;gap:12px;flex-wrap:wrap}

/* ── 输入 ────────────────────────────────────────────────────────────────── */
/* 宿主的 Input 原语是 content-box 的 inline-flex（padding 0 8px + .5px 描边）,
   所以光给 width:100% 会让它比父级宽出 18px、顶出内容列。必须一起给 border-box。
   兜底输入框：底色 / 描边 / 圆角与宿主 Input 对齐（bg-layer-1 + border-l4 + 12）。 */
.dshmn-inputWrap{box-sizing:border-box;display:flex;width:100%;min-width:0}
.dshmn-inputWrap>*{box-sizing:border-box;width:100%;min-width:0}
.dshmn-input,.dshmn-select{box-sizing:border-box;width:100%;height:32px;padding:0 10px;outline:none;
  border:.5px solid var(--dsw-alias-border-l4);border-radius:12px;background:var(--dsw-alias-bg-layer-1);
  color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:22px}
.dshmn-input::placeholder{color:var(--dsw-alias-label-tertiary)}
.dshmn-input:focus-visible,.dshmn-select:focus-visible{border-color:var(--dsw-alias-brand-primary);
  box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}
.dshmn-input[aria-invalid=true]{border-color:var(--dsw-alias-state-error-primary)}

/* 主机 / 端口 / 加密 / 用户名：宽屏一行四列（主机与用户名吃剩余宽度，端口与加密固定窄）。 */
.dshmn-smtpGrid{display:grid;grid-template-columns:minmax(0,1fr) 88px 104px minmax(0,1fr);gap:12px 16px;align-items:start;min-width:0}

/* ── 预设 chips：一行横向滚动（窄屏也不折成三排），滚动条藏起来 ─────────────── */
.dshmn-chips{display:flex;align-items:center;gap:8px;min-width:0;overflow-x:auto;overflow-y:hidden;padding:2px 0;
  scrollbar-width:none;-ms-overflow-style:none}
.dshmn-chips::-webkit-scrollbar{display:none}
.dshmn-segBtn{box-sizing:border-box;flex:none;height:28px;padding:0 12px;cursor:pointer;white-space:nowrap;
  font:inherit;font-size:13px;line-height:18px;
  border:.5px solid var(--dsw-alias-border-l4);border-radius:8px;background:none;
  color:var(--dsw-alias-label-secondary)}
.dshmn-segBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dshmn-segBtn[data-active=true]{background:var(--dsw-alias-bg-module-platform);border-color:var(--dsw-alias-brand-primary);
  color:var(--dsw-alias-label-primary);font-weight:600}

/* ── 文字按钮 ─────────────────────────────────────────────────────────────── */
.dshmn-link{color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;line-height:20px;cursor:pointer;
  padding:0;border:none;background:none;text-decoration:underline;text-underline-offset:3px;
  text-decoration-color:var(--dsw-alias-border-l4)}
.dshmn-link:hover{color:var(--dsw-alias-label-primary)}
.dshmn-link:disabled{color:var(--dsw-alias-label-tertiary);cursor:default;text-decoration:none}
.dshmn-link:focus-visible,.dshmn-segBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}

/* ── 页脚与吸底条：页脚只留一条文字链；吸底条常驻底部，只放两个动作 ────────── */
.dshmn-foot{display:flex;align-items:center;justify-content:flex-end;gap:12px;flex-wrap:wrap;margin-top:16px;padding-top:16px}
.dshmn-foot .dshmn-link{font-size:12px;line-height:18px}
.dshmn-savebar{position:sticky;bottom:0;z-index:2;display:flex;align-items:center;justify-content:flex-end;gap:8px;
  flex-wrap:wrap;margin-top:8px;padding:12px 0;background:var(--dsw-alias-bg-layer-2)}
.dshmn-helpBody{white-space:pre-wrap;color:var(--dsw-alias-label-secondary);font-size:14px;line-height:22px}

/* ── 窄屏：宿主 settings 页的断点就是 560px ──────────────────────────────── */
@media (max-width:560px){
  .dshmn-head{flex-direction:column;align-items:stretch;gap:12px}
  .dshmn-headActions{justify-content:flex-start}
  .dshmn-verdictFoot{justify-content:flex-start}
  .dshmn-savebar{justify-content:flex-start}
  .dshmn-smtpGrid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
  .dshmn-events{grid-template-columns:minmax(0,1fr)}
  .dshmn-card{padding:12px 14px}
}

`;


    if (typeof document !== 'undefined'
      && document.querySelector('style[data-plugin-css="dsh-notify-p"]') === null) {
      const style = document.createElement('style');
      style.dataset.plugin = 'dsh-notify-p';
      style.dataset.pluginCss = 'dsh-notify-p';
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    // ---------------------------------------------------------------------------
    // 原语封装（原语缺失时降级，不白屏）
    // ---------------------------------------------------------------------------

    /** 开关。原语缺失时用原生 checkbox 顶上。 */
    function Switch(props) {
      if (typeof P.Switch === 'function') return h(P.Switch, props);
      // 兜底的 checkbox 要把额外 props 透传下去：事件格子用 data-event、总开关用 data-master
      // 给自己一个稳定的 DOM 抓手（和宿主用 data-* 是同一个用途），视觉上不占位。
      const { checked, disabled, label, onChange, ...rest } = props;
      return h('input', {
        type: 'checkbox',
        checked: checked === true,
        disabled: disabled === true,
        'aria-label': label,
        onChange: () => onChange(checked !== true),
        ...rest,
      });
    }

    /**
     * 状态点。**全页只有判决条用得上**——状态色只出现在一处，别的都退成文字。
     * 原语支持 done / warning / error / idle 四档，正好对上"会发信 / 不会真发 / 发失败 / 还没配完"。
     * @param {object} props state 与额外 className
     * @returns {object} React 元素
     */
    function Dot({ state, className }) {
      if (typeof P.StateDot === 'function') return h(P.StateDot, { state, size: 8, className });
      return h('span', { className: 'dshmn-hint', 'aria-hidden': 'true' }, state === 'done' ? '●' : '○');
    }

    /** 成功勾。只在"凭据确实存进去了"这一处出现，不做成到处都有的装饰点。 */
    function CheckedMark() {
      if (typeof P.IconCheckOutline16 === 'function') return h(P.IconCheckOutline16, null);
      return h('span', { 'aria-hidden': 'true' }, '✓');
    }

    /**
     * 按钮。
     *
     * 实测：当前宿主版本**没有** P.Button 这个原语（web bundle 里只有 MenuItemButton），
     * 所以兜底分支才是实际走的那条。之前它退化成 .dshmn-link（带下划线的文字），
     * 页面上因此一个"有体量"的按钮都没有——这是整页显得扁平的重要原因。
     * 这里按宿主线上按钮的规则自绘：primary = button-primary-fill + label-primary-foreground，
     * outline = 0.5px border-l3 + 透明底，尺寸照 sm（高 28 / 12px 字 / 圆角 8）。
     */
    function Button(props) {
      if (typeof P.Button === 'function') return h(P.Button, props);
      return h('button', {
        type: 'button',
        className: 'dshmn-btn',
        'data-variant': props.variant ?? 'outline',
        disabled: props.disabled,
        title: props.title,
        onClick: props.onClick,
      }, props.children);
    }

    /** 输入框（宿主原语自带 0.5px 发丝描边与 focus-within 主题色）。 */
    function TextInput(props) {
      const { className, ...rest } = props;
      if (typeof P.Input === 'function') {
        return h(P.Input, { ...rest, className: `dshmn-inputWrap${className === undefined ? '' : ` ${className}`}` });
      }
      return h('input', { ...rest, className: 'dshmn-input', style: { minHeight: 0, height: 32 } });
    }

    /**
     * 勾选框（多选清单用）。
     *
     * 事件开关为什么用勾选而不是开关：三列窄格里，拨动式开关没有"把手"，
     * 一排放三个时分不清哪个属于哪个标题；勾选框贴着标题，读起来就是
     * 「☑ 任务完成」这种清单句，选中与否一眼可读，也更贴合"我会收到哪些通知"。
     * 总开关仍用拨动开关——它管的是整件事开不开，语义不同。
     */
    function Check(props) {
      const { checked, disabled, label, onChange, ...rest } = props;
      // 关键：**不能把 label 作为文本传给宿主原语**——宿主的 Checkbox 会把 label 渲染成
      // 可见文字，于是标题出现两次（「☑ 任务完成 任务完成」），格子也被撑到换行。
      // 名字只走 aria-label（读屏需要），可见文字由调用方自己排版。
      const common = {
        ...rest,
        checked: checked === true,
        disabled: disabled === true,
        'aria-label': label,
        onChange: () => onChange(checked !== true),
      };
      if (typeof P.Checkbox === 'function') return h(P.Checkbox, common);
      return h('input', { type: 'checkbox', className: 'dshmn-check', ...common });
    }

    /**
     * 单选的一格（邮箱服务商预设用它）。
     *
     * 用真 `<button>` + 单选语义（`role=radio`），不是宿主的 `Pill`：Pill 渲染成 `span`，
     * 没有原生键盘行为，"当前选中了哪个"也传不给读屏。形态仍然照抄宿主的"外观"选项卡。
     * @param {object} props 参数
     * @returns {object} React 元素
     */
    function Segment(props) {
      const { active, onClick, children } = props;
      return h('button', {
        type: 'button',
        className: 'dshmn-segBtn',
        'data-active': active === true ? 'true' : 'false',
        role: 'radio',
        'aria-checked': active === true,
        onClick,
      }, children);
    }

    // 全页零折叠：这一页没有折叠区、没有「▸ 更多」、也没有问号按钮——所有内容默认都在版面上。

    // ---------------------------------------------------------------------------
    // 页面
    // ---------------------------------------------------------------------------

    /**
     * 一张卡片（宿主 models / agent-preset / account 三页同款）：
     * .5px 描边 + radius 20 + padding 14 16 + 内部 gap 12；标题 14/22·500，右侧可带一条 12/18 状态读数。
     *
     * **不编号。** 三张卡片是并列的三个设置组，编号会把并列伪装成步骤序列（内容并不是步骤）。
     * **不靠底色。** 卡片底色等于面板底色（浅色主题下所有 bg-layer 都是纯白），
     * 卡片只靠描边成立——这也正是宿主 settings 卡片的样子。
     * 每张卡片另带一个语义修饰类（dshmn-card-recipients / -transport / -outcomes），
     * 它们只是给 DOM 一个稳定的抓手（和宿主的 data-* 一个用途），样式仍由 .dshmn-card 一份承担。
     * @param {object} props 卡片参数（kind 是修饰类后缀）
     * @returns {object} React 元素
     */
    function Card(props) {
      const { title, state, kind, children } = props;
      const className = kind === undefined ? 'dshmn-card' : `dshmn-card dshmn-card-${kind}`;
      return h('section', { className, 'aria-label': title },
        h('div', { className: 'dshmn-cardHead' },
          h('h3', { className: 'dshmn-cardTitle' }, title),
          state === undefined ? null : h('span', { className: 'dshmn-cardState' }, state)),
        h('div', { className: 'dshmn-cardBody' }, children));
    }

    /**
     * 设置页组件。
     * @param {object} props settings.section 传入的 props，外加 remotes / i18n 持有者
     * @returns {object} React 元素
     */
    function MailNotifyPage(props) {
      const { remotes } = props;
      const t = (key, params) => i18n.t(key, params);

      /** settings 远程真的可用了吗。ready 只认它——rpc / credentials 先到都不算。 */
      const settingsAvailable = () => typeof remotes.current?.settings?.describe === 'function';
      // 就绪的判定必须收到 settings 上：只看 remotes.current 非空的话，connection 先注入就会把 ready
      // 烧成 true，而 load() 当时读不到 settings、直接返回——之后 settings 真的到了也没人再叫它，
      // 这一页就永远停在空态（按钮全禁用，连读失败都不报）。
      const [ready, setReady] = React.useState(() => settingsAvailable());
      const [attempt, setAttempt] = React.useState(0);
      const [draft, setDraft] = React.useState({});
      const [baseline, setBaseline] = React.useState({});
      const [save, setSave] = React.useState({ phase: 'idle', at: 0, error: '' });
      const [now, setNow] = React.useState(() => Date.now());
      const [credentialState, setCredentialState] = React.useState({});
      const [credError, setCredError] = React.useState('');
      const [credCheck, setCredCheck] = React.useState(0);
      const [pwDraft, setPwDraft] = React.useState({});
      const [pwClear, setPwClear] = React.useState({});
      const [pwEdit, setPwEdit] = React.useState({});
      const [resetting, setResetting] = React.useState(false);
      const [confirmReset, setConfirmReset] = React.useState(false);
      const [helpKind, setHelpKind] = React.useState(null);
      const [test, setTest] = React.useState({ phase: 'idle', ms: 0, error: '' });

      const draftRef = React.useRef({});
      const baselineRef = React.useRef({});
      const viewRef = React.useRef(null);
      // 语言切换时强制重渲染（locale 服务只在变化时通知，不驱动 React）
      const [, setLocaleRev] = React.useState(0);

      React.useEffect(() => {
        const locale = i18n.locale;
        if (locale === null || typeof locale.subscribe !== 'function') return undefined;
        return locale.subscribe(() => setLocaleRev((n) => n + 1));
      }, []);

      // 远程命名空间迟到：最多轮询 40 次（约 6 秒）。只认 settings，别的服务晚到不算就绪。
      React.useEffect(() => {
        if (ready || attempt >= 40) return undefined;
        const timer = setTimeout(() => {
          if (settingsAvailable()) setReady(true);
          setAttempt((n) => n + 1);
        }, 150);
        return () => clearTimeout(timer);
      }, [ready, attempt]);

      /**
       * 读一次配置，并按 **配置指纹** 认领本插件的那一项。
       *
       * 认领规则：ns 是 profile 入口 id（换 profile 就变），客户端不许写死。别拿 describe() 里的
       * schema 当指纹——它是 schema.toJSON() 的快照（只有 uid/refs，没有 dict），按 dict 找永远
       * 找不到。稳定指纹在 value 里：只有本插件同时声明 smtpHost 与 smtpPasswordRef。
       *
       * @param {{ preserveDraft?: boolean }} [options] preserveDraft = 冲突恢复模式：
       *   用户的草稿**一个字都不动**（那是他刚填、还没写进去的东西），只把基线对齐服务端最新值、
       *   revision 换成新的（viewRef.current 就是 revision 的持有者），下一次保存才不会再撞同一个值。
       * @returns {Promise<void>}
       */
      const load = React.useCallback(async (options) => {
        const bridge = remotes.current;
        const preserveDraft = options?.preserveDraft === true;
        if (bridge === null) return;
        // settings 还没注入 ≠ 读不到配置：它只是还没到。这一档不落成 loadFailed，
        // 免得把一次正常的迟到渲染成红色报错（ready 会为它再放行一次装载）。
        if (typeof bridge?.settings?.describe !== 'function') {
          setSave({ phase: 'unserved', at: 0, error: '' });
          return;
        }
        try {
          const described = unwrap(await bridge.settings.describe());
          const namespaces = Array.isArray(described?.namespaces) ? described.namespaces : [];
          const found = namespaces.find((d) => d && d.value && typeof d.value === 'object'
            && Object.hasOwn(d.value, 'smtpHost') && Object.hasOwn(d.value, 'smtpPasswordRef')) ?? null;
          viewRef.current = found;
          const value = found && found.value && typeof found.value === 'object' ? { ...found.value } : {};
          baselineRef.current = { ...value };
          setBaseline({ ...value });
          if (preserveDraft) {
            // 冲突恢复：草稿留着，只把基线与 revision 抬到最新——这样再过一次保存就是干净的写。
            setSave(found === null
              ? { phase: 'unserved', at: 0, error: '' }
              : { phase: 'conflictReloaded', at: 0, error: '' });
            return;
          }
          draftRef.current = { ...value };
          setDraft({ ...value });
          setSave(found === null
            ? { phase: 'unserved', at: 0, error: '' }
            : { phase: 'idle', at: 0, error: '' });
        } catch (err) {
          // 读失败是**独立的一档**：它不是「保存失败」，重试也不该去调 saveAll()。
          setSave({ phase: 'loadFailed', at: 0, error: String(err?.message ?? err) });
        }
      }, [remotes]);

      const refreshCredentials = React.useCallback(async (refs) => {
        const bridge = remotes.current;
        const list = [...new Set((refs ?? []).filter((ref) => typeof ref === 'string' && ref.trim() !== ''))];
        if (bridge === null || list.length === 0) {
          setCredentialState({});
          setCredError('');
          return;
        }
        try {
          const info = unwrap(await bridge.credentials.describe(list));
          const next = {};
          for (const ref of list) next[ref] = info?.[ref]?.configured === true;
          setCredentialState(next);
          setCredError('');
          setCredCheck((n) => n + 1);
        } catch (err) {
          // 读失败要显形：静默吞掉会让页面永远停在「未配置」，而用户其实已经存好了。
          setCredError(String(err?.message ?? err));
          console.warn('[dsh-notify-p] 读取凭据状态失败 / credential describe failed:', err);
        }
      }, [remotes]);

      // 首次就绪后装载。读失败 / 认领不到之后**不再自动重试**：
      // 那两档各自有出路（「重新读取」按钮 / 换个 profile 再看），自动重试只会把读数一直抖回别处，
      // 也会让「重新读取」到底点了没点变得看不出来。
      React.useEffect(() => {
        if (!ready || viewRef.current !== null) return;
        if (save.phase === 'loadFailed' || save.phase === 'unserved') return;
        void load();
      }, [ready, load, attempt, save.phase]);

      // `viewRef.current` 是 load() 里赋的**引用**，赋值不会触发重渲染。
      // 所以依赖数组里写 viewRef.current 是无效的：首次挂载时它还是 null，
      // load() 完成后依赖没变，这个 effect 永远不会再跑一遍 —— 结果就是
      // 凭据永远是「还没保存」、测试按钮永远不出现。
      // 在渲染期把它取成一个普通值参与依赖，false→true 那一次就会把下面几条读都带起来。
      const loaded = viewRef.current !== null;

      React.useEffect(() => {
        if (ready && loaded) {
          void refreshCredentials([viewRef.current?.value?.smtpPasswordRef]);
        }
      }, [ready, loaded, refreshCredentials, attempt]);

      // 「已保存 · N 秒前」需要一个会走的钟；只在保存过之后跑，离开保存态就停
      React.useEffect(() => {
        if (save.phase !== 'saved') return undefined;
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
      }, [save.phase, save.at]);

      // 凭据是**另一次远程读取**，可能在「保存成功」之后才落地；读失败时也会停在未配置。
      // 所以只要还有没被确认的引用名，就自动复检几次（3 秒后放弃，转由左下角的「重新检查」兜底）。
      React.useEffect(() => {
        if (ready !== true || !loaded || credCheck >= 3) return undefined;
        const refs = [draftRef.current?.smtpPasswordRef];
        const missing = refs.some((ref) => typeof ref === 'string' && ref.trim() !== ''
          && credentialState[ref] !== true);
        if (!missing) return undefined;
        const timer = setTimeout(() => { void refreshCredentials(refs); }, 1200);
        return () => clearTimeout(timer);
      }, [ready, loaded, credCheck, credentialState, refreshCredentials]);

      // 回到这一页就重新读一次凭据：用户可能在别的标签页 / 别的入口存过授权码。
      React.useEffect(() => {
        if (typeof document === 'undefined' || typeof window === 'undefined') return undefined;
        const recheck = () => {
          if (viewRef.current === null) return;
          if (typeof document.visibilityState === 'string' && document.visibilityState === 'hidden') return;
          void refreshCredentials([draftRef.current?.smtpPasswordRef]);
        };
        window.addEventListener('focus', recheck);
        document.addEventListener('visibilitychange', recheck);
        return () => {
          window.removeEventListener('focus', recheck);
          document.removeEventListener('visibilitychange', recheck);
        };
      }, [refreshCredentials]);

      /**
       * 改一个字段：**只改本地草稿**，不碰 Host。写回只发生在点「保存」的时候。
       * @param {string} key 字段名
       * @param {unknown} value 新值
       * @returns {void}
       */
      const setField = React.useCallback((key, value) => {
        draftRef.current = { ...draftRef.current, [key]: value };
        setDraft(draftRef.current);
      }, []);

      /**
       * 一次改多个字段，合成同一份草稿（邮箱服务商预设用）。
       * 保存是一次 mutate，所以这里不需要按字段拆开写。
       * @param {object} patch 字段名到新值的映射
       * @returns {void}
       */
      const setFields = React.useCallback((patch) => {
        draftRef.current = { ...draftRef.current, ...patch };
        setDraft(draftRef.current);
      }, []);

      /**
       * 还挂在草稿里的凭据引用名。引用名由凭据行自己给出（硬约束 4），不从别处猜。
       * @returns {string[]} 需要写进凭据库的引用名
       */
      const pendingCredentialRefs = React.useCallback(() => {
        const refs = new Set();
        for (const [ref, value] of Object.entries(pwDraft)) {
          if (String(value ?? '').trim() !== '') refs.add(ref);
        }
        for (const [ref, flag] of Object.entries(pwClear)) {
          if (flag === true) refs.add(ref);
        }
        return [...refs].filter((ref) => String(ref ?? '').trim() !== '');
      }, [pwDraft, pwClear]);

      /**
       * 写一条凭据。**目标引用名由调用方给定**（硬约束 4），绝不从草稿里猜。
       * 只有 saveAll 会调它：保存是唯一写凭据库的时机；失败就抛出，由调用方转成「保存失败」。
       * @param {string} ref 凭据引用名
       * @returns {Promise<void>}
       */
      const commitCredential = React.useCallback(async (ref) => {
        const bridge = remotes.current;
        if (bridge === null) return;
        const name = String(ref ?? '').trim();
        if (name === '') return;
        const value = String(pwDraft[name] ?? '');
        const clearing = pwClear[name] === true;
        if (!clearing && value.trim() === '') return;
        if (clearing) unwrap(await bridge.credentials.unset(name));
        else unwrap(await bridge.credentials.set(name, value));
        setPwDraft((prev) => ({ ...prev, [name]: '' }));
        setPwClear((prev) => ({ ...prev, [name]: false }));
        await refreshCredentials([name]);
      }, [remotes, pwDraft, pwClear, refreshCredentials]);

      /**
       * 保存：把草稿与基线的差异一次性写回。
       *
       * 顺序与原子性（这是这一页唯一的写入口）：
       *   1. 配置字段合成**一次** mutate(found.ns, ops, revision)；
       *   2. 授权码草稿与已存值不同时，再把它写进凭据库；
       *   3. 两步都成功才进入「已保存」，并把 revision 换成 mutate 返回的新值。
       *
       * 三种失败各有各的出路，**都不清空草稿**（用户填的东西留在原地）：
       *   - revision 冲突（settings/conflict）：自动重读，草稿不动、revision 换新，让用户再点一次；
       *   - 只写了半截：分开报「哪一半成功、哪一半没成」，并只给失败那一半的重试按钮；
       *   - 两半都没成：退回「保存失败：原因」+ 重试（凭据那边的原因一并带上）。
       * @returns {Promise<void>}
       */
      const saveAll = React.useCallback(async () => {
        const bridge = remotes.current;
        const view = viewRef.current;
        if (bridge === null || view === null) return;
        const ops = diffOps(draftRef.current, baselineRef.current);
        const credRefs = pendingCredentialRefs();
        if (ops.length === 0 && credRefs.length === 0) {
          setSave({ phase: 'idle', at: 0, error: '' });
          return;
        }
        setSave({ phase: 'saving', at: 0, error: '' });
        // 两半各自记账。一句「保存失败」会把已经成功的那一半也抹掉，用户根本不知道该重试哪边，
        // 于是他会把两边都重做一遍——凭据那半还可能是清空再重填。所以这里分开记、分开报。
        let configError = '';
        let credError = '';
        if (ops.length > 0) {
          try {
            const next = unwrap(await bridge.settings.mutate(view.ns, ops, view.revision));
            const after = next && typeof next === 'object' ? next : view;
            // ns 一律以这次返回的为准：认领来的 ns 不能被任何写死的东西盖回去。
            viewRef.current = {
              ...after,
              ns: typeof after.ns === 'string' && after.ns !== '' ? after.ns : view.ns,
            };
            // 配置这一段已经真的落盘，基线抬到刚发出去的那份草稿；
            // 万一接下来凭据写失败，脏读数就只剩那一条凭据。
            baselineRef.current = { ...draftRef.current };
            setBaseline({ ...draftRef.current });
          } catch (err) {
            if (isConflict(err)) {
              // 别人先改了：**自动重读**（草稿原样保留、revision 换成新的），再让用户点一次保存。
              // 不重读的话重试会拿着旧 revision 再撞一次，这条路是死的。
              await load({ preserveDraft: true });
              return;
            }
            configError = String(err?.message ?? err);
          }
        }
        // 配置那半失败也照旧写凭据：两半互不依赖，一次点击把能落盘的那半落盘。
        for (const ref of credRefs) {
          try {
            await commitCredential(ref);
          } catch (err) {
            credError = String(err?.message ?? err);
            break;
          }
        }
        const credWrote = credRefs.length > 0 && credError === '';
        if (configError === '' && credError === '') {
          setSave({ phase: 'saved', at: Date.now(), error: '' });
          return;
        }
        if (configError === '') {
          // 配置成功、凭据失败：只该重试凭据。
          setSave({ phase: 'partialCred', at: 0, error: credError, credError: '' });
          return;
        }
        if (credWrote) {
          // 凭据成功、配置失败：只该重试配置。
          setSave({ phase: 'partialConfig', at: 0, error: configError, credError: '' });
          return;
        }
        // 两半都没成（或压根没凭据可写）：退回到原来的「保存失败」一档，但把凭据的原因也带上。
        setSave({ phase: 'error', at: 0, error: configError, credError });
      }, [remotes, pendingCredentialRefs, commitCredential, load]);

      /** 只重试授权码（配置那一半已经写成功了）。 */
      const retryCredentials = React.useCallback(async () => {
        const credRefs = pendingCredentialRefs();
        if (credRefs.length === 0) {
          setSave({ phase: 'idle', at: 0, error: '' });
          return;
        }
        setSave({ phase: 'saving', at: 0, error: '' });
        try {
          for (const ref of credRefs) await commitCredential(ref);
          setSave({ phase: 'saved', at: Date.now(), error: '' });
        } catch (err) {
          setSave({ phase: 'partialCred', at: 0, error: String(err?.message ?? err), credError: '' });
        }
      }, [pendingCredentialRefs, commitCredential]);

      /** 只重试配置（授权码那一半已经写成功了）。 */
      const retryConfig = React.useCallback(async () => {
        const bridge = remotes.current;
        const view = viewRef.current;
        if (bridge === null || view === null) return;
        const ops = diffOps(draftRef.current, baselineRef.current);
        if (ops.length === 0) {
          setSave({ phase: 'idle', at: 0, error: '' });
          return;
        }
        setSave({ phase: 'saving', at: 0, error: '' });
        try {
          const next = unwrap(await bridge.settings.mutate(view.ns, ops, view.revision));
          const after = next && typeof next === 'object' ? next : view;
          viewRef.current = {
            ...after,
            ns: typeof after.ns === 'string' && after.ns !== '' ? after.ns : view.ns,
          };
          baselineRef.current = { ...draftRef.current };
          setBaseline({ ...draftRef.current });
          setSave({ phase: 'saved', at: Date.now(), error: '' });
        } catch (err) {
          if (isConflict(err)) {
            await load({ preserveDraft: true });
            return;
          }
          setSave({ phase: 'partialConfig', at: 0, error: String(err?.message ?? err), credError: '' });
        }
      }, [remotes, load]);

      /**
       * 放弃改动：草稿整体回滚到基线，授权码草稿一并清掉，读数回到「没有未保存的改动」。
       * @returns {void}
       */
      const discardAll = React.useCallback(() => {
        const base = baselineRef.current ?? {};
        draftRef.current = { ...base };
        setDraft({ ...base });
        setPwDraft({});
        setPwClear({});
        setPwEdit({});
        setSave({ phase: 'idle', at: 0, error: '' });
      }, []);

      /**
       * 恢复全部默认：清掉本命名空间在 profile 里的全部覆盖，**立即生效**。
       *
       * 它是破坏性操作，所以照旧先弹确认；确认之后不再受「保存」按钮约束——
       * 语义就是「把服务端的覆盖清空」，草稿随后按服务端的新值重建。
       */
      const resetAll = React.useCallback(async () => {
        const bridge = remotes.current;
        const view = viewRef.current;
        if (bridge === null || view === null) return;
        setResetting(true);
        setSave({ phase: 'saving', at: 0, error: '' });
        try {
          const next = unwrap(await bridge.settings.replace(view.ns, {}, view.revision));
          if (next && typeof next === 'object') {
            viewRef.current = {
              ...next,
              ns: typeof next.ns === 'string' && next.ns !== '' ? next.ns : view.ns,
            };
          }
          // 服务端覆盖已清空：**凭据草稿一并丢掉**。留着它在草稿里，会立刻又算出一项
          // 「有 1 项改动未保存」，而那一项其实属于刚被重置掉的旧配置（授权码本身不受重置影响）。
          setPwDraft({});
          setPwClear({});
          setPwEdit({});
          await load();
          setSave({ phase: 'saved', at: Date.now(), error: '' });
        } catch (err) {
          // 失败不重读：重读会把用户还没保存的草稿冲掉。
          setSave({ phase: 'error', at: 0, error: String(err?.message ?? err) });
        } finally {
          setResetting(false);
          setConfirmReset(false);
        }
      }, [remotes, load]);

      /**
       * 发一封测试邮件。
       *
       * 结果是 RPC **当场**返回的：成败与原始报错直接进 test 态，
       * 因为账本删掉之后，这条路径就是唯一的「真投递过没有」的证据。
       */
      const sendTest = React.useCallback(async () => {
        if (typeof remotes.current?.rpc?.call !== 'function') return;
        setTest({ phase: 'sending', ms: 0, error: '' });
        try {
          const result = unwrap(await callRemote('test'));
          if (result && result.ok === false) {
            setTest({ phase: 'fail', ms: 0, error: String(result.error ?? '') });
          } else {
            setTest({
              phase: 'ok',
              ms: Number(result?.ms ?? 0),
              error: '',
            });
          }
        } catch (err) {
          setTest({ phase: 'fail', ms: 0, error: String(err?.message ?? err) });
        }
      }, [remotes]);

      // ---- 派生值 ----
      const recipients = parseRecipients(draft.recipients);
      // 凭据行的写入目标由**草稿**给出（硬约束 4：写入目标跟着这一行走）。
      const smtpPasswordRef = String(draft.smtpPasswordRef ?? '').trim();
      const configured = (ref) => ref !== '' && credentialState[ref] === true;
      // 判决条一律按**已保存的配置**（baseline）判定。
      // 拿草稿下结论会当场骗人：草稿填齐就报「可以发信了」，而「发送测试邮件」用的正是已保存
      // 配置，用户一点就失败——先被夸一句、再被打一巴掌，比什么都不说更糟。
      const savedRecipients = parseRecipients(baseline.recipients);
      const savedPasswordRef = String(baseline.smtpPasswordRef ?? '').trim();
      /** 已保存的配置里有几个事件是开的（判决条「事件全关」那一档要用）。 */
      const savedEventsOn = OUTCOME_FIELDS.filter((item) => baseline[item.field] === true).length;
      const statusKey = deriveStatus({
        enabled: baseline.enabled === true,
        eventsOn: savedEventsOn,
        recipientCount: savedRecipients.valid.length,
        host: baseline.smtpHost,
        user: baseline.smtpUser,
        credentialConfigured: configured(savedPasswordRef),
      });
      /** SMTP 这一段自己配好了没有——凭据行在下面很远，段头这一格是它唯一的上层读数（同样按已保存值）。 */
      const transportReady = configured(savedPasswordRef)
        && String(baseline.smtpHost ?? '').trim() !== ''
        && String(baseline.smtpUser ?? '').trim() !== '';
      const transportState = t(transportReady ? 'transportState.done' : 'transportState.todo');
      const STATUS_TITLE_KEY = {
        disabled: 'status.disabled',
        allOff: 'status.allOff',
        needRecipients: 'status.needRecipients',
        needHost: 'status.needHost',
        needUser: 'status.needUser',
        needCredential: 'status.needCredential',
        ready: 'status.ready',
      };
      /** 判决句：**全页最大的字号**，也是这一页真正要回答的那句话。 */
      const statusTitle = statusKey === 'needCredential'
        ? t('status.needCredential', { cred: t('cred.smtp') })
        : t(STATUS_TITLE_KEY[statusKey] ?? 'status.ready');
      /** 判决下面那句人话：为什么是这个判决、下一步该动哪里。只说用户的事。 */
      const statusWhy = viewRef.current === null ? t('status.notServed') : t(`status.why.${statusKey}`);
      const outcomesOn = OUTCOME_FIELDS.filter((item) => draft[item.field] === true).length;
      const preset = matchPreset(draft.smtpHost);
      /** 远程桥接有没有接上；没接上时这一页连草稿都读不到，先不给人按钮。 */
      const bridgeReady = remotes.current !== null;
      /** 能不能真发一封：只看 connection 有没有把 RPC 接进来（不再探 Host 端点）。 */
      const rpcReady = typeof remotes.current?.rpc?.call === 'function';
      const sending = test.phase === 'sending';
      /** 判决条那一档：状态→色调的映射只此一份。 */
      const tone = STATUS_TONE[statusKey] ?? 'idle';

      // ---- 草稿 vs 基线：保存按钮的可用状态与整条读数都由这份差异决定 ----
      /** 与基线不同的配置字段（保存时合成一条 mutate 的 ops）。 */
      const pendingOps = diffOps(draft, baseline);
      /** 还挂在草稿里的凭据引用名（授权码也算一项改动）。 */
      const pendingCredRefs = pendingCredentialRefs();
      /** 未保存的改动数：N 个配置字段 + 至多一条授权码。 */
      const dirtyCount = pendingOps.length + pendingCredRefs.length;
      /** 读数那一档的色调。半成功也算异常：那种状态绝不能长成「一切正常」的样子。 */
      const saveTone = save.phase === 'error' || save.phase === 'unserved' || save.phase === 'loadFailed'
        || save.phase === 'partialCred' || save.phase === 'partialConfig'
        ? 'error'
        : (save.phase === 'saving' ? 'busy' : (dirtyCount > 0 ? 'dirty' : 'idle'));
      /**
       * 保存读数。只说这一刻的事实：干净 / 脏 / 保存中 / 已保存多久 / 失败原因 + 重试，
       * 以及三种非干净结局各自的动作——读失败给「重新读取」、冲突给「再点一次保存」、
       * 半成功只给失败那一半的重试。动作永远指向**这一次真正该做的事**，不是笼统的「重试」。
       * @returns {object[]} 读数节点
       */
      const saveReadout = () => {
        if (save.phase === 'unserved') return [t('status.notServed')];
        if (save.phase === 'loadFailed') {
          // 读失败不是「保存失败」：这里一个字都不许写回，只重读。
          return [
            t('save.loadFailed', { error: save.error }),
            h('button', {
              type: 'button',
              className: 'dshmn-link',
              onClick: () => void load(),
            }, t('save.reload')),
          ];
        }
        if (save.phase === 'conflictReloaded') return [t('save.conflictReloaded')];
        if (save.phase === 'partialCred') {
          // 配置写进去了、授权码没写进去：只给授权码那一半的重试。
          return [
            t('save.credFailed', { error: save.error }),
            h('button', {
              type: 'button',
              className: 'dshmn-link',
              onClick: () => void retryCredentials(),
            }, t('save.retryCred')),
          ];
        }
        if (save.phase === 'partialConfig') {
          // 授权码写进去了、配置没写进去：只给配置那一半的重试。
          return [
            t('save.configFailed', { error: save.error }),
            h('button', {
              type: 'button',
              className: 'dshmn-link',
              onClick: () => void retryConfig(),
            }, t('save.retryConfig')),
          ];
        }
        if (save.phase === 'error') {
          return [
            t('save.error', { error: save.error }),
            String(save.credError ?? '') === '' ? null : t('save.credAlsoFailed', { error: save.credError }),
            h('button', {
              type: 'button',
              className: 'dshmn-link',
              onClick: () => void saveAll(),
            }, t('save.retry')),
          ].filter((node) => node !== null);
        }
        if (save.phase === 'saving') return [t('save.saving')];
        if (dirtyCount > 0) return [t('save.dirty', { n: dirtyCount })];
        if (save.phase === 'saved' && save.at > 0) {
          return [agoText(now - save.at, t)];
        }
        return [t('save.clean')];
      };

      // 有未保存改动时，关闭 / 离开页面要拦一下；没有改动就完全静默（日常切页不该被打断）。
      React.useEffect(() => {
        if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return undefined;
        if (dirtyCount === 0) return undefined;
        const guard = (event) => {
          event.preventDefault();
          event.returnValue = t('save.dirty', { n: dirtyCount });
          return event.returnValue;
        };
        window.addEventListener('beforeunload', guard);
        return () => window.removeEventListener('beforeunload', guard);
      }, [dirtyCount]);

      /** 测试按钮文案：发的时候说在发；刚才那次没成功就说重测。 */
      const testLabel = sending
        ? t('act.testing')
        : (test.phase === 'fail' ? t('act.retest') : t('act.test'));

      /**
       * 「发送测试邮件」——本页唯一的主行动。
       *
       * 刻意**不挑状态**：配置只填了一半时，"怎么验证"恰恰最需要出现。
       * 它的价值就是用结果告诉你还缺什么：缺授权码、535 认证失败、550 被拒，
       * 都会在同一次点击里变成一句能读的原因。
       * @param {object} [options] variant / size
       * @returns {object|null} React 元素
       */
      const testButton = (options) => {
        if (!bridgeReady) return null;
        if (!rpcReady) return h('span', { className: 'dshmn-hint' }, t('act.needsRestart'));
        // 凭据行那处用文字链接：手刚离开授权码输入框，验证就在原地，不必滚回页首。
        // 它和判决条是同一个动作，但主次分明——判决条是主按钮，这里是弱入口。
        if (options?.variant === 'link') {
          return h('button', {
            type: 'button',
            className: 'dshmn-link',
            disabled: sending,
            title: t('act.testHint'),
            onClick: () => void sendTest(),
          }, testLabel);
        }
        return h(Button, {
          variant: options?.variant ?? 'outline',
          size: options?.size ?? 'sm',
          disabled: sending,
          // 悬停说明点了会发生什么：这是**真的**往外发一封信，不是预览
          title: t('act.testHint'),
          onClick: () => void sendTest(),
        }, testLabel);
      };

      /**
       * 判决条的动作区：**全页唯一主行动**是「发送测试邮件」，实心主按钮落在右下角。
       *
       * 它不挑状态：配置只填了一半时，"怎么验证"恰恰最需要出现（一次点击就把缺什么问出来）。
       * 没配完时左边再给一个次级按钮「启用 / 去填写」——它是下一步，但不跟主行动抢主次：
       * 已关闭时是「启用」，缺字段时是「去填写」（把光标送到缺的那一格）。
       * @returns {object[]} [次要的下一步, 实心主按钮]，主按钮永远在最后（右下角）
       */
      const verdictActions = () => {
        const nextStep = statusKey === 'ready'
          ? null
          : (statusKey === 'disabled'
            ? h(Button, {
              variant: 'outline',
              size: 'sm',
              onClick: () => setField('enabled', true),
            }, t('act.enable'))
            : h(Button, {
              variant: 'outline',
              size: 'sm',
              onClick: () => focusMissing(),
            }, t('act.goFill')));
        return [nextStep, testButton({ variant: 'primary' })];
      };

      /** 把光标送到某一格（元素不在就什么也不做）。 */
      const focusField = (id) => {
        const element = typeof document === 'undefined' || typeof document.getElementById !== 'function'
          ? null
          : document.getElementById(id);
        if (element === null || element === undefined) return;
        if (typeof element.scrollIntoView === 'function') element.scrollIntoView({ block: 'center' });
        if (typeof element.focus === 'function') element.focus();
      };

      /** 把用户送到缺的那一格，而不是让他自己在一屏里找。 */
      const focusMissing = () => {
        focusField(statusKey === 'needRecipients' ? 'dshmn-recipients'
          : (statusKey === 'needHost' ? 'dshmn-smtp-host'
            : (statusKey === 'needUser' ? 'dshmn-smtp-user'
              : (statusKey === 'allOff' ? 'dshmn-master' : 'dshmn-cred-smtp'))));
      };

      /**
       * 「发送测试邮件」这次点击的回执。
       *
       * 账本删掉之后，这里是**唯一**能回答「真投递过没有」的地方，所以它必须
       * 成功给用时、失败给分类 + 原文：只报一句「已发送」等于把人推回日志里。
       * 状态只活在内存里、刷新页面即消失——它报的是这一次点击，不是历史。
       * @returns {object|null} React 元素
       */
      const testResult = () => {
        if (test.phase === 'sending') {
          return h('div', { className: 'dshmn-evidence' },
            h('span', { className: 'dshmn-evidenceKey' }, t('act.testing')));
        }
        if (test.phase === 'ok') {
          return h('div', { className: 'dshmn-evidence', 'data-ok': 'true' },
            h('span', { className: 'dshmn-evidenceKey' }, t('test.sent')),
            h('span', null, t('test.sentMs', { ms: Number(test.ms ?? 0) })));
        }
        if (test.phase === 'fail') {
          const reason = classifySendError(test.error);
          return h('div', { className: 'dshmn-evidence', 'data-ok': 'false' },
            h('span', { className: 'dshmn-evidenceKey' }, t('test.failed')),
            h('span', null, reason.label),
            h('span', { className: 'dshmn-hint' }, reason.hint),
            h('span', { className: 'dshmn-mono' }, String(test.error ?? '')));
        }
        return null;
      };
      /**
       * 授权码行。一行之内四个元素：状态（✓ 已保存 / 有未保存的授权码 / 还没保存）
       * + 更换 + 清除 + 发送测试邮件（文字链接）。
       *
       * 「怎么拿授权码？」改成行内文字链接——问号按钮随「全页零折叠」一起删了。
       * **只读密码框保留**：存好之后仍然摆着那一格，让人一眼看见"这里有一份东西"。
       * 脏态诚实化：草稿里有未保存的授权码（或标了清除）时，绝不再显示「✓ 已保存」。
       * @param {string} fieldId 输入框 id
       * @param {string} labelKey 名称文案键
       * @param {string} ref 凭据引用名（写入目标由调用方给定，硬约束 4）
       * @param {string} hintKey 说明文案键
       * @param {string} helpKey 帮助链接文案键
       * @returns {object} React 元素
       */
      const credentialField = (fieldId, labelKey, ref, hintKey, helpKey) => {
        const confirmed = configured(ref);
        // 「更换」只是把输入框展开，不算一项改动；真正待清理的是 pwClear。
        const editing = confirmed !== true || pwEdit[ref] === true;
        const drafting = String(pwDraft[ref] ?? '').trim() !== '' || pwClear[ref] === true;
        const showSaved = confirmed === true && drafting !== true;
        return h('div', { className: 'dshmn-item' },
          h('div', { className: 'dshmn-itemHead' },
            h('span', { className: 'dshmn-labelRow' },
              h('label', { className: 'dshmn-label', htmlFor: fieldId }, t(labelKey)),
              h('button', {
                type: 'button',
                className: 'dshmn-link',
                onClick: () => setHelpKind(true),
              }, t(helpKey))),
            h('span', { className: 'dshmn-credActions' },
              h('span', { className: 'dshmn-credState', 'data-ok': showSaved ? 'true' : 'false' },
                showSaved ? h('span', { 'aria-hidden': 'true' }, h(CheckedMark, null)) : null,
                showSaved ? t('cred.saved') : (drafting ? t('cred.draft') : t('cred.notSaved'))),
              confirmed
                ? h('button', {
                  type: 'button',
                  className: 'dshmn-link',
                  onClick: () => setPwEdit((prev) => ({ ...prev, [ref]: true })),
                }, t('cred.replace'))
                : null,
              confirmed
                ? h('button', {
                  type: 'button',
                  className: 'dshmn-link',
                  onClick: () => {
                    setPwDraft((prev) => ({ ...prev, [ref]: '' }));
                    setPwClear((prev) => ({ ...prev, [ref]: true }));
                  },
                }, t('cred.clear'))
                : null,
              testButton({ variant: 'link' }))),
          editing
            ? h(TextInput, {
              id: fieldId,
              type: 'password',
              value: pwDraft[ref] ?? '',
              placeholder: t('cred.placeholder'),
              onChange: (event) => {
                const value = event.target.value;
                setPwDraft((prev) => ({ ...prev, [ref]: value }));
                setPwClear((prev) => ({ ...prev, [ref]: false }));
              },
            })
            : h('div', null,
              h(TextInput, {
                id: fieldId,
                type: 'password',
                value: '',
                readOnly: true,
                'aria-label': `${t(labelKey)}：${t('cred.saved')}`,
                placeholder: t('cred.saved'),
                onFocus: () => setPwEdit((prev) => ({ ...prev, [ref]: true })),
              })),
          h('div', { className: 'dshmn-hint' }, t(hintKey)),
          save.phase === 'saving' ? h('div', { className: 'dshmn-hint' }, t('save.checkingCred')) : null,
          credError === ''
            ? null
            : h('div', { className: 'dshmn-error' },
              h('button', {
                type: 'button',
                className: 'dshmn-link',
                onClick: () => void refreshCredentials([ref]),
              }, `${t('save.credCheckFailed', { error: credError })}，${t('save.reload')}`)));
      };

      /**
       * 一个事件开关格子：标题 + 开关，说明常显在下面一行（12/18）。
       *
       * 全页零折叠：说明不再藏在问号后面，也没有"点一下才知道"的东西。
       * 8 个格子排成三列网格（窄屏一列），**不分组**——分组标题把并列的开关伪装成
       * 有层级，用户还得先学会"另外 3 个藏在哪"。
       * @param {string} field 配置字段名
       * @param {string} titleKey 标题文案键
       * @param {string} hintKey 说明文案键
       * @returns {object} React 元素
       */
      const eventCell = (field, titleKey, hintKey) => h('div', { className: 'dshmn-event', key: field },
        h('label', { className: 'dshmn-eventHead' },
          h(Check, {
            checked: draft[field] === true,
            disabled: draft.enabled === false,
            label: t(titleKey),
            'data-event': field,
            onChange: (next) => setField(field, next),
          }),
          h('span', { className: 'dshmn-eventTitle' }, t(titleKey))),
        h('p', { className: 'dshmn-eventNote' }, t(hintKey)));

      /** 收件人那一组的读数：只说个数，落在段头的小字里（不再占一行正文）。 */
      const recipientsState = recipients.valid.length > 0
        ? t('recipients.ok', { n: recipients.valid.length })
        : t('recipients.none');

      /**
       * 「恢复全部默认」的入口：宿主给了 Modal 就弹确认框；没给就退回 window.confirm。
       * 两条路都必须点得动——点了什么都不发生，是这一页最不该有的反应。
       * @returns {void}
       */
      const askReset = () => {
        if (typeof P.Modal === 'function') {
          setConfirmReset(true);
          return;
        }
        const accepted = typeof window !== 'undefined' && typeof window.confirm === 'function'
          ? window.confirm(t('danger.body'))
          : true;
        if (accepted) void resetAll();
      };

      // ---- 判决条第三行的「人话摘要」：跟着草稿实时变（判决口径仍是已保存配置）----
      /** 服务商：认得出来用预设名，认不出来就是「自定义」。 */
      const summaryProvider = preset === null ? t('summary.custom') : preset.name;
      const summaryHost = String(draft.smtpHost ?? '').trim() === ''
        ? t('summary.noHost')
        : String(draft.smtpHost).trim();
      const summaryTo = recipients.valid.length === 0
        ? t('summary.noRecipient')
        : (recipients.valid.length === 1
          ? recipients.valid[0]
          : t('summary.recipients', { n: recipients.valid.length }));
      const summaryEventNames = OUTCOME_FIELDS
        .filter((item) => draft[item.field] === true)
        .map((item) => t(item.short));
      const summaryEvents = draft.enabled !== true || summaryEventNames.length === 0
        ? t('summary.eventsOff')
        : (summaryEventNames.length > 2
          ? t('summary.eventsMore', { list: summaryEventNames.slice(0, 2).join('、'), n: summaryEventNames.length })
          : t('summary.events', { list: summaryEventNames.join('、') }));
      const summaryLine = t('summary.line', {
        provider: summaryProvider,
        host: summaryHost,
        to: summaryTo,
        events: summaryEvents,
      });
      /** 总开关关着时，8 个事件开关变灰禁用（但不隐藏）。 */
      const eventsDisabled = draft.enabled === false;
      /** 页头那组按钮与吸底条共用同一份可用条件（脏读数只在页头）。 */
      const actionDisabled = dirtyCount === 0 || !bridgeReady || save.phase === 'saving';

      return h('div', { className: 'dshmn-page', 'data-build': BUILD },

        // ---- 页头（吸顶）：标题 + 一行说明；右侧脏读数 + 保存 + 放弃改动 ----
        h('header', { className: 'dshmn-head' },
          h('div', { className: 'dshmn-headText' },
            h('h2', { className: 'dshmn-title' }, t('nav')),
            h('p', { className: 'dshmn-lead' }, t('lead'))),
          h('div', { className: 'dshmn-headActions' },
            h('div', {
              className: 'dshmn-stamp',
              'data-tone': saveTone,
              'aria-live': 'polite',
            }, ...saveReadout()),
            h(Button, {
              variant: 'primary',
              size: 'sm',
              // 没有改动就禁用：主按钮不该在无事可做时还亮着。
              disabled: actionDisabled,
              title: t('act.saveHint'),
              onClick: () => void saveAll(),
            }, t('act.save')),
            h(Button, {
              variant: 'outline',
              size: 'sm',
              disabled: actionDisabled,
              onClick: () => discardAll(),
            }, t('act.discard')))),

        // ---- 判决条：全页唯一的状态色 hero；结论句 + 人话摘要 + 右下角主行动 ----
        h('section', {
          className: 'dshmn-verdict',
          'data-tone': tone,
          'aria-live': 'polite',
          'aria-label': t('group.status'),
        },
        h('div', { className: 'dshmn-verdictHead' },
          h(Dot, { state: tone === 'done' ? 'done' : (tone === 'error' ? 'error' : (tone === 'warning' ? 'warning' : 'idle')) }),
          h('h2', { className: 'dshmn-verdictTitle' }, statusTitle)),
        h('p', { className: 'dshmn-verdictWhy' }, statusWhy),
        // 人话摘要：一眼看全「哪家邮箱 · 哪个服务器 → 发给谁 · 什么时候发」。
        h('p', { className: 'dshmn-verdictSummary' }, summaryLine),
        // 口径明写：这句判决算的是**已保存的配置**，屏幕上没保存的改动不算数。
        dirtyCount > 0 ? h('p', { className: 'dshmn-hint' }, t('status.unsavedDraft')) : null,
        testResult(),
        h('div', { className: 'dshmn-verdictFoot' }, ...verdictActions())),

        // ---- 卡片一：收件人 ----
        h(Card, { kind: 'recipients', title: t('group.recipients'), state: recipientsState },
        h('div', { className: 'dshmn-item' },
        h('div', { className: 'dshmn-field' },
          h('label', { className: 'dshmn-label', htmlFor: 'dshmn-recipients' }, t('recipients.label')),
          // 单行输入：粘贴逗号 / 分号 / 换行分隔的多个地址照样一个不丢（解析函数没动）。
          h(TextInput, {
            id: 'dshmn-recipients',
            type: 'text',
            value: draft.recipients ?? '',
            placeholder: t('recipients.placeholder'),
            'aria-invalid': recipients.invalid.length > 0 ? 'true' : 'false',
            onChange: (event) => setField('recipients', event.target.value),
          }),
          h('div', { className: 'dshmn-hint' }, t('recipients.hint')),
          recipients.invalid.length > 0
            ? h('div', { className: 'dshmn-error', role: 'alert' }, t('recipients.invalid', { list: recipients.invalid.join('、') }))
            : null))),

        // ---- 卡片二：发信方式（只剩 SMTP 一种发送方式，不再让人选通道）----
        h(Card, { kind: 'transport', title: t('group.transport'), state: transportState },
        h('div', { className: 'dshmn-item' },
          h('div', { className: 'dshmn-hint' }, t('smtp.note')),

          // 7 个服务商收成一行横向滚动的 chips：窄屏不折成三排，「其他」永远在最右。
          h('div', { className: 'dshmn-chips', role: 'radiogroup', 'aria-label': t('preset.label') },
            ...PRESETS.map((item) => h(Segment, {
              key: item.id,
              active: preset !== null && preset.id === item.id,
              onClick: () => setFields({
                smtpHost: item.host,
                smtpPort: item.port,
                smtpSecure: item.secure,
                ...(draft.smtpUser === '' && userForPreset(item, recipients.valid) !== ''
                  ? { smtpUser: userForPreset(item, recipients.valid) }
                  : {}),
              }),
            }, item.name)),
            h(Segment, {
              active: preset === null,
              // 「其他」= 自建中继：光标直接送到主机那一格
              onClick: () => focusField('dshmn-smtp-host'),
            }, t('preset.other'))),
          preset === null ? null : h('div', { className: 'dshmn-hint' }, t('preset.detected', { name: preset.name })),

          // 主机 / 端口 / 加密 / 用户名：宽屏一行四列（主机与用户名吃剩余宽度），
          // 窄屏两行两列。端口与加密**默认可见**——它们是发不发得出去的一部分，不该藏在折叠里。
          h('div', { className: 'dshmn-smtpGrid' },
            h('div', { className: 'dshmn-field' },
              h('label', { className: 'dshmn-label', htmlFor: 'dshmn-smtp-host' }, t('smtp.host')),
              h(TextInput, {
                id: 'dshmn-smtp-host',
                type: 'text',
                value: draft.smtpHost ?? '',
                placeholder: 'smtp.example.com',
                onChange: (event) => setField('smtpHost', event.target.value),
              })),
            h('div', { className: 'dshmn-field' },
              h('label', { className: 'dshmn-label', htmlFor: 'dshmn-smtp-port' }, t('smtp.port')),
              h(TextInput, {
                id: 'dshmn-smtp-port',
                type: 'text',
                inputMode: 'numeric',
                value: draft.smtpPort ?? '',
                placeholder: '465',
                'aria-label': t('smtp.port'),
                onChange: (event) => {
                  const raw = String(event.target.value ?? '');
                  // 端口只收数字。Number('46a') 是 NaN：宿主会拒写，但报的是英文 SDK 错误，
                  // 而且 NaN 跟谁都不相等，脏计数会一直挂着不清。非法字符根本别进草稿——
                  // 受控输入会把框里的内容退回上一次的合法值。
                  if (raw !== '' && !/^\d+$/.test(raw)) return;
                  setField('smtpPort', raw === '' ? '' : Number(raw));
                },
              })),
            h('div', { className: 'dshmn-field' },
              h('label', { className: 'dshmn-label', htmlFor: 'dshmn-smtp-secure' }, t('smtp.secure')),
              h('select', {
                id: 'dshmn-smtp-secure',
                className: 'dshmn-select',
                value: draft.smtpSecure ?? 'auto',
                onChange: (event) => setField('smtpSecure', event.target.value),
              }, ...[['auto', 'auto'], ['tls', 'tls'], ['starttls', 'starttls'], ['plain', 'plain']]
                .map(([value, text]) => h('option', { key: value, value }, text)))),
            h('div', { className: 'dshmn-field' },
              h('label', { className: 'dshmn-label', htmlFor: 'dshmn-smtp-user' }, t('smtp.user')),
              h(TextInput, {
                id: 'dshmn-smtp-user',
                type: 'text',
                value: draft.smtpUser ?? '',
                placeholder: `you${preset?.suffix ?? '@example.com'}`,
                onChange: (event) => setField('smtpUser', event.target.value),
              }),
              accountMismatch(preset, draft.smtpUser)
                ? h('div', { className: 'dshmn-error', role: 'alert' }, t('smtp.accountMismatch', {
                  host: String(draft.smtpHost ?? ''),
                  name: preset?.name ?? '',
                  user: String(draft.smtpUser ?? ''),
                  suffix: preset?.suffix ?? '',
                }))
                : null))),
        credentialField('dshmn-cred-smtp', 'cred.smtp', smtpPasswordRef, 'cred.smtpHint', 'cred.smtpHelp')),

        // ---- 卡片三：通知时机（第一行总开关；下面 8 个事件三列网格，说明常显）----
        h(Card, {
          kind: 'outcomes',
          title: t('group.outcomes'),
          state: outcomesOn > 0 ? t('outcomes.countOn', { n: outcomesOn }) : t('outcomes.countOff'),
        },
        h('div', { className: 'dshmn-master' },
          h('div', { className: 'dshmn-masterHead' },
            h('span', { className: 'dshmn-label' }, t('notify.master')),
            h(Switch, {
              id: 'dshmn-master',
              checked: draft.enabled === true,
              label: t('notify.master'),
              'data-master': 'true',
              onChange: (next) => setField('enabled', next),
            })),
          h('p', { className: 'dshmn-hint' }, t('notify.masterHint'))),
        h('div', { className: 'dshmn-events' },
          ...OUTCOME_FIELDS.map((item) => eventCell(item.field, item.title, item.hint)))),

        // ---- 页脚：清空覆盖是破坏性操作，压到页面最底部、只用一条文字链接 ----
        h('div', { className: 'dshmn-foot' },
          h('button', {
            type: 'button',
            className: 'dshmn-link',
            disabled: resetting,
            onClick: askReset,
          }, t('danger.reset'))),

        // ---- 吸底条：常驻底部，只放两个动作（脏读数只在页头）----
        h('div', { className: 'dshmn-savebar' },
          h(Button, {
            variant: 'outline',
            size: 'sm',
            disabled: actionDisabled,
            onClick: () => discardAll(),
          }, t('act.discard')),
          h(Button, {
            variant: 'primary',
            size: 'sm',
            disabled: actionDisabled,
            title: t('act.saveHint'),
            onClick: () => void saveAll(),
          }, t('act.save'))),

        typeof P.Modal === 'function'
          ? h(P.Modal, {
            open: confirmReset,
            onClose: () => setConfirmReset(false),
            title: t('danger.title'),
            closeLabel: t('danger.cancel'),
            footer: h(React.Fragment, null,
              h(Button, { variant: 'outline', size: 'sm', onClick: () => setConfirmReset(false) }, t('danger.cancel')),
              h(Button, { variant: 'primary', size: 'sm', disabled: resetting, onClick: () => void resetAll() }, t('danger.ok'))),
          },
          h('div', { className: 'dshmn-hint' }, t('danger.body')),
          h('div', { className: 'dshmn-hint' }, t('danger.keep')))
          : null,

        // ---- 凭据帮助（疑问句必须是能点的）----
        (typeof P.Modal === 'function' && helpKind !== null
          ? h(P.Modal, {
            open: true,
            onClose: () => setHelpKind(null),
            title: t('cred.smtpHelpTitle'),
            closeLabel: t('cred.helpClose'),
            footer: h(Button, { variant: 'outline', size: 'sm', onClick: () => setHelpKind(null) }, t('cred.helpClose')),
          }, h('div', { className: 'dshmn-helpBody' }, t('cred.smtpHelpBody')))
          : null));
    }

    /**
     * 解 Remote 的 `{ ok, value }` 信封（硬约束 2）。
     * @param {unknown} response Remote 返回值
     * @returns {unknown} value 部分
     */
    function unwrap(response) {
      if (response && typeof response === 'object' && response.ok === true) return response.value;
      const error = response && typeof response === 'object' ? response.error : undefined;
      const message = typeof error === 'string'
        ? error
        : (error && typeof error === 'object' && typeof error.message === 'string' ? error.message : JSON.stringify(error ?? response));
      const failure = new Error(message);
      // RemoteError 的真实形状（@deepseek-ai/dsh-typert-protocol）：一个真 Error，带 code 与 details。
      // **一定要把 code 带出来**：冲突恢复只认 code，把它丢掉就只剩一句人话，
      // 重试必然拿着旧 revision 再撞一次，用户只能关掉设置页再进来。
      if (error && typeof error === 'object') {
        if (typeof error.code === 'string') failure.code = error.code;
        if (error.details !== undefined) failure.details = error.details;
      }
      throw failure;
    }

    /**
     * 这次写失败，是不是「我读到之后别人又改了」？
     *
     * 判别一律靠 code（settings 控制器对 provider 的拒绝只分两档）：
     *   - settings/conflict：revision 被别处推走了，正确反应是**重读 + 重放**；
     *   - settings/rejected：请求本身不成立（只读 provider / schema 校验 / 存储故障），重试没用。
     * @param {unknown} error 捕获到的异常
     * @returns {boolean} true 表示是 revision 冲突
     */
    function isConflict(error) {
      const code = typeof error?.code === 'string' ? error.code : '';
      return code === 'settings/conflict' || code === 'conflict';
    }

    /**
     * 调一个 Host Remote 方法。
     *
     * 走 connection 的通用 RPC 而不是挂 remote 命名空间：本插件的 client 半是手写包，
     * 没有生成出来的 remote 声明，而 `/api` + `<namespace>/<method>` 是同一套网关，
     * 参数与清单里声明的 parameters 必须完全一致（test 是零参数）。
     * @param {'test'} method 方法名
     * @returns {Promise<unknown>} Remote 的 `{ ok, value }` 信封
     */
    function callRemote(method) {
      const rpc = remotesRef.current?.rpc;
      if (typeof rpc?.call !== 'function') {
        return Promise.reject(new Error('Host 未提供 mailNotify 能力 / host remote unavailable'));
      }
      return rpc.call('/api', `${REMOTE_NS}/${method}`, { args: {} });
    }

    return {
      inject,
      /**
       * 客户端入口。
       * @param {object} ctx 客户端上下文
       * @returns {void}
       */
      apply(ctx) {
        // 四个依赖各开一个独立的 inject（硬约束 1）：
        // 任何一个当时不可用，都只损失它自己那部分能力，页面依旧注册、依旧可用。
        const remotes = remotesRef;

        try {
          ctx.inject(['remote', 'remote.settings', 'remote.credentials'], (scoped) => {
            remotes.current = {
              ...(remotes.current ?? {}),
              settings: scoped.remote.settings,
              credentials: scoped.remote.credentials,
            };
          });
        } catch (error) {
          console.warn('[dsh-notify-p] 远程命名空间注入失败 / remote injection failed:', error);
        }

        // Host 动作走 connection 的通用 RPC：`/api` + `<namespace>/<method>`。
        // 参数必须与清单声明的 parameters 完全一致——test 是零参数，所以是空对象。
        try {
          ctx.inject(['connection'], (scoped) => {
            const rpc = scoped.connection?.rpc;
            if (typeof rpc?.call !== 'function') return;
            remotes.current = { ...(remotes.current ?? {}), rpc };
            console.info('[dsh-notify-p] Host RPC 已连接 / host rpc connected');
          });
        } catch (error) {
          console.warn('[dsh-notify-p] connection 注入失败，测试邮件不可用 / connection injection failed:', error);
        }

        try {
          ctx.inject(['locale'], (scoped) => {
            ctx.effect(() => scoped.locale.register(LOCALE_NS, { zh: ZH, en: EN }), 'dsh-notify-p: dictionaries');
            i18n.locale = scoped.locale;
            console.info('[dsh-notify-p] 文案字典已注册 / locale dictionaries registered');
          });
        } catch (error) {
          console.warn('[dsh-notify-p] locale 注入失败，回退中文 / locale injection failed:', error);
        }

        try {
          ctx.inject(['slots'], (scoped) => {
            scoped.slots.inject('settings.section', () => scoped.slots.register({
              name: 'settings.section',
              id: 'mail-notify',
              // icon 管理用 50，排在它后面
              order: 60,
              // 传函数而不是字符串：host 会在 locale revision 变化时重新解析它
              label: () => i18n.t('nav'),
            }, (props) => React.createElement(MailNotifyPage, { ...props, remotes })));
            console.info('[dsh-notify-p] 设置页已注册 / settings page registered (settings.section order=60)');
          });
        } catch (error) {
          console.warn('[dsh-notify-p] 设置页注册失败 / failed to register settings page:', error);
        }
      },
      /** 给离线单测用的接线口（浏览器运行时不会读它）。 */
      __internals: { parseRecipients, deriveStatus, matchPreset, presetForAddress, dotState, accountMismatch, userForPreset, PRESETS, ZH, EN, CSS, fmt, diffOps, agoText, i18n },
    };
  },
});
