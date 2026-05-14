
import React, { useState, useEffect, useRef } from 'react';
import { Pilgrim, ColorCode, Temple, UserRole, IdentityToken } from '../types';
import { generateID, formatAadhaar, validateAadhaar, validatePassportNumber, maskAadhaar } from '../utils/crypto';
import { api } from '../utils/api';
import { Scanner } from './Scanner';

interface RegistrationProps {
  onRegister: (pilgrim: Pilgrim) => void;
  onScan: (qrValue: string) => Promise<boolean>;
  registeredPilgrims: Pilgrim[];
  t: (key: any) => string;
  currentTemple?: Temple;
  currentRole: UserRole;
}

const COUNTRIES = ['Afghanistan','Australia','Bangladesh','Bhutan','Canada','China','France','Germany','India','Indonesia','Japan','Malaysia','Maldives','Myanmar','Nepal','Netherlands','New Zealand','Pakistan','Russia','Saudi Arabia','Singapore','South Africa','South Korea','Sri Lanka','Thailand','UAE','UK','USA','Vietnam'];

export const Registration: React.FC<RegistrationProps> = ({ onRegister, onScan, registeredPilgrims, t, currentTemple, currentRole }) => {
  const [identityMode, setIdentityMode] = useState<'AADHAAR' | 'PASSPORT'>('AADHAAR');
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [verifiedToken, setVerifiedToken] = useState<IdentityToken | null>(null);
  const [verifiedName, setVerifiedName] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [passportNumber, setPassportNumber] = useState('');
  const [passportCountry, setPassportCountry] = useState('Nepal');
  const [passportName, setPassportName] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Registration form
  const [formData, setFormData] = useState({ age: '', gender: 'Male', groupSize: '1', slotTime: '08:00 AM', deskId: 'GATE-A', donationAmount: '' });
  const [lastRegistered, setLastRegistered] = useState<Pilgrim | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Bulk registration
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkMembers, setBulkMembers] = useState<{name:string,age:string,gender:string}[]>([]);
  const [showConsent, setShowConsent] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer(p => p - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  const handleSendOTP = async () => {
    const cleaned = aadhaarInput.replace(/\s/g, '');
    if (!validateAadhaar(cleaned)) { setVerifyError('Enter valid 12-digit Aadhaar'); return; }
    setIsVerifying(true); setVerifyError('');
    const res = await api.sendAadhaarOTP(cleaned);
    setIsVerifying(false);
    if (res.success) {
      setSessionId(res.sessionId);
      setOtpSent(true);
      setOtpTimer(res.validitySeconds || 120);
    } else {
      setVerifyError(res.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async () => {
    const otpStr = otp.join('');
    if (otpStr.length !== 6) { setVerifyError('Enter all 6 digits'); return; }
    setIsVerifying(true); setVerifyError('');
    const res = await api.verifyAadhaarOTP(sessionId, otpStr);
    setIsVerifying(false);
    if (res.success) {
      setVerifiedToken(res.identityToken);
      setVerifiedName(res.name || '');
    } else {
      setVerifyError(res.error || 'Verification failed');
    }
  };

  const handlePassportVerify = async () => {
    if (!validatePassportNumber(passportNumber)) { setVerifyError('Invalid passport number'); return; }
    if (!passportName.trim()) { setVerifyError('Name required'); return; }
    setIsVerifying(true); setVerifyError('');
    const res = await api.validatePassport(passportNumber, passportCountry, passportName);
    setIsVerifying(false);
    if (res.success) {
      setVerifiedToken(res.identityToken);
      setVerifiedName(res.name || passportName);
    } else {
      setVerifyError(res.error || 'Verification failed');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedToken || !consentGiven) return;
    setIsRegistering(true);

    if (bulkMode && bulkMembers.length > 0) {
      const res = await api.batchRegister({ members: bulkMembers, slotTime: formData.slotTime, gateId: formData.deskId, leaderId: verifiedToken.tokenId });
      setIsRegistering(false);
      if (res.success) {
        res.pilgrims?.forEach((p: Pilgrim) => onRegister(p));
        setLastRegistered(res.pilgrims?.[0] || null);
      }
      return;
    }

    const res = await api.registerPilgrim({
      tokenId: verifiedToken.tokenId, name: verifiedName, age: formData.age, gender: formData.gender,
      groupSize: formData.groupSize, slotTime: formData.slotTime, gateId: formData.deskId, donationAmount: formData.donationAmount,
    });
    setIsRegistering(false);
    if (res.success && res.pilgrim) {
      onRegister(res.pilgrim);
      setLastRegistered(res.pilgrim);
      setFormData({ age: '', gender: 'Male', groupSize: '1', slotTime: '08:00 AM', deskId: 'GATE-A', donationAmount: '' });
    }
  };

  const resetIdentity = () => { setVerifiedToken(null); setOtpSent(false); setOtp(['','','','','','']); setSessionId(''); setAadhaarInput(''); setPassportNumber(''); setPassportName(''); setVerifyError(''); setConsentGiven(false); };

  const themePrimary = currentTemple?.themeColor || '#F97316';

  return (
    <div className="space-y-10">
      {(currentRole === 'ADMIN' || currentRole === 'REGISTERER') && (
        <div className="bg-slate-900 dark:bg-slate-900/50 p-8 rounded-[3.5rem] shadow-2xl border border-white/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg"><i className="fas fa-qrcode"></i></div>
            <div>
              <h3 className="text-xl font-black text-white italic tracking-tight">Optical Scarf Validation</h3>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Instant Check-in for Registered Pilgrims</p>
            </div>
          </div>
          <Scanner onScan={onScan} registeredPilgrims={registeredPilgrims} currentTemple={currentTemple} t={t} />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-10">
        {/* Identity Verification + Registration */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl dark:shadow-none border border-slate-100 dark:border-white/5 flex flex-col transition-colors duration-300">
          {!verifiedToken ? (
            <div className="space-y-6">
              {/* Mode Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                <button onClick={() => { setIdentityMode('AADHAAR'); setVerifyError(''); }} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${identityMode === 'AADHAAR' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}>
                  🇮🇳 Aadhaar
                </button>
                <button onClick={() => { setIdentityMode('PASSPORT'); setVerifyError(''); }} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${identityMode === 'PASSPORT' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}>
                  🌐 Passport
                </button>
              </div>

              {identityMode === 'AADHAAR' ? (
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-1 mb-2 block">Aadhaar Number</label>
                    <input value={formatAadhaar(aadhaarInput)} onChange={e => setAadhaarInput(e.target.value.replace(/\D/g, '').slice(0, 12))} disabled={otpSent}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-mono text-xl tracking-[0.3em] dark:text-white disabled:opacity-50"
                      placeholder="XXXX XXXX XXXX" maxLength={14} />
                    {aadhaarInput.length === 12 && <p className="text-[10px] text-green-500 font-bold mt-2 ml-1">✓ Valid format: {maskAadhaar(aadhaarInput)}</p>}
                  </div>

                  {!otpSent ? (
                    <button onClick={handleSendOTP} disabled={aadhaarInput.replace(/\s/g, '').length !== 12 || isVerifying}
                      className="w-full text-white font-black py-4 rounded-2xl transition-all shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3" style={{ backgroundColor: themePrimary }}>
                      {isVerifying ? <><i className="fas fa-circle-notch animate-spin"></i> Sending...</> : <><i className="fas fa-paper-plane"></i> Send OTP</>}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-green-50 dark:bg-green-500/10 p-4 rounded-2xl border border-green-200 dark:border-green-500/20">
                        <p className="text-xs font-bold text-green-700 dark:text-green-400">OTP sent to registered mobile</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] font-mono text-green-600">{maskAadhaar(aadhaarInput)}</span>
                          <span className={`text-sm font-black ${otpTimer < 30 ? 'text-red-500' : 'text-green-600'}`}>
                            {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-center gap-3">
                        {otp.map((digit, i) => (
                          <input key={i} ref={el => { otpRefs.current[i] = el; }} type="text" maxLength={1} value={digit}
                            onChange={e => handleOtpChange(i, e.target.value)}
                            onKeyDown={e => { if (e.key === 'Backspace' && !digit && i > 0) otpRefs.current[i - 1]?.focus(); }}
                            className="otp-input" />
                        ))}
                      </div>

                      <button onClick={handleVerifyOTP} disabled={otp.join('').length !== 6 || isVerifying || otpTimer <= 0}
                        className="w-full text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3" style={{ backgroundColor: themePrimary }}>
                        {isVerifying ? <><i className="fas fa-circle-notch animate-spin"></i> Verifying...</> : <><i className="fas fa-shield-halved"></i> Verify OTP</>}
                      </button>
                      {otpTimer <= 0 && <button onClick={() => { setOtpSent(false); setOtp(['','','','','','']); }} className="w-full text-orange-500 font-bold text-sm py-2">Resend OTP</button>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-1 mb-2 block">Full Name (as on passport)</label>
                    <input value={passportName} onChange={e => setPassportName(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold dark:text-white" placeholder="John Doe" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-1 mb-2 block">Passport Number</label>
                      <input value={passportNumber} onChange={e => setPassportNumber(e.target.value.toUpperCase())}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-mono font-bold tracking-wider dark:text-white" placeholder="A12345678" />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-1 mb-2 block">Country</label>
                      <select value={passportCountry} onChange={e => setPassportCountry(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold dark:text-white">
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <button onClick={handlePassportVerify} disabled={!passportNumber || !passportName || isVerifying}
                    className="w-full text-white font-black py-4 rounded-2xl transition-all shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3" style={{ backgroundColor: themePrimary }}>
                    {isVerifying ? <><i className="fas fa-circle-notch animate-spin"></i> Validating...</> : <><i className="fas fa-passport"></i> Verify Passport</>}
                  </button>
                </div>
              )}

              {verifyError && <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-bold text-center border border-red-200 dark:border-red-500/20">{verifyError}</div>}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Verified - Show registration form */}
              <div className="bg-green-50 dark:bg-green-500/10 p-5 rounded-2xl border border-green-200 dark:border-green-500/20 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Identity Verified ✓</p>
                  <p className="font-black text-green-800 dark:text-green-300 mt-1">{verifiedName}</p>
                  <p className="text-xs font-mono text-green-600 mt-0.5">{verifiedToken.maskedId} • {verifiedToken.type}</p>
                </div>
                <button onClick={resetIdentity} className="text-green-600 hover:text-red-500 text-sm font-bold"><i className="fas fa-times"></i></button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-1 mb-2 block">{t('age')}</label>
                    <input required type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-1 mb-2 block">{t('gender')}</label>
                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold dark:text-white">
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-1 mb-2 block">{t('slotSelection')}</label>
                    <select value={formData.slotTime} onChange={e => setFormData({...formData, slotTime: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold dark:text-white">
                      <option>08:00 AM</option><option>09:00 AM</option><option>10:00 AM</option><option>11:00 AM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase ml-1 mb-2 block">Gate</label>
                    <select value={formData.deskId} onChange={e => setFormData({...formData, deskId: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold dark:text-white">
                      <option value="GATE-A">Gate A</option><option value="GATE-B">Gate B</option><option value="GATE-C">Gate C</option>
                    </select>
                  </div>
                </div>

                {/* Privacy Consent */}
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={consentGiven} onChange={e => setConsentGiven(e.target.checked)} className="mt-1 w-4 h-4 rounded accent-orange-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">I consent to data processing under DPDP Act 2023</p>
                      <p className="text-[10px] text-slate-400 mt-1">Your identity is tokenized. No raw Aadhaar/passport data is stored. All data is auto-deleted upon exit.</p>
                    </div>
                  </label>
                </div>

                <button type="submit" disabled={!consentGiven || isRegistering}
                  className="w-full text-white font-black py-5 rounded-2xl transition-all shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3" style={{ backgroundColor: themePrimary }}>
                  {isRegistering ? <><i className="fas fa-circle-notch animate-spin"></i> Processing...</> : <><i className="fas fa-sparkles"></i> {t('generateScarf')}</>}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Panel - Result */}
        <div className="space-y-8">
          {lastRegistered ? (
            <div className="animate-in fade-in slide-in-from-right duration-700">
              <div className="relative group p-[2px] rounded-[2.5rem] shadow-2xl" style={{ backgroundImage: `linear-gradient(to bottom right, ${themePrimary}, ${currentTemple?.secondaryColor || '#991B1B'})` }}>
                <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 overflow-hidden relative transition-colors duration-300">
                  <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ backgroundColor: themePrimary }}></div>
                  <div className="flex justify-between items-start relative z-10 mb-8">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white px-3 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase" style={{ backgroundColor: themePrimary }}>{lastRegistered.id}</span>
                        {lastRegistered.identityType && <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-blue-100 dark:bg-blue-500/10 text-blue-600">{lastRegistered.identityType}</span>}
                      </div>
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-2">{lastRegistered.name}</h4>
                      {lastRegistered.maskedId && <p className="text-xs font-mono text-slate-400 mt-1">{lastRegistered.maskedId}</p>}
                    </div>
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl border border-slate-100 dark:border-white/5">
                      <i className="fas fa-shield-halved text-green-500"></i>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-8 relative z-10">
                    <div className="bg-slate-50/80 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Slot</p>
                      <p className="font-black text-slate-900 dark:text-white text-sm">{lastRegistered.slotTime}</p>
                    </div>
                    <div className="bg-slate-50/80 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Group</p>
                      <p className="font-black text-slate-900 dark:text-white text-sm">{lastRegistered.groupSize} PAX</p>
                    </div>
                    <div className="bg-slate-50/80 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gate</p>
                      <p className="font-black text-sm" style={{ color: themePrimary }}>{lastRegistered.assignedGate}</p>
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-500/10 p-3 rounded-2xl border border-green-200 dark:border-green-500/20 text-center mb-6">
                    <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">🔐 Tokenized Identity • Zero Raw Data Storage</p>
                  </div>
                  <div className="bg-white dark:bg-white/90 p-4 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center relative z-10">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(lastRegistered.qrValue)}`} alt="QR" className="w-28 h-28" />
                    <p className="mt-3 font-mono text-[9px] text-slate-400 tracking-widest uppercase">Encrypted QR Token</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-800 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem] p-12 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
                <i className={`fas ${currentTemple?.icon || 'fa-om'} text-4xl text-slate-200 dark:text-slate-700`}></i>
              </div>
              <p className="font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest text-xs">Verify Identity to Begin Registration</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
