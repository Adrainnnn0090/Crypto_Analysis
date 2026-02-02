const axios = require('axios');

class SocialScraper {
  constructor() {
    // 这里可以集成 Twitter/X API 或其他社交媒体 API
    // 由于 API 密钥限制，我们先模拟一些数据
    this.influencers = {
      bitcoin: [
        'Michael Saylor',
        'Jack Dorsey', 
        'Cathie Wood',
        'Anthony Pompliano',
        'PlanB'
      ],
      ethereum: [
        'Vitalik Buterin',
        'Joseph Lubin',
        'Ryan Sean Adams',
        'Bankless',
        'Ethereum Foundation'
      ]
    };
  }

  async fetchSocialData(crypto) {
    try {
      // 模拟从社交媒体获取的数据
      // 在实际应用中，这里会调用 Twitter API、Reddit API 等
      const socialData = {
        timestamp: new Date().toISOString(),
        crypto: crypto,
        posts: [],
        sentiment: 0.5,
        trendingTopics: []
      };

      // 生成模拟的社交媒体帖子
      const influencers = this.influencers[crypto] || [];
      const sentiments = [0.8, 0.6, 0.4, 0.7, 0.3];
      
      influencers.forEach((influencer, index) => {
        const sentiment = sentiments[index % sentiments.length];
        socialData.posts.push({
          author: influencer,
          platform: 'Twitter',
          content: this.generateSamplePost(crypto, influencer),
          sentiment: sentiment,
          timestamp: new Date(Date.now() - (index * 3600000)).toISOString(), // 每小时前推
          likes: Math.floor(Math.random() * 10000),
          shares: Math.floor(Math.random() * 1000)
        });
      });

      // 计算平均情绪
      if (socialData.posts.length > 0) {
        const totalSentiment = socialData.posts.reduce((sum, post) => sum + post.sentiment, 0);
        socialData.sentiment = totalSentiment / socialData.posts.length;
      }

      // 生成热门话题
      socialData.trendingTopics = this.getTrendingTopics(crypto);

      return socialData;
    } catch (error) {
      console.error(`Error fetching social data for ${crypto}:`, error);
      return {
        timestamp: new Date().toISOString(),
        crypto: crypto,
        posts: [],
        sentiment: 0.5,
        trendingTopics: [],
        error: 'Failed to fetch social data'
      };
    }
  }

  generateSamplePost(crypto, influencer) {
    const cryptoName = crypto === 'bitcoin' ? 'Bitcoin' : 'Ethereum';
    const templates = [
      `Just added more $${crypto.toUpperCase()} to my portfolio. The fundamentals have never been stronger!`,
      `${cryptoName} continues to show incredible resilience in this market cycle.`,
      `The technology behind ${cryptoName} is revolutionary and undervalued.`,
      `Long-term outlook for ${cryptoName} remains extremely bullish.`,
      `${cryptoName} adoption is accelerating faster than most people realize.`,
      `Institutional interest in ${cryptoName} is at an all-time high.`,
      `The ${cryptoName} network security/hash rate is setting new records.`,
      `${cryptoName} is the future of decentralized finance and digital ownership.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  getTrendingTopics(crypto) {
    const topics = {
      bitcoin: [
        'Institutional Adoption',
        'Halving Cycle',
        'Lightning Network',
        'Regulatory Clarity',
        'ETF Approvals'
      ],
      ethereum: [
        'ETH 2.0 Staking',
        'Layer 2 Scaling',
        'DeFi Growth',
        'NFT Market',
        'Smart Contract Innovation'
      ]
    };
    
    return topics[crypto] || ['Market Trends', 'Technical Analysis', 'Fundamental Analysis'];
  }
}

module.exports = SocialScraper;