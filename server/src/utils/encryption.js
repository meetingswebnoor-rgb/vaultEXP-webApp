const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;

// The encryption key should be 32 bytes hex in production
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

/**
 * Encrypts a string using AES-256-GCM
 * @param {string} text - The text to encrypt
 * @returns {string} - Hex encoded string containing salt + iv + tag + encrypted text
 */
function encrypt(text) {
  if (!text) return text;
  
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  if (key.length !== 32) throw new Error('Invalid encryption key length. Must be 32 bytes (64 hex characters).');

  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(String(text), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  // Return formatted string: salt + iv + tag + encryptedData
  return Buffer.concat([salt, iv, tag]).toString('hex') + ':' + encrypted;
}

/**
 * Decrypts a string using AES-256-GCM
 * @param {string} encryptedText - The encrypted string
 * @returns {string} - Decrypted text
 */
function decrypt(encryptedText) {
  if (!encryptedText) return encryptedText;
  
  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    
    const parts = encryptedText.split(':');
    if (parts.length !== 2) throw new Error('Invalid encrypted text format');
    
    const metaBuffer = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];

    if (metaBuffer.length !== TAG_POSITION + TAG_LENGTH) {
      throw new Error('Invalid meta buffer length');
    }

    const salt = metaBuffer.subarray(0, SALT_LENGTH); // Not currently used for key derivation since key is static, but good for future proofing PBKDF2
    const iv = metaBuffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = metaBuffer.subarray(SALT_LENGTH + IV_LENGTH, TAG_POSITION + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[Encryption] Decryption failed:', error.message);
    // If decryption fails, return null or throw depending on strictness
    // We throw to avoid silently overriding data with null if a bad key is used
    throw new Error('Decryption failed');
  }
}

module.exports = {
  encrypt,
  decrypt
};
