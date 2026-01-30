
import React from 'react';
import { ROLE_ACCESS_MATRIX, AIRPORT_ZONES } from '../constants';
import { UserRole } from '../types';

const ArchitectureDocs: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-16 px-6 pb-32">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Technical System Architecture</h1>
        <p className="text-slate-500 mt-2 text-lg font-medium">Interview Briefing: Access Logging, Real-time Alerts, and Granular RBAC Matrix.</p>
      </header>

      {/* Security Matrix Visualization */}
      <section className="space-y-8">
        <h2 className="text-2xl font-black text-slate-800 flex items-center space-x-4">
          <span className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black">M</span>
          <span>Active Security Matrix (RBAC)</span>
        </h2>
        <p className="text-sm text-slate-500 max-w-2xl">
          The system enforces a <b>Granular Access Matrix</b>. Unlike basic level-based clearance, this model explicitly maps roles to specific zones. 
          For example, ATC staff can enter the Tower (Critical) but are blocked from the Data Center (Critical) by default.
        </p>
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 sticky left-0 bg-slate-50">Role / Zone</th>
                  {AIRPORT_ZONES.map(zone => (
                    <th key={zone.id} className="px-4 py-4 text-[9px] font-black text-slate-500 uppercase tracking-tighter text-center min-w-[100px]">
                      {zone.name}
                      <div className="text-[8px] text-slate-400 mt-1">{zone.classification}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.values(UserRole).map(role => (
                  <tr key={role} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-[10px] font-bold text-slate-700 uppercase tracking-tight border-r border-slate-200 sticky left-0 bg-white">
                      {role.replace('_', ' ')}
                    </td>
                    {AIRPORT_ZONES.map(zone => {
                      const isAllowed = ROLE_ACCESS_MATRIX[role]?.includes(zone.id);
                      return (
                        <td key={zone.id} className="px-4 py-4 text-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto ${
                            isAllowed ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-200'
                          }`}>
                            {isAllowed ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Database Schema Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-black text-slate-800 flex items-center space-x-4">
          <span className="bg-slate-900 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-sm">1</span>
          <span>Data Persistence Layer (Schema)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#0f172a] p-8 rounded-3xl border border-slate-800 shadow-2xl">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">ACCESS_LOGS_TABLE</h4>
            <pre className="text-[10px] font-mono text-slate-400 leading-relaxed whitespace-pre-wrap">
{`CREATE TABLE access_logs (
  log_id UUID PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES identities(id),
  zone_id UUID REFERENCES zones(id),
  direction VARCHAR(10) CHECK(direction IN ('ENTRY', 'EXIT')),
  status VARCHAR(20) CHECK(status IN ('GRANTED', 'DENIED')),
  security_reason TEXT,
  signature_hash TEXT NOT NULL, -- Cryptographic integrity
  reader_hardware_id VARCHAR(50)
);

CREATE INDEX idx_logs_user_ts ON access_logs(user_id, timestamp);`}
            </pre>
          </div>
          <div className="bg-[#0f172a] p-8 rounded-3xl border border-slate-800 shadow-2xl">
            <h4 className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] mb-4">SECURITY_ALERTS_TABLE</h4>
            <pre className="text-[10px] font-mono text-slate-400 leading-relaxed whitespace-pre-wrap">
{`CREATE TABLE security_alerts (
  alert_id UUID PRIMARY KEY,
  type VARCHAR(50), -- RESTRICTED_BREACH, etc.
  severity VARCHAR(10), -- CRITICAL, HIGH, MEDIUM
  message TEXT,
  identity_id UUID REFERENCES identities(id),
  zone_id UUID REFERENCES zones(id),
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES identities(id),
  incident_report_ref UUID
);`}
            </pre>
          </div>
        </div>
      </section>

      {/* Decision Logic & API Workflow */}
      <section className="space-y-8">
        <h2 className="text-2xl font-black text-slate-800 flex items-center space-x-4">
          <span className="bg-slate-900 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-sm">2</span>
          <span>Decision Logic & API Workflow</span>
        </h2>
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-10">
          <div>
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6">The Access Authorization Sequence</h3>
            <div className="flex flex-col space-y-4">
              {[
                { step: "Badge Scan", desc: "User triggers hardware interrupt. Reader sends user_id and zone_id to auth-service." },
                { step: "Status Check", desc: "Auth-service checks identity registry. If status != 'ACTIVE' or pass is expired, deny immediately." },
                { step: "Matrix Lookup", desc: "The RBAC engine queries the Permissions Matrix for the role's allowed zones." },
                { step: "Validation", desc: "If the current zone_id exists in the allowed list, grant access; otherwise deny." },
                { step: "Audit Trail", desc: "Async microservice signs and commits log entry to the encrypted ledger." },
                { step: "Alerting", desc: "On high-severity denial, push event to SOC real-time monitoring via WebSocket." }
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-6 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-lg shadow-blue-100">{i+1}</div>
                  <div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{item.step}:</span>
                    <span className="text-xs text-slate-500 ml-2 font-medium">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Zero Trust Principles */}
      <section className="space-y-8">
        <h2 className="text-2xl font-black text-slate-800 flex items-center space-x-4">
          <span className="bg-slate-900 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-sm">3</span>
          <span>Zero-Trust Architecture Principles</span>
        </h2>
        <div className="bg-slate-900 p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <h4 className="text-blue-400 font-black text-[11px] uppercase tracking-widest">Verify Explicitly</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Always authenticate and authorize based on all available data points, including user identity, location, and device health.</p>
            </div>
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </div>
              <h4 className="text-green-400 font-black text-[11px] uppercase tracking-widest">Least Privilege</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Limit user access with just-in-time and just-enough-access (JIT/JEA), risk-based adaptive polices, and data protection.</p>
            </div>
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <h4 className="text-red-400 font-black text-[11px] uppercase tracking-widest">Assume Breach</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Minimize blast radius and segment access. Verify end-to-end encryption and use analytics to get visibility and drive threat detection.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArchitectureDocs;
