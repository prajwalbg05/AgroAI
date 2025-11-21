const axios = require('axios');

// Maintain in-memory conversations per session (basic demo)
// For production, use Redis or a database keyed by user/session
const conversations = new Map();

function getSessionId(req) {
	return req.headers['x-session-id'] || 'default';
}

function pushMessage(sessionId, role, content) {
	const arr = conversations.get(sessionId) || [];
	arr.push({ role, content });
	// keep last 20 messages
	conversations.set(sessionId, arr.slice(-20));
}

function buildTools() {
    const wrap = (name, description, parameters) => ({ type: 'function', function: { name, description, parameters } });
    return [
        wrap('get_prices', 'Get mandi prices for a crop in a market', {
            type: 'object',
            properties: { market: { type: 'string' }, crop: { type: 'string' } },
            required: ['market', 'crop']
        }),
        wrap('get_weather', 'Get weather for a district/city', {
            type: 'object',
            properties: { district: { type: 'string' } },
            required: ['district']
        }),
        wrap('get_recommendations', 'Get crop recommendations for a district/market and season', {
            type: 'object',
            properties: { market: { type: 'string' }, season: { type: 'string' }, month: { type: 'number' } },
            required: ['market']
        })
    ];
}

async function callGroq(messages) {
	const apiKey = process.env.GROQ_API_KEY;
	if (!apiKey) throw new Error('GROQ_API_KEY not set');
    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    const resp = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model,
		messages,
		stream: false,
		tools: buildTools(),
		tool_choice: 'auto',
		temperature: 0.2
	}, { headers: { Authorization: `Bearer ${apiKey}` } });
	return resp.data;
}

async function handleToolCall(name, args) {
	switch (name) {
		case 'get_prices': {
			const url = `http://localhost:4000/api/prices?market=${encodeURIComponent(args.market)}&crop=${encodeURIComponent(args.crop)}`;
			const r = await axios.get(url);
			return r.data;
		}
		case 'get_weather': {
			const url = `http://localhost:4000/api/weather?district=${encodeURIComponent(args.district)}`;
			const r = await axios.get(url);
			return r.data;
		}
		case 'get_recommendations': {
			const month = args.month || (new Date().getMonth() + 1);
			const url = `http://localhost:4000/api/recommendations?market=${encodeURIComponent(args.market)}&month=${month}`;
			const r = await axios.get(url);
			return r.data;
		}
		default:
			return { error: 'unknown tool' };
	}
}

async function groqChatController(req, res) {
	try {
		const sessionId = getSessionId(req);
		const { message } = req.body || {};
		if (!message) return res.status(400).json({ error: 'message is required' });

		pushMessage(sessionId, 'user', message);
		const baseMessages = [
			{ role: 'system', content: 'You are AgriBot, a helpful crop advisory assistant. Use tools when the user asks for prices, weather, or recommendations. Be concise and friendly.' },
			...(conversations.get(sessionId) || [])
		];

		const first = await callGroq(baseMessages);
		let assistantMsg = first.choices?.[0]?.message;

		if (assistantMsg?.tool_calls && assistantMsg.tool_calls.length > 0) {
			// Execute tools and send results back to model
			const toolOutputs = [];
			for (const tc of assistantMsg.tool_calls) {
				const resu = await handleToolCall(tc.function.name, JSON.parse(tc.function.arguments || '{}'));
				toolOutputs.push({ tool_call_id: tc.id, role: 'tool', content: JSON.stringify(resu) });
			}
			const followUp = await callGroq([
				...baseMessages,
				assistantMsg,
				...toolOutputs
			]);
			assistantMsg = followUp.choices?.[0]?.message;
		}

		const reply = assistantMsg?.content || 'Sorry, I could not generate a response.';
		pushMessage(sessionId, 'assistant', reply);
		res.json({ reply });
	} catch (err) {
		if (err.response) return res.status(err.response.status).json(err.response.data);
		res.status(500).json({ error: 'groq chat failed', detail: String(err) });
	}
}

module.exports = { groqChatController };


