const Sentiment = require('sentiment');

class SentimentAnalyzer {
  constructor() {
    this.sentiment = new Sentiment();
  }

  analyze(text) {
    if (!text || typeof text !== 'string') {
      return { score: 0, comparative: 0, positive: [], negative: [] };
    }

    // Clean and preprocess text
    const cleanedText = text
      .replace(/[^a-zA-Z\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanedText.length < 10) {
      return { score: 0, comparative: 0, positive: [], negative: [] };
    }

    const result = this.sentiment.analyze(cleanedText);
    
    return {
      score: result.score,
      comparative: result.comparative,
      positive: result.positive,
      negative: result.negative,
      magnitude: Math.abs(result.score),
      sentiment: this.getSentimentLabel(result.comparative)
    };
  }

  getSentimentLabel(comparative) {
    if (comparative > 0.1) return 'bullish';
    if (comparative < -0.1) return 'bearish';
    return 'neutral';
  }

  analyzeArticles(articles) {
    if (!articles || !Array.isArray(articles)) {
      return { 
        overall: { score: 0, comparative: 0, sentiment: 'neutral' },
        articles: []
      };
    }

    const analyzedArticles = articles.map(article => ({
      ...article,
      sentiment: this.analyze(article.title + ' ' + article.content)
    }));

    // Calculate overall sentiment
    const totalScore = analyzedArticles.reduce((sum, article) => sum + article.sentiment.score, 0);
    const totalComparative = analyzedArticles.reduce((sum, article) => sum + article.sentiment.comparative, 0);
    const avgComparative = totalComparative / analyzedArticles.length;

    return {
      overall: {
        score: totalScore,
        comparative: avgComparative,
        sentiment: this.getSentimentLabel(avgComparative),
        articleCount: analyzedArticles.length
      },
      articles: analyzedArticles
    };
  }
}

module.exports = SentimentAnalyzer;