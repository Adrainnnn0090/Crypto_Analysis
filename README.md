# Crypto Analysis Dashboard

实时比特币和以太坊新闻聚合 + 技术分析仪表板

## 部署到 Vercel

### 方法 1: 一键部署（推荐）

点击下面的按钮直接部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/crypto-analysis-dashboard&project-name=crypto-analysis-dashboard&repository-name=crypto-analysis-dashboard)

### 方法 2: 手动部署

1. **安装 Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**:
   ```bash
   vercel login
   ```

3. **部署项目**:
   ```bash
   vercel --prod
   ```

### 方法 3: GitHub 集成

1. 将此仓库推送到您的 GitHub
2. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 "New Project"
4. 选择此仓库
5. 点击 "Deploy"

## 项目结构

- `pages/index.js` - 主页面
- `pages/api/health.js` - 健康检查 API
- `pages/api/news/[coin].js` - 新闻 API 路由
- `pages/api/technical/[coin].js` - 技术分析 API 路由
- `data/` - 静态数据文件（在实际使用中，您可能需要连接到真实的数据源）

## API 端点

- `GET /api/health` - 健康检查
- `GET /api/news/bitcoin` - 比特币新闻
- `GET /api/news/ethereum` - 以太坊新闻  
- `GET /api/technical/bitcoin` - 比特币技术分析
- `GET /api/technical/ethereum` - 以太坊技术分析

## 技术栈

- Next.js 14
- React 18
- Tailwind CSS
- Framer Motion (动画)
- Vercel Serverless Functions

## 注意事项

- 当前使用静态 JSON 文件作为数据源
- 在生产环境中，建议连接到真实的加密货币新闻和市场数据 API
- **重要**: 项目配置为 Serverless Functions 模式（不是静态导出），确保 API 路由正常工作
- Vercel 会自动处理 Serverless Functions 的部署和扩展

## 本地开发

```bash
npm run dev
```

访问 `http://localhost:3000` 查看开发版本。