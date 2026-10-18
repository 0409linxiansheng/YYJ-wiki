# 我的文档站

基于 [Docusaurus 3](https://docusaurus.io/zh-CN/) 构建，部署到 GitHub Pages。

## 本地开发

```bash
npm install
npm start          # http://localhost:3000
```

## 构建与预览

```bash
npm run build      # 产物在 build/
npm run serve      # 预览生产构建（注意访问 /<baseUrl>/ 路径）
```

## 部署前必改

`docusaurus.config.js` 顶部两行：

```js
const GITHUB_USER = 'YOUR_GITHUB_USER';  // 你的 GitHub 用户名/组织名
const GITHUB_REPO = 'my-website';        // 仓库名
```

若仓库名为 `<user>.github.io`，把 `baseUrl` 改成 `'/'`。

## 部署

1. 推到 GitHub 的 `main` 分支；
2. 仓库 **Settings → Pages → Source** 选择 **GitHub Actions**；
3. `.github/workflows/deploy.yml` 会自动构建并发布，地址为
   `https://<GITHUB_USER>.github.io/<GITHUB_REPO>/`。

## 目录

- `docs/` 文档（Markdown/MDX）
- `blog/` 博客
- `src/pages/` 自定义页面
- `src/css/custom.css` 主题样式
- `static/` 静态资源（含 `.nojekyll`）
- `.github/workflows/` 部署流水线
