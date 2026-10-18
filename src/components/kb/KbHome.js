import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import {Breadcrumb, Col, Empty, Flex, Input, Row, Typography} from 'antd';
import {SearchOutlined} from '@ant-design/icons';
import kbIndex from '@generated/kb-routes/default/kb-index.json';
import CategoryCard from '@site/src/components/ui/CategoryCard';
import SectionHeading from '@site/src/components/ui/SectionHeading';
import {formatDate, stripBaseUrl} from '@site/src/utils/ui';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const {Title, Paragraph, Text} = Typography;

export default function KbHome() {
  const {siteConfig} = useDocusaurusContext();
  const {categories, recent} = kbIndex;
  const baseUrl = siteConfig.baseUrl;

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
          <Breadcrumb items={[{title: <Link to="/">首页</Link>}, {title: '知识库'}]} />
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
        <SectionHeading title="全部主题" />
        {categories.length === 0 ? (
          <Empty description="还没有分类" />
        ) : (
          <Row gutter={[24, 24]}>
            {categories.map((category) => (
              <Col xs={24} md={12} key={category.slug}>
                <CategoryCard
                  icon={category.icon}
                  label={category.label}
                  desc={category.desc}
                  count={category.count}
                  subcategories={category.subcategories}
                  to={`/kb/c/${category.slug}`}
                />
              </Col>
            ))}
          </Row>
        )}
      </section>

      <section style={{maxWidth: 1120, margin: '0 auto', padding: '48px 24px 96px'}}>
        <SectionHeading title="最近更新" />
        {recent.length === 0 ? (
          <Empty description="暂无更新记录" />
        ) : (
          <Flex vertical gap={0}>
            {recent.map((doc) => (
              <Link
                key={doc.permalink}
                to={stripBaseUrl(doc.permalink, baseUrl)}
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
