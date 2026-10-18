import React, {useEffect, useRef} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useColorMode} from '@docusaurus/theme-common';

// ============================================================
// 评论系统配置（giscus）
// 开启步骤：
//   1. 仓库 Settings → Features → 勾选 Discussions（开启讨论区）
//   2. 打开 https://giscus.app/zh-CN
//   3. 填入仓库名 0409linxiansheng/YYJ-wiki，选一个分类
//   4. 页面下方会生成 data-repo-id 和 data-category-id，填到下面两个空值里
// 填好 repoId 和 categoryId 后，文末就会自动出现评论区。
// ============================================================
const GISCUS_CONFIG = {
  repo: '0409linxiansheng/YYJ-wiki',
  repoId: 'TODO_REPO_ID', // 替换为 giscus 给的 repo-id
  category: 'General',
  categoryId: 'TODO_CATEGORY_ID', // 替换为 giscus 给的 category-id
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'bottom',
  lang: 'zh-CN',
};

export default function Giscus() {
  const ref = useRef(null);
  const {siteConfig} = useDocusaurusContext();
  const {colorMode} = useColorMode();

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const theme = colorMode === 'dark' ? 'dark' : 'light';
    ref.current.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    Object.entries({
      ...GISCUS_CONFIG,
      theme,
      lang: 'zh-CN',
      loading: 'lazy',
    }).forEach(([key, value]) => {
      script.setAttribute(`data-${key}`, value);
    });
    ref.current.appendChild(script);
  }, [colorMode]);

  // 未配置 repoId/categoryId 时不渲染
  if (
    GISCUS_CONFIG.repoId === 'TODO_REPO_ID' ||
    GISCUS_CONFIG.categoryId === 'TODO_CATEGORY_ID'
  ) {
    return null;
  }

  return (
    <div style={{marginTop: 48}}>
      <div ref={ref} />
    </div>
  );
}
