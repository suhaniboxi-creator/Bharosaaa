
import React, { useState, useRef, useEffect } from 'react';
import { Pilgrim, Temple } from '../types';

interface ScannerProps {
  onScan: (qrValue: string) => Promise<boolean>;
  registeredPilgrims: Pilgrim[];
  currentTemple?: Temple;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, registeredPilgrims, currentTemple }) => {
  const [scanResult, setScanResult] = useState<'IDLE' | 'SUCCESS' | 'ERROR' | 'SYNCING'>('IDLE');
  const [manualInput, setManualInput] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lastScannedName, setLastScannedName] = useState('');

  const themePrimary = currentTemple?.themeColor || '#F97316';

  const handleScan = async (value: string) => {
    setScanResult('SYNCING');
    await new Promise(r => setTimeout(r, 1500)); // Visual "Syncing" delay
    
    const success = await onScan(value);
    const pilgrim = registeredPilgrims.find(p => p.qrValue === value);
    setLastScannedName(pilgrim?.name || 'Unknown User');
    setScanResult(success ? 'SUCCESS' : 'ERROR');
    
    setTimeout(() => {
      setScanResult('IDLE');
      setLastScannedName('');
    }, 3000);
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => {
          console.error("Camera error:", err);
          setIsCameraActive(false);
        });
    } else if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  }, [isCameraActive]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className={`relative rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500 border-8 ${
        scanResult === 'SUCCESS' ? 'border-green-500 shadow-green-500/20' : 
        scanResult === 'ERROR' ? 'border-red-500 shadow-red-500/20' : 
        scanResult === 'SYNCING' ? 'border-blue-500 animate-pulse' : 'border-slate-800 dark:border-slate-700'
      }`}>
        <div className="aspect-video bg-black flex items-center justify-center text-white relative">
          {isCameraActive ? (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                 <i className="fas fa-camera text-4xl opacity-30"></i>
              </div>
              <p className="text-slate-400 text-sm font-black tracking-widest uppercase">Awaiting Scarf Interaction</p>
              <button 
                onClick={() => setIsCameraActive(true)}
                className="px-10 py-5 text-white font-black rounded-3xl transition-all shadow-xl hover:scale-105 active:scale-95"
                style={{ backgroundColor: themePrimary }}
              >
                START OPTICAL SCAN
              </button>
            </div>
          )}

          {scanResult === 'SYNCING' && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-link text-blue-500 text-4xl animate-pulse"></i>
                </div>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-[0.3em]">Scarf Data Flowing</h2>
              <p className="text-blue-400 font-bold mt-2">Syncing to Immutable Trust Ledger...</p>
              
              {/* Particle flow visualization */}
              <div className="absolute bottom-10 flex gap-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i*0.2}s` }}></div>
                ))}
              </div>
            </div>
          )}

          {scanResult === 'IDLE' && isCameraActive && (
            <div className="absolute inset-0 border-2 border-white/20 m-12 pointer-events-none rounded-[2rem]">
              <div className="absolute top-0 left-0 w-16 h-16 border-t-8 border-l-8 rounded-tl-[2rem]" style={{ borderColor: themePrimary }}></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-t-8 border-r-8 rounded-tr-[2rem]" style={{ borderColor: themePrimary }}></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-8 border-l-8 rounded-bl-[2rem]" style={{ borderColor: themePrimary }}></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-8 border-r-8 rounded-br-[2rem]" style={{ borderColor: themePrimary }}></div>
              <div className="w-full h-1 absolute shadow-[0_0_30px_rgba(255,255,255,0.8)] animate-[scan_2.5s_infinite] opacity-50" style={{ backgroundColor: themePrimary, top: '10%' }}></div>
            </div>
          )}

          {scanResult === 'SUCCESS' && (
            <div className="absolute inset-0 bg-green-500/90 backdrop-blur-md flex flex-col items-center justify-center animate-in zoom-in duration-500">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6 shadow-2xl text-green-600">
                 <i className="fas fa-check text-5xl"></i>
              </div>
              <h2 className="text-4xl font-black tracking-tight uppercase italic">Access Verified</h2>
              <p className="text-xl font-bold mt-2">{lastScannedName}</p>
              <div className="mt-8 bg-black/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <i className="fas fa-microchip"></i> Scarf ID Authenticated
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl transition-colors duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <i className="fas fa-keyboard"></i>
            </div>
            <h3 className="font-black dark:text-white uppercase tracking-widest text-sm">Staff Override</h3>
          </div>
          <div className="space-y-4">
            <select 
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              className="w-full px-6 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold dark:text-white text-base shadow-inner"
            >
              <option value="">Select Scarf Record...</option>
              {registeredPilgrims.filter(p => p.status === 'PENDING').map(p => (
                <option key={p.id} value={p.qrValue}>{p.id} - {p.name}</option>
              ))}
            </select>
            <button 
              onClick={() => handleScan(manualInput)}
              disabled={!manualInput}
              className="w-full text-white font-black py-5 rounded-3xl transition-all shadow-xl active:scale-95 disabled:opacity-50 hover:brightness-110"
              style={{ backgroundColor: themePrimary }}
            >
              VALIDATE SCARF TOKEN
            </button>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <i className="fas fa-network-wired absolute -right-10 -bottom-10 text-[10rem] opacity-5"></i>
          <h3 className="font-black uppercase tracking-[0.3em] text-xs text-slate-400 mb-6">Real-time Node Status</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Network Hashrate</span>
              <span className="font-mono text-green-400">42.8 TH/s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Turnstile State</span>
              <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/20">Locked</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Data Flow Latency</span>
              <span className="font-mono">14ms</span>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Blockchain Sync Active</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0.1; }
          50% { top: 90%; opacity: 0.8; }
          100% { top: 10%; opacity: 0.1; }
        }
      `}</style>
    </div>
  );
};
