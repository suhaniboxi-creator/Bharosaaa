
import React, { useState } from 'react';
import { Pilgrim, Temple } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface PilgrimQuizProps {
  registeredPilgrims: Pilgrim[];
  t: (key: any) => string;
  currentTemple?: Temple;
}

export const PilgrimQuiz: React.FC<PilgrimQuizProps> = ({ registeredPilgrims, t, currentTemple }) => {
  const [currentPilgrim] = useState<Pilgrim | null>(registeredPilgrims[0] || null);
  const [quizStep, setQuizStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const questions = [
    {
      q: "Which sacred river flows alongside the Kashi Vishwanath Temple?",
      options: ["Yamuna", "Ganga", "Saraswati", "Narmada"],
      a: "Ganga",
      fact: "The Ganga is considered the holiest river in Hinduism and Kashi is one of its most sacred points."
    },
    {
      q: "What is the name of the gold-plated tower of the temple?",
      options: ["Shikhara", "Gopuram", "Vimana", "Kalasha"],
      a: "Shikhara",
      fact: "Maharaja Ranjit Singh donated 1 ton of gold to plate the temple's Shikharas in 1835."
    },
    {
      q: "Kashi is believed to be the city of which Hindu deity?",
      options: ["Lord Vishnu", "Lord Brahma", "Lord Shiva", "Lord Ganesha"],
      a: "Lord Shiva",
      fact: "Kashi is known as the 'City of Light' and is the eternal abode of Lord Shiva."
    },
    {
      q: "What is the name of the narrow lanes that lead to the temple?",
      options: ["Ghats", "Gallis", "Chowks", "Bazaars"],
      a: "Gallis",
      fact: "The ancient 'Gallis' of Varanasi are world-famous for their unique atmosphere and history."
    }
  ];

  const handleAnswer = (option: string) => {
    setSelectedOption(option);
    const correct = option === questions[quizStep].a;
    setIsCorrect(correct);
    if (correct) setScore(prev => prev + 1);

    setTimeout(() => {
      if (quizStep < questions.length - 1) {
        setQuizStep(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 2000);
  };

  if (!currentPilgrim) return null;

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-24 px-4 animate-in slide-in-from-bottom duration-1000">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden relative">
        {!showResult ? (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="bg-orange-50 dark:bg-orange-500/10 px-4 py-2 rounded-2xl border border-orange-100 dark:border-orange-500/20">
                <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Question {quizStep + 1}/{questions.length}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aura Bonus</p>
                <p className="text-xl font-black text-orange-500 italic">+{score * 20}</p>
              </div>
            </div>

            <div className="min-h-[120px] flex items-center justify-center text-center">
              <h3 className="text-2xl font-black italic tracking-tight dark:text-white leading-tight">
                "{questions[quizStep].q}"
              </h3>
            </div>

            <div className="grid gap-4">
              {questions[quizStep].options.map((opt) => {
                const isSelected = selectedOption === opt;
                const isAnswer = opt === questions[quizStep].a;
                
                let btnClass = "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300";
                if (selectedOption) {
                  if (isAnswer) btnClass = "bg-green-500 text-white border-green-400 shadow-lg scale-[1.02]";
                  else if (isSelected) btnClass = "bg-red-500 text-white border-red-400 shadow-lg";
                  else btnClass = "opacity-40 grayscale";
                }

                return (
                  <button 
                    key={opt}
                    disabled={!!selectedOption}
                    onClick={() => handleAnswer(opt)}
                    className={`w-full py-6 px-8 rounded-2xl border transition-all font-black text-sm uppercase tracking-widest flex justify-between items-center ${btnClass}`}
                  >
                    {opt}
                    {selectedOption && isAnswer && <i className="fas fa-check-circle"></i>}
                    {selectedOption && isSelected && !isAnswer && <i className="fas fa-times-circle"></i>}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {selectedOption && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-orange-50 dark:bg-orange-500/5 rounded-3xl border border-orange-100 dark:border-orange-500/10"
                >
                  <p className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-2">Sacred Fact</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {questions[quizStep].fact}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-10 space-y-8 animate-in zoom-in duration-500">
            <div className="relative inline-block">
              <div className="w-40 h-40 rounded-full border-8 border-dashed border-orange-500 animate-[spin_15s_linear_infinite]"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-5xl font-black text-orange-500 italic">{Math.round((score/questions.length)*100)}%</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wisdom Score</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-4xl font-black tracking-tighter italic uppercase dark:text-white">Knowledge Unlocked</h4>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-2">You gained +{score * 20} Aura Points</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Correct</p>
                  <p className="text-2xl font-black text-green-500 italic">{score}</p>
               </div>
               <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Accuracy</p>
                  <p className="text-2xl font-black text-orange-500 italic">{Math.round((score/questions.length)*100)}%</p>
               </div>
            </div>

            <button 
              onClick={() => { setQuizStep(0); setScore(0); setShowResult(false); setSelectedOption(null); }}
              className="w-full py-6 bg-[#B45309] text-white rounded-[2rem] font-black text-lg italic tracking-tighter uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              Revisit the Wisdom
            </button>
          </div>
        )}
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-500/10 p-8 rounded-[3rem] border border-indigo-100 dark:border-indigo-500/20">
        <div className="flex items-center gap-4 mb-4">
          <i className="fas fa-book-open text-indigo-500"></i>
          <h4 className="font-black text-sm uppercase tracking-widest text-indigo-800 dark:text-indigo-400">Temple Heritage</h4>
        </div>
        <p className="text-xs text-indigo-700/70 dark:text-indigo-400/70 leading-relaxed font-medium">
          The Kashi Vishwanath Quiz is designed to help pilgrims connect deeper with the history and spiritual significance of the temple. Every correct answer increases your Aura and Trust Tier.
        </p>
      </div>
    </div>
  );
};
