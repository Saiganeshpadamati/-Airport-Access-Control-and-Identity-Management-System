
import React, { useEffect, useState } from 'react';
import { securityService } from '../services/securityService';
import { SecurityAlert } from '../types';

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);

  useEffect(() => {
    const updateAlerts = () => setAlerts(securityService.getAlerts());
    updateAlerts();
    return securityService.subscribe(updateAlerts);
  }, []);

  const resolve = (id: string) => securityService.resolveAlert(id);

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-6 lg:px-12 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Security Alerts & Monitoring</h1>
          <p className="text-slate-500 mt-1">Real-time threat detection and incident management system.</p>
        </div>
        <div className="flex space-x-3">
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2"></span>
            {alerts.filter(a => !a.resolved).length} Unresolved
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {alerts.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Clear Perimeter: No active threats</p>
          </div>
        ) : alerts.map(alert => (
          <div key={alert.id} className={`group bg-white p-6 rounded-3xl shadow-sm border-l-4 transition-all hover:shadow-md ${
            alert.resolved ? 'border-slate-200 opacity-60' : 
            alert.severity === 'CRITICAL' ? 'border-red-600' :
            alert.severity === 'HIGH' ? 'border-orange-500' : 'border-blue-500'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  alert.resolved ? 'bg-slate-100 text-slate-400' :
                  alert.severity === 'CRITICAL' ? 'bg-red-50 text-red-600' :
                  alert.severity === 'HIGH' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      alert.resolved ? 'text-slate-400' :
                      alert.severity === 'CRITICAL' ? 'text-red-600' : 'text-slate-700'
                    }`}>
                      {alert.type.replace('_', ' ')}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 leading-tight">{alert.message}</h3>
                  <div className="mt-3 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <img src={`https://picsum.photos/seed/${alert.userId}/32/32`} className="w-5 h-5 rounded-full" alt="" />
                      <span className="text-xs font-bold text-slate-600">{alert.userName} (ID: {alert.userId})</span>
                    </div>
                    <div className="text-xs font-bold text-slate-400">ZONE: <span className="text-slate-700">{alert.zoneName}</span></div>
                  </div>
                </div>
              </div>
              {!alert.resolved && (
                <button 
                  onClick={() => resolve(alert.id)}
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200"
                >
                  Mark Resolved
                </button>
              )}
              {alert.resolved && (
                <div className="flex items-center text-green-600 space-x-1 uppercase text-[10px] font-black tracking-widest pr-4">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span>Resolved</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;
