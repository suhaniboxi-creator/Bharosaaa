const crypto = require('crypto');
const store = require('../data/store');

/**
 * UIDAI OTP Simulation Engine
 * Simulates the real Aadhaar e-KYC OTP flow:
 * 1. User submits Aadhaar number
 * 2. System sends OTP to registered mobile (simulated)
 * 3. User enters OTP within time window
 * 4. System verifies OTP and returns masked identity
 */

const OTP_VALIDITY_MS = 120000; // 120 seconds
const OTP_LENGTH = 6;
const MAX_ATTEMPTS = 3;

// Indian names for simulation
const SAMPLE_NAMES = [
  'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sunita Devi', 'Rajesh Gupta',
  'Meera Krishnan', 'Vikram Singh', 'Ananya Reddy', 'Suresh Nair', 'Kavitha Iyer',
  'Manoj Tiwari', 'Pooja Verma', 'Arun Joshi', 'Deepa Menon', 'Sanjay Mishra',
  'Lakshmi Rao', 'Ganesh Pillai', 'Revathi Bhat', 'Krishna Murthy', 'Padma Sundaram',
];

/**
 * Generate and send OTP for Aadhaar verification
 */
function sendOTP(aadhaarNumber) {
  const cleaned = aadhaarNumber.replace(/\s|-/g, '');
  if (cleaned.length !== 12 || !/^\d{12}$/.test(cleaned)) {
    return { success: false, error: 'Invalid Aadhaar number format. Must be 12 digits.' };
  }

  // Generate OTP
  const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
  const sessionId = 'SESS-' + crypto.randomBytes(16).toString('hex');
  const maskedMobile = `XXXXX-X${Math.floor(1000 + Math.random() * 9000)}`;
  const maskedAadhaar = `XXXX-XXXX-${cleaned.slice(-4)}`;

  // Store session
  store.sessions.set(sessionId, {
    aadhaarNumber: cleaned,
    otp,
    maskedMobile,
    maskedAadhaar,
    createdAt: Date.now(),
    expiresAt: Date.now() + OTP_VALIDITY_MS,
    attempts: 0,
    verified: false,
    name: SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)],
  });

  console.log(`[AADHAAR SIM] OTP for ${maskedAadhaar}: ${otp} (Session: ${sessionId})`);

  return {
    success: true,
    sessionId,
    maskedAadhaar,
    maskedMobile,
    otpLength: OTP_LENGTH,
    validitySeconds: OTP_VALIDITY_MS / 1000,
    message: `OTP sent to registered mobile ${maskedMobile}`,
  };
}

/**
 * Verify OTP for Aadhaar
 */
function verifyOTP(sessionId, otp) {
  const session = store.sessions.get(sessionId);

  if (!session) {
    return { success: false, error: 'Invalid or expired session. Please request a new OTP.' };
  }

  if (session.verified) {
    return { success: false, error: 'OTP already verified for this session.' };
  }

  if (Date.now() > session.expiresAt) {
    store.sessions.delete(sessionId);
    return { success: false, error: 'OTP has expired. Please request a new OTP.', expired: true };
  }

  session.attempts++;
  if (session.attempts > MAX_ATTEMPTS) {
    store.sessions.delete(sessionId);
    return { success: false, error: 'Maximum attempts exceeded. Please request a new OTP.', maxAttempts: true };
  }

  if (session.otp !== otp) {
    return {
      success: false,
      error: `Incorrect OTP. ${MAX_ATTEMPTS - session.attempts} attempts remaining.`,
      attemptsLeft: MAX_ATTEMPTS - session.attempts,
    };
  }

  // OTP verified successfully
  session.verified = true;

  return {
    success: true,
    verified: true,
    name: session.name,
    maskedAadhaar: session.maskedAadhaar,
    aadhaarNumber: session.aadhaarNumber, // Will be tokenized by the route handler
    sessionId,
  };
}

/**
 * Get session info (for frontend polling)
 */
function getSessionStatus(sessionId) {
  const session = store.sessions.get(sessionId);
  if (!session) return null;

  return {
    sessionId,
    maskedAadhaar: session.maskedAadhaar,
    maskedMobile: session.maskedMobile,
    verified: session.verified,
    expired: Date.now() > session.expiresAt,
    remainingSeconds: Math.max(0, Math.ceil((session.expiresAt - Date.now()) / 1000)),
    attemptsUsed: session.attempts,
    maxAttempts: MAX_ATTEMPTS,
  };
}

module.exports = { sendOTP, verifyOTP, getSessionStatus };
