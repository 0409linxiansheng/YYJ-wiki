import React from 'react';
import Link from '@docusaurus/Link';
import {Breadcrumb, Typography} from 'antd';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';
import kbIndex from '@generated/kb-routes/default/kb-index.json';

const {Text} = Typography;

// 用路径推导面包屑，避免依赖 useDoc（分类页没有 doc 上下文）
export default function DocBreadcrumbs() {
  const {siteConfig} = useDocusaurusContext();
  const {pathname} = useLocation();
  const baseUrl = siteConfig.baseUrl;

  const relative = pathname.startsWith(baseUrl)
    ? pathname.slice(baseUrl.length)
    : pathname.replace(/^\//, '');
  const segments = relative.replace(/\/$/, '').split('/').filter(Boolean);

  if (segments.length === 0 || segments[0] === 'category') {
    return null;
  }

  const category = kbIndex.categories.find((item) => item.slug === segments[0]);
  if (!category) {
    return null;
  }

  const doc = category.docs.find(
    (item) => item.permalink === pathname || item.permalink === `${pathname}/`,
  );
  const subLabel =
    segments.length > 2
      ? category.subcategories.find((item) => item.slug === segments[1])?.label ??
        segments[1]
      : null;

  const items = [
    {title: <Link to="/">首页</Link>},
    {title: <Link to="/kb">知识库</Link>},
    {title: <Link to={`/kb?c=${category.slug}`}>{category.label}</Link>},
    ...(subLabel ? [{title: subLabel}] : []),
    ...(doc ? [{title: <Text type="secondary">{doc.title}</Text>}] : []),
  ];

  return <Breadcrumb items={items} separator="›" style={{marginBottom: 20, fontSize: 13}} />;
}
