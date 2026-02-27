
import React, { useState, useEffect, useMemo } from 'react';
import { Pilgrim, Temple } from '../types';
import { TempleMap } from '../components/TempleMap';
import { motion, AnimatePresence } from 'motion/react';

interface PilgrimMapProps {
  registeredPilgrims: Pilgrim[];
  onSendSOS: (pilgrim: Pilgrim) => void;
  t: (key: any) => string;
  currentTemple?: Temple;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
}

export const PilgrimMap: React.FC<PilgrimMapProps> = ({ registeredPilgrims, onSendSOS, t, currentTemple }) => {
  const [currentPilgrim, setCurrentPilgrim] = useState<Pilgrim | null>(registeredPilgrims[0] || null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [sosActive, setSosActive] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const themePrimary = '#F97316'; // Saffron

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSyncing(false);
      addNotification('Gate Assignment', 'You are assigned to GATE 2 for your 08:00 AM slot.', 'success');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const addNotification = (title: string, message: string, type: 'info' | 'warning' | 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  if (isSyncing) {
    return (
      <div className="max-w-md mx-auto py-32 text-center animate-in fade-in duration-500">
        <div className="relative w-32 h-32 mx-auto mb-12">
          <div className="absolute inset-0 border-4 border-[#FEF3C7] dark:border-white/10 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 rounded-full animate-spin" style={{ borderColor: themePrimary }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fas fa-microchip text-4xl animate-pulse" style={{ color: themePrimary }}></i>
          </div>
        </div>
        <h2 className="text-2xl font-black italic tracking-tighter mb-4 text-[#B45309] dark:text-white uppercase">Syncing Divine Scarf</h2>
        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Updating Sacred Ledger...</p>
      </div>
    );
  }

  if (!currentPilgrim) return null;

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-24 px-4 animate-in slide-in-from-bottom duration-1000 relative">
      {/* Notifications Overlay */}
      <div className="fixed top-28 right-4 left-4 z-[100] pointer-events-none flex flex-col gap-3 items-end">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div 
              key={n.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className={`p-4 rounded-2xl shadow-2xl border-2 max-w-xs pointer-events-auto ${
                n.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                n.type === 'warning' ? 'bg-red-50 border-red-200 text-red-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex gap-3">
                <i className={`fas ${n.type === 'success' ? 'fa-check-circle' : n.type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle'} mt-1`}></i>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest">{n.title}</p>
                  <p className="text-xs font-medium mt-1">{n.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="space-y-6">
        <TempleMap themeColor={themePrimary} assignedGate="gate-2" sosActive={sosActive} />

        {/* Smart Entry Guidance */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-orange-100 dark:border-white/5 shadow-xl">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                <i className="fas fa-route"></i>
              </div>
              <div>
                <h4 className="font-black text-lg italic tracking-tighter dark:text-white">Smart Entry Guidance</h4>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">AI-Optimized Route</p>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Gate</p>
                <p className="text-xl font-black text-[#B45309] dark:text-white italic">GATE 2</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Walking Time</p>
                <p className="text-xl font-black text-[#B45309] dark:text-white italic">~6 mins</p>
              </div>
           </div>
        </div>

        {/* Emergency SOS */}
        <div 
          className={`p-10 rounded-[3.5rem] border-4 transition-all duration-1000 group ${
            sosActive 
              ? 'bg-red-600 border-red-400 shadow-[0_0_60px_rgba(220,38,38,0.6)]' 
              : 'bg-white dark:bg-slate-900 border-red-500/10 hover:border-red-500/30 shadow-2xl'
          }`}
        >
          {!sosActive ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-red-500">
                 <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center shadow-inner">
                    <i className="fas fa-heart-pulse text-xl"></i>
                 </div>
                 <h4 className="font-black text-lg tracking-tight uppercase italic">Emergency Response</h4>
              </div>
              <button 
                onClick={() => { 
                  setSosActive(true); 
                  onSendSOS(currentPilgrim); 
                  addNotification('SOS ACTIVE', 'Emergency teams notified. Follow the red path.', 'warning');
                }}
                className="w-full bg-red-600 text-white py-8 rounded-[2.5rem] font-black text-2xl shadow-2xl flex items-center justify-center gap-6 transition-all hover:bg-red-700 active:scale-95 group-hover:scale-[1.03]"
              >
                <i className="fas fa-exclamation-triangle animate-pulse"></i> SOS BROADCAST
              </button>
            </div>
          ) : (
            <div className="text-center text-white py-12 animate-pulse space-y-10">
              <div className="w-32 h-32 rounded-full border-8 border-white/20 border-t-white animate-spin mx-auto flex items-center justify-center shadow-inner">
                 <i className="fas fa-broadcast-tower text-4xl"></i>
              </div>
              <h4 className="text-4xl font-black tracking-tighter italic mb-4 uppercase">Help En Route</h4>
              <button 
                onClick={() => setSosActive(false)}
                className="px-8 py-3 bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Cancel Alert
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
