import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';

export default function Home() {
  const [newsData, setNewsData] = useState({ bitcoin: [], ethereum: [] });
  const [technicalData, setTechnicalData] = useState({ bitcoin: null, ethereum: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch news data
        const [bitcoinNewsRes, ethereumNewsRes] = await Promise.all([
          fetch('/api/news/bitcoin'),
          fetch('/api/news/ethereum')
        ]);
        
        const bitcoinNews = await bitcoinNewsRes.json();
        const ethereumNews = await ethereumNewsRes.json();
        
        setNewsData({
          bitcoin: bitcoinNews.articles || [],
          ethereum: ethereumNews.articles || []
        });

        // Fetch technical data
        const [bitcoinTechRes, ethereumTechRes] = await Promise.all([
          fetch('/api/technical/bitcoin'),
          fetch('/api/technical/ethereum')
        ]);
        
        const bitcoinTech = await bitcoinTechRes.json();
        const ethereumTech = await ethereumTechRes.json();
        
        setTechnicalData({
          bitcoin: bitcoinTech.data || null,
          ethereum: ethereumTech.data || null
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-white">Loading crypto analysis dashboard...</p>
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
        <title>Crypto Analysis Dashboard</title>
        <meta name="description" content="Real-time Bitcoin and Ethereum news with technical analysis" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-gray-800 p-4 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-center">Crypto Analysis Dashboard</h1>
          <p className="text-center text-gray-400 mt-2">Real-time BTC & ETH News + Technical Analysis</p>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Bitcoin Section */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">Bitcoin (BTC)</h2>
          
          {/* News */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2">Latest News</h3>
            {newsData.bitcoin.length > 0 ? (
              <div className="space-y-2">
                {newsData.bitcoin.map((article, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-700 pb-2 last:border-0 last:pb-0"
                  >
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                      {article.title}
                    </a>
                    <p className="text-sm text-gray-400 mt-1">{article.summary}</p>
                    <p className="text-xs text-gray-500 mt-1">Source: {article.source} | Sentiment: {article.sentiment}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No news available</p>
            )}
          </div>

          {/* Technical Analysis */}
          {technicalData.bitcoin && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Technical Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Current Price</p>
                  <p className="text-lg font-bold">${technicalData.bitcoin.price?.toLocaleString() || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">RSI</p>
                  <p className="text-lg font-bold">{technicalData.bitcoin.indicators?.rsi?.toFixed(1) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">20 SMA</p>
                  <p className="text-lg font-bold">${technicalData.bitcoin.indicators?.sma?.['20']?.toLocaleString() || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Volume</p>
                  <p className="text-lg font-bold">{technicalData.bitcoin.volume?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Ethereum Section */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-purple-400">Ethereum (ETH)</h2>
          
          {/* News */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2">Latest News</h3>
            {newsData.ethereum.length > 0 ? (
              <div className="space-y-2">
                {newsData.ethereum.map((article, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-700 pb-2 last:border-0 last:pb-0"
                  >
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                      {article.title}
                    </a>
                    <p className="text-sm text-gray-400 mt-1">{article.summary}</p>
                    <p className="text-xs text-gray-500 mt-1">Source: {article.source} | Sentiment: {article.sentiment}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No news available</p>
            )}
          </div>

          {/* Technical Analysis */}
          {technicalData.ethereum && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Technical Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Current Price</p>
                  <p className="text-lg font-bold">${technicalData.ethereum.price?.toLocaleString() || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">RSI</p>
                  <p className="text-lg font-bold">{technicalData.ethereum.indicators?.rsi?.toFixed(1) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">20 SMA</p>
                  <p className="text-lg font-bold">${technicalData.ethereum.indicators?.sma?.['20']?.toLocaleString() || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Volume</p>
                  <p className="text-lg font-bold">{technicalData.ethereum.volume?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <style jsx global>{`
        .loading-spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 4px solid #fff;
          width: 24px;
          height: 24px;
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