---
sidebar_position: 1
title: 环境准备
description: 安装 ERPNext 之前的系统依赖与版本确认
---

# 环境准备

本文记录 ERPNext 安装前的系统准备步骤。

## 前置依赖

```bash
sudo apt update
sudo apt install -y git python3 python3-pip python3-venv mariadb-server redis-server
```

## 版本确认

```bash
python3 --version
mariadb --version
node --version
```

## 下一步

确认依赖后，可以参考官方文档初始化 bench 环境。
