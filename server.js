const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `You are FRIDAY - An intelligent, professional female AI assistant.
Be concise, helpful, and friendly. Keep responses short (under 100 words) unless code is needed.
Format code with proper syntax.`;

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    name: 'FRIDAY API',
    version: '1.0.0',
    poweredBy: 'opencode CLI'
  });
});

// Check if opencode is available
app.get('/status', (req, res) => {
  const opencodePath = findOpencode();
  res.json({
    opencode: opencodePath ? 'found' : 'not found',
    path: opencodePath
  });
});

// Chat endpoint using opencode CLI
app.post('/chat', async (req, res) => {
  try {
    const { messages, max_tokens = 500 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Get user message
    const userMessage = messages.find(m => m.role === 'user');
    if (!userMessage) {
      return res.status(400).json({ error: 'No user message found' });
    }

    // Build prompt with system message
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: ${userMessage.content}`;

    // Call opencode CLI
    const response = await callOpencode(fullPrompt);
    
    res.json({
      choices: [{
        message: {
          role: 'assistant',
          content: response
        }
      }],
      usage: {
        prompt_tokens: fullPrompt.length / 4,
        completion_tokens: response.length / 4,
        total_tokens: (fullPrompt.length + response.length) / 4
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// Find opencode executable
function findOpencode() {
  const possiblePaths = [
    'opencode',
    path.join(process.env.HOME || '', '.npm-global/bin/opencode'),
    path.join(process.env.HOME || '', '.nvm/versions/node/v22.11.0/bin/opencode'),
    '/usr/local/bin/opencode',
    '/usr/bin/opencode',
    path.join(__dirname, 'node_modules/.bin/opencode')
  ];
  
  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) return p;
    } catch (e) {}
  }
  return 'opencode'; // Default to PATH
}

// Call opencode CLI
function callOpencode(prompt) {
  return new Promise((resolve, reject) => {
    const opencode = spawn(findOpencode(), [
      '--model', 'claude',
      '--no-stream',
      prompt
    ], {
      env: { ...process.env }
    });

    let stdout = '';
    let stderr = '';

    opencode.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    opencode.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    opencode.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        // Try alternative approach - direct answer
        if (stdout) {
          resolve(stdout.trim());
        } else {
          reject(new Error(stderr || `opencode exited with code ${code}`));
        }
      }
    });

    opencode.on('error', (err) => {
      reject(err);
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      opencode.kill();
      if (stdout) {
        resolve(stdout.trim());
      } else {
        reject(new Error('opencode timed out'));
      }
    }, 60000);
  });
}

app.listen(PORT, () => {
  console.log(`FRIDAY API running on port ${PORT}`);
  console.log(`Using opencode CLI at: ${findOpencode()}`);
});
