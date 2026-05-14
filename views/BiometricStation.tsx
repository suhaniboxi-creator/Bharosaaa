
import React, { useState, useEffect } from 'react';
import { Temple, VerificationStation } from '../types';
import { api } from '../utils/api';

interface BiometricStationProps {
  t: (key: any) => string;
  currentTemple: Temple;
}

export const BiometricStation: React.FC<BiometricStationProps> = ({ t, currentTemple }) => {
  const [stationId] = useState('IRIS-01');
  const [tokenInput, setTokenInput] = useState('');
  const [pilgrimInfo, setPilgrimInfo] = useState<any>(null);
  const [captureState, setCaptureState] = useState<'IDLE' | 'SCANNING' | 'CAPTURED' | 'VERIFYING' | 'SUCCESS' | 'FAIL'>('IDLE');
  const [irisData, setIrisData] = useState<any>(null);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [scarfLinked, setScarfLinked] = useState(false);
  const [stations, setStations] = useState<VerificationStation[]>([]);
  const [error, setError] = useState('');

  const themePrimary = currentTemple?.themeColor || '#F97316';

  useEffect(() => {
    api.getStations().then(res => { if (res.success) setStations(res.stations); });
    const interval = setInterval(() => {
      api.getStations().then(res => { if (res.success) setStations(res.stations); });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLoadPilgrim = async () => {
    if (!tokenInput.trim()) return;
    const res = await api.getPilgrims();
    if (res.success) {
      const found = res.pilgrims.find((p: any) => p.id === tokenInput || p.qrValue === tokenInput || p.maskedId?.includes(tokenInput.slice(-4)));
      if (found) { setPilgrimInfo(found); setError(''); }
      else setError('Pilgrim not found');
    }
  };

  const handleIrisCapture = async () => {
    setCaptureState('SCANNING');
    setCaptureProgress(0);
    const progressInterval = setInterval(() => {
      setCaptureProgress(p => { if (p >= 100) { clearInterval(progressInterval); return 100; } return p + 2; });
    }, 40);

    const res = await api.captureIris(stationId, pilgrimInfo?.maskedId ? undefined : undefined);
    clearInterval(progressInterval);
    setCaptureProgress(100);

    if (res.success) {
      setIrisData(res.irisHash);
      setCaptureState('CAPTURED');
    } else {
      setCaptureState('FAIL');
      setError(res.error || 'Capture failed');
      setTimeout(() => setCaptureState('IDLE'), 2000);
    }
  };

  const handleLinkScarf = async () => {
    if (!pilgrimInfo) return;
    setCaptureState('VERIFYING');
    const res = await api.linkScarf(pilgrimInfo.id, pilgrimInfo.slotTime, pilgrimInfo.assignedGate, pilgrimInfo.colorCode);
    if (res.success) {
      setScarfLinked(true);
      setCaptureState('SUCCESS');
    } else {
      setError(res.error || 'Linking failed');
      setCaptureState('CAPTURED');
    }
  };

  const resetStation = () => {
    setPilgrimInfo(null); setTokenInput(''); setCaptureState('IDLE'); setIrisData(null);
    setCaptureProgress(0); setScarfLinked(false); setError('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Station Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-2xl shadow-lg">
            <i className="fas fa-eye"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black italic tracking-tight dark:text-white">Iris Scan Counter #{stationId.split('-')[1]}</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Biometric Verification Station</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="edge-glow px-4 py-2 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20">
            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Station Active
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: Pilgrim Lookup */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl space-y-6">
          <h3 className="font-black dark:text-white uppercase tracking-widest text-xs flex items-center gap-2">
            <i className="fas fa-search text-slate-400"></i> Pilgrim Lookup
          </h3>
          <div className="space-y-3">
            <input value={tokenInput} onChange={e => setTokenInput(e.target.value.toUpperCase())}
              className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold dark:text-white text-sm"
              placeholder="Pilgrim ID / QR Code" />
            <button onClick={handleLoadPilgrim} className="w-full py-3 rounded-xl text-white font-black text-sm" style={{ backgroundColor: themePrimary }}>
              Load Pilgrim
            </button>
          </div>

          {pilgrimInfo && (
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl space-y-2">
              <p className="font-black dark:text-white">{pilgrimInfo.name}</p>
              <p className="text-xs text-slate-400 font-mono">{pilgrimInfo.maskedId || pilgrimInfo.id}</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-[10px]"><span className="text-slate-400 font-bold">Slot:</span> <span className="font-black dark:text-white">{pilgrimInfo.slotTime}</span></div>
                <div className="text-[10px]"><span className="text-slate-400 font-bold">Gate:</span> <span className="font-black dark:text-white">{pilgrimInfo.assignedGate}</span></div>
              </div>
            </div>
          )}
          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
        </div>

        {/* Center: Iris Capture */}
        <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
          {captureState === 'IDLE' && (
            <div className="text-center space-y-6">
              <div className="w-32 h-32 rounded-full border-4 border-white/10 flex items-center justify-center mx-auto relative">
                <i className="fas fa-eye text-5xl text-white/20"></i>
              </div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Ready for Iris Scan</p>
              <button onClick={handleIrisCapture} disabled={!pilgrimInfo}
                className="px-10 py-4 rounded-2xl text-white font-black shadow-xl disabled:opacity-30 transition-all hover:scale-105 active:scale-95" style={{ backgroundColor: themePrimary }}>
                <i className="fas fa-eye mr-2"></i> Begin Iris Capture
              </button>
            </div>
          )}

          {captureState === 'SCANNING' && (
            <div className="text-center space-y-6">
              <div className="w-40 h-40 rounded-full relative mx-auto flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#6366f1" strokeWidth="3" strokeDasharray="283"
                    style={{ strokeDashoffset: 283 - (283 * captureProgress / 100), transition: 'stroke-dashoffset 0.1s' }} strokeLinecap="round" transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="1" className="iris-pulse" />
                  <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="1" className="iris-pulse" style={{ animationDelay: '0.5s' }} />
                </svg>
                <div className="iris-beam w-full h-full absolute">
                  <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-gradient-to-b from-indigo-500 to-transparent origin-bottom"></div>
                </div>
                <i className="fas fa-eye text-4xl text-indigo-400 animate-pulse relative z-10"></i>
              </div>
              <div>
                <p className="text-white font-black text-lg">Capturing Iris Pattern...</p>
                <p className="text-indigo-400 text-sm font-bold mt-1">{captureProgress}%</p>
              </div>
            </div>
          )}

          {captureState === 'CAPTURED' && irisData && (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="w-32 h-32 rounded-full bg-green-500/20 flex items-center justify-center mx-auto border-4 border-green-500">
                <i className="fas fa-eye text-5xl text-green-400"></i>
              </div>
              <div>
                <p className="text-white font-black text-lg">Iris Captured</p>
                <p className="text-green-400 text-sm font-bold">Quality: {irisData.quality}%</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Hash (stored)</p>
                <p className="text-xs font-mono text-indigo-400 break-all mt-1">{irisData.hashValue}</p>
              </div>
              <button onClick={handleLinkScarf} className="px-8 py-4 rounded-2xl bg-green-500 text-white font-black shadow-xl transition-all hover:scale-105 active:scale-95">
                <i className="fas fa-link mr-2"></i> Link Scarf & Proceed
              </button>
              {irisData.quality < 70 && (
                <button onClick={() => { setCaptureState('IDLE'); setIrisData(null); setCaptureProgress(0); }}
                  className="block mx-auto text-yellow-400 text-xs font-bold mt-2">Low quality — Retry Capture</button>
              )}
            </div>
          )}

          {captureState === 'SUCCESS' && (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30">
                <i className="fas fa-check text-5xl text-white"></i>
              </div>
              <h3 className="text-3xl font-black text-white italic tracking-tight uppercase">Verified & Linked</h3>
              <p className="text-green-400 font-bold text-sm">Scarf assigned. Pilgrim may proceed to entry gate.</p>
              <button onClick={resetStation} className="px-8 py-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-all">
                Next Pilgrim
              </button>
            </div>
          )}
        </div>

        {/* Right: Station Metrics */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl">
            <h3 className="font-black dark:text-white uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
              <i className="fas fa-chart-bar text-slate-400"></i> All Stations
            </h3>
            <div className="space-y-3">
              {stations.map(s => (
                <div key={s.stationId} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${s.status === 'ACTIVE' ? 'bg-green-500' : s.status === 'IDLE' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs font-black dark:text-white">{s.stationId}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400">{s.queueCount} in queue</p>
                    <p className="text-[9px] text-slate-300">{s.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-500/20">
            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-2">Privacy Notice</p>
            <p className="text-[10px] text-indigo-500 leading-relaxed">Only iris hash is stored. Raw biometric template is discarded after hashing. Zero raw data retention.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
