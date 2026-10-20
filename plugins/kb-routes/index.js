const siteJson = require('../../site.config.json');

const CATEGORY_ORDER = Object.entries(siteJson.categories ?? {})
  .sort((a, b) => (a[1].position ?? 99) - (b[1].position ?? 99))
  .map(([slug]) => slug);

const CATEGORY_META = Object.fromEntries(
  Object.entries(siteJson.categories ?? {}).map(([slug, c]) => [
    slug,
    {label: c.label, desc: c.desc, icon: c.icon ?? 'folder'},
  ]),
);

const DEFAULT_META = {label: null, desc: '暂无描述', icon: 'folder'};

module.exports = function kbRoutesPlugin(context) {
  const {siteDir, siteConfig} = context;
  const baseUrl = siteConfig.baseUrl;
  return {
    name: 'kb-routes',

    contentLoaded({actions}) {
      const fs = require('fs');
      const path = require('path');

      actions.addRoute({
        path: `${baseUrl}kb`,
        component: '@site/src/components/kb/KbHome.js',
        exact: true,
      });
    },

    allContentLoaded({allContent, actions}) {
      const docsData = allContent['docusaurus-plugin-content-docs']?.default;
      const version = docsData?.loadedVersions?.[0];
      const docs = version?.docs ?? [];

      const fs = require('fs');
      const path = require('path');
      const readCategoryLabel = (dirPath) => {
        try {
          const raw = fs.readFileSync(path.join(siteDir, 'docs', dirPath, '_category_.json'), 'utf8');
          return JSON.parse(raw).label ?? null;
        } catch {
          return null;
        }
      };

      const categories = new Map();

      for (const doc of docs) {
        const dir = doc.sourceDirName ?? '';
        const [top, sub] = dir.split('/');
        if (!top) {
          continue;
        }
        if (!categories.has(top)) {
          const meta = CATEGORY_META[top] ?? DEFAULT_META;
          categories.set(top, {
            slug: top,
            label: meta.label ?? top,
            desc: meta.desc,
            icon: meta.icon,
            docs: [],
            subcategories: new Map(),
          });
        }
        const category = categories.get(top);
        category.docs.push({
          title: doc.title,
          permalink: doc.permalink,
          description: doc.description ?? '',
          updatedAt: doc.lastUpdatedAt ?? null,
          position: doc.sidebar_position ?? 999,
          sub: sub ?? null,
        });
        if (sub) {
          category.subcategories.set(sub, (category.subcategories.get(sub) ?? 0) + 1);
        }
      }

      const sorted = [...categories.values()].sort(
        (a, b) => CATEGORY_ORDER.indexOf(a.slug) - CATEGORY_ORDER.indexOf(b.slug),
      );

      const index = {
        categories: sorted.map((c) => ({
          slug: c.slug,
          label: c.label,
          desc: c.desc,
          icon: c.icon,
          count: c.docs.length,
          subcategories: [...c.subcategories.entries()].map(([slug, count]) => ({
            slug,
            label: readCategoryLabel(`${c.slug}/${slug}`) ?? slug,
            count,
          })),
          docs: c.docs
            .sort((a, b) => (a.updatedAt ?? '') < (b.updatedAt ?? '') ? 1 : -1)
            .map((d) => ({
              title: d.title,
              permalink: d.permalink,
              description: d.description,
              updatedAt: d.updatedAt,
            })),
        })),
        recent: docs
          .filter((d) => d.lastUpdatedAt)
          .sort((a, b) => (a.lastUpdatedAt < b.lastUpdatedAt ? 1 : -1))
          .slice(0, 6)
          .map((d) => ({
            title: d.title,
            permalink: d.permalink,
            updatedAt: d.lastUpdatedAt,
            category: (d.sourceDirName ?? '').split('/')[0],
          })),
      };

      actions.createData('kb-index.json', JSON.stringify(index));

      // ---- 博客索引 ----
      const blogData = allContent['docusaurus-plugin-content-blog']?.default;
      const rawPosts = blogData?.blogPosts ?? [];
      const postList = Array.isArray(rawPosts) ? rawPosts : Object.values(rawPosts);
      const posts = postList.map((entry) => {
        const m = entry.metadata ?? entry;
        return {
          title: m.title,
          permalink: m.permalink,
          description: m.description ?? '',
          date: m.date,
          tags: (m.tags ?? []).map((t) => (typeof t === 'string' ? t : t.label)),
          featured: Boolean(m.frontMatter?.featured),
          readingTime: m.readingTime ?? null,
        };
      }).sort((a, b) => (a.date < b.date ? 1 : -1));

      actions.createData(
        'blog-index.json',
        JSON.stringify({
          posts,
          featured: posts.find((p) => p.featured) ?? null,
          tags: [...new Set(posts.flatMap((p) => p.tags))],
          debugKeys: Object.keys(blogData ?? {}),
        }),
      );
    },
  };
};
