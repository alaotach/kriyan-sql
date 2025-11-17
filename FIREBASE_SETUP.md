# 🔥 Firebase Integration Guide

## Features Implemented

### ✅ Authentication
- Google Sign-In
- Email/Password Authentication
- User profile management
- Persistent login sessions

### ✅ Cloud Storage (Firestore)
- Save chat conversations
- Auto-save every 30 seconds
- Load conversation history
- Delete conversations

### ✅ Advanced Chat Features
- **Message Editing**: Edit user messages and regenerate responses
- **Message Regeneration**: Regenerate AI responses
- **Message Actions**: Copy, delete, text-to-speech
- **Image Generation**: Generate AI images in chat
- **Chat Branching**: Create alternate conversation paths
- **Auto-save**: Conversations saved automatically

## Firebase Setup Instructions

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `kriyan-ai` (or your choice)
4. **Disable** Google Analytics (optional)
5. Click "Create project"
6. Wait for project to be ready

### Step 2: Add Web App

1. In Firebase Console, click the Web icon `</>`
2. Register app name: `Kriyan AI Web`
3. **Check** "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. **Copy the firebaseConfig** object shown
6. Click "Continue to console"

### Step 3: Configure Authentication

1. In Firebase Console sidebar, click "Authentication"
2. Click "Get started"
3. Click "Sign-in method" tab

**Enable Google Sign-In:**
1. Click "Google" provider
2. Toggle "Enable"
3. Select support email
4. Click "Save"

**Enable Email/Password:**
1. Click "Email/Password" provider
2. Toggle "Enable" (first option only, not Email link)
3. Click "Save"

### Step 4: Set Up Firestore Database

1. In sidebar, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in **test mode**" for development
4. Select location (choose closest to users)
5. Click "Enable"

**Security Rules (Important for Production):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only read/write their own conversations
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

### Step 5: Set Up Firebase Storage

1. In sidebar, click "Storage"
2. Click "Get started"
3. Choose "Start in **test mode**"
4. Click "Next"
5. Select location (same as Firestore)
6. Click "Done"

**Security Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 6: Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Open `.env` and add your Firebase config values:
```env
VITE_FIREBASE_API_KEY=AIzaSyC_your_actual_key_here
VITE_FIREBASE_AUTH_DOMAIN=kriyan-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kriyan-ai
VITE_FIREBASE_STORAGE_BUCKET=kriyan-ai.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456

VITE_API_URL=http://localhost:8000
```

3. **Never commit `.env` to git!** (Already in `.gitignore`)

### Step 7: Test the Integration

1. Start backend:
```bash
cd backend
python main.py
```

2. Start frontend (in new terminal):
```bash
npm run dev
```

3. Open `http://localhost:5173`

4. Click "Sign In" button
5. Test Google Sign-In or Email/Password
6. Start a chat with any persona
7. Chat conversation should auto-save every 30 seconds
8. Check "Chat History" to see saved conversations

### Step 8: Verify Database

1. Go to Firebase Console → Firestore Database
2. You should see:
   - `users` collection with your user document
   - `conversations` collection with chat documents

## Features Usage

### Authentication

**Sign In:**
- Click "Sign In" button on home page
- Choose Google or Email/Password
- After login, you'll see your profile in header

**Sign Out:**
- Click your profile in header
- Click "Sign Out"

### Chat Features

**Start New Chat:**
1. Browse personas on home page
2. Click any persona card
3. Start chatting

**Edit Message:**
1. Hover over any user message
2. Click edit icon (pencil)
3. Modify text
4. Click "Save & Regenerate"
5. AI will respond to edited message

**Regenerate Response:**
1. Hover over any AI message
2. Click regenerate icon (circular arrow)
3. New response will be generated

**Copy Message:**
1. Hover over any message
2. Click copy icon
3. Message copied to clipboard

**Text-to-Speech:**
1. Hover over AI message
2. Click speaker icon
3. Message will be read aloud

**Delete Message:**
1. Hover over any message
2. Click trash icon
3. Message will be deleted

**Generate Image:**
1. In chat, click image icon in input area
2. Enter image description
3. Click "Generate"
4. Image appears in chat

**Save Conversation:**
- Automatically saves every 30 seconds
- Manual save: Click save icon in header
- Only works when signed in

**View History:**
1. Click your profile in header
2. Click "Chat History"
3. Click any conversation to resume

## Database Schema

### Users Collection
```typescript
{
  uid: string,              // Firebase Auth UID
  email: string,            // User email
  displayName: string,      // User display name
  photoURL: string | null,  // Profile photo URL
  subscription: 'free' | 'pro',
  createdAt: Timestamp
}
```

### Conversations Collection
```typescript
{
  id: string,               // Auto-generated
  userId: string,           // User who owns conversation
  personaName: string,      // Persona name
  title: string,            // Conversation title
  model: string,            // AI model used
  messages: [
    {
      role: 'user' | 'assistant',
      content: string,
      timestamp: Timestamp,
      imageUrl?: string
    }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp,
  isPinned?: boolean
}
```

## Advanced Features

### Voice Input (Coming Soon)
- Speech-to-text for message input
- Browser Web Speech API

### Long-term Memory (Coming Soon)
- Vector embeddings for context
- Persona memory across conversations

### Multi-modal Chat (Coming Soon)
- Upload images in chat
- Image analysis with AI

## Troubleshooting

### "Firebase not configured" error
- Check `.env` file exists
- Verify all Firebase config values
- Restart dev server after changing `.env`

### Authentication fails
- Check Firebase Console → Authentication
- Verify sign-in methods are enabled
- Check browser console for specific errors

### Conversations not saving
- Verify user is signed in
- Check Firestore rules allow write
- Check browser console for errors
- Verify network connection

### Images not loading
- Check Storage rules
- Verify image URLs are valid
- Check browser console for CORS errors

## Production Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect Vercel to repo
3. Add environment variables in Vercel dashboard
4. Deploy

### Backend (Railway)
1. Create Railway account
2. New project from GitHub
3. Add environment variables
4. Deploy

### Update Firebase Config
1. Add production domains to:
   - Authentication → Settings → Authorized domains
   - CORS configuration
2. Update Firestore/Storage rules for production

## Security Best Practices

1. **Never expose API keys in code**
2. **Use environment variables**
3. **Implement proper Firestore rules**
4. **Enable App Check** (Firebase)
5. **Rate limit API endpoints**
6. **Validate user input**
7. **Sanitize sensitive data**

## Cost Estimation

### Firebase Free Tier (Spark Plan)
- **Authentication**: 50,000 users/month ✅
- **Firestore**: 1GB storage, 50K reads, 20K writes/day ✅
- **Storage**: 5GB, 1GB downloads/day ✅
- **Hosting**: 10GB bandwidth/month ✅

**Estimated Cost for 1000 users:**
- ~$0-5/month with free tier
- Upgrade to Blaze (pay-as-you-go) when needed

## Support

For issues or questions:
1. Check Firebase Console logs
2. Check browser console for errors
3. Review Firebase documentation
4. Open GitHub issue

---

**Firebase Setup Complete!** 🎉

Your app now has:
- ✅ User authentication
- ✅ Cloud database
- ✅ Conversation persistence
- ✅ Advanced chat features
- ✅ Auto-save functionality

Ready for production deployment! 🚀
