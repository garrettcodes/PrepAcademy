import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;
if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY is not defined in environment variables');
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16 bytes
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts data using AES-256-GCM
 * @param text - The text to encrypt
 * @returns The encrypted text as a hex string with IV and auth tag
 */
export const encrypt = (text: string): string => {
  try {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create a cipher using the encryption key and iv
    const cipher = crypto.createCipheriv(
      ALGORITHM, 
      Buffer.from(ENCRYPTION_KEY, 'hex'), 
      iv
    );
    
    // Update the cipher with the text to encrypt
    let encrypted = cipher.update(text, 'utf8', 'hex');
    
    // Finalize the encryption
    encrypted += cipher.final('hex');
    
    // Get the authentication tag
    const authTag = cipher.getAuthTag();
    
    // Return the IV, encrypted text, and authentication tag as a combined hex string
    return iv.toString('hex') + ':' + encrypted + ':' + authTag.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
};

/**
 * Decrypts data encrypted with the encrypt function
 * @param encryptedText - The encrypted text to decrypt
 * @returns The decrypted text
 */
export const decrypt = (encryptedText: string): string => {
  try {
    // Split the encrypted text into IV, ciphertext, and auth tag
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');
    
    // Create a decipher using the encryption key and iv
    const decipher = crypto.createDecipheriv(
      ALGORITHM, 
      Buffer.from(ENCRYPTION_KEY, 'hex'), 
      iv
    );
    
    // Set the authentication tag
    decipher.setAuthTag(authTag);
    
    // Update the decipher with the encrypted text
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    
    // Finalize the decryption
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed');
  }
}; 