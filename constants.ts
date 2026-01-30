
import { AirportZone, UserRole, ZoneSecurityLevel, UserIdentity, RolePermissionsMatrix } from './types';

export const AIRPORT_ZONES: AirportZone[] = [
  { id: 'Z-PUB-01', name: 'Main Parking P1', classification: 'Public', securityLevel: ZoneSecurityLevel.PUBLIC, description: 'General public parking area.', sensitivity: 'Low' },
  { id: 'Z-PUB-02', name: 'Arrivals Hall', classification: 'Public', securityLevel: ZoneSecurityLevel.PUBLIC, description: 'Public welcoming area for incoming flights.', sensitivity: 'Low' },
  { id: 'Z-CON-01', name: 'Check-in Counters', classification: 'Controlled', securityLevel: ZoneSecurityLevel.CONTROLLED, description: 'Staff-managed passenger processing area.', sensitivity: 'Medium' },
  { id: 'Z-CON-02', name: 'Baggage Claim (Staff)', classification: 'Controlled', securityLevel: ZoneSecurityLevel.CONTROLLED, description: 'Secured area for ground staff handling arrivals.', sensitivity: 'Medium' },
  { id: 'Z-RES-01', name: 'Baggage Handling System', classification: 'Restricted', securityLevel: ZoneSecurityLevel.RESTRICTED, description: 'Automated conveyor and sorting facility.', sensitivity: 'High' },
  { id: 'Z-RES-02', name: 'The Apron', classification: 'Restricted', securityLevel: ZoneSecurityLevel.RESTRICTED, description: 'Aircraft parking and loading zone.', sensitivity: 'High' },
  { id: 'Z-CRI-01', name: 'ATC Tower', classification: 'Critical', securityLevel: ZoneSecurityLevel.CRITICAL, description: 'Air Traffic Control operations hub.', sensitivity: 'Extreme' },
  { id: 'Z-CRI-02', name: 'Main Data Center', classification: 'Critical', securityLevel: ZoneSecurityLevel.CRITICAL, description: 'Core airport IT infrastructure.', sensitivity: 'Extreme' },
];

// Setting future dates for most users to ensure they work by default
const oneYearFuture = new Date();
oneYearFuture.setFullYear(oneYearFuture.getFullYear() + 1);
const dateStr = oneYearFuture.toISOString().split('T')[0];

export const MOCK_USERS: UserIdentity[] = [
  { id: 'U-001', fullName: 'Sai Ganesh', role: UserRole.ADMIN, status: 'ACTIVE', badgeNumber: 'ADM-8821', lastVerified: '2024-05-15', expiryDate: dateStr, isContractor: false, clearanceLevel: ZoneSecurityLevel.CRITICAL },
  { id: 'U-002', fullName: 'Ananya Sharma', role: UserRole.SECURITY, status: 'ACTIVE', badgeNumber: 'SEC-4410', lastVerified: '2024-05-14', expiryDate: dateStr, isContractor: false, clearanceLevel: ZoneSecurityLevel.CRITICAL },
  { id: 'U-003', fullName: 'Rajesh Kumar', role: UserRole.ATC, status: 'ACTIVE', badgeNumber: 'ATC-1102', lastVerified: '2024-05-15', expiryDate: dateStr, isContractor: false, clearanceLevel: ZoneSecurityLevel.CRITICAL },
  { id: 'U-004', fullName: 'Priya Patel', role: UserRole.GROUND, status: 'ACTIVE', badgeNumber: 'GND-5592', lastVerified: '2024-05-10', expiryDate: dateStr, isContractor: false, clearanceLevel: ZoneSecurityLevel.RESTRICTED },
  { id: 'U-005', fullName: 'Amit Singh', role: UserRole.MAINTENANCE, status: 'ACTIVE', badgeNumber: 'MNT-2234', lastVerified: '2024-05-12', expiryDate: '2024-01-01', isContractor: true, clearanceLevel: ZoneSecurityLevel.RESTRICTED }, // Intentionally Expired for Testing
  { id: 'U-006', fullName: 'Kavita Reddy', role: UserRole.AIRLINE, status: 'ACTIVE', badgeNumber: 'ALN-9981', lastVerified: '2024-05-15', expiryDate: dateStr, isContractor: false, clearanceLevel: ZoneSecurityLevel.CONTROLLED },
  { id: 'U-007', fullName: 'Arjun Gupta', role: UserRole.VISITOR, status: 'ACTIVE', badgeNumber: 'VST-0001', lastVerified: '2024-05-15', expiryDate: dateStr, isContractor: true, clearanceLevel: ZoneSecurityLevel.PUBLIC },
];

export const ROLE_ACCESS_MATRIX: RolePermissionsMatrix = {
  [UserRole.ADMIN]: AIRPORT_ZONES.map(z => z.id),
  [UserRole.SECURITY]: AIRPORT_ZONES.map(z => z.id),
  [UserRole.ATC]: ['Z-PUB-01', 'Z-PUB-02', 'Z-CON-01', 'Z-CON-02', 'Z-CRI-01'],
  [UserRole.IT]: ['Z-PUB-01', 'Z-PUB-02', 'Z-CON-01', 'Z-CRI-02', 'Z-CRI-01'],
  [UserRole.MAINTENANCE]: ['Z-PUB-01', 'Z-PUB-02', 'Z-CON-01', 'Z-CON-02', 'Z-RES-01', 'Z-RES-02'],
  [UserRole.GROUND]: ['Z-PUB-01', 'Z-PUB-02', 'Z-CON-01', 'Z-CON-02', 'Z-RES-01', 'Z-RES-02'],
  [UserRole.AIRLINE]: ['Z-PUB-01', 'Z-PUB-02', 'Z-CON-01', 'Z-CON-02'],
  [UserRole.VISITOR]: ['Z-PUB-01', 'Z-PUB-02'],
};

export const ROLE_PERMISSIONS_LEVELS: Record<UserRole, ZoneSecurityLevel> = {
  [UserRole.ADMIN]: ZoneSecurityLevel.CRITICAL,
  [UserRole.SECURITY]: ZoneSecurityLevel.CRITICAL,
  [UserRole.ATC]: ZoneSecurityLevel.CRITICAL,
  [UserRole.IT]: ZoneSecurityLevel.CRITICAL,
  [UserRole.MAINTENANCE]: ZoneSecurityLevel.RESTRICTED,
  [UserRole.GROUND]: ZoneSecurityLevel.RESTRICTED,
  [UserRole.AIRLINE]: ZoneSecurityLevel.CONTROLLED,
  [UserRole.VISITOR]: ZoneSecurityLevel.PUBLIC,
};
