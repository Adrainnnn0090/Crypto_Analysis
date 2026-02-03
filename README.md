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

- 已支持真实新闻 RSS + 可选 NewsAPI 数据源
- 技术指标默认走 CryptoCompare（无 Key 也能跑，但频率有限）
- 数据会落地到 `data/*.json`，API 直接读取
- **重要**: 项目配置为 Serverless Functions 模式（不是静态导出），确保 API 路由正常工作
- Vercel 会自动处理 Serverless Functions 的部署和扩展

## 本地开发

```bash
npm run dev
```

访问 `http://localhost:3000` 查看开发版本。

## 真实新闻与自动更新

一次抓取（生成最新 JSON 数据）：

```bash
npm run scrape
```

实时抓取（默认每 10 分钟）：

```bash
npm run scrape:realtime
```

价格更新（默认每 30 秒）：

```bash
npm run price:realtime
```

### 常用环境变量

- `NEWS_API_KEY`：NewsAPI Key（可选）
- `NEWS_RSS_FEEDS`：自定义 RSS 列表，格式 `name|url,name|url`
- `NEWS_MAX_ARTICLES`：单次抓取最大文章数（默认 60）
- `NEWS_TIMEOUT_MS`：新闻请求超时（默认 12000）
- `SCRAPE_CRON`：定时任务 cron 表达式（默认 `*/10 * * * *`）
- `SCRAPE_COINS`：抓取币种（默认 `bitcoin,ethereum`）
- `CRYPTOCOMPARE_API_KEY`：CryptoCompare Key（可选）
- `PRICE_INTERVAL_MS`：价格更新间隔（默认 30000）
- `PRICE_COINS`：价格更新币种（默认 `bitcoin,ethereum`）
- `SOCIAL_SIMULATED`：是否启用社媒模拟数据（默认 `false`）
- `ALLOW_SAMPLE_DATA`：无数据时是否允许样本填充（默认 `false`）
