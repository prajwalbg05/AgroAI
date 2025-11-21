import React, { useEffect, useMemo, useRef, useState } from 'react';

const defaultTranslations = {
	chatWithUs: { en: 'Chat with advisor', hi: 'सलाहकार से चैट', kn: 'ಸಲಹೆಗಾರರೊಂದಿಗೆ ಚಾಟ್' },
	saySomething: { en: 'Ask about crops, prices or weather...', hi: 'फसल, कीमत या मौसम पूछें...', kn: 'ಬೆಳೆ, ಬೆಲೆ ಅಥವಾ ಹವಾಮಾನ ಕೇಳಿ...' },
	send: { en: 'Send', hi: 'भेजें', kn: 'ಕಳುಹಿಸಿ' },
	typing: { en: 'Assistant is typing…', hi: 'सहायक टाइप कर रहा है…', kn: 'ಸಹಾಯಕ ಟೈಪ್ ಮಾಡುತ್ತಿದೆ…' },
};

function PriceCard({ data }) {
	if (!data) return null;
	const { market, crop, latest } = data;
	return (
		<div className="border rounded-lg p-3 bg-green-50 text-sm">
			<div className="font-semibold text-green-700">Price Update</div>
			<div>Market: {market}</div>
			<div>Crop: {crop}</div>
				{latest && (
					<div>Latest: ₹{(latest.price ?? (latest?.price || latest?.ModalPrice))} on {latest.date}</div>
				)}
		</div>
	);
}

function WeatherCard({ data }) {
	if (!data?.data) return null;
	const w = data.data;
	return (
		<div className="border rounded-lg p-3 bg-blue-50 text-sm">
			<div className="font-semibold text-blue-700">Weather</div>
			<div>Location: {data.district}</div>
			<div>Temp: {w.main?.temp}°C, Humidity: {w.main?.humidity}%</div>
			<div>Conditions: {w.weather?.[0]?.description}</div>
		</div>
	);
}

function RecoCard({ data }) {
	if (!data?.recommended_crops) return null;
	return (
		<div className="border rounded-lg p-3 bg-purple-50 text-sm">
			<div className="font-semibold text-purple-700">Recommendations</div>
			<ul className="list-disc ml-5">
				{data.recommended_crops.slice(0,5).map((c, i) => (
					<li key={i}>{typeof c === 'string' ? c : `${c.crop} (${c.suitability_score ?? ''})`}</li>
				))}
			</ul>
		</div>
	);
}

function ChatBot({ language = 'en', getText }) {
	const t = (k) => (getText ? getText(k) : (defaultTranslations[k]?.[language] || defaultTranslations[k]?.en || k));
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const endRef = useRef(null);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, open]);

	const streamAppend = async (text) => {
		for (let i = 0; i < text.length; i += 3) {
			await new Promise(r => setTimeout(r, 15));
			setMessages((m) => {
				const last = m[m.length - 1];
				if (last?.role === 'assistant' && last.streaming) {
					const updated = m.slice(0, -1);
					updated.push({ ...last, content: last.content + text.slice(i, i + 3) });
					return updated;
				}
				return m;
			});
		}
		// turn off streaming flag
		setMessages((m) => {
			const last = m[m.length - 1];
			if (last?.role === 'assistant') return [...m.slice(0, -1), { ...last, streaming: false }];
			return m;
		});
	};

	const handleSend = async () => {
		const text = input.trim();
		if (!text || loading) return;
		setMessages((m) => [...m, { role: 'user', content: text, ts: Date.now() }]);
		setInput('');
		setLoading(true);
		try {
			// optimistic assistant message for streaming effect
			setMessages((m) => [...m, { role: 'assistant', content: '', streaming: true, ts: Date.now() }]);
			const resp = await fetch('http://localhost:4000/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'x-session-id': 'web' },
				body: JSON.stringify({ message: text })
			});
			const data = await resp.json();
			if (!resp.ok) throw new Error(data?.error || `HTTP ${resp.status}`);
			await streamAppend(data.reply || '');
		} catch (err) {
			setMessages((m) => [...m, { role: 'assistant', content: String(err), ts: Date.now(), error: true }]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<button
				onClick={() => setOpen((v) => !v)}
				className="fixed bottom-6 right-6 z-40 rounded-full bg-green-600 text-white w-14 h-14 shadow-lg hover:bg-green-700 focus:outline-none"
				aria-label={t('chatWithUs')}
			>
				<span className="text-2xl">💬</span>
			</button>

			{open && (
				<div className="fixed bottom-24 right-6 z-40 w-96 max-w-[92vw] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
					<div className="px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white flex items-center justify-between">
						<div className="font-semibold">🌾 {t('chatWithUs')}</div>
						<button onClick={() => setOpen(false)} className="text-white/90 hover:text-white">✕</button>
					</div>
					<div className="p-4 space-y-3 max-h-80 overflow-y-auto">
						{messages.map((m, idx) => (
							<div key={idx} className={`${m.role === 'user' ? 'text-right' : 'text-left'}`}>
								<div className={`inline-block px-3 py-2 rounded-lg whitespace-pre-wrap ${m.role === 'user' ? 'bg-green-600 text-white' : (m.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-800')}`}>
									{m.content}
								</div>
							</div>
						))}
						{loading && (
							<div className="text-left">
								<div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700">
									<div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" />
									<div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
									<div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
									<span className="ml-1 text-xs">{t('typing')}</span>
								</div>
							</div>
						)}
						{/* Placeholder areas for structured cards; backend can return context via future endpoint if needed */}
						{/* Example usage: <PriceCard data={lastPriceContext}/> */}
						<div ref={endRef} />
					</div>
					<div className="p-3 border-t border-gray-200 flex gap-2">
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder={t('saySomething')}
							className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
							onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
						/>
						<button onClick={handleSend} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60">
							{t('send')}
						</button>
					</div>
				</div>
			)}
		</>
	);
}

export default ChatBot;


