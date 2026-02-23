
import React, { useState } from 'react';
import { Pilgrim, ColorCode, Temple } from '../types';
import { generateID } from '../utils/crypto';
import { Scanner } from './Scanner';

interface RegistrationProps {
  onRegister: (pilgrim: Pilgrim) => void;
  onScan: (qrValue: string) => Promise<boolean>;
  registeredPilgrims: Pilgrim[];
  t: (key: any) => string;
  currentTemple?: Temple;
}

export const Registration: React.FC<RegistrationProps> = ({ onRegister, onScan, registeredPilgrims, t, currentTemple }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    groupSize: '1',
    slotTime: '08:00 AM',
    deskId: 'GATE-A',
    donationAmount: ''
  });
  const [lastRegistered, setLastRegistered] = useState<Pilgrim | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const colorMap: Record<string, ColorCode> = {
      '08:00 AM': 'RED', '09:00 AM': 'BLUE', '10:00 AM': 'GREEN', '11:00 AM': 'ORANGE'
    };
    const colorCode = colorMap[formData.slotTime] || 'GREEN';
    const shortColor = colorCode.substring(0, 2);
    const randomId = Math.floor(10000 + Math.random() * 90000);
    const qrValue = `KV-${formData.deskId}-${shortColor}${randomId}`;

    const newPilgrim: Pilgrim = {
      id: generateID().toUpperCase(),
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      groupSize: parseInt(formData.groupSize),
      slotTime: formData.slotTime,
      colorCode: colorCode,
      qrValue: qrValue,
      status: 'PENDING',
      auraPoints: formData.donationAmount ? Math.floor(parseInt(formData.donationAmount) / 10) : 0,
      badges: [],
      completedQuests: [],
      assignedGate: formData.deskId
    };
    onRegister(newPilgrim);
    
    // If there's a donation, we'll handle it via the parent component usually, 
    // but for this prototype we'll just include it in the pilgrim's initial aura.
    
    setLastRegistered(newPilgrim);
    setFormData({ name: '', age: '', gender: 'Male', groupSize: '1', slotTime: '08:00 AM', deskId: 'GATE-A', donationAmount: '' });
  };

  const themePrimary = currentTemple?.themeColor || '#F97316';

  return (
    <div className="space-y-12">
      {/* Integrated Scanner for Desk Entry */}
      <div className="bg-slate-900 dark:bg-slate-900/50 p-8 rounded-[3.5rem] shadow-2xl border border-white/5">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg">
            <i className="fas fa-qrcode"></i>
          </div>
          <div>
            <h3 className="text-xl font-black text-white italic tracking-tight">Optical Scarf Validation</h3>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Instant Check-in for Registered Pilgrims</p>
          </div>
        </div>
        <Scanner onScan={onScan} registeredPilgrims={registeredPilgrims} currentTemple={currentTemple} t={t} />
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl dark:shadow-none border border-slate-100 dark:border-white/5 flex flex-col h-full transition-colors duration-300">
          <div className="mb-8">
            <h3 className="text-2xl font-black flex items-center gap-3 dark:text-white">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: themePrimary }}>
                <i className={`fas ${currentTemple?.icon || 'fa-id-card'}`}></i>
              </div>
              <div className="flex flex-col">
                <span className="leading-tight">Manual Registration</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">New Scarf Issuance</span>
              </div>
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 flex-1">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-1">{t('fullName')}</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 outline-none transition-all font-bold dark:text-white" style={{ '--tw-ring-color': themePrimary } as any} placeholder="E.g. Shiv Kumar" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-1">{t('age')}</label>
              <input required type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold dark:text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-1">{t('gender')}</label>
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold dark:text-white">
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-1">{t('groupSize')}</label>
              <input type="number" min="1" value={formData.groupSize} onChange={e => setFormData({...formData, groupSize: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold dark:text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-1">{t('slotSelection')}</label>
              <select value={formData.slotTime} onChange={e => setFormData({...formData, slotTime: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold dark:text-white">
                <option>08:00 AM</option><option>09:00 AM</option><option>10:00 AM</option><option>11:00 AM</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-1">Registration Desk</label>
              <select value={formData.deskId} onChange={e => setFormData({...formData, deskId: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold dark:text-white">
                <option value="GATE-A">Desk Gate A</option>
                <option value="GATE-B">Desk Gate B</option>
                <option value="GATE-C">Desk Gate C</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-1">Initial Donation (Optional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                <input type="number" value={formData.donationAmount} onChange={e => setFormData({...formData, donationAmount: e.target.value})} className="w-full pl-10 pr-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold dark:text-white" placeholder="0" />
              </div>
            </div>
          </div>
          <button type="submit" className="w-full text-white font-black py-5 rounded-2xl transition-all shadow-lg hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 mt-4" style={{ backgroundColor: themePrimary }}>
            <i className="fas fa-sparkles"></i> {t('generateScarf')}
          </button>
        </form>
      </div>

      <div className="space-y-8">
        {lastRegistered ? (
          <div className="animate-in fade-in slide-in-from-right duration-700">
            <div className="relative group p-[2px] rounded-[2.5rem] shadow-2xl dark:shadow-none" style={{ backgroundImage: `linear-gradient(to bottom right, ${themePrimary}, ${currentTemple?.secondaryColor || '#991B1B'})` }}>
              <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 overflow-hidden relative transition-colors duration-300">
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-20 transition-all duration-700 group-hover:scale-125" style={{ backgroundColor: themePrimary }}></div>
                
                <div className="flex justify-between items-start relative z-10 mb-10">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: themePrimary }}>
                          <i className={`fas ${currentTemple?.icon} text-[10px]`}></i>
                       </div>
                       <span className="text-white px-3 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase" style={{ backgroundColor: themePrimary }}>{lastRegistered.id}</span>
                    </div>
                    <h4 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{lastRegistered.name}</h4>
                  </div>
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white text-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <i className="fas fa-qrcode"></i>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-10 relative z-10">
                  <div className="bg-slate-50/80 dark:bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('slotSelection')}</p>
                    <p className="font-black text-slate-900 dark:text-white">{lastRegistered.slotTime}</p>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('groupSize')}</p>
                    <p className="font-black text-slate-900 dark:text-white">{lastRegistered.groupSize} PAX</p>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">GATE</p>
                    <p className="font-black truncate" style={{ color: themePrimary }}>{lastRegistered.assignedGate}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-white/90 p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/20 flex flex-col items-center relative z-10">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/?id=' + lastRegistered.qrValue)}`} alt="QR" className="w-32 h-32" />
                  <p className="mt-4 font-mono text-[10px] text-slate-400 tracking-widest uppercase">{lastRegistered.qrValue}</p>
                </div>
                <div className="mt-8 text-center relative z-10">
                  <p className="text-[10px] text-slate-300 dark:text-slate-600 font-black uppercase tracking-[0.2em]">Bharosa Secure ID • {currentTemple?.name}</p>
                </div>
                
                <i className={`fas ${currentTemple?.icon} absolute -bottom-10 -right-10 text-9xl text-slate-50 dark:text-white/5 pointer-events-none transition-transform duration-1000 group-hover:rotate-12`}></i>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-800 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem] p-12 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-colors duration-300">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
               <i className={`fas ${currentTemple?.icon || 'fa-om'} text-4xl text-slate-200 dark:text-slate-700`}></i>
            </div>
            <p className="font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest text-xs">Waiting for Registration</p>
          </div>
        )}
      </div>
    </div>
  </div>
);
};
