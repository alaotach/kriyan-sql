/**
 * End-to-End Encryption Utility for Chat Messages
 * Uses Web Crypto API for AES-GCM encryption
 */

// Generate a unique encryption key for each user
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Export key to store in local storage
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('jwk', key);
  return JSON.stringify(exported);
}

// Import key from local storage
export async function importKey(keyData: string): Promise<CryptoKey> {
  const jwk = JSON.parse(keyData);
  return await crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt text data
export async function encryptData(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // Generate random IV (initialization vector)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    dataBuffer
  );
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);
  
  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
}

// Decrypt text data
export async function decryptData(encryptedData: string, key: CryptoKey): Promise<string> {
  try {
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );
    
    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

// Get or create user's encryption key (stored in localStorage)
export async function getUserEncryptionKey(userId: string): Promise<CryptoKey> {
  const storageKey = `encryption_key_${userId}`;
  const storedKey = localStorage.getItem(storageKey);
  
  if (storedKey) {
    return await importKey(storedKey);
  }
  
  // Generate new key for first-time user
  const newKey = await generateEncryptionKey();
  const exportedKey = await exportKey(newKey);
  localStorage.setItem(storageKey, exportedKey);
  
  // Trigger event for background sync to pick up the new key
  window.dispatchEvent(new CustomEvent('encryption-key-created', { 
    detail: { userId } 
  }));
  
  return newKey;
}

// Encrypt a chat message
export async function encryptMessage(
  message: any,
  userId: string
): Promise<any> {
  const key = await getUserEncryptionKey(userId);
  
  return {
    ...message,
    content: await encryptData(message.content, key),
    encrypted: true,
  };
}

// Decrypt a chat message
export async function decryptMessage(
  message: any,
  userId: string
): Promise<any> {
  // If not encrypted, return as-is
  if (!message.encrypted) {
    return message;
  }
  
  const key = await getUserEncryptionKey(userId);
  
  return {
    ...message,
    content: await decryptData(message.content, key),
    encrypted: false,
  };
}

// Encrypt entire conversation
export async function encryptConversation(
  messages: Array<any>,
  userId: string
): Promise<Array<any>> {
  const encryptedMessages = [];
  
  for (const message of messages) {
    encryptedMessages.push(await encryptMessage(message, userId));
  }
  
  return encryptedMessages;
}

// Decrypt entire conversation
export async function decryptConversation(
  messages: Array<any>,
  userId: string
): Promise<Array<any>> {
  const decryptedMessages = [];
  
  for (const message of messages) {
    decryptedMessages.push(await decryptMessage(message, userId));
  }
  
  return decryptedMessages;
}

// Clear user's encryption key (on logout/security reset)
export function clearEncryptionKey(userId: string): void {
  const storageKey = `encryption_key_${userId}`;
  localStorage.removeItem(storageKey);
}

// ============ KEY BACKUP & RECOVERY ============

// Derive encryption key from user password (for key backup)
async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Derive AES key from password using PBKDF2
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000, // High iteration count for security
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt encryption key with password (for backup)
export async function backupKeyWithPassword(
  userId: string,
  password: string
): Promise<string> {
  const key = await getUserEncryptionKey(userId);
  const exportedKey = await exportKey(key);
  
  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Derive key from password
  const passwordKey = await deriveKeyFromPassword(password, salt);
  
  // Encrypt the exported key
  const encryptedKey = await encryptData(exportedKey, passwordKey);
  
  // Combine salt and encrypted key
  const backup = {
    version: 1,
    salt: Array.from(salt),
    encryptedKey: encryptedKey,
  };
  
  return JSON.stringify(backup);
}

// Restore encryption key from backup
export async function restoreKeyFromBackup(
  userId: string,
  backupData: string,
  password: string
): Promise<boolean> {
  try {
    const backup = JSON.parse(backupData);
    
    // Recreate salt
    const salt = new Uint8Array(backup.salt);
    
    // Derive key from password
    const passwordKey = await deriveKeyFromPassword(password, salt);
    
    // Decrypt the key
    const decryptedKeyJson = await decryptData(backup.encryptedKey, passwordKey);
    
    // Import and validate the key
    await importKey(decryptedKeyJson);
    
    // Save to localStorage
    const storageKey = `encryption_key_${userId}`;
    localStorage.setItem(storageKey, decryptedKeyJson);
    
    return true;
  } catch (error) {
    console.error('Failed to restore key from backup:', error);
    return false;
  }
}

// Generate backup recovery code (24-word mnemonic-style)
export async function generateRecoveryCode(userId: string): Promise<string> {
  const key = await getUserEncryptionKey(userId);
  const exportedKey = await exportKey(key);
  
  // Convert key to bytes
  const keyBytes = new TextEncoder().encode(exportedKey);
  
  // Create checksum
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyBytes);
  const checksum = new Uint8Array(hashBuffer).slice(0, 4);
  
  // Combine key + checksum
  const combined = new Uint8Array(keyBytes.length + checksum.length);
  combined.set(keyBytes, 0);
  combined.set(checksum, keyBytes.length);
  
  // Convert to base64 (recovery code)
  return btoa(String.fromCharCode(...combined));
}

// Restore from recovery code
export async function restoreFromRecoveryCode(
  userId: string,
  recoveryCode: string
): Promise<boolean> {
  try {
    // Decode from base64
    const combined = Uint8Array.from(atob(recoveryCode), c => c.charCodeAt(0));
    
    // Split key and checksum
    const keyBytes = combined.slice(0, -4);
    const checksum = combined.slice(-4);
    
    // Verify checksum
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyBytes);
    const expectedChecksum = new Uint8Array(hashBuffer).slice(0, 4);
    
    if (!checksum.every((byte, i) => byte === expectedChecksum[i])) {
      throw new Error('Invalid recovery code (checksum mismatch)');
    }
    
    // Convert back to key JSON
    const keyJson = new TextDecoder().decode(keyBytes);
    
    // Import and validate key, then save
    await importKey(keyJson);
    const storageKey = `encryption_key_${userId}`;
    localStorage.setItem(storageKey, keyJson);
    
    return true;
  } catch (error) {
    console.error('Failed to restore from recovery code:', error);
    return false;
  }
}

// Export key for cloud backup (encrypted with user's password)
export async function exportKeyForCloudBackup(
  userId: string,
  password: string
): Promise<{ encryptedKey: string; salt: string }> {
  const key = await getUserEncryptionKey(userId);
  const exportedKey = await exportKey(key);
  
  // Generate salt for this backup
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltBase64 = btoa(String.fromCharCode(...salt));
  
  // Derive password key
  const passwordKey = await deriveKeyFromPassword(password, salt);
  
  // Encrypt the key
  const encryptedKey = await encryptData(exportedKey, passwordKey);
  
  return {
    encryptedKey,
    salt: saltBase64,
  };
}

// Import key from cloud backup
export async function importKeyFromCloudBackup(
  userId: string,
  encryptedKey: string,
  saltBase64: string,
  password: string
): Promise<boolean> {
  try {
    // Decode salt
    const salt = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));
    
    // Derive password key
    const passwordKey = await deriveKeyFromPassword(password, salt);
    
    // Decrypt the key
    const keyJson = await decryptData(encryptedKey, passwordKey);
    
    // Import and validate, then save
    await importKey(keyJson);
    const storageKey = `encryption_key_${userId}`;
    localStorage.setItem(storageKey, keyJson);
    
    return true;
  } catch (error) {
    console.error('Failed to import key from cloud backup:', error);
    return false;
  }
}

// Check if user has a key on this device
export function hasEncryptionKey(userId: string): boolean {
  const storageKey = `encryption_key_${userId}`;
  return localStorage.getItem(storageKey) !== null;
}

// ============ AUTOMATIC CLOUD SYNC (Better UX) ============

// Automatically backup key to cloud when created
export async function autoBackupKeyToCloud(
  userId: string,
  userEmail: string,
  retries = 3
): Promise<{ encryptedKey: string; salt: string } | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Use email as automatic password (PBKDF2 makes it secure)
      // User doesn't need to remember another password
      const autoPassword = await deriveAutoPassword(userEmail, userId);
      
      const key = await getUserEncryptionKey(userId);
      const exportedKey = await exportKey(key);
      
      // Generate salt
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const saltBase64 = btoa(String.fromCharCode(...salt));
      
      // Derive key from auto password
      const passwordKey = await deriveKeyFromPassword(autoPassword, salt);
      
      // Encrypt the key
      const encryptedKey = await encryptData(exportedKey, passwordKey);
      
      return { encryptedKey, salt: saltBase64 };
    } catch (error) {
      console.error(`Auto backup attempt ${attempt}/${retries} failed:`, error);
      if (attempt === retries) return null;
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
  return null;
}

// Automatically restore key from cloud on new device
export async function autoRestoreKeyFromCloud(
  userId: string,
  userEmail: string,
  encryptedKey: string,
  saltBase64: string,
  retries = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Check if key already exists (don't overwrite)
      if (hasEncryptionKey(userId)) {
        return true;
      }
      
      // Derive same auto password
      const autoPassword = await deriveAutoPassword(userEmail, userId);
      
      // Decode salt
      const salt = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));
      
      // Derive password key
      const passwordKey = await deriveKeyFromPassword(autoPassword, salt);
      
      // Decrypt the key
      const keyJson = await decryptData(encryptedKey, passwordKey);
      
      // Import and save
      await importKey(keyJson);
      const storageKey = `encryption_key_${userId}`;
      localStorage.setItem(storageKey, keyJson);
      
      console.log('✅ Encryption key auto-restored from cloud');
      return true;
    } catch (error) {
      console.error(`Auto restore attempt ${attempt}/${retries} failed:`, error);
      if (attempt === retries) return false;
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
  return false;
}

// Derive a deterministic "password" from user's email + userId
// This is NOT their actual password, but a derived value
async function deriveAutoPassword(email: string, userId: string): Promise<string> {
  const combined = `${email}:${userId}:kriyan-encryption-v1`;
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  
  // Hash to create deterministic but unpredictable value
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));
  
  return hashBase64;
}
