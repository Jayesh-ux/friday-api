# FRIDAY API Backend

Backend for FRIDAY AI Assistant. Powers voice-to-text chat using opencode CLI.

## Deploy to Render (Free)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Jayesh-ux/friday-api)

### Manual Deploy:
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub: `Jayesh-ux/friday-api`
4. Settings:
   - Root Directory: `friday-api`
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Deploy!

## API Endpoints

- `GET /` - Health check
- `POST /chat` - Send message

## Request Format

```json
POST /chat
{
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```

## Response

```json
{
  "choices": [{
    "message": {
      "role": "assistant", 
      "content": "Hello! I'm FRIDAY..."
    }
  }]
}
```
