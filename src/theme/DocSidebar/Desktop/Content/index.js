import React, {useMemo} from 'react';
import {stripBaseUrl} from '@site/src/utils/ui';
import {Menu} from 'antd';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function buildItems(items, baseUrl) {
  return items
    .filter((item) => item.type !== 'html')
    .map((item, index) => {
      if (item.type === 'category') {
        return {
          key: item.href ?? `category-${index}`,
          label: item.href ? (
            <Link to={stripBaseUrl(item.href, baseUrl)} onClick={(e) => e.stopPropagation()}>
              {item.label}
            </Link>
          ) : (
            item.label
          ),
          children: item.items?.length ? buildItems(item.items, baseUrl) : undefined,
        };
      }
      return {
        key: item.href,
        label: <Link to={stripBaseUrl(item.href, baseUrl)}>{item.label}</Link>,
      };
    });
}

function collectCategoryKeys(items, acc = []) {
  for (const item of items) {
    if (item.children?.length) {
      acc.push(item.key);
      collectCategoryKeys(item.children, acc);
    }
  }
  return acc;
}

// 把侧边栏过滤成「只显示当前主题」的文档
function filterSidebarByPath(sidebar, path, baseUrl) {
  const rel = path?.startsWith(baseUrl) ? path.slice(baseUrl.length) : path ?? '';
  const slug = rel.split('/').filter(Boolean)[0];
  if (!slug) {
    return sidebar;
  }
  return sidebar.filter((item) => {
    const hrefs = [item.href, ...(item.items?.map((i) => i.href) ?? [])].filter(Boolean);
    return hrefs.some((h) => h.includes(`/${slug}/`) || h.endsWith(`/${slug}`));
  });
}

export default function DocSidebarDesktopContent({path, sidebar, className}) {
  const {siteConfig} = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl;

  const filtered = useMemo(
    () => filterSidebarByPath(sidebar, path, baseUrl),
    [sidebar, path, baseUrl],
  );
  const items = useMemo(() => buildItems(filtered, baseUrl), [filtered, baseUrl]);
  const defaultOpenKeys = useMemo(() => collectCategoryKeys(items), [items]);

  return (
    <div className={className}>
      <Menu
        mode="inline"
        selectedKeys={[path]}
        defaultOpenKeys={defaultOpenKeys}
        items={items}
        style={{borderInlineEnd: 'none', background: 'transparent', fontSize: 14}}
      />
    </div>
  );
}
