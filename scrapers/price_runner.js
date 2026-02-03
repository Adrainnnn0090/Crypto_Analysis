const fs = require('fs').promises;
const path = require('path');
const PriceService = require('./price_service');

const coins = (process.env.PRICE_COINS || 'bitcoin,ethereum')
  .split(',')
  .map(entry => entry.trim().toLowerCase())
  .filter(Boolean);

const intervalMs = parseInt(process.env.PRICE_INTERVAL_MS || '30000', 10);

const priceService = new PriceService();
let isRunning = false;

async function writePrice(coin, data) {
  if (!data) return;
  const filePath = path.join(__dirname, '..', 'data', `${coin}_price.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function updatePrices(trigger) {
  if (isRunning) {
    console.log(`[${new Date().toISOString()}] Skip ${trigger}: previous run still in progress`);
    return;
  }

  isRunning = true;
  console.log(`[${new Date().toISOString()}] Price update (${trigger})`);

  try {
    for (const coin of coins) {
      const priceData = await priceService.fetchPrice(coin);
      if (!priceData) {
        console.warn(`Price unavailable for ${coin}`);
        continue;
      }
      await writePrice(coin, priceData);
      console.log(`Updated ${coin}: $${priceData.current_price}`);
    }
  } catch (error) {
    console.error('Price update failed:', error);
  } finally {
    isRunning = false;
  }
}

async function start() {
  await updatePrices('startup');

  if (!Number.isFinite(intervalMs) || intervalMs < 10000) {
    console.error(`Invalid PRICE_INTERVAL_MS: ${intervalMs}`);
    process.exit(1);
  }

  console.log(`Price scheduler active. Interval: ${intervalMs}ms`);
  setInterval(() => {
    updatePrices('interval');
  }, intervalMs);
}

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down price runner...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down price runner...');
  process.exit(0);
});

start();
