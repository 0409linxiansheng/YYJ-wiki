import React from 'react';
import Link from '@docusaurus/Link';
import {useThemeConfig} from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {Divider, Flex, Layout, Space, Typography, theme} from 'antd';

const {Text, Link: AntLink} = Typography;

export default function Footer() {
  const {footer} = useThemeConfig();
  const {siteConfig} = useDocusaurusContext();
  const {token} = theme.useToken();

  if (!footer) {
    return null;
  }
  const {links = [], copyright} = footer;

  return (
    <Layout.Footer
      className="site-footer"
      style={{
        marginTop: 64,
        padding: '40px 24px 28px',
        color: token.colorText,
      }}>
      <div style={{maxWidth: 1200, margin: '0 auto'}}>
        <Flex wrap justify="space-between" gap={32}>
          <Flex vertical gap={8} style={{maxWidth: 320}}>
            <Text strong style={{fontSize: 16}}>
              {siteConfig.title}
            </Text>
            <Text type="secondary">{siteConfig.tagline}</Text>
          </Flex>

          <Flex wrap gap={48}>
            {links.map((column) => (
              <Flex vertical key={column.title} gap={8}>
                <Text strong>{column.title}</Text>
                <Space direction="vertical" size={4}>
                  {column.items.map((item) => (
                    <span key={item.label}>
                      {item.href ? (
                        <AntLink href={item.href} target="_blank" rel="noreferrer">
                          {item.label}
                        </AntLink>
                      ) : item.to ? (
                        <Link to={item.to}>{item.label}</Link>
                      ) : (
                        <Text type="secondary">{item.label}</Text>
                      )}
                    </span>
                  ))}
                </Space>
              </Flex>
            ))}
          </Flex>
        </Flex>

        <Divider style={{margin: '28px 0 16px'}} />
        <Text type="secondary" style={{fontSize: 13}}>
          {copyright}
        </Text>
      </div>
    </Layout.Footer>
  );
}
