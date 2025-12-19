
import React, { useState } from 'react';
import { UserProfile, Goal, ActivityLevel } from '../types';

interface Props {
  onSubmit: (profile: UserProfile) => void;
}

const ProfileSetup: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    gender: 'male',
    activityLevel: ActivityLevel.MODERATE,
    goal: Goal.MAINTAIN,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.age && formData.weight && formData.height) {
      onSubmit(formData as UserProfile);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-theme">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Bienvenido</h2>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Configura tu plan FitAI</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 ml-1">Nombre Completo</label>
            <input 
              required
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
              placeholder="Juan Pérez"
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 ml-1">Edad</label>
              <input 
                required type="number"
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                placeholder="Años"
                onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 ml-1">Género</label>
              <select 
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white appearance-none"
                onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
              >
                <option value="male">Hombre</option>
                <option value="female">Mujer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 ml-1">Peso (kg)</label>
              <input 
                required type="number"
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                placeholder="70"
                onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 ml-1">Altura (cm)</label>
              <input 
                required type="number"
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                placeholder="175"
                onChange={e => setFormData({ ...formData, height: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 ml-1">Nivel de Actividad</label>
            <select 
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
              onChange={e => setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })}
            >
              <option value={ActivityLevel.SEDENTARY}>Sedentario</option>
              <option value={ActivityLevel.LIGHT}>Actividad Ligera</option>
              <option value={ActivityLevel.MODERATE}>Moderada</option>
              <option value={ActivityLevel.ACTIVE}>Muy Activo</option>
              <option value={ActivityLevel.VERY_ACTIVE}>Atleta Élite</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Tu Objetivo Principal</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: Goal.LOSE_WEIGHT, label: 'Perder' },
                { id: Goal.MAINTAIN, label: 'Mantener' },
                { id: Goal.GAIN_WEIGHT, label: 'Ganar' }
              ].map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, goal: g.id })}
                  className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all border ${formData.goal === g.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4.5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95 mt-4"
          >
            Crear mi Plan
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
