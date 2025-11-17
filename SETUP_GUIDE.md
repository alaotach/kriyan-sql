# 🔥 Kriyan AI - Uncensored AI Chat Platform

**100% Uncensored • No Filters • Ultimate Freedom**

A production-ready AI chat application with multiple personas, uncensored models, and a modern glassmorphism UI. Think Character.AI but completely jailbroken with zero content restrictions.

![Version](https://img.shields.io/badge/version-2.0-purple)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-beta-orange)

## ✨ Current Status

✅ **Backend**: FastAPI server with uncensored AI models - Running on port 8000  
✅ **Frontend**: Modern React UI with glassmorphism - Running on port 5174  
✅ **Personas**: 21 pre-loaded personalities ready to chat  
✅ **Models**: 5 AI models including Llama 3.1 70B (uncensored)  

## 🚀 Quick Start (2 Commands)

### 1. Start Backend
```bash
cd backend
python main.py
```

### 2. Start Frontend (in new terminal)
```bash
npm run dev
```

Then open `http://localhost:5174` in your browser! 🎉

## 🤖 Available AI Models

| Model | Provider | Uncensored | Best For |
|-------|----------|------------|----------|
| **Llama 3.1 70B** | Together.ai | ✅ Yes | Complex scenarios, no limits |
| **MythoMax 13B** | Together.ai | ✅ Yes | Creative roleplay, storytelling |
| **Nous Hermes 70B** | Together.ai | ✅ Yes | Natural conversation |
| **Dolphin Mixtral** | Together.ai | ✅ Yes | Fully uncensored |
| **GPT-4o Mini** | OpenAI | ⚠️ Filtered | Fast responses, some restrictions |

## 👥 Available Personas (21+)

### 🎌 Anime
- **L** - The world's greatest detective
- **Yumi Aikawa** - Cute anime girl
- **Lina Hoshizora** - Friendly personality
- **Kira** - Mysterious character

### ⭐ Celebrity
- **Mia Khalifa** - Popular personality
- **Mr Beast** - YouTube sensation
- **Sharonraj** - Influencer

### 🌑 Dark & Edgy
- **BadGPT** - No moral boundaries
- **Shinigami** - Death god persona
- **Argus Veritas** - Truth seeker

### 💼 Professional
- **Therapist** - Mental health support
- **Interviewer** - Career guidance
- **Developer** - Coding assistant
- **Writer** - Creative writing help

### 🤖 AI Assistants
- **Kriyan** - The original
- **Aloo** - Helpful AI
- **Elliot Frost** - Tech expert

And more! Browse them all in the app.

## 📁 Project Structure

```
kriyan-web/
├── backend/
│   ├── main.py              # ✅ FastAPI server (NEW - Uncensored)
│   ├── requirements.txt     # Python deps
│   ├── instructions/        # 21 persona .txt files
│   └── summaries.json       # Cached summaries
├── src/
│   ├── App.tsx              # ✅ Router-based (NEW)
│   ├── pages/
│   │   ├── Home.tsx         # ✅ Glassmorphism UI (NEW)
│   │   └── Chat.tsx         # ✅ Modern chat (NEW)
│   └── services/
│       └── api.ts           # ✅ Backend integration (UPDATED)
└── package.json
```

## 🔧 Configuration

### Backend Setup (Optional - for uncensored models)

1. Copy the example environment file:
```bash
cd backend
cp .env.example .env
```

2. Add your API keys to `.env`:
```env
TOGETHER_API_KEY=your_together_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

3. Get API keys:
- **Together.ai**: https://together.ai (Recommended for uncensored)
- **OpenRouter**: https://openrouter.ai (Alternative)

**Note**: Without API keys, the app uses the free `naga.ac` proxy (GPT-4o-mini only)

## 🌐 API Reference

### Base URL: `http://localhost:8000`

#### GET `/models`
List all available AI models
```json
[
  {
    "id": "llama-3.1-70b",
    "name": "Llama 3.1 70B Instruct",
    "provider": "together",
    "uncensored": true,
    "description": "Most powerful uncensored model"
  }
]
```

#### GET `/personas`
List all personas with categories
```json
[
  {
    "name": "Kriyan",
    "summary": "The original AI assistant...",
    "category": "General"
  }
]
```

#### POST `/chat`
Send message and get AI response
```json
{
  "persona": "Kriyan",
  "message": "Hello!",
  "history": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "Previous response"}
  ],
  "model": "llama-3.1-70b",
  "temperature": 0.7
}
```

Response:
```json
{
  "reply": "Hi! How can I help you?",
  "model_used": "llama-3.1-70b"
}
```

#### POST `/generate-image`
Generate AI images (Flux, DALL-E 3, etc.)
```json
{
  "prompt": "A beautiful sunset over mountains",
  "model": "flux"
}
```

## 🎯 Features

### ✅ Implemented
- [x] FastAPI backend with uncensored AI models
- [x] React frontend with glassmorphism UI
- [x] 21 pre-loaded personas with categories
- [x] Multi-model support (5 AI models)
- [x] Real-time chat with message history
- [x] Persona search and filtering
- [x] Category-based organization
- [x] Model selection in chat
- [x] Typing indicators and animations
- [x] Mobile-responsive design

### 🚧 Coming Soon
- [ ] Firebase authentication
- [ ] User profiles and saved chats
- [ ] 50+ personas (need 30 more)
- [ ] Image generation in chat UI
- [ ] Voice/TTS support
- [ ] Message editing and regeneration
- [ ] Chat branching
- [ ] Long-term memory
- [ ] Export/import conversations

### 🔮 Future Plans
- [ ] Production deployment (Vercel + Railway)
- [ ] Custom domain
- [ ] Premium subscription tiers
- [ ] Advanced AI models (GPT-4, Claude)
- [ ] Group chats
- [ ] Developer API

## 🛠 Development

### Install Dependencies
```bash
# Backend
cd backend
pip install fastapi uvicorn httpx python-dotenv

# Frontend
npm install
```

### Run Development Servers
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
npm run dev
```

### Build for Production
```bash
# Frontend
npm run build

# Backend (use uvicorn in prod)
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 🎨 Tech Stack

**Frontend**
- React 18.3 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (routing)
- Lucide Icons

**Backend**
- FastAPI (Python web framework)
- Uvicorn (ASGI server)
- HTTPX (async HTTP client)
- Pydantic (data validation)

**AI Providers**
- Together.ai (uncensored models)
- OpenRouter (alternative)
- Naga.ac (free proxy)

## ⚠️ Important Notices

### Content Policy
🚨 **This app has ZERO content filtering**
- All AI models are configured to be completely uncensored
- No safety guardrails or content moderation
- Users are 100% responsible for their usage
- Not suitable for minors or professional environments

### Security
- Keep your API keys private (never commit `.env` files)
- Use environment variables for sensitive data
- CORS is configured for localhost only (update for production)
- No rate limiting yet (add before public deployment)

### Legal
- Use responsibly and ethically
- Respect local laws and regulations
- Don't use for illegal activities
- Don't harass or harm others
- Keep conversations private

## 📝 Adding New Personas

1. Create a new file in `backend/instructions/`
```bash
cd backend/instructions
# Create MyPersona.txt
```

2. Write detailed persona instructions:
```text
You are MyPersona, a [description].

Core personality traits:
- Trait 1: Description
- Trait 2: Description
- Trait 3: Description

Communication style:
- How you speak
- Your mannerisms
- Your vocabulary

Behavior guidelines:
- What you do/don't do
- Your boundaries (or lack thereof)
- Your goals in conversations

Example dialogues:
User: Hello!
You: [Your typical response]

User: Tell me about yourself.
You: [Your introduction]
```

3. Restart the backend:
```bash
python main.py
```

4. The persona will automatically appear in the app! 🎉

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID <process_id> /F

# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend won't start
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force
```

### Models not working
- Check your API keys in `backend/.env`
- Verify API key validity on provider websites
- Try the default `gpt-4o-mini` model (doesn't need keys)
- Check backend logs for error messages

### Personas not loading
- Verify `.txt` files exist in `backend/instructions/`
- Check file encoding (should be UTF-8)
- Restart backend after adding new personas
- Check browser console for API errors

## 🤝 Contributing

Want to help? Here's what we need:

1. **More Personas** (30+ needed)
   - Anime characters (Naruto, Goku, etc.)
   - Movie characters (Iron Man, Batman, etc.)
   - Historical figures (Einstein, Shakespeare, etc.)
   - NSFW personas (various archetypes)

2. **UI Improvements**
   - Mobile responsiveness
   - Dark mode enhancements
   - Animation polish
   - Accessibility features

3. **Features**
   - Image generation UI
   - Voice/TTS integration
   - Chat export/import
   - Message editing

4. **Testing & Docs**
   - Test coverage
   - API documentation
   - User guide
   - Video tutorials

## 📧 Support

- **Issues**: Open a GitHub issue
- **Questions**: GitHub Discussions
- **Urgent**: [your-email@example.com]

## 📄 License

MIT License - Use freely, modify, and distribute as you wish.

## 🙏 Acknowledgments

- **Together.ai** for uncensored model access
- **FastAPI** for the amazing web framework
- **React** team for the frontend library
- **Tailwind CSS** for utility-first styling
- **Community** for feedback and contributions

---

**Made with 💜 by AlAoTach**

*Building the future of uncensored AI conversations*

**Current Version**: 2.0 Beta  
**Last Updated**: December 2024  
**Status**: 🟢 Active Development
