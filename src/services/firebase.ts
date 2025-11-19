import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { encryptConversation, decryptConversation, clearEncryptionKey } from '../utils/encryption';

// Firebase configuration
// Replace with your Firebase project config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKey123",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kriyan-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kriyan-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kriyan-ai.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abc123"
};

// Initialize Firebase with persistent cache settings
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with persistent cache (new method)
export const db = getFirestore(app);

export const storage = getStorage(app);

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
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      email: result.user.email,
      displayName,
      createdAt: serverTimestamp(),
      photoURL: null,
      subscription: 'free'
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

// Firestore functions for chat history
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
  encrypted?: boolean; // Flag to indicate conversation is encrypted
}

export const saveConversation = async (userId: string, conversation: Omit<Conversation, 'id' | 'userId'>) => {
  try {
    // Encrypt messages before saving
    const encryptedMessages = await encryptConversation(conversation.messages, userId);
    
    // Remove undefined values to prevent Firebase errors
    const cleanConversation = Object.fromEntries(
      Object.entries(conversation).filter(([_, v]) => v !== undefined)
    );
    
    const conversationData = {
      ...cleanConversation,
      messages: encryptedMessages,
      userId,
      encrypted: true, // Mark as encrypted
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'conversations'), conversationData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
};

export const updateConversation = async (conversationId: string, userId: string, updates: Partial<Conversation>) => {
  try {
    // Encrypt messages if present in updates
    const updateData: any = { ...updates };
    
    if (updates.messages) {
      updateData.messages = await encryptConversation(updates.messages, userId);
      updateData.encrypted = true;
    }
    
    // Remove undefined values to prevent Firebase errors
    const cleanUpdates = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    );
    
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      ...cleanUpdates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
};

export const getUserConversations = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const conversations = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data() as Conversation;
        
        // Decrypt messages if encrypted
        if (data.encrypted && data.messages) {
          try {
            data.messages = await decryptConversation(data.messages, userId);
          } catch (error) {
            console.error('Failed to decrypt conversation:', error);
            // Return conversation with error message
            data.messages = [{
              role: 'assistant',
              content: '[Encrypted - Unable to decrypt]',
              timestamp: null
            }];
          }
        }
        
        return {
          id: docSnap.id,
          ...data
        };
      })
    );
    
    return conversations as Conversation[];
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
};

export const getConversation = async (conversationId: string, userId: string) => {
  try {
    const docRef = doc(db, 'conversations', conversationId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as Conversation;
      
      // Decrypt messages if encrypted
      if (data.encrypted && data.messages) {
        try {
          data.messages = await decryptConversation(data.messages, userId);
        } catch (error) {
          console.error('Failed to decrypt conversation:', error);
          data.messages = [{
            role: 'assistant',
            content: '[Encrypted - Unable to decrypt]',
            timestamp: null
          }];
        }
      }
      
      return {
        id: docSnap.id,
        ...data
      } as Conversation;
    }
    return null;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
};

export const deleteConversation = async (conversationId: string) => {
  try {
    await deleteDoc(doc(db, 'conversations', conversationId));
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

// User profile functions
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  subscription: 'free' | 'pro';
  createdAt: any;
  encryptionKeyBackup?: string; // Encrypted backup of encryption key
  encryptionKeySalt?: string; // Salt for key derivation
}

export const getUserProfile = async (userId: string) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error: any) {
    // Handle offline errors gracefully
    if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
      console.warn('⚠️ Offline: Cannot fetch user profile, will retry when online');
      return null; // Return null instead of throwing
    }
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Check if document exists first
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      // Create document if it doesn't exist
      await setDoc(userRef, {
        ...updates,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      // Update existing document
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error: any) {
    // Handle offline errors gracefully
    if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
      console.warn('⚠️ Offline: Cannot update profile, changes will sync when online');
      return; // Silently fail, background sync will handle it
    }
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Storage functions
export const uploadAvatar = async (userId: string, file: File) => {
  try {
    const storageRef = ref(storage, `avatars/${userId}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    // Update user profile with new photo URL
    await updateUserProfile(userId, { photoURL: url });
    
    return url;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

// ============ MEMORY MANAGEMENT ============
export interface UserMemory {
  id: string;
  userId: string;
  content: string; // The memory text
  category?: string; // e.g., 'personal', 'work', 'relationships', 'preferences'
  createdAt: Date;
  updatedAt: Date;
}

export const saveUserMemory = async (userId: string, content: string, category?: string) => {
  try {
    const memoryData = {
      userId,
      content,
      category: category || 'general',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'userMemories'), memoryData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving memory:', error);
    throw error;
  }
};

export const getUserMemories = async (userId: string): Promise<UserMemory[]> => {
  try {
    const q = query(
      collection(db, 'userMemories'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as UserMemory[];
  } catch (error) {
    console.error('Error getting memories:', error);
    throw error;
  }
};

export const deleteUserMemory = async (memoryId: string) => {
  try {
    await deleteDoc(doc(db, 'userMemories', memoryId));
  } catch (error) {
    console.error('Error deleting memory:', error);
    throw error;
  }
};

export const updateUserMemory = async (memoryId: string, content: string) => {
  try {
    await updateDoc(doc(db, 'userMemories', memoryId), {
      content,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating memory:', error);
    throw error;
  }
};

// Memory settings
export const getMemorySettings = async (userId: string): Promise<{ enabled: boolean }> => {
  try {
    const docRef = doc(db, 'userSettings', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { enabled: docSnap.data().memoryEnabled || false };
    }
    return { enabled: false };
  } catch (error) {
    console.error('Error getting memory settings:', error);
    return { enabled: false };
  }
};

export const setMemorySettings = async (userId: string, enabled: boolean) => {
  try {
    const docRef = doc(db, 'userSettings', userId);
    await setDoc(docRef, { memoryEnabled: enabled }, { merge: true });
  } catch (error) {
    console.error('Error setting memory settings:', error);
    throw error;
  }
};
