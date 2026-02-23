
export type ColorCode = 'RED' | 'BLUE' | 'GREEN' | 'ORANGE';
export type AlertStatus = 'ACTIVE' | 'EN_ROUTE' | 'RESOLVED';
export type Language = 'EN' | 'HI' | 'TE';
export type UserRole = 'ADMIN' | 'REGISTERER' | 'EXIT_OFFICER' | 'PILGRIM' | 'NONE';

export interface Temple {
  id: string;
  name: string;
  location: string;
  themeColor: string;
  secondaryColor: string;
  icon: string;
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
}

export interface Transaction {
  id: string;
  hash: string;
  timestamp: number;
  type: 'ENTRY' | 'EXIT' | 'DONATION' | 'VIP_ENTRY' | 'EMERGENCY_SOS' | 'EMERGENCY_ACTION';
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
