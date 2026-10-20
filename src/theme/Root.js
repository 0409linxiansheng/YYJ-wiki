import React from 'react';
import {App as AntApp, ConfigProvider, theme as antdTheme} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import siteJson from '@site/site.config.json';

// 读取 Docusaurus 写在 <html data-theme> 上的主题，桥接给 antd 的 algorithm
function useHtmlTheme() {
  const [mode, setMode] = React.useState('light');
  React.useEffect(() => {
    const el = document.documentElement;
    const read = () =>
      setMode(el.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    read();
    const observer = new MutationObserver(read);
    observer.observe(el, {attributes: true, attributeFilter: ['data-theme']});
    return () => observer.disconnect();
  }, []);
  return mode;
}

export default function Root({children}) {
  const mode = useHtmlTheme();
  const primary = siteJson.theme?.primary ?? '#3b5bdb';
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm:
          mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: siteJson.theme?.primary ?? '#3b5bdb',
          colorInfo: siteJson.theme?.primary ?? '#3b5bdb',
          colorLink: siteJson.theme?.primary ?? '#3b5bdb',
          borderRadius: 8,
          fontSize: 16,
          fontFamily:
            "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
          fontFamilyCode: "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace",
        },
      }}>
      <style>{`:root{--brand:${primary};--brand-700:${primary};--ifm-color-primary:${primary};--ifm-color-primary-dark:${primary};}`}</style>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
