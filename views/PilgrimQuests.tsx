
import React, { useState, useEffect } from 'react';
import { Pilgrim, Temple } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface PilgrimQuestsProps {
  registeredPilgrims: Pilgrim[];
  t: (key: any) => string;
  currentTemple?: Temple;
}

export const PilgrimQuests: React.FC<PilgrimQuestsProps> = ({ registeredPilgrims, t, currentTemple }) => {
  const [currentPilgrim] = useState<Pilgrim | null>(registeredPilgrims[0] || null);
  const [oracleThought, setOracleThought] = useState('');

  const thoughts = [
    "The soul is neither born, and nor does it die.",
    "Perform your obligatory duty, for action is far better than inaction.",
    "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions.",
    "A person is said to have achieved yoga, the union with the Self, when the perfectly disciplined mind gets freedom from all desires.",
    "The mind is restless and difficult to restrain, but it is subdued by practice.",
    "Man is made by his belief. As he believes, so he is."
  ];

  useEffect(() => {
    setOracleThought(thoughts[Math.floor(Math.random() * thoughts.length)]);
    const interval = setInterval(() => {
      setOracleThought(thoughts[Math.floor(Math.random() * thoughts.length)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const quests = [
    { id: 'q1', icon: 'fa-bell', title: 'Ring the Morning Bell', aura: 50, location: 'North Corridor', progress: 100, description: 'Participate in the morning Mangala Aarti and ring the sacred bell.' },
    { id: 'q2', icon: 'fa-water', title: 'Visit Sacred Ganga', aura: 100, location: 'Dashashwamedh Ghat', progress: 30, description: 'Take a holy dip or offer prayers at the river bank.' },
    { id: 'q3', icon: 'fa-book-quran', title: 'Ancient Scripture Wall', aura: 75, location: 'Temple Library', progress: 0, description: 'Read a verse from the ancient stone-carved scriptures.' },
    { id: 'q4', icon: 'fa-hand-holding-heart', title: 'Seva: Clean the Courtyard', aura: 150, location: 'Main Courtyard', progress: 0, description: 'Perform 10 minutes of voluntary service to keep the temple clean.' },
  ];

  if (!currentPilgrim) return null;

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-24 px-4 animate-in slide-in-from-bottom duration-1000">
      <div className="bg-[#B45309] dark:bg-slate-800 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="text-3xl font-black italic tracking-tighter uppercase">Divine Quests</h3>
            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em] mt-1">Upgrade your trust tier</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-orange-300">
              <i className="fas fa-sparkles text-sm animate-pulse"></i>
              <span className="text-3xl font-black">{currentPilgrim.auraPoints}</span>
            </div>
            <p className="text-[8px] uppercase font-black tracking-widest opacity-40">Current Aura</p>
          </div>
        </div>
      </div>

      {/* Divine Oracle */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-orange-100 dark:border-white/5 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <i className="fas fa-om text-6xl"></i>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
            <i className="fas fa-scroll"></i>
          </div>
          <h4 className="font-black text-sm uppercase tracking-widest dark:text-white">Divine Oracle</h4>
        </div>
        <AnimatePresence mode="wait">
          <motion.p 
            key={oracleThought}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg font-black italic tracking-tight text-slate-800 dark:text-slate-200 leading-tight"
          >
            "{oracleThought}"
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="space-y-4">
        {quests.map((quest) => (
          <motion.div 
            key={quest.id} 
            whileHover={{ scale: 1.02 }}
            className={`p-8 rounded-[3rem] border transition-all flex flex-col gap-6 relative overflow-hidden group ${
              quest.progress === 100 
                ? 'bg-green-500/5 border-green-500/20' 
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 shadow-xl'
            }`}
          >
            <div className="flex gap-6">
              <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 shadow-inner flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform" style={{ color: quest.progress === 100 ? '#22c55e' : '#F97316' }}>
                <i className={`fas ${quest.icon} text-2xl`}></i>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className={`font-black text-xl italic tracking-tight ${quest.progress === 100 ? 'text-green-600 dark:text-green-400 opacity-60' : 'text-slate-900 dark:text-white'}`}>
                    {quest.title}
                  </h4>
                  {quest.progress === 100 && <i className="fas fa-check-circle text-green-500 text-xl"></i>}
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                  <i className="fas fa-location-dot text-[10px]"></i> {quest.location}
                </p>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {quest.description}
            </p>

            <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
              <div className="flex-1 h-2.5 bg-slate-100 dark:bg-black/20 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${quest.progress === 100 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${quest.progress}%` }}></div>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase">+{quest.aura} AURA</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
