
import React, { useEffect, useState } from 'react';
import { securityService } from '../services/securityService';
import { AccessLog, UserRole } from '../types';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [filter, setFilter] = useState({
    search: '',
    role: '',
    status: '',
    zone: ''
  });

  useEffect(() => {
    const updateLogs = () => setLogs(securityService.getLogs());
    updateLogs();
    return securityService.subscribe(updateLogs);
  }, []);

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.userName.toLowerCase().includes(filter.search.toLowerCase()) || l.userId.toLowerCase().includes(filter.search.toLowerCase());
    const matchesRole = filter.role === '' || l.userRole === filter.role;
    const matchesStatus = filter.status === '' || l.status === filter.status;
    const matchesZone = filter.zone === '' || l.zoneName.toLowerCase().includes(filter.zone.toLowerCase());
    return matchesSearch && matchesRole && matchesStatus && matchesZone;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-6 lg:px-12 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Access Logging & Audit Trail</h1>
        <p className="text-slate-500 mt-1">Immutable security ledger with cryptographic integrity signing.</p>
      </div>

      {/* Advanced Filtering UI */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Search Personnel</label>
          <input 
            type="text" 
            placeholder="Name or ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            value={filter.search}
            onChange={e => setFilter({...filter, search: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Filter Role</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            value={filter.role}
            onChange={e => setFilter({...filter, role: e.target.value})}
          >
            <option value="">All Roles</option>
            {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Zone Location</label>
          <input 
            type="text" 
            placeholder="e.g. Tower, Apron"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            value={filter.zone}
            onChange={e => setFilter({...filter, zone: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Access Result</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            value={filter.status}
            onChange={e => setFilter({...filter, status: e.target.value})}
          >
            <option value="">All Results</option>
            <option value="GRANTED">GRANTED</option>
            <option value="DENIED">DENIED</option>
          </select>
        </div>
      </div>

      <div className="bg-[#0f172a] rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
        <div className="p-5 bg-slate-800 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Verified Audit Trail</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            TOTAL_MATCHES: {filteredLogs.length}
          </div>
        </div>
        <div className="overflow-x-auto max-h-[700px]">
          <table className="w-full text-left font-mono border-collapse">
            <thead className="sticky top-0 bg-slate-800 text-slate-400 text-[9px] uppercase tracking-widest border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Zone [DIR]</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Security Reason / Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className={`hover:bg-slate-800/40 transition-colors ${log.status === 'DENIED' ? 'bg-red-500/5' : ''}`}>
                  <td className="px-6 py-4 text-[10px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    <div className="text-[8px] opacity-30 mt-1">{new Date(log.timestamp).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[11px] font-bold text-slate-200">{log.userName}</div>
                    <div className="text-[9px] text-blue-500/60 font-black uppercase tracking-tighter">{log.userRole.split('_')[0]}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[11px] text-slate-300 font-bold">{log.zoneName}</div>
                    <div className={`text-[8px] font-black mt-1 ${log.direction === 'ENTRY' ? 'text-blue-400' : 'text-orange-400'}`}>
                      [{log.direction}]
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black px-2 py-1 rounded border ${
                      log.status === 'GRANTED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[10px] text-slate-400 line-clamp-1">{log.reason}</div>
                    <div className="text-[8px] font-mono text-slate-600 mt-1 opacity-50">SIG: {(log as any).signature?.substring(0, 16)}...</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-slate-500 text-sm italic font-mono uppercase tracking-widest">No matching security records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
