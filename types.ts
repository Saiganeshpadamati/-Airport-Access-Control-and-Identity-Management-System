
export enum ZoneSecurityLevel {
  PUBLIC = 1,
  CONTROLLED = 2,
  RESTRICTED = 3,
  CRITICAL = 4
}

export type ZoneClassification = 'Public' | 'Controlled' | 'Restricted' | 'Critical';

export interface AirportZone {
  id: string;
  name: string;
  classification: ZoneClassification;
  securityLevel: ZoneSecurityLevel;
  description: string;
  sensitivity: 'Low' | 'Medium' | 'High' | 'Extreme';
}

export enum UserRole {
  ADMIN = 'AIRPORT_ADMIN',
  SECURITY = 'SECURITY_OFFICER',
  ATC = 'ATC_STAFF',
  GROUND = 'GROUND_HANDLING',
  MAINTENANCE = 'MAINTENANCE_ENGINEER',
  IT = 'IT_ADMIN',
  AIRLINE = 'AIRLINE_STAFF',
  VISITOR = 'VISITOR'
}

export interface UserIdentity {
  id: string;
  fullName: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  badgeNumber: string;
  lastVerified: string;
  expiryDate: string;
  isContractor: boolean;
  clearanceLevel: ZoneSecurityLevel;
}

export interface AccessLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  zoneId: string;
  zoneName: string;
  status: 'GRANTED' | 'DENIED';
  direction: 'ENTRY' | 'EXIT';
  reason?: string;
}

export interface SecurityAlert {
  id: string;
  type: 'UNAUTHORIZED_ATTEMPT' | 'RESTRICTED_BREACH' | 'EXPIRED_PASS' | 'MULTIPLE_FAILURES';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  timestamp: string;
  message: string;
  userId: string;
  userName: string;
  zoneId: string;
  zoneName: string;
  resolved: boolean;
}

export interface AccessRequestResponse {
  allowed: boolean;
  reason: string;
  auditId: string;
}

/**
 * Granular Permission Matrix Type
 */
export type RolePermissionsMatrix = Record<UserRole, string[]>;
