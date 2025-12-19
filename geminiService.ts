
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, LogEntry, ActivityLevel, Goal } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const calculateTDEE = (profile: UserProfile): number => {
  const { weight, height, age, gender, activityLevel, goal } = profile;
  
  // Mifflin-St Jeor Equation
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  if (gender === 'male') bmr += 5;
  else bmr -= 161;

  const activityMultipliers: Record<ActivityLevel, number> = {
    [ActivityLevel.SEDENTARY]: 1.2,
    [ActivityLevel.LIGHT]: 1.375,
    [ActivityLevel.MODERATE]: 1.55,
    [ActivityLevel.ACTIVE]: 1.725,
    [ActivityLevel.VERY_ACTIVE]: 1.9,
  };

  const tdee = bmr * activityMultipliers[activityLevel];
  
  if (goal === Goal.LOSE_WEIGHT) return Math.round(tdee - 500);
  if (goal === Goal.GAIN_WEIGHT) return Math.round(tdee + 300);
  return Math.round(tdee);
};

export const parseLogRequest = async (text: string): Promise<Partial<LogEntry> | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse the following user message for a fitness app. Extract meal information (calories, protein, carbs, fats) OR sleep hours.
      User message: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['meal', 'sleep'] },
            description: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fats: { type: Type.NUMBER },
            sleepHours: { type: Type.NUMBER },
          }
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to parse log with AI:", error);
    return null;
  }
};

export const getWeeklyAdvice = async (history: LogEntry[], profile: UserProfile): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this user's weekly history and profile. Provide a short, encouraging summary and one specific tip for next week.
      Profile: ${JSON.stringify(profile)}
      History: ${JSON.stringify(history.slice(-10))}`,
    });
    return response.text;
  } catch (error) {
    return "Keep going! You're doing great on your fitness journey.";
  }
};
