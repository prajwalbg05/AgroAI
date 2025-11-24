// Multilingual Translation System
const translations = {
    'en': {
        // Navigation
        'nav.home': 'Home',
        'nav.live-prices': 'Live Prices',
        'nav.price-predictions': 'Price Predictions',
        'nav.crop-advisory': 'Crop Advisory',
        'nav.ai-assistant': 'AI Assistant',
        
        // Header
        'header.title': 'AgroAI',
        'header.subtitle': 'Crop Advisory Dashboard',
        'header.notifications': 'Notifications',
        'header.theme': 'Theme',
        'header.language': 'Language',
        
        // Home Page
        'home.title': 'Welcome to AgroAI',
        'home.subtitle': 'Your intelligent agricultural companion',
        'home.select-city': 'Select Your City',
        'home.crop-advisory': 'Crop Advisory',
        'home.price-forecast': 'Price Forecast',
        'home.market-analysis': 'Market Analysis',
        'home.ai-insights': 'AI Insights',
        
        // Cities
        'city.davangere': 'Davangere',
        'city.gangavathi': 'Gangavathi',
        'city.hbhalli': 'H.B. Halli',
        'city.hospet': 'Hospet',
        
        // Crops
        'crop.rice': 'Rice',
        'crop.maize': 'Maize',
        'crop.cotton': 'Cotton',
        'crop.tomato': 'Tomato',
        'crop.ragi': 'Ragi',
        
        // Live Prices
        'prices.title': 'Live Crop Prices',
        'prices.subtitle': 'Real-time price updates from Agmarknet markets',
        'prices.location': 'Location',
        'prices.crop': 'Crop',
        'prices.variety': 'Variety',
        'prices.min-price': 'Min Price',
        'prices.max-price': 'Max Price',
        'prices.modal-price': 'Modal Price',
        'prices.last-updated': 'Last Updated',
        'prices.filter-location': 'Select Location',
        'prices.filter-crop': 'Select Crop',
        'prices.all-locations': 'All Locations',
        'prices.all-crops': 'All Crops',
        
        // Price Predictions
        'predictions.title': 'Price Predictions',
        'predictions.subtitle': 'AI-powered price forecasting using Attention-Enhanced LSTM models',
        'predictions.select-location': 'Select Location',
        'predictions.select-crop': 'Select Crop',
        'predictions.forecast-period': 'Forecast Period',
        'predictions.generate': 'Generate Prediction',
        'predictions.predicted-price': 'Predicted Price',
        'predictions.price-trend': 'Price Trend',
        'predictions.confidence': 'Confidence',
        'predictions.period-7': '7 Days',
        'predictions.period-15': '15 Days',
        'predictions.period-30': '30 Days',
        'predictions.period-60': '60 Days',
        
        // Crop Advisory
        'advisory.title': 'Crop Advisory',
        'advisory.subtitle': 'Get AI-powered recommendations based on soil, weather, and market conditions',
        'advisory.input-parameters': 'Input Parameters',
        'advisory.soil-type': 'Soil Type',
        'advisory.season': 'Season',
        'advisory.ph-level': 'pH Level',
        'advisory.area': 'Area (Acres)',
        'advisory.location': 'Location',
        'advisory.irrigation': 'Irrigation Type',
        'advisory.get-recommendations': 'Get AI Recommendations',
        'advisory.recommendations': 'Crop Recommendations',
        'advisory.placeholder': 'Fill the form to get personalized crop recommendations',
        'advisory.placeholder-subtitle': 'Our AI will analyze your parameters and suggest the best crops for your conditions',
        'advisory.ai-powered': 'AI-Powered Crop Recommendations',
        'advisory.based-on': 'Based on your parameters and Attention-Enhanced LSTM analysis',
        'advisory.suitability-score': 'Suitability Score',
        'advisory.confidence': 'Confidence',
        'advisory.expected-yield': 'Expected Yield',
        'advisory.planting-time': 'Best Planting Time',
        'advisory.suitable-for': 'Suitable for',
        'advisory.optimal-ph': 'Optimal pH range',
        'advisory.irrigation-compatible': 'irrigation compatible',
        'advisory.analyzing': 'Analyzing your parameters with Attention-Enhanced LSTM...',
        'advisory.loading-subtitle': 'This may take a few moments',
        
        // Soil Types
        'soil.clay': 'Clay',
        'soil.sandy': 'Sandy',
        'soil.loamy': 'Loamy',
        'soil.silty': 'Silty',
        'soil.red': 'Red Soil',
        'soil.black': 'Black Soil',
        
        // Seasons
        'season.kharif': 'Kharif (June-October)',
        'season.rabi': 'Rabi (October-March)',
        'season.zaid': 'Zaid (March-June)',
        
        // Irrigation Types
        'irrigation.rainfed': 'Rainfed',
        'irrigation.irrigated': 'Irrigated',
        'irrigation.drip': 'Drip Irrigation',
        'irrigation.sprinkler': 'Sprinkler',
        
        // AI Assistant
        'ai.title': 'AI Assistant',
        'ai.subtitle': 'Get instant answers to your agricultural queries',
        'ai.placeholder': 'Type your message here...',
        'ai.send': 'Send',
        'ai.welcome': 'Hello! I\'m your AI agricultural assistant. I can help you with:',
        'ai.capabilities': [
            'Crop price information',
            'Agricultural best practices',
            'Weather impact on crops',
            'Market trends and predictions'
        ],
        'ai.how-can-i-help': 'How can I assist you today?',
        
        // Common
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.cancel': 'Cancel',
        'common.save': 'Save',
        'common.edit': 'Edit',
        'common.delete': 'Delete',
        'common.view': 'View',
        'common.simulate': 'Simulate Price Changes',
        'common.simulate-tooltip': 'Click to simulate price changes and test alerts',
        'common.details': 'Details',
        'common.close': 'Close',
        'common.yes': 'Yes',
        'common.no': 'No',
        'common.today': 'Today',
        'common.yesterday': 'Yesterday',
        'common.tomorrow': 'Tomorrow',
        'common.available': 'Available',
        'common.unavailable': 'Unavailable',
        'common.no-data': 'No data found for the selected filters',
        'common.high': 'High',
        'common.medium': 'Medium',
        'common.low': 'Low',
        'common.rising': 'Rising',
        'common.falling': 'Falling',
        'common.stable': 'Stable',
        
        // Toggle Switch
        'toggle.off': 'OFF',
        'toggle.on': 'ON',
        
        // Crop Status
        'crop.available': 'Available',
        'crop.unavailable': 'Unavailable',
        'crop.price-varies': 'Price varies',
        'crop.view-details': 'View Details',
        
        // Welcome Messages
        'welcome.greeting': 'Welcome to AgroAI',
        'welcome.subtitle': 'Your intelligent agricultural companion',
        'welcome.description': 'Your intelligent farming companion for market insights and crop management.',
        
        // Crop Advisory Section
        'advisory.section-title': 'Davangere Crop Advisory',
        'advisory.section-subtitle': 'Agricultural insights for Davangere region',
        
        // Price Ranges
        'price.range': '₹{0}-{1}/quintal',
        'price.varies': 'Price varies'
    },
    
    'hi': {
        // Navigation
        'nav.home': 'होम',
        'nav.live-prices': 'लाइव कीमतें',
        'nav.price-predictions': 'कीमत पूर्वानुमान',
        'nav.crop-advisory': 'फसल सलाह',
        'nav.ai-assistant': 'AI सहायक',
        
        // Header
        'header.title': 'AgroAI',
        'header.subtitle': 'फसल सलाह डैशबोर्ड',
        'header.notifications': 'सूचनाएं',
        'header.theme': 'थीम',
        'header.language': 'भाषा',
        
        // Home Page
        'home.title': 'AgroAI में आपका स्वागत है',
        'home.subtitle': 'आपका बुद्धिमान कृषि साथी',
        'home.select-city': 'अपना शहर चुनें',
        'home.crop-advisory': 'फसल सलाह',
        'home.price-forecast': 'कीमत पूर्वानुमान',
        'home.market-analysis': 'बाजार विश्लेषण',
        'home.ai-insights': 'AI अंतर्दृष्टि',
        
        // Cities
        'city.davangere': 'दावणगेरे',
        'city.gangavathi': 'गंगावती',
        'city.hbhalli': 'एच.बी. हल्ली',
        'city.hospet': 'होसपेट',
        
        // Crops
        'crop.rice': 'चावल',
        'crop.maize': 'मक्का',
        'crop.cotton': 'कपास',
        'crop.tomato': 'टमाटर',
        'crop.ragi': 'रागी',
        
        // Live Prices
        'prices.title': 'लाइव फसल कीमतें',
        'prices.subtitle': 'Agmarknet बाजारों से रियल-टाइम कीमत अपडेट',
        'prices.location': 'स्थान',
        'prices.crop': 'फसल',
        'prices.variety': 'किस्म',
        'prices.min-price': 'न्यूनतम कीमत',
        'prices.max-price': 'अधिकतम कीमत',
        'prices.modal-price': 'मोडल कीमत',
        'prices.last-updated': 'अंतिम अपडेट',
        'prices.filter-location': 'स्थान चुनें',
        'prices.filter-crop': 'फसल चुनें',
        'prices.all-locations': 'सभी स्थान',
        'prices.all-crops': 'सभी फसलें',
        
        // Price Predictions
        'predictions.title': 'कीमत पूर्वानुमान',
        'predictions.subtitle': 'Attention-Enhanced LSTM मॉडल का उपयोग करके AI-संचालित कीमत पूर्वानुमान',
        'predictions.select-location': 'स्थान चुनें',
        'predictions.select-crop': 'फसल चुनें',
        'predictions.forecast-period': 'पूर्वानुमान अवधि',
        'predictions.generate': 'पूर्वानुमान जेनरेट करें',
        'predictions.predicted-price': 'पूर्वानुमानित कीमत',
        'predictions.price-trend': 'कीमत प्रवृत्ति',
        'predictions.confidence': 'आत्मविश्वास',
        'predictions.period-7': '7 दिन',
        'predictions.period-15': '15 दिन',
        'predictions.period-30': '30 दिन',
        'predictions.period-60': '60 दिन',
        
        // Crop Advisory
        'advisory.title': 'फसल सलाह',
        'advisory.subtitle': 'मिट्टी, मौसम और बाजार की स्थिति के आधार पर AI-संचालित सिफारिशें प्राप्त करें',
        'advisory.input-parameters': 'इनपुट पैरामीटर',
        'advisory.soil-type': 'मिट्टी का प्रकार',
        'advisory.season': 'मौसम',
        'advisory.ph-level': 'pH स्तर',
        'advisory.area': 'क्षेत्र (एकड़)',
        'advisory.location': 'स्थान',
        'advisory.irrigation': 'सिंचाई प्रकार',
        'advisory.get-recommendations': 'AI सिफारिशें प्राप्त करें',
        'advisory.recommendations': 'फसल सिफारिशें',
        'advisory.placeholder': 'व्यक्तिगत फसल सिफारिशें प्राप्त करने के लिए फॉर्म भरें',
        'advisory.placeholder-subtitle': 'हमारा AI आपके पैरामीटर का विश्लेषण करेगा और आपकी स्थिति के लिए सबसे अच्छी फसलों का सुझाव देगा',
        'advisory.ai-powered': 'AI-संचालित फसल सिफारिशें',
        'advisory.based-on': 'आपके पैरामीटर और Attention-Enhanced LSTM विश्लेषण के आधार पर',
        'advisory.suitability-score': 'उपयुक्तता स्कोर',
        'advisory.confidence': 'आत्मविश्वास',
        'advisory.expected-yield': 'अपेक्षित उपज',
        'advisory.planting-time': 'सर्वोत्तम रोपण समय',
        'advisory.suitable-for': 'के लिए उपयुक्त',
        'advisory.optimal-ph': 'इष्टतम pH रेंज',
        'advisory.irrigation-compatible': 'सिंचाई संगत',
        'advisory.analyzing': 'Attention-Enhanced LSTM के साथ आपके पैरामीटर का विश्लेषण...',
        'advisory.loading-subtitle': 'इसमें कुछ क्षण लग सकते हैं',
        
        // Soil Types
        'soil.clay': 'चिकनी मिट्टी',
        'soil.sandy': 'बलुई मिट्टी',
        'soil.loamy': 'दोमट मिट्टी',
        'soil.silty': 'गाद मिट्टी',
        'soil.red': 'लाल मिट्टी',
        'soil.black': 'काली मिट्टी',
        
        // Seasons
        'season.kharif': 'खरीफ (जून-अक्टूबर)',
        'season.rabi': 'रबी (अक्टूबर-मार्च)',
        'season.zaid': 'जायद (मार्च-जून)',
        
        // Irrigation Types
        'irrigation.rainfed': 'वर्षा आधारित',
        'irrigation.irrigated': 'सिंचित',
        'irrigation.drip': 'ड्रिप सिंचाई',
        'irrigation.sprinkler': 'स्प्रिंकलर',
        
        // AI Assistant
        'ai.title': 'AI सहायक',
        'ai.subtitle': 'अपने कृषि प्रश्नों के तुरंत उत्तर प्राप्त करें',
        'ai.placeholder': 'अपना संदेश यहाँ टाइप करें...',
        'ai.send': 'भेजें',
        'ai.welcome': 'नमस्ते! मैं आपका AI कृषि सहायक हूँ। मैं आपकी इन चीजों में मदद कर सकता हूँ:',
        'ai.capabilities': [
            'फसल कीमत जानकारी',
            'कृषि सर्वोत्तम प्रथाएं',
            'फसलों पर मौसम का प्रभाव',
            'बाजार प्रवृत्ति और पूर्वानुमान'
        ],
        'ai.how-can-i-help': 'मैं आज आपकी कैसे मदद कर सकता हूँ?',
        
        // Common
        'common.loading': 'लोड हो रहा है...',
        'common.error': 'त्रुटि',
        'common.success': 'सफलता',
        'common.cancel': 'रद्द करें',
        'common.save': 'सहेजें',
        'common.edit': 'संपादित करें',
        'common.delete': 'हटाएं',
        'common.view': 'देखें',
        'common.simulate': 'कीमत परिवर्तन सिमुलेट करें',
        'common.simulate-tooltip': 'कीमत परिवर्तन सिमुलेट करने और अलर्ट टेस्ट करने के लिए क्लिक करें',
        'common.details': 'विवरण',
        'common.close': 'बंद करें',
        'common.yes': 'हाँ',
        'common.no': 'नहीं',
        'common.today': 'आज',
        'common.yesterday': 'कल',
        'common.tomorrow': 'कल',
        'common.available': 'उपलब्ध',
        'common.unavailable': 'अनुपलब्ध',
        'common.no-data': 'चयनित फिल्टर के लिए कोई डेटा नहीं मिला',
        'common.high': 'उच्च',
        'common.medium': 'मध्यम',
        'common.low': 'निम्न',
        'common.rising': 'बढ़ रहा',
        'common.falling': 'गिर रहा',
        'common.stable': 'स्थिर',
        
        // Toggle Switch
        'toggle.off': 'बंद',
        'toggle.on': 'चालू',
        
        // Crop Status
        'crop.available': 'उपलब्ध',
        'crop.unavailable': 'अनुपलब्ध',
        'crop.price-varies': 'कीमत बदलती है',
        'crop.view-details': 'विवरण देखें',
        
        // Welcome Messages
        'welcome.greeting': 'AgroAI में आपका स्वागत है',
        'welcome.subtitle': 'आपका बुद्धिमान कृषि साथी',
        'welcome.description': 'मार्केट इनसाइट्स और क्रॉप मैनेजमेंट के लिए आपका बुद्धिमान कृषि साथी।',
        
        // Crop Advisory Section
        'advisory.section-title': 'दावणगेरे फसल सलाह',
        'advisory.section-subtitle': 'दावणगेरे क्षेत्र के लिए कृषि अंतर्दृष्टि',
        
        // Price Ranges
        'price.range': '₹{0}-{1}/क्विंटल',
        'price.varies': 'कीमत बदलती है'
    },
    
    'te': {
        // Navigation
        'nav.home': 'హోమ్',
        'nav.live-prices': 'లైవ్ ధరలు',
        'nav.price-predictions': 'ధర అంచనాలు',
        'nav.crop-advisory': 'పంట సలహా',
        'nav.ai-assistant': 'AI సహాయకుడు',
        
        // Header
        'header.title': 'AgroAI',
        'header.subtitle': 'పంట సలహా డ్యాష్‌బోర్డ్',
        'header.notifications': 'నోటిఫికేషన్లు',
        'header.theme': 'థీమ్',
        'header.language': 'భాష',
        
        // Home Page
        'home.title': 'AgroAI కు స్వాగతం',
        'home.subtitle': 'మీ మేధావి వ్యవసాయ భాగస్వామి',
        'home.select-city': 'మీ నగరాన్ని ఎంచుకోండి',
        'home.crop-advisory': 'పంట సలహా',
        'home.price-forecast': 'ధర అంచనా',
        'home.market-analysis': 'మార్కెట్ విశ్లేషణ',
        'home.ai-insights': 'AI లోతైన సమాచారం',
        
        // Cities
        'city.davangere': 'దవణగెరె',
        'city.gangavathi': 'గంగావతి',
        'city.hbhalli': 'హెచ్.బీ. హల్లి',
        'city.hospet': 'హోస్పేట్',
        
        // Crops
        'crop.rice': 'బియ్యం',
        'crop.maize': 'మొక్కజొన్న',
        'crop.cotton': 'పత్తి',
        'crop.tomato': 'టమాటా',
        'crop.ragi': 'రాగి',
        
        // Live Prices
        'prices.title': 'లైవ్ పంట ధరలు',
        'prices.subtitle': 'Agmarknet మార్కెట్ల నుండి రియల్-టైమ్ ధర నవీకరణలు',
        'prices.location': 'ప్రాంతం',
        'prices.crop': 'పంట',
        'prices.variety': 'వైవిధ్యం',
        'prices.min-price': 'కనిష్ట ధర',
        'prices.max-price': 'గరిష్ట ధర',
        'prices.modal-price': 'మోడల్ ధర',
        'prices.last-updated': 'చివరి నవీకరణ',
        'prices.filter-location': 'ప్రాంతాన్ని ఎంచుకోండి',
        'prices.filter-crop': 'పంటను ఎంచుకోండి',
        'prices.all-locations': 'అన్ని ప్రాంతాలు',
        'prices.all-crops': 'అన్ని పంటలు',
        
        // Price Predictions
        'predictions.title': 'ధర అంచనాలు',
        'predictions.subtitle': 'Attention-Enhanced LSTM మోడళ్లతో AI ఆధారిత ధర అంచనాలు',
        'predictions.select-location': 'ప్రాంతాన్ని ఎంచుకోండి',
        'predictions.select-crop': 'పంటను ఎంచుకోండి',
        'predictions.forecast-period': 'అంచనా కాలం',
        'predictions.generate': 'అంచనాను సృష్టించండి',
        'predictions.predicted-price': 'అంచనా ధర',
        'predictions.price-trend': 'ధర ప్రవణత',
        'predictions.confidence': 'నమ్మకం',
        'predictions.period-7': '7 రోజులు',
        'predictions.period-15': '15 రోజులు',
        'predictions.period-30': '30 రోజులు',
        'predictions.period-60': '60 రోజులు',
        
        // Crop Advisory
        'advisory.title': 'పంట సలహా',
        'advisory.subtitle': 'మట్టి, వాతావరణం మరియు మార్కెట్ పరిస్థితుల ఆధారంగా AI సిఫార్సులు పొందండి',
        'advisory.input-parameters': 'ఇన్‌పుట్ పరామితులు',
        'advisory.soil-type': 'మట్టిరకం',
        'advisory.season': 'ఋతువు',
        'advisory.ph-level': 'pH స్థాయి',
        'advisory.area': 'ప్రాంతం (ఎకరాలు)',
        'advisory.location': 'ప్రాంతం',
        'advisory.irrigation': 'పారుదల రకం',
        'advisory.get-recommendations': 'AI సలహాలను పొందండి',
        'advisory.recommendations': 'పంట సిఫార్సులు',
        'advisory.placeholder': 'వ్యక్తిగత పంట సిఫార్సులు పొందడానికి ఫారమ్‌ను పూరించండి',
        'advisory.placeholder-subtitle': 'మీ పరామితులను మా AI విశ్లేషించి సరైన పంటలను సూచిస్తుంది',
        'advisory.ai-powered': 'AI ఆధారిత పంట సిఫార్సులు',
        'advisory.based-on': 'మీ పరామితులు మరియు Attention-Enhanced LSTM విశ్లేషణ ఆధారంగా',
        'advisory.suitability-score': 'అనుకూలత స్కోర్',
        'advisory.confidence': 'నమ్మకం',
        'advisory.expected-yield': 'అంచనా దిగుబడి',
        'advisory.planting-time': 'ఉత్తమ నాటే సమయం',
        'advisory.suitable-for': 'ఈ మట్టికి అనుకూలం',
        'advisory.optimal-ph': 'ఆదర్శ pH పరిధి',
        'advisory.irrigation-compatible': 'పారుదల అనుకూలం',
        'advisory.analyzing': 'Attention-Enhanced LSTM తో మీ పరామితులను విశ్లేషిస్తోంది...',
        'advisory.loading-subtitle': 'దీనికి కొన్ని క్షణాలు పట్టవచ్చు',
        
        // Soil Types
        'soil.clay': 'మట్టిమట్టి',
        'soil.sandy': 'ఇసుక మట్టి',
        'soil.loamy': 'లోమీ మట్టి',
        'soil.silty': 'సిల్టీ మట్టి',
        'soil.red': 'ఎర్ర మట్టి',
        'soil.black': 'నల్ల మట్టి',
        
        // Seasons
        'season.kharif': 'ఖరీఫ్ (జూన్-అక్టోబర్)',
        'season.rabi': 'రబీ (అక్టోబర్-మార్చ్)',
        'season.zaid': 'జైడ్ (మార్చ్-జూన్)',
        
        // Irrigation Types
        'irrigation.rainfed': 'వర్షాధారిత',
        'irrigation.irrigated': 'పారుదల',
        'irrigation.drip': 'డ్రిప్ పారుదల',
        'irrigation.sprinkler': 'స్ప్రింక్లర్',
        
        // AI Assistant
        'ai.title': 'AI సహాయకుడు',
        'ai.subtitle': 'మీ వ్యవసాయ ప్రశ్నలకు తక్షణ సమాధానాలు పొందండి',
        'ai.placeholder': 'మీ సందేశాన్ని ఇక్కడ టైప్ చేయండి...',
        'ai.send': 'పంపండి',
        'ai.welcome': 'హలో! నేను మీ AI వ్యవసాయ సహాయకుడు. నేను మీకు వీటిలో సహాయం చేయగలను:',
        'ai.capabilities': [
            'పంట ధర సమాచారం',
            'వ్యవసాయ ఉత్తమ పద్ధతులు',
            'వాతావరణ ప్రభావం',
            'మార్కెట్ ట్రెండ్లు మరియు అంచనాలు'
        ],
        'ai.how-can-i-help': 'ఇవాళ నేను ఎలా సహాయం చేయగలను?',
        
        // Common
        'common.loading': 'లోడ్ అవుతోంది...',
        'common.error': 'లోపం',
        'common.success': 'విజయం',
        'common.cancel': 'రద్దు',
        'common.save': 'సేవ్ చేయండి',
        'common.edit': 'సవరించండి',
        'common.delete': 'తొలగించండి',
        'common.view': 'చూడండి',
        'common.simulate': 'ధర మార్పులను అనుకరించండి',
        'common.simulate-tooltip': 'ధర మార్పులను పరీక్షించడానికి క్లిక్ చేయండి',
        'common.details': 'వివరాలు',
        'common.close': 'మూసివేయండి',
        'common.yes': 'అవును',
        'common.no': 'కాదు',
        'common.today': 'ఈ రోజు',
        'common.yesterday': 'నిన్న',
        'common.tomorrow': 'రేపు',
        'common.available': 'లభ్యం',
        'common.unavailable': 'లేవు',
        'common.no-data': 'ఎంచుకున్న ఫిల్టర్లకు డేటా లేదు',
        'common.high': 'అధికం',
        'common.medium': 'మధ్యస్థం',
        'common.low': 'తక్కువ',
        'common.rising': 'పెరుగుతోంది',
        'common.falling': 'తగ్గుతోంది',
        'common.stable': 'స్థిరంగా ఉంది',
        
        // Toggle Switch
        'toggle.off': 'ఆఫ్',
        'toggle.on': 'ఆన్',
        
        // Crop Status
        'crop.available': 'లభ్యం',
        'crop.unavailable': 'లభ్యం కాదు',
        'crop.price-varies': 'ధర మారుతుంది',
        'crop.view-details': 'వివరాలు చూడండి',
        
        // Welcome Messages
        'welcome.greeting': 'AgroAI కు స్వాగతం',
        'welcome.subtitle': 'మీ మేధావి వ్యవసాయ భాగస్వామి',
        'welcome.description': 'మార్కెట్ అంతర్దృష్టులు మరియు పంట నిర్వహణ కోసం మీ స్మార్ట్ సహాయకుడు.',
        
        // Crop Advisory Section
        'advisory.section-title': 'దవణగెరె పంట సలహా',
        'advisory.section-subtitle': 'దవణగెరె ప్రాంతానికి వ్యవసాయ లోతైన సమాచారం',
        
        // Price Ranges
        'price.range': '₹{0}-{1}/క్వింటాల్',
        'price.varies': 'ధర మారుతుంది'
    },
    
    'kn': {
        // Navigation
        'nav.home': 'ಮುಖಪುಟ',
        'nav.live-prices': 'ನೇರ ಬೆಲೆಗಳು',
        'nav.price-predictions': 'ಬೆಲೆ ಭವಿಷ್ಯ',
        'nav.crop-advisory': 'ಬೆಳೆ ಸಲಹೆ',
        'nav.ai-assistant': 'AI ಸಹಾಯಕ',
        
        // Header
        'header.title': 'AgroAI',
        'header.subtitle': 'ಬೆಳೆ ಸಲಹೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
        'header.notifications': 'ಅಧಿಸೂಚನೆಗಳು',
        'header.theme': 'ಥೀಮ್',
        'header.language': 'ಭಾಷೆ',
        
        // Home Page
        'home.title': 'AgroAI ಗೆ ಸ್ವಾಗತ',
        'home.subtitle': 'ನಿಮ್ಮ ಬುದ್ಧಿವಂತ ಕೃಷಿ ಸಹಚರ',
        'home.select-city': 'ನಿಮ್ಮ ನಗರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        'home.crop-advisory': 'ಬೆಳೆ ಸಲಹೆ',
        'home.price-forecast': 'ಬೆಲೆ ಭವಿಷ್ಯ',
        'home.market-analysis': 'ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ',
        'home.ai-insights': 'AI ಒಳನೋಟಗಳು',
        
        // Cities
        'city.davangere': 'ದಾವಣಗೆರೆ',
        'city.gangavathi': 'ಗಂಗಾವತಿ',
        'city.hbhalli': 'ಎಚ್.ಬಿ. ಹಳ್ಳಿ',
        'city.hospet': 'ಹೊಸಪೇಟೆ',
        
        // Crops
        'crop.rice': 'ಅಕ್ಕಿ',
        'crop.maize': 'ಮೆಕ್ಕೆಜೋಳ',
        'crop.cotton': 'ಹತ್ತಿ',
        'crop.tomato': 'ಟೊಮ್ಯಾಟೊ',
        'crop.ragi': 'ರಾಗಿ',
        
        // Live Prices
        'prices.title': 'ನೇರ ಬೆಳೆ ಬೆಲೆಗಳು',
        'prices.subtitle': 'Agmarknet ಮಾರುಕಟ್ಟೆಗಳಿಂದ ನೈಜ-ಸಮಯ ಬೆಲೆ ಅಪ್‌ಡೇಟ್‌ಗಳು',
        'prices.location': 'ಸ್ಥಳ',
        'prices.crop': 'ಬೆಳೆ',
        'prices.variety': 'ವಿಧ',
        'prices.min-price': 'ಕನಿಷ್ಠ ಬೆಲೆ',
        'prices.max-price': 'ಗರಿಷ್ಠ ಬೆಲೆ',
        'prices.modal-price': 'ಮೋಡಲ್ ಬೆಲೆ',
        'prices.last-updated': 'ಕೊನೆಯ ಅಪ್‌ಡೇಟ್',
        'prices.filter-location': 'ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        'prices.filter-crop': 'ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        'prices.all-locations': 'ಎಲ್ಲಾ ಸ್ಥಳಗಳು',
        'prices.all-crops': 'ಎಲ್ಲಾ ಬೆಳೆಗಳು',
        
        // Price Predictions
        'predictions.title': 'ಬೆಲೆ ಭವಿಷ್ಯ',
        'predictions.subtitle': 'Attention-Enhanced LSTM ಮಾದರಿಗಳನ್ನು ಬಳಸಿಕೊಂಡು AI-ಚಾಲಿತ ಬೆಲೆ ಭವಿಷ್ಯ',
        'predictions.select-location': 'ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        'predictions.select-crop': 'ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        'predictions.forecast-period': 'ಭವಿಷ್ಯ ಅವಧಿ',
        'predictions.generate': 'ಭವಿಷ್ಯವನ್ನು ಉತ್ಪಾದಿಸಿ',
        'predictions.predicted-price': 'ಭವಿಷ್ಯ ಬೆಲೆ',
        'predictions.price-trend': 'ಬೆಲೆ ಪ್ರವೃತ್ತಿ',
        'predictions.confidence': 'ಆತ್ಮವಿಶ್ವಾಸ',
        'predictions.period-7': '7 ದಿನಗಳು',
        'predictions.period-15': '15 ದಿನಗಳು',
        'predictions.period-30': '30 ದಿನಗಳು',
        'predictions.period-60': '60 ದಿನಗಳು',
        
        // Crop Advisory
        'advisory.title': 'ಬೆಳೆ ಸಲಹೆ',
        'advisory.subtitle': 'ಮಣ್ಣು, ಹವಾಮಾನ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಪರಿಸ್ಥಿತಿಗಳ ಆಧಾರದ ಮೇಲೆ AI-ಚಾಲಿತ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ',
        'advisory.input-parameters': 'ಇನ್‌ಪುಟ್ ನಿಯತಾಂಕಗಳು',
        'advisory.soil-type': 'ಮಣ್ಣಿನ ಪ್ರಕಾರ',
        'advisory.season': 'ಋತು',
        'advisory.ph-level': 'pH ಮಟ್ಟ',
        'advisory.area': 'ಪ್ರದೇಶ (ಎಕರೆ)',
        'advisory.location': 'ಸ್ಥಳ',
        'advisory.irrigation': 'ನೀರಾವರಿ ಪ್ರಕಾರ',
        'advisory.get-recommendations': 'AI ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ',
        'advisory.recommendations': 'ಬೆಳೆ ಶಿಫಾರಸುಗಳು',
        'advisory.placeholder': 'ವೈಯಕ್ತಿಕ ಬೆಳೆ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಲು ಫಾರ್ಮ್ ಅನ್ನು ಭರ್ತಿ ಮಾಡಿ',
        'advisory.placeholder-subtitle': 'ನಮ್ಮ AI ನಿಮ್ಮ ನಿಯತಾಂಕಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತದೆ ಮತ್ತು ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಗಳಿಗೆ ಉತ್ತಮ ಬೆಳೆಗಳನ್ನು ಸೂಚಿಸುತ್ತದೆ',
        'advisory.ai-powered': 'AI-ಚಾಲಿತ ಬೆಳೆ ಶಿಫಾರಸುಗಳು',
        'advisory.based-on': 'ನಿಮ್ಮ ನಿಯತಾಂಕಗಳು ಮತ್ತು Attention-Enhanced LSTM ವಿಶ್ಲೇಷಣೆಯ ಆಧಾರದ ಮೇಲೆ',
        'advisory.suitability-score': 'ಯೋಗ್ಯತೆ ಸ್ಕೋರ್',
        'advisory.confidence': 'ಆತ್ಮವಿಶ್ವಾಸ',
        'advisory.expected-yield': 'ನಿರೀಕ್ಷಿತ ಇಳುವರಿ',
        'advisory.planting-time': 'ಉತ್ತಮ ನೆಡುವ ಸಮಯ',
        'advisory.suitable-for': 'ಗಾಗಿ ಸೂಕ್ತ',
        'advisory.optimal-ph': 'ಉತ್ತಮ pH ವ್ಯಾಪ್ತಿ',
        'advisory.irrigation-compatible': 'ನೀರಾವರಿ ಹೊಂದಾಣಿಕೆ',
        'advisory.analyzing': 'Attention-Enhanced LSTM ನೊಂದಿಗೆ ನಿಮ್ಮ ನಿಯತಾಂಕಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
        'advisory.loading-subtitle': 'ಇದು ಕೆಲವು ಕ್ಷಣಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಬಹುದು',
        
        // Soil Types
        'soil.clay': 'ಜೇಡಿಮಣ್ಣು',
        'soil.sandy': 'ಮರಳು ಮಣ್ಣು',
        'soil.loamy': 'ದೋಮಟ್ ಮಣ್ಣು',
        'soil.silty': 'ಅವಶೇಷ ಮಣ್ಣು',
        'soil.red': 'ಕೆಂಪು ಮಣ್ಣು',
        'soil.black': 'ಕಪ್ಪು ಮಣ್ಣು',
        
        // Seasons
        'season.kharif': 'ಖರೀಫ್ (ಜೂನ್-ಅಕ್ಟೋಬರ್)',
        'season.rabi': 'ರಬಿ (ಅಕ್ಟೋಬರ್-ಮಾರ್ಚ್)',
        'season.zaid': 'ಜಾಯಿದ್ (ಮಾರ್ಚ್-ಜೂನ್)',
        
        // Irrigation Types
        'irrigation.rainfed': 'ಮಳೆ ಆಧಾರಿತ',
        'irrigation.irrigated': 'ನೀರಾವರಿ',
        'irrigation.drip': 'ಡ್ರಿಪ್ ನೀರಾವರಿ',
        'irrigation.sprinkler': 'ಸ್ಪ್ರಿಂಕ್ಲರ್',
        
        // AI Assistant
        'ai.title': 'AI ಸಹಾಯಕ',
        'ai.subtitle': 'ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳಿಗೆ ತಕ್ಷಣ ಉತ್ತರಗಳನ್ನು ಪಡೆಯಿರಿ',
        'ai.placeholder': 'ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...',
        'ai.send': 'ಕಳುಹಿಸಿ',
        'ai.welcome': 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಕೃಷಿ ಸಹಾಯಕ. ನಾನು ನಿಮಗೆ ಇವುಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಹುದು:',
        'ai.capabilities': [
            'ಬೆಳೆ ಬೆಲೆ ಮಾಹಿತಿ',
            'ಕೃಷಿ ಉತ್ತಮ ಅಭ್ಯಾಸಗಳು',
            'ಬೆಳೆಗಳ ಮೇಲೆ ಹವಾಮಾನದ ಪರಿಣಾಮ',
            'ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿಗಳು ಮತ್ತು ಭವಿಷ್ಯ'
        ],
        'ai.how-can-i-help': 'ನಾನು ಇಂದು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
        
        // Common
        'common.loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
        'common.error': 'ದೋಷ',
        'common.success': 'ಯಶಸ್ಸು',
        'common.cancel': 'ರದ್ದುಮಾಡಿ',
        'common.save': 'ಉಳಿಸಿ',
        'common.edit': 'ಸಂಪಾದಿಸಿ',
        'common.delete': 'ಅಳಿಸಿ',
        'common.view': 'ನೋಡಿ',
        'common.simulate': 'ಬೆಲೆ ಬದಲಾವಣೆಗಳನ್ನು ಅನುಕರಿಸಿ',
        'common.simulate-tooltip': 'ಬೆಲೆ ಬದಲಾವಣೆಗಳನ್ನು ಅನುಕರಿಸಲು ಮತ್ತು ಅಲರ್ಟ್‌ಗಳನ್ನು ಪರೀಕ್ಷಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
        'common.details': 'ವಿವರಗಳು',
        'common.close': 'ಮುಚ್ಚಿ',
        'common.yes': 'ಹೌದು',
        'common.no': 'ಇಲ್ಲ',
        'common.today': 'ಇಂದು',
        'common.yesterday': 'ನಿನ್ನೆ',
        'common.tomorrow': 'ನಾಳೆ',
        'common.available': 'ಲಭ್ಯ',
        'common.unavailable': 'ಲಭ್ಯವಿಲ್ಲ',
        'common.no-data': 'ಆಯ್ಕೆಮಾಡಿದ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ಯಾವುದೇ ಡೇಟಾ ಕಂಡುಬಂದಿಲ್ಲ',
        'common.high': 'ಉನ್ನತ',
        'common.medium': 'ಮಧ್ಯಮ',
        'common.low': 'ಕಡಿಮೆ',
        'common.rising': 'ಏರುತ್ತಿದೆ',
        'common.falling': 'ಬೀಳುತ್ತಿದೆ',
        'common.stable': 'ಸ್ಥಿರ',
        
        // Toggle Switch
        'toggle.off': 'ಆಫ್',
        'toggle.on': 'ಆನ್',
        
        // Crop Status
        'crop.available': 'ಲಭ್ಯ',
        'crop.unavailable': 'ಲಭ್ಯವಿಲ್ಲ',
        'crop.price-varies': 'ಬೆಲೆ ಬದಲಾಗುತ್ತದೆ',
        'crop.view-details': 'ವಿವರಗಳನ್ನು ನೋಡಿ',
        
        // Welcome Messages
        'welcome.greeting': 'AgroAI ಗೆ ಸ್ವಾಗತ',
        'welcome.subtitle': 'ನಿಮ್ಮ ಬುದ್ಧಿವಂತ ಕೃಷಿ ಸಹಚರ',
        'welcome.description': 'ಮಾರುಕಟ್ಟೆ ಒಳನೋಟಗಳು ಮತ್ತು ಬೆಳೆ ನಿರ್ವಹಣೆಗಾಗಿ ನಿಮ್ಮ ಬುದ್ಧಿವಂತ ಕೃಷಿ ಸಹಚರ.',
        
        // Crop Advisory Section
        'advisory.section-title': 'ದಾವಣಗೆರೆ ಬೆಳೆ ಸಲಹೆ',
        'advisory.section-subtitle': 'ದಾವಣಗೆರೆ ಪ್ರದೇಶಕ್ಕಾಗಿ ಕೃಷಿ ಒಳನೋಟಗಳು.',
        
        // Price Ranges
        'price.range': '₹{0}-{1}/ಕ್ವಿಂಟಲ್',
        'price.varies': 'ಬೆಲೆ ಬದಲಾಗುತ್ತದೆ'
    }
};

