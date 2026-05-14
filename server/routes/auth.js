const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, getSessionStatus } = require('../services/aadhaarSim');
const { tokenizeAadhaar, tokenizePassport, generateSecureQR } = require('../services/tokenizer');
const store = require('../data/store');
const { enqueue } = require('../services/queueManager');

// POST /api/auth/aadhaar-otp - Send Aadhaar OTP
router.post('/aadhaar-otp', (req, res) => {
  const { aadhaarNumber } = req.body;
  if (!aadhaarNumber) return res.status(400).json({ success: false, error: 'Aadhaar number required' });

  const result = sendOTP(aadhaarNumber);
  res.json(result);
});

// POST /api/auth/verify-otp - Verify Aadhaar OTP
router.post('/verify-otp', (req, res) => {
  const { sessionId, otp } = req.body;
  if (!sessionId || !otp) return res.status(400).json({ success: false, error: 'Session ID and OTP required' });

  const result = verifyOTP(sessionId, otp);

  if (result.success && result.aadhaarNumber) {
    // Tokenize the Aadhaar - never store raw
    const token = tokenizeAadhaar(result.aadhaarNumber);
    store.identityTokens.set(token.tokenId, token);
    delete result.aadhaarNumber; // Remove raw from response
    result.identityToken = token;
  }

  res.json(result);
});

// GET /api/auth/session/:sessionId - Get session status
router.get('/session/:sessionId', (req, res) => {
  const status = getSessionStatus(req.params.sessionId);
  if (!status) return res.status(404).json({ success: false, error: 'Session not found' });
  res.json({ success: true, ...status });
});

// POST /api/auth/passport - Passport verification
router.post('/passport', (req, res) => {
  const { passportNumber, country, name } = req.body;
  if (!passportNumber || !country) return res.status(400).json({ success: false, error: 'Passport number and country required' });

  try {
    const token = tokenizePassport(passportNumber, country);
    store.identityTokens.set(token.tokenId, token);

    res.json({
      success: true,
      verified: true,
      name: name || 'International Pilgrim',
      identityToken: token,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/auth/register - Complete pilgrim registration
router.post('/register', (req, res) => {
  const { tokenId, name, age, gender, groupSize, slotTime, gateId, donationAmount } = req.body;

  if (!tokenId || !name) return res.status(400).json({ success: false, error: 'Token ID and name required' });

  const token = store.identityTokens.get(tokenId);
  if (!token) return res.status(404).json({ success: false, error: 'Identity token not found. Please verify identity first.' });

  const pilgrimId = 'BHR-' + Math.floor(10000 + Math.random() * 90000);
  const colorMap = { '08:00 AM': 'RED', '09:00 AM': 'ORANGE', '10:00 AM': 'YELLOW', '11:00 AM': 'BROWN' };
  const colorCode = colorMap[slotTime] || 'RED';

  const qrPayload = generateSecureQR(tokenId, slotTime, gateId);

  const pilgrim = {
    id: pilgrimId,
    name,
    age: parseInt(age) || 0,
    gender: gender || 'Other',
    groupSize: parseInt(groupSize) || 1,
    slotTime: slotTime || '08:00 AM',
    colorCode,
    qrValue: qrPayload,
    status: 'PENDING',
    auraPoints: donationAmount ? Math.floor(parseInt(donationAmount) / 10) : 0,
    badges: [],
    completedQuests: [],
    assignedGate: gateId || 'GATE-A',
    identityToken: token,
    identityType: token.type,
    nationality: token.nationality || 'IN',
    scarfLifecycle: 'UNLINKED',
    verifiedAt: Date.now(),
  };

  store.pilgrims.set(pilgrimId, pilgrim);
  store.systemMetrics.totalPilgrims++;

  // Queue the registration
  const queueInfo = enqueue('registration', { pilgrimId });

  store.addTransaction({
    type: 'ENTRY',
    details: `Pilgrim ${name} registered with ${token.type} verification (${token.maskedId})`,
    userId: pilgrimId,
    templeId: 'T1',
  });

  res.json({
    success: true,
    pilgrim: { ...pilgrim, identityToken: { ...token, hashValue: undefined } }, // Don't send hash back
    queuePosition: queueInfo.position,
    estimatedWait: queueInfo.estimatedWait,
  });
});

// POST /api/batch/register - Bulk family/group registration
router.post('/batch-register', (req, res) => {
  const { members, slotTime, gateId, leaderId } = req.body;
  if (!members || !Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ success: false, error: 'Members array required' });
  }

  const batchId = 'BATCH-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  const results = [];

  for (const member of members) {
    const pilgrimId = 'BHR-' + Math.floor(10000 + Math.random() * 90000);
    const colorMap = { '08:00 AM': 'RED', '09:00 AM': 'ORANGE', '10:00 AM': 'YELLOW', '11:00 AM': 'BROWN' };
    const colorCode = colorMap[slotTime] || 'RED';

    const pilgrim = {
      id: pilgrimId,
      name: member.name,
      age: parseInt(member.age) || 0,
      gender: member.gender || 'Other',
      groupSize: members.length,
      slotTime: slotTime || '08:00 AM',
      colorCode,
      qrValue: `BHR-BATCH:${batchId}:${pilgrimId}`,
      status: 'PENDING',
      auraPoints: 0,
      badges: [],
      completedQuests: [],
      assignedGate: gateId || 'GATE-A',
      batchId,
      scarfLifecycle: 'UNLINKED',
    };

    store.pilgrims.set(pilgrimId, pilgrim);
    store.systemMetrics.totalPilgrims++;
    results.push(pilgrim);
  }

  store.batches.set(batchId, { batchId, leaderId, members: results.map(r => r.id), slotTime, gateId, createdAt: Date.now() });

  res.json({ success: true, batchId, pilgrims: results, totalMembers: results.length });
});

module.exports = router;
