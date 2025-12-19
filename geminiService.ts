
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, LogEntry, ActivityLevel, Goal } from "./types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const calculateTDEE = (profile: UserProfile): number => {
  const { weight, height, age, gender, activityLevel, goal } = profile;
  
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

export interface AIChatResponse {
  type: 'log' | 'advice';
  logData?: Partial<LogEntry>;
  textResponse: string;
}

export const processChatMessage = async (text: string, profile: UserProfile): Promise<AIChatResponse | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Mensaje: "${text}" | Perfil: ${JSON.stringify(profile)}`,
      config: {
        systemInstruction: `Eres FitPulse AI. Extrae datos de comida, ejercicio (calorías quemadas según peso ${profile.weight}kg) o sueño. Responde SIEMPRE en JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['log', 'advice'] },
            textResponse: { type: Type.STRING },
            logData: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['meal', 'sleep', 'activity'] },
                description: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fats: { type: Type.NUMBER },
                sleepHours: { type: Type.NUMBER },
                durationMinutes: { type: Type.NUMBER }
              }
            }
          },
          required: ["type", "textResponse"]
        },
      },
    });

    return JSON.parse(response.text) as AIChatResponse;
  } catch (error) {
    console.error("AI Error:", error);
    return null;
  }
};

export const getWeeklyAdvice = async (history: LogEntry[], profile: UserProfile): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Análisis: ${JSON.stringify(history.slice(-10))}`,
      config: {
        systemInstruction: "Da un consejo de fitness de 1 frase basado en los datos."
      }
    });
    return response.text;
  } catch (error) {
    return "¡Sigue adelante con tu progreso!";
  }
};
