
import React, { useState, useEffect } from 'react';
import { securityService } from '../services/securityService';
import { AccessRequestResponse, UserIdentity, AirportZone } from '../types';

const AccessControl: React.FC = () => {
  const [users, setUsers] = useState<UserIdentity[]>(securityService.getUsers());
  const [zones, setZones] = useState<AirportZone[]>(securityService.getZones());
  
  const [selectedUser, setSelectedUser] = useState<UserIdentity>(users[0]);
  const [selectedZone, setSelectedZone] = useState<AirportZone>(zones[0]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AccessRequestResponse | null>(null);

  useEffect(() => {
    return securityService.subscribe(() => {
      const updatedUsers = securityService.getUsers();
      const updatedZones = securityService.getZones();
      setUsers(updatedUsers);
      setZones(updatedZones);
      
      if (selectedUser) {
        const current = updatedUsers.find(u => u.id === selectedUser.id);
        if (current) setSelectedUser(current);
      }
    });
  }, [selectedUser]);

  const handleTestAccess = async () => {
    setIsProcessing(true);
    setResult(null);
    const response = await securityService.requestAccess(selectedUser.id, selectedZone.id);
    setResult(response);
    setIsProcessing(false);
  };

  const handleOverride = async () => {
    securityService.grantBypass(selectedUser.id, selectedZone.id);
    await handleTestAccess();
  };

  if (!selectedUser || !selectedZone) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Access Decision Engine</h1>
        <p className="text-slate-500 mt-1">Simulate real-world RBAC logic. Use Administrative Overrides to resolve blockages.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Access Request</h3>
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Subject</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all cursor-pointer appearance-none shadow-sm"
                value={selectedUser.id}
                onChange={(e) => setSelectedUser(users.find(u => u.id === e.target.value)!)}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName} — {u.role.replace('_', ' ')}</option>
                ))}
              </select>
              <div className="mt-3 p-4 bg-slate-900 rounded-2xl flex items-center justify-between text-white border border-slate-800">
                <div>
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Badge Status</div>
                  <div className={`text-[11px] font-black uppercase ${
                    selectedUser.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedUser.status} {new Date(selectedUser.expiryDate) < new Date() ? '(EXPIRED)' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Clearance</div>
                  <div className="text-[11px] font-black text-blue-400">LEVEL {selectedUser.clearanceLevel}</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Secured Zone</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all cursor-pointer appearance-none shadow-sm"
                value={selectedZone.id}
                onChange={(e) => setSelectedZone(zones.find(z => z.id === e.target.value)!)}
              >
                {zones.map(z => (
                  <option key={z.id} value={z.id}>{z.name} — {z.classification}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            onClick={handleTestAccess}
            disabled={isProcessing}
            className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all ${
              isProcessing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-slate-200 active:scale-[0.98]'
            }`}
          >
            {isProcessing ? 'Validating Credentials...' : 'Initiate Scan Sequence'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0b1120] text-slate-400 p-8 rounded-[2.5rem] shadow-2xl font-mono text-[11px] leading-relaxed relative overflow-hidden h-[340px] border border-slate-800">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            <p className="text-blue-500 font-bold mb-4 uppercase tracking-widest">// SECURE_AUTH_GATEWAY</p>
            {isProcessing ? (
              <div className="space-y-2">
                <p className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full animate-ping mr-3"></span> [SYSTEM] Requesting Identity Blob...</p>
                <p className="pl-5">[CRYPTO] Verifying SHA-256 Signature...</p>
                <p className="pl-5">[RBAC] Calculating Node Proximity...</p>
              </div>
            ) : result ? (
              <div className="space-y-3">
                <p className={result.allowed ? 'text-green-400' : 'text-red-400'}>
                  AUTH_{result.allowed ? 'SUCCESS' : 'DENIED'}
                </p>
                <p className="text-slate-500 mt-4 font-mono text-[10px]">
                  {"{"}
                  <br />
                  &nbsp;&nbsp;"id": "{result.auditId}",
                  <br />
                  &nbsp;&nbsp;"subject": "{selectedUser.badgeNumber}",
                  <br />
                  &nbsp;&nbsp;"zone": "{selectedZone.id}",
                  <br />
                  &nbsp;&nbsp;"status": "{result.allowed ? 'GRANTED' : 'BLOCKED'}"
                  <br />
                  {"}"}
                </p>
                <div className="h-px bg-slate-800 my-4"></div>
                <p className="text-slate-500 italic">Audit string: {btoa(result.auditId).substring(0, 16)}...</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <p className="uppercase tracking-[0.4em] font-black">Standby for Input</p>
              </div>
            )}
          </div>

          {result && (
            <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col space-y-6 animate-in slide-in-from-bottom-4 duration-500 ${
              result.allowed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  result.allowed ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {result.allowed ? (
                     <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                     <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  )}
                </div>
                <div>
                  <h4 className={`text-xl font-black uppercase tracking-tight ${result.allowed ? 'text-green-900' : 'text-red-900'}`}>
                    Access {result.allowed ? 'Approved' : 'Restricted'}
                  </h4>
                  <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{result.reason}</p>
                </div>
              </div>

              {!result.allowed && (
                <div className="pt-4 border-t border-red-200/50">
                  <p className="text-[10px] font-black text-red-700/60 uppercase tracking-widest mb-3">Admin Resolution Path</p>
                  <button 
                    onClick={handleOverride}
                    className="w-full bg-red-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
                  >
                    Authorize Remote Unlock (Override)
                  </button>
                  <p className="mt-2 text-[9px] text-red-600/50 text-center font-bold">WARNING: Override logs will be flagged for manual review.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessControl;
