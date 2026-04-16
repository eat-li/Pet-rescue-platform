#!/bin/bash
# 宠物服务平台部署脚本
# 在服务器上执行

echo "========== 宠物服务平台部署脚本 =========="

# 配置变量
PROJECT_DIR="/var/www/pet-service"
DB_NAME="pet_service"
DB_USER="pet_user"
DB_PASS="pet_service_123"

# 1. 更新系统
echo "[1/8] 更新系统..."
apt update && apt upgrade -y

# 2. 安装基础软件
echo "[2/8] 安装基础软件..."
apt install -y nginx git curl vim mysql-server

# 3. 安装Node.js
echo "[3/8] 安装Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
npm install -g pm2

# 4. 配置MySQL
echo "[4/8] 配置MySQL..."
systemctl start mysql
systemctl enable mysql

mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

echo "MySQL配置完成："
echo "  数据库：${DB_NAME}"
echo "  用户：${DB_USER}"
echo "  密码：${DB_PASS}"

# 5. 创建项目目录
echo "[5/8] 创建项目目录..."
mkdir -p ${PROJECT_DIR}
mkdir -p ${PROJECT_DIR}/users-dist
mkdir -p ${PROJECT_DIR}/admins-dist

# 6. 提示上传代码
echo "[6/8] 等待上传代码..."
echo "请执行以下操作："
echo "  1. 将后端代码上传到：${PROJECT_DIR}/server"
echo "  2. 将用户端dist上传到：${PROJECT_DIR}/users-dist"
echo "  3. 将管理端dist上传到：${PROJECT_DIR}/admins-dist"
echo ""
read -p "上传完成后按回车继续..."

# 7. 安装后端依赖并启动
echo "[7/8] 启动后端服务..."
cd ${PROJECT_DIR}/server
npm install

# 创建生产环境配置
cat > .env.production << EOF
PORT=3000
NODE_ENV=production
SERVER_DOMAIN=http://$(curl -s ifconfig.me):3000

DB_HOST=localhost
DB_USER=${DB_USER}
DB_PORT=3306
DB_PASSWORD=${DB_PASS}
DB_NAME=${DB_NAME}

DEFAULT_AVATAR_PATH=/avatar/default_avatar.jpg
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=86400s
EOF

pm2 start src/server.js --name pet-api
pm2 save
pm2 startup

# 8. 配置Nginx
echo "[8/8] 配置Nginx..."
cat > /etc/nginx/sites-available/pet-service << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        root /var/www/pet-service/users-dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /static/ {
        alias /var/www/pet-service/server/src/static/;
    }
}

server {
    listen 81;
    server_name _;

    location / {
        root /var/www/pet-service/admins-dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

ln -sf /etc/nginx/sites-available/pet-service /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl restart nginx

echo ""
echo "========== 部署完成 =========="
echo "用户端访问：http://$(curl -s ifconfig.me)"
echo "管理端访问：http://$(curl -s ifconfig.me):81"
echo ""
echo "常用命令："
echo "  查看后端日志：pm2 logs pet-api"
echo "  重启后端：pm2 restart pet-api"
echo "  重启Nginx：systemctl restart nginx"
