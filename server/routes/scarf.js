const express = require('express');
const router = express.Router();
const { linkScarf, activateScarf, delinkScarf, getScarfByToken } = require('../services/scarfManager');
const store = require('../data/store');

// POST /api/scarf/link - Link scarf to identity token
router.post('/link', (req, res) => {
  const { tokenId, slotTime, gateId, colorCode } = req.body;
  if (!tokenId) return res.status(400).json({ success: false, error: 'Token ID required' });

  // Find an available scarf
  const availableScarf = store.getAvailableScarf(colorCode || 'RED');
  if (!availableScarf) return res.status(503).json({ success: false, error: 'No scarves available. Please wait.' });

  try {
    const linked = linkScarf(availableScarf.scarfId, tokenId, slotTime, gateId, colorCode);

    // Update pilgrim
    for (const [, pilgrim] of store.pilgrims) {
      if (pilgrim.identityToken?.tokenId === tokenId) {
        pilgrim.scarfLifecycle = 'LINKED';
        pilgrim.scarfId = linked.scarfId;
        break;
      }
    }

    res.json({ success: true, scarf: linked });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/scarf/activate - Activate scarf after entry validation
router.post('/activate', (req, res) => {
  const { scarfId } = req.body;
  if (!scarfId) return res.status(400).json({ success: false, error: 'Scarf ID required' });

  try {
    const activated = activateScarf(scarfId);

    // Update pilgrim
    for (const [, pilgrim] of store.pilgrims) {
      if (pilgrim.scarfId === scarfId) {
        pilgrim.scarfLifecycle = 'ACTIVE';
        pilgrim.status = 'CHECKED_IN';
        break;
      }
    }

    res.json({ success: true, scarf: activated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/scarf/delink - Delink scarf from identity
router.post('/delink', (req, res) => {
  const { scarfId } = req.body;
  if (!scarfId) return res.status(400).json({ success: false, error: 'Scarf ID required' });

  try {
    const result = delinkScarf(scarfId);

    // Update pilgrim
    for (const [, pilgrim] of store.pilgrims) {
      if (pilgrim.scarfId === scarfId) {
        pilgrim.scarfLifecycle = 'DELINKED';
        pilgrim.status = 'COMPLETED';
        break;
      }
    }

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/scarves/lifecycle - Get scarf lifecycle counts
router.get('/lifecycle', (req, res) => {
  const counts = store.getScarfLifecycleCounts();
  const total = Array.from(store.scarves.values()).length;
  const avgCycleTime = 45; // seconds (simulated)

  res.json({
    success: true,
    counts,
    total,
    avgCycleTime,
    reuseRate: Math.floor(total * 0.6), // per hour (simulated)
    scarves: Array.from(store.scarves.values()).slice(0, 50), // First 50 for display
  });
});

// GET /api/scarf/:tokenId - Get scarf by token
router.get('/:tokenId', (req, res) => {
  const scarf = getScarfByToken(req.params.tokenId);
  if (!scarf) return res.status(404).json({ success: false, error: 'No active scarf for this token' });
  res.json({ success: true, scarf });
});

module.exports = router;
