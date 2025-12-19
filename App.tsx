
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, LogEntry, Goal, ActivityLevel, DaySummary } from './types';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import SummaryView from './components/SummaryView';
import InstallPrompt from './components/InstallPrompt';
import { calculateTDEE } from './geminiService';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('fitai_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('fitai_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'history'>('dashboard');

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
      targetProtein: Math.round((tdee * 0.3) / 4), // 30% Protein
      targetCarbs: Math.round((tdee * 0.4) / 4),   // 40% Carbs
      targetFats: Math.round((tdee * 0.3) / 9),    // 30% Fats
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
    <div className="max-w-4xl mx-auto px-4 pb-32 pt-6 min-h-screen bg-slate-50">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">FitAI Coach</h1>
          <p className="text-slate-500 text-sm">Bienvenido, {profile.name}</p>
        </div>
        <button 
          onClick={() => {
             if(confirm('¿Seguro que quieres borrar todos tus datos y empezar de cero?')) {
               localStorage.clear();
               window.location.reload();
             }
          }}
          className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors p-2"
        >
          Reiniciar
        </button>
      </header>

      <main className="space-y-6">
        {activeTab === 'dashboard' && <Dashboard profile={profile} logs={logs} />}
        {activeTab === 'chat' && <ChatInterface onLogAdded={handleAddLog} />}
        {activeTab === 'history' && <SummaryView logs={logs} profile={profile} />}
      </main>

      <InstallPrompt />

      {/* Navegación Inferior */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl px-6 py-4 flex justify-between items-center z-50">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'dashboard' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">Hoy</span>
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'chat' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <div className="bg-indigo-600 text-white p-3 rounded-2xl -mt-10 shadow-lg shadow-indigo-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Anotar</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'history' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">Resumen</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
