import CryptoJS from 'crypto-js';
import { Credential } from '@/types';

// Constants
const CREDENTIALS_KEY = 'boltpass_credentials';
const ENCRYPTION_KEY = 'boltpass_v2_secure_storage'; // Change will invalidate old data

// In-memory queue and state
let saveQueue: Credential[] | null = null;
let isSaving = false;
let saveTimeout: NodeJS.Timeout | null = null;
const DEBOUNCE_DELAY = 300; // ms

/**
 * Encrypts data using AES encryption
 */
function encrypt(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts encrypted data
 */
function decrypt(encryptedData: string): any {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Stores credentials securely in localStorage
 * Uses debouncing to optimize frequent writes
 */
export function secureStore(credentials: Credential[]): void {
  // Queue the credentials for saving
  saveQueue = [...credentials];
  
  // Clear existing timeout if any
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  // Set a new timeout for debouncing
  saveTimeout = setTimeout(() => {
    processSaveQueue();
  }, DEBOUNCE_DELAY);
}

/**
 * Process the save queue and persist data to localStorage
 */
async function processSaveQueue(): Promise<void> {
  // If already saving or no data to save, do nothing
  if (isSaving || !saveQueue) return;
  
  try {
    isSaving = true;
    const dataToSave = [...saveQueue];
    saveQueue = null;
    
    const encrypted = encrypt(dataToSave);
    localStorage.setItem(CREDENTIALS_KEY, encrypted);
  } catch (error) {
    console.error('Error saving credentials:', error);
  } finally {
    isSaving = false;
    
    // If more data was queued while saving, process it
    if (saveQueue) {
      setTimeout(processSaveQueue, 0);
    }
  }
}

/**
 * Retrieves credentials from secure storage
 * Handles legacy unencrypted data for backward compatibility
 */
export function secureRetrieve(): Credential[] {
  try {
    const storedData = localStorage.getItem(CREDENTIALS_KEY);
    
    // No stored data
    if (!storedData) return [];
    
    // Try to parse as encrypted data
    try {
      return decrypt(storedData);
    } catch (decryptError) {
      console.warn('Could not decrypt data, trying legacy format');
      
      // Try to parse as legacy unencrypted JSON
      try {
        const legacyData = JSON.parse(storedData);
        if (Array.isArray(legacyData)) {
          console.info('Migrating from legacy unencrypted format');
          secureStore(legacyData); // Migrate to encrypted format
          return legacyData;
        }
      } catch (legacyError) {
        console.error('Failed to parse legacy data', legacyError);
      }
      
      return [];
    }
  } catch (error) {
    console.error('Error retrieving credentials:', error);
    return [];
  }
}

/**
 * Clears all credentials from storage
 */
export function secureClear(): void {
  try {
    localStorage.removeItem(CREDENTIALS_KEY);
    // Clear any pending saves
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    saveQueue = null;
  } catch (error) {
    console.error('Error clearing credentials:', error);
  }
}

/**
 * Exports credentials as encrypted data
 */
export function secureExport(): string {
  const credentials = secureRetrieve();
  return JSON.stringify(credentials);
}

/**
 * Imports credentials from exported data
 */
export function secureImport(exportedData: string): boolean {
  try {
    const importedCredentials = JSON.parse(exportedData);
    if (Array.isArray(importedCredentials)) {
      secureStore(importedCredentials);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Import error:', error);
    return false;
  }
}

/**
 * Force immediate save of any pending credentials
 * Useful when closing the app or before exports
 */
export function secureFlush(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    
    if (saveQueue) {
      processSaveQueue().then(resolve);
    } else {
      resolve();
    }
  });
} 