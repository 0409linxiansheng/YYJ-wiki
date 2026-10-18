import React from 'react';
import Layout from '@theme/Layout';
import {formatDate, stripBaseUrl} from '@site/src/utils/ui';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {HtmlClassNameProvider, ThemeClassNames} from '@docusaurus/theme-common';
import {
  BlogPostProvider,
  useBlogPost,
} from '@docusaurus/plugin-content-blog/client';
import BlogPostItem from '@theme/BlogPostItem';
import BlogPostPaginator from '@theme/BlogPostPaginator';
import BlogPostPageMetadata from '@theme/BlogPostPage/Metadata';
import BlogPostPageStructuredData from '@theme/BlogPostPage/StructuredData';
import TOC from '@theme/TOC';
import ContentVisibility from '@theme/ContentVisibility';
import {Card, Col, Row, Tag, Typography} from 'antd';
import blogIndex from '@generated/kb-routes/default/blog-index.json';

const {Title, Text} = Typography;


function RelatedArticles() {
  const {siteConfig} = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl;
  const {metadata} = useBlogPost();
  const currentTags = new Set((metadata.tags ?? []).map((t) => (typeof t === 'string' ? t : t.label)));
  const related = blogIndex.posts
    .filter((post) => post.permalink !== metadata.permalink)
    .map((post) => ({
      ...post,
      score: post.tags.filter((tag) => currentTags.has(tag)).length,
    }))
    .sort((a, b) => b.score - a.score || (a.date < b.date ? 1 : -1))
    .slice(0, 3);

  if (related.length === 0) {
    return null;
  }

  return (
    <section style={{marginTop: 48}}>
      <Title level={3} style={{fontSize: 20, marginBottom: 16}}>
        相关文章
      </Title>
      <Row gutter={[20, 20]}>
        {related.map((post) => (
          <Col xs={24} md={8} key={post.permalink}>
            <Link to={stripBaseUrl(post.permalink, baseUrl)} style={{display: 'block', height: '100%'}}>
              <Card hoverable size="small" style={{height: '100%', borderRadius: 10}}>
                <Text strong style={{display: 'block', lineHeight: 1.4}}>
                  {post.title}
                </Text>
                <Text type="secondary" style={{fontSize: 12, display: 'block', marginTop: 6}}>
                  {formatDate(post.date)}
                </Text>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </section>
  );
}

function BlogPostPageContent({sidebar, children}) {
  const {metadata, toc} = useBlogPost();
  const {nextItem, prevItem, frontMatter} = metadata;
  const {
    hide_table_of_contents: hideTableOfContents,
    toc_min_heading_level: tocMinHeadingLevel,
    toc_max_heading_level: tocMaxHeadingLevel,
  } = frontMatter;
  const showToc = !hideTableOfContents && toc.length > 0;
  return (
    <Layout title={metadata.title} description={metadata.description}>
      <div className="blog-post-shell">
        {showToc && (
          <aside className="blog-post-toc">
            <TOC
              toc={toc}
              minHeadingLevel={tocMinHeadingLevel}
              maxHeadingLevel={tocMaxHeadingLevel}
            />
          </aside>
        )}
        <div className="blog-post-body">
          <ContentVisibility metadata={metadata} />
          <BlogPostItem>{children}</BlogPostItem>
          {(nextItem || prevItem) && (
            <BlogPostPaginator nextItem={nextItem} prevItem={prevItem} />
          )}
          <RelatedArticles />
        </div>
      </div>
    </Layout>
  );
}

export default function BlogPostPage(props) {
  const BlogPostContent = props.content;
  return (
    <BlogPostProvider content={props.content} isBlogPostPage>
      <HtmlClassNameProvider
        className={clsx(
          ThemeClassNames.wrapper.blogPages,
          ThemeClassNames.page.blogPostPage,
        )}>
        <BlogPostPageMetadata />
        <BlogPostPageStructuredData />
        <BlogPostPageContent sidebar={props.sidebar}>
          <BlogPostContent />
        </BlogPostPageContent>
      </HtmlClassNameProvider>
    </BlogPostProvider>
  );
}
