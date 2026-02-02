#!/bin/bash

# Jarvis Dashboard API 启动脚本

cd /home/admin/clawd

# 确保数据目录存在
mkdir -p data

# 检查 Node.js 是否可用
if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装"
    exit 1
fi

# 检查是否需要安装依赖
if [ ! -f "package.json" ]; then
    echo "创建 package.json..."
    npm init -y
    npm install express cors helmet morgan --save
fi

# 启动 API 服务器
echo "启动 Jarvis Dashboard API 服务器..."
echo "端口: 3001"
echo "访问地址: http://localhost:3001"
echo ""

node api/server.js