import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { coin } = req.query;
  
  // Validate coin parameter
  if (!['bitcoin', 'ethereum'].includes(coin)) {
    return res.status(400).json({ error: 'Invalid coin. Use "bitcoin" or "ethereum"' });
  }

  try {
    // Read the data file
    const dataPath = path.join(process.cwd(), 'data', `${coin}_news.json`);
    
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ 
        articles: [],
        message: 'No news data available yet'
      });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    res.status(200).json({
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
}