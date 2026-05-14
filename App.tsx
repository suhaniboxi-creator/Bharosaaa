
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Registration } from './views/Registration';
import { Scanner } from './views/Scanner';
import { Dashboard } from './views/Dashboard';
import { Ledger } from './views/Ledger';
import { DeskExit } from './views/DeskExit';
import { PilgrimMap } from './views/PilgrimMap';
import { PilgrimQuests } from './views/PilgrimQuests';
import { PilgrimRituals } from './views/PilgrimRituals';
import { PilgrimQuiz } from './views/PilgrimQuiz';
import { PilgrimLeaderboard } from './views/PilgrimLeaderboard';
import { PilgrimServices } from './views/PilgrimServices';
import { Login } from './views/Login';
import { BiometricStation } from './views/BiometricStation';
import { SystemArchitecture } from './views/SystemArchitecture';
import { ScarfLifecycle } from './views/ScarfLifecycle';
import { Pilgrim, Transaction, EmergencyAlert, AlertStatus, Language, Temple, UserRole } from './types';
import { generateHash, generateID } from './utils/crypto';
import { translations } from './utils/i18n';

const KASHI_VISHWANATH: Temple = {
  id: 'T1',
  name: 'Kashi Vishwanath',
  location: 'Varanasi',
  themeColor: '#F97316',
  secondaryColor: '#991B1B',
  icon: 'fa-om'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('registration');
  const [currentRole, setCurrentRole] = useState<UserRole>('NONE');
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [language, setLanguage] = useState<Language>('EN');
  const [currentTemple] = useState<Temple>(KASHI_VISHWANATH);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const t = (key: keyof typeof translations['EN']) => translations[language][key] || key;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pilgrimId = urlParams.get('id');
    if (pilgrimId) {
      setCurrentRole('PILGRIM');
      setActiveTab('pilgrim-map');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    setTransactions([{
      id: generateID(),
      hash: generateHash('GENESIS'),
      timestamp: Date.now() - 3600000,
      type: 'ENTRY',
      details: 'System Genesis - Kashi Vishwanath Identity Verification Node Active',
      userId: 'SYSTEM',
      templeId: currentTemple.id
    }]);
  }, [currentTemple]);

  const handleRegister = (newPilgrim: Pilgrim) => {
    setPilgrims(prev => [...prev, newPilgrim]);
    const tx: Transaction = {
      id: generateID(), hash: generateHash(`REG-${newPilgrim.id}`), timestamp: Date.now(), type: 'ENTRY',
      details: `Pilgrim ${newPilgrim.name} registered at ${currentTemple.name} (${newPilgrim.assignedGate})${newPilgrim.identityType ? ` via ${newPilgrim.identityType}` : ''}`,
      userId: newPilgrim.id, templeId: currentTemple.id
    };
    const newTransactions = [tx];
    if (newPilgrim.auraPoints > 0) {
      newTransactions.push({
        id: generateID(), hash: generateHash(`DON-${newPilgrim.id}`), timestamp: Date.now(), type: 'DONATION',
        details: `Initial donation of ₹${newPilgrim.auraPoints * 10} by ${newPilgrim.name}`,
        userId: newPilgrim.id, templeId: currentTemple.id
      });
    }
    setTransactions(prev => [...prev, ...newTransactions]);
  };

  const handleSendSOS = (pilgrim: Pilgrim) => {
    const newAlert: EmergencyAlert = {
      id: generateID(), pilgrimId: pilgrim.id, pilgrimName: pilgrim.name,
      timestamp: Date.now(), status: 'ACTIVE', location: 'Main Sanctum Exit'
    };
    setAlerts(prev => [newAlert, ...prev]);
    setTransactions(prev => [...prev, { id: generateID(), hash: generateHash(`SOS-${pilgrim.id}`), timestamp: Date.now(), type: 'EMERGENCY_SOS',
      details: `SOS triggered by ${pilgrim.name} at ${currentTemple.name}`, userId: pilgrim.id, templeId: currentTemple.id }]);
  };

  const handleUpdateAlert = (alertId: string, status: AlertStatus, team?: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status, assignedTeam: team || a.assignedTeam } : a));
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      setTransactions(prev => [...prev, { id: generateID(), hash: generateHash(`ACTION-${alertId}`), timestamp: Date.now(), type: 'EMERGENCY_ACTION',
        details: `Emergency alert for ${alert.pilgrimName} is now ${status}`, userId: 'ADMIN', templeId: currentTemple.id }]);
    }
  };

  const handleScan = async (qrValue: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 300));
    const pilgrim = pilgrims.find(p => p.qrValue === qrValue && p.status === 'PENDING');
    if (pilgrim) {
      setPilgrims(prev => prev.map(p => p.qrValue === qrValue ? { ...p, status: 'CHECKED_IN' } : p));
      setTransactions(prev => [...prev, { id: generateID(), hash: generateHash(`SCAN-${pilgrim.id}`), timestamp: Date.now(), type: 'ENTRY',
        details: `${pilgrim.name} validated at ${currentTemple.name}`, userId: pilgrim.id, templeId: currentTemple.id }]);
      return true;
    }
    return false;
  };

  const handleDeactivate = async (qrValue: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 300));
    const pilgrim = pilgrims.find(p => p.qrValue === qrValue && p.status === 'CHECKED_IN');
    if (pilgrim) {
      setPilgrims(prev => prev.map(p => p.qrValue === qrValue ? { ...p, status: 'COMPLETED', scarfLifecycle: 'DELINKED' } : p));
      setTransactions(prev => [...prev, { id: generateID(), hash: generateHash(`EXIT-${pilgrim.id}`), timestamp: Date.now(), type: 'EXIT',
        details: `${pilgrim.name} journey completed. Iris verified. Scarf delinked.`, userId: pilgrim.id, templeId: currentTemple.id }]);
      return true;
    }
    return false;
  };

  const logout = () => { setCurrentRole('NONE'); setActiveTab('registration'); };

  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'PILGRIM') setActiveTab('registration');
    else if (role === 'ADMIN') setActiveTab('dashboard');
    else if (role === 'EXIT_OFFICER') setActiveTab('desk-exit');
    else if (role === 'BIOMETRIC_OFFICER') setActiveTab('biometric-station');
    else setActiveTab('registration');
  };

  if (currentRole === 'NONE') {
    return <Login onSelectRole={handleLogin} currentTemple={currentTemple} t={t} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />;
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen"
        style={{ '--theme-primary': currentTemple.themeColor, '--theme-secondary': currentTemple.secondaryColor } as any}>
        <Layout activeTab={activeTab} setActiveTab={setActiveTab} language={language} setLanguage={setLanguage}
          currentTemple={currentTemple} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          currentRole={currentRole} onLogout={logout} t={t}>
          {activeTab === 'registration' && <Registration onRegister={handleRegister} onScan={handleScan} registeredPilgrims={pilgrims} t={t} currentTemple={currentTemple} currentRole={currentRole} />}
          {activeTab === 'biometric-station' && <BiometricStation t={t} currentTemple={currentTemple} />}
          {activeTab === 'dashboard' && <Dashboard alerts={alerts} onUpdateAlert={handleUpdateAlert} t={t} currentTemple={currentTemple} />}
          {activeTab === 'ledger' && <Ledger transactions={transactions} pilgrims={pilgrims} t={t} currentTemple={currentTemple} />}
          {activeTab === 'desk-exit' && <DeskExit onDeactivate={handleDeactivate} registeredPilgrims={pilgrims} t={t} currentTemple={currentTemple} />}
          {activeTab === 'scarf-lifecycle' && <ScarfLifecycle t={t} currentTemple={currentTemple} />}
          {activeTab === 'system-architecture' && <SystemArchitecture t={t} currentTemple={currentTemple} />}
          {activeTab === 'pilgrim-map' && <PilgrimMap registeredPilgrims={pilgrims} onSendSOS={handleSendSOS} t={t} currentTemple={currentTemple} />}
          {activeTab === 'pilgrim-quests' && <PilgrimQuests registeredPilgrims={pilgrims} t={t} currentTemple={currentTemple} />}
          {activeTab === 'pilgrim-rituals' && <PilgrimRituals registeredPilgrims={pilgrims} t={t} currentTemple={currentTemple} />}
          {activeTab === 'pilgrim-quiz' && <PilgrimQuiz registeredPilgrims={pilgrims} t={t} currentTemple={currentTemple} />}
          {activeTab === 'pilgrim-services' && <PilgrimServices registeredPilgrims={pilgrims} t={t} currentTemple={currentTemple} />}
          {activeTab === 'pilgrim-rank' && <PilgrimLeaderboard registeredPilgrims={pilgrims} t={t} currentTemple={currentTemple} />}
        </Layout>
      </div>
    </div>
  );
};

export default App;
