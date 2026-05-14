
import React, { useState, useEffect } from 'react';
import { Temple, ScarfUnit, ScarfLifecycleStatus } from '../types';
import { api } from '../utils/api';

interface ScarfLifecycleProps {
  t: (key: any) => string;
  currentTemple: Temple;
}

const STAGES: { status: ScarfLifecycleStatus; label: string; icon: string; color: string }[] = [
  { status: 'READY', label: 'Ready', icon: 'fa-check-circle', color: '#22c55e' },
  { status: 'LINKED', label: 'Linked', icon: 'fa-link', color: '#3b82f6' },
  { status: 'ACTIVE', label: 'Active', icon: 'fa-person-walking', color: '#f97316' },
  { status: 'DELINKED', label: 'Delinked', icon: 'fa-link-slash', color: '#ef4444' },
  { status: 'SANITIZING', label: 'Sanitizing', icon: 'fa-spray-can-sparkles', color: '#8b5cf6' },
];

export const ScarfLifecycle: React.FC<ScarfLifecycleProps> = ({ t, currentTemple }) => {
  const [data, setData] = useState<any>(null);
  const [selectedScarf, setSelectedScarf] = useState<ScarfUnit | null>(null);

  useEffect(() => {
    const load = () => api.getScarfLifecycle().then(res => { if (res.success) setData(res); });
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const counts = data?.counts || {};
  const scarves: ScarfUnit[] = data?.scarves || [];

  const statusColor = (s: string) => {
    const stage = STAGES.find(st => st.status === s);
    return stage?.color || '#94a3b8';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-2xl shadow-lg"><i className="fas fa-recycle"></i></div>
        <div>
          <h2 className="text-2xl font-black italic tracking-tight dark:text-white">Scarf Lifecycle Manager</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Reusability Pipeline • Zero Data Carryover</p>
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl">
        <h3 className="font-black dark:text-white uppercase tracking-widest text-xs mb-8">Lifecycle Pipeline</h3>
        <div className="flex items-center justify-between gap-2">
          {STAGES.map((stage, i) => (
            <React.Fragment key={stage.status}>
              <div className="flex-1 text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white text-xl shadow-lg mb-3" style={{ backgroundColor: stage.color }}>
                  <i className={`fas ${stage.icon}`}></i>
                </div>
                <p className="text-xs font-black dark:text-white">{stage.label}</p>
                <p className="text-2xl font-black mt-1" style={{ color: stage.color }}>{counts[stage.status] || 0}</p>
              </div>
              {i < STAGES.length - 1 && (
                <div className="w-12 h-1 rounded-full bg-slate-200 dark:bg-slate-700 relative overflow-hidden flex-shrink-0">
                  <div className="pipeline-flow absolute inset-0"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Scarves', value: data?.total || 0, icon: 'fa-shirt', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Avg Cycle Time', value: `${data?.avgCycleTime || 0}s`, icon: 'fa-stopwatch', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
          { label: 'Reuse Rate/hr', value: data?.reuseRate || 0, icon: 'fa-rotate', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
          { label: 'Data Carryover', value: 'ZERO', icon: 'fa-shield-halved', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' },
        ].map(m => (
          <div key={m.label} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center ${m.color} mb-3`}><i className={`fas ${m.icon}`}></i></div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
            <p className="text-xl font-black dark:text-white mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Inventory Grid */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black dark:text-white uppercase tracking-widest text-xs">Scarf Inventory</h3>
          <p className="text-[10px] text-slate-400 font-bold">Showing first 50 scarves</p>
        </div>
        <div className="grid grid-cols-10 md:grid-cols-25 gap-1.5">
          {scarves.slice(0, 50).map(s => (
            <button key={s.scarfId} onClick={() => setSelectedScarf(s)} title={`${s.scarfId}: ${s.status}`}
              className="w-6 h-6 rounded-lg transition-all hover:scale-150 hover:z-10 cursor-pointer border border-white/20"
              style={{ backgroundColor: statusColor(s.status) }}></button>
          ))}
        </div>

        {selectedScarf && (
          <div className="mt-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="font-black dark:text-white">{selectedScarf.scarfId}</p>
              <p className="text-xs text-slate-400">Status: <span className="font-bold" style={{ color: statusColor(selectedScarf.status) }}>{selectedScarf.status}</span></p>
              <p className="text-[10px] text-slate-400">Cycles: {selectedScarf.cycleCount} | Token: {selectedScarf.linkedTokenId || 'None'}</p>
            </div>
            <button onClick={() => setSelectedScarf(null)} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
          </div>
        )}
      </div>
    </div>
  );
};
