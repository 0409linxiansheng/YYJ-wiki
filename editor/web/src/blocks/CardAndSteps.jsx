import { createReactBlockSpec } from "@blocknote/react"

/**
 * 卡片：左图右文，对应站点上的 <Card> 组件。
 *
 * 输入框用「非受控 + 防抖提交」的写法：
 * 受控输入在 BlockNote 里每次 updateBlock 都会重渲染，导致光标丢失、
 * 看着像"填了没用"。这里改成输入时只更新本地 DOM，停手 300ms 再写回块属性。
 */
export const Card = createReactBlockSpec(
  {
    type: "card",
    propSchema: {
      title: { default: "" },
      desc: { default: "" },
      image: { default: "" },
      href: { default: "" },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const commit = (key) => {
        const timers = (editor.__cardTimers ??= {})
        return (e) => {
          const value = e.currentTarget.value
          clearTimeout(timers[key])
          timers[key] = setTimeout(() => {
            editor.updateBlock(block, { props: { [key]: value } })
          }, 300)
        }
      }

      return (
        <div className="yyj-card" contentEditable={false}>
          {block.props.image ? (
            <img
              className="yyj-card-image"
              src={block.props.image}
              alt=""
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
              onLoad={(e) => {
                e.currentTarget.style.display = ""
              }}
            />
          ) : (
            <div className="yyj-card-image yyj-card-image-empty">图</div>
          )}
          <div className="yyj-card-body">
            <input
              className="yyj-card-title"
              defaultValue={block.props.title}
              placeholder="卡片标题"
              onInput={commit("title")}
            />
            <textarea
              className="yyj-card-desc"
              defaultValue={block.props.desc}
              placeholder="一句话说明"
              rows={2}
              onInput={commit("desc")}
            />
            <div className="yyj-card-extra">
              <input defaultValue={block.props.href} placeholder="链接（可空）" onInput={commit("href")} />
              <input defaultValue={block.props.image} placeholder="图片地址（可空）" onInput={commit("image")} />
            </div>
            <div className="yyj-card-status">
              {block.props.href ? <span>点击跳到：{block.props.href}</span> : <span>没填链接时卡片不可点</span>}
              {block.props.image ? <span>图片：{block.props.image}</span> : null}
            </div>
          </div>
        </div>
      )
    },
  },
)

/** 步骤条：一行一步，对应站点上的 <Steps> */
export const Steps = createReactBlockSpec(
  {
    type: "steps",
    propSchema: { body: { default: "" } },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const lines = (block.props.body || "").split("\n")
      return (
        <div className="yyj-steps-block">
          <div className="yyj-steps-preview" contentEditable={false}>
            {lines.filter((l) => l.trim()).map((line, i) => (
              <div className="yyj-step" key={i}>
                <span className="yyj-step-num">{i + 1}</span>
                <span className="yyj-step-text">{line}</span>
              </div>
            ))}
            {lines.filter((l) => l.trim()).length === 0 && (
              <div className="yyj-steps-empty">下面每行写一个步骤</div>
            )}
          </div>
          <textarea
            className="yyj-steps-input"
            defaultValue={block.props.body}
            placeholder={"一行一步，例如：\n装依赖\n配环境\n启动"}
            rows={Math.max(3, lines.length)}
            onInput={(e) => {
              const value = e.currentTarget.value
              const timers = (editor.__stepsTimers ??= {})
              clearTimeout(timers[block.id])
              timers[block.id] = setTimeout(() => {
                editor.updateBlock(block, { props: { body: value } })
              }, 300)
            }}
          />
        </div>
      )
    },
  },
)
