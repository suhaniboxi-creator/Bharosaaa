
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Point {
  id: string;
  x: number;
  y: number;
  label: string;
  icon: string;
  type: 'gate' | 'queue' | 'sanctum' | 'emergency' | 'utility' | 'security' | 'donation' | 'heritage';
  color: string;
  congestion: 'low' | 'moderate' | 'high';
  description?: string;
  fact?: string;
}

const KASHI_POINTS: Point[] = [
  { id: 'gate-1', x: 50, y: 350, label: 'Gate 1: Main Corridor', icon: 'fa-door-open', type: 'gate', color: '#F97316', congestion: 'high', description: 'The grand entrance from the river side.' },
  { id: 'gate-2', x: 350, y: 350, label: 'Gate 2: Secondary Entry', icon: 'fa-door-open', type: 'gate', color: '#F97316', congestion: 'low', description: 'Faster entry for local pilgrims.' },
  { id: 'gate-3', x: 200, y: 380, label: 'Gate 3: Surge Control', icon: 'fa-door-open', type: 'gate', color: '#F97316', congestion: 'moderate', description: 'Opened during peak festival hours.' },
  { id: 'gate-vip', x: 20, y: 200, label: 'VIP Entry Gate', icon: 'fa-crown', type: 'gate', color: '#EAB308', congestion: 'low', description: 'Priority access for special permits.' },
  { id: 'security', x: 100, y: 300, label: 'Security Check', icon: 'fa-shield-halved', type: 'security', color: '#64748b', congestion: 'high' },
  { id: 'waiting', x: 200, y: 250, label: 'Waiting Area', icon: 'fa-chair', type: 'queue', color: '#94a3b8', congestion: 'moderate' },
  { id: 'sanctum', x: 200, y: 80, label: 'Garbhagriha (Sanctum)', icon: 'fa-om', type: 'sanctum', color: '#F97316', congestion: 'high', description: 'The sacred heart of the temple.' },
  { id: 'donation', x: 300, y: 150, label: 'Donation Area', icon: 'fa-hand-holding-heart', type: 'donation', color: '#10b981', congestion: 'low' },
  { id: 'exit', x: 380, y: 100, label: 'Exit Gate', icon: 'fa-door-closed', type: 'gate', color: '#ef4444', congestion: 'low' },
  { id: 'sos-1', x: 50, y: 100, label: 'Medical Point', icon: 'fa-truck-medical', type: 'emergency', color: '#dc2626', congestion: 'low' },
  { id: 'water-1', x: 320, y: 250, label: 'Drinking Water', icon: 'fa-faucet-drip', type: 'utility', color: '#3b82f6', congestion: 'low' },
  { id: 'rest-1', x: 80, y: 180, label: 'Rest Zone', icon: 'fa-couch', type: 'utility', color: '#8b5cf6', congestion: 'low' },
  { id: 'heritage-1', x: 150, y: 150, label: 'Ancient Pillar', icon: 'fa-monument', type: 'heritage', color: '#b45309', congestion: 'low', description: 'A 1000-year old stone carving with sacred geometry.', fact: 'This pillar was carved from a single block of Chunar sandstone and depicts the 12 Jyotirlingas.' },
  { id: 'heritage-2', x: 280, y: 80, label: 'Golden Spire View', icon: 'fa-sun', type: 'heritage', color: '#b45309', congestion: 'low', description: 'Best spot to view the 15.5m high golden spire.', fact: 'The spire is plated with 800kg of pure gold, donated by Maharaja Ranjit Singh.' },
  { id: 'heritage-3', x: 100, y: 50, label: 'Gyanvapi Well', icon: 'fa-faucet', type: 'heritage', color: '#b45309', congestion: 'low', description: 'The Well of Knowledge.', fact: 'Legend says the original Jyotirlinga was hidden in this well during an invasion.' },
];

interface TempleMapProps {
  themeColor: string;
  assignedGate?: string;
  sosActive?: boolean;
  onPointClick?: (point: Point) => void;
}

