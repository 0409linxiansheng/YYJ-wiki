# 云屿集 · 从 Docusaurus 迁移到 Quartz（Obsidian 生态）

> 本文件是迁移工作的交接文档。新会话从这里接着做，不依赖对话记忆。

## 一、目标

把站点从 **Docusaurus（MDX）** 迁到 **Quartz 5（纯 Markdown / Obsidian vault）**，实现：

- 在 Obsidian 里写，实时预览，所见即所得
- 发布的站点与 Obsidian 里看到的**同一套 Markdown 语法**
- 保留云屿集的品牌视觉（配色、字体、排版）

## 二、当前进度

| 项 | 状态 |
|---|---|
| Quartz 源码 | ✅ 已克隆到 `~/sites/yyj-quartz`（v5.0.0，来自 Gitee 镜像） |
| 依赖安装 | ✅ `npm install` 完成（328 包，`node_modules` 356MB） |
| 构建验证 | ✅ `npx quartz build` 成功（1 个 md → 58 个文件，2 秒） |
| 站点配置 | ⬜ 未开始 |
| 内容迁移 | ⬜ 未开始 |
| 主题定制 | ⬜ 未开始 |
| 部署 | ⬜ 未开始 |

## 三、环境事实（重要）

- 工作机：Ubuntu 24.04，Node v22.20.0（`~/.local/node/bin`），npm 10.9.3
- Quartz 要求：Node >= 22，npm >= 10.9.2 ✅
- **GitHub HTTPS 从这台机器访问会超时**（clone 失败）；**SSH 正常**（`git@github.com` 可以 push）
- 拉取开源代码请用 Gitee 镜像：`https://gitee.com/linxiansheng0409/quartz`
- 现有站点仓库：`git@github.com:YYJ-lin/YYJ-wiki.git`（本地 `~/sites/my-website`）
- 编辑器后台：`~/sites/my-website/editor`，systemd 服务 `yyj-editor`（端口 3002）

## 四、Quartz 项目结构

```
~/sites/yyj-quartz/
├── content/                 ← Obsidian vault 根目录（用 Obsidian 打开它）
├── quartz.config.yaml       ← 站点配置（Quartz 5 用 YAML；从 quartz.config.default.yaml 复制）
├── quartz.config.default.yaml
├── quartz/                  ← 框架源码（Preact + SCSS）
├── public/                  ← 构建产物
└── package.json
```

常用命令：

```bash
cd ~/sites/yyj-quartz
export PATH=$HOME/.local/node/bin:$PATH
npx quartz build            # 构建到 public/
npx quartz build --serve    # 本地预览（默认 8080）
```

## 五、下一步：配置站点

编辑 `quartz.config.yaml` 的 `configuration` 段：

```yaml
pageTitle: 云屿集
pageTitleSuffix: " · 业务分享与行业知识"
locale: zh-CN
baseUrl: <你的域名>/<路径>        # 例：yyj-lin.github.io/yyj-quartz
theme:
  typography:
    header: IBM Plex Sans
    body: IBM Plex Sans
    code: JetBrains Mono
  colors:
    lightMode:
      light: "#fafaf9"           # 页面底色
      secondary: "#3b5bdb"       # 品牌色
      gray: "#e5e7eb"
```

字体文件在 `~/sites/my-website/static/fonts/`，需要复制到 Quartz 的静态资源目录（`quartz/static/`）并在配置里改为本地字体。

## 六、内容迁移规则

源：`~/sites/my-website/docs/`（4 个分类）+ `~/sites/my-website/blog/`
目标：`~/sites/yyj-quartz/content/`

### 语法对照

| Docusaurus | Quartz / Obsidian | 处理方式 |
|---|---|---|
| `::::tip[标题]` … `::::` | `> [!tip] 标题` + `> 内容` | 脚本转换 |
| `::::note` / `:::info` / `:::warning` / `:::danger` / `:::caution` | `> [!note]` / `> [!info]` / `> [!warning]` / `> [!danger]` / `> [!caution]` | 脚本转换 |
| `<Tabs>` / `<TabItem>` | **无对应** | 手工拆成小标题或删除 |
| `import ... from ...` | 不支持 | 删除 |
| 自定义 JSX（卡片、按钮） | 不支持 | 改写为 Markdown 或删除 |
| `{/* truncate */}` | 不需要 | 删除 |
| 相对链接 `[x](/about)` | `[[about]]` 或保留相对路径 | 建议改成 wiki 链接 |
| 图片 `/img/x.png` | 放在 `content/` 下并用相对路径 | 复制 `static/img/` → `content/attachments/` |

### 建议的执行顺序

1. 先复制 `docs/about/components.mdx` 和 `writing-guide.mdx` 手工迁移，作为样板
2. 写脚本批量处理其余文件（去掉 import、转 callout、改扩展名）
3. 逐个人工检查含 Tabs / JSX 的文件

## 七、主题定制（对齐云屿集）

Quartz 5 的样式入口：

- `quartz/styles/variables.scss` — 颜色、字体、间距变量
- `quartz/styles/custom.scss` — 任意自定义 CSS
- `quartz/components/` — Header / Footer / 首页等 Preact 组件
- 布局配置在 `quartz.config.yaml` 的 layout 段（侧栏/目录位置）

目标效果：

- 正文宽度 760px，居中
- 三栏：左侧文档树 / 中间正文 / 右侧目录
- 页脚四区（内容导航 / 相关资源 / 关于与反馈 / 品牌）
- 首页 Hero + 三张入口卡（需要写自定义 Preact 组件）

## 八、部署方案

建议 **新建仓库** `yyj-quartz`，与现有 `YYJ-wiki` 并存，验证后再决定是否替换。

- GitHub Pages 源：GitHub Actions
- 构建产物：`public/`
- baseUrl 需与仓库路径一致（如 `/yyj-quartz/`）

首次部署需要：
1. 在 GitHub 新建仓库（用户操作）
2. 本地 `git remote add origin git@github.com:YYJ-lin/yyj-quartz.git`
3. 添加 `.github/workflows/deploy.yml`（构建 `npx quartz build` → 上传 `public/` → deploy-pages）

## 九、已知风险

1. **Quartz 5 的 `prebuild` 会执行 `install-plugins`**，可能需要访问 GitHub；如失败需看是否可跳过
2. **MDX 组件无法迁移**：Tabs、卡片等需要人工改写，工作量取决于实际用了多少
3. **链接风格变化**：Quartz 偏好 `[[wiki 链接]]`，与现有相对链接不同，迁移后要检查死链
4. **现有后台编辑器将作废**（有了 Obsidian 不再需要），但可保留发布脚本 `tools/publish.sh`

## 十、回滚方案

现有 Docusaurus 站点保持不动，直到 Quartz 版本验证通过。旧站仍在 `~/sites/my-website`，仓库 `YYJ-wiki` 不受影响。
