const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 测试配置
const testDataDir = path.join(__dirname, '../data');
const scrapersDir = path.join(__dirname, '../scrapers');

// 颜色输出函数
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`
};

console.log(colors.blue('🚀 Starting Comprehensive Crypto Dashboard Tests...\n'));

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

async function runTest(testName, testFunction) {
  try {
    const result = await testFunction();
    if (result === true || (typeof result === 'object' && result !== null)) {
      console.log(colors.green(`✅ ${testName} - PASSED`));
      testResults.passed++;
      testResults.tests.push({ name: testName, status: 'passed' });
    } else {
      throw new Error('Test returned falsy value');
    }
  } catch (error) {
    console.log(colors.red(`❌ ${testName} - FAILED: ${error.message}`));
    testResults.failed++;
    testResults.tests.push({ name: testName, status: 'failed', error: error.message });
  }
}

async function runAllTests() {
  // 测试1: 检查必要的文件和目录是否存在
  await runTest('Check required directories and files', async () => {
    const requiredDirs = ['data', 'scrapers', 'pages/api'];
    const requiredFiles = [
      'scrapers/news_scraper.js',
      'scrapers/crypto_analyzer.js', 
      'scrapers/social_scraper.js',
      'scrapers/data_aggregator.js'
    ];
    
    requiredDirs.forEach(dir => {
      if (!fs.existsSync(path.join(__dirname, '..', dir))) {
        throw new Error(`Required directory missing: ${dir}`);
      }
    });
    
    requiredFiles.forEach(file => {
      if (!fs.existsSync(path.join(__dirname, '..', file))) {
        throw new Error(`Required file missing: ${file}`);
      }
    });
    
    return true;
  });

  // 测试2: 测试新闻抓取器
  await runTest('Test News Scraper functionality', async () => {
    const NewsScraper = require(path.join(scrapersDir, 'news_scraper'));
    const scraper = new NewsScraper();
    
    // 测试比特币新闻抓取
    const bitcoinNews = await scraper.scrapeNews('bitcoin', 20);
    if (!bitcoinNews || !Array.isArray(bitcoinNews.articles) || bitcoinNews.articles.length === 0) {
      throw new Error(`Bitcoin news insufficient: got ${bitcoinNews?.articles?.length || 0} articles`);
    }
    
    // 验证新闻结构
    bitcoinNews.articles.forEach((article, index) => {
      if (!article.title || !article.url || !article.source || article.sentiment === undefined) {
        throw new Error(`Article ${index} missing required fields`);
      }
      // 验证URL是否真实（不是假链接）
      if (article.url.includes('fake') || article.url.includes('example')) {
        throw new Error(`Article ${index} has fake URL: ${article.url}`);
      }
    });
    
    // 测试以太坊新闻抓取
    const ethereumNews = await scraper.scrapeNews('ethereum', 20);
    if (!ethereumNews || !Array.isArray(ethereumNews.articles) || ethereumNews.articles.length === 0) {
      throw new Error(`Ethereum news insufficient: got ${ethereumNews?.articles?.length || 0} articles`);
    }
    
    console.log(`  Bitcoin news: ${bitcoinNews.articles.length} articles`);
    console.log(`  Ethereum news: ${ethereumNews.articles.length} articles`);
    
    return true;
  });

  // 测试3: 测试技术分析生成器
  await runTest('Test Technical Analysis Generator', async () => {
    const CryptoAnalyzer = require(path.join(scrapersDir, 'crypto_analyzer'));
    const analyzer = new CryptoAnalyzer();
    
    // 模拟价格数据
    const mockPriceData = {
      current_price: 45000,
      price_change_percentage_24h: 5.2,
      market_cap: 850000000000,
      total_volume: 25000000000
    };
    
    // 模拟新闻数据
    const mockNewsData = {
      articles: Array(15).fill().map((_, i) => ({
        title: `Test Article ${i}`,
        source: 'coindesk',
        url: `https://www.coindesk.com/test-article-${i}`,
        sentiment: 0.6 + (Math.random() - 0.5) * 0.4, // 0.4-0.8 range
        summary: 'Test summary',
        timestamp: new Date(Date.now() - i * 3600000).toISOString()
      }))
    };
    
    // 生成比特币分析
    const btcAnalysis = analyzer.generateTechnicalAnalysis('bitcoin', mockPriceData, mockNewsData);
    
    // 验证分析结构
    const requiredFields = ['summary', 'keyLevels', 'indicators', 'sentiment', 'recommendations', 'riskAssessment'];
    requiredFields.forEach(field => {
      if (!btcAnalysis[field]) {
        throw new Error(`Missing required field in analysis: ${field}`);
      }
    });
    
    // 验证分析深度
    if (btcAnalysis.summary.length < 200) {
      throw new Error('Analysis summary too short, lacks depth');
    }
    
    if (btcAnalysis.recommendations.length < 3) {
      throw new Error('Insufficient recommendations, expected at least 3');
    }
    
    console.log(`  Analysis summary length: ${btcAnalysis.summary.length} chars`);
    console.log(`  Recommendations count: ${btcAnalysis.recommendations.length}`);
    
    return true;
  });

  // 测试4: 测试数据聚合流程
  await runTest('Test Data Aggregation Pipeline', async () => {
    // 运行数据聚合脚本
    try {
      execSync('node scrapers/data_aggregator.js', { 
        cwd: path.join(__dirname, '..'),
        timeout: 30000 // 30秒超时
      }).toString();
      
      console.log('  Data aggregation completed successfully');
      
      // 验证生成的数据文件
      const btcNewsPath = path.join(testDataDir, 'bitcoin_news_v2.json');
      const ethNewsPath = path.join(testDataDir, 'ethereum_news_v2.json');
      const btcAnalysisPath = path.join(testDataDir, 'bitcoin_technical_v2.json');
      const ethAnalysisPath = path.join(testDataDir, 'ethereum_technical_v2.json');
      
      const filesToCheck = [btcNewsPath, ethNewsPath, btcAnalysisPath, ethAnalysisPath];
      filesToCheck.forEach(filePath => {
        if (!fs.existsSync(filePath)) {
          throw new Error(`Expected data file not generated: ${filePath}`);
        }
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!data || Object.keys(data).length === 0) {
          throw new Error(`Generated data file is empty: ${filePath}`);
        }
      });
      
      // 验证新闻数据量
      const btcNews = JSON.parse(fs.readFileSync(btcNewsPath, 'utf8'));
      const ethNews = JSON.parse(fs.readFileSync(ethNewsPath, 'utf8'));
      
      if (btcNews.articles.length === 0 || ethNews.articles.length === 0) {
        throw new Error(`Insufficient news articles: BTC=${btcNews.articles.length}, ETH=${ethNews.articles.length}`);
      }
      
      console.log(`  Bitcoin news articles: ${btcNews.articles.length}`);
      console.log(`  Ethereum news articles: ${ethNews.articles.length}`);
      
      return true;
    } catch (error) {
      if (error.signal === 'SIGTERM') {
        throw new Error('Data aggregation timed out (30s)');
      }
      throw error;
    }
  });

  // 测试5: 测试API端点
  await runTest('Test API Endpoints', async () => {
    // 测试新闻API v2
    const btcNewsV2Path = path.join(testDataDir, 'bitcoin_news_v2.json');
    if (!fs.existsSync(btcNewsV2Path)) {
      throw new Error('Bitcoin news v2 data not available for API test');
    }
    
    // 模拟API调用
    require(path.join(__dirname, '../pages/api/news/v2/[coin]'));
    // 由于这是Next.js API路由，我们直接测试数据文件结构
    
    const newsData = JSON.parse(fs.readFileSync(btcNewsV2Path, 'utf8'));
    if (!newsData.articles || newsData.articles.length === 0) {
      throw new Error('API news data structure invalid');
    }
    
    // 测试分析API
    const btcAnalysisPath = path.join(testDataDir, 'bitcoin_technical_v2.json');
    if (!fs.existsSync(btcAnalysisPath)) {
      throw new Error('Bitcoin technical analysis data not available for API test');
    }
    
    const analysisData = JSON.parse(fs.readFileSync(btcAnalysisPath, 'utf8'));
    if (!analysisData.summary || !analysisData.recommendations) {
      throw new Error('API analysis data structure invalid');
    }
    
    console.log('  API endpoints data structure validated');
    return true;
  });

  // 测试6: 验证真实URL链接
  await runTest('Validate Real News URLs', async () => {
    const btcNewsPath = path.join(testDataDir, 'bitcoin_news_v2.json');
    const newsData = JSON.parse(fs.readFileSync(btcNewsPath, 'utf8'));
    
    // 检查前5个URL是否看起来真实
    const sampleUrls = newsData.articles.slice(0, 5).map(article => article.url);
    const fakePatterns = ['fake', 'example', 'test', 'placeholder', 'invalid'];
    
    sampleUrls.forEach((url, index) => {
      if (!url.startsWith('http')) {
        throw new Error(`URL ${index} is not a valid HTTP URL: ${url}`);
      }
      
      fakePatterns.forEach(pattern => {
        if (url.toLowerCase().includes(pattern)) {
          throw new Error(`URL ${index} contains fake pattern: ${pattern} in ${url}`);
        }
      });
    });
    
    console.log(`  Validated ${sampleUrls.length} real news URLs`);
    return true;
  });

  // 输出测试结果摘要
  console.log('\n' + '='.repeat(60));
  console.log(colors.blue('📊 TEST RESULTS SUMMARY'));
  console.log('='.repeat(60));

  console.log(`Total tests: ${testResults.passed + testResults.failed}`);
  console.log(colors.green(`Passed: ${testResults.passed}`));
  console.log(colors.red(`Failed: ${testResults.failed}`));

  if (testResults.failed === 0) {
    console.log(colors.green('\n🎉 ALL TESTS PASSED! The system is ready for production.'));
    console.log(colors.yellow('You can now safely push to GitHub.'));
    process.exit(0);
  } else {
    console.log(colors.red('\n❌ SOME TESTS FAILED! Please fix the issues before proceeding.'));
    testResults.tests
      .filter(test => test.status === 'failed')
      .forEach(test => {
        console.log(colors.red(`  - ${test.name}: ${test.error}`));
      });
    process.exit(1);
  }
}

runAllTests();
