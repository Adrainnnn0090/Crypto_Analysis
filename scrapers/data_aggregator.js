const NewsScraper = require('./news_scraper');
const SocialScraper = require('./social_scraper');
const CryptoAnalyzer = require('./crypto_analyzer');
const TechnicalAnalyzer = require('./technicalAnalyzer');
const PriceService = require('./price_service');
const fs = require('fs');
const path = require('path');

class DataAggregator {
  constructor() {
    this.newsScraper = new NewsScraper();
    this.socialScraper = new SocialScraper();
    this.analyzer = new CryptoAnalyzer();
    this.technicalAnalyzer = new TechnicalAnalyzer(process.env.CRYPTOCOMPARE_API_KEY || null);
    this.priceService = new PriceService();
    this.allowSampleData = process.env.ALLOW_SAMPLE_DATA === 'true';
    this.dataDir = path.join(__dirname, '../data');
  }

  async aggregateAndAnalyze(crypto) {
    console.log(`\n=== Starting data aggregation and analysis for ${crypto} ===`);
    
    try {
      // 1. 抓取新闻数据
      console.log('Fetching news data...');
      let newsData = await this.newsScraper.fetchNews(crypto, this.newsScraper.maxArticles);
      
      if (!newsData || !newsData.articles || newsData.articles.length === 0) {
        console.warn('No news data fetched, using fallback data');
        // 使用现有数据作为后备
        const fallbackData = this.readJsonIfExists(path.join(this.dataDir, `${crypto}_news_v2.json`))
          || this.readJsonIfExists(path.join(this.dataDir, `${crypto}_news.json`));
        if (fallbackData) {
          newsData = fallbackData;
        }
      }
      
      // 确保至少有一些新闻数据
      if (newsData.articles.length === 0 && this.allowSampleData) {
        newsData.articles = this.generateSampleNews(crypto, 20);
      }

      newsData.sourceCount = newsData.sourceCount || new Set(newsData.articles.map(article => article.source)).size;
      if (typeof newsData.sentimentScore !== 'number') {
        newsData.sentimentScore = this.calculateSentimentScore(newsData.articles);
      }
      
      console.log(`Fetched ${newsData.articles.length} news articles`);

      // 2. 抓取社交媒体数据
      console.log('Fetching social media data...');
      const socialData = await this.socialScraper.fetchSocialData(crypto);
      console.log(`Fetched ${socialData.posts.length} social media posts`);

      // 3. 获取价格数据
      console.log('Fetching price data...');
      let priceData = await this.priceService.fetchPrice(crypto);
      if (!priceData) {
        const cachedPrice = this.readJsonIfExists(path.join(this.dataDir, `${crypto}_price.json`));
        if (cachedPrice) {
          priceData = cachedPrice;
        } else if (this.allowSampleData) {
          priceData = this.getSamplePriceData(crypto);
        }
      }

      if (priceData?.current_price) {
        console.log(`Current price: $${priceData.current_price}`);
      } else {
        console.warn('Price data unavailable');
      }

      // 4. 获取技术指标数据
      console.log('Fetching technical indicators...');
      const indicatorData = await this.technicalAnalyzer.analyzeCoin(crypto);
      if (!indicatorData) {
        console.warn('Technical indicator data unavailable');
      }

      // 5. 合并新闻和社交媒体数据
      const combinedNewsData = this.combineNewsAndSocial(newsData, socialData, crypto);
      
      // 6. 生成技术分析
      console.log('Generating technical analysis...');
      const technicalAnalysis = this.analyzer.generateTechnicalAnalysis(
        crypto, 
        priceData, 
        combinedNewsData,
        indicatorData,
        socialData
      );

      // 7. 保存所有数据
      this.saveData(crypto, combinedNewsData, technicalAnalysis, priceData);
      
      console.log(`=== Successfully completed analysis for ${crypto} ===\n`);
      
      return {
        news: combinedNewsData,
        technical: technicalAnalysis,
        price: priceData
      };
      
    } catch (error) {
      console.error(`Error in data aggregation for ${crypto}:`, error);
      throw error;
    }
  }

  combineNewsAndSocial(newsData, socialData, crypto) {
    const combined = { ...newsData };
    
    // 将社交媒体帖子转换为新闻格式并合并（可选）
    const socialArticles = (socialData?.posts || []).map(post => ({
      title: post.content.substring(0, 100) + '...',
      source: `social-${post.platform}`,
      url: post.url || `https://twitter.com/user/status/${Date.now()}`,
      sentiment: post.sentiment || 0.5,
      summary: post.content,
      timestamp: post.timestamp || new Date().toISOString(),
      author: post.author,
      platform: post.platform
    }));
    
    combined.articles = [...(newsData.articles || []), ...socialArticles];
    combined.lastUpdated = new Date().toISOString();
    combined.sourceCount = new Set(combined.articles.map(article => article.source)).size;
    combined.sentimentScore = this.calculateSentimentScore(combined.articles);
    
    return combined;
  }

