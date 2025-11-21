const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { parse } = require('csv-parse/sync');
const dotenv = require('dotenv');
const NodeCache = require('node-cache');
const cheerio = require('cheerio');
const got = require('got');
const { chatController } = require('./chatController');
const { groqChatController } = require('./groqChatController');

dotenv.config();
const cache = new NodeCache({ stdTTL: 300 });

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const MARKETS = ['davangere', 'gangavathi', 'HBhalli', 'hospet'];
const MARKET_CROPS = {
  davangere: ['Cotton', 'Maize', 'Ragi', 'Rice', 'Tomato'],
  gangavathi: ['Cotton', 'Maize', 'Ragi', 'Rice'],
  HBhalli: ['Cotton', 'Maize', 'Ragi', 'Rice'],
  hospet: ['Maize', 'Ragi', 'Rice', 'Tomato']
};

const MARKET_ALIASES = {
  davangere: ['davangere'],
  gangavathi: ['gangavathi', 'gangavati'],
  HBhalli: ['hb halli', 'hbhalli', 'h.b.halli', 'hb halli market'],
  hospet: ['hospet']
};

function listCropsForMarket(market) {
  return MARKET_CROPS[market] || [];
}

function latestModalPriceFromCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const records = parse(content, { columns: true, skip_empty_lines: true });
  if (records.length === 0) return null;
  records.sort((a, b) => new Date(a['Price Date']) - new Date(b['Price Date']));
  const last = records[records.length - 1];
  const price = Number(last['Modal Price (Rs./Quintal)']);
  return isNaN(price) ? null : price;
}

function readHistoryFromCsv(market, crop) {
  const folder = path.join(DATA_DIR, market);
  if (!fs.existsSync(folder)) return [];
  const files = fs.readdirSync(folder).filter(f => f.toLowerCase().includes(crop.toLowerCase()));
  if (files.length === 0) return [];
  const content = fs.readFileSync(path.join(folder, files[0]), 'utf8');
  const records = parse(content, { columns: true, skip_empty_lines: true });
  const rows = records.map(r => ({
    date: r['Price Date'],
    price: Number(r['Modal Price (Rs./Quintal)'])
  })).filter(r => Number.isFinite(r.price));
  rows.sort((a, b) => new Date(a.date) - new Date(b.date));
  return rows;
}

async function scrapeCommodityOnline() {
  const cacheKey = 'commodityonline';
  const hit = cache.get(cacheKey);
  if (hit) return hit;
  const html = await got('https://www.commodityonline.com/mandiprices', { timeout: 15000 }).text();
  const $ = cheerio.load(html);
  const rows = [];
  $('table tr').each((_, tr) => {
    const tds = $(tr).find('td');
    if (tds.length < 9) return;
    const commodity = $(tds.eq(0)).text().trim();
    const marketName = $(tds.eq(5)).text().trim().toLowerCase();
    const modalTxt = $(tds.eq(8)).text().replace(/[^0-9.]/g, '').trim();
    const price = Number(modalTxt);
    if (!Number.isFinite(price)) return;
    let marketKey = null;
    for (const [k, aliases] of Object.entries(MARKET_ALIASES)) {
      if (aliases.some(a => marketName.includes(a))) { marketKey = k; break; }
    }
    if (!marketKey) return;
    rows.push({ market: marketKey, crop: commodity, price });
  });
  const latest = new Map();
  for (const r of rows) latest.set(`${r.market}|${r.crop}`, r);
  const out = Array.from(latest.values());
  cache.set(cacheKey, out);
  return out;
}

function readCsvFallback() {
  const results = [];
  for (const market of MARKETS) {
    const folder = path.join(DATA_DIR, market);
    if (!fs.existsSync(folder)) continue;
    for (const crop of listCropsForMarket(market)) {
      const files = fs.readdirSync(folder).filter(f => f.toLowerCase().includes(crop.toLowerCase()));
      if (files.length === 0) continue;
      const price = latestModalPriceFromCsv(path.join(folder, files[0]));
      if (price != null) results.push({ market, crop, price });
    }
  }
  return results;
}

async function getLivePrices() {
  try {
    const live = await scrapeCommodityOnline();
    if (live.length) return live;
  } catch (_) {}
  return readCsvFallback();
}

app.get('/api/crops/:market', (req, res) => {
  const market = req.params.market;
  if (!MARKETS.includes(market)) return res.status(400).json({ error: 'Invalid market' });
  res.json({ market, crops: listCropsForMarket(market) });
});

