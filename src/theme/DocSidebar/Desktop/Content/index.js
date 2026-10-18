import React, {useMemo} from 'react';
import {Menu} from 'antd';
import {useHistory} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function buildItems(items) {
  return items
    .filter((item) => item.type !== 'html')
    .map((item, index) => {
      if (item.type === 'category') {
        const key = item.href ?? `category-${index}`;
        return {
          key,
          label: item.label,
          children: item.items?.length ? buildItems(item.items) : undefined,
        };
      }
      return {key: item.href, label: item.label};
    });
}

function findOpenKeys(items, activePath, acc = []) {
  for (const item of items) {
    if (item.children?.length) {
      if (JSON.stringify(item.children).includes(activePath)) {
        acc.push(item.key);
        findOpenKeys(item.children, activePath, acc);
      }
    }
  }
  return acc;
}

export default function DocSidebarDesktopContent({path, sidebar, className}) {
  const history = useHistory();
  const {siteConfig} = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl;

  const items = useMemo(() => buildItems(sidebar), [sidebar]);
  const defaultOpenKeys = useMemo(() => findOpenKeys(items, path), [items, path]);

  return (
    <div className={className}>
      <Menu
        mode="inline"
        selectedKeys={[path]}
        defaultOpenKeys={defaultOpenKeys}
        items={items}
        onClick={({key}) => {
          if (typeof key === 'string' && key.startsWith('/')) {
            const to = key.startsWith(baseUrl) ? key.slice(baseUrl.length - 1) : key;
            history.push(to);
          }
        }}
        style={{
          borderInlineEnd: 'none',
          background: 'transparent',
          fontSize: 14,
        }}
      />
    </div>
  );
}
