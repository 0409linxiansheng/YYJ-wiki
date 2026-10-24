/**
 * Remark 插件：把 Obsidian 双链 [[路径]] / [[路径|文字]] 转成站内链接。
 *
 * 站点 baseUrl 形如 /YYJ-wiki/，trailingSlash: false，
 * 所以 [[about/index]] → /YYJ-wiki/about
 */

function normalizeTarget(raw, isBlog, base) {
  let t = String(raw || '').trim()
  t = t.replace(/\.mdx?$/i, '').replace(/\/+$/, '')
  if (t.startsWith('/')) t = t.slice(1)
  if (isBlog) {
    const p = t.replace(/^blog\//, '')
    return `${base}blog/${p}`.replace(/\/+$/, '')
  }
  t = t.replace(/\/index$/, '')
  return t ? `${base}${t}`.replace(/\/+$/, '') : base.replace(/\/$/, '')
}

function labelOf(target) {
  const parts = String(target).split('/').filter(Boolean)
  const last = parts[parts.length - 1] || String(target)
  return last === 'index' ? parts[parts.length - 2] || last : last
}

const WIKI = /\[\[([^[\]|]+)(?:\|([^[\]]+))?\]\]/g

function splitTextNode(value) {
  const out = []
  let last = 0
  let m
  WIKI.lastIndex = 0
  while ((m = WIKI.exec(value))) {
    if (m.index > last) out.push({ type: 'text', value: value.slice(last, m.index) })
    out.push({ type: 'wiki', target: m[1], label: m[2] || '' })
    last = m.index + m[0].length
  }
  if (!out.length) return null
  if (last < value.length) out.push({ type: 'text', value: value.slice(last) })
  return out
}

function walk(node, isBlog, base) {
  if (!node.children) return
  const next = []
  for (const child of node.children) {
    if (child.type === 'text') {
      const parts = splitTextNode(child.value || '')
      if (!parts) {
        next.push(child)
        continue
      }
      for (const part of parts) {
        if (part.type === 'wiki') {
          next.push({
            type: 'link',
            url: normalizeTarget(part.target, isBlog, base),
            // 打个标记：只有双链（[[...]]）出来的链接才有悬停预览
            data: { hProperties: { className: ['yyj-wikilink'] } },
            children: [{ type: 'text', value: part.label || labelOf(part.target) }],
          })
        } else {
          next.push(part)
        }
      }
    } else {
      walk(child, isBlog, base)
      next.push(child)
    }
  }
  node.children = next
}

export default function remarkWikilinks(options = {}) {
  const base = options.base || '/'
  return (tree, file) => {
    const p = file?.path || ''
    walk(tree, p.includes('/blog/'), base)
  }
}
