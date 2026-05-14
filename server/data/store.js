// In-memory data store - simulates database
const store = {
  pilgrims: new Map(),
  identityTokens: new Map(),
  irisHashes: new Map(),
  scarves: new Map(),
  sessions: new Map(), // Aadhaar OTP sessions
  gates: new Map(),
  stations: new Map(),
  transactions: [],
  batches: new Map(),
  systemMetrics: {
    totalPilgrims: 0,
    activeGates: 5,
    avgLatency: 3,
    peakLoad: 0,
    serverCount: 4,
    edgeNodes: 5,
    uptime: Date.now(),
    totalProcessed: 0,
    throughputPerMinute: 0,
  },

  // Initialize default gate nodes
  init() {
    const gates = [
      { gateId: 'GATE-A', zone: 'North', status: 'ACTIVE', throughput: 42, queueDepth: 12, latency: 3, lastSync: Date.now(), isOffline: false },
      { gateId: 'GATE-B', zone: 'North', status: 'ACTIVE', throughput: 38, queueDepth: 8, latency: 4, lastSync: Date.now(), isOffline: false },
      { gateId: 'GATE-C', zone: 'South', status: 'ACTIVE', throughput: 45, queueDepth: 15, latency: 2, lastSync: Date.now(), isOffline: false },
      { gateId: 'GATE-D', zone: 'East', status: 'ACTIVE', throughput: 35, queueDepth: 5, latency: 5, lastSync: Date.now(), isOffline: false },
      { gateId: 'GATE-E', zone: 'East', status: 'IDLE', throughput: 0, queueDepth: 0, latency: 3, lastSync: Date.now(), isOffline: false },
    ];
    gates.forEach(g => this.gates.set(g.gateId, g));

    const stations = [
      { stationId: 'IRIS-01', status: 'ACTIVE', officerId: 'OFF-001', queueCount: 4, avgTime: 8 },
      { stationId: 'IRIS-02', status: 'ACTIVE', officerId: 'OFF-002', queueCount: 6, avgTime: 7 },
      { stationId: 'IRIS-03', status: 'ACTIVE', officerId: 'OFF-003', queueCount: 3, avgTime: 9 },
      { stationId: 'IRIS-04', status: 'IDLE', officerId: null, queueCount: 0, avgTime: 0 },
      { stationId: 'IRIS-05', status: 'MAINTENANCE', officerId: null, queueCount: 0, avgTime: 0 },
    ];
    stations.forEach(s => this.stations.set(s.stationId, s));

    // Initialize scarf pool (200 scarves)
    for (let i = 1; i <= 200; i++) {
      const scarfId = `SCF-${String(i).padStart(4, '0')}`;
      this.scarves.set(scarfId, {
        scarfId,
        status: 'READY',
        linkedTokenId: null,
        linkedAt: null,
        delinkedAt: null,
        cycleCount: Math.floor(Math.random() * 10),
        colorCode: ['RED', 'ORANGE', 'YELLOW', 'BROWN'][i % 4],
      });
    }
  },

  // Get available scarf
  getAvailableScarf(colorCode) {
    for (const [id, scarf] of this.scarves) {
      if (scarf.status === 'READY' && scarf.colorCode === colorCode) return scarf;
    }
    // Fallback: any ready scarf
    for (const [id, scarf] of this.scarves) {
      if (scarf.status === 'READY') return scarf;
    }
    return null;
  },

  // Add transaction
  addTransaction(tx) {
    this.transactions.push({ ...tx, timestamp: Date.now(), id: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` });
  },

  // Get lifecycle counts
  getScarfLifecycleCounts() {
    const counts = { UNLINKED: 0, LINKED: 0, ACTIVE: 0, DELINKED: 0, SANITIZING: 0, READY: 0 };
    for (const [, scarf] of this.scarves) {
      counts[scarf.status] = (counts[scarf.status] || 0) + 1;
    }
    return counts;
  }
};

store.init();

module.exports = store;
