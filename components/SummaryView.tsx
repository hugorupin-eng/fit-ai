
import React, { useMemo, useState, useEffect } from 'react';
import { LogEntry, UserProfile, DaySummary } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getWeeklyAdvice } from '../geminiService';

interface Props {
  logs: LogEntry[];
  profile: UserProfile;
}

const SummaryView: React.FC<Props> = ({ logs, profile }) => {
  const [advice, setAdvice] = useState('Analizando tu progreso...');
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');

  const historyData = useMemo(() => {
    const days: Record<string, DaySummary> = {};
    const count = timeframe === 'week' ? 7 : 30;
    
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      // Fix: Added missing totalBurned property to satisfy DaySummary interface
      days[dateStr] = {
        date: dateStr,
        totalCalories: 0,
        totalBurned: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
        totalSleep: 0
      };
    }

    logs.forEach(log => {
      const dateStr = log.date.split('T')[0];
      if (days[dateStr]) {
        // Fix: Correctly categorize logs into their respective summaries
        if (log.type === 'meal') {
          days[dateStr].totalCalories += log.calories || 0;
          days[dateStr].totalProtein += log.protein || 0;
          days[dateStr].totalCarbs += log.carbs || 0;
          days[dateStr].totalFats += log.fats || 0;
        } else if (log.type === 'activity') {
          days[dateStr].totalBurned += log.calories || 0;
        } else if (log.type === 'sleep') {
          days[dateStr].totalSleep += log.sleepHours || 0;
        }
      }
    });

    return Object.values(days).map(d => ({
      ...d,
      shortDate: d.date.split('-').slice(1).join('/')
    }));
  }, [logs, timeframe]);

  useEffect(() => {
    getWeeklyAdvice(logs, profile).then(setAdvice);
  }, [logs, profile]);

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-fit border dark:border-slate-800">
        <button 
          onClick={() => setTimeframe('week')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timeframe === 'week' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Semana
        </button>
        <button 
          onClick={() => setTimeframe('month')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timeframe === 'month' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Mes
        </button>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-indigo-500 dark:to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="font-black text-lg tracking-tight">Análisis Inteligente</h3>
        </div>
        <p className="text-indigo-50 text-sm leading-relaxed font-medium">{advice}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-theme">
        <h3 className="text-slate-900 dark:text-white font-bold mb-6">Tendencia de Calorías</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
              <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8', fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8', fontWeight: 700 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', backgroundColor: isDark ? '#0f172a' : '#fff', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: '700' }}
              />
              <Bar dataKey="totalCalories" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-theme">
        <h3 className="text-slate-900 dark:text-white font-bold mb-6">Consistencia de Sueño</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
              <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8', fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8', fontWeight: 700 }} />
              <Tooltip contentStyle={{ borderRadius: '20px', backgroundColor: isDark ? '#0f172a' : '#fff', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="totalSleep" stroke="#3b82f6" strokeWidth={4} dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
