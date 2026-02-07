
import React, { useState, useMemo, useEffect } from 'react';
import { Pilgrim, Temple } from '../types';

interface KioskProps {
  registeredPilgrims: Pilgrim[];
  onSendSOS: (pilgrim: Pilgrim) => void;
  t: (key: any) => string;
  currentTemple?: Temple;
}

export const PilgrimKiosk: React.FC<KioskProps> = ({ registeredPilgrims, onSendSOS, t, currentTemple }) => {
  // Directly select the first pilgrim if none is set, or the dummy one. 
  // No search/ID screen required as per user request.
  const [currentPilgrim, setCurrentPilgrim] = useState<Pilgrim | null>(registeredPilgrims[0] || null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [sosActive, setSosActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'quest' | 'game'>('status');
  
  // Game State
  const [gameStep, setGameStep] = useState(0);
  const [gameScore, setGameScore] = useState(0);

  const themePrimary = currentTemple?.themeColor || '#F97316';
  const themeSecondary = currentTemple?.secondaryColor || '#991B1B';

  useEffect(() => {
    // Visual "Flow" demonstration when first loading the kiosk
    const timer = setTimeout(() => setIsSyncing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const riddles = [
    { q: "I have rivers but no water, mountains but no stone. What am I in this temple?", a: "A Map", options: ["A Map", "A Statue", "A Pillar"] },
    { q: "I ring without a bell and speak without a mouth. I am found in the morning chants.", a: "An Echo", options: ["A Bird", "An Echo", "A Spirit"] },
    { q: "The more of me there is, the less you see. Found in the deepest sanctum.", a: "Darkness", options: ["Faith", "Incense", "Darkness"] }
  ];

  const handleGameAnswer = (ans: string) => {
    if (ans === riddles[gameStep].a) setGameScore(prev => prev + 1);
    if (gameStep < riddles.length - 1) {
      setGameStep(prev => prev + 1);
    } else {
      setGameStep(100); // Game Over
    }
  };

  const quests = [
    { id: 'q1', icon: 'fa-bell', title: 'Ring the Morning Bell', aura: 50, location: 'North Corridor', progress: 100 },
    { id: 'q2', icon: 'fa-water', title: 'Visit Sacred Ganga', aura: 100, location: 'Dashashwamedh Ghat', progress: 30 },
    { id: 'q3', icon: 'fa-book-quran', title: 'Ancient Scripture Wall', aura: 75, location: 'Temple Library', progress: 0 },
  ];

  const personalizedRecommendations = useMemo(() => {
    if (!currentPilgrim) return [];
    const recs = [];
    if (currentPilgrim.groupSize >= 4) {
      recs.push({ icon: 'fa-camera-retro', title: 'Group Photo Spot', text: `With ${currentPilgrim.groupSize} people, the courtyard sunset spot is perfect for your party right now!` });
    }
    if (currentPilgrim.age >= 60) {
      recs.push({ icon: 'fa-heart-pulse', title: 'Medical Support', text: 'Free specialized hydration station for seniors located near the exit.' });
    }
    recs.push({ icon: 'fa-map-location-dot', title: 'Smart Route', text: `Your ${currentPilgrim.slotTime} entry gives you VIP access via the North Corridor.` });
    return recs;
  }, [currentPilgrim, currentTemple, t]);

  if (isSyncing) {
    return (
      <div className="max-w-md mx-auto py-32 text-center animate-in fade-in duration-500">
        <div className="relative w-32 h-32 mx-auto mb-12">
          <div className="absolute inset-0 border-4 border-slate-200 dark:border-white/10 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 rounded-full animate-spin" style={{ borderColor: themePrimary }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fas fa-microchip text-4xl animate-pulse" style={{ color: themePrimary }}></i>
          </div>
        </div>
        <h2 className="text-2xl font-black italic tracking-tighter mb-4">CONNECTING SMART SCARF</h2>
        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Syncing Physical Scarf to Trust Ledger...</p>
        
        {/* Particle visual for "Flow" */}
        <div className="mt-12 flex justify-center gap-2">
           {[1,2,3,4].map(i => (
             <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: themePrimary, animationDelay: `${i*0.2}s` }}></div>
           ))}
        </div>
      </div>
    );
  }

  if (!currentPilgrim) {
    return <div className="p-20 text-center font-black opacity-20 uppercase tracking-widest">No active pilgrims in system.</div>;
  }

  const totalAura = currentPilgrim.auraPoints + (gameScore * 10);

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-24 px-4 animate-in slide-in-from-bottom duration-1000">
      {/* Divine Passport Header */}
      <div className="bg-slate-900 dark:bg-slate-800 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group transition-all">
        <div 
          className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-20 transition-all duration-1000 group-hover:scale-150"
          style={{ backgroundColor: themePrimary }}
        ></div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl font-black shadow-2xl relative z-10 border-4 border-white/20" style={{ backgroundColor: themePrimary }}>
              {currentPilgrim.name.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-4 border-slate-900 flex items-center justify-center text-white text-[10px]">
              <i className="fas fa-check"></i>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="text-2xl font-black tracking-tight italic">{currentPilgrim.name}</h3>
                  <p className="text-[9px] text-white/40 uppercase font-black tracking-[0.2em] mt-1">Status: Active Link</p>
               </div>
               <div className="text-right">
                  <div className="flex items-center gap-2 text-orange-400">
                    <i className="fas fa-sparkles text-sm animate-pulse"></i>
                    <span className="text-xl font-black">{totalAura}</span>
                  </div>
                  <p className="text-[8px] uppercase font-black tracking-widest opacity-40">Devotion Aura</p>
               </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-orange-400 transition-all duration-1000" style={{ width: `${Math.min(100, (totalAura / 500) * 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-1.5 rounded-3xl shadow-xl border border-slate-200 dark:border-white/5 sticky top-24 z-20">
        {[
          { id: 'status', label: 'JOURNEY', icon: 'fa-dharmachakra' },
          { id: 'quest', label: 'QUESTS', icon: 'fa-shield-heart' },
          { id: 'game', label: 'RITUALS', icon: 'fa-dice-d20' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.25em] transition-all flex flex-col items-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-[1.02]' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <i className={`fas ${tab.icon} text-base`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'status' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-700">
            {/* Live Progress Card */}
            <div 
              className="p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group border-2 border-white/10" 
              style={{ backgroundImage: `linear-gradient(135deg, ${themePrimary}, ${themeSecondary})` }}
            >
              <i className={`fas ${currentTemple?.icon} absolute -bottom-16 -right-16 text-[15rem] opacity-10 rotate-12 transition-transform duration-[2000ms] group-hover:rotate-45`}></i>
              
              <div className="relative z-10 space-y-12">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-2 italic">Real-Time Activity</p>
                    <h4 className="text-4xl font-black italic tracking-tighter">
                      {currentPilgrim.status === 'CHECKED_IN' ? 'IN SANCTUM' : 'VERIFIED'}
                    </h4>
                    <div className="mt-4 flex items-center gap-2">
                       <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Connected to Block 4821</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-3xl backdrop-blur-xl border border-white/20 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                    <i className="fas fa-location-arrow"></i>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-black/20 p-6 rounded-[2.5rem] backdrop-blur-md border border-white/10 hover:bg-black/30 transition-colors">
                    <p className="text-[8px] font-black uppercase opacity-60 mb-1 tracking-widest">Wait Time</p>
                    <p className="text-2xl font-black italic">~12m</p>
                  </div>
                  <div className="bg-black/20 p-6 rounded-[2.5rem] backdrop-blur-md border border-white/10 hover:bg-black/30 transition-colors">
                    <p className="text-[8px] font-black uppercase opacity-60 mb-1 tracking-widest">Slot Assigned</p>
                    <p className="text-2xl font-black italic">{currentPilgrim.slotTime}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Insights Section */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-sm border border-slate-200 dark:border-white/5 transition-all">
              <div className="flex items-center gap-4 mb-10">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Temple Intelligence</h4>
                 <div className="h-[1px] flex-1 bg-slate-100 dark:bg-white/5"></div>
              </div>
              <div className="space-y-6">
                {personalizedRecommendations.map((rec, i) => (
                  <div key={i} className="flex gap-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 group hover:border-orange-400/30 transition-all hover:translate-x-2">
                    <div 
                      className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center shrink-0 transition-transform group-hover:rotate-6" 
                      style={{ color: themePrimary }}
                    >
                      <i className={`fas ${rec.icon} text-xl`}></i>
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900 dark:text-white italic tracking-tight">{rec.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 font-medium">{rec.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quest' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-700">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-sm">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-black mb-2 dark:text-white italic tracking-tighter uppercase">Scarf Quests</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Complete rituals to upgrade your trust tier</p>
              </div>

              <div className="space-y-4">
                {quests.map((quest) => (
                  <div key={quest.id} className={`p-8 rounded-[2.5rem] border transition-all flex gap-6 relative overflow-hidden group ${
                    quest.progress === 100 
                      ? 'bg-green-500/5 border-green-500/20' 
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-slate-700'
                  }`}>
                    {quest.progress === 100 && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-lg animate-bounce">
                         <i className="fas fa-check"></i>
                      </div>
                    )}
                    
                    <div className="w-16 h-16 rounded-3xl bg-white dark:bg-slate-900 shadow-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ color: quest.progress === 100 ? '#22c55e' : themePrimary }}>
                      <i className={`fas ${quest.icon} text-2xl`}></i>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`font-black text-lg italic tracking-tight ${quest.progress === 100 ? 'text-green-600 dark:text-green-400 line-through opacity-60' : 'text-slate-900 dark:text-white'}`}>
                        {quest.title}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 mb-6 flex items-center gap-2">
                        <i className="fas fa-location-crosshairs text-[10px]"></i> {quest.location}
                      </p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2.5 bg-slate-200 dark:bg-black/20 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${quest.progress === 100 ? 'bg-green-500' : 'bg-orange-500'}`} 
                            style={{ width: `${quest.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase">+{quest.aura} AURA</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'game' && (
          <div className="animate-in fade-in slide-in-from-right duration-700 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-orange-50 dark:bg-orange-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-orange-500 text-3xl shadow-inner">
                <i className="fas fa-scroll animate-pulse"></i>
              </div>
              <h3 className="text-3xl font-black mb-2 dark:text-white italic tracking-tighter">SPIRITUAL RIDDLE</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.4em] font-black">Demonstrate focus to gain extra Aura</p>
            </div>

            {gameStep < riddles.length ? (
              <div className="space-y-8">
                <div className="bg-slate-50 dark:bg-slate-800 p-10 rounded-[3rem] text-center min-h-[160px] flex items-center justify-center border border-slate-200 dark:border-white/5 shadow-inner">
                  <p className="text-xl font-black italic text-slate-800 dark:text-slate-200 leading-relaxed">"{riddles[gameStep].q}"</p>
                </div>
                <div className="grid gap-4">
                  {riddles[gameStep].options.map(opt => (
                    <button 
                      key={opt}
                      onClick={() => handleGameAnswer(opt)}
                      className="w-full py-6 px-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-orange-500 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all font-black text-sm uppercase tracking-widest shadow-sm active:scale-95"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-8 animate-in zoom-in duration-500">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full border-4 border-dashed border-green-500 animate-[spin_10s_linear_infinite]"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-5xl text-green-500">
                    <i className="fas fa-award"></i>
                  </div>
                </div>
                <div>
                  <h4 className="text-4xl font-black tracking-tighter italic italic uppercase">Enlightened!</h4>
                  <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-2">Quest Completed Successfully</p>
                </div>
                <button 
                  onClick={() => { setGameStep(0); setGameScore(0); }}
                  className="px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] hover:scale-110 active:scale-95 transition-all shadow-2xl"
                >
                  RETRY RITUAL
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Emergency Action Section */}
      <div className="pt-10">
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
                 <h4 className="font-black text-lg tracking-tight uppercase italic">Secure Response Link</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed uppercase tracking-wider">
                Immediate assistance dispatch for medical or security emergencies. 
              </p>
              <button 
                onClick={() => { setSosActive(true); onSendSOS(currentPilgrim); }}
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
              <div>
                <h4 className="text-5xl font-black tracking-tighter italic mb-4">FLOW ACTIVE</h4>
                <p className="text-[10px] opacity-80 max-w-[280px] mx-auto font-black uppercase tracking-[0.4em] leading-relaxed">
                  Ledger Updated. Response Team Alpha Dispatching to Scarf Signal 7B.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <button 
        onClick={() => {
          setCurrentPilgrim(null);
          setIsSyncing(true); // Reset syncing state for next login
          setActiveTab('status');
        }} 
        className="w-full py-10 text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.6em] hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-4 group"
      >
        <i className="fas fa-power-off text-xs group-hover:rotate-90 transition-transform"></i> TERMINATE SECURE LINK
      </button>

      <style>{`
        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};
