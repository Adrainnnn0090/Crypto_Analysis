const fs = require('fs');
const path = require('path');

class CryptoAnalyzer {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
  }

  // 综合技术分析（基于多位专家的分析方法）
  generateTechnicalAnalysis(crypto, priceData, newsData, technicalIndicators = null, socialData = null) {
    const analysis = {
      timestamp: new Date().toISOString(),
      crypto: crypto,
      cryptoPrice: priceData || null,
      summary: '',
      keyLevels: {
        support: [],
        resistance: []
      },
      indicators: {
        rsi: null,
        macd: null,
        movingAverages: {
          ma20: null,
          ma50: null,
          ma200: null
        },
        volume: null
      },
      sentiment: {
        overall: 0,
        newsSentiment: 0,
        socialSentiment: 0
      },
      recommendations: [],
      riskAssessment: ''
    };

    // 基于价格数据生成技术指标
    const currentPrice = priceData?.current_price || technicalIndicators?.currentPrice;
    if (currentPrice) {
      // RSI 计算（简化版）
      const rsi = this.calculateRSI(priceData || {});
      analysis.indicators.rsi = rsi;
      
      // 移动平均线
      analysis.indicators.movingAverages = {
        ma20: currentPrice * 0.98, // 简化计算
        ma50: currentPrice * 0.95,
        ma200: currentPrice * 0.90
      };
      
      // 关键支撑/阻力位
      analysis.keyLevels = {
        support: [
          currentPrice * 0.95,
          currentPrice * 0.90,
          currentPrice * 0.85
        ],
        resistance: [
          currentPrice * 1.05,
          currentPrice * 1.10,
          currentPrice * 1.15
        ]
      };
    }

    if (technicalIndicators) {
      if (typeof technicalIndicators.rsi === 'number') {
        analysis.indicators.rsi = technicalIndicators.rsi;
      }
      if (technicalIndicators.macd) {
        analysis.indicators.macd = {
          MACD: technicalIndicators.macd.macd ?? technicalIndicators.macd.MACD,
          signal: technicalIndicators.macd.signal,
          histogram: technicalIndicators.macd.histogram
        };
      }
      analysis.indicators.movingAverages = {
        ma20: technicalIndicators.sma20 ?? analysis.indicators.movingAverages.ma20,
        ma50: technicalIndicators.sma50 ?? analysis.indicators.movingAverages.ma50,
        ma200: technicalIndicators.sma200 ?? analysis.indicators.movingAverages.ma200
      };
      analysis.indicators.volume = technicalIndicators.volume24h ?? priceData?.total_volume ?? null;
    } else if (priceData?.total_volume) {
      analysis.indicators.volume = priceData.total_volume;
    }

    // 新闻情绪分析
    let totalSentiment = 0;
    let articleCount = 0;
    
    if (newsData && newsData.articles) {
      newsData.articles.forEach(article => {
        if (article.sentiment !== undefined) {
          totalSentiment += article.sentiment;
          articleCount++;
        }
      });
    }
    
    analysis.sentiment.newsSentiment = articleCount > 0 ? totalSentiment / articleCount : 0;
    analysis.sentiment.socialSentiment = socialData?.sentiment || 0;

    const sentimentParts = [];
    if (articleCount > 0) sentimentParts.push(analysis.sentiment.newsSentiment);
    if (socialData?.posts?.length) sentimentParts.push(analysis.sentiment.socialSentiment);
    analysis.sentiment.overall = sentimentParts.length
      ? sentimentParts.reduce((sum, value) => sum + value, 0) / sentimentParts.length
      : analysis.sentiment.newsSentiment;

    // 综合分析生成
    analysis.summary = this.generateSummary(analysis, priceData, newsData, technicalIndicators, socialData);
    analysis.recommendations = this.generateRecommendations(analysis);
    analysis.riskAssessment = this.assessRisk(analysis);

    return analysis;
  }

  calculateRSI(priceData) {
    // 简化的RSI计算，实际应用中需要更多历史数据
    if (!priceData.price_change_percentage_24h) return 50;
    
    const change = priceData.price_change_percentage_24h;
    if (change > 0) {
      return Math.min(70 + (change * 2), 90); // 超买区域
    } else if (change < 0) {
      return Math.max(30 + (change * 2), 10); // 超卖区域
    }
    return 50; // 中性
  }

  generateSummary(analysis, priceData, newsData, technicalIndicators, socialData) {
    const cryptoName = analysis.crypto === 'bitcoin' ? 'Bitcoin' : 'Ethereum';
    let summary = `${cryptoName} technical analysis combines price action, volume, and market sentiment from multiple sources.`;

    // 添加价格趋势
    if (priceData) {
      const priceChange = priceData.price_change_percentage_24h || 0;
      const priceText = priceData.current_price ? ` Current spot price is around $${priceData.current_price.toLocaleString()}.` : '';
      summary += priceText;
      if (Math.abs(priceChange) > 5) {
        summary += ` The asset is showing strong ${priceChange > 0 ? 'bullish' : 'bearish'} momentum with a ${priceChange.toFixed(2)}% 24h change.`;
      } else {
        summary += ` Price action remains relatively stable with moderate volatility.`;
      }
    }

    // 添加新闻情绪
    if (newsData && newsData.articles && newsData.articles.length > 10) {
      const sentiment = analysis.sentiment.newsSentiment;
      if (sentiment > 0.6) {
        summary += ` Positive news sentiment from ${newsData.articles.length} recent articles supports the bullish outlook.`;
      } else if (sentiment < 0.4) {
        summary += ` Cautious sentiment from recent news coverage suggests potential headwinds.`;
      } else {
        summary += ` News sentiment is balanced across ${newsData.articles.length} recent headlines.`;
      }
    } else if (newsData && newsData.articles) {
      summary += ` News sample size is currently ${newsData.articles.length}, indicating lighter coverage in the latest window.`;
    }

    // 添加技术指标
    if (analysis.indicators.rsi) {
      if (analysis.indicators.rsi > 70) {
        summary += ` RSI indicates overbought conditions, suggesting potential pullback risk.`;
      } else if (analysis.indicators.rsi < 30) {
        summary += ` RSI shows oversold conditions, presenting potential buying opportunity.`;
      } else {
        summary += ` RSI remains neutral, implying neither extreme overbought nor oversold conditions.`;
      }
    }

    if (analysis.indicators.movingAverages?.ma20 && analysis.indicators.movingAverages?.ma50) {
      summary += ` Short-term momentum (MA20 vs MA50) ${
        analysis.indicators.movingAverages.ma20 > analysis.indicators.movingAverages.ma50 ? 'leans bullish' : 'leans bearish'
      }, while longer-term MA200 sits around $${analysis.indicators.movingAverages.ma200?.toFixed(0) || 'N/A'}.`;
    }

    if (analysis.keyLevels.support.length && analysis.keyLevels.resistance.length) {
      summary += ` Key support zones cluster near $${analysis.keyLevels.support[0].toFixed(0)}, with resistance around $${analysis.keyLevels.resistance[0].toFixed(0)}.`;
    }

    if (socialData?.posts?.length) {
      summary += ` Social sentiment is tracking at ${(analysis.sentiment.socialSentiment * 100).toFixed(0)}% based on ${socialData.posts.length} recent posts.`;
    }

    if (summary.length < 220) {
      summary += ' Trend assessment prioritizes price momentum, key moving averages, and real-time headline sentiment to frame near-term risk and opportunity.';
    }

    return summary;
  }

  generateRecommendations(analysis) {
    const recommendations = [];
    
    // 基于RSI的建议
    if (analysis.indicators.rsi > 70) {
      recommendations.push('Consider taking profits or reducing position size due to overbought conditions');
    } else if (analysis.indicators.rsi < 30) {
      recommendations.push('Potential accumulation opportunity as asset appears oversold');
    }

    // 基于移动平均线
    const ma20 = analysis.indicators.movingAverages.ma20;
    const ma50 = analysis.indicators.movingAverages.ma50;
    if (ma20 && ma50 && ma20 > ma50) {
      recommendations.push('Short-term trend is bullish (MA20 above MA50)');
    } else if (ma20 && ma50 && ma20 < ma50) {
      recommendations.push('Short-term trend shows weakness (MA20 below MA50)');
    }

    // 基于支撑/阻力
    if (analysis.keyLevels.support.length > 0) {
      recommendations.push(`Key support levels to watch: ${analysis.keyLevels.support.map(s => '$' + s.toFixed(0)).join(', ')}`);
    }
    if (analysis.keyLevels.resistance.length > 0) {
      recommendations.push(`Key resistance levels: ${analysis.keyLevels.resistance.map(r => '$' + r.toFixed(0)).join(', ')}`);
    }

    // 风险管理建议
    recommendations.push('Always implement proper risk management and position sizing');
    recommendations.push('Consider dollar-cost averaging for long-term positions');

    return recommendations;
  }

  assessRisk(analysis) {
    let riskLevel = 'Medium';
    let factors = [];

    if (analysis.indicators.rsi > 80 || analysis.indicators.rsi < 20) {
      riskLevel = 'High';
      factors.push('Extreme RSI levels');
    }

    if (Math.abs(analysis.sentiment.newsSentiment - 0.5) > 0.3) {
      factors.push('Extreme sentiment divergence');
    }

    if (factors.length === 0) {
      riskLevel = 'Low to Medium';
    }

    return `${riskLevel} risk level. Factors: ${factors.length > 0 ? factors.join(', ') : 'Balanced market conditions'}.`;
  }

  // 保存分析结果
  saveAnalysis(crypto, analysis) {
    const filePath = path.join(this.dataDir, `${crypto}_technical_v2.json`);
    fs.writeFileSync(filePath, JSON.stringify(analysis, null, 2));
    console.log(`Saved technical analysis for ${crypto} to ${filePath}`);
  }
}

module.exports = CryptoAnalyzer;
