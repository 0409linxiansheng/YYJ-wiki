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
          label: item.label,
          children: item.items?.length
            ? buildItems(item.items, baseUrl)
            : undefined,
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

export default function DocSidebarDesktopContent({path, sidebar, className}) {
  const {siteConfig} = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl;
  const items = useMemo(() => buildItems(sidebar, baseUrl), [sidebar, baseUrl]);
  // 默认展开全部分类，文档结构一眼可见
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
