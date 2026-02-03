import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { coin } = req.query;

  if (!['bitcoin', 'ethereum'].includes(coin)) {
    return res.status(400).json({ error: 'Invalid coin. Use "bitcoin" or "ethereum"' });
  }

  try {
    const dataPath = path.join(process.cwd(), 'data', `${coin}_price.json`);
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ 
        data: null,
        message: 'No price data available yet'
      });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.status(200).json({
      success: true,
      data,
      lastUpdated: data.last_updated || new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching price:', error);
    res.status(500).json({
      error: 'Failed to fetch price data',
      data: null
    });
  }
}
