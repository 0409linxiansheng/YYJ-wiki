/* 云屿集：悬停预览 + 手机点击预览 + 反向链接 */
(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (window.__yyjPreviewReady) return
  window.__yyjPreviewReady = true

  const BASE = window.__YYJ_BASE__ || '/'
  const cache = new Map()
  let pop = null
  let hideTimer = null
  let shownFor = null

  const isMobile = () => window.matchMedia('(max-width: 800px)').matches

  function ensurePop() {
    if (pop && document.body.contains(pop)) return pop
    pop = document.createElement('div')
    pop.className = 'yyj-preview'
    pop.addEventListener('mouseenter', () => clearTimeout(hideTimer))
    pop.addEventListener('mouseleave', scheduleHide)
    document.body.appendChild(pop)
    return pop
  }

  function closePreview() {
    if (pop) pop.classList.remove('on')
    const mask = document.querySelector('.yyj-preview-mask')
    if (mask) mask.remove()
    shownFor = null
  }

  function scheduleHide() {
    if (isMobile()) return
    clearTimeout(hideTimer)
    hideTimer = setTimeout(() => pop && pop.classList.remove('on'), 160)
  }

  async function fetchDoc(url) {
    if (cache.has(url)) return cache.get(url)
    try {
      const res = await fetch(url, { headers: { Accept: 'text/html' } })
      const html = await res.text()
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const title = doc.querySelector('article h1, .markdown h1, h1')?.textContent?.trim() || url
      const body = doc.querySelector('article .markdown, .theme-doc-markdown, article')
      let bodyHtml = ''
      if (body) {
        const clone = body.cloneNode(true)
        clone
          .querySelectorAll(
            'script, style, .yyj-backlinks, .theme-doc-toc-mobile, .pagination-nav, nav, footer, .hash-link',
          )
          .forEach((n) => n.remove())
        bodyHtml = clone.innerHTML
      }
      const data = { title, html: bodyHtml }
      cache.set(url, data)
      return data
    } catch {
      return null
    }
  }

  function placeDesktop(anchor) {
    const el = ensurePop()
    el.classList.remove('sheet')
    el.classList.add('on')
    const r = anchor.getBoundingClientRect()
    const w = Math.min(480, window.innerWidth - 32)
    el.style.width = w + 'px'
    let left = r.left + window.scrollX
    if (left + w > window.scrollX + window.innerWidth - 16) {
      left = window.scrollX + window.innerWidth - w - 16
    }
    let top = r.bottom + window.scrollY + 8
    if (r.bottom + 320 > window.innerHeight) {
      top = r.top + window.scrollY - 8 - el.offsetHeight
    }
    el.style.left = Math.max(16, left) + 'px'
    el.style.top = Math.max(16, top) + 'px'
    return el
  }

  function placeSheet() {
    const el = ensurePop()
    el.classList.add('sheet', 'on')
    el.style.left = ''
    el.style.top = ''
    el.style.width = ''
    if (!document.querySelector('.yyj-preview-mask')) {
      const mask = document.createElement('div')
      mask.className = 'yyj-preview-mask'
      mask.addEventListener('click', closePreview)
      document.body.appendChild(mask)
    }
    return el
  }

  async function showPreview(anchor) {
    const href = anchor.getAttribute && anchor.getAttribute('href')
    if (!href || !href.startsWith('/') || href.startsWith('//')) return
    const url = href.split('#')[0]
    if (!url || url === location.pathname) return
    clearTimeout(hideTimer)
    const el = isMobile() ? placeSheet() : placeDesktop(anchor)
    el.innerHTML = '<div class="yyj-preview-loading">载入中…</div>'
    const data = await fetchDoc(url)
    if (!data) {
      closePreview()
      return
    }
    el.innerHTML = '<div class="yyj-preview-title"></div><div class="yyj-preview-body"></div>'
    el.querySelector('.yyj-preview-title').textContent = data.title
    const bodyEl = el.querySelector('.yyj-preview-body')
    if (data.html) bodyEl.innerHTML = data.html
    else bodyEl.textContent = '（这篇还没有正文）'
  }

  function isContentLink(a) {
    if (!a || !a.getAttribute) return false
    if (a.closest('.yyj-preview')) return false
    if (a.closest('.navbar, .footer, .menu, .pagination-nav, .yyj-backlinks')) return false
    return true
  }

  /* 桌面：悬停 */
  const PREVIEW_SELECTOR = 'a.yyj-wikilink[href^="/"]'

  document.addEventListener('mouseover', (e) => {
    if (isMobile()) return
    const a = e.target.closest && e.target.closest(PREVIEW_SELECTOR)
    if (!isContentLink(a)) return
    showPreview(a)
  })
  document.addEventListener('mouseout', (e) => {
    if (isMobile()) return
    if (e.target.closest && e.target.closest(PREVIEW_SELECTOR)) scheduleHide()
  })
  document.addEventListener('scroll', scheduleHide, { passive: true })

  /* 手机端不做预览：轻点直接进文章（保持原生行为） */

  /* 反向链接 */
  let index = null
  async function loadIndex() {
    if (index) return index
    try {
      index = await (await fetch(BASE + 'backlinks.json')).json()
    } catch {
      index = { by: {} }
    }
    return index
  }

  function contentHost() {
    return (
      document.querySelector('article .markdown') ||
      document.querySelector('.theme-doc-markdown') ||
      document.querySelector('article') ||
      document.querySelector('main')
    )
  }

  async function injectBacklinks(retry = 0) {
    const host = contentHost()
    if (!host) {
      if (retry < 8) setTimeout(() => injectBacklinks(retry + 1), 400)
      return
    }
    if (host.querySelector('.yyj-backlinks')) return
    const data = await loadIndex()
    const list = data?.by?.[location.pathname]
    if (!list || !list.length) {
      if (retry < 8) setTimeout(() => injectBacklinks(retry + 1), 400)
      return
    }
    const box = document.createElement('section')
    box.className = 'yyj-backlinks'
    const head = document.createElement('div')
    head.className = 'yyj-backlinks-head'
    head.textContent = '引用这篇的文章'
    box.appendChild(head)
    const ul = document.createElement('ul')
    for (const item of list) {
      const li = document.createElement('li')
      const a = document.createElement('a')
      a.href = item.url
      a.textContent = item.title || item.url
      li.appendChild(a)
      ul.appendChild(li)
    }
    box.appendChild(ul)
    host.appendChild(box)
  }

  let lastPath = ''
  function tick() {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname
      setTimeout(() => injectBacklinks(0), 300)
    }
  }
  new MutationObserver(tick).observe(document.documentElement, { childList: true, subtree: true })
  setTimeout(tick, 300)
  setTimeout(() => injectBacklinks(0), 900)
})()
