import React from 'react';
import {Drawer} from 'antd';
import {
  useNavbarMobileSidebar,
  useNavbarSecondaryMenu,
} from '@docusaurus/theme-common/internal';

export default function NavbarMobileSidebarLayout({
  header,
  primaryMenu,
  secondaryMenu,
}) {
  const {shown: secondaryMenuShown} = useNavbarSecondaryMenu();
  const mobileSidebar = useNavbarMobileSidebar();

  // 关键：open 必须跟随 shown。Docusaurus 在手机端会一直渲染本组件
  // （shouldRender 为 true，用于 SSR），若 open 写死 true 抽屉就永远关不掉。
  return (
    <Drawer
      open={mobileSidebar.shown}
      placement="left"
      width={300}
      closable={false}
      onClose={() => mobileSidebar.toggle()}
      maskClosable
      styles={{
        body: {padding: 0, display: 'flex', flexDirection: 'column'},
      }}
      title={null}>
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--ant-color-border)',
          flex: '0 0 auto',
        }}>
        {header}
      </div>
      <div style={{padding: 12, overflow: 'auto', flex: 1}}>
        {secondaryMenuShown ? secondaryMenu : primaryMenu}
      </div>
    </Drawer>
  );
}
