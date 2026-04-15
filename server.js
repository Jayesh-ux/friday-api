const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `You are FRIDAY - A smart, friendly female AI assistant.
Be concise, helpful, and friendly.`;

// Smart demo responses
function generateResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return "Hello! I'm FRIDAY, your AI assistant. How can I help you today?";
  }
  
  if (msg.includes('who are you') || msg.includes('your name')) {
    return "I'm FRIDAY - your personal AI assistant. I'm here to help you with coding, questions, and anything you need!";
  }
  
  if (msg.includes('help')) {
    return "I can help with:\n• Writing and debugging code\n• Answering questions\n• Explaining concepts\n\nJust ask!";
  }
  
  if (msg.includes('code') || msg.includes('programming')) {
    return "I can help with code! Tell me your language and what you're building. I work with JS, Python, React, and more.";
  }
  
  return `I understand you're asking about: "${userMessage.substring(0, 50)}..."\n\n(Configure AI API for full responses)`;
}

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    name: 'FRIDAY API',
    version: '1.0'
  });
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body || [];

    const userMessage = messages?.find(m => m.role === 'user')?.content || '';
    
    if (!userMessage) {
      return res.json({ 
        choices: [{ message: { role: 'assistant', content: 'Send me a message!' } }]
      });
    }

    const response = generateResponse(userMessage);
    const promptTokens = Math.ceil(userMessage.length / 4);
    const completionTokens = Math.ceil(response.length / 4);
    
    res.json({
      choices: [{
        message: {
          role: 'assistant',
          content: response
        }
      }],
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.json({ 
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`FRIDAY API running on port ${PORT}`);
});
