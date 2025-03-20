import { Wallet } from "ethers";

// TypeScript interfaces
export interface Share {
  x: number;
  y: string; // Store as string for easy JSON serialization
}

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
  { totalShares, threshold }: SharesConfig,
): Promise<string[]> => {
  try {
    // Make sure the private key is properly formatted (no 0x prefix)
    const cleanPrivateKey = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;

    if (!isValidPrivateKey(cleanPrivateKey)) {
      throw new Error("Invalid private key format");
    }

    // Convert hex to bigint
    const privateKeyBigInt = BigInt(`0x${cleanPrivateKey}`);

    // Generate shares using the new implementation
    const shares = generateShares(privateKeyBigInt, totalShares, threshold);

    // Convert to the expected format (array of strings)
    return shares.map((share) => JSON.stringify(share));
  } catch (error) {
    console.error("Error in splitPrivateKey:", error);
    throw new Error("Failed to split private key. Please try again.");
  }
};

/**
 * Reconstructs the private key from shares
 */
export const combineShares = async (shares: string[]): Promise<string> => {
  try {
    if (!shares || shares.length === 0) {
      throw new Error("No shares provided");
    }

    // Filter out any empty shares
    const validShareStrings = shares.filter((share) => share && share.trim() !== "");

    if (validShareStrings.length === 0) {
      throw new Error("No valid shares provided");
    }
    
    if (validShareStrings.length < 2) {
      throw new Error("At least 2 valid shares are required to reconstruct the secret");
    }

    console.log(`Attempting to reconstruct with ${validShareStrings.length} shares`);

    // Parse the shares from JSON strings
    const parsedShares: Share[] = [];
    for (const shareString of validShareStrings) {
      try {
        const parsed = JSON.parse(shareString.trim());
        if (typeof parsed.x !== 'number' || typeof parsed.y !== 'string') {
          console.error("Invalid share format:", { parsed });
          throw new Error("Share has invalid format");
        }
        parsedShares.push({
          x: parsed.x,
          y: parsed.y,
        });
      } catch (error) {
        console.error("Failed to parse share:", shareString, error);
        throw new Error("Invalid share format: " + (error instanceof Error ? error.message : String(error)));
      }
    }
    
    console.log(`Parsed ${parsedShares.length} valid shares with x values:`, parsedShares.map(s => s.x));

    // Convert y values from strings to BigInt for reconstruction
    const sharesForReconstruction = parsedShares.map((share) => ({
      x: share.x,
      y: BigInt(share.y),
    }));

    // Reconstruct the secret
    const secretBigInt = reconstructSecret(sharesForReconstruction);

    // Convert bigint to hex string
    let hexString = secretBigInt.toString(16);

    // Ensure the hex string has 64 characters (32 bytes) by padding with zeros
    while (hexString.length < 64) {
      hexString = "0" + hexString;
    }

    return hexString;
  } catch (error) {
    console.error("Error in combineShares:", error);
    throw new Error("Failed to combine key shares. Please check your shares and try again: " + 
      (error instanceof Error ? error.message : String(error)));
  }
};

/**
 * Generates a Ethereum address from private key
 */
