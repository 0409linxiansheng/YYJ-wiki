import { useEffect, useMemo, useRef, useState } from "react"
import { useCreateBlockNote, SuggestionMenuController, getDefaultReactSlashMenuItems } from "@blocknote/react"
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core"
import { Callout } from "./blocks/Callout.jsx"
import { Details, Video } from "./blocks/DetailsAndVideo.jsx"
import { Card, Steps } from "./blocks/CardAndSteps.jsx"
import { Tabs } from "./blocks/Tabs.jsx"
import { docToMarkdown, markdownToDoc } from "./markdown.js"
import { zh } from "@blocknote/core/locales"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/core/fonts/inter.css"
import "@blocknote/mantine/style.css"

/* ---------- 小工具 ---------- */
async function api(path, opts) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  })
  return res.json()
}

function splitFrontmatter(text) {
  if (!text.startsWith("---")) return { fm: "", body: text }
  const end = text.indexOf("\n---", 3)
  if (end < 0) return { fm: "", body: text }
  const fm = text.slice(0, end + 4)
  const body = text.slice(end + 4).replace(/^\s*\n/, "")
  return { fm, body }
}

function readFmField(fm, key) {
  const m = fm.match(new RegExp(`^${key}:\\s*(.*)$`, "m"))
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : ""
}

function setFmField(fm, key, value) {
  const line = `${key}: ${value}`
  if (!fm) return `---\n${line}\n---`
  if (new RegExp(`^${key}:`, "m").test(fm)) {
    return fm.replace(new RegExp(`^${key}:.*$`, "m"), line)
  }
  return fm.replace(/\n---$/, `\n${line}\n---`)
}

/* ---------- 组件面板 ---------- */
const CUSTOM_SLASH = [
  { label: "提示框", icon: "💡", type: "callout", props: { kind: "tip", title: "", body: "" } },
  { label: "折叠块", icon: "▸", type: "details", props: { title: "", body: "" } },
  { label: "卡片", icon: "▤", type: "card", props: { title: "", desc: "", image: "", href: "" } },
  { label: "步骤条", icon: "①", type: "steps", props: { body: "" } },
  {
    label: "标签页",
    icon: "▭",
    type: "tabs",
    props: { data: JSON.stringify([{ label: "标签一", body: "" }, { label: "标签二", body: "" }]) },
  },
  { label: "视频", icon: "▶", type: "video", props: { url: "" } },
]

const BLOCK_BUTTONS = [
  { label: "正文", icon: "¶", type: "paragraph" },
  { label: "二级标题", icon: "H2", type: "heading", props: { level: 2 } },
  { label: "三级标题", icon: "H3", type: "heading", props: { level: 3 } },
  { label: "无序列表", icon: "•", type: "bulletListItem" },
  { label: "有序列表", icon: "1.", type: "numberedListItem" },
  { label: "待办", icon: "☑", type: "checkListItem" },
  { label: "引用", icon: "❝", type: "quote" },
  { label: "代码块", icon: "{ }", type: "codeBlock" },
  { label: "表格", icon: "▦", type: "table" },
  { label: "图片", icon: "🖼", type: "image" },
  { label: "分割线", icon: "—", type: "paragraph", props: { _divider: true } },
  { label: "提示框", icon: "💡", type: "callout", props: { kind: "tip" } },
  { label: "折叠块", icon: "▸", type: "details" },
  { label: "视频", icon: "▶", type: "video" },
  { label: "卡片", icon: "▤", type: "card" },
  { label: "步骤条", icon: "①", type: "steps" },
  { label: "标签页", icon: "▭", type: "tabs" },
  { label: "链接文章", icon: "🔗", type: "wikilink" },
]

const DEMO = typeof location !== "undefined" && new URLSearchParams(location.search).has("demo")

const DEMO_DOC = [
  { type: "heading", props: { level: 1 }, content: "示例：一篇文章长什么样" },
  { type: "paragraph", content: "这是正文段落，点一下就能改字。" },
  { type: "callout", props: { kind: "tip", title: "提示标题", body: "这是提示框里的内容。" } },
  { type: "callout", props: { kind: "warning", title: "注意", body: "换一种颜色就是警告。" } },
  { type: "details", props: { title: "点开看更多", body: "折叠起来的内容写在这里。" } },
  { type: "video", props: { url: "" } },
  { type: "paragraph", content: "" },
]

export default function App() {
  const [state, setState] = useState(null)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [current, setCurrent] = useState(null) // {path, fm}
  const [title, setTitle] = useState("")
  const [dirty, setDirty] = useState(false)
  const [toast, setToast] = useState("")
  const [picker, setPicker] = useState(null) // { query }
  const [catPanel, setCatPanel] = useState(null) // { cats, slug, title, desc, err }
  const fmRef = useRef("")

  const schema = BlockNoteSchema.create({
    blockSpecs: { ...defaultBlockSpecs, callout: Callout, details: Details, video: Video, card: Card, steps: Steps, tabs: Tabs },
  })

  // 图片上传：BlockNote 的图片块会调用它（拖拽 / 粘贴 / 选择文件都会走这里）
  async function uploadFile(file) {
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(file)
    })
    const r = await api("/api/upload", {
      method: "POST",
      body: JSON.stringify({ name: file.name, dataUrl }),
    })
    if (!r.url) throw new Error(r.error || "上传失败")
    return r.url
  }

  const editor = useCreateBlockNote({
    dictionary: zh,
    schema,
    uploadFile,
    initialContent: DEMO ? DEMO_DOC : [{ type: "paragraph", content: "" }],
  })

  const flash = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(""), 2000)
  }

  const loadState = async () => {
    const s = await api("/api/state")
    setState(s)
  }

  useEffect(() => {
    if (DEMO) {
      if (new URLSearchParams(location.search).get("demo") === "md") {
        const sample = [
          "开头一段正文。",
          "",
          ":::danger",
          "这是提示框里的内容，应该能读出来。",
          ":::",
          "",
          "<Card title=\"示例卡片\" href=\"/kb/erpnext/\">一张卡片的说明文字。</Card>",
          "",
          "<Tabs>",
          '  <TabItem value="t1" label="Windows">先装 WSL。</TabItem>',
          '  <TabItem value="t2" label="macOS">用 Homebrew。</TabItem>',
          "</Tabs>",
          "",
          "<Steps>",
          "",
          "1. 装依赖",
          "2. 配环境",
          "3. 启动",
          "",
          "</Steps>",
          "",
          "<details>",
          "<summary>折叠标题</summary>",
          "",
          "折叠里的内容。",
          "",
          "</details>",
        ].join("\n")
        markdownToDoc(editor, sample).then((blocks) => {
          window.__dbg = JSON.parse(JSON.stringify(blocks))
          setTimeout(() => {
            docToMarkdown(editor).then((md) => (window.__md = md))
          }, 300)
          editor.replaceBlocks(editor.document, blocks.length ? blocks : [{ type: "paragraph", content: "" }])
        })
      }
      return
    }
    loadState()
  }, [])

  const tree = useMemo(() => {
    if (!state) return []
    const groups = []
    const docsByCat = {}
    for (const d of state.docs ?? []) {
      const cat = d.category ?? "未分类"
      ;(docsByCat[cat] ??= []).push(d)
    }
    for (const [cat, items] of Object.entries(docsByCat)) {
      groups.push({ title: cat, items })
    }
    if (state.blog?.length) groups.push({ title: "技术手记", items: state.blog })
    if (state.drafts?.length) groups.push({ title: "草稿", items: state.drafts })
    return groups
  }, [state])

  async function login() {
    setError("")
    const r = await api("/api/login", { method: "POST", body: JSON.stringify({ password }) })
    if (r.ok) {
      setPassword("")
      loadState()
    } else {
      setError(r.error || "密码不对")
    }
  }

  async function openDoc(item) {
    const r = await api(`/api/doc?path=${encodeURIComponent(item.path)}`)
    if (!r.content) return flash("读取失败")
    const { fm, body } = splitFrontmatter(r.content)
    fmRef.current = fm
    setTitle(readFmField(fm, "title") || item.title || "")
    const blocks = await markdownToDoc(editor, body)
    editor.replaceBlocks(editor.document, blocks.length ? blocks : [{ type: "paragraph", content: "" }])
    setCurrent({ path: item.path })
    setDirty(false)
  }

  async function save() {
    if (!current) return
    const md = await docToMarkdown(editor)
    let fm = fmRef.current
    if (title) fm = setFmField(fm, "title", title)
    const content = `${fm}\n\n${md}`
    const r = await api("/api/doc/save", {
      method: "POST",
      body: JSON.stringify({ path: current.path, content }),
    })
    if (r.ok) {
      setDirty(false)
      flash("已保存")
      loadState()
    } else {
      flash("保存失败：" + (r.error || ""))
    }
  }

  async function publish() {
    await save()
    const r = await api("/api/publish", { method: "POST", body: JSON.stringify({ message: "" }) })
    flash(r.ok ? "已发布，等构建完成" : "发布失败：" + (r.output || r.error || ""))
  }

  async function createDoc(kind, category) {
    const name = window.prompt("新文章标题？")
    if (!name) return
    const r = await api("/api/doc/create", {
      method: "POST",
      body: JSON.stringify({ kind, category, title: name, draft: true }),
    })
    if (r.ok) {
      await loadState()
      openDoc({ path: r.path, title: name })
    } else {
      flash("创建失败")
    }
  }

  /** docs/about/index.mdx → about/index；blog/xxx/index.mdx → blog/xxx */
  function wikiPath(p) {
    return String(p)
      .replace(/^docs\//, '')
      .replace(/^blog\//, 'blog/')
      .replace(/\/index\.mdx?$/i, '')
      .replace(/\.mdx?$/i, '')
  }

  function insertWikiLink(item) {
    const path = wikiPath(item.path)
    const label = item.title || path
    editor.insertInlineContent([{ type: "text", text: `[[${path}|${label}]]` }])
    setPicker(null)
    setDirty(true)
  }

  function insertBlock(btn) {
    const cursor = editor.getTextCursorPosition()
    const ref = cursor?.block ?? editor.document[editor.document.length - 1]
    if (btn.props?._divider) {
      editor.insertBlocks([{ type: "paragraph", content: "" }], ref, "after")
      return
    }
    if (btn.type === "details") {
      editor.insertBlocks([{ type: "details", props: { title: "", body: "" } }], ref, "after")
      return
    }
    if (btn.type === "wikilink") {
      setPicker({ query: "" })
      return
    }
    if (btn.type === "tabs") {
      editor.insertBlocks([{ type: "tabs", props: { data: JSON.stringify([{ label: "标签一", body: "" }, { label: "标签二", body: "" }]) } }], ref, "after")
      return
    }
    if (btn.type === "card") {
      editor.insertBlocks([{ type: "card", props: { title: "", desc: "", image: "", href: "" } }], ref, "after")
      return
    }
    if (btn.type === "steps") {
      editor.insertBlocks([{ type: "steps", props: { body: "" } }], ref, "after")
      return
    }
    if (btn.type === "video") {
      editor.insertBlocks([{ type: "video", props: { url: "" } }], ref, "after")
      return
    }
    if (btn.type === "callout") {
      editor.insertBlocks([{ type: "callout", props: { kind: "tip", title: "", body: "" } }], ref, "after")
      return
    }
    // 表格需要一个完整的初始结构，不能空插
    if (btn.type === "table") {
      editor.insertBlocks(
        [
          {
            type: "table",
            content: {
              type: "tableContent",
              rows: [
                { cells: ["", ""] },
                { cells: ["", ""] },
              ],
            },
          },
        ],
        ref,
        "after",
      )
      return
    }

    const block = {
      type: btn.type,
      props: btn.props ?? {},
      content: btn.type === "paragraph" || btn.type === "heading" ? "" : undefined,
    }
    editor.insertBlocks([block], ref, "after")
  }

  /* ---------- 渲染 ---------- */
  if (DEMO) {
    return (
      <div className="app">
        <aside className="tree">
          <div className="tree-head">文章（示例）</div>
          <div className="group"><div className="group-title">知识库</div>
            <button className="item on">什么是 ERPNext</button>
            <button className="item">安装概览</button>
          </div>
        </aside>
        <main className="editor">
          <div className="bar">
            <input className="title-input" defaultValue="示例：一篇文章长什么样" />
            <span className="path">demo</span>
          </div>
          <div className="editor-body">
            <BlockNoteView editor={editor} theme="light" />
          </div>
        </main>
        <aside className="palette">
          <div className="palette-head">插入</div>
          {BLOCK_BUTTONS.map((b) => (
            <button key={b.label} onClick={() => insertBlock(b)}>
              <span className="ic">{b.icon}</span>
              {b.label}
            </button>
          ))}
        </aside>
      </div>
    )
  }

  if (!state) return <div className="boot">正在连接写作台…</div>

  if (state.needsSetup) {
    return (
      <div className="login">
        <h1>写作台初始化</h1>
        <p>第一次使用，先设置一个密码。</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="设置密码"
        />
        <button onClick={async () => {
          const r = await api("/api/setup", { method: "POST", body: JSON.stringify({ password }) })
          if (r.ok) loadState()
          else setError(r.error || "设置失败")
        }}>保存密码</button>
        {error && <p className="err">{error}</p>}
      </div>
    )
  }

  if (!state.authed) {
    return (
      <div className="login">
        <h1>云屿集 · 写作台</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
          placeholder="密码"
          autoFocus
        />
        <button onClick={login}>进入</button>
        {error && <p className="err">{error}</p>}
      </div>
    )
  }

  return (
    <div className="app">
      <aside className="tree">
        <div className="tree-head">文章</div>
        {tree.map((g) => (
          <div key={g.title} className="group">
            <div className="group-title">{g.title}</div>
            {g.items.map((it) => (
              <button
                key={it.path}
                className={`item ${current?.path === it.path ? "on" : ""}`}
                onClick={() => openDoc(it)}
              >
                {it.title || it.path}
              </button>
            ))}
          </div>
        ))}
        <div className="tree-actions">
          <button onClick={() => createDoc("doc", window.prompt("放到哪个分类？（如 about、erpnext）") || "about")}>
            + 知识库文章
          </button>
          <button onClick={() => createDoc("blog")}>+ 技术手记</button>
          <button
            onClick={async () => {
              const r = await api("/api/categories")
              const cats = Array.isArray(r.categories) ? r.categories : []
              setCatPanel({ cats, parent: "", slug: "", title: "", desc: "", err: "" })
            }}>
            分类管理
          </button>
        </div>
      </aside>

      <main className="editor">
        {!current ? (
          <div className="empty">左边选一篇文章，或者新建一篇</div>
        ) : (
          <>
            <div className="bar">
              <input
                className="title-input"
                value={title}
                placeholder="文章标题"
                onChange={(e) => {
                  setTitle(e.target.value)
                  setDirty(true)
                }}
              />
              <span className="path">{current.path}</span>
              <button onClick={save} className={dirty ? "primary" : ""}>保存</button>
              <button onClick={publish}>发布</button>
              <button
                onClick={async () => {
                  const oldPassword = window.prompt("当前密码")
                  if (!oldPassword) return
                  const newPassword = window.prompt("新密码（至少 6 位）")
                  if (!newPassword) return
                  const r = await api("/api/password", {
                    method: "POST",
                    body: JSON.stringify({ oldPassword, newPassword }),
                  })
                  flash(r.ok ? "密码已修改" : r.error || "修改失败")
                }}>
                改密码
              </button>
              <button
                onClick={async () => {
                  if (!window.confirm(`删除《${title || current.path}》？不可恢复（git 里还能找回）`)) return
                  const r = await api("/api/doc/delete", {
                    method: "POST",
                    body: JSON.stringify({ path: current.path }),
                  })
                  if (r.ok) {
                    setCurrent(null)
                    setTitle("")
                    flash("已删除")
                    loadState()
                  } else flash("删除失败")
                }}>
                删除
              </button>
            </div>
            <div className="editor-body" onChange={() => setDirty(true)}>
              <BlockNoteView editor={editor} theme="light" onChange={() => setDirty(true)}>
                <SuggestionMenuController
                  triggerCharacter="/"
                  getItems={async (query) => {
                    const defaults = getDefaultReactSlashMenuItems(editor)
                    const custom = CUSTOM_SLASH.map((c) => ({
                      title: c.label,
                      subtext: "云屿集组件",
                      group: "云屿集组件",
                      icon: <span>{c.icon}</span>,
                      onItemClick: () => {
                        const cursor = editor.getTextCursorPosition()
                        editor.insertBlocks([{ type: c.type, props: c.props }], cursor.block, "after")
                      },
                    }))
                    const all = [...defaults, ...custom]
                    const q = query.trim()
                    return q ? all.filter((i) => i.title.includes(q)) : all
                  }}
                />
              </BlockNoteView>
            </div>
          </>
        )}
      </main>

      <aside className="palette">
        <div className="palette-head">插入</div>
        {BLOCK_BUTTONS.map((b) => (
          <button key={b.label} onClick={() => insertBlock(b)} title={b.label}>
            <span className="ic">{b.icon}</span>
            {b.label}
          </button>
        ))}
      </aside>

      {picker && (
        <div className="picker-mask" onClick={() => setPicker(null)}>
          <div className="picker" onClick={(e) => e.stopPropagation()}>
            <div className="picker-head">
              <span>插入文章链接</span>
              <input
                autoFocus
                value={picker.query}
                placeholder="搜标题或路径…"
                onChange={(e) => setPicker({ query: e.target.value })}
              />
              <button onClick={() => setPicker(null)}>×</button>
            </div>
            <div className="picker-list">
              {[...(state.docs ?? []), ...(state.blog ?? [])]
                .filter((it) => {
                  const q = picker.query.trim().toLowerCase()
                  if (!q) return true
                  return (
                    String(it.title || "").toLowerCase().includes(q) ||
                    String(it.path || "").toLowerCase().includes(q)
                  )
                })
                .map((it) => (
                  <button key={it.path} className="picker-item" onClick={() => insertWikiLink(it)}>
                    <span className="picker-title">{it.title || it.path}</span>
                    <span className="picker-path">{wikiPath(it.path)}</span>
                  </button>
                ))}
              {(state.docs ?? []).length + (state.blog ?? []).length === 0 && (
                <div className="picker-empty">还没有文章</div>
              )}
            </div>
          </div>
        </div>
      )}

      {catPanel && (
        <div className="picker-mask" onClick={() => setCatPanel(null)}>
          <div className="picker" onClick={(e) => e.stopPropagation()}>
            <div className="picker-head">
              <span>分类管理 · 知识库</span>
              <button onClick={() => setCatPanel(null)}>×</button>
            </div>

            <div style={{ padding: '10px 14px', borderBottom: '1px solid #e4e4e7' }}>
              <div className="cat-form">
                <input
                  placeholder="上级目录（留空=一级分类；如 kb）"
                  value={catPanel.parent || ""}
                  onChange={(e) => setCatPanel({ ...catPanel, parent: e.target.value, err: "" })}
                />
                <input
                  placeholder="英文标识（如 docker）"
                  value={catPanel.slug}
                  onChange={(e) => setCatPanel({ ...catPanel, slug: e.target.value, err: "" })}
                />
                <input
                  placeholder="显示名称（如 Docker 教程）"
                  value={catPanel.title}
                  onChange={(e) => setCatPanel({ ...catPanel, title: e.target.value })}
                />
                <input
                  placeholder="一句话说明（可空）"
                  value={catPanel.desc}
                  onChange={(e) => setCatPanel({ ...catPanel, desc: e.target.value })}
                />
                <button
                  className="cat-create"
                  onClick={async () => {
                    const slug = catPanel.slug.trim().toLowerCase()
                    if (!/^[a-z0-9-]+$/.test(slug)) {
                      setCatPanel({ ...catPanel, err: "英文标识只能用 a-z、0-9、连字符" })
                      return
                    }
                    const r = await api("/api/category/create", {
                      method: "POST",
                      body: JSON.stringify({
                        parent: (catPanel.parent || "").trim(),
                        slug,
                        title: catPanel.title || slug,
                        desc: catPanel.desc,
                      }),
                    })
                    if (!r.ok) {
                      setCatPanel({ ...catPanel, err: r.error || "创建失败" })
                      return
                    }
                    const list = await api("/api/categories")
                    setCatPanel({ cats: list.categories ?? [], slug: "", title: "", desc: "", err: "" })
                    loadState()
                    flash(`分类 ${slug} 已创建`)
                  }}>
                  新建
                </button>
              </div>
              {catPanel.err && <div className="cat-err">{catPanel.err}</div>}
            </div>

            <div className="picker-list">
              {catPanel.cats.length === 0 && <div className="picker-empty">还没有分类</div>}
              {catPanel.cats.map((c) => (
                <div key={c} className="cat-row">
                  <span className="picker-title" style={{ paddingLeft: (c.split("/").length - 1) * 16 }}>
                    {c}
                  </span>
                  <span className="picker-path">docs/{c}</span>
                  <button
                    className="cat-del" title="删除这个分类"
                    onClick={async () => {
                      if (!window.confirm(`删除分类「${c}」及其下所有文章？`)) return
                      const r = await api("/api/category/delete", {
                        method: "POST",
                        body: JSON.stringify({ path: c }),
                      })
                      if (!r.ok) return flash(r.error || "删除失败")
                      const list = await api("/api/categories")
                      setCatPanel({ ...catPanel, cats: list.categories ?? [] })
                      loadState()
                      flash("已删除")
                    }}>
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
