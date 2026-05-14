
import React, { useState } from 'react';
import { Pilgrim, Temple } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../utils/api';

interface DeskExitProps {
  onDeactivate: (qrValue: string) => Promise<boolean>;
  registeredPilgrims: Pilgrim[];
  t: (key: any) => string;
  currentTemple: Temple;
}

export const DeskExit: React.FC<DeskExitProps> = ({ onDeactivate, registeredPilgrims, t, currentTemple }) => {
  const [qrInput, setQrInput] = useState('');
  const [deskId, setDeskId] = useState('EXIT-A');
  const [status, setStatus] = useState<'IDLE' | 'IRIS_SCAN' | 'VERIFYING' | 'SUCCESS' | 'MISMATCH' | 'ERROR'>('IDLE');
  const [exitResult, setExitResult] = useState<any>(null);
  const [irisProgress, setIrisProgress] = useState(0);
  const [scarfDelinked, setScarfDelinked] = useState(false);

  const handleExit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput) return;

    // Step 1: Iris re-scan
    setStatus('IRIS_SCAN');
    setIrisProgress(0);
    const progressInterval = setInterval(() => {
      setIrisProgress(p => { if (p >= 100) { clearInterval(progressInterval); return 100; } return p + 3; });
    }, 40);
    await new Promise(r => setTimeout(r, 1500));
    clearInterval(progressInterval);
    setIrisProgress(100);

    // Step 2: Verify via backend
    setStatus('VERIFYING');
    const res = await api.verifyExit(qrInput, deskId);

    if (res.success) {
      setExitResult(res);
      setStatus('SUCCESS');
      setScarfDelinked(true);
      await onDeactivate(qrInput);
      setQrInput('');
      setTimeout(() => { setStatus('IDLE'); setExitResult(null); setScarfDelinked(false); }, 5000);
    } else if (res.mismatch) {
      setExitResult(res);
      setStatus('MISMATCH');
    } else {
      setStatus('ERROR');
      setTimeout(() => setStatus('IDLE'), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-red-500 text-3xl shadow-inner"><i className="fas fa-door-open"></i></div>
        <h2 className="text-3xl font-black italic tracking-tighter dark:text-white uppercase">Exit Verification Portal</h2>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">Iris Re-Verify • Delink Scarf • Finalize Journey</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-white/5 space-y-6">
          <form onSubmit={handleExit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Exit Desk</label>
              <select value={deskId} onChange={e => setDeskId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 py-4 px-6 rounded-2xl font-bold dark:text-white outline-none border-none">
                <option value="EXIT-A">Exit Gate A</option><option value="EXIT-B">Exit Gate B</option><option value="EXIT-C">Exit Gate C</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Scarf / Pilgrim ID</label>
              <select value={qrInput} onChange={e => setQrInput(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 py-4 px-6 rounded-2xl font-bold dark:text-white outline-none border-none">
                <option value="">Select pilgrim...</option>
                {registeredPilgrims.filter(p => p.status === 'CHECKED_IN').map(p => (
                  <option key={p.id} value={p.qrValue}>{p.id} - {p.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={status !== 'IDLE' || !qrInput}
              className="w-full py-5 rounded-2xl font-black text-lg uppercase shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
              <i className="fas fa-eye"></i> Verify Iris & Exit
            </button>
          </form>

          {/* Iris Scan Progress */}
          {status === 'IRIS_SCAN' && (
            <div className="bg-indigo-50 dark:bg-indigo-500/10 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-500/20 text-center space-y-4">
              <div className="w-24 h-24 rounded-full mx-auto relative flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="3" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#6366f1" strokeWidth="3" strokeDasharray="283"
                    style={{ strokeDashoffset: 283 - (283 * irisProgress / 100) }} strokeLinecap="round" transform="rotate(-90 50 50)" />
                </svg>
                <i className="fas fa-eye text-3xl text-indigo-500 animate-pulse"></i>
              </div>
              <p className="text-sm font-black text-indigo-700 dark:text-indigo-300">Scanning Iris... {irisProgress}%</p>
            </div>
          )}
        </div>

        {/* Result */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {status === 'SUCCESS' && exitResult ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="bg-green-500 text-white p-8 rounded-[3rem] shadow-2xl h-full flex flex-col items-center justify-center text-center space-y-5">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl"><i className="fas fa-check"></i></div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase">Journey Finalized</h3>
                  <p className="text-white/80 font-bold text-[10px] uppercase tracking-widest mt-1">Same Person Verified ✓</p>
                </div>
                {/* Iris Match */}
                <div className="bg-white/10 p-4 rounded-2xl w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Iris Match</span>
                    <span className="text-lg font-black">{exitResult.irisResult?.confidence}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[9px] font-mono opacity-60">
                    <div>Entry: {exitResult.irisResult?.storedHash?.slice(0, 16)}...</div>
                    <div>Exit: {exitResult.irisResult?.newHash?.slice(0, 16)}...</div>
                  </div>
                </div>
                {/* Journey */}
                <div className="bg-white/10 p-4 rounded-2xl w-full grid grid-cols-2 gap-3 text-[10px]">
                  <div><span className="opacity-60">Duration</span><p className="font-black text-lg">{exitResult.journey?.durationMinutes}m</p></div>
                  <div><span className="opacity-60">Exit Gate</span><p className="font-black text-lg">{exitResult.journey?.exitGate}</p></div>
                </div>
                {/* Delink */}
                {scarfDelinked && (
                  <div className="bg-white/10 p-3 rounded-xl flex items-center gap-3 w-full">
                    <div className="chain-break w-8 h-0.5 bg-white"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Identity Delinked • Zero Data Carryover ✓</span>
                  </div>
                )}
              </motion.div>
            ) : status === 'MISMATCH' ? (
              <motion.div key="mismatch" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-red-600 text-white p-8 rounded-[3rem] shadow-2xl h-full flex flex-col items-center justify-center text-center space-y-4 security-flash">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl"><i className="fas fa-exclamation-triangle"></i></div>
                <h3 className="text-2xl font-black uppercase">⚠ IRIS MISMATCH</h3>
                <p className="text-white/80 text-sm font-bold">Security alert triggered. Scarf locked for manual review.</p>
                <button onClick={() => setStatus('IDLE')} className="px-6 py-2 bg-white/20 rounded-xl text-sm font-bold">Dismiss</button>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-slate-100 dark:bg-slate-800/50 border-4 border-dashed border-slate-200 dark:border-white/5 p-10 rounded-[3rem] h-full flex flex-col items-center justify-center text-center">
                <i className="fas fa-eye text-5xl text-slate-300 dark:text-slate-700 mb-4"></i>
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Awaiting Iris Re-Verification</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
