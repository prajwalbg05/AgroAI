const axios = require('axios');

// Basic intent detection using keywords; can be replaced with a classifier later
function detectIntent(message) {
	const m = (message || '').toLowerCase();
	if (/(price|भाव|ಬೆಲೆ|cost|rate)/.test(m)) return 'price';
	if (/(recommend|crop|सलाह|ಬೆಳೆ|which crop)/.test(m)) return 'recommendation';
	if (/(weather|मौसम|ಹವಾಮಾನ|rain|temperature)/.test(m)) return 'weather';
	return 'general';
}

async function fetchPriceContext(body) {
	const market = body.market || 'davangere';
	const crop = body.crop || 'Rice';
	try {
		const historyResp = await axios.get(`http://localhost:4000/api/history/${market}/${encodeURIComponent(crop)}?limit=30`);
		let forecast = null;
		try {
			const predResp = await axios.post('http://localhost:4000/api/predict', { task: 'price_forecast', market, crop });
			forecast = predResp.data;
		} catch (_) {}
		return { market, crop, history: historyResp.data, forecast };
	} catch (err) {
		return { error: String(err) };
	}
}

async function fetchRecommendationContext(body) {
	const market = body.market || 'davangere';
	const month = body.month || (new Date().getMonth() + 1);
	try {
		const resp = await axios.get(`http://localhost:4000/api/recommendations?market=${encodeURIComponent(market)}&month=${month}`);
		return { market, month, recommendations: resp.data };
	} catch (err) {
		return { error: String(err) };
	}
}

async function fetchWeatherContext(body) {
	const apiKey = process.env.OPENWEATHER_API_KEY;
	const q = body.city || body.market || 'Davangere';
	if (!apiKey) return { error: 'OPENWEATHER_API_KEY not set' };
	try {
		const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&appid=${apiKey}&units=metric`;
		const resp = await axios.get(url);
		return { query: q, weather: resp.data };
	} catch (err) {
		return { error: String(err) };
	}
}

function buildSystemPrompt() {
	return [
		{
			role: 'system',
			content: 'You are a crop advisory assistant. Always use the live data provided to answer questions. If the user asks about prices, use the given numbers. If not available, politely say so. Keep answers concise and helpful. Support English, Hindi, and Kannada based on user input. '
		}
	];
}

function buildContextMessages(intent, context) {
	const ctx = JSON.stringify({ intent, context });
	return [{ role: 'system', content: `LiveContext: ${ctx}` }];
}

async function callOpenAI(messages, language) {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		// Fallback simple echo for development without API key
		const last = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
		return `Dev mode (no OPENAI_API_KEY). Intent-aware echo: ${last}`;
	}
	// Use OpenAI Chat Completions over REST to ease swapping models
	const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
	const resp = await axios.post('https://api.openai.com/v1/chat/completions', {
		model,
		messages,
		temperature: 0.2,
	}, {
		headers: { Authorization: `Bearer ${apiKey}` }
	});
	return resp.data?.choices?.[0]?.message?.content || '';
}

async function chatController(req, res) {
	try {
		const { message, language = 'en', market, crop, city, month } = req.body || {};
		if (!message) return res.status(400).json({ error: 'message is required' });
		const intent = detectIntent(message);
		let context = null;
		switch (intent) {
			case 'price':
				context = await fetchPriceContext({ market, crop });
				break;
			case 'recommendation':
				context = await fetchRecommendationContext({ market, month });
				break;
			case 'weather':
				context = await fetchWeatherContext({ city: city || market });
				break;
			default:
				context = {};
		}

		const messages = [
			...buildSystemPrompt(),
			...buildContextMessages(intent, context),
			{ role: 'user', content: message }
		];
		const reply = await callOpenAI(messages, language);
		// Optional Firebase logging (no-op if not configured)
		try { require('./firebase').logChat({ message, reply, intent, context }); } catch (_) {}
		res.json({ intent, reply, context });
	} catch (err) {
		if (err.response) return res.status(err.response.status).json(err.response.data);
		res.status(500).json({ error: 'chat failed', detail: String(err) });
	}
}

module.exports = { chatController };


