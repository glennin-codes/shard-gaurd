declare module 'secrets.js-grempe' {
  /**
   * Initialize the secrets.js library
   * @param bits Number of bits for each share
   * @param rngName Name of the RNG to use (e.g., 'browserCryptoGetRandomValues')
   */
  export function init(bits: number, rngName: string): void;
  
  /**
   * Set a custom random number generator function
   * @param rng Function that takes bits as input and returns a hex string or a string name of built-in RNG
   */
  export function setRNG(rng: ((bits: number) => string) | string): void;
  
  /**
   * Share a secret using Shamir's Secret Sharing
   * @param secret The secret to split
   * @param numShares Total number of shares to generate
   * @param threshold Minimum number of shares needed to reconstruct
   * @param padLength Optional padding length
   */
  export function share(
    secret: string,
    numShares: number,
    threshold: number,
    padLength?: number
  ): string[];
  
  /**
   * Combine shares to reconstruct the original secret
   * @param shares Array of shares
   */
  export function combine(shares: string[]): string;
  
  /**
   * Generate a new random key
   * @param bitLength Bit length of key
   */
  export function newKey(bitLength?: number): string;
  
  /**
   * Convert a string to hex
   * @param str String to convert
   */
  export function str2hex(str: string): string;
  
  /**
   * Convert hex to a string
   * @param hex Hex to convert
   */
  export function hex2str(hex: string): string;
} 