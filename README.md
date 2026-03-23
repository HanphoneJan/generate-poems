# 诗歌生成器

## 📝 项目简介

诗歌生成器是一个基于 Next.js 15 构建的现代化 Web 应用，支持多种诗歌体裁的智能生成。用户可以选择诗歌类型并输入主题，系统将生成相应风格的诗歌作品。

在线预览地址：[https://hanphone.cn/generate-poems](https://hanphone.cn/generate-poems/)

## ✨ 项目特性

- 🎨 **多种诗歌体裁**：支持唐诗、宋词、楚辞、汉赋、现代诗、十四行诗、俳句等
- 🎯 **智能生成**：基于 AI 算法生成符合所选体裁风格的诗歌
- 💾 **历史记录**：自动保存生成的诗歌，支持查看历史记录
- 💾 **本地数据库**：使用 Prisma 和 SQLite 存储诗歌数据
- 📥 **下载功能**：支持将生成的诗歌下载为文本文件
- 📱 **响应式设计**：适配各种屏幕尺寸

## 🛠️ 技术栈

| 技术         | 版本   | 用途      |
| ------------ | ------ | --------- |
| Next.js      | 15.5.7 | 前端框架  |
| TypeScript   | 5.x    | 类型安全  |
| Tailwind CSS | 4.x    | 样式框架  |
| Shadcn UI    | -      | UI 组件库 |
| Prisma       | 6.11.1 | ORM       |
| SQLite       | -      | 数据库    |
| React        | 18.x   | UI 库     |

## 🚀 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- npm 或 yarn 或 pnpm
- Docker（可选，用于 Docker 部署）

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/HanphoneJan/generate-poems.git
cd generate-poems
```

2. **安装依赖**

```bash
npm install
```

3. **设置环境变量**

创建 `.env` 文件，添加以下内容：

```bash
DATABASE_URL="file:./db/custom.db"  # ./ 代表 prisma 文件夹的根目录
API_BASE_URL="https://api.deepseek.com" #我使用了 DeepSeek 的 API 地址，可替换为其他 API 地址
API_KEY="xxxxx" # 替换为实际的 API 密钥
PORT=4666 # 项目运行端口
NODE_ENV=development # 可选，设置为 development 或 production
OPENAI_API_KEY="xxxxx" # 设置这个是为了Docker部署时，解决OPENAI_SDK触发的环境变量错误
```

4. **初始化数据库**

```bash
npm run db:push
npm run db:generate
```

5. **启动开发服务器**

```bash
npm run dev
```

6. **访问应用**

打开浏览器访问 `http://localhost:4666`

7. **部署**

```bash
npm run build
npm run start
```

## 🐳 Docker 部署

本项目支持使用 Docker 进行部署，适合在生产环境中快速部署和扩展。

详细部署教程请查看：[Docker部署教程.md](Docker部署教程.md)



## 📁 项目结构

```
├── prisma/              # Prisma 配置和数据库文件
├── public/              # 静态资源
├── src/
│   ├── app/             # Next.js 应用路由
│   │   ├── api/         # API 端点
│   │   ├── globals.css  # 全局样式
│   │   ├── layout.tsx   # 布局组件
│   │   └── page.tsx     # 主页面
│   ├── components/      # 自定义组件
│   │   └── ui/          # Shadcn UI 组件
│   ├── hooks/           # 自定义钩子
│   └── lib/             # 工具函数
├── .env                 # 环境变量
├── .dockerignore        # Docker 忽略文件
├── .gitignore           # Git 忽略文件
├── LICENSE              # 许可证
├── README.md            # 项目说明
├── components.json      # Shadcn 组件配置
├── eslint.config.mjs    # ESLint 配置
├── next.config.ts       # Next.js 配置
├── package.json         # 项目依赖
├── postcss.config.mjs   # PostCSS 配置
├── tailwind.config.ts   # Tailwind CSS 配置
└── tsconfig.json        # TypeScript 配置
```

## 📡 API 端点

### GET /api/poems

获取所有生成的诗歌列表

**响应示例**：

```json
{
  "poems": [
    {
      "id": "1",
      "type": "唐诗",
      "theme": "春天",
      "content": "春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。",
      "createdAt": "2025-12-29T08:00:00.000Z"
    }
  ]
}
```

### POST /api/poems

保存生成的诗歌

**请求体**：

```json
{
  "type": "唐诗",
  "theme": "春天",
  "content": "春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。"
}
```

**响应示例**：

```json
{
  "id": "1",
  "type": "唐诗",
  "theme": "春天",
  "content": "春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。",
  "createdAt": "2025-12-29T08:00:00.000Z"
}
```

### POST /api/generate-poem

生成诗歌

**请求体**：

```json
{
  "type": "tang",
  "theme": "春天"
}
```

**响应示例**：

```json
{
  "poem": "春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。"
}
```

## 🎯 使用示例

1. **选择诗歌类型**：从下拉菜单中选择想要生成的诗歌类型，如"唐诗"、"宋词"等
2. **输入主题**：在文本框中输入诗歌主题，如"春天"、"思乡"、"爱情"等
3. **生成诗歌**：点击"生成诗歌"按钮，等待系统生成诗歌
4. **查看结果**：在右侧区域查看生成的诗歌
5. **下载诗歌**：点击"下载"按钮将诗歌保存为文本文件
6. **查看历史**：在左侧"最近创作"区域查看之前生成的诗歌

## Star History

<a href="https://www.star-history.com/?repos=HanphoneJan%2Fgenerate-poems&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/image?repos=HanphoneJan/generate-poems&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/image?repos=HanphoneJan/generate-poems&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/image?repos=HanphoneJan/generate-poems&type=date&legend=top-left" />
 </picture>
</a>
