
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const Layout: React.FC = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-[11px] uppercase tracking-[0.2em] font-black transition-colors hover:text-blue-600 px-2 py-1 ${
      isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-12 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="bg-slate-900 p-2.5 rounded-2xl shadow-lg shadow-slate-200">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-[0.1em] text-slate-900 uppercase">SkyGuard Identity Management</h1>
            <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Airport Access & Command Control</p>
          </div>
        </div>

        <nav className="flex items-center space-x-8">
          <NavLink to="/" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/alerts" className={linkClass}>Security Alerts</NavLink>
          <NavLink to="/audit" className={linkClass}>Audit Logs</NavLink>
          <NavLink to="/identities" className={linkClass}>Registry</NavLink>
          <NavLink to="/access" className={linkClass}>Command</NavLink>
          <NavLink to="/architecture" className={linkClass}>Architecture</NavLink>
          <div className="flex items-center pl-6 border-l border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
               <img src="https://picsum.photos/seed/admin/100/100" className="w-full h-full object-cover" alt="" />
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-50">
        <Outlet />
      </main>

      {/* Footer / System Status */}
      <footer className="bg-white border-t border-slate-200 py-6 px-12 flex justify-between items-center text-[10px] text-slate-400 font-black tracking-widest uppercase">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span>System: Online</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Enc: AES-256-GCM</span>
          </div>
          <span>|</span>
          <span>Node: SG-SOC-HYD-042</span>
        </div>
        <div>
          &copy; 2024 SkyGuard Defense Systems • Restricted Access Only
        </div>
      </footer>
    </div>
  );
};

export default Layout;
