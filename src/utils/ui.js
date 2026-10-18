// 共享工具：日期格式化、baseUrl 剥离、阅读时长标签

export function formatDate(value, opts) {
  if (!value) {
    return '';
  }
  return new Date(value).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...opts,
  });
}

// 把含 baseUrl 的 permalink 转成 Docusaurus <Link to> 需要的站点相对路径
export function stripBaseUrl(url, baseUrl) {
  if (!url) {
    return url;
  }
  return url.startsWith(baseUrl) ? `/${url.slice(baseUrl.length)}` : url;
}

export function readingTimeLabel(minutes) {
  return minutes != null ? `约 ${Math.max(1, Math.round(minutes))} 分钟` : '';
}
