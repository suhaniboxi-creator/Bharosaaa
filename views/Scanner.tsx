
import React, { useState, useRef, useEffect } from 'react';
import { Pilgrim, Temple, GateNode } from '../types';
import { api } from '../utils/api';

interface ScannerProps {
  onScan: (qrValue: string) => Promise<boolean>;
  registeredPilgrims: Pilgrim[];
  currentTemple?: Temple;
  t?: (key: any) => string;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, registeredPilgrims, currentTemple, t }) => {
  const [scanResult, setScanResult] = useState<'IDLE' | 'VALIDATING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [manualInput, setManualInput] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [validationSteps, setValidationSteps] = useState<any[]>([]);
  const [gates, setGates] = useState<GateNode[]>([]);
  const [lastPilgrim, setLastPilgrim] = useState<any>(null);
  const [edgeLatency, setEdgeLatency] = useState('');
  const themePrimary = currentTemple?.themeColor || '#F97316';

  useEffect(() => {
    api.getGateStatus().then(res => { if (res.success) setGates(res.gates); });
    const interval = setInterval(() => { api.getGateStatus().then(res => { if (res.success) setGates(res.gates); }); }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isCameraActive && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
        .catch(() => setIsCameraActive(false));
    } else if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  }, [isCameraActive]);

  const handleTripleValidation = async (value: string) => {
    setScanResult('VALIDATING');
    setValidationSteps([]);

    const res = await api.validateEntry(value, 'GATE-A');
    if (res.success !== undefined) {
      // Animate steps sequentially
      for (let i = 0; i < (res.steps || []).length; i++) {
        await new Promise(r => setTimeout(r, 600));
        setValidationSteps(prev => [...prev, res.steps[i]]);
      }
      await new Promise(r => setTimeout(r, 400));

      if (res.success) {
        setScanResult('SUCCESS');
        setLastPilgrim(res.pilgrim);
        setEdgeLatency(res.edgeLatency || '3ms');
        await onScan(value);
      } else {
        setScanResult('ERROR');
      }
      setTimeout(() => { setScanResult('IDLE'); setValidationSteps([]); setLastPilgrim(null); }, 4000);
    } else {
      // Fallback to legacy scan
      const success = await onScan(value);
      setScanResult(success ? 'SUCCESS' : 'ERROR');
      setTimeout(() => { setScanResult('IDLE'); setValidationSteps([]); }, 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Triple Validation Display */}
      {validationSteps.length > 0 && (
        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-2xl space-y-3">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Triple Validation</p>
          {validationSteps.map((step: any, i: number) => (
            <div key={i} className={`flex items-center gap-4 p-4 rounded-xl transition-all animate-in fade-in slide-in-from-left duration-300 ${step.passed ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${step.passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                <i className={`fas ${step.passed ? 'fa-check' : 'fa-times'}`}></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <i className={`fas ${step.icon} text-slate-400 text-sm`}></i>
                  <span className="text-white font-black text-sm">{step.name}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{step.details}</p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full" style={{ color: step.passed ? '#22c55e' : '#ef4444', backgroundColor: step.passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
                Step {step.step}
              </span>
            </div>
          ))}
          {edgeLatency && <div className="flex items-center gap-2 mt-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div><span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Edge Processing: {edgeLatency}</span></div>}
        </div>
      )}

      {/* Scanner Area */}
      <div className={`relative rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 border-4 ${scanResult === 'SUCCESS' ? 'border-green-500 shadow-green-500/20' : scanResult === 'ERROR' ? 'border-red-500' : 'border-slate-800'}`}>
        <div className="aspect-video bg-black flex items-center justify-center text-white relative">
          {isCameraActive ? (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                <i className="fas fa-camera text-4xl opacity-30"></i>
              </div>
              <p className="text-slate-400 text-sm font-black tracking-widest uppercase">Awaiting Scarf Scan</p>
              <button onClick={() => setIsCameraActive(true)} className="px-10 py-5 text-white font-black rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all" style={{ backgroundColor: themePrimary }}>
                START OPTICAL SCAN
              </button>
            </div>
          )}
          {scanResult === 'SUCCESS' && (
            <div className="absolute inset-0 bg-green-500/90 backdrop-blur-md flex flex-col items-center justify-center animate-in zoom-in duration-500">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 text-green-600"><i className="fas fa-check text-4xl"></i></div>
              <h2 className="text-3xl font-black uppercase italic">Access Verified</h2>
              {lastPilgrim && <p className="text-xl font-bold mt-2">{lastPilgrim.name}</p>}
              <div className="mt-4 bg-black/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-eye"></i> Iris-Backed Identity Confirmed
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Staff Override + Gate Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl">
          <h3 className="font-black dark:text-white uppercase tracking-widest text-sm mb-4 flex items-center gap-2"><i className="fas fa-keyboard text-slate-400"></i> Staff Override</h3>
          <div className="space-y-3">
            <select value={manualInput} onChange={e => setManualInput(e.target.value)} className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold dark:text-white">
              <option value="">Select Scarf Record...</option>
              {registeredPilgrims.filter(p => p.status === 'PENDING').map(p => (
                <option key={p.id} value={p.qrValue}>{p.id} - {p.name}</option>
              ))}
            </select>
            <button onClick={() => handleTripleValidation(manualInput)} disabled={!manualInput || scanResult === 'VALIDATING'}
              className="w-full text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 disabled:opacity-50 transition-all" style={{ backgroundColor: themePrimary }}>
              {scanResult === 'VALIDATING' ? <><i className="fas fa-circle-notch animate-spin mr-2"></i> Validating...</> : 'VALIDATE WITH TRIPLE CHECK'}
            </button>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl">
          <h3 className="font-black uppercase tracking-widest text-xs text-slate-400 mb-4 flex items-center gap-2"><i className="fas fa-door-open text-orange-400"></i> Gate Status</h3>
          <div className="space-y-2">
            {gates.map(g => (
              <div key={g.gateId} className="flex items-center justify-between bg-white/5 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${g.status === 'ACTIVE' ? 'bg-green-500' : g.status === 'IDLE' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-bold">{g.gateId}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px]">
                  <span className="text-slate-400">{g.throughput} processed</span>
                  <span className="text-slate-400">Q: {g.queueDepth}</span>
                  <span className="font-mono text-green-400">{g.latency}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
