const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const SentimentAnalyzer = require('./sentimentAnalyzer');

const DEFAULT_RSS_FEEDS = [
  { name: 'coindesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml' },
  { name: 'cointelegraph', url: 'https://cointelegraph.com/rss' },
  { name: 'decrypt', url: 'https://decrypt.co/feed' },
  { name: 'cryptoslate', url: 'https://cryptoslate.com/feed/' },
  { name: 'theblock', url: 'https://www.theblock.co/rss.xml' },
  { name: 'newsbtc', url: 'https://www.newsbtc.com/feed/' }
];

const COIN_KEYWORDS = {
  bitcoin: ['bitcoin', 'btc', 'satoshi', 'lightning', 'hashrate', 'btc/'],
  ethereum: ['ethereum', 'eth', 'ether', 'vitalik', 'erc', 'layer-2', 'l2']
};

class NewsScraper {
  constructor() {
    this.newsApiKey = process.env.NEWS_API_KEY || '';
    this.maxArticles = parseInt(process.env.NEWS_MAX_ARTICLES || '60', 10);
    this.timeoutMs = parseInt(process.env.NEWS_TIMEOUT_MS || '12000', 10);
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.rssFeeds = this.loadRssFeeds();
  }

  loadRssFeeds() {
    const envFeeds = process.env.NEWS_RSS_FEEDS;
    if (!envFeeds) return DEFAULT_RSS_FEEDS;

    return envFeeds
      .split(',')
      .map(entry => entry.trim())
      .filter(Boolean)
      .map(entry => {
        const parts = entry.split('|').map(part => part.trim()).filter(Boolean);
        if (parts.length === 1) {
          const url = parts[0];
          const name = this.safeHostName(url) || 'custom';
          return { name, url };
        }
        return { name: parts[0], url: parts[1] };
      });
  }

