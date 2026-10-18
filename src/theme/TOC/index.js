import React from 'react';
import {Anchor, Typography} from 'antd';

const {Text} = Typography;

function toItems(items) {
  return items.map((item) => ({
    key: item.id,
    href: `#${item.id}`,
    title: item.value,
    children: item.children?.length ? toItems(item.children) : undefined,
  }));
}

export default function TOC({toc, className}) {
  if (!toc || toc.length === 0) {
    return null;
  }
  return (
    <div className={className} style={{position: 'sticky', top: 88}}>
      <Text strong style={{display: 'block', marginBottom: 8}}>
        本页目录
      </Text>
      <Anchor
        affix={false}
        items={toItems(toc)}
        targetOffset={96}
        style={{maxHeight: 'calc(100vh - 140px)', overflow: 'auto'}}
      />
    </div>
  );
}
