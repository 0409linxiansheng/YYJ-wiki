import React from 'react';
import {Segmented, Tooltip} from 'antd';
import {LaptopOutlined, MoonOutlined, SunOutlined} from '@ant-design/icons';
import {useColorMode} from '@docusaurus/theme-common';

export default function NavbarColorModeToggle({className}) {
  const {colorMode, setColorMode} = useColorMode();
  return (
    <Segmented
      className={className}
      size="small"
      value={colorMode ?? 'system'}
      onChange={(value) => setColorMode(value === 'system' ? null : value)}
      options={[
        {
          value: 'system',
          icon: (
            <Tooltip title="跟随系统">
              <LaptopOutlined />
            </Tooltip>
          ),
        },
        {
          value: 'light',
          icon: (
            <Tooltip title="浅色">
              <SunOutlined />
            </Tooltip>
          ),
        },
        {
          value: 'dark',
          icon: (
            <Tooltip title="深色">
              <MoonOutlined />
            </Tooltip>
          ),
        },
      ]}
    />
  );
}