export const getAddressFromPrivateKey = (privateKey: string): string => {
  try {
    // Ensure the private key has the 0x prefix
    const formattedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
    const wallet = new Wallet(formattedKey);
    return wallet.address;
  } catch (error) {
    console.error("Error in getAddressFromPrivateKey:", error);
    throw new Error("Invalid private key format");
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

/**
 * Generates polynomial coefficients for Shamir's Secret Sharing
 */
const generatePolynomial = (secret: bigint, degree: number, prime: bigint): bigint[] => {
  const coefficients: bigint[] = [secret];

  // Generate random coefficients for the polynomial
  for (let i = 1; i <= degree; i++) {
    // Generate a random coefficient using browser crypto API if available
    let randomBigInt: bigint;

    if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
      const randomBytes = new Uint8Array(32);
      window.crypto.getRandomValues(randomBytes);
      const hexString = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      randomBigInt = BigInt(`0x${hexString}`);
      console.log("Using window.crypto for random number generation (secure)");
    } else {
      console.log("Using Math.random for random number generation (insecure)");
      // Fallback to Math.random for browsers without crypto API
      let hexString = "";
      for (let j = 0; j < 64; j++) {
        hexString += Math.floor(Math.random() * 16).toString(16);
      }
      randomBigInt = BigInt(`0x${hexString}`);
    }

    coefficients.push(randomBigInt % prime);
  }

  return coefficients;
};

/**
 * Evaluates a polynomial at a given point x
 */
const evaluatePolynomial = (coefficients: bigint[], x: number, prime: bigint): bigint => {
  let result = BigInt(0);
  let powerOfX = BigInt(1);

  for (const coefficient of coefficients) {
    result = (result + coefficient * powerOfX) % prime;
    powerOfX = (powerOfX * BigInt(x)) % prime;
  }

  return result;
};

/**
 * Generates shares using Shamir's Secret Sharing algorithm
 */
const generateShares = (secret: bigint, n: number, k: number): Share[] => {
  // Using a prime larger than the maximum possible Ethereum private key value
  // 2^256 is larger than any Ethereum private key
  const prime = BigInt(
    "115792089237316195423570985008687907853269984665640564039457584007913129639747",
  );

  // Ensure k (threshold) <= n (total shares)
  if (k > n) {
    throw new Error("Threshold cannot be greater than the number of shares");
  }
  
  if (k < 2) {
    throw new Error("Threshold must be at least 2");
  }
  
  if (n < 2) {
    throw new Error("Number of shares must be at least 2");
  }

  // Generate random polynomial coefficients
  const coefficients = generatePolynomial(secret, k - 1, prime);

  // Generate n shares
  const shares: Share[] = [];
  const usedXValues = new Set<number>();
  
  for (let x = 1; x <= n; x++) {
    if (usedXValues.has(x)) {
      console.warn(`Duplicate x value encountered: ${x}`);
      continue;
    }
    
    usedXValues.add(x);
    const y = evaluatePolynomial(coefficients, x, prime);
    shares.push({ x, y: y.toString() });
  }
  
  if (shares.length !== n) {
    console.error(`Failed to generate ${n} unique shares`);
  }

  return shares;
};

/**
 * Calculates the modular multiplicative inverse
 */
const modInverse = (a: bigint, m: bigint): bigint => {
  // Ensure a is positive and within the modulus
  a = ((a % m) + m) % m;
  
  if (a === BigInt(0)) {
    throw new Error("Modular inverse of 0 does not exist");
  }
  
  // Extended Euclidean Algorithm to find modular inverse (iterative implementation)
  let [old_r, r] = [a, m];
  let [old_s, s] = [BigInt(1), BigInt(0)];
  let [old_t, t] = [BigInt(0), BigInt(1)];
  
  while (r !== BigInt(0)) {
    const quotient = old_r / r;
    [old_r, r] = [r, old_r - quotient * r];
    [old_s, s] = [s, old_s - quotient * s];
    [old_t, t] = [t, old_t - quotient * t];
  }
  
  // If gcd is not 1, modular inverse doesn't exist
  if (old_r !== BigInt(1)) {
    console.error("GCD is not 1, modular inverse doesn't exist", { a: a.toString(), m: m.toString(), gcd: old_r.toString() });
    throw new Error("Modular inverse does not exist");
  }
  
  // Make sure the result is positive
  return ((old_s % m) + m) % m;
};

/**
 * Reconstructs the secret using Lagrange interpolation
 */
const reconstructSecret = (shares: { x: number; y: bigint }[]): bigint => {
  // Same prime as used in the share generation
  const prime = BigInt(
    "115792089237316195423570985008687907853269984665640564039457584007913129639747",
  );

  // Ensure we have enough shares
  if (shares.length < 2) {
    throw new Error("At least 2 shares are required to reconstruct the secret");
  }
  
  // Check that all x values are unique
  const xValues = shares.map(s => s.x);
  if (new Set(xValues).size !== xValues.length) {
    throw new Error("All shares must have unique x values");
  }

  let secret = BigInt(0);

  for (let i = 0; i < shares.length; i++) {
    const { x: xi, y: yi } = shares[i];
    let numerator = BigInt(1);
    let denominator = BigInt(1);

    for (let j = 0; j < shares.length; j++) {
      if (i !== j) {
        const { x: xj } = shares[j];
        
        // Ensure xi !== xj
        if (xi === xj) {
          console.error("Duplicate x values detected:", { xi, xj });
          throw new Error("All shares must have unique x values");
        }

        // Calculate (0 - xj) and (xi - xj)
        const xDiff = (BigInt(0) - BigInt(xj)) % prime;
        const xiDiff = (BigInt(xi) - BigInt(xj)) % prime;
        
        // Ensure xiDiff is not 0
        if (xiDiff === BigInt(0)) {
          throw new Error("Division by zero encountered in Lagrange interpolation");
        }

        numerator = (numerator * xDiff) % prime;
        denominator = (denominator * xiDiff) % prime;
      }
    }

    try {
      // Calculate the modular inverse of the denominator
      const denomInverse = modInverse(denominator, prime);
      
      // Calculate the term and add it to the secret
      const term = (yi * numerator * denomInverse) % prime;
      secret = (secret + term) % prime;
    } catch (error) {
      console.error("Error in Lagrange interpolation:", error, { 
        shareIndex: i, 
        xi, 
        yi: yi.toString().substring(0, 10) + "...",
        numerator: numerator.toString().substring(0, 10) + "...",
        denominator: denominator.toString().substring(0, 10) + "..."
      });
      throw new Error("Failed to compute Lagrange interpolation: " + (error instanceof Error ? error.message : String(error)));
    }
  }

  // Make sure the result is positive
  return ((secret % prime) + prime) % prime;
};
