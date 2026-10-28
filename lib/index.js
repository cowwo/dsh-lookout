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
 *
 * 另外还有一件事必须在**模块顶层**做(不是接线,但只能放在这里):
 * 导出 `Config`(见下方)。设置页读的就是入口模块的这个导出。
 */
import { FaviconCustomService } from './icon/index.js'
import { apply as applyNotify } from './notify/index.js'
import { apply as applySessionInfo } from './session/index.js'
import { MailSchema } from './notify/config.js'

export const name = 'dsh-lookout'

/**
 * A 的 static inject(webServer) ∪ B 的 inject(sessions)。
 *
 * 这里**没有 settings**：B 的配置就是它自己的入口 config（lib/notify/config.js 的
 * MailSchema），代码里没有任何 `ctx.settings` 调用；留着这条 inject 只会让插件
 * 多等一个用不到的服务，还会让人误以为配置来自 settings 服务。
 */
export const inject = ['webServer', 'sessions']

/**
 * 本插件的配置 schema —— **设置页能用的前提，不能删**。
 *
 * DSH 0.2.x 的 dsh-settings 从 `entry.fiber.runtime.Config` 取 schema
 * （见 dsh-settings 的 `schema(entry)`）。没有这个导出，`describe()` 直接跳过
 * 本 entry —— 设置页只会显示「这一页读不到本插件的配置」，读不到也写不进。
 *
 * 两条硬约束：
 *   1. 必须在**模块顶层**导出，settings 服务读的是模块的导出，不是 apply 的产物；
 *   2. schema 里 15 个字段全部标了 `.volatile()`（见 lib/notify/config.js），
 *      否则 `volatileForm()` 返回 undefined，同样被跳过。
 *
 * 只做转手：schema 本体仍住在 lib/notify/config.js，这里不复制、不改写。
 */
export const Config = MailSchema

// 具名再导出:合并清单里两条 service 的 exportName 指向这两个类名。
export { FaviconCustomService }
export { MailNotifyRemoteService } from './notify/service.js'

/**
 * 插件入口。三段装配按 A → B → C 的顺序执行。
 * @param {import('@deepseek-ai/cordis').Context} ctx 插件上下文
 * @param {object} [config] cordis 行的 config(组合层默认值;B 每次读活的它,不缓存)
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
