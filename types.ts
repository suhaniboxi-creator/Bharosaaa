
export type ColorCode = 'RED' | 'ORANGE' | 'YELLOW' | 'BROWN';
export type AlertStatus = 'ACTIVE' | 'EN_ROUTE' | 'RESOLVED';
export type Language = 'EN' | 'HI' | 'TE';
export type UserRole = 'ADMIN' | 'REGISTERER' | 'EXIT_OFFICER' | 'BIOMETRIC_OFFICER' | 'PILGRIM' | 'NONE';
export type IdentityType = 'AADHAAR' | 'PASSPORT';
export type BiometricType = 'IRIS';
export type ScarfLifecycleStatus = 'UNLINKED' | 'LINKED' | 'ACTIVE' | 'DELINKED' | 'SANITIZING' | 'READY';

export interface Temple {
  id: string;
  name: string;
  location: string;
  themeColor: string;
  secondaryColor: string;
  icon: string;
}

export interface IdentityToken {
  tokenId: string;
  maskedId: string;
  hashValue?: string;
  type: IdentityType;
  nationality?: string;
  verified: boolean;
  timestamp: number;
}

export interface IrisHash {
  hashValue: string;
  quality: number;
  capturedAt: number;
  stationId: string;
  type: 'IRIS';
}

export interface ScarfUnit {
  scarfId: string;
  status: ScarfLifecycleStatus;
  linkedTokenId?: string | null;
  linkedAt?: number | null;
  delinkedAt?: number | null;
  cycleCount: number;
  colorCode?: ColorCode;
  slotTime?: string;
  gateId?: string;
}

export interface GateNode {
  gateId: string;
  zone: string;
  status: 'ACTIVE' | 'IDLE' | 'MAINTENANCE' | 'OFFLINE';
  throughput: number;
  queueDepth: number;
  latency: number;
  lastSync: number;
  isOffline: boolean;
}

export interface VerificationStation {
  stationId: string;
  status: 'ACTIVE' | 'IDLE' | 'MAINTENANCE';
  officerId: string | null;
  queueCount: number;
  avgTime: number;
}

export interface EmergencyAlert {
  id: string;
  pilgrimId: string;
  pilgrimName: string;
  timestamp: number;
  status: AlertStatus;
  assignedTeam?: string;
  location: string;
}

export interface Pilgrim {
  id: string;
  name: string;
  age: number;
  gender: string;
  groupSize: number;
  slotTime: string;
  colorCode: ColorCode;
  qrValue: string;
  status: 'PENDING' | 'CHECKED_IN' | 'COMPLETED';
  auraPoints: number;
  badges: string[];
  completedQuests: string[];
  assignedGate?: string;
  identityToken?: IdentityToken;
  identityType?: IdentityType;
  nationality?: string;
  irisHash?: IrisHash;
  scarfLifecycle?: ScarfLifecycleStatus;
  scarfId?: string;
  verifiedAt?: number;
  entryGateId?: string;
  exitGateId?: string;
  batchId?: string;
  maskedId?: string;
}

export interface Transaction {
  id: string;
  hash: string;
  timestamp: number;
  type: 'ENTRY' | 'EXIT' | 'DONATION' | 'VIP_ENTRY' | 'EMERGENCY_SOS' | 'EMERGENCY_ACTION' | 'SCARF_LINK' | 'SCARF_DELINK' | 'BIOMETRIC_MATCH' | 'BIOMETRIC_MISMATCH' | 'SECURITY_ALERT' | 'SCARF_ACTIVATE';
  details: string;
  userId: string;
  templeId: string;
}

export interface ZoneStatus {
  name: string;
  capacity: number;
  currentCount: number;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

export interface BatchRegistration {
  batchId: string;
  leaderId: string;
  members: string[];
  slotTime: string;
  gate: string;
  createdAt: number;
}

export interface SystemMetrics {
  totalRegistered: number;
  activePilgrims: number;
  completedPilgrims: number;
  pendingPilgrims: number;
  activeGates: number;
  totalGates: number;
  totalThroughput: number;
  throughputPerMinute: number;
  activeStations: number;
  totalStations: number;
  avgWaitTime: number;
  peakLoad: number;
  scarfCounts: Record<ScarfLifecycleStatus, number>;
  scarfAvailable: number;
  uptime: number;
  serverCount: number;
  edgeNodes: number;
}

export interface MapPOI {
  id: string;
  x: number;
  y: number;
  label: string;
  icon: string;
  type: 'entry' | 'exit' | 'helpdesk' | 'viewpoint' | 'visit' | 'facility' | 'security' | 'smart' | 'sanctum';
  color: string;
  congestion: 'low' | 'moderate' | 'high';
  description?: string;
  fact?: string;
}
