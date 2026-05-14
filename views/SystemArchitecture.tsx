
import React, { useState, useEffect } from 'react';
import { Temple, GateNode } from '../types';
import { api } from '../utils/api';

interface SystemArchitectureProps {
  t: (key: any) => string;
  currentTemple: Temple;
}

export const SystemArchitecture: React.FC<SystemArchitectureProps> = ({ t, currentTemple }) => {
  const [health, setHealth] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [h, m] = await Promise.all([api.getSystemHealth(), api.getMetrics()]);
      if (h.success) setHealth(h);
      if (m.success) { setMetrics(m.metrics); setEvents(m.recentTransactions || []); }
    };
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  const themeColor = currentTemple?.themeColor || '#F97316';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-violet-500 flex items-center justify-center text-white text-2xl shadow-lg"><i className="fas fa-server"></i></div>
        <div>
          <h2 className="text-2xl font-black italic tracking-tight dark:text-white">System Architecture</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Cloud • Edge • Gates • Real-Time</p>
        </div>
      </div>

      {/* Infrastructure Diagram */}
      <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
        <h3 className="text-white font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
          <i className="fas fa-diagram-project text-violet-400"></i> Infrastructure Overview
        </h3>
        <div className="flex items-center justify-between gap-4 relative">
          {/* Cloud Servers */}
          <div className="flex-1 space-y-3">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest text-center mb-3">Cloud Servers</p>
            {health?.infrastructure?.servers?.map((s: any) => (
              <div key={s.id} className={`p-3 rounded-xl border ${s.status === 'ACTIVE' ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800 border-white/5'} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${s.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
                  <span className="text-xs font-bold text-white">{s.id}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{s.load}% load</span>
              </div>
            ))}
          </div>

          {/* Arrows */}
          <div className="flex flex-col items-center gap-2 px-4">
            <div className="w-16 h-0.5 bg-gradient-to-r from-green-500 to-violet-500 relative"><div className="data-flow absolute top-0 left-0 w-2 h-2 bg-violet-400 rounded-full -mt-[3px]"></div></div>
            <p className="text-[8px] text-slate-500 font-black">LOAD BALANCER</p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-violet-500 to-orange-500 relative"><div className="data-flow absolute top-0 left-0 w-2 h-2 bg-orange-400 rounded-full -mt-[3px]" style={{ animationDelay: '0.5s' }}></div></div>
          </div>

          {/* Edge Nodes */}
          <div className="flex-1 space-y-3">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest text-center mb-3">Edge Nodes</p>
            {health?.infrastructure?.edgeNodes?.slice(0, 4).map((n: any) => (
              <div key={n.nodeId} className={`p-3 rounded-xl border edge-glow ${n.status === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${n.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs font-bold text-white">{n.gateId}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{n.latency}ms</span>
              </div>
            ))}
          </div>

          {/* Arrows */}
          <div className="flex flex-col items-center gap-2 px-4">
            <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-blue-500 relative"><div className="data-flow absolute top-0 left-0 w-2 h-2 bg-blue-400 rounded-full -mt-[3px]" style={{ animationDelay: '1s' }}></div></div>
            <p className="text-[8px] text-slate-500 font-black">SCAN GATES</p>
          </div>

          {/* Zones */}
          <div className="flex-1 space-y-3">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest text-center mb-3">Zones</p>
            {health?.infrastructure?.zones?.map((z: any) => (
              <div key={z.name} className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                <span className="text-xs font-bold text-white">{z.name}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${z.status === 'OPTIMAL' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{z.capacity}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Performance */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl">
          <h3 className="font-black dark:text-white uppercase tracking-widest text-xs mb-6 flex items-center gap-2"><i className="fas fa-gauge-high text-orange-500"></i> Performance</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Registered', value: metrics?.totalRegistered || 0, icon: 'fa-users', color: 'text-blue-500' },
              { label: 'Active', value: metrics?.activePilgrims || 0, icon: 'fa-person-walking', color: 'text-green-500' },
              { label: 'Throughput/min', value: metrics?.throughputPerMinute || 0, icon: 'fa-bolt', color: 'text-yellow-500' },
              { label: 'Peak Load', value: `${metrics?.peakLoad || 0}%`, icon: 'fa-fire', color: 'text-red-500' },
              { label: 'Active Gates', value: `${metrics?.activeGates || 0}/${metrics?.totalGates || 0}`, icon: 'fa-door-open', color: 'text-violet-500' },
              { label: 'Scarves Ready', value: metrics?.scarfAvailable || 0, icon: 'fa-shirt', color: 'text-orange-500' },
            ].map(m => (
              <div key={m.label} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                <div className={`${m.color} mb-2`}><i className={`fas ${m.icon}`}></i></div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
                <p className="text-xl font-black dark:text-white">{m.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Privacy */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl">
          <h3 className="font-black dark:text-white uppercase tracking-widest text-xs mb-6 flex items-center gap-2"><i className="fas fa-lock text-green-500"></i> Privacy & Compliance</h3>
          <div className="space-y-4">
            {[
              { label: 'Encryption', value: health?.security?.encryption || 'AES-256-CBC', icon: 'fa-key', ok: true },
              { label: 'Hashing', value: health?.security?.hashing || 'SHA-256', icon: 'fa-hashtag', ok: true },
              { label: 'Biometric Storage', value: 'HASH-ONLY', icon: 'fa-eye', ok: true },
              { label: 'Raw Data Stored', value: 'NONE', icon: 'fa-ban', ok: true },
              { label: 'Data Retention', value: 'Auto-delete on exit', icon: 'fa-trash-clock', ok: true },
              { label: 'Compliance', value: 'DPDP Act 2023', icon: 'fa-certificate', ok: true },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <i className={`fas ${s.icon} text-slate-400 w-4 text-center`}></i>
                  <span className="text-xs font-bold dark:text-white">{s.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-green-600 dark:text-green-400">{s.value}</span>
                  <i className="fas fa-check-circle text-green-500 text-xs"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Events */}
      <div className="bg-slate-900 p-6 rounded-[2rem] shadow-2xl max-h-[300px] overflow-hidden">
        <h3 className="text-white font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
          <i className="fas fa-tower-broadcast text-red-500 animate-pulse"></i> Live Event Stream
        </h3>
        <div className="space-y-2 overflow-y-auto max-h-[220px] scrollbar-hide">
          {events.length === 0 ? (
            <p className="text-slate-500 text-xs text-center py-8">No events yet</p>
          ) : events.map((ev: any, i: number) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
              <div className={`w-2 h-2 rounded-full ${ev.type?.includes('ENTRY') ? 'bg-green-500' : ev.type?.includes('EXIT') ? 'bg-red-500' : 'bg-blue-500'}`}></div>
              <span className="text-[10px] font-mono text-slate-400 w-16">{new Date(ev.timestamp).toLocaleTimeString()}</span>
              <span className="text-[10px] font-black text-white/60 uppercase w-24">{ev.type}</span>
              <span className="text-xs text-slate-300 truncate flex-1">{ev.details}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
