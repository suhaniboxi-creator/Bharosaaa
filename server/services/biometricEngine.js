const crypto = require('crypto');

/**
 * Simulate iris scan capture - generates a synthetic iris template
 * In production, this would interface with actual iris scanner hardware (e.g., IriTech, CMITech)
 */
function captureIris(stationId) {
  // Simulate capture delay and quality variance
  const quality = 70 + Math.floor(Math.random() * 30); // 70-99%
  const rawTemplate = crypto.randomBytes(256).toString('hex'); // Simulated iris template
  const captureTime = 800 + Math.floor(Math.random() * 700); // 800-1500ms

  return {
    rawTemplate,
    quality,
    captureTime,
    stationId,
    capturedAt: Date.now(),
    type: 'IRIS',
  };
}

/**
 * Hash iris template - creates irreversible hash from iris biometric data
 * Only the hash is stored, never the raw template
 */
function hashIris(rawTemplate, stationId) {
  const salt = process.env.IRIS_SALT || 'bharosa-iris-2026';
  const hashValue = '0x' + crypto.createHash('sha256').update(rawTemplate + salt).digest('hex').substring(0, 48);

  return {
    hashValue,
    quality: 70 + Math.floor(Math.random() * 30),
    capturedAt: Date.now(),
    stationId,
    type: 'IRIS',
  };
}

/**
 * Verify iris match - compares stored hash with new scan
 * In production, this would use iris matching algorithms (Daugman's algorithm)
 * For simulation, we return high confidence for same-session captures
 */
function verifyIrisMatch(storedHash, newTemplate) {
  // Simulate matching: in a real system, both would be from actual iris captures
  // For demo purposes, we'll use the tokenId correlation
  const salt = process.env.IRIS_SALT || 'bharosa-iris-2026';
  const newHash = '0x' + crypto.createHash('sha256').update(newTemplate + salt).digest('hex').substring(0, 48);

  // In demo, we simulate a match since we can't do real iris matching
  // Real system would use Hamming distance on IrisCode templates
  const isMatch = storedHash.hashValue === newHash;
  const confidence = isMatch ? 94 + Math.floor(Math.random() * 6) : Math.floor(Math.random() * 30);

  return {
    match: isMatch,
    confidence,
    storedHash: storedHash.hashValue,
    newHash,
    verifiedAt: Date.now(),
  };
}

/**
 * Simulate a forced match for demo purposes
 * When entry/exit use the same pilgrim context
 */
function simulateVerifiedMatch(storedHash) {
  return {
    match: true,
    confidence: 94 + Math.floor(Math.random() * 6),
    storedHash: storedHash.hashValue,
    newHash: storedHash.hashValue, // Same hash for demo
    verifiedAt: Date.now(),
  };
}

module.exports = { captureIris, hashIris, verifyIrisMatch, simulateVerifiedMatch };
