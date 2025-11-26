import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { clearEncryptionKey } from '../utils/encryption';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKey123",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kriyan-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kriyan-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kriyan-ai.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abc123"
};

// Initialize Firebase - AUTH ONLY
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Auth providers
const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile via API (MySQL backend)
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    await fetch(`${API_BASE_URL}/user/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: result.user.uid,
        email: result.user.email,
        displayName,
        photoURL: null
      })
    });
    
    return result.user;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    // Clear encryption key on logout for security
    if (auth.currentUser) {
      clearEncryptionKey(auth.currentUser.uid);
    }
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ============ TYPES (for compatibility) ============
// Note: All database operations now go through the backend API (MySQL)
// These types are kept for backward compatibility

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: any;
  encrypted?: boolean;
}

export interface Conversation {
  id?: string;
  userId: string;
  personaName: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  createdAt: any;
  updatedAt: any;
  isPinned?: boolean;
  encrypted?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  subscription: 'free' | 'pro';
  createdAt: any;
  encryptionKeyBackup?: string;
  encryptionKeySalt?: string;
}

export interface UserMemory {
  id: string;
  userId: string;
  content: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============ DATABASE OPERATIONS (via Backend API) ============
// All these functions now call the backend API which uses MySQL

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// User Profile Functions
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to get user profile: ${response.status}`);
    }
    const data = await response.json();
    return {
      uid: data.id,
      email: data.email,
      displayName: data.display_name,
      photoURL: data.photo_url,
      subscription: data.subscription || 'free',
      createdAt: data.created_at,
      encryptionKeyBackup: data.encryption_key_backup,
      encryptionKeySalt: data.encryption_key_salt
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const updateData: any = {};
    if (updates.displayName !== undefined) updateData.displayName = updates.displayName;
    if (updates.photoURL !== undefined) updateData.photoURL = updates.photoURL;
    if (updates.subscription !== undefined) updateData.subscription = updates.subscription;
    
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update user profile: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Conversation Functions
export const saveConversation = async (userId: string, conversation: Omit<Conversation, 'id' | 'userId'>): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversation/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        personaName: conversation.personaName,
        title: conversation.title,
        model: conversation.model || 'qwen/qwen3-32b', // Default HackClub model
        encrypted: conversation.encrypted || false
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.status}`);
    }
    
    const data = await response.json();
    const conversationId = data.conversationId;
    
    // Add messages
    for (const message of conversation.messages) {
      await fetch(`${API_BASE_URL}/conversation/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          role: message.role,
          content: message.content,
          encrypted: message.encrypted || false
        })
      });
    }
    
    return conversationId;
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
};

export const updateConversation = async (conversationId: string, userId: string, updates: Partial<Conversation>) => {
  try {
    // Update conversation metadata
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.isPinned !== undefined) updateData.isPinned = updates.isPinned;
    
    if (Object.keys(updateData).length > 0) {
      await fetch(`${API_BASE_URL}/conversation/${conversationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
    }
    
    // If messages are updated, we need to delete old ones and add new ones
    if (updates.messages) {
      // Note: This is a simplified approach. In production, you might want a better diff algorithm
      for (const message of updates.messages) {
        if (!message.id) { // New message
          await fetch(`${API_BASE_URL}/conversation/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId,
              role: message.role,
              content: message.content,
              encrypted: message.encrypted || false
            })
          });
        }
      }
    }
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
};

export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to get conversations: ${response.status}`);
    }
    
    const conversations = await response.json();
    
    // Get messages for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv: any) => {
        const messagesResponse = await fetch(`${API_BASE_URL}/conversation/${conv.id}/messages`);
        const messages = messagesResponse.ok ? await messagesResponse.json() : [];
        
        return {
          id: conv.id,
          userId: conv.user_id,
          personaName: conv.persona_name,
          title: conv.title,
          model: conv.model,
          isPinned: conv.is_pinned,
          encrypted: conv.encrypted,
          createdAt: conv.created_at,
          updatedAt: conv.updated_at,
          messages: messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.created_at,
            encrypted: msg.encrypted
          }))
        };
      })
    );
    
    return conversationsWithMessages;
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
};

export const getConversation = async (conversationId: string, userId: string): Promise<Conversation | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversation/${conversationId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to get conversation: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      id: data.id,
      userId: data.user_id,
      personaName: data.persona_name,
      title: data.title,
      model: data.model,
      isPinned: data.is_pinned,
      encrypted: data.encrypted,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      messages: (data.messages || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
        encrypted: msg.encrypted
      }))
    };
  } catch (error) {
    console.error('Error getting conversation:', error);
    return null;
  }
};

export const deleteConversation = async (conversationId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversation/${conversationId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

// Memory Functions
export const saveUserMemory = async (userId: string, content: string, category?: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/memory/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        content,
        category: category || 'general'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save memory: ${response.status}`);
    }
    
    const data = await response.json();
    return data.memoryId;
  } catch (error) {
    console.error('Error saving memory:', error);
    throw error;
  }
};

export const getUserMemories = async (userId: string): Promise<UserMemory[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/memories/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to get memories: ${response.status}`);
    }
    
    const memories = await response.json();
    return memories.map((mem: any) => ({
      id: mem.id,
      userId: mem.user_id,
      content: mem.content,
      category: mem.category,
      createdAt: new Date(mem.created_at),
      updatedAt: new Date(mem.updated_at)
    }));
  } catch (error) {
    console.error('Error getting memories:', error);
    throw error;
  }
};

export const deleteUserMemory = async (memoryId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/memory/${memoryId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete memory: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting memory:', error);
    throw error;
  }
};

export const updateUserMemory = async (memoryId: string, content: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/memory/${memoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update memory: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating memory:', error);
    throw error;
  }
};

// Settings Functions
export const getMemorySettings = async (userId: string): Promise<{ enabled: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/${userId}`);
    if (!response.ok) {
      return { enabled: false };
    }
    
    const data = await response.json();
    return { enabled: data.memory_enabled || false };
  } catch (error) {
    console.error('Error getting memory settings:', error);
    return { enabled: false };
  }
};

export const setMemorySettings = async (userId: string, enabled: boolean) => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memoryEnabled: enabled })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to set memory settings: ${response.status}`);
    }
  } catch (error) {
    console.error('Error setting memory settings:', error);
    throw error;
  }
};
