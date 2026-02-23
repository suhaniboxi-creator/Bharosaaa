
import React, { useState } from 'react';
import { Transaction, Temple } from '../types';

interface LedgerProps {
  transactions: Transaction[];
  currentTemple?: Temple;
  t: (key: any) => string;
}

export const Ledger: React.FC<LedgerProps> = ({ transactions, currentTemple, t }) => {
  const [filter, setFilter] = useState<'ALL' | 'ENTRY' | 'EXIT' | 'DONATION' | 'VIP_ENTRY' | 'EMERGENCY_SOS'>('ALL');

  const filtered = transactions.filter(t => filter === 'ALL' || t.type === filter);
  const themePrimary = currentTemple?.themeColor || '#F97316';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 flex flex-wrap gap-4 items-center shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3 mr-4">
           <i className="fas fa-layer-group text-slate-400"></i>
           <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Immutable Chain</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {['ALL', 'ENTRY', 'EXIT', 'DONATION', 'EMERGENCY_SOS'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                filter === f 
                  ? 'text-white shadow-lg' 
                  : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              style={{ backgroundColor: filter === f ? themePrimary : '' }}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="ml-auto hidden md:flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Network Synchronized</span>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-20 text-center rounded-[2.5rem] border border-slate-100 dark:border-white/5 transition-colors duration-300">
            <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
               <i className="fas fa-database text-4xl text-slate-200 dark:text-slate-700"></i>
            </div>
            <p className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-xs">Genesis Block: No Records Found</p>
          </div>
        ) : (
          filtered.slice().reverse().map((tx) => (
            <div 
              key={tx.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm flex flex-col md:flex-row gap-6 items-center transition-all hover:scale-[1.01] hover:shadow-md group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                tx.type === 'ENTRY' ? 'bg-blue-500/10 text-blue-500' :
                tx.type === 'EXIT' ? 'bg-red-500/10 text-red-500' :
                tx.type === 'EMERGENCY_SOS' ? 'bg-rose-500/10 text-rose-500' :
                tx.type === 'DONATION' ? 'bg-emerald-500/10 text-emerald-500' :
                'bg-green-500/10 text-green-500'
              }`}>
                <i className={`fas ${
                  tx.type === 'ENTRY' ? 'fa-user-check' :
                  tx.type === 'EXIT' ? 'fa-door-open' :
                  tx.type === 'EMERGENCY_SOS' ? 'fa-triangle-exclamation' :
                  tx.type === 'DONATION' ? 'fa-hand-holding-heart' :
                  'fa-shield-halved'
                } text-2xl`}></i>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{tx.type.replace('_', ' ')}</span>
                  <div className="h-1 w-1 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                  <span className="text-[10px] bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full font-mono font-bold">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                   <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-mono bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-100 dark:border-white/5 flex-1">
                     {tx.hash}
                   </p>
                   <button className="text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <i className="fas fa-copy text-xs"></i>
                   </button>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 font-medium leading-relaxed">{tx.details}</p>
              </div>

              <div className="flex flex-col items-center md:items-end shrink-0 gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-white/5 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Hash Integrity</span>
                <div className="flex items-center gap-2 bg-green-500/10 dark:bg-green-500/5 px-4 py-2 rounded-xl border border-green-500/20">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                   <span className="text-green-600 dark:text-green-500 text-[10px] font-black uppercase tracking-widest">Validated</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {transactions.length > 5 && (
        <div className="py-10 text-center">
          <button className="group text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white transition-all flex flex-col items-center gap-3 mx-auto">
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Query Previous Blocks</span>
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-white/10 transition-colors">
               <i className="fas fa-chevron-down text-xs"></i>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
