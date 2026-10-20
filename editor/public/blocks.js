/**
 * 云屿集 · 块编辑器核心
 * Markdown/MDX ⇄ 块数组 的双向转换。
 * 设计原则：未知/复杂语法一律降级为 raw 块，保证不丢内容。
 */

const ADMONITIONS = ['note', 'tip', 'info', 'caution', 'warning', 'danger'];

export function parseMarkdown(md) {
  const lines = md.split('\n');
  const blocks = [];
  let i = 0;
  let fm = null;

  // front matter
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1);
    if (end > 0) {
      fm = lines.slice(1, end).join('\n');
      i = end + 1;
    }
  }

  const push = (block) => blocks.push(block);

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i += 1; continue; }

    // 标题
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { push({type: 'heading', level: h[1].length, text: h[2]}); i += 1; continue; }

    // 代码块
    if (line.startsWith('```')) {
      const info = line.slice(3).trim();
      const lang = (info.match(/^([\w-]+)/) || [])[1] || '';
      const title = (info.match(/title="([^"]*)"/) || [])[1] || '';
      const body = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) { body.push(lines[i]); i += 1; }
      i += 1;
      push({type: 'code', lang, title, code: body.join('\n')});
      continue;
    }

    // 提示框（4 冒号优先，兼容 3 冒号）
    const ad = line.match(/^:{3,4}(note|tip|info|caution|warning|danger)\[([^\]]*)\]\s*$/);
    if (ad) {
      const body = [];
      i += 1;
      while (i < lines.length && !/^:{3,4}\s*$/.test(lines[i])) { body.push(lines[i]); i += 1; }
      i += 1;
      push({type: 'admonition', kind: ad[1], title: ad[2], body: body.join('\n')});
      continue;
    }

    // 表格
    if (line.trim().startsWith('|') && lines[i + 1] && /^\s*\|[\s:-]+\|/.test(lines[i + 1])) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        if (!/^\s*\|[\s:-]+\|/.test(lines[i])) {
          rows.push(lines[i].split('|').slice(1, -1).map((c) => c.trim()));
        }
        i += 1;
      }
      const head = rows.shift() || [];
      push({type: 'table', head, rows});
      continue;
    }

    // 折叠块
    if (/^<details>\s*$/.test(line.trim())) {
      const body = [];
      i += 1;
      while (i < lines.length && !/^<\/details>\s*$/.test(lines[i].trim())) { body.push(lines[i]); i += 1; }
      i += 1;
      const summary = (body[0] || '').match(/<summary>(.*?)<\/summary>/);
      push({type: 'details', summary: summary ? summary[1] : '展开', body: body.slice(summary ? 1 : 0).join('\n').trim()});
      continue;
    }

    // 引用
    if (line.startsWith('> ')) {
      const body = [];
      while (i < lines.length && lines[i].startsWith('> ')) { body.push(lines[i].slice(2)); i += 1; }
      push({type: 'quote', text: body.join('\n')});
      continue;
    }

    // 列表
    if (/^\s*[-*+]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items = [];
      while (i < lines.length && (/^\s*[-*+]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]))) {
        items.push(lines[i].replace(/^\s*(?:[-*+]|\d+\.)\s+/, ''));
        i += 1;
      }
      push({type: 'list', ordered, items});
      continue;
    }

    // 图片（独占一行）
    const img = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img) { push({type: 'image', alt: img[1], src: img[2]}); i += 1; continue; }

    // 原始 HTML / JSX / import
    if (/^\s*(<|import\s|\{)/.test(line)) {
      const body = [];
      while (i < lines.length && lines[i].trim()) { body.push(lines[i]); i += 1; }
      push({type: 'raw', text: body.join('\n')});
      continue;
    }

    // 段落
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|:{3,4}|> |<details>|\||!\[)/.test(lines[i])) {
      para.push(lines[i]);
      i += 1;
    }
    if (para.length) push({type: 'paragraph', text: para.join('\n')});
    else i += 1;
  }

  return {frontMatter: fm, blocks};
}

export function serializeBlocks({frontMatter, blocks}) {
  const out = [];
  if (frontMatter != null) out.push('---\n' + frontMatter + '\n---', '');

  for (const b of blocks) {
    switch (b.type) {
      case 'heading':
        out.push('#'.repeat(b.level) + ' ' + b.text, '');
        break;
      case 'paragraph':
        out.push(b.text, '');
        break;
      case 'code': {
        const info = [b.lang, b.title ? `title="${b.title}"` : ''].filter(Boolean).join(' ');
        out.push('```' + info, b.code, '```', '');
        break;
      }
      case 'admonition':
        out.push(`::::${b.kind}[${b.title}]`, b.body, '::::', '');
        break;
      case 'table': {
        const head = b.head || [];
        out.push('| ' + head.join(' | ') + ' |');
        out.push('| ' + head.map(() => '---').join(' | ') + ' |');
        for (const row of b.rows || []) out.push('| ' + row.join(' | ') + ' |');
        out.push('');
        break;
      }
      case 'list':
        out.push(...b.items.map((it, idx) => (b.ordered ? `${idx + 1}. ` : '- ') + it), '');
        break;
      case 'quote':
        out.push(...b.text.split('\n').map((l) => '> ' + l), '');
        break;
      case 'details':
        out.push('<details>', `  <summary>${b.summary}</summary>`, '', b.body, '', '</details>', '');
        break;
      case 'image':
        out.push(`![${b.alt}](${b.src})`, '');
        break;
      default:
        out.push(b.text || '', '');
    }
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
