import { createReactBlockSpec } from "@blocknote/react"

/**
 * 标签页：对应 Docusaurus 的 <Tabs>/<TabItem>。
 * 数据存在 props.data（JSON 字符串）：[{ label, body }]
 */
function parse(data) {
  try {
    const list = JSON.parse(data || "[]")
    return Array.isArray(list) && list.length ? list : [{ label: "标签一", body: "" }]
  } catch {
    return [{ label: "标签一", body: "" }]
  }
}

export const Tabs = createReactBlockSpec(
  {
    type: "tabs",
    propSchema: { data: { default: "[]" } },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const items = parse(block.props.data)
      const update = (next) => editor.updateBlock(block, { props: { data: JSON.stringify(next) } })

      return (
        <div className="yyj-tabs-block" contentEditable={false}>
          <div className="yyj-tabs-labels">
            {items.map((it, i) => (
              <input
                key={i}
                className="yyj-tab-label"
                value={it.label}
                placeholder={`标签 ${i + 1}`}
                onChange={(e) => {
                  const next = items.slice()
                  next[i] = { ...next[i], label: e.target.value }
                  update(next)
                }}
              />
            ))}
            <button
              className="yyj-tab-add"
              onClick={() => update([...items, { label: `标签 ${items.length + 1}`, body: "" }])}
              title="加一个标签页"
            >
              +
            </button>
          </div>

          {items.map((it, i) => (
            <div className="yyj-tab-panel" key={i}>
              <div className="yyj-tab-panel-head">
                <span>{it.label || `标签 ${i + 1}`}</span>
                {items.length > 1 && (
                  <button
                    className="yyj-tab-del"
                    onClick={() => update(items.filter((_, idx) => idx !== i))}
                    title="删除这个标签页"
                  >
                    ×
                  </button>
                )}
              </div>
              <textarea
                className="yyj-tab-body"
                value={it.body}
                rows={Math.max(3, (it.body || "").split("\n").length)}
                placeholder="这个标签页里的内容"
                onChange={(e) => {
                  const next = items.slice()
                  next[i] = { ...next[i], body: e.target.value }
                  update(next)
                }}
              />
            </div>
          ))}
        </div>
      )
    },
  },
)
