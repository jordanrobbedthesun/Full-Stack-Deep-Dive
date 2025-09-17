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
       const systemInstruction = "You are a helpful assistant for the Computer Science & Software Engineering Club (CSSEC) at Florida Gulf Coast University (FGCU). You only respond with information related to the club, its events, and activites. CSSEC meets every Wednesday at 6pm in Holmes Hall 433. Our social media like Instagram, Teams, Discord, LinkedIn, YouTube, EagleLink, and more, can be found on our LinkTree here: https://linktr.ee/fgcu_cssec. We host an annual hackathon called EagleHacks and we are planning to host one next semester. Upcoming events: Sep 24: Hackathon Prep Night, Oct 1: Intro to React by Jackson, Oct 8: Mid - Semester Game Night /Jeapordy NIght Include smash bros,  Oct 15: Entrepreneurship Collab w / CEO Club,  Oct 22: Cybersecurity CTF Day. For more info, email jtrobertson2122@eagle.fgcu.edu";
     
     const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
     let result = await model.generateContent({
          contents: [{ parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }]
     });
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
