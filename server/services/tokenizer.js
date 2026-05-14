const crypto = require('crypto');

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Tokenize Aadhaar number - creates irreversible token, stores only masked version
 * @param {string} rawAadhaar - 12-digit Aadhaar number
 * @returns {object} IdentityToken
 */
function tokenizeAadhaar(rawAadhaar) {
  const cleaned = rawAadhaar.replace(/\s|-/g, '');
  if (cleaned.length !== 12 || !/^\d{12}$/.test(cleaned)) {
    throw new Error('Invalid Aadhaar format');
  }

  const tokenId = 'TKN-' + sha256(cleaned + process.env.TOKEN_SALT || 'bharosa-salt-2026').substring(0, 32).toUpperCase();
  const maskedId = `XXXX-XXXX-${cleaned.slice(-4)}`;
  const hashValue = '0x' + sha256(cleaned).substring(0, 48);

  return {
    tokenId,
    maskedId,
    hashValue,
    type: 'AADHAAR',
    verified: true,
    timestamp: Date.now(),
  };
}

/**
 * Tokenize Passport - creates irreversible token
 * @param {string} rawPassport - Passport number
 * @param {string} country - Country code
 * @returns {object} IdentityToken
 */
function tokenizePassport(rawPassport, country) {
  const cleaned = rawPassport.replace(/\s/g, '').toUpperCase();
  if (cleaned.length < 6 || cleaned.length > 12) {
    throw new Error('Invalid passport format');
  }

  const tokenId = 'TKN-' + sha256(cleaned + country + (process.env.TOKEN_SALT || 'bharosa-salt-2026')).substring(0, 32).toUpperCase();
  const maskedId = `${cleaned.substring(0, 2)}${'*'.repeat(cleaned.length - 4)}${cleaned.slice(-2)}`;
  const hashValue = '0x' + sha256(cleaned + country).substring(0, 48);

  return {
    tokenId,
    maskedId,
    hashValue,
    type: 'PASSPORT',
    nationality: country,
    verified: true,
    timestamp: Date.now(),
  };
}

/**
 * Generate encrypted QR payload
 */
function generateSecureQR(tokenId, slotId, gateId) {
  const payload = JSON.stringify({ tokenId, slotId, gateId, ts: Date.now() });
  const cipher = crypto.createCipheriv('aes-256-cbc',
    crypto.scryptSync(process.env.QR_SECRET || 'bharosa-qr-key-2026', 'salt', 32),
    Buffer.alloc(16, 0)
  );
  let encrypted = cipher.update(payload, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `BHR:${encrypted}`;
}

/**
 * Decrypt QR payload
 */
function decryptQR(qrPayload) {
  try {
    const encrypted = qrPayload.replace('BHR:', '');
    const decipher = crypto.createDecipheriv('aes-256-cbc',
      crypto.scryptSync(process.env.QR_SECRET || 'bharosa-qr-key-2026', 'salt', 32),
      Buffer.alloc(16, 0)
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

module.exports = { tokenizeAadhaar, tokenizePassport, generateSecureQR, decryptQR, sha256 };
