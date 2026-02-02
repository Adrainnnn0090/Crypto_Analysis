import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TechnicalChart({ data, currentPrice, darkMode }) {
  if (!data || data.length === 0) {
    return (
      <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No price data available</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = data.map((price, index) => ({
    time: index,
    price: price
  }));

  return (
    <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={darkMode ? '#374151' : '#e5e7eb'} 
          />
          <XAxis 
            dataKey="time" 
            hide={true}
          />
          <YAxis 
            domain={['auto', 'auto']}
            tick={{ fill: darkMode ? '#9CA3AF' : '#6B7280' }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
              borderColor: darkMode ? '#374151' : '#E5E7EB',
              color: darkMode ? '#F9FAFB' : '#1F2937'
            }}
            formatter={(value) => [`$${parseFloat(value).toFixed(2)}`, 'Price']}
            labelFormatter={() => 'Hour'}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#F2A900" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-center">
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Current Price: <span className="font-semibold text-crypto-btc">${currentPrice?.toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
}