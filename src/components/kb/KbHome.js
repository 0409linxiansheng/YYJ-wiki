import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {CalendarOutlined, SearchOutlined} from '@ant-design/icons';
import {Breadcrumb, Empty, Flex, Input, Typography} from 'antd';
import kbIndex from '@generated/kb-routes/default/kb-index.json';
import CategoryCard from '@site/src/components/ui/CategoryCard';
import {formatDate, stripBaseUrl} from '@site/src/utils/ui';

const {Title, Paragraph, Text} = Typography;

export default function KbHome() {
  const {siteConfig} = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl;
  const {categories, recent} = kbIndex;

  // 主题卡片链接到该主题的「目录文档」（内容区）
  const themeTo = (category) => {
    const rel = (url) => (url ?? '').replace(baseUrl, '').replace(/\/$/, '');
    const index = category.docs.find(
      (d) => rel(d.permalink) === `/${category.slug}` || rel(d.permalink) === category.slug,
    );
    const target = index?.permalink ?? category.docs[0]?.permalink;
    return stripBaseUrl(target, baseUrl);
  };

  return (
    <Layout title="知识库" description="按主题组织的技术知识库">
      {/* Header 居中 */}
      <section
        style={{
          textAlign: 'center',
          padding: '56px 24px 36px',
          borderBottom: '1px solid var(--line)',
          background:
            'radial-gradient(900px 300px at 50% -20%, rgba(37,99,235,0.10), transparent 70%)',
        }}>
        <div style={{maxWidth: 720, margin: '0 auto'}}>
          <div style={{display: 'inline-block'}}>
            <Breadcrumb items={[{title: <Link to="/">首页</Link>}, {title: '知识库'}]} />
          </div>
          <Title level={1} style={{margin: '16px 0 8px', fontSize: 38}}>
            知识库
          </Title>
          <Paragraph
            style={{color: 'var(--muted-fg)', fontSize: 16, maxWidth: 560, margin: '0 auto'}}>
            按主题浏览业务分享与行业知识。
          </Paragraph>
          <div style={{maxWidth: 520, margin: '24px auto 0'}}>
            <Input
              size="large"
              readOnly
              prefix={<SearchOutlined style={{color: 'var(--muted-fg)'}} />}
              placeholder="搜索内容、主题、关键词…"
              onClick={() => window.dispatchEvent(new Event('yyj:open-search'))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  window.dispatchEvent(new Event('yyj:open-search'));
                }
              }}
              style={{height: 46, borderRadius: 10, cursor: 'pointer'}}
            />
          </div>
        </div>
      </section>

      {/* 两栏：左 80% 主题卡片，右 20% 最近更新 */}
      <section style={{maxWidth: 1200, margin: '0 auto', padding: '40px 24px 96px'}}>
        <div className="kb-home-cols">
          <div className="kb-themes-col">
            <Title level={2} style={{fontSize: 20, marginBottom: 16}}>
              全部主题
            </Title>
            <div className="kb-theme-grid">
              {categories.map((c) => (
                <CategoryCard
                  key={c.slug}
                  icon={c.icon}
                  label={c.label}
                  desc={c.desc}
                  count={c.count}
                  subcategories={c.subcategories}
                  to={themeTo(c)}
                />
              ))}
            </div>
          </div>

          <div className="kb-recent-col">
            <Title level={2} style={{fontSize: 20, marginBottom: 16}}>
              最近更新
            </Title>
            {recent.length === 0 ? (
              <Empty description="暂无更新" />
            ) : (
              <Flex vertical gap={0}>
                {recent.slice(0, 10).map((doc) => (
                  <Link
                    key={doc.permalink}
                    to={stripBaseUrl(doc.permalink, baseUrl)}
                    style={{display: 'block', padding: '12px 0', borderBottom: '1px solid var(--line)'}}>
                    <Flex vertical gap={4}>
                      <Text strong style={{lineHeight: 1.5, fontSize: 14}}>
                        {doc.title}
                      </Text>
                      <Text type="secondary" style={{fontSize: 12}}>
                        <CalendarOutlined /> {formatDate(doc.updatedAt)}
                      </Text>
                    </Flex>
                  </Link>
                ))}
              </Flex>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
