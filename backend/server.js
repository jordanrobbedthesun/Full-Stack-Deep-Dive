// Minimal Express server for Gemini chatbot
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Gemini API logic (from your api.tsx, adapted for Node)
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Validate prompt middleware
function validatePrompt(req, res, next) {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Valid prompt is required' });
  }
  req.body.prompt = prompt.trim();
  next();
}

// POST /api/chat
app.post('/api/chat', validatePrompt, async (req, res) => {
  const { prompt } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    let result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ success: true, reply: text, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ success: false, error: 'Failed to get response from Gemini API' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Gemini chatbot backend listening on port ${PORT}`);
});
