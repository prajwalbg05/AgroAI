import React from 'react';
import { Link } from 'react-router-dom';

const Home = ({ language, getText }) => {

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          {getText('welcomeTitle')}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          {getText('welcomeSubtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/live-prices"
            className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors"
          >
            {getText('livePrices')}
          </Link>
          <Link
            to="/price-prediction"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {getText('pricePrediction')}
          </Link>
          <Link
            to="/crop-advisory"
            className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-purple-700 transition-colors"
          >
            {getText('cropAdvisory')}
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          {getText('features')}
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-green-50 rounded-xl">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3 text-green-700">
              {getText('livePrices')}
            </h3>
            <p className="text-gray-600">
              {getText('livePricesDesc')}
            </p>
          </div>
          
          <div className="text-center p-6 bg-blue-50 rounded-xl">
            <div className="text-4xl mb-4">🔮</div>
            <h3 className="text-xl font-semibold mb-3 text-blue-700">
              {getText('pricePrediction')}
            </h3>
            <p className="text-gray-600">
              {getText('predictionDesc')}
            </p>
          </div>
          
          <div className="text-center p-6 bg-purple-50 rounded-xl">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold mb-3 text-purple-700">
              {getText('cropAdvisory')}
            </h3>
            <p className="text-gray-600">
              {getText('advisoryDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl text-white">
        <h2 className="text-3xl font-bold mb-4">
          {getText('getStarted')}
        </h2>
        <p className="text-xl mb-6 opacity-90">
          Start exploring our features to make informed farming decisions
        </p>
        <Link
          to="/live-prices"
          className="bg-white text-green-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors inline-block"
        >
          {getText('getStarted')}
        </Link>
      </div>
    </div>
  );
};

export default Home;