  safeHostName(url) {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, '');
    } catch (error) {
      return null;
    }
  }

  normalizeUrl(rawUrl) {
    if (!rawUrl) return '';
    try {
      const parsed = new URL(rawUrl);
      const paramsToDrop = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'ref_src'];
      paramsToDrop.forEach(param => parsed.searchParams.delete(param));
      return parsed.toString();
    } catch (error) {
      return rawUrl.trim();
    }
  }

  cleanText(rawText) {
    if (!rawText) return '';
    const $ = cheerio.load(rawText);
    return $.text().replace(/\s+/g, ' ').trim();
  }

  normalizeSentiment(comparative) {
    if (typeof comparative !== 'number' || Number.isNaN(comparative)) return 0.5;
    const normalized = (comparative + 1) / 2;
    return Math.max(0, Math.min(1, normalized));
  }

  matchesCoin(text, coin) {
    const keywords = COIN_KEYWORDS[coin] || [];
    const lower = (text || '').toLowerCase();
    return keywords.some(keyword => lower.includes(keyword));
  }

  categorizeArticle(title, description) {
    const text = `${title || ''} ${description || ''}`.toLowerCase();
    if (text.includes('regulation') || text.includes('law') || text.includes('government') || text.includes('sec')) {
      return 'regulation';
    }
    if (text.includes('price') || text.includes('market') || text.includes('trade') || text.includes('etf')) {
      return 'market';
    }
    if (text.includes('technology') || text.includes('update') || text.includes('development') || text.includes('upgrade')) {
      return 'technology';
    }
    if (text.includes('adoption') || text.includes('institutional') || text.includes('company') || text.includes('bank')) {
      return 'adoption';
    }
    return 'general';
  }

  async fetchNewsAPI(coin, query) {
    if (!this.newsApiKey) return [];

    try {
      const url = 'https://newsapi.org/v2/everything';
      const response = await axios.get(url, {
        params: {
          q: query,
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: this.maxArticles,
          apiKey: this.newsApiKey
        },
        timeout: this.timeoutMs
      });

      if (response.data.status === 'ok') {
        return response.data.articles.map(article => {
          const sentiment = this.sentimentAnalyzer.analyze(`${article.title || ''} ${article.description || ''}`);
          return {
            title: article.title,
            source: (article.source?.name || 'newsapi').toLowerCase().replace(/\s+/g, '-'),
            url: this.normalizeUrl(article.url),
            sentiment: this.normalizeSentiment(sentiment.comparative),
            summary: article.description || '',
            timestamp: article.publishedAt,
            content: article.content || article.description || '',
            author: article.author,
            category: this.categorizeArticle(article.title, article.description)
          };
        });
      }
    } catch (error) {
      console.error(`Error fetching NewsAPI for ${coin}:`, error.message);
    }

    return [];
  }

  extractItemLink(item) {
    const linkNode = item.find('link').first();
    const href = linkNode.attr('href');
    if (href) return href.trim();
    const linkText = linkNode.text().trim();
    if (linkText) return linkText;

    const guidText = item.find('guid').first().text().trim();
    return guidText || '';
  }

  extractItemDate(item) {
    const candidates = [
      item.find('pubDate').first().text(),
      item.find('updated').first().text(),
      item.find('dc\\:date').first().text(),
      item.find('published').first().text()
    ].map(value => (value || '').trim()).filter(Boolean);

    if (candidates.length > 0) {
      const parsed = new Date(candidates[0]);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }

    return new Date().toISOString();
  }

  extractItemContent(item) {
    const encoded = item.find('content\\:encoded').first().text().trim();
    if (encoded) return encoded;

    const description = item.find('description').first().text().trim();
    if (description) return description;

    const summary = item.find('summary').first().text().trim();
    if (summary) return summary;

    const content = item.find('content').first().text().trim();
    return content;
  }

  async fetchRssFeed(feed, coin) {
    try {
      const response = await axios.get(feed.url, {
        timeout: this.timeoutMs,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      const rawItems = $('item').length ? $('item').toArray() : $('entry').toArray();

      const articles = rawItems.map(rawItem => {
        const item = $(rawItem);
        const title = item.find('title').first().text().trim();
        const url = this.normalizeUrl(this.extractItemLink(item));
        const rawContent = this.extractItemContent(item);
        const summary = this.cleanText(rawContent).slice(0, 280);
        const textForMatch = `${title} ${summary}`;
        const matches = this.matchesCoin(textForMatch, coin);

        if (!title || !url || !matches) {
          return null;
        }

        const sentiment = this.sentimentAnalyzer.analyze(textForMatch);
        return {
          title,
          source: feed.name,
          url,
          sentiment: this.normalizeSentiment(sentiment.comparative),
          summary: summary || this.cleanText(rawContent).slice(0, 280),
          timestamp: this.extractItemDate(item),
          content: summary,
          author: item.find('author name').first().text().trim()
            || item.find('dc\\:creator').first().text().trim()
            || item.find('creator').first().text().trim(),
          category: this.categorizeArticle(title, summary)
        };
      }).filter(Boolean);

      return articles;
    } catch (error) {
      console.error(`Failed to fetch RSS feed ${feed.url}:`, error.message);
      return [];
    }
  }

  async fetchFromRss(coin) {
    const feedTasks = this.rssFeeds.map(feed => this.fetchRssFeed(feed, coin));
    const results = await Promise.allSettled(feedTasks);
    const articles = [];

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        articles.push(...result.value);
      }
    });

    return articles;
  }

  async fetchNews(coin, limit = this.maxArticles) {
    const coinQueries = [coin, `${coin} price`, `${coin} market`, `${coin} ETF`, `${coin} upgrade`];

    let apiArticles = [];
    if (this.newsApiKey) {
      for (const query of coinQueries) {
        const articles = await this.fetchNewsAPI(coin, query);
        apiArticles = apiArticles.concat(articles);
      }
    }

    const rssArticles = await this.fetchFromRss(coin);
    const combined = [...rssArticles, ...apiArticles];

    const seen = new Set();
    const uniqueArticles = [];
    for (const article of combined) {
      const key = article.url || article.title;
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      uniqueArticles.push(article);
    }

    uniqueArticles.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const trimmed = uniqueArticles.slice(0, limit);
    const sentimentScore = trimmed.length
      ? trimmed.reduce((sum, article) => sum + (article.sentiment || 0.5), 0) / trimmed.length
      : 0.5;

    const sourceCount = new Set(trimmed.map(article => article.source)).size;

    return {
      articles: trimmed,
      lastUpdated: new Date().toISOString(),
      sourceCount,
      sentimentScore
    };
  }

  async scrapeNews(coin, limit = this.maxArticles) {
    return this.fetchNews(coin, limit);
  }

  async saveNewsData(coin, newsData) {
    const dataPath = path.join(process.cwd(), 'data', `${coin}_news.json`);
    await fs.writeFile(dataPath, JSON.stringify(newsData, null, 2));
    console.log(`Saved ${newsData.articles.length} articles for ${coin}`);
  }

  async saveNewsDataV2(coin, newsData) {
    const dataPath = path.join(process.cwd(), 'data', `${coin}_news_v2.json`);
    await fs.writeFile(dataPath, JSON.stringify(newsData, null, 2));
    console.log(`Saved ${newsData.articles.length} articles for ${coin} (v2)`);
  }

  async run(coins = ['bitcoin', 'ethereum']) {
    for (const coin of coins) {
      const newsData = await this.fetchNews(coin, this.maxArticles);
      await this.saveNewsData(coin, newsData);
      await this.saveNewsDataV2(coin, newsData);
    }
  }
}

module.exports = NewsScraper;

if (require.main === module) {
  const scraper = new NewsScraper();
  scraper.run().catch(error => {
    console.error('News scraping failed:', error);
    process.exit(1);
  });
}
