import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useHistory} from '@docusaurus/router';
import {
  ArrowRightOutlined,
  BookOutlined,
  CodeOutlined,
  RocketOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {Button, Card, Col, Flex, Input, Row, Tag, Typography} from 'antd';

const {Title, Paragraph, Text} = Typography;

const ENTRIES = [
  {
    no: '01',
    icon: <RocketOutlined />,
    title: '快速开始',
    desc: '从零跑起来：安装依赖、启动开发服务器、理解目录结构。',
    to: '/guide/intro',
  },
  {
    no: '02',
    icon: <BookOutlined />,
    title: '核心概念',
    desc: '文档、侧边栏、版本与多语言，以及它们如何组织成站点。',
    to: '/guide/tutorial-basics/create-a-document',
  },
  {
    no: '03',
    icon: <CodeOutlined />,
    title: '定制与部署',
    desc: '主题定制、组件替换，以及推送到 GitHub Pages 的完整链路。',
    to: '/guide/tutorial-basics/deploy-your-site',
  },
];

function openSearch() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('yyj:open-search'));
  }
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const history = useHistory();

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          padding: '96px 24px 80px',
          borderBottom: '1px solid var(--line)',
          background:
            'radial-gradient(1200px 400px at 50% -10%, rgba(59,130,246,0.12), transparent 70%)',
        }}>
        <div
          style={{
            maxWidth: 880,
            margin: '0 auto',
            textAlign: 'center',
          }}>
          <Text
            style={{
              fontFamily: 'var(--ifm-font-family-monospace)',
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--muted-fg)',
            }}>
            Documentation / YYJ
          </Text>

          <Title
            level={1}
            style={{
              margin: '20px 0 16px',
              fontSize: 'clamp(34px, 5vw, 52px)',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}>
            {siteConfig.title}
          </Title>

          <Paragraph
            style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: 'var(--muted-fg)',
              maxWidth: 620,
              margin: '0 auto 32px',
            }}>
            {siteConfig.tagline}
          </Paragraph>

          {/* 搜索是这个页面的主行动 */}
          <div style={{maxWidth: 560, margin: '0 auto 20px'}}>
            <Input
              size="large"
              readOnly
              onClick={openSearch}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openSearch();
                }
              }}
              prefix={<SearchOutlined style={{color: 'var(--muted-fg)'}} />}
              suffix={
                <Text
                  style={{
                    fontFamily: 'var(--ifm-font-family-monospace)',
                    fontSize: 12,
                    color: 'var(--muted-fg)',
                    border: '1px solid var(--line)',
                    borderRadius: 4,
                    padding: '0 6px',
                  }}>
                  Ctrl K
                </Text>
              }
              placeholder="搜索文档、关键字…"
              style={{height: 48, borderRadius: 10, cursor: 'pointer'}}
            />
          </div>

          <Flex justify="center" gap={12} wrap>
            <Button
              type="primary"
              size="large"
              onClick={() => history.push('/guide/intro')}>
              开始阅读 <ArrowRightOutlined />
            </Button>
            <Button size="large" onClick={() => history.push('/blog')}>
              浏览博客
            </Button>
          </Flex>
        </div>
      </section>

      {/* 入口卡片 */}
      <section
        style={{maxWidth: 1120, margin: '0 auto', padding: '64px 24px 88px'}}>
        <Flex justify="space-between" align="baseline" wrap gap={8}>
          <Title level={2} style={{margin: 0, fontSize: 22}}>
            从这里开始
          </Title>
          <Tag bordered={false} style={{fontFamily: 'var(--ifm-font-family-monospace)'}}>
            3 个入口
          </Tag>
        </Flex>

        <Row gutter={[24, 24]} style={{marginTop: 28}}>
          {ENTRIES.map((entry) => (
            <Col xs={24} md={8} key={entry.no}>
              <Card
                hoverable
                variant="outlined"
                onClick={() => history.push(entry.to)}
                style={{height: '100%', borderRadius: 12}}
                styles={{body: {padding: 24}}}>
                <Flex vertical gap={14}>
                  <Flex justify="space-between" align="center">
                    <Text
                      style={{
                        fontSize: 24,
                        color: 'var(--brand-700)',
                      }}>
                      {entry.icon}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'var(--ifm-font-family-monospace)',
                        fontSize: 12,
                        color: 'var(--muted-fg)',
                      }}>
                      {entry.no}
                    </Text>
                  </Flex>
                  <Text strong style={{fontSize: 16}}>
                    {entry.title}
                  </Text>
                  <Text type="secondary" style={{lineHeight: 1.7}}>
                    {entry.desc}
                  </Text>
                  <Text
                    style={{
                      color: 'var(--brand-700)',
                      fontSize: 13,
                    }}>
                    进入 <ArrowRightOutlined style={{fontSize: 11}} />
                  </Text>
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </Layout>
  );
}
