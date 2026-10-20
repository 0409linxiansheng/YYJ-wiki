// @ts-check
// 本文件在 Node 里执行，不要写浏览器端代码（DOM/JSX）。
import {themes as prismThemes} from 'prism-react-renderer';
import math from 'remark-math';
import katex from 'rehype-katex';
import footnotes from 'remark-footnotes';
import {readFileSync} from 'node:fs';

// ============================================================
// 只需要改下面这两行，其余配置会自动跟着对齐
//   GITHUB_USER : 你的 GitHub 用户名或组织名
//   GITHUB_REPO : 仓库名（决定 baseUrl 和线上地址）
//   部署到 https://<user>.github.io/<repo>/
// 如果仓库名是 <user>.github.io（用户/组织主页），把 baseUrl 改成 '/'
// ============================================================
const GITHUB_USER = 'YYJ-lin';
const GITHUB_REPO = 'YYJ-wiki';

// 站点可编辑配置（由管理后台维护）
const siteJson = JSON.parse(readFileSync(new URL('./site.config.json', import.meta.url), 'utf8'));

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: siteJson.title,
  tagline: siteJson.tagline,
  favicon: siteJson.favicon.replace(/^\//, ''),

  markdown: {
    mermaid: true,
  },

  // 社交入口配置：二维码图片放到 static/img/ 下，改这里即可
  customFields: {
    github: siteJson.social.github ?? `https://github.com/${GITHUB_USER}/${GITHUB_REPO}`,
    wechatQr: siteJson.social.wechatQr ?? '/img/wechat-qr.webp',
    qqQr: siteJson.social.qqQr ?? '/img/qq-qr.webp',
    theme: siteJson.theme,
  },

  future: {
    v4: true,
  },

  url: `https://${GITHUB_USER.toLowerCase()}.github.io`,
  baseUrl: `/${GITHUB_REPO}/`,
  organizationName: GITHUB_USER,
  projectName: GITHUB_REPO,
  // GitHub Pages 默认给 URL 补尾斜杠，显式关掉以避免站内链接多一跳 301
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {redirects: []},
    ],
    './plugins/kb-routes',
    function fontLinksPlugin(context) {
      return {
        name: 'font-links',
        injectHtmlTags() {
          return {
            headTags: [
              {
                tagName: 'link',
                attributes: {
                  rel: 'stylesheet',
                  href: `${context.siteConfig.baseUrl}fonts/fonts.css`,
                },
              },
              {
                tagName: 'link',
                attributes: {
                  rel: 'stylesheet',
                  href: `${context.siteConfig.baseUrl}css/katex.css`,
                },
              },
            ],
          };
        },
      };
    },
  ],

  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['zh', 'en'],
        indexBlog: true,
        docsRouteBasePath: '/',
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 8,
      },
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          remarkPlugins: [math, footnotes],
          rehypePlugins: [katex],
          routeBasePath: '/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: false,
          editUrl: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/tree/main/`,
        },
        blog: {
          blogTitle: '博客',
          blogDescription: '记录业务思考与行业观察',
          showReadingTime: true,
          remarkPlugins: [math, footnotes],
          rehypePlugins: [katex],
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/tree/main/`,
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: siteJson.title,
        logo: {
          alt: siteJson.title,
          src: siteJson.logo.replace(/^\//, ''),
        },
        items: siteJson.navbar.map((item) => ({
          label: item.label,
          ...(item.href ? {href: item.href} : {to: item.to}),
          position: item.position ?? 'left',
        })),
      },
      footer: {
        style: 'dark',
        links: siteJson.footer.columns.map((col) => ({
          title: col.title,
          items: col.items.map((i) => (i.href ? {label: i.label, href: i.href} : {label: i.label, to: i.to})),
        })),
        copyright: `Copyright © ${new Date().getFullYear()} ${siteJson.title}`,
      },
      prism: {
        additionalLanguages: ['diff'],
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
