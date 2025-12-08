# AI Chat Application

## Overview
A lightweight, modern AI chat interface that connects to an n8n webhook backend. Built with pure HTML, CSS, and JavaScript - no frameworks required.

## Project Structure
```
├── index.html      # Main HTML structure
├── style.css       # Styling with dark theme and animations
├── script.js       # Chat logic and webhook integration
├── server.py       # Simple Python HTTP server
└── replit.md       # This documentation file
```

## Configuration
To connect to your n8n webhook, edit `script.js` and update the `WEBHOOK_URL` variable at the top of the file:

```javascript
const WEBHOOK_URL = "https://your-n8n-webhook-url-here";
```

## Expected Webhook Format
The application sends POST requests with:
```json
{ "message": "user message here" }
```

And expects responses in the format:
```json
{ "reply": "AI response here" }
```

## Features
- Deep black fullscreen design
- User messages (white bubbles, right-aligned)
- AI messages (dark bubbles, left-aligned)
- Typing indicator while waiting for response
- Error handling with error message bubbles
- Smooth fade-in animations
- Auto-scroll to latest message
- Mobile responsive design
- Empty message prevention

## Running the Application
The server runs on port 5000. Simply start the workflow to begin.

## Recent Changes
- December 2024: Initial build with all core features
