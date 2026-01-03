# Docker 部署教程

## 前提条件

- Ubuntu 服务器（已安装 Docker）
- 服务器上至少 1GB 可用内存
- 服务器有 Node.js 18+ 和 Git（可选，用于克隆代码）

## 部署步骤

### 1. 克隆项目到服务器

```bash
# 在服务器上执行
cd /opt  # 或其他你喜欢的目录
sudo git clone https://github.com/HanphoneJan/generate-poems.git
cd generate-poems
```

或者手动上传项目文件到服务器。

### 2. 创建环境变量文件

```bash
# 复制环境变量模板
cp env.example .env

# 编辑环境变量文件
nano .env
```

填写以下内容（根据你的实际情况修改）：

```bash
DATABASE_URL="file:./db/custom.db"
API_BASE_URL="https://api.deepseek.com"
API_KEY="your-deepseek-api-key-here"  # 必须替换为你的真实 API Key
PORT=4666
NODE_ENV=production
OPENAI_API_KEY="xxxxx" # 设置这个是为了Docker部署时，解决OPENAI_SDK触发的环境变量错误
```

### 3. 构建 Docker 镜像

```bash
# 方式一：使用 docker-compose（推荐）
docker-compose build

# 方式二：使用 docker 命令
docker build -t generate-poems:latest .
```

### 4. 启动容器

```bash
# 使用 docker-compose 启动
docker-compose up -d

# 查看容器状态
docker-compose ps

# 查看容器日志
docker-compose logs -f app
```

### 5. 验证部署

```bash
# 检查容器是否正常运行
docker ps | grep generate-poems

# 测试应用是否可访问
curl http://localhost:4666/generate-poems
```

如果一切正常，你应该能看到应用的 HTML 内容。

### 6. 配置反向代理（可选，推荐）

#### 6.1 安装 Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

#### 6.2 创建 Nginx 配置文件

```bash
sudo nano /etc/nginx/sites-available/generate-poems
```

添加以下内容：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或服务器 IP

    location /generate-poems {
        proxy_pass http://localhost:4666;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # 可选：配置 HTTPS
    # listen 443 ssl;
    # ssl_certificate /path/to/cert.pem;
    # ssl_certificate_key /path/to/key.pem;
}
```

#### 6.3 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/generate-poems /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

现在你可以通过 `http://your-domain.com/generate-poems` 访问应用。

### 7. 配置 HTTPS（可选，使用 Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 常用管理命令

### 容器管理

```bash
# 启动容器
docker-compose up -d

# 停止容器
docker-compose down

# 重启容器
docker-compose restart

# 查看日志
docker-compose logs -f app

# 进入容器
docker-compose exec app sh

# 更新应用
git pull
docker-compose build
docker-compose up -d
```

### 数据库管理

```bash
# 查看数据库文件
ls -la prisma/db/

# 备份数据库
docker-compose exec app cp /app/prisma/db/custom.db /app/prisma/db/custom.db.backup

# 恢复数据库
docker-compose exec app cp /app/prisma/db/custom.db.backup /app/prisma/db/custom.db
```

## 故障排查

### 1. 容器无法启动

```bash
# 查看详细日志
docker-compose logs app

# 检查端口占用
sudo netstat -tlnp | grep 4666

# 检查 Docker 磁盘空间
docker system df
```

### 2. 应用无法访问

```bash
# 检查容器状态
docker ps | grep generate-poems

# 检查防火墙
sudo ufw status
sudo ufw allow 4666/tcp

# 检查容器内部网络
docker-compose exec app wget -O- http://localhost:4666/health
```

### 3. 数据库问题

```bash
# 进入容器
docker-compose exec app sh

# 检查数据库文件
ls -la /app/prisma/db/

# 重新生成 Prisma 客户端
npx prisma generate

# 推送数据库 schema
npx prisma db push
```

### 4. 构建失败

```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建
docker-compose build --no-cache
```

## 性能优化

### 1. 限制容器资源使用

在 `docker-compose.yml` 中添加：

```yaml
services:
  app:
    # ... 其他配置
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 2. 使用多阶段构建

已在 Dockerfile 中实现，可以减小镜像大小。

### 3. 启用 Docker 镜像缓存

在构建时使用 BuildKit：

```bash
DOCKER_BUILDKIT=1 docker-compose build
```

## 安全建议

1. **不要将 `.env` 文件提交到版本控制系统**
2. **定期更新基础镜像**：`docker pull node:20-alpine`
3. **使用最小权限原则运行容器**（已在 Dockerfile 中配置）
4. **配置防火墙规则**，只开放必要端口
5. **定期备份数据库文件**
6. **监控容器资源使用情况**
