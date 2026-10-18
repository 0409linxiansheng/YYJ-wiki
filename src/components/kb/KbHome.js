import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {Breadcrumb, Card, Col, Empty, Flex, Input, Row, Tag, Typography} from 'antd';
import {
  ArrowRightOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  FolderOutlined,
  GlobalOutlined,
  ReadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import kbIndex from '@generated/kb-routes/default/kb-index.json';

const {Title, Paragraph, Text} = Typography;

const ICONS = {
  database: <DatabaseOutlined />,
  global: <GlobalOutlined />,
  'cloud-server': <CloudServerOutlined />,
  read: <ReadOutlined />,
  folder: <FolderOutlined />,
};

function formatDate(value) {
  if (!value) {
    return '';
  }
  return new Date(value).toLocaleDateString('zh-CN');
}

export default function KbHome() {
  const {siteConfig} = useDocusaurusContext();
  const {categories, recent} = kbIndex;

  return (
    <Layout title="知识库" description="按主题组织的技术知识库">
      <section
        style={{
          padding: '64px 24px 40px',
          borderBottom: '1px solid var(--line)',
          background:
            'radial-gradient(900px 300px at 50% -20%, rgba(37,99,235,0.10), transparent 70%)',
        }}>
        <div style={{maxWidth: 1120, margin: '0 auto'}}>
          <Breadcrumb
            items={[
              {title: <Link to="/">首页</Link>},
              {title: '知识库'},
            ]}
          />
          <Title level={1} style={{margin: '16px 0 8px', fontSize: 38}}>
            知识库
          </Title>
          <Paragraph style={{color: 'var(--muted-fg)', fontSize: 16, maxWidth: 560}}>
            按主题查找教程、配置指南和问题解决方案。
          </Paragraph>
          <div style={{maxWidth: 520, marginTop: 24}}>
            <Input
              size="large"
              readOnly
              prefix={<SearchOutlined />}
              placeholder="搜索文档、命令、主题…"
              onClick={() => window.dispatchEvent(new Event('yyj:open-search'))}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  window.dispatchEvent(new Event('yyj:open-search'));
                }
              }}
              style={{height: 46, borderRadius: 10, cursor: 'pointer'}}
            />
          </div>
        </div>
      </section>

      <section style={{maxWidth: 1120, margin: '0 auto', padding: '48px 24px 0'}}>
        <Title level={2} style={{fontSize: 22, marginBottom: 20}}>
          全部主题
        </Title>
        {categories.length === 0 ? (
          <Empty description="还没有分类" />
        ) : (
          <Row gutter={[24, 24]}>
            {categories.map((category) => (
              <Col xs={24} md={12} key={category.slug}>
                <Link to={`/kb/c/${category.slug}`} style={{display: 'block', height: '100%'}}>
                  <Card
                    hoverable
                    style={{height: '100%', borderRadius: 12}}
                    styles={{body: {padding: 24}}}>
                    <Flex vertical gap={12}>
                      <Flex align="center" justify="space-between">
                        <Text style={{fontSize: 22, color: 'var(--brand-700)'}}>
                          {ICONS[category.icon] ?? ICONS.folder}
                        </Text>
                        <Tag bordered={false}>{category.count} 篇</Tag>
                      </Flex>
                      <Text strong style={{fontSize: 17}}>
                        {category.label}
                      </Text>
                      <Text type="secondary">{category.desc}</Text>
                      <Flex gap={6} wrap>
                        {category.subcategories.slice(0, 4).map((sub) => (
                          <Tag key={sub.slug} bordered={false} color="blue">
                            {sub.label}
                          </Tag>
                        ))}
                      </Flex>
                      <Text style={{color: 'var(--brand-700)', fontSize: 13}}>
                        进入分类 <ArrowRightOutlined style={{fontSize: 11}} />
                      </Text>
                    </Flex>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        )}
      </section>

      <section style={{maxWidth: 1120, margin: '0 auto', padding: '48px 24px 96px'}}>
        <Title level={2} style={{fontSize: 22, marginBottom: 20}}>
          最近更新
        </Title>
        {recent.length === 0 ? (
          <Empty description="暂无更新记录" />
        ) : (
          <Flex vertical gap={0}>
            {recent.map((doc) => (
              <Link
                key={doc.permalink}
                to={doc.permalink.replace(siteConfig.baseUrl.replace(/\/$/, ''), '')}
                style={{display: 'block', padding: '16px 0', borderBottom: '1px solid var(--line)'}}>
                <Flex justify="space-between" align="center" gap={16}>
                  <Flex vertical gap={4}>
                    <Text strong>{doc.title}</Text>
                    <Text type="secondary" style={{fontSize: 13}}>
                      {doc.category}
                    </Text>
                  </Flex>
                  <Text type="secondary" style={{fontSize: 13, whiteSpace: 'nowrap'}}>
                    {formatDate(doc.updatedAt)}
                  </Text>
                </Flex>
              </Link>
            ))}
          </Flex>
        )}
      </section>
    </Layout>
  );
}
