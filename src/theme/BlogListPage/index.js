import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {Button, Card, Col, Empty, Flex, Row, Tag, Typography} from 'antd';
import {ArrowLeftOutlined, ArrowRightOutlined, CalendarOutlined} from '@ant-design/icons';
import blogIndex from '@generated/kb-routes/default/blog-index.json';
import ArticleCard from '@site/src/components/ui/ArticleCard';
import SectionHeading from '@site/src/components/ui/SectionHeading';
import {formatDate, stripBaseUrl} from '@site/src/utils/ui';

const {Title, Paragraph, Text} = Typography;

export default function BlogListPage({metadata}) {
  const {siteConfig} = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl;

  const {posts, featured} = blogIndex;
  const page = metadata.page ?? 1;
  const perPage = metadata.postsPerPage ?? 10;
  const pagePosts = posts.slice((page - 1) * perPage, page * perPage);
  const showFeatured = page === 1 && featured;
  const gridPosts = showFeatured
    ? pagePosts.filter((post) => post.permalink !== featured.permalink)
    : pagePosts;

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
        {showFeatured && (
          <Link to={stripBaseUrl(featured.permalink, baseUrl)} style={{display: 'block', marginBottom: 40}}>
            <Card hoverable style={{borderRadius: 14, overflow: 'hidden'}} styles={{body: {padding: 0}}}>
              <Row>
                <Col xs={24} md={15}>
                  <div style={{padding: '36px 32px'}}>
                    <Flex gap={8} align="center" style={{marginBottom: 14}}>
                      <Tag color="blue" bordered={false}>精选</Tag>
                      <Text type="secondary" style={{fontSize: 13}}>
                        <CalendarOutlined /> {formatDate(featured.date)}
                      </Text>
                    </Flex>
                    <Title level={2} style={{margin: '0 0 12px', fontSize: 28}}>
                      {featured.title}
                    </Title>
                    <Paragraph style={{color: 'var(--muted-fg)', fontSize: 15, marginBottom: 20}}>
                      {featured.description}
                    </Paragraph>
                    <Text style={{color: 'var(--brand-700)'}}>
                      阅读全文 <ArrowRightOutlined style={{fontSize: 11}} />
                    </Text>
                  </div>
                </Col>
                <Col xs={0} md={9}>
                  <div
                    style={{
                      height: '100%',
                      minHeight: 260,
                      background:
                        'linear-gradient(135deg, rgba(37,99,235,0.18), rgba(37,99,235,0.02))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--ifm-font-family-monospace)',
                      color: 'var(--brand-700)',
                      fontSize: 12,
                      letterSpacing: '0.2em',
                    }}>
                    FEATURED
                  </div>
                </Col>
              </Row>
            </Card>
          </Link>
        )}

        <SectionHeading
          title="最新文章"
          extra={
            <Text type="secondary" style={{fontSize: 13}}>
              第 {page} / {metadata.totalPages ?? 1} 页
            </Text>
          }
        />

        {gridPosts.length === 0 ? (
          <Empty description="暂无文章" />
        ) : (
          <Row gutter={[24, 24]}>
            {gridPosts.map((post) => (
              <Col xs={24} md={12} key={post.permalink}>
                <ArticleCard
                  to={stripBaseUrl(post.permalink, baseUrl)}
                  title={post.title}
                  description={post.description}
                  date={post.date}
                  tags={post.tags}
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
