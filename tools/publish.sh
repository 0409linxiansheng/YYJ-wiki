#!/usr/bin/env bash
# 一键发布：把当前改动提交并推送到 GitHub，触发自动部署
set -e
cd "$(dirname "$0")/.."

if [ -z "$(git status --porcelain)" ]; then
  echo "✅ 没有需要发布的改动"
  exit 0
fi

echo "📦 正在提交以下改动："
git status --short
echo ""

git add -A
git commit -m "content: $(date '+%Y-%m-%d %H:%M')"
git push

echo ""
echo "✅ 已推送到 GitHub，约 2 分钟后线上生效"
echo "   线上地址：https://yyj-lin.github.io/YYJ-wiki/"
