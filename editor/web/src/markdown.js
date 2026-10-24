/**
 * Markdown ⇄ BlockNote 文档转换。
 *
 * 标准内容交给 BlockNote 自带的解析/序列化；
 * 自定义块（提示框）单独处理，序列化成 Docusaurus 的 admonition 语法：
 *   :::tip[标题]
 *   内容
 *   :::
 */

const ADMONITION = /^:::(\w+)(?:\[([^\]]*)\])?\s*$/
const IFRAME = /^<iframe\s+src="([^"]+)"/i


function inlineOf(block) {
  const out = []
  const push = (c) => {
    if (!c) return
    if (typeof c === "string") {
      if (c.trim()) out.push({ type: "text", text: c, styles: {} })
      return
    }
    if (Array.isArray(c)) {
      for (const item of c) {
        if (!item) continue
        if (typeof item === "string") {
          if (item.trim()) out.push({ type: "text", text: item, styles: {} })
        } else out.push(item)
      }
    }
  }
  push(block.content)
  if (Array.isArray(block.children)) {
    for (const child of block.children) push(child?.content)
  }
  return out
}

/** 文档 → Markdown */
export async function docToMarkdown(editor) {
  const out = []
  let buf = []

  const flush = async () => {
    if (!buf.length) return
    const md = await editor.blocksToMarkdownLossy(buf)
    if (md.trim()) out.push(md.trim())
    buf = []
  }

  for (const block of editor.document) {
    if (block.type === "details") {
      await flush()
      const body = (block.props.body || "").trim()
      out.push(`<details>\n<summary>${block.props.title || "展开"}</summary>\n\n${body}\n\n</details>`)
      continue
    }

    if (block.type === "tabs") {
      await flush()
      let items = []
      try { items = JSON.parse(block.props.data || "[]") } catch { items = [] }
      if (items.length) {
        const body = items
          .map((it, i) => `  <TabItem value="t${i + 1}" label="${(it.label || `标签${i + 1}`).replace(/"/g, "&quot;")}">${(it.body || "").replace(/\n+/g, " ").trim()}</TabItem>`)
          .join("\n")
        out.push(`<Tabs>\n${body}\n</Tabs>`)
      }
      continue
    }

    if (block.type === "card") {
      await flush()
      const attrs = []
      if (block.props.title) attrs.push(`title="${block.props.title.replace(/"/g, "&quot;")}"`)
      if (block.props.href) attrs.push(`href="${block.props.href}"`)
      if (block.props.image) attrs.push(`image="${block.props.image}"`)
      const desc = (block.props.desc || "").replace(/\n+/g, " ").trim()
      out.push(`<Card ${attrs.join(" ")}>${desc}</Card>`)
      continue
    }

    if (block.type === "steps") {
      await flush()
      const lines = (block.props.body || "").split("\n").map((l) => l.trim()).filter(Boolean)
      if (lines.length) {
        const list = lines.map((l, i) => `${i + 1}. ${l}`).join("\n")
        out.push(`<Steps>\n\n${list}\n\n</Steps>`)
      }
      continue
    }

    if (block.type === "video") {
      await flush()
      const src = block.props.url || ""
      if (src) out.push(`<iframe src="${src}" allowfullscreen></iframe>`)
      continue
    }

    if (block.type === "callout") {
      await flush()
      const body = (block.props.body || "").trim()
      const head = `:::${block.props.kind}${block.props.title ? `[${block.props.title}]` : ""}`
      out.push(`${head}\n${body}\n:::`)
    } else {
      buf.push(block)
    }
  }
  await flush()
  return out.join("\n\n")
}

/** Markdown → 文档 */
export async function markdownToDoc(editor, md) {
  const lines = md.split("\n")
  const blocks = []
  let buf = []

  const flush = async () => {
    const text = buf.join("\n").trim()
    buf = []
    if (!text) return
    const parsed = await editor.tryParseMarkdownToBlocks(text)
    blocks.push(...parsed)
  }

  for (let i = 0; i < lines.length; i++) {
    // 折叠块
    if (lines[i].trim().startsWith("<details")) {
      await flush()
      const body = []
      let title = "展开"
      i++
      if (lines[i] && lines[i].trim().startsWith("<summary")) {
        title = lines[i].replace(/<\/?summary>/g, "").trim()
        i++
      }
      while (i < lines.length && !lines[i].includes("</details>")) {
        body.push(lines[i])
        i++
      }
      blocks.push({ type: "details", props: { title, body: body.join("\n").trim() } })
      continue
    }

    // 标签页
    if (lines[i].trim().startsWith("<Tabs")) {
      await flush()
      const body = []
      i++
      while (i < lines.length && !lines[i].includes("</Tabs>")) {
        body.push(lines[i])
        i++
      }
      const items = []
      for (const line of body) {
        const m = line.match(/<TabItem[^>]*label="([^"]*)"[^>]*>([\s\S]*)<\/TabItem>/)
        if (m) items.push({ label: m[1], body: m[2].trim() })
      }
      blocks.push({ type: "tabs", props: { data: JSON.stringify(items.length ? items : [{ label: "标签一", body: "" }]) } })
      continue
    }

    // 卡片（单行）
    const card = lines[i].match(/^<Card(?:\s+([^>]*))?>([\s\S]*)<\/Card>\s*$/)
    if (card) {
      await flush()
      const attrs = card[1] || ""
      const pick = (k) => {
        const m = attrs.match(new RegExp(`${k}="([^"]*)"`))
        return m ? m[1] : ""
      }
      blocks.push({
        type: "card",
        props: { title: pick("title"), href: pick("href"), image: pick("image"), desc: card[2].trim() },
      })
      continue
    }

    // 步骤条
    if (lines[i].trim().startsWith("<Steps")) {
      await flush()
      const body = []
      i++
      while (i < lines.length && !lines[i].includes("</Steps>")) {
        body.push(lines[i])
        i++
      }
      const items = body
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.replace(/^\d+[.)]\s*/, ""))
      blocks.push({ type: "steps", props: { body: items.join("\n") } })
      continue
    }

    // 视频嵌入
    const iframe = lines[i].match(IFRAME)
    if (iframe) {
      await flush()
      blocks.push({ type: "video", props: { url: iframe[1] } })
      continue
    }

    const m = lines[i].match(ADMONITION)
    if (m) {
      await flush()
      const body = []
      i++
      while (i < lines.length && lines[i].trim() !== ":::") {
        body.push(lines[i])
        i++
      }
      blocks.push({ type: "callout", props: { kind: m[1], title: m[2] ?? "", body: body.join("\n").trim() } })
    } else {
      buf.push(lines[i])
    }
  }
  await flush()
  return blocks
}