app.get('/api/history/:market/:crop', (req, res) => {
  const { market, crop } = req.params;
  const limit = Math.max(1, Math.min(365, Number(req.query.limit || 30)));
  if (!MARKETS.includes(market)) return res.status(400).json({ error: 'Invalid market' });
  if (!listCropsForMarket(market).includes(crop)) return res.status(400).json({ error: 'Invalid crop' });
  const rows = readHistoryFromCsv(market, crop);
  const last = rows.slice(-limit);
  res.json(last);
});

app.get('/api/prices/live', async (req, res) => {
  const prices = await getLivePrices();
  res.json(prices);
});

app.get('/api/recommendations', async (req, res) => {
  try {
    const market = req.query.market;
    const month = req.query.month;
    if (!market) return res.status(400).json({ error: 'market is required' });
    const body = { task: 'crop_recommendation', market };
    if (month) body['month'] = Number(month);
    const resp = await axios.post('http://127.0.0.1:5000/predict', body, { timeout: 15000 });
    res.status(resp.status).json(resp.data);
  } catch (err) {
    if (err.response) return res.status(err.response.status).json(err.response.data);
    res.status(500).json({ error: 'ML API not reachable', detail: String(err) });
  }
});

app.post('/api/predict', async (req, res) => {
  try {
    const body = req.body || {};
    if (body && !('anchor_price' in body) && body.market && body.crop) {
      const prices = await getLivePrices();
      const rec = prices.find(p => p.market === body.market && p.crop.toLowerCase().includes(body.crop.toLowerCase()));
      if (rec && Number.isFinite(rec.price)) body.anchor_price = rec.price;
    }
    // Auto-fill recent price history for LSTM if missing
    if (body && body.task === 'price_forecast' && !('history' in body) && body.market && body.crop) {
      try {
        const rows = readHistoryFromCsv(body.market, body.crop);
        const values = rows.map(r => r.price).filter(n => Number.isFinite(n));
        // Use the last 60 points if available (LSTM window)
        if (values.length > 0) {
          body.history = values.slice(-60);
        }
      } catch (_) {
        // ignore, fallback to ML API defaults
      }
    }
    const resp = await axios.post('http://127.0.0.1:5000/predict', body, { timeout: 15000 });
    res.status(resp.status).json(resp.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ error: 'ML API not reachable', detail: String(err) });
    }
  }
});

// Chat endpoint (GPT pipeline)
app.post('/api/chat', chatController);

// New Groq-powered chat endpoint
app.post('/chat', groqChatController);

// Simple prices helper: returns latest price and recent history
app.get('/api/prices', (req, res) => {
  try {
    const rawMarket = String(req.query.market || '').trim();
    const crop = String(req.query.crop || '').trim();
    if (!rawMarket || !crop) return res.status(400).json({ error: 'market and crop are required' });
    // resolve market using aliases
    let market = MARKETS.find(m => m.toLowerCase() === rawMarket.toLowerCase());
    if (!market) {
      for (const [key, aliases] of Object.entries(MARKET_ALIASES)) {
        if ([key, ...aliases].some(a => a.toLowerCase().replace(/\s+market\b/, '') === rawMarket.toLowerCase().replace(/\s+market\b/, ''))) {
          market = key; break;
        }
      }
    }
    if (!market) return res.status(400).json({ error: 'Invalid market' });
    if (!listCropsForMarket(market).includes(capitalize(crop))) {
      // try tolerant match
      const list = listCropsForMarket(market);
      const found = list.find(c => c.toLowerCase() === crop.toLowerCase());
      if (!found) return res.status(400).json({ error: 'Invalid crop' });
    }
    const rows = readHistoryFromCsv(market, capitalize(crop));
    const last = rows[rows.length - 1] || null;
    res.json({ market, crop: capitalize(crop), latest: last, history: rows.slice(-30) });
  } catch (err) {
    res.status(500).json({ error: 'failed to read prices', detail: String(err) });
  }
});

function capitalize(s) {
  return (s || '').charAt(0).toUpperCase() + (s || '').slice(1);
}

// Weather proxy (OpenWeather)
app.get('/api/weather', async (req, res) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENWEATHER_API_KEY not set' });
    const district = String(req.query.district || req.query.city || 'Davangere');
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(district)}&appid=${apiKey}&units=metric`;
    const resp = await axios.get(url);
    res.json({ district, data: resp.data });
  } catch (err) {
    if (err.response) return res.status(err.response.status).json(err.response.data);
    res.status(500).json({ error: 'weather fetch failed', detail: String(err) });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend API listening on http://localhost:${PORT}`);
});
