import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

import { config } from "@/core/config.js";
import { createModuleLogger } from "@/core/logger.js";

const log = createModuleLogger("EncryptionService");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit nonce is recommended for GCM

export class EncryptionService {
  /**
   * Encrypts plaintext using AES-256-GCM with the application master key.
   * Format: <base64-iv>:<base64-auth-tag>:<base64-ciphertext>
   */
  static encrypt(plaintext: string): string {
    if (!config.ENCRYPTION_KEY) {
      log.error("ENCRYPTION_KEY is not defined");
      throw new Error("Encryption key not configured");
    }

    // Ensure the key is exactly 32 bytes (256 bits) for AES-256
    let keyBuffer = Buffer.from(config.ENCRYPTION_KEY, "utf8");
    if (keyBuffer.length < 32) {
      // Pad if too short (not ideal, but handles defaults)
      const padded = Buffer.alloc(32);
      keyBuffer.copy(padded);
      keyBuffer = padded;
    } else if (keyBuffer.length > 32) {
      // Truncate if too long
      keyBuffer = keyBuffer.subarray(0, 32);
    }

    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, keyBuffer, iv);

    const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString("base64")}:${authTag.toString("base64")}:${ciphertext.toString("base64")}`;
  }

  /**
   * Decrypts ciphertext formatted as <base64-iv>:<base64-auth-tag>:<base64-ciphertext>
   */
  static decrypt(encryptedText: string): string {
    if (!config.ENCRYPTION_KEY) {
      log.error("ENCRYPTION_KEY is not defined");
      throw new Error("Encryption key not configured");
    }

    let keyBuffer = Buffer.from(config.ENCRYPTION_KEY, "utf8");
    if (keyBuffer.length < 32) {
      const padded = Buffer.alloc(32);
      keyBuffer.copy(padded);
      keyBuffer = padded;
    } else if (keyBuffer.length > 32) {
      keyBuffer = keyBuffer.subarray(0, 32);
    }

    const parts = encryptedText.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted text format");
    }

    const [ivB64, authTagB64, ciphertextB64] = parts as [string, string, string];

    const iv = Buffer.from(ivB64, "base64");
    const authTag = Buffer.from(authTagB64, "base64");
    const ciphertext = Buffer.from(ciphertextB64, "base64");

    const decipher = createDecipheriv(ALGORITHM, keyBuffer, iv);
    decipher.setAuthTag(authTag);

    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString("utf8");
  }
}