  getSamplePriceData(crypto) {
    // 仅用于允许样本数据的场景
    const basePrice = crypto === 'bitcoin' ? 45000 : 2500;
    const randomFactor = 1 + (Math.random() - 0.5) * 0.1; // ±5% 随机波动
    const currentPrice = basePrice * randomFactor;
    
    return {
      current_price: currentPrice,
      price_change_percentage_24h: (Math.random() - 0.5) * 20, // -10% to +10%
      market_cap: currentPrice * 19000000, // BTC supply ~19M
      total_volume: currentPrice * 50000, // 24h volume
      last_updated: new Date().toISOString()
    };
  }

  generateSampleNews(crypto, count) {
    const articles = [];
    const cryptoName = crypto === 'bitcoin' ? 'Bitcoin' : 'Ethereum';
    const sources = ['coindesk', 'cointelegraph', 'theblock', 'decrypt', 'cryptoslate'];
    
    for (let i = 0; i < count; i++) {
      const randomDate = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
      articles.push({
        title: `${cryptoName} Analysis: Key Technical Levels and Market Outlook ${i + 1}`,
        source: sources[Math.floor(Math.random() * sources.length)],
        url: `https://example.com/${crypto}/news-${i + 1}`,
        sentiment: Math.random(),
        summary: `Comprehensive analysis of ${cryptoName} market conditions including technical indicators, support/resistance levels, and trading volume patterns.`,
        timestamp: randomDate.toISOString()
      });
    }
    
    return articles;
  }

  generateSampleArticle(crypto) {
    const cryptoName = crypto === 'bitcoin' ? 'Bitcoin' : 'Ethereum';
    const sources = ['coindesk', 'cointelegraph', 'theblock', 'decrypt', 'cryptoslate', 'social-twitter', 'social-reddit'];
    const randomDate = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
    
    return {
      title: `${cryptoName} Market Update: Technical Analysis and Fundamental Insights`,
      source: sources[Math.floor(Math.random() * sources.length)],
      url: `https://real-source.com/${crypto}/analysis-${Date.now()}`,
      sentiment: Math.random(),
      summary: `In-depth analysis combining technical indicators with fundamental market drivers including institutional adoption, regulatory developments, and on-chain metrics.`,
      timestamp: randomDate.toISOString()
    };
  }

  calculateSentimentScore(articles) {
    if (!articles || articles.length === 0) return 0;
    const total = articles.reduce((sum, article) => sum + (article.sentiment ?? 0.5), 0);
    return total / articles.length;
  }

  readJsonIfExists(filePath) {
    if (!fs.existsSync(filePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      console.warn(`Failed to read cache file ${filePath}:`, error.message);
      return null;
    }
  }

  saveData(crypto, newsData, technicalAnalysis, priceData) {
    // 保存新闻数据
    const newsPath = path.join(this.dataDir, `${crypto}_news_v2.json`);
    fs.writeFileSync(newsPath, JSON.stringify(newsData, null, 2));
    const legacyNewsPath = path.join(this.dataDir, `${crypto}_news.json`);
    fs.writeFileSync(legacyNewsPath, JSON.stringify(newsData, null, 2));
    
    // 保存技术分析
    this.analyzer.saveAnalysis(crypto, technicalAnalysis);
    const legacyAnalysisPath = path.join(this.dataDir, `${crypto}_technical.json`);
    fs.writeFileSync(legacyAnalysisPath, JSON.stringify(technicalAnalysis, null, 2));
    
    // 保存价格数据
    if (priceData) {
      const pricePath = path.join(this.dataDir, `${crypto}_price.json`);
      fs.writeFileSync(pricePath, JSON.stringify(priceData, null, 2));
    }
    
    console.log(`Saved all data for ${crypto}`);
  }
}

// 执行数据聚合
async function main() {
  const aggregator = new DataAggregator();
  
  try {
    // 分析 Bitcoin
    await aggregator.aggregateAndAnalyze('bitcoin');
    
    // 分析 Ethereum  
    await aggregator.aggregateAndAnalyze('ethereum');
    
    console.log('✅ All data aggregation and analysis completed successfully!');
  } catch (error) {
    console.error('❌ Error during data aggregation:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DataAggregator;
