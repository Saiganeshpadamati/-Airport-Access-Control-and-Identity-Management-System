
import { AIRPORT_ZONES, ROLE_ACCESS_MATRIX, MOCK_USERS } from '../constants';
import { AccessLog, AccessRequestResponse, UserRole, AirportZone, UserIdentity, ZoneSecurityLevel, SecurityAlert } from '../types';

export class SecurityService {
  private logs: AccessLog[] = [];
  private alerts: SecurityAlert[] = [];
  private users: UserIdentity[] = [];
  private zones: AirportZone[] = [];
  private listeners: Set<() => void> = new Set();
  
  // Storage for temporary administrative bypasses (Session only)
  private bypasses: Set<string> = new Set();
  private currentUser: UserRole = UserRole.ADMIN;

  constructor() {
    this.users = [...MOCK_USERS];
    this.zones = [...AIRPORT_ZONES];
    this.initializeLogs();
  }

  static simulateHash(badge: string): string {
    let hash = 0;
    for (let i = 0; i < badge.length; i++) {
      hash = ((hash << 5) - hash) + badge.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  }

  private initializeLogs() {
    this.logs = [
      {
        id: 'LOG-8812',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        userId: 'U-001',
        userName: 'Sai Ganesh',
        userRole: UserRole.ADMIN,
        zoneId: 'Z-CRI-02',
        zoneName: 'Main Data Center',
        status: 'GRANTED',
        direction: 'ENTRY',
        reason: 'Valid multi-factor token'
      }
    ];
  }

  setCurrentRole(role: UserRole) {
    this.currentUser = role;
    this.notify();
  }

  getCurrentRole() {
    return this.currentUser;
  }

  getUsers(): UserIdentity[] {
    return [...this.users];
  }

  onboardUser(data: Omit<UserIdentity, 'id' | 'lastVerified' | 'clearanceLevel'>): UserIdentity {
    const newUser: UserIdentity = {
      ...data,
      id: `U-${Math.floor(Math.random() * 900) + 100}`,
      lastVerified: new Date().toISOString().split('T')[0],
      clearanceLevel: ZoneSecurityLevel.PUBLIC
    };
    this.users = [newUser, ...this.users];
    this.notify();
    return newUser;
  }

  updateUserStatus(userId: string, status: UserIdentity['status']): void {
    this.users = this.users.map(u => u.id === userId ? { ...u, status } : u);
    this.notify();
  }

  // "Fix the problem" - Method to renew badge and restore access
  renewBadge(userId: string): void {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    this.users = this.users.map(u => 
      u.id === userId 
        ? { ...u, expiryDate: nextYear.toISOString().split('T')[0], status: 'ACTIVE' } 
        : u
    );
    this.notify();
  }

  // "Fix the problem" - Administrative override for specific access denial
  grantBypass(userId: string, zoneId: string): void {
    this.bypasses.add(`${userId}:${zoneId}`);
    this.notify();
  }

  deleteUser(userId: string): void {
    this.users = this.users.filter(u => u.id !== userId);
    this.notify();
  }

  getZones(): AirportZone[] {
    return [...this.zones];
  }

  async requestAccess(userId: string, zoneId: string, direction: 'ENTRY' | 'EXIT' = 'ENTRY'): Promise<AccessRequestResponse> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const user = this.users.find(u => u.id === userId);
    const zone = this.zones.find(z => z.id === zoneId);

    if (!user || !zone) {
      return { allowed: false, reason: 'Registry mismatch', auditId: 'E-404' };
    }

    // CHECK FOR BYPASS FIRST
    if (this.bypasses.has(`${userId}:${zoneId}`)) {
      const reason = "Administrative Override: Access granted by remote command center.";
      this.logEvent(user, zone, 'GRANTED', direction, reason);
      // Remove bypass after use for security
      this.bypasses.delete(`${userId}:${zoneId}`);
      return { allowed: true, reason, auditId: `BYP-${Date.now()}` };
    }

    const now = new Date();
    const expiry = new Date(user.expiryDate);
    const isExpired = expiry < now;

    if (isExpired) {
      const reason = `Security Token Expired (Valid until: ${user.expiryDate})`;
      this.logEvent(user, zone, 'DENIED', direction, reason);
      this.generateAlert('EXPIRED_PASS', 'HIGH', reason, user, zone);
      return { allowed: false, reason: reason + ". Renew badge in Registry.", auditId: `AUD-${Date.now()}` };
    }

    if (user.status !== 'ACTIVE') {
      const reason = `Identity status is ${user.status}. Access revoked.`;
      this.logEvent(user, zone, 'DENIED', direction, reason);
      this.generateAlert('UNAUTHORIZED_ATTEMPT', 'CRITICAL', `Suspended user attempted ${direction}`, user, zone);
      return { allowed: false, reason: reason + ". Toggle status in Registry.", auditId: `AUD-${Date.now()}` };
    }

    const allowedZonesForRole = ROLE_ACCESS_MATRIX[user.role] || [];
    const isAllowed = allowedZonesForRole.includes(zone.id);

    if (!isAllowed) {
      const reason = `Role ${user.role} is not authorized for ${zone.name}.`;
      this.logEvent(user, zone, 'DENIED', direction, reason);
      
      if (zone.securityLevel >= ZoneSecurityLevel.RESTRICTED) {
        this.generateAlert('RESTRICTED_BREACH', 'CRITICAL', `Unauthorized attempt in ${zone.classification} area: ${zone.name}`, user, zone);
      } else {
        this.generateAlert('UNAUTHORIZED_ATTEMPT', 'MEDIUM', reason, user, zone);
      }
      
      return { allowed: false, reason: reason + ". Request administrative elevation.", auditId: `AUD-${Date.now()}` };
    }

    const reason = `Authorization Confirmed: ${user.role} mapped to ${zone.name} permissions.`;
    this.logEvent(user, zone, 'GRANTED', direction, reason);
    return { allowed: true, reason, auditId: `AUD-${Date.now()}` };
  }

