/**
 * dsh-lookout · Host 半合并入口
 *
 * 简单合并,不做重构:
 *   A(dsh-icon-custom) → lib/icon/**   图标 / 未读红点 / 进行中黄点的 Remote 服务
 *   B(dsh-notify-p)    → lib/notify/** 邮件通知(会话事件订阅 + 发送队列 + SMTP)
 *   C(dsh-session-info)→ lib/session/** 宿主侧空实现的 apply(行为全在 client 半)
 *
 * 三份代码逐字节原样躺在子目录里,本文件只做接线:
 *   ① 把 A 的 Service 作为子插件挂上(它自带 static inject = ['webServer'])
 *   ② 调用 B 的 apply(ctx, config)
 *   ③ 调用 C 的 apply(ctx)
 *
 * 合并后的 lib/typert.host.js 是唯一的 typert 清单(package.json 的
 * exports["./typert"] 指向它),里面的服务命名空间 iconCustom / mailNotify
 * 原样保留 —— 浏览器侧的调用串依赖这两个名字。
 */
import { FaviconCustomService } from './icon/index.js'
import { apply as applyNotify } from './notify/index.js'
import { apply as applySessionInfo } from './session/index.js'

export const name = 'dsh-lookout'

/** A 的 static inject(webServer) ∪ B 的 inject(sessions, settings)。 */
export const inject = ['webServer', 'sessions', 'settings']

// 具名再导出:合并清单里两条 service 的 exportName 指向这两个类名。
export { FaviconCustomService }
export { MailNotifyRemoteService } from './notify/service.js'

/**
 * 插件入口。三段装配按 A → B → C 的顺序执行。
 * @param {import('@deepseek-ai/cordis').Context} ctx 插件上下文
 * @param {object} [config] cordis 行的 config(组合层默认值;B 自己会接 settings)
 * @returns {void}
 */
export function apply(ctx, config) {
	// ① A:FaviconCustomService 是 `export default` 的那个类,作为子插件挂载,
	//    它的 static inject / 服务注册(iconCustom)/ 路由都按原样生效。
	ctx.plugin(FaviconCustomService)
	// ② B:它的 apply 自带兜底(内部 try/catch),原样调用。
	applyNotify(ctx, config)
	// ③ C:宿主侧本来就是空实现。
	applySessionInfo(ctx)
}
