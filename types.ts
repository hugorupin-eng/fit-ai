
export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHT = 'light',
  MODERATE = 'moderate',
  ACTIVE = 'active',
  VERY_ACTIVE = 'very_active'
}

export enum Goal {
  LOSE_WEIGHT = 'lose_weight',
  MAINTAIN = 'maintain',
  GAIN_WEIGHT = 'gain_weight'
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number; // in kg
  height: number; // in cm
  gender: 'male' | 'female' | 'other';
  activityLevel: ActivityLevel;
  goal: Goal;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFats?: number;
}

export interface LogEntry {
  id: string;
  date: string; // ISO string
  type: 'meal' | 'sleep' | 'activity';
  description: string;
  calories?: number; // For meals: positive, For activity: positive (burned)
  protein?: number;
  carbs?: number;
  fats?: number;
  sleepHours?: number;
  durationMinutes?: number;
}

export interface DaySummary {
  date: string;
  totalCalories: number;
  totalBurned: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalSleep: number;
}
