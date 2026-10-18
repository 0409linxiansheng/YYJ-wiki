import React from 'react';
import {App as AntApp, ConfigProvider, theme as antdTheme} from 'antd';
import zhCN from 'antd/locale/zh_CN';

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
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm:
          mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#2563eb',
          colorInfo: '#2563eb',
          colorLink: '#2563eb',
          borderRadius: 8,
          fontSize: 16,
          fontFamily:
            "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
          fontFamilyCode: "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace",
        },
      }}>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
