/**
 * Background Key Synchronization Service
 * 
 * Ensures encryption keys are always backed up to cloud with:
 * - Periodic sync checks (every 5 minutes)
 * - Retry on failures
 * - Network reconnection handling
 * - Visibility change handling (tab focus)
 */

import { autoBackupKeyToCloud, hasEncryptionKey } from './encryption';
import { getUserProfile, updateUserProfile } from '../services/firebase';

class KeySyncService {
  private syncInterval: number | null = null;
  private syncInProgress = false;
  private lastSyncAttempt = 0;
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly MIN_RETRY_DELAY = 30 * 1000; // 30 seconds minimum between retries

  /**
   * Start background sync service
   */
  start(userId: string, userEmail: string) {
    this.stop(); // Clear any existing interval

    // Initial sync check
    this.checkAndSync(userId, userEmail);

    // Periodic sync check
    this.syncInterval = window.setInterval(() => {
      this.checkAndSync(userId, userEmail);
    }, this.SYNC_INTERVAL);

    // Sync on network reconnection
    window.addEventListener('online', () => {
      console.log('🌐 Network reconnected, checking key sync...');
      this.checkAndSync(userId, userEmail);
    });

    // Sync when tab becomes visible (user returns)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkAndSync(userId, userEmail);
      }
    });

    // Sync immediately when new key is created
    window.addEventListener('encryption-key-created', ((e: CustomEvent) => {
      if (e.detail.userId === userId) {
        console.log('🔑 New key detected, backing up immediately...');
        this.checkAndSync(userId, userEmail);
      }
    }) as EventListener);

    console.log('🔄 Key sync service started');
  }

  /**
   * Stop background sync service
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Check if key needs backup and sync to cloud
   */
  private async checkAndSync(userId: string, userEmail: string) {
    // Prevent concurrent syncs
    if (this.syncInProgress) {
      return;
    }

    // Rate limiting
    const now = Date.now();
    if (now - this.lastSyncAttempt < this.MIN_RETRY_DELAY) {
      return;
    }

    this.syncInProgress = true;
    this.lastSyncAttempt = now;

    try {
      // Check if user has local key
      if (!hasEncryptionKey(userId)) {
        return; // No key to backup
      }

      // Check if cloud backup exists
      const profile = await getUserProfile(userId);
      if (profile?.encryptionKeyBackup && profile?.encryptionKeySalt) {
        return; // Already backed up
      }

      // Need to backup
      console.log('🔑 Backing up encryption key to cloud...');
      const backup = await autoBackupKeyToCloud(userId, userEmail);
      
      if (backup) {
        await updateUserProfile(userId, {
          encryptionKeyBackup: backup.encryptedKey,
          encryptionKeySalt: backup.salt,
        } as any);
        console.log('✅ Key backed up successfully');
      } else {
        console.warn('⚠️ Key backup failed, will retry later');
      }
    } catch (error) {
      console.error('Key sync check failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Force immediate sync (useful for testing or manual triggers)
   */
  async forceSync(userId: string, userEmail: string): Promise<boolean> {
    try {
      const backup = await autoBackupKeyToCloud(userId, userEmail);
      
      if (backup) {
        await updateUserProfile(userId, {
          encryptionKeyBackup: backup.encryptedKey,
          encryptionKeySalt: backup.salt,
        } as any);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Force sync failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const keySyncService = new KeySyncService();
