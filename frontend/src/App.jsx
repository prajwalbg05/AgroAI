import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import LivePrices from "./components/LivePrices";
import PricePrediction from "./components/PricePrediction";
import CropAdvisory from "./components/CropAdvisory";
import ChatBot from "./components/ChatBot";

function App() {
  const [language, setLanguage] = useState("en");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const languages = {
    en: "English",
    hi: "हिन्दी",
    kn: "ಕನ್ನಡ",
  };

  const toggleLanguage = () => {
    const langKeys = Object.keys(languages);
    const currentIndex = langKeys.indexOf(language);
    const nextIndex = (currentIndex + 1) % langKeys.length;
    setLanguage(langKeys[nextIndex]);
  };

  const startListening = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang =
        language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "kn-IN";

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        processVoiceCommand(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert("Speech recognition not supported in this browser");
    }
  };

  const processVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    if (
      lowerCommand.includes("home") ||
      lowerCommand.includes("मुख्य") ||
      lowerCommand.includes("ಮುಖ್ಯ")
    ) {
      window.location.href = "/";
    } else if (
      lowerCommand.includes("price") ||
      lowerCommand.includes("भाव") ||
      lowerCommand.includes("ಬೆಲೆ")
    ) {
      window.location.href = "/live-prices";
    } else if (
      lowerCommand.includes("predict") ||
      lowerCommand.includes("भविष्यवाणी") ||
      lowerCommand.includes("ಭವಿಷ್ಯವಾಣಿ")
    ) {
      window.location.href = "/price-prediction";
    } else if (
      lowerCommand.includes("advisory") ||
      lowerCommand.includes("सलाह") ||
      lowerCommand.includes("ಸಲಹೆ")
    ) {
      window.location.href = "/crop-advisory";
    } else if (
      lowerCommand.includes("language") ||
      lowerCommand.includes("भाषा") ||
      lowerCommand.includes("ಭಾಷೆ")
    ) {
      toggleLanguage();
    }
  };

  const getText = (key) => {
    const translations = {
      home: { en: "Home", hi: "मुख्य", kn: "ಮುಖ್ಯ" },
      livePrices: { en: "Live Prices", hi: "लाइव भाव", kn: "ದೃಶ್ಯ ಬೆಲೆಗಳು" },
      pricePrediction: {
        en: "Price Prediction",
        hi: "भाव भविष्यवाणी",
        kn: "ಬೆಲೆ ಭವಿಷ್ಯವಾಣಿ",
      },
      cropAdvisory: {
        en: "Crop Advisory",
        hi: "फसल सलाह",
        kn: "ಬೆಳೆ ಸಲಹೆ",
      },
      voiceCommand: {
        en: "Voice Command",
        hi: "आवाज़ कमांड",
        kn: "ಧ್ವನಿ ಆಜ್ಞೆ",
      },
      listening: {
        en: "Listening...",
        hi: "सुन रहे हैं...",
        kn: "ಕೇಳುತ್ತಿದೆ...",
      },
    };
    return translations[key]?.[language] || translations[key]?.en || key;
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-green-700 text-white flex flex-col">
          <div className="p-6 text-2xl font-bold border-b border-green-600">
            🌾 Crop Advisory
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link
              to="/"
              className="block px-4 py-2 rounded-lg hover:bg-green-600 transition"
            >
              {getText("home")}
            </Link>
            <Link
              to="/live-prices"
              className="block px-4 py-2 rounded-lg hover:bg-green-600 transition"
            >
              {getText("livePrices")}
            </Link>
            <Link
              to="/price-prediction"
              className="block px-4 py-2 rounded-lg hover:bg-green-600 transition"
            >
              {getText("pricePrediction")}
            </Link>
            <Link
              to="/crop-advisory"
              className="block px-4 py-2 rounded-lg hover:bg-green-600 transition"
            >
              {getText("cropAdvisory")}
            </Link>
          </nav>
          <div className="p-4 text-sm border-t border-green-600">
            © {new Date().getFullYear()} Crop Advisory
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Topbar */}
          <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
            <div className="text-lg font-semibold text-gray-700">
              Dashboard
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={startListening}
                disabled={isListening}
                className={`px-4 py-2 rounded-lg font-medium transition-all shadow ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isListening
                  ? "🎤 " + getText("listening")
                  : "🎤 " + getText("voiceCommand")}
              </button>
              <button
                onClick={toggleLanguage}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
              >
                {languages[language]}
              </button>
            </div>
          </header>

          {/* Transcript */}
          {transcript && (
            <div className="px-6 py-2">
              <div className="bg-gray-100 border border-gray-300 p-3 rounded-lg shadow">
                <p className="text-sm text-gray-700">
                  🎧 Voice Command: {transcript}
                </p>
              </div>
            </div>
          )}

          {/* Routes */}
          <main className="flex-1 p-6">
            <Routes>
              <Route
                path="/"
                element={<Home language={language} getText={getText} />}
              />
              <Route
                path="/live-prices"
                element={<LivePrices language={language} getText={getText} />}
              />
              <Route
                path="/price-prediction"
                element={<PricePrediction language={language} getText={getText} />}
              />
              <Route
                path="/crop-advisory"
                element={<CropAdvisory language={language} getText={getText} />}
              />
            </Routes>
          </main>
        </div>

        {/* Chatbot floating */}
        <div className="fixed bottom-6 right-6">
          <ChatBot language={language} getText={getText} />
        </div>
      </div>
    </Router>
  );
}

export default App;
