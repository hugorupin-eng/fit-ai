
import React, { useState, useEffect } from 'react';
import { UserProfile, LogEntry } from './types';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import SummaryView from './components/SummaryView';
import InstallPrompt from './components/InstallPrompt';
import { calculateTDEE } from './geminiService';

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        <path d="M16 10c1.5 0 2.5 1 2.5 2.5s-1 2.5-2.5 2.5h-1" strokeLinecap="round" strokeWidth="2" />
      </svg>
    </div>
    <div className="flex flex-col">
      <h1 className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tight">FitPulse</h1>
      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-0.5">AI Coach</span>
    </div>
  </div>
);

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('fitai_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('fitai_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('fitai_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'history'>('dashboard');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fitai_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fitai_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (profile) localStorage.setItem('fitai_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('fitai_logs', JSON.stringify(logs));
  }, [logs]);

  const handleProfileSubmit = (newProfile: UserProfile) => {
    const tdee = calculateTDEE(newProfile);
    const updatedProfile = {
      ...newProfile,
      targetCalories: tdee,
      targetProtein: Math.round((tdee * 0.3) / 4),
      targetCarbs: Math.round((tdee * 0.4) / 4),
      targetFats: Math.round((tdee * 0.3) / 9),
    };
    setProfile(updatedProfile);
  };

  const handleAddLog = (log: LogEntry) => {
    setLogs(prev => [...prev, log]);
  };

  if (!profile) {
    return <ProfileSetup onSubmit={handleProfileSubmit} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pb-32 pt-6 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="flex justify-between items-center mb-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-3xl border border-white dark:border-slate-800 shadow-sm">
        <Logo />
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 shadow-sm active:scale-90 transition-all"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
          <button 
            onClick={() => {
               if(confirm('¿Seguro que quieres borrar todos tus datos y empezar de cero?')) {
                 localStorage.clear();
                 window.location.reload();
               }
            }}
            className="text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl uppercase tracking-widest"
          >
            Reset
          </button>
        </div>
      </header>

      <main className="space-y-6">
        {activeTab === 'dashboard' && <Dashboard profile={profile} logs={logs} />}
        {activeTab === 'chat' && <ChatInterface onLogAdded={handleAddLog} profile={profile} />}
        {activeTab === 'history' && <SummaryView logs={logs} profile={profile} />}
      </main>

      <InstallPrompt />

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 rounded-[2.5rem] shadow-2xl px-8 py-4 flex justify-between items-center z-50">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-slate-400 dark:text-slate-600'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'chat' ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-slate-400 dark:text-slate-600'}`}
        >
          <div className="bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white p-4 rounded-[1.5rem] -mt-12 shadow-xl shadow-indigo-500/30 border-4 border-slate-50 dark:border-slate-950">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest mt-1">Chat</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-slate-400 dark:text-slate-600'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span className="text-[9px] font-black uppercase tracking-widest">Stats</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
