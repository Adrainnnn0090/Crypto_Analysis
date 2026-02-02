const axios = require('axios');
const cheerio = require('cheerio');

class NewsScraper {
  constructor() {
    this.sources = {
      coindesk: {
        baseUrl: 'https://www.coindesk.com',
        selectors: {
          articles: 'article h3 a, article h4 a, .card-title a',
          title: 'h1, h2, [data-module="ArticleHeadings"] h1',
          content: '.article-content p, .content p'
        }
      },
      cointelegraph: {
        baseUrl: 'https://cointelegraph.com',
        selectors: {
          articles: 'article a[href^="/news/"], .post-card__title a',
          title: 'h1, .post__title',
          content: '.post-content p'
        }
      },
      cryptonews: {
        baseUrl: 'https://cryptonews.com',
        selectors: {
          articles: '.article-item a, .news-item a',
          title: 'h1, .article-title',
          content: '.article-content p, .news-content p'
        }
      }
    };
  }

  async scrapeSource(sourceName, coinKeywords) {
    const source = this.sources[sourceName];
    if (!source) {
      console.warn(`Unknown source: ${sourceName}`);
      return [];
    }

    try {
      const { data } = await axios.get(source.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(data);
      const articles = [];
      const articleLinks = $(source.selectors.articles);

      for (let i = 0; i < Math.min(articleLinks.length, 10); i++) {
        const link = $(articleLinks[i]);
        const href = link.attr('href');
        if (!href) continue;

        const url = href.startsWith('http') ? href : `${source.baseUrl}${href}`;
        try {
          const articleData = await this.scrapeArticle(url, source);
          if (this.matchesCoin(articleData.title + ' ' + articleData.content, coinKeywords)) {
            articles.push({
              ...articleData,
              source: sourceName,
              url
            });
          }
        } catch (error) {
          console.warn(`Failed to scrape article from ${url}:`, error.message);
        }
      }

      return articles;
    } catch (error) {
      console.error(`Failed to scrape ${sourceName}:`, error.message);
      return [];
    }
  }

  async scrapeArticle(url, source) {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const title = $(source.selectors.title).first().text().trim();
    const content = $(source.selectors.content).map((i, el) => $(el).text().trim()).get().join(' ');

    return { title, content };
  }

  matchesCoin(text, keywords) {
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  }

  async scrapeAllCoins() {
    const coins = {
      bitcoin: ['bitcoin', 'btc'],
      ethereum: ['ethereum', 'eth']
    };

    const allArticles = {};

    for (const [coin, keywords] of Object.entries(coins)) {
      console.log(`Scraping news for ${coin}...`);
      allArticles[coin] = [];

      for (const sourceName of Object.keys(this.sources)) {
        try {
          const articles = await this.scrapeSource(sourceName, keywords);
          allArticles[coin] = allArticles[coin].concat(articles);
          console.log(`Found ${articles.length} articles for ${coin} from ${sourceName}`);
        } catch (error) {
          console.error(`Error scraping ${sourceName} for ${coin}:`, error.message);
        }
      }
    }

    return allArticles;
  }
}

module.exports = NewsScraper;