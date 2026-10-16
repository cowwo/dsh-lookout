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
