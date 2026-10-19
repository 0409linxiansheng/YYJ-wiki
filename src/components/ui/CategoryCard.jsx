import React from 'react';
import Link from '@docusaurus/Link';
import {Card, Flex, Tag, Typography} from 'antd';
import {
  ArrowRightOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  FolderOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  ProjectOutlined,
  ReadOutlined,
  ToolOutlined,
} from '@ant-design/icons';

const {Text} = Typography;

const ICONS = {
  database: <DatabaseOutlined />,
  global: <GlobalOutlined />,
  'cloud-server': <CloudServerOutlined />,
  read: <ReadOutlined />,
  folder: <FolderOutlined />,
  project: <ProjectOutlined />,
  tool: <ToolOutlined />,
  info: <InfoCircleOutlined />,
};

// 知识库大类卡片
export default function CategoryCard({icon, label, desc, count, subcategories, to}) {
  return (
    <Link to={to} style={{display: 'block', height: '100%'}}>
      <Card hoverable style={{height: '100%', borderRadius: 12}} styles={{body: {padding: 24}}}>
        <Flex vertical gap={12}>
          <Flex align="center" justify="space-between">
            <Text style={{fontSize: 22, color: 'var(--brand-700)'}}>
              {ICONS[icon] ?? ICONS.folder}
            </Text>
            <Tag bordered={false}>{count} 篇</Tag>
          </Flex>
          <Text strong style={{fontSize: 17}}>
            {label}
          </Text>
          <Text type="secondary">{desc}</Text>
          {subcategories?.length > 0 && (
            <Flex gap={6} wrap>
              {subcategories.slice(0, 4).map((sub) => (
                <Tag key={sub.slug} bordered={false} color="blue">
                  {sub.label}
                </Tag>
              ))}
            </Flex>
          )}
          <Text style={{color: 'var(--brand-700)', fontSize: 13}}>
            进入分类 <ArrowRightOutlined style={{fontSize: 11}} />
          </Text>
        </Flex>
      </Card>
    </Link>
  );
}
