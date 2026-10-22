// dsh-lookout · 合并后的浏览器半边
// 三段原文件逐字节保留；用一次“临时捕获 + 一次注册”合成单一模块。
(function () {
  const __loader = window.__ModuleLoader__;
  const __origLoad = __loader.load;
  const __parts = [];
  __loader.load = function (def) { __parts.push(def); };
  try {

    /* ================= 1/3 原 dsh-icon-custom（逐字节保留，勿改） ================= */
window.__ModuleLoader__.load({
	id: "dsh-icon-custom",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		let React = require("react");

		//#region locales
		const NS = "dsh-icon-custom";
		const zh = {
			nav: "icon管理",
			current: "当前图标",
			none: "使用平台默认图标",
			upload: "上传图标",
			uploadHint: "支持 SVG、PNG、ICO,最大 10 MB。SVG 会自动转成 PNG,自动适配安卓/iOS/平板的主屏图标。上传后立即生效,刷新页面也会保留。",
			uploadHintSummary: "支持 SVG/PNG/ICO,≤10 MB,上传即生效。",
			svgFail: "该 SVG 无法转换,请改用 PNG。",
			reset: "恢复默认",
			resetHint: "清除自定义图标并回到平台默认图标。",
			replace: "替换",
			replacing: "上传中…",
			resetting: "恢复中…",
			name: "名称",
			size: "大小",
			updated: "更新时间",
			successUpload: "已应用新图标",
			successReset: "已恢复默认图标",
			pwa: "同时替换 PWA 安装图标",
			pwaHint: "安装为应用(添加到主屏幕)后,桌面上的图标也换成这张;已安装的应用可能需要重新安装才会更新。",
			pwaHintSummary: "装成应用后桌面图标也换成这张,可能要重装。",
			successPwa: "PWA 图标设置已更新",
			logo: "同时替换页面 Logo 图标",
			logoHint: "把网页左上角品牌 logo 里的鲸鱼图标换成这张(不影响 deepseek HARNESS 文字)。",
			logoHintSummary: "把左上角品牌 logo 里的鲸鱼换成这张。",
			successLogo: "页面 Logo 已更新",
			fail: "操作失败",
			noFile: "请先选择图标文件",
			hintMoreLabel: "查看完整说明",
			badgeTest: "未读红点",
			badgeSourceLabel: "数据来源:",
			badgeSourceReal: "真实未读",
			badgeSourceManual: "手动测试",
			badgeTestUnit: "0 = 不显示",
			badgeSizeLabel: "红点大小:",
			badgeSizeHint: "单独出现时按这三档决定大小;红黄两颗数字同时出现时(未读 + 进行中),它们会一起缩到能塞下的最大尺寸 —— 这时三档画出来是一样的,因为画布就这么大。",
			badgeSizeHintSummary: "单独出现按三档;红黄同框时一起缩到能容纳。",
			badgeSizeSmall: "小",
			badgeSizeMedium: "中",
			badgeSizeLarge: "大",
			unreadReasonsLabel: "哪些情况算未读(勾选即生效):",
			reasonCompleted: "干完一轮",
			reasonError: "报错",
			reasonBlocked: "被卡住",
			reasonMaxTokens: "输出超限",
			reasonInterrupted: "崩溃中断",
			reasonAbortedUser: "我自己停止",
			reasonAbortedOther: "其他中断",
			reasonPending: "有人在等我(审批/提问/计划)",
			unreadIncludeSubagentsLabel: "子代理引起的结束也算未读",
			unreadIncludeSubagentsHint: "后台子代理跑完时,运行时会把它所属的会话**再叫醒跑一轮**;这一项决定那一轮结束算不算未读。关掉它:由子代理唤醒的那一轮结束不再亮红点,你自己发起的一轮照旧提醒(子代理自己没有会话行,一直都不算)。打开(默认)= 和以前完全一样。判定依据是官方日志里的那条「子代理结算」消息(`subagent-settled` / `agent-message`),所以一个回合里第一条消息是谁发的就决定了这一轮的归属;**你中途在同一条会话里插话**不会把已经记下的归属改写。",
			unreadIncludeSubagentsHintSummary: "子代理唤醒的那一轮结束算不算未读。默认算。",
			unreadPanelShort: "待处理",
			unreadPanelCount: "{n} 个待处理",
			unreadPanelNone: "暂无待处理",
			unreadPanelTitle: "待处理的会话",
			unreadPanelEmpty: "现在没有需要你处理的事情",
			unreadWaiting: "在等你",
			unreadEnded: "刚结束,还没看",
			unreadPanelOther: "其他",
			unreadMarkAllRead: "全部标记已读",
			/** 进行中清单(点黄字打开):和那个黄数字是同一个事实,不落盘、不推断。 */
			runningPanelTitle: "进行中的会话",
			runningPanelEmpty: "现在没有会话在运行",
			runningPanelTrigger: "{n} 个进行中,点击查看",
			runningPanelRow: "回合正在跑",
			/** 与官方侧栏同一形状("13小时"),方便和列表里的时间戳逐字对上。 */
			ageNow: "刚刚",
			ageMinutes: "{n}分钟",
			ageHours: "{n}小时",
			ageDays: "{n}天",
			ageMonths: "{n}个月",
			ageYears: "{n}年",
			workspaceDotLabel: "在工作区和会话行上显示红点(实验)",
			workspaceDotHint: "在侧栏工作区那一行的文件夹图标上点一个小红点(收起的工作区里有多少未读,就看它),有未读的会话在其标题右边也跟一个小红点。会话行上的点只在那一行真的显示着时才画:折叠起来的会话由工作区那一行的点和「待处理」清单代表。这一项是贴着页面结构做的,DSH 升级后可能失效;失效时只会变成\"不显示\",不会影响红点数字、清单、跳转这些功能,随时可以关掉它。",
			workspaceDotHintSummary: "工作区文件夹和会话行上加小红点(实验,可能失效)。",
			revealLabel: "点清单里的会话时,在侧栏定位到它(实验)",
			revealHint: "点「待处理」或「进行中」清单里的一条时,除了打开那个会话,还会在侧栏把它所在的工作区展开、滚到那一行、并闪一下。这是贴着页面结构做的:官方只把\"展开 + 滚动\"留给了它自己的搜索框,没有给插件留接口,所以这里只能模拟点击官方的工作区行和「显示更多」。DSH 升级后可能失效,失效的表现只是\"侧栏不动\",打开会话完全不受影响。**展开状态是官方自己记住的**(存在浏览器里),所以它不会自己收回去——不想要就手动收起那个工作区,或者关掉这个开关。",
			revealHintSummary: "点清单时在侧栏展开并闪一下(实验,可能失效)。",
			appBadgeLabel: "在系统应用图标上显示红点",
			appBadgeHint: "安装为应用后,把同一个数字也放到系统图标上:Windows 是任务栏图标上的角标,macOS 是 Dock 角标,iOS 是主屏图标上的数字。样子由系统决定——Windows 上 Chrome 画深色圆+白字,Edge 走 Windows 系统徽章通道(是否显示数字由 Edge/Windows 决定);插件会周期重设数字,但只在应用窗口开着时更新。Safari 的程序坞网页应用 / 主屏应用还要先允许通知(见下面的「通知权限」),否则角标不会出现。",
			appBadgeHintSummary: "把同一个数字也放到系统应用图标上。",
			appBadgeFootnote: "角标只在应用窗口开着时由本插件更新;数字超过 99 时由系统显示为 99+。",
			appBadgeProbeInstalled: "当前环境:已安装为应用,本机可以设置角标。是否真正显示由系统决定。",
			appBadgeProbeTab: "当前环境:浏览器标签页(不是安装的应用)——安装为应用后才会显示角标。",
			appBadgeProbeUnsupported: "当前环境:本机没有这个能力(当前浏览器不支持应用角标)。",
			appBadgeProbeInsecure: "当前环境:不是安全上下文(请用 localhost 或 https 访问),系统角标不可用。",
			notificationPermissionLabel: "通知权限:",
			notificationPermissionGranted: "已授予",
			notificationPermissionDefault: "未授予",
			notificationPermissionDenied: "已被拒绝(要去系统设置的「通知」里打开)",
			notificationPermissionUnsupported: "本机浏览器没有通知能力",
			notificationPermissionButton: "允许通知",
			notificationPermissionHint: "Chrome / Edge 的角标不需要这一步;Safari 不一样——macOS 的「添加到程序坞」网页应用和 iOS 的主屏应用,只有在你允许通知之后才会画出角标(Apple 把角标权限绑在通知权限上)。这里只申请权限,本插件目前不会给你发通知。",
			notificationPermissionHintSummary: "只有 Safari 系(iOS/macOS)需要先允许通知。",
			badgeTestHint: "真实未读 = 有会话发生了上面勾选的情况、而且你还没看过它(打开该会话即视为已读)。你正开着的会话也算——窗口可能被最小化、页面可能切到后台,这里无从判断你在不在看,所以不做这个区分。子代理是否计入,由上方「子代理引起的结束也算未读」开关决定。手动模式:自己填数字试看效果。刷新页面后回到真实未读。",
			badgeTestHintSummary: "真实未读 = 勾选情况发生且你没看过;子代理看上方的开关。",
			clearDelayLabel: "进入会话后多久算已读:",
			clearDelayUnit: "秒",
			clearDelayHint: "填 0 = 进去就算已读(红点立即消失)。大于 0 时,你要在那个会话里连续待满这么多秒它才算看过:中途切走会清零重数,刷新页面也重新数。**计时只认\"你进入会话时已经存在的结束\"**——你人已经在里面的时候又跑完一轮,那一轮不算数:它会一直亮着,等你切走再进来才会清。上限 600 秒。**切到「插件/设置」页、或把标签页切到后台,都只是暂停计时,不会因此清掉红点**(它们不算离开);真正算离开的只有一件事:**去别的会话**。已读记在宿主($DSH_HOME/custom-favicon/unread-seen.json):任何一台设备上看过,所有设备都不再提醒;浏览器那份只是缓存,清站点数据不会把已读丢回去。",
			clearDelayHintSummary: "0 = 进去即已读;>0 要连续待满,上限 600 秒。",
			/** 进行中黄点(0.18.0):官方 running 的第二次投影,与红点互不牵连。 */
			runningMarkSection: "进行中黄点",
			runningMarkLabel: "显示进行中标记(标题数字 / 文件夹与会话行 / 左上角 / 标签页)",
			runningMarkCount: "{n} 个进行中",
			runningMarkHint: "黄点就是官方的「进行中」:会话有回合正在跑、而且没有停下来等你(停下等你的时候,官方那一行显示琥珀色的「等待审批 / 等待回答」,黄点也就不亮)。它和未读红点完全独立、各画各的:侧栏「工作区」标题后面是黄色数字——此刻全局有几个会话在跑(和红数字上下排:右上红、右下黄);工作区文件夹图标上是黄点,有未读时红点在左、黄点在右;会话行上同样是红点在左、黄点在右;左上角 Logo 与标签页图标右下角也是同一个数字,红数字仍占右上角。事实全部来自官方(会话列表里每个会话的 `running`)——插件不落盘、不推断,所以刷新页面立刻是对的,进程重启也不会留下一个永远亮着的黄点。关掉这个开关,红点完全不受影响。",
			runningMarkHintSummary: "黄点就是官方的进行中,和红点各自独立、互不影响。",
			runningIncludeSubagentsLabel: "把子代理的「进行中」算到它所属的会话上",
			runningIncludeSubagentsHint: "子代理(子会话)在侧栏里没有自己的那一行,所以它正在跑的时候,它上面那个真正属于你的会话看上去是空闲的。打开这个开关:有子代理在跑,就把最顶层那个不是子代理的祖先会话记为进行中——黄点/黄数字反映的是「有活正在干」,而不只是「你亲手开的会话在跑」。同一个祖先下好几个子代理同时跑,只算一次(数字始终是会话数,不是子代理数);子代理自己那一行照旧不画。祖先会话正在等你(官方那行是琥珀色)时不计。关掉就完全回到旧行为:所有子代理一律不计。",
			runningIncludeSubagentsHintSummary: "子代理在跑就把最顶层祖先会话记为进行中。",
			headerRingLabel: "在会话头部的子代理计数上叠一个黄圈",
			headerRingHint: "聊天区顶部那颗「N 个子智能体」的计数,右上角会叠一个小黄圈:只在**有直接子代理正在运行**时出现,里面的数字就是它们此刻的个数——不含更深一层的孙代理,同一个直接子代理只算一次,超过 99 显示 `99+`。它只是个数字:**不能点**,也不拦截任何点击,更不会改动画面的排版;会话头部那颗计数本身的文字和点击照旧,官方按钮的朗读里已经含运行数,所以它对着屏幕阅读器是隐藏的。关掉这个开关,其他地方的红黄点、左上角数字、标签页图标与系统角标一个都不受影响。子代理自己的会话页不显示官方那行,这个黄圈自然也不会出现。",
			headerRingHintSummary: "只在有直接子代理在跑时,会话头部计数右上角叠一个黄圈。"
		};
		const en = {
			nav: "Favicon",
			current: "Current icon",
			none: "Using the platform default icon",
			upload: "Upload",
			uploadHint: "SVG, PNG or ICO, up to 10 MB. SVG is auto-rasterized to PNG, and sizes are derived to fit Android/iOS/tablet home-screen icons. Applies instantly and persists across reloads.",
			uploadHintSummary: "SVG, PNG or ICO up to 10 MB; applies at once and persists.",
			svgFail: "This SVG could not be rasterized. Use a PNG instead.",
			reset: "Reset",
			resetHint: "Clear the custom icon and use the platform default.",
			replace: "Replace",
			replacing: "Uploading…",
			resetting: "Resetting…",
			name: "Name",
			size: "Size",
			updated: "Updated",
			successUpload: "New icon applied",
			successReset: "Default icon restored",
			pwa: "Also replace the PWA app icon",
			pwaHint: "The icon used after installing the site as an app (add to home screen). Already-installed apps may need a reinstall to pick it up.",
			pwaHintSummary: "The icon after installing as an app; may need a reinstall.",
			successPwa: "PWA icon setting updated",
			logo: "Also replace the page logo mark",
			logoHint: "Replaces the whale mark beside the brand name in the top-left (the deepseek HARNESS text stays).",
			logoHintSummary: "Swaps the whale mark inside the top-left brand logo.",
			successLogo: "Page logo updated",
			fail: "Operation failed",
			noFile: "Choose a file first",
			hintMoreLabel: "Show full description",
			badgeTest: "Unread badge",
			badgeSourceLabel: "Number source:",
			badgeSourceReal: "Real unread",
			badgeSourceManual: "Manual",
			badgeTestUnit: "0 = hidden",
			badgeSizeLabel: "Badge size:",
			badgeSizeHint: "A number shown on its own uses this size; when the red and the yellow number share the icon (unread + running) they shrink together to the largest pair that fits — the three sizes then draw the same, because the canvas is the constraint.",
			badgeSizeHintSummary: "Used when alone; both numbers shrink together to fit.",
			badgeSizeSmall: "Small",
			badgeSizeMedium: "Medium",
			badgeSizeLarge: "Large",
			unreadReasonsLabel: "Count these as unread:",
			reasonCompleted: "Turn finished",
			reasonError: "Error",
			reasonBlocked: "Blocked",
			reasonMaxTokens: "Hit token cap",
			reasonInterrupted: "Interrupted",
			reasonAbortedUser: "I stopped it",
			reasonAbortedOther: "Other cancel",
			reasonPending: "Someone is waiting",
			unreadIncludeSubagentsLabel: "Count sub-agent activity as unread",
			unreadIncludeSubagentsHint: "When a background sub-agent finishes, the runtime **wakes its parent session for one more turn**; this decides whether that turn's ending lights the red dot. Off: endings caused by a sub-agent stop lighting it, while a turn you started still notifies you (a sub-agent has no session row of its own and never counted). On (default) = exactly the old behaviour. The judgement comes from the official settlement notice in the log (`subagent-settled` / `agent-message`), so whichever message opened a turn owns that turn; typing into the same session halfway through does not rewrite an attribution already recorded.",
			unreadIncludeSubagentsHintSummary: "Whether a sub-agent-woken turn counts as unread; on by default.",
			unreadPanelShort: "Pending",
			unreadPanelCount: "{n} pending",
			unreadPanelNone: "Nothing pending",
			unreadPanelTitle: "Sessions needing you",
			unreadPanelEmpty: "Nothing needs you right now",
			unreadWaiting: "waiting for you",
			unreadEnded: "ended, not seen yet",
			unreadPanelOther: "Other",
			unreadMarkAllRead: "Mark all read",
			/** The running list (opened by the yellow number): the very fact that number counts. */
			runningPanelTitle: "Sessions running",
			runningPanelEmpty: "Nothing is running right now",
			runningPanelTrigger: "{n} running — click for the list",
			runningPanelRow: "turn in flight",
			/** Same shape as the shipped sidebar ("13h"), so the two can be read side by side. */
			ageNow: "now",
			ageMinutes: "{n}min",
			ageHours: "{n}h",
			ageDays: "{n}d",
			ageMonths: "{n}mo",
			ageYears: "{n}y",
			workspaceDotLabel: "Dots on workspace and session rows (experimental)",
			workspaceDotHint: "Adds a small red dot to the folder icon of each workspace row (a collapsed workspace shows how many of its sessions are unread there), and one beside the title of every unread session row. A session dot is only drawn while that row is really rendered: folded sessions are represented by their workspace row's dot and the pending panel. This one reads the page structure, so a DSH upgrade may break it; when it does it simply stops showing, never affecting the counts, the list, or navigation. Turn it off any time.",
			workspaceDotHintSummary: "Small dots on workspace folders and session rows (experimental).",
			revealLabel: "Locate the session in the sidebar when a list row is clicked (experimental)",
			revealHint: "Clicking a row in the \"needing you\" or \"running\" list opens that session AND, in the sidebar, expands its workspace, scrolls to the row and flashes it once. This reads the page structure: the official sidebar keeps expand-and-scroll for its own search box and exposes no interface for it, so this drives the shipped workspace row and \"show more\" button the way a click would. A DSH upgrade may break it, and the only symptom is a sidebar that does not move — opening the session is never affected. **The expanded state is remembered by the official sidebar itself** (in the browser), so it will not collapse again on its own: collapse that workspace by hand, or turn this off.",
			revealHintSummary: "Expands and flashes the session's sidebar row (experimental).",
			appBadgeLabel: "Badge the system app icon",
			appBadgeHint: "Once installed as an app, the same number also goes to the system icon: a taskbar badge on Windows, a Dock badge on macOS, a number on the iOS home-screen icon. The system decides how it looks — on Windows, Chrome draws a dark circle with white text, while Edge goes through the Windows badge channel (whether it shows the number is up to Edge/Windows). The plugin re-asserts the number periodically, but only while the app window is open. Safari's Dock and home-screen web apps additionally need notifications allowed first (see the permission row below), or the badge never appears.",
			appBadgeHintSummary: "Puts the same number onto the system app icon.",
			appBadgeFootnote: "The badge is only updated by this plugin while the app window is open; above 99 the system shows 99+.",
			appBadgeProbeInstalled: "This environment: installed as an app, so this device can set a badge. Whether it actually appears is up to the system.",
			appBadgeProbeTab: "This environment: a browser tab (not an installed app) — install as an app to get a badge.",
			appBadgeProbeUnsupported: "This environment: no app-badge capability in this browser.",
			appBadgeProbeInsecure: "This environment: not a secure context (use localhost or https) — the system badge is unavailable.",
			notificationPermissionLabel: "Notifications permission:",
			notificationPermissionGranted: "granted",
			notificationPermissionDefault: "not granted",
			notificationPermissionDenied: "denied (enable it in the system notifications settings)",
			notificationPermissionUnsupported: "this browser has no Notification API",
			notificationPermissionButton: "Allow notifications",
			notificationPermissionHint: "A badge needs no notification permission on Chrome / Edge, but Safari is different: a macOS web app added to the Dock (or an iOS home-screen web app) only draws its badge once you allow notifications — Apple ties the two together. This only asks for the permission; the plugin does not send notifications.",
			notificationPermissionHintSummary: "Only Safari (iOS/macOS) needs notifications allowed first.",
			badgeTestHint: "Real unread = a session ended for one of the checked reasons and you have not looked at it yet (opening a session marks it read). The session you are viewing counts too — the window may be minimised or the page in the background, so this half cannot tell whether you are looking, and does not pretend to. Whether sub-agents count is decided by the \"Count sub-agent activity as unread\" switch above. Manual = type a number to preview. Resets to Real on reload.",
			badgeTestHintSummary: "Real unread = a checked ending you have not seen; sub-agents follow the switch above.",
			clearDelayLabel: "Mark read after staying:",
			clearDelayUnit: "seconds",
			clearDelayHint: "0 = read as soon as you enter (the dot clears at once). Above 0 you must stay in that session for this many seconds before it counts as read: leaving it resets the clock, and so does a reload. The clock only ever covers **the ending that was already there when you entered** — a turn that finishes while you are sitting in the session does not count: it stays red until you leave and come back. Capped at 600 seconds. A settings or plugins page, or a tab in the background, only **pauses** the clock — neither clears a dot (neither counts as leaving); the one thing that does count as leaving is **opening another session**. Read state lives on the Host ($DSH_HOME/custom-favicon/unread-seen.json): read on any device means read on every device, and the browser's own copy is only a cache — clearing site data no longer throws it away.",
			clearDelayHintSummary: "0 = read at once; above 0, stay that long (max 600s).",
			/** Running mark (0.18.0): a second projection of the official `running`. */
			runningMarkSection: "Running marks",
			runningMarkLabel: "Show running marks (header number / folder and session rows / top-left / tab)",
			runningMarkCount: "{n} running",
			runningMarkHint: "The yellow mark IS the official \"running\": the session has a turn in flight and is not parked waiting for you (while it waits, the official row shows the amber \"waiting for approval / waiting for answer\" and the yellow goes dark). It is completely independent of the unread red dot, and each draws its own mark: after the sidebar's \"工作区\" label sits the yellow NUMBER of sessions running right now (stacked against the red number — red top-right, yellow bottom-right); the workspace folder icon gets a yellow dot with the red dot to its left; a session row is red left, yellow right; and the top-left logo plus the bottom-right of the tab icon carry the same number, with the red number keeping its top-right corner. Every fact comes from the official host (each session's `running` in the session list); the plugin stores nothing and infers nothing, so a reload is immediately right and a process restart never leaves a yellow mark stuck on. Turning this off does not affect the red dot at all.",
			runningMarkHintSummary: "The yellow mark is the official running state, independent of red dots.",
			runningIncludeSubagentsLabel: "Count sub-agent activity under the session that owns it",
			runningIncludeSubagentsHint: "A sub-agent (child session) has no row of its own in the sidebar, so while it works the real session above it looks idle. Turn this on: when a sub-agent is running, the topmost non-sub-agent ancestor session is credited as running — the yellow mark and number then reflect \"work is in flight\", not merely \"a session you opened is running\". Several sub-agents under one ancestor count once (the number stays a session count, never a sub-agent count), and the sub-agent row itself is still never drawn. An ancestor that is itself parked waiting for you (the official row is amber) is not counted. Turn it off and the old behaviour returns exactly: every sub-agent is ignored.",
			runningIncludeSubagentsHintSummary: "Credits the topmost ancestor session while a sub-agent runs.",
			headerRingLabel: "Draw a yellow ring on the header's sub-agent count",
			headerRingHint: "The \"N sub-agents\" count at the top of the chat area gets a small yellow ring on its top-right corner: it appears only while **direct sub-agents are running**, and the number inside is how many of them are active right now — it never counts deeper grandchildren, and one direct sub-agent counts once; above 99 it reads `99+`. It is a number only: **it is not clickable**, it swallows no pointer events, and it never changes the layout; the header count keeps its own text and its own click, and because the official button's label already announces the running count the ring is hidden from screen readers. Turning this switch off leaves every other red/yellow mark, the top-left number, the tab icon and the system badge untouched. A sub-agent's own conversation renders none of that header row, so no ring appears there either.",
			headerRingHintSummary: "A yellow ring on the header count while direct sub-agents run."
		};
		//#endregion

		//#region helpers
		function bytesLabel(value) {
			if (value == null || value < 0) return "—";
			if (value < 1024) return `${value} B`;
			if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
			return `${(value / (1024 * 1024)).toFixed(1)} MB`;
		}
		function reason(resp, fallback) {
			if (resp && resp.ok === false && resp.error && resp.error.message) return resp.error.message;
			return fallback;
		}
		function fmtTime(ms) {
			if (ms == null) return "—";
			try {
				return new Date(ms).toLocaleString();
			} catch { return "—"; }
		}
		// Rasterize an SVG file to a 512x512 PNG data URL in the browser.
		// We do this on the client because (a) browsers rasterize SVG reliably,
		// and (b) the host's pure-JS Jimp cannot decode SVG. ICO is NOT handled
		// here — browsers do not reliably draw .ico into a canvas, so the host
		// extracts the embedded PNG instead. Returns a `data:image/png;base64,..`
		// string, or throws when the SVG cannot be rasterized.
		function svgToPng(file) {
			return new Promise((resolve, reject) => {
				const url = URL.createObjectURL(file);
				const img = new Image();
				img.onload = () => {
					try {
						const size = 512;
						const canvas = document.createElement("canvas");
						canvas.width = size;
						canvas.height = size;
						const ctx = canvas.getContext("2d");
						ctx.fillStyle = "#fff"; // opaque backdrop for iOS tiles
						ctx.fillRect(0, 0, size, size);
						const scale = Math.min(size / img.width, size / img.height);
						const w = img.width * scale, h = img.height * scale;
						ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
						resolve(canvas.toDataURL("image/png"));
					} catch (e) {
						reject(e);
					} finally {
						URL.revokeObjectURL(url);
					}
				};
				img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("svg-rasterize")); };
				img.src = url;
			});
		}
		//#endregion
		//#region logo bridge
		// In-package brand-mark bridge: the settings section pushes the current
		// logo state here; the sidebar brand-mark component subscribes to it.
		// Both live in this same module — no RPC loop, no cross-package events.
		const logoListeners = new Set();
		function emitLogo(value) {
			logoListeners.forEach((fn) => { try { fn(value); } catch {} });
		}
		function subscribeLogo(fn) {
			logoListeners.add(fn);
			return () => { logoListeners.delete(fn); };
		}
		function syncStatus(status) {
			const known = status !== null && typeof status === "object";
			emitLogo({
				enabled: known && status.active === true && status.logo === true,
				rev: known && status.rev ? status.rev : null,
				png: known && status.png === true
			});
			// The plugin's own status — not the served HTML — decides which icon the
			// page should show. A cached/proxied page, a stale HTML rewrite, or a
			// browser extension can all leave the wrong link behind; this makes the
			// client authoritative about the icon it composites onto.
			const previousHref = desiredIconHref();
			iconState = {
				active: known && status.active === true,
				rev: known && typeof status.rev === "string" && status.rev !== "" ? status.rev : null,
				png: known && status.png === true,
				mime: known && typeof status.mime === "string" ? status.mime : null
			};
			// A different base image must be rebuilt from the NEW artwork right now:
			// the ordinary reconcile is not enough, because a compose already in flight
			// would land carrying the old base and nothing would touch the icon again
			// until the next 5-second watchdog tick. Same move the settings page makes
			// after an upload (`refreshFaviconBase`).
			if (desiredIconHref() !== previousHref) refreshFaviconBase();
			else reconcileFavicon();
		}

		//#endregion
		//#region unread state
		// ---------------------------------------------------------------------
		// Unread badge: which endings count, and what this browser has seen.
		//
		// The host folds every session's last `turn/end` into an official session
		// projection (`lastTurnEnd`); it travels to the browser inside the ordinary
		// session list, so this half never asks the host per session. Two local
		// inputs finish the job:
		//   * the rule — which reasons light the badge. Persisted by the host,
		//     mirrored here so a toggle applies without a round trip;
		//   * the seen watermark — per browser, in localStorage, because "have I
		//     already looked at this session" is a fact about this browser.
		// ---------------------------------------------------------------------
		const LAST_TURN_END_KEY = "lastTurnEnd";
		/** Reason key → locale key, for the settings checkboxes. */
		const REASON_LABEL_KEYS = {
			completed: "reasonCompleted",
			error: "reasonError",
			blocked: "reasonBlocked",
			"max-tokens": "reasonMaxTokens",
			interrupted: "reasonInterrupted",
			"aborted:user": "reasonAbortedUser",
			"aborted:other": "reasonAbortedOther"
		};
		/** Mirror of the host defaults; only used before the first status arrives. */
		const UNREAD_FALLBACK_REASONS = { completed: true, error: true, blocked: true, "max-tokens": true, interrupted: true, "aborted:user": false, "aborted:other": true };
		/** Mirror of the host's cap (see lib/unread.js) — 10 minutes. */
		const UNREAD_CLEAR_DELAY_MAX_SEC = 600;
		/** Mirror of the host's default (see lib/unread.js) — badging the app icon is on. */
		const UNREAD_APP_BADGE_FALLBACK = true;
		/** Mirror of the host's default (see lib/unread.js) — locating a clicked row is on. */
		const UNREAD_REVEAL_FALLBACK = true;
		/** Mirror of the host's default (see lib/unread.js) — sub-agent-caused endings count as unread. */
		const UNREAD_INCLUDE_SUBAGENTS_FALLBACK = true;
		let unreadConfig = { reasons: { ...UNREAD_FALLBACK_REASONS }, pending: true, workspaceDot: true, appBadge: UNREAD_APP_BADGE_FALLBACK, clearDelaySec: 0, revealOnOpen: UNREAD_REVEAL_FALLBACK, unreadIncludeSubagents: UNREAD_INCLUDE_SUBAGENTS_FALLBACK };
		const unreadConfigListeners = new Set();
		/** Mirror of the host's normalizer: any input becomes an integer 0..cap seconds. */
		function normalizeClearDelay(input) {
			const value = typeof input === "string" && input.trim() !== "" ? Number(input) : input;
			if (typeof value !== "number" || !Number.isFinite(value)) return 0;
			const seconds = Math.floor(value);
			if (seconds <= 0) return 0;
			return Math.min(seconds, UNREAD_CLEAR_DELAY_MAX_SEC);
		}
		function normalizeUnreadConfig(input) {
			const source = input !== null && typeof input === "object" ? input : {};
			const raw = source.reasons !== null && typeof source.reasons === "object" ? source.reasons : {};
			const reasons = {};
			for (const key of Object.keys(UNREAD_FALLBACK_REASONS)) {
				reasons[key] = typeof raw[key] === "boolean" ? raw[key] : UNREAD_FALLBACK_REASONS[key];
			}
			return {
				reasons,
				pending: typeof source.pending === "boolean" ? source.pending : true,
				workspaceDot: typeof source.workspaceDot === "boolean" ? source.workspaceDot : true,
				appBadge: typeof source.appBadge === "boolean" ? source.appBadge : UNREAD_APP_BADGE_FALLBACK,
				clearDelaySec: normalizeClearDelay(source.clearDelaySec),
				revealOnOpen: typeof source.revealOnOpen === "boolean" ? source.revealOnOpen : UNREAD_REVEAL_FALLBACK,
				// Missing or dirty falls back to ON (= today's behaviour): an old host that
				// never heard of this field must not make the badge quieter. Spelled as a
				// literal like `pending` / `workspaceDot` above, so a partial slice of this
				// normalizer (the tests take exactly this function) needs no extra constant.
				unreadIncludeSubagents: typeof source.unreadIncludeSubagents === "boolean" ? source.unreadIncludeSubagents : true
			};
		}
		function emitUnreadConfig(input) {
			unreadConfig = normalizeUnreadConfig(input);
			unreadConfigListeners.forEach((fn) => { try { fn(unreadConfig); } catch {} });
			// The rule (or just the app-badge switch) moved: the OS badge follows it
			// in the same breath, so toggling it applies without a reload.
			reconcileAppBadge();
		}
		function subscribeUnreadConfig(fn) {
			unreadConfigListeners.add(fn);
			return () => { unreadConfigListeners.delete(fn); };
		}

		/**
		 * The running mark's own switch, and the yellow it paints with.
		 *
		 * Deliberately NOT a field on the unread rule: the two features answer
		 * different questions ("something ended and you have not looked" vs
		 * "something is running right now"), so neither switch may drag the other's
		 * storage or response shape along. The yellow is a literal like the red
		 * `#e5484d` already is — the theme has no yellow token, and the official
		 * amber `--dsw-alias-state-warn-primary` (#f59e0b) is taken by the row's
		 * "waiting for you" dot, which must stay tellable apart from this one.
		 */
		const RUNNING_YELLOW = "#f5c518";
		/** Mirror of the host default (lib/running.js). */
		const RUNNING_MARK_FALLBACK = true;
		/**
		 * Mirror of the host's second running default (lib/running.js): rolling a
		 * running sub-agent up to the ancestor session that owns it is ON. The two
		 * questions are independent — whether to draw the marks at all is not the same
		 * as whether work you cannot see should light the session it belongs to.
		 */
		const RUNNING_INCLUDE_SUBAGENTS_FALLBACK = true;
		/**
		 * Mirror of the host's third running default (lib/running.js): the yellow ring
		 * on the conversation header's sub-agent count is ON. A third, independent
		 * question — the two above decide whether marks are drawn at all and whether a
		 * sub-agent's work is credited to its ancestor; this one only decides whether
		 * that one header count also carries a running number. It feeds no other count.
		 */
		const RUNNING_HEADER_RING_FALLBACK = true;
		let runningConfig = { enabled: RUNNING_MARK_FALLBACK, includeSubagents: RUNNING_INCLUDE_SUBAGENTS_FALLBACK, headerRing: RUNNING_HEADER_RING_FALLBACK };
		const runningConfigListeners = new Set();
		function normalizeRunningConfig(input) {
			const source = input !== null && typeof input === "object" ? input : {};
			// `typeof` (not a bare read) keeps this normalizer usable when a regression
			// test lifts it out of the module: an absent mirror is simply the default.
			const enabledFallback = typeof RUNNING_MARK_FALLBACK === "boolean" ? RUNNING_MARK_FALLBACK : true;
			const includeFallback = typeof RUNNING_INCLUDE_SUBAGENTS_FALLBACK === "boolean" ? RUNNING_INCLUDE_SUBAGENTS_FALLBACK : true;
			const headerRingFallback = typeof RUNNING_HEADER_RING_FALLBACK === "boolean" ? RUNNING_HEADER_RING_FALLBACK : true;
			return {
				enabled: typeof source.enabled === "boolean" ? source.enabled : enabledFallback,
				includeSubagents: typeof source.includeSubagents === "boolean" ? source.includeSubagents : includeFallback,
				headerRing: typeof source.headerRing === "boolean" ? source.headerRing : headerRingFallback
			};
		}
		function emitRunningConfig(input) {
			runningConfig = normalizeRunningConfig(input);
			runningConfigListeners.forEach((fn) => { try { fn(runningConfig); } catch {} });
		}
		function subscribeRunningConfig(fn) {
			runningConfigListeners.add(fn);
			return () => { runningConfigListeners.delete(fn); };
		}

		/**
		 * The seen watermark: the HOST owns it, this browser keeps the working copy.
		 *
		 * A turn end arrives stamped with the Host's `turn/end.time`; a mark written
		 * from the browser's `Date.now()` only lines up while both clocks agree. A
		 * browser a few seconds behind the Host therefore wrote marks that never
		 * reached `endAt`, so the dot could not be cleared by entering the session at
		 * all — the one failure users report as "点进去也不消". Marks now store the
		 * `endAt` they acknowledge, and `lastActiveAt` stores a host-domain time, so
		 * every comparison in `collectUnread` stays inside one clock.
		 *
		 * Since 0.11.2 the authoritative table lives in the Host
		 * (`~/.dsh/custom-favicon/unread-seen.json`, merged max-per-session). This
		 * copy is what the badge reads — so the page never waits for a round trip and
		 * keeps working offline — and doubles as the pending queue: every local mark
		 * is pushed back on the next sync, and a merge can only move marks forward.
		 * That is what makes "looked at it" survive a cleared browser profile and mean
		 * the same thing on every device.
		 */
		const SEEN_STORE_KEY = "dsh-icon-custom.unread-seen.v2";
		/** 0.10.1 and earlier wrote browser timestamps here; migrated once. */
		const LEGACY_SEEN_STORE_KEY = "dsh-icon-custom.unread-seen.v1";
		/** Mirror of the Host's cap (see lib/unread.js). */
		const SEEN_MAX = 400;
		/** Coalescing window for watermark pushes: one small RPC per burst, not per session. */
		const HOST_SYNC_DEBOUNCE_MS = 2000;
		/** Retry gap after a failed push (offline, or a Host without the endpoint). */
		const HOST_SYNC_RETRY_MS = 30000;
		/** Ceiling for that retry gap: an old Host must not be probed forever every 20 s. */
		const HOST_SYNC_MAX_RETRY_MS = 300000;
		/** Host clock minus browser clock, from the last Host sample; null until known. */
		let hostClockOffset = null;
		/** This browser's clock expressed in the Host's domain (best effort). */
		function hostNow() {
			return Date.now() + (hostClockOffset === null ? 0 : hostClockOffset);
		}
		function loadSeenState() {
			try {
				const raw = JSON.parse(window.localStorage.getItem(SEEN_STORE_KEY) || "null");
				if (raw !== null && typeof raw === "object" && raw.domain === "host") {
					const seen = raw.seen !== null && typeof raw.seen === "object" ? raw.seen : {};
					return { domain: "host", lastActiveAt: typeof raw.lastActiveAt === "number" ? raw.lastActiveAt : 0, seen };
				}
				const legacy = JSON.parse(window.localStorage.getItem(LEGACY_SEEN_STORE_KEY) || "null");
				if (legacy !== null && typeof legacy === "object") {
					const seen = legacy.seen !== null && typeof legacy.seen === "object" ? legacy.seen : {};
					return { domain: "browser", lastActiveAt: typeof legacy.lastActiveAt === "number" ? legacy.lastActiveAt : 0, seen };
				}
			} catch { /* fall through to an empty store */ }
			return { domain: "host", lastActiveAt: 0, seen: {} };
		}
		const seenState = loadSeenState();
		/** When this browser last had the app open before this page load (host domain). */
		const seenBootAt = seenState.lastActiveAt > 0 ? seenState.lastActiveAt : 0;
		/** The connection RPC, once `apply` has one; null keeps every push a no-op. */
		let seenRpc = null;
		/** Whether this page load has already converged with the Host once. */
		let hostSyncedOnce = false;
		/** Whether local marks changed since the last successful push. */
		let hostDirty = false;
		let hostSyncTimer = 0;
		let hostRetryTimer = 0;
		let hostSyncInFlight = false;
		/** Escalating gap between failed pushes; any success resets it. */
		let hostRetryDelay = HOST_SYNC_RETRY_MS;
		/** No push is attempted before this moment (the backoff window). */
		let hostBackoffUntil = 0;
		/** Whether the current failure streak has been reported (warn once per streak). */
		let hostSyncWarned = false;
		/**
		 * Push the local table soon, unless there is nothing to say.
		 *
		 * Called from `saveSeenState`, which is also the 20-second "this browser is
		 * still here" touch: that touch must NOT count as a change, or the table would
		 * travel every 20 seconds. `hostSyncedOnce` covers the first push of a page
		 * load, which is also the migration (local-only marks going up) and the
		 * self-heal (a lost Host file coming back from this browser).
		 * @param delayMs - override the coalescing window; non-positive uses the default.
		 */
		function scheduleHostSync(delayMs) {
			if (seenRpc === null || hostSyncInFlight) return;
			if (!hostDirty && hostSyncedOnce) return;
			if (hostSyncTimer !== 0) return;
			// A failed push escalates its own retry; the 20-second touch must not keep
			// poking a Host that has no such endpoint (an older DSH, or offline).
			if (Date.now() < hostBackoffUntil) return;
			const wait = typeof delayMs === "number" && delayMs > 0 ? delayMs : HOST_SYNC_DEBOUNCE_MS;
			hostSyncTimer = window.setTimeout(() => { hostSyncTimer = 0; flushHostSeen(); }, wait);
		}
		/**
		 * Adopt the Host's table: per session the NEWER of the two wins.
		 *
		 * Max-merge (never overwrite) is what makes both directions safe: the Host file
		 * lost or truncated → this browser's copy wins; this browser's localStorage
		 * cleared → the Host's copy wins. It is also the whole migration path.
		 * @param seen - the Host's table (`id → endAt`), or anything.
		 * @returns whether the local table gained anything.
		 */
		function adoptHostSeen(seen) {
			if (seen === null || typeof seen !== "object") return false;
			let gained = false;
			for (const id of Object.keys(seen)) {
				if (typeof id !== "string" || id === "") continue;
				const at = seen[id];
				if (typeof at !== "number" || !Number.isFinite(at) || at <= 0) continue;
				const previous = seenState.seen[id];
				if (typeof previous === "number" && previous >= at) continue;
				seenState.seen[id] = at;
				gained = true;
			}
			return gained;
		}
		/**
		 * Send the whole local table and adopt the merged answer.
		 *
		 * Whole-table, not a delta: the payload is a few KB, the Host merges by max (so
		 * a duplicate or partial round trip is harmless), and any lost message heals on
		 * the next one. A failure keeps the marks here — they are already in
		 * localStorage and the badge reads them — and retries later.
		 */
		function flushHostSeen() {
			if (seenRpc === null || hostSyncInFlight) return;
			if (!hostDirty && hostSyncedOnce) return;
			hostSyncInFlight = true;
			const marks = { ...seenState.seen };
			let pending;
			try {
				// Args are nested under the descriptor's parameter name ("request"), which
				// is what the gateway checks: a flat `{ marks }` is rejected with
				// `gateway/arguments-invalid` before the method ever runs.
				pending = seenRpc.call("/api", "iconCustom/setUnreadSeen", { args: { request: { marks } } });
			} catch (error) {
				// A carrier that throws synchronously must not wedge the in-flight guard:
				// that would stop every later push for the life of the page, silently.
				hostSyncInFlight = false;
				noteHostSyncFailure(error);
				return;
			}
			Promise.resolve(pending).then(
				(resp) => {
					hostSyncInFlight = false;
					if (resp === null || typeof resp !== "object" || resp.ok !== true) {
						const reason = resp !== null && typeof resp === "object" && resp.error !== undefined ? JSON.stringify(resp.error) : "resp.ok !== true";
						noteHostSyncFailure(new Error("setUnreadSeen 被拒绝: " + reason));
						return;
					}
					const value = resp.value !== null && typeof resp.value === "object" ? resp.value : {};
					const gained = adoptHostSeen(value.seen);
					hostSyncedOnce = true;
					hostRetryDelay = HOST_SYNC_RETRY_MS;
					hostBackoffUntil = 0;
					hostSyncWarned = false;
					// The Host knew marks this browser did not: keep them and push the union
					// once more. The next answer cannot gain anything, so this terminates.
					// Repaint too: the badge, the row dots and the panel all read this
					// browser's copy, and nothing else would re-render for a mark that
					// arrived over the wire.
					hostDirty = gained;
					if (gained) { saveSeenState(); emitUnreadPoke(); scheduleHostSync(); }
				},
				(error) => { hostSyncInFlight = false; noteHostSyncFailure(error); }
			);
		}
		/**
		 * One failed push: report it once per streak, then back off and try again later.
		 *
		 * Reported (not swallowed) because a watermark that cannot reach the Host is a
		 * silent, confusing failure — "为什么另一台设备还亮着" — and there is nothing on
		 * screen to explain it. The badge itself keeps working from the local copy, so
		 * this must never look fatal, and it warns once rather than on every retry.
		 * @param error - whatever the carrier rejected with.
		 */
		function noteHostSyncFailure(error) {
			if (!hostSyncWarned) {
				hostSyncWarned = true;
				try { console.warn("dsh-icon-custom: 已读水位线同步到宿主失败(红点仍照常工作,会自动重试):", (error && error.message) || error); } catch {}
			}
			const wait = hostRetryDelay;
			hostRetryDelay = Math.min(hostRetryDelay * 2, HOST_SYNC_MAX_RETRY_MS);
			hostBackoffUntil = Date.now() + wait;
			if (hostRetryTimer !== 0) window.clearTimeout(hostRetryTimer);
			hostRetryTimer = window.setTimeout(() => { hostRetryTimer = 0; flushHostSeen(); }, wait);
		}
		function saveSeenState() {
			try {
				window.localStorage.setItem(SEEN_STORE_KEY, JSON.stringify({ domain: "host", lastActiveAt: seenState.lastActiveAt, seen: seenState.seen }));
			} catch {}
			scheduleHostSync();
		}
		/**
		 * Learn the Host↔browser clock offset from a Host timestamp, and fold a
		 * legacy browser-domain store into the host domain. Idempotent: the fold
		 * happens once, on the first sample that carries a usable `hostNow`.
		 * @param hostAt - the Host's `Date.now()`, or anything else (ignored).
		 */
		function noteHostClock(hostAt) {
			if (typeof hostAt !== "number" || !Number.isFinite(hostAt) || hostAt <= 0) return;
			const offset = hostAt - Date.now();
			hostClockOffset = offset;
			if (seenState.domain === "host") return;
			seenState.domain = "host";
			if (seenState.lastActiveAt > 0) seenState.lastActiveAt += offset;
			for (const id of Object.keys(seenState.seen)) {
				if (typeof seenState.seen[id] === "number") seenState.seen[id] += offset;
			}
			saveSeenState();
		}
		function pruneSeenState() {
			const ids = Object.keys(seenState.seen);
			if (ids.length <= SEEN_MAX) return;
			ids.sort((a, b) => seenState.seen[b] - seenState.seen[a]);
			for (const id of ids.slice(SEEN_MAX)) delete seenState.seen[id];
		}
		/**
		 * Record that this browser has seen a session up to `seenAt` — the
		 * host-domain `endAt` being acknowledged. Marks never move backwards, so a
		 * late attempt cannot undo a newer one.
		 * @param sessionId - the session that was looked at.
		 * @param seenAt - host-domain watermark to store; defaults to the Host's now.
		 * @returns whether the mark actually advanced.
		 */
		function noteSeen(sessionId, seenAt) {
			if (typeof sessionId !== "string" || sessionId === "") return false;
			const mark = typeof seenAt === "number" && Number.isFinite(seenAt) ? seenAt : hostNow();
			const previous = seenState.seen[sessionId];
			if (typeof previous === "number" && previous >= mark) return false;
			seenState.seen[sessionId] = mark;
			// Only a REAL mark counts as a change: the 20-second "still here" touch also
			// lands in `saveSeenState`, and it must not drag the whole table to the Host.
			hostDirty = true;
			return true;
		}
		/**
		 * First sight of a session is watermarked at the last time this browser was
		 * here — so an ending that happened while the app was closed still counts as
		 * unread, while endings from before the plugin was installed do not.
		 *
		 * Unchanged by the move to a Host-owned table: a session nobody has a mark for
		 * still needs a starting value, and "the last time this browser was here" is
		 * the honest one. A mark dropped by the Host's pruning simply re-baselines here
		 * on the next load, which is why pruning cannot resurrect old dots.
		 * @returns whether anything was learned (callers persist only then).
		 */
		function ensureSeenBaseline(ids) {
			const fallback = seenBootAt > 0 ? seenBootAt : hostNow();
			let changed = false;
			for (const id of ids) {
				if (typeof id !== "string" || id === "") continue;
				if (typeof seenState.seen[id] === "number") continue;
				seenState.seen[id] = fallback;
				changed = true;
			}
			return changed;
		}
		/**
		 * Whether this page is on screen at all.
		 *
		 * A hidden tab is not "being looked at": the clock must not run while the page
		 * is in the background, or a session left open in another tab would be marked
		 * read for every device. Unknown (an exotic embedder) counts as visible, which
		 * is the pre-0.12.1 behaviour.
		 * @returns whether the page is visible.
		 */
		function documentVisible() {
			try { return document.visibilityState !== "hidden"; } catch { return true; }
		}
		/**
		 * The official "Session on screen" answer, when this build exposes it.
		 *
		 * `ctx.uiSession.adapter.current` is the very binding the renderer derives
		 * `[data-conversation-session]` from, so it answers with the same value without
		 * the DOM's first-match ambiguity (see `conversationOnScreen`) — and it keeps
		 * answering while a global panel has unmounted the conversation, where the DOM
		 * has nothing to say. Filled in by `apply`, where a client context exists;
		 * until then it answers nothing, which is exactly what the other fallbacks are
		 * for.
		 * @returns the session id, or undefined when this build does not say.
		 */
		let officialSessionId = () => undefined;
		/**
		 * What the conversation on screen is rendering, in two parts.
		 *
		 * `rendered` says whether the main conversation is on screen at all, and `id` is
		 * the session it renders (`undefined` while none is selected — the landing view).
		 * The distinction matters: "the conversation is showing no session" is an answer
		 * ("you are not in a session"), while "there is no conversation element" is not
		 * an answer at all (a global panel replaced it, the page is still booting).
		 *
		 * TWO occurrences can carry this attribute: the main conversation, and the
		 * embedded one the right sidebar keeps MOUNTED while collapsed (hidden by CSS and
		 * `inert`). A plain `querySelector` returns the first in document order, so the
		 * moment the main occurrence carries no attribute — no session selected, the
		 * archive/close path — the hidden one becomes the answer: "you are looking at
		 * that subagent conversation". The stay clock reads that as "you left this
		 * session", drops the entered-at snapshot, and the ending that arrived meanwhile
		 * is acknowledged the moment you come back: a dot that goes out without you ever
		 * leaving. Only an occurrence the user can actually see is an answer.
		 * @returns `{ rendered, id }`.
		 */
		function conversationOnScreen() {
			try {
				const nodes = document.querySelectorAll("[data-conversation-session]");
				let rendered = false;
				for (const node of nodes) {
					if (typeof node.closest === "function" && (node.closest("[data-sidebar-right-panel]") !== null || node.closest("[inert]") !== null)) continue;
					rendered = true;
					const id = node.getAttribute("data-conversation-session");
					if (typeof id === "string" && id !== "") return { rendered: true, id };
				}
				return { rendered, id: undefined };
			} catch { return { rendered: false, id: undefined }; }
		}
		/**
		 * The session whose conversation the page is rendering right now, from the DOM.
		 *
		 * This is the only signal that names the session on screen, and it is the one
		 * that keeps a stale retention from clearing a dot: `retainedBy.mainView` means
		 * "recently opened, not yet released", not "displayed". `undefined` means the page
		 * does not name one (see `conversationOnScreen`) and callers must fall back to the
		 * other answers rather than treat it as "nothing is displayed".
		 * @returns the session id, or undefined when the page cannot say.
		 */
		function displayedSessionId() {
			return conversationOnScreen().id;
		}
		/**
		 * The session this page is ON — the set that defines "entered" and "left" — plus
		 * whether the answer is actually known.
		 *
		 * Only a change here counts as leaving a session, so this must NOT be emptied by
		 * pausing: a background tab, or a global panel (settings, plugins, …) that covers
		 * the conversation, keeps you on the same session. Emptying it would drop the
		 * entered-at snapshot, and taking a fresh one on return is exactly what
		 * acknowledges an ending you never left the session for.
		 *
		 * The answers, in order:
		 *   * the visible conversation's own session (the precise one, and the only one
		 *     that may overrule retention);
		 *   * the official "Session on screen" binding (`view.official`, from
		 *     `ctx.uiSession`) — the very value the attribute above is rendered from, so
		 *     it still answers while a global panel has unmounted the conversation;
		 *   * `list.current`, when a build carries it;
		 *   * retention (`retainedBy.mainView > 0`), the pre-0.12 answer.
		 *
		 * `known: false` is the important one: it means the page could not name ANY
		 * session, which is NOT the same as "no session is being viewed". Callers must
		 * keep the snapshots they already have instead of reading it as a leave — a
		 * single such frame used to be enough to acknowledge an ending you were sitting
		 * in front of.
		 * @param list - the session list snapshot (may be absent).
		 * @param view - `{ displayed, official }`: what the page says about the screen.
		 * @returns `{ ids, known }`; `ids` in list order, `[]` when there are none.
		 */
		function viewedSessions(list, view) {
			const screen = view !== null && typeof view === "object" ? view : {};
			if (typeof screen.displayed === "string" && screen.displayed !== "") return { ids: [screen.displayed], known: true };
			if (typeof screen.official === "string" && screen.official !== "") return { ids: [screen.official], known: true };
			if (screen.idle === true) return { ids: [], known: true }; // the conversation is up, showing no session
			if (list === null || typeof list !== "object") return { ids: [], known: false };
			if (typeof list.current === "string" && list.current !== "") return { ids: [list.current], known: true };
			const byId = list.byId;
			if (byId === null || typeof byId !== "object") return { ids: [], known: false };
			const ids = [];
			for (const session of Object.values(byId)) {
				if (session === null || typeof session !== "object") continue;
				const retainedBy = session.retainedBy;
				const count = retainedBy !== null && typeof retainedBy === "object" ? retainedBy.mainView : undefined;
				if (typeof count === "number" && count > 0 && typeof session.id === "string" && session.id !== "") ids.push(session.id);
			}
			// Retention with nothing in it, and the conversation not on screen either, is
			// exactly the frame this must not read as a leave: it is what a global panel
			// over a released session, a boot, or a DOM gap looks like. The landing view
			// (`idle`) is the positive "you are on no session" answer, not this.
			return { ids, known: ids.length > 0 };
		}
		/**
		 * One session's last `turn/end` timestamp (host domain), or 0 when it has
		 * none. The projection is what the Host folded; an unknown reason still
		 * carries the time.
		 * @param entry - the session-list row (may be absent).
		 * @returns the epoch milliseconds, or 0.
		 */
		function lastTurnEndAt(entry) {
			const values = entry !== null && typeof entry === "object" ? entry.projectionValues : undefined;
			const value = values !== null && typeof values === "object" ? values[LAST_TURN_END_KEY] : undefined;
			return value !== null && typeof value === "object" && typeof value.endAt === "number" ? value.endAt : 0;
		}
		/**
		 * Which workspace a session is shown under: the basename of its cwd.
		 *
		 * The sidebar's own workspace rows are labelled with this basename, so a list
		 * points at the same place the reader sees — the sidebar group cannot be
		 * expanded for us (that state is private to the shipped browser), so naming
		 * it is the honest substitute. Shared by the pending list and the running
		 * list: two lists of the same sessions must not disagree about where they are.
		 * @param entry - the session-list row (may be absent).
		 * @returns the basename, or "" when the row carries no cwd.
		 */
		function sessionWhereOf(entry) {
			const cwd = entry !== null && typeof entry === "object" && typeof entry.cwd === "string" ? entry.cwd : "";
			if (cwd === "") return "";
			const parts = cwd.replace(/[\\/]+$/, "").split(/[\\/]/);
			return parts[parts.length - 1] || cwd;
		}
		/**
		 * How many sessions deserve the badge right now: endings whose reason is
		 * enabled and that this browser has not seen since, plus sessions waiting
		 * for you (when that source is enabled). Sub-agent sessions never count on
		 * their own; whether an ending caused by a sub-agent's settlement counts is
		 * decided by the `unreadIncludeSubagents` rule, not by this function.
		 *
		 * A PARENT session woken by a sub-agent settling is a second kind of
		 * sub-agent-caused unread: the child has no row of its own, but its
		 * settlement notice makes the parent run a turn, and that turn's ending used
		 * to light the parent's dot. The fold marks those endings
		 * (`subagentCaused`, see lib/unread.js) instead of hiding them, and this
		 * function drops them only while the rule says so — the fact stays in the
		 * projection either way, so flipping the switch never re-folds a log.
		 *
		 * The session you are LOOKING AT counts too. It used to be excluded, on the
		 * theory that "you have it open, so you have seen it" — but that premise is
		 * not knowable from here: the window may be minimised, the tab may be in the
		 * background, the page may be on another desktop. The browser half cannot
		 * tell "watching" from "left open", and a rule that cannot tell two cases
		 * apart should not pretend to: a session counts from the moment it ends until
		 * it is opened again. Leaving and re-entering it is what clears the entry.
		 * @param list - the session list snapshot (may be absent).
		 * @param pending - the pending-interaction map (may be absent).
		 * @param config - the unread rule to apply.
		 * @param lit - the ids currently showing a dot, so a change of ENDING KIND cannot
		 *   put an already lit dot out (see below). Optional.
		 * @returns the badge number.
		 */
		function collectUnread(list, pending, config, seen, lit) {
			const reasons = config !== null && typeof config === "object" && config.reasons !== null && typeof config.reasons === "object" ? config.reasons : {};
			// Absent, dirty or an old host's answer → ON (= everything this function
			// did before the switch existed).
			const includeSubagents = !(config !== null && typeof config === "object" && config.unreadIncludeSubagents === false);
			// The watermark is a parameter, not module state: this stays a pure
			// decision function that a test can drive with any marks it likes.
			const marks = seen !== null && typeof seen === "object" ? seen : {};
			const litIds = lit !== null && lit !== undefined && typeof lit.has === "function" ? lit : null;
			/** { id, title, waiting, kind, at } — newest first, "in wait" ahead of "ended". */
			const hits = [];
			const ids = new Set();
			const byId = list !== null && typeof list === "object" && list.byId !== null && typeof list.byId === "object" ? list.byId : {};
			const titleOf = (id, entry) => (entry !== null && typeof entry === "object" && typeof entry.displayTitle === "string" && entry.displayTitle !== "" ? entry.displayTitle : id);
			if (list !== null && typeof list === "object") {
				const order = Array.isArray(list.ids) ? list.ids : Object.keys(byId);
				for (const id of order) {
					const entry = byId[id];
					if (entry === null || typeof entry !== "object") continue;
					if (entry.origin === "subagent") continue;
					const values = entry.projectionValues;
					const value = values !== null && typeof values === "object" ? values[LAST_TURN_END_KEY] : undefined;
					if (value === null || typeof value !== "object") continue;
					// The switch is OFF: an ending the fold attributed to a sub-agent
					// settling is not news for the person sitting here. This is NOT the
					// reason-toggle exception below — that one protects an already lit dot
					// from a vocabulary change, while this one is the user explicitly
					// saying they do not want this class of news at all.
					if (!includeSubagents && value.subagentCaused === true) continue;
					const endAt = typeof value.endAt === "number" ? value.endAt : 0;
					// No watermark is the NORMAL first sight of a session: `ensureSeenBaseline`
					// writes one from an effect AFTER this render, so skipping the row here
					// would report 0 on the one frame the user actually sees — and the page
					// would keep that 0 for its whole life (the baseline write pushed no
					// re-render, so nothing recomputed it).
					// Fall back to EXACTLY the value that effect writes — this browser's last
					// time here (`seenBootAt`), or the Host's now when it has none — so the
					// first frame and the write agree and the number cannot flicker.
					// Guarded with `typeof` so a regression test may lift this function out
					// of the module: an absent mirror simply means "no baseline".
					const seenAt = typeof marks[id] === "number"
						? marks[id]
						: (typeof seenBootAt === "number" && seenBootAt > 0 ? seenBootAt : (typeof hostNow === "function" ? hostNow() : Date.now()));
					if (endAt <= 0 || endAt <= seenAt) continue;
					// Unknown reasons (a newer DSH adds one) stay hidden until the user
					// turns them on, so a vocabulary growth can never surprise the badge.
					// A reason the user turned OFF behaves the same way — with ONE
					// exception: it must never put out a dot that is already lit. That dot
					// stands for an ending nobody has read yet, and "the newest turn ended
					// in a way I do not want to be told about" is not "I read it". Only the
					// watermark clears a lit dot.
					if (reasons[value.reason] !== true && !(litIds !== null && litIds.has(id))) continue;
					ids.add(id);
					hits.push({ id, title: titleOf(id, entry), where: sessionWhereOf(entry), waiting: false, kind: value.reason, at: endAt });
				}
			}
			if (config === null || typeof config !== "object" || config.pending !== false) {
				if (pending !== null && pending !== undefined && typeof pending.forEach === "function") {
					pending.forEach((value, id) => {
						const kind = value !== null && typeof value === "object" && typeof value.kind === "string" ? value.kind : "";
						if (ids.has(id)) {
							// Already unread by its last turn: it is waiting too, which wins.
							const hit = hits.find((candidate) => candidate.id === id);
							if (hit !== undefined) { hit.waiting = true; hit.kind = kind; }
							return;
						}
						ids.add(id);
						hits.push({ id, title: titleOf(id, byId[id]), where: sessionWhereOf(byId[id]), waiting: true, kind, at: Date.now() });
					});
				}
			}
			hits.sort((a, b) => (b.waiting === true ? 1 : 0) - (a.waiting === true ? 1 : 0) || b.at - a.at);
			return hits;
		}

		//#endregion
		//#region running state
		// The "who is running right now" fact is entirely OFFICIAL and entirely
		// free: the browser's session list already carries each session's
		// `running` (host `ctx.agents.get(id)?.status === 'running'`, pushed by
		// `api-session/status`), and the official session row already draws its own
		// grey spinner from it. This plugin adds no host plumbing, no projection
		// and no storage — it only projects the same fact as a YELLOW mark in four
		// places. See docs/adr/0010-running-mark-is-a-second-projection.md.
		/**
		 * The sessions that are running right now.
		 *
		 * Two official facts are combined, in the shipped sidebar's own precedence:
		 *   * running — `status.get(id)?.running`, falling back to the row's own
		 *     `running` exactly like ui-workspace's `sessionNode` does;
		 *   * waiting — a `pendingInteraction` makes the official row show the amber
		 *     "waiting for approval / answer / plan review" instead of the spinner,
		 *     so it is NOT running here either. That is why a session with the
		 *     amber dot never also gets a yellow one.
		 *
		 * Sub-agent sessions get no ids of their own for the same reason
		 * `collectUnread` skips them: they are not part of the browsing the user does
		 * (ui-workspace's `sessionVisible` hides them outright), so a mark on their row
		 * would point at work nobody can open. With `includeSubagents` on (the
		 * default), a running sub-agent still credits the topmost non-sub-agent
		 * ancestor session that owns it, walking `parentSessionId` upwards: that is the
		 * session the user actually opened, and without the roll-up it looks idle while
		 * its sub-agents work. Several sub-agents under one ancestor collapse into that
		 * single id, so the number stays a count of sessions. The ancestor's own
		 * `pendingInteraction` still wins, switch or no switch: a session parked
		 * waiting for you is never also "running".
		 * @param list - the session list snapshot (may be absent).
		 * @param status - the official session-status map (may be absent).
		 * @param includeSubagents - optional override for the switch; absent means "ask the live config", whose documented default is ON.
		 * @returns the running session ids, in list order.
		 */
		function runningSessionIds(list, status) {
			const out = [];
			if (list === null || typeof list !== "object") return out;
			const byId = list.byId !== null && typeof list.byId === "object" ? list.byId : {};
			const order = Array.isArray(list.ids) ? list.ids : Object.keys(byId);
			const lookup = status !== null && status !== undefined && typeof status.get === "function"
				? (id) => status.get(id)
				: () => undefined;
			// The roll-up switch. A third argument wins (the regression tests drive it
			// that way); otherwise the live config answers, and a copy lifted out of the
			// module with no config in scope is the documented default: ON.
			const includeSubagents = arguments.length > 2
				? arguments[2] !== false
				: !(typeof runningConfig === "object" && runningConfig !== null && runningConfig.includeSubagents === false);
			/** Is this row parked waiting for the user (the amber state)? */
			const waitingForYou = (id) => {
				const row = lookup(id);
				return row !== null && typeof row === "object" && row.pendingInteraction !== null && row.pendingInteraction !== undefined;
			};
			/** The official running fact for a row, sidebar precedence, minus the wait state. */
			const isRunning = (id) => {
				if (waitingForYou(id)) return false;
				const row = lookup(id);
				const known = row !== null && typeof row === "object";
				const entry = byId[id];
				const running = known && typeof row.running === "boolean"
					? row.running
					: entry !== null && typeof entry === "object" ? entry.running : undefined;
				return running === true;
			};
			/**
			 * Up the `parentSessionId` chain to the topmost ancestor that is not itself a
			 * sub-agent. A broken, cyclic or unknown chain yields "" (unattributable):
			 * guessing an owner would light a session that has nothing to do with the
			 * sub-agent.
			 */
			const ownerOf = (id) => {
				let current = id;
				const walked = new Set([id]);
				for (let hops = 0; hops < 64; hops++) {
					const entry = byId[current];
					const parent = entry !== null && typeof entry === "object" && typeof entry.parentSessionId === "string" ? entry.parentSessionId : "";
					if (parent === "" || walked.has(parent)) return "";
					walked.add(parent);
					const next = byId[parent];
					if (next !== null && typeof next === "object" && next.origin === "subagent") {
						current = parent;
						continue;
					}
					if (next === null || typeof next !== "object") return "";
					return parent;
				}
				return "";
			};
			/** Ancestors are deduplicated: two sub-agents under one parent are one session. */
			const push = (id) => { if (!out.includes(id)) out.push(id); };
			for (const id of order) {
				if (typeof id !== "string" || id === "") continue;
				const entry = byId[id];
				if (entry === null || typeof entry !== "object") continue;
				if (entry.origin === "subagent") {
					if (!includeSubagents || !isRunning(id)) continue;
					const owner = ownerOf(id);
					// Only the ancestor's own wait state counts: the sub-agent has no row, so
					// it can never be the session the user is being asked about.
					if (owner !== "" && !waitingForYou(owner)) push(owner);
					continue;
				}
				if (!isRunning(id)) continue;
				push(id);
			}
			return out;
		}

		/**
		 * Roll the running sessions up to one count per workspace.
		 *
		 * Mirrors `dotsFromItems`: the ID anchors the number to the workspace row
		 * the browser itself keys (`data-row-key="workspace:<id>"`), the title is
		 * what the row displays, and a session whose workspace cannot be named is
		 * dropped rather than guessed at. Pure, so a test can drive it directly.
		 * @param ids - running session ids, from `runningSessionIds`.
		 * @param owners - sessionId → `{ id, title }` from the official workspace snapshot.
		 * @returns `[{ id, name, count }]`, busiest workspace first.
		 */
		function runningWorkspaceDots(ids, owners) {
			const counts = new Map();
			for (const id of Array.isArray(ids) ? ids : []) {
				if (typeof id !== "string" || id === "") continue;
				const owner = owners !== null && typeof owners === "object" ? owners[id] : undefined;
				const workspaceId = owner !== null && typeof owner === "object" && typeof owner.id === "string" ? owner.id : "";
				if (workspaceId === "") continue;
				const title = typeof owner.title === "string" ? owner.title : "";
				const existing = counts.get(workspaceId);
				if (existing === undefined) counts.set(workspaceId, { id: workspaceId, name: title, count: 1 });
				else existing.count++;
			}
			return [...counts.values()]
				.sort((a, b) => b.count - a.count || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
		}

		//#endregion
		//#region badge bridge
		// In-package badge bridge. Two number sources:
		//   "real"   — DSH's own pending-interaction registry (the same source the
		//              sidebar session-row marker uses): how many sessions are
		//              waiting for you right now. This is the default.
		//   "manual" — the settings test input, for eyeballing sizes and numbers.
		// `md` is the default size; `sm` keeps the original 1.0 multiplier.
		const BADGE_SCALES = { sm: 1, md: 1.15, lg: 1.3 };
		let badgeSource = "real";
		let realCount = 0;
		/** The sessions behind `realCount`, for the sidebar list (newest first). */
		let realItems = [];
		/**
		 * Which sessions are showing an unread dot right now.
		 *
		 * Read back by `collectUnread` so a change of ending KIND cannot put a lit dot
		 * out (see the reason filter there). Kept here rather than derived on the fly
		 * because the projection only carries the LATEST ending: once a newer one lands
		 * with a reason the user turned off, the one that lit the dot is no longer
		 * visible anywhere.
		 */
		let litUnreadIds = new Set();
		/**
		 * How many sessions are running right now — the official `running` fact,
		 * already folded by `runningSessionIds`. It rides the SAME bridge as the
		 * unread number because it has the same two consumers (the brand mark and
		 * the tab icon) and the two must never disagree about which of them is
		 * being shown.
		 */
		let runningTotal = 0;
		/** The sessions behind `runningTotal` (`{ id, title, where }`), for the running list. */
		let runningItems = [];
		let manualCount = 0;
		let badgeSize = "md";
		const badgeListeners = new Set();
		function normalizeCount(value) {
			const n = Number(value);
			return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
		}
		/**
		 * A stable identity for one running list.
		 *
		 * The number alone is not enough: with one session running, handing over to a
		 * DIFFERENT session keeps the count at 1, so a guard that only compares counts
		 * leaves the open list naming the session that already stopped — the mark and
		 * the tab icon stay right while the list lies. Same reason the sidebar marks
		 * key off `runningSignature`: compare the list by value.
		 * @param items - `{ id, title, where }` rows (anything else is ignored).
		 * @returns a string that changes whenever the list does.
		 */
		function runningItemsSignature(items) {
			const out = [];
			for (const item of Array.isArray(items) ? items : []) {
				if (item === null || typeof item !== "object") continue;
				out.push(`${item.id}\u0000${item.title}\u0000${item.where}`);
			}
			return out.join("\u0001");
		}
		function effectiveCount() {
			return badgeSource === "manual" ? manualCount : realCount;
		}
		function badgeSnapshot() {
			return { count: effectiveCount(), size: badgeSize, source: badgeSource, items: badgeSource === "manual" ? [] : realItems, running: runningTotal, runningItems };
		}
		function notifyBadge() {
			const snapshot = badgeSnapshot();
			badgeListeners.forEach((fn) => { try { fn(snapshot); } catch {} });
			// The header badge is a DOM node, not a listener, so it is reconciled
			// here as well as from the mutation watchdog. Idempotent either way.
			paintHeaderBadge();
			// Same number, second consumer: the OS badge behind the app icon.
			reconcileAppBadge();
		}
		/** Manual test input. */
		function emitBadge(value) {
			manualCount = normalizeCount(value);
			notifyBadge();
		}
		/** The real source: the sessions needing you, and which they are. */
		function emitRealBadge(value, items) {
			realCount = normalizeCount(value);
			realItems = Array.isArray(items) ? items : [];
			// Remember what is lit BEFORE the next round of folding can hide it: the
			// projection only carries the latest ending, so an ending whose reason is
			// turned off would otherwise erase the memory of the one that lit the dot.
			const lit = new Set();
			for (const item of realItems) {
				if (item !== null && typeof item === "object" && typeof item.id === "string" && item.id !== "") lit.add(item.id);
			}
			litUnreadIds = lit;
			notifyBadge();
		}
		/**
		 * The running sessions, as one number on the same bridge — plus the list
		 * behind it, so the yellow count can be opened like the red one.
		 *
		 * Emitted from every render of the headless badge source, so the "did it
		 * actually change" guard is what keeps a re-render from repainting the tab
		 * icon and the brand mark for nothing. It is NOT routed through
		 * `emitRealBadge`: the unread number and the running number are independent
		 * facts, and a manual test number must not disturb the other.
		 * @param value - how many sessions are running; anything non-positive is 0.
		 * @param items - `{ id, title, where }`, one per running session, in list order.
		 */
		function emitRunningState(value, items) {
			const next = normalizeCount(value);
			const nextItems = Array.isArray(items) ? items : [];
			if (next === runningTotal && runningItemsSignature(nextItems) === runningItemsSignature(runningItems)) return;
			runningTotal = next;
			runningItems = nextItems;
			notifyBadge();
		}
		function emitBadgeSize(value) {
			badgeSize = Object.prototype.hasOwnProperty.call(BADGE_SCALES, value) ? value : "md";
			notifyBadge();
		}
		function emitBadgeSource(value) {
			badgeSource = value === "manual" ? "manual" : "real";
			notifyBadge();
		}
		function subscribeBadge(fn) {
			badgeListeners.add(fn);
			return () => { badgeListeners.delete(fn); };
		}
		function badgeScale(size) {
			return BADGE_SCALES[size] || BADGE_SCALES.md;
		}
		function badgeLabel(count) {
			return count > 99 ? "99+" : String(count);
		}

		//#endregion
		//#region app badge (OS app icon)
		// The badge the OPERATING SYSTEM draws on the icon of the installed app: the
		// taskbar overlay on Windows, the Dock badge on macOS, the number on an iOS
		// home-screen icon. It is the same number the page badge shows, projected
		// onto the system icon — one number, two consumers.
		//
		// Three facts shape this region (all checked against primary sources; see
		// docs/adr/0005-app-icon-badge.md):
		//   * detecting the API is NOT delivery. Chromium on Android exposes
		//     `setAppBadge` and silently ignores it, and iOS only draws the badge
		//     once notifications have been granted. So the probe reports LOCAL facts
		//     and never promises that a badge will appear;
		//   * the OS owns the rendering. On Windows the badge is a browser-drawn
		//     overlay on the taskbar button of an OPEN window: closing the window
		//     drops it, and nothing can refresh it afterwards (no push server);
		//   * the API is write-only, so this half keeps its own count — the very
		//     `effectiveCount()` the favicon and the header badge already use.
		//
		// Everything that DECIDES is a pure function, so a test drives it with no
		// browser at all; exactly one function touches the API.
		/** Display modes that mean "this window IS the installed app", not a tab. */
		const APP_DISPLAY_MODES = ["standalone", "fullscreen", "minimal-ui", "window-controls-overlay"];

		/**
		 * Normalize what this device is, as three independent local facts.
		 *
		 * Deliberately NOT "does this platform support it": the method that works
		 * on Windows resolves and does nothing on Android, and Apple draws the
		 * badge only after notifications are granted. Neither is answerable from
		 * inside the page, so the probe stays silent about them and the copy says
		 * "whether it actually appears is up to the system" instead.
		 * @param env - `{ secure, hasApi, installed }`; anything non-boolean reads false.
		 * @returns the same three flags, normalized.
		 */
		function badgeCapabilityProbe(env) {
			const source = env !== null && typeof env === "object" ? env : {};
			return {
				secure: source.secure === true,
				hasApi: source.hasApi === true,
				installed: source.installed === true
			};
		}

		/**
		 * Read those facts off the window this code runs in.
		 *
		 * "Installed" is a display-mode match rather than `standalone` alone: the
		 * platform manifest asks for `fullscreen`, so an installed window matches
		 * THAT mode, and a standalone-only test would report "browser tab" forever.
		 * @returns the probe for this device.
		 */
		function appBadgeEnv() {
			const nav = typeof navigator === "object" && navigator !== null ? navigator : {};
			let installed = nav.standalone === true;
			if (!installed && typeof window !== "undefined" && typeof window.matchMedia === "function") {
				for (const mode of APP_DISPLAY_MODES) {
					try {
						if (window.matchMedia(`(display-mode: ${mode})`).matches === true) { installed = true; break; }
					} catch {}
				}
			}
			return badgeCapabilityProbe({
				secure: typeof window !== "undefined" && window.isSecureContext === true,
				hasApi: typeof nav.setAppBadge === "function" && typeof nav.clearAppBadge === "function",
				installed
			});
		}

		/**
		 * What the OS badge should say for a given count.
		 *
		 * The number is handed over AS IS (no `99+` clamping here): the system
		 * saturates it in its own way, and duplicating that rule is how the two
		 * projections start disagreeing. Switching the feature off clears the
		 * badge rather than abandoning it — a number left behind after "off"
		 * reads as a bug.
		 * @param count - the unread count, i.e. the number the page badge shows.
		 * @param enabled - the `appBadge` setting; only `true` enables it.
		 * @returns `{ kind: "set", value }` or `{ kind: "clear" }`.
		 */
		function appBadgeEffect(count, enabled) {
			const value = enabled === true ? normalizeCount(count) : 0;
			return value > 0 ? { kind: "set", value } : { kind: "clear" };
		}

		/**
		 * Which self-check line the settings page shows for this device.
		 *
		 * A missing probe is NOT reported as "insecure": that message tells the
		 * user to change how they reach the page, which would be chasing the
		 * wrong thing. Only a real reading may claim that.
		 * @param probe - a `badgeCapabilityProbe` result.
		 * @returns a locale key.
		 */
		function appBadgeCapabilityKey(probe) {
			if (probe === null || typeof probe !== "object") return "appBadgeProbeUnsupported";
			const facts = badgeCapabilityProbe(probe);
			if (facts.secure !== true) return "appBadgeProbeInsecure";
			if (facts.hasApi !== true) return "appBadgeProbeUnsupported";
			return facts.installed === true ? "appBadgeProbeInstalled" : "appBadgeProbeTab";
		}

		/** The last effect actually handed to the API, so a repeat is a no-op. */
		let lastAppBadgeId = null;

		/**
		 * The ONE place that talks to the Badging API.
		 *
		 * Idempotence is required here, not polish: `notifyBadge` fires on every
		 * badge change AND again from the DOM watchdog that re-asserts the tab
		 * badge, and each call costs an IPC to the browser process plus a taskbar
		 * repaint. Only a real change in the projected effect reaches the API.
		 * @param effect - an `appBadgeEffect` result.
		 * @param force - re-send even when the effect is unchanged. Used only by
		 *   the low-frequency OS-badge watchdog, because Windows/Edge can replace a
		 *   numeric badge with a notification dot after our call succeeded.
		 */
		function applyAppBadge(effect, force) {
			const intent = effect !== null && typeof effect === "object" ? effect : {};
			// Anything that is not a positive number is a clear, so a bogus effect
			// can never hand the system a `setAppBadge(0)`.
			const id = intent.kind === "set" && typeof intent.value === "number" && intent.value > 0 ? `set:${intent.value}` : "clear";
			if (id === lastAppBadgeId && force !== true) return;
			const nav = typeof navigator === "object" && navigator !== null ? navigator : null;
			if (nav === null || typeof nav.setAppBadge !== "function" || typeof nav.clearAppBadge !== "function") return;
			lastAppBadgeId = id;
			try {
				// Always a number, never the argument-less "flag" form: on WebKit a
				// no-argument call can REMOVE a badge that is already showing.
				const settled = id === "clear" ? nav.clearAppBadge() : nav.setAppBadge(intent.value);
				if (settled !== null && typeof settled === "object" && typeof settled.catch === "function") {
					settled.catch(() => {
						// The API rejected: the browser did NOT apply this effect, so
						// forget it and let the next reconcile/retry try again. Guard
						// against a newer call having replaced the remembered effect.
						if (lastAppBadgeId === id) lastAppBadgeId = null;
					});
				}
			} catch {
				// A synchronous throw means nothing was applied, so the next
				// reconcile retries instead of remembering a phantom success.
				lastAppBadgeId = null;
			}
		}

		/**
		 * Reconcile the OS badge with the page badge.
		 *
		 * Both inputs are the page's own: the number the favicon and the header
		 * badge already show, and the rule the host persists. Called from
		 * `emitUnreadConfig` (rule arrived / switch moved) and `notifyBadge`
		 * (number moved) — together those cover every way the badge can change.
		 * @param force - re-send even if the projected effect is unchanged.
		 */
		function reconcileAppBadge(force) {
			applyAppBadge(appBadgeEffect(effectiveCount(), unreadConfig.appBadge === true), force === true);
		}

		/**
		 * Keep a positive numeric badge asserted while the app window is alive.
		 *
		 * Windows/Edge can render a notification glyph (a dot) over the numeric
		 * badge after we set it; unlike the favicon, the OS badge then has no
		 * watcher to put the number back. Re-send only when the plugin's own
		 * projection says there SHOULD be a number, and never when it says clear —
		 * so a count of 0 is not repeatedly cleared and no phantom badge appears.
		 */
		function reassertAppBadge() {
			if (unreadConfig.appBadge !== true) return;
			if (normalizeCount(effectiveCount()) <= 0) return;
			reconcileAppBadge(true);
		}

		//#endregion
		//#region notifications permission (the WebKit half of app badging)
		// On WebKit the badge and the notifications permission are one feature:
		// Apple's own words are "when users allow a web app to send
		// notifications, that includes permissions for the web app to use
		// badging" — so a macOS web app added to the Dock (and an iOS
		// home-screen web app) draws NO badge until the user allows
		// notifications (sources: docs/adr/0009-notification-permission.md).
		//
		// This region does NOT gate `applyAppBadge`: Chromium needs none of it,
		// and the API only reports "not permitted" by drawing nothing, which is
		// undetectable. Keeping the call site unconditional is ADR 0005's rule;
		// what is added here is the PRECONDITION, made visible and requestable
		// from one user gesture.
		/** The three states the spec defines; anything else is "no API". */
		const NOTIFICATION_PERMISSION_STATES = ["granted", "denied", "default"];

		/**
		 * Normalize one reading of `Notification.permission` into a local fact.
		 * @param value - the raw reading; only the spec strings count.
		 * @returns `"granted" | "denied" | "default" | "unsupported"`.
		 */
		function normalizeNotificationPermission(value) {
			return typeof value === "string" && NOTIFICATION_PERMISSION_STATES.includes(value) ? value : "unsupported";
		}

		/**
		 * Normalize an already-shaped probe, so every reader of it takes dirty
		 * input the same way: only the three spec states are real, and only a
		 * strict `true` is a request entry point.
		 * @param probe - a `{ state, canRequest }` probe, or anything else.
		 * @returns the same two facts, normalized.
		 */
		function notificationPermissionFacts(probe) {
			const source = probe !== null && typeof probe === "object" ? probe : {};
			return {
				state: normalizeNotificationPermission(source.state),
				canRequest: source.canRequest === true
			};
		}

		/**
		 * Shape a raw `{ permission, canRequest }` reading, mirroring
		 * `badgeCapabilityProbe`: two independent local facts, no platform claim.
		 * @param env - the raw reading; anything else reads false.
		 * @returns the probe for this device.
		 */
		function notificationPermissionProbe(env) {
			const source = env !== null && typeof env === "object" ? env : {};
			return notificationPermissionFacts({
				state: normalizeNotificationPermission(source.permission),
				canRequest: source.canRequest === true
			});
		}

		/**
		 * Read that fact off the window this code runs in.
		 *
		 * "unsupported" covers both a browser with no Notification API and a
		 * permission string this code has never heard of — from the user's side
		 * those are the same thing: there is nothing to grant here.
		 * @returns the probe for this device.
		 */
		function notificationPermissionEnv() {
			const api = typeof Notification === "object" && Notification !== null ? Notification : null;
			return notificationPermissionProbe({
				permission: api === null ? undefined : api.permission,
				canRequest: api !== null && typeof api.requestPermission === "function"
			});
		}

		/**
		 * Which settings-page sentence describes this reading.
		 * @param probe - a `notificationPermissionProbe` result.
		 * @returns a locale key.
		 */
		function notificationPermissionKey(probe) {
			const facts = notificationPermissionFacts(probe);
			if (facts.state === "granted") return "notificationPermissionGranted";
			if (facts.state === "denied") return "notificationPermissionDenied";
			if (facts.state === "default") return "notificationPermissionDefault";
			return "notificationPermissionUnsupported";
		}

		/**
		 * Whether the "allow notifications" button can do anything.
		 *
		 * Only an undecided permission is worth a prompt: once granted there is
		 * nothing left to ask, and once denied the browser refuses to prompt
		 * again, so the settings page says where to change it instead of showing
		 * a button that would silently do nothing.
		 * @param probe - a `notificationPermissionProbe` result.
		 * @returns true only when a prompt could still decide the fact.
		 */
		function notificationPermissionRequestable(probe) {
			const facts = notificationPermissionFacts(probe);
			return facts.state === "default" && facts.canRequest === true;
		}

		/**
		 * Ask for the notifications permission — the ONE place that does.
		 *
		 * Must be called from a user gesture (the settings button's click):
		 * WebKit and Chromium both drop a prompt that no activation asked for.
		 * Resolves to a fresh probe and never rejects, so the caller can drop the
		 * result straight into React state; the old callback form (Safari 15) is
		 * why the returned promise is not the only path out.
		 * @returns a Promise for the permission probe after the prompt.
		 */
		function requestNotificationPermission() {
			const api = typeof Notification === "object" && Notification !== null ? Notification : null;
			if (api === null || typeof api.requestPermission !== "function") return Promise.resolve(notificationPermissionEnv());
			return new Promise((resolve) => {
				// The prompt's own answer is authoritative when it comes back;
				// re-reading `.permission` covers the promise form and a rejection
				// (no user gesture, or not an installed web app on WebKit).
				const settle = (value) => {
					const next = notificationPermissionEnv();
					resolve({
						state: typeof value === "string" ? normalizeNotificationPermission(value) : next.state,
						canRequest: next.canRequest
					});
				};
				let returned;
				try {
					returned = api.requestPermission(settle);
				} catch {
					settle(undefined);
					return;
				}
				if (returned !== null && typeof returned === "object" && typeof returned.then === "function") {
					returned.then(settle, () => settle(undefined));
				}
			});
		}

		/**
		 * Follow the permission while this page is open.
		 *
		 * It can move outside the page (System Settings, the browser's own
		 * settings, another tab's prompt), and a stale "not granted" beside a
		 * granted permission is exactly the kind of lie this half avoids.
		 * `permissions.query({ name: "notifications" })` is the precise channel;
		 * a re-read on focus/visibilitychange is the portable one (WebKit does
		 * not implement every permission descriptor), and both are cheap.
		 * Publishes only when the fact actually changed.
		 * @param fn - called with a fresh probe when the fact moved.
		 * @returns an unsubscribe function.
		 */
		function subscribeNotificationPermission(fn) {
			if (typeof fn !== "function") return () => {};
			const win = typeof window !== "undefined" ? window : null;
			const navigatorObject = typeof navigator === "object" && navigator !== null ? navigator : null;
			const read = () => {
				const next = notificationPermissionEnv();
				return { next, id: `${next.state}:${next.canRequest === true}` };
			};
			// Seeded with the mount reading, so mounting never re-publishes the
			// value the settings page already rendered.
			let last = read().id;
			// Fire only on a real change: the settings page already rendered the
			// mount reading, and a focus event that changed nothing must not repaint.
			const publish = () => {
				const reading = read();
				if (reading.id === last) return;
				last = reading.id;
				try { fn(reading.next); } catch {}
			};
			/** @type {Array<() => void>} */
			const unsubscribes = [];
			if (win !== null && typeof win.addEventListener === "function") {
				for (const event of ["focus", "visibilitychange", "pageshow"]) {
					win.addEventListener(event, publish);
					unsubscribes.push(() => win.removeEventListener(event, publish));
				}
			}
			try {
				if (navigatorObject !== null && navigatorObject.permissions && typeof navigatorObject.permissions.query === "function") {
					const pending = navigatorObject.permissions.query({ name: "notifications" });
					if (pending !== null && typeof pending === "object" && typeof pending.then === "function") {
						pending.then((status) => {
							if (status === null || typeof status !== "object" || typeof status.addEventListener !== "function") return;
							status.addEventListener("change", publish);
							unsubscribes.push(() => status.removeEventListener("change", publish));
						}).catch(() => {});
					}
				}
			} catch {}
			return () => {
				for (const off of unsubscribes) {
					try { off(); } catch {}
				}
				unsubscribes.length = 0;
			};
		}

		//#endregion
		//#region favicon compositing
		// The browser accepts exactly ONE image per <link rel="icon">, so a tab
		// badge cannot be layered: base icon and badge are redrawn together into a
		// canvas and the merged bitmap is handed back to the browser. Count 0 (and
		// teardown) restores the pristine platform/custom href.
		const FAVICON_SIZE = 64;
		/**
		 * How long one base-image fetch may take before the compose gives up on it.
		 *
		 * A fetch that neither loads nor errors (a stalled request, a proxy that never
		 * answers) used to leave the compose pending forever — and silently, because no
		 * error is ever raised — so the tab icon simply stopped following the numbers
		 * with nothing in the console. This timeout turns that into a reported failure
		 * the watchdog can retry.
		 */
		const FAVICON_LOAD_TIMEOUT_MS = 8000;
		let faviconBase = null;
		let composeSeq = 0;
		let faviconComposing = false;
		/** Last compose failure, so a repeated failure warns once instead of spamming. */
		let lastComposeError = null;
		/**
		 * The picture the tab is carrying right now: `未读|进行中|基图`.
		 *
		 * A `data:` href alone says nothing — an OLD bitmap and a bitmap whose compose
		 * FAILED look exactly the same from the DOM. Remembering which picture was
		 * actually written is what lets the watchdog tell "already right" from "stale
		 * but still ours", which is the hole that used to freeze the tab icon.
		 */
		let faviconDrawnSignature = "";
		/** The picture a compose is fetching right now, so a repeat cannot start a second fetch. */
		let faviconPendingSignature = "";
		/** Whether the last compose failed: the watchdog must retry instead of trusting the DOM. */
		let faviconFailed = false;
		/**
		 * Short backoff after a failed compose: 300 ms → 1 s → 2 s, then the 5-second
		 * watchdog owns it.
		 *
		 * The watchdog alone is too slow to feel like "the tab icon follows the
		 * number": a base image that is merely SLOW (a cold cache, a proxy waking up, a
		 * laptop resuming) left the badge missing for up to five seconds after a reload
		 * — and a reload is exactly when the number is freshest. Three quick attempts
		 * cover that window; a genuinely missing icon still falls through to the
		 * watchdog, which keeps warning once per reason. Any success resets the ladder.
		 */
		const FAVICON_RETRY_DELAYS_MS = [300, 1000, 2000];
		let faviconRetryTimer = 0;
		let faviconRetryStep = 0;
		function clearFaviconRetry() {
			if (faviconRetryTimer === 0) return;
			window.clearTimeout(faviconRetryTimer);
			faviconRetryTimer = 0;
		}
		/**
		 * Queue one retry of the compose that just failed.
		 *
		 * At most one timer is ever pending, and the ladder stops after the last rung
		 * (the 5-second watchdog is the safety net below it). The callback re-checks
		 * `faviconFailed`: a compose that already succeeded, or the teardown that
		 * restored the shipped icons, has cleared it — and rebuilding then would paint
		 * a number back onto a page that was deliberately left alone.
		 */
		function scheduleFaviconRetry() {
			if (faviconRetryTimer !== 0) return;
			if (faviconRetryStep >= FAVICON_RETRY_DELAYS_MS.length) return;
			const delay = FAVICON_RETRY_DELAYS_MS[faviconRetryStep];
			faviconRetryStep++;
			faviconRetryTimer = window.setTimeout(() => {
				faviconRetryTimer = 0;
				if (faviconFailed !== true) return; // already repaired, or torn down
				composeFavicon(effectiveCount(), badgeSize, true);
			}, delay);
		}
		/** Which icon the plugin considers current (filled from the status RPC). */
		let iconState = { active: false, rev: null, png: false, mime: null };
		/** The icon URL this page SHOULD be showing, per the plugin's own status. */
		function desiredIconHref() {
			if (iconState.active === true && typeof iconState.rev === "string" && iconState.rev !== "") {
				return iconState.png === true ? `/icon-custom-192.png?v=${iconState.rev}` : `/icon-custom.svg?v=${iconState.rev}`;
			}
			return "/favicon.svg";
		}
		function desiredIconType() {
			if (iconState.active !== true) return "image/svg+xml";
			return iconState.png === true ? "image/png" : (iconState.mime || "image/svg+xml");
		}
		/**
		 * One string that names one picture: which numbers, on which base.
		 *
		 * It is the identity used both to remember what was drawn and to decide whether
		 * a compose still has anything to do. The numbers are part of it on purpose —
		 * "1 unread" and "2 unread" are different pictures even though both are `data:`.
		 * @param count - the unread number this picture carries.
		 * @param runningCount - the running number this picture carries.
		 * @param base - the base icon href the numbers ride on.
		 * @returns the signature string.
		 */
		function faviconSignature(count, runningCount, base) {
			return normalizeCount(count) + "|" + normalizeCount(runningCount) + "|" + base;
		}
		/** The picture this page SHOULD be carrying right now, from live state. */
		function wantedFaviconSignature() {
			return faviconSignature(effectiveCount(), runningTotal, desiredIconHref());
		}
		/**
		 * Every `<link rel="icon">` the document carries, creating one if the page
		 * has none.
		 *
		 * DSH 0.2.x ships TWO of them — a dark and a light one, each behind a
		 * `media` query. Touching only `querySelector`'s first match left the light
		 * one pointing at the shipped favicon, and the browser honours the LAST
		 * suitable candidate, so a custom icon silently failed to apply in light
		 * mode (the tab kept the platform whale and the feature looked dead).
		 * Every write below therefore goes to all of them.
		 */
		function iconLinks() {
			const links = Array.from(document.querySelectorAll('link[rel="icon"]'));
			if (links.length > 0) return links;
			const link = document.createElement("link");
			link.rel = "icon";
			link.type = "image/svg+xml";
			link.href = "/favicon.svg";
			document.head.appendChild(link);
			return [link];
		}
		/** Authored href/type, remembered before the first write so a reset can put the shipped pair back. */
		const ICON_ORIGINALS = new WeakMap();
		function rememberIcon(link) {
			if (ICON_ORIGINALS.has(link)) return;
			ICON_ORIGINALS.set(link, { href: link.getAttribute("href"), type: link.getAttribute("type") });
		}
		/**
		 * Point every icon link at one image, so no scheme-specific sibling is left stale.
		 * Writes only on change: the head MutationObserver feeds `reconcileFavicon`,
		 * so a redundant write would re-arm the watchdog on every tick.
		 */
		function setIconEverywhere(href, type) {
			for (const link of iconLinks()) {
				rememberIcon(link);
				if (link.getAttribute("href") !== href) link.setAttribute("href", href);
				if (typeof type === "string" && type !== "") {
					if (link.getAttribute("type") !== type) link.setAttribute("type", type);
				} else if (link.getAttribute("type") !== null) link.removeAttribute("type");
			}
		}
		/**
		 * Put the authored hrefs back; a link this plugin created falls back to the
		 * platform default. Idempotent for the same watchdog reason as above, and a
		 * no-op for any link the plugin never touched — which is what keeps the
		 * documented "zero side effects while no custom icon is set" true.
		 */
		function restoreShippedIcons() {
			for (const link of iconLinks()) {
				const original = ICON_ORIGINALS.get(link);
				if (original === undefined) continue; // never touched → leave the shipped tag alone
				const href = original.href === null ? "/favicon.svg" : original.href;
				if (link.getAttribute("href") !== href) link.setAttribute("href", href);
				if (original.type === null) {
					if (link.getAttribute("type") !== null) link.removeAttribute("type");
				} else if (link.getAttribute("type") !== original.type) link.setAttribute("type", original.type);
			}
		}
		function iconLink() {
			return iconLinks()[0];
		}
		function roundRect(c2d, x, y, w, h) {
			const r = Math.min(h / 2, w / 2);
			c2d.beginPath();
			c2d.moveTo(x + r, y);
			c2d.arcTo(x + w, y, x + w, y + h, r);
			c2d.arcTo(x + w, y + h, x, y + h, r);
			c2d.arcTo(x, y + h, x, y, r);
			c2d.arcTo(x, y, x + w, y, r);
			c2d.closePath();
		}
		function drawFaviconBadge(c2d, size, count, scale) {
			const text = badgeLabel(count);
			const r = size * 0.28 * (scale || 1);
			const wide = text.length > 1;
			const w = wide ? r * 2 + size * 0.16 * (text.length - 1) : r * 2;
			const h = r * 2;
			const cx = size - w / 2 - size * 0.02;
			const cy = h / 2 + size * 0.02;
			c2d.save();
			// White ring so the badge stays readable on any base artwork.
			c2d.fillStyle = "#ffffff";
			roundRect(c2d, cx - w / 2 - size * 0.03, cy - h / 2 - size * 0.03, w + size * 0.06, h + size * 0.06);
			c2d.fill();
			c2d.fillStyle = "#e5484d";
			roundRect(c2d, cx - w / 2, cy - h / 2, w, h);
			c2d.fill();
			c2d.fillStyle = "#ffffff";
			c2d.font = `700 ${Math.round(h * (wide ? 0.56 : 0.68))}px system-ui, -apple-system, sans-serif`;
			c2d.textAlign = "center";
			c2d.textBaseline = "middle";
			c2d.fillText(text, cx, cy + size * 0.01);
			c2d.restore();
		}
		/**
		 * The common badge scale when BOTH tab-icon numbers are shown.
		 *
		 * A big red "2" beside a small yellow "1" reads as a rendering bug, so the
		 * two pills share one size: the largest that fits them stacked inside the
		 * canvas (four half-heights + the edge pads + the seam between them). The
		 * constraint is absolute — it is the canvas that is small, not the setting —
		 * so this returns a SCALE multiplier the caller folds into the normal one,
		 * and a pill drawn alone keeps whatever size the setting asks for.
		 * @param scale - the badge-size multiplier from the setting.
		 * @returns a multiplier ≤ 1 to apply to it.
		 */
		function faviconBadgeFitScale(scale) {
			const k = typeof scale === "number" && scale > 0 ? scale : 1;
			// 0.205: four half-heights plus both white rings plus a seam, inside the
			// canvas. Anything larger and the two rings merge into one blob.
			return Math.min(1, 0.205 / (0.28 * k));
		}
		/**
		 * The yellow "N running" badge on the tab icon: bottom-right.
		 *
		 * Mirrors `drawFaviconBadge` exactly — same geometry, same white ring, same
		 * digit size for the same `scale` — so the two numbers can sit one above the
		 * other as equals. Dark digits, because yellow needs dark ink.
		 * @param c2d - the tab-icon canvas context.
		 * @param size - canvas edge in px.
		 * @param count - how many sessions are running.
		 * @param scale - the badge-size multiplier (already fitted when paired).
		 */
		function drawFaviconRunningBadge(c2d, size, count, scale) {
			const text = badgeLabel(count);
			const r = size * 0.28 * (scale || 1);
			const wide = text.length > 1;
			const w = wide ? r * 2 + size * 0.16 * (text.length - 1) : r * 2;
			const h = r * 2;
			const cx = size - w / 2 - size * 0.02;
			const cy = size - h / 2 - size * 0.02;
			c2d.save();
			// White ring so the badge stays readable on any base artwork.
			c2d.fillStyle = "#ffffff";
			roundRect(c2d, cx - w / 2 - size * 0.03, cy - h / 2 - size * 0.03, w + size * 0.06, h + size * 0.06);
			c2d.fill();
			c2d.fillStyle = RUNNING_YELLOW;
			roundRect(c2d, cx - w / 2, cy - h / 2, w, h);
			c2d.fill();
			c2d.fillStyle = "#1f1f1f";
			c2d.font = `700 ${Math.round(h * (wide ? 0.56 : 0.68))}px system-ui, -apple-system, sans-serif`;
			c2d.textAlign = "center";
			c2d.textBaseline = "middle";
			c2d.fillText(text, cx, cy + size * 0.01);
			c2d.restore();
		}
		/**
		 * Load one image for the composite, with a deadline.
		 *
		 * Settles exactly once, whatever happens: a late `onload` after the timeout must
		 * not draw on top of the picture that replaced it.
		 * @param href - absolute URL of the base icon.
		 * @returns the loaded image, or a rejection whose message says why.
		 */
		function loadIconImage(href) {
			return new Promise((resolve, reject) => {
				const img = new Image();
				let done = false;
				const settle = (fn, value) => {
					if (done) return;
					done = true;
					window.clearTimeout(timer);
					fn(value);
				};
				const timer = window.setTimeout(() => { settle(reject, new Error("icon-load-timeout")); }, FAVICON_LOAD_TIMEOUT_MS);
				img.onload = () => { settle(resolve, img); };
				img.onerror = () => { settle(reject, new Error("icon-load")); };
				img.src = href;
			});
		}
		async function applyBadgeToFavicon(count, size) {
			// ONE snapshot decides this whole compose: which marks to draw AND with which
			// numbers. `runningTotal` used to be read again after the await, so a run that
			// stopped mid-fetch was painted as a yellow "0", and the two numbers could
			// come from two different moments.
			const wantedCount = normalizeCount(count);
			const runningCount = normalizeCount(runningTotal);
			const signature = faviconSignature(wantedCount, runningCount, desiredIconHref());
			// The sequence is taken BEFORE the "nothing to draw" branch: restoring the
			// plain icon has to invalidate any compose still in flight, or that older
			// bitmap lands afterwards and paints the number we just cleared back onto
			// the tab. (That is exactly the "stale dot that will not go away" report.)
			const seq = ++composeSeq;
			faviconComposing = true;
			faviconPendingSignature = signature;
			faviconFailed = false;
			try {
				if (wantedCount <= 0 && runningCount <= 0) {
					// No badge to draw. With a custom icon active the page must carry it on
					// EVERY link (a stale scheme-specific sibling outranks the one we set);
					// with none, the shipped dark/light pair goes back untouched — the
					// plugin promises zero side effects while it has no icon of its own.
					if (seq !== composeSeq) return;
					if (iconState.active === true) setIconEverywhere(desiredIconHref(), desiredIconType());
					else restoreShippedIcons();
					faviconBase = null;
					faviconDrawnSignature = signature;
					return;
				}
				// The base is resolved from the plugin's status, never from whatever the
				// page happens to carry, and never from our own previous bitmap.
				const base = desiredIconHref();
				faviconBase = { href: base, type: desiredIconType() };
				const img = await loadIconImage(new URL(base, document.baseURI).href);
				if (seq !== composeSeq) return;
				const canvas = document.createElement("canvas");
				canvas.width = FAVICON_SIZE;
				canvas.height = FAVICON_SIZE;
				const c2d = canvas.getContext("2d");
				const iw = img.naturalWidth || img.width || FAVICON_SIZE;
				const ih = img.naturalHeight || img.height || FAVICON_SIZE;
				const scale = Math.min(FAVICON_SIZE / iw, FAVICON_SIZE / ih);
				const dw = iw * scale;
				const dh = ih * scale;
				c2d.drawImage(img, (FAVICON_SIZE - dw) / 2, (FAVICON_SIZE - dh) / 2, dw, dh);
				// One size for both numbers: when they share the tab icon they shrink
				// together to the largest pair that fits, so neither reads as a bug and
				// the two can never overlap.
				const badgeUnit = badgeScale(size);
				const badgeK = wantedCount > 0 && runningCount > 0 ? badgeUnit * faviconBadgeFitScale(badgeUnit) : badgeUnit;
				if (wantedCount > 0) drawFaviconBadge(c2d, FAVICON_SIZE, wantedCount, badgeK);
				if (runningCount > 0) drawFaviconRunningBadge(c2d, FAVICON_SIZE, runningCount, badgeK);
				setIconEverywhere(canvas.toDataURL("image/png"), "image/png");
				faviconDrawnSignature = signature;
			} catch (error) {
				// Never silent: a failure here is invisible in the UI (the tab simply
				// keeps its previous icon), which once cost a whole debugging session.
				// Warn once per distinct reason so the 5s watchdog cannot spam.
				faviconFailed = true;
				warnFaviconCompose(error);
			} finally {
				if (seq === composeSeq) {
					faviconComposing = false;
					faviconPendingSignature = "";
				}
			}
		}
		/**
		 * Report a failed tab-icon composition, once per distinct reason.
		 *
		 * The 5-second watchdog retries, so repeating the same line would bury the
		 * console in noise; a NEW reason is exactly the signal worth seeing.
		 * @param error - whatever the compose threw.
		 */
		function warnFaviconCompose(error) {
			const why = String((error && error.message) || error);
			if (why === lastComposeError) return;
			lastComposeError = why;
			try { console.warn("dsh-icon-custom: 标签页红点合成失败 / favicon badge compose failed:", why); } catch {}
		}
		/**
		 * Fire-and-forget composition whose failures are still reported.
		 *
		 * `applyBadgeToFavicon` is async, so it never throws synchronously: a caller's
		 * `try { ... } catch {}` (the badge listeners all have one) cannot see its
		 * rejection, and the tab icon would simply never change with nothing in the
		 * console — the exact "no warning, no badge" state. Every call site goes through
		 * here instead.
		 *
		 * It is also the ONE place that decides whether there is anything to do: this is
		 * called on every badge notification, and a badge notification happens on every
		 * render. Without the signature guard each of those started its own base-image
		 * fetch, and on a page whose base image is slow (a reverse proxy, a cold cache,
		 * a laptop waking up) every fetch was superseded before it landed — the tab icon
		 * fell further behind the numbers with every repaint instead of catching up.
		 * @param count - sessions needing you; 0 restores the plain icon.
		 * @param size - badge size key.
		 * @param force - recompose even when this exact picture was already drawn (the
		 *   page was disturbed, the base icon changed, the last compose failed).
		 */
		function composeFavicon(count, size, force) {
			const signature = faviconSignature(count, runningTotal, desiredIconHref());
			if (signature === faviconPendingSignature) return; // this very picture is being fetched
			if (force !== true && signature === faviconDrawnSignature && faviconFailed !== true) return; // already on the tab
			try {
				Promise.resolve(applyBadgeToFavicon(count, size)).then(
					() => {
						// The compose reports its own failure through `faviconFailed` (it never
						// rejects), so this is where one becomes a SHORT retry instead of a
						// wait for the next watchdog tick. A good compose resets the ladder.
						if (faviconFailed === true) { scheduleFaviconRetry(); return; }
						faviconRetryStep = 0;
						clearFaviconRetry();
					},
					(error) => { warnFaviconCompose(error); }
				);
			} catch (error) {
				// An `async` callee never throws synchronously, so this arm is dead TODAY —
				// it is here so a future refactor (an early-returning sync path) cannot
				// quietly reintroduce the silent "no warning, no badge" state.
				warnFaviconCompose(error);
			}
		}
		/**
		 * Re-assert the tab badge after anything outside this plugin disturbed the
		 * icon link — a cached page, a browser extension, a tab move, or a plugin
		 * reload. Our own output is a `data:` URL, so any other href means the
		 * composite was replaced and has to be rebuilt from the new base.
		 *
		 * "Still ours" is not the same as "still right": a `data:` href can carry an
		 * older number, or one whose compose died halfway. Comparing the picture that
		 * was actually written against the one that is wanted now is what lets this
		 * watchdog repair those — and what makes a failed compose a retry instead of a
		 * tab icon that is frozen for the rest of the page's life.
		 */
		function reconcileFavicon() {
			// Inspect EVERY icon link: 0.2.x ships two (dark/light), and a sibling
			// left stale by anything outside the plugin must be repaired too — that
			// stale sibling is exactly what used to outrank the icon we set.
			const hrefs = iconLinks().map((candidate) => candidate.getAttribute("href"));
			const ours = hrefs.length > 0 && hrefs.every((value) => typeof value === "string" && value.slice(0, 5) === "data:");
			const wanted = wantedFaviconSignature();
			if (ours && faviconDrawnSignature === wanted && faviconFailed !== true) return; // exactly right, right now
			const count = effectiveCount();
			if (count <= 0 && normalizeCount(runningTotal) <= 0) {
				// Carries the custom icon, or puts the shipped pair back. Both writers
				// only touch a link that actually differs, so this stays a no-op once
				// the page is correct and cannot re-arm the head observer.
				composeFavicon(0, badgeSize, ours !== true);
				return;
			}
			if (faviconComposing) return; // a build is already running
			composeFavicon(count, badgeSize, ours !== true);
		}
		// A freshly applied base icon replaces whatever the browser holds, so the
		// composite must be rebuilt from the NEW base instead of the stale one.
		function refreshFaviconBase() {
			faviconBase = null;
			composeFavicon(effectiveCount(), badgeSize, true);
		}
		//#endregion

		//#region unread panel
		//#region header panel
		/**
		 * Which list is open, and where the button that opened it sits.
		 *
		 * One store for both lists, and one open slot: the two numbers sit in the same
		 * header row, so two panels open at once would stack on top of each other
		 * under the same anchor. `mode` is therefore "unread" | "running" | null, and
		 * opening either closes the other by construction.
		 *
		 * The buttons and the floating list live in two different slots, so they
		 * cannot share React state — this tiny store is what they agree through.
		 */
		let panelMode = null;
		let panelAnchor = null;
		const panelListeners = new Set();
		function emitPanel(mode, anchor) {
			panelMode = mode === "unread" || mode === "running" ? mode : null;
			if (anchor !== undefined) panelAnchor = anchor;
			panelListeners.forEach((fn) => { try { fn(); } catch {} });
		}
		function subscribePanel(fn) {
			panelListeners.add(fn);
			return () => { panelListeners.delete(fn); };
		}
		/**
		 * One marker's button: open its list, or close it when it is already the open
		 * one. Clicking the OTHER marker switches lists instead of stacking them.
		 * @param mode - "unread" (the red count) or "running" (the yellow count).
		 * @param anchor - the clicked node's viewport rect, or undefined to keep the last one.
		 */
		function togglePanel(mode, anchor) {
			emitPanel(panelMode === mode ? null : mode, anchor === undefined ? null : anchor);
		}
		/**
		 * Tells the badge source that the marks moved somewhere it did not touch —
		 * the panel's "mark all read". It must re-render to re-emit the number (which
		 * also repaints the row dots and rebuilds the tab badge).
		 */
		const unreadPokeListeners = new Set();
		function emitUnreadPoke() {
			unreadPokeListeners.forEach((fn) => { try { fn(); } catch {} });
		}
		function subscribeUnreadPoke(fn) {
			unreadPokeListeners.add(fn);
			return () => { unreadPokeListeners.delete(fn); };
		}
		/**
		 * Roll the pending sessions up to one dot per workspace.
		 *
		 * Pure: `owners` maps sessionId → `{ id, title }` from the official workspace
		 * snapshot. Both halves matter downstream: the ID anchors the marker to the
		 * row the browser itself keys (`data-row-key="workspace:<id>"`), which is what
		 * makes the folder dot survive a Workspace whose displayed name differs from
		 * the stored title, two Workspaces sharing one title, and a title that is
		 * simply empty. The title stays for the tooltip; a session with neither falls
		 * back to the cwd basename `collectUnread` already carries.
		 * @returns `[{ id, name, count }]`, busiest workspace first.
		 */
		function dotsFromItems(items, owners) {
			const counts = new Map();
			for (const item of Array.isArray(items) ? items : []) {
				if (item === null || typeof item !== "object") continue;
				const owner = owners !== null && typeof owners === "object" ? owners[item.id] : undefined;
				const title = owner !== null && typeof owner === "object" && typeof owner.title === "string" ? owner.title : "";
				const name = title !== "" ? title : (typeof item.where === "string" ? item.where : "");
				if (name === "") continue;
				const id = owner !== null && typeof owner === "object" && typeof owner.id === "string" ? owner.id : "";
				// One dot per Workspace: two Sessions of the same Workspace must not
				// produce two entries that later paint on top of each other.
				const key = id !== "" ? id : name;
				const existing = counts.get(key);
				if (existing === undefined) counts.set(key, { id, name, count: 1 });
				else existing.count++;
			}
			return [...counts.values()]
				.sort((a, b) => b.count - a.count || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
		}

		/**
		 * Group the pending rows by workspace for the sidebar list.
		 *
		 * Pure and order-preserving: rows arrive already sorted by urgency, so the
		 * group holding the most urgent row naturally comes first, and rows that
		 * carry no workspace label fall into their own unlabelled bucket.
		 * @param items - rows from `collectUnread`.
		 * @returns `[{ where, items }]`.
		 */
		function groupUnreadByWorkspace(items) {
			const groups = [];
			const index = new Map();
			for (const item of Array.isArray(items) ? items : []) {
				const where = item !== null && typeof item === "object" && typeof item.where === "string" ? item.where : "";
				let group = index.get(where);
				if (group === undefined) {
					group = { where, items: [] };
					index.set(where, group);
					groups.push(group);
				}
				group.items.push(item);
			}
			return groups;
		}
		/**
		 * Age buckets, in the shipped sidebar's own units.
		 *
		 * Same thresholds as the official `relativeTime`: under a minute "now", then
		 * minutes / hours / days / months / years. Deliberately copied instead of
		 * imported — a display plugin must not depend on a Harness Client package —
		 * but the SHAPE has to match the sidebar's, because the whole point of
		 * showing it here is that a reader can line the panel's "13小时" up with the
		 * timestamp on the row itself.
		 * @param at - host-domain epoch milliseconds.
		 * @param now - host-domain now.
		 * @returns `{ unit, n }`, `unit` in `now|minutes|hours|days|months|years`.
		 */
		function relativeAgeParts(at, now) {
			const MINUTE = 60000, HOUR = 3600000, DAY = 86400000;
			const diff = Math.max(0, now - at);
			if (diff < MINUTE) return { unit: "now", n: 0 };
			if (diff < HOUR) return { unit: "minutes", n: Math.floor(diff / MINUTE) };
			if (diff < DAY) return { unit: "hours", n: Math.floor(diff / HOUR) };
			if (diff < 30 * DAY) return { unit: "days", n: Math.floor(diff / DAY) };
			if (diff < 365 * DAY) return { unit: "months", n: Math.floor(diff / (30 * DAY)) };
			return { unit: "years", n: Math.floor(diff / (365 * DAY)) };
		}
		/**
		 * One ending's age as text ("13小时" / "13h"), or "" when there is no time.
		 * @param at - host-domain epoch milliseconds, 0/absent for "unknown".
		 * @param now - host-domain now.
		 * @param t - locale binder.
		 * @returns the label.
		 */
		function unreadAgeLabel(at, now, t) {
			if (typeof at !== "number" || !Number.isFinite(at) || at <= 0) return "";
			const { unit, n } = relativeAgeParts(at, now);
			// Same shape as the shipped sidebar's own label: the "now" bucket carries
			// no number.
			return unit === "now" ? t("ageNow") : t(`age${unit[0].toUpperCase()}${unit.slice(1)}`, { n });
		}
		/**
		 * A short, unambiguous handle for a session: the first 8 characters of its id.
		 *
		 * Two sessions can share a title — that is precisely what made one red dot look
		 * unclearable, because the row could not be told apart from its namesake — and
		 * this is what distinguishes them when the titles do not.
		 * @param id - the session id.
		 * @returns the short form, or "".
		 */
		function shortSessionId(id) {
			if (typeof id !== "string" || id === "") return "";
			const bare = id.startsWith("session-") ? id.slice("session-".length) : id;
			return bare.slice(0, 8);
		}
		/**
		 * The dim second line of one panel row: why it is listed, how long ago that
		 * was, and which session it is.
		 * @param item - a row from `collectUnread`.
		 * @param now - host-domain now.
		 * @param t - locale binder.
		 * @returns the line, already joined.
		 */
		function unreadRowSubtitle(item, now, t) {
			const parts = [item.waiting === true ? t("unreadWaiting") : t("unreadEnded")];
			// A "waiting" row's `at` is Date.now() (it has no ending of its own), so only
			// turn-end rows carry a readable age.
			if (item.waiting !== true) {
				const age = unreadAgeLabel(item.at, now, t);
				if (age !== "") parts.push(age);
			}
			const short = shortSessionId(item.id);
			if (short !== "") parts.push(short);
			return parts.join(" · ");
		}
		/**
		 * The dim second line of one running row: that it is running, and which
		 * session it is. Deliberately no age — the official session list carries no
		 * "started at" fact (only `running: boolean`), and this plugin would rather
		 * print less than invent a time. Shape matches `unreadRowSubtitle` so the two
		 * lists read as one panel with two modes.
		 * @param item - a row from the badge bridge's `runningItems`.
		 * @param t - locale binder.
		 * @returns the line, already joined.
		 */
		function runningRowSubtitle(item, t) {
			const parts = [t("runningPanelRow")];
			const short = shortSessionId(item.id);
			if (short !== "") parts.push(short);
			return parts.join(" · ");
		}
		/**
		 * What "mark all read" may actually acknowledge: the turn-end rows.
		 *
		 * A "waiting for you" row is not watermark-based at all — it is listed while
		 * that interaction is live, and no mark can clear it — so the caller must
		 * leave it alone.
		 * @param items - rows from `collectUnread`.
		 * @returns `[{ id, seenAt }]`, each carrying the `endAt` it acknowledges.
		 */
		function unreadAckTargets(items) {
			const targets = [];
			for (const item of Array.isArray(items) ? items : []) {
				if (item === null || typeof item !== "object") continue;
				if (item.waiting === true) continue;
				if (typeof item.id !== "string" || item.id === "") continue;
				if (typeof item.at !== "number" || !Number.isFinite(item.at) || item.at <= 0) continue;
				targets.push({ id: item.id, seenAt: item.at });
			}
			return targets;
		}
		//#region reveal in sidebar
		/**
		 * Locating a clicked session in the sidebar: expand its workspace, scroll to the
		 * row, light it up for a moment.
		 *
		 * The official sidebar does exactly this by itself — but ONLY for its own search
		 * results. The state behind that (`revealSessionId`) is private to that component
		 * and no Service exposes it, while `uiWorkspace.openSession` switches the main
		 * view and nothing else. So this drives the shipped rows the way a user's click
		 * would: the workspace row toggles its group, the "show more" button raises the
		 * collapsed-session limit.
		 *
		 * It therefore reads the page structure, and it is DECORATIVE: by the time it runs
		 * the session is already open. Moved markup (a DSH upgrade), a rail sidebar or an
		 * open search box all degrade to "the sidebar did not move" — never to an error,
		 * and never to a blocked click.
		 */
		const REVEAL_ROW_KEY_ATTR = "data-row-key";
		const REVEAL_FLASH_ATTR = "data-icon-custom-flash";
		const REVEAL_FLASH_STYLE_ID = "dsh-icon-custom-flash-css";
		/** How long the located row stays lit. */
		const REVEAL_FLASH_MS = 1200;
		/**
		 * How many DOM steps one reveal may take.
		 *
		 * The official flow does this in one shot by writing its own state; we only have
		 * clicks, and every click needs a commit before the row can exist. The realistic
		 * worst case is a collapsed workspace whose session sits past "show more", which
		 * releases five rows per click — so this covers a workspace of roughly twenty
		 * sessions and then stops, rather than driving a shipped control in a loop.
		 */
		const REVEAL_MAX_STEPS = 6;
		/**
		 * The flash rules: a short outline pulse, not a lasting class. The point is to say
		 * "here it is", not to leave a mark on a shipped row.
		 */
		const REVEAL_FLASH_CSS = [
			`[${REVEAL_FLASH_ATTR}]{animation:dsh-icon-custom-flash ${REVEAL_FLASH_MS}ms ease-out}`,
			`@keyframes dsh-icon-custom-flash{0%{outline:2px solid var(--dsw-alias-state-business-primary,#4d6bfe);outline-offset:-2px}100%{outline:2px solid transparent;outline-offset:-2px}}`,
			`@media (prefers-reduced-motion:reduce){[${REVEAL_FLASH_ATTR}]{animation:none;outline:2px solid var(--dsw-alias-state-business-primary,#4d6bfe);outline-offset:-2px}}`
		].join("");
		/** The row currently lit, and the timer that will un-light it. */
		let revealFlashRow = null;
		let revealFlashTimer = 0;

		/**
		 * What to do next to make one session's row visible.
		 *
		 * Pure, so the order — and the giving up — is testable without a browser: a row
		 * that is already there gets scrolled to; otherwise its workspace is expanded;
		 * otherwise "show more" is clicked; otherwise nothing is touched at all.
		 * @param state - `{ hasRow, hasWorkspace, expanded, hasOverflow, overflowExpanded, steps }`.
		 * @returns `"scroll" | "expand" | "overflow" | "give-up"`.
		 */
		function revealAction(state) {
			if (state.hasRow === true) return "scroll";
			if (state.steps >= REVEAL_MAX_STEPS) return "give-up";
			if (state.hasWorkspace === true && state.expanded !== true) return "expand";
			// `overflowExpanded` must be false: that button toggles, and this feature has
			// no business COLLAPSING a workspace the reader deliberately opened up.
			if (state.hasOverflow === true && state.overflowExpanded !== true) return "overflow";
			return "give-up";
		}

		/**
		 * The shipped row carrying one `data-row-key`, matched by VALUE.
		 *
		 * Not by a selector built from the key: session ids go into the key verbatim, so a
		 * selector would need escaping rules that a plain comparison simply does not have.
		 * @param container - the browsing region root.
		 * @param key - e.g. `session:<id>` / `workspace:<id>` / `overflow:<id>`.
		 * @returns the element, or null.
		 */
		function findRowByKey(container, key) {
			try {
				for (const node of container.querySelectorAll(`[${REVEAL_ROW_KEY_ATTR}]`)) {
					if (node.getAttribute(REVEAL_ROW_KEY_ATTR) === key) return node;
				}
			} catch { /* a broken subtree must not become a thrown click */ }
			return null;
		}

		/** One paint's worth of waiting, so a click can commit before the row is looked for. */
		function nextPaint() {
			return new Promise((resolve) => {
				try {
					if (typeof window.requestAnimationFrame === "function") window.requestAnimationFrame(() => resolve());
					else window.setTimeout(resolve, 16);
				} catch { resolve(); }
			});
		}

		/** Install the flash rules once per page. */
		function ensureRevealFlashStyle() {
			try {
				if (document.getElementById(REVEAL_FLASH_STYLE_ID) !== null) return;
				const style = document.createElement("style");
				style.id = REVEAL_FLASH_STYLE_ID;
				style.textContent = REVEAL_FLASH_CSS;
				document.head.appendChild(style);
			} catch { /* styling is cosmetic; never let it reach a click */ }
		}

		/** Take the flash off, whoever put it there. Also the unload path. */
		function clearRevealFlash() {
			if (revealFlashTimer !== 0) {
				try { window.clearTimeout(revealFlashTimer); } catch { /* the page is going away */ }
				revealFlashTimer = 0;
			}
			if (revealFlashRow !== null) {
				try { revealFlashRow.removeAttribute(REVEAL_FLASH_ATTR); } catch { /* already detached */ }
				revealFlashRow = null;
			}
		}

		/**
		 * Scroll one shipped row into view and light it for a moment.
		 *
		 * `block:"nearest"` is the official call and the reason a reveal does not yank the
		 * whole list: it moves the list only as far as the row needs.
		 * @param row - the session row element.
		 */
		function flashRow(row) {
			try {
				clearRevealFlash();
				ensureRevealFlashStyle();
				row.setAttribute(REVEAL_FLASH_ATTR, "1");
				revealFlashRow = row;
				revealFlashTimer = window.setTimeout(() => { clearRevealFlash(); }, REVEAL_FLASH_MS);
			} catch { /* cosmetic */ }
			try { row.scrollIntoView({ block: "nearest" }); } catch { /* older engines take no options */ }
		}

		/**
		 * Put one session's row in front of the reader.
		 *
		 * Best effort from the first line to the last: the session is ALREADY open when
		 * this runs, so every exit here — no container, no workspace id, a sidebar that
		 * never renders the row — costs the reader nothing but the scroll.
		 * @param sessionId - the session to locate.
		 * @param workspaceId - its workspace, when the official snapshot knows one.
		 */
		async function revealSessionRow(sessionId, workspaceId) {
			if (typeof sessionId !== "string" || sessionId === "") return;
			if (unreadConfig === null || typeof unreadConfig !== "object" || unreadConfig.revealOnOpen === false) return;
			const container = workspaceDotContainer();
			if (container === null) return;
			const wsKey = typeof workspaceId === "string" && workspaceId !== "" ? `workspace:${workspaceId}` : null;
			const moreKey = typeof workspaceId === "string" && workspaceId !== "" ? `overflow:${workspaceId}` : null;
			for (let steps = 0; steps < REVEAL_MAX_STEPS; steps++) {
				const row = findRowByKey(container, `session:${sessionId}`);
				const wsRow = wsKey === null ? null : findRowByKey(container, wsKey);
				const more = moreKey === null ? null : findRowByKey(container, moreKey);
				const action = revealAction({
					hasRow: row !== null,
					hasWorkspace: wsRow !== null,
					expanded: wsRow !== null && wsRow.getAttribute("aria-expanded") === "true",
					hasOverflow: more !== null,
					overflowExpanded: more !== null && more.getAttribute("aria-expanded") === "true",
					steps
				});
				if (action === "scroll") { flashRow(row); return; }
				if (action === "give-up") return;
				const target = action === "expand" ? wsRow : more;
				if (target === null) return;
				try { target.click(); } catch { return; }
				await nextPaint();
			}
		}
		//#endregion

		//#region workspace dots
		/**
		 * One dot on each workspace row's folder icon.
		 *
		 * This is the only part of the plugin that reaches into the shipped DOM: the
		 * browsing region is a single opaque seat (`sidebar.workspaces`, kind
		 * `single`) with no per-row slots, so a marker can only be injected. It is
		 * therefore built to fail quietly — see `noteWorkspaceDotFailure`, the
		 * give-up switch, and the `workspaceDot` setting that removes it entirely.
		 */
		const WS_DOT_ATTR = "data-icon-custom-wsdot";
		const ROW_DOT_ATTR = "data-icon-custom-rowdot";
		/** The running mark's two shapes: a dot after a session title (and on a folder icon), plus the header count. */
		const RUN_DOT_ATTR = "data-icon-custom-rundot";
		const RUN_WS_ATTR = "data-icon-custom-runws";
		/**
		 * How far the folder icon's red dot steps left when the yellow dot joins it.
		 *
		 * An 8px dot plus a 2px seam: the pair then still sits over the icon's right
		 * half instead of one of them hanging off into the workspace name. The red
		 * steps back the moment the yellow is gone, so the unread marker keeps its
		 * old place whenever it is alone.
		 */
		const WS_DOT_PAIR_SHIFT = 10;
		const WS_ROW_MIN_H = 18;
		const WS_ROW_MAX_H = 56;
		const WS_ROW_MIN_W = 80;
		const WS_MAX_FAILURES = 3;
		let workspaceDots = [];
		/** One entry per unread session: `{ id, title }`, matched against the row title. */
		let sessionDots = [];
		/** One entry per RUNNING session: `{ id, title }` — same shape, same row handle. */
		let runningSessionDots = [];
		/** One entry per workspace with running sessions: `{ id, name, count }`. */
		let runningWorkspaceMarks = [];
		let workspaceDotFailures = 0;
		let workspaceDotGivenUp = false;
		let workspaceDotPainting = false;
		/** When the last paint ran, so the observer can tell our churn from everyone else's. */
		let workspaceDotPaintedAt = 0;
		/** Pending "did our markers survive?" check, one shot per creation burst. */
		let workspaceDotVerify = 0;
		/** Rows whose inline `position` we changed, and what it was before. */
		let workspaceDotRestores = [];
		const workspaceDotListeners = new Set();
		function emitSidebarMarks(marks) {
			const next = marks !== null && typeof marks === "object" ? marks : {};
			workspaceDots = Array.isArray(next.workspaces) ? next.workspaces : [];
			sessionDots = Array.isArray(next.sessions) ? next.sessions : [];
			// The running marks ride the same store and the same paint pass as the
			// unread ones, but they are a different feature: they carry their own
			// arrays, and whichever switch is off empties only its own.
			runningSessionDots = Array.isArray(next.runningSessions) ? next.runningSessions : [];
			runningWorkspaceMarks = Array.isArray(next.runningWorkspaces) ? next.runningWorkspaces : [];
			workspaceDotListeners.forEach((fn) => { try { fn(); } catch {} });
		}
		function subscribeSidebarMarks(fn) {
			workspaceDotListeners.add(fn);
			return () => { workspaceDotListeners.delete(fn); };
		}
		/** The shipped browsing region, by the official slot marker (never by class name). */
		function workspaceDotContainer() {
			return document.querySelector('[data-slot="sidebar.workspaces"]')
				|| document.querySelector('[data-slot="sidebar"]')
				|| null;
		}
		function clearWorkspaceDots() {
			try { document.querySelectorAll("[" + WS_DOT_ATTR + "],[" + ROW_DOT_ATTR + "],[" + RUN_DOT_ATTR + "],[" + RUN_WS_ATTR + "]").forEach((node) => node.remove()); } catch {}
			for (const entry of workspaceDotRestores) { try { entry.el.style.position = entry.position; } catch {} }
			workspaceDotRestores = [];
		}
		function noteWorkspaceDotFailure(why) {
			workspaceDotFailures++;
			if (workspaceDotFailures === 1) {
				try { console.warn("dsh-icon-custom: 工作区红点定位失败,已降级(不影响其他功能):", why); } catch {}
				return;
			}
			if (workspaceDotFailures < WS_MAX_FAILURES || workspaceDotGivenUp) return;
			workspaceDotGivenUp = true;
			try { console.warn("dsh-icon-custom: 工作区红点连续失败,本次会话内已自动关闭,可在设置里关掉这一项。"); } catch {}
			// Take the markers OUT rather than leaving them frozen: a stale red dot
			// that no longer reflects the rule (or that can never be cleared) is worse
			// than no marker at all, and "breaks down to not showing" is this feature's
			// stated posture.
			clearWorkspaceDots();
		}
		/** The marker already sitting in this host for that key, or null. */
		function existingMarker(host, attribute, key) {
			for (const child of host.children) {
				if (child.getAttribute(attribute) === key) return child;
			}
			return null;
		}
		/** The one element whose trimmed text is exactly this name, or null. */
		function labelElementFor(container, name) {
			const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
			let hit = null;
			let hits = 0;
			let node = walker.nextNode();
			while (node !== null) {
				if (node.nodeValue !== null && node.nodeValue.trim() === name) { hits++; hit = node.parentElement; }
				node = walker.nextNode();
			}
			return hits === 1 ? hit : null;
		}
		/**
		 * The row box + folder icon a marker should hang off.
		 *
		 * Walks up from the label until it finds a row-sized box that ALSO contains an
		 * icon sitting left of the text — the only shape that means "this is the
		 * workspace row". Requiring that icon is load-bearing: without it the label
		 * itself (or any wider wrapper) qualifies as the row, and the marker lands at
		 * the end of the text instead of on the icon.
		 * @returns `{ row, icon }`, or null when this row cannot be trusted.
		 */
		function markerTargetFor(label) {
			const labelRect = label.getBoundingClientRect();
			let element = label;
			for (let step = 0; step < 6 && element !== null && element !== undefined; step++) {
				const icon = element.querySelector("svg");
				if (icon !== null) {
					const rect = element.getBoundingClientRect();
					const iconRect = icon.getBoundingClientRect();
					if (rect.height >= WS_ROW_MIN_H && rect.height <= WS_ROW_MAX_H && rect.width >= WS_ROW_MIN_W && iconRect.left < labelRect.left) {
						return { row: element, icon };
					}
				}
				element = element.parentElement;
			}
			return null;
		}
		/**
		 * The title element a session marker hangs off.
		 *
		 * A session row has no icon to anchor on, so its marker is inserted inline right
		 * after the title. That only works when `label` is the TIGHT holder of the title
		 * text: a wrapper that merely contains it would push the marker past the
		 * timestamp, and a row holding the text directly has no inline slot at all.
		 * @returns `{ title, row }`, or null when this row cannot be trusted.
		 */
		function titleTargetFor(label, title) {
			if (label === null || label === undefined) return null;
			if (typeof label.textContent !== "string" || label.textContent.trim() !== title) return null;
			const row = label.parentElement;
			if (row === null || row === undefined || row === label) return null;
			const rect = row.getBoundingClientRect();
			if (rect.height < WS_ROW_MIN_H || rect.height > WS_ROW_MAX_H || rect.width < WS_ROW_MIN_W) return null;
			return { title: label, row };
		}
		/**
		 * The DOM row of one session, by the official row key.
		 *
		 * ui-workspace stamps every row with `data-row-key` (`session:<id>`,
		 * `workspace:<id>`, `overflow:<id>`), which is the only stable, unambiguous
		 * handle on a row: titles are neither unique (two sessions can share one) nor
		 * stable (a generated title lands later). Matching by title text used to find
		 * two rows and refuse, so a session whose title collided with another's could
		 * never be marked at all.
		 * @param container - the browsing region root.
		 * @param id - the session id.
		 * @returns the row element, or null.
		 */
		function sessionRowElement(container, id) {
			if (typeof id !== "string" || id === "") return null;
			try { return container.querySelector(`[data-row-key="session:${id}"]`); } catch { return null; }
		}
		/**
		 * Where one session's marker goes: the tight title holder INSIDE that
		 * session's own row. The row is found by `data-row-key`; the title inside it
		 * is still matched by text, because that is the element the marker hangs off.
		 *
		 * A Session whose row is NOT in the DOM — folded behind "Show more", inside a
		 * collapsed Workspace, or filtered out — gets NO marker. It used to fall back
		 * to a whole-region title match, and that guess is exactly what puts a dot on
		 * the wrong row: a DIFFERENT Session with the same title owns the only
		 * rendered text node of that name, so the folded one's marker landed on the
		 * visible one's row (two markers on one row, none on the real one). The
		 * Workspace folder dot and the pending panel already speak for Sessions whose
		 * rows are not rendered, so skipping loses no information.
		 *
		 * `legacyTitleMatch` is reserved for a build that stamps no row keys at all,
		 * where the title is the only handle that exists.
		 * @param legacyTitleMatch - whether this build predates `data-row-key`.
		 * @returns `{ title, row }`, or null when this row cannot be trusted.
		 */
		function sessionRowTarget(container, id, title, legacyTitleMatch) {
			const row = sessionRowElement(container, id);
			if (row !== null) {
				const inside = labelElementFor(row, title);
				return inside === null ? null : titleTargetFor(inside, title);
			}
			if (legacyTitleMatch !== true) return null;
			return titleTargetFor(labelElementFor(container, title), title);
		}
		/**
		 * Whether the shipped browser stamps Session rows with `data-row-key`.
		 *
		 * Asked once per paint, not once per row: the strict path is only relaxed for
		 * a build that has no row keys anywhere, never for one unlucky lookup.
		 * @param container - the browsing region root (non-null).
		 * @returns true when row keys are in use (and on any probe failure — the
		 * strict path is the safe default).
		 */
		function sessionRowKeysInUse(container) {
			try { return container.querySelector('[data-row-key^="session:"]') !== null; } catch { return true; }
		}
		/**
		 * The DOM row of one Workspace, by the official row key, or null.
		 *
		 * Same handle as `sessionRowElement`, and the reason the folder dot no longer
		 * depends on the displayed name: DSH renders a Workspace still carrying its
		 * automatic title under a localized default name, and two Workspaces can share
		 * one title, so a text match can miss or collide.
		 * @param container - the browsing region root.
		 * @param id - the Workspace id.
		 * @returns the row element, or null.
		 */
		function workspaceRowElement(container, id) {
			if (typeof id !== "string" || id === "") return null;
			try { return container.querySelector(`[data-row-key="workspace:${id}"]`); } catch { return null; }
		}
		/**
		 * The row box + folder icon a Workspace marker hangs off, from the keyed row.
		 *
		 * The key normally sits on the row itself; a build that stamps it on a group
		 * wrapper fails the row-size check, so a bounded set of that wrapper's own rows
		 * gets the same test before giving up. Either way the marker must land on a
		 * row-sized box whose LEADING glyph is the folder — requiring a left-hand icon
		 * is what keeps the dot off the end of the text.
		 * @returns `{ row, icon }`, or null when this row cannot be trusted.
		 */
		function folderTargetFor(row) {
			if (row === null || row === undefined) return null;
			const candidates = [row];
			try {
				const inner = row.querySelectorAll("div");
				for (let i = 0; i < inner.length && candidates.length < 12; i++) candidates.push(inner[i]);
			} catch { /* the keyed element alone is still worth testing */ }
			for (const candidate of candidates) {
				const rect = candidate.getBoundingClientRect();
				if (rect.height < WS_ROW_MIN_H || rect.height > WS_ROW_MAX_H || rect.width < WS_ROW_MIN_W) continue;
				const icons = candidate.querySelectorAll("svg");
				for (const icon of icons) {
					const iconRect = icon.getBoundingClientRect();
					if (iconRect.width <= 0 || iconRect.height <= 0) continue;
					if (iconRect.left - rect.left > rect.width / 3) continue;
					return { row: candidate, icon };
				}
			}
			return null;
		}
		/**
		 * The stable key a Workspace marker is stored under: its ID when known.
		 *
		 * The attribute value used to be the displayed title, which two Workspaces can
		 * share — the reconcile pass would then treat one of them as a stranger and
		 * remove a marker that is still wanted.
		 * @param entry - one `{ id, name }` entry from `dotsFromItems`.
		 * @returns the key, or undefined when the entry carries neither.
		 */
		function workspaceDotKey(entry) {
			if (entry === null || typeof entry !== "object") return undefined;
			if (typeof entry.id === "string" && entry.id !== "") return entry.id;
			return entry.name;
		}
		function paintWorkspaceDots() {
			if (workspaceDotGivenUp) return;
			const enabled = unreadConfig.workspaceDot !== false;
			const wanted = enabled ? workspaceDots : [];
			const wantedRows = enabled ? sessionDots : [];
			// A separate switch for a separate feature: the running marks keep working
			// when the unread dots are turned off, and vice versa.
			const runningEnabled = runningConfig.enabled !== false;
			const wantedRunningRows = runningEnabled ? runningSessionDots : [];
			const wantedRunningMarks = runningEnabled ? runningWorkspaceMarks : [];
			const container = workspaceDotContainer();
			workspaceDotPainting = true;
			workspaceDotPaintedAt = Date.now();
			let placed = 0;
			let created = 0;
			let missed = 0;
			try {
				// Reconcile, never wipe-and-redraw: a marker that is already correct is
				// left untouched, so one unlucky lookup (a re-render in flight, a name
				// matched twice for a moment) can no longer blink an existing dot away.
				const wantedNames = new Set(wanted.map((entry) => workspaceDotKey(entry)));
				const wantedIds = new Set(wantedRows.map((entry) => entry.id));
				const wantedRunningIds = new Set(wantedRunningRows.map((entry) => entry.id));
				const wantedRunningNames = new Set(wantedRunningMarks.map((entry) => workspaceDotKey(entry)));
				document.querySelectorAll("[" + WS_DOT_ATTR + "]").forEach((node) => {
					if (!node.isConnected || !wantedNames.has(node.getAttribute(WS_DOT_ATTR))) node.remove();
				});
				document.querySelectorAll("[" + ROW_DOT_ATTR + "]").forEach((node) => {
					if (!node.isConnected || !wantedIds.has(node.getAttribute(ROW_DOT_ATTR))) node.remove();
				});
				document.querySelectorAll("[" + RUN_DOT_ATTR + "]").forEach((node) => {
					if (!node.isConnected || !wantedRunningIds.has(node.getAttribute(RUN_DOT_ATTR))) node.remove();
				});
				document.querySelectorAll("[" + RUN_WS_ATTR + "]").forEach((node) => {
					if (!node.isConnected || !wantedRunningNames.has(node.getAttribute(RUN_WS_ATTR))) node.remove();
				});
				if (container === null) { workspaceDotPainting = false; return; } // start-up race
				const legacyTitleMatch = !sessionRowKeysInUse(container);
				for (const entry of wanted) {
					const key = workspaceDotKey(entry);
					if (key === undefined) { missed++; continue; }
					// The browser's own row key first; the title walk-up is only for a build
					// that stamps no Workspace keys (or an entry the snapshot could not name).
					const keyedRow = workspaceRowElement(container, entry.id);
					let target = keyedRow === null ? null : folderTargetFor(keyedRow);
					if (target === null && keyedRow === null) {
						const label = labelElementFor(container, entry.name);
						target = label === null ? null : markerTargetFor(label);
					}
					if (target === null) { missed++; continue; }
					const row = target.row;
					const icon = target.icon;
					const rowRect = row.getBoundingClientRect();
					const anchorRect = icon.getBoundingClientRect();
					if (window.getComputedStyle(row).position === "static") {
						workspaceDotRestores.push({ el: row, position: row.style.position });
						row.style.position = "relative";
					}
					// "Left red, right yellow": the yellow takes the corner this dot has
					// always used, and the red steps one dot to the left while the pair is
					// together (and steps back the moment the yellow is gone).
					const paired = existingMarker(row, RUN_WS_ATTR, key) !== null;
					const left = Math.round(anchorRect.right - rowRect.left - 4 - (paired ? WS_DOT_PAIR_SHIFT : 0));
					const top = Math.round(anchorRect.top - rowRect.top - 3);
					const existingDot = existingMarker(row, WS_DOT_ATTR, key);
					if (existingDot !== null) {
						if (existingDot.style.left !== left + "px") existingDot.style.left = left + "px";
						if (existingDot.style.top !== top + "px") existingDot.style.top = top + "px";
						placed++;
						continue;
					}
					const dot = document.createElement("span");
					dot.setAttribute(WS_DOT_ATTR, key);
					dot.setAttribute("aria-hidden", "true");
					dot.title = (typeof entry.name === "string" && entry.name !== "" ? entry.name : key) + " · " + entry.count;
					dot.style.cssText = "position:absolute;pointer-events:none;width:8px;height:8px;border-radius:50%;"
						+ "background:#e5484d;box-shadow:0 0 0 1.5px var(--dsw-alias-bg-layer-1,#fff);";
					dot.style.left = left + "px";
					dot.style.top = top + "px";
					row.appendChild(dot);
					placed++;
					created++;
				}
				// Workspace rows: the running mark is a yellow DOT on the folder icon
				// (the count lives in the section header, where a number is readable).
				// "Left red, right yellow": the yellow takes the corner the red has
				// always used and the red steps aside by exactly one dot.
				for (const entry of wantedRunningMarks) {
					const key = workspaceDotKey(entry);
					if (key === undefined) { missed++; continue; }
					const keyedRow = workspaceRowElement(container, entry.id);
					const target = keyedRow === null ? null : folderTargetFor(keyedRow);
					if (target === null) { missed++; continue; }
					const row = target.row;
					const runDot = existingMarker(row, RUN_WS_ATTR, key);
					const icon = target.icon;
					const rowRect = row.getBoundingClientRect();
					const anchorRect = icon.getBoundingClientRect();
					if (window.getComputedStyle(row).position === "static") {
						workspaceDotRestores.push({ el: row, position: row.style.position });
						row.style.position = "relative";
					}
					const corner = Math.round(anchorRect.right - rowRect.left - 4);
					const top = Math.round(anchorRect.top - rowRect.top - 3);
					// The red keeps the pair's LEFT seat. It is nudged here as well as in
					// its own loop because on the first paint it cannot see a yellow that
					// does not exist yet — both places compute the same number, so the
					// pair never oscillates.
					const red = existingMarker(row, WS_DOT_ATTR, key);
					if (red !== null) {
						const redLeft = corner - WS_DOT_PAIR_SHIFT;
						if (red.style.left !== redLeft + "px") red.style.left = redLeft + "px";
						if (red.style.top !== top + "px") red.style.top = top + "px";
					}
					if (runDot !== null) {
						if (runDot.style.left !== corner + "px") runDot.style.left = corner + "px";
						if (runDot.style.top !== top + "px") runDot.style.top = top + "px";
						placed++;
						continue;
					}
					const mark = document.createElement("span");
					mark.setAttribute(RUN_WS_ATTR, key);
					mark.setAttribute("aria-hidden", "true");
					mark.title = (entry.name !== "" ? entry.name : key) + " · " + entry.count;
					mark.style.cssText = "position:absolute;pointer-events:none;width:8px;height:8px;border-radius:50%;"
						+ "background:" + RUNNING_YELLOW + ";box-shadow:0 0 0 1.5px var(--dsw-alias-bg-layer-1,#fff);";
					mark.style.left = corner + "px";
					mark.style.top = top + "px";
					row.appendChild(mark);
					placed++;
					created++;
				}
				// Session rows: RED first, then YELLOW — "left red, right yellow", and a
				// fixed order no matter which of the two features changed last.
				for (const entry of wantedRows) {
					const target = sessionRowTarget(container, entry.id, entry.title, legacyTitleMatch);
					if (target === null) { missed++; continue; }
					const existing = existingMarker(target.row, ROW_DOT_ATTR, entry.id);
					if (existing !== null) {
						// Both markers can survive a repaint; keep the red in front of the
						// yellow (a red painted while the yellow was gone would otherwise
						// stay glued to the title).
						const runDot = existingMarker(target.row, RUN_DOT_ATTR, entry.id);
						if (runDot !== null && existing.nextElementSibling !== runDot) existing.insertAdjacentElement("afterend", runDot);
						placed++;
						continue;
					}
					const dot = document.createElement("span");
					dot.setAttribute(ROW_DOT_ATTR, entry.id);
					dot.setAttribute("aria-hidden", "true");
					dot.title = entry.title;
					// Tight to the title on the left, and kept off the timestamp on the
					// right: with no right margin the dot reads as part of "24 分钟".
					dot.style.cssText = "pointer-events:none;flex:none;width:8px;height:8px;border-radius:50%;"
						+ "background:#e5484d;margin:0 5px 0 6px;";
					target.title.insertAdjacentElement("afterend", dot);
					placed++;
					created++;
				}
				for (const entry of wantedRunningRows) {
					const target = sessionRowTarget(container, entry.id, entry.title, legacyTitleMatch);
					if (target === null) { missed++; continue; }
					if (existingMarker(target.row, RUN_DOT_ATTR, entry.id) !== null) { placed++; continue; }
					const runDot = document.createElement("span");
					runDot.setAttribute(RUN_DOT_ATTR, entry.id);
					runDot.setAttribute("aria-hidden", "true");
					runDot.title = entry.title;
					runDot.style.cssText = "pointer-events:none;flex:none;width:8px;height:8px;border-radius:50%;"
						+ "background:" + RUNNING_YELLOW + ";margin:0 4px 0 0;";
					const red = existingMarker(target.row, ROW_DOT_ATTR, entry.id);
					if (red !== null) red.insertAdjacentElement("afterend", runDot);
					else target.title.insertAdjacentElement("afterend", runDot);
					placed++;
					created++;
				}
			} catch (error) {
				missed++;
				noteWorkspaceDotFailure(String((error && error.message) || error));
			} finally {
				workspaceDotPainting = false;
			}
			// The breaker watches the MECHANISM, not one unlucky row: only a run that
			// placed nothing at all counts as a failure.
			if (placed > 0) workspaceDotFailures = 0;
			else if (missed > 0) noteWorkspaceDotFailure("这一轮没有任何工作区行能定位:" + missed + " 个");
			// If the shipped UI committed a re-render inside our quiet window it could
			// have taken a fresh marker with it, and we would have ignored that
			// mutation. One settle check shortly after closes that hole.
			if (created > 0) {
				if (workspaceDotVerify !== 0) window.clearTimeout(workspaceDotVerify);
				workspaceDotVerify = window.setTimeout(() => { workspaceDotVerify = 0; paintWorkspaceDots(); }, 700);
			}
		}
		//#endregion

		//#region header ring
		/**
		 * One yellow ring on the conversation header's sub-agent count.
		 *
		 * The official "N sub-agents" row is a `button[aria-haspopup="tree"]` inside
		 * the `conversation.session.header.actions` slot, and its count is the LAST
		 * `<span>` child of that button. The ring is stacked on that span's top-right
		 * corner — the same corner logic as the workspace folder's yellow dot — and it
		 * is display only: not clickable, `pointer-events:none`, `aria-hidden` because
		 * the official button's own label already announces the running count.
		 *
		 * The number is the official `subagentCatalog` projection of the session on
		 * screen, counting only DIRECT children that are running. It never joins any
		 * other count this plugin draws (sidebar dots, the top-left number, the tab
		 * icon, the OS badge), so this switch can never move one of them.
		 *
		 * Class names are build hashes and are never used; the anchor is found by the
		 * official `data-slot` plus structure/role only. Like the sidebar marks this
		 * half is injected into shipped DOM, reconciled instead of redrawn, quiet when
		 * it cannot find the anchor, and self-disabling after repeated failures.
		 */
		const HEAD_RING_ATTR = "data-icon-custom-headring";
		/** Marks the count element whose inline `position` we changed, for restore. */
		const HEAD_RING_HOST_ATTR = "data-icon-custom-headring-host";
		/** Breaker ceiling: a changed header structure must not warn forever. */
		const HEAD_RING_MAX_FAILURES = 20;
		/** The number for the session on screen; -1 means "no answer, draw nothing". */
		let headerRingValue = -1;
		let headerRingFailures = 0;
		let headerRingGivenUp = false;
		let headerRingHost = null;
		let headerRingHostPosition = "";
		let headerRingObserved = null;
		let headerRingObserver = null;
		/** The session service lookup, filled in by `apply` (may stay null). */
		let headerRingSessions = null;
		/** Throttle for the "catalog projection not loaded yet" refresh ask. */
		let headerRingRefreshSession = "";
		let headerRingRefreshAt = 0;

		/**
		 * How many DIRECT children of `sessionId` are running, from the official
		 * `subagentCatalog` projection.
		 *
		 * Grandchildren are not part of a parent's catalog, so they are excluded by
		 * construction. `status` (the official session-status map) wins over the list
		 * row exactly the way the shipped sidebar reads it. An unloaded projection is
		 * 0, never a guess.
		 * @param list - the session list snapshot (may be absent).
		 * @param status - the official session-status map (may be absent).
		 * @param sessionId - the session whose header is on screen.
		 * @returns the count of running direct children.
		 */
		function headerRingCount(list, status, sessionId) {
			if (typeof sessionId !== "string" || sessionId === "") return 0;
			if (list === null || typeof list !== "object") return 0;
			const projections = list.projectionsBySession;
			if (projections === null || typeof projections !== "object") return 0;
			const snapshot = projections[sessionId];
			const values = snapshot !== null && typeof snapshot === "object" ? snapshot.values : undefined;
			const catalog = values !== null && typeof values === "object" ? values.subagentCatalog : undefined;
			if (!Array.isArray(catalog)) return 0;
			const byId = list.byId !== null && typeof list.byId === "object" ? list.byId : {};
			const lookup = status !== null && status !== undefined && typeof status.get === "function" ? (id) => status.get(id) : () => undefined;
			let count = 0;
			for (const entry of catalog) {
				if (entry === null || typeof entry !== "object" || typeof entry.id !== "string" || entry.id === "") continue;
				const row = lookup(entry.id);
				const known = row !== null && typeof row === "object" && typeof row.running === "boolean";
				const fallback = byId[entry.id];
				const running = known ? row.running : fallback !== null && typeof fallback === "object" ? fallback.running : undefined;
				if (running === true) count++;
			}
			return count;
		}

		/**
		 * Whether that session's catalog projection is loaded at all. `undefined`
		 * means "not asked yet" — the one case worth nudging the host about (see
		 * `requestHeaderRingRefresh`); an empty array is a real answer.
		 */
		function headerRingCatalogLoaded(list, sessionId) {
			if (list === null || typeof list !== "object" || typeof sessionId !== "string" || sessionId === "") return false;
			const projections = list.projectionsBySession;
			const snapshot = projections !== null && typeof projections === "object" ? projections[sessionId] : undefined;
			const values = snapshot !== null && typeof snapshot === "object" ? snapshot.values : undefined;
			return values !== null && typeof values === "object" && Array.isArray(values.subagentCatalog);
		}

		/**
		 * Ask the host to fold that session's projections, at most once per 10 s. The
		 * service lookup is optional (`apply` fills it in): without it the next render
		 * simply tries again, which is the documented fallback.
		 */
		function requestHeaderRingRefresh(sessionId) {
			const now = Date.now();
			if (sessionId === headerRingRefreshSession && now - headerRingRefreshAt < 10000) return;
			headerRingRefreshSession = sessionId;
			headerRingRefreshAt = now;
			try {
				const service = typeof headerRingSessions === "function" ? headerRingSessions() : null;
				const refresh = service !== null && service !== undefined ? service.refreshProjections : undefined;
				if (typeof refresh !== "function") return;
				const result = refresh.call(service, sessionId);
				if (result !== null && typeof result === "object" && typeof result.catch === "function") result.catch(() => {});
			} catch { /* best effort: the next render is the fallback */ }
		}

		/** The rendered action button for the session on screen, or null. */
		function headerRingButton() {
			try {
				const slots = document.querySelectorAll('[data-slot="conversation.session.header.actions"]');
				if (slots === null || slots === undefined) return null;
				for (const slot of slots) {
					// The right sidebar keeps an embedded conversation MOUNTED while
					// collapsed (hidden by CSS and `inert`), so its header actions must
					// never be the anchor for the visible conversation's ring. Same guard
					// as `conversationOnScreen` uses for the same duplicate.
					if (typeof slot.closest === "function" && (slot.closest("[data-sidebar-right-panel]") !== null || slot.closest("[inert]") !== null)) continue;
					if (typeof slot.querySelectorAll !== "function") continue;
					for (const button of slot.querySelectorAll("button")) {
						if (button.getAttribute("aria-haspopup") === "tree") return button;
					}
				}
				return null;
			} catch { return null; }
		}

		/** The count element: the LAST `<span>` direct child of that button. */
		function headerRingCountElement(button) {
			let found = null;
			if (button === null || button === undefined || button.children === undefined) return null;
			for (const child of button.children) {
				if (child === null || child === undefined || child.tagName !== "SPAN") continue;
				if (child.getAttribute(HEAD_RING_ATTR) !== null) continue;
				found = child;
			}
			return found;
		}

		/**
		 * Whether the decoration must stay off this conversation. A sub-agent's own
		 * session renders no header row at all, so it must render no ring either.
		 */
		function headerRingSuppressed(list, sessionId) {
			if (typeof sessionId !== "string" || sessionId === "") return true;
			if (list === null || typeof list !== "object") return true;
			const byId = list.byId !== null && typeof list.byId === "object" ? list.byId : {};
			const entry = byId[sessionId];
			// No row means the page cannot prove this is not a sub-agent's own
			// conversation: suppress rather than draw on a page we cannot read.
			if (entry === null || typeof entry !== "object") return true;
			return entry.origin === "subagent";
		}

		/**
		 * The effective number to draw. `-1` (no answer) and `0` both mean "draw
		 * nothing"; the switch is the only other input. Pure, so the switch and the
		 * zero case are testable without a DOM.
		 */
		function headerRingVisibleCount(config, count) {
			const enabled = !(config !== null && typeof config === "object" && config.headerRing === false);
			if (!enabled) return -1;
			const value = Number(count);
			return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
		}

		/** Remove the ring and put the count element's own `position` back. */
		function clearHeaderRing() {
			try { document.querySelectorAll("[" + HEAD_RING_ATTR + "]").forEach((node) => node.remove()); } catch {}
			if (headerRingHost !== null) {
				try { headerRingHost.style.position = headerRingHostPosition; } catch {}
				try { headerRingHost.removeAttribute(HEAD_RING_HOST_ATTR); } catch {}
			}
			headerRingHost = null;
			headerRingHostPosition = "";
			if (headerRingObserver !== null) {
				try { headerRingObserver.disconnect(); } catch {}
				headerRingObserver = null;
			}
			headerRingObserved = null;
		}

		/** Watch the header slot, so a re-render that dropped the ring gets it back. */
		function observeHeaderRingAnchor(button) {
			if (typeof window === "undefined" || window === null || typeof window.MutationObserver !== "function") return;
			const slot = button !== null && typeof button.closest === "function" ? button.closest('[data-slot="conversation.session.header.actions"]') : null;
			if (slot === null || slot === undefined || slot === headerRingObserved) return;
			try {
				if (headerRingObserver !== null) headerRingObserver.disconnect();
				headerRingObserver = new window.MutationObserver(() => { repaintHeaderRing(); });
				headerRingObserver.observe(slot, { childList: true, subtree: true, characterData: true });
				headerRingObserved = slot;
			} catch {
				headerRingObserver = null;
				headerRingObserved = null;
			}
		}

		/** Re-run the current value; used by the observer, which has no arguments. */
		function repaintHeaderRing() {
			paintHeaderRing(runningConfig, headerRingValue);
		}

		/** Warn once, then give up for this page — the sidebar marks' exact posture. */
		function noteHeaderRingFailure(why) {
			headerRingFailures++;
			if (headerRingFailures === 1) {
				try { console.warn("dsh-icon-custom: 会话头部黄圈定位失败,已降级(不影响其他功能):", why); } catch {}
				return;
			}
			if (headerRingFailures < HEAD_RING_MAX_FAILURES || headerRingGivenUp) return;
			headerRingGivenUp = true;
			try { console.warn("dsh-icon-custom: 会话头部黄圈连续失败,本次会话内已自动关闭。"); } catch {}
			clearHeaderRing();
		}

		/**
		 * Reconcile the ring with the current number. Idempotent (writes only what
		 * differs) and quiet when the anchor is not on this page (a sub-agent's own
		 * conversation, the landing view, a boot).
		 * @param config - the running config, for the `headerRing` switch.
		 * @param count - the ring's number, from `headerRingCount`; -1 hides it.
		 */
		function paintHeaderRing(config, count) {
			if (headerRingGivenUp) return;
			const value = headerRingVisibleCount(config, count);
			if (value <= 0) { clearHeaderRing(); return; }
			const button = headerRingButton();
			// No anchor is not a failure: child sessions render no header row, and the
			// page may simply be booting. Leave whatever is there alone and wait.
			if (button === null) { clearHeaderRing(); return; }
			const anchor = headerRingCountElement(button);
			if (anchor === null) { noteHeaderRingFailure("找不到计数元素"); return; }
			try {
				if (headerRingHost !== anchor) {
					clearHeaderRing();
					headerRingHost = anchor;
					headerRingHostPosition = anchor.style.position;
					anchor.setAttribute(HEAD_RING_HOST_ATTR, "1");
					if (window.getComputedStyle(anchor).position === "static") anchor.style.position = "relative";
				}
				observeHeaderRingAnchor(button);
				let node = anchor.querySelector("[" + HEAD_RING_ATTR + "]");
				if (node === null) {
					node = document.createElement("span");
					node.setAttribute(HEAD_RING_ATTR, "1");
					// Not a control and never announced: the official button's own label
					// already speaks the running count.
					node.setAttribute("aria-hidden", "true");
					// Looks like the sidebar workspace's red count: a rounded-square pill (never a
					// full circle), with a dark number on the running yellow.
					node.style.cssText = "position:absolute;pointer-events:none;top:-6px;right:-5px;display:inline-flex;"
						+ "align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;box-sizing:border-box;"
						+ "border-radius:6px;background:" + RUNNING_YELLOW + ";color:#1f2328;font:inherit;font-size:11px;"
						+ "font-weight:600;line-height:16px;font-variant-numeric:tabular-nums;z-index:3;"
						+ "box-shadow:0 0 0 1.5px var(--dsw-alias-bg-layer-1,#fff)";
					anchor.appendChild(node);
				}
				const text = badgeLabel(value);
				if (node.textContent !== text) node.textContent = text;
				headerRingFailures = 0;
			} catch (error) {
				noteHeaderRingFailure(String((error && error.message) || error));
			}
		}
		//#endregion

		//#region components
		/**
		 * Headless occupant of the frame-wide `shell.overlay` slot. It reads DSH's
		 * own pending-interaction registry — the very same source that paints the
		 * sidebar session-row marker — and feeds "how many sessions are waiting for
		 * you" into the badge bridge. Renders nothing.
		 *
		 * This is the entire integration: an official standard prop goes in, a
		 * number comes out. The icon plugin never learns which plugin published an
		 * interaction, so swapping or removing any of them cannot break it — the
		 * count simply drops back to 0.
		 */
		function BadgeSource(props) {
			// The hooks below are official root-scope standard props: the session list
			// (which carries every session's `lastTurnEnd` projection value), the
			// session-status map the sidebar row marker already uses, and the workspace
			// snapshot that names each row.
			const list = typeof props.useSessions === "function" ? props.useSessions((state) => state) : undefined;
			// 0.2.x has no `useSessionPendingInteraction` — the string occurs nowhere in
			// the runtime, so this half used to contribute nothing at all. The official
			// replacement is the session-status map, whose rows carry `pendingInteraction`
			// (alongside `completionUnread`, which the shipped sidebar reads too). Reshape
			// it into the `id → { kind }` map `collectUnread` expects.
			const status = typeof props.useSessionStatus === "function" ? props.useSessionStatus((map) => map) : undefined;
			const pending = React.useMemo(() => {
				const out = new Map();
				if (status === null || status === undefined || typeof status.forEach !== "function") return out;
				status.forEach((value, id) => {
					const interaction = value !== null && typeof value === "object" ? value.pendingInteraction : undefined;
					if (interaction === null || interaction === undefined) return;
					const kind = typeof interaction === "object" && typeof interaction.kind === "string" ? interaction.kind : "";
					out.set(id, { kind });
				});
				return out;
			}, [status]);
			const workspaces = typeof props.useWorkspaces === "function" ? props.useWorkspaces((state) => state) : undefined;
			const [config, setConfig] = React.useState(unreadConfig);
			React.useEffect(() => subscribeUnreadConfig(setConfig), []);
			// The running mark's own switch. Same shape, separate feature: the two
			// never share state, so one switch can never move the other's marks.
			const [running, setRunning] = React.useState(runningConfig);
			React.useEffect(() => subscribeRunningConfig(setRunning), []);
			// Baseline new sessions; persists only when it actually learns something.
			React.useEffect(() => {
				const ids = list !== null && typeof list === "object" && Array.isArray(list.ids) ? list.ids : [];
				if (!ensureSeenBaseline(ids)) return;
				pruneSeenState();
				saveSeenState();
				// The watermark moved under a render that was already counted without it:
				// repaint in the same breath, exactly like the Host-merge path below, so
				// nothing on screen can keep a number the new baseline already answers.
				emitUnreadPoke();
			}, [list]);
			// What the page says about the screen, refreshed on the two moments that can
			// change it without the session list changing: a global panel replacing the
			// conversation (its own standard prop, the same one the shipped sidebar reads)
			// and the tab going to the background. Both are read here, not inferred, so
			// "you are looking at it" stops being a guess about stale retention.
			// Pausing signals, NOT leaving signals: they stop the stay clock without
			// touching which session this page is on (so the entered-at snapshot
			// survives). Only switching to another session counts as leaving.
			const panelActive = typeof props.usePanelInfo === "function"
				? props.usePanelInfo((info) => info !== null && typeof info === "object" && info.activePanelId !== null)
				: false;
			const [visible, setVisible] = React.useState(documentVisible);
			React.useEffect(() => {
				const onVisibility = () => setVisible(documentVisible());
				window.addEventListener("visibilitychange", onVisibility);
				return () => window.removeEventListener("visibilitychange", onVisibility);
			}, []);
			/** Looking at the conversation right now: on screen, and this tab in front. */
			const watching = visible && panelActive !== true;
			// Read the screen once per render: which session the visible conversation
			// renders (`displayed`), whether it is up but showing none (`idle` — the
			// landing view, a real "you are not in a session"), and whether it is not up
			// at all (neither ⇒ `known: false`, and the entered-at snapshots stay).
			const onScreen = conversationOnScreen();
			const viewed = viewedSessions(list, {
				displayed: onScreen.id,
				official: officialSessionId(),
				idle: onScreen.rendered === true && onScreen.id === undefined
			});
			const currentIds = viewed.ids;
			const stayKnown = viewed.known;
			const items = collectUnread(list, pending, config, seenState.seen, litUnreadIds);
			/**
			 * Map session → its Workspace from the official snapshot: the ID anchors the
			 * folder dot to the keyed row, the title is what the row displays (not always
			 * the cwd basename, and not always equal to the stored title either).
			 *
			 * The same map answers a second question: which workspace row to expand when a
			 * list row is clicked. The pending list only carries the cwd basename, which
			 * cannot be turned back into a workspace id.
			 */
			const owners = React.useMemo(() => {
				const out = {};
				const workspaceItems = workspaces !== null && typeof workspaces === "object" && Array.isArray(workspaces.items) ? workspaces.items : [];
				for (const workspace of workspaceItems) {
					if (workspace === null || typeof workspace !== "object") continue;
					if (!Array.isArray(workspace.sessionIds)) continue;
					const id = typeof workspace.workspaceId === "string" ? workspace.workspaceId : "";
					const title = typeof workspace.title === "string" ? workspace.title : "";
					for (const sessionId of workspace.sessionIds) out[sessionId] = { id, title };
				}
				return out;
			}, [workspaces]);
			/**
			 * The pending rows plus the workspace they belong to. A session the official
			 * snapshot places nowhere keeps its row untouched: `revealSessionRow` then has
			 * nothing to expand, which is the honest answer, not a guess.
			 */
			const itemsWithOwner = React.useMemo(() => items.map((item) => {
				const owner = owners[item.id];
				return owner === undefined || owner.id === "" ? item : { ...item, workspaceId: owner.id };
			}), [items, owners]);
			const count = items.length;
			// Being in a session is what marks it read — and the clock that does it is
			// armed by ENTERING the session, never by a new ending.
			//
			// `clearDelaySec` still means "stay this long before the ending counts as
			// seen" (0 = the moment you enter). What is new in 0.11.1 is WHEN the clock
			// takes its snapshot: the moment the session joins the view. An ending that
			// lands while you are already sitting there is therefore none of this
			// clock's business — it stays unread until you leave and come back. The
			// previous version re-armed on every new ending and chased the newest one,
			// so a turn that finished while you watched was auto-read `clearDelaySec`
			// seconds later: the dot for the session in front of you was a flash
			// nobody could catch. See docs/adr/0006-entry-bounded-stay-clock.md.
			//
			// Leaving tears the clock down, which is what makes the stay "continuous".
			// A reload restarts it too, since the timers only live in this page.
			//
			// One clock per session the main view shows: with two retained sessions,
			// marking only the first left the session you were reading unread forever.
			const stayIds = currentIds.slice().sort();
			const staySignature = stayIds.join("|");
			const delayMs = config.clearDelaySec * 1000;
			const [, bumpStay] = React.useState(0);
			// The panel can move the marks without going through this component
			// ("mark all read"); re-render so the number, the row dots and the tab
			// badge all follow immediately.
			const [, bumpPoke] = React.useState(0);
			React.useEffect(() => subscribeUnreadPoke(() => bumpPoke((n) => n + 1)), []);
			// The effect below is keyed on the signature, but the snapshot it marks is
			// taken from the CURRENT list; a ref is how it sees that list.
			const stayLive = React.useRef({ list });
			stayLive.current = { list };
			/**
			 * Entered-at snapshot: `id → endAt` as it stood when that session joined
			 * the view. Deliberately NOT refreshed while the session stays — that is
			 * the rule ("an ending during your stay waits for the next entry"). Only a
			 * session that LEAVES the view is forgotten, so coming back to it takes a
			 * fresh snapshot; pausing (background tab, a global panel) keeps both the
			 * session and its snapshot.
			 */
			const stayArmed = React.useRef(new Map());
			React.useEffect(() => {
				const snapshot = stayLive.current.list !== null && typeof stayLive.current.list === "object" && stayLive.current.list.byId !== null && typeof stayLive.current.list.byId === "object" ? stayLive.current.list.byId : {};
				// ONLY A KNOWN ANSWER MAY DROP A SNAPSHOT. A frame in which the page could
				// not name any session (a panel unmounting the conversation while the
				// official binding is unavailable, a DOM gap, a build without either
				// signal) is not a leave: forgetting the snapshot there is what made the
				// clock re-enter the session behind the reader's back and acknowledge an
				// ending that arrived while they were sitting in front of it.
				if (stayKnown !== false) {
					const live = new Set(stayIds);
					for (const id of Array.from(stayArmed.current.keys())) {
						if (!live.has(id)) stayArmed.current.delete(id);
					}
				}
				for (const id of stayIds) {
					if (!stayArmed.current.has(id)) stayArmed.current.set(id, lastTurnEndAt(snapshot[id]));
				}
				// Paused: nothing may be acknowledged while nobody is watching, but the
				// snapshots above stay put — that is what makes resuming continue the
				// same entry instead of silently re-entering it.
				if (staySignature === "" || watching !== true) return undefined;
				const armed = stayIds.map((id) => ({ id, endAt: stayArmed.current.get(id) }));
				let cancelled = false;
				let timer = 0;
				// Single-shot on purpose: the snapshot is fixed, so there is nothing to
				// chase. A newer ending found here belongs to the NEXT entry.
				const attempt = () => {
					if (cancelled) return;
					let changed = false;
					for (const target of armed) {
						if (typeof target.endAt !== "number" || target.endAt <= 0) continue;
						if (noteSeen(target.id, target.endAt)) changed = true;
					}
					if (changed) { saveSeenState(); bumpStay((n) => n + 1); }
				};
				if (delayMs <= 0) attempt();
				else timer = window.setTimeout(attempt, delayMs);
				return () => {
					cancelled = true;
					if (timer !== 0) window.clearTimeout(timer);
				};
			}, [staySignature, delayMs, watching, stayKnown]);
			React.useEffect(() => { emitRealBadge(count, itemsWithOwner); }, [count, itemsWithOwner]);
			/**
			 * One session's displayed title, the way the sidebar shows it.
			 *
			 * Kept in step with `collectUnread`'s own `titleOf`: the yellow dot is
			 * matched against the row's rendered text, so it must use the same
			 * `displayTitle` fallback the red dot uses, or a session whose generated
			 * title has not landed yet would get no yellow dot at all.
			 */
			const titleOf = (id, entry) => (entry !== null && typeof entry === "object" && typeof entry.displayTitle === "string" && entry.displayTitle !== "" ? entry.displayTitle : id);
			// The running fact, straight off the same two official props and with no
			// host round trip at all. `runningSignature` is what the marks effect below
			// depends on, so a list re-render with the same set of running sessions
			// does not repaint the sidebar.
			const runningIds = running.enabled === false ? [] : runningSessionIds(list, status);
			const byId = list !== null && typeof list === "object" && list.byId !== null && typeof list.byId === "object" ? list.byId : {};
			// The rows behind the yellow count, for the list it opens (`titleOf` +
			// the same workspace naming the pending list uses, so the two modes of the
			// panel cannot disagree about what a session is called or where it lives).
			const runningRows = runningIds.map((id) => ({ id, title: titleOf(id, byId[id]), where: sessionWhereOf(byId[id]), workspaceId: owners[id] === undefined ? "" : owners[id].id }));
			// Two keys for two consumers: the sidebar repaints on the SET OF IDS, while
			// the panel must also refresh when a title or a workspace changes.
			const runningSignature = runningIds.join("|");
			const runningRowSignature = runningItemsSignature(runningRows);
			const runningCount = runningIds.length;
			React.useEffect(() => { emitRunningState(runningCount, runningRows); }, [runningRowSignature]);
			// The conversation header's yellow ring: the session on screen, and ONLY
			// its direct children from the official `subagentCatalog`. A separate
			// number for a separate decoration — it never joins `runningIds`, so no
			// sidebar, tab or OS-badge count can move because of it.
			const ringSessionId = viewed.ids.length === 1 ? viewed.ids[0] : "";
			const ringSuppressed = headerRingSuppressed(list, ringSessionId);
			const ringCount = ringSuppressed ? -1 : headerRingCount(list, status, ringSessionId);
			const ringSignature = ringSessionId + "\u0000" + ringCount;
			React.useEffect(() => {
				headerRingValue = ringCount;
				// Not loaded yet is not "zero running": ask the host once, then let the
				// next render answer. Without a session service this is a quiet no-op.
				if (!ringSuppressed && !headerRingCatalogLoaded(list, ringSessionId)) requestHeaderRingRefresh(ringSessionId);
				paintHeaderRing(runningConfig, headerRingValue);
			}, [ringSignature, running.enabled, running.headerRing]);
			// The session rows, for naming the running ones the way the sidebar shows
			// them (`displayTitle`, the same fallback the red dots use).
			React.useEffect(() => {
				emitSidebarMarks({
					workspaces: dotsFromItems(items, owners),
					sessions: items.map((item) => ({ id: item.id, title: item.title })),
					// The same rows, the other fact. Both arrays travel together, so the
					// paint pass can put the yellow dot in front of the red one
					// deterministically instead of depending on which feature changed last.
					runningSessions: runningRows.map((row) => ({ id: row.id, title: row.title })),
					runningWorkspaces: runningWorkspaceDots(runningIds, owners)
				});
			}, [items, owners, runningSignature, running]);
			return null;
		}

		/**
		 * The unread badge, injected into the sidebar's section header.
		 *
		 * There is no slot to register into: `sidebar.workspaces` is a SINGLE slot
		 * owned by ui-workspace that covers the whole browsing region *including* its
		 * header, and shadowing it would mean reimplementing the shipped browser. So
		 * the badge is injected into the DOM — the same technique, the same contract,
		 * and the same failure posture as the workspace-row dots: decorative, never
		 * throws, and after repeated failures it gives up on its own with one warning.
		 *
		 * Placement is measured, not inherited, because the shipped CSS forbids the
		 * obvious approach: `.sectionHeader` is 36px tall with `overflow:hidden`, the
		 * label inside it is a 20px line box that is ALSO `overflow:hidden`, so a badge
		 * parented to the label and raised clear of the glyph is clipped to a sliver by
		 * the label's own overflow. The badge is therefore a SIBLING of the label,
		 * absolutely positioned over the label's top-right corner from its measured
		 * rect, and clamped so it never leaves the header's 36px box.
		 *
		 * The count is shown for EVERY value including zero: a grey 0 keeps the
		 * position from jumping, and doubles as the only way back to the panel once
		 * the old sidebar-foot button is gone. The YELLOW count, by contrast, has no
		 * zero state and is a button: with nothing running there is no list to open.
		 */
		const HEAD_BADGE_ATTR = "data-icon-custom-unreadbadge";
		/** The running count's own node in the same header row — bottom-right of the label. */
		const HEAD_RUN_ATTR = "data-icon-custom-runbadge";
		const HEAD_BADGE_STYLE_ID = "dsh-icon-custom-unreadbadge-css";
		const HEAD_BADGE_WIRED = "data-icon-custom-unreadbadge-wired";
		/** The yellow pill's own wiring flag — it is a button now, exactly like the red one. */
		const HEAD_RUN_WIRED = "data-icon-custom-runbadge-wired";
		const HEAD_BADGE_MAX_FAILURES = 40;
		/** How many ancestors to walk up looking for the header row. */
		const HEAD_BADGE_MAX_STEPS = 6;
		/** Raise above the label's top edge; the header only leaves 8px of headroom. */
		const HEAD_BADGE_RAISE = 7;
		/** Drop below the label's bottom edge; mirrors the raise, and still fits the 36px header. */
		const HEAD_RUN_DROP = 8;
		/** Overhang past the label's right edge. */
		const HEAD_BADGE_OVERHANG = 9;
		let headerBadgeHost = null;
		let headerBadgeHostPosition = "";
		let headerBadgeObserved = null;
		let headerBadgeObserver = null;
		let headerBadgeFailures = 0;
		let headerBadgeGivenUp = false;
		/** Locale binder, installed by `apply()` so the injected node can label itself. */
		let badgeT = null;

		/**
		 * Rules for the injected badge. A stylesheet rather than inline styles because
		 * hover and the theme-following ring cannot be expressed inline. Colours come
		 * from the official tokens wherever one exists:
		 *   * the red is the one this plugin has always drawn;
		 *   * the "nothing pending" grey is the official idle-state colour, so it
		 *     follows light/dark without naming either;
		 *   * the ring is the sidebar's own fill — that is what makes a badge sitting
		 *     on top of a glyph read as a badge instead of a smudge.
		 * The hit area grows sideways and downward only: there are just 8px above the
		 * label, so anything reaching further up is clipped by the header's overflow.
		 */
		const HEAD_BADGE_CSS = [
			`[${HEAD_BADGE_ATTR}]{position:absolute;display:none;align-items:center;justify-content:center;min-width:15px;height:15px;padding:0 3.5px;box-sizing:border-box;border:0;border-radius:999px;background:#e5484d;color:#fff;font:inherit;font-size:9.5px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.02em;cursor:pointer;z-index:3;box-shadow:0 0 0 1.5px var(--dsw-specific-sidebar-fill,#fff)}`,
			`[${HEAD_BADGE_ATTR}]::after{content:"";position:absolute;inset:0 -5px -5px -5px;border-radius:999px}`,
			`[${HEAD_BADGE_ATTR}]:hover{filter:brightness(1.12)}`,
			`[${HEAD_BADGE_ATTR}][data-zero="1"]{background:var(--dsw-alias-state-idle-primary,#b6bcc4)}`,
			// The running count: same pill, other corner, and now a button like the red
			// one — it opens the list of the very sessions it counts. It has no zero
			// state (a yellow 0 would be pure noise), so with nothing running there is
			// nothing to open either: the pill is simply not there.
			`[${HEAD_RUN_ATTR}]{position:absolute;display:none;align-items:center;justify-content:center;min-width:15px;height:15px;padding:0 3.5px;box-sizing:border-box;border:0;border-radius:999px;background:${RUNNING_YELLOW};color:#1f1f1f;font:inherit;font-size:9.5px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.02em;cursor:pointer;z-index:3;box-shadow:0 0 0 1.5px var(--dsw-specific-sidebar-fill,#fff)}`,
			`[${HEAD_RUN_ATTR}]::after{content:"";position:absolute;inset:0 -5px -5px -5px;border-radius:999px}`,
			`[${HEAD_RUN_ATTR}]:hover{filter:brightness(1.12)}`
		].join("");

		/** Install the badge rules once per page. */
		function ensureHeaderBadgeStyle() {
			try {
				if (document.getElementById(HEAD_BADGE_STYLE_ID) !== null) return;
				const style = document.createElement("style");
				style.id = HEAD_BADGE_STYLE_ID;
				style.textContent = HEAD_BADGE_CSS;
				document.head.appendChild(style);
			} catch { /* styling is cosmetic; never let it reach a render tree */ }
		}

		/**
		 * The section-header row and the label inside it.
		 *
		 * The title TEXT is deliberately not matched: it flips between 工作区 and 会话
		 * with the group-by mode and is localized, so any string table would be both
		 * incomplete and wrong half the time. Structure is stable instead —
		 * `sidebar.workspaces` is a slot root (the official renderer stamps
		 * `data-slot` on those), the header row's first button is the search control,
		 * and the label is the row's first text-bearing child that owns no button.
		 * @param container - the browsing region root.
		 * @returns `{ row, label }`, or null when this build's DOM is not recognised.
		 */
		function sectionHeaderParts(container) {
			// Our own nodes are never a stand-in for shipped controls or for the label:
			// the red badge is a button and the yellow one carries text, so either could
			// be mistaken for the search control or the label if left in the running.
			let firstButton = null;
			for (const candidate of container.querySelectorAll("button")) {
				if (candidate.getAttribute(HEAD_BADGE_ATTR) !== null) continue;
				if (candidate.getAttribute(HEAD_RUN_ATTR) !== null) continue;
				firstButton = candidate;
				break;
			}
			if (firstButton === null) return null;
			let row = firstButton.parentElement;
			for (let step = 0; step < HEAD_BADGE_MAX_STEPS && row !== null && row !== container; step++) {
				for (const child of row.children) {
					if (child === firstButton || child.contains(firstButton)) continue;
					if (child.tagName === "BUTTON") continue;
					if (child.getAttribute(HEAD_BADGE_ATTR) !== null) continue;
					if (child.getAttribute(HEAD_RUN_ATTR) !== null) continue;
					if (child.querySelector("button") !== null) continue;
					if ((child.textContent ?? "").trim() !== "") return { row, label: child };
				}
				row = row.parentElement;
			}
			return null;
		}

		/** Warn once, then give up for this page — the row dots' exact posture. */
		function noteHeaderBadgeFailure(why) {
			headerBadgeFailures++;
			if (headerBadgeFailures === 1) {
				try { console.warn("dsh-icon-custom: 工作区标题红点定位失败,已降级(不影响其他功能):", why); } catch {}
				return;
			}
			if (headerBadgeFailures < HEAD_BADGE_MAX_FAILURES || headerBadgeGivenUp) return;
			headerBadgeGivenUp = true;
			try { console.warn("dsh-icon-custom: 工作区标题红点连续失败,本次会话内已自动关闭。"); } catch {}
			// Same posture as the row dots: give up by disappearing, never by freezing a
			// number that has stopped following the rule.
			clearHeaderBadge();
		}

		/**
		 * Reconcile the header badge with the current count and the label's position.
		 *
		 * Driven by the same mutation watchdog as the row dots, so it must be
		 * idempotent: it writes only what actually differs, or the observer that
		 * called it would re-arm on its own output. Geometry is read from the live
		 * rects, so the badge follows a sidebar resize, a locale change and the
		 * label's own collapse animation without any hardcoded offsets.
		 */
		function paintHeaderBadge() {
			if (headerBadgeGivenUp) return;
			const container = workspaceDotContainer();
			if (container === null) return; // start-up race, not a failure
			const parts = sectionHeaderParts(container);
			if (parts === null) { noteHeaderBadgeFailure("找不到分区标题"); return; }
			const row = parts.row;
			const label = parts.label;
			ensureHeaderBadgeStyle();
			if (headerBadgeHost !== row) {
				if (headerBadgeHost !== null) { try { headerBadgeHost.style.position = headerBadgeHostPosition; } catch {} }
				headerBadgeHost = row;
				headerBadgeHostPosition = row.style.position;
				try { if (window.getComputedStyle(row).position === "static") row.style.position = "relative"; } catch {}
			}
			let node = row.querySelector(`[${HEAD_BADGE_ATTR}]`);
			if (node === null) {
				node = document.createElement("button");
				node.type = "button";
				node.setAttribute(HEAD_BADGE_ATTR, "1");
				// Appended AFTER the shipped controls, so it can never be mistaken for
				// the header's first button.
				row.appendChild(node);
			}
			if (node.getAttribute(HEAD_BADGE_WIRED) !== "1") {
				node.setAttribute(HEAD_BADGE_WIRED, "1");
				node.addEventListener("click", (event) => {
					// The row belongs to the sidebar; keep the click to ourselves.
					event.preventDefault();
					event.stopPropagation();
					const rect = node.getBoundingClientRect();
					// `bottom` is what the panel drops below; see unreadPanelPlacement.
					togglePanel("unread", { left: rect.left, top: rect.top, bottom: rect.bottom });
				});
			}
			const count = effectiveCount();
			const text = badgeLabel(count);
			const zero = count > 0 ? "0" : "1";
			if (node.getAttribute("data-zero") !== zero) node.setAttribute("data-zero", zero);
			if (typeof badgeT === "function") {
				const spoken = count > 0 ? badgeT("unreadPanelCount").replace("{n}", String(count)) : badgeT("unreadPanelNone");
				if (node.getAttribute("aria-label") !== spoken) {
					node.setAttribute("aria-label", spoken);
					node.setAttribute("title", spoken);
				}
			}
			if (node.textContent !== text) node.textContent = text;
			// The running count, in the same row's other corner: top-right is the unread
			// number (where it has always been), bottom-right is this one. A button, not
			// a label — it opens the list of the sessions it is counting.
			let runNode = row.querySelector(`[${HEAD_RUN_ATTR}]`);
			if (runNode === null) {
				runNode = document.createElement("button");
				runNode.type = "button";
				runNode.setAttribute(HEAD_RUN_ATTR, "1");
				// Same as the red one: appended AFTER the shipped controls, so it can
				// never be mistaken for the header's first button.
				row.appendChild(runNode);
			}
			if (runNode.getAttribute(HEAD_RUN_WIRED) !== "1") {
				runNode.setAttribute(HEAD_RUN_WIRED, "1");
				runNode.addEventListener("click", (event) => {
					// The row belongs to the sidebar; keep the click to ourselves.
					event.preventDefault();
					event.stopPropagation();
					const rect = runNode.getBoundingClientRect();
					// The same anchor shape the red badge hands over; see
					// `unreadPanelPlacement` for what `bottom` is used for.
					togglePanel("running", { left: rect.left, top: rect.top, bottom: rect.bottom });
				});
			}
			const running = normalizeCount(runningTotal);
			const runText = badgeLabel(running);
			if (typeof badgeT === "function") {
				// Says what the number is AND that it opens: it is a control now, and a
				// bare "2 running" would leave a screen reader with no idea it is one.
				const spoken = badgeT("runningPanelTrigger").replace("{n}", String(running));
				if (runNode.getAttribute("aria-label") !== spoken) {
					runNode.setAttribute("aria-label", spoken);
					runNode.setAttribute("title", spoken);
				}
			}
			if (runNode.textContent !== runText) runNode.textContent = runText;
			// The label collapses to nothing while the search box is open; the badge
			// has no meaning then, and the label's own visibility cannot hide it
			// because it is a sibling.
			const rowRect = row.getBoundingClientRect();
			const labelRect = label.getBoundingClientRect();
			if (labelRect.width < 8) {
				if (node.style.display !== "none") node.style.display = "none";
				if (runNode.style.display !== "none") runNode.style.display = "none";
			} else {
				const width = typeof node.offsetWidth === "number" && node.offsetWidth > 0 ? node.offsetWidth : 15;
				const left = Math.round(labelRect.right - rowRect.left - width + HEAD_BADGE_OVERHANG);
				// Clamped: the header clips its overflow, and only ~8px sit above the label.
				const top = Math.max(0, Math.round(labelRect.top - rowRect.top - HEAD_BADGE_RAISE));
				if (node.style.left !== `${left}px`) node.style.left = `${left}px`;
				if (node.style.top !== `${top}px`) node.style.top = `${top}px`;
				if (node.style.display !== "flex") node.style.display = "flex";
				// No zero state for the running count: it simply is not there.
				if (running <= 0) {
					if (runNode.style.display !== "none") runNode.style.display = "none";
				} else {
					const runWidth = typeof runNode.offsetWidth === "number" && runNode.offsetWidth > 0 ? runNode.offsetWidth : 15;
					const runLeft = Math.round(labelRect.right - rowRect.left - runWidth + HEAD_BADGE_OVERHANG);
					const runTop = Math.round(labelRect.bottom - rowRect.top - HEAD_RUN_DROP);
					if (runNode.style.left !== `${runLeft}px`) runNode.style.left = `${runLeft}px`;
					if (runNode.style.top !== `${runTop}px`) runNode.style.top = `${runTop}px`;
					if (runNode.style.display !== "flex") runNode.style.display = "flex";
				}
			}
			// The label animates its own width; follow it instead of waiting for the
			// next mutation, which a CSS transition never produces.
			if (typeof window.ResizeObserver === "function") {
				if (headerBadgeObserver === null) headerBadgeObserver = new window.ResizeObserver(() => { paintHeaderBadge(); });
				if (headerBadgeObserved !== label) {
					try { headerBadgeObserver.disconnect(); headerBadgeObserver.observe(label); headerBadgeObserved = label; } catch {}
				}
			}
		}

		/** Take the badge back out and restore the row's own positioning. */
		function clearHeaderBadge() {
			try { document.querySelectorAll(`[${HEAD_BADGE_ATTR}],[${HEAD_RUN_ATTR}]`).forEach((node) => node.remove()); } catch {}
			if (headerBadgeObserver !== null) {
				try { headerBadgeObserver.disconnect(); } catch {}
				headerBadgeObserver = null;
				headerBadgeObserved = null;
			}
			if (headerBadgeHost !== null) {
				try { headerBadgeHost.style.position = headerBadgeHostPosition; } catch {}
			}
			headerBadgeHost = null;
			headerBadgeHostPosition = "";
		}
		/** Gap between the panel and whatever it is anchored to. */
		const UNREAD_PANEL_GAP = 6;
		/** Breathing room from the window edges. */
		const UNREAD_PANEL_MARGIN = 8;
		/** The panel's practical width (between its minWidth and maxWidth below). */
		const UNREAD_PANEL_WIDTH = 300;
		/** How tall the scrolling session list may get before it scrolls. */
		const UNREAD_PANEL_LIST_MAX = 320;

		/**
		 * Where the unread panel goes, in viewport coordinates.
		 *
		 * It opens DOWNWARD from the badge. The original math pinned the panel's
		 * BOTTOM edge just above the anchor — correct while the trigger sat in the
		 * sidebar footer, and wrong the moment that trigger moved to the section
		 * header: the same formula then parked the panel's bottom near the top of the
		 * window and grew the panel upward, off the top of the screen (the title and
		 * the first workspace heading were what got cut off). Anchoring on the
		 * anchor's `bottom` is what drops it below the badge instead.
		 *
		 * Horizontally it stays clear of the sidebar: the panel is a frame-wide
		 * overlay, and covering the sidebar — and the very badge that opened it — was
		 * the other half of the complaint.
		 * @param anchor - the badge's viewport rect (`{left, top, bottom}`), or null.
		 * @param sidebarRight - the browsing region's right edge, or null.
		 * @param viewportWidth - window width.
		 * @param viewportHeight - window height.
		 * @returns `{ left, top, listMaxHeight }` in viewport pixels.
		 */
		function unreadPanelPlacement(anchor, sidebarRight, viewportWidth, viewportHeight) {
			let left = UNREAD_PANEL_MARGIN;
			let top = UNREAD_PANEL_MARGIN;
			if (anchor !== null && typeof anchor === "object") {
				if (typeof anchor.left === "number") left = anchor.left;
				const below = typeof anchor.bottom === "number" ? anchor.bottom : anchor.top;
				if (typeof below === "number") top = below + UNREAD_PANEL_GAP;
			}
			if (typeof sidebarRight === "number" && sidebarRight > 0) left = Math.max(left, sidebarRight + UNREAD_PANEL_GAP);
			left = Math.max(UNREAD_PANEL_MARGIN, Math.min(left, viewportWidth - UNREAD_PANEL_WIDTH - UNREAD_PANEL_MARGIN));
			top = Math.max(UNREAD_PANEL_MARGIN, top);
			// Never taller than what is left below the panel's own top, so a long list
			// scrolls inside the panel instead of pushing it off the bottom edge.
			const listMaxHeight = Math.max(120, Math.min(UNREAD_PANEL_LIST_MAX, viewportHeight - top - 72));
			return { left: Math.round(left), top: Math.round(top), listMaxHeight: Math.round(listMaxHeight) };
		}

		/**
		 * The list behind those numbers, in the frame-wide overlay layer so it escapes
		 * the sidebar's clipping and scroll container. ONE panel with two modes: the
		 * red count opens "who needs you", the yellow count opens "who is running".
		 * Clicking a row opens that session — which is also what marks an unread one
		 * read. The running mode has no "mark all read": running is a live fact, not a
		 * queue, so there is nothing there to acknowledge.
		 */
		function HeaderPopup(props) {
			const [snapshot, setSnapshot] = React.useState(badgeSnapshot);
			const [mode, setMode] = React.useState(panelMode);
			// Ages are computed against the HOST's clock (the endings are host
			// timestamps); re-tick while open so "刚刚" does not stay stale.
			const [, tick] = React.useState(0);
			React.useEffect(() => subscribeBadge(setSnapshot), []);
			React.useEffect(() => subscribePanel(() => setMode(panelMode)), []);
			React.useEffect(() => {
				if (mode === null) return undefined;
				const interval = window.setInterval(() => tick((n) => n + 1), 30000);
				return () => window.clearInterval(interval);
			}, [mode]);
			React.useEffect(() => {
				if (mode === null) return undefined;
				const onKey = (event) => { if (event.key === "Escape") emitPanel(null); };
				const onDown = (event) => {
					const node = event.target;
					if (node !== null && typeof node.closest === "function" && node.closest('[data-icon-custom-panel="1"]') !== null) return;
					emitPanel(null);
				};
				window.addEventListener("keydown", onKey);
				document.addEventListener("mousedown", onDown, true);
				return () => {
					window.removeEventListener("keydown", onKey);
					document.removeEventListener("mousedown", onDown, true);
				};
			}, [mode]);
			if (mode === null) return null;
			const t = props.t;
			/** Which of the two lists this render is: same shell, different rows. */
			const running = mode === "running";
			const anchor = panelAnchor;
			// Measured, not assumed: the panel has to clear whatever width the sidebar
			// currently has (it is resizable and collapsible).
			let sidebarRight = null;
			try {
				const region = workspaceDotContainer();
				if (region !== null) sidebarRight = region.getBoundingClientRect().right;
			} catch { /* measurement is best effort; the margin fallback still applies */ }
			const place = unreadPanelPlacement(anchor, sidebarRight, window.innerWidth, window.innerHeight);
			const style = {
				position: "fixed", left: place.left + "px", top: place.top + "px", zIndex: 60, pointerEvents: "auto",
				minWidth: "240px", maxWidth: "340px", padding: "8px", borderRadius: "12px",
				border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-1)",
				boxShadow: "0 10px 30px rgba(0,0,0,.18)", color: "var(--dsw-alias-label-primary)", fontSize: "12px"
			};
			// The rows of whichever list is open. Both carry `{ id, title, where }`;
			// only the unread ones carry an ending to acknowledge.
			const items = running
				? (Array.isArray(snapshot.runningItems) ? snapshot.runningItems : [])
				: (Array.isArray(snapshot.items) ? snapshot.items : []);
			const ackTargets = running ? [] : unreadAckTargets(items);
			/**
			 * Acknowledge every turn-end row at once.
			 *
			 * "Waiting for you" rows cannot be acknowledged (they are not watermark
			 * based), so the panel stays open while any of them remain — closing it
			 * would hide the one thing that still needs the reader.
			 */
			const markAllRead = () => {
				let changed = false;
				for (const target of ackTargets) if (noteSeen(target.id, target.seenAt)) changed = true;
				if (!changed) return;
				saveSeenState();
				emitUnreadPoke();
				if (ackTargets.length === items.length) emitPanel(null);
			};
			return React.createElement("div", { "data-icon-custom-panel": "1", style },
				React.createElement("div", { style: { fontWeight: 600, padding: "2px 6px 8px" } }, t(running ? "runningPanelTitle" : "unreadPanelTitle")),
				items.length === 0
					? React.createElement("div", { style: { padding: "2px 6px 8px", opacity: 0.7 } }, t(running ? "runningPanelEmpty" : "unreadPanelEmpty"))
					: React.createElement("div", { style: { display: "flex", flexDirection: "column", maxHeight: place.listMaxHeight + "px", overflowY: "auto" } },
						groupUnreadByWorkspace(items).map((group) => React.createElement("div", { key: group.where === "" ? "\u0000none" : group.where },
							React.createElement("div", { style: { padding: "7px 8px 3px", fontSize: "11px", fontWeight: 600, opacity: 0.55, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } },
								group.where === "" ? t("unreadPanelOther") : group.where
							),
							group.items.map((item) => React.createElement("button", {
								key: item.id, type: "button",
								onClick: () => { emitPanel(null); props.onOpen(item); },
								style: { display: "block", width: "100%", textAlign: "left", padding: "6px 8px", border: "0", borderRadius: "8px", background: "transparent", color: "inherit", font: "inherit", cursor: "pointer" }
							},
								React.createElement("span", { style: { display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, item.title),
								React.createElement("span", { style: { display: "block", opacity: 0.6, fontSize: "11px" } }, running ? runningRowSubtitle(item, t) : unreadRowSubtitle(item, hostNow(), t))
							))
						))
					),
				ackTargets.length > 0 && React.createElement("div", { style: { marginTop: "6px", paddingTop: "6px", borderTop: "1px solid var(--dsw-alias-border-l2)" } },
					React.createElement("button", {
						type: "button",
						onClick: markAllRead,
						style: { display: "block", width: "100%", padding: "5px 8px", border: "0", borderRadius: "8px", background: "transparent", color: "inherit", font: "inherit", cursor: "pointer", opacity: 0.85 }
					}, t("unreadMarkAllRead"))
				)
			);
		}

		/**
		 * The two brand-mark pill sizes.
		 *
		 * A 24px mark cannot hold two full-size numbers, and drawing one big and one
		 * small reads as a rendering bug rather than a design. So when BOTH are shown
		 * they are drawn at one common edge — the largest that still fits them stacked
		 * — while a pill shown alone keeps the normal size. Pure, so the rule is
		 * testable without React.
		 * @param size - the mark's edge in px.
		 * @param scale - the badge-size multiplier from the setting.
		 * @param hasUnread - whether the unread pill is shown.
		 * @param hasRunning - whether the running pill is shown.
		 * @returns `{ unread, running }` pill edges in px.
		 */
		function brandPillEdges(size, scale, hasUnread, hasRunning) {
			const edge = Math.max(12, Math.round(size * 0.5 * scale));
			if (hasUnread !== true || hasRunning !== true) return { unread: edge, running: edge };
			// Half the mark each, minus the seam between them.
			const shared = Math.max(9, Math.floor((size - 2) / 2));
			return { unread: shared, running: shared };
		}

		/**
		 * Sidebar brand-mark occupant (registered on the official
		 * `sidebar.brand.mark` single seat). Shows the custom icon when the
		 * logo option is on; otherwise falls back to the platform favicon mark
		 * (/favicon.svg is the same official whale). The brand NAME text is not
		 * touched — this seat is only the mark.
		 */
		function BrandMark(props) {
			const [state, setState] = React.useState(null);
			const [badge, setBadge] = React.useState(badgeSnapshot);
			React.useEffect(() => {
				const unsubscribe = subscribeLogo(setState);
				// Pull the current state on mount too, so the mark is correct
				// even when the settings panel was never opened this session.
				props.rpc.call("/api", "iconCustom/getStatus", { args: {} })
					.then((resp) => { if (resp && resp.ok === true) syncStatus(resp.value); })
					.catch(() => {});
				return unsubscribe;
			}, [props.rpc]);
			React.useEffect(() => subscribeBadge(setBadge), []);
			const size = (props && props.size) || 24;
			const custom = state && state.enabled === true && state.rev;
			const style = { width: size, height: size, objectFit: "contain", display: "block" };
			const src = custom
				? (state.png === true ? `/icon-custom-192.png?v=${state.rev}` : `/icon-custom.svg?v=${state.rev}`)
				: "/favicon.svg";
			const img = React.createElement("img", {
				src,
				alt: "",
				style
			});
			// No mark at all: keep the exact original element (no wrapper, no layout risk).
			const runningCount = normalizeCount(badge.running);
			if (badge.count <= 0 && runningCount <= 0) return img;
			// Two independent facts, two corners: the unread count owns the top-right
			// (where it has always been), the running count takes the bottom-right.
			const edges = brandPillEdges(size, badgeScale(badge.size), badge.count > 0, runningCount > 0);
			const edge = edges.unread;
			const children = [img];
			if (badge.count > 0) {
				const label = `${badgeLabel(badge.count)} pending (test)`;
				children.push(React.createElement("span", {
					key: "unread",
					title: label,
					"aria-label": label,
					style: {
						position: "absolute",
						top: 0,
						right: 0,
						minWidth: edge,
						height: edge,
						padding: "0 2px",
						boxSizing: "border-box",
						borderRadius: 999,
						background: "#e5484d",
						color: "#fff",
						border: "1.5px solid var(--dsw-alias-bg-layer-1, #fff)",
						fontSize: Math.max(8, Math.round(edge * 0.62)),
						fontWeight: 700,
						lineHeight: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontVariantNumeric: "tabular-nums",
						pointerEvents: "none"
					}
				}, badgeLabel(badge.count)));
			}
			if (runningCount > 0) {
				const label = `${badgeLabel(runningCount)} running`;
				// Same edge as the unread pill whenever both are shown (see
				// brandPillEdges): a big red beside a small yellow reads as broken.
				const runEdge = edges.running;
				children.push(React.createElement("span", {
					key: "running",
					title: label,
					"aria-label": label,
					style: {
						position: "absolute",
						bottom: 0,
						right: 0,
						minWidth: runEdge,
						height: runEdge,
						padding: "0 2px",
						boxSizing: "border-box",
						borderRadius: 999,
						background: RUNNING_YELLOW,
						color: "#1f1f1f",
						border: "1.5px solid var(--dsw-alias-bg-layer-1, #fff)",
						fontSize: Math.max(7, Math.round(runEdge * 0.62)),
						fontWeight: 700,
						lineHeight: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontVariantNumeric: "tabular-nums",
						pointerEvents: "none"
					}
				}, badgeLabel(runningCount)));
			}
			return React.createElement("span", {
				style: { position: "relative", display: "inline-flex", width: size, height: size, flex: "none" }
			}, children);
		}

		//#region hint disclosure
		/**
		 * Every long hint used to be printed in full on the settings page, which made
		 * one screen a wall of grey small print. Now each one keeps a one-line
		 * summary on the page and moves the full text behind a "?" button.
		 *
		 * The bubble's material is borrowed, its behaviour is ours:
		 *  - the official `MenuSurface` primitive as the bubble container, when this
		 *    build exposes it to plugins;
		 *  - a self-drawn bubble carrying the same inline styling otherwise.
		 * Opening and closing (click the "?", click it again, click away, Escape) is
		 * the plugin's own code on BOTH paths, and placement stays in the pure
		 * `hintBubblePlacement` below — `MenuSurface` only paints the surface, it
		 * does not position or dismiss anything.
		 *
		 * Why not the official `Tooltip` (which is what this used to use): its
		 * `label` is `string | (() => string)`
		 * (`@deepseek-ai/dsh-client-ui-primitives/lib/types/Tooltip.d.ts:20`), so it
		 * can only print plain text and can never render the emphasised phrases the
		 * requirement asks for. `MenuSurface` takes arbitrary children
		 * (`ComponentPropsWithoutRef<'div'>`), so the same self-managed disclosure
		 * can render real React nodes — hence `**bold**` becomes a real `<strong>`.
		 * See docs/adr/0012-hint-bubble-menusurface.md.
		 *
		 * The client half is loaded through the ModuleLoader's `require` with no build
		 * step, so that package can be absent or not yet materialized — a `require`
		 * miss must degrade to the fallback, never to a blank section.
		 * Note: this package is resolved by the host at require time and is therefore
		 * deliberately left out of `dsh.client.inject` and `peerDependencies`
		 * (matching the official packages), so no injection gate can block mount.
		 */
		const HINT_BUBBLE_WIDTH = 320;
		const HINT_BUBBLE_MARGIN = 8;
		const HINT_BUBBLE_GAP = 6;
		const HINT_ROW_STYLE = { display: "flex", alignItems: "flex-start", gap: "6px", marginTop: "4px" };
		const HINT_SUMMARY_STYLE = { fontSize: 11, color: "var(--dsw-alias-label-tertiary)", lineHeight: "16px" };
		const HINT_BUTTON_STYLE = { flex: "none", width: "16px", height: "16px", padding: 0, borderRadius: "50%", border: "1px solid var(--dsw-alias-border-l2)", background: "transparent", color: "var(--dsw-alias-label-tertiary)", fontSize: 11, lineHeight: "14px", textAlign: "center", cursor: "pointer" };
		/** The emphasised run: a real `<strong>`, so `**` never reaches the screen. */
		const HINT_STRONG_STYLE = { fontWeight: 600, color: "var(--dsw-alias-label-primary)" };
		/** The fallback bubble carries its own material; the official surface paints its own. */
		const HINT_BUBBLE_STYLE = { position: "fixed", zIndex: 70, padding: "8px 10px", borderRadius: "10px", border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-1)", boxShadow: "0 10px 30px rgba(0,0,0,.18)", color: "var(--dsw-alias-label-primary)", fontSize: 12, lineHeight: "18px", whiteSpace: "pre-wrap", maxHeight: "40vh", overflowY: "auto" };
		/** Placement-only style for the official surface: no fill/border/radius of ours. */
		const HINT_BUBBLE_PLACEMENT_STYLE = { position: "fixed", zIndex: 70, padding: "8px 10px", color: "var(--dsw-alias-label-primary)", fontSize: 12, lineHeight: "18px", whiteSpace: "pre-wrap", maxHeight: "40vh", overflowY: "auto" };

		/**
		 * Resolve the official MenuSurface lazily: requiring it at factory time can
		 * run before the primitive is materialized, and a miss throws (the loader's
		 * module table has no fallback entry). Success is memoized; a miss is retried
		 * on the next render, so a plugin that boots before the primitive still picks
		 * it up instead of being stuck on the fallback forever.
		 * @returns the MenuSurface component, or null when this build does not expose it.
		 */
		let officialMenuSurface = null;
		function officialHintSurface() {
			if (officialMenuSurface !== null) return officialMenuSurface;
			try {
				const primitives = require("@deepseek-ai/dsh-client-ui-primitives");
				// "Present" is the whole judgement, not "is a function": the shipped
				// `MenuSurface` is a `forwardRef` object (`lib/index.js` builds it with
				// `forwardRef(...)`, and its type is `ForwardRefExoticComponent`), so
				// `typeof` is "object". The old `typeof === "function"` test therefore
				// never matched in production and left the official branch dead. A build
				// that exposes it as a plain function still works.
				const candidate = primitives !== null && typeof primitives === "object" ? primitives.MenuSurface : undefined;
				if (candidate !== null && candidate !== undefined
					&& (typeof candidate === "function" || typeof candidate === "object")) {
					officialMenuSurface = candidate;
				}
			} catch (error) {
				officialMenuSurface = null;
			}
			return officialMenuSurface;
		}

		/**
		 * Turn one hint string into React children, converting every BALANCED
		 * `**pair**` into a real `<strong>`.
		 *
		 * Only a closed pair is markup: an unpaired `**` (or a lone marker) is kept
		 * verbatim, because dropping the characters would silently lose text — worse
		 * than showing the marker. The marker itself never reaches the screen for a
		 * balanced pair: what lands in the DOM is `<strong>pair</strong>`.
		 * @param text - the locale string, possibly carrying `**` runs.
		 * @returns an array of strings and `<strong>` elements, never empty.
		 */
		function hintTextNodes(text) {
			const source = typeof text === "string" ? text : "";
			const nodes = [];
			const bold = /\*\*([\s\S]+?)\*\*/g;
			let last = 0;
			let match;
			while ((match = bold.exec(source)) !== null) {
				if (match.index > last) nodes.push(source.slice(last, match.index));
				nodes.push(React.createElement("strong", { key: "hint-bold-" + nodes.length, style: HINT_STRONG_STYLE }, match[1]));
				last = match.index + match[0].length;
			}
			if (last < source.length) nodes.push(source.slice(last));
			if (nodes.length === 0) nodes.push(source);
			return nodes;
		}

		/**
		 * Where the fallback bubble goes: just below the button's anchor rect, clamped
		 * into the viewport. Pure, so the placement is testable without a DOM.
		 * @param anchor - the button's client rect, or null.
		 * @param viewportWidth - window width.
		 * @param viewportHeight - window height.
		 * @returns `{ left, top, width }` in viewport pixels.
		 */
		function hintBubblePlacement(anchor, viewportWidth, viewportHeight) {
			const width = Math.min(HINT_BUBBLE_WIDTH, Math.max(120, viewportWidth - HINT_BUBBLE_MARGIN * 2));
			const anchorLeft = anchor !== null && typeof anchor === "object" && typeof anchor.left === "number" ? anchor.left : HINT_BUBBLE_MARGIN;
			const anchorBottom = anchor !== null && typeof anchor === "object" && typeof anchor.bottom === "number" ? anchor.bottom : HINT_BUBBLE_MARGIN;
			const left = Math.max(HINT_BUBBLE_MARGIN, Math.min(anchorLeft, viewportWidth - width - HINT_BUBBLE_MARGIN));
			const top = Math.max(HINT_BUBBLE_MARGIN, Math.min(anchorBottom + HINT_BUBBLE_GAP, viewportHeight - HINT_BUBBLE_MARGIN));
			return { left: Math.round(left), top: Math.round(top), width: Math.round(width) };
		}

		/**
		 * The bubble node for one disclosure: the official `MenuSurface` material when
		 * `surface` is given, the self-drawn inline bubble otherwise. Pure, so both
		 * paths are exercised without a DOM; closed renders nothing.
		 *
		 * `MenuSurface` is handed placement only (position/left/top/width/scroll) and
		 * keeps its own fill, radius, border and blur; the fallback div carries the
		 * whole look itself. `compact` asks the official surface for the smaller
		 * radius a small bubble wants.
		 * @param open - whether the bubble is showing.
		 * @param surface - the official MenuSurface component, or null for the fallback.
		 * @param label - accessible name for the dialog.
		 * @param place - `{ left, top, width }` from `hintBubblePlacement`.
		 * @param text - the full hint text, `**` markers included.
		 * @returns the bubble element, or null while closed.
		 */
		function hintBubbleNode(open, surface, label, place, text) {
			if (!open) return null;
			const placement = { left: place.left + "px", top: place.top + "px", width: place.width + "px" };
			const content = hintTextNodes(text);
			if (surface === null) {
				return React.createElement("div", {
					"data-icon-custom-hint": "1",
					role: "dialog",
					"aria-label": label,
					style: { ...HINT_BUBBLE_STYLE, ...placement }
				}, ...content);
			}
			return React.createElement(surface, {
				"data-icon-custom-hint": "1",
				role: "dialog",
				"aria-label": label,
				compact: true,
				style: { ...HINT_BUBBLE_PLACEMENT_STYLE, ...placement }
			}, ...content);
		}

		/**
		 * The button plus its bubble, with the open/close state managed here — the same
		 * code on both paths, because the official surface only supplies material.
		 * Opened by the "?", closed by the same button, an outside pointerdown, or
		 * Escape. The button is the only way to open the text (hovering does not).
		 */
		function HintDisclosureBubble(props) {
			const [rect, setRect] = React.useState(null);
			const open = rect !== null;
			React.useEffect(() => {
				if (!open) return undefined;
				const onKey = (event) => { if (event.key === "Escape") setRect(null); };
				const onDown = (event) => {
					const node = event.target;
					if (node === null || typeof node.closest !== "function") return;
					// Both surfaces carry this marker (MenuSurface forwards div props), so
					// a click inside the bubble never counts as "clicked away".
					if (node.closest('[data-icon-custom-hint="1"]') !== null) return;
					if (node.closest('[data-icon-custom-hint-button="1"]') !== null) return;
					setRect(null);
				};
				window.addEventListener("keydown", onKey);
				document.addEventListener("mousedown", onDown, true);
				return () => {
					window.removeEventListener("keydown", onKey);
					document.removeEventListener("mousedown", onDown, true);
				};
			}, [open]);
			const toggle = (event) => {
				if (open) {
					setRect(null);
					return;
				}
				const node = event.currentTarget;
				setRect(node !== null && typeof node.getBoundingClientRect === "function" ? node.getBoundingClientRect() : null);
			};
			const place = hintBubblePlacement(rect, window.innerWidth, window.innerHeight);
			const button = React.createElement("button", {
				type: "button",
				"aria-label": props.label,
				title: props.label,
				"data-icon-custom-hint-button": "1",
				onClick: toggle,
				style: HINT_BUTTON_STYLE
			}, "?");
			return React.createElement(React.Fragment, null,
				button,
				hintBubbleNode(open, props.surface, props.label, place, props.text)
			);
		}

		/**
		 * One hint row: the short summary (plain text, never folded) stays on the page,
		 * the full text sits behind the "?" button. The official primitive is resolved
		 * once per row and passed down; a missing package simply means `surface === null`.
		 */
		function HintDisclosure(props) {
			return React.createElement("div", { style: HINT_ROW_STYLE },
				React.createElement("span", { style: HINT_SUMMARY_STYLE }, props.summary),
				React.createElement(HintDisclosureBubble, {
					text: props.text,
					label: props.label,
					surface: officialHintSurface()
				})
			);
		}
		//#endregion

		function FaviconSection(props) {
			const t = props.t;
			const rpc = props.rpc;
			const [status, setStatus] = React.useState(null);
			const [pwaEnabled, setPwaEnabled] = React.useState(false);
			const [logoEnabled, setLogoEnabled] = React.useState(false);
			const [busy, setBusy] = React.useState(false);
			const [error, setError] = React.useState("");
			const [notice, setNotice] = React.useState("");
			const [badgeInput, setBadgeInput] = React.useState(() => (manualCount > 0 ? String(manualCount) : ""));
			const [badgeSizeValue, setBadgeSizeValue] = React.useState(badgeSize);
			const [badgeSourceValue, setBadgeSourceValue] = React.useState(badgeSource);
			const [unread, setUnread] = React.useState(unreadConfig);
			React.useEffect(() => subscribeUnreadConfig(setUnread), []);
			// Its own switch and its own endpoint pair: the running marks must be
			// switchable without touching the unread rule (see lib/running.js).
			const [running, setRunning] = React.useState(runningConfig);
			React.useEffect(() => subscribeRunningConfig(setRunning), []);
			// Sampled when the section mounts, which is the moment the user is
			// looking at it. It reports local facts only (see badgeCapabilityProbe).
			const [appBadgeProbe] = React.useState(() => appBadgeEnv());
			// Live, unlike the capability probe above: the notifications permission
			// can move outside this page (System Settings, another tab's prompt), and
			// on WebKit the badge follows it.
			const [notificationProbe, setNotificationProbe] = React.useState(() => notificationPermissionEnv());
			const [permissionBusy, setPermissionBusy] = React.useState(false);
			// A permission granted while the page is open is the WebKit precondition
			// the badge was missing: every earlier call was dropped while there was
			// no permission to draw it, so re-assert the number the page already shows.
			const onPermissionChanged = React.useCallback((next) => {
				setNotificationProbe(next);
				if (next.state === "granted") reconcileAppBadge(true);
			}, []);
			React.useEffect(() => subscribeNotificationPermission(onPermissionChanged), [onPermissionChanged]);
			// Called straight from the click: the prompt needs a user gesture, so it
			// must never be moved into an effect.
			const onRequestPermission = React.useCallback(() => {
				setPermissionBusy(true);
				requestNotificationPermission().then((next) => {
					setPermissionBusy(false);
					onPermissionChanged(next);
				});
			}, [onPermissionChanged]);
			// Draft text for the delay box: typing must not save on every keystroke,
			// and the box has to show the CLAMPED value once the save lands (type
			// 99999 and it settles on the 600 cap instead of lying about it).
			const [clearDelayDraft, setClearDelayDraft] = React.useState(String(unreadConfig.clearDelaySec));
			React.useEffect(() => { setClearDelayDraft(String(unread.clearDelaySec)); }, [unread.clearDelaySec]);
			const inputRef = React.useRef(null);

			const load = React.useCallback(async () => {
				try {
					const resp = await rpc.call("/api", "iconCustom/getStatus", { args: {} });
					if (resp && resp.ok === true) {
						setStatus(resp.value);
						setPwaEnabled(resp.value.pwa === true);
						setLogoEnabled(resp.value.logo === true);
						syncStatus(resp.value);
					} else setError(reason(resp, t("fail")));
				} catch (e) {
					setError(String((e && e.message) || e || t("fail")));
				}
			}, [rpc, t]);

			React.useEffect(() => {
				load();
			}, [load]);

			// Update the live page icon immediately (no reload) so the change is
			// visible in this very tab; other tabs pick it up on their next render.
			const applyLive = React.useCallback((s) => {
				if (!s || s.active !== true) return;
				const href = s.png === true ? `/icon-custom-192.png?v=${s.rev}` : `/icon-custom.svg?v=${s.rev}`;
				const type = s.png === true ? "image/png" : (s.mime || "image/svg+xml");
				setIconEverywhere(href, type);
				// The base icon just changed: rebuild the composite from it.
				refreshFaviconBase();
			}, []);

			// When cleared, put the shipped dark/light pair back. Restoring the
			// authored hrefs (rather than forcing one href on every link) keeps the
			// platform's scheme-aware icons working after a reset.
			const applyDefault = React.useCallback(() => {
				restoreShippedIcons();
				refreshFaviconBase();
			}, []);

			const pick = React.useCallback(() => inputRef.current && inputRef.current.click(), []);

			// Test-only: type a number to push it into the badge bridge. Empty or 0
			// clears the badge. Not persisted — a reload starts from 0 again.
			const onBadgeInput = React.useCallback((event) => {
				const raw = String(event.target.value || "").replace(/[^0-9]/g, "");
				setBadgeInput(raw);
				emitBadge(raw === "" ? 0 : Math.min(999, parseInt(raw, 10) || 0));
			}, []);
			const onBadgeSize = React.useCallback((value) => {
				setBadgeSizeValue(value);
				emitBadgeSize(value);
			}, []);
			// "real" = DSH's pending-interaction count; "manual" = the input below.
			const onBadgeSource = React.useCallback((value) => {
				setBadgeSourceValue(value);
				emitBadgeSource(value);
			}, []);
			// One save path for the whole unread rule: the patch is merged onto the
			// current config, so every field is carried over by construction. Letting
			// each control build its own request is how a new field gets silently
			// dropped by whichever caller forgot it.
			const saveUnreadRule = React.useCallback((patch) => {
				const next = normalizeUnreadConfig({ ...unreadConfig, ...patch });
				emitUnreadConfig(next);
				// Every field is sent explicitly, and the host replaces its copy with what
				// arrives — so a field missing HERE is a field that silently reverts to its
				// default on the next page load, however well the local toggle worked.
				rpc.call("/api", "iconCustom/setUnreadRule", {
					args: { request: { reasons: next.reasons, pending: next.pending, workspaceDot: next.workspaceDot, appBadge: next.appBadge, clearDelaySec: next.clearDelaySec, revealOnOpen: next.revealOnOpen, unreadIncludeSubagents: next.unreadIncludeSubagents } }
				}).catch(() => {});
			}, [rpc]);
			// Toggle one unread reason. Applies locally at once; the host keeps the
			// durable copy so the rule survives a restart and other browsers.
			const onUnreadToggle = React.useCallback((key, checked) => {
				if (key === "pending") { saveUnreadRule({ pending: checked }); return; }
				const reasons = Object.assign({}, unreadConfig.reasons);
				reasons[key] = checked;
				saveUnreadRule({ reasons });
			}, [saveUnreadRule]);
			// The fuse for the one fragile piece (see the workspace-dots region).
			const onWorkspaceDotToggle = React.useCallback((checked) => {
				saveUnreadRule({ workspaceDot: checked });
			}, [saveUnreadRule]);
			// The second fragile piece's own fuse (see the reveal region): locating a
			// clicked session drives the shipped sidebar rows.
			const onRevealToggle = React.useCallback((checked) => {
				saveUnreadRule({ revealOnOpen: checked });
			}, [saveUnreadRule]);
			// Whether a background sub-agent settling (which makes its parent run one
			// more turn) is worth telling the person about. Same one save path, so the
			// field cannot be dropped here and silently revert to ON after a reload.
			const onIncludeSubagentsToggle = React.useCallback((checked) => {
				saveUnreadRule({ unreadIncludeSubagents: checked });
			}, [saveUnreadRule]);
			// The system-icon projection of the same number. Saved through the same
			// one save path, so this field can never be dropped by a caller.
			const onAppBadgeToggle = React.useCallback((checked) => {
				saveUnreadRule({ appBadge: checked });
			}, [saveUnreadRule]);
			// Same "one save path, merged onto the current config" discipline as the
			// unread rule, on its own endpoint: enabling or disabling the yellow marks
			// applies locally at once and is persisted for the next page load.
			const saveRunningRule = React.useCallback((patch) => {
				const next = normalizeRunningConfig({ ...runningConfig, ...patch });
				emitRunningConfig(next);
				// Both switches travel together, always: the host record is one object, and
				// a caller that remembered only one field would otherwise silently reset
				// the other one on the next load.
				rpc.call("/api", "iconCustom/setRunningRule", {
					args: { request: { enabled: next.enabled, includeSubagents: next.includeSubagents, headerRing: next.headerRing } }
				}).catch(() => {});
			}, [rpc]);
			const onRunningMarkToggle = React.useCallback((checked) => {
				saveRunningRule({ enabled: checked });
			}, [saveRunningRule]);
			const onRunningIncludeSubagentsToggle = React.useCallback((checked) => {
				saveRunningRule({ includeSubagents: checked });
			}, [saveRunningRule]);
			// Third switch of the same feature: the yellow ring on the conversation
			// header's sub-agent count. Independent by construction — nothing on the
			// sidebar, the tab icon or the OS badge reads it.
			const onHeaderRingToggle = React.useCallback((checked) => {
				saveRunningRule({ headerRing: checked });
			}, [saveRunningRule]);
			// Seconds you must stay in a session before it counts as read; 0 = as soon
			// as you enter. Clamped by the shared normalizer, so a stray keystroke can
			// never persist an absurd delay.
			const onClearDelayChange = React.useCallback((value) => {
				saveUnreadRule({ clearDelaySec: normalizeClearDelay(value) });
			}, [saveUnreadRule]);
			/** One unread checkbox; `key === "pending"` is the "someone is waiting" row. */
			const renderReasonCheckbox = (key, labelKey) => React.createElement("label", {
				key,
				style: { display: "inline-flex", alignItems: "center", gap: "6px", marginRight: "14px", marginTop: "6px", fontSize: 12, color: "var(--dsw-alias-label-primary)", cursor: "pointer" }
			},
				React.createElement("input", {
					type: "checkbox",
					checked: key === "pending" ? unread.pending === true : unread.reasons[key] === true,
					onChange: (event) => onUnreadToggle(key, event.target.checked === true)
				}),
				React.createElement("span", null, t(labelKey))
			);

			const onFileChange = React.useCallback(async (event) => {
				const file = event.target.files && event.target.files[0];
				event.target.value = "";
				if (!file) return;
				setError("");
				setNotice("");
				if (file.size > 10 * 1024 * 1024) {
					setError(t("uploadHint"));
					return;
				}
				const reader = new FileReader();
				reader.onload = async () => {
					let data = typeof reader.result === "string" ? reader.result : null;
					if (!data) { setError(t("fail")); return; }
					// Rasterize SVG to PNG in the browser so the host always has
					// a rasterizable baseline and iOS/apple-touch-icon works.
					// ICO is left as-is; the host extracts its embedded PNG.
					let mime = file.type || "image/svg+xml";
					if (mime === "image/svg+xml" || /\.svg$/i.test(file.name)) {
						setBusy(true);
						try {
							data = await svgToPng(file);
							mime = "image/png";
						} catch {
							setBusy(false);
							setError(t("svgFail"));
							return;
						}
					}
					setBusy(true);
					try {
						const resp = await rpc.call("/api", "iconCustom/setIcon", {
							args: { request: { mime, name: file.name, pwa: pwaEnabled, logo: logoEnabled, data } }
						});
						if (resp && resp.ok === true) {
							setStatus(resp.value);
							setPwaEnabled(resp.value.pwa === true);
							setLogoEnabled(resp.value.logo === true);
							setNotice(t("successUpload"));
							applyLive(resp.value);
							syncStatus(resp.value);
						} else {
							setError(reason(resp, t("fail")));
						}
					} catch (e) {
						setError(String((e && e.message) || e || t("fail")));
					} finally {
						setBusy(false);
					}
				};
				reader.onerror = () => setError(t("fail"));
				reader.readAsDataURL(file);
			}, [rpc, t, pwaEnabled, logoEnabled, applyLive]);

			const onReset = React.useCallback(async () => {
				setError("");
				setNotice("");
				setBusy(true);
				try {
					const resp = await rpc.call("/api", "iconCustom/resetIcon", { args: {} });
					if (resp && resp.ok === true) {
						setStatus(resp.value);
						setPwaEnabled(false);
						setLogoEnabled(false);
						setNotice(t("successReset"));
						applyDefault();
						syncStatus(resp.value);
					} else {
						setError(reason(resp, t("fail")));
					}
				} catch (e) {
					setError(String((e && e.message) || e || t("fail")));
				} finally {
					setBusy(false);
				}
			}, [rpc, t, applyDefault]);

			const onTogglePwa = React.useCallback(async (event) => {
				const enabled = event.target.checked === true;
				setError("");
				setNotice("");
				setBusy(true);
				try {
					const resp = await rpc.call("/api", "iconCustom/setPwa", {
						args: { request: { enabled } }
					});
					if (resp && resp.ok === true) {
						setStatus(resp.value);
						setPwaEnabled(resp.value.pwa === true);
						setNotice(t("successPwa"));
						applyLive(resp.value);
					} else {
						setPwaEnabled(!enabled);
						setError(reason(resp, t("fail")));
					}
				} catch (e) {
					setPwaEnabled(!enabled);
					setError(String((e && e.message) || e || t("fail")));
				} finally {
					setBusy(false);
				}
			}, [rpc, t, applyLive]);

			const onToggleLogo = React.useCallback(async (event) => {
				const enabled = event.target.checked === true;
				setError("");
				setNotice("");
				setBusy(true);
				try {
					const resp = await rpc.call("/api", "iconCustom/setLogo", {
						args: { request: { enabled } }
					});
					if (resp && resp.ok === true) {
						setStatus(resp.value);
						setLogoEnabled(resp.value.logo === true);
						setNotice(t("successLogo"));
						syncStatus(resp.value);
					} else {
						setLogoEnabled(!enabled);
						setError(reason(resp, t("fail")));
					}
				} catch (e) {
					setLogoEnabled(!enabled);
					setError(String((e && e.message) || e || t("fail")));
				} finally {
					setBusy(false);
				}
			}, [rpc, t]);

			const active = status && status.active === true;
			const previewSrc = active ? `/icon-custom.svg?v=${status.rev}` : "/favicon.svg";

			const style = {
				row: { display: "flex", alignItems: "center", gap: "16px", padding: "12px 0" },
				meta: { flex: "1 1 auto", minWidth: "0" },
				label: { fontSize: 12, fontWeight: 600, color: "var(--dsw-alias-label-primary)", marginBottom: "4px" },
				desc: { fontSize: 12, color: "var(--dsw-alias-label-secondary)", lineHeight: "18px" },
				preview: { width: 48, height: 48, borderRadius: 10, background: "var(--dsw-alias-bg-layer-3)", border: "1px solid var(--dsw-alias-border-l2)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", overflow: "hidden" },
				img: { width: 32, height: 32, objectFit: "contain" },
				btn: { border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "var(--dsw-alias-label-primary)", background: "var(--dsw-alias-bg-layer-2)", cursor: "pointer" },
				btnPrimary: { border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#fff", background: "var(--dsw-alias-fill-primary, #2a7de1)", cursor: "pointer" },
				btnDisabled: { opacity: 0.5, cursor: "default" },
				error: { fontSize: 12, color: "var(--dsw-alias-danger, #e5484d)", marginTop: "8px" },
				notice: { fontSize: 12, color: "var(--dsw-alias-success, #30a46c)", marginTop: "8px" },
				hint: { fontSize: 11, color: "var(--dsw-alias-label-tertiary)", marginTop: "4px", lineHeight: "16px" }
			};

			// One disclosure row per long hint: the summary is on the page, the full
			// text (and nothing else) sits behind the "?" button.
			const hintLine = (hintKey) => React.createElement(HintDisclosure, {
				key: hintKey,
				summary: t(hintKey + "Summary"),
				text: t(hintKey),
				label: t("hintMoreLabel")
			});

			return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
				React.createElement("div", { style: style.row },
					React.createElement("div", { style: style.preview },
						React.createElement("img", { src: previewSrc, style: style.img, alt: t("current") })
					),
					React.createElement("div", { style: style.meta },
						React.createElement("div", { style: style.label }, t("current")),
						React.createElement("div", { style: style.desc }, active
							? (status.name ? `${status.name} · ${bytesLabel(status.size)} · ${fmtTime(status.savedAt)}` : status.mime)
							: t("none"))
					)
				),
				React.createElement("div", { style: { display: "flex", gap: "8px", alignItems: "center" } },
					React.createElement("button", { type: "button", style: { ...style.btnPrimary, ...(busy ? style.btnDisabled : null) }, disabled: busy, onClick: pick },
						React.createElement("span", null, busy ? t("replacing") : (active ? t("replace") : t("upload")))
					),
					React.createElement("button", { type: "button", style: { ...style.btn, ...(busy ? style.btnDisabled : null) }, disabled: busy || !active, onClick: onReset },
						React.createElement("span", null, busy ? t("resetting") : t("reset"))
					),
					React.createElement("input", { ref: inputRef, type: "file", accept: ".svg,.png,.ico,.cur,image/svg+xml,image/png,image/x-icon", style: { display: "none" }, onChange: onFileChange })
				),
				React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 0 0", fontSize: 12, color: "var(--dsw-alias-label-primary)", cursor: busy ? "default" : "pointer" } },
					React.createElement("input", { type: "checkbox", checked: pwaEnabled, disabled: busy || !active, onChange: onTogglePwa, style: { cursor: busy ? "default" : "pointer" } }),
					React.createElement("span", null, t("pwa"))
				),
				hintLine("pwaHint"),
				React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 0 0", fontSize: 12, color: "var(--dsw-alias-label-primary)", cursor: busy ? "default" : "pointer" } },
					React.createElement("input", { type: "checkbox", checked: logoEnabled, disabled: busy || !active, onChange: onToggleLogo, style: { cursor: busy ? "default" : "pointer" } }),
					React.createElement("span", null, t("logo"))
				),
				hintLine("logoHint"),
				hintLine("uploadHint"),
				React.createElement("div", { style: style.hint }, t("resetHint")),
				React.createElement("div", { style: { borderTop: "1px solid var(--dsw-alias-border-l2)", marginTop: "12px", paddingTop: "12px" } },
					React.createElement("div", { style: style.label }, t("badgeTest")),
					React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" } },
						React.createElement("span", { style: style.desc }, t("badgeSourceLabel")),
						["real", "manual"].map((key) => React.createElement("button", {
							key,
							type: "button",
							onClick: () => onBadgeSource(key),
							"aria-pressed": badgeSourceValue === key,
							style: { ...(badgeSourceValue === key ? style.btnPrimary : style.btn), padding: "4px 10px" }
						}, t(key === "real" ? "badgeSourceReal" : "badgeSourceManual")))
					),
					React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" } },
						React.createElement("input", {
							type: "number",
							min: 0,
							max: 999,
							value: badgeInput,
							onChange: onBadgeInput,
							disabled: badgeSourceValue !== "manual",
							"aria-label": t("badgeTest"),
							style: { width: 88, padding: "5px 8px", fontSize: 12, borderRadius: 8, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-2)", color: "var(--dsw-alias-label-primary)", opacity: badgeSourceValue === "manual" ? 1 : 0.45, cursor: badgeSourceValue === "manual" ? "text" : "not-allowed" }
						}),
						React.createElement("span", { style: style.desc }, t("badgeTestUnit"))
					),
					React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" } },
						React.createElement("span", { style: style.desc }, t("badgeSizeLabel")),
						["sm", "md", "lg"].map((key) => React.createElement("button", {
							key,
							type: "button",
							onClick: () => onBadgeSize(key),
							"aria-pressed": badgeSizeValue === key,
							style: { ...(badgeSizeValue === key ? style.btnPrimary : style.btn), padding: "4px 10px" }
						}, t(key === "sm" ? "badgeSizeSmall" : key === "md" ? "badgeSizeMedium" : "badgeSizeLarge")))
					),
					hintLine("badgeSizeHint"),
					React.createElement("div", { style: { marginTop: "12px" } },
						React.createElement("div", { style: style.desc }, t("unreadReasonsLabel")),
						React.createElement("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center" } },
							["completed", "error", "blocked", "max-tokens", "interrupted", "aborted:user", "aborted:other"].map((key) => renderReasonCheckbox(key, REASON_LABEL_KEYS[key])),
							renderReasonCheckbox("pending", "reasonPending")
						)
					),
					React.createElement("div", { style: { marginTop: "10px" } },
						React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: 12, color: "var(--dsw-alias-label-primary)", cursor: "pointer" } },
							React.createElement("input", {
								type: "checkbox",
								checked: unread.unreadIncludeSubagents !== false,
								onChange: (event) => onIncludeSubagentsToggle(event.target.checked === true),
								"aria-label": t("unreadIncludeSubagentsLabel")
							}),
							React.createElement("span", null, t("unreadIncludeSubagentsLabel"))
						),
						hintLine("unreadIncludeSubagentsHint")
					),
					React.createElement("div", { style: { marginTop: "12px" } },
						React.createElement("div", { style: style.desc }, t("clearDelayLabel")),
						React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "6px", fontSize: 12, color: "var(--dsw-alias-label-primary)" } },
							React.createElement("input", {
								type: "number", min: 0, max: UNREAD_CLEAR_DELAY_MAX_SEC, step: 1, inputMode: "numeric",
								"aria-label": t("clearDelayLabel"),
								value: clearDelayDraft,
								onChange: (event) => setClearDelayDraft(event.target.value),
								onBlur: () => onClearDelayChange(clearDelayDraft),
								onKeyDown: (event) => { if (event.key === "Enter") onClearDelayChange(clearDelayDraft); },
								style: { width: "76px", padding: "3px 6px", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: "6px", background: "transparent", color: "inherit", font: "inherit", fontSize: 12 }
							}),
							React.createElement("span", null, t("clearDelayUnit"))
						),
						hintLine("clearDelayHint")
					),
					React.createElement("div", { style: { marginTop: "10px" } },
						React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: 12, color: "var(--dsw-alias-label-primary)", cursor: "pointer" } },
							React.createElement("input", {
								type: "checkbox",
								checked: unread.workspaceDot !== false,
								onChange: (event) => onWorkspaceDotToggle(event.target.checked === true)
							}),
							React.createElement("span", null, t("workspaceDotLabel"))
						),
						hintLine("workspaceDotHint")
					),
					React.createElement("div", { style: { marginTop: "10px" } },
						React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: 12, color: "var(--dsw-alias-label-primary)", cursor: "pointer" } },
							React.createElement("input", {
								type: "checkbox",
								checked: unread.revealOnOpen !== false,
								onChange: (event) => onRevealToggle(event.target.checked === true)
							}),
							React.createElement("span", null, t("revealLabel"))
						),
						hintLine("revealHint")
					),
					React.createElement("div", { style: { marginTop: "10px" } },
						React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: 12, color: "var(--dsw-alias-label-primary)", cursor: "pointer" } },
							React.createElement("input", {
								type: "checkbox",
								checked: unread.appBadge !== false,
								onChange: (event) => onAppBadgeToggle(event.target.checked === true)
							}),
							React.createElement("span", null, t("appBadgeLabel"))
						),
						hintLine("appBadgeHint"),
						// What THIS device is — never a claim about the platform.
						React.createElement("div", { style: style.hint }, t(appBadgeCapabilityKey(appBadgeProbe))),
						// The WebKit precondition as a live local fact, plus the one
						// gesture that can still decide it (button only while undecided).
						React.createElement("div", { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", marginTop: "8px" } },
							React.createElement("span", { style: style.desc }, `${t("notificationPermissionLabel")}${t(notificationPermissionKey(notificationProbe))}`),
							notificationPermissionRequestable(notificationProbe)
								? React.createElement("button", {
									type: "button",
									style: { ...style.btn, ...(permissionBusy ? style.btnDisabled : null) },
									disabled: permissionBusy,
									onClick: onRequestPermission
								}, t("notificationPermissionButton"))
								: null
						),
						hintLine("notificationPermissionHint"),
						React.createElement("div", { style: style.hint }, t("appBadgeFootnote"))
					),
					hintLine("badgeTestHint")
				),
				// A second, independent feature in its own block: same settings page,
				// same save discipline, different fact.
				React.createElement("div", { style: { borderTop: "1px solid var(--dsw-alias-border-l2)", marginTop: "12px", paddingTop: "12px" } },
					React.createElement("div", { style: style.label }, t("runningMarkSection")),
					React.createElement("div", { style: { marginTop: "8px" } },
						React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: 12, color: "var(--dsw-alias-label-primary)", cursor: "pointer" } },
							React.createElement("input", {
								type: "checkbox",
								checked: running.enabled !== false,
								onChange: (event) => onRunningMarkToggle(event.target.checked === true)
							}),
							React.createElement("span", null, t("runningMarkLabel"))
						),
						hintLine("runningMarkHint"),
						// The second switch of the same feature: still no host fact, only a
						// counting rule. Nested under the first one because it only matters
						// while the marks themselves are on.
						React.createElement("div", { style: { marginTop: "6px" } },
							React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: 12, color: "var(--dsw-alias-label-primary)", cursor: "pointer" } },
								React.createElement("input", {
									type: "checkbox",
									checked: running.includeSubagents !== false,
									onChange: (event) => onRunningIncludeSubagentsToggle(event.target.checked === true)
								}),
								React.createElement("span", null, t("runningIncludeSubagentsLabel"))
							),
							hintLine("runningIncludeSubagentsHint")
						),
						// The third switch of the same feature: one decoration on the
						// conversation header, independent of every count above.
						React.createElement("div", { style: { marginTop: "6px" } },
							React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: 12, color: "var(--dsw-alias-label-primary)", cursor: "pointer" } },
								React.createElement("input", {
									type: "checkbox",
									checked: running.headerRing !== false,
									onChange: (event) => onHeaderRingToggle(event.target.checked === true)
								}),
								React.createElement("span", null, t("headerRingLabel"))
							),
							hintLine("headerRingHint")
						)
					)
				),
				notice ? React.createElement("div", { style: style.notice }, notice) : null,
				error ? React.createElement("div", { style: style.error }, error) : null
			);
		}
		//#endregion

		// `sessions` is gone from this list: its only use was the removed
		// `ctx.sessions.open(id)`. Navigation now goes through an optional
		// `ctx.get("uiWorkspace")` lookup instead of a hard dependency.
		const inject = ["slots", "locale", "connection"];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-icon-custom: dictionaries");
			const t = ctx.locale.bind(NS);
			const rpc = ctx.connection.rpc;
			// The watermark's Host half rides the same connection as every other RPC.
			// Setting it here (not at module scope) is what keeps the store usable in a
			// test harness with no connection: pushes stay no-ops, the badge still works.
			seenRpc = rpc;
			// The official "Session on screen" binding, looked up lazily so a build
			// without it (or a plugin loaded before ui-session) simply answers nothing
			// and the DOM/retention fallbacks keep the behaviour this file shipped with.
			officialSessionId = () => {
				try {
					const service = ctx.get("uiSession");
					const current = service !== null && service !== undefined ? service.adapter?.current : undefined;
					const value = current !== null && current !== undefined && typeof current.getSnapshot === "function" ? current.getSnapshot() : undefined;
					const key = value !== null && typeof value === "object" ? value.key : undefined;
					return typeof key === "string" && key !== "" ? key : undefined;
				} catch { return undefined; }
			};
			// The sessions service, looked up lazily for the same reason as the binding
			// above: it is only needed to nudge the host when a session's
			// `subagentCatalog` projection has not been folded yet, and a build without
			// it simply waits for the next render (see `requestHeaderRingRefresh`).
			headerRingSessions = () => {
				try { return ctx.get("sessions"); } catch { return null; }
			};
			// Pull the host state once, so the brand mark and the badge are correct
			// before the settings section is ever opened. The unread rule rides its
			// own endpoint: the icon RPCs keep their pre-badge response shape.
			rpc.call("/api", "iconCustom/getStatus", { args: {} })
				.then((resp) => { if (resp && resp.ok === true) syncStatus(resp.value); })
				.catch(() => {});
			rpc.call("/api", "iconCustom/getUnreadRule", { args: {} })
				.then((resp) => {
					if (resp === null || typeof resp !== "object" || resp.ok !== true) return;
					// The rule response carries the Host's clock; it is what puts the seen
					// watermark (and a legacy browser-domain store) into the Host's domain.
					// It also carries the Host's watermark table, which merges in here —
					// then the first push sends the union back, which is both the migration
					// (marks this browser made before 0.11.2) and the self-heal (a Host file
					// that was lost or pruned gets this browser's copy back).
					if (resp.value !== null && typeof resp.value === "object") {
						noteHostClock(resp.value.hostNow);
						if (adoptHostSeen(resp.value.seen)) saveSeenState();
					}
					emitUnreadConfig(resp.value);
					scheduleHostSync();
				})
				.catch(() => {});
			// The running-mark switch rides its own endpoint, for the same reason it has
			// its own file: a problem in either feature must not touch the other.
			rpc.call("/api", "iconCustom/getRunningRule", { args: {} })
				.then((resp) => {
					if (resp === null || typeof resp !== "object" || resp.ok !== true) return;
					emitRunningConfig(resp.value);
				})
				.catch(() => {});
			// Keep "the last moment this browser was here" fresh, so an ending that
			// happens while the app is closed still counts as unread when you return.
			ctx.effect(() => {
				// Host domain (see the seen store): "the last moment this browser was
				// here" must be comparable with `turn/end.time`, not with the browser's
				// own clock.
				const touch = () => { seenState.lastActiveAt = hostNow(); saveSeenState(); };
				const interval = window.setInterval(touch, 20000);
				window.addEventListener("visibilitychange", touch);
				window.addEventListener("beforeunload", touch);
				return () => {
					window.clearInterval(interval);
					window.removeEventListener("visibilitychange", touch);
					window.removeEventListener("beforeunload", touch);
					touch();
				};
			}, "dsh-icon-custom: unread watermark");
			// Re-sample the Host↔browser clock offset after a sleep/resume, which is the
			// one moment the two can drift apart mid-page. Throttled: it is one small
			// RPC per visible-again, and never on beforeunload (nothing would come back).
			// The same response carries the Host's watermark, so this is also how a
			// SECOND device learns that something was read elsewhere — a page that is
			// simply left open converges within a minute without a reload. Coming back
			// into view is also the natural moment to retry a failed push.
			ctx.effect(() => {
				let sampledAt = 0;
				const sample = () => {
					if (document.visibilityState === "hidden") return;
					scheduleHostSync();
					if (Date.now() - sampledAt < 60000) return;
					sampledAt = Date.now();
					rpc.call("/api", "iconCustom/getUnreadRule", { args: {} })
						.then((resp) => {
							if (resp === null || typeof resp !== "object" || resp.ok !== true) return;
							const value = resp.value !== null && typeof resp.value === "object" ? resp.value : null;
							if (value === null) return;
							noteHostClock(value.hostNow);
							if (adoptHostSeen(value.seen)) { saveSeenState(); emitUnreadPoke(); }
						})
						.catch(() => {});
				};
				window.addEventListener("visibilitychange", sample);
				const interval = window.setInterval(sample, 60000);
				return () => {
					window.removeEventListener("visibilitychange", sample);
					window.clearInterval(interval);
				};
			}, "dsh-icon-custom: host clock sample");
			// Brand-mark seat: replaces only the whale mark (verified: a
			// third-party registration wins over the official occupant and the
			// official package's mark steps aside). The brand NAME text is a
			// separate seat and is left untouched. priority -1 is required:
			// the official occupant holds priority 0, and same-priority
			// registrations throw ("register at a different priority to shadow
			// it (lowest renders)").
			ctx.slots.inject("sidebar.brand.mark", () => ctx.slots.register({ name: "sidebar.brand.mark", priority: -1 }, (props) => React.createElement(BrandMark, { ...props, rpc })));
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "favicon",
				order: 50,
				label: () => t("nav"),
				locale: NS,
				inject: () => ({ t })
			}, (props) => React.createElement(FaviconSection, { ...props, t, rpc })));

			// The badge itself is NOT a slot occupant: it is injected into the
			// sidebar's section header by `paintHeaderBadge()` (see above), because
			// `sidebar.workspaces` is a single slot covering the whole region. Only
			// the lists they open still ride a slot — the frame-wide overlay, which
			// escapes the sidebar's clipping.
			//
			// 0.2.x has no `ctx.sessions.open(id)` (the ClientSessions service exposes
			// retain/using/retainInfo/refreshProjections/search/fork/scope/binding — no
			// navigation). Official code jumps to a session with
			// `ctx.uiWorkspace.openSession(id)` (ui-chat does exactly this), so the entry
			// is looked up optionally: navigation is best effort and must never make the
			// favicon half depend on the workspace UI being mounted.
			const openSession = (row) => {
				// A list row (`{ id, workspaceId, … }`) since 0.19.0: the workspace is what
				// the sidebar reveal needs, and the pending list cannot supply it later. A
				// bare id still opens the session — it just cannot expand anything.
				const id = row !== null && typeof row === "object" ? row.id : row;
				const workspaceId = row !== null && typeof row === "object" && typeof row.workspaceId === "string" ? row.workspaceId : "";
				try { ctx.get("uiWorkspace")?.openSession(id); } catch { /* navigation is best effort */ }
				// Deliberately not awaited, and never allowed to matter: the session is open
				// either way (see the reveal region for why this is all best effort).
				void revealSessionRow(id, workspaceId);
			};
			// The injected node labels itself for screen readers, so it needs the
			// locale binder that only exists inside `apply()`.
			badgeT = t;
			ctx.slots.inject("shell.overlay", () => ctx.slots.register(
				{ name: "shell.overlay", id: "icon-custom-header-popup", order: 30 },
				() => React.createElement(HeaderPopup, { t, onOpen: openSession })
			));

			// Real number source: a headless occupant of the frame-wide overlay
			// layer reads DSH's official pending-interaction registry and pushes it
			// into the badge bridge. No plugin is addressed by name.
			ctx.slots.inject("shell.overlay", () => ctx.slots.register(
				{ name: "shell.overlay", id: "icon-custom-badge-source" },
				(props) => React.createElement(BadgeSource, props)
			));

			// Test-only badge wiring: the settings input drives the in-package
			// bridge, the brand mark reads it through its own subscription, and
			// this effect keeps the tab icon in sync. Teardown restores the
			// pristine platform/custom icon.
			ctx.effect(() => {
				const unsubscribe = subscribeBadge((snapshot) => { composeFavicon(snapshot.count, snapshot.size); });
				// Level-triggered on purpose: (re)applying this half must adopt the
				// value that is already on the bridge. The brand mark reads it at
				// mount; the tab icon has to be told, or a plugin hot-reload would
				// leave it restored (the old effect's cleanup) until the next change.
				composeFavicon(effectiveCount(), badgeSize, true);
				return () => {
					unsubscribe();
					// Forced: the promise is that unloading this half leaves the page's
					// own icon behind, whatever this page load had drawn before.
					composeFavicon(0, badgeSize, true);
				};
			}, "dsh-icon-custom: favicon badge");
			// Watchdog. The tab icon is the one surface other parties can disturb
			// (cached HTML, browser extensions, tab moves, plugin reloads), so keep
			// re-asserting the composite instead of trusting one-shot application.
			ctx.effect(() => {
				let queued = false;
				const schedule = () => {
					if (queued) return;
					queued = true;
					window.setTimeout(() => { queued = false; reconcileFavicon(); }, 150);
				};
				const observer = new MutationObserver(schedule);
				observer.observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ["href", "rel"] });
				window.addEventListener("visibilitychange", schedule);
				window.addEventListener("focus", schedule);
				const interval = window.setInterval(() => {
					reconcileFavicon();
					reassertAppBadge();
				}, 5000);
				return () => {
					observer.disconnect();
					window.removeEventListener("visibilitychange", schedule);
					window.removeEventListener("focus", schedule);
					window.clearInterval(interval);
				};
			}, "dsh-icon-custom: favicon watchdog");
			// Workspace dots: the one fragile piece. It waits for the sidebar, keeps a
			// marker on each workspace row whose folder icon it can find, and gives up
			// on its own after repeated failures. It lives entirely outside React, so a
			// throw here can never reach anyone's render tree.
			ctx.effect(() => {
				let observer = null;
				let retry = 0;
				let queued = false;
				const schedule = () => {
					if (queued) return;
					queued = true;
					window.setTimeout(() => {
						queued = false;
						paintWorkspaceDots();
						// Same region, same watchdog: the section-header badge is
						// re-injected whenever the shipped UI re-renders over it.
						paintHeaderBadge();
						// And the conversation header's ring, which lives outside this
						// container: any churn nearby is a fair moment to reconcile it.
						paintHeaderRing(runningConfig, headerRingValue);
					}, 200);
				};
				const attach = () => {
					const container = workspaceDotContainer();
					if (container === null) return false;
					observer = new MutationObserver(() => {
						if (workspaceDotPainting) return;
						// Ignore only the settle window right after our own paint. Anything
						// later — including the shipped UI re-rendering a row and taking our
						// marker with it — must trigger a reconcile, or the dot stays gone.
						if (Date.now() - workspaceDotPaintedAt < 250) return;
						schedule();
					});
					observer.observe(container, { childList: true, subtree: true });
					schedule();
					return true;
				};
				if (!attach()) retry = window.setInterval(() => { if (attach()) window.clearInterval(retry); }, 1000);
				const offDots = subscribeSidebarMarks(schedule);
				const offConfig = subscribeUnreadConfig(schedule);
				// The running marks ride the same paint pass, so their switch has to wake
				// it too — otherwise turning it off would leave the marks until the next
				// unrelated repaint.
				const offRunning = subscribeRunningConfig(schedule);
				return () => {
					if (retry !== 0) window.clearInterval(retry);
					if (workspaceDotVerify !== 0) { window.clearTimeout(workspaceDotVerify); workspaceDotVerify = 0; }
					if (observer !== null) observer.disconnect();
					offDots();
					offConfig();
					offRunning();
					clearWorkspaceDots();
					clearHeaderBadge();
					clearHeaderRing();
					// The one highlight this plugin ever puts on a SHIPPED row: it must not
					// outlive the plugin, even if the unload lands inside its flash window.
					clearRevealFlash();
				};
			}, "dsh-icon-custom: workspace dots");
			// The platform favicon.svg repaints itself for dark mode through
			// prefers-color-scheme; a composited bitmap cannot, so rebuild it —
			// forced, because the base it was built from is exactly what changed.
			ctx.on("theme/change", () => { composeFavicon(effectiveCount(), badgeSize, true); });
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
    /* ================= 2/3 原 dsh-notify-p（逐字节保留，勿改） ================= */
// dsh-notify-p · 浏览器半（手写客户端包，无构建步骤）
//
// 形态：**左侧「设置」导航里独立一页**（settings.section，order 60 = 排在 icon 管理之后）。
//
// 这一页只回答两个问题：
//   1. 配好了吗   → 分组状态点（已配置 / 未配置 / 不适用）
//   2. 能发出去吗 → 顶部状态条 + 发送测试邮件 + 最近一次投递结果
// 其余一切让路：不额外套卡片、不加编号、不做中英同屏。
//
// 编辑模型：**没有保存/放弃按钮，改完即时生效**。按字段类型区别对待：
//   - 开关 / 下拉 / 分段：立刻写
//   - 数字 / 文本：防抖（停手再写）+ 失焦兜底
//   - 密码：只在失焦或回车时写，且**每个凭据引用名各写各的**
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

    const NS = 'dsh-notify-p';

    /** Host Remote 的命名空间（与 lib/typert.host.js 清单一致）。 */
    const REMOTE_NS = 'mailNotify';

    /** 文本 / 数字字段的防抖时长（毫秒）。 */
    const TEXT_DEBOUNCE_MS = 600;
    const NUMBER_DEBOUNCE_MS = 500;

    // ---------------------------------------------------------------------------
    // 文案：zh 是内置兜底，en 走 locale 字典；界面永远只显示一种语言（不同屏并列）。
    // ---------------------------------------------------------------------------
    const ZH = {
      'group.status': '投递状态',
      'evidence.label': '最近一次发送',
      'evidence.never': '还没有试过',
      'evidence.ok': '成功，用时 {ms} 毫秒，{ago}',
      'evidence.fail': '失败',
      'cred.saved': '已保存',
      'cred.notSaved': '还没保存',
      'cred.replace': '更换',
      'cred.clear': '清除',
      'cred.placeholder': '粘贴授权码',
      'err.auth': '服务端拒绝了这组账号密码',
      'err.authHint': '多半是授权码不对或过期了：QQ 邮箱要的是「授权码」而不是登录密码，重新生成一个再填。',
      'err.rejected': '发件人被拒',
      'err.rejectedHint': '收件服务器不接受这个发件人。换个发件地址（一般在「发件人与链接」里）再试。',
      'err.network': '连不上服务器',
      'err.networkHint': '检查主机名与端口；本机防火墙或公司网络也可能挡住 465 / 587。',
      'err.other': '发送失败',
      'err.otherCode': '发送失败（{code}）',
      'err.otherHint': '原始报错在下面，把它连同主机名一起看。',
      nav: '邮件通知',
      lead: '会话干完活、出错或卡住时，给你发一封邮件。',

      'save.auto': '改动即时生效',
      'save.saving': '正在保存…',
      'save.savedAgo': '已保存，{n} 秒前',
      'save.error': '保存失败：{error}',
      'save.reload': '重新读取',
      'save.checkingCred': '正在确认授权码是否已写入…',
      'save.credCheckFailed': '凭据状态读取失败：{error}',

      'status.disabled': '已关闭，不会发任何通知',
      'status.needRecipients': '还差一个收件人',
      'status.needHost': '还差 SMTP 服务器地址',
      'status.needUser': '还差 SMTP 用户名',
      'status.needCredential': '还差{cred}',
      'status.ready': '可以发信了',
      'status.lastFailed': '上次发信失败',
      'status.notServed': '这一页读不到本插件的配置',

      // 判决下面那句人话。只说用户的事，不说实现的事。
      'status.why.disabled': '打开下面任意一种情况，才会开始通知你。',
      'status.why.needRecipients': '没有收件邮箱，邮件没有地方可去。',
      'status.why.needHost': '还没填服务器地址。',
      'status.why.needUser': '多数邮箱要求用户名和授权码成对出现。',
      'status.why.needCredential': '没填它，服务端会拒收这封信。',
      'status.why.ready': '配置齐了。发一封测试邮件，确认服务端真的收下。',
      'status.why.lastFailed': '配置看着没问题，但上一次没发出去。',

      'act.enable': '启用',
      'act.goFill': '去填写',
      'act.test': '发送测试邮件',
      'act.testing': '正在发送…',
      'act.retest': '重新测试',
      'act.needsRestart': '需要重启 DSH 后才能测试',
      'act.testHint': '按现在的配置真发一封到收件人，不用等某个会话干完。',

      'group.recipients': '收件人',
      'group.transport': '怎么发',
      'group.outcomes': '什么时候发给我',
      'group.optional': '可选设置',
      'group.sender': '发件人与链接',
      'group.advanced': '高级',


      'recipients.label': '收件邮箱',
      'recipients.placeholder': 'you@qq.com',
      'recipients.hint': '一行一个，也接受逗号或分号分隔。',
      'recipients.ok': '{n} 个有效',
      'recipients.none': '还没填',
      'recipients.invalid': '格式不对，不会被发送：{list}',

      'time.justNow': '刚刚',
      'time.secondsAgo': '{n} 秒前',
      'time.minutesAgo': '{n} 分钟前',
      'time.hoursAgo': '{n} 小时前',
      'time.daysAgo': '{n} 天前',

      'transportState.done': '已配好',
      'transportState.todo': '还没配好',

      'smtp.note': '用自己的邮箱发（QQ / 163 / Gmail / Outlook / iCloud…），只需一个授权码。',

      'preset.label': '邮箱服务商',
      'preset.other': '其他',
      'preset.detected': '已按「{name}」填好',

      'smtp.host': 'SMTP 主机',
      'smtp.port': '端口',
      'smtp.secure': '加密',
      'smtp.user': '用户名',
      'smtp.accountMismatch': '{host} 是{name}的服务器，但账号是 {user}：对不上，认证会失败。把账号换成 {suffix} 结尾的邮箱，或把服务商改成账号所属的那一家。',

      'cred.smtp': 'SMTP 授权码',
      'cred.smtpHint': '不是登录密码。只写进凭据库，永不回显；离开输入框时保存。',
      'cred.smtpHelp': '怎么拿授权码？',
      'cred.smtpHelpTitle': '怎么拿 SMTP 授权码',
      'cred.smtpHelpBody': '授权码不是登录密码，是邮箱服务商单独发的口令（QQ 是 16 位）。\n\nQQ 邮箱：设置 → 账户 → 开启「POP3/SMTP 服务」→ 生成授权码。\n163 / 126：设置 → POP3/SMTP/IMAP → 开启服务 → 新增授权码。\nGmail：账号 → 安全性 → 两步验证 → 应用专用密码。\niCloud：Apple ID → 登录与安全 → App 专用密码。\nOutlook：账户 → 安全性 → 高级安全选项 → 应用密码。',
      'cred.helpClose': '知道了',
      'cred.clear': '清除',

      'outcomes.completed': '任务完成',
      'outcomes.completedHint': '会话正常干完一件活。',
      'outcomes.error': '任务出错',
      'outcomes.errorHint': '会话报错终止。',
      'outcomes.blocked': '卡住，需要你介入',
      'outcomes.blockedHint': 'agent 需要你补充信息才能继续。',
      'outcomes.approval': '等你审批',
      'outcomes.approvalHint': '立即发送，不参与合并窗口。',
      'outcomes.more': '还有 3 种情况（默认关）',
      'outcomes.countOn': '{n} 项开启',
      'outcomes.countOff': '全部关闭，不会通知你',
      'outcomes.aborted': '你主动停止',
      'outcomes.abortedHint': '只包含你自己按停止的那次。',
      'outcomes.interrupted': '系统中断',
      'outcomes.interruptedHint': 'DSH 重启 / 热更新 / 被父级取消。',
      'outcomes.maxTokens': '达到长度上限',
      'outcomes.maxTokensHint': '回复被长度上限截断。',
      'outcomes.minDuration': '完成时长下限',
      'outcomes.minDurationHint': '短于这个时长的完成不发信；只对「任务完成」生效，出错、卡住、审批不受此限。',
      'outcomes.subagents': '也通知子代理会话',
      'outcomes.subagentsHint': '一个 workflow 能扇出几十个子会话，默认不打扰。',

      'sender.name': '发件人显示名',
      'sender.nameHint': '收件人看到的发件人名字，留空就用默认名。',
      'sender.address': '发件人地址',
      'sender.addressHint': '必须是能用的邮箱地址；格式不对或与清单里已有的重复，会在弹层里就地报错。',
      'sender.listLabel': '发件人',
      'sender.listHint': '这里保存所有发件人，发信时用选中的那一条。点某一行选中它，✎ 改，× 删。',
      'sender.empty': '还没有保存发件人 · 将回退到默认发件人',
      'sender.add': '＋ 添加发件人',
      'sender.addTitle': '添加发件人',
      'sender.editTitle': '编辑发件人',
      'sender.save': '保存',
      'sender.cancel': '取消',
      'sender.inUse': '发信时用它',
      'sender.edit': '编辑',
      'sender.remove': '删除',
      'sender.nameUnset': '（用默认显示名）',
      'sender.useThis': '用 {address} 发信',
      'sender.issue.needAddress': '请填发件人地址',
      'sender.issue.badAddress': '地址格式不对，不会被接受',
      'sender.issue.duplicate': '这个地址已经在清单里了',

      'link.enabled': '邮件里带直达会话链接',
      'link.enabledHint': '需要另装深链插件才能被识别。',
      'link.base': '链接对外地址',
      'link.baseHint': '留空则读 DSH_WEB_URL；手机要能点开就填局域网地址或域名。',

      'adv.settle': '合并窗口',
      'adv.settleHint': '毫秒。期间同一会话又开新轮，就合并成一封。',
      'adv.rate': '发送速率上限',
      'adv.rateHint': '封/分钟，多会话并停时保护邮箱服务商。',
      'adv.pwRef': 'SMTP 凭据引用名',
      'adv.pwRefHint': '凭据库里的键名，改这里不会动已存的值。',
      'adv.statePath': '投递账本路径',
      'adv.statePathHint': '留空 = $DSH_HOME/dsh-notify-p/state.json。排错时 cat 它。',

      'unit.ms': '毫秒',
      'unit.perMin': '封/分钟',

      'danger.reset': '恢复全部默认',
      'danger.title': '恢复全部默认？',
      'danger.body': '这会清掉本插件在 settings.yaml 里的全部覆盖（收件人、事件开关、节奏参数都会回到默认）。',
      'danger.keep': '凭据库里已存的授权码不受影响。',
      'danger.ok': '恢复默认',
      'danger.cancel': '取消',
    };

    const EN = {
      'group.status': 'Delivery status',
      'evidence.label': 'Last send',
      'evidence.never': 'Not tried yet',
      'evidence.ok': 'Sent in {ms} ms, {ago}',
      'evidence.fail': 'Failed',
      'cred.saved': 'Saved',
      'cred.notSaved': 'Not saved yet',
      'cred.replace': 'Replace',
      'cred.clear': 'Clear',
      'cred.placeholder': 'Paste the authorization code',
      'err.auth': 'The server rejected these credentials',
      'err.authHint': 'Usually a wrong or expired authorization code: QQ Mail needs an app code, not your login password. Generate a new one and paste it here.',
      'err.rejected': 'Sender rejected',
      'err.rejectedHint': 'The receiving server will not accept this sender. Change the From address under "Sender and links" and retry.',
      'err.network': 'Cannot reach the server',
      'err.networkHint': 'Check the host and port; a local firewall or corporate network may block 465 / 587.',
      'err.other': 'Send failed',
      'err.otherCode': 'Send failed ({code})',
      'err.otherHint': 'The raw error is below — read it together with the host name.',
      nav: 'Mail notification',
      lead: 'Get one email when a session finishes, fails, or gets stuck.',

      'save.auto': 'Changes apply immediately',
      'save.saving': 'Saving…',
      'save.savedAgo': 'Saved, {n}s ago',
      'save.error': 'Save failed: {error}',
      'save.reload': 'Reload',
      'save.checkingCred': 'Checking whether the code was written…',
      'save.credCheckFailed': 'Could not read the credential state: {error}',

      'status.disabled': 'Off — no notifications will be sent',
      'status.needRecipients': 'One recipient missing',
      'status.needHost': 'SMTP host missing',
      'status.needUser': 'SMTP user name missing',
      'status.needCredential': '{cred} missing',
      'status.ready': 'Ready to send',
      'status.lastFailed': 'The last send failed',
      'status.notServed': 'This page cannot read the plugin settings',

      'status.why.disabled': 'Turn on any case below and notifications start.',
      'status.why.needRecipients': 'Without a recipient address there is nowhere for the mail to go.',
      'status.why.needHost': 'No server address is set.',
      'status.why.needUser': 'Most providers want the user name and the authorization code together.',
      'status.why.needCredential': 'Without it the server will refuse the message.',
      'status.why.ready': 'Configuration is complete. Send a test email to confirm the server accepts it.',
      'status.why.lastFailed': 'The configuration looks fine, but the last attempt did not go out.',

      'act.enable': 'Turn on',
      'act.goFill': 'Fill it in',
      'act.test': 'Send a test email',
      'act.testing': 'Sending…',
      'act.retest': 'Test again',
      'act.needsRestart': 'Restart DSH to test',
      'act.testHint': 'Really sends one email to the recipients right now, without waiting for a session to finish.',

      'group.recipients': 'Recipients',
      'group.transport': 'How to send',
      'group.outcomes': 'When to notify me',
      'group.optional': 'Optional',
      'group.sender': 'Sender and links',
      'group.advanced': 'Advanced',


      'recipients.label': 'Recipient addresses',
      'recipients.placeholder': 'you@qq.com, one per line',
      'recipients.hint': 'One per line; commas and semicolons also work.',
      'recipients.ok': '{n} valid',
      'recipients.none': 'None yet',
      'recipients.invalid': 'Bad format, will not be sent: {list}',

      'time.justNow': 'just now',
      'time.secondsAgo': '{n}s ago',
      'time.minutesAgo': '{n} min ago',
      'time.hoursAgo': '{n} h ago',
      'time.daysAgo': '{n} d ago',

      'transportState.done': 'Configured',
      'transportState.todo': 'Not configured yet',

      'smtp.note': 'Send from your own mailbox (QQ / 163 / Gmail / Outlook / iCloud…). Only an authorization code is needed.',

      'preset.label': 'Mail provider',
      'preset.other': 'Other',
      'preset.detected': 'Filled in for “{name}”',

      'smtp.host': 'SMTP host',
      'smtp.port': 'Port',
      'smtp.secure': 'Security',
      'smtp.user': 'User name',
      'smtp.accountMismatch': '{host} is {name}’s server but the account is {user} — they do not match, so authentication will fail. Use a {suffix} address, or switch the provider to the account’s own.',

      'cred.smtp': 'SMTP authorization code',
      'cred.smtpHint': 'Not your login password. Written to the credential store only, never echoed; saved when you leave the field.',
      'cred.smtpHelp': 'How do I get one?',
      'cred.smtpHelpTitle': 'Getting an SMTP authorization code',
      'cred.smtpHelpBody': 'An authorization code is not your login password — the mail provider issues it separately.\n\nQQ Mail: Settings → Account → enable “POP3/SMTP service” → generate the code.\n163 / 126: Settings → POP3/SMTP/IMAP → enable the service → add an authorization code.\nGmail: Account → Security → 2-Step Verification → App passwords.\niCloud: Apple ID → Sign-In and Security → App-Specific Passwords.\nOutlook: Account → Security → Advanced security options → App password.',
      'cred.helpClose': 'Got it',
      'cred.clear': 'Clear',

      'outcomes.completed': 'Task completed',
      'outcomes.completedHint': 'A session finished its work normally.',
      'outcomes.error': 'Task failed',
      'outcomes.errorHint': 'A session ended with an error.',
      'outcomes.blocked': 'Stuck — needs you',
      'outcomes.blockedHint': 'The agent needs more from you to continue.',
      'outcomes.approval': 'Waiting for your approval',
      'outcomes.approvalHint': 'Sent immediately, outside the coalesce window.',
      'outcomes.more': '3 more cases (off by default)',
      'outcomes.countOn': '{n} on',
      'outcomes.countOff': 'All off — you will not be notified',
      'outcomes.aborted': 'You stopped it',
      'outcomes.abortedHint': 'Only when you pressed stop yourself.',
      'outcomes.interrupted': 'Interrupted by the system',
      'outcomes.interruptedHint': 'Harness restart / hot reload / cancelled by a parent.',
      'outcomes.maxTokens': 'Token limit reached',
      'outcomes.maxTokensHint': 'The reply was cut off by the length limit.',
      'outcomes.minDuration': 'Minimum duration',
      'outcomes.minDurationHint': 'Completions shorter than this are not sent; applies to “Task completed” only — failures, blocks and approvals always get through.',
      'outcomes.subagents': 'Also notify subagent sessions',
      'outcomes.subagentsHint': 'One workflow can fan out dozens of sub-sessions; off by default.',

      'sender.name': 'Sender display name',
      'sender.nameHint': 'The name your recipients see; leave empty to use the default.',
      'sender.address': 'From address',
      'sender.addressHint': 'Must be a usable email address; a bad one or a duplicate is reported in the dialog.',
      'sender.listLabel': 'Senders',
      'sender.listHint': 'All senders are kept here; the selected one is used to send. Click a row to select it, ✎ to edit, × to remove.',
      'sender.empty': 'No sender saved yet · will fall back to the default sender',
      'sender.add': '＋ Add sender',
      'sender.addTitle': 'Add sender',
      'sender.editTitle': 'Edit sender',
      'sender.save': 'Save',
      'sender.cancel': 'Cancel',
      'sender.inUse': 'In use',
      'sender.edit': 'Edit',
      'sender.remove': 'Remove',
      'sender.nameUnset': '(uses the default name)',
      'sender.useThis': 'Send from {address}',
      'sender.issue.needAddress': 'A from address is required',
      'sender.issue.badAddress': 'Not a valid email address',
      'sender.issue.duplicate': 'This address is already in the list',

      'link.enabled': 'Include a link to the session',
      'link.enabledHint': 'Needs a deep-link plugin installed to be recognized.',
      'link.base': 'Public base URL',
      'link.baseHint': 'Empty reads DSH_WEB_URL. To open links on your phone, put a LAN address or domain here.',

      'adv.settle': 'Coalesce window',
      'adv.settleHint': 'Milliseconds. A new turn in the same session during this window is folded into one email.',
      'adv.rate': 'Send rate limit',
      'adv.rateHint': 'Emails per minute; protects your mail provider when many sessions stop at once.',
      'adv.pwRef': 'SMTP credential reference',
      'adv.pwRefHint': 'The key name in the credential store. Renaming does not touch the stored value.',
      'adv.statePath': 'Delivery ledger path',
      'adv.statePathHint': 'Empty = $DSH_HOME/dsh-notify-p/state.json. cat it when debugging.',

      'unit.ms': 'ms',
      'unit.perMin': 'per min',

      'danger.reset': 'Reset everything to defaults',
      'danger.title': 'Reset everything to defaults?',
      'danger.body': 'This clears every override this plugin stored in settings.yaml — recipients, event switches and pacing all return to defaults.',
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
     * 归一化发件人清单，并把老配置迁移成清单。
     * 规则必须与 Host 侧 lib/config.js 的 senderList 保持一致（迁移、去空、去重）。
     * @param {object} config 当前草稿
     * @returns {{ name: string, address: string }[]} 清单（可能为空）
     */
    function migrateSenders(config) {
      const raw = Array.isArray(config?.senders) ? config.senders : [];
      const list = [];
      const seen = new Set();
      for (const entry of raw) {
        const address = String(entry?.address ?? '').trim();
        if (address === '') continue;
        const key = address.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        list.push({ name: String(entry?.name ?? '').trim(), address });
      }
      if (list.length > 0) return list;
      const address = String(config?.fromAddress ?? '').trim();
      if (address === '') return [];
      return [{ name: String(config?.senderName ?? '').trim(), address }];
    }

    /**
     * 哪一条是当前生效的。
     * 与 Host 侧 resolveSender 同规则：按**地址**匹配，找不到就退回第一条。
     * @param {object} config 当前草稿
     * @param {{name: string, address: string}[]} list 已归一化的清单
     * @returns {string} 生效的地址；清单为空时 ''
     */
    function activeSenderAddress(config, list) {
      const wanted = String(config?.activeSender ?? '').trim().toLowerCase();
      const hit = list.find((entry) => entry.address.toLowerCase() === wanted);
      return (hit ?? list[0])?.address ?? '';
    }

    /**
     * 校验一条发件人。
     * @param {{name: string, address: string}[]} list 现有清单
     * @param {number} editing 正在编辑的下标；等于 list.length 表示新增
     * @param {{name: string, address: string}} value 待保存的值
     * @returns {''|'needAddress'|'badAddress'|'duplicate'} '' 表示通过
     */
    function senderIssue(list, editing, value) {
      const address = String(value?.address ?? '').trim();
      if (address === '') return 'needAddress';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return 'badAddress';
      const key = address.toLowerCase();
      for (let i = 0; i < list.length; i += 1) {
        if (i !== editing && list[i].address.toLowerCase() === key) return 'duplicate';
      }
      return '';
    }

    /**
     * 保存一条（新增或就地修改）。
     * 新增的**自动成为生效项**；改地址时若它正是生效项，生效项跟着新地址走。
     * @param {{list: object[], active: string, editing: number}} state 当前状态
     * @param {{name: string, address: string}} value 待保存的值
     * @returns {{list: object[], active: string}} 新状态
     */
    function senderCommit(state, value) {
      const list = state.list.map((entry) => ({ ...entry }));
      const name = String(value?.name ?? '').trim();
      const address = String(value?.address ?? '').trim();
      if (state.editing >= list.length) {
        list.push({ name, address });
        return { list, active: address };
      }
      const before = list[state.editing].address;
      list[state.editing] = { name, address };
      return { list, active: state.active === before ? address : state.active };
    }

    /**
     * 删一条，并决定谁来接替生效位。
     * 删掉的正是生效项时，选它下面那条（没有下面则选最后一条）；删光则清空生效位。
     * @param {{list: object[], active: string}} state 当前状态
     * @param {number} index 要删的下标
     * @returns {{list: object[], active: string}} 新状态
     */
    function senderRemove(state, index) {
      const list = state.list.map((entry) => ({ ...entry }));
      const wasActive = list[index].address === state.active;
      list.splice(index, 1);
      if (list.length === 0) return { list, active: '' };
      if (!wasActive) return { list, active: state.active };
      return { list, active: list[Math.min(index, list.length - 1)].address };
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
     * 「多久以前」的人话。只给投递结果用，所以粒度到分钟就够。
     * @param {unknown} at 时间戳（毫秒）
     * @param {number} now 当前时间戳
     * @returns {string} 如「刚刚」「3 分钟前」
     */
    function relativeTime(at, now) {
      const stamp = typeof at === 'number' && Number.isFinite(at) ? at : null;
      if (stamp === null) return '';
      const seconds = Math.max(0, Math.round((now - stamp) / 1000));
      if (seconds < 10) return i18n.t('time.justNow');
      if (seconds < 60) return i18n.t('time.secondsAgo', { n: seconds });
      const minutes = Math.round(seconds / 60);
      if (minutes < 60) return i18n.t('time.minutesAgo', { n: minutes });
      const hours = Math.round(minutes / 60);
      if (hours < 24) return i18n.t('time.hoursAgo', { n: hours });
      return i18n.t('time.daysAgo', { n: Math.round(hours / 24) });
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

    /** 状态条的取值顺序：先看能不能发，再看有没有真的发出去过。 */
    const STATUS_TONE = {
      disabled: 'idle',
      needRecipients: 'warning',
      needHost: 'warning',
      needUser: 'warning',
      needCredential: 'warning',
      lastFailed: 'error',
      ready: 'done',
    };

    /**
     * 推导状态条要显示哪个结论。纯函数，输入全部来自草稿与凭据状态。
     * SMTP 是唯一的发送方式，必填项是「主机 + 用户名 + 凭据」，缺哪个就报哪个——
     * 只报主机会让用户填完主机才发现还是发不出去。
     * @param {object} input 判定输入
     * @returns {string} 状态键
     */
    function deriveStatus(input) {
      const { enabled, recipientCount, host, user, credentialConfigured, lastDelivery } = input ?? {};
      if (enabled !== true) return 'disabled';
      if (!(recipientCount > 0)) return 'needRecipients';
      if (String(host ?? '').trim() === '') return 'needHost';
      if (String(user ?? '').trim() === '') return 'needUser';
      if (credentialConfigured !== true) return 'needCredential';
      if (lastDelivery && lastDelivery.ok === false) return 'lastFailed';
      return 'ready';
    }

    /**
     * 某一组的状态点。optional 组只区分「已自定义 / 走默认」。
     * @param {boolean} done 是否已配置好
     * @param {boolean} [notApplicable] 是否不适用
     * @returns {'done'|'warning'|'idle'} 状态点状态
     */
    function dotState(done, notApplicable) {
      if (notApplicable === true) return 'idle';
      return done === true ? 'done' : 'warning';
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
    //   内容列 ≈ 564px · 段标题 14/22·500 · 行标题 14/22 · 字段标签 12/18·500
    //   说明 12/18 tertiary · 行间 .5px border-l2 · 段头下 .5px border-l3
    //   填充面 = bg-module-platform（宿主"编辑器/选中态"用的就是这个）
    //
    // 纪律：全页零硬编码颜色（单测里有审计）。**全页只有一个填充面 —— 判决条。**
    // ---------------------------------------------------------------------------

    /** 一眼看出浏览器加载的是哪一版。放在根节点的 data-build 上，检查 DOM 可见，不占视觉。 */
    const BUILD = 'ui11';

    const CSS = `
/* dsh-notify-p · 设置页样式（量度对齐宿主 settings 页；全页零硬编码颜色） */
.dshmn-page{display:flex;flex-direction:column;min-width:0;max-width:100%;color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px}
.dshmn-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:18px;font-variant-numeric:tabular-nums}

/* 页头：一句用途 + 落盘读数（读数只报事实，不报"操作成功"） */
.dshmn-head{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin:0 0 14px;min-width:0}
.dshmn-lead{margin:0;min-width:0;color:var(--dsw-alias-label-secondary);font-size:14px;line-height:22px}
.dshmn-stamp{flex:none;display:inline-flex;align-items:center;gap:6px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.dshmn-stamp[data-tone=busy]{color:var(--dsw-alias-label-secondary)}
.dshmn-stamp[data-tone=error]{color:var(--dsw-alias-state-error-primary)}

/* ── 判决条：全页唯一的填充面 ────────────────────────────────────────────── */
.dshmn-verdict{display:flex;flex-direction:column;gap:8px;padding:14px 16px;border-radius:12px;min-width:0;
  background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l3)}
.dshmn-verdictHead{display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}
.dshmn-verdictTitle{margin:0;min-width:0;color:var(--dsw-alias-label-primary);font-size:16px;line-height:24px;font-weight:500}
.dshmn-verdictWhy{margin:0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
.dshmn-verdictFoot{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-top:2px}
.dshmn-evidence{display:flex;flex-direction:column;gap:2px;margin-top:2px;padding-top:10px;min-width:0;
  border-top:.5px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dshmn-evidenceKey{color:var(--dsw-alias-label-tertiary)}
.dshmn-evidence[data-ok=false] .dshmn-evidenceKey{color:var(--dsw-alias-state-error-primary)}
.dshmn-evidence .dshmn-mono{color:var(--dsw-alias-label-secondary);word-break:break-all}

/* ── 分组：段头 + 发丝线。不做卡片、不编号 ──────────────────────────────── */
.dshmn-group{display:flex;flex-direction:column;margin-top:24px;min-width:0}
.dshmn-groupHead{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;
  padding-bottom:6px;border-bottom:.5px solid var(--dsw-alias-border-l3)}
.dshmn-groupTitle{margin:0;color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px;font-weight:500}
.dshmn-groupState{flex:none;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:22px;font-variant-numeric:tabular-nums}
.dshmn-groupBody{display:flex;flex-direction:column;min-width:0}

/* ── 条目：分隔线长在条目上，这样"父行 + 缩进子行"之间只画一条线 ─────────── */
.dshmn-item{display:flex;flex-direction:column;gap:8px;padding:12px 0;min-width:0;
  border-bottom:.5px solid var(--dsw-alias-border-l2)}
.dshmn-item:last-child{padding-bottom:0;border-bottom:none}
.dshmn-itemHead{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;min-width:0}
.dshmn-itemText{display:flex;flex-direction:column;gap:4px;flex:1 1 auto;min-width:0}
.dshmn-itemTitle{color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px}
.dshmn-itemCtrl{flex:none;display:flex;align-items:center;gap:8px;min-height:22px}
/* 缩进子行：把"它只对上面那一项生效"画成结构，而不是再写一句说明 */
.dshmn-sub{display:flex;flex-direction:column;gap:8px;margin-left:3px;padding-left:12px;min-width:0;
  border-left:.5px solid var(--dsw-alias-border-l2)}
.dshmn-sub[data-muted=true]{opacity:.5}

/* ── 字段：标签在上、控件满宽（宿主 settings-models 的 fieldLabel 同款） ── */
.dshmn-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.dshmn-label{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;font-weight:500}
.dshmn-hint{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;max-width:44em}
.dshmn-error{margin:0;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;word-break:break-word}
.dshmn-credState{display:inline-flex;align-items:center;gap:6px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.dshmn-credState[data-ok=true]{color:var(--dsw-alias-state-success-primary)}
.dshmn-linkRow{display:flex;align-items:center;gap:12px;flex-wrap:wrap}

/* ── 输入 ──────────────────────────────────────────────────────────────── */
/* 宿主的 Input 原语是 content-box 的 inline-flex（padding 0 8px + .5px 描边）,
   所以光给 width:100% 会让它比父级宽出 18px、顶出内容列。必须一起给 border-box。 */
.dshmn-inputWrap{box-sizing:border-box;display:flex;width:100%;min-width:0}
.dshmn-inputWrap>*{box-sizing:border-box;width:100%;min-width:0}
.dshmn-textarea{box-sizing:border-box;width:100%;min-height:64px;padding:8px 10px;resize:vertical;outline:none;
  border:.5px solid var(--dsw-alias-border-l4);border-radius:8px;background:var(--dsw-alias-bg-layer-1);
  color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:22px}
.dshmn-textarea::placeholder{color:var(--dsw-alias-label-tertiary)}
.dshmn-select{box-sizing:border-box;width:100%;height:36px;padding:0 10px;outline:none;
  border:.5px solid var(--dsw-alias-border-l4);border-radius:8px;background:var(--dsw-alias-bg-layer-1);
  color:var(--dsw-alias-label-primary);font:inherit;font-size:14px}
.dshmn-textarea:focus-visible,.dshmn-select:focus-visible{border-color:var(--dsw-alias-brand-primary);
  box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}
.dshmn-textarea[aria-invalid=true]{border-color:var(--dsw-alias-state-error-primary)}

/* ── 发件人清单：一行一个身份，选中用 module 面（与 segBtn 的选中语言一致）──── */
/* 清单本身是个带描边的容器，条目之间只画发丝线——和 Group 的语言保持一致。 */
.dshmn-senders{display:flex;flex-direction:column;border:.5px solid var(--dsw-alias-border-l4);
  border-radius:8px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}
.dshmn-sender{display:flex;align-items:center;gap:10px;padding:0 6px 0 10px;min-height:46px;cursor:pointer;
  border-bottom:.5px solid var(--dsw-alias-border-l2)}
.dshmn-sender:last-child{border-bottom:none}
.dshmn-sender:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dshmn-sender[data-active=true]{background:var(--dsw-alias-bg-module-platform)}
.dshmn-senderRadio{flex:none;width:15px;height:15px;margin:0;cursor:pointer;accent-color:var(--dsw-alias-brand-primary)}
.dshmn-senderBody{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;padding:7px 0}
.dshmn-senderName{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  color:var(--dsw-alias-label-primary);font-size:14px;line-height:20px}
.dshmn-sender[data-active=true] .dshmn-senderName{font-weight:500}
.dshmn-senderAddr{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.dshmn-senderBadge{flex:none;color:var(--dsw-alias-state-success-primary);font-size:12px;line-height:18px}
.dshmn-senderIcon{flex:none;box-sizing:border-box;width:26px;height:26px;display:inline-flex;align-items:center;
  justify-content:center;padding:0;cursor:pointer;border:none;border-radius:6px;background:none;
  color:var(--dsw-alias-label-tertiary);font:inherit;font-size:15px;line-height:1}
.dshmn-senderIcon:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dshmn-senderIcon:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dshmn-senderEmpty{padding:12px;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:22px}
.dshmn-senderAdd{box-sizing:border-box;align-self:flex-start;display:inline-flex;align-items:center;gap:6px;
  margin:8px 10px;height:30px;padding:0 13px;cursor:pointer;font:inherit;font-size:13px;line-height:18px;
  border:.5px dashed var(--dsw-alias-border-l4);border-radius:15px;background:transparent;
  color:var(--dsw-alias-label-secondary)}
.dshmn-senderAdd:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dshmn-senderAdd:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}

/* SMTP 三个短字段排一行；窄屏折成一列——别竖着排三个满宽输入。 */
.dshmn-grid{display:grid;grid-template-columns:minmax(0,1fr) 88px 104px;gap:10px;align-items:start;min-width:0}
.dshmn-num{display:inline-flex;align-items:center;gap:6px;min-width:0}
.dshmn-numBox{width:78px;min-width:0}
.dshmn-numBox>*,.dshmn-numBox input{box-sizing:border-box;width:100%;min-width:0}
.dshmn-unit{flex:none;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}

/* ── 单选：宿主"外观"三张卡的形态 —— 未选=白底+发丝线，选中=module 面 ──── */
.dshmn-seg{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dshmn-segBtn{box-sizing:border-box;height:32px;padding:0 14px;cursor:pointer;font:inherit;font-size:13px;line-height:20px;
  border:.5px solid var(--dsw-alias-border-l4);border-radius:16px;background:var(--dsw-alias-bg-layer-1);
  color:var(--dsw-alias-label-secondary)}
.dshmn-segBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dshmn-segBtn[data-active=true]{background:var(--dsw-alias-bg-module-platform);border-color:var(--dsw-alias-border-l3);
  color:var(--dsw-alias-label-primary);font-weight:500}
.dshmn-segBtn:focus-visible,.dshmn-link:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}

/* ── 文字按钮 ──────────────────────────────────────────────────────────── */
.dshmn-link{color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;cursor:pointer;
  padding:0;border:none;background:none;text-decoration:underline;text-underline-offset:3px;
  text-decoration-color:var(--dsw-alias-border-l4)}
.dshmn-link:hover{color:var(--dsw-alias-label-primary)}
.dshmn-link:disabled{color:var(--dsw-alias-label-tertiary);cursor:default;text-decoration:none}

/* ── 折叠区与页脚 ──────────────────────────────────────────────────────── */
.dshmn-disclose{margin-top:0}
.dshmn-discloseBody{display:flex;flex-direction:column;gap:4px;padding-top:10px;min-width:0}
/* 展开后的内容：缩进 + 一道左竖线，跟 SMTP 子块同一套语言——
   折叠区打开后必须一眼看出"这些东西属于上面那一行"，而不是又一组平铺的设置。 */
.dshmn-stack{display:flex;flex-direction:column;gap:14px;min-width:0;margin-top:10px;
  padding-left:12px;border-left:1px solid var(--dsw-alias-border-l2)}
/* 内容自带行节奏时（Row 自己有内边距和发丝线）只保留缩进，别再叠一层间距 */
.dshmn-stack[data-rows=true]{gap:0}
.dshmn-foot{display:flex;align-items:center;justify-content:flex-end;gap:12px;flex-wrap:wrap;margin-top:24px;
  padding-top:14px;border-top:.5px solid var(--dsw-alias-border-l3)}
.dshmn-helpBody{white-space:pre-wrap;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:21px}

/* ── 窄屏：宿主 settings 页的断点就是 560px ─────────────────────────────── */
@media (max-width:560px){
  .dshmn-head{flex-direction:column;gap:4px}
  .dshmn-verdictFoot{justify-content:flex-start}
  .dshmn-grid{grid-template-columns:minmax(0,1fr)}
  .dshmn-numBox{width:auto;flex:1 1 auto}
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
      return h('input', {
        type: 'checkbox',
        checked: props.checked === true,
        disabled: props.disabled === true,
        'aria-label': props.label,
        onChange: () => props.onChange(props.checked !== true),
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

    /** 按钮。 */
    function Button(props) {
      if (typeof P.Button === 'function') return h(P.Button, props);
      return h('button', { type: 'button', className: 'dshmn-link', onClick: props.onClick, disabled: props.disabled }, props.children);
    }

    /** 输入框（宿主原语自带 0.5px 发丝描边与 focus-within 主题色）。 */
    function TextInput(props) {
      const { className, ...rest } = props;
      if (typeof P.Input === 'function') {
        return h(P.Input, { ...rest, className: `dshmn-inputWrap${className === undefined ? '' : ` ${className}`}` });
      }
      return h('input', { ...rest, className: 'dshmn-textarea', style: { minHeight: 0, height: 32 } });
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

    /**
     * 折叠区。优先用宿主原语，取不到再退化为本地实现。
     * @param {object} props 折叠参数
     * @returns {object} React 元素
     */
    function Disclosure(props) {
      const { title, open, onToggle, children } = props;
      if (typeof P.DisclosureRow === 'function') {
        return h('div', { className: 'dshmn-disclose' }, h(P.DisclosureRow, {
          title,
          open: open === true,
          expandable: true,
          expandOnRowClick: true,
          onToggle,
        }, children));
      }
      const head = h('button', {
        type: 'button',
        className: 'dshmn-link',
        'aria-expanded': open === true,
        onClick: onToggle,
      }, `${open === true ? '▾' : '▸'} ${title}`);
      const body = open === true ? h('div', { className: 'dshmn-discloseBody' }, children) : null;
      return h('div', { className: 'dshmn-disclose' }, head, body);
    }

    // ---------------------------------------------------------------------------
    // 页面
    // ---------------------------------------------------------------------------

    /**
     * 一个分组：段头（名字 + 这一段的结论）+ 一条发丝线，内容靠行与行之间的分隔线组织。
     *
     * **不编号、不套卡片。** 以前是 `1 收件人 / 2 怎么发 / 3 什么时候发给我` 三张同款灰卡，
     * 编号把并列的三个设置组伪装成步骤序列（内容并不是步骤），三块同款灰又让主次消失。
     * @param {object} props 分组参数
     * @returns {object} React 元素
     */
    function Group(props) {
      const { title, state, children } = props;
      return h('section', { className: 'dshmn-group', 'aria-label': title },
        h('div', { className: 'dshmn-groupHead' },
          h('h3', { className: 'dshmn-groupTitle' }, title),
          state === undefined ? null : h('span', { className: 'dshmn-groupState' }, state)),
        h('div', { className: 'dshmn-groupBody' }, children));
    }

    /**
     * 一行：标题 + 说明在左，控件在右。
     * @param {object} props 行参数
     * @returns {object} React 元素
     */
    function Row(props) {
      const { title, hint, control, htmlFor, children } = props;
      return h('div', { className: 'dshmn-item' },
        h('div', { className: 'dshmn-itemHead' },
          h('div', { className: 'dshmn-itemText' },
            htmlFor === undefined
              ? h('div', { className: 'dshmn-itemTitle' }, title)
              : h('label', { className: 'dshmn-itemTitle', htmlFor }, title),
            hint === undefined ? null : h('div', { className: 'dshmn-hint' }, hint)),
          control === undefined ? null : h('div', { className: 'dshmn-itemCtrl' }, control)),
        children);
    }

    /**
     * 缩进子行：表达"这一项只对上面那一项生效"，而不是再补一句说明。
     * 父项关掉时整块压暗，但仍然可见——它没被删掉，只是暂时不参与。
     * @param {object} props 子行参数
     * @returns {object} React 元素
     */
    function Sub(props) {
      const { title, hint, control, muted } = props;
      return h('div', { className: 'dshmn-sub', 'data-muted': muted === true ? 'true' : 'false' },
        h('div', { className: 'dshmn-itemHead' },
          h('div', { className: 'dshmn-itemText' },
            h('div', { className: 'dshmn-itemTitle' }, title),
            hint === undefined ? null : h('div', { className: 'dshmn-hint' }, hint)),
          control === undefined ? null : h('div', { className: 'dshmn-itemCtrl' }, control)));
    }

    /** 带单位后缀的数字输入（贴在一行里，所以宽度定死；单位常驻可见）。 */
    function NumberField({ id, value, unit, onChange, onBlur, placeholder, label }) {
      return h('span', { className: 'dshmn-num' },
        h('span', { className: 'dshmn-numBox' },
          h(TextInput, {
            id,
            type: 'number',
            inputMode: 'numeric',
            value: value ?? '',
            placeholder,
            'aria-label': label,
            onChange: (event) => onChange(event.target.value === '' ? '' : Number(event.target.value)),
            onBlur,
          })),
        h('span', { className: 'dshmn-unit' }, unit));
    }

    /**
     * 设置页组件。
     * @param {object} props settings.section 传入的 props，外加 remotes / i18n 持有者
     * @returns {object} React 元素
     */
    function MailNotifyPage(props) {
      const { remotes } = props;
      const t = (key, params) => i18n.t(key, params);

      const [ready, setReady] = React.useState(remotes.current !== null);
      const [attempt, setAttempt] = React.useState(0);
      const [draft, setDraft] = React.useState({});
      const [save, setSave] = React.useState({ phase: 'idle', at: 0, error: '' });
      const [now, setNow] = React.useState(() => Date.now());
      const [credentialState, setCredentialState] = React.useState({});
      const [credError, setCredError] = React.useState('');
      const [credCheck, setCredCheck] = React.useState(0);
      const [pwDraft, setPwDraft] = React.useState({});
      const [pwClear, setPwClear] = React.useState({});
      const [resetting, setResetting] = React.useState(false);
      const [confirmReset, setConfirmReset] = React.useState(false);
      const [helpKind, setHelpKind] = React.useState(null);
      const [test, setTest] = React.useState({ phase: 'idle', transport: '', ms: 0, error: '' });
      const [lastDelivery, setLastDelivery] = React.useState(null);
      const [capability, setCapability] = React.useState('unknown');
      const [showMoreOutcomes, setShowMoreOutcomes] = React.useState(false);
      const [showSender, setShowSender] = React.useState(false);
      /** 发件人弹层的编辑态：null = 关闭；{ index, name, address }，index === 清单长度 表示新增。 */
      const [senderEdit, setSenderEdit] = React.useState(null);
      /** 发件人弹层的就地报错文案（空串 = 没报错）。 */
      const [senderErr, setSenderErr] = React.useState('');
      const [showAdvanced, setShowAdvanced] = React.useState(false);
      const [customHost, setCustomHost] = React.useState(false);

      const draftRef = React.useRef({});
      const baselineRef = React.useRef({});
      const viewRef = React.useRef(null);
      const timers = React.useRef({});
      const pwTimers = React.useRef({});
      // 语言切换时强制重渲染（locale 服务只在变化时通知，不驱动 React）
      const [, setLocaleRev] = React.useState(0);

      React.useEffect(() => {
        const locale = i18n.locale;
        if (locale === null || typeof locale.subscribe !== 'function') return undefined;
        return locale.subscribe(() => setLocaleRev((n) => n + 1));
      }, []);

      // 远程命名空间迟到：最多轮询 40 次（约 6 秒）
      React.useEffect(() => {
        if (ready || attempt >= 40) return undefined;
        const timer = setTimeout(() => {
          if (remotes.current !== null) setReady(true);
          setAttempt((n) => n + 1);
        }, 150);
        return () => clearTimeout(timer);
      }, [ready, attempt, remotes]);

      const load = React.useCallback(async () => {
        const bridge = remotes.current;
        if (bridge === null) return;
        try {
          const described = unwrap(await bridge.settings.describe());
          const namespaces = Array.isArray(described?.namespaces) ? described.namespaces : [];
          const found = namespaces.find((item) => item && item.ns === NS) ?? null;
          viewRef.current = found;
          const value = found && found.value && typeof found.value === 'object' ? { ...found.value } : {};
          draftRef.current = value;
          baselineRef.current = value;
          setDraft(value);
          setSave(found === null
            ? { phase: 'error', at: 0, error: t('status.notServed') }
            : { phase: 'idle', at: 0, error: '' });
        } catch (err) {
          setSave({ phase: 'error', at: 0, error: String(err?.message ?? err) });
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

      /** 最近一次投递结果 + Host 能力探测。 */
      const refreshDelivery = React.useCallback(async () => {
        // 顺带探一次能力：typert 清单是**服务器启动时**扫描注册的，
        // 所以"connection 在"不等于"mailNotify 端点在"。探不到就老实说不可用，
        // 而不是给一个点下去必然报错的按钮。
        if (remotes.current?.rpc === undefined) {
          setCapability('missing');
          return;
        }
        try {
          const state = unwrap(await callRemote('state'));
          setCapability('ready');
          setLastDelivery(state?.recent?.[0] ?? null);
        } catch (err) {
          setCapability('missing');
          console.warn('[dsh-notify-p] Host 未提供 mailNotify 端点（重启 DSH 后生效）/ endpoint unavailable:', err);
        }
      }, [remotes]);

      // 首次就绪后装载
      React.useEffect(() => {
        if (ready && viewRef.current === null) void load();
      }, [ready, load, attempt]);

      // `viewRef.current` 是 load() 里赋的**引用**，赋值不会触发重渲染。
      // 所以依赖数组里写 viewRef.current 是无效的：首次挂载时它还是 null，
      // load() 完成后依赖没变，这个 effect 永远不会再跑一遍 —— 结果就是
      // 凭据永远是「还没保存」、投递账本永远读不到、测试按钮永远不出现。
      // 在渲染期把它取成一个普通值参与依赖，false→true 那一次就会把下面几条读都带起来。
      const loaded = viewRef.current !== null;

      React.useEffect(() => {
        if (ready && loaded) {
          void refreshCredentials([viewRef.current?.value?.smtpPasswordRef]);
          void refreshDelivery();
        }
      }, [ready, loaded, refreshCredentials, refreshDelivery, attempt]);

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
       * 把若干字段写回 Host（即时生效的核心）。
       * @param {string[]} keys 要提交的字段名
       * @returns {Promise<void>}
       */
      const commit = React.useCallback(async (keys) => {
        const bridge = remotes.current;
        const view = viewRef.current;
        if (bridge === null || view === null) return;
        const base = baselineRef.current ?? {};
        const ops = [];
        for (const key of keys) {
          const value = draftRef.current[key];
          if (value === base[key]) continue;
          if (value === '' || value === null || value === undefined) ops.push({ op: 'unset', path: [key] });
          else ops.push({ op: 'set', path: [key], value });
        }
        if (ops.length === 0) return;
        setSave({ phase: 'saving', at: 0, error: '' });
        try {
          const next = unwrap(await bridge.settings.mutate(NS, ops, view.revision));
          if (next && typeof next === 'object') {
            viewRef.current = next;
            baselineRef.current = next.value && typeof next.value === 'object' ? { ...next.value } : {};
          }
          setSave({ phase: 'saved', at: Date.now(), error: '' });
        } catch (err) {
          setSave({ phase: 'error', at: 0, error: String(err?.message ?? err) });
          // 冲突或失败都重读一次，避免本地草稿与 Host 漂移
          await load();
        }
      }, [remotes, load]);

      /**
       * 改一个字段。
       * @param {string} key 字段名
       * @param {unknown} value 新值
       * @param {{ immediate?: boolean, delay?: number }} [opts] 提交策略
       * @returns {void}
       */
      const setField = React.useCallback((key, value, opts = {}) => {
        draftRef.current = { ...draftRef.current, [key]: value };
        setDraft(draftRef.current);
        clearTimeout(timers.current[key]);
        if (opts.immediate === true) {
          void commit([key]);
          return;
        }
        timers.current[key] = setTimeout(() => void commit([key]), opts.delay ?? TEXT_DEBOUNCE_MS);
      }, [commit]);

      /** 立刻提交某字段（失焦兜底）。 */
      const flush = React.useCallback((key) => {
        clearTimeout(timers.current[key]);
        void commit([key]);
      }, [commit]);

      /**
       * 一次改多个字段并**合成一次提交**。
       *
       * 必须批量：`commit` 带的是同一个 revision，连续发多个即时写入会互相冲突，
       * 后发的会被 Host 拒绝并被随后的 load() 回滚——表面看就是"预设填了一半"。
       * @param {object} patch 字段名到新值的映射
       * @returns {void}
       */
      const setFields = React.useCallback((patch) => {
        draftRef.current = { ...draftRef.current, ...patch };
        setDraft(draftRef.current);
        for (const key of Object.keys(patch)) clearTimeout(timers.current[key]);
        void commit(Object.keys(patch));
      }, [commit]);

      /** 当前生效的发件人清单（含老配置迁移）。纯函数很便宜，不必 memo。 */
      const senders = migrateSenders(draft);
      /** 当前生效的地址。 */
      const senderAddr = activeSenderAddress(draft, senders);

      /**
       * 写发件人清单。
       *
       * **必须同时清掉旧的 senderName / fromAddress**：清单为空时 Host 会回落到旧字段，
       * 不清就会"刚删掉的那条又回来了"。
       * 用 setFields 合成一次提交，两个字段共用同一个 revision，不会互相冲突。
       * @param {{name: string, address: string}[]} list 新清单
       * @param {string} active 新的生效地址（'' 表示清单为空）
       * @returns {void}
       */
      const writeSenders = React.useCallback((list, active) => {
        setFields({ senders: list, activeSender: active, senderName: '', fromAddress: '' });
      }, [setFields]);

      /** 打开发件人弹层：index 传清单长度即"新增"。 */
      const openSenderDialog = React.useCallback((index) => {
        const entry = index < senders.length ? senders[index] : { name: '', address: '' };
        setSenderEdit({ index, name: entry.name, address: entry.address });
        setSenderErr('');
      }, [senders]);

      /** 关闭发件人弹层。 */
      const closeSenderDialog = React.useCallback(() => {
        setSenderEdit(null);
        setSenderErr('');
      }, []);

      /** 保存发件人弹层里的内容；不合法就地报错、不写入。 */
      const saveSenderDialog = React.useCallback(() => {
        const issue = senderIssue(senders, senderEdit.index, senderEdit);
        if (issue !== '') {
          setSenderErr(t(`sender.issue.${issue}`));
          return;
        }
        const next = senderCommit({ list: senders, active: senderAddr, editing: senderEdit.index }, senderEdit);
        writeSenders(next.list, next.active);
        setSenderEdit(null);
        setSenderErr('');
      }, [senders, senderEdit, senderAddr, writeSenders, t]);

      /** 选中某条发件人。 */
      const pickSender = React.useCallback((address) => {
        writeSenders(senders, address);
      }, [senders, writeSenders]);

      /** 删掉某条发件人。 */
      const removeSender = React.useCallback((index) => {
        const next = senderRemove({ list: senders, active: senderAddr }, index);
        writeSenders(next.list, next.active);
      }, [senders, senderAddr, writeSenders]);

      /**
       * 写凭据。**目标引用名由调用方给定**（硬约束 4），绝不从草稿里猜。
       * @param {string} ref 凭据引用名
       * @returns {Promise<void>}
       */
      const commitCredential = React.useCallback(async (ref) => {
        const bridge = remotes.current;
        const view = viewRef.current;
        if (bridge === null || view === null) return;
        const name = String(ref ?? '').trim();
        if (name === '') return;
        const value = pwDraft[name] ?? '';
        const clearing = pwClear[name] === true;
        if (!clearing && value === '') return;
        setSave({ phase: 'saving', at: 0, error: '' });
        try {
          if (clearing) unwrap(await bridge.credentials.unset(name));
          else unwrap(await bridge.credentials.set(name, value));
          setPwDraft((prev) => ({ ...prev, [name]: '' }));
          setPwClear((prev) => ({ ...prev, [name]: false }));
          setSave({ phase: 'saved', at: Date.now(), error: '' });
          await refreshCredentials([name, draftRef.current?.smtpPasswordRef]);
        } catch (err) {
          setSave({ phase: 'error', at: 0, error: String(err?.message ?? err) });
        }
      }, [remotes, pwDraft, pwClear, refreshCredentials]);

      /** 恢复默认：清掉本命名空间在 settings.yaml 里的全部覆盖。 */
      const resetAll = React.useCallback(async () => {
        const bridge = remotes.current;
        const view = viewRef.current;
        if (bridge === null || view === null) return;
        setResetting(true);
        setSave({ phase: 'saving', at: 0, error: '' });
        try {
          const next = unwrap(await bridge.settings.replace(NS, {}, view.revision));
          if (next && typeof next === 'object') viewRef.current = next;
          await load();
          setSave({ phase: 'saved', at: Date.now(), error: '' });
        } catch (err) {
          setSave({ phase: 'error', at: 0, error: String(err?.message ?? err) });
          await load();
        } finally {
          setResetting(false);
          setConfirmReset(false);
        }
      }, [remotes, load]);

      /** 发一封测试邮件。Host 没提供该能力时不显示按钮。 */
      const sendTest = React.useCallback(async () => {
        if (capability !== 'ready') return;
        setTest({ phase: 'sending', transport: '', ms: 0, error: '' });
        try {
          const result = unwrap(await callRemote('test'));
          if (result && result.ok === false) {
            setTest({ phase: 'fail', transport: String(result.transport ?? ''), ms: 0, error: String(result.error ?? '') });
          } else {
            setTest({
              phase: 'ok',
              transport: String(result?.transport ?? ''),
              ms: Number(result?.ms ?? 0),
              error: '',
            });
          }
          setLastDelivery(result ?? null);
        } catch (err) {
          setTest({ phase: 'fail', transport: '', ms: 0, error: String(err?.message ?? err) });
        }
      }, [remotes, capability]);

      // 离开页面时把还在防抖里的改动落盘，避免"改完就走"丢改动
      React.useEffect(() => () => {
        for (const [key, timer] of Object.entries(timers.current)) {
          clearTimeout(timer);
          void commit([key]);
        }
      }, [commit]);

      // ---- 派生值 ----
      const recipients = parseRecipients(draft.recipients);
      const smtpPasswordRef = String(draft.smtpPasswordRef ?? '').trim();
      const configured = (ref) => ref !== '' && credentialState[ref] === true;
      const statusKey = deriveStatus({
        enabled: draft.enabled === true,
        recipientCount: recipients.valid.length,
        host: draft.smtpHost,
        user: draft.smtpUser,
        credentialConfigured: configured(smtpPasswordRef),
        lastDelivery,
      });
      /** SMTP 这一段自己配好了没有——凭据行在下面很远，段头这一格是它唯一的上层读数。 */
      const transportReady = configured(smtpPasswordRef)
        && String(draft.smtpHost ?? '').trim() !== ''
        && String(draft.smtpUser ?? '').trim() !== '';
      const transportState = t(transportReady ? 'transportState.done' : 'transportState.todo');
      const STATUS_TITLE_KEY = {
        disabled: 'status.disabled',
        needRecipients: 'status.needRecipients',
        needHost: 'status.needHost',
        needUser: 'status.needUser',
        needCredential: 'status.needCredential',
        ready: 'status.ready',
        lastFailed: 'status.lastFailed',
      };
      /** 判决句：**全页最大的字号**，也是这一页真正要回答的那句话。 */
      const statusTitle = statusKey === 'needCredential'
        ? t('status.needCredential', { cred: t('cred.smtp') })
        : t(STATUS_TITLE_KEY[statusKey] ?? 'status.ready');
      /** 判决下面那句人话：为什么是这个判决、下一步该动哪里。只说用户的事。 */
      const statusWhy = viewRef.current === null ? t('status.notServed') : t(`status.why.${statusKey}`);
      const outcomesOn = ['notifyCompleted', 'notifyError', 'notifyBlocked', 'notifyApproval',
        'notifyAbortedByUser', 'notifyInterrupted', 'notifyMaxTokens']
        .filter((key) => draft[key] === true).length;
      const preset = matchPreset(draft.smtpHost);
      const testSupported = capability === 'ready';
      const sending = test.phase === 'sending';
      /** 判决条那一档：状态→色调的映射只此一份。 */
      const tone = STATUS_TONE[statusKey] ?? 'idle';

      /**
       * 最近一次投递。没有就返回 null（此时只说"还没试过"，不摆一行空的）。
       *
       * 它同时是页面的第一条排错线索：分类（认证被拒 / 发件人被拒 / 网络）给出"该动哪里"，
       * 原始报错原样附在后面——不改写才是真的可排错。
       */
      const deliveryView = lastDelivery === null ? null : (() => {
        const error = classifySendError(lastDelivery.error);
        return {
          ok: lastDelivery.ok === true,
          ago: relativeTime(lastDelivery.at, now),
          elapsed: Number(lastDelivery.ms ?? 0),
          raw: String(lastDelivery.error ?? ''),
          error,
        };
      })();

      /** 测试按钮文案：发的时候说在发；之前失败过就说重测。 */
      const testLabel = sending
        ? t('act.testing')
        : (test.phase === 'fail' || (lastDelivery !== null && lastDelivery.ok === false) ? t('act.retest') : t('act.test'));

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
        if (capability === 'unknown') return null;
        if (!testSupported) return h('span', { className: 'dshmn-hint' }, t('act.needsRestart'));
        // 凭据行里用文字链接：手刚离开输入框，验证就在原地，不用滚回页顶；
        // 但它不抢判决条的主按钮，所以只做链接。
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
       * 判决条的动作 = **下一步该做的那一件事**（主按钮）+ 可选的一次验证。
       *
       * 还没配完时主按钮是"去填写"（把光标送到缺的那一格），配好了才是发测试邮件；
       * 验证按钮任何时候都在，因为"还差什么"恰恰要靠它一次点击问出来。
       */
      const configAction = (() => {
        if (statusKey === 'disabled') {
          return h(Button, {
            variant: 'primary',
            size: 'sm',
            onClick: () => setField('enabled', true, { immediate: true }),
          }, t('act.enable'));
        }
        if (statusKey === 'ready' || statusKey === 'lastFailed') return testButton({ variant: 'primary' });
        return h(Button, {
          variant: 'primary',
          size: 'sm',
          onClick: () => focusMissing(),
        }, t('act.goFill'));
      })();
      /** 还没配完时，测试仍然给，但降为次级：它是验证，不是下一步。 */
      const secondaryTest = (statusKey === 'ready' || statusKey === 'lastFailed') ? null : testButton();

      /** 把用户送到缺的那一格，而不是让他自己在一屏里找。 */
      const focusMissing = () => {
        const target = statusKey === 'needRecipients' ? 'dshmn-recipients'
          : (statusKey === 'needHost' ? 'dshmn-smtp-host'
            : (statusKey === 'needUser' ? 'dshmn-smtp-user' : 'dshmn-cred-smtp'));
        const element = typeof document === 'undefined' ? null : document.getElementById(target);
        if (element === null || element === undefined) return;
        element.scrollIntoView({ block: 'center' });
        element.focus();
      };

      /**
       * 判决条底部那条"读数"。
       *
       * 它是这一页唯一能回答"真发得出去吗"的东西，所以放在判决条里、用一条发丝线跟判决分开。
       * 失败时分类 + 原文都给：只给"发送失败"四个字等于没给线索。
       * @returns {object|null} React 元素
       */
      const evidence = () => {
        if (deliveryView === null) {
          return h('div', { className: 'dshmn-evidence' },
            h('span', { className: 'dshmn-evidenceKey' }, t('evidence.label')),
            h('span', null, t('evidence.never')));
        }
        const view = deliveryView;
        const detail = view.ok
          ? [h('span', { key: 'ok' }, t('evidence.ok', { ms: view.elapsed, ago: view.ago }))]
          : [
            h('span', { key: 'reason' }, `${t('evidence.fail')}：${view.error.label}（${view.ago}）`),
            h('span', { key: 'hint', className: 'dshmn-hint' }, view.error.hint),
            h('span', { key: 'raw', className: 'dshmn-mono' }, view.raw),
          ];
        return h('div', { className: 'dshmn-evidence', 'data-ok': view.ok ? 'true' : 'false' },
          h('span', { className: 'dshmn-evidenceKey' }, t('evidence.label')),
          ...detail);
      };
      /**
       * 凭据行。保存前给输入框（这里才是要动手的地方）；保存后**不再摆一个空输入框**——
       * 那样只会让人怀疑"是不是没存上"。存好之后是：✓ 已保存 + 测试 + 更换 + 清除。
       * @param {string} fieldId 输入框 id
       * @param {string} labelKey 名称文案键
       * @param {string} ref 凭据引用名（写入目标由调用方给定，硬约束 4）
       * @param {string} hintKey 说明文案键
       * @param {string} helpKey 帮助按钮文案键
       * @returns {object} React 元素
       */
      const credentialField = (fieldId, labelKey, ref, hintKey, helpKey) => {
        const confirmed = configured(ref);
        const clear = pwClear[ref] === true;
        const editing = confirmed !== true || clear;
        const helpButton = h('button', {
          type: 'button',
          className: 'dshmn-link',
          onClick: () => setHelpKind(true),
        }, t(helpKey));
        return h('div', { className: 'dshmn-item' },
          h('div', { className: 'dshmn-itemHead' },
            h('label', { className: 'dshmn-label', htmlFor: fieldId }, t(labelKey)),
            h('span', { className: 'dshmn-credState', 'data-ok': confirmed ? 'true' : 'false' },
              confirmed ? h('span', { 'aria-hidden': 'true' }, h(CheckedMark, null)) : null,
              confirmed ? t('cred.saved') : t('cred.notSaved'))),
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
              onBlur: () => void commitCredential(ref),
              onKeyDown: (event) => { if (event.key === 'Enter') void commitCredential(ref); },
            })
            : h('div', null,
              h(TextInput, {
                id: fieldId,
                type: 'password',
                value: '',
                readOnly: true,
                'aria-label': `${t(labelKey)}：${t('cred.saved')}`,
                placeholder: t('cred.saved'),
                onFocus: () => setPwClear((prev) => ({ ...prev, [ref]: true })),
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
              }, `${t('save.credCheckFailed', { error: credError })}，${t('save.reload')}`)),
          h('div', { className: 'dshmn-linkRow' },
            confirmed
              ? h('button', {
                type: 'button',
                className: 'dshmn-link',
                onClick: () => setPwClear((prev) => ({ ...prev, [ref]: true })),
              }, t('cred.replace'))
              : null,
            confirmed
              ? h('button', {
                type: 'button',
                className: 'dshmn-link',
                onClick: () => {
                  setPwDraft((prev) => ({ ...prev, [ref]: '' }));
                  setPwClear((prev) => ({ ...prev, [ref]: true }));
                  void commitCredential(ref);
                },
              }, t('cred.clear'))
              : null,
            helpButton,
            testButton({ variant: 'link' })));
      };

      /** 分组头右侧那一格：只说这一段的结论，不摆装饰。 */
      const recipientsState = recipients.valid.length > 0
        ? t('recipients.ok', { n: recipients.valid.length })
        : t('recipients.none');

      return h('div', { className: 'dshmn-page', 'data-build': BUILD },

        // ---- 页头：这一页干什么 + 落盘读数（读数常驻，不自灭）----
        h('div', { className: 'dshmn-head' },
          h('p', { className: 'dshmn-lead' }, t('lead')),
          h('div', {
            className: 'dshmn-stamp',
            'data-tone': save.phase === 'error' ? 'error' : (save.phase === 'saving' ? 'busy' : 'idle'),
            'aria-live': 'polite',
          },
          save.phase === 'error'
            ? h(React.Fragment, null,
              t('save.error', { error: save.error }),
              h('button', { type: 'button', className: 'dshmn-link', onClick: () => void load() }, t('save.reload')))
            : (save.phase === 'saving'
              ? t('save.saving')
              : (save.phase === 'saved' && save.at > 0
                ? t('save.savedAgo', { n: Math.max(0, Math.round((now - save.at) / 1000)) })
                : t('save.auto'))))),

        // ---- 判决条：全页唯一的填充面 ----
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
        evidence(),
        h('div', { className: 'dshmn-verdictFoot' }, secondaryTest, configAction)),

        // ---- 收件人 ----
        h(Group, { title: t('group.recipients'), state: recipientsState },
        h('div', { className: 'dshmn-item' },
        h('div', { className: 'dshmn-field' },
          h('label', { className: 'dshmn-label', htmlFor: 'dshmn-recipients' }, t('recipients.label')),
          h('textarea', {
            id: 'dshmn-recipients',
            className: 'dshmn-textarea',
            value: draft.recipients ?? '',
            placeholder: t('recipients.placeholder'),
            'aria-invalid': recipients.invalid.length > 0 ? 'true' : 'false',
            onChange: (event) => setField('recipients', event.target.value),
            onBlur: () => flush('recipients'),
          }),
          h('div', { className: 'dshmn-hint' }, t('recipients.hint')),
          recipients.invalid.length > 0
            ? h('div', { className: 'dshmn-error', role: 'alert' }, t('recipients.invalid', { list: recipients.invalid.join('、') }))
            : null))),

        // ---- 怎么发（只剩 SMTP 一种发送方式，不再让人选通道）----
        h(Group, { title: t('group.transport'), state: transportState },
        h('div', { className: 'dshmn-item' },
          h('div', { className: 'dshmn-hint' }, t('smtp.note')),
          h('div', { className: 'dshmn-sub' },

          h('div', { className: 'dshmn-field' },
            h('div', { className: 'dshmn-label' }, t('preset.label')),
            h('div', { className: 'dshmn-seg', role: 'radiogroup', 'aria-label': t('preset.label') },
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
                onClick: () => setShowAdvanced(true),
              }, t('preset.other'))),
            preset === null ? null : h('div', { className: 'dshmn-hint' }, t('preset.detected', { name: preset.name }))),

          h('div', { className: 'dshmn-grid' },
            h('div', { className: 'dshmn-field' },
              h('label', { className: 'dshmn-label', htmlFor: 'dshmn-smtp-host' }, t('smtp.host')),
              h(TextInput, {
                id: 'dshmn-smtp-host',
                type: 'text',
                value: draft.smtpHost ?? '',
                placeholder: 'smtp.example.com',
                onChange: (event) => setField('smtpHost', event.target.value),
                onBlur: () => flush('smtpHost'),
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
                onChange: (event) => setField('smtpPort', event.target.value === '' ? '' : Number(event.target.value), { delay: NUMBER_DEBOUNCE_MS }),
                onBlur: () => flush('smtpPort'),
              })),
            h('div', { className: 'dshmn-field' },
              h('label', { className: 'dshmn-label', htmlFor: 'dshmn-smtp-secure' }, t('smtp.secure')),
              h('select', {
                id: 'dshmn-smtp-secure',
                className: 'dshmn-select',
                value: draft.smtpSecure ?? 'auto',
                onChange: (event) => setField('smtpSecure', event.target.value, { immediate: true }),
              }, ...[['auto', 'auto'], ['tls', 'tls'], ['starttls', 'starttls'], ['plain', 'plain']]
                .map(([value, text]) => h('option', { key: value, value }, text))))),

          h('div', { className: 'dshmn-field' },
            h('label', { className: 'dshmn-label', htmlFor: 'dshmn-smtp-user' }, t('smtp.user')),
            h(TextInput, {
              id: 'dshmn-smtp-user',
              type: 'text',
              value: draft.smtpUser ?? '',
              placeholder: `you${preset?.suffix ?? '@example.com'}`,
              onChange: (event) => setField('smtpUser', event.target.value),
              onBlur: () => flush('smtpUser'),
            }),
            accountMismatch(preset, draft.smtpUser)
              ? h('div', { className: 'dshmn-error', role: 'alert' }, t('smtp.accountMismatch', {
                host: String(draft.smtpHost ?? ''),
                name: preset?.name ?? '',
                user: String(draft.smtpUser ?? ''),
                suffix: preset?.suffix ?? '',
              }))
              : null),

          credentialField('dshmn-cred-smtp', 'cred.smtp', smtpPasswordRef, 'cred.smtpHint', 'cred.smtpHelp')))),

        // ---- 什么时候发给我 ----
        h(Group, {
          title: t('group.outcomes'),
          state: outcomesOn > 0 ? t('outcomes.countOn', { n: outcomesOn }) : t('outcomes.countOff'),
        },
        // 时长下限是"任务完成"的子项（只对它生效），所以缩进成子行——因果关系看得见，
        // 而不是隔着十行再补一句"只对完成生效"。
        h('div', { className: 'dshmn-item' },
          h('div', { className: 'dshmn-itemHead' },
            h('div', { className: 'dshmn-itemText' },
              h('div', { className: 'dshmn-itemTitle' }, t('outcomes.completed')),
              h('div', { className: 'dshmn-hint' }, t('outcomes.completedHint'))),
            h('div', { className: 'dshmn-itemCtrl' },
              h(Switch, {
                checked: draft.notifyCompleted === true,
                label: t('outcomes.completed'),
                onChange: (next) => setField('notifyCompleted', next, { immediate: true }),
              }))),
          h('div', { className: 'dshmn-sub', 'data-muted': draft.notifyCompleted === true ? 'false' : 'true' },
            h('div', { className: 'dshmn-itemHead' },
              h('div', { className: 'dshmn-itemText' },
                h('label', { className: 'dshmn-itemTitle', htmlFor: 'dshmn-minduration' }, t('outcomes.minDuration')),
                h('div', { className: 'dshmn-hint' }, t('outcomes.minDurationHint'))),
              h('div', { className: 'dshmn-itemCtrl' },
                h(NumberField, {
                  id: 'dshmn-minduration',
                  value: draft.minDurationMs,
                  placeholder: '2000',
                  unit: t('unit.ms'),
                  label: t('outcomes.minDuration'),
                  onChange: (value) => setField('minDurationMs', value, { delay: NUMBER_DEBOUNCE_MS }),
                  onBlur: () => flush('minDurationMs'),
                }))))),
        h(Row, {
          title: t('outcomes.error'),
          hint: t('outcomes.errorHint'),
          control: h(Switch, {
            checked: draft.notifyError === true,
            label: t('outcomes.error'),
            onChange: (next) => setField('notifyError', next, { immediate: true }),
          }),
        }),
        h(Row, {
          title: t('outcomes.blocked'),
          hint: t('outcomes.blockedHint'),
          control: h(Switch, {
            checked: draft.notifyBlocked === true,
            label: t('outcomes.blocked'),
            onChange: (next) => setField('notifyBlocked', next, { immediate: true }),
          }),
        }),
        h(Row, {
          title: t('outcomes.approval'),
          hint: t('outcomes.approvalHint'),
          control: h(Switch, {
            checked: draft.notifyApproval === true,
            label: t('outcomes.approval'),
            onChange: (next) => setField('notifyApproval', next, { immediate: true }),
          }),
        }),
        h(Row, {
          title: t('outcomes.subagents'),
          hint: t('outcomes.subagentsHint'),
          control: h(Switch, {
            checked: draft.includeSubagents === true,
            label: t('outcomes.subagents'),
            onChange: (next) => setField('includeSubagents', next, { immediate: true }),
          }),
        }),
        h('div', { className: 'dshmn-item' },
          h(Disclosure, {
            title: t('outcomes.more'),
            open: showMoreOutcomes,
            onToggle: () => setShowMoreOutcomes((value) => !value),
          },
          h('div', { className: 'dshmn-stack', 'data-rows': 'true' },
            h(Row, {
              title: t('outcomes.aborted'),
              hint: t('outcomes.abortedHint'),
              control: h(Switch, {
                checked: draft.notifyAbortedByUser === true,
                label: t('outcomes.aborted'),
                onChange: (next) => setField('notifyAbortedByUser', next, { immediate: true }),
              }),
            }),
            h(Row, {
              title: t('outcomes.interrupted'),
              hint: t('outcomes.interruptedHint'),
              control: h(Switch, {
                checked: draft.notifyInterrupted === true,
                label: t('outcomes.interrupted'),
                onChange: (next) => setField('notifyInterrupted', next, { immediate: true }),
              }),
            }),
            h(Row, {
              title: t('outcomes.maxTokens'),
              hint: t('outcomes.maxTokensHint'),
              control: h(Switch, {
                checked: draft.notifyMaxTokens === true,
                label: t('outcomes.maxTokens'),
                onChange: (next) => setField('notifyMaxTokens', next, { immediate: true }),
              }),
            })))),

        // ---- 可选设置（发件人、链接、排错）----
        h('section', { className: 'dshmn-group', 'aria-label': t('group.optional') },
          h('div', { className: 'dshmn-groupHead' },
            h('h3', { className: 'dshmn-groupTitle' }, t('group.optional'))),
          h('div', { className: 'dshmn-groupBody' },
        h('div', { className: 'dshmn-item' },
        h(Disclosure, {
          title: t('group.sender'),
          open: showSender,
          onToggle: () => setShowSender((value) => !value),
        },
        h('div', { className: 'dshmn-stack' },
          h('div', { className: 'dshmn-field' },
            h('label', { className: 'dshmn-label' }, t('sender.listLabel')),
            h('div', { className: 'dshmn-senders', role: 'radiogroup', 'aria-label': t('sender.listLabel') },
              senders.length === 0
                ? h('div', { className: 'dshmn-senderEmpty' }, t('sender.empty'))
                : null,
              ...senders.map((entry, index) => {
                const isActive = entry.address === senderAddr;
                return h('div', {
                  key: entry.address,
                  className: 'dshmn-sender',
                  'data-active': isActive ? 'true' : 'false',
                  onClick: () => pickSender(entry.address),
                },
                h('input', {
                  type: 'radio',
                  className: 'dshmn-senderRadio',
                  name: 'dshmn-sender',
                  checked: isActive,
                  onChange: () => pickSender(entry.address),
                  'aria-label': t('sender.useThis', { address: entry.address }),
                }),
                h('div', { className: 'dshmn-senderBody' },
                  h('div', { className: 'dshmn-senderName' }, entry.name !== '' ? entry.name : t('sender.nameUnset')),
                  h('div', { className: 'dshmn-senderAddr' }, entry.address)),
                isActive ? h('span', { className: 'dshmn-senderBadge' }, t('sender.inUse')) : null,
                h('button', {
                  type: 'button',
                  className: 'dshmn-senderIcon',
                  title: t('sender.edit'),
                  'aria-label': `${t('sender.edit')} ${entry.address}`,
                  onClick: (event) => { event.stopPropagation(); openSenderDialog(index); },
                }, '✎'),
                h('button', {
                  type: 'button',
                  className: 'dshmn-senderIcon',
                  title: t('sender.remove'),
                  'aria-label': `${t('sender.remove')} ${entry.address}`,
                  onClick: (event) => { event.stopPropagation(); removeSender(index); },
                }, '×'));
              }),
              h('button', {
                type: 'button',
                className: 'dshmn-senderAdd',
                onClick: () => openSenderDialog(senders.length),
              }, t('sender.add'))),
            h('div', { className: 'dshmn-hint' }, t('sender.listHint'))),
          h(Row, {
            title: t('link.enabled'),
            hint: t('link.enabledHint'),
            control: h(Switch, {
              checked: draft.linkEnabled === true,
              label: t('link.enabled'),
              onChange: (next) => setField('linkEnabled', next, { immediate: true }),
            }),
          }),
          h('div', { className: 'dshmn-field' },
            h('label', { className: 'dshmn-label', htmlFor: 'dshmn-base' }, t('link.base')),
            h(TextInput, {
              id: 'dshmn-base',
              type: 'text',
              value: draft.publicBaseUrl ?? '',
              placeholder: 'http://127.0.0.1:3081',
              onChange: (event) => setField('publicBaseUrl', event.target.value),
              onBlur: () => flush('publicBaseUrl'),
            }),
            h('div', { className: 'dshmn-hint' }, t('link.baseHint')))))),

        // ---- 可选：高级（排错用）----
        h('div', { className: 'dshmn-item' },
        h(Disclosure, {
          title: t('group.advanced'),
          open: showAdvanced,
          onToggle: () => setShowAdvanced((value) => !value),
        },
        h('div', { className: 'dshmn-stack' },
          h('div', { className: 'dshmn-field' },
            h('label', { className: 'dshmn-label', htmlFor: 'dshmn-settle' }, t('adv.settle')),
            h(NumberField, {
              id: 'dshmn-settle',
              value: draft.settleMs,
              placeholder: '1500',
              unit: t('unit.ms'),
              label: t('adv.settle'),
              onChange: (value) => setField('settleMs', value, { delay: NUMBER_DEBOUNCE_MS }),
              onBlur: () => flush('settleMs'),
            }),
            h('div', { className: 'dshmn-hint' }, t('adv.settleHint'))),
          h('div', { className: 'dshmn-field' },
            h('label', { className: 'dshmn-label', htmlFor: 'dshmn-rate' }, t('adv.rate')),
            h(NumberField, {
              id: 'dshmn-rate',
              value: draft.ratePerMinute,
              placeholder: '10',
              unit: t('unit.perMin'),
              label: t('adv.rate'),
              onChange: (value) => setField('ratePerMinute', value, { delay: NUMBER_DEBOUNCE_MS }),
              onBlur: () => flush('ratePerMinute'),
            }),
            h('div', { className: 'dshmn-hint' }, t('adv.rateHint'))),
          h('div', { className: 'dshmn-field' },
            h('label', { className: 'dshmn-label', htmlFor: 'dshmn-pwref' }, t('adv.pwRef')),
            h(TextInput, {
              id: 'dshmn-pwref',
              type: 'text',
              value: draft.smtpPasswordRef ?? '',
              onChange: (event) => setField('smtpPasswordRef', event.target.value),
              onBlur: () => {
                flush('smtpPasswordRef');
                void refreshCredentials([draftRef.current.smtpPasswordRef]);
              },
            }),
            h('div', { className: 'dshmn-hint' }, t('adv.pwRefHint'))),
          h('div', { className: 'dshmn-field' },
            h('label', { className: 'dshmn-label', htmlFor: 'dshmn-statepath' }, t('adv.statePath')),
            h(TextInput, {
              id: 'dshmn-statepath',
              type: 'text',
              value: draft.statePath ?? '',
              onChange: (event) => setField('statePath', event.target.value),
              onBlur: () => flush('statePath'),
            }),
            h('div', { className: 'dshmn-hint' }, t('adv.statePathHint')))))),
          )),

        // ---- 页脚：清空覆盖是破坏性操作，所以压到最下面、只用文字链接 ----
        h('div', { className: 'dshmn-foot' },
          h('button', {
            type: 'button',
            className: 'dshmn-link',
            disabled: resetting,
            onClick: () => setConfirmReset(true),
          }, t('danger.reset'))),

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
          : null,

        // ---- 发件人弹层（添加 / 编辑同一套）----
        // 保存按钮**不置灰**：不合法时点一下就地报错，比灰着一个说不清原因的按钮好。
        (typeof P.Modal === 'function' && senderEdit !== null
          ? h(P.Modal, {
            open: true,
            onClose: closeSenderDialog,
            title: t(senderEdit.index >= senders.length ? 'sender.addTitle' : 'sender.editTitle'),
            closeLabel: t('sender.cancel'),
            footer: h(React.Fragment, null,
              h(Button, { variant: 'outline', size: 'sm', onClick: closeSenderDialog }, t('sender.cancel')),
              h(Button, { variant: 'primary', size: 'sm', onClick: saveSenderDialog }, t('sender.save'))),
          },
          h('div', { className: 'dshmn-field' },
            h('label', { className: 'dshmn-label', htmlFor: 'dshmn-sender-name' }, t('sender.name')),
            h(TextInput, {
              id: 'dshmn-sender-name',
              type: 'text',
              value: senderEdit.name,
              onChange: (event) => setSenderEdit({ ...senderEdit, name: event.target.value }),
            }),
            h('div', { className: 'dshmn-hint' }, t('sender.nameHint'))),
          h('div', { className: 'dshmn-field' },
            h('label', { className: 'dshmn-label', htmlFor: 'dshmn-sender-addr' }, t('sender.address')),
            h(TextInput, {
              id: 'dshmn-sender-addr',
              type: 'text',
              value: senderEdit.address,
              onChange: (event) => setSenderEdit({ ...senderEdit, address: event.target.value }),
            }),
            h('div', { className: 'dshmn-hint' }, t('sender.addressHint'))),
          senderErr !== '' ? h('div', { className: 'dshmn-error', role: 'alert' }, senderErr) : null)
          : null))));
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
      throw new Error(message);
    }

    /**
     * 调一个 Host Remote 方法。
     *
     * 走 connection 的通用 RPC 而不是挂 remote 命名空间：本插件的 client 半是手写包，
     * 没有生成出来的 remote 声明，而 `/api` + `<namespace>/<method>` 是同一套网关，
     * 参数与清单里声明的 parameters 必须完全一致（这里两个方法都是零参数）。
     * @param {'test'|'state'} method 方法名
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
        // 参数必须与清单声明的 parameters 完全一致——test/state 都是零参数，所以是空对象。
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
            ctx.effect(() => scoped.locale.register(NS, { zh: ZH, en: EN }), 'dsh-notify-p: dictionaries');
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
      __internals: { parseRecipients, migrateSenders, activeSenderAddress, senderIssue, senderCommit, senderRemove, deriveStatus, matchPreset, presetForAddress, dotState, accountMismatch, userForPreset, relativeTime, PRESETS, ZH, EN, CSS, fmt, i18n },
    };
  },
});
    /* ================= 3/3 原 dsh-session-info（逐字节保留，勿改） ================= */
window.__ModuleLoader__.load({
	id: "dsh-session-info",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let React = require("react");

		/** 会话头部右侧辅助区:显示当前会话完整 ID,复制时净化剪贴板内容。 */
		const SLOT_KEY = "conversation.session.header.utilities";

		const badgeStyle = {
			display: "inline-flex",
			alignItems: "center",
			fontSize: "12px",
			lineHeight: "1.4",
			color: "var(--dsw-alias-label-secondary)",
			userSelect: "text",
			WebkitUserSelect: "text",
			whiteSpace: "nowrap",
			fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
		};

		function SessionIdBadge({ sessionId }) {
			const id = typeof sessionId === "string" ? sessionId : "";
			if (id === "") return null;
			const onCopy = (event) => {
				try {
					// 选区若夹带 display:contents 边界产生的多余换行,一律替换为纯 ID
					event.clipboardData.setData("text/plain", id);
					event.preventDefault();
				} catch (error) {
					// 剪贴板 API 不可用时走浏览器原生复制
				}
			};
			return React.createElement(
				"span",
				{ className: "dsh-session-info", title: id, onCopy, style: badgeStyle },
				React.createElement("code", {
					style: { fontFamily: "inherit", fontSize: "inherit", color: "inherit" }
				}, id)
			);
		}

		const inject = ["slots"];
		function apply(ctx) {
			ctx.inject(["slots"], (scoped) => {
				const slots = scoped.slots;
				slots.inject(SLOT_KEY, () =>
					slots.register({
						name: SLOT_KEY,
						id: "session-info",
						order: 0
					}, (props) => React.createElement(SessionIdBadge, { sessionId: props.sessionId }))
				);
			});
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
  } finally {
    __loader.load = __origLoad;
  }

  //#region file row menu
  /**
   * The file tree's "⋯" row menu: copy a row's absolute path, download a file.
   *
   * This region lives in the merge glue rather than inside one of the three
   * bundled parts because those parts are byte-locked by
   * test/merged-client.test.mjs (each must stay a byte-for-byte copy of its
   * original bundle). It is still one self-contained unit: a single start/stop
   * pair, no React for the menu itself, and nothing but DOM writes into the
   * shipped file tree.
   *
   * Host contract (read-only reference: @deepseek-ai/dsh-client-ui-sidebar-files):
   *   [data-files-body] li[data-files-entry="file"|"directory"][data-files-path]
   *     > button.row
   * The absolute path is ALWAYS read from data-files-path; it is never rebuilt
   * from the row text. Rows of type "other" are left alone. The menu button is
   * inserted as a SIBLING after that row button, never inside it: a nested
   * button is invalid HTML and its click would bubble into "open this file".
   *
   * Every entry point is guarded. A selector that stops matching after a host
   * upgrade can only cost these buttons, never the host's own rendering; three
   * consecutive scans that place nothing at all stop the feature for the page.
   */
  const ROW_MENU_NS = "dsh-lookout";
  /** Sibling button injected after the row button; its presence is the idempotency key. */
  const ROW_MENU_ATTR = "data-lookout-rowmenu";
  const ROW_MENU_POP_ATTR = "data-lookout-rowmenu-pop";
  const ROW_MENU_TOAST_ATTR = "data-lookout-toast";
  const ROW_MENU_STYLE_KEY = "lookout-row-menu";
  const ROW_MENU_BODY_SELECTOR = "[data-files-body]";
  const ROW_MENU_ROWS_SELECTOR = 'li[data-files-entry="file"],li[data-files-entry="directory"]';
  const ROW_MENU_PATH_ATTR = "data-files-path";
  /** A run that places nothing at all, this many times in a row, gives up. */
  const ROW_MENU_MAX_FAILURES = 3;
  const ROW_MENU_SCAN_DEBOUNCE = 200;
  const ROW_MENU_QUIET_MS = 250;
  const ROW_MENU_FEEDBACK_MS = 1500;
  const ROW_MENU_TOAST_MS = 3000;
  /**
   * How long after opening the menu a scroll/resize counts as part of the tap.
   *
   * Phones fire scroll and resize while the tap is still settling (visual viewport
   * shifts, focus-driven scrolling, the browser chrome collapsing). Closing on those
   * made the menu flash and vanish on mobile, so inside this window the menu only
   * repositions; a later, real scroll closes it as usual.
   */
  const ROW_MENU_SCROLL_GRACE_MS = 700;
  const ROW_MENU_BUTTON_PADDING = "32px";
  const ROW_MENU_ENABLED_KEY = "dsh-lookout:file-row-menu:enabled";
  const ROW_MENU_DISMISSED_KEY = "dsh-lookout:file-row-menu:gave-up-dismissed";

  /** Menu copy, one namespace of its own so it cannot collide with the three parts. */
  const ROW_MENU_ZH = {
    nav: "文件行 ⋯ 菜单",
    toggleLabel: "在文件树的每一行右侧显示「⋯」菜单",
    toggleHint: "点开可以复制这一行的绝对路径，或下载单个文件；文件夹的下载暂不支持。这一项贴着宿主文件树绘制，宿主升级后可能失效，失效只是不显示，文件树本身不受影响。",
    ariaLabel: "行操作",
    copyPath: "复制路径",
    download: "下载",
    folderUnsupported: "文件夹暂不支持",
    copyFailed: "复制失败，请手动选择路径",
    err401: "登录已过期，请刷新页面重新登录",
    err413: "文件超过 20MB，暂不支持下载",
    err404: "文件不存在或已被删除",
    err403: "没有权限读取这个文件",
    errOther: "下载失败（HTTP {status}）",
    errNetwork: "下载失败，请检查连接",
    givingUp: "文件行「⋯」菜单连续注入失败，已自动停止；文件树本身不受影响。",
    dismiss: "不再提示"
  };
  const ROW_MENU_EN = {
    nav: "File row ⋯ menu",
    toggleLabel: "Show a ⋯ menu on every file-tree row",
    toggleHint: "Open it to copy the row's absolute path or download a single file; folder downloads are not supported. This is drawn against the shipped file tree, so a host upgrade may disable it — it only disappears, and the tree itself is unaffected.",
    ariaLabel: "Row actions",
    copyPath: "Copy path",
    download: "Download",
    folderUnsupported: "Folders not supported",
    copyFailed: "Copy failed — select the path and copy it manually",
    err401: "Your session has expired. Refresh the page and sign in again.",
    err413: "This file is larger than 20 MB and cannot be downloaded yet.",
    err404: "The file no longer exists or was deleted.",
    err403: "You do not have permission to read this file.",
    errOther: "Download failed (HTTP {status}).",
    errNetwork: "Download failed — check your connection.",
    givingUp: "The file-row ⋯ menu could not be injected repeatedly and stopped; the file tree itself is unaffected.",
    dismiss: "Do not show again"
  };

  /**
   * Only theme variables that really exist in the shipped theme are used.
   * No literal colour is written here, so light/dark follows the host.
   */
  const ROW_MENU_CSS = [
    ".dsh-lookout-rowmenu{position:absolute;top:4px;right:4px;z-index:2;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;line-height:1;touch-action:manipulation;-webkit-tap-highlight-color:transparent;}",
    ".dsh-lookout-rowmenu:hover,.dsh-lookout-rowmenu:focus-visible{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover);outline:none;}",
    ".dsh-lookout-rowmenu svg{display:block;width:16px;height:16px;pointer-events:none;}",
    ".dsh-lookout-rowmenu[data-lookout-copied]{color:var(--dsw-alias-state-success-primary);}",
    ".dsh-lookout-rowmenu-pop{position:fixed;z-index:2147482000;min-width:176px;padding:4px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.4;box-shadow:0 8px 24px var(--dsw-alias-bg-mask-drop);}",
    ".dsh-lookout-rowmenu-item{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;padding:7px 10px;border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;}",
    ".dsh-lookout-rowmenu-item:hover,.dsh-lookout-rowmenu-item:focus-visible{background:var(--dsw-alias-interactive-bg-hover);outline:none;}",
    ".dsh-lookout-rowmenu-item[aria-disabled=\"true\"]{color:var(--dsw-alias-label-dimmed);cursor:not-allowed;}",
    ".dsh-lookout-rowmenu-item[aria-disabled=\"true\"]:hover{background:transparent;}",
    ".dsh-lookout-rowmenu-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
    ".dsh-lookout-rowmenu-note{flex:none;color:var(--dsw-alias-label-tertiary);font-size:11px;white-space:nowrap;}",
    ".dsh-lookout-toast{position:fixed;left:50%;bottom:24px;z-index:90;display:flex;align-items:center;gap:10px;max-width:min(92vw,560px);padding:9px 12px;transform:translateX(-50%);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-toast-bg);color:var(--dsw-alias-label-primary-inverted);font-size:12px;line-height:1.5;box-shadow:0 8px 24px var(--dsw-alias-bg-mask-drop);}",
    ".dsh-lookout-toast-text{min-width:0;}",
    ".dsh-lookout-toast button{flex:none;padding:3px 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:transparent;color:inherit;font:inherit;cursor:pointer;}",
    ".dsh-lookout-toast button:hover{background:var(--dsw-alias-interactive-bg-hover);}"
  ].join("\n");

  /** Chinese fallback for every translate call, also used when locale is unavailable. */
  function rowMenuFallbackText(key, params) {
    const template = typeof ROW_MENU_ZH[key] === "string" ? ROW_MENU_ZH[key] : key;
    if (params === null || params === undefined || typeof params !== "object") return template;
    let text = template;
    for (const name of Object.keys(params)) text = text.split("{" + name + "}").join(String(params[name]));
    return text;
  }

  /** Read one persisted switch; storage being unavailable must never break the feature. */
  function rowMenuReadFlag(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === "1") return true;
      if (raw === "0") return false;
      return fallback;
    } catch { return fallback; }
  }

  /** Persist one switch; a private-mode storage failure only costs durability. */
  function rowMenuWriteFlag(key, value) {
    try { window.localStorage.setItem(key, value ? "1" : "0"); } catch { /* advisory */ }
  }

  /** One warning per page at most, and only for a real degradation. */
  let rowMenuWarned = false;
  function rowMenuWarn(message, error) {
    if (rowMenuWarned) return;
    rowMenuWarned = true;
    try { console.warn("dsh-lookout: " + message, error); } catch { /* no console */ }
  }

  /**
   * Start the row menu and hand its disposer to the plugin's own lifecycle.
   * A separate wrapper keeps the whole install guarded: this UI may never throw
   * into the host's apply().
   * @param ctx - the merged plugin's client context.
   * @param require - the ModuleLoader require, used lazily for primitives/react.
   * @returns {void}
   */
  function rowMenuStart(ctx, require) {
    let dispose = null;
    try {
      dispose = rowMenuInstall(ctx, require);
    } catch (error) {
      rowMenuWarn("文件行菜单初始化失败,已跳过(不影响宿主):", error);
      return;
    }
    try {
      if (ctx !== null && ctx !== undefined && typeof ctx.effect === "function") {
        ctx.effect(() => dispose, "dsh-lookout: file row menu");
      } else if (ctx !== null && ctx !== undefined && typeof ctx.on === "function") {
        ctx.on("dispose", () => { try { dispose(); } catch { /* best effort */ } });
      }
    } catch (error) {
      rowMenuWarn("文件行菜单挂到生命周期失败:", error);
    }
  }

  /**
   * Install the feature and return its teardown.
   * @param ctx - the merged plugin's client context.
   * @param require - the ModuleLoader require.
   * @returns {() => void} disposer: removes every node, restores every style.
   */
  function rowMenuInstall(ctx, require) {
    let disposed = false;
    let enabled = rowMenuReadFlag(ROW_MENU_ENABLED_KEY, true);
    let translate = rowMenuFallbackText;
    let observer = null;
    let retryTimer = 0;
    let scanTimer = 0;
    let painting = false;
    let paintedAt = 0;
    let failures = 0;
    let givenUp = false;
    let menu = null;
    let menuAnchor = null;
    let menuRow = null;
    let menuPath = "";
    let menuOpenedAt = 0;
    let toast = null;
    let toastTimer = 0;
    const feedbackTimers = new Map();
    const savedRowPositions = new Map();
    const savedButtonPadding = new Map();

    // ---- locale ---------------------------------------------------------
    try {
      const locale = ctx !== null && ctx !== undefined ? ctx.locale : null;
      if (locale !== null && locale !== undefined && typeof locale.register === "function") {
        const register = () => locale.register(ROW_MENU_NS, { zh: ROW_MENU_ZH, en: ROW_MENU_EN });
        if (typeof ctx.effect === "function") ctx.effect(register, "dsh-lookout: file row menu dictionaries");
        else register();
      }
      if (locale !== null && locale !== undefined && typeof locale.bind === "function") {
        const bound = locale.bind(ROW_MENU_NS);
        translate = (key, params) => {
          let text = key;
          try { text = bound(key, params); } catch { text = key; }
          return typeof text === "string" && text !== key ? text : rowMenuFallbackText(key, params);
        };
      }
    } catch (error) {
      // Chinese fallback is already in translate.
    }

    // ---- settings page --------------------------------------------------
    // One item, its own section: the three bundled parts own their own pages and
    // are byte-locked, so this feature registers its own settings.section (order
    // 55, between icon management at 50 and mail at 60).
    try {
      const React = require("react");
      if (React !== null && typeof React.createElement === "function" && typeof React.useState === "function") {
        function RowMenuSection(props) {
          const label = props !== null && props !== undefined && typeof props.t === "function" ? props.t : translate;
          const [checked, setChecked] = React.useState(() => rowMenuReadFlag(ROW_MENU_ENABLED_KEY, true));
          const onChange = (event) => {
            const next = event.target.checked === true;
            setChecked(next);
            setEnabled(next);
          };
          return React.createElement("div", { "data-lookout-settings": "row-menu" },
            React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "var(--dsw-alias-label-primary)", marginBottom: 8 } }, label("nav")),
            React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--dsw-alias-label-primary)", cursor: "pointer" } },
              React.createElement("input", { type: "checkbox", checked, onChange }),
              React.createElement("span", null, label("toggleLabel"))
            ),
            React.createElement("div", { style: { marginTop: 6, fontSize: 12, lineHeight: 1.6, color: "var(--dsw-alias-label-tertiary)" } }, label("toggleHint"))
          );
        }
        const slots = ctx !== null && ctx !== undefined ? ctx.slots : null;
        if (slots !== null && slots !== undefined && typeof slots.inject === "function" && typeof slots.register === "function") {
          slots.inject("settings.section", () => slots.register({
            name: "settings.section",
            id: "lookout-row-menu",
            order: 55,
            label: () => translate("nav"),
            locale: ROW_MENU_NS,
            inject: () => ({ t: translate })
          }, (props) => React.createElement(RowMenuSection, {
            t: props !== null && props !== undefined && typeof props.t === "function" ? props.t : translate
          })));
        }
      }
    } catch (error) {
      // Settings are optional; the feature itself is not.
    }

    // ---- style ----------------------------------------------------------
    function ensureStyleTag() {
      try {
        if (document.querySelector('style[data-plugin-css="' + ROW_MENU_STYLE_KEY + '"]') !== null) return;
        const tag = document.createElement("style");
        tag.setAttribute("data-plugin", "dsh-lookout");
        tag.setAttribute("data-plugin-css", ROW_MENU_STYLE_KEY);
        tag.textContent = ROW_MENU_CSS;
        const head = document.head !== null && document.head !== undefined ? document.head : document.body;
        if (head !== null && head !== undefined) head.appendChild(tag);
      } catch (error) { /* styling is best effort */ }
    }

    // ---- injected row button -------------------------------------------
    function directRowButton(row) {
      for (const child of row.children) {
        if (child.tagName === "BUTTON" && child.getAttribute(ROW_MENU_ATTR) === null) return child;
      }
      return null;
    }

    function directMenuButton(row) {
      for (const child of row.children) {
        if (child.getAttribute(ROW_MENU_ATTR) !== null) return child;
      }
      return null;
    }

    function ensureStyles(row, rowButton) {
      if (!savedRowPositions.has(row)) savedRowPositions.set(row, row.style.position);
      try {
        if (window.getComputedStyle(row).position === "static") row.style.position = "relative";
      } catch { row.style.position = "relative"; }
      if (!savedButtonPadding.has(rowButton)) savedButtonPadding.set(rowButton, rowButton.style.paddingRight);
      if (rowButton.style.paddingRight !== ROW_MENU_BUTTON_PADDING) rowButton.style.paddingRight = ROW_MENU_BUTTON_PADDING;
    }

    function pruneDetachedStyles() {
      for (const [row, position] of savedRowPositions) {
        if (row.isConnected) continue;
        try { row.style.position = position; } catch { /* detached */ }
        savedRowPositions.delete(row);
      }
      for (const [button, padding] of savedButtonPadding) {
        if (button.isConnected) continue;
        try { button.style.paddingRight = padding; } catch { /* detached */ }
        savedButtonPadding.delete(button);
      }
    }

    function restoreStyles() {
      for (const [row, position] of savedRowPositions) { try { row.style.position = position; } catch { /* detached */ } }
      for (const [button, padding] of savedButtonPadding) { try { button.style.paddingRight = padding; } catch { /* detached */ } }
      savedRowPositions.clear();
      savedButtonPadding.clear();
    }

    function svgRoot() {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 16 16");
      svg.setAttribute("width", "16");
      svg.setAttribute("height", "16");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      svg.setAttribute("fill", "currentColor");
      return svg;
    }

    /** The only menu glyph: three dots, drawn here so no primitives icon is required. */
    function dotsIcon() {
      const svg = svgRoot();
      for (const cx of [3, 8, 13]) {
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("cx", String(cx));
        dot.setAttribute("cy", "8");
        dot.setAttribute("r", "1.4");
        svg.appendChild(dot);
      }
      return svg;
    }

    /** Copy feedback: the same button briefly shows a check. */
    function checkIcon() {
      const svg = svgRoot();
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M3.5 8.5 6.6 11.5 12.5 4.8");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "currentColor");
      path.setAttribute("stroke-width", "1.8");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      svg.appendChild(path);
      return svg;
    }

    function setButtonIcon(button, copied) {
      try {
        while (button.firstChild !== null) button.removeChild(button.firstChild);
        button.appendChild(copied ? checkIcon() : dotsIcon());
        if (copied) button.setAttribute("data-lookout-copied", "");
        else button.removeAttribute("data-lookout-copied");
      } catch (error) { /* best effort */ }
    }

    function flashCopied(button) {
      if (button === null || button === undefined || !button.isConnected) return;
      const pending = feedbackTimers.get(button);
      if (pending !== undefined) { try { window.clearTimeout(pending); } catch { /* gone */ } }
      setButtonIcon(button, true);
      const timer = window.setTimeout(() => {
        feedbackTimers.delete(button);
        if (button.isConnected) setButtonIcon(button, false);
      }, ROW_MENU_FEEDBACK_MS);
      feedbackTimers.set(button, timer);
    }

    function createRowButton() {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dsh-lookout-rowmenu";
      button.setAttribute(ROW_MENU_ATTR, "");
      button.setAttribute("aria-haspopup", "menu");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", translate("ariaLabel"));
      button.title = translate("ariaLabel");
      button.appendChild(dotsIcon());
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (disposed) return;
        if (menuAnchor === button) { closeMenu(); return; }
        const path = button.getAttribute("data-lookout-path");
        openMenu(button, typeof path === "string" ? path : "", button.getAttribute("data-lookout-directory") === "1");
      });
      return button;
    }

    // ---- scan / injection ----------------------------------------------
    function scan() {
      if (disposed || !enabled || givenUp) return;
      if (document.querySelector(ROW_MENU_BODY_SELECTOR) === null) return;
      painting = true;
      let placed = 0;
      let missed = 0;
      let failure = null;
      try {
        pruneDetachedStyles();
        const bodies = document.querySelectorAll(ROW_MENU_BODY_SELECTOR);
        for (const body of bodies) {
          const rows = body.querySelectorAll(ROW_MENU_ROWS_SELECTOR);
          for (const row of rows) {
            const path = row.getAttribute(ROW_MENU_PATH_ATTR);
            if (typeof path !== "string" || path === "") { missed++; continue; }
            const rowButton = directRowButton(row);
            if (rowButton === null) { missed++; continue; }
            const isDirectory = row.getAttribute("data-files-entry") === "directory";
            ensureStyles(row, rowButton);
            let button = directMenuButton(row);
            if (button === null) {
              button = createRowButton();
              rowButton.insertAdjacentElement("afterend", button);
            }
            const previousPath = button.getAttribute("data-lookout-path");
            if (previousPath !== path) {
              if (menuAnchor === button) closeMenu();
              button.setAttribute("data-lookout-path", path);
            }
            button.setAttribute("data-lookout-directory", isDirectory ? "1" : "0");
            button.setAttribute("aria-label", translate("ariaLabel"));
            button.title = translate("ariaLabel");
            placed++;
          }
        }
        if (menuAnchor !== null) {
          const rowPathNow = menuRow !== null && menuRow.isConnected ? menuRow.getAttribute(ROW_MENU_PATH_ATTR) : null;
          if (!menuAnchor.isConnected || menuRow === null || !menuRow.isConnected || rowPathNow !== menuPath) closeMenu();
        }
      } catch (error) {
        failure = error;
      } finally {
        painting = false;
        paintedAt = Date.now();
      }
      if (placed > 0) failures = 0;
      else if (failure !== null) noteFailure(failure);
      else if (missed > 0) noteFailure("no eligible row could take the menu button");
    }

    function noteFailure(why) {
      if (givenUp) return;
      failures++;
      if (failures === 1) rowMenuWarn("文件行菜单注入失败,已降级(不影响文件树):", why);
      if (failures < ROW_MENU_MAX_FAILURES) return;
      givenUp = true;
      stopWatching();
      if (!rowMenuReadFlag(ROW_MENU_DISMISSED_KEY, false)) showToast(translate("givingUp"), true);
    }

    // ---- watchers -------------------------------------------------------
    function ensureObserver() {
      if (observer !== null || disposed || !enabled || givenUp) return;
      if (typeof window.MutationObserver !== "function") return;
      const root = document.body;
      if (root === null || root === undefined) return;
      observer = new window.MutationObserver(onMutations);
      observer.observe(root, { childList: true, subtree: true });
    }

    function onMutations() {
      if (disposed || !enabled || givenUp) return;
      try {
        if (painting) return;
        if (Date.now() - paintedAt < ROW_MENU_QUIET_MS) return;
        if (menuAnchor !== null && !menuAnchor.isConnected) closeMenu();
        if (document.querySelector(ROW_MENU_BODY_SELECTOR) === null) {
          if (retryTimer === 0) retryTimer = window.setInterval(attachContainer, 1000);
          return;
        }
        scheduleScan();
      } catch (error) {
        noteFailure(error);
      }
    }

    function scheduleScan() {
      if (disposed || !enabled || givenUp) return;
      if (scanTimer !== 0) { try { window.clearTimeout(scanTimer); } catch { /* gone */ } }
      scanTimer = window.setTimeout(() => { scanTimer = 0; scan(); }, ROW_MENU_SCAN_DEBOUNCE);
    }

    function attachContainer() {
      if (disposed || !enabled || givenUp) return true;
      ensureObserver();
      if (document.querySelector(ROW_MENU_BODY_SELECTOR) === null) return false;
      scheduleScan();
      if (observer !== null && retryTimer !== 0) {
        try { window.clearInterval(retryTimer); } catch { /* gone */ }
        retryTimer = 0;
      }
      return true;
    }

    function startWatching() {
      if (disposed || !enabled || givenUp) return;
      ensureObserver();
      if (document.querySelector(ROW_MENU_BODY_SELECTOR) === null) {
        if (retryTimer === 0) retryTimer = window.setInterval(attachContainer, 1000);
      } else {
        scheduleScan();
      }
      // No MutationObserver in this build: the 1s retry is the only updater left.
      if (observer === null && retryTimer === 0) retryTimer = window.setInterval(attachContainer, 1000);
    }

    function stopWatching() {
      if (observer !== null) { try { observer.disconnect(); } catch { /* gone */ } observer = null; }
      if (retryTimer !== 0) { try { window.clearInterval(retryTimer); } catch { /* gone */ } retryTimer = 0; }
      if (scanTimer !== 0) { try { window.clearTimeout(scanTimer); } catch { /* gone */ } scanTimer = 0; }
      painting = false;
    }

    // ---- switch ---------------------------------------------------------
    function setEnabled(next) {
      const on = next === true;
      enabled = on;
      rowMenuWriteFlag(ROW_MENU_ENABLED_KEY, on);
      if (disposed) return;
      if (!on) {
        stopWatching();
        closeMenu();
        hideToast();
        removeInjected();
        return;
      }
      givenUp = false;
      failures = 0;
      hideToast();
      startWatching();
    }

    function removeInjected() {
      try { document.querySelectorAll("[" + ROW_MENU_ATTR + "]").forEach((node) => node.remove()); } catch { /* gone */ }
      restoreStyles();
      for (const timer of feedbackTimers.values()) { try { window.clearTimeout(timer); } catch { /* gone */ } }
      feedbackTimers.clear();
    }

    // ---- menu -----------------------------------------------------------
    function createMenuItem(label, onActivate) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "dsh-lookout-rowmenu-item";
      item.setAttribute("role", "menuitem");
      const text = document.createElement("span");
      text.className = "dsh-lookout-rowmenu-label";
      text.textContent = label;
      item.appendChild(text);
      if (typeof onActivate === "function") {
        item.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          onActivate();
        });
      }
      return item;
    }

    function openMenu(anchor, path, isDirectory) {
      if (disposed) return;
      if (document.body === null || document.body === undefined) return;
      closeMenu();
      const popup = document.createElement("div");
      popup.className = "dsh-lookout-rowmenu-pop";
      popup.setAttribute(ROW_MENU_POP_ATTR, "");
      popup.setAttribute("role", "menu");
      popup.setAttribute("aria-label", translate("ariaLabel"));

      const copy = createMenuItem(translate("copyPath"), () => {
        closeMenu();
        void copyRowPath(path, anchor);
      });
      popup.appendChild(copy);

      const download = createMenuItem(translate("download"), null);
      if (isDirectory) {
        download.disabled = true;
        download.setAttribute("aria-disabled", "true");
        const note = document.createElement("span");
        note.className = "dsh-lookout-rowmenu-note";
        note.textContent = translate("folderUnsupported");
        download.appendChild(note);
      } else {
        download.setAttribute("aria-disabled", "false");
        download.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          closeMenu();
          void downloadRowFile(path);
        });
      }
      popup.appendChild(download);

      document.body.appendChild(popup);
      positionMenu(popup, anchor);
      menu = popup;
      menuAnchor = anchor;
      menuRow = anchor.closest("li");
      menuPath = path;
      menuOpenedAt = Date.now();
      anchor.setAttribute("aria-expanded", "true");
      paintedAt = Date.now();
      document.addEventListener("pointerdown", onDocumentPointerDown, true);
      document.addEventListener("keydown", onDocumentKeyDown, true);
      window.addEventListener("scroll", onDocumentScroll, true);
      window.addEventListener("resize", repositionMenu, true);
      watchVisualViewport(true);
      window.setTimeout(() => {
        if (menu !== popup) return;
        const first = popup.querySelector('[role="menuitem"]:not([disabled])');
        if (first === null) return;
        try { first.focus({ preventScroll: true }); } catch { try { first.focus(); } catch { /* best effort */ } }
      }, 0);
    }

    function positionMenu(popup, anchor) {
      try {
        const anchorRect = anchor.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();
        const margin = 8;
        const gap = 6;
        let left = anchorRect.right - popupRect.width;
        let top = anchorRect.bottom + gap;
        const maxLeft = window.innerWidth - popupRect.width - margin;
        if (left > maxLeft) left = maxLeft;
        if (left < margin) left = margin;
        if (top + popupRect.height > window.innerHeight - margin) top = anchorRect.top - popupRect.height - gap;
        if (top < margin) top = margin;
        popup.style.left = Math.round(left) + "px";
        popup.style.top = Math.round(top) + "px";
      } catch (error) { /* the CSS default is still usable */ }
    }

    function closeMenu() {
      if (menu === null) return;
      const popup = menu;
      const anchor = menuAnchor;
      menu = null;
      menuAnchor = null;
      menuRow = null;
      menuPath = "";
      try { popup.remove(); } catch { /* gone */ }
      if (anchor !== null) { try { anchor.setAttribute("aria-expanded", "false"); } catch { /* gone */ } }
      document.removeEventListener("pointerdown", onDocumentPointerDown, true);
      document.removeEventListener("keydown", onDocumentKeyDown, true);
      window.removeEventListener("scroll", onDocumentScroll, true);
      window.removeEventListener("resize", repositionMenu, true);
      watchVisualViewport(false);
    }

    /** Move the open menu back inside the viewport without closing it. */
    function repositionMenu() {
      if (menu === null || menuAnchor === null) return;
      positionMenu(menu, menuAnchor);
    }

    /**
     * A scroll normally means the anchor moved, but a phone fires one while the tap
     * settles; that churn must not close the menu the tap just opened.
     */
    function onDocumentScroll() {
      if (menu === null) return;
      if (Date.now() - menuOpenedAt < ROW_MENU_SCROLL_GRACE_MS) { repositionMenu(); return; }
      closeMenu();
    }

    /** Follow the visual viewport (URL bar, on-screen keyboard) instead of dying with it. */
    function watchVisualViewport(on) {
      try {
        const viewport = window.visualViewport;
        if (viewport === null || viewport === undefined || typeof viewport.addEventListener !== "function") return;
        if (on) {
          viewport.addEventListener("resize", repositionMenu);
          viewport.addEventListener("scroll", repositionMenu);
        } else {
          viewport.removeEventListener("resize", repositionMenu);
          viewport.removeEventListener("scroll", repositionMenu);
        }
      } catch { /* older browsers simply skip the follow-up */ }
    }

    function onDocumentPointerDown(event) {
      if (menu === null) return;
      const target = event.target;
      if (target !== null && target !== undefined) {
        if (menu.contains(target)) return;
        if (menuAnchor !== null && menuAnchor.contains(target)) return;
      }
      closeMenu();
    }

    function onDocumentKeyDown(event) {
      if (menu === null) return;
      if (event.key === "Escape" || event.key === "Esc") {
        event.preventDefault();
        event.stopPropagation();
        const anchor = menuAnchor;
        closeMenu();
        if (anchor !== null) { try { anchor.focus(); } catch { /* gone */ } }
        return;
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        const items = [];
        for (const item of menu.querySelectorAll('[role="menuitem"]')) {
          if (item.disabled !== true) items.push(item);
        }
        if (items.length === 0) return;
        event.preventDefault();
        const current = items.indexOf(document.activeElement);
        const step = event.key === "ArrowDown" ? 1 : -1;
        const next = current < 0 ? (step > 0 ? 0 : items.length - 1) : (current + step + items.length) % items.length;
        try { items[next].focus(); } catch { /* best effort */ }
      }
    }

    // ---- clipboard ------------------------------------------------------
    function requirePrimitives() {
      try { return require("@deepseek-ai/dsh-client-ui-primitives"); } catch { return null; }
    }

    async function writeClipboardText(text) {
      const primitives = requirePrimitives();
      if (primitives !== null && primitives !== undefined && typeof primitives.writeClipboard === "function") {
        try {
          const result = await primitives.writeClipboard(text);
          if (result !== false) return true;
        } catch (error) { /* fall through */ }
      }
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard !== null && navigator.clipboard !== undefined && typeof navigator.clipboard.writeText === "function") {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch (error) { /* fall through */ }
      try {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.top = "0";
        area.style.left = "-9999px";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.focus();
        area.select();
        const copied = typeof document.execCommand === "function" && document.execCommand("copy") === true;
        area.remove();
        return copied;
      } catch (error) { return false; }
    }

    async function copyRowPath(path, anchor) {
      let copied = false;
      try { copied = await writeClipboardText(path); } catch { copied = false; }
      if (disposed) return;
      if (copied) flashCopied(anchor);
      else showToast(translate("copyFailed"), false);
    }

    // ---- download -------------------------------------------------------
    function fileNameFor(path) {
      const trimmed = path.replace(/[/\\]+$/, "");
      const slash = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"));
      const last = slash >= 0 ? trimmed.slice(slash + 1) : trimmed;
      try { return decodeURIComponent(last) || "download"; } catch { return last || "download"; }
    }

    function downloadErrorText(status) {
      switch (status) {
        case 401: return translate("err401");
        case 413: return translate("err413");
        case 404: return translate("err404");
        case 403: return translate("err403");
        default: return translate("errOther", { status: status > 0 ? status : "?" });
      }
    }

    async function downloadRowFile(path) {
      let response = null;
      try {
        response = await window.fetch("api/file?path=" + encodeURIComponent(path), { credentials: "same-origin" });
      } catch (error) {
        if (!disposed) showToast(translate("errNetwork"), false);
        return;
      }
      if (response === null || response.ok !== true) {
        const status = response !== null && typeof response.status === "number" ? response.status : 0;
        if (!disposed) showToast(downloadErrorText(status), false);
        return;
      }
      try {
        const blob = await response.blob();
        if (disposed) return;
        const objectUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = fileNameFor(path);
        link.rel = "noopener";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => { try { window.URL.revokeObjectURL(objectUrl); } catch { /* gone */ } }, 1000);
      } catch (error) {
        if (!disposed) showToast(translate("errNetwork"), false);
      }
    }

    // ---- toast ----------------------------------------------------------
    function showToast(message, dismissable) {
      if (disposed) return;
      if (document.body === null || document.body === undefined) return;
      hideToast();
      const box = document.createElement("div");
      box.className = "dsh-lookout-toast";
      box.setAttribute(ROW_MENU_TOAST_ATTR, "");
      box.setAttribute("role", "status");
      box.setAttribute("aria-live", "polite");
      const text = document.createElement("span");
      text.className = "dsh-lookout-toast-text";
      text.textContent = message;
      box.appendChild(text);
      if (dismissable === true) {
        const dismiss = document.createElement("button");
        dismiss.type = "button";
        dismiss.textContent = translate("dismiss");
        dismiss.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          rowMenuWriteFlag(ROW_MENU_DISMISSED_KEY, true);
          hideToast();
        });
        box.appendChild(dismiss);
      }
      document.body.appendChild(box);
      toast = box;
      paintedAt = Date.now();
      toastTimer = window.setTimeout(hideToast, ROW_MENU_TOAST_MS);
    }

    function hideToast() {
      if (toastTimer !== 0) { try { window.clearTimeout(toastTimer); } catch { /* gone */ } toastTimer = 0; }
      if (toast !== null) { try { toast.remove(); } catch { /* gone */ } toast = null; }
    }

    // ---- lifecycle ------------------------------------------------------
    function dispose() {
      if (disposed) return;
      disposed = true;
      try { stopWatching(); } catch { /* best effort */ }
      try { closeMenu(); } catch { /* best effort */ }
      try { hideToast(); } catch { /* best effort */ }
      try { removeInjected(); } catch { /* best effort */ }
      try { document.querySelectorAll('style[data-plugin-css="' + ROW_MENU_STYLE_KEY + '"]').forEach((node) => node.remove()); } catch { /* best effort */ }
    }

    ensureStyleTag();
    if (enabled) startWatching();
    return dispose;
  }
  //#endregion

  //#region workspace rows
  /**
   * Workspace-sidebar tags, whole-group hiding, and the "Workspaces" settings table.
   *
   * Why the merge glue: the three bundled parts are byte-locked by
   * test/merged-client.test.mjs, and the shipped workspace browser is a single
   * opaque seat (sidebar.workspaces, kind single) with no per-row children, so a
   * tag can only be injected and hiding can only be a style rule. Both are built
   * to fail silently and never throw into the host's render tree.
   *
   * Host contract (read-only reference: @deepseek-ai/dsh-client-ui-workspace):
   *   [data-slot="sidebar.workspaces"]
   *     div.groupSection                        one per workspace; children nest
   *       div[role="treeitem"][data-row-key="workspace:<id>"]
   *         span.projectText > span.title
   *         span.rowActions                     hover actions ("⋯" + new session)
   *       div[role="group"] > div.groupSection    child workspaces
   *       div[role="treeitem"][data-row-key="session:<id>"][aria-selected]
   *       button[data-row-key="overflow:<key>"]
   *
   * Tag placement is row-level: the badge is a direct child of the workspace
   * row, immediately before span.rowActions (or at the row's end when the host
   * renders no actions). margin-left:auto pushes it to the right edge; the
   * row's own gap supplies the minimum spacing from the name. The idempotency
   * key is data-lookout-ws-tag="<workspaceId>".
   *
   * Hiding is one generated rule per hidden workspace, with every selector
   * scoped to the group wrapper one/two levels above the keyed row (the shipped
   * HoverCard wraps its anchor in a <span>):
   *   div:has(> [data-row-key="workspace:<id>"]),
   *   div:has(>span>[data-row-key="workspace:<id>"]), {display:none!important}
   * plus .*groupSection variants of the same two shapes. :has() hides the whole
   * group (workspace row + its sessions + the "expand" button) without touching
   * React. No rule is ever generated for a workspace that contains the CURRENT
   * session, nor for any of its ancestors.
   *
   * Preferences live on the Host (iconCustom/getWorkspacePrefs /
   * setWorkspacePrefs, full-document replace) with a localStorage mirror used
   * first on load and kept as the fallback when RPC is unavailable. A save
   * failure is reported once, never per keystroke.
   *
   * Breaker (the row-menu pattern): three consecutive scans that place nothing
   * while there IS work to place stop the feature for the page, warn once,
   * explain once, and can be reset from the settings switch.
   */
  /**
   * Own locale namespace. locale.register() THROWS when a namespace already owns a
   * locale, and the file-row menu above already registers zh/en under
   * "dsh-lookout"; sharing it would silently drop these dictionaries.
   */
  const WS_ROWS_NS = "dsh-lookout-workspaces";
  const WS_TAG_ATTR = "data-lookout-ws-tag";
  const WS_TAG_TEXT_ATTR = "data-lookout-ws-tag-text";
  const WS_TOAST_ATTR = "data-lookout-ws-toast";
  const WS_STYLE_KEY = "lookout-workspace-rows";
  const WS_HIDE_STYLE_KEY = "lookout-workspace-hide";
  const WS_PREFS_LOCAL_KEY = "dsh-lookout.workspacePrefs";
  const WS_ROWS_ENABLED_KEY = "dsh-lookout:workspace-rows:enabled";
  const WS_ROWS_DISMISSED_KEY = "dsh-lookout:workspace-rows:gave-up-dismissed";
  const WS_MAX_FAILURES = 3;
  const WS_SCAN_DEBOUNCE = 200;
  const WS_QUIET_MS = 250;
  const WS_TOAST_MS = 3000;
  const WS_SAVE_DEBOUNCE = 250;
  const WS_TAG_MAX = 6;
  /** Pin replay: coalesce list churn, then move only what is out of place. */
  const WS_PIN_DEBOUNCE = 150;
  const WS_PIN_MAX_ROUNDS = 5;
  const WS_PIN_MAX_MOVES = 32;
  /** A refused reorder backs off, then gives up: no RPC hammering on a broken host. */
  const WS_PIN_RETRY_MS = 2000;
  const WS_PIN_MAX_FAILURES = 3;
  /** Same eight names the Host normalizes to; anything else falls back to gray. */
  const WS_COLORS = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "gray"];
  const WS_COLOR_DEFAULT = "gray";
  /**
   * Literal colours for the eight tag dots. Each capsule keeps the host's grey
   * fill and secondary text colour and draws only its dot in the accent hue;
   * the rest of the row keeps --dsw-alias-* tokens so light/dark still follows
   * the host; these hues have no token equivalent.
   */
  const WS_COLOR_FALLBACK = {
    red: "#e5484d",
    orange: "#f76b15",
    yellow: "#d9a123",
    green: "#30a46c",
    cyan: "#00a2c7",
    blue: "#3e63dd",
    purple: "#8e4ec6",
    gray: "#8b8d98"
  };
  const WS_ROW_KEY_ATTR = "data-row-key";
  const WS_WORKSPACE_PREFIX = "workspace:";
  const WS_SESSION_PREFIX = "session:";
  const WS_CONTAINER_SELECTOR = '[data-slot="sidebar.workspaces"]';
  const WS_CONTAINER_FALLBACK = '[data-slot="sidebar"]';
  /** Workspace ids are uuid-ish; refuse anything a CSS attribute string cannot carry safely. */
  const WS_ID_PATTERN = /^[A-Za-z0-9._:-]{1,200}$/;
  const WS_HIDE_CSS_HEADER = "/* dsh-lookout: hidden workspaces (regenerated on every paint) */";

  const WS_ROWS_CSS = [
    ".dsh-lookout-ws-tag{display:inline-flex;align-items:center;gap:4px;flex:none;max-width:9em;margin-left:auto;padding:0 6px;height:16px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;pointer-events:none;overflow:hidden;white-space:nowrap;}",
    ".dsh-lookout-ws-tag-dot{flex:none;width:6px;height:6px;border-radius:50%;background:" + WS_COLOR_FALLBACK.gray + ";}",
    ".dsh-lookout-ws-tag-text{min-width:0;overflow:hidden;text-overflow:ellipsis;}",
    ".dsh-lookout-ws-toast{position:fixed;left:50%;bottom:24px;z-index:90;display:flex;align-items:center;gap:10px;max-width:min(92vw,560px);padding:9px 12px;transform:translateX(-50%);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-toast-bg);color:var(--dsw-alias-label-primary-inverted);font-size:12px;line-height:1.5;box-shadow:0 8px 24px var(--dsw-alias-bg-mask-drop);}",
    ".dsh-lookout-ws-toast button{flex:none;padding:3px 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:transparent;color:inherit;font:inherit;cursor:pointer;}"
  ].concat(WS_COLORS.map((name) => '.dsh-lookout-ws-tag[data-color="' + name + '"] .dsh-lookout-ws-tag-dot{background:' + WS_COLOR_FALLBACK[name] + ";}")).join("\n");

  /** Chinese fallback for every translate call, also used when locale is unavailable. */
  const WS_ROWS_ZH = {
    nav: "工作区管理",
    toggleLabel: "在侧栏显示工作区标签，并按设置隐藏工作区",
    toggleHint: "标签只显示在侧栏工作区行右侧（悬停时出现在「⋯」按钮左边）；隐藏是把整个工作区收起（连同它下面的会话和「展开」按钮）。当前会话所在的工作区永远不会被隐藏。这些偏好存在宿主侧，宿主升级后若定位不到工作区行，只会不显示，侧栏本身不受影响。",
    colName: "工作区",
    colTag: "标签",
    colColor: "颜色",
    colPin: "置顶",
    colHide: "隐藏",
    tagPlaceholder: "最多 6 字",
    pinnedHint: "置顶的工作区排在列表最前；取消置顶会尽量放回原来的位置。子工作区不单独置顶，跟着它的上级工作区排列。",
    pinChildHint: "子工作区不单独置顶，跟着上级工作区排列。",
    pinUnavailable: "拿不到工作区服务，置顶只会保存偏好，不会调整顺序。",
    pinFailed: "工作区置顶没有生效，列表可能保持原样。",
    cleanup: "清理失效项",
    cleaned: "已清理 {n} 个失效项",
    cleanNone: "没有可清理的失效项",
    empty: "还没有工作区。",
    colorRed: "红",
    colorOrange: "橙",
    colorYellow: "黄",
    colorGreen: "绿",
    colorCyan: "青",
    colorBlue: "蓝",
    colorPurple: "紫",
    colorGray: "灰",
    givingUp: "工作区标签连续注入失败，已自动停止；侧栏本身不受影响。",
    dismiss: "不再提示",
    saveFailed: "工作区偏好保存失败，改动只保留在本机。"
  };
  const WS_ROWS_EN = {
    nav: "Workspaces",
    toggleLabel: "Show workspace tags in the sidebar and hide workspaces as configured",
    toggleHint: "A tag sits at the right end of the workspace row, just left of the hover actions; hiding collapses a whole workspace group, including its sessions and the expand button. The workspace that holds the current session is never hidden. Preferences live on the host, so a host upgrade can at worst stop the tags from appearing \u2014 the sidebar itself is unaffected.",
    colName: "Workspace",
    colTag: "Tag",
    colColor: "Colour",
    colPin: "Pin",
    colHide: "Hide",
    tagPlaceholder: "Up to 6 characters",
    pinnedHint: "Pinned workspaces sit at the top of the list; unpinning puts one back where it was. Child workspaces are not pinned on their own \u2014 they follow their parent.",
    pinChildHint: "Child workspaces are not pinned on their own; they follow their parent workspace.",
    pinUnavailable: "The workspace service is unavailable, so pinning only saves the preference and never reorders.",
    pinFailed: "Pinning did not take effect; the list may look unchanged.",
    cleanup: "Remove stale entries",
    cleaned: "Removed {n} stale entries",
    cleanNone: "No stale entries to remove",
    empty: "No workspaces yet.",
    colorRed: "Red",
    colorOrange: "Orange",
    colorYellow: "Yellow",
    colorGreen: "Green",
    colorCyan: "Cyan",
    colorBlue: "Blue",
    colorPurple: "Purple",
    colorGray: "Gray",
    givingUp: "The workspace tags could not be injected repeatedly and stopped; the sidebar itself is unaffected.",
    dismiss: "Do not show again",
    saveFailed: "Workspace preferences could not be saved; changes stay in this browser only."
  };

  const WS_STYLE_TITLE = { fontSize: 13, fontWeight: 600, color: "var(--dsw-alias-label-primary)", marginBottom: 8 };
  const WS_STYLE_HINT = { marginTop: 6, fontSize: 12, lineHeight: 1.6, color: "var(--dsw-alias-label-tertiary)" };
  const WS_STYLE_TABLE = { borderCollapse: "collapse", fontSize: 12, color: "var(--dsw-alias-label-primary)" };
  const WS_STYLE_TH = { padding: "4px 8px", textAlign: "left", fontWeight: 500, color: "var(--dsw-alias-label-tertiary)", borderBottom: "1px solid var(--dsw-alias-border-l2)" };
  const WS_STYLE_TD = { padding: "4px 8px", borderBottom: "1px solid var(--dsw-alias-border-l2)", verticalAlign: "middle" };
  const WS_STYLE_ACTIONS = { display: "flex", alignItems: "center", gap: 12, marginTop: 10 };
  const WS_STYLE_TOGGLE = { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--dsw-alias-label-primary)", cursor: "pointer" };

  function wsRowsFallbackText(key, params) {
    const template = typeof WS_ROWS_ZH[key] === "string" ? WS_ROWS_ZH[key] : key;
    if (params === null || params === undefined || typeof params !== "object") return template;
    let text = template;
    for (const name of Object.keys(params)) text = text.split("{" + name + "}").join(String(params[name]));
    return text;
  }

  /** Tag normalization matches the Host: drop control characters, trim, cap at 6 Unicode characters. */
  function wsRowsNormalizeTag(input) {
    if (typeof input !== "string") return "";
    const cleaned = input.replace(/\p{Cc}/gu, "").trim();
    return [...cleaned].slice(0, WS_TAG_MAX).join("");
  }

  function wsRowsNormalizeColor(input) {
    return WS_COLORS.indexOf(input) >= 0 ? input : WS_COLOR_DEFAULT;
  }

  function wsRowsValidId(input) {
    return typeof input === "string" && WS_ID_PATTERN.test(input);
  }

  function wsRowsEmptyDoc() {
    return { version: 1, workspaces: {} };
  }

  function wsRowsNormalizeEntry(input) {
    const source = input !== null && typeof input === "object" && !Array.isArray(input) ? input : {};
    return {
      tag: wsRowsNormalizeTag(source.tag),
      color: wsRowsNormalizeColor(source.color),
      pinned: source.pinned === true,
      hidden: source.hidden === true,
      pinAnchor: typeof source.pinAnchor === "string" ? source.pinAnchor : null
    };
  }

  /** Never throws: a corrupt cache or a bad Host response degrades to the empty document. */
  function wsRowsNormalizeDoc(input) {
    const doc = wsRowsEmptyDoc();
    if (input === null || typeof input !== "object" || Array.isArray(input)) return doc;
    const workspaces = input.workspaces;
    if (workspaces === null || typeof workspaces !== "object" || Array.isArray(workspaces)) return doc;
    for (const [id, entry] of Object.entries(workspaces)) {
      if (!wsRowsValidId(id)) continue;
      if (id === "__proto__" || id === "constructor" || id === "prototype") continue;
      doc.workspaces[id] = wsRowsNormalizeEntry(entry);
    }
    return doc;
  }

  /** An entry that carries no preference at all is dropped instead of being kept as junk. */
  function wsRowsIsDefaultEntry(entry) {
    return entry.tag === "" && entry.pinned !== true && entry.hidden !== true && entry.pinAnchor === null;
  }

  function wsRowsReadFlag(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === "1") return true;
      if (raw === "0") return false;
      return fallback;
    } catch { return fallback; }
  }

  function wsRowsWriteFlag(key, value) {
    try { window.localStorage.setItem(key, value ? "1" : "0"); } catch { /* advisory */ }
  }

  function wsRowsReadLocalPrefs() {
    try {
      const raw = window.localStorage.getItem(WS_PREFS_LOCAL_KEY);
      if (typeof raw !== "string" || raw === "") return wsRowsEmptyDoc();
      return wsRowsNormalizeDoc(JSON.parse(raw));
    } catch { return wsRowsEmptyDoc(); }
  }

  function wsRowsWriteLocalPrefs(doc) {
    try { window.localStorage.setItem(WS_PREFS_LOCAL_KEY, JSON.stringify(doc)); } catch { /* advisory */ }
  }

  /** One warning per page at most, and only for a real degradation. */
  let wsRowsWarned = false;
  function wsRowsWarn(message, error) {
    if (wsRowsWarned) return;
    wsRowsWarned = true;
    try { console.warn("dsh-lookout: " + message, error); } catch { /* no console */ }
  }

  /** The table's row list: live workspaces first, the stored ids when the host list is unavailable. */
  function wsRowsTableRows(prefs, items) {
    const doc = wsRowsNormalizeDoc(prefs);
    const rows = [];
    const seen = new Set();
    const roots = wsPinRootIds(items);
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item === null || typeof item !== "object") continue;
        const id = typeof item.workspaceId === "string" ? item.workspaceId : (typeof item.id === "string" ? item.id : "");
        if (!wsRowsValidId(id) || seen.has(id)) continue;
        seen.add(id);
        const title = typeof item.title === "string" && item.title.trim() !== ""
          ? item.title
          : (typeof item.name === "string" && item.name.trim() !== "" ? item.name : id);
        rows.push({
          id,
          name: title,
          child: items.length > 0 && !roots.has(id),
          entry: doc.workspaces[id] !== undefined ? doc.workspaces[id] : wsRowsNormalizeEntry(null)
        });
      }
    }
    if (rows.length === 0) {
      for (const id of Object.keys(doc.workspaces)) rows.push({ id, name: id, child: false, entry: doc.workspaces[id] });
    }
    return rows;
  }

  function wsRowsKnownIds(items) {
    const ids = [];
    if (!Array.isArray(items)) return ids;
    for (const item of items) {
      if (item === null || typeof item !== "object") continue;
      const id = typeof item.workspaceId === "string" ? item.workspaceId : (typeof item.id === "string" ? item.id : "");
      if (wsRowsValidId(id)) ids.push(id);
    }
    return ids;
  }

  /** Path spelling used by the shipped workspace list: forward slashes, no trailing slash. */
  function wsPinNormalizePath(value) {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (trimmed === "") return "";
    const normalized = trimmed.replace(/\\/g, "/").replace(/\/+$/, "");
    return normalized === "" ? "/" : normalized;
  }

  /**
   * Workspaces that are roots rather than children: a path sitting under
   * another registered workspace's path is a child and never pins on its own.
   * An item without a usable path counts as a root (topology unknown, never
   * guess); a stored pin on a child is ignored but never deleted.
   * @returns Set of root workspace ids.
   */
  function wsPinRootIds(items) {
    const entries = [];
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item === null || typeof item !== "object") continue;
        const id = typeof item.workspaceId === "string" && item.workspaceId !== ""
          ? item.workspaceId
          : (typeof item.id === "string" ? item.id : "");
        if (!wsRowsValidId(id)) continue;
        entries.push({ id, path: wsPinNormalizePath(item.path) });
      }
    }
    const roots = new Set();
    for (const entry of entries) {
      let child = false;
      if (entry.path !== "") {
        for (const parent of entries) {
          if (parent === entry || parent.path === "") continue;
          const under = parent.path === "/"
            ? entry.path.charAt(0) === "/"
            : entry.path.indexOf(parent.path + "/") === 0;
          if (under) { child = true; break; }
        }
      }
      if (!child) roots.add(entry.id);
    }
    return roots;
  }

  /**
   * The minimum moves that put every pinned ROOT workspace at the front while
   * keeping their current relative order. Returns null when the list already
   * satisfies that, so a settled list makes ZERO insertBefore calls.
   *
   * Only the pinned workspaces that are not already in the correct prefix move;
   * each is inserted before the same first unpinned workspace, which keeps the
   * moved block in order without reading the list between awaits.
   * @param prefsDoc - the preference document.
   * @param items - the live workspace list (workspaceId / path / title).
   * @returns { steps, key } or null.
   */
  function wsPinPlan(prefsDoc, items) {
    const doc = wsRowsNormalizeDoc(prefsDoc);
    const ids = [];
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item === null || typeof item !== "object") continue;
        const id = typeof item.workspaceId === "string" && item.workspaceId !== ""
          ? item.workspaceId
          : (typeof item.id === "string" ? item.id : "");
        if (wsRowsValidId(id) && ids.indexOf(id) < 0) ids.push(id);
      }
    }
    if (ids.length === 0) return null;
    const roots = wsPinRootIds(items);
    const pinned = [];
    for (const id of ids) {
      const entry = doc.workspaces[id];
      if (entry === undefined || entry.pinned !== true) continue;
      if (!roots.has(id)) continue; // a child's historical pin is ignored, not cleared
      pinned.push(id);
    }
    if (pinned.length === 0) return null;
    let placed = 0;
    while (placed < pinned.length && ids[placed] === pinned[placed]) placed++;
    if (placed >= pinned.length) return null;
    // ids[placed] is non-pinned by construction, so it is the stable anchor.
    const before = ids[placed];
    const steps = [];
    for (let index = placed; index < pinned.length; index++) steps.push({ id: pinned[index], before });
    return { steps, key: steps.map((step) => step.id + ">" + step.before).join("|") };
  }

  /** Escape a value for a double-quoted CSS string; control characters are quoted numerically. */
  function wsRowsCssString(value) {
    let out = "";
    for (const character of String(value)) {
      const code = character.codePointAt(0);
      if (character === '"' || character === "\\") out += "\\" + character;
      else if (code < 0x20 || code === 0x7f) out += "\\" + code.toString(16) + " ";
      else out += character;
    }
    return out;
  }

  function wsRowsStart(ctx, require) {
    let controller = null;
    try {
      controller = wsRowsInstall(ctx, require);
    } catch (error) {
      wsRowsWarn("工作区标签初始化失败,已跳过(不影响宿主):", error);
      return;
    }
    try {
      if (ctx !== null && ctx !== undefined && typeof ctx.effect === "function") {
        ctx.effect(() => () => { try { controller.dispose(); } catch { /* best effort */ } }, "dsh-lookout: workspace rows");
      } else if (ctx !== null && ctx !== undefined && typeof ctx.on === "function") {
        ctx.on("dispose", () => { try { controller.dispose(); } catch { /* best effort */ } });
      }
    } catch (error) {
      wsRowsWarn("工作区标签挂到生命周期失败:", error);
    }
  }

  /**
   * Install tags + hiding + the settings table, and return the controller.
   * Every DOM lookup is guarded: a host upgrade can only cost the tags.
   * @returns {object} controller: dispose / snapshot / subscribe / updateEntry /
   * cleanupMissing / paintNow / domWorkspaceIds / setEnabled / isEnabled.
   */
  function wsRowsInstall(ctx, require) {
    let disposed = false;
    let enabled = wsRowsReadFlag(WS_ROWS_ENABLED_KEY, true);
    let prefs = wsRowsReadLocalPrefs();
    let localDirty = false;
    let translate = wsRowsFallbackText;
    let observer = null;
    let observerRoot = null;
    let retryTimer = 0;
    let scanTimer = 0;
    let saveTimer = 0;
    let painting = false;
    let paintedAt = 0;
    let failures = 0;
    let givenUp = false;
    let saveFailedOnce = false;
    let toast = null;
    let toastTimer = 0;
    const prefListeners = new Set();
    // ---- pinning --------------------------------------------------------
    // The workspace service arrives late (ctx.inject) and is optional: tags,
    // hiding and the preferences table never wait for it.
    let pinService = null;
    let pinUnsubscribe = null;
    let pinTimer = 0;
    let pinRunning = false;
    let pinDirty = false;
    let pinWarned = false;
    let pinFailedOnce = false;
    let pinFailures = 0;
    let pinSuspended = false;
    let pinCooldownUntil = 0;

    // ---- locale ---------------------------------------------------------
    try {
      const locale = ctx !== null && ctx !== undefined ? ctx.locale : null;
      if (locale !== null && locale !== undefined && typeof locale.register === "function") {
        const register = () => locale.register(WS_ROWS_NS, { zh: WS_ROWS_ZH, en: WS_ROWS_EN });
        if (typeof ctx.effect === "function") ctx.effect(register, "dsh-lookout: workspace rows dictionaries");
        else register();
      }
      if (locale !== null && locale !== undefined && typeof locale.bind === "function") {
        const bound = locale.bind(WS_ROWS_NS);
        translate = (key, params) => {
          let text = key;
          try { text = bound(key, params); } catch { text = key; }
          return typeof text === "string" && text !== key ? text : wsRowsFallbackText(key, params);
        };
      }
    } catch (error) { /* Chinese fallback is already in place */ }

    const api = {
      snapshot: snapshot,
      subscribe: subscribePrefs,
      updateEntry: updateEntry,
      cleanupMissing: cleanupMissing,
      paintNow: paint,
      pinNow: pinNow,
      domWorkspaceIds: domWorkspaceIds,
      setEnabled: setEnabled,
      isEnabled: () => enabled === true
    };

    // ---- settings page --------------------------------------------------
    // Own section (order 56, right after the file-row menu at 55): the three
    // bundled parts own their pages and are byte-locked.
    try {
      const React = require("react");
      if (React !== null && typeof React.createElement === "function" && typeof React.useState === "function") {
        function WorkspaceRowsSection(props) {
          const label = props !== null && props !== undefined && typeof props.t === "function" ? props.t : translate;
          const [view, setView] = React.useState(() => prefs);
          const [on, setOn] = React.useState(() => enabled);
          const [notice, setNotice] = React.useState("");
          React.useEffect(() => subscribePrefs(setView), []);
          const useWorkspaces = props !== null && props !== undefined ? props.useWorkspaces : null;
          const snapshotState = typeof useWorkspaces === "function" ? useWorkspaces((state) => state) : undefined;
          const items = snapshotState !== null && typeof snapshotState === "object" && Array.isArray(snapshotState.items) ? snapshotState.items : [];
          const rows = wsRowsTableRows(view, items);
          const commit = (id, patch) => { updateEntry(id, patch); };
          const onCleanup = () => {
            const live = wsRowsKnownIds(items);
            const ids = live.length > 0 ? live : domWorkspaceIds();
            const removed = cleanupMissing(ids);
            setNotice(removed > 0 ? label("cleaned", { n: removed }) : label("cleanNone"));
          };
          const header = React.createElement("thead", null,
            React.createElement("tr", null,
              ["colName", "colTag", "colColor", "colPin", "colHide"].map((key) =>
                React.createElement("th", { key, style: WS_STYLE_TH }, label(key)))));
          const body = React.createElement("tbody", null,
            rows.map((row) => React.createElement("tr", { key: row.id, "data-lookout-ws-row": row.id },
              React.createElement("td", { style: WS_STYLE_TD }, row.name),
              React.createElement("td", { style: WS_STYLE_TD },
                React.createElement("input", {
                  "data-lookout-ws-field": "tag",
                  "data-lookout-ws-id": row.id,
                  type: "text",
                  maxLength: WS_TAG_MAX,
                  value: row.entry.tag,
                  placeholder: label("tagPlaceholder"),
                  style: { width: 96 },
                  onChange: (event) => commit(row.id, { tag: event.target.value })
                })),
              React.createElement("td", { style: WS_STYLE_TD },
                React.createElement("select", {
                  "data-lookout-ws-field": "color",
                  "data-lookout-ws-id": row.id,
                  value: row.entry.color,
                  onChange: (event) => commit(row.id, { color: event.target.value })
                }, WS_COLORS.map((name) =>
                  React.createElement("option", { key: name, value: name },
                    label("color" + name.charAt(0).toUpperCase() + name.slice(1)))))),
              React.createElement("td", { style: WS_STYLE_TD },
                React.createElement("input", {
                  "data-lookout-ws-field": "pinned",
                  "data-lookout-ws-id": row.id,
                  type: "checkbox",
                  checked: row.entry.pinned === true,
                  disabled: row.child === true,
                  title: row.child === true ? label("pinChildHint") : undefined,
                  onChange: (event) => commit(row.id, { pinned: event.target.checked === true })
                })),
              React.createElement("td", { style: WS_STYLE_TD },
                React.createElement("input", {
                  "data-lookout-ws-field": "hidden",
                  "data-lookout-ws-id": row.id,
                  type: "checkbox",
                  checked: row.entry.hidden === true,
                  onChange: (event) => commit(row.id, { hidden: event.target.checked === true })
                })))));
          return React.createElement("div", { "data-lookout-settings": "workspaces" },
            React.createElement("div", { style: WS_STYLE_TITLE }, label("nav")),
            rows.length === 0
              ? React.createElement("div", { style: WS_STYLE_HINT }, label("empty"))
              : React.createElement("table", { style: WS_STYLE_TABLE, "data-lookout-ws-table": "" }, header, body),
            rows.some((row) => row.child === true)
              ? React.createElement("div", { style: WS_STYLE_HINT }, label("pinChildHint"))
              : null,
            React.createElement("div", { style: WS_STYLE_ACTIONS },
              React.createElement("button", {
                type: "button",
                "data-lookout-ws-cleanup": "",
                onClick: onCleanup
              }, label("cleanup")),
              React.createElement("label", { style: WS_STYLE_TOGGLE },
                React.createElement("input", {
                  type: "checkbox",
                  "data-lookout-ws-toggle": "",
                  checked: on,
                  onChange: (event) => {
                    const next = event.target.checked === true;
                    setOn(next);
                    setEnabled(next);
                  }
                }),
                React.createElement("span", null, label("toggleLabel")))),
            notice !== "" ? React.createElement("div", { style: WS_STYLE_HINT }, notice) : null,
            React.createElement("div", { style: WS_STYLE_HINT }, label("toggleHint")),
            React.createElement("div", { style: WS_STYLE_HINT }, label("pinnedHint")));
        }
        const slots = ctx !== null && ctx !== undefined ? ctx.slots : null;
        if (slots !== null && slots !== undefined && typeof slots.inject === "function" && typeof slots.register === "function") {
          slots.inject("settings.section", () => slots.register({
            name: "settings.section",
            id: "lookout-workspaces",
            order: 56,
            label: () => translate("nav"),
            locale: WS_ROWS_NS,
            inject: () => ({ t: translate, wsRows: api })
          }, (props) => React.createElement(WorkspaceRowsSection, Object.assign({}, props, {
            t: props !== null && props !== undefined && typeof props.t === "function" ? props.t : translate,
            wsRows: api
          }))));
        }
      }
    } catch (error) {
      // Settings are optional; the tags and hiding are not.
    }

    // ---- styles ---------------------------------------------------------
    function ensureStyleTag(key, css) {
      try {
        const existing = document.querySelector('style[data-plugin-css="' + key + '"]');
        if (existing !== null && existing !== undefined) {
          // A linked (hot-reloaded) client keeps its <style> tags alive. Refresh
          // stale text so a new build's CSS actually reaches the page.
          if (existing.textContent !== css) {
            try { existing.textContent = css; } catch { /* tag gone */ }
          }
          return existing;
        }
        const tag = document.createElement("style");
        tag.setAttribute("data-plugin", "dsh-lookout");
        tag.setAttribute("data-plugin-css", key);
        tag.textContent = css;
        const head = document.head !== null && document.head !== undefined ? document.head : document.body;
        if (head !== null && head !== undefined) head.appendChild(tag);
        return tag;
      } catch { return null; }
    }

    function ensureStaticStyle() {
      ensureStyleTag(WS_STYLE_KEY, WS_ROWS_CSS);
    }

    function ensureHideStyleTag() {
      return ensureStyleTag(WS_HIDE_STYLE_KEY, "");
    }

    // ---- DOM lookups ----------------------------------------------------
    function container() {
      try {
        return document.querySelector(WS_CONTAINER_SELECTOR) || document.querySelector(WS_CONTAINER_FALLBACK) || null;
      } catch { return null; }
    }

    function allRowNodes(root) {
      try {
        return Array.prototype.slice.call(root.querySelectorAll("[" + WS_ROW_KEY_ATTR + "]"));
      } catch { return []; }
    }

    function workspaceRows(root) {
      return allRowNodes(root).filter((node) => {
        const key = node.getAttribute(WS_ROW_KEY_ATTR);
        return typeof key === "string" && key.indexOf(WS_WORKSPACE_PREFIX) === 0;
      });
    }

    function rowIdOf(row) {
      const key = row.getAttribute(WS_ROW_KEY_ATTR);
      if (typeof key !== "string" || key.indexOf(WS_WORKSPACE_PREFIX) !== 0) return null;
      const id = key.slice(WS_WORKSPACE_PREFIX.length);
      return wsRowsValidId(id) ? id : null;
    }

    function domWorkspaceIds() {
      const root = container();
      if (root === null) return [];
      const ids = [];
      for (const row of workspaceRows(root)) {
        const id = rowIdOf(row);
        if (id !== null) ids.push(id);
      }
      return ids;
    }

    /**
     * The title element inside one workspace row.
     *
     * Primary match: the class token the shipped row gives its title
     * (YDXeBa_title -> a token ending in "title"). Fallback: the only descendant
     * span that holds text and no element children. Ambiguity yields null (a
     * missing badge), never a badge on the wrong row.
     */
    function findTitleElement(row) {
      let spans;
      try { spans = Array.prototype.slice.call(row.querySelectorAll("span")); } catch { return null; }
      for (const span of spans) {
        const tokens = String(span.className === null || span.className === undefined ? "" : span.className).split(/\s+/);
        for (const token of tokens) {
          if (token !== "" && /(?:^|[_-])title$/i.test(token)) return span;
        }
      }
      const holders = [];
      for (const span of spans) {
        const text = typeof span.textContent === "string" ? span.textContent.trim() : "";
        if (text === "") continue;
        let hasElementChild = false;
        for (const child of span.children) {
          if (child.tagName === "SPAN" || child.tagName === "DIV" || child.tagName === "BUTTON" || child.tagName === "SVG") {
            hasElementChild = true;
            break;
          }
        }
        if (!hasElementChild) holders.push(span);
      }
      return holders.length === 1 ? holders[0] : null;
    }

    /**
     * The direct child span that holds the row's hover actions: the "⋯" menu
     * and the new-session button. The shipped row gives it a class token ending
     * in "rowActions"; a row without one puts the tag at the row's end instead.
     */
    function findRowActions(row) {
      let children;
      try { children = Array.prototype.slice.call(row.children); } catch { return null; }
      for (const child of children) {
        if (child.tagName !== "SPAN") continue;
        const tokens = String(child.className === null || child.className === undefined ? "" : child.className).split(/\s+/);
        for (const token of tokens) {
          if (token !== "" && /(?:^|[_-])rowActions$/i.test(token)) return child;
        }
      }
      return null;
    }

    /**
     * Where the badge goes: the workspace row itself (div.projectRow), as a
     * direct child immediately before span.rowActions (or at the row's end when
     * the host renders no actions). The title only has to exist: the badge no
     * longer lives inside its flex column, so nothing has to be flipped to a row.
     */
    function findTagAnchor(row) {
      return findTitleElement(row) === null ? null : row;
    }

    /** True when the badge already sits at its home: row end, left of rowActions. */
    function badgeInPlace(row, badge, actions) {
      let children;
      try { children = Array.prototype.slice.call(row.children); } catch { return false; }
      const badgeIndex = children.indexOf(badge);
      if (badgeIndex < 0) return false;
      if (actions === null || actions.parentNode !== row) return badgeIndex === children.length - 1;
      return badgeIndex === children.indexOf(actions) - 1;
    }

    /** Insert or move the badge to its home: row end, but left of rowActions. */
    function placeBadge(row, badge, actions) {
      if (actions !== null && actions.parentNode === row) row.insertBefore(badge, actions);
      else row.appendChild(badge);
    }

    function badgeIn(row, id) {
      let nodes;
      try { nodes = Array.prototype.slice.call(row.querySelectorAll("[" + WS_TAG_ATTR + "]")); } catch { return null; }
      for (const node of nodes) if (node.getAttribute(WS_TAG_ATTR) === id) return node;
      return null;
    }

    function createBadge(id, tag, color) {
      const badge = document.createElement("span");
      badge.className = "dsh-lookout-ws-tag";
      badge.setAttribute(WS_TAG_ATTR, id);
      badge.setAttribute("data-color", color);
      badge.title = tag;
      const dot = document.createElement("span");
      dot.className = "dsh-lookout-ws-tag-dot";
      dot.setAttribute("aria-hidden", "true");
      const text = document.createElement("span");
      text.className = "dsh-lookout-ws-tag-text";
      text.setAttribute(WS_TAG_TEXT_ATTR, "");
      text.textContent = tag;
      badge.appendChild(dot);
      badge.appendChild(text);
      return badge;
    }

    function updateBadge(badge, tag, color) {
      badge.setAttribute("data-color", color);
      badge.title = tag;
      for (const child of badge.children) {
        if (child.getAttribute(WS_TAG_TEXT_ATTR) !== null && child.textContent !== tag) { child.textContent = tag; break; }
      }
    }

    /**
     * Reconcile every rendered workspace row against the preferences.
     *
     * The badge is row-level: it must be a direct child of the row, immediately
     * before rowActions, pushed right by margin-left:auto. A badge left in the
     * old title-anchored spot (inside span.projectText), elsewhere under the
     * sidebar, or on the wrong side of the row is moved, never duplicated.
     */
    function syncBadges(root, rows) {
      let placed = 0;
      let missed = 0;
      let wanted = 0;
      const known = new Set();
      for (const row of rows) {
        const id = rowIdOf(row);
        if (id === null) continue;
        known.add(id);
        const entry = prefs.workspaces[id];
        const tag = entry !== undefined ? entry.tag : "";
        if (tag === "") continue;
        wanted++;
        const anchor = findTagAnchor(row);
        if (anchor === null) { missed++; continue; }
        const actions = findRowActions(anchor);
        let badge = badgeIn(anchor, id);
        if (badge === null) {
          // Migrate a badge an older version left outside this row.
          try { badge = root.querySelector("[" + WS_TAG_ATTR + '="' + id + '"]'); } catch { badge = null; }
        }
        if (badge === null) placeBadge(anchor, createBadge(id, tag, entry.color), actions);
        else {
          if (!badgeInPlace(anchor, badge, actions)) placeBadge(anchor, badge, actions);
          updateBadge(badge, tag, entry.color);
        }
        placed++;
      }
      let stale;
      try { stale = Array.prototype.slice.call(root.querySelectorAll("[" + WS_TAG_ATTR + "]")); } catch { stale = []; }
      for (const badge of stale) {
        const id = badge.getAttribute(WS_TAG_ATTR);
        const entry = id !== null ? prefs.workspaces[id] : undefined;
        if (entry === undefined || entry.tag === "" || !known.has(id)) {
          try { badge.remove(); } catch { /* gone */ }
        }
      }
      return { placed, missed, wanted };
    }

    // ---- current-session protection ------------------------------------
    /** The workspaces the official uiWorkspace service says hold the open session. */
    function officialCurrentWorkspaceIds() {
      const ids = new Set();
      try {
        const service = ctx !== null && ctx !== undefined && typeof ctx.get === "function" ? ctx.get("uiWorkspace") : null;
        if (service === null || service === undefined) return ids;
        const selection = service.selection !== null && service.selection !== undefined && typeof service.selection.getSnapshot === "function"
          ? service.selection.getSnapshot()
          : null;
        const sessionId = selection !== null && typeof selection === "object" ? selection.sessionId : undefined;
        if (typeof sessionId !== "string" || sessionId === "") return ids;
        const list = service.workspaces !== null && service.workspaces !== undefined && service.workspaces.list !== null && service.workspaces.list !== undefined
          ? service.workspaces.list.getSnapshot()
          : null;
        const items = list !== null && typeof list === "object" && Array.isArray(list.items) ? list.items : [];
        let current = null;
        for (const item of items) {
          if (item === null || typeof item !== "object") continue;
          if (!Array.isArray(item.sessionIds) || item.sessionIds.indexOf(sessionId) < 0) continue;
          if (typeof item.workspaceId === "string" && item.workspaceId !== "") { current = item; break; }
        }
        if (current === null) return ids;
        ids.add(current.workspaceId);
        const normalizePath = (value) => String(value).replace(/\\/g, "/").replace(/\/+$/, "");
        const currentPath = typeof current.path === "string" ? normalizePath(current.path) : "";
        if (currentPath !== "") {
          for (const item of items) {
            if (item === null || typeof item !== "object") continue;
            if (typeof item.workspaceId !== "string" || item.workspaceId === current.workspaceId) continue;
            const candidate = typeof item.path === "string" ? normalizePath(item.path) : "";
            if (candidate !== "" && currentPath.indexOf(candidate + "/") === 0) ids.add(item.workspaceId);
          }
        }
      } catch { /* no service: the DOM signals below still protect */ }
      return ids;
    }

    function workspaceIdOfElement(element) {
      const key = element.getAttribute(WS_ROW_KEY_ATTR);
      if (typeof key !== "string" || key.indexOf(WS_WORKSPACE_PREFIX) !== 0) return null;
      const id = key.slice(WS_WORKSPACE_PREFIX.length);
      if (id === "") return "";
      return wsRowsValidId(id) ? id : null;
    }

    /**
     * The workspace this group wrapper owns.
     *
     * HoverCard renders its anchor inside a wrapper <span> (the shipped row is a
     * direct child of that span), so the keyed row is either a direct child of
     * the group wrapper or one level below it. One level only: nested child
     * workspaces live under div[role="group"], never as a direct grandchild.
     */
    function directWorkspaceChildId(element) {
      let children;
      try { children = element.children; } catch { return null; }
      if (children === null || children === undefined) return null;
      for (const child of children) {
        const direct = workspaceIdOfElement(child);
        if (direct !== null) return direct;
        let inner;
        try { inner = child.children; } catch { inner = null; }
        if (inner === null || inner === undefined) continue;
        for (const nested of inner) {
          const id = workspaceIdOfElement(nested);
          if (id !== null) return id;
        }
      }
      return null;
    }

    /** Every workspace group that contains this node, nearest first. */
    function ancestorWorkspaceIds(node, root) {
      const ids = [];
      let element = node.parentElement;
      while (element !== null && element !== undefined && element !== root) {
        const id = directWorkspaceChildId(element);
        if (id !== null) ids.push(id);
        element = element.parentElement;
      }
      return ids;
    }

    /** The shipped row marks the group holding the open session with a *folderActive class. */
    function marksCurrentGroup(row) {
      let nodes;
      try { nodes = Array.prototype.slice.call(row.querySelectorAll("span,div")); } catch { return false; }
      for (const node of nodes) {
        const tokens = String(node.className === null || node.className === undefined ? "" : node.className).split(/\s+/);
        for (const token of tokens) if (token !== "" && /folderActive$/i.test(token)) return true;
      }
      return false;
    }

    /**
     * Workspace ids whose group must never be hidden.
     *
     * Three independent signals, unioned: the official service, the selected
     * session row (aria-selected / aria-current), and the folderActive mark that
     * also covers a COLLAPSED group whose session rows are not rendered. If a
     * selected session cannot be mapped to any workspace group, hide nothing at
     * all (blockAll): a row the person is reading must never disappear.
     */
    function protectedIds(root) {
      const ids = new Set();
      let blockAll = false;
      for (const id of officialCurrentWorkspaceIds()) ids.add(id);
      for (const node of allRowNodes(root)) {
        const key = node.getAttribute(WS_ROW_KEY_ATTR);
        if (typeof key !== "string" || key.indexOf(WS_SESSION_PREFIX) !== 0) continue;
        const selected = node.getAttribute("aria-selected") === "true" || node.getAttribute("aria-current") === "true";
        if (!selected) continue;
        // "" is the ungrouped bucket's key (data-row-key="workspace:"): it counts as
        // "inside a group, but not inside any real workspace", so hiding the OTHER
        // workspaces is still safe. Only a selected session with no group wrapper at
        // all makes us hide nothing.
        const groupIds = ancestorWorkspaceIds(node, root);
        if (groupIds.length === 0) blockAll = true;
        for (const id of groupIds) if (id !== "") ids.add(id);
      }
      for (const row of workspaceRows(root)) {
        const id = rowIdOf(row);
        if (id !== null && marksCurrentGroup(row)) ids.add(id);
      }
      return { ids, blockAll };
    }

    // ---- hiding ---------------------------------------------------------
    function renderHide(root) {
      const style = ensureHideStyleTag();
      let hidden = 0;
      let rules = [];
      try {
        const guard = protectedIds(root);
        for (const id of Object.keys(prefs.workspaces)) {
          if (prefs.workspaces[id].hidden !== true) continue;
          hidden++;
          if (guard.blockAll || guard.ids.has(id)) continue;
          if (!WS_ID_PATTERN.test(id)) continue;
          // Three shapes, all scoped to ONE or TWO levels above the keyed row, so
          // an ancestor group is never matched by accident:
          //   div > row                       (ungrouped bucket; no hover wrapper)
          //   div > span > row                (the shipped HoverCard wrapper)
          //   .*groupSection variants         (belt and braces for the two shapes)
          const key = wsRowsCssString(WS_WORKSPACE_PREFIX + id);
          const attr = "[" + WS_ROW_KEY_ATTR + '="' + key + '"]';
          rules.push(
            "div:has(>" + attr + ")," +
            "div:has(>span>" + attr + ")," +
            'div[class*="groupSection"]:has(>' + attr + ")," +
            'div[class*="groupSection"]:has(>span>' + attr + ")" +
            "{display:none!important;}"
          );
        }
      } catch (error) {
        rules = [];
        wsRowsWarn("隐藏工作区样式生成失败,已跳过(不影响侧栏):", error);
      }
      if (style !== null && style !== undefined) {
        const text = rules.length === 0 ? "" : WS_HIDE_CSS_HEADER + "\n" + rules.join("\n");
        try { if (style.textContent !== text) style.textContent = text; } catch { /* gone */ }
      }
      return { rules: rules.length, wanted: hidden };
    }

    // ---- paint ----------------------------------------------------------
    function paint() {
      if (disposed || !enabled || givenUp) return;
      const root = container();
      if (root === null) return;
      let rows;
      try { rows = workspaceRows(root); } catch (error) { noteFailure(error); return; }
      // Sidebar in rail mode, an empty list, or a build without workspace rows:
      // nothing to place is NOT a failure.
      if (rows.length === 0) return;
      painting = true;
      let placed = 0;
      let missed = 0;
      let wanted = 0;
      let failure = null;
      try {
        const synced = syncBadges(root, rows);
        placed += synced.placed;
        missed += synced.missed;
        wanted += synced.wanted;
        const hide = renderHide(root);
        placed += hide.rules;
        wanted += hide.wanted;
      } catch (error) {
        failure = error;
      } finally {
        painting = false;
        paintedAt = Date.now();
      }
      if (placed > 0) failures = 0;
      else if (failure !== null) noteFailure(failure);
      else if (wanted > 0 && missed > 0) noteFailure("这一轮没有任何工作区行能贴上标签: " + missed + " 个");
    }

    function noteFailure(why) {
      if (givenUp || disposed) return;
      failures++;
      if (failures === 1) wsRowsWarn("工作区标签注入失败,已降级(不影响侧栏):", why);
      if (failures < WS_MAX_FAILURES) return;
      givenUp = true;
      stopWatching();
      if (!wsRowsReadFlag(WS_ROWS_DISMISSED_KEY, false)) showToast(translate("givingUp"), true);
    }

    // ---- watchers -------------------------------------------------------
    function ensureObserver() {
      if (disposed || !enabled || givenUp) return;
      if (typeof window.MutationObserver !== "function") return;
      const root = container();
      if (root === null) return;
      if (observer !== null && observerRoot === root) return;
      if (observer !== null) { try { observer.disconnect(); } catch { /* gone */ } observer = null; }
      observer = new window.MutationObserver(onMutations);
      observerRoot = root;
      observer.observe(root, { childList: true, subtree: true });
    }

    function onMutations() {
      if (disposed || !enabled || givenUp) return;
      try {
        if (painting) return;
        // Ignore only the settle window right after our own paint. Anything later
        // must reconcile, or a host re-render that took a badge leaves it gone.
        if (Date.now() - paintedAt < WS_QUIET_MS) return;
        if (container() === null) { scheduleRetry(); return; }
        scheduleScan();
      } catch (error) { noteFailure(error); }
    }

    function scheduleScan() {
      if (disposed || !enabled || givenUp) return;
      if (scanTimer !== 0) { try { window.clearTimeout(scanTimer); } catch { /* gone */ } }
      scanTimer = window.setTimeout(() => { scanTimer = 0; paint(); }, WS_SCAN_DEBOUNCE);
    }

    function scheduleRetry() {
      if (disposed || !enabled || givenUp) return;
      if (retryTimer !== 0) return;
      retryTimer = window.setInterval(attachContainer, 1000);
    }

    function attachContainer() {
      if (disposed || !enabled || givenUp) return true;
      const root = container();
      if (root === null) return false;
      ensureObserver();
      paint();
      if (observer !== null && retryTimer !== 0) { try { window.clearInterval(retryTimer); } catch { /* gone */ } retryTimer = 0; }
      return true;
    }

    function startWatching() {
      if (disposed || !enabled || givenUp) return;
      ensureObserver();
      if (container() !== null) paint();
      else scheduleRetry();
      // No MutationObserver in this build: the 1s retry is the only updater left.
      if (observer === null && retryTimer === 0) scheduleRetry();
    }

    function stopWatching() {
      if (observer !== null) { try { observer.disconnect(); } catch { /* gone */ } observer = null; }
      observerRoot = null;
      if (retryTimer !== 0) { try { window.clearInterval(retryTimer); } catch { /* gone */ } retryTimer = 0; }
      if (scanTimer !== 0) { try { window.clearTimeout(scanTimer); } catch { /* gone */ } scanTimer = 0; }
      painting = false;
    }

    // ---- preferences ----------------------------------------------------
    function snapshot() {
      return wsRowsNormalizeDoc(prefs);
    }

    function subscribePrefs(listener) {
      if (typeof listener !== "function") return () => {};
      prefListeners.add(listener);
      return () => { prefListeners.delete(listener); };
    }

    function notifyPrefs() {
      for (const listener of prefListeners) {
        try { listener(snapshot()); } catch { /* a listener must not break the paint */ }
      }
    }

    function commitPrefs(next) {
      prefs = wsRowsNormalizeDoc(next);
      localDirty = true;
      wsRowsWriteLocalPrefs(prefs);
      notifyPrefs();
      paint();
      scheduleSave();
    }

    function updateEntry(id, patch) {
      if (disposed || !wsRowsValidId(id)) return null;
      if (id === "__proto__" || id === "constructor" || id === "prototype") return null;
      const base = prefs.workspaces[id] !== undefined ? prefs.workspaces[id] : wsRowsNormalizeEntry(null);
      const next = {
        tag: base.tag,
        color: base.color,
        pinned: base.pinned,
        hidden: base.hidden,
        pinAnchor: base.pinAnchor
      };
      const wasPinned = base.pinned === true;
      let pinOn = false;
      let restoreAnchor = null;
      if (patch !== null && typeof patch === "object") {
        if (Object.hasOwn(patch, "tag")) next.tag = wsRowsNormalizeTag(patch.tag);
        if (Object.hasOwn(patch, "color")) next.color = wsRowsNormalizeColor(patch.color);
        if (Object.hasOwn(patch, "pinned")) {
          next.pinned = patch.pinned === true;
          // Pin: remember who this workspace sat behind, then replay to the top.
          // Unpin: restore behind that anchor and clear it (a missing anchor
          // leaves the row where it is).
          if (next.pinned === true && !wasPinned) {
            pinOn = true;
            next.pinAnchor = capturePinAnchor(id);
          } else if (next.pinned !== true && wasPinned) {
            restoreAnchor = base.pinAnchor;
            next.pinAnchor = null;
          }
        }
        if (Object.hasOwn(patch, "hidden")) next.hidden = patch.hidden === true;
        if (Object.hasOwn(patch, "pinAnchor")) next.pinAnchor = typeof patch.pinAnchor === "string" ? patch.pinAnchor : null;
      }
      const entry = wsRowsNormalizeEntry(next);
      const workspaces = Object.assign({}, prefs.workspaces);
      if (wsRowsIsDefaultEntry(entry)) delete workspaces[id];
      else workspaces[id] = entry;
      commitPrefs({ version: 1, workspaces });
      if (pinOn) requestPinReplay(0);
      else if (restoreAnchor !== null) restorePinAnchor(id, restoreAnchor);
      return entry;
    }

    // ---- pinning --------------------------------------------------------
    /**
     * Bind the Client Workspace service late and non-blockingly. A host
     * without `workspaces` (or an older one whose ctx cannot inject) keeps
     * tags, hiding and the preferences table exactly as they were.
     */
    function bindWorkspaceService() {
      if (disposed) return;
      const inject = ctx !== null && ctx !== undefined && typeof ctx.inject === "function" ? ctx.inject : null;
      if (inject === null) return;
      try {
        inject(["workspaces"], (scope) => {
          if (disposed) return;
          let service = null;
          try { service = scope !== null && scope !== undefined ? scope.workspaces : null; } catch { service = null; }
          if (service === null || typeof service !== "object" || typeof service.insertBefore !== "function") return;
          pinService = service;
          try {
            const source = service.list;
            if (source !== null && source !== undefined && typeof source.subscribe === "function") {
              pinUnsubscribe = source.subscribe(onWorkspaceListChanged);
            }
          } catch (error) { notePinWarn("订阅工作区列表失败:", error); }
          schedulePinReplay(0);
        });
      } catch (error) {
        notePinWarn("工作区置顶初始化失败(不影响标签和隐藏):", error);
      }
    }

    function pinItems() {
      try {
        const source = pinService !== null && pinService !== undefined ? pinService.list : null;
        if (source === null || source === undefined || typeof source.getSnapshot !== "function") return [];
        const snapshot = source.getSnapshot();
        return snapshot !== null && typeof snapshot === "object" && Array.isArray(snapshot.items) ? snapshot.items : [];
      } catch { return []; }
    }

    function pinWorkspaceIds() {
      const ids = [];
      for (const item of pinItems()) {
        if (item === null || typeof item !== "object") continue;
        const id = typeof item.workspaceId === "string" && item.workspaceId !== ""
          ? item.workspaceId
          : (typeof item.id === "string" ? item.id : "");
        if (wsRowsValidId(id) && ids.indexOf(id) < 0) ids.push(id);
      }
      return ids;
    }

    /** One warning per page: a missing service is a degradation, never an error. */
    function notePinWarn(message, error) {
      if (pinWarned) return;
      pinWarned = true;
      try { console.warn("dsh-lookout: " + message, error); } catch { /* no console */ }
    }

    /** One toast and one warning per page; a broken reorder must never repeat. */
    function notePinFailure(error) {
      pinFailures++;
      if (pinFailures >= WS_PIN_MAX_FAILURES) pinSuspended = true;
      else pinCooldownUntil = Date.now() + WS_PIN_RETRY_MS;
      if (pinFailedOnce) return;
      pinFailedOnce = true;
      notePinWarn("工作区置顶失败(只提示一次):", error);
      try { showToast(translate("pinFailed"), false); } catch { /* best effort */ }
    }

    function onWorkspaceListChanged() {
      if (disposed) return;
      // Our own moves change the list too: fold them into the running replay
      // instead of starting another one.
      if (pinRunning) { pinDirty = true; return; }
      schedulePinReplay(WS_PIN_DEBOUNCE);
    }

    function schedulePinReplay(delay) {
      if (disposed || pinService === null || pinSuspended) return;
      if (pinTimer !== 0) return;
      let wait = typeof delay === "number" && delay > 0 ? delay : 0;
      const now = Date.now();
      if (pinCooldownUntil > now) wait = Math.max(wait, pinCooldownUntil - now);
      pinTimer = window.setTimeout(() => { pinTimer = 0; void pinNow(); }, wait);
    }

    /** An explicit user action clears the failure backoff and replays immediately. */
    function requestPinReplay(delay) {
      pinSuspended = false;
      pinFailures = 0;
      pinCooldownUntil = 0;
      if (pinTimer !== 0) { try { window.clearTimeout(pinTimer); } catch { /* gone */ } pinTimer = 0; }
      schedulePinReplay(delay);
    }

    /**
     * Replay pinned workspaces to the front. Zero insertBefore calls when the
     * order already fits; otherwise the smallest set of moves (one per pinned
     * workspace that is not already in the correct prefix). Re-entry from our
     * own moves is folded into pinDirty, and the identical-plan guard plus the
     * round/move caps stop a host that accepts a move without performing it.
     * @returns a promise settled when this replay finished.
     */
    function pinNow() {
      if (disposed || pinSuspended) return Promise.resolve();
      const service = pinService;
      if (service === null || typeof service.insertBefore !== "function") return Promise.resolve();
      if (pinRunning) { pinDirty = true; return Promise.resolve(); }
      pinRunning = true;
      pinDirty = false;
      return (async () => {
        let moves = 0;
        let lastKey = null;
        let stalled = false;
        try {
          for (let round = 0; round < WS_PIN_MAX_ROUNDS; round++) {
            if (disposed) break;
            const plan = wsPinPlan(prefs, pinItems());
            if (plan === null) { pinDirty = false; break; }
            if (plan.key === lastKey) { stalled = true; break; }
            lastKey = plan.key;
            pinDirty = false;
            let stop = false;
            for (const step of plan.steps) {
              if (disposed || moves >= WS_PIN_MAX_MOVES) { stop = true; break; }
              try {
                await service.insertBefore(step.id, step.before);
                moves++;
              } catch (error) {
                notePinFailure(error);
                stop = true;
                break;
              }
            }
            if (stop) break;
          }
        } finally {
          pinRunning = false;
          const pending = pinDirty;
          pinDirty = false;
          if (pending && !stalled && !disposed) schedulePinReplay(WS_PIN_DEBOUNCE);
        }
      })();
    }

    /** The workspace right before this one at pin time; null when it was first. */
    function capturePinAnchor(id) {
      if (pinService === null) { notePinWarn(translate("pinUnavailable")); return null; }
      const ids = pinWorkspaceIds();
      const at = ids.indexOf(id);
      return at > 0 ? ids[at - 1] : null;
    }

    /**
     * Unpin restore: move the workspace back behind its recorded anchor. An
     * anchor that is gone (or null) leaves the workspace where it is, so a
     * deletion elsewhere never makes the list jump.
     */
    function restorePinAnchor(id, anchor) {
      if (disposed || pinService === null || typeof anchor !== "string" || anchor === "") return;
      const ids = pinWorkspaceIds();
      if (ids.indexOf(id) < 0) return;
      const at = ids.indexOf(anchor);
      if (at < 0) return; // anchor gone: stay put (the caller already cleared it)
      const before = at + 1 < ids.length ? ids[at + 1] : undefined;
      if (before === id) return; // already right behind the anchor: zero calls
      try {
        const result = pinService.insertBefore(id, before);
        if (result !== null && typeof result === "object" && typeof result.then === "function") {
          result.catch((error) => notePinFailure(error));
        }
      } catch (error) { notePinFailure(error); }
    }

    function cleanupMissing(ids) {
      if (disposed) return 0;
      const list = Array.isArray(ids) ? ids : [];
      const known = new Set();
      for (const id of list) if (wsRowsValidId(id)) known.add(id);
      // Without a live list the button must not wipe every preference.
      if (known.size === 0) return 0;
      const workspaces = {};
      let removed = 0;
      for (const [id, entry] of Object.entries(prefs.workspaces)) {
        if (known.has(id)) workspaces[id] = entry;
        else removed++;
      }
      if (removed === 0) return 0;
      commitPrefs({ version: 1, workspaces });
      return removed;
    }

    function rpcFace() {
      try {
        if (ctx === null || ctx === undefined) return null;
        let connection = ctx.connection;
        if (connection === null || connection === undefined) {
          connection = typeof ctx.get === "function" ? ctx.get("connection") : null;
        }
        const face = connection !== null && connection !== undefined ? connection.rpc : null;
        return face !== null && face !== undefined && typeof face.call === "function" ? face : null;
      } catch { return null; }
    }

    /** Startup pull: adopt the Host document, or keep the local mirror when RPC is unavailable. */
    function loadFromHost() {
      if (disposed) return;
      const face = rpcFace();
      if (face === null) return;
      try {
        face.call("/api", "iconCustom/getWorkspacePrefs", { args: {} }).then((response) => {
          if (disposed) return;
          if (response === null || typeof response !== "object" || response.ok !== true) return;
          // A local edit that happened while the pull was in flight wins; push it.
          if (localDirty) { scheduleSave(); return; }
          prefs = wsRowsNormalizeDoc(response.value);
          wsRowsWriteLocalPrefs(prefs);
          notifyPrefs();
          paint();
        }).catch(() => { /* keep the local mirror */ });
      } catch { /* keep the local mirror */ }
    }

    function scheduleSave() {
      if (disposed) return;
      if (saveTimer !== 0) { try { window.clearTimeout(saveTimer); } catch { /* gone */ } }
      saveTimer = window.setTimeout(saveNow, WS_SAVE_DEBOUNCE);
    }

    function saveNow() {
      saveTimer = 0;
      if (disposed) return;
      const face = rpcFace();
      // No RPC: the localStorage mirror is the documented fallback, not an error.
      if (face === null) return;
      const request = snapshot();
      try {
        face.call("/api", "iconCustom/setWorkspacePrefs", { args: { request } }).then((response) => {
          if (disposed) return;
          if (response === null || typeof response !== "object" || response.ok !== true) { noteSaveFailure(response); return; }
          localDirty = false;
        }).catch(noteSaveFailure);
      } catch (error) { noteSaveFailure(error); }
    }

    /** Saved once per page: a broken Host must not turn every keystroke into a toast. */
    function noteSaveFailure(why) {
      if (saveFailedOnce) return;
      saveFailedOnce = true;
      try { console.warn("dsh-lookout: 工作区偏好保存失败(只提示一次):", why); } catch { /* no console */ }
      showToast(translate("saveFailed"), false);
    }

    // ---- switch ---------------------------------------------------------
    function setEnabled(next) {
      const on = next === true;
      enabled = on;
      wsRowsWriteFlag(WS_ROWS_ENABLED_KEY, on);
      if (disposed) return;
      if (!on) {
        stopWatching();
        hideToast();
        removeBadges();
        const style = ensureHideStyleTag();
        if (style !== null && style !== undefined) { try { style.textContent = ""; } catch { /* gone */ } }
        return;
      }
      givenUp = false;
      failures = 0;
      hideToast();
      startWatching();
      requestPinReplay(0);
    }

    function removeBadges() {
      try { document.querySelectorAll("[" + WS_TAG_ATTR + "]").forEach((node) => { try { node.remove(); } catch { /* gone */ } }); } catch { /* gone */ }
    }

    // ---- toast ----------------------------------------------------------
    function showToast(message, dismissable) {
      if (disposed) return;
      if (document.body === null || document.body === undefined) return;
      hideToast();
      const box = document.createElement("div");
      box.className = "dsh-lookout-ws-toast";
      box.setAttribute(WS_TOAST_ATTR, "");
      box.setAttribute("role", "status");
      box.setAttribute("aria-live", "polite");
      const text = document.createElement("span");
      text.className = "dsh-lookout-ws-toast-text";
      text.textContent = message;
      box.appendChild(text);
      if (dismissable === true) {
        const dismiss = document.createElement("button");
        dismiss.type = "button";
        dismiss.textContent = translate("dismiss");
        dismiss.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          wsRowsWriteFlag(WS_ROWS_DISMISSED_KEY, true);
          hideToast();
        });
        box.appendChild(dismiss);
      }
      document.body.appendChild(box);
      toast = box;
      paintedAt = Date.now();
      toastTimer = window.setTimeout(hideToast, WS_TOAST_MS);
    }

    function hideToast() {
      if (toastTimer !== 0) { try { window.clearTimeout(toastTimer); } catch { /* gone */ } toastTimer = 0; }
      if (toast !== null) { try { toast.remove(); } catch { /* gone */ } toast = null; }
    }

    // ---- lifecycle ------------------------------------------------------
    function dispose() {
      if (disposed) return;
      disposed = true;
      try { stopWatching(); } catch { /* best effort */ }
      try { hideToast(); } catch { /* best effort */ }
      try { removeBadges(); } catch { /* best effort */ }
      if (saveTimer !== 0) { try { window.clearTimeout(saveTimer); } catch { /* gone */ } saveTimer = 0; }
      if (pinTimer !== 0) { try { window.clearTimeout(pinTimer); } catch { /* gone */ } pinTimer = 0; }
      if (pinUnsubscribe !== null) { try { pinUnsubscribe(); } catch { /* gone */ } pinUnsubscribe = null; }
      pinService = null;
      try {
        document.querySelectorAll('style[data-plugin-css="' + WS_STYLE_KEY + '"],style[data-plugin-css="' + WS_HIDE_STYLE_KEY + '"]').forEach((node) => {
          try { node.remove(); } catch { /* gone */ }
        });
      } catch { /* best effort */ }
      prefListeners.clear();
    }

    ensureStaticStyle();
    bindWorkspaceService();
    startWatching();
    loadFromHost();

    return {
      dispose,
      snapshot,
      subscribe: subscribePrefs,
      updateEntry,
      cleanupMissing,
      paintNow: paint,
      pinNow,
      domWorkspaceIds,
      setEnabled,
      isEnabled: () => enabled === true
    };
  }
  //#endregion

  //#region session id in the sidebar hover card
  /**
   * The session id, printed inside the sidebar's session hover card.
   *
   * Why a slot instead of DOM patching: ui-workspace renders
   * `renderSlot("sidebar.session.row.hover", { sessionId })` between the card's
   * time line and its status lines, so this is a documented seat. No host markup
   * is read or written, and a host upgrade that moves the card carries our line
   * with it.
   *
   * The header badge of the byte-locked dsh-session-info part cannot be edited,
   * so "move" is delivered as CSS: while this line is ON, that badge is hidden,
   * which puts the id in exactly one place. Turning the switch OFF restores the
   * header and drops the card line — i.e. the shipped behaviour, untouched.
   */
  const HOVER_SLOT = "sidebar.session.row.hover";
  /** Own locale namespace: locale.register THROWS on a duplicate namespace. */
  const HOVER_NS = "dsh-lookout-session-id";
  /** localStorage switch; absent or unreadable means ON. */
  const HOVER_ENABLED_KEY = "dsh-lookout:session-id:hover";
  const HOVER_STYLE_KEY = "lookout-session-id-hover";
  const HOVER_HIDE_STYLE_KEY = "lookout-session-id-hide";
  const HOVER_LINE_CLASS = "dsh-lookout-session-id-hover";
  const HOVER_TOAST_CLASS = "dsh-lookout-session-id-hover-toast";
  const HOVER_TOAST_ATTR = "data-lookout-session-id-toast";
  const HOVER_TOAST_MS = 2000;
  /** The bundled part's own badge class, hidden while the card carries the id. */
  const HOVER_HEADER_SELECTOR = ".dsh-session-info";

  const HOVER_ZH = {
    nav: "会话 ID",
    toggleLabel: "在会话悬停卡片里显示会话 ID（顶部不再重复显示）",
    toggleHint: "侧栏里鼠标停在某个会话上，弹出的卡片里会多一行等宽字：这个会话的完整 ID（session-…），点一下即可复制。开启时顶部那串会话 ID 会隐藏，避免同一个 ID 显示两处；关掉即恢复原样。",
    copied: "已复制会话 ID",
    copyFailed: "复制失败，请手动选择会话 ID 复制",
    copyHint: "点击复制完整会话 ID",
    ariaLabel: "复制完整会话 ID"
  };
  const HOVER_EN = {
    nav: "Session ID",
    toggleLabel: "Show the session ID in the session hover card (hidden in the header)",
    toggleHint: "Hovering a session in the sidebar opens a card; this adds one monospace line with the session's full ID (session-…), and one click copies it. While this is on, the header stops showing the same id so it appears in exactly one place; turning it off restores the shipped behaviour.",
    copied: "Session ID copied",
    copyFailed: "Copy failed — select the session ID and copy it manually",
    copyHint: "Click to copy the full session ID",
    ariaLabel: "Copy the full session ID"
  };

  const HOVER_CSS = [
    // One quiet line under the card's time, in the same voice as its status rows.
    "." + HOVER_LINE_CLASS + "{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;line-height:1.5;color:var(--dsw-alias-label-tertiary,#8b8b8b);opacity:.85;word-break:break-all;cursor:copy;user-select:text;}",
    "." + HOVER_LINE_CLASS + ":hover,." + HOVER_LINE_CLASS + ":focus-visible{opacity:1;text-decoration:underline;outline:none;}",
    "." + HOVER_TOAST_CLASS + "{position:fixed;left:50%;bottom:24px;z-index:2147482100;max-width:min(92vw,560px);padding:9px 12px;transform:translateX(-50%);border:1px solid var(--dsw-alias-border-l2,#444);border-radius:10px;background:var(--dsw-alias-bg-overlay,#222);color:var(--dsw-alias-label-primary,#fff);font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial,sans-serif;font-size:12px;line-height:1.5;box-shadow:0 8px 24px var(--dsw-alias-bg-mask-drop,rgba(0,0,0,.25));}",
    "." + HOVER_TOAST_CLASS + "[data-lookout-session-id-failed]{color:var(--dsw-alias-state-error-primary,#ff6b6b);}"
  ].join("\n");

  /** Chinese fallback for every translate call, used when locale is unavailable. */
  function hoverFallbackText(key, params) {
    const template = typeof HOVER_ZH[key] === "string" ? HOVER_ZH[key] : key;
    if (params === null || params === undefined || typeof params !== "object") return template;
    let text = template;
    for (const name of Object.keys(params)) text = text.split("{" + name + "}").join(String(params[name]));
    return text;
  }

  /** Whether the card line is wanted; storage that throws counts as ON. */
  function hoverReadFlag() {
    try {
      const raw = window.localStorage.getItem(HOVER_ENABLED_KEY);
      if (raw === "1") return true;
      if (raw === "0") return false;
      return true;
    } catch { return true; }
  }

  /** Persist the switch; a storage failure only costs durability. */
  function hoverWriteFlag(value) {
    try { window.localStorage.setItem(HOVER_ENABLED_KEY, value ? "1" : "0"); } catch { /* advisory */ }
  }

  /** One warning per page at most, and only for a real degradation. */
  let hoverWarned = false;
  function hoverWarn(message, error) {
    if (hoverWarned) return;
    hoverWarned = true;
    try { console.warn("dsh-lookout: " + message, error); } catch { /* no console */ }
  }

  /**
   * Mount the card line, its settings switch and the header-hiding stylesheet.
   * Swallows everything: a UI seat may never throw into the host apply().
   * @param ctx - the merged plugin client context.
   * @param require - the ModuleLoader require (React lives behind it).
   * @returns {void}
   */
  function sessionIdHoverStart(ctx, require) {
    try {
      sessionIdHoverInstall(ctx, require);
    } catch (error) {
      hoverWarn("会话 ID 悬停卡片初始化失败,已跳过(不影响宿主):", error);
    }
  }

  /**
   * Install the seat and return its teardown.
   * @param ctx - the merged plugin client context.
   * @param require - the ModuleLoader require.
   * @returns {() => void} disposer.
   */
  function sessionIdHoverInstall(ctx, require) {
    let disposed = false;
    let enabled = hoverReadFlag();
    let translate = hoverFallbackText;
    let toast = null;
    let toastTimer = 0;
    const toggleListeners = new Set();
    const React = require("react");

    /** Every card line and settings switch reads this, so one switch moves both. */
    function notifyToggle() {
      for (const listener of Array.from(toggleListeners)) { try { listener(enabled); } catch { /* gone */ } }
    }

    function subscribeToggle(listener) {
      if (typeof listener !== "function") return () => {};
      toggleListeners.add(listener);
      return () => { toggleListeners.delete(listener); };
    }

    // ---- locale ---------------------------------------------------------
    try {
      const locale = ctx !== null && ctx !== undefined ? ctx.locale : null;
      if (locale !== null && locale !== undefined && typeof locale.register === "function") {
        const register = () => locale.register(HOVER_NS, { zh: HOVER_ZH, en: HOVER_EN });
        if (typeof ctx.effect === "function") ctx.effect(register, "dsh-lookout: session id dictionaries");
        else register();
      }
      if (locale !== null && locale !== undefined && typeof locale.bind === "function") {
        const bound = locale.bind(HOVER_NS);
        translate = (key, params) => {
          let text = key;
          try { text = bound(key, params); } catch { text = key; }
          return typeof text === "string" && text !== key ? text : hoverFallbackText(key, params);
        };
      }
    } catch (error) { /* the Chinese fallback is already in translate */ }

    // ---- styles ---------------------------------------------------------
    function ensureStyleTag(key, css) {
      try {
        const existing = document.querySelector('style[data-plugin-css="' + key + '"]');
        if (existing !== null && existing !== undefined) {
          if (typeof css === "string" && existing.textContent !== css) { try { existing.textContent = css; } catch { /* gone */ } }
          return existing;
        }
        const tag = document.createElement("style");
        tag.setAttribute("data-plugin", "dsh-lookout");
        tag.setAttribute("data-plugin-css", key);
        tag.textContent = typeof css === "string" ? css : "";
        const head = document.head !== null && document.head !== undefined ? document.head : document.body;
        if (head !== null && head !== undefined) head.appendChild(tag);
        return tag;
      } catch { return null; }
    }

    /**
     * Hide the shipped header badge while the card carries the id.
     *
     * The badge lives in a byte-locked part, so it cannot be removed from the
     * bundle; hiding it with one scoped rule is the reversible half of "move".
     */
    function syncHeaderBadge() {
      if (disposed) return;
      if (enabled) { ensureStyleTag(HOVER_HIDE_STYLE_KEY, HOVER_HEADER_SELECTOR + "{display:none !important;}"); return; }
      try {
        document.querySelectorAll('style[data-plugin-css="' + HOVER_HIDE_STYLE_KEY + '"]').forEach((node) => {
          try { node.remove(); } catch { /* gone */ }
        });
      } catch { /* best effort */ }
    }

    // ---- toast + clipboard ----------------------------------------------
    function hideToast() {
      if (toastTimer !== 0) { try { window.clearTimeout(toastTimer); } catch { /* gone */ } toastTimer = 0; }
      if (toast !== null) { try { toast.remove(); } catch { /* gone */ } toast = null; }
    }

    function showToast(message, ok) {
      if (disposed) return;
      if (document.body === null || document.body === undefined) return;
      hideToast();
      const box = document.createElement("div");
      box.className = HOVER_TOAST_CLASS;
      box.setAttribute(HOVER_TOAST_ATTR, "");
      if (ok !== true) box.setAttribute("data-lookout-session-id-failed", "");
      box.setAttribute("role", "status");
      box.setAttribute("aria-live", "polite");
      box.textContent = message;
      document.body.appendChild(box);
      toast = box;
      toastTimer = window.setTimeout(hideToast, HOVER_TOAST_MS);
    }

    async function writeClipboard(text) {
      try {
        const primitives = require("@deepseek-ai/dsh-client-ui-primitives");
        if (primitives !== null && primitives !== undefined && typeof primitives.writeClipboard === "function") {
          const result = await primitives.writeClipboard(text);
          if (result !== false) return true;
        }
      } catch { /* fall through to the browser API */ }
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard !== null && navigator.clipboard !== undefined && typeof navigator.clipboard.writeText === "function") {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch { /* fall through to the textarea */ }
      try {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.top = "0";
        area.style.left = "-9999px";
        area.style.opacity = "0";
        document.body.appendChild(area);
        try { area.focus(); area.select(); } catch { /* focus is advisory */ }
        const copied = typeof document.execCommand === "function" && document.execCommand("copy") === true;
        try { area.remove(); } catch { /* gone */ }
        return copied;
      } catch { return false; }
    }

    async function copyId(id) {
      let copied = false;
      try { copied = await writeClipboard(id); } catch { copied = false; }
      if (disposed) return;
      showToast(copied ? translate("copied") : translate("copyFailed"), copied === true);
      return copied;
    }

    // ---- the card line ---------------------------------------------------
    /**
     * One card line: the full session id, click or Enter/Space to copy it.
     *
     * A `div[role=button]` rather than a `button`: the card is a passive panel
     * and the row it describes owns the click that opens the session, so this
     * line must stay a leaf that steals only its own events.
     */
    function SessionIdHoverLine(props) {
      const [on, setOn] = React.useState(() => enabled);
      React.useEffect(() => subscribeToggle(setOn), []);
      const id = props !== null && props !== undefined && typeof props.sessionId === "string" ? props.sessionId : "";
      if (on !== true || id === "") return null;
      const label = props !== null && props !== undefined && typeof props.t === "function" ? props.t : translate;
      const activate = (event) => {
        if (event !== null && event !== undefined) {
          if (typeof event.preventDefault === "function") event.preventDefault();
          if (typeof event.stopPropagation === "function") event.stopPropagation();
        }
        void copyId(id);
      };
      const onKeyDown = (event) => {
        if (event === null || event === undefined) return;
        if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") return;
        activate(event);
      };
      return React.createElement("div", {
        className: HOVER_LINE_CLASS,
        role: "button",
        tabIndex: 0,
        title: label("copyHint"),
        "aria-label": label("ariaLabel"),
        "data-lookout-session-id": id,
        onClick: activate,
        onKeyDown
      }, id);
    }

    // ---- settings --------------------------------------------------------
    function SessionIdHoverSection(props) {
      const label = props !== null && props !== undefined && typeof props.t === "function" ? props.t : translate;
      const [checked, setChecked] = React.useState(() => hoverReadFlag());
      React.useEffect(() => subscribeToggle(setChecked), []);
      const onChange = (event) => {
        const next = event.target.checked === true;
        setChecked(next);
        setEnabled(next);
      };
      return React.createElement("div", { "data-lookout-settings": "session-id" },
        React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "var(--dsw-alias-label-primary)", marginBottom: 8 } }, label("nav")),
        React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--dsw-alias-label-primary)", cursor: "pointer" } },
          React.createElement("input", { type: "checkbox", checked, onChange }),
          React.createElement("span", null, label("toggleLabel"))
        ),
        React.createElement("div", { style: { marginTop: 6, fontSize: 12, lineHeight: 1.6, color: "var(--dsw-alias-label-tertiary)" } }, label("toggleHint"))
      );
    }

    /** Flip the line and the header rule together, then persist. */
    function setEnabled(next) {
      enabled = next === true;
      hoverWriteFlag(enabled);
      syncHeaderBadge();
      if (!enabled) hideToast();
      notifyToggle();
    }

    // ---- wiring ----------------------------------------------------------
    ensureStyleTag(HOVER_STYLE_KEY, HOVER_CSS);
    syncHeaderBadge();

    try {
      const slots = ctx !== null && ctx !== undefined ? ctx.slots : null;
      if (slots !== null && slots !== undefined && typeof slots.inject === "function" && typeof slots.register === "function") {
        // Order 1: above the scheduled-task section (order 10) and the status
        // lines, directly under the card's time — the id reads as part of the
        // card's own header, not as one more status.
        slots.inject(HOVER_SLOT, () => slots.register({
          name: HOVER_SLOT,
          id: "lookout-session-id",
          order: 1,
          locale: HOVER_NS,
          inject: () => ({ t: translate })
        }, SessionIdHoverLine));
        slots.inject("settings.section", () => slots.register({
          name: "settings.section",
          id: "lookout-session-id",
          order: 57,
          label: () => translate("nav"),
          locale: HOVER_NS,
          inject: () => ({ t: translate })
        }, SessionIdHoverSection));
      }
    } catch (error) {
      hoverWarn("会话 ID 插槽注册失败,已跳过(不影响宿主):", error);
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      hideToast();
      toggleListeners.clear();
      try {
        document.querySelectorAll('style[data-plugin-css="' + HOVER_STYLE_KEY + '"],style[data-plugin-css="' + HOVER_HIDE_STYLE_KEY + '"]').forEach((node) => { try { node.remove(); } catch { /* gone */ } });
      } catch { /* best effort */ }
    }

    if (ctx !== null && ctx !== undefined && typeof ctx.effect === "function") {
      try { ctx.effect(() => dispose, "dsh-lookout: session id in hover card"); } catch { /* best effort */ }
    }
    return dispose;
  }
  //#endregion


  window.__ModuleLoader__.load({
    id: "dsh-lookout",
    factory: (require) => {
      const __mods = __parts.map((def) => def.factory(require));
      const __inject = Array.from(new Set(__mods.flatMap((m) => (m && m.inject) || [])));
      return {
        inject: __inject,
        apply(ctx) {
          // The file-row "⋯" menu is independent of the three bundled parts, so it
          // starts first and owns its own try/catch: a fault in any part (or a
          // missing files panel) only costs this feature, never the host.
          rowMenuStart(ctx, require);
          // Workspace tags + hiding are independent of the three bundled parts for
          // the same reason, and own their own try/catch inside wsRowsStart.
          wsRowsStart(ctx, require);
          // The session id in the sidebar's hover card rides an official slot
          // (sidebar.session.row.hover), so it owns its own try/catch too.
          sessionIdHoverStart(ctx, require);
          for (const m of __mods) { if (m && typeof m.apply === "function") m.apply(ctx); }
        },
      };
    },
  });
})();
