import React from 'react';
import {Flex, Typography} from 'antd';

const {Title} = Typography;

// 区块标题：左侧标题 + 右侧可选计数/链接
export default function SectionHeading({title, extra, style}) {
  return (
    <Flex
      justify="space-between"
      align="baseline"
      wrap
      gap={8}
      style={{marginBottom: 20, ...style}}>
      <Title level={2} style={{margin: 0, fontSize: 22}}>
        {title}
      </Title>
      {extra}
    </Flex>
  );
}
