import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FaExternalLinkAlt, FaBitcoin, FaEthereum } from 'react-icons/fa';

const NewsCard = ({ article, coin }) => {
  const getCoinIcon = () => {
    if (coin === 'bitcoin') return <FaBitcoin className="text-orange-500" />;
    if (coin === 'ethereum') return <FaEthereum className="text-blue-500" />;
    return null;
  };

  const getSourceColor = (source) => {
    switch(source) {
      case 'coindesk': return 'bg-blue-100 text-blue-800';
      case 'cointelegraph': return 'bg-purple-100 text-purple-800';
      case 'cryptonews': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getCoinIcon()}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(article.source)}`}>
            {article.source}
          </span>
        </div>
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <FaExternalLinkAlt />
        </a>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {article.title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-3">
        {article.content}
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {article.sentiment?.score > 0 ? '📈 Bullish' : article.sentiment?.score < 0 ? '📉 Bearish' : '📊 Neutral'}
        </span>
        <span>
          {formatDistanceToNow(new Date(article.timestamp || Date.now()), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};

export default NewsCard;