// Language Manager
class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'kn'; // Kannada as default
        this.init();
    }
    
    init() {
        this.updateLanguageSelector();
        this.translatePage();
        this.setupLanguageSwitcher();
    }
    
    setupLanguageSwitcher() {
        const languageSelector = document.querySelector('.language-selector select');
        if (languageSelector) {
            languageSelector.value = this.currentLanguage;
            languageSelector.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }
    }
    
    changeLanguage(languageCode) {
        this.currentLanguage = languageCode;
        localStorage.setItem('selectedLanguage', languageCode);
        this.translatePage();
        console.log(`Language changed to: ${languageCode}`);
        
        // Dispatch custom event for other components to listen
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: languageCode }
        }));
    }
    
    translatePage() {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getTranslation(key);
            if (translation) {
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = translation;
                } else if (element.tagName === 'OPTION') {
                    element.textContent = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // Update page title
        this.updatePageTitle();
    }
    
    getTranslation(key) {
        return translations[this.currentLanguage]?.[key] || translations['en'][key] || key;
    }
    
    updateLanguageSelector() {
        const languageSelector = document.querySelector('.language-selector select');
        if (languageSelector) {
            languageSelector.value = this.currentLanguage;
        }
    }
    
    updatePageTitle() {
        const activeNavItem = document.querySelector('.nav-item.active .nav-link span');
        if (activeNavItem) {
            const pageTitle = document.querySelector('.page-title');
            if (pageTitle) {
                const translationKeyFromAttr = activeNavItem.getAttribute('data-translate');
                const navText = activeNavItem.textContent;
                const translationKey = translationKeyFromAttr || this.getTranslationKeyFromNavText(navText);
                if (translationKey) {
                    pageTitle.textContent = this.getTranslation(translationKey);
                }
            }
        }
    }
    
    getTranslationKeyFromNavText(navText) {
        const navMap = {
            'Home': 'nav.home',
            'Live Prices': 'nav.live-prices',
            'Price Predictions': 'nav.price-predictions',
            'Crop Advisory': 'nav.crop-advisory',
            'AI Assistant': 'nav.ai-assistant'
        };
        return navMap[navText];
    }
    
    // Method to get translation for dynamic content
    translate(key, ...args) {
        let translation = this.getTranslation(key);
        if (args.length > 0) {
            args.forEach((arg, index) => {
                translation = translation.replace(`{${index}}`, arg);
            });
        }
        return translation;
    }
}

// Initialize language manager
const languageManager = new LanguageManager();

// Export for global access
window.languageManager = languageManager;
