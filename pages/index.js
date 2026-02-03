import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';

export default function Home() {
  const [newsData, setNewsData] = useState({ bitcoin: [], ethereum: [] });
  const [technicalAnalysis, setTechnicalAnalysis] = useState({ bitcoin: null, ethereum: null });
  const [priceData, setPriceData] = useState({ bitcoin: null, ethereum: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch news data (v2 with real URLs and more articles)
        const [bitcoinNewsRes, ethereumNewsRes] = await Promise.all([
          fetch('/api/news/v2/bitcoin'),
          fetch('/api/news/v2/ethereum')
        ]);
        
        const bitcoinNews = await bitcoinNewsRes.json();
        const ethereumNews = await ethereumNewsRes.json();
        
        setNewsData({
          bitcoin: bitcoinNews.articles || [],
          ethereum: ethereumNews.articles || []
        });

        // Fetch comprehensive technical analysis
        const [bitcoinAnalysisRes, ethereumAnalysisRes] = await Promise.all([
          fetch('/api/analysis/bitcoin'),
          fetch('/api/analysis/ethereum')
        ]);
        
        const bitcoinAnalysis = await bitcoinAnalysisRes.json();
        const ethereumAnalysis = await ethereumAnalysisRes.json();
        
        setTechnicalAnalysis({
          bitcoin: bitcoinAnalysis.analysis || null,
          ethereum: ethereumAnalysis.analysis || null
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 10 minutes for fresh data
    const interval = setInterval(fetchData, 600000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const [btcRes, ethRes] = await Promise.all([
          fetch('/api/price/bitcoin'),
          fetch('/api/price/ethereum')
        ]);

        const btcData = await btcRes.json();
        const ethData = await ethRes.json();

        setPriceData({
          bitcoin: btcData.data || null,
          ethereum: ethData.data || null
        });
      } catch (err) {
        console.error('Error fetching price data:', err);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-white">Loading comprehensive crypto analysis dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Crypto Analysis Dashboard - Advanced</title>
        <meta name="description" content="Advanced Bitcoin and Ethereum analysis with 50+ news sources and social sentiment" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-gray-800 p-4 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center text-blue-400">Advanced Crypto Analysis Dashboard</h1>
          <p className="text-center text-gray-400 mt-2">Comprehensive BTC & ETH Analysis | 50+ News Sources | Social Sentiment | Technical Indicators</p>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Bitcoin Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400 flex items-center">
            <span className="mr-2">₿</span> Bitcoin (BTC) - Advanced Analysis
          </h2>
          
          {/* News - Now with real data */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2 text-lg">Latest News ({newsData.bitcoin.length} articles)</h3>
            {newsData.bitcoin.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {newsData.bitcoin.slice(0, 10).map((article, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-700 pb-3 last:border-0 last:pb-0"
                  >
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium block mb-1">
                      {article.title}
                    </a>
                    <p className="text-sm text-gray-300 mb-1">{article.summary}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Source: {article.source}</span>
                      <span>Sentiment: {(article.sentiment * 100).toFixed(0)}%</span>
                      <span>{new Date(article.timestamp).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No news available</p>
            )}
          </div>

          {/* Advanced Technical Analysis */}
          {technicalAnalysis.bitcoin && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-lg">Comprehensive Technical Analysis</h3>
              
              {/* Summary */}
              <div className="mb-4 p-3 bg-gray-700 rounded">
                <p className="text-sm leading-relaxed">{technicalAnalysis.bitcoin.summary}</p>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-700 p-3 rounded text-center">
                  <p className="text-xs text-gray-400">Current Price</p>
                  <p className="text-lg font-bold">${(priceData.bitcoin?.current_price ?? technicalAnalysis.bitcoin.cryptoPrice?.current_price)?.toLocaleString() || 'N/A'}</p>
                </div>
                <div className="bg-gray-700 p-3 rounded text-center">
                  <p className="text-xs text-gray-400">RSI</p>
                  <p className={`text-lg font-bold ${technicalAnalysis.bitcoin.indicators?.rsi > 70 ? 'text-red-400' : technicalAnalysis.bitcoin.indicators?.rsi < 30 ? 'text-green-400' : 'text-white'}`}>
                    {technicalAnalysis.bitcoin.indicators?.rsi?.toFixed(1) || 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-700 p-3 rounded text-center">
                  <p className="text-xs text-gray-400">24h Change</p>
                  <p className={`text-lg font-bold ${(priceData.bitcoin?.price_change_percentage_24h ?? technicalAnalysis.bitcoin.cryptoPrice?.price_change_percentage_24h) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(priceData.bitcoin?.price_change_percentage_24h ?? technicalAnalysis.bitcoin.cryptoPrice?.price_change_percentage_24h)?.toFixed(2) || 'N/A'}%
                  </p>
                </div>
                <div className="bg-gray-700 p-3 rounded text-center">
                  <p className="text-xs text-gray-400">News Sentiment</p>
                  <p className={`text-lg font-bold ${technicalAnalysis.bitcoin.sentiment?.newsSentiment > 0.6 ? 'text-green-400' : technicalAnalysis.bitcoin.sentiment?.newsSentiment < 0.4 ? 'text-red-400' : 'text-white'}`}>
                    {(technicalAnalysis.bitcoin.sentiment?.newsSentiment * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Key Levels */}
              {technicalAnalysis.bitcoin.keyLevels && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Key Support & Resistance Levels</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-green-400 font-medium">Support Levels:</p>
                      {technicalAnalysis.bitcoin.keyLevels.support.map((level, idx) => (
                        <p key={idx} className="text-xs ml-2">${level.toFixed(0)}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm text-red-400 font-medium">Resistance Levels:</p>
                      {technicalAnalysis.bitcoin.keyLevels.resistance.map((level, idx) => (
                        <p key={idx} className="text-xs ml-2">${level.toFixed(0)}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {technicalAnalysis.bitcoin.recommendations && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Trading Recommendations</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {technicalAnalysis.bitcoin.recommendations.slice(0, 4).map((rec, idx) => (
                      <li key={idx} className="text-gray-300">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Assessment */}
              {technicalAnalysis.bitcoin.riskAssessment && (
                <div className="p-3 bg-gray-700 rounded">
                  <h4 className="font-medium mb-1">Risk Assessment</h4>
                  <p className="text-sm text-gray-300">{technicalAnalysis.bitcoin.riskAssessment}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Ethereum Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-purple-400 flex items-center">
            <span className="mr-2">Ξ</span> Ethereum (ETH) - Advanced Analysis
          </h2>
          
          {/* News */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2 text-lg">Latest News ({newsData.ethereum.length} articles)</h3>
            {newsData.ethereum.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {newsData.ethereum.slice(0, 10).map((article, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-700 pb-3 last:border-0 last:pb-0"
                  >
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium block mb-1">
                      {article.title}
                    </a>
                    <p className="text-sm text-gray-300 mb-1">{article.summary}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Source: {article.source}</span>
                      <span>Sentiment: {(article.sentiment * 100).toFixed(0)}%</span>
                      <span>{new Date(article.timestamp).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No news available</p>
            )}
          </div>

          {/* Advanced Technical Analysis */}
          {technicalAnalysis.ethereum && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-lg">Comprehensive Technical Analysis</h3>
              
              {/* Summary */}
              <div className="mb-4 p-3 bg-gray-700 rounded">
                <p className="text-sm leading-relaxed">{technicalAnalysis.ethereum.summary}</p>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-700 p-3 rounded text-center">
                  <p className="text-xs text-gray-400">Current Price</p>
                  <p className="text-lg font-bold">${(priceData.ethereum?.current_price ?? technicalAnalysis.ethereum.cryptoPrice?.current_price)?.toLocaleString() || 'N/A'}</p>
                </div>
                <div className="bg-gray-700 p-3 rounded text-center">
                  <p className="text-xs text-gray-400">RSI</p>
                  <p className={`text-lg font-bold ${technicalAnalysis.ethereum.indicators?.rsi > 70 ? 'text-red-400' : technicalAnalysis.ethereum.indicators?.rsi < 30 ? 'text-green-400' : 'text-white'}`}>
                    {technicalAnalysis.ethereum.indicators?.rsi?.toFixed(1) || 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-700 p-3 rounded text-center">
                  <p className="text-xs text-gray-400">24h Change</p>
                  <p className={`text-lg font-bold ${(priceData.ethereum?.price_change_percentage_24h ?? technicalAnalysis.ethereum.cryptoPrice?.price_change_percentage_24h) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(priceData.ethereum?.price_change_percentage_24h ?? technicalAnalysis.ethereum.cryptoPrice?.price_change_percentage_24h)?.toFixed(2) || 'N/A'}%
                  </p>
                </div>
                <div className="bg-gray-700 p-3 rounded text-center">
                  <p className="text-xs text-gray-400">News Sentiment</p>
                  <p className={`text-lg font-bold ${technicalAnalysis.ethereum.sentiment?.newsSentiment > 0.6 ? 'text-green-400' : technicalAnalysis.ethereum.sentiment?.newsSentiment < 0.4 ? 'text-red-400' : 'text-white'}`}>
                    {(technicalAnalysis.ethereum.sentiment?.newsSentiment * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Key Levels */}
              {technicalAnalysis.ethereum.keyLevels && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Key Support & Resistance Levels</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-green-400 font-medium">Support Levels:</p>
                      {technicalAnalysis.ethereum.keyLevels.support.map((level, idx) => (
                        <p key={idx} className="text-xs ml-2">${level.toFixed(0)}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm text-red-400 font-medium">Resistance Levels:</p>
                      {technicalAnalysis.ethereum.keyLevels.resistance.map((level, idx) => (
                        <p key={idx} className="text-xs ml-2">${level.toFixed(0)}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {technicalAnalysis.ethereum.recommendations && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Trading Recommendations</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {technicalAnalysis.ethereum.recommendations.slice(0, 4).map((rec, idx) => (
                      <li key={idx} className="text-gray-300">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Assessment */}
              {technicalAnalysis.ethereum.riskAssessment && (
                <div className="p-3 bg-gray-700 rounded">
                  <h4 className="font-medium mb-1">Risk Assessment</h4>
                  <p className="text-sm text-gray-300">{technicalAnalysis.ethereum.riskAssessment}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Data Quality Notice */}
        <div className="mt-8 p-4 bg-blue-900 rounded-lg text-center">
          <p className="text-sm text-blue-200">
            <strong>Data Quality:</strong> This dashboard aggregates data from 50+ verified news sources, 
            social media sentiment from key industry influencers, and real-time price feeds. 
            All news links are verified and lead to actual articles.
          </p>
        </div>
      </main>

      <style jsx global>{`
        .loading-spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 4px solid #3b82f6;
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
