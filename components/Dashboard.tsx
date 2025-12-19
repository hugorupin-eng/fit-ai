
import React, { useMemo } from 'react';
import { UserProfile, LogEntry } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Props {
  profile: UserProfile;
  logs: LogEntry[];
}

const Dashboard: React.FC<Props> = ({ profile, logs }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const todayLogs = useMemo(() => {
    return logs.filter(log => log.date.startsWith(today));
  }, [logs, today]);

  const stats = useMemo(() => {
    return todayLogs.reduce((acc, log) => ({
      calories: acc.calories + (log.type === 'meal' ? (log.calories || 0) : 0),
      burned: acc.burned + (log.type === 'activity' ? (log.calories || 0) : 0),
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fats: acc.fats + (log.fats || 0),
      sleep: acc.sleep + (log.sleepHours || 0)
    }), { calories: 0, burned: 0, protein: 0, carbs: 0, fats: 0, sleep: 0 });
  }, [todayLogs]);

  const macroData = [
    { name: 'Proteína', value: stats.protein, color: '#6366f1' },
    { name: 'Carbos', value: stats.carbs, color: '#10b981' },
    { name: 'Grasas', value: stats.fats, color: '#f59e0b' }
  ];

  const target = profile.targetCalories || 2000;
  const adjustedTarget = target + stats.burned;
  const remaining = adjustedTarget - stats.calories;
  const calPercentage = Math.min(100, Math.round((stats.calories / adjustedTarget) * 100));

  return (
    <div className="space-y-6">
      {/* Precision Calories Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-theme overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        
        <div className="flex justify-between items-center mb-8 relative">
          <div>
            <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Balance Neto Hoy</h3>
            <p className="text-5xl font-black text-slate-900 dark:text-white mt-1">
              {remaining < 0 ? 0 : remaining} <span className="text-lg font-bold text-slate-400">kcal</span>
            </p>
            <p className="text-xs font-bold text-indigo-500 mt-1 uppercase tracking-wider">Restantes para tu objetivo</p>
          </div>
          <div className={`p-4 rounded-3xl ${remaining < 0 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'}`}>
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
           <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Objetivo</p>
              <p className="text-lg font-black text-slate-700 dark:text-slate-200">{target}</p>
           </div>
           <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Actividad</p>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">+{stats.burned}</p>
           </div>
           <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
              <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Ingesta</p>
              <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">-{stats.calories}</p>
           </div>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden relative">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full transition-all duration-1000 ease-out shadow-lg" 
            style={{ width: `${calPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-theme">
          <h3 className="text-slate-900 dark:text-white font-bold mb-4 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
            Distribución Macros
          </h3>
          <div className="flex items-center justify-between">
            <div className="w-1/2 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={macroData} innerRadius={45} outerRadius={65} paddingAngle={8} dataKey="value" stroke="none">
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2">
              {macroData.map(m => (
                <div key={m.name} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">{m.name}</span>
                  </div>
                  <span className="text-xs font-black dark:text-white">{m.value}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-theme">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
               <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
               Descanso
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            </div>
          </div>
          <div className="text-center py-2">
            <p className="text-6xl font-black text-slate-900 dark:text-white">{stats.sleep}<span className="text-xl font-bold text-slate-400">h</span></p>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black mt-2 uppercase tracking-[0.3em]">Tiempo de Recuperación</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-theme">
        <h3 className="text-slate-900 dark:text-white font-bold mb-6 flex justify-between items-center">
          Actividad del Día
          <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-3 py-1 rounded-full text-slate-500 font-black uppercase tracking-widest">{todayLogs.length} eventos</span>
        </h3>
        {todayLogs.length === 0 ? (
          <div className="flex flex-col items-center py-12 opacity-30">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="text-sm font-bold uppercase tracking-widest">Sin actividad registrada hoy</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayLogs.slice().reverse().map(log => (
              <div key={log.id} className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all group">
                <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${
                  log.type === 'meal' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 
                  log.type === 'activity' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                }`}>
                  {log.type === 'meal' ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  ) : log.type === 'activity' ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">{log.description}</p>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mt-1 tracking-wider">
                    {log.type === 'meal' ? `${log.calories} kcal • P:${log.protein}g C:${log.carbs}g G:${log.fats}g` : 
                     log.type === 'activity' ? `${log.calories} kcal quemadas • ${log.durationMinutes || '??'} min` : 
                     `${log.sleepHours}h de descanso`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
