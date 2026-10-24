# 交接文档 · 云屿集站点与写作后台

> 最后更新：2026-10-24。新会话先读这一页，再看"待办"。

## 1. 部署与地址

| 用途 | 地址 / 路径 |
| --- | --- |
| 线上站点 | https://yyj-lin.github.io/YYJ-wiki/ |
| 本地构建预览 | http://192.168.1.102:3000/YYJ-wiki/ |
| 写作后台 | http://192.168.1.102:3002/app/ （登录密码见本机 `~/sites/private/yyj-secrets.txt`） |
| 服务器 | 192.168.1.102，用户 linxiansheng |
| 站点仓库 | `~/sites/my-website`（remote `git@github.com:YYJ-lin/YYJ-wiki.git`，branch `main`） |
| 后台代码 | `~/sites/my-website/editor`（`server.mjs` + `web/` Vite 前端，构建产物在 `editor/public/app`） |
| systemd 服务 | `yyj-editor`（后台）、`yyj-quartz-preview`（旧 Quartz 预览，可停） |

## 2. 技术栈

- 站点：Docusaurus 3.10（docs `routeBasePath: '/'`、blog 在 `/blog`、`trailingSlash: false`、`baseUrl: /YYJ-wiki/`）
- 后台：Node + 原生 http 服务，前端 React + BlockNote（`@blocknote/*`），Vite 构建
- 发布：`git push` → GitHub Actions → GitHub Pages
- 站点自定义插件：`plugins/remark-wikilinks.js`（`[[双链]]`）、`plugins/yyj-backlinks`（反向链接索引 + 客户端预览模块）、`plugins/kb-routes`（`/kb` 首页索引）

## 3. 已完成

- 导航：知识库 / 技术手记 / 资源与工具 / 关于我们
- 首页：Hero + 双按钮 + 三卡（技术手记 / 知识库 / 资源与工具）
- 页脚：三列 + 法务行（隐私 / 版权 / RSS）+ 回到顶部
- 知识库：`docs/kb/{erpnext,wordpress,apps,industry}` 四分类，`/kb` 自动按目录生成
- 文章：2 篇已迁移（ERPNext 介绍、安装难点）
- 写作后台：BlockNote 编辑器、17 个块、6 个自定义组件（提示框/折叠/卡片/步骤条/标签页/视频）、图片上传、分类增删（任意层级）、改密码、保存、发布
- 链接能力：`[[双链]]`、**仅双链**的悬停预览（桌面）、反向链接（页面底部）
- 301：`/industry` → `/kb/industry`、`/business` → `/blog`
- `editor/workbench.config.json`：站点目录与端口可配置（为 U 盘便携版铺路）

## 4. 待办（按优先级）

### P0.5 便携版（U 盘）
- [ ] U 盘 `workbench/`：便携 node.exe + server.mjs + app + settings.json + .ssh
- [ ] `启动写作台.cmd`：端口检测 → 起服务 → 开浏览器
- [ ] U 盘仓库换成 `YYJ-wiki`，vault 指向 `站点/docs`，附件目录 `static/img`
- [ ] 换机实测：另一台 Windows 插上即用

### P0 可靠性
- [ ] 自动保存（停手 2 秒）
- [ ] 草稿箱（`drafts/`）与"草稿/已发布"分组
- [ ] 发布状态轮询（构建中 → 成功给链接 / 失败给日志）
- [ ] 文章重命名（自动加 aliases）
- [ ] 删除到回收站 `_trash/`，可还原
- [ ] 快捷键：⌘S 保存、⌘Enter 发布

### P1 内容管理
- [ ] 标签编辑（补全，写 frontmatter）
- [ ] 文章列表：搜索 / 分类筛选 / 按更新时间排序 / 状态徽标
- [ ] 双链在编辑器内可视化为蓝色链接
- [ ] 图片管理面板（`static/img` 复用、删除）

### P2 产品化
- [ ] 单篇版本历史（git）与回滚
- [ ] 批量移动/删除
- [ ] 移动端布局
- [ ] 性能（长文、图片懒加载）

## 5. 已知坑（踩过的）

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 改了代码没生效 | 端口被旧 `node server.mjs` 占着，systemd 启动失败 | 只用 systemd 启动；`ss -ltnp | grep 3002` 查占用 |
| 构建报 `Can't process doc metadata` | frontmatter 里 `description:` 为空（YAML null） | 空值就不写该行 |
| 构建报 broken links | 文档引用了已删除页面 | 删页面前先改引用，或加 301 |
| 中文标题生成中文文件名 | `slugify` 保留中文，网址变百分号编码 | 非 ASCII 时降级为 `post-日期-随机` |
| 浏览器点删除没反应 | 缓存了旧 JS（参数名不一致） | 改完必须 ⌘Shift+R 强刷 |
| 悬停预览到处都是 | 预览选择器曾匹配所有站内链接 | 只匹配 `a.yyj-wikilink`（双链） |

## 6. 常用命令

```bash
# 后台
systemctl --user status yyj-editor
systemctl --user restart yyj-editor
journalctl --user -u yyj-editor -n 50

# 前端（改 editor/web 后）
cd ~/sites/my-website/editor/web && npm run build

# 站点构建 + 推送
cd ~/sites/my-website && npm run build
git add -A && git commit -m "..." && git push
```

## 7. 交付要求

每一步都要附：**接口实测结果 + 页面截图 + "能用 / 不能用"清单**；没跑通的不算完成。
