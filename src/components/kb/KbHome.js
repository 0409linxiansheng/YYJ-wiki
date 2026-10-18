import React, {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  FolderOutlined,
  GlobalOutlined,
  ReadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {Breadcrumb, Button, Empty, Flex, Input, Tag, Typography} from 'antd';
import kbIndex from '@generated/kb-routes/default/kb-index.json';
import {formatDate, stripBaseUrl} from '@site/src/utils/ui';

const {Title, Paragraph, Text} = Typography;

const ICONS = {
  database: <DatabaseOutlined />,
  global: <GlobalOutlined />,
  'cloud-server': <CloudServerOutlined />,
  read: <ReadOutlined />,
  folder: <FolderOutlined />,
};

export default function KbHome() {
  const {siteConfig} = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl;
  const {search} = useLocation();
  const {categories, recent} = kbIndex;

  const initialSlug = useMemo(() => new URLSearchParams(search).get('c'), [search]);
  const [activeSlug, setActiveSlug] = useState(initialSlug);

  useEffect(() => {
    if (initialSlug) {
      setActiveSlug(initialSlug);
    }
  }, [initialSlug]);

  const activeCategory = activeSlug
    ? categories.find((c) => c.slug === activeSlug)
    : null;

  const recentTen = recent.slice(0, 10);

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
            按主题查找教程、配置指南和问题解决方案。
          </Paragraph>
          <div style={{maxWidth: 520, margin: '24px auto 0'}}>
            <Input
              size="large"
              readOnly
              prefix={<SearchOutlined style={{color: 'var(--muted-fg)'}} />}
              placeholder="搜索文档、命令、主题…"
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

      {!activeCategory ? (
        /* 首页：左 70% 主题，右 30% 最近更新 */
        <section style={{maxWidth: 1200, margin: '0 auto', padding: '40px 24px 96px'}}>
          <div className="kb-home-cols">
            <div className="kb-themes-col">
              <Title level={2} style={{fontSize: 20, marginBottom: 16}}>
                全部主题
              </Title>
              <div className="kb-theme-list">
                {categories.map((c) => (
                  <div
                    key={c.slug}
                    className="kb-theme-item"
                    onClick={() => setActiveSlug(c.slug)}>
                    <Text style={{fontSize: 16, color: 'var(--brand-700)'}}>
                      {ICONS[c.icon] ?? ICONS.folder}
                    </Text>
                    <Text style={{flex: 1, color: 'inherit'}}>{c.label}</Text>
                    <Tag bordered={false}>{c.count}</Tag>
                  </div>
                ))}
              </div>
            </div>

            <div className="kb-recent-col">
              <Title level={2} style={{fontSize: 20, marginBottom: 16}}>
                最近更新
              </Title>
              {recentTen.length === 0 ? (
                <Empty description="暂无更新" />
              ) : (
                <Flex vertical gap={0}>
                  {recentTen.map((doc) => (
                    <Link
                      key={doc.permalink}
                      to={stripBaseUrl(doc.permalink, baseUrl)}
                      style={{display: 'block', padding: '12px 0', borderBottom: '1px solid var(--line)'}}>
                      <Flex vertical gap={4}>
                        <Text strong style={{lineHeight: 1.5}}>
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
      ) : (
        /* 主题视图：只显示该主题文档 */
        <section style={{maxWidth: 1000, margin: '0 auto', padding: '40px 24px 96px'}}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => setActiveSlug(null)}
            style={{paddingLeft: 0, marginBottom: 8}}>
            返回全部主题
          </Button>

          <Breadcrumb
            items={[
              {title: <Link to="/">首页</Link>},
              {title: <Link to="/kb">知识库</Link>},
              {title: activeCategory.label},
            ]}
          />

          <Title level={1} style={{margin: '16px 0 8px', fontSize: 32}}>
            {activeCategory.label}
          </Title>
          <Paragraph style={{color: 'var(--muted-fg)', fontSize: 16, marginBottom: 8}}>
            {activeCategory.desc}
          </Paragraph>
          <Text type="secondary" style={{fontSize: 13}}>
            共 {activeCategory.count} 篇
          </Text>

          <Flex vertical gap={0} style={{marginTop: 24}}>
            {activeCategory.docs.map((doc) => (
              <Link
                key={doc.permalink}
                to={stripBaseUrl(doc.permalink, baseUrl)}
                style={{display: 'block', padding: '16px 0', borderBottom: '1px solid var(--line)'}}>
                <Flex justify="space-between" align="center" gap={16}>
                  <Flex vertical gap={4} style={{minWidth: 0}}>
                    <Flex align="center" gap={8}>
                      <FileTextOutlined style={{color: 'var(--muted-fg)'}} />
                      <Text strong>{doc.title}</Text>
                    </Flex>
                    {doc.description && (
                      <Text type="secondary" style={{fontSize: 13}}>
                        {doc.description}
                      </Text>
                    )}
                  </Flex>
                  <Text type="secondary" style={{fontSize: 12, whiteSpace: 'nowrap'}}>
                    <CalendarOutlined /> {formatDate(doc.updatedAt)}
                  </Text>
                </Flex>
              </Link>
            ))}
          </Flex>
        </section>
      )}
    </Layout>
  );
}
