import * as secrets from 'secrets.js-grempe';
import { Wallet } from 'ethers';

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
export const splitPrivateKey = (
  privateKey: string,
  { totalShares, threshold }: SharesConfig
): string[] => {
  return secrets.share(privateKey, totalShares, threshold);
};

/**
 * Reconstructs the private key from shares
 */
export const combineShares = (shares: string[]): string => {
  return secrets.combine(shares);
};

/**
 * Generates a Ethereum address from private key
 */
export const getAddressFromPrivateKey = (privateKey: string): string => {
  const wallet = new Wallet(`0x${privateKey}`);
  return wallet.address;
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