export const TempleMap: React.FC<TempleMapProps> = ({ themeColor, assignedGate = 'gate-1', sosActive = false, onPointClick }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [activePoint, setActivePoint] = useState<Point | null>(null);
  const [userPos, setUserPos] = useState({ x: 60, y: 340 });
  const [proximityHeritage, setProximityHeritage] = useState<Point | null>(null);
  const [isRerouted, setIsRerouted] = useState(false);

  // Proximity Detection for Heritage
  useEffect(() => {
    const heritagePoints = KASHI_POINTS.filter(p => p.type === 'heritage');
    const nearby = heritagePoints.find(p => {
      const dist = Math.sqrt(Math.pow(p.x - userPos.x, 2) + Math.pow(p.y - userPos.y, 2));
      return dist < 40;
    });
    
    if (nearby && proximityHeritage?.id !== nearby.id) {
      setProximityHeritage(nearby);
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => setProximityHeritage(null), 8000);
      return () => clearTimeout(timer);
    } else if (!nearby) {
      setProximityHeritage(null);
    }
  }, [userPos]);

  // Dynamic Rerouting Logic
  useEffect(() => {
    const gate = KASHI_POINTS.find(p => p.id === assignedGate);
    const security = KASHI_POINTS.find(p => p.id === 'security');
    
    if ((gate?.congestion === 'high' || security?.congestion === 'high') && !isRerouted) {
      setIsRerouted(true);
    }
  }, [assignedGate]);

  // Simulate movement
  useEffect(() => {
    if (isNavigating || sosActive) {
      const interval = setInterval(() => {
        setUserPos(prev => {
          const targetId = sosActive ? 'exit' : 'sanctum';
          const target = KASHI_POINTS.find(p => p.id === targetId)!;
          const dx = target.x - prev.x;
          const dy = target.y - prev.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 5) {
            if (!sosActive) setIsNavigating(false);
            return prev;
          }
          return {
            x: prev.x + (dx / dist) * 2,
            y: prev.y + (dy / dist) * 2
          };
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isNavigating, sosActive]);

  const congestionColor = (level: string) => {
    switch (level) {
      case 'low': return '#22c55e';
      case 'moderate': return '#eab308';
      case 'high': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const navigationPath = useMemo(() => {
    const start = userPos;
    let gate = KASHI_POINTS.find(p => p.id === assignedGate) || KASHI_POINTS[0];
    let security = KASHI_POINTS.find(p => p.id === 'security')!;
    const waiting = KASHI_POINTS.find(p => p.id === 'waiting')!;
    const sanctum = KASHI_POINTS.find(p => p.id === 'sanctum')!;

    // If rerouted, bypass high congestion points
    if (isRerouted) {
      // Find a low congestion gate instead
      const altGate = KASHI_POINTS.find(p => p.type === 'gate' && p.congestion === 'low' && p.id !== 'exit') || gate;
      gate = altGate;
      // If security is high, we might suggest a direct path to a utility point first or a different check
      // For simulation, we'll just adjust the path to look "different" and avoid the security node visually
      return `M ${start.x} ${start.y} Q ${gate.x - 50} ${gate.y - 50} ${gate.x} ${gate.y} L ${waiting.x} ${waiting.y} L ${sanctum.x} ${sanctum.y}`;
    }
    
    return `M ${start.x} ${start.y} L ${gate.x} ${gate.y} L ${security.x} ${security.y} L ${waiting.x} ${waiting.y} L ${sanctum.x} ${sanctum.y}`;
  }, [userPos, assignedGate, isRerouted]);

  const sosPath = useMemo(() => {
    const start = userPos;
    const medical = KASHI_POINTS.find(p => p.id === 'sos-1')!;
    const exit = KASHI_POINTS.find(p => p.id === 'exit')!;
    return `M ${start.x} ${start.y} L ${medical.x} ${medical.y} L ${exit.x} ${exit.y}`;
  }, [userPos]);

  return (
    <div className="bg-[#FFFDF5] dark:bg-slate-950 rounded-[3.5rem] p-8 shadow-2xl border border-[#FDE68A] dark:border-white/5 overflow-hidden relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <h3 className="text-3xl font-black italic tracking-tighter text-[#B45309] dark:text-white">Kashi Divine Guide</h3>
          <p className="text-[10px] text-[#D97706] font-black uppercase tracking-[0.4em]">Integrated Smart Scarf Map</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="bg-[#FEF3C7] dark:bg-orange-500/10 px-4 py-2 rounded-2xl border border-[#FDE68A] dark:border-orange-500/20">
            <p className="text-[9px] font-black text-[#B45309] dark:text-orange-400 uppercase tracking-widest">Wait Time: ~14m</p>
          </div>
          <div className="flex gap-2">
             <button 
               onClick={() => setShowHeatmap(!showHeatmap)}
               className={`p-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showHeatmap ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
             >
               <i className="fas fa-fire-flame-curved mr-1"></i> Heatmap
             </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative aspect-square bg-[#FDFBF0] dark:bg-slate-900/50 rounded-[3rem] border-4 border-[#FEF3C7] dark:border-white/5 overflow-hidden p-4 shadow-inner">
        
        {/* SOS Overlay */}
        <AnimatePresence>
          {sosActive && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 pointer-events-none"
            >
              <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl flex items-center gap-3">
                <i className="fas fa-exclamation-triangle animate-ping"></i> SOS ACTIVE: FOLLOW RED PATH
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reroute Notification */}
        <AnimatePresence>
          {isRerouted && !sosActive && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            >
              <div className="bg-indigo-600 text-white px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-3">
                <i className="fas fa-shuffle animate-pulse"></i> Congestion Detected: Rerouting to Optimal Path
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Heritage Proximity Pop-up */}
        <AnimatePresence>
          {proximityHeritage && (
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="absolute top-20 left-4 z-[70] max-w-[200px] pointer-events-auto"
            >
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border-l-4 border-orange-500 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <i className="fas fa-scroll text-orange-500 text-xs"></i>
                  <span className="text-[9px] font-black uppercase tracking-widest dark:text-white">Heritage Insight</span>
                </div>
                <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {(proximityHeritage as any).fact}
                </p>
                <button 
                  onClick={() => setProximityHeritage(null)}
                  className="mt-2 text-[8px] font-black uppercase text-slate-400 hover:text-slate-600"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Heatmap Layer */}
        <AnimatePresence>
          {showHeatmap && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-0 pointer-events-none"
            >
              {KASHI_POINTS.filter(p => p.congestion === 'high').map(p => (
                <div 
                  key={`heat-${p.id}`}
                  className="absolute rounded-full blur-3xl animate-pulse"
                  style={{ 
                    left: p.x - 60, 
                    top: p.y - 60, 
                    width: 120, 
                    height: 120, 
                    backgroundColor: '#ef4444' 
                  }}
                ></div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <svg viewBox="0 0 400 400" className="w-full h-full relative z-10">
          {/* Temple Walls / Structure */}
          <rect x="150" y="50" width="100" height="100" rx="20" fill="none" stroke="#E5E7EB" strokeWidth="2" className="dark:stroke-slate-700" />
          <path d="M 50 380 L 350 380 L 350 320 L 50 320 Z" fill="none" stroke="#E5E7EB" strokeWidth="2" className="dark:stroke-slate-700" />

          {/* Paths */}
          <path 
            d="M 50 350 L 100 300 L 200 250 L 200 80" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="30" 
            className="text-slate-100 dark:text-slate-800/50"
            strokeLinecap="round"
          />
          
          {/* Active Navigation Path */}
          <AnimatePresence>
            {isNavigating && !sosActive && (
              <motion.path 
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 3, ease: "linear" }}
                d={navigationPath}
                fill="none" 
                stroke={themeColor} 
                strokeWidth="12" 
                strokeLinecap="round"
                strokeDasharray="15 10"
                className="animate-[pulse_2s_infinite]"
              />
            )}
          </AnimatePresence>

          {/* SOS Path */}
          <AnimatePresence>
            {sosActive && (
              <motion.path 
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "linear" }}
                d={sosPath}
                fill="none" 
                stroke="#dc2626" 
                strokeWidth="12" 
                strokeLinecap="round"
                strokeDasharray="10 5"
              />
            )}
          </AnimatePresence>

          {/* Points of Interest */}
          {KASHI_POINTS.map((pt) => {
            const isAssigned = pt.id === assignedGate;
            return (
              <g 
                key={pt.id} 
                className="cursor-pointer group"
                onClick={() => {
                  setActivePoint(pt);
                  onPointClick?.(pt);
                }}
              >
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r={isAssigned ? "24" : "18"} 
                  fill="none" 
                  stroke={congestionColor(pt.congestion)} 
                  strokeWidth="2" 
                  className={pt.congestion === 'high' ? 'animate-pulse' : ''}
                />
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r={isAssigned ? "20" : "15"} 
                  fill="white" 
                  className="dark:fill-slate-800 shadow-xl" 
                />
                {isAssigned && (
                  <motion.circle 
                    cx={pt.x} cy={pt.y} r="25" 
                    stroke={themeColor} fill="none" strokeWidth="2" 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
                <foreignObject x={pt.x - 10} y={pt.y - 10} width="20" height="20">
                  <div className="flex items-center justify-center h-full" style={{ color: isAssigned ? themeColor : pt.color }}>
                    <i className={`fas ${pt.icon} text-[10px]`}></i>
                  </div>
                </foreignObject>
                <text 
                  x={pt.x} 
                  y={pt.y + 35} 
                  textAnchor="middle" 
                  className={`text-[7px] font-black uppercase tracking-widest transition-all ${activePoint?.id === pt.id ? 'fill-orange-600 opacity-100' : 'fill-slate-400 opacity-0 group-hover:opacity-100'}`}
                >
                  {pt.label}
                </text>
              </g>
            );
          })}

          {/* "You Are Here" Indicator */}
          <motion.g
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <circle cx={userPos.x} cy={userPos.y} r="10" fill={sosActive ? '#dc2626' : themeColor} className="shadow-2xl" />
            <circle cx={userPos.x} cy={userPos.y} r="18" stroke={sosActive ? '#dc2626' : themeColor} fill="none" strokeWidth="2" className="opacity-30" />
            <foreignObject x={userPos.x - 6} y={userPos.y - 6} width="12" height="12">
              <div className="flex items-center justify-center h-full text-white">
                <i className="fas fa-user text-[7px]"></i>
              </div>
            </foreignObject>
          </motion.g>
        </svg>

        {/* Info Pop-up */}
        <AnimatePresence>
          {activePoint && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-6 rounded-3xl border border-orange-200 dark:border-white/10 shadow-2xl z-[60]"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: activePoint.color }}>
                    <i className={`fas ${activePoint.icon}`}></i>
                  </div>
                  <div>
                    <h4 className="font-black text-lg italic tracking-tighter dark:text-white">{activePoint.label}</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: congestionColor(activePoint.congestion) }}></div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{activePoint.congestion} Congestion</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setActivePoint(null)} className="text-slate-400 hover:text-slate-600">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              {activePoint.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-4">
                  {activePoint.description}
                </p>
              )}
              {activePoint.type === 'heritage' && (
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-100 dark:border-orange-500/20 flex items-center gap-3">
                   <i className="fas fa-scroll text-orange-500"></i>
                   <p className="text-[9px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-widest">Heritage Insight Unlocked! +5 Aura</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-8">
        <div className="bg-[#FEF3C7] dark:bg-slate-800 p-6 rounded-3xl border border-[#FDE68A] dark:border-white/5 flex flex-col justify-center shadow-xl">
           <p className="text-[10px] font-black text-[#B45309] dark:text-slate-400 uppercase tracking-widest mb-2 text-center">Assigned Entry Point</p>
           <p className="text-2xl font-black text-[#B45309] dark:text-white italic tracking-tighter text-center">GATE 2</p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-6 opacity-60">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-[8px] font-black uppercase tracking-widest">Optimal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <span className="text-[8px] font-black uppercase tracking-widest">Moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-[8px] font-black uppercase tracking-widest">Critical</span>
        </div>
      </div>
    </div>
  );
};
