import { split, combine } from "shamir-secret-sharing";

export interface SharesConfig {
  totalShares: number;
  threshold: number;
}

const stringToUint8Array = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

const uint8ArrayToString = (arr: Uint8Array): string => {
  return new TextDecoder().decode(arr);
};

const uint8ArrayToBase64 = (arr: Uint8Array): string => {
  return btoa(String.fromCharCode.apply(null, [...arr]));
};

const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const splitPrivateKey = async (
  secret: string,
  { totalShares, threshold }: SharesConfig,
): Promise<string[]> => {
  try {
    if (!secret) {
      throw new Error("No secret provided");
    }

    if (threshold > totalShares) {
      throw new Error("Threshold cannot be greater than the number of shares");
    }

    if (threshold < 2) {
      throw new Error("Threshold must be at least 2");
    }

    if (totalShares < 2 || totalShares > 255) {
      throw new Error("Number of shares must be at least 2 and at most 255");
    }

    const secretBytes = stringToUint8Array(secret);

    const shares = await split(secretBytes, totalShares, threshold);
    {
    }

    return shares.map((share) => {
      return uint8ArrayToBase64(share);
    });
  } catch (error) {
    console.error("Error in splitPrivateKey:", error);
    throw new Error(
      "Failed to split secret. Please try again: " +
        (error instanceof Error ? error.message : String(error)),
    );
  }
};

export const combineShares = async (shares: string[]): Promise<string> => {
  try {
    if (!shares || shares.length === 0) {
      throw new Error("No shares provided");
    }

    const validShareStrings = shares.filter((share) => share && share.trim() !== "");

    if (validShareStrings.length === 0) {
      throw new Error("No valid shares provided");
    }

    if (validShareStrings.length < 2) {
      throw new Error("At least 2 valid shares are required to reconstruct the secret");
    }

    console.log(`Attempting to reconstruct with ${validShareStrings.length} shares`);

    const parsedShares: string[] = [];

    for (const shareString of validShareStrings) {
      try {
        const parsed = shareString.trim();
        parsedShares.push(parsed);
      } catch (error) {
        console.error("Failed to parse share:", shareString, error);
        throw new Error(
          "Invalid share format: " + (error instanceof Error ? error.message : String(error)),
        );
      }
    }

    console.log(
      `Parsed ${parsedShares.length} valid shares`,
      parsedShares.map((s) => s),
    );

    const sharesForReconstruction = parsedShares.map((share) => base64ToUint8Array(share));

    const reconstructedBytes = await combine(sharesForReconstruction);

    return uint8ArrayToString(reconstructedBytes);
  } catch (error) {
    console.error("Error in combineShares:", error);
    throw new Error(
      "Failed to combine shares. Please check your shares and try again: " +
        (error instanceof Error ? error.message : String(error)),
    );
  }
};
