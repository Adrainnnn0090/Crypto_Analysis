import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { coin } = req.query;
  
  // Validate coin parameter
  if (!['bitcoin', 'ethereum'].includes(coin)) {
    return res.status(400).json({ error: 'Invalid coin. Use "bitcoin" or "ethereum"' });
  }

  try {
    // Read the technical analysis file (v2 format)
    const analysisPath = path.join(process.cwd(), 'data', `${coin}_technical_v2.json`);
    
    if (!fs.existsSync(analysisPath)) {
      return res.status(404).json({ 
        error: 'No technical analysis data available yet',
        analysis: null
      });
    }

    const analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
    
    res.status(200).json({
      success: true,
      analysis: analysisData,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching technical analysis:', error);
    res.status(500).json({ 
      error: 'Failed to fetch technical analysis data',
      analysis: null
    });
  }
}