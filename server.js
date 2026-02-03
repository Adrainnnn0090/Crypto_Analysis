const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

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
  if (!['bitcoin', 'ethereum'].includes(coin)) {
    return res.status(400).json({ error: 'Invalid coin. Use "bitcoin" or "ethereum"' });
  }

  try {
    const v2Path = path.join(__dirname, 'data', `${coin}_news_v2.json`);
    const dataPath = fs.existsSync(v2Path)
      ? v2Path
      : path.join(__dirname, 'data', `${coin}_news.json`);

    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ articles: [], message: 'No news data available yet' });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json({
      success: true,
      articles: data.articles || [],
      lastUpdated: data.lastUpdated || new Date().toISOString(),
      sourceCount: data.sourceCount || 0,
      sentimentScore: data.sentimentScore || 0
    });
  } catch (error) {
    console.error('News scraping error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Technical analysis endpoints
app.get('/api/technical/:coin', async (req, res) => {
  const { coin } = req.params;
  
  try {
    const v2Path = path.join(__dirname, 'data', `${coin}_technical_v2.json`);
    const dataPath = fs.existsSync(v2Path)
      ? v2Path
      : path.join(__dirname, 'data', `${coin}_technical.json`);

    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ error: 'No technical analysis data available yet' });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json({
      success: true,
      data,
      lastUpdated: data.timestamp || new Date().toISOString()
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
