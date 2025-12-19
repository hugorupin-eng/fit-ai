
import React, { useMemo, useState, useEffect } from 'react';
import { LogEntry, UserProfile, DaySummary } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getWeeklyAdvice } from '../geminiService';

interface Props {
  logs: LogEntry[];
  profile: UserProfile;
}

const SummaryView: React.FC<Props> = ({ logs, profile }) => {
  const [advice, setAdvice] = useState('Generating your personalized advice...');
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');

  const historyData = useMemo(() => {
    const days: Record<string, DaySummary> = {};
    const count = timeframe === 'week' ? 7 : 30;
    
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days[dateStr] = {
        date: dateStr,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
        totalSleep: 0
      };
    }

    logs.forEach(log => {
      const dateStr = log.date.split('T')[0];
      if (days[dateStr]) {
        days[dateStr].totalCalories += log.calories || 0;
        days[dateStr].totalProtein += log.protein || 0;
        days[dateStr].totalCarbs += log.carbs || 0;
        days[dateStr].totalFats += log.fats || 0;
        days[dateStr].totalSleep += log.sleepHours || 0;
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

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
        <button 
          onClick={() => setTimeframe('week')}
          className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${timeframe === 'week' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Weekly
        </button>
        <button 
          onClick={() => setTimeframe('month')}
          className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${timeframe === 'month' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Monthly
        </button>
      </div>

      {/* AI Advice */}
      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          </div>
          <h3 className="font-bold">Coach's Insight</h3>
        </div>
        <p className="text-indigo-100 text-sm leading-relaxed">{advice}</p>
      </div>

      {/* Calories Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-slate-900 font-bold mb-6">Calorie Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="totalCalories" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sleep Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-slate-900 font-bold mb-6">Sleep Regularity</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="totalSleep" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
