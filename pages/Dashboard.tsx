
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { securityService } from '../services/securityService';
import { AccessLog, UserRole } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(securityService.getDashboardStats());
  const [recentLogs, setRecentLogs] = useState<AccessLog[]>(securityService.getLogs().slice(0, 3));
  const [currentRole, setCurrentRole] = useState(securityService.getCurrentRole());
  
  useEffect(() => {
    return securityService.subscribe(() => {
      setStats(securityService.getDashboardStats());
      setRecentLogs(securityService.getLogs().slice(0, 3));
      setCurrentRole(securityService.getCurrentRole());
    });
  }, []);

  const isAdmin = currentRole === UserRole.ADMIN;

  return (
    <div className="animate-in fade-in duration-700 pb-12">
      {/* Role Switcher Simulation (For interviewers to see both views) */}
      <div className="bg-slate-800 text-white py-2 px-10 flex items-center justify-between text-[10px] font-bold tracking-widest uppercase">
        <div className="flex items-center space-x-3">
          <span>Simulation View:</span>
          <button 
            onClick={() => securityService.setCurrentRole(UserRole.ADMIN)}
            className={`px-3 py-1 rounded-md transition-colors ${isAdmin ? 'bg-blue-600 text-white' : 'hover:text-blue-400'}`}
          >
            Admin (Full Access)
          </button>
          <button 
            onClick={() => securityService.setCurrentRole(UserRole.SECURITY)}
            className={`px-3 py-1 rounded-md transition-colors ${!isAdmin ? 'bg-blue-600 text-white' : 'hover:text-blue-400'}`}
          >
            Security Officer (Restricted)
          </button>
        </div>
        <div className="text-slate-500">
          Enforced Policy: {isAdmin ? 'FULL_HIERARCHY_VISIBILITY' : 'INCIDENT_RESPONSE_ONLY'}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[440px] flex items-center px-16 lg:px-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&q=80&w=2400" 
            alt="Aircraft Takeoff" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-4xl">
          <div className="inline-block px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black tracking-[0.2em] rounded-full mb-6 uppercase">
            SkyGuard: Global Hub Command
          </div>
          <h1 className="text-6xl font-black text-white leading-[1.1] drop-shadow-2xl">
            Airport Security Ops &<br />
            <span className="text-blue-100">Access Management</span>
          </h1>
          
          <div className="mt-12 flex flex-wrap gap-4">
            <FeatureBadge icon={<VerifyIcon />} label="Real-Time Audit" />
            <FeatureBadge icon={<RBACIcon />} label="Encryption Vault" />
            <FeatureBadge icon={<AlertIcon />} label="Threat Monitor" />
            <FeatureBadge icon={<SecureIcon />} label="Identity Mesh" />
          </div>
        </div>
      </section>

      {/* Main Action Grid */}
      <div className="max-w-[1440px] mx-auto -mt-16 relative z-20 px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Register - Only Admin can onboard */}
          <ActionCard 
            title="REGISTER NEW USER" 
            icon={<UserIcon />}
            buttonText={isAdmin ? "Onboard Staff" : "View Registry"}
            onClick={() => navigate('/identities')}
            accentColor="blue"
          />

          {/* Card 2: Monitor Logs (Security Centric) */}
          <div className="bg-[#0b1120] rounded-3xl p-8 shadow-2xl text-white flex flex-col justify-between border border-slate-800 hover:translate-y-[-4px] transition-all duration-300">
            <div>
              <div className="flex items-center space-x-2 mb-8">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <h3 className="text-[10px] font-black tracking-[0.2em] opacity-60 uppercase">Live Security Feed</h3>
              </div>
              <div className="flex items-center justify-center mb-10">
                <ShieldIcon />
              </div>
              <div className="space-y-4 text-center">
                <p className="text-5xl font-black text-white">{stats.totalLogs}</p>
                <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 font-bold">Total Access Events</p>
                <div className="pt-2">
                   <span className="text-red-400 text-[10px] font-black px-4 py-1.5 bg-red-500/10 rounded-full border border-red-500/20 uppercase tracking-widest">
                     {stats.denials} Unauthorized Blocked
                   </span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/audit')}
              className="mt-8 w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
            >
              System Audit Logs
            </button>
          </div>

          {/* Card 3: Restricted Zones */}
          <ActionCard 
            title="RESTRICTED ZONE MAP" 
            icon={<LockIcon />}
            buttonText="Configure Zones"
            onClick={() => navigate('/access')}
            accentColor="blue"
            list={['ATC Tower Hub', 'Apron / Runway 09', 'Fueling Data Center']}
          />

          {/* Card 4: Reports */}
          <ActionCard 
            title="SECURITY ANALYTICS" 
            buttonText="Export Reports"
            onClick={() => navigate('/architecture')}
            accentColor="blue"
            isReport
          />
        </div>

        {/* Intelligence Split-View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-16">
          {/* Recent Alerts */}
          <div className="space-y-6">
            <h3 className="text-slate-800 font-black text-xs uppercase tracking-[0.4em] flex items-center space-x-3">
              <span className="w-10 h-0.5 bg-blue-600"></span>
              <span>Recent Activity Flow</span>
            </h3>
            <div className="space-y-4">
              {recentLogs.map((log) => (
                <div key={log.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                  <div className="flex items-center space-x-5">
                    <img src={`https://picsum.photos/seed/${log.userId}/80/80`} alt="" className="w-12 h-12 rounded-2xl border-2 border-slate-50 shadow-sm" />
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{log.userName}</p>
                      <div className="flex items-center space-x-3 mt-1.5">
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest px-2 py-0.5 bg-blue-50 rounded-md">
                          {log.userRole.split('_')[0]}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{log.zoneName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className={`text-[10px] font-black uppercase mb-1.5 tracking-widest ${log.status === 'GRANTED' ? 'text-green-500' : 'text-red-500'}`}>
                      {log.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tabular-nums">15:42:01</span>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => navigate('/audit')}
                className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-blue-600 transition-colors"
              >
                View Full Ledger →
              </button>
            </div>
          </div>

          {/* Critical Security System Monitoring */}
          <div className="space-y-6">
            <h3 className="text-slate-800 font-black text-xs uppercase tracking-[0.4em] flex items-center space-x-3">
              <span className="w-10 h-0.5 bg-red-600"></span>
              <span>Threat Intelligence Feed</span>
            </h3>
            <div className="space-y-4">
              <div className="bg-red-50 p-6 rounded-3xl border border-red-100 animate-pulse">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Active Security Incident</span>
                  <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">Lvl 4 Alert</span>
                </div>
                <h4 className="font-black text-red-800 text-sm uppercase mb-1">Unauthorized Data Center Access</h4>
                <p className="text-xs text-red-700/80">Suspected badge cloning attempt at Z-CRI-02. Security Team dispatched.</p>
              </div>
              
              <SecurityEventItem 
                type="Credential Mismatch" 
                detail="Sai Ganesh blocked at Terminal A (Revoked Pass)" 
                status="Critical" 
              />
              <SecurityEventItem 
                type="Biometric Error" 
                detail="3 Consecutive failed facial matches for U-009" 
                status="High" 
              />
              <SecurityEventItem 
                type="Perimeter Alert" 
                detail="Gate 12 secondary lock integrity check failed" 
                status="System" 
                isWarning
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Dashboard Sub-components ---

const FeatureBadge: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl flex items-center space-x-3 text-white shadow-2xl hover:bg-slate-900/80 transition-all cursor-default group">
    <div className="text-blue-400 group-hover:scale-110 transition-transform">{icon}</div>
    <span className="text-[10px] font-black tracking-[0.2em] uppercase">{label}</span>
  </div>
);

const ActionCard: React.FC<{ 
  title: string; 
  icon?: React.ReactNode; 
  buttonText: string; 
  onClick: () => void;
  accentColor: string;
  list?: string[];
  isReport?: boolean;
}> = ({ title, icon, buttonText, onClick, list, isReport }) => (
  <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col justify-between hover:shadow-2xl hover:translate-y-[-6px] transition-all duration-300">
    <div>
      <h3 className="text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase mb-10">
        {title}
      </h3>
      
      {icon && <div className="flex justify-center mb-10">{icon}</div>}
      
      {list && (
        <div className="space-y-4 mb-10">
          {list.map((item, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
              <span className="text-[10px] text-slate-700 font-black uppercase tracking-widest">{item}</span>
            </div>
          ))}
        </div>
      )}

      {isReport && (
        <div className="space-y-5 mb-10">
          <ReportCheckItem label="Monthly Access Audit" />
          <ReportCheckItem label="Identity Risk Scorecard" />
          <ReportCheckItem label="Zero-Trust Compliance" />
        </div>
      )}
    </div>
    
    <button 
      onClick={onClick}
      className="bg-slate-50 text-slate-800 py-4 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm"
    >
      {buttonText}
    </button>
  </div>
);

const ReportCheckItem: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors">
    <div className="flex items-center space-x-4">
      <div className="w-5 h-5 border-2 border-slate-200 rounded-lg flex items-center justify-center text-blue-600 group-hover:border-blue-500 transition-colors">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
      </div>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-800">{label}</span>
    </div>
    <span className="text-blue-500 font-black opacity-0 group-hover:opacity-100 transition-opacity">»</span>
  </div>
);

const SecurityEventItem: React.FC<{ type: string; detail: string; status: string; isWarning?: boolean }> = ({ type, detail, status, isWarning }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:bg-slate-50 transition-colors">
    <div className="flex items-center space-x-5">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isWarning ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{type}</p>
        <p className="text-[10px] text-slate-400 font-bold mt-1 leading-tight">{detail}</p>
      </div>
    </div>
    <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${
      isWarning ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-red-50 text-red-600 border-red-200'
    }`}>
      {status}
    </div>
  </div>
);

// --- Styled Icons ---

const VerifyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
);
const RBACIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);
const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
);
const SecureIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);

const UserIcon = () => (
  <div className="w-32 h-20 bg-blue-50 rounded-3xl flex flex-col items-center justify-center border border-blue-100 relative group overflow-hidden">
    <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="w-9 h-9 rounded-full bg-blue-200 mb-2 border-2 border-white shadow-sm"></div>
    <div className="w-14 h-4 bg-blue-200 rounded-lg"></div>
  </div>
);

const ShieldIcon = () => (
  <div className="w-20 h-24 bg-blue-500/10 border-2 border-blue-500/20 rounded-[2rem] flex items-center justify-center shadow-inner group">
    <svg className="w-12 h-12 text-blue-400 drop-shadow-xl group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  </div>
);

const LockIcon = () => (
  <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center group shadow-sm">
    <svg className="w-10 h-10 text-blue-600 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  </div>
);

export default Dashboard;
