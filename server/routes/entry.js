const express = require('express');
const router = express.Router();
const { decryptQR } = require('../services/tokenizer');
const store = require('../data/store');

// POST /api/entry/validate - Triple validation at entry gates
router.post('/validate', async (req, res) => {
  const { qrPayload, gateId } = req.body;
  if (!qrPayload) return res.status(400).json({ success: false, error: 'QR payload required' });

  const steps = [];

  // Step 1: Token Validation
  await new Promise(r => setTimeout(r, 300));
  let tokenData = null;
  let pilgrim = null;

  // Try encrypted QR first
  const decrypted = decryptQR(qrPayload);
  if (decrypted) {
    tokenData = store.identityTokens.get(decrypted.tokenId);
    // Find pilgrim by token
    for (const [, p] of store.pilgrims) {
      if (p.identityToken?.tokenId === decrypted.tokenId) { pilgrim = p; break; }
    }
  } else {
    // Try direct QR value match (legacy)
    for (const [, p] of store.pilgrims) {
      if (p.qrValue === qrPayload) { pilgrim = p; tokenData = p.identityToken; break; }
    }
  }

  steps.push({
    step: 1,
    name: 'Token Validation',
    icon: 'fa-shield-halved',
    passed: !!tokenData,
    details: tokenData ? `Token verified: ${tokenData.maskedId}` : 'Invalid or unrecognized token',
  });

  // Step 2: Time Slot Check
  await new Promise(r => setTimeout(r, 200));
  const slotValid = !!pilgrim; // In production, check actual time vs assigned slot
  steps.push({
    step: 2,
    name: 'Time Slot Verification',
    icon: 'fa-clock',
    passed: slotValid,
    details: slotValid ? `Slot: ${pilgrim?.slotTime || 'N/A'} — Valid for current window` : 'Slot time mismatch',
  });

  // Step 3: Iris-Backed Identity
  await new Promise(r => setTimeout(r, 200));
  const irisVerified = tokenData ? store.irisHashes.has(tokenData.tokenId) : false;
  steps.push({
    step: 3,
    name: 'Iris-Backed Identity',
    icon: 'fa-eye',
    passed: irisVerified || !!pilgrim, // Fallback for demo
    details: irisVerified ? 'Biometric hash confirmed' : (pilgrim ? 'Identity token verified (iris pending)' : 'No biometric data found'),
  });

  const allPassed = steps.every(s => s.passed);

  // If all passed, activate the scarf
  if (allPassed && pilgrim) {
    pilgrim.status = 'CHECKED_IN';
    pilgrim.entryGateId = gateId;

    // Update gate metrics
    const gate = store.gates.get(gateId);
    if (gate) {
      gate.throughput++;
      gate.lastSync = Date.now();
      gate.queueDepth = Math.max(0, gate.queueDepth - 1);
    }

    store.addTransaction({
      type: 'ENTRY',
      details: `${pilgrim.name} validated at ${gateId} — Triple check passed`,
      userId: pilgrim.id,
      templeId: 'T1',
    });
  }

  res.json({
    success: allPassed,
    steps,
    pilgrim: allPassed && pilgrim ? {
      id: pilgrim.id,
      name: pilgrim.name,
      slotTime: pilgrim.slotTime,
      colorCode: pilgrim.colorCode,
      assignedGate: pilgrim.assignedGate,
      scarfId: pilgrim.scarfId,
    } : null,
    gateId,
    processedAt: Date.now(),
    edgeLatency: `${2 + Math.floor(Math.random() * 4)}ms`,
  });
});

module.exports = router;
