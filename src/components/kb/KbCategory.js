import React, {useMemo, useState} from 'react';
import {formatDate, stripBaseUrl} from '@site/src/utils/ui';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';
import {Breadcrumb, Card, Empty, Flex, List, Result, Tag, Typography} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import kbIndex from '@generated/kb-routes/default/kb-index.json';

const {Title, Paragraph, Text} = Typography;


export default function KbCategory() {
  const {siteConfig} = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl;
  const {pathname} = useLocation();
  const slug = pathname.replace(/\/$/, '').split('/').pop();
  const [activeSub, setActiveSub] = useState(null);

  const category = useMemo(
    () => kbIndex.categories.find((c) => c.slug === slug),
    [slug],
  );

  if (!category) {
    return (
      <Layout title="分类不存在">
        <Result
          status="404"
          title="分类不存在"
          subTitle={`没有找到「${slug}」这个分类`}
          extra={
            <Link to="/kb">
              <Text>返回知识库</Text>
            </Link>
          }
        />
      </Layout>
    );
  }

  const docs = activeSub
    ? category.docs.filter((doc) => doc.permalink.includes(`/${activeSub}/`))
    : category.docs;

  return (
    <Layout title={category.label} description={category.desc}>
      <section style={{maxWidth: 1040, margin: '0 auto', padding: '48px 24px 32px'}}>
        <Breadcrumb
          items={[
            {title: <Link to="/">首页</Link>},
            {title: <Link to="/kb">知识库</Link>},
            {title: category.label},
          ]}
        />
        <Flex justify="space-between" align="flex-end" wrap gap={16} style={{marginTop: 16}}>
          <div>
            <Title level={1} style={{margin: 0, fontSize: 34}}>
              {category.label}
            </Title>
            <Paragraph style={{margin: '8px 0 0', color: 'var(--muted-fg)'}}>
              {category.desc}
            </Paragraph>
          </div>
          <Text type="secondary" style={{fontSize: 13}}>
            共 {category.count} 篇
          </Text>
        </Flex>

        {category.subcategories.length > 0 && (
          <Flex gap={8} wrap style={{marginTop: 20}}>
            <Tag
              color={activeSub === null ? 'blue' : undefined}
              bordered={false}
              style={{cursor: 'pointer'}}
              onClick={() => setActiveSub(null)}>
              全部
            </Tag>
            {category.subcategories.map((sub) => (
              <Tag
                key={sub.slug}
                color={activeSub === sub.slug ? 'blue' : undefined}
                bordered={false}
                style={{cursor: 'pointer'}}
                onClick={() => setActiveSub(sub.slug)}>
                {sub.label} · {sub.count}
              </Tag>
            ))}
          </Flex>
        )}
      </section>

      <section style={{maxWidth: 1040, margin: '0 auto', padding: '0 24px 96px'}}>
        {docs.length === 0 ? (
          <Empty description="该分类下暂无文档" />
        ) : (
          <List
            dataSource={docs}
            renderItem={(doc) => (
              <List.Item style={{padding: 0, border: 'none', marginBottom: 12}}>
                <Link to={stripBaseUrl(doc.permalink, baseUrl)} style={{display: 'block', width: '100%'}}>
                  <Card
                    hoverable
                    style={{borderRadius: 10}}
                    styles={{body: {padding: '16px 20px'}}}>
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
                  </Card>
                </Link>
              </List.Item>
            )}
          />
        )}

        <Link to="/kb" style={{display: 'inline-block', marginTop: 24}}>
          <Text type="secondary">
            <ArrowLeftOutlined /> 返回知识库
          </Text>
        </Link>
      </section>
    </Layout>
  );
}
