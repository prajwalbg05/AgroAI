import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PricePrediction = ({ language, getText }) => {
  const [formData, setFormData] = useState({
    market: 'davangere',
    crop: 'Rice',
    days: 30
  });
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPredictions(null);

    try {
      const response = await fetch('http://localhost:4000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: 'price_forecast',
          market: formData.market,
          crop: formData.crop,
          days: formData.days
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPredictions(data);
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'days' ? parseInt(value) : value
    }));
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `₹${price.toFixed(2)}`;
    }
    return price || 'N/A';
  };

  const prepareChartData = () => {
    if (!predictions) return [];
    const numDays = 7; // show a week

    // If backend returns an explicit predictions array, prefer it
    if (Array.isArray(predictions.predictions) && predictions.predictions.length > 0) {
      const series = predictions.predictions.slice(0, numDays);
      return series.map((pred, index) => ({
        day: `Day ${index + 1}`,
        price: pred,
        lower: predictions.prediction_range ? predictions.prediction_range[0] : pred,
        upper: predictions.prediction_range ? predictions.prediction_range[1] : pred,
        date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toLocaleDateString()
      }));
    }

    // Otherwise, synthesize a flat weekly series using forecast and range
    const base = predictions.forecast ?? predictions.predicted_price ?? 0;
    let lower = Array.isArray(predictions.prediction_range) ? predictions.prediction_range[0] : base;
    let upper = Array.isArray(predictions.prediction_range) ? predictions.prediction_range[1] : base;
    // Ensure visible range on the Y axis
    if (upper === lower) {
      const pad = Math.max(1, base * 0.01);
      lower = base - pad;
      upper = base + pad;
    }
    return Array.from({ length: numDays }).map((_, index) => ({
      day: `Day ${index + 1}`,
      price: base,
      lower,
      upper,
      date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toLocaleDateString()
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {getText('pricePrediction')}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getText('selectMarket')}
              </label>
              <select
                name="market"
                value={formData.market}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
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
                name="crop"
                value={formData.crop}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {crops[formData.market]?.map(crop => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getText('predictionDays')}
              </label>
              <input
                type="number"
                name="days"
                value={formData.days}
                onChange={handleInputChange}
                min="1"
                max="90"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? getText('loading') : getText('predict')}
          </button>
        </form>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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

      {predictions && (
        <div className="space-y-6">
          {/* Prediction Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  {getText('predictedPrice')}
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {formatPrice(predictions.forecast ?? predictions.predicted_price)}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  per quintal
                </p>
              </div>
              
              {typeof predictions.confidence === 'number' && (
                <div className="bg-green-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    {getText('confidence')}
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {(predictions.confidence * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    model accuracy
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chart */}
          {(Array.isArray(predictions.predictions) && predictions.predictions.length > 0) ||
           (predictions.forecast != null || predictions.predicted_price != null) ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                {getText('priceChart')}
              </h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareChartData()} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={['dataMin', 'dataMax']} />
                    <Tooltip 
                      formatter={(value) => [formatPrice(value), 'Price']}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0] && payload[0].payload) {
                          return `Date: ${payload[0].payload.date}`;
                        }
                        return label;
                      }}
                    />
                    {/* Lower and upper bands (dashed) */}
                    <Line 
                      type="monotone" 
                      dataKey="lower" 
                      stroke="#94a3b8" 
                      strokeDasharray="5 5"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="upper" 
                      stroke="#94a3b8" 
                      strokeDasharray="5 5"
                      dot={false}
                    />
                    {/* Forecast line */}
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default PricePrediction;
