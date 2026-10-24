import { createReactBlockSpec } from "@blocknote/react"

/** 折叠块：<details><summary>标题</summary>内容</details> */
export const Details = createReactBlockSpec(
  {
    type: "details",
    propSchema: { title: { default: "" }, body: { default: "" } },
    content: "none",
  },
  {
    render: ({ block, editor }) => (
      <div className="yyj-details">
        <div className="yyj-details-head" contentEditable={false}>
          <span className="yyj-details-arrow">▸</span>
          <input
            className="yyj-details-title"
            value={block.props.title}
            placeholder="点开看更多（写这里的标题）"
            onChange={(e) => editor.updateBlock(block, { props: { title: e.target.value } })}
          />
        </div>
        <textarea
          className="yyj-details-body"
          value={block.props.body}
          placeholder="折叠里的内容…"
          rows={Math.max(2, (block.props.body || "").split("\n").length)}
          onChange={(e) => editor.updateBlock(block, { props: { body: e.target.value } })}
        />
      </div>
    ),
  },
)

/** 视频嵌入：B 站 / YouTube */
function toEmbed(url) {
  if (!url) return ""
  const bili = url.match(/BV[a-zA-Z0-9]{10}/)
  if (bili) return `https://player.bilibili.com/player.html?bvid=${bili[0]}&high_quality=1&autoplay=0`
  const yt = url.match(/(?:youtu\.be\/|v=)([\w-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  return ""
}

export const Video = createReactBlockSpec(
  {
    type: "video",
    propSchema: { url: { default: "" } },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const src = toEmbed(block.props.url)
      return (
        <div className="yyj-video" contentEditable={false}>
          <input
            className="yyj-video-url"
            value={block.props.url}
            placeholder="粘贴 B 站或 YouTube 链接"
            onChange={(e) => editor.updateBlock(block, { props: { url: e.target.value } })}
          />
          {src ? (
            <div className="yyj-video-frame">
              <iframe src={src} allowFullScreen title="video" />
            </div>
          ) : (
            <div className="yyj-video-hint">粘贴链接后，这里会显示视频画面</div>
          )}
        </div>
      )
    },
  },
)

export { toEmbed }
