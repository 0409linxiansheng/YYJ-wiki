#!/usr/bin/env node
/**
 * 云屿集 · 内容管理后台
 * 本地运行，读写仓库内容并通过 git 发布。
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFile, spawn} from 'node:child_process';
import net from 'node:net';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(__dirname, 'public');
const SETTINGS_FILE = path.join(__dirname, 'settings.json');
const SITE_CONFIG = path.join(SITE_DIR, 'site.config.json');
const PORT = Number(process.env.EDITOR_PORT || 3002);
const SESSION_TTL = 7 * 24 * 3600 * 1000;

/* ---------------- 配置与会话 ---------------- */
function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}
function loadSettings() {
  return readJson(SETTINGS_FILE);
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function ensureSecret(settings) {
  if (!settings.secret) {
    settings.secret = crypto.randomBytes(32).toString('hex');
    writeJson(SETTINGS_FILE, settings);
  }
  return settings.secret;
}

function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function makeCookie(secret) {
  const payload = JSON.stringify({exp: Date.now() + SESSION_TTL});
  const value = Buffer.from(payload).toString('base64url');
  return `yyj_session=${value}.${sign(value, secret)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL / 1000}`;
}

function isAuthed(req) {
  const settings = loadSettings();
  if (!settings?.secret) return false;
  const cookie = req.headers.cookie || '';
  const m = cookie.match(/yyj_session=([^;]+)/);
  if (!m) return false;
  const [value, mac] = m[1].split('.');
  if (!value || !mac) return false;
  if (sign(value, settings.secret) !== mac) return false;
  try {
    const {exp} = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
    return Date.now() < exp;
  } catch {
    return false;
  }
}

/* ---------------- 工具 ---------------- */
function json(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 20 * 1024 * 1024) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function safePath(rel) {
  const abs = path.resolve(SITE_DIR, rel);
  if (!abs.startsWith(SITE_DIR + path.sep)) throw new Error('非法路径');
  return abs;
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    execFile(cmd, args, {cwd: SITE_DIR, maxBuffer: 10 * 1024 * 1024, ...opts}, (err, stdout, stderr) => {
      resolve({ok: !err, out: (stdout || '') + (stderr || '')});
    });
  });
}

function npmBin() {
  return path.join(path.dirname(process.execPath), 'npm');
}

function portOpen(port) {
  return new Promise((resolve) => {
    const socket = net.connect({port, host: '127.0.0.1'});
    socket.setTimeout(800);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.on('error', () => resolve(false));
  });
}

/* ---------------- 内容 ---------------- */
function frontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  return fm;
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

function collectText(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectText(full, out);
    else if (/\.(mdx?|jsx?|tsx?)$/.test(entry.name)) out.push(fs.readFileSync(full, 'utf8'));
  }
  return out;
}

function listDocs() {
  const docsDir = path.join(SITE_DIR, 'docs');
  const items = walk(docsDir).map((file) => {
    const rel = path.relative(SITE_DIR, file);
    const text = fs.readFileSync(file, 'utf8');
    const fm = frontMatter(text);
    const parts = rel.split(path.sep);
    const category = parts[1] || '';
    const name = path.basename(file).replace(/\.mdx?$/, '');
    const route = '/' + [category, name === 'index' ? '' : name].filter(Boolean).join('/');
    return {
      kind: 'doc',
      path: rel.split(path.sep).join('/'),
      category,
      name,
      title: fm.title || name,
      route: route.replace(/\/$/, '') || '/',
    };
  });
  return items.sort((a, b) => a.path.localeCompare(b.path));
}

