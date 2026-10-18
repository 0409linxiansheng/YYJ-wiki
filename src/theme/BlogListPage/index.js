import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {Button, Card, Col, Empty, Flex, Row, Tag, Typography} from 'antd';
import {ArrowLeftOutlined, ArrowRightOutlined, CalendarOutlined} from '@ant-design/icons';
import blogIndex from '@generated/kb-routes/default/blog-index.json';

const {Title, Paragraph, Text} = Typography;

function formatDate(value) {
  return new Date(value).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogListPage({metadata}) {
  const {siteConfig} = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl;
  const strip = (url) => (url?.startsWith(baseUrl) ? `/${url.slice(baseUrl.length)}` : url);

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
          <Link to={strip(featured.permalink)} style={{display: 'block', marginBottom: 40}}>
            <Card
              hoverable
              style={{borderRadius: 14, overflow: 'hidden'}}
              styles={{body: {padding: 0}}}>
              <Row>
                <Col xs={24} md={15}>
                  <div style={{padding: '36px 32px'}}>
                    <Flex gap={8} align="center" style={{marginBottom: 14}}>
                      <Tag color="blue" bordered={false}>
                        精选
                      </Tag>
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

        <Flex justify="space-between" align="baseline" style={{marginBottom: 20}}>
          <Title level={2} style={{margin: 0, fontSize: 22}}>
            最新文章
          </Title>
          <Text type="secondary" style={{fontSize: 13}}>
            第 {page} / {metadata.totalPages ?? 1} 页
          </Text>
        </Flex>

        {gridPosts.length === 0 ? (
          <Empty description="暂无文章" />
        ) : (
          <Row gutter={[24, 24]}>
            {gridPosts.map((post) => (
              <Col xs={24} md={12} key={post.permalink}>
                <Link to={strip(post.permalink)} style={{display: 'block', height: '100%'}}>
                  <Card
                    hoverable
                    style={{height: '100%', borderRadius: 12}}
                    styles={{body: {padding: 24}}}>
                    <Flex vertical gap={10}>
                      <Flex gap={8} wrap>
                        {post.tags.slice(0, 2).map((tag) => (
                          <Tag key={tag} bordered={false} color="blue">
                            {tag}
                          </Tag>
                        ))}
                      </Flex>
                      <Text strong style={{fontSize: 17, lineHeight: 1.4}}>
                        {post.title}
                      </Text>
                      <Text type="secondary" style={{fontSize: 14, lineHeight: 1.7}}>
                        {post.description}
                      </Text>
                      <Text type="secondary" style={{fontSize: 12}}>
                        <CalendarOutlined /> {formatDate(post.date)}
                        {post.readingTime
                          ? ` · 约 ${Math.max(1, Math.round(post.readingTime))} 分钟`
                          : ''}
                      </Text>
                    </Flex>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        )}

        <Flex justify="center" gap={12} style={{marginTop: 40}}>
          {metadata.previousPage && (
            <Link to={strip(metadata.previousPage)}>
              <Button icon={<ArrowLeftOutlined />}>上一页</Button>
            </Link>
          )}
          {metadata.nextPage && (
            <Link to={strip(metadata.nextPage)}>
              <Button>下一页 <ArrowRightOutlined /></Button>
            </Link>
          )}
        </Flex>
      </section>
    </Layout>
  );
}
