
import React from 'react';
import { Language, Temple, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  currentTemple: Temple;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentRole: UserRole;
  onLogout: () => void;
  t: (key: any) => string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, activeTab, setActiveTab, language, setLanguage, 
  currentTemple, isDarkMode, toggleDarkMode, currentRole, onLogout, t 
}) => {
  const allTabs = [
    { id: 'registration', label: t('registration'), icon: 'fa-user-plus', roles: ['ADMIN', 'REGISTERER', 'PILGRIM'] },
    { id: 'desk-exit', label: 'Desk Exit', icon: 'fa-door-open', roles: ['ADMIN', 'EXIT_OFFICER'] },
    { id: 'dashboard', label: t('adminView'), icon: 'fa-chart-line', roles: ['ADMIN'] },
    { id: 'ledger', label: t('ledger'), icon: 'fa-database', roles: ['ADMIN'] },
    { id: 'pilgrim-map', label: 'Temple Map', icon: 'fa-map-location-dot', roles: ['ADMIN', 'PILGRIM'] },
    { id: 'pilgrim-quests', label: 'Divine Quests', icon: 'fa-shield-heart', roles: ['PILGRIM'] },
    { id: 'pilgrim-rituals', label: 'Sacred Rituals', icon: 'fa-dice-d20', roles: ['PILGRIM'] },
    { id: 'pilgrim-quiz', label: 'Temple Quiz', icon: 'fa-brain', roles: ['PILGRIM'] },
    { id: 'pilgrim-services', label: 'Divine Services', icon: 'fa-hand-sparkles', roles: ['PILGRIM'] },
    { id: 'pilgrim-rank', label: 'Leaderboard', icon: 'fa-trophy', roles: ['PILGRIM'] },
  ];

  const visibleTabs = allTabs.filter(tab => tab.roles.includes(currentRole));

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900 dark:bg-black text-white flex-shrink-0 z-20 flex flex-col transition-colors duration-300">
        <div className="p-8 border-b border-white/10 flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:rotate-12 duration-500"
            style={{ backgroundColor: currentTemple.themeColor }}
          >
            <i className={`fas ${currentTemple.icon} text-white text-2xl`}></i>
          </div>
          <div>
            <h1 className="font-black text-2xl tracking-tighter text-white">{t('appName')}</h1>
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest leading-none mt-1">{t('tagline')}</p>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4 block">Navigation</label>
          <nav className="space-y-2">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all relative group overflow-hidden ${
                  activeTab === tab.id ? 'text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                {activeTab === tab.id && (
                  <div className="absolute inset-0 z-0 opacity-100 transition-opacity duration-300" style={{ backgroundColor: currentTemple.themeColor }}></div>
                )}
                <i className={`fas ${tab.icon} w-5 z-10 transition-transform group-hover:scale-110`}></i>
                <span className="font-bold z-10">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
          >
            <i className="fas fa-sign-out-alt w-5"></i>
            <span>Switch Role</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto flex flex-col h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-8 py-4 sticky top-0 z-30 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: currentTemple.themeColor }}>
              <i className={`fas ${currentTemple.icon} text-sm`}></i>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{visibleTabs.find(t => t.id === activeTab)?.label}</h2>
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10 mx-2 hidden md:block"></div>
            <div className="hidden md:flex items-center gap-2">
               <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">{currentRole} Access</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm border border-slate-200 dark:border-white/5"
            >
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>

            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1 border border-slate-200 dark:border-white/5">
              {(['EN', 'HI', 'TE'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    language === l 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};