  private logEvent(user: UserIdentity, zone: AirportZone, status: 'GRANTED' | 'DENIED', direction: 'ENTRY' | 'EXIT', reason: string) {
    const newLog: AccessLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      zoneId: zone.id,
      zoneName: zone.name,
      status,
      direction,
      reason
    };
    (newLog as any).signature = btoa(newLog.id + newLog.timestamp + "SKYGUARD_PRIVATE_KEY");
    
    this.logs = [newLog, ...this.logs];
    this.notify();
  }

  private generateAlert(type: SecurityAlert['type'], severity: SecurityAlert['severity'], message: string, user: UserIdentity, zone: AirportZone) {
    const alert: SecurityAlert = {
      id: `ALT-${Date.now()}`,
      type,
      severity,
      message,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.fullName,
      zoneId: zone.id,
      zoneName: zone.name,
      resolved: false
    };
    this.alerts = [alert, ...this.alerts];
    this.notify();
  }

  getLogs(): AccessLog[] {
    if (this.currentUser === UserRole.ADMIN) return [...this.logs];
    return this.logs.filter(l => l.status === 'DENIED' || l.userRole !== UserRole.ADMIN);
  }

  getAlerts(): SecurityAlert[] {
    return [...this.alerts];
  }

  resolveAlert(alertId: string) {
    this.alerts = this.alerts.map(a => a.id === alertId ? { ...a, resolved: true } : a);
    this.notify();
  }

  getDashboardStats() {
    const deniedCount = this.logs.filter(l => l.status === 'DENIED').length;
    const unresolvedAlerts = this.alerts.filter(a => !a.resolved).length;
    return {
      activeUsers: this.users.filter(u => u.status === 'ACTIVE').length,
      totalZones: this.zones.length,
      totalLogs: this.logs.length,
      alerts: unresolvedAlerts,
      denials: deniedCount
    };
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const securityService = new SecurityService();
