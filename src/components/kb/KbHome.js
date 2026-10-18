import React, {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';
import {
  AppstoreOutlined,
  CalendarOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  FolderOutlined,
  GlobalOutlined,
  ReadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {Breadcrumb, Button, Col, Empty, Flex, Input, Row, Tag, Typography} from 'antd';
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
  const [view, setView] = useState({type: 'recent'});
  const [filter, setFilter] = useState('');

  // 读取 ?c=<slug> 深链（SSR 阶段拿不到 query，需在 mount 后同步）
  useEffect(() => {
    if (initialSlug) {
      setView({type: 'theme', slug: initialSlug});
    }
  }, [initialSlug]);

  const allDocs = useMemo(
    () =>
      categories.flatMap((c) =>
        c.docs.map((d) => ({...d, category: c.slug, categoryLabel: c.label})),
      ),
    [categories],
  );

  const filteredCategories = useMemo(
    () =>
      categories.filter((c) =>
        c.label.toLowerCase().includes(filter.trim().toLowerCase()),
      ),
    [categories, filter],
  );

  // 计算右侧展示内容
  let displayTitle = '最近更新';
  let displayDocs = recent.map((r) => ({
    ...r,
    categoryLabel: categories.find((c) => c.slug === r.category)?.label ?? r.category,
  }));

  if (view.type === 'all') {
    displayTitle = '全部内容';
    displayDocs = allDocs;
  } else if (view.type === 'theme') {
    const c = categories.find((x) => x.slug === view.slug);
    if (c) {
      displayTitle = c.label;
      displayDocs = c.docs;
    }
  }

  return (
    <Layout title="知识库" description="按主题组织的技术知识库">
      {/* Hero 居中 */}
      <section
        style={{
          textAlign: 'center',
          padding: '64px 24px 40px',
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

      {/* 两栏内容区 */}
      <section style={{maxWidth: 1200, margin: '0 auto', padding: '40px 24px 96px'}}>
        <Row gutter={[40, 32]}>
          {/* 左：全部主题 + 筛选 + 全部内容 */}
          <Col xs={24} md={7}>
            <div style={{position: 'sticky', top: 88}}>
              <Flex justify="space-between" align="center" style={{marginBottom: 12}}>
                <Text strong style={{fontSize: 15}}>
                  全部主题
                </Text>
                <Text type="secondary" style={{fontSize: 12}}>
                  {categories.length} 个主题
                </Text>
              </Flex>

              <Flex gap={8} style={{marginBottom: 12}}>
                <Input
                  allowClear
                  prefix={<SearchOutlined style={{color: 'var(--muted-fg)'}} />}
                  placeholder="筛选主题…"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  style={{flex: 1}}
                />
                <Button
                  type={view.type === 'all' ? 'primary' : 'default'}
                  onClick={() => setView({type: 'all'})}>
                  <AppstoreOutlined /> 全部内容
                </Button>
              </Flex>

              <div className="kb-theme-list">
                {filteredCategories.map((c) => {
                  const active = view.type === 'theme' && view.slug === c.slug;
                  return (
                    <div
                      key={c.slug}
                      className={'kb-theme-item' + (active ? ' active' : '')}
                      onClick={() => setView({type: 'theme', slug: c.slug})}>
                      <Text style={{fontSize: 16, color: 'var(--brand-700)'}}>
                        {ICONS[c.icon] ?? ICONS.folder}
                      </Text>
                      <Text style={{flex: 1, color: 'inherit'}}>{c.label}</Text>
                      <Tag bordered={false}>{c.count}</Tag>
                    </div>
                  );
                })}
                {filteredCategories.length === 0 && (
                  <Text type="secondary" style={{fontSize: 13}}>
                    没有匹配的主题
                  </Text>
                )}
              </div>
            </div>
          </Col>

          {/* 右：内容区 */}
          <Col xs={24} md={17}>
            <Flex justify="space-between" align="baseline" style={{marginBottom: 16}}>
              <Title level={2} style={{margin: 0, fontSize: 22}}>
                {displayTitle}
              </Title>
              <Text type="secondary" style={{fontSize: 13}}>
                {displayDocs.length} 篇
              </Text>
            </Flex>

            {displayDocs.length === 0 ? (
              <Empty description="暂无内容" />
            ) : (
              <Flex vertical gap={0}>
                {displayDocs.map((doc) => (
                  <Link
                    key={doc.permalink}
                    to={stripBaseUrl(doc.permalink, baseUrl)}
                    style={{display: 'block', padding: '14px 0', borderBottom: '1px solid var(--line)'}}>
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
                      <Flex vertical gap={2} align="flex-end" style={{flexShrink: 0}}>
                        {doc.categoryLabel && (
                          <Text type="secondary" style={{fontSize: 12}}>
                            {doc.categoryLabel}
                          </Text>
                        )}
                        <Text type="secondary" style={{fontSize: 12, whiteSpace: 'nowrap'}}>
                          <CalendarOutlined /> {formatDate(doc.updatedAt)}
                        </Text>
                      </Flex>
                    </Flex>
                  </Link>
                ))}
              </Flex>
            )}
          </Col>
        </Row>
      </section>
    </Layout>
  );
}
