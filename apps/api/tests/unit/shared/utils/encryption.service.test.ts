import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { config } from "@/core/config.js";
import { EncryptionService } from "@/shared/utils/encryption.service.js";

describe("EncryptionService", () => {
  const originalKey = config.ENCRYPTION_KEY;

  beforeEach(() => {
    // Set a known 32-byte key for testing
    config.ENCRYPTION_KEY = "test_encryption_key_for_dev_mode_only_1234567";
  });

  afterEach(() => {
    config.ENCRYPTION_KEY = originalKey;
  });

  it("should encrypt and decrypt plaintext successfully", () => {
    const plaintext = "my-super-secret-api-key-123!";
    
    const ciphertext = EncryptionService.encrypt(plaintext);
    expect(ciphertext).toBeDefined();
    expect(ciphertext).not.toBe(plaintext);
    
    // Format should be iv:authTag:ciphertext
    const parts = ciphertext.split(":");
    expect(parts.length).toBe(3);

    const decrypted = EncryptionService.decrypt(ciphertext);
    expect(decrypted).toBe(plaintext);
  });

  it("should fail to decrypt with wrong key", () => {
    const plaintext = "test-data";
    const ciphertext = EncryptionService.encrypt(plaintext);
    
    // Change key
    config.ENCRYPTION_KEY = "wrong_encryption_key_for_dev_mode_only_1234567";
    
    expect(() => EncryptionService.decrypt(ciphertext)).toThrow();
  });

  it("should fail to decrypt tampered ciphertext", () => {
    const plaintext = "test-data";
    const ciphertext = EncryptionService.encrypt(plaintext);
    
    // Tamper with the ciphertext (last part)
    const parts = ciphertext.split(":");
    parts[2] = parts[2]!.substring(1) + "a"; // Modify base64 string
    const tampered = parts.join(":");
    
    expect(() => EncryptionService.decrypt(tampered)).toThrow();
  });
});
