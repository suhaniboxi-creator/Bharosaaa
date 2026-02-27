
import React, { useState } from 'react';
import { Pilgrim, Temple } from '../types';
import { motion } from 'motion/react';

interface PilgrimServicesProps {
  registeredPilgrims: Pilgrim[];
  t: (key: any) => string;
  currentTemple?: Temple;
}

export const PilgrimServices: React.FC<PilgrimServicesProps> = ({ registeredPilgrims, t, currentTemple }) => {
  const [donationAmount, setDonationAmount] = useState('');
  const [isDonating, setIsDonating] = useState(false);

  const handleDonation = () => {
    if (!donationAmount) return;
    setIsDonating(true);
    setTimeout(() => {
      setIsDonating(false);
      setDonationAmount('');
      alert('Thank you for your sacred contribution! Your Aura has been updated.');
    }, 2000);
  };

  const services = [
    { id: 'prasad', icon: 'fa-bowl-food', title: 'Digital Prasad', desc: 'Pre-book your sacred offering to collect at the exit gate.', color: 'bg-orange-500' },
    { id: 'aarti', icon: 'fa-fire', title: 'Virtual Aarti', desc: 'Join the live stream of the evening Ganga Aarti from your device.', color: 'bg-indigo-500' },
    { id: 'history', icon: 'fa-monument', title: 'Temple History', desc: 'Explore the 1000-year history of Kashi Vishwanath.', color: 'bg-emerald-500' },
    { id: 'donation', icon: 'fa-hand-holding-heart', title: 'Donation Portal', desc: 'Contribute to the temple maintenance and social causes.', color: 'bg-rose-500' },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-24 px-4 animate-in slide-in-from-bottom duration-1000">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-black mb-2 dark:text-white italic tracking-tighter uppercase">Divine Services</h3>
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.4em] font-black">Enhance your pilgrimage experience</p>
      </div>

      {/* Quick Donation Section */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-orange-100 dark:border-white/5 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400">
            <i className="fas fa-hand-holding-heart"></i>
          </div>
          <div>
            <h4 className="font-black text-lg italic tracking-tighter dark:text-white">Sacred Contribution</h4>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Support the Temple Node</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
            <input 
              type="number" 
              value={donationAmount}
              onChange={e => setDonationAmount(e.target.value)}
              placeholder="Enter Amount"
              className="w-full pl-10 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold dark:text-white shadow-inner"
            />
          </div>
          <button 
            onClick={handleDonation}
            disabled={isDonating || !donationAmount}
            className="px-8 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isDonating ? <i className="fas fa-circle-notch animate-spin"></i> : 'OFFER'}
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          {[101, 501, 1001].map(amt => (
            <button 
              key={amt}
              onClick={() => setDonationAmount(amt.toString())}
              className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black text-slate-500 hover:bg-orange-50 hover:text-orange-600 transition-all"
            >
              ₹{amt}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {services.map((service) => (
          <motion.button 
            key={service.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-xl flex items-center gap-6 text-left group"
          >
            <div className={`w-16 h-16 rounded-3xl ${service.color} text-white flex items-center justify-center text-2xl shadow-lg group-hover:rotate-12 transition-transform`}>
              <i className={`fas ${service.icon}`}></i>
            </div>
            <div className="flex-1">
              <h4 className="font-black text-xl italic tracking-tight dark:text-white">{service.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                {service.desc}
              </p>
            </div>
            <div className="text-slate-300 dark:text-slate-700">
              <i className="fas fa-chevron-right"></i>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="bg-orange-50 dark:bg-orange-500/10 p-8 rounded-[3rem] border border-orange-100 dark:border-orange-500/20 mt-12">
        <div className="flex items-center gap-4 mb-4">
          <i className="fas fa-circle-info text-orange-500"></i>
          <h4 className="font-black text-sm uppercase tracking-widest text-orange-800 dark:text-orange-400">Pilgrim Helpdesk</h4>
        </div>
        <p className="text-xs text-orange-700/70 dark:text-orange-400/70 leading-relaxed font-medium">
          Need assistance with any of these services? Visit the nearest "Bharosa" kiosk or speak to a temple volunteer in a saffron vest.
        </p>
      </div>
    </div>
  );
};
