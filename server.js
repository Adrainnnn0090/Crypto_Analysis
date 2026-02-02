const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const Sentiment = require('sentiment');
const { RSI, MACD, SMA, EMA } = require('technicalindicators');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from Next.js build
app.use(express.static(path.join(__dirname, '.next')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// News scraping endpoints
app.get('/api/news/:coin', async (req, res) => {
  const { coin } = req.params;
  const sources = [
    { name: 'CoinDesk', url: `https://www.coindesk.com/search/?q=${coin}` },
    { name: 'CoinTelegraph', url: `https://cointelegraph.com/search?query=${coin}` },
    { name: 'CryptoNews', url: `https://cryptonews.com/search/?q=${coin}` }
  ];

  try {
    const articles = [];
    // Note: In production, you'd need proper scraping logic
    // For now, returning mock data structure
    for (let i = 0; i < 3; i++) {
      articles.push({
        title: `${coin.toUpperCase()} price analysis - Article ${i + 1}`,
        summary: `Latest ${coin} market analysis and news update`,
        source: sources[i % sources.length].name,
        url: sources[i % sources.length].url,
        publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
        sentiment: Math.random() > 0.5 ? 'positive' : 'negative'
      });
    }
    res.json({ articles, lastUpdated: new Date().toISOString() });
  } catch (error) {
    console.error('News scraping error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Technical analysis endpoints
app.get('/api/technical/:coin', async (req, res) => {
  const { coin } = req.params;
  
  try {
    // Mock price data for demonstration
    const mockPrices = [];
    for (let i = 0; i < 100; i++) {
      mockPrices.push(Math.random() * 1000 + 20000); // BTC-like prices
    }

    // Calculate technical indicators
    const rsi = RSI.calculate({ values: mockPrices.slice(-14), period: 14 });
    const macd = MACD.calculate({ values: mockPrices, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 });
    const sma20 = SMA.calculate({ period: 20, values: mockPrices });
    const ema20 = EMA.calculate({ period: 20, values: mockPrices });

    res.json({
      coin,
      currentPrice: mockPrices[mockPrices.length - 1],
      rsi: rsi[rsi.length - 1] || 50,
      macd: macd[macd.length - 1] || { MACD: 0, signal: 0, histogram: 0 },
      sma20: sma20[sma20.length - 1] || mockPrices[mockPrices.length - 1],
      ema20: ema20[ema20.length - 1] || mockPrices[mockPrices.length - 1],
      historicalData: mockPrices.slice(-24), // Last 24 hours
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Technical analysis error:', error);
    res.status(500).json({ error: 'Failed to calculate technical indicators' });
  }
});

// Fallback to Next.js app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '.next', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
});

module.exports = app;