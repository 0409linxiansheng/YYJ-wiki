import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import {useLocation} from '@docusaurus/router';
import {Button, Flex, Menu, Space, Typography} from 'antd';
import {MenuOutlined} from '@ant-design/icons';
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle';
import NavbarMobileSidebar from '@theme/Navbar/MobileSidebar';
import SearchBar from '@theme/SearchBar';

const {Text} = Typography;

// 把 Docusaurus 的 navbar item 映射成 antd Menu 的 item
function normalizeItem(item) {
  if (item.type === 'docSidebar' || item.type === 'doc') {
    return {key: '/', path: '/', label: item.label};
  }
  if (item.type === 'dropdown') {
    return {
      key: item.label,
      label: item.label,
      children: (item.items ?? []).map((c) => {
        const n = normalizeItem(c);
        return {key: n.key, label: n.label};
      }),
    };
  }
  if (item.href) {
    return {key: item.href, href: item.href, label: item.label};
  }
  return {key: item.to ?? '/', path: item.to ?? '/', label: item.label};
}

function toMenuItems(items) {
  return items.map((item) => {
    const n = normalizeItem(item);
    const label = n.href ? (
      <a href={n.href} target="_blank" rel="noreferrer">
        {n.label}
      </a>
    ) : (
      <Link to={n.path}>{n.label}</Link>
    );
    return {key: n.key, label, children: n.children};
  });
}

export default function NavbarContent() {
  const {siteConfig} = useDocusaurusContext();
  const {navbar} = useThemeConfig();
  const mobileSidebar = useNavbarMobileSidebar();
  const logoUrl = useBaseUrl('/img/logo.svg');
  const location = useLocation();

  const leftItems = (navbar.items ?? []).filter((i) => i.position !== 'right');
  const rightItems = (navbar.items ?? []).filter((i) => i.position === 'right');
  const items = toMenuItems(leftItems);
  const selectedKey = items
    .map((i) => i.key)
    .filter((k) => k !== '/' && location.pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <div className="antd-navbar-inner">
      <Flex align="center" gap={16} style={{width: '100%'}}>
        <Button
          type="text"
          className="antd-navbar-burger"
          icon={<MenuOutlined />}
          onClick={() => mobileSidebar.toggle()}
          aria-label="打开菜单"
        />
        <Link to="/" className="antd-navbar-brand">
          <Flex align="center" gap={10}>
            <img
              src={logoUrl}
              alt=""
              width={28}
              height={28}
              style={{display: 'block'}}
            />
            <Text
              strong
              className="antd-navbar-brand-text"
              style={{fontSize: 16, whiteSpace: 'nowrap'}}>
              {siteConfig.title}
            </Text>
          </Flex>
        </Link>

        <div className="antd-navbar-menu">
          <Menu
            mode="horizontal"
            items={items}
            selectedKeys={selectedKey ? [selectedKey] : []}
            disabledOverflow
            style={{borderBottom: 'none', background: 'transparent', minWidth: 0}}
          />
        </div>

        <div style={{flex: 1}} />

        <Space size={8} align="center">
          <span className="antd-navbar-right-items">
            {toMenuItems(rightItems).map((i) => (
              <span key={i.key}>{i.label}</span>
            ))}
          </span>
          <SearchBar />
          <NavbarColorModeToggle />
        </Space>
      </Flex>
      {!mobileSidebar.disabled && <NavbarMobileSidebar />}
    </div>
  );
}
