const fs = require('fs');
const path = require('path');

// 生成真实的测试数据（模拟从真实API获取的数据）
function generateRealisticNewsData(coin, count = 50) {
  const sources = [
    'coindesk', 'cointelegraph', 'bitcoinist', 'cryptoslate', 'decrypt', 
    'theblock', 'forbes', 'bloomberg', 'reuters', 'cnbc'
  ];
  
  const titles = coin === 'bitcoin' 
    ? [
        'Bitcoin Breaks $50K Resistance Level on Institutional Buying',
        'Major Bank Announces Bitcoin Custody Services for Institutional Clients',
        'Bitcoin Mining Difficulty Reaches New All-Time High',
        'El Salvador Adds 100 More BTC to National Treasury',
        'Bitcoin ETF Approval Speculation Drives Market Rally',
        'Lightning Network Capacity Surpasses 5,000 BTC Milestone',
        'Bitcoin Hashrate Hits Record High Amid Price Recovery',
        'Corporate Treasury Trend: Another Fortune 500 Company Buys Bitcoin',
        'Bitcoin Dominance Index Rises as Altcoins Struggle',
        'Regulatory Clarity Emerges in Key Markets for Bitcoin Adoption'
      ]
    : [
        'Ethereum Shanghai Upgrade Successfully Implemented',
        'ETH Staking Withdrawals Go Live After Shanghai Hard Fork',
        'Ethereum Layer 2 Solutions See Record Transaction Volume',
        'Major DeFi Protocol Announces Ethereum Integration',
        'Ethereum Gas Fees Drop to Six-Month Low',
        'Institutional Interest in Ethereum Grows Following Regulatory Clarity',
        'Ethereum NFT Market Shows Signs of Recovery',
        'Ethereum Development Activity Reaches All-Time High',
        'Ethereum Merge Anniversary: One Year of Proof-of-Stake Success',
        'Ethereum Scaling Solutions Attract Major Investment'
      ];

  const summaries = [
    'Institutional adoption continues to drive cryptocurrency markets higher as major financial players enter the space.',
    'Technical indicators suggest strong support levels with potential for further upside momentum.',
    'Network fundamentals remain strong with increasing hashrate and transaction volume.',
    'Regulatory developments provide clarity that benefits long-term adoption prospects.',
    'Market sentiment improves as macroeconomic conditions stabilize.',
    'On-chain metrics show accumulation by long-term holders during recent price dips.',
    'Layer 2 adoption accelerates, reducing main chain congestion and fees.',
    'Developer activity reaches new highs, indicating strong ecosystem growth.',
    'Cross-chain interoperability solutions gain traction in the ecosystem.',
    'DeFi TVL shows recovery signs after months of consolidation.'
  ];

  const articles = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const source = sources[Math.floor(Math.random() * sources.length)];
    const title = titles[Math.floor(Math.random() * titles.length)] + ` - ${source}`;
    const summary = summaries[Math.floor(Math.random() * summaries.length)];
    
    // 生成真实的URL
    const baseUrl = source === 'coindesk' ? 'https://www.coindesk.com' :
                   source === 'cointelegraph' ? 'https://cointelegraph.com' :
                   source === 'bitcoinist' ? 'https://bitcoinist.com' :
                   source === 'cryptoslate' ? 'https://cryptoslate.com' :
                   source === 'decrypt' ? 'https://decrypt.co' :
                   source === 'theblock' ? 'https://www.theblock.co' :
                   source === 'forbes' ? 'https://www.forbes.com' :
                   source === 'bloomberg' ? 'https://www.bloomberg.com' :
                   source === 'reuters' ? 'https://www.reuters.com' :
                   'https://www.cnbc.com';
    
    const url = `${baseUrl}/${coin}-${Math.random().toString(36).substr(2, 9)}/${Math.floor(Date.now() / 1000)}`;
    
    // 随机情感分数
    const sentiment = Math.random() * 0.8 + 0.1; // 0.1 to 0.9
    
    // 时间戳（最近7天内）
    const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    
    articles.push({
      title,
      source,
      url,
      sentiment,
      summary,
      timestamp,
      content: `${summary} Additional details about the market movement and technical analysis.`,
      author: `Author ${Math.floor(Math.random() * 100)}`,
      category: ['market', 'technology', 'adoption', 'regulation'][Math.floor(Math.random() * 4)]
    });
  }
  
  return articles;
}

function generateRealisticPriceData(coin) {
  const basePrice = coin === 'bitcoin' ? 45000 : 2500;
  const price = basePrice * (0.9 + Math.random() * 0.2); // ±10%
  const change24h = (Math.random() - 0.5) * 10; // -5% to +5%
  const volume = Math.random() * 10000000000; // Up to $10B volume
  
  return {
    current_price: price,
    price_change_percentage_24h: change24h,
    total_volume: volume,
    market_cap: price * (coin === 'bitcoin' ? 19000000 : 120000000),
    high_24h: price * 1.02,
    low_24h: price * 0.98,
    last_updated: new Date().toISOString()
  };
}

function generateTechnicalAnalysis(crypto, priceData, newsData) {
  const rsi = 30 + Math.random() * 40; // 30-70 range
  const ma20 = priceData.current_price * (0.98 + Math.random() * 0.04);
  const ma50 = priceData.current_price * (0.95 + Math.random() * 0.06);
  const ma200 = priceData.current_price * (0.90 + Math.random() * 0.10);
  
  const support = [
    priceData.current_price * 0.95,
    priceData.current_price * 0.90,
    priceData.current_price * 0.85
  ];
  
  const resistance = [
    priceData.current_price * 1.05,
    priceData.current_price * 1.10,
    priceData.current_price * 1.15
  ];
  
  // 计算新闻情绪平均值
  const avgSentiment = newsData.articles.reduce((sum, article) => sum + article.sentiment, 0) / newsData.articles.length;
  
  return {
    timestamp: new Date().toISOString(),
    crypto: crypto,
    summary: `${crypto === 'bitcoin' ? 'Bitcoin' : 'Ethereum'} shows balanced technical setup with moderate volatility. Price action near key moving averages suggests potential consolidation before next major move. News sentiment remains cautiously optimistic with ${newsData.articles.length} recent articles analyzed.`,
    keyLevels: {
      support,
      resistance
    },
    indicators: {
      rsi: rsi,
      macd: {
        line: (Math.random() - 0.5) * 2,
        signal: (Math.random() - 0.5) * 1.5,
        histogram: (Math.random() - 0.5) * 0.5
      },
      movingAverages: {
        ma20,
        ma50,
        ma200
      },
      volume: priceData.total_volume
    },
    sentiment: {
      overall: avgSentiment,
      newsSentiment: avgSentiment,
      socialSentiment: avgSentiment + (Math.random() - 0.5) * 0.2
    },
    recommendations: [
      'Monitor price action around key support/resistance levels',
      `${rsi > 60 ? 'Consider profit-taking on long positions' : rsi < 40 ? 'Potential accumulation opportunity' : 'Maintain current position size'}`,
      'Watch for breakout above resistance or breakdown below support',
      'Diversify across timeframes for better risk management'
    ],
    riskAssessment: 'Medium risk level. Balanced market conditions with normal volatility.'
  };
}

// 生成并保存数据
function main() {
  console.log('Generating realistic test data...');
  
  // 生成新闻数据
  const bitcoinNews = generateRealisticNewsData('bitcoin', 50);
  const ethereumNews = generateRealisticNewsData('ethereum', 50);
  
  fs.writeFileSync(
    path.join(__dirname, '../data/bitcoin_news.json'),
    JSON.stringify({ articles: bitcoinNews, lastUpdated: new Date().toISOString(), totalArticles: 50 }, null, 2)
  );
  
  fs.writeFileSync(
    path.join(__dirname, '../data/ethereum_news.json'),
    JSON.stringify({ articles: ethereumNews, lastUpdated: new Date().toISOString(), totalArticles: 50 }, null, 2)
  );
  
  console.log('Generated 50 news articles for each cryptocurrency');
  
  // 生成价格数据
  const bitcoinPrice = generateRealisticPriceData('bitcoin');
  const ethereumPrice = generateRealisticPriceData('ethereum');
  
  // 生成技术分析
  const bitcoinAnalysis = generateTechnicalAnalysis('bitcoin', bitcoinPrice, { articles: bitcoinNews });
  const ethereumAnalysis = generateTechnicalAnalysis('ethereum', ethereumPrice, { articles: ethereumNews });
  
  fs.writeFileSync(
    path.join(__dirname, '../data/bitcoin_technical_v2.json'),
    JSON.stringify(bitcoinAnalysis, null, 2)
  );
  
  fs.writeFileSync(
    path.join(__dirname, '../data/ethereum_technical_v2.json'),
    JSON.stringify(ethereumAnalysis, null, 2)
  );
  
  console.log('Generated comprehensive technical analysis data');
  console.log('Test data generation completed successfully!');
}

main();