function listBlog() {
  const blogDir = path.join(SITE_DIR, 'blog');
  const items = [];
  if (!fs.existsSync(blogDir)) return items;
  for (const entry of fs.readdirSync(blogDir, {withFileTypes: true})) {
    let file = null;
    if (entry.isDirectory()) {
      const i = path.join(blogDir, entry.name, 'index.mdx');
      const j = path.join(blogDir, entry.name, 'index.md');
      file = fs.existsSync(i) ? i : fs.existsSync(j) ? j : null;
    } else if (/\.mdx?$/.test(entry.name)) {
      file = path.join(blogDir, entry.name);
    }
    if (!file) continue;
    const text = fs.readFileSync(file, 'utf8');
    const fm = frontMatter(text);
    const slug = fm.slug || entry.name.replace(/^\d{4}-\d{2}-\d{2}-/, '');
    items.push({
      kind: 'blog',
      path: path.relative(SITE_DIR, file).split(path.sep).join('/'),
      category: 'blog',
      name: entry.name,
      title: fm.title || slug,
      route: '/blog/' + slug,
      date: fm.date || '',
    });
  }
  return items.sort((a, b) => (a.name < b.name ? 1 : -1));
}

function listDrafts() {
  const dir = path.join(SITE_DIR, 'drafts');
  return walk(dir).map((file) => {
    const rel = path.relative(SITE_DIR, file).split(path.sep).join('/');
    const fm = frontMatter(fs.readFileSync(file, 'utf8'));
    return {
      kind: 'draft',
      path: rel,
      category: 'drafts',
      name: path.basename(file).replace(/\.mdx?$/, ''),
      title: fm.title || path.basename(file),
      route: null,
    };
  }).sort((a, b) => a.path.localeCompare(b.path));
}

function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-') || 'untitled';
}

/* ---------------- HTTP ---------------- */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;

  try {
    /* --- 静态 --- */
    if (req.method === 'GET' && !p.startsWith('/api/')) {
      const file = path.join(PUBLIC_DIR, p === '/' ? 'index.html' : p);
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        const ext = path.extname(file);
        const type = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8'}[ext] || 'application/octet-stream';
        res.writeHead(200, {'Content-Type': type, 'Cache-Control': 'no-store, must-revalidate'});
        res.end(fs.readFileSync(file));
        return;
      }
    }

    /* --- 站点自身的样式（保证预览与前端一致） --- */
    if (p === '/site-css' && req.method === 'GET') {
      const cssDir = path.join(SITE_DIR, 'build', 'assets', 'css');
      const files = fs.existsSync(cssDir) ? fs.readdirSync(cssDir).filter((f) => f.endsWith('.css')) : [];
      const css = files.map((f) => fs.readFileSync(path.join(cssDir, f), 'utf8')).join('\n');
      res.writeHead(200, {'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': 'no-store'});
      return res.end(css || '/* 还没有构建产物，先运行 npm run build */');
    }

    if (p === '/api/theme' && req.method === 'GET') {
      const cssDir = path.join(SITE_DIR, 'build', 'assets', 'css');
      const css = fs.existsSync(cssDir)
        ? fs.readdirSync(cssDir).filter((f) => f.endsWith('.css')).map((f) => fs.readFileSync(path.join(cssDir, f), 'utf8')).join('\n')
        : '';
      const pick = (prefix) => {
        const m = css.match(new RegExp('\\.' + prefix + '_([A-Za-z0-9_-]{3,10})(?![A-Za-z0-9_-])'));
        return m ? m[0].slice(1) : '';
      };
      return json(res, 200, {
        admonition: pick('admonition'),
        admonitionHeading: pick('admonitionHeading'),
        admonitionIcon: pick('admonitionIcon'),
        admonitionContent: pick('admonitionContent'),
        codeBlockLines: pick('codeBlockLines'),
      });
    }

    /* --- 初始化 / 登录 --- */
    if (p === '/api/state' && req.method === 'GET') {
      const settings = loadSettings();
      const authed = isAuthed(req);
      const config = readJson(SITE_CONFIG, {});
      return json(res, 200, {
        needsSetup: !settings,
        authed,
        site: {title: config.title, tagline: config.tagline},
        categories: config.categories ?? {},
        docs: authed ? listDocs() : [],
        blog: authed ? listBlog() : [],
        drafts: authed ? listDrafts() : [],
      });
    }

    if (p === '/api/setup' && req.method === 'POST') {
      if (loadSettings()) return json(res, 400, {error: '已初始化'});
      const {password} = await readBody(req);
      if (!password || password.length < 4) return json(res, 400, {error: '密码至少 4 位'});
      const salt = crypto.randomBytes(16).toString('hex');
      const settings = {salt, passwordHash: hashPassword(password, salt), secret: crypto.randomBytes(32).toString('hex')};
      writeJson(SETTINGS_FILE, settings);
      res.setHeader('Set-Cookie', makeCookie(settings.secret));
      return json(res, 200, {ok: true});
    }

    if (p === '/api/login' && req.method === 'POST') {
      const settings = loadSettings();
      if (!settings) return json(res, 400, {error: '未初始化'});
      const {password} = await readBody(req);
      if (hashPassword(password || '', settings.salt) !== settings.passwordHash) {
        return json(res, 401, {error: '密码错误'});
      }
      const secret = ensureSecret(settings);
      res.setHeader('Set-Cookie', makeCookie(secret));
      return json(res, 200, {ok: true});
    }

    if (p === '/api/logout' && req.method === 'POST') {
      res.setHeader('Set-Cookie', 'yyj_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
      return json(res, 200, {ok: true});
    }

    if (!p.startsWith('/api/')) return json(res, 404, {error: 'not found'});
    if (!isAuthed(req)) return json(res, 401, {error: '未登录'});

    /* --- 文档 --- */
    if (p === '/api/doc' && req.method === 'GET') {
      const rel = url.searchParams.get('path');
      const file = safePath(rel);
      if (!fs.existsSync(file)) return json(res, 404, {error: '文件不存在'});
      return json(res, 200, {path: rel, content: fs.readFileSync(file, 'utf8')});
    }

    if (p === '/api/doc/save' && req.method === 'POST') {
      const {path: rel, content} = await readBody(req);
      const file = safePath(rel);
      fs.mkdirSync(path.dirname(file), {recursive: true});
      fs.writeFileSync(file, content);
      return json(res, 200, {ok: true});
    }

    if (p === '/api/doc/create' && req.method === 'POST') {
      const {kind, category, title, slug, draft} = await readBody(req);
      const s = slug || slugify(title || 'untitled');
      let rel;
      if (draft) {
        rel = `drafts/${s}.mdx`;
        const body = `---\ntitle: ${title || s}\ndescription: \n---\n\n在此开始写作。\n`;
        const file = safePath(rel);
        fs.mkdirSync(path.dirname(file), {recursive: true});
        fs.writeFileSync(file, body);
        return json(res, 200, {ok: true, path: rel});
      }
      if (kind === 'blog') {
        const date = new Date().toISOString().slice(0, 10);
        rel = `blog/${date}-${s}/index.mdx`;
        const body = `---\nslug: ${s}\ntitle: ${title || s}\nauthors: [yunyu]\ndate: ${date}\n---\n\n在此开始写作。\n`;
        const file = safePath(rel);
        fs.mkdirSync(path.dirname(file), {recursive: true});
        fs.writeFileSync(file, body);
      } else {
        rel = `docs/${category}/${s}.mdx`;
        const body = `---\ntitle: ${title || s}\ndescription: \nsidebar_position: 1\n---\n\n在此开始写作。\n`;
        const file = safePath(rel);
        fs.mkdirSync(path.dirname(file), {recursive: true});
        fs.writeFileSync(file, body);
      }
      return json(res, 200, {ok: true, path: rel});
    }

    if (p === '/api/doc/delete' && req.method === 'POST') {
      const {path: rel} = await readBody(req);
      const file = safePath(rel);
      if (fs.existsSync(file)) fs.unlinkSync(file);
      return json(res, 200, {ok: true});
    }

    if (p === '/api/doc/rename' && req.method === 'POST') {
      const {path: rel, newPath} = await readBody(req);
      const from = safePath(rel);
      const to = safePath(newPath);
      fs.mkdirSync(path.dirname(to), {recursive: true});
      fs.renameSync(from, to);
      return json(res, 200, {ok: true});
    }

    if (p === '/api/doc/publish-draft' && req.method === 'POST') {
      const {path: rel, category} = await readBody(req);
      if (!category) return json(res, 400, {error: '请选择分类'});
      const from = safePath(rel);
      const name = path.basename(rel);
      const target = `docs/${category}/${name}`;
      const to = safePath(target);
      fs.mkdirSync(path.dirname(to), {recursive: true});
      fs.renameSync(from, to);
      return json(res, 200, {ok: true, path: target});
    }

    /* --- 用前端渲染器渲染当前文档，保证与线上完全一致 --- */
    if (p === '/api/render' && req.method === 'GET') {
      const rel = url.searchParams.get('path') || '';
      const item = [...listDocs(), ...listBlog()].find((d) => d.path === rel);
      if (!item) return json(res, 404, {error: '找不到文章路由'});
      const html = await new Promise((resolve) => {
        const req2 = http.get(`http://127.0.0.1:3001/YYJ-wiki${item.route}`, (r) => {
          let buf = '';
          r.on('data', (c) => { buf += c; });
          r.on('end', () => resolve(buf));
        });
        req2.on('error', () => resolve(''));
        req2.setTimeout(15000, () => { req2.destroy(); resolve(''); });
      });
      const m = html.match(/<article[^>]*class="[^"]*markdown[^"]*"[^>]*>([\s\S]*?)<\/article>/);
      return json(res, 200, {ok: !!m, route: item.route, html: m ? m[1] : ''});
    }

    /* --- 站点设置 --- */
    if (p === '/api/settings' && req.method === 'GET') {
      return json(res, 200, readJson(SITE_CONFIG, {}));
    }
    if (p === '/api/settings' && req.method === 'POST') {
      const data = await readBody(req);
      writeJson(SITE_CONFIG, data);
      return json(res, 200, {ok: true});
    }

    /* --- git --- */
    if (p === '/api/git/status' && req.method === 'GET') {
      const {out} = await run('git', ['status', '--porcelain']);
      const files = out.split('\n').filter(Boolean).map((line) => ({status: line.slice(0, 2).trim(), path: line.slice(3)}));
      return json(res, 200, {files});
    }

    if (p === '/api/publish' && req.method === 'POST') {
      const {message} = await readBody(req);
      const add = await run('git', ['add', '-A']);
      if (!add.ok) return json(res, 500, {error: add.out});
      const commit = await run('git', ['commit', '-m', message || `content: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`]);
      if (!commit.ok && !/nothing to commit/.test(commit.out)) return json(res, 500, {error: commit.out});
      const push = await run('git', ['push']);
      let tag = '';
      if (push.ok) {
        tag = 'publish-' + new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
        await run('git', ['tag', tag]);
        await run('git', ['push', 'origin', tag]);
      }
      return json(res, push.ok ? 200 : 500, {ok: push.ok, tag, output: commit.out + '\n' + push.out});
    }

    if (p === '/api/history' && req.method === 'GET') {
      const limit = Number(url.searchParams.get('limit') || 20);
      const {out} = await run('git', ['log', `-${limit}`, '--pretty=format:%H|%ad|%s', '--date=format:%Y-%m-%d %H:%M']);
      const list = out.split('\n').filter(Boolean).map((line) => {
        const [sha, date, message] = line.split('|');
        return {sha, date, message};
      });
      return json(res, 200, list);
    }

    if (p === '/api/history/show' && req.method === 'GET') {
      const sha = url.searchParams.get('sha');
      const rel = url.searchParams.get('path');
      const args = ['show', '--stat', '--oneline', sha];
      const {out} = await run('git', args);
      let diff = '';
      if (rel) {
        const r = await run('git', ['show', `${sha}:${rel}`]);
        diff = r.out;
      }
      return json(res, 200, {out, diff});
    }

    if (p === '/api/history/revert' && req.method === 'POST') {
      const {sha, path: rel} = await readBody(req);
      if (rel) {
        const r = await run('git', ['checkout', sha, '--', rel]);
        if (!r.ok) return json(res, 500, {error: r.out});
        await run('git', ['commit', '-m', `revert: 恢复 ${rel} 到 ${sha.slice(0, 7)}`]);
      } else {
        const r = await run('git', ['revert', '--no-commit', sha]);
        if (!r.ok) return json(res, 500, {error: r.out});
        await run('git', ['commit', '-m', `revert: 回滚 ${sha.slice(0, 7)}`]);
      }
      const push = await run('git', ['push']);
      return json(res, push.ok ? 200 : 500, {ok: push.ok, output: push.out});
    }

    /* --- 构建校验 --- */
    if (p === '/api/build' && req.method === 'POST') {
      const r = await run(npmBin(), ['run', 'build'], {timeout: 300000});
      return json(res, r.ok ? 200 : 500, {ok: r.ok, output: r.out.slice(-4000)});
    }

    /* --- 开发服务器（预览用） --- */
    if (p === '/api/dev/start' && req.method === 'POST') {
      if (await portOpen(3001)) return json(res, 200, {ok: true, running: true});
      const child = spawn(npmBin(), ['start', '--', '--port', '3001', '--host', '0.0.0.0', '--no-open'], {
        cwd: SITE_DIR,
        detached: true,
        stdio: 'ignore',
      });
      child.unref();
      for (let i = 0; i < 60; i += 1) {
        if (await portOpen(3001)) break;
        await new Promise((r) => setTimeout(r, 500));
      }
      return json(res, 200, {ok: true, running: await portOpen(3001)});
    }

    if (p === '/api/history/file' && req.method === 'GET') {
      const rel = url.searchParams.get('path') || '';
      const {out} = await run('git', ['log', '--follow', '-20', '--pretty=format:%H|%ad|%s', '--date=format:%Y-%m-%d %H:%M', '--', rel]);
      const list = out.split('\n').filter(Boolean).map((line) => {
        const [sha, date, message] = line.split('|');
        return {sha, date, message};
      });
      return json(res, 200, list);
    }

    if (p === '/api/assets' && req.method === 'GET') {
      const dir = path.join(SITE_DIR, 'static', 'img');
      if (!fs.existsSync(dir)) return json(res, 200, []);
      const refs = ['docs', 'blog', 'src'].flatMap((d) => collectText(path.join(SITE_DIR, d))).join('\n');
      const list = fs.readdirSync(dir)
        .filter((f) => /\.(png|jpe?g|webp|svg|gif|ico)$/i.test(f))
        .map((f) => {
          const stat = fs.statSync(path.join(dir, f));
          const escaped = f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const count = (refs.match(new RegExp(escaped, 'g')) || []).length;
          return {name: f, url: `/img/${f}`, size: stat.size, refs: count, mtime: stat.mtimeMs};
        })
        .sort((a, b) => b.mtime - a.mtime);
      return json(res, 200, list);
    }

    if (p === '/api/assets/delete' && req.method === 'POST') {
      const {name, force} = await readBody(req);
      if (!name || /[\\/]/.test(name)) return json(res, 400, {error: '非法文件名'});
      const file = path.join(SITE_DIR, 'static', 'img', name);
      if (!fs.existsSync(file)) return json(res, 404, {error: '文件不存在'});
      const refs = ['docs', 'blog', 'src'].flatMap((d) => collectText(path.join(SITE_DIR, d))).join('\n');
      const count = (refs.match(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      if (count > 0 && !force) return json(res, 409, {error: `仍被引用 ${count} 次，先移除引用`, refs: count});
      fs.unlinkSync(file);
      return json(res, 200, {ok: true});
    }

    /* --- 图片上传 --- */
    if (p === '/api/upload' && req.method === 'POST') {
      const {filename, data} = await readBody(req);
      const base64 = (data || '').replace(/^data:[^;]+;base64,/, '');
      const name = (filename || `img-${Date.now()}.png`).replace(/[^\w.-]/g, '-');
      const dir = path.join(SITE_DIR, 'static', 'img');
      fs.mkdirSync(dir, {recursive: true});
      fs.writeFileSync(path.join(dir, name), Buffer.from(base64, 'base64'));
      return json(res, 200, {ok: true, url: `/img/${name}`});
    }

    return json(res, 404, {error: 'not found'});
  } catch (error) {
    return json(res, 500, {error: String(error?.message || error)});
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  云屿集 · 内容管理后台`);
  console.log(`  http://localhost:${PORT}`);
  if (!fs.existsSync(SETTINGS_FILE)) console.log(`  首次使用：打开页面设置密码\n`);
});
