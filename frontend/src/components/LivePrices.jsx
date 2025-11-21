import React, { useState, useEffect } from 'react';

const LivePrices = ({ language, getText }) => {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState('davangere');
  const [selectedCrop, setSelectedCrop] = useState('Rice');

  const markets = [
    { value: 'davangere', label: 'Davangere' },
    { value: 'gangavathi', label: 'Gangavathi' },
    { value: 'hospet', label: 'Hospet' },
    { value: 'HBhalli', label: 'H.B. Halli' }
  ];

  const crops = {
    davangere: ['Rice', 'Maize', 'Ragi', 'Cotton', 'Tomato'],
    gangavathi: ['Rice', 'Maize', 'Ragi', 'Cotton'],
    hospet: ['Rice', 'Maize', 'Ragi', 'Tomato'],
    HBhalli: ['Rice', 'Maize', 'Ragi', 'Cotton']
  };

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use backend on port 4000 and the history endpoint
      const marketKey = selectedMarket; // already matches backend values including 'HBhalli'
      const cropName = selectedCrop; // capitalized to match backend
      const response = await fetch(`http://localhost:4000/api/history/${marketKey}/${encodeURIComponent(cropName)}?limit=30`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // data is an array of { date, price }
      const last = Array.isArray(data) && data.length > 0 ? data[data.length - 1] : null;
      setPrices({
        price: last ? last.price : undefined,
        lastUpdated: last ? last.date : undefined,
        history: Array.isArray(data) ? data : []
      });
    } catch (err) {
      console.error('Error fetching prices:', err);
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [selectedMarket, selectedCrop]);

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `₹${price.toFixed(2)}`;
    }
    return price || 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString(language === 'en' ? 'en-IN' : language === 'hi' ? 'hi-IN' : 'kn-IN');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {getText('livePrices')}
        </h1>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getText('selectMarket')}
            </label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {markets.map(market => (
                <option key={market.value} value={market.value}>
                  {market.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getText('selectCrop')}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {crops[selectedMarket]?.map(crop => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={fetchPrices}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading...' : getText('refresh')}
        </button>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{getText('loading')}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-red-600 mr-3">⚠️</div>
            <div>
              <h3 className="text-red-800 font-medium">{getText('error')}</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && Object.keys(prices).length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                {getText('currentPrice')}
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {formatPrice(prices.price)}
              </p>
              <p className="text-sm text-green-600 mt-1">
                per quintal
              </p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                {getText('lastUpdated')}
              </h3>
              <p className="text-lg font-medium text-blue-600">
                {formatDate(prices.lastUpdated)}
              </p>
            </div>
          </div>
          
          {prices.history && prices.history.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Price History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.history.slice(0, 10).map((entry, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2">{formatDate(entry.date)}</td>
                        <td className="px-4 py-2 font-medium">{formatPrice(entry.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && !error && Object.keys(prices).length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <p className="text-gray-600">No price data available for the selected market and crop.</p>
        </div>
      )}
    </div>
  );
};

export default LivePrices;
