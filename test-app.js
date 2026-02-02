const fs = require('fs');
const path = require('path');

// Check if we have the necessary files
const requiredFiles = [
  'pages/index.js',
  'components/NewsCard.js', 
  'components/TechnicalChart.js',
  'pages/api/news/[coin].js',
  'pages/api/technical/[coin].js',
  'server.js'
];

console.log('Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${file}: ${exists ? '✅' : '❌'}`);
});

// Check if data directory exists
if (!fs.existsSync('data')) {
  fs.mkdirSync('data', { recursive: true });
  console.log('Created data directory');
}

// Create empty data files if they don't exist
['bitcoin_news.json', 'ethereum_news.json', 'bitcoin_technical.json', 'ethereum_technical.json'].forEach(file => {
  const filePath = path.join('data', file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}));
    console.log(`Created empty ${file}`);
  }
});

console.log('\nApplication structure is ready!');
console.log('To run the application:');
console.log('1. Make sure you have a valid CRYPTOCOMPARE_API_KEY in .env');
console.log('2. Run: node server.js');
console.log('3. Open http://localhost:3000 in your browser');