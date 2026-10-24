import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** 内容文件 → 站点地址（docs 在根路径、blog 带 /blog/；trailingSlash: false） */
function urlOf(rel, base) {
  const isBlog = rel.startsWith('blog/')
  let p = rel
    .replace(/^docs\//, '')
    .replace(/^blog\//, '')
    .replace(/\.mdx?$/i, '')
    .replace(/\/index$/, '')
  if (isBlog) return `${base}blog/${p.split('/')[0]}`
  return p ? `${base}${p}` : base.replace(/\/$/, '')
}

function titleOf(text, fallback) {
  const fm = text.match(/^---\n([\s\S]*?)\n---/)
  if (fm) {
    const m = fm[1].match(/^title:\s*(.+)$/m)
    if (m) return m[1].trim().replace(/^['"]|['"]$/g, '')
  }
  const h1 = text.match(/^#\s+(.+)$/m)
  if (h1) return h1[1].trim()
  return fallback
}

function linksIn(text, base) {
  const out = new Set()
  let m
  const wiki = /\[\[([^[\]|]+)(?:\|[^[\]]+)?\]\]/g
  while ((m = wiki.exec(text))) {
    let t = m[1].trim().replace(/\.mdx?$/i, '').replace(/\/+$/, '')
    if (t.startsWith('/')) t = t.slice(1)
    t = t.replace(/\/index$/, '')
    if (t) out.add(`${base}${t}`)
  }
  // 站内绝对链接（含 base 前缀的才收）
  const md = /\]\(([^)\s#]+)\)/g
  while ((m = md.exec(text))) {
    let u = m[1]
    if (!u.startsWith('/') || u.startsWith('//')) continue
    if (/\.(png|jpe?g|svg|webp|gif|pdf|zip)$/i.test(u)) continue
    const full = u.startsWith(base) ? u : base + u.replace(/^\//, '')
    out.add(full.replace(/\/+$/, ''))
  }
  return [...out]
}

function walk(dir, base, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      if (name === 'node_modules' || name.startsWith('.')) continue
      walk(full, base, out)
    } else if (/\.mdx?$/i.test(name)) {
      out.push({ full, rel: path.relative(base, full).split(path.sep).join('/') })
    }
  }
  return out
}

export default function yyjBacklinksPlugin() {
  return {
    name: 'yyj-backlinks',
    getClientModules() {
      return [fileURLToPath(new URL('../../src/clientModules/yyj-preview.js', import.meta.url))]
    },
    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'script',
            innerHTML: `window.__YYJ_BASE__=${JSON.stringify(
              process.env.DOCUSAURUS_BASE_URL || '/YYJ-wiki/',
            )};`,
          },
        ],
      }
    },
    async postBuild({ siteDir, outDir, siteConfig }) {
      const base = siteConfig?.baseUrl || '/YYJ-wiki/'
      const files = [
        ...walk(path.join(siteDir, 'docs'), siteDir),
        ...walk(path.join(siteDir, 'blog'), siteDir),
      ]

      const selfUrl = new Map()
      for (const f of files) selfUrl.set(f.rel, urlOf(f.rel, base))

      const by = {}
      for (const f of files) {
        const text = fs.readFileSync(f.full, 'utf8')
        const fromUrl = selfUrl.get(f.rel)
        const title = titleOf(text, fromUrl)
        for (const target of linksIn(text, base)) {
          if (target === fromUrl) continue
          ;(by[target] ??= []).push({ title, url: fromUrl })
        }
      }

      fs.writeFileSync(
        path.join(outDir, 'backlinks.json'),
        JSON.stringify({ generatedAt: new Date().toISOString(), base, by }),
      )
      console.log(`[yyj-backlinks] ${files.length} 篇 / ${Object.keys(by).length} 个被引用页面`)
    },
  }
}
