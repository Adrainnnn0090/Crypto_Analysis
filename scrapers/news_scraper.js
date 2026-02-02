const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

// 配置多个新闻源
const NEWS_SOURCES = {
  bitcoin: [
    'https://newsapi.org/v2/everything?q=bitcoin&sortBy=publishedAt&language=en',
    'https://newsapi.org/v2/everything?q=bitcoin+price&sortBy=publishedAt&language=en',
    'https://newsapi.org/v2/everything?q=bitcoin+market&sortBy=publishedAt&language=en',
    'https://cryptonews-api.com/api/v1?tickers=BTC&items=50&token=YOUR_TOKEN', // 需要替换为实际API
  ],
  ethereum: [
    'https://newsapi.org/v2/everything?q=ethereum&sortBy=publishedAt&language=en',
    'https://newsapi.org/v2/everything?q=ethereum+price&sortBy=publishedAt&language=en',
    'https://newsapi.org/v2/everything?q=ethereum+market&sortBy=publishedAt&language=en',
  ]
};

// 社交媒体数据源配置
const SOCIAL_SOURCES = {
  bitcoin: [
    // Twitter/X API endpoints for key influencers
    // 这里需要实际的Twitter API集成
  ],
  ethereum: [
    // Ethereum相关推特账号
  ]
};

class NewsScraper {
  constructor() {
    this.newsApiKey = process.env.NEWS_API_KEY || '';
    this.maxArticles = 50;
  }

  async fetchNewsAPI(coin, query) {
    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=${this.maxArticles}&apiKey=${this.newsApiKey}`;
      const response = await axios.get(url);
      
      if (response.data.status === 'ok') {
        return response.data.articles.map(article => ({
          title: article.title,
          source: article.source.name.toLowerCase().replace(/\s+/g, '-'),
          url: article.url,
          sentiment: this.calculateSentiment(article.description || article.title),
          summary: article.description || this.generateSummary(article.content || article.title),
          timestamp: article.publishedAt,
          content: article.content,
          author: article.author,
          category: this.categorizeArticle(article.title, article.description)
        }));
      }
    } catch (error) {
      console.error(`Error fetching NewsAPI for ${coin}:`, error.message);
      return [];
    }
  }

  async fetchCryptoNewsAPI(coin) {
    // 如果有专门的加密货币新闻API，可以在这里实现
    return [];
  }

  calculateSentiment(text) {
    // 简单的情感分析 - 实际项目中应该使用更复杂的NLP模型
    const positiveWords = ['surge', 'rally', 'bullish', 'growth', 'adoption', 'success', 'positive', 'strong', 'up', 'gain'];
    const negativeWords = ['crash', 'drop', 'bearish', 'decline', 'fall', 'loss', 'negative', 'weak', 'down', 'risk'];
    
    let score = 0;
    const words = text.toLowerCase().split(/\s+/);
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    // 归一化到 -1 到 1 范围
    return Math.max(-1, Math.min(1, score / words.length * 10));
  }

  generateSummary(content) {
    // 简单摘要生成
    if (!content) return '';
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
    return sentences.slice(0, 2).join('. ') + '.';
  }

  categorizeArticle(title, description) {
    const text = (title + ' ' + (description || '')).toLowerCase();
    if (text.includes('regulation') || text.includes('law') || text.includes('government')) {
      return 'regulation';
    } else if (text.includes('price') || text.includes('market') || text.includes('trade')) {
      return 'market';
    } else if (text.includes('technology') || text.includes('update') || text.includes('development')) {
      return 'technology';
    } else if (text.includes('adoption') || text.includes('institutional') || text.includes('company')) {
      return 'adoption';
    }
    return 'general';
  }

  async scrapeAllNews(coin) {
    console.log(`Scraping news for ${coin}...`);
    
    // 使用多个查询来获取更多数据
    const queries = [coin, `${coin} price`, `${coin} market`, `${coin} technology`, `${coin} adoption`];
    let allArticles = [];
    
    for (const query of queries) {
      const articles = await this.fetchNewsAPI(coin, query);
      allArticles = [...allArticles, ...articles];
      
      // 避免API速率限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 去重（基于URL）
    const uniqueArticles = [];
    const seenUrls = new Set();
    
    for (const article of allArticles) {
      if (!seenUrls.has(article.url)) {
        seenUrls.add(article.url);
        uniqueArticles.push(article);
      }
    }
    
    // 按时间排序（最新在前）
    uniqueArticles.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // 限制数量
    return uniqueArticles.slice(0, this.maxArticles);
  }

  async saveNewsData(coin, articles) {
    const dataPath = path.join(process.cwd(), 'data', `${coin}_news.json`);
    const data = {
      articles: articles,
      lastUpdated: new Date().toISOString(),
      totalArticles: articles.length
    };
    
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
    console.log(`Saved ${articles.length} articles for ${coin}`);
  }

  async run() {
    try {
      const bitcoinNews = await this.scrapeAllNews('bitcoin');
      await this.saveNewsData('bitcoin', bitcoinNews);
      
      const ethereumNews = await this.scrapeAllNews('ethereum');
      await this.saveNewsData('ethereum', ethereumNews);
      
      console.log('News scraping completed successfully!');
    } catch (error) {
      console.error('Error in news scraping:', error);
    }
  }
}

module.exports = NewsScraper;

// 直接运行时执行
if (require.main === module) {
  const scraper = new NewsScraper();
  scraper.run();
}