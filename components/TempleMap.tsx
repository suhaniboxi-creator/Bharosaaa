import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Point {
  id: string; x: number; y: number; label: string; icon: string;
  type: 'entry' | 'exit' | 'helpdesk' | 'viewpoint' | 'visit' | 'facility' | 'security' | 'smart' | 'sanctum';
  color: string; congestion: 'low' | 'moderate' | 'high'; description?: string; fact?: string;
}

const KASHI_POINTS: Point[] = [
  // Entry Points
  { id: 'gate-1', x: 50, y: 370, label: 'Gate 1: River Side (Main)', icon: 'fa-door-open', type: 'entry', color: '#F97316', congestion: 'high', description: 'Primary entrance from the Ganga ghats. Highest pilgrim inflow.' },
  { id: 'gate-2', x: 200, y: 390, label: 'Gate 2: Vishwanath Gali', icon: 'fa-door-open', type: 'entry', color: '#F97316', congestion: 'moderate', description: 'Historic lane entrance through the narrow Vishwanath Gali market.' },
  { id: 'gate-3', x: 350, y: 370, label: 'Gate 3: Surge Control', icon: 'fa-door-open', type: 'entry', color: '#F97316', congestion: 'low', description: 'Opened during peak festival hours for overflow management.' },
  { id: 'gate-vip', x: 20, y: 250, label: 'VIP / Divyang Gate', icon: 'fa-crown', type: 'entry', color: '#EAB308', congestion: 'low', description: 'Priority access for VIPs, senior citizens, and Divyang pilgrims.' },
  // Exit Points
  { id: 'exit-a', x: 380, y: 80, label: 'Exit Gate A (North)', icon: 'fa-right-from-bracket', type: 'exit', color: '#ef4444', congestion: 'low', description: 'North exit leading to Lahori Tola road.' },
  { id: 'exit-b', x: 380, y: 200, label: 'Exit Gate B (East)', icon: 'fa-right-from-bracket', type: 'exit', color: '#ef4444', congestion: 'moderate', description: 'East exit near Kashi Vishwanath Corridor promenade.' },
  // Help Desks
  { id: 'medical', x: 50, y: 120, label: 'Medical Point', icon: 'fa-truck-medical', type: 'helpdesk', color: '#dc2626', congestion: 'low', description: 'First aid, oxygen, wheelchair, and ambulance services.' },
  { id: 'lost-found', x: 320, y: 300, label: 'Lost & Found', icon: 'fa-magnifying-glass', type: 'helpdesk', color: '#7c3aed', congestion: 'low', description: 'Report lost items, children, or elderly family members.' },
  { id: 'senior-help', x: 60, y: 200, label: 'Senior Assistance', icon: 'fa-wheelchair', type: 'helpdesk', color: '#0ea5e9', congestion: 'low', description: 'Wheelchair service, guided assistance for elderly pilgrims.' },
  // Main Viewpoints
  { id: 'sanctum', x: 200, y: 80, label: 'Garbhagriha (Sanctum)', icon: 'fa-om', type: 'sanctum', color: '#F97316', congestion: 'high', description: 'The sacred Jyotirlinga — heart of Kashi Vishwanath.', fact: 'One of the 12 Jyotirlingas, believed to be the axis of the universe in Hindu cosmology.' },
  { id: 'spire-view', x: 280, y: 60, label: 'Golden Spire Deck', icon: 'fa-sun', type: 'viewpoint', color: '#eab308', congestion: 'moderate', description: 'Best vantage point for the 15.5m gold-plated spire.', fact: 'The spire is plated with 800kg of pure gold, donated by Maharaja Ranjit Singh in 1835.' },
  { id: 'nandi', x: 130, y: 110, label: 'Nandi Mandap', icon: 'fa-cow', type: 'viewpoint', color: '#b45309', congestion: 'moderate', description: 'Sacred Nandi bull statue facing the sanctum.', fact: 'Nandi is the divine vehicle of Lord Shiva and the eternal guardian of the temple.' },
  // Places to Visit
  { id: 'gyanvapi', x: 100, y: 50, label: 'Gyanvapi Well', icon: 'fa-water', type: 'visit', color: '#3b82f6', congestion: 'low', description: 'The Well of Knowledge — ancient sacred well.', fact: 'Legend says the original Jyotirlinga was hidden here during Mughal invasions.' },
  { id: 'kal-bhairav', x: 50, y: 30, label: 'Kal Bhairav Temple', icon: 'fa-fire', type: 'visit', color: '#8b5cf6', congestion: 'low', description: 'Temple of the fierce guardian deity of Kashi.', fact: 'Every visitor to Kashi must first visit Kal Bhairav for divine permission.' },
  { id: 'annapurna', x: 150, y: 30, label: 'Annapurna Temple', icon: 'fa-bowl-food', type: 'visit', color: '#10b981', congestion: 'low', description: 'Temple of the goddess of nourishment.', fact: 'Ma Annapurna is believed to feed every being in Kashi — no one goes hungry here.' },
  { id: 'manikarnika', x: 350, y: 30, label: 'Manikarnika Ghat View', icon: 'fa-fire-flame-curved', type: 'visit', color: '#f59e0b', congestion: 'low', description: 'Sacred cremation ghat visible from the corridor.', fact: 'One of the oldest and most sacred cremation ghats, burning continuously for 5000+ years.' },
  // Facilities
  { id: 'water-1', x: 300, y: 250, label: 'Drinking Water', icon: 'fa-faucet-drip', type: 'facility', color: '#3b82f6', congestion: 'low', description: 'Free purified drinking water station.' },
  { id: 'water-2', x: 100, y: 300, label: 'Drinking Water', icon: 'fa-faucet-drip', type: 'facility', color: '#3b82f6', congestion: 'low' },
  { id: 'rest-1', x: 80, y: 160, label: 'Rest Zone', icon: 'fa-couch', type: 'facility', color: '#8b5cf6', congestion: 'low', description: 'Shaded seating area with fans.' },
  { id: 'shoe-store', x: 150, y: 350, label: 'Shoe Storage', icon: 'fa-shoe-prints', type: 'facility', color: '#64748b', congestion: 'moderate', description: 'Secure shoe lockers with digital tokens.' },
  { id: 'prasad', x: 250, y: 150, label: 'Prasad Counter', icon: 'fa-cookie', type: 'facility', color: '#f97316', congestion: 'moderate', description: 'Sacred prasad distribution point.' },
  { id: 'donation', x: 300, y: 120, label: 'Donation Counter', icon: 'fa-hand-holding-heart', type: 'facility', color: '#10b981', congestion: 'low', description: 'Digital and cash donation facility.' },
  // Security & Smart Infrastructure
  { id: 'security-1', x: 120, y: 320, label: 'Security Check', icon: 'fa-shield-halved', type: 'security', color: '#64748b', congestion: 'high', description: 'Bag scan and metal detector checkpoint.' },
  { id: 'biometric-1', x: 150, y: 280, label: 'Iris Verification', icon: 'fa-eye', type: 'smart', color: '#6366f1', congestion: 'moderate', description: 'Biometric iris scan verification counter.' },
  { id: 'biometric-2', x: 250, y: 320, label: 'Iris Verification', icon: 'fa-eye', type: 'smart', color: '#6366f1', congestion: 'low' },
  { id: 'qr-gate-1', x: 170, y: 240, label: 'QR Scan Gate', icon: 'fa-qrcode', type: 'smart', color: '#0ea5e9', congestion: 'moderate', description: 'Automated QR scarf scanner for entry validation.' },
  { id: 'qr-gate-2', x: 230, y: 240, label: 'QR Scan Gate', icon: 'fa-qrcode', type: 'smart', color: '#0ea5e9', congestion: 'low' },
  { id: 'crowd-sensor', x: 200, y: 170, label: 'Crowd Sensor', icon: 'fa-tower-broadcast', type: 'smart', color: '#ec4899', congestion: 'low', description: 'AI-powered crowd density sensor for real-time monitoring.' },
  { id: 'edge-node', x: 200, y: 310, label: 'Edge Node', icon: 'fa-microchip', type: 'smart', color: '#14b8a6', congestion: 'low', description: 'Local edge computing node for offline-resilient operations.' },
];

