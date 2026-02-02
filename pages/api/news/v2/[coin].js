import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { coin } = req.query;
  
  // Validate coin parameter
  if (!['bitcoin', 'ethereum'].includes(coin)) {
    return res.status(400).json({ error: 'Invalid coin. Use "bitcoin" or "ethereum"' });
  }

  try {
    // Read the enhanced news data file
    const dataPath = path.join(process.cwd(), 'data', `${coin}_news_v2.json`);
    
    if (!fs.existsSync(dataPath)) {
      // Fallback to original data if enhanced data doesn't exist
      const fallbackPath = path.join(process.cwd(), 'data', `${coin}_news.json`);
      if (fs.existsSync(fallbackPath)) {
        const fallbackData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        return res.status(200).json({
          success: true,
          articles: fallbackData.articles || [],
          lastUpdated: new Date().toISOString(),
          message: 'Using fallback data - enhanced data not available yet'
        });
      }
      
      return res.status(404).json({ 
        articles: [],
        message: 'No news data available yet'
      });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    res.status(200).json({
      success: true,
      articles: data.articles || [],
      lastUpdated: data.lastUpdated || new Date().toISOString(),
      sourceCount: data.sourceCount || 0,
      sentimentScore: data.sentimentScore || 0
    });
  } catch (error) {
    console.error('Error fetching enhanced news:', error);
    res.status(500).json({ 
      error: 'Failed to fetch enhanced news data',
      articles: []
    });
  }
}