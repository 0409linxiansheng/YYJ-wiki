/* 云屿集 · 块编辑器（可视化层）
   参考 Notion / Editor.js / Milkdown 的块模型：
   每个块是一个独立的可编辑单元，块级组件按站点真实样式渲染。 */
(function () {
  const B = () => window.Blocks;
  let state = null, hooks = null, blocks = [], fm = null, renderTimer = null;

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  function scheduleSync() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => {
      if (!hooks) return;
      const md = B().serializeBlocks({frontMatter: fm, blocks});
      hooks.onChange(md);
    }, 200);
  }

  /* ---------- 各类块的渲染 ---------- */
  function editText(text, cls, onChange, placeholder) {
    const n = el('div', 'be-text ' + (cls || ''));
    n.contentEditable = 'true';
    n.spellcheck = false;
    n.dataset.placeholder = placeholder || '';
    n.textContent = text || '';
    n.addEventListener('input', () => onChange(n.innerText));
    n.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); n.blur(); } });
    return n;
  }

  const RENDER = {
    heading: (b, i) => {
      const n = el('div', 'be-block be-heading be-h' + b.level);
      n.appendChild(editText(b.text, '', (v) => { b.text = v; scheduleSync(); }, '标题'));
      return n;
    },
    paragraph: (b, i) => {
      const n = el('div', 'be-block be-para');
      n.appendChild(editText(b.text, '', (v) => { b.text = v; scheduleSync(); }, '写点什么…'));
      return n;
    },
    code: (b, i) => {
      const n = el('div', 'be-block be-code');
      const bar = el('div', 'be-code-bar');
      const lang = el('input', 'be-lang');
      lang.value = b.lang || '';
      lang.placeholder = '语言';
      lang.oninput = () => { b.lang = lang.value.trim(); scheduleSync(); };
      bar.appendChild(lang);
      if (b.title) { const t = el('span', 'be-code-title', b.title); bar.appendChild(t); }
      n.appendChild(bar);
      const pre = el('pre', 'be-code-body');
      const code = el('div', 'be-code-inner');
      code.contentEditable = 'true';
      code.spellcheck = false;
      code.textContent = b.code || '';
      code.addEventListener('input', () => { b.code = code.innerText; scheduleSync(); });
      pre.appendChild(code);
      n.appendChild(pre);
      return n;
    },
    admonition: (b, i) => {
      const n = el('div', 'be-block be-adm be-adm-' + b.kind);
      const head = el('div', 'be-adm-head');
      const sel = el('select', 'be-adm-kind');
      ['note', 'tip', 'info', 'caution', 'warning', 'danger'].forEach((k) => {
        const o = el('option'); o.value = k; o.textContent = k; sel.appendChild(o);
      });
      sel.value = b.kind;
      sel.onchange = () => { b.kind = sel.value; render(); scheduleSync(); };
      head.appendChild(sel);
      head.appendChild(editText(b.title, 'be-adm-title', (v) => { b.title = v; scheduleSync(); }, '标题'));
      n.appendChild(head);
      n.appendChild(editText(b.body, 'be-adm-body', (v) => { b.body = v; scheduleSync(); }, '内容'));
      return n;
    },
    table: (b, i) => {
      const n = el('div', 'be-block be-table');
      const t = el('table');
      const build = () => {
        t.innerHTML = '';
        const thead = el('thead'), tr = el('tr');
        (b.head || []).forEach((h, ci) => {
          const th = el('th');
          th.contentEditable = 'true';
          th.textContent = h;
          th.oninput = () => { b.head[ci] = th.innerText; scheduleSync(); };
          tr.appendChild(th);
        });
        thead.appendChild(tr);
        t.appendChild(thead);
        const tbody = el('tbody');
        (b.rows || []).forEach((row, ri) => {
          const r = el('tr');
          row.forEach((cell, ci) => {
            const td = el('td');
            td.contentEditable = 'true';
            td.textContent = cell;
            td.oninput = () => { b.rows[ri][ci] = td.innerText; scheduleSync(); };
            r.appendChild(td);
          });
          tbody.appendChild(r);
        });
        t.appendChild(tbody);
      };
      build();
      const tools = el('div', 'be-table-tools');
      const addRow = el('button', '', '+ 行');
      addRow.onclick = () => { (b.rows = b.rows || []).push((b.head || []).map(() => '')); render(); scheduleSync(); };
      const addCol = el('button', '', '+ 列');
      addCol.onclick = () => {
        b.head = [...(b.head || []), '列'];
        b.rows = (b.rows || []).map((r) => [...r, '']);
        render(); scheduleSync();
      };
      tools.appendChild(addRow); tools.appendChild(addCol);
      n.appendChild(t); n.appendChild(tools);
      return n;
    },
    list: (b, i) => {
      const n = el('div', 'be-block be-list');
      (b.items || []).forEach((it, idx) => {
        const row = el('div', 'be-list-row');
        const bullet = el('span', 'be-bullet', b.ordered ? (idx + 1) + '.' : '•');
        row.appendChild(bullet);
        row.appendChild(editText(it, '', (v) => { b.items[idx] = v; scheduleSync(); }, '列表项'));
        n.appendChild(row);
      });
      const add = el('button', 'be-add', '+ 列表项');
      add.onclick = () => { (b.items = b.items || []).push(''); render(); scheduleSync(); };
      n.appendChild(add);
      return n;
    },
    quote: (b, i) => {
      const n = el('div', 'be-block be-quote');
      n.appendChild(editText(b.text, '', (v) => { b.text = v; scheduleSync(); }, '引用'));
      return n;
    },
    image: (b, i) => {
      const n = el('div', 'be-block be-image');
      const img = el('img');
      img.src = b.src; img.alt = b.alt || '';
      img.onerror = () => { img.style.display = 'none'; };
      n.appendChild(img);
      const row = el('div', 'be-image-row');
      const alt = el('input', 'be-input'); alt.value = b.alt || ''; alt.placeholder = '说明';
      alt.oninput = () => { b.alt = alt.value; scheduleSync(); };
      const src = el('input', 'be-input'); src.value = b.src || ''; src.placeholder = '/img/xxx.png';
      src.oninput = () => { b.src = src.value; img.src = src.value; scheduleSync(); };
      row.appendChild(alt); row.appendChild(src);
      n.appendChild(row);
      return n;
    },
    details: (b, i) => {
      const n = el('div', 'be-block be-details');
      const sum = el('div', 'be-details-sum');
      sum.appendChild(editText(b.summary, '', (v) => { b.summary = v; scheduleSync(); }, '折叠标题'));
      n.appendChild(sum);
      n.appendChild(editText(b.body, 'be-details-body', (v) => { b.body = v; scheduleSync(); }, '折叠内容'));
      return n;
    },
    raw: (b, i) => {
      const n = el('div', 'be-block be-raw');
      n.appendChild(el('div', 'be-raw-tag', 'MDX / 原始块'));
      n.appendChild(editText(b.text, 'be-raw-body', (v) => { b.text = v; scheduleSync(); }, '原始语法'));
      return n;
    },
  };

  /* ---------- 块操作条 ---------- */
  function actions(b, i) {
    const bar = el('div', 'be-actions');
    const mk = (label, title, fn) => {
      const btn = el('button', '', label);
      btn.title = title;
      btn.onclick = (e) => { e.stopPropagation(); fn(); };
      return btn;
    };
    bar.appendChild(mk('↑', '上移', () => { if (i > 0) { const [x] = blocks.splice(i, 1); blocks.splice(i - 1, 0, x); render(); scheduleSync(); } }));
    bar.appendChild(mk('↓', '下移', () => { if (i < blocks.length - 1) { const [x] = blocks.splice(i, 1); blocks.splice(i + 1, 0, x); render(); scheduleSync(); } }));
    bar.appendChild(mk('⧉', '复制', () => { blocks.splice(i + 1, 0, JSON.parse(JSON.stringify(b))); render(); scheduleSync(); }));
    bar.appendChild(mk('✕', '删除', () => { blocks.splice(i, 1); render(); scheduleSync(); }));
    return bar;
  }

  /* ---------- 主渲染 ---------- */
  function render() {
    const area = document.getElementById('blockArea');
    if (!area) return;
    area.innerHTML = '';
    if (!blocks.length) {
      area.appendChild(el('div', 'be-empty', '点上方工具栏插入一个块开始写作'));
      return;
    }
    blocks.forEach((b, i) => {
      const wrap = el('div', 'be-wrap');
      const node = (RENDER[b.type] || RENDER.raw)(b, i);
      wrap.appendChild(node);
      wrap.appendChild(actions(b, i));
      area.appendChild(wrap);
    });
  }

  const NEW_BLOCKS = {
    heading: () => ({type: 'heading', level: 2, text: ''}),
    paragraph: () => ({type: 'paragraph', text: ''}),
    code: () => ({type: 'code', lang: 'bash', title: '', code: ''}),
    admonition: () => ({type: 'admonition', kind: 'tip', title: '提示', body: ''}),
    table: () => ({type: 'table', head: ['列一', '列二'], rows: [['', '']]}),
    list: () => ({type: 'list', ordered: false, items: ['']}),
    quote: () => ({type: 'quote', text: ''}),
    image: () => ({type: 'image', alt: '', src: ''}),
    details: () => ({type: 'details', summary: '展开', body: ''}),
    mermaid: () => ({type: 'code', lang: 'mermaid', title: '', code: 'graph TD\n  A[开始] --> B[结束]'}),
    math: () => ({type: 'paragraph', text: '$$\nE = mc^2\n$$'}),
  };

  /* ---------- 对外接口 ---------- */
  window.BlockEditor = {
    mount(container, options) {
      hooks = options;
      container.innerHTML = '';
      const bar = el('div', 'be-toolbar');
      const items = [
        ['heading', '标题'], ['paragraph', '正文'], ['code', '代码块'], ['admonition', '提示框'],
        ['table', '表格'], ['list', '列表'], ['quote', '引用'], ['image', '图片'],
        ['details', '折叠块'], ['mermaid', 'Mermaid'], ['math', '公式'],
      ];
      items.forEach(([k, label]) => {
        const btn = el('button', '', label);
        btn.onclick = () => { blocks.push(NEW_BLOCKS[k]()); render(); scheduleSync(); };
        bar.appendChild(btn);
      });
      container.appendChild(bar);
      container.appendChild(el('div', 'be-area', '')).id = 'blockArea';
      this.setMarkdown('');
    },
    setMarkdown(md) {
      const doc = B().parseMarkdown(md || '');
      fm = doc.frontMatter;
      blocks = doc.blocks;
      render();
    },
    getMarkdown() {
      return B().serializeBlocks({frontMatter: fm, blocks});
    },
  };
})();
