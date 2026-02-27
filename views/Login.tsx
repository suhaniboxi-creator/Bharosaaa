
import React, { useState } from 'react';
import { UserRole, Temple } from '../types';

interface LoginProps {
  onSelectRole: (role: UserRole) => void;
  currentTemple: Temple;
  t: (key: any) => string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSelectRole, currentTemple, t, isDarkMode, toggleDarkMode }) => {
  const [accessMode, setAccessMode] = useState<'PUBLIC' | 'STAFF'>('PUBLIC');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleStaffLogin = (role: UserRole) => {
    if (passcode === '1234') { // Simulated secret code
      onSelectRole(role);
    } else {
      setError('Invalid Authorization Code');
      setTimeout(() => setError(''), 2000);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-700 flex flex-col items-center justify-center p-6 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="absolute top-8 right-8 flex gap-4">
        <button onClick={toggleDarkMode} className="p-4 rounded-2xl bg-white dark:bg-slate-800 transition-all hover:scale-110 active:scale-95 shadow-xl border border-slate-200 dark:border-white/5">
          <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
        </button>
      </div>

      <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-1000">
        <div className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl transition-transform hover:rotate-12" style={{ backgroundColor: currentTemple.themeColor }}>
          <i className={`fas ${currentTemple.icon} text-white text-5xl`}></i>
        </div>
        <h1 className="text-7xl font-black tracking-tighter mb-2 italic">BHAROSA</h1>
        <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.5em] text-[10px]">Sacred IoT Ecosystem</p>
      </div>

      <div className="max-w-4xl w-full">
        <div className="flex bg-white dark:bg-slate-900 p-2 rounded-3xl mb-12 shadow-xl border border-slate-200 dark:border-white/5 mx-auto w-fit transition-all hover:scale-105">
          <button 
            onClick={() => setAccessMode('PUBLIC')}
            className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${accessMode === 'PUBLIC' ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            PILGRIM PORTAL
          </button>
          <button 
            onClick={() => setAccessMode('STAFF')}
            className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${accessMode === 'STAFF' ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            STAFF COMMAND
          </button>
        </div>

        {accessMode === 'PUBLIC' ? (
          <div className="animate-in fade-in zoom-in duration-700">
            <button
              onClick={() => onSelectRole('PILGRIM')}
              className="group relative bg-white dark:bg-slate-900 p-16 rounded-[4rem] shadow-2xl border border-slate-100 dark:border-white/5 transition-all hover:-translate-y-2 text-center w-full max-w-lg mx-auto block overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="w-24 h-24 rounded-[2rem] bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-5xl text-orange-500 mx-auto mb-8 shadow-inner relative z-10">
                <i className="fas fa-hands-praying"></i>
              </div>
              <h3 className="text-4xl font-black mb-4 relative z-10 italic tracking-tighter">Enter Sacred Path</h3>
              <p className="text-slate-400 font-medium mb-12 text-sm max-w-xs mx-auto relative z-10">Instant synchronization with your smart scarf. Register or Login to your pilgrimage journey.</p>
              <div className="inline-flex items-center gap-4 px-10 py-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl font-black text-sm shadow-2xl group-hover:px-16 transition-all relative z-10">
                ACTIVATE PORTAL <i className="fas fa-bolt animate-pulse"></i>
              </div>
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in duration-700 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-white/5 space-y-10">
              <div className="text-center">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Security Authorization Required</label>
                <input 
                  type="password" 
                  maxLength={4}
                  placeholder="••••"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 py-6 rounded-3xl text-center text-5xl font-black tracking-[1em] focus:ring-4 transition-all outline-none border-none dark:text-white shadow-inner"
                  style={{ '--tw-ring-color': currentTemple.themeColor } as any}
                />
                {error && <p className="text-red-500 text-xs font-black text-center mt-6 animate-bounce">{error}</p>}
                <p className="text-[9px] text-slate-400 mt-6 font-bold uppercase tracking-widest">Master Bypass: 1234</p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <button 
                  onClick={() => handleStaffLogin('ADMIN')}
                  className="p-10 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all text-center group border border-slate-100 dark:border-white/5 shadow-sm"
                >
                  <i className="fas fa-tower-observation text-4xl mb-6 text-slate-400 group-hover:text-inherit transition-colors"></i>
                  <h4 className="font-black text-sm uppercase tracking-widest">Admin Control</h4>
                </button>
                <button 
                  onClick={() => handleStaffLogin('REGISTERER')}
                  className="p-10 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all text-center group border border-slate-100 dark:border-white/5 shadow-sm"
                >
                  <i className="fas fa-id-card-clip text-4xl mb-6 text-slate-400 group-hover:text-inherit transition-colors"></i>
                  <h4 className="font-black text-sm uppercase tracking-widest">Desk Entry</h4>
                </button>
                <button 
                  onClick={() => handleStaffLogin('EXIT_OFFICER')}
                  className="p-10 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all text-center group border border-slate-100 dark:border-white/5 shadow-sm"
                >
                  <i className="fas fa-door-open text-4xl mb-6 text-slate-400 group-hover:text-inherit transition-colors"></i>
                  <h4 className="font-black text-sm uppercase tracking-widest">Desk Exit</h4>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-20 flex gap-12 opacity-30 text-[10px] font-black uppercase tracking-[0.6em]">
        <div className="flex items-center gap-2">
          <i className="fas fa-link"></i> Ledger Sync
        </div>
        <div className="flex items-center gap-2">
          <i className="fas fa-microchip"></i> Scarf Active
        </div>
      </div>
    </div>
  );
};
