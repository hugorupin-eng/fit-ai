
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
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fats: acc.fats + (log.fats || 0),
      sleep: acc.sleep + (log.sleepHours || 0)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0, sleep: 0 });
  }, [todayLogs]);

  const macroData = [
    { name: 'Protein', value: stats.protein, color: '#6366f1' },
    { name: 'Carbs', value: stats.carbs, color: '#10b981' },
    { name: 'Fats', value: stats.fats, color: '#f59e0b' }
  ];

  const calPercentage = Math.min(100, Math.round((stats.calories / (profile.targetCalories || 2000)) * 100));

  return (
    <div className="space-y-6">
      {/* Calories Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-slate-500 text-sm font-medium">Daily Calories</h3>
            <p className="text-3xl font-bold text-slate-900">{stats.calories} / {profile.targetCalories} <span className="text-xs text-slate-400 font-normal">kcal</span></p>
          </div>
          <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-indigo-500 h-full transition-all duration-1000" 
            style={{ width: `${calPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Macros Breakdown */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-slate-900 font-bold mb-4">Macros Breakdown</h3>
          <div className="flex items-center justify-between">
            <div className="w-1/2 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-3">
              {macroData.map(m => (
                <div key={m.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                    <span className="text-sm text-slate-600">{m.name}</span>
                  </div>
                  <span className="text-sm font-bold">{m.value}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sleep Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-slate-900 font-bold">Sleep Quality</h3>
            <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold text-slate-900">{stats.sleep}</p>
            <p className="text-slate-500 text-sm mt-1">Hours tracked today</p>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between">
            <div className="text-center flex-1">
              <p className="text-xs text-slate-400">Target</p>
              <p className="font-semibold">8.0h</p>
            </div>
            <div className="text-center flex-1 border-l border-slate-50">
              <p className="text-xs text-slate-400">Rest</p>
              <p className="font-semibold text-green-500">Good</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-slate-900 font-bold mb-4">Today's Logs</h3>
        {todayLogs.length === 0 ? (
          <p className="text-slate-400 text-sm py-4 italic">No logs yet today. Talk to FitAI to add some!</p>
        ) : (
          <div className="space-y-4">
            {todayLogs.map(log => (
              <div key={log.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                <div className={`p-3 rounded-xl ${log.type === 'meal' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  {log.type === 'meal' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{log.description}</p>
                  <p className="text-xs text-slate-500">
                    {log.type === 'meal' ? `${log.calories} kcal • P:${log.protein}g C:${log.carbs}g F:${log.fats}g` : `${log.sleepHours} hours recorded`}
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
