// lib/encryption.ts
import crypto from "crypto";

// For AES-256, the key needs to be exactly 32 bytes (256 bits)
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex"); // Fallback for development only

// Ensure key is always the right length - 32 bytes for AES-256
const getKey = (): Buffer => {
  // If the key is provided as hex string, convert to Buffer
  if (typeof ENCRYPTION_KEY === "string") {
    // If it's a hex string already of correct length (64 chars = 32 bytes)
    if (ENCRYPTION_KEY.length === 64 && /^[0-9a-f]+$/i.test(ENCRYPTION_KEY)) {
      return Buffer.from(ENCRYPTION_KEY, "hex");
    }

    // Otherwise derive a 32-byte key using PBKDF2
    return crypto.pbkdf2Sync(
      ENCRYPTION_KEY,
      "salt", // Consider using a configured salt
      10000, // Number of iterations
      32, // Key length in bytes
      "sha256" // Hash digest algorithm
    );
  }

  // Should never reach here in production
  return crypto.randomBytes(32);
};

const IV_LENGTH = 16; // For AES, this is always 16 bytes

export async function encrypt(text: string): Promise<string> {
  // Generate a random initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher using the derived key of correct length
  const cipher = crypto.createCipheriv("aes-256-cbc", getKey(), iv);

  // Encrypt the text
  let encrypted = cipher.update(text, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Return iv:encrypted format
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export async function decrypt(text: string): Promise<string> {
  // Split the input into iv and encrypted parts
  const textParts = text.split(":");
  if (textParts.length !== 2) {
    throw new Error("Invalid encrypted text format");
  }

  // Convert hex strings back to buffers
  const iv = Buffer.from(textParts[0], "hex");
  const encryptedText = Buffer.from(textParts[1], "hex");

  // Create decipher using the same key
  const decipher = crypto.createDecipheriv("aes-256-cbc", getKey(), iv);

  // Decrypt the text
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  // Return the original text
  return decrypted.toString("utf8");
}
