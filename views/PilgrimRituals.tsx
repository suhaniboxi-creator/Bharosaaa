
import React, { useState, useEffect, useCallback } from 'react';
import { Pilgrim, Temple } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface PilgrimRitualsProps {
  registeredPilgrims: Pilgrim[];
  t: (key: any) => string;
  currentTemple?: Temple;
}

export const PilgrimRituals: React.FC<PilgrimRitualsProps> = ({ registeredPilgrims, t, currentTemple }) => {
  const [currentPilgrim] = useState<Pilgrim | null>(registeredPilgrims[0] || null);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'FINISHED'>('IDLE');
  const [score, setScore] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);

  const startRitual = () => {
    setGameState('PLAYING');
    setScore(0);
    setTimeLeft(15);
  };

  useEffect(() => {
    if (gameState === 'PLAYING') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('FINISHED');
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      const pulseInterval = setInterval(() => {
        setPulse(true);
        setTimeout(() => setPulse(false), 300);
      }, 1200); // Pulse every 1.2s

      return () => {
        clearInterval(timer);
        clearInterval(pulseInterval);
      };
    }
  }, [gameState]);

  const handleTap = () => {
    if (gameState !== 'PLAYING') return;
    
    if (pulse) {
      setScore(prev => prev + 10);
      setFeedback('DIVINE FOCUS!');
    } else {
      setScore(prev => Math.max(0, prev - 5));
      setFeedback('STAY CALM...');
    }
    
    setTimeout(() => setFeedback(null), 500);
  };

  if (!currentPilgrim) return null;

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-24 px-4 animate-in slide-in-from-bottom duration-1000">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl text-center overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100 dark:bg-white/5">
          <motion.div 
            className="h-full bg-orange-500"
            initial={{ width: '100%' }}
            animate={{ width: gameState === 'PLAYING' ? '0%' : '100%' }}
            transition={{ duration: 15, ease: 'linear' }}
          />
        </div>

        <div className="mb-10">
          <div className="w-24 h-24 bg-orange-50 dark:bg-orange-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-orange-500 text-4xl shadow-inner relative">
            <i className={`fas fa-om ${pulse ? 'scale-125' : 'scale-100'} transition-transform duration-300`}></i>
            {pulse && (
              <motion.div 
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                className="absolute inset-0 border-4 border-orange-500 rounded-[2.5rem]"
              />
            )}
          </div>
          <h3 className="text-3xl font-black mb-2 dark:text-white italic tracking-tighter uppercase">Mantra Rhythm</h3>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.4em] font-black">Tap in sync with the sacred pulse</p>
        </div>

        {gameState === 'IDLE' && (
          <div className="space-y-8 py-10">
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Demonstrate your spiritual focus by tapping the screen exactly when the Om symbol pulses.
            </p>
            <button 
              onClick={startRitual}
              className="w-full py-6 bg-orange-500 text-white rounded-[2rem] font-black text-lg italic tracking-tighter uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              Begin Ritual
            </button>
          </div>
        )}

        {gameState === 'PLAYING' && (
          <div className="space-y-12 py-10">
            <div className="relative h-48 flex items-center justify-center">
              <button 
                onClick={handleTap}
                className={`w-40 h-40 rounded-full flex items-center justify-center text-white text-2xl shadow-2xl transition-all active:scale-90 ${pulse ? 'bg-orange-500 scale-110' : 'bg-slate-800 dark:bg-slate-700'}`}
              >
                <i className="fas fa-hand-pointer"></i>
              </button>
              
              <AnimatePresence>
                {feedback && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: -60, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute font-black text-sm tracking-widest uppercase ${feedback.includes('DIVINE') ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {feedback}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex justify-between items-center px-10">
              <div className="text-left">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Focus Score</p>
                <p className="text-3xl font-black text-orange-500 italic tracking-tighter">{score}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Time Left</p>
                <p className="text-3xl font-black text-slate-800 dark:text-white italic tracking-tighter">{timeLeft}s</p>
              </div>
            </div>
          </div>
        )}

        {gameState === 'FINISHED' && (
          <div className="text-center py-10 space-y-8 animate-in zoom-in duration-500">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full border-4 border-dashed border-green-500 animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-0 flex items-center justify-center text-5xl text-green-500">
                <i className="fas fa-award"></i>
              </div>
            </div>
            <div>
              <h4 className="text-4xl font-black tracking-tighter italic uppercase dark:text-white">Ritual Complete</h4>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-2">You gained +{Math.floor(score/2)} Aura Points</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Final Score</p>
               <p className="text-3xl font-black text-orange-500 italic tracking-tighter">{score}</p>
            </div>
            <button 
              onClick={startRitual}
              className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              Perform Again
            </button>
          </div>
        )}
      </div>

      <div className="bg-[#FEF3C7] dark:bg-slate-800 p-8 rounded-[3rem] border border-[#FDE68A] dark:border-white/5">
        <h4 className="font-black text-sm uppercase tracking-widest mb-4 dark:text-white">Why perform rituals?</h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          Spiritual focus rituals demonstrate your commitment to the temple's sanctity. High scores contribute to your Trust Tier, granting you faster access and special blessings.
        </p>
      </div>
    </div>
  );
};
