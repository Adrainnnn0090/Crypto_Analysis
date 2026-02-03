const cron = require('node-cron');
const DataAggregator = require('./data_aggregator');

const schedule = process.env.SCRAPE_CRON || '*/10 * * * *';
const coins = (process.env.SCRAPE_COINS || 'bitcoin,ethereum')
  .split(',')
  .map(entry => entry.trim().toLowerCase())
  .filter(Boolean);

const runOnceOnly = process.env.SCRAPE_ONCE === 'true';
const timezone = process.env.TZ || 'UTC';

const aggregator = new DataAggregator();
let isRunning = false;

async function runAggregation(trigger) {
  if (isRunning) {
    console.log(`[${new Date().toISOString()}] Skip ${trigger}: previous run still in progress`);
    return;
  }

  isRunning = true;
  console.log(`[${new Date().toISOString()}] Starting aggregation (${trigger})...`);

  try {
    for (const coin of coins) {
      await aggregator.aggregateAndAnalyze(coin);
    }
    console.log(`[${new Date().toISOString()}] Aggregation completed`);
  } catch (error) {
    console.error('Aggregation failed:', error);
  } finally {
    isRunning = false;
  }
}

async function start() {
  await runAggregation('startup');

  if (runOnceOnly) {
    process.exit(0);
  }

  if (!cron.validate(schedule)) {
    console.error(`Invalid cron schedule: ${schedule}`);
    process.exit(1);
  }

  console.log(`Scheduler active. Cron: ${schedule} | Timezone: ${timezone}`);
  cron.schedule(
    schedule,
    () => {
      runAggregation('scheduled');
    },
    { timezone }
  );
}

start();
