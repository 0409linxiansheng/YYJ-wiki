// @ts-check
// 本文件在 Node 里执行，不要写浏览器端代码（DOM/JSX）。
import {themes as prismThemes} from 'prism-react-renderer';
import math from 'remark-math';
import katex from 'rehype-katex';
import footnotes from 'remark-footnotes';

// ============================================================
// 只需要改下面这两行，其余配置会自动跟着对齐
//   GITHUB_USER : 你的 GitHub 用户名或组织名
//   GITHUB_REPO : 仓库名（决定 baseUrl 和线上地址）
//   部署到 https://<user>.github.io/<repo>/
// 如果仓库名是 <user>.github.io（用户/组织主页），把 baseUrl 改成 '/'
// ============================================================
const GITHUB_USER = '0409linxiansheng';
const GITHUB_REPO = 'YYJ-wiki';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '云屿集',
  tagline: '业务分享与行业知识',
  favicon: 'img/favicon.svg',

  markdown: {
    mermaid: true,
  },

  future: {
    v4: true,
  },

  url: `https://${GITHUB_USER}.github.io`,
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
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: '云屿集',
        logo: {
          alt: '站点 Logo',
          src: 'img/logo.svg',
        },
        items: [
          {to: '/kb', label: '知识库', position: 'left'},
          {to: '/blog', label: '博客', position: 'left'},
          {
            href: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}`,
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '知识库',
            items: [
              {label: '全部主题', to: '/kb'},
              {label: '业务分享', to: '/business'},
              {label: '行业知识', to: '/industry'},
              {label: '工具资源', to: '/tools'},
            ],
          },
          {
            title: '关于',
            items: [
              {label: '关于本站', to: '/about'},
              {label: '写作指南', to: '/about/writing-guide'},
              {label: '组件演示', to: '/about/components'},
            ],
          },
          {
            title: '更多',
            items: [
              {label: '博客', to: '/blog'},
              {label: 'GitHub', href: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}`},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} 云屿集 · Built with Docusaurus.`,
      },
      prism: {
        additionalLanguages: ['diff'],
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
