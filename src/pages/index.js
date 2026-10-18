import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useHistory} from '@docusaurus/router';
import {
  BookOutlined,
  DeploymentUnitOutlined,
  RocketOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {Button, Card, Col, Flex, Row, Space, Tag, Typography} from 'antd';

const {Title, Paragraph, Text} = Typography;

const FEATURES = [
  {
    icon: <BookOutlined />,
    title: '结构化文档',
    desc: 'Markdown 写内容，侧边栏、目录、上一页/下一页自动生成。',
  },
  {
    icon: <ThunderboltOutlined />,
    title: '静态即达',
    desc: '构建产物是纯静态文件，推到 GitHub 就能上线，无服务器成本。',
  },
  {
    icon: <DeploymentUnitOutlined />,
    title: '可深度定制',
    desc: '组件、主题、路由都是 React，能按需要重写任何一层。',
  },
];

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const history = useHistory();

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <div
        style={{
          padding: '88px 24px 64px',
          background:
            'linear-gradient(180deg, rgba(22,119,255,0.10) 0%, rgba(22,119,255,0) 70%)',
        }}>
        <div style={{maxWidth: 960, margin: '0 auto', textAlign: 'center'}}>
          <Tag color="blue" style={{marginBottom: 20}}>
            Docusaurus × Ant Design
          </Tag>
          <Title level={1} style={{marginBottom: 12}}>
            {siteConfig.title}
          </Title>
          <Paragraph style={{fontSize: 18, maxWidth: 620, margin: '0 auto 32px'}}>
            {siteConfig.tagline}
          </Paragraph>
          <Space size="middle" wrap>
            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              onClick={() => history.push('/intro')}>
              开始阅读
            </Button>
            <Button
              size="large"
              onClick={() =>
                history.push('/blog')
              }>
              去看看博客
            </Button>
          </Space>
        </div>
      </div>

      <div style={{maxWidth: 1080, margin: '0 auto', padding: '0 24px 72px'}}>
        <Row gutter={[24, 24]}>
          {FEATURES.map((f) => (
            <Col xs={24} md={8} key={f.title}>
              <Card
                variant="borderless"
                styles={{body: {padding: 24}}}
                style={{height: '100%'}}>
                <Flex vertical gap={12}>
                  <Text style={{fontSize: 26, color: '#1677ff'}}>{f.icon}</Text>
                  <Text strong style={{fontSize: 17}}>
                    {f.title}
                  </Text>
                  <Text type="secondary">{f.desc}</Text>
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </Layout>
  );
}
