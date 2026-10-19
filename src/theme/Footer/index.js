import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useThemeConfig} from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {Divider, Flex, Layout, Space, Typography, theme} from 'antd';
import SocialLinks from '@site/src/components/ui/SocialLinks';

const {Text, Link: AntLink} = Typography;

export default function Footer() {
  const {footer} = useThemeConfig();
  const {siteConfig} = useDocusaurusContext();
  const {token} = theme.useToken();
  const logoUrl = useBaseUrl('/img/logo.svg');

  if (!footer) {
    return null;
  }
  const {links = [], copyright} = footer;

  return (
    <Layout.Footer
      className="site-footer"
      style={{
        marginTop: 64,
        padding: '44px 24px 28px',
        color: token.colorText,
      }}>
      <div style={{maxWidth: 1200, margin: '0 auto'}}>
        <Flex wrap justify="space-between" gap={40}>
          {/* 区域 1：品牌介绍 */}
          <Flex vertical gap={12} style={{maxWidth: 300, minWidth: 220}}>
            <Flex align="center" gap={10}>
              <img
                src={logoUrl}
                alt=""
                width={30}
                height={30}
                style={{display: 'block'}}
              />
              <Text strong style={{fontSize: 17}}>
                {siteConfig.title}
              </Text>
            </Flex>
            <Text type="secondary" style={{lineHeight: 1.7}}>
              {siteConfig.tagline}
            </Text>
            <Flex gap={2} style={{marginTop: 2}}>
              <SocialLinks />
            </Flex>
          </Flex>

          {/* 区域 2/3/4：内容导航 / 相关资源 / 关于与反馈 */}
          <Flex wrap gap={56}>
            {links.map((column) => (
              <Flex vertical key={column.title} gap={10} style={{minWidth: 96}}>
                <Text strong style={{fontSize: 14}}>
                  {column.title}
                </Text>
                <Space direction="vertical" size={6}>
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

        <Divider style={{margin: '32px 0 16px'}} />
        <Text type="secondary" style={{fontSize: 13}}>
          {copyright}
        </Text>
      </div>
    </Layout.Footer>
  );
}