interface TempleMapProps {
  themeColor: string; assignedGate?: string; sosActive?: boolean; onPointClick?: (point: Point) => void;
}

export const TempleMap: React.FC<TempleMapProps> = ({ themeColor, assignedGate = 'gate-2', sosActive = false, onPointClick }) => {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [activePoint, setActivePoint] = useState<Point | null>(null);
  const [userPos, setUserPos] = useState({ x: 200, y: 380 });
  const [isNavigating, setIsNavigating] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [points, setPoints] = useState<Point[]>(KASHI_POINTS);

  useEffect(() => {
    const interval = setInterval(() => {
      setPoints(prev => prev.map(p => {
        if (Math.random() > 0.85) {
          const levels: ('low' | 'moderate' | 'high')[] = ['low', 'moderate', 'high'];
          return { ...p, congestion: levels[Math.floor(Math.random() * levels.length)] };
        }
        return p;
      }));
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isNavigating || sosActive) {
      const interval = setInterval(() => {
        setUserPos(prev => {
          const target = points.find(p => p.id === (sosActive ? 'exit-a' : 'sanctum'))!;
          const dx = target.x - prev.x, dy = target.y - prev.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 5) { if (!sosActive) setIsNavigating(false); return prev; }
          return { x: prev.x + (dx / dist) * 2, y: prev.y + (dy / dist) * 2 };
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isNavigating, sosActive, points]);

  const congestionColor = (l: string) => l === 'low' ? '#22c55e' : l === 'moderate' ? '#eab308' : '#ef4444';

  const typeConfig: Record<string, { label: string; bg: string }> = {
    entry: { label: '🚪 Entry', bg: 'bg-orange-500' },
    exit: { label: '🚪 Exit', bg: 'bg-red-500' },
    helpdesk: { label: '🆘 Help', bg: 'bg-purple-500' },
    viewpoint: { label: '👁️ View', bg: 'bg-yellow-500' },
    visit: { label: '📍 Visit', bg: 'bg-blue-500' },
    facility: { label: '🔵 Facility', bg: 'bg-slate-500' },
    security: { label: '🛡️ Security', bg: 'bg-slate-600' },
    smart: { label: '📡 Smart', bg: 'bg-teal-500' },
    sanctum: { label: '🛕 Sanctum', bg: 'bg-orange-600' },
  };

  const filteredPoints = filter === 'all' ? points : points.filter(p => p.type === filter);

  const navPath = useMemo(() => {
    const s = userPos;
    const gate = points.find(p => p.id === assignedGate) || points[0];
    const sec = points.find(p => p.id === 'security-1')!;
    const qr = points.find(p => p.id === 'qr-gate-1')!;
    const sanctum = points.find(p => p.id === 'sanctum')!;
    return `M ${s.x} ${s.y} L ${gate.x} ${gate.y} L ${sec.x} ${sec.y} L ${qr.x} ${qr.y} L ${sanctum.x} ${sanctum.y}`;
  }, [userPos, assignedGate, points]);

  return (
    <div className="bg-[#FFFDF5] dark:bg-slate-950 rounded-[3rem] p-6 shadow-2xl border border-[#FDE68A] dark:border-white/5 overflow-hidden relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-2xl font-black italic tracking-tighter text-[#B45309] dark:text-white">Kashi Vishwanath Blueprint</h3>
          <p className="text-[9px] text-[#D97706] font-black uppercase tracking-[0.3em]">Interactive Temple Complex Map</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowHeatmap(!showHeatmap)} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${showHeatmap ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            <i className="fas fa-fire-flame-curved mr-1"></i> Heatmap
          </button>
          <button onClick={() => { setIsNavigating(true); }} className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-orange-500 text-white">
            <i className="fas fa-route mr-1"></i> Navigate
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>All</button>
        {Object.entries(typeConfig).map(([key, val]) => (
          <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${filter === key ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>{val.label}</button>
        ))}
      </div>

      {/* Map */}
      <div className="relative aspect-[4/3] bg-[#FDFBF0] dark:bg-slate-900/50 rounded-[2rem] border-2 border-[#FDE68A] dark:border-white/5 overflow-hidden blueprint-bg">
        {/* SOS Overlay */}
        {sosActive && (
          <div className="absolute inset-0 z-50 pointer-events-none">
            <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
              <i className="fas fa-exclamation-triangle animate-ping"></i> SOS: FOLLOW RED PATH
            </div>
          </div>
        )}

        {/* Heatmap */}
        <AnimatePresence>
          {showHeatmap && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} className="absolute inset-0 z-0 pointer-events-none">
              {points.filter(p => p.congestion === 'high').map(p => (
                <div key={`h-${p.id}`} className="absolute rounded-full blur-3xl animate-pulse" style={{ left: `${(p.x/400)*100}%`, top: `${(p.y/400)*100}%`, width: 100, height: 100, backgroundColor: '#ef4444', transform: 'translate(-50%,-50%)' }}></div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <svg viewBox="0 0 400 420" className="w-full h-full relative z-10">
          {/* Temple complex outline */}
          <rect x="70" y="20" width="260" height="160" rx="12" fill="none" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="6 3" className="dark:stroke-slate-700" />
          <text x="200" y="14" textAnchor="middle" className="text-[6px] fill-slate-300 dark:fill-slate-600 font-bold uppercase">Temple Complex</text>
          {/* Inner sanctum area */}
          <rect x="160" y="55" width="80" height="70" rx="8" fill="none" stroke="#F97316" strokeWidth="1" opacity="0.3" />
          {/* Corridor */}
          <rect x="120" y="200" width="160" height="140" rx="10" fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" className="dark:stroke-slate-700" />
          <text x="200" y="195" textAnchor="middle" className="text-[5px] fill-slate-300 dark:fill-slate-600 font-bold uppercase">Kashi Vishwanath Corridor</text>
          {/* Entry zone */}
          <rect x="30" y="340" width="340" height="70" rx="10" fill="none" stroke="#F97316" strokeWidth="1" opacity="0.2" />
          <text x="200" y="336" textAnchor="middle" className="text-[5px] fill-orange-300 font-bold uppercase">Entry Zone</text>

          {/* Navigation Path */}
          {isNavigating && !sosActive && (
            <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 3 }}
              d={navPath} fill="none" stroke={themeColor} strokeWidth="8" strokeLinecap="round" strokeDasharray="12 6" opacity="0.7" />
          )}
          {sosActive && (
            <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
              d={`M ${userPos.x} ${userPos.y} L 50 120 L 380 80`} fill="none" stroke="#dc2626" strokeWidth="8" strokeLinecap="round" strokeDasharray="8 4" />
          )}

          {/* Points */}
          {filteredPoints.map(pt => {
            const isAssigned = pt.id === assignedGate;
            return (
              <g key={pt.id} className="cursor-pointer" onClick={() => { setActivePoint(pt); onPointClick?.(pt); }}>
                <circle cx={pt.x} cy={pt.y} r={isAssigned ? 18 : 13} fill="none" stroke={congestionColor(pt.congestion)} strokeWidth="1.5" className={pt.congestion === 'high' ? 'animate-pulse' : ''} />
                <circle cx={pt.x} cy={pt.y} r={isAssigned ? 15 : 10} fill="white" className="dark:fill-slate-800" />
                {isAssigned && <motion.circle cx={pt.x} cy={pt.y} r="20" stroke={themeColor} fill="none" strokeWidth="2" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} />}
                <foreignObject x={pt.x - 7} y={pt.y - 7} width="14" height="14">
                  <div className="flex items-center justify-center h-full" style={{ color: isAssigned ? themeColor : pt.color }}>
                    <i className={`fas ${pt.icon}`} style={{ fontSize: '7px' }}></i>
                  </div>
                </foreignObject>
                <text x={pt.x} y={pt.y + (isAssigned ? 28 : 22)} textAnchor="middle" className="text-[5px] font-bold uppercase fill-slate-400 dark:fill-slate-500">{pt.label.split(':')[0]}</text>
              </g>
            );
          })}

          {/* You Are Here */}
          <motion.g animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
            <circle cx={userPos.x} cy={userPos.y} r="8" fill={sosActive ? '#dc2626' : themeColor} />
            <circle cx={userPos.x} cy={userPos.y} r="14" stroke={sosActive ? '#dc2626' : themeColor} fill="none" strokeWidth="1.5" opacity="0.3" />
            <foreignObject x={userPos.x - 5} y={userPos.y - 5} width="10" height="10">
              <div className="flex items-center justify-center h-full text-white"><i className="fas fa-user" style={{ fontSize: '6px' }}></i></div>
            </foreignObject>
          </motion.g>
        </svg>

        {/* Info Popup */}
        <AnimatePresence>
          {activePoint && (
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-3 left-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 rounded-2xl border border-orange-200 dark:border-white/10 shadow-2xl z-[60]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: activePoint.color }}>
                    <i className={`fas ${activePoint.icon} text-sm`}></i>
                  </div>
                  <div>
                    <h4 className="font-black text-sm italic tracking-tighter dark:text-white">{activePoint.label}</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: congestionColor(activePoint.congestion) }}></div>
                      <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">{activePoint.congestion} congestion</span>
                      <span className="text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400">{activePoint.type}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setActivePoint(null)} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times text-xs"></i></button>
              </div>
              {activePoint.description && <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2">{activePoint.description}</p>}
              {activePoint.fact && (
                <div className="mt-3 p-2.5 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-100 dark:border-orange-500/20 flex items-start gap-2">
                  <i className="fas fa-scroll text-orange-500 text-[9px] mt-0.5"></i>
                  <p className="text-[9px] font-medium text-orange-700 dark:text-orange-400 leading-relaxed">{activePoint.fact}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {Object.entries(typeConfig).map(([key, val]) => {
          const count = points.filter(p => p.type === key).length;
          return (
            <div key={key} className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 px-2 py-1.5 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${val.bg}`}></div>
              <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">{val.label} ({count})</span>
            </div>
          );
        })}
      </div>

      {/* Congestion Legend */}
      <div className="mt-3 flex justify-center gap-6 opacity-50">
        {[{ l: 'Optimal', c: '#22c55e' }, { l: 'Moderate', c: '#eab308' }, { l: 'Critical', c: '#ef4444' }].map(i => (
          <div key={i.l} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: i.c }}></div>
            <span className="text-[7px] font-black uppercase tracking-widest">{i.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
