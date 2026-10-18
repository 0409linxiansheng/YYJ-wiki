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

  return (
    <Drawer
      open
      placement="left"
      width={320}
      closable={false}
      onClose={() => mobileSidebar.toggle()}
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
