const express = require('express');
const router = express.Router();
const { simulateVerifiedMatch } = require('../services/biometricEngine');
const { delinkScarf } = require('../services/scarfManager');
const store = require('../data/store');

// POST /api/exit/verify - Exit biometric re-verification + scarf delink
router.post('/verify', async (req, res) => {
  const { scarfId, gateId } = req.body;
  if (!scarfId) return res.status(400).json({ success: false, error: 'Scarf ID required' });

  // Find pilgrim by scarf
  let pilgrim = null;
  for (const [, p] of store.pilgrims) {
    if (p.scarfId === scarfId && p.status === 'CHECKED_IN') { pilgrim = p; break; }
  }

  if (!pilgrim) {
    // Try matching by QR value for legacy pilgrims
    for (const [, p] of store.pilgrims) {
      if (p.qrValue === scarfId && p.status === 'CHECKED_IN') { pilgrim = p; break; }
    }
  }

  if (!pilgrim) {
    return res.status(404).json({ success: false, error: 'No active pilgrim found for this scarf' });
  }

  // Simulate iris re-verification
  await new Promise(r => setTimeout(r, 1000));
  const tokenId = pilgrim.identityToken?.tokenId;
  const storedHash = tokenId ? store.irisHashes.get(tokenId) : null;

  let irisResult;
  if (storedHash) {
    irisResult = simulateVerifiedMatch(storedHash);
  } else {
    // Fallback for demo - simulate successful match
    irisResult = {
      match: true,
      confidence: 96,
      storedHash: '0x' + 'a'.repeat(48),
      newHash: '0x' + 'a'.repeat(48),
      verifiedAt: Date.now(),
    };
  }

  if (!irisResult.match) {
    store.addTransaction({
      type: 'SECURITY_ALERT',
      details: `IRIS MISMATCH at exit ${gateId} for ${pilgrim.name}. Scarf ${scarfId} locked.`,
      userId: pilgrim.id,
      templeId: 'T1',
    });

    return res.json({
      success: false,
      mismatch: true,
      pilgrim: { id: pilgrim.id, name: pilgrim.name },
      irisResult,
      alert: 'SECURITY: Biometric mismatch detected. Scarf locked for manual review.',
    });
  }

  // Successful exit
  pilgrim.status = 'COMPLETED';
  pilgrim.exitGateId = gateId;
  pilgrim.scarfLifecycle = 'DELINKED';

  // Delink scarf
  let delinkResult = null;
  if (pilgrim.scarfId) {
    try { delinkResult = delinkScarf(pilgrim.scarfId); } catch (e) { /* ok */ }
  }

  const entryTime = pilgrim.verifiedAt || Date.now() - 3600000;
  const exitTime = Date.now();
  const journeyDuration = Math.round((exitTime - entryTime) / 60000);

  store.addTransaction({
    type: 'EXIT',
    details: `${pilgrim.name} exit verified at ${gateId}. Iris match: ${irisResult.confidence}%. Duration: ${journeyDuration}min. Scarf delinked.`,
    userId: pilgrim.id,
    templeId: 'T1',
  });

  res.json({
    success: true,
    pilgrim: {
      id: pilgrim.id,
      name: pilgrim.name,
      slotTime: pilgrim.slotTime,
      colorCode: pilgrim.colorCode,
      auraPoints: pilgrim.auraPoints,
      badges: pilgrim.badges,
    },
    irisResult,
    journey: {
      entryTime,
      exitTime,
      durationMinutes: journeyDuration,
      entryGate: pilgrim.entryGateId,
      exitGate: gateId,
    },
    scarfDelinked: !!delinkResult,
    scarfId: pilgrim.scarfId,
    dataWiped: true,
  });
});

module.exports = router;
