const API_BASE = 'http://localhost:5000/api';

async function request(path: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers as any },
      ...options,
    });
    return await res.json();
  } catch (err) {
    console.error(`API Error [${path}]:`, err);
    return { success: false, error: 'Network error. Backend may be offline.', offline: true };
  }
}

export const api = {
  // Auth
  sendAadhaarOTP: (aadhaarNumber: string) =>
    request('/auth/aadhaar-otp', { method: 'POST', body: JSON.stringify({ aadhaarNumber }) }),
  verifyAadhaarOTP: (sessionId: string, otp: string) =>
    request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ sessionId, otp }) }),
  getSessionStatus: (sessionId: string) =>
    request(`/auth/session/${sessionId}`),
  validatePassport: (passportNumber: string, country: string, name?: string) =>
    request('/auth/passport', { method: 'POST', body: JSON.stringify({ passportNumber, country, name }) }),
  registerPilgrim: (data: any) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  batchRegister: (data: any) =>
    request('/auth/batch-register', { method: 'POST', body: JSON.stringify(data) }),

  // Biometric
  captureIris: (stationId: string, tokenId?: string) =>
    request('/biometric/capture', { method: 'POST', body: JSON.stringify({ stationId, tokenId }) }),
  verifyIris: (tokenId: string, stationId?: string) =>
    request('/biometric/verify', { method: 'POST', body: JSON.stringify({ tokenId, stationId }) }),
  getStations: () => request('/biometric/stations'),

  // Scarf
  linkScarf: (tokenId: string, slotTime?: string, gateId?: string, colorCode?: string) =>
    request('/scarf/link', { method: 'POST', body: JSON.stringify({ tokenId, slotTime, gateId, colorCode }) }),
  activateScarf: (scarfId: string) =>
    request('/scarf/activate', { method: 'POST', body: JSON.stringify({ scarfId }) }),
  delinkScarf: (scarfId: string) =>
    request('/scarf/delink', { method: 'POST', body: JSON.stringify({ scarfId }) }),
  getScarfLifecycle: () => request('/scarves/lifecycle'),
  getScarfByToken: (tokenId: string) => request(`/scarf/${tokenId}`),

  // Entry / Exit
  validateEntry: (qrPayload: string, gateId?: string) =>
    request('/entry/validate', { method: 'POST', body: JSON.stringify({ qrPayload, gateId }) }),
  verifyExit: (scarfId: string, gateId?: string) =>
    request('/exit/verify', { method: 'POST', body: JSON.stringify({ scarfId, gateId }) }),

  // Dashboard
  getMetrics: () => request('/dashboard/metrics'),
  getGateStatus: () => request('/dashboard/gates'),
  getPilgrims: () => request('/dashboard/pilgrims'),

  // System
  getSystemHealth: () => request('/system/health'),
};
