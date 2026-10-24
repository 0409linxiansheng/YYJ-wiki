import { createReactBlockSpec, BlockContentWrapper } from "@blocknote/react"

/**
 * 提示框块：对应 Docusaurus 的 admonition 语法
 *   :::tip[标题]
 *   内容
 *   :::
 * 编辑器里显示成带颜色的小卡片，标题和正文都能直接改。
 */
export const CALLOUT_KINDS = [
  { kind: "note", label: "说明", icon: "📝", color: "#3b82f6" },
  { kind: "tip", label: "提示", icon: "💡", color: "#16a34a" },
  { kind: "info", label: "信息", icon: "ℹ️", color: "#0891b2" },
  { kind: "warning", label: "注意", icon: "⚠️", color: "#f59e0b" },
  { kind: "danger", label: "危险", icon: "🚫", color: "#dc2626" },
]

export const Callout = createReactBlockSpec(
  {
    type: "callout",
    propSchema: {
      kind: { default: "tip", values: ["note", "tip", "info", "warning", "danger"] },
      title: { default: "" },
      body: { default: "" },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const meta = CALLOUT_KINDS.find((k) => k.kind === block.props.kind) ?? CALLOUT_KINDS[1]
      return (
        <div className="yyj-callout" style={{ "--c": meta.color }}>
          <div className="yyj-callout-head" contentEditable={false}>
            <span className="yyj-callout-icon">{meta.icon}</span>
            <input
              className="yyj-callout-title"
              value={block.props.title}
              placeholder={meta.label}
              onChange={(e) => editor.updateBlock(block, { props: { title: e.target.value } })}
            />
            <select
              className="yyj-callout-kind"
              value={block.props.kind}
              onChange={(e) => editor.updateBlock(block, { props: { kind: e.target.value } })}
            >
              {CALLOUT_KINDS.map((k) => (
                <option key={k.kind} value={k.kind}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
          <textarea
            className="yyj-callout-body"
            value={block.props.body}
            placeholder="在这里写内容…"
            rows={Math.max(2, (block.props.body || "").split("\n").length)}
            onChange={(e) => editor.updateBlock(block, { props: { body: e.target.value } })}
          />
        </div>
      )
    },
  },
)
