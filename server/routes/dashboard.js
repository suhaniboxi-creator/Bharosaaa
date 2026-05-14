const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { getThroughput, getAllQueueStatus } = require('../services/queueManager');

router.get('/metrics', (req, res) => {
  const pilgrims = Array.from(store.pilgrims.values());
  const gates = Array.from(store.gates.values());
  const stations = Array.from(store.stations.values());
  const scarfCounts = store.getScarfLifecycleCounts();

  res.json({
    success: true,
    metrics: {
      totalRegistered: pilgrims.length,
      activePilgrims: pilgrims.filter(p => p.status === 'CHECKED_IN').length,
      completedPilgrims: pilgrims.filter(p => p.status === 'COMPLETED').length,
      pendingPilgrims: pilgrims.filter(p => p.status === 'PENDING').length,
      activeGates: gates.filter(g => g.status === 'ACTIVE').length,
      totalGates: gates.length,
      totalThroughput: gates.reduce((s, g) => s + g.throughput, 0),
      throughputPerMinute: getThroughput(),
      activeStations: stations.filter(s => s.status === 'ACTIVE').length,
      totalStations: stations.length,
      avgWaitTime: 14,
      peakLoad: Math.round((pilgrims.filter(p => p.status === 'CHECKED_IN').length / 500) * 100),
      scarfCounts,
      scarfAvailable: scarfCounts.READY || 0,
      queues: getAllQueueStatus(),
      uptime: Math.round((Date.now() - store.systemMetrics.uptime) / 1000),
      serverCount: store.systemMetrics.serverCount,
      edgeNodes: store.systemMetrics.edgeNodes,
    },
    recentTransactions: store.transactions.slice(-20).reverse(),
  });
});

router.get('/gates', (req, res) => {
  const gates = Array.from(store.gates.values()).map(g => ({ ...g, lastSync: Date.now() - Math.floor(Math.random() * 5000) }));
  res.json({ success: true, gates });
});

router.get('/pilgrims', (req, res) => {
  const pilgrims = Array.from(store.pilgrims.values()).map(p => ({
    id: p.id, name: p.name, age: p.age, gender: p.gender, groupSize: p.groupSize,
    slotTime: p.slotTime, colorCode: p.colorCode, qrValue: p.qrValue, status: p.status,
    auraPoints: p.auraPoints, badges: p.badges, completedQuests: p.completedQuests,
    assignedGate: p.assignedGate, identityType: p.identityType,
    maskedId: p.identityToken?.maskedId, scarfLifecycle: p.scarfLifecycle, scarfId: p.scarfId,
  }));
  res.json({ success: true, pilgrims });
});

module.exports = router;
