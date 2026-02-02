const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static('public'));

// API routes for news
app.get('/api/news/:coin', (req, res) => {
  const { coin } = req.params;
  
  if (!['bitcoin', 'ethereum'].includes(coin)) {
    return res.status(400).json({ error: 'Invalid coin' });
  }

  try {
    const dataPath = path.join(__dirname, 'data', `${coin}_news.json`);
    
    if (!fs.existsSync(dataPath)) {
      return res.json({ 
        articles: [],
        message: 'No news data available yet'
      });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    res.json({
      success: true,
      articles: data.articles || [],
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ 
      error: 'Failed to fetch news data',
      articles: []
    });
  }
});

// API routes for technical analysis
app.get('/api/technical/:coin', (req, res) => {
  const { coin } = req.params;
  
  if (!['bitcoin', 'ethereum'].includes(coin)) {
    return res.status(400).json({ error: 'Invalid coin' });
  }

  try {
    const dataPath = path.join(__dirname, 'data', `${coin}_technical.json`);
    
    if (!fs.existsSync(dataPath)) {
      return res.json({ 
        indicators: {},
        message: 'No technical analysis data available yet'
      });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    res.json({
      success: true,
      data: data,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching technical analysis:', error);
    res.status(500).json({ 
      error: 'Failed to fetch technical analysis data',
      indicators: {}
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'jarvis-realtime-dashboard.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('API endpoints:');
  console.log(`- GET /api/news/:coin (bitcoin|ethereum)`);
  console.log(`- GET /api/technical/:coin (bitcoin|ethereum)`);
  console.log(`- GET /api/health`);
});