const axios = require('axios');
const TechnicalIndicators = require('technicalindicators');

class TechnicalAnalyzer {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://min-api.cryptocompare.com/data';
  }

  async fetchHistoricalData(coin, limit = 100) {
    try {
      const params = {
        fsym: coin.toUpperCase(),
        tsym: 'USD',
        limit: limit,
        aggregate: 1
      };

      // 如果有 API key，添加到请求
      if (this.apiKey) {
        params.api_key = this.apiKey;
      }

      const response = await axios.get(`${this.baseUrl}/v2/histohour`, { params });
      
      if (response.data.Response === 'Error') {
        throw new Error(response.data.Message || 'API Error');
      }

      const data = response.data.Data.Data;
      return data.map(d => ({
        time: d.time * 1000, // Convert to milliseconds
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volumefrom
      }));
    } catch (error) {
      console.error(`Error fetching historical data for ${coin}:`, error.message);
      // Return mock data for development
      return this.generateMockData(coin, limit);
    }
  }

  generateMockData(coin, limit) {
    console.log(`Using mock data for ${coin}`);
    const mockData = [];
    let price = coin === 'bitcoin' ? 45000 : 2500;
    
    for (let i = limit; i >= 0; i--) {
      const time = Date.now() - (i * 3600 * 1000); // Hourly data
      const change = (Math.random() - 0.5) * 0.1; // ±5% change
      price = price * (1 + change);
      
      mockData.push({
        time,
        open: price * (1 - Math.random() * 0.02),
        high: price * (1 + Math.random() * 0.03),
        low: price * (1 - Math.random() * 0.03),
        close: price,
        volume: Math.random() * 1000000
      });
    }
    
    return mockData;
  }

  calculateRSI(prices, period = 14) {
    const input = {
      values: prices,
      period: period
    };
    return TechnicalIndicators.RSI.calculate(input);
  }

  calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const input = {
      values: prices,
      fastPeriod: fastPeriod,
      slowPeriod: slowPeriod,
      signalPeriod: signalPeriod
    };
    return TechnicalIndicators.MACD.calculate(input);
  }

  calculateSMA(prices, period = 20) {
    const input = {
      values: prices,
      period: period
    };
    return TechnicalIndicators.SMA.calculate(input);
  }

  calculateEMA(prices, period = 20) {
    const input = {
      values: prices,
      period: period
    };
    return TechnicalIndicators.EMA.calculate(input);
  }

  async analyzeCoin(coin) {
    try {
      const historicalData = await this.fetchHistoricalData(coin);
      const closes = historicalData.map(d => d.close);
      const volumes = historicalData.map(d => d.volume);

      const rsiValues = this.calculateRSI(closes);
      const macdValues = this.calculateMACD(closes);
      const sma20 = this.calculateSMA(closes, 20);
      const sma50 = this.calculateSMA(closes, 50);
      const sma200 = this.calculateSMA(closes, 200);
      const ema20 = this.calculateEMA(closes, 20);

      // Get the latest values
      const latestRsi = rsiValues[rsiValues.length - 1];
      const latestMacd = macdValues[macdValues.length - 1];
      const latestSma = sma20[sma20.length - 1];
      const latestSma50 = sma50[sma50.length - 1];
      const latestSma200 = sma200[sma200.length - 1];
      const latestEma = ema20[ema20.length - 1];

      // Current price
      const currentPrice = closes[closes.length - 1];
      const price24hAgo = closes.length > 24 ? closes[closes.length - 25] : closes[0];
      const priceChange24h = price24hAgo ? ((currentPrice - price24hAgo) / price24hAgo) * 100 : 0;
      const volume24h = volumes.length > 24
        ? volumes.slice(-24).reduce((sum, value) => sum + value, 0)
        : volumes.reduce((sum, value) => sum + value, 0);

      return {
        coin,
        currentPrice,
        priceChange24h,
        rsi: latestRsi,
        macd: latestMacd ? {
          macd: latestMacd.MACD,
          signal: latestMacd.signal,
          histogram: latestMacd.histogram
        } : null,
        sma20: latestSma,
        sma50: latestSma50,
        sma200: latestSma200,
        ema20: latestEma,
        volume24h,
        historicalData: historicalData.slice(-50), // Last 50 hours
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error analyzing ${coin}:`, error.message);
      return null;
    }
  }

  async analyzeAllCoins() {
    const coins = ['bitcoin', 'ethereum'];
    const analyses = {};

    for (const coin of coins) {
      console.log(`Analyzing ${coin}...`);
      const analysis = await this.analyzeCoin(coin);
      if (analysis) {
        analyses[coin] = analysis;
      }
    }

    return analyses;
  }
}

module.exports = TechnicalAnalyzer;
