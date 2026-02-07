
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Registration } from './views/Registration';
import { Scanner } from './views/Scanner';
import { Dashboard } from './views/Dashboard';
import { Ledger } from './views/Ledger';
import { PilgrimKiosk } from './views/PilgrimKiosk';
import { Login } from './views/Login';
import { Pilgrim, Transaction, EmergencyAlert, AlertStatus, Language, Temple, UserRole } from './types';
import { generateHash, generateID } from './utils/crypto';
import { translations } from './utils/i18n';

const TEMPLES: Temple[] = [
  { id: 'T1', name: 'Kashi Vishwanath', location: 'Varanasi', themeColor: '#F97316', secondaryColor: '#991B1B', icon: 'fa-om' },
  { id: 'T2', name: 'Tirupati Balaji', location: 'Tirumala', themeColor: '#B45309', secondaryColor: '#78350F', icon: 'fa-dharmachakra' },
  { id: 'T3', name: 'Somnath Temple', location: 'Gujarat', themeColor: '#0369A1', secondaryColor: '#075985', icon: 'fa-gopuram' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('registration');
  const [currentRole, setCurrentRole] = useState<UserRole>('NONE');
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [language, setLanguage] = useState<Language>('EN');
  const [currentTemple, setCurrentTemple] = useState<Temple>(TEMPLES[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const t = (key: keyof typeof translations['EN']) => translations[language][key] || key;

  useEffect(() => {
    const dummyPilgrim: Pilgrim = {
      id: 'BHR-9921',
      name: 'Rahul Sharma',
      age: 45,
      gender: 'Male',
      groupSize: 4,
      slotTime: '08:00 AM',
      colorCode: 'RED',
      qrValue: 'BHAROSA-DEMO-RAHUL',
      status: 'PENDING',
      auraPoints: 120,
      badges: ['First Devotion'],
      completedQuests: []
    };
    setPilgrims([dummyPilgrim]);
    
    setTransactions([{
      id: generateID(),
      hash: generateHash('GENESIS'),
      timestamp: Date.now() - 3600000,
      type: 'ENTRY',
      details: 'System Genesis - Multi-Temple Sync Active',
      userId: 'SYSTEM',
      templeId: currentTemple.id
    }]);
  }, [currentTemple]);

  const handleRegister = (newPilgrim: Pilgrim) => {
    setPilgrims(prev => [...prev, newPilgrim]);
    const tx: Transaction = {
      id: generateID(),
      hash: generateHash(`REG-${newPilgrim.id}`),
      timestamp: Date.now(),
      type: 'ENTRY',
      details: `Pilgrim ${newPilgrim.name} registered at ${currentTemple.name}`,
      userId: newPilgrim.id,
      templeId: currentTemple.id
    };
    setTransactions(prev => [...prev, tx]);
  };

  const handleSendSOS = (pilgrim: Pilgrim) => {
    const newAlert: EmergencyAlert = {
      id: generateID(),
      pilgrimId: pilgrim.id,
      pilgrimName: pilgrim.name,
      timestamp: Date.now(),
      status: 'ACTIVE',
      location: 'Main Sanctum Exit'
    };
    setAlerts(prev => [newAlert, ...prev]);
    setTransactions(prev => [...prev, {
      id: generateID(),
      hash: generateHash(`SOS-${pilgrim.id}`),
      timestamp: Date.now(),
      type: 'EMERGENCY_SOS',
      details: `SOS triggered by ${pilgrim.name} at ${currentTemple.name}`,
      userId: pilgrim.id,
      templeId: currentTemple.id
    }]);
  };

  const handleUpdateAlert = (alertId: string, status: AlertStatus, team?: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status, assignedTeam: team || a.assignedTeam } : a));
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      setTransactions(prev => [...prev, {
        id: generateID(),
        hash: generateHash(`ACTION-${alertId}`),
        timestamp: Date.now(),
        type: 'EMERGENCY_ACTION',
        details: `Emergency alert for ${alert.pilgrimName} is now ${status}`,
        userId: 'ADMIN',
        templeId: currentTemple.id
      }]);
    }
  };

  const handleScan = async (qrValue: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    const pilgrim = pilgrims.find(p => p.qrValue === qrValue && p.status === 'PENDING');
    if (pilgrim) {
      setPilgrims(prev => prev.map(p => p.qrValue === qrValue ? { ...p, status: 'CHECKED_IN' } : p));
      setTransactions(prev => [...prev, {
        id: generateID(),
        hash: generateHash(`SCAN-${pilgrim.id}`),
        timestamp: Date.now(),
        type: 'ENTRY',
        details: `${pilgrim.name} validated at ${currentTemple.name}`,
        userId: pilgrim.id,
        templeId: currentTemple.id
      }]);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentRole('NONE');
    setActiveTab('registration');
  };

  if (currentRole === 'NONE') {
    return <Login onSelectRole={setCurrentRole} currentTemple={currentTemple} t={t} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />;
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div 
        className="bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen"
        style={{ 
          '--theme-primary': currentTemple.themeColor, 
          '--theme-secondary': currentTemple.secondaryColor 
        } as any}
      >
        <Layout 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          language={language} 
          setLanguage={setLanguage}
          temples={TEMPLES}
          currentTemple={currentTemple}
          setCurrentTemple={setCurrentTemple}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          currentRole={currentRole}
          onLogout={logout}
          t={t}
        >
          {activeTab === 'registration' && <Registration onRegister={handleRegister} t={t} currentTemple={currentTemple} />}
          {activeTab === 'scanner' && <Scanner onScan={handleScan} registeredPilgrims={pilgrims} t={t} currentTemple={currentTemple} />}
          {activeTab === 'dashboard' && <Dashboard alerts={alerts} onUpdateAlert={handleUpdateAlert} t={t} currentTemple={currentTemple} />}
          {activeTab === 'ledger' && <Ledger transactions={transactions} t={t} currentTemple={currentTemple} />}
          {activeTab === 'kiosk' && <PilgrimKiosk registeredPilgrims={pilgrims} onSendSOS={handleSendSOS} t={t} currentTemple={currentTemple} />}
        </Layout>
      </div>
    </div>
  );
};

export default App;
