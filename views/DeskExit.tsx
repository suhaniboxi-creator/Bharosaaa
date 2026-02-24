
import React, { useState } from 'react';
import { Pilgrim, Temple } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface DeskExitProps {
  onDeactivate: (qrValue: string) => Promise<boolean>;
  registeredPilgrims: Pilgrim[];
  t: (key: any) => string;
  currentTemple: Temple;
}

export const DeskExit: React.FC<DeskExitProps> = ({ onDeactivate, registeredPilgrims, t, currentTemple }) => {
  const [qrInput, setQrInput] = useState('');
  const [deskId, setDeskId] = useState('EXIT-A');
  const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [lastPilgrim, setLastPilgrim] = useState<Pilgrim | null>(null);

  const handleExit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput) return;

    setStatus('SCANNING');
    const success = await onDeactivate(qrInput);

    if (success) {
      const pilgrim = registeredPilgrims.find(p => p.qrValue === qrInput);
      setLastPilgrim(pilgrim || null);
      setStatus('SUCCESS');
      setQrInput('');
      setTimeout(() => setStatus('IDLE'), 3000);
    } else {
      setStatus('ERROR');
      setTimeout(() => setStatus('IDLE'), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-red-500 text-3xl shadow-inner">
          <i className="fas fa-door-open"></i>
        </div>
        <h2 className="text-4xl font-black italic tracking-tighter dark:text-white uppercase">Desk Exit Portal</h2>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">Deactivate Scarf & Finalize Journey</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-white/5 space-y-8">
          <form onSubmit={handleExit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Exit Desk Location</label>
                <select 
                  value={deskId} 
                  onChange={e => setDeskId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 py-4 px-6 rounded-2xl font-bold dark:text-white outline-none border-none shadow-inner"
                >
                  <option value="EXIT-A">Exit Gate A Desk</option>
                  <option value="EXIT-B">Exit Gate B Desk</option>
                  <option value="EXIT-C">Exit Gate C Desk</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Scan Scarf QR Code</label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="e.g. KV-GATEA-OR10001"
                    value={qrInput}
                    onChange={e => setQrInput(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 dark:bg-slate-800 py-6 px-8 rounded-3xl text-xl font-black tracking-wider focus:ring-4 transition-all outline-none border-none dark:text-white shadow-inner"
                    style={{ '--tw-ring-color': currentTemple.themeColor } as any}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <i className="fas fa-qrcode text-2xl"></i>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="absolute -bottom-2 left-4 right-4 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <AnimatePresence>
                      {status === 'SCANNING' && (
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                          className="h-full bg-red-500"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={status === 'SCANNING'}
              className={`w-full py-6 rounded-3xl font-black text-lg italic tracking-tighter uppercase shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${
                status === 'SCANNING' ? 'bg-slate-200 text-slate-400' : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {status === 'SCANNING' ? (
                <i className="fas fa-circle-notch animate-spin"></i>
              ) : (
                <i className="fas fa-power-off"></i>
              )}
              Deactivate Scarf
            </button>
          </form>

          <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 text-center">
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System Note</p>
             <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
               Deactivation marks the pilgrim's journey as 'COMPLETED' in the Trust Ledger. The physical scarf is then ready for sanitization and reuse.
             </p>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {status === 'SUCCESS' && lastPilgrim ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-green-500 text-white p-10 rounded-[3.5rem] shadow-2xl h-full flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl">
                  <i className="fas fa-check"></i>
                </div>
                <div>
                  <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-tight">Journey Finalized</h3>
                  <p className="text-white/80 font-bold uppercase tracking-widest text-[10px] mt-2">Scarf ID: {lastPilgrim.qrValue}</p>
                </div>
                <div className="bg-white/10 p-6 rounded-3xl w-full space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Pilgrim</p>
                    <p className="text-xl font-black italic">{lastPilgrim.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-3 rounded-2xl">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Aura Earned</p>
                      <p className="text-lg font-black italic">+{lastPilgrim.auraPoints}</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-2xl">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Age / Gender</p>
                      <p className="text-lg font-black italic">{lastPilgrim.age} / {lastPilgrim.gender[0]}</p>
                    </div>
                  </div>

                  {lastPilgrim.badges && lastPilgrim.badges.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-2">Divine Badges Earned</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {lastPilgrim.badges.map((badge, i) => (
                          <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : status === 'ERROR' ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-red-500 text-white p-10 rounded-[3.5rem] shadow-2xl h-full flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl">
                  <i className="fas fa-times"></i>
                </div>
                <div>
                  <h3 className="text-3xl font-black italic tracking-tighter uppercase">Invalid Scarf</h3>
                  <p className="text-white/80 font-bold uppercase tracking-widest text-[10px] mt-2">Check ID & Try Again</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-100 dark:bg-slate-800/50 border-4 border-dashed border-slate-200 dark:border-white/5 p-10 rounded-[3.5rem] h-full flex flex-col items-center justify-center text-center"
              >
                <i className="fas fa-qrcode text-6xl text-slate-300 dark:text-slate-700 mb-6"></i>
                <p className="text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest text-xs">Waiting for Scarf Scan...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
