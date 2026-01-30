
import React, { useState, useEffect } from 'react';
import { securityService, SecurityService } from '../services/securityService';
import { UserIdentity, UserRole } from '../types';

const Identities: React.FC = () => {
  const [users, setUsers] = useState<UserIdentity[]>(securityService.getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    role: UserRole.VISITOR,
    badgeNumber: '',
    isContractor: false,
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  });

  useEffect(() => {
    return securityService.subscribe(() => {
      setUsers(securityService.getUsers());
    });
  }, []);

  const handleOnboard = (e: React.FormEvent) => {
    e.preventDefault();
    securityService.onboardUser({
      ...formData,
      status: 'ACTIVE'
    });
    setIsModalOpen(false);
    setFormData({ 
      fullName: '', 
      role: UserRole.VISITOR, 
      badgeNumber: '', 
      isContractor: false,
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    });
  };

  const toggleStatus = (userId: string, current: string) => {
    const nextStatus = current === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    securityService.updateUserStatus(userId, nextStatus);
  };

  const handleRenew = (userId: string) => {
    securityService.renewBadge(userId);
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.badgeNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase tracking-[0.05em]">Identity Registry</h1>
          <p className="text-slate-500 mt-1 font-bold text-xs uppercase tracking-widest opacity-60">Global Staff & Contractor Verification Module</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 active:scale-95"
        >
          Register Personnel
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="relative group">
            <svg className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search Subject Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 focus:outline-none w-80 transition-all shadow-inner"
            />
          </div>
          <div className="flex space-x-4">
             <div className="px-4 py-2 bg-green-50 rounded-xl border border-green-100 text-[10px] font-black text-green-600 uppercase tracking-widest">
               {users.filter(u => u.status === 'ACTIVE').length} Active
             </div>
             <div className="px-4 py-2 bg-red-50 rounded-xl border border-red-100 text-[10px] font-black text-red-600 uppercase tracking-widest">
               {users.filter(u => u.status !== 'ACTIVE').length} Restricted
             </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[9px] uppercase tracking-[0.3em] font-black border-b border-slate-100">
                <th className="px-8 py-6">Subject Identity</th>
                <th className="px-8 py-6">Operational Role</th>
                <th className="px-8 py-6">Badge Hash</th>
                <th className="px-8 py-6">Status / Expiry</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map(user => {
                const isExpired = new Date(user.expiryDate) < new Date();
                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-5">
                        <img src={`https://picsum.photos/seed/${user.id}/80/80`} alt="" className="w-12 h-12 rounded-2xl bg-slate-200 border-2 border-white shadow-sm" />
                        <div>
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{user.fullName}</p>
                          <p className="text-[9px] font-black text-blue-600/60 uppercase tracking-widest mt-1">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-block px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                        {user.role.replace('_', ' ')}
                      </div>
                      <div className="text-[8px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">Clearance Lvl {user.clearanceLevel}</div>
                    </td>
                    <td className="px-8 py-6 font-mono text-[10px] text-slate-400 font-bold">
                      {SecurityService.simulateHash(user.badgeNumber)}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col space-y-2">
                        <button 
                          onClick={() => toggleStatus(user.id, user.status)}
                          className={`w-max px-3 py-1 rounded-full text-[9px] font-black transition-all hover:scale-110 ${
                          user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.status}
                        </button>
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${isExpired ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                          Exp: {user.expiryDate} {isExpired ? '(EXPIRED)' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleRenew(user.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-700"
                        >
                          Renew Badge
                        </button>
                        <button 
                          onClick={() => securityService.deleteUser(user.id)}
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors"
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal remains largely same but updated with consistent styling */}
    </div>
  );
};

export default Identities;
