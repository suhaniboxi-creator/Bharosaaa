
import React from 'react';
import { Pilgrim, Temple } from '../types';

interface PilgrimLeaderboardProps {
  registeredPilgrims: Pilgrim[];
  t: (key: any) => string;
  currentTemple?: Temple;
}

export const PilgrimLeaderboard: React.FC<PilgrimLeaderboardProps> = ({ registeredPilgrims, t, currentTemple }) => {
  const leaderboard = [
    { name: 'Rahul S.', aura: 450, rank: 1, color: 'RED', badge: 'Grand Devotee' },
    { name: 'Priya M.', aura: 420, rank: 2, color: 'BLUE', badge: 'Sacred Guide' },
    { name: 'Amit K.', aura: 380, rank: 3, color: 'GREEN', badge: 'Faith Keeper' },
    { name: 'Sunita V.', aura: 310, rank: 4, color: 'ORANGE', badge: 'Morning Regular' },
    { name: 'Vijay R.', aura: 290, rank: 5, color: 'PURPLE', badge: 'Aarti Participant' },
    { name: 'Deepak T.', aura: 250, rank: 6, color: 'TEAL', badge: 'New Devotee' },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-24 px-4 animate-in slide-in-from-bottom duration-1000">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-yellow-400/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-yellow-500 text-3xl shadow-inner">
            <i className="fas fa-trophy animate-bounce"></i>
          </div>
          <h3 className="text-3xl font-black mb-2 dark:text-white italic tracking-tighter uppercase">Aura Rankings</h3>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.4em] font-black">Top Devotees of the Kashi Node</p>
        </div>

        <div className="space-y-4">
           {leaderboard.map((user, i) => (
             <div key={i} className={`flex items-center gap-6 p-6 rounded-[2.5rem] border transition-all ${
               i === 0 ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-500/5 dark:border-yellow-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-white/5'
             }`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg ${
                  i === 0 ? 'bg-yellow-400 text-white' : 
                  i === 1 ? 'bg-slate-300 text-slate-600' :
                  i === 2 ? 'bg-orange-300 text-orange-800' :
                  'bg-slate-200 text-slate-500'
                }`}>
                  {user.rank}
                </div>
                <div className="flex-1">
                   <div className="flex items-center gap-2">
                     <p className="font-black text-lg italic tracking-tight dark:text-white">{user.name}</p>
                     {i === 0 && <i className="fas fa-crown text-yellow-500 text-xs"></i>}
                   </div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user.badge}</p>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black text-orange-500 italic tracking-tighter">{user.aura}</p>
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Aura</p>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10"></div>
        <h4 className="font-black text-sm uppercase tracking-widest mb-2 relative z-10">Your Current Rank</h4>
        <div className="flex justify-between items-end relative z-10">
          <div>
            <p className="text-4xl font-black italic tracking-tighter">#124</p>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Out of 4,200 Pilgrims</p>
          </div>
          <button className="px-6 py-3 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
            View My Stats
          </button>
        </div>
      </div>
    </div>
  );
};
