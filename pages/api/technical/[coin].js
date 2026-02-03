import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { coin } = req.query;
  
  // Validate coin parameter
  if (!['bitcoin', 'ethereum'].includes(coin)) {
    return res.status(400).json({ error: 'Invalid coin. Use "bitcoin" or "ethereum"' });
  }

  try {
    // Read the data file (prefer v2 if available)
    const v2Path = path.join(process.cwd(), 'data', `${coin}_technical_v2.json`);
    const dataPath = fs.existsSync(v2Path)
      ? v2Path
      : path.join(process.cwd(), 'data', `${coin}_technical.json`);
    
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ 
        indicators: {},
        message: 'No technical analysis data available yet'
      });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    res.status(200).json({
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
}
