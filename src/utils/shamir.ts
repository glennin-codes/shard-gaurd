import * as secrets from 'secrets.js-grempe';
import { Wallet } from 'ethers';

// Track initialization state
let isInitialized = false;

// Initialize secrets.js with proper RNG
export const initializeSecrets = async (): Promise<boolean> => {
  if (isInitialized) return true;
  
  try {
    // First try to set a custom RNG using browser crypto
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const customRNG = (bits: number): string => {
        const bytes = Math.ceil(bits / 8);
        const buffer = new Uint8Array(bytes);
        window.crypto.getRandomValues(buffer);
        
        let hex = '';
        for (let i = 0; i < buffer.length; i++) {
          hex += buffer[i].toString(16).padStart(2, '0');
        }
        
        return hex.substring(0, Math.ceil(bits / 4)); // Convert to required bits
      };
      
      secrets.setRNG(customRNG);
      console.log('Secrets.js initialized with custom browser crypto RNG');
      isInitialized = true;
      return true;
    } else {
      // Fallback to the simplest initialization with defaults
      secrets.init(8, 'default');
      console.log('Secrets.js initialized with defaults');
      isInitialized = true;
      return true;
    }
  } catch (error) {
    console.error('Failed to initialize secrets.js:', error);
    
    // Last resort fallback
    try {
      // Try with browser-independent setup
      console.log('Attempting fallback initialization...');
      secrets.setRNG('nodeCryptoRandomBytes');
      isInitialized = true;
      return true;
    } catch (finalError) {
      console.error('All initialization attempts failed:', finalError);
      return false;
    }
  }
};

// Helper to ensure secrets.js is initialized
const ensureInitialized = async () => {
  if (!isInitialized) {
    const success = await initializeSecrets();
    if (!success) {
      throw new Error('Failed to initialize secrets.js library');
    }
  }
};

export interface SharesConfig {
  totalShares: number;
  threshold: number;
}

/**
 * Generates a new Ethereum private key
 */
export const generatePrivateKey = (): string => {
  const wallet = Wallet.createRandom();
  return wallet.privateKey.slice(2); // Remove '0x' prefix
};

/**
 * Splits a private key using Shamir's Secret Sharing
 */
export const splitPrivateKey = async (
  privateKey: string,
  { totalShares, threshold }: SharesConfig
): Promise<string[]> => {
  try {
    await ensureInitialized();
    return secrets.share(privateKey, totalShares, threshold);
  } catch (error) {
    console.error('Error in splitPrivateKey:', error);
    throw new Error('Failed to split private key. Please try again.');
  }
};

/**
 * Reconstructs the private key from shares
 */
export const combineShares = async (shares: string[]): Promise<string> => {
  try {
    await ensureInitialized();
    if (!shares || shares.length === 0) {
      throw new Error('No shares provided');
    }
    return secrets.combine(shares);
  } catch (error) {
    console.error('Error in combineShares:', error);
    throw new Error('Failed to combine key shares. Please check your shares and try again.');
  }
};

/**
 * Generates a Ethereum address from private key
 */
export const getAddressFromPrivateKey = (privateKey: string): string => {
  try {
    const wallet = new Wallet(`0x${privateKey}`);
    return wallet.address;
  } catch (error) {
    console.error('Error in getAddressFromPrivateKey:', error);
    throw new Error('Invalid private key format');
  }
};

/**
 * Validates if a string is a valid Ethereum private key
 */
export const isValidPrivateKey = (key: string): boolean => {
  try {
    // Ethereum private keys should be 64 hex characters (without 0x prefix)
    return /^[0-9a-fA-F]{64}$/.test(key);
  } catch (error) {
    return false;
  }
}; 