# 基础镜像
FROM node:20-alpine AS base

# 安装依赖阶段
FROM base AS deps

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package.json package-lock.json ./

# 安装生产依赖
RUN npm ci --only=production && \
    npm cache clean --force

# 构建阶段
FROM base AS builder

WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 安装所有依赖（包括开发依赖）
RUN npm ci

# 生成 Prisma 客户端
RUN npx prisma generate

# 设置环境变量（构建阶段需要）
ARG NEXT_PUBLIC_BASE_PATH=/generate-poems
ARG API_KEY
ARG API_BASE_URL
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}
ENV API_KEY=${API_KEY}
ENV API_BASE_URL=${API_BASE_URL}
ENV OPENAI_API_KEY=${API_KEY}
ENV NODE_ENV=production

# 构建应用（传递所有环境变量）
RUN npm run build

# 运行阶段
FROM base AS runner

WORKDIR /app

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制必要的文件
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 设置权限
RUN chown -R nextjs:nodejs /app

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 4666

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=4666
ENV HOSTNAME="0.0.0.0"

# 启动应用
CMD ["node", "server.js"]
