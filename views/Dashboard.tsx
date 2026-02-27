
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { EmergencyAlert, AlertStatus, Temple } from '../types';

const MOCK_DATA = [
  { time: '08:00', count: 450 }, { time: '09:00', count: 820 }, { time: '10:00', count: 1200 },
  { time: '11:00', count: 950 }, { time: '12:00', count: 700 }, { time: '13:00', count: 600 },
];

interface DashboardProps {
  alerts: EmergencyAlert[];
  onUpdateAlert: (id: string, status: AlertStatus, team?: string) => void;
  t: (key: any) => string;
  currentTemple?: Temple;
}

export const Dashboard: React.FC<DashboardProps> = ({ alerts, onUpdateAlert, t, currentTemple }) => {
  const activeAlerts = alerts.filter(a => a.status !== 'RESOLVED');
  const themeColor = currentTemple?.themeColor || '#3b82f6';

  const stats = [
    { label: 'Live Visitors', val: '2,481', icon: 'fa-users', colorClass: 'text-blue-500', bgClass: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Wait Estimate', val: '14m', icon: 'fa-clock', colorClass: 'text-orange-500', bgClass: 'bg-orange-50 dark:bg-orange-500/10' },
    { label: 'SOS Handled', val: alerts.filter(a => a.status === 'RESOLVED').length, icon: 'fa-shield-heart', colorClass: 'text-green-500', bgClass: 'bg-green-50 dark:bg-green-500/10' },
    { label: 'Active Alerts', val: activeAlerts.length, icon: 'fa-fire', colorClass: 'text-red-500', bgClass: 'bg-red-50 dark:bg-red-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 transition-all hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center ${stat.bgClass} ${stat.colorClass} shadow-sm`}>
              <i className={`fas ${stat.icon} text-xl`}></i>
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stat.val}</h4>
          </div>
        ))}
      </div>

      {/* Predictive AI Model Section */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 transition-colors duration-300">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-brain"></i>
            </div>
            <div>
              <h3 className="text-xl font-black dark:text-white italic tracking-tight">Predictive AI Crowd Model</h3>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Real-time Density & Route Optimization</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Model Confidence: 98.4%</span>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { color: 'RED', label: 'Red Scarf Route', route: 'Gate 1 → Corridor A → Sanctum', status: 'Optimal', colorHex: '#ef4444' },
            { color: 'ORANGE', label: 'Orange Scarf Route', route: 'Gate 2 → Corridor B → Sanctum', status: 'Moderate', colorHex: '#f97316' },
            { color: 'YELLOW', label: 'Yellow Scarf Route', route: 'Gate 3 → Corridor C → Sanctum', status: 'High Density', colorHex: '#eab308' },
            { color: 'BROWN', label: 'Brown Scarf Route', route: 'Gate 1 → Corridor D → Sanctum', status: 'Optimal', colorHex: '#78350f' },
          ].map((item) => (
            <div key={item.color} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.colorHex }}></div>
                <span className="text-xs font-black dark:text-white uppercase tracking-widest">{item.label}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">AI Suggested Route</p>
              <p className="text-sm font-black text-slate-800 dark:text-slate-200 italic mb-4">{item.route}</p>
              <div className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                item.status === 'Optimal' ? 'bg-green-500/10 text-green-500' : 
                item.status === 'Moderate' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 flex flex-col transition-colors duration-300 min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black flex items-center gap-3 dark:text-white">
              <i className={`fas ${currentTemple?.icon || 'fa-wave-square'}`} style={{ color: themeColor }}></i> Crowd Density
            </h3>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
               <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeColor }}></span>
               Live {currentTemple?.name} Flow
            </div>
          </div>
          {/* 
            To fix the ResponsiveContainer width(-1) error:
            Ensure the wrapper div has a concrete height (h-[300px] or flex-1 with parent height)
            and use minWidth={0} / minHeight={0} on ResponsiveContainer.
          */}
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={MOCK_DATA}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={themeColor} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '15px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#1e293b',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  cursor={{ stroke: themeColor, strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="count" stroke={themeColor} strokeWidth={4} fillOpacity={1} fill="url(#colorTraffic)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-black text-white p-8 rounded-[2rem] shadow-2xl flex flex-col relative overflow-hidden h-full transition-colors duration-300 min-h-[450px]">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <i className={`fas ${currentTemple?.icon || 'fa-robot'} text-9xl`}></i>
          </div>
          <h3 className="text-xl font-black mb-6 flex items-center gap-3 relative z-10">
            <i className="fas fa-tower-broadcast text-red-500 animate-pulse"></i> {t('activeEmergencies')}
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 relative z-10 scrollbar-hide">
            {alerts.length === 0 ? (
              <div className="text-center py-20 opacity-20 flex flex-col items-center">
                <i className={`fas ${currentTemple?.icon || 'fa-shield-heart'} text-6xl mb-4`}></i>
                <p className="font-bold uppercase tracking-widest text-[10px]">Command Center Clear</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className={`p-5 rounded-2xl border-l-4 transition-all duration-300 ${
                  alert.status === 'ACTIVE' ? 'bg-red-500/10 border-red-500 shadow-lg shadow-red-900/20' :
                  alert.status === 'EN_ROUTE' ? 'bg-blue-500/10 border-blue-500' : 'bg-white/5 border-white/20'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm">{alert.pilgrimName}</span>
                    <span className="text-[10px] font-mono opacity-50 bg-white/10 px-2 py-0.5 rounded-full">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs opacity-60 mb-4 flex items-center gap-2">
                    <i className="fas fa-location-dot text-red-400"></i> {alert.location}
                  </p>
                  
                  <div className="flex flex-col gap-2">
                    {alert.status === 'ACTIVE' && (
                      <button 
                        onClick={() => onUpdateAlert(alert.id, 'EN_ROUTE', 'Quick Response 07')} 
                        className="w-full py-2.5 bg-white text-slate-900 text-[10px] font-black rounded-xl hover:bg-slate-100 transition-colors uppercase tracking-widest"
                      >
                        Acknowledge & Dispatch
                      </button>
                    )}
                    {alert.status === 'EN_ROUTE' && (
                      <button 
                        onClick={() => onUpdateAlert(alert.id, 'RESOLVED')} 
                        className="w-full py-2.5 bg-green-500 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-green-600 transition-colors"
                      >
                        Signal Resolved
                      </button>
                    )}
                    {alert.status === 'RESOLVED' && (
                      <div className="flex items-center gap-2 text-[10px] font-black text-green-400 uppercase bg-green-500/10 py-2 px-3 rounded-xl border border-green-500/20">
                        <i className="fas fa-check-circle"></i> Assistance Completed
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 text-center relative z-10 opacity-40">
             <p className="text-[9px] uppercase font-black tracking-[0.3em]">{currentTemple?.name} Central Command</p>
          </div>
        </div>
      </div>
    </div>
  );
};
