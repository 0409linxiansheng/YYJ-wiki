import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {Button, Col, Empty, Flex, Row, Tag, Typography} from 'antd';
import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';
import blogIndex from '@generated/kb-routes/default/blog-index.json';
import ArticleCard from '@site/src/components/ui/ArticleCard';
import SectionHeading from '@site/src/components/ui/SectionHeading';
import {formatDate, stripBaseUrl} from '@site/src/utils/ui';

const {Title, Paragraph, Text} = Typography;

export default function BlogListPage({metadata}) {
  const {siteConfig} = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl;

  const {posts} = blogIndex;
  const page = metadata.page ?? 1;
  const perPage = metadata.postsPerPage ?? 10;
  const pagePosts = posts.slice((page - 1) * perPage, page * perPage);

  return (
    <Layout title={metadata.blogTitle} description={metadata.blogDescription}>
      <section
        style={{
          padding: '64px 24px 40px',
          borderBottom: '1px solid var(--line)',
          background:
            'radial-gradient(900px 300px at 20% -20%, rgba(37,99,235,0.10), transparent 70%)',
        }}>
        <div style={{maxWidth: 1120, margin: '0 auto'}}>
          <Text
            style={{
              fontFamily: 'var(--ifm-font-family-monospace)',
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--muted-fg)',
            }}>
            Tech Notes · Articles &amp; Field Reports
          </Text>
          <Title level={1} style={{margin: '16px 0 8px', fontSize: 40}}>
            {metadata.blogTitle}
          </Title>
          <Paragraph style={{color: 'var(--muted-fg)', fontSize: 16, maxWidth: 640}}>
            {metadata.blogDescription}
          </Paragraph>
          <Flex gap={8} wrap style={{marginTop: 16}}>
            {blogIndex.tags.slice(0, 6).map((tag) => (
              <Tag key={tag} bordered={false}>
                {tag}
              </Tag>
            ))}
          </Flex>
        </div>
      </section>

      <section style={{maxWidth: 1120, margin: '0 auto', padding: '48px 24px 96px'}}>
        <SectionHeading
          title="最新文章"
          extra={
            <Text type="secondary" style={{fontSize: 13}}>
              第 {page} / {metadata.totalPages ?? 1} 页
            </Text>
          }
        />

        {pagePosts.length === 0 ? (
          <Empty description="暂无文章" />
        ) : (
          <Row gutter={[24, 24]}>
            {pagePosts.map((post) => (
              <Col xs={24} sm={12} lg={8} key={post.permalink}>
                <ArticleCard
                  to={stripBaseUrl(post.permalink, baseUrl)}
                  title={post.title}
                  description={post.description}
                  date={post.date}
                  tags={post.featured ? ['精选', ...(post.tags ?? [])] : post.tags}
                  readingTime={post.readingTime}
                />
              </Col>
            ))}
          </Row>
        )}

        <Flex justify="center" gap={12} style={{marginTop: 40}}>
          {metadata.previousPage && (
            <Link to={stripBaseUrl(metadata.previousPage, baseUrl)}>
              <Button icon={<ArrowLeftOutlined />}>上一页</Button>
            </Link>
          )}
          {metadata.nextPage && (
            <Link to={stripBaseUrl(metadata.nextPage, baseUrl)}>
              <Button>下一页 <ArrowRightOutlined /></Button>
            </Link>
          )}
        </Flex>
      </section>
    </Layout>
  );
}
