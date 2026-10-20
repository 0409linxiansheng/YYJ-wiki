#!/usr/bin/env bash
# 安装为开机自启的 systemd 服务（需要 sudo）
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_BIN="$(dirname "$(command -v node)")"
RUN_USER="${SUDO_USER:-$(whoami)}"
SERVICE=/etc/systemd/system/yyj-editor.service

cat > "$SERVICE" <<SVC
[Unit]
Description=云屿集内容管理后台
After=network.target

[Service]
Type=simple
User=${RUN_USER}
WorkingDirectory=${SCRIPT_DIR}
Environment=PATH=${NODE_BIN}:/usr/local/bin:/usr/bin:/bin
ExecStart=${NODE_BIN}/node ${SCRIPT_DIR}/server.mjs
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
SVC

systemctl daemon-reload
systemctl enable --now yyj-editor
systemctl status yyj-editor --no-pager
