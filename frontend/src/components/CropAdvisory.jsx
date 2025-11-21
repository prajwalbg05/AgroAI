import React, { useState } from 'react';

const CropAdvisory = ({ language, getText }) => {
  const [formData, setFormData] = useState({
    market: 'davangere',
    soilType: 'loamy',
    season: 'kharif',
    rainfall: 800,
    temperature: 25,
    ph: 6.5
  });
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const markets = [
    { value: 'davangere', label: 'Davangere' },
    { value: 'gangavathi', label: 'Gangavathi' },
    { value: 'hospet', label: 'Hospet' },
    { value: 'HBhalli', label: 'H.B. Halli' }
  ];

  const soilTypes = [
    { value: 'loamy', label: 'Loamy' },
    { value: 'clayey', label: 'Clayey' },
    { value: 'sandy', label: 'Sandy' },
    { value: 'silty', label: 'Silty' }
  ];

  const seasons = [
    { value: 'kharif', label: 'Kharif (June-October)' },
    { value: 'rabi', label: 'Rabi (October-March)' },
    { value: 'zaid', label: 'Zaid (March-June)' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      // Map season to representative month for the enhanced API
      const seasonToMonth = { kharif: 8, rabi: 1, zaid: 4 };
      const month = seasonToMonth[formData.season] || new Date().getMonth() + 1;

      const url = `http://localhost:4000/api/recommendations?market=${encodeURIComponent(formData.market)}&month=${month}`;
      const response = await fetch(url, { method: 'GET' });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Normalize payload to { confidence, recommended_crops: [{ crop, suitability_score }] }
      let normalized = { ...data };
      // Case A: API returned `recommended_crops` as strings + optional confidence_scores
      if (Array.isArray(normalized.recommended_crops) && typeof normalized.recommended_crops[0] === 'string') {
        const scores = Array.isArray(normalized.confidence_scores) ? normalized.confidence_scores : [];
        normalized.recommended_crops = normalized.recommended_crops.map((crop, i) => ({
          crop,
          suitability_score: Math.round((scores[i] ?? 0) * 100)
        }));
        if (typeof normalized.confidence !== 'number' && scores.length) {
          normalized.confidence = Math.max(...scores);
        }
      }
      // Case B: Older shape `recommendations`
      if (!normalized.recommended_crops && Array.isArray(data.recommendations)) {
        const scores = Array.isArray(data.confidence_scores) ? data.confidence_scores : [];
        normalized.recommended_crops = data.recommendations.map((crop, i) => ({
          crop,
          suitability_score: Math.round((scores[i] || 0) * 100)
        }));
        if (typeof normalized.confidence !== 'number' && scores.length) {
          normalized.confidence = Math.max(...scores);
        }
      }
      setRecommendations(normalized);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rainfall' || name === 'temperature' || name === 'ph' ? parseFloat(value) : value
    }));
  };

  const getSuitabilityColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getSuitabilityText = (score) => {
    if (score >= 80) return 'Highly Suitable';
    if (score >= 60) return 'Moderately Suitable';
    return 'Low Suitability';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {getText('cropAdvisory')}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getText('selectMarket')}
              </label>
              <select
                name="market"
                value={formData.market}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                {getText('soilType')}
              </label>
              <select
                name="soilType"
                value={formData.soilType}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                {soilTypes.map(soil => (
                  <option key={soil.value} value={soil.value}>
                    {soil.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getText('season')}
              </label>
              <select
                name="season"
                value={formData.season}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                {seasons.map(season => (
                  <option key={season.value} value={season.value}>
                    {season.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getText('rainfall')}
              </label>
              <input
                type="number"
                name="rainfall"
                value={formData.rainfall}
                onChange={handleInputChange}
                min="0"
                max="2000"
                step="50"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getText('temperature')}
              </label>
              <input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleInputChange}
                min="10"
                max="45"
                step="0.5"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getText('ph')}
              </label>
              <input
                type="number"
                name="ph"
                value={formData.ph}
                onChange={handleInputChange}
                min="4"
                max="10"
                step="0.1"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? getText('loading') : getText('getRecommendations')}
          </button>
        </form>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
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

      {recommendations && (
        <div className="space-y-6">
          {/* Confidence Score */}
          { (typeof recommendations.confidence === 'number' || Array.isArray(recommendations.confidence_scores)) && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {getText('confidence')}
                </h3>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {(
                    typeof recommendations.confidence === 'number'
                      ? recommendations.confidence * 100
                      : Math.max(...recommendations.confidence_scores) * 100
                  ).toFixed(1)}%
                </div>
                <p className="text-gray-600">Model Accuracy</p>
              </div>
            </div>
          )}

          {/* Recommended Crops */}
          {recommendations.recommended_crops && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                {getText('recommendedCrops')}
              </h3>
              
              <div className="grid gap-4">
                {recommendations.recommended_crops.map((crop, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-medium text-gray-800 capitalize">
                        {crop.crop}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSuitabilityColor(crop.suitability_score)}`}>
                        {crop.suitability_score}% - {getSuitabilityText(crop.suitability_score)}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <h5 className="font-medium text-gray-700 mb-1">{getText('suitability')}</h5>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${crop.suitability_score}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{crop.suitability_score}%</p>
                      </div>
                      
                      {crop.expected_yield && (
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1">Expected Yield</h5>
                          <p className="text-gray-600">{crop.expected_yield}</p>
                        </div>
                      )}
                    </div>
                    
                    {crop.reasoning && (
                      <div className="mt-3">
                        <h5 className="font-medium text-gray-700 mb-1">Reasoning</h5>
                        <p className="text-sm text-gray-600">{crop.reasoning}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Market Conditions */}
          {recommendations.market_conditions && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {getText('marketConditions')}
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700">{recommendations.market_conditions}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CropAdvisory;
