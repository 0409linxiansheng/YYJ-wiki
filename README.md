# 云屿集

个人知识站点：**业务分享** + **行业知识** + **工具资源**。

基于 [Docusaurus](https://docusaurus.io/zh-CN/) 构建，托管在 GitHub Pages。

## 本地开发

```bash
npm install
npm start          # 本地热更新
```

## 构建与预览

```bash
npm run build      # 产物在 build/
npm run serve      # 预览生产构建
```

## 内容怎么加

- 知识库：`docs/<分类>/<文章>.mdx`
- 博客：`blog/<日期>-<标题>/index.mdx`
- 写作说明见站内 `/about/writing-guide`

## 部署

推到 `main` 分支，GitHub Actions 自动构建并发布到
`https://0409linxiansheng.github.io/YYJ-wiki/`。
