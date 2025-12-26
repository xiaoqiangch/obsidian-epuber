#!/bin/bash

# 安装脚本：将ePub阅读器插件安装到TESTBRAIN仓库

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查目标目录
TARGET_DIR="../testBrain/.obsidian/plugins/obsidian-epub-plugin"
SOURCE_DIR="."

print_info "开始安装ePub阅读器插件到TESTBRAIN仓库..."

# 检查源目录是否存在必要的文件
if [ ! -f "manifest.json" ]; then
    print_error "manifest.json 文件不存在！"
    exit 1
fi

if [ ! -f "main.js" ]; then
    print_warning "main.js 文件不存在，尝试构建..."
    npm run build
    if [ ! -f "main.js" ]; then
        print_error "构建失败，main.js 文件不存在！"
        exit 1
    fi
fi

# 检查styles.css是否存在，如果不存在则创建空文件
if [ ! -f "styles.css" ]; then
    print_warning "styles.css 文件不存在，创建空文件..."
    touch styles.css
fi

# 创建目标目录
print_info "创建目标目录: $TARGET_DIR"
mkdir -p "$TARGET_DIR"

# 复制必要的文件
print_info "复制插件文件..."
cp -v manifest.json "$TARGET_DIR/"
cp -v main.js "$TARGET_DIR/"
cp -v styles.css "$TARGET_DIR/" 2>/dev/null || print_warning "styles.css 复制失败，继续安装..."

# 复制其他可能需要的文件
if [ -f "versions.json" ]; then
    cp -v versions.json "$TARGET_DIR/"
fi

# 检查是否复制成功
if [ -f "$TARGET_DIR/manifest.json" ] && [ -f "$TARGET_DIR/main.js" ]; then
    print_info "插件安装成功！"
    print_info "安装位置: $TARGET_DIR"
    
    # 显示安装的文件
    echo ""
    print_info "已安装的文件:"
    ls -la "$TARGET_DIR/"
    
    # 显示插件信息
    echo ""
    print_info "插件信息:"
    cat "$TARGET_DIR/manifest.json" | grep -E '(name|version|author)' | sed 's/^/  /'
    
    echo ""
    print_info "请在Obsidian中启用插件："
    print_info "1. 打开Obsidian设置"
    print_info "2. 进入'社区插件'"
    print_info "3. 关闭'安全模式'"
    print_info "4. 刷新插件列表"
    print_info "5. 找到'ePub Reader'并启用"
    
else
    print_error "插件安装失败！"
    exit 1
fi

print_info "安装完成！"