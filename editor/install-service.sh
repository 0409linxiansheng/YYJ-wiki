#!/usr/bin/env bash
# 安装为开机自启的 systemd 服务（需要 sudo）
#   sudo ./install-service.sh
#   干跑（只生成并打印，不安装）：DRY_RUN=1 ./install-service.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUN_USER="${SUDO_USER:-$(whoami)}"
TARGET="${TARGET_FILE:-/etc/systemd/system/yyj-editor.service}"

# sudo 下 PATH 会被重置，需要显式找 node 的绝对路径
NODE_PATH=""
for candidate in \
  "$(command -v node 2>/dev/null || true)" \
  "/home/${RUN_USER}/.local/node/bin/node" \
  "/usr/local/bin/node" \
  "/usr/bin/node"; do
  if [ -n "$candidate" ] && [ -x "$candidate" ]; then
    NODE_PATH="$candidate"
    break
  fi
done
if [ -z "$NODE_PATH" ]; then
  echo "❌ 找不到 node，请先确认 node 安装路径"
  exit 1
fi
NODE_BIN="$(dirname "$NODE_PATH")"
echo "✅ node: $NODE_PATH"
echo "✅ 运行用户: $RUN_USER"

cat > "$TARGET" <<SVC
[Unit]
Description=YYJ Wiki Editor
After=network.target

[Service]
Type=simple
User=${RUN_USER}
WorkingDirectory=${SCRIPT_DIR}
Environment=PATH=${NODE_BIN}:/usr/local/bin:/usr/bin:/bin
ExecStart=${NODE_PATH} ${SCRIPT_DIR}/server.mjs
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
SVC

if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "----- 生成的 unit -----"
  cat "$TARGET"
  echo "-----------------------"
  exit 0
fi

systemctl daemon-reload
systemctl enable yyj-editor
systemctl restart yyj-editor
sleep 2
systemctl status yyj-editor --no-pager -l | head -12
