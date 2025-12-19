
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Build your Plan</h2>
        <p className="text-slate-500 mb-8">Let's calculate your personalized caloric goals.</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
            <input 
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="e.g. John Doe"
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Age</label>
              <input 
                required type="number"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Years"
                onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Gender</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Weight (kg)</label>
              <input 
                required type="number"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="75"
                onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Height (cm)</label>
              <input 
                required type="number"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="180"
                onChange={e => setFormData({ ...formData, height: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Activity Level</label>
            <select 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={e => setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })}
            >
              <option value={ActivityLevel.SEDENTARY}>Sedentary (Office job)</option>
              <option value={ActivityLevel.LIGHT}>Lightly Active</option>
              <option value={ActivityLevel.MODERATE}>Moderately Active</option>
              <option value={ActivityLevel.ACTIVE}>Very Active</option>
              <option value={ActivityLevel.VERY_ACTIVE}>Extra Active</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Your Goal</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: Goal.LOSE_WEIGHT, label: 'Lose' },
                { id: Goal.MAINTAIN, label: 'Maintain' },
                { id: Goal.GAIN_WEIGHT, label: 'Gain' }
              ].map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, goal: g.id })}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${formData.goal === g.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
          >
            Generate My Plan
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
