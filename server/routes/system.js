const express = require('express');
const router = express.Router();
const store = require('../data/store');

router.get('/health', (req, res) => {
  const gates = Array.from(store.gates.values());
  const stations = Array.from(store.stations.values());
  res.json({
    success: true,
    infrastructure: {
      servers: [
        { id: 'SRV-01', status: 'ACTIVE', load: 42, region: 'ap-south-1', role: 'primary' },
        { id: 'SRV-02', status: 'ACTIVE', load: 38, region: 'ap-south-1', role: 'replica' },
        { id: 'SRV-03', status: 'ACTIVE', load: 55, region: 'ap-south-2', role: 'replica' },
        { id: 'SRV-04', status: 'STANDBY', load: 0, region: 'ap-south-2', role: 'failover' },
      ],
      loadBalancer: { status: 'ACTIVE', algorithm: 'round-robin', activeConnections: 1247, requestsPerSec: 342 },
      edgeNodes: gates.map(g => ({
        nodeId: `EDGE-${g.gateId}`, gateId: g.gateId, zone: g.zone, status: g.isOffline ? 'OFFLINE' : 'ACTIVE',
        latency: g.latency, uptime: 99.97, lastSync: g.lastSync, pendingSyncs: g.isOffline ? Math.floor(Math.random() * 50) : 0,
        offlineCapable: true,
      })),
      zones: [
        { name: 'North Zone', gates: gates.filter(g => g.zone === 'North').map(g => g.gateId), status: 'OPTIMAL', capacity: 78 },
        { name: 'South Zone', gates: gates.filter(g => g.zone === 'South').map(g => g.gateId), status: 'OPTIMAL', capacity: 65 },
        { name: 'East Zone', gates: gates.filter(g => g.zone === 'East').map(g => g.gateId), status: 'MODERATE', capacity: 45 },
      ],
    },
    security: {
      encryption: 'AES-256-CBC', hashing: 'SHA-256', biometricStorage: 'HASH-ONLY',
      rawDataStored: false, compliance: ['DPDP Act 2023', 'ISO 27001'],
      dataRetention: 'Auto-delete on exit', tokenEngine: 'Active',
    },
    biometricStations: stations,
    performance: {
      avgResponseTime: '12ms', p99ResponseTime: '45ms',
      requestsPerMinute: 2840, errorRate: '0.02%',
      autoScaleThreshold: '80%', currentScale: '4/8 servers',
    },
  });
});

module.exports = router;
