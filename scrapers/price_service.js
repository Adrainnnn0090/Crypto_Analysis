const axios = require('axios');

const COIN_IDS = {
  bitcoin: 'bitcoin',
  ethereum: 'ethereum'
};

class PriceService {
  constructor() {
    this.baseUrl = 'https://api.coingecko.com/api/v3';
    this.timeoutMs = parseInt(process.env.PRICE_TIMEOUT_MS || '10000', 10);
  }

  async fetchPrice(coin) {
    const coinId = COIN_IDS[coin];
    if (!coinId) return null;

    try {
      const response = await axios.get(`${this.baseUrl}/simple/price`, {
        params: {
          ids: coinId,
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_market_cap: true,
          include_24hr_vol: true,
          include_last_updated_at: true
        },
        timeout: this.timeoutMs,
        headers: {
          'User-Agent': 'CryptoAnalysis/1.0'
        }
      });

      const payload = response.data?.[coinId];
      if (!payload) return null;

      return {
        current_price: payload.usd,
        price_change_percentage_24h: payload.usd_24h_change,
        total_volume: payload.usd_24h_vol,
        market_cap: payload.usd_market_cap,
        last_updated: payload.last_updated_at
          ? new Date(payload.last_updated_at * 1000).toISOString()
          : new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching price data for ${coin}:`, error.message);
      return null;
    }
  }
}

module.exports = PriceService;
