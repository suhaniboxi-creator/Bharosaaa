const express = require('express');
const router = express.Router();
const { captureIris, hashIris, simulateVerifiedMatch } = require('../services/biometricEngine');
const store = require('../data/store');

// POST /api/biometric/capture - Simulate iris capture
router.post('/capture', async (req, res) => {
  const { stationId, tokenId } = req.body;
  if (!stationId) return res.status(400).json({ success: false, error: 'Station ID required' });

  // Simulate capture delay
  const captureResult = captureIris(stationId);
  await new Promise(r => setTimeout(r, Math.min(captureResult.captureTime, 1500)));

  // Hash the iris template
  const irisHash = hashIris(captureResult.rawTemplate, stationId);

  // Store hash (never raw template)
  if (tokenId) {
    store.irisHashes.set(tokenId, irisHash);
  }

  // Update station metrics
  const station = store.stations.get(stationId);
  if (station) {
    station.queueCount = Math.max(0, (station.queueCount || 0) - 1);
  }

  store.systemMetrics.totalProcessed++;

  res.json({
    success: true,
    irisHash: {
      hashValue: irisHash.hashValue,
      quality: irisHash.quality,
      type: irisHash.type,
      capturedAt: irisHash.capturedAt,
      stationId: irisHash.stationId,
    },
    captureTime: captureResult.captureTime,
    // rawTemplate is NEVER sent to frontend
  });
});

// POST /api/biometric/verify - Verify iris against stored hash
router.post('/verify', async (req, res) => {
  const { tokenId, stationId } = req.body;
  if (!tokenId) return res.status(400).json({ success: false, error: 'Token ID required' });

  const storedHash = store.irisHashes.get(tokenId);
  if (!storedHash) return res.status(404).json({ success: false, error: 'No iris data found for this token' });

  // Simulate verification delay
  await new Promise(r => setTimeout(r, 800));

  // For demo, use simulated verified match
  const result = simulateVerifiedMatch(storedHash);

  store.addTransaction({
    type: result.match ? 'BIOMETRIC_MATCH' : 'BIOMETRIC_MISMATCH',
    details: `Iris verification for token ${tokenId}: ${result.match ? 'MATCH' : 'MISMATCH'} (${result.confidence}% confidence)`,
    userId: tokenId,
    templeId: 'T1',
  });

  res.json({
    success: true,
    ...result,
  });
});

// GET /api/biometric/stations - Get all station statuses
router.get('/stations', (req, res) => {
  const stations = Array.from(store.stations.values());
  res.json({ success: true, stations });
});

module.exports = router;
