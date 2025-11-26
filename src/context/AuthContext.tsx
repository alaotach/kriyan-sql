import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { 
  onAuthChange, 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  logOut,
  getUserProfile,
  UserProfile,
  updateUserProfile
} from '../services/firebase';
import { 
  autoBackupKeyToCloud, 
  autoRestoreKeyFromCloud, 
  hasEncryptionKey 
} from '../utils/encryption';
import { keySyncService } from '../utils/keySync';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User>;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<User>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setUser(user);
      
      if (user) {
        // Load user profile from backend API (MySQL)
        let profile = await getUserProfile(user.uid);
        
        // If user doesn't exist in MySQL, create them
        if (!profile) {
          try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            await fetch(`${API_BASE_URL}/user/create`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'User',
                photoURL: user.photoURL
              })
            });
            // Fetch the newly created profile
            profile = await getUserProfile(user.uid);
          } catch (error) {
            console.error('Failed to create user profile:', error);
          }
        }
        
        setUserProfile(profile);
        
        // ============ AUTOMATIC KEY SYNC ============
        try {
          // If offline, profile will be null - handle gracefully
          if (profile === null && !navigator.onLine) {
            console.warn('⚠️ Offline: Skipping key sync, will retry when online');
            return;
          }
          
          const hasLocalKey = hasEncryptionKey(user.uid);
          const hasCloudBackup = profile?.encryptionKeyBackup && profile?.encryptionKeySalt;
          
          if (hasCloudBackup && !hasLocalKey) {
            // Cloud backup exists but no local key - restore from cloud
            const restored = await autoRestoreKeyFromCloud(
              user.uid,
              user.email!,
              profile.encryptionKeyBackup!,
              profile.encryptionKeySalt!
            );
            
            if (restored) {
              console.log('✅ Key auto-restored from cloud');
            }
          } else if (hasLocalKey && !hasCloudBackup && navigator.onLine) {
            // Have local key but no cloud backup - backup now (only if online)
            const backup = await autoBackupKeyToCloud(user.uid, user.email!);
            if (backup) {
              await updateUserProfile(user.uid, {
                encryptionKeyBackup: backup.encryptedKey,
                encryptionKeySalt: backup.salt,
              } as any);
              console.log('✅ Key auto-backed up to cloud');
            }
          } else if (!hasLocalKey && !hasCloudBackup) {
            // First-time user - key will be created on first chat
            // No action needed, getUserEncryptionKey() will handle it
            console.log('🆕 New user - key will be created on first use');
          } else {
            // Both exist - all good
            console.log('✅ Encryption key ready');
          }
          
          // Start background sync service (periodic checks + network reconnect)
          keySyncService.start(user.uid, user.email!);
        } catch (error) {
          console.error('Key sync error:', error);
        }
      } else {
        setUserProfile(null);
        // Stop sync service on logout
        keySyncService.stop();
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribe();
      keySyncService.stop();
    };
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
