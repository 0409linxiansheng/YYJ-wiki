// @ts-check
// 本文件在 Node 里执行，不要写浏览器端代码（DOM/JSX）。
import {themes as prismThemes} from 'prism-react-renderer';

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
  title: '我的文档站',
  tagline: 'Docusaurus 构建 · GitHub Pages 托管',
  favicon: 'img/favicon.ico',

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

  themes: [
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
          routeBasePath: '/',
          editUrl: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/tree/main/`,
        },
        blog: {
          showReadingTime: true,
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
        title: '我的文档站',
        logo: {
          alt: '站点 Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            to: '/intro',
            position: 'left',
            label: '教程',
          },
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
            title: '文档',
            items: [
              {
                label: '教程',
                to: '/intro',
              },
            ],
          },
          {
            title: '社区',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
            ],
          },
          {
            title: '更多',
            items: [
              {
                label: '博客',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}`,
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} 我的文档站 · Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
