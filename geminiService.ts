
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, LogEntry, ActivityLevel, Goal } from "./types";

// Inicialización de GoogleGenAI con la API KEY del entorno
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const calculateTDEE = (profile: UserProfile): number => {
  const { weight, height, age, gender, activityLevel, goal } = profile;
  
  // Ecuación de Mifflin-St Jeor
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
      contents: `Mensaje del usuario: "${text}"
      Perfil del usuario: ${JSON.stringify(profile)}`,
      config: {
        systemInstruction: `Eres FitPulse AI, un experto en nutrición y fitness. 
        Tu misión es analizar el mensaje del usuario y:
        1. Extraer datos estructurados si el usuario informa de una comida, ejercicio o sueño.
        2. Proporcionar una respuesta amable y experta.
        
        REGLAS DE EXTRACCIÓN:
        - Si es comida: Estima calorías, proteínas, carbohidratos y grasas (Gramos).
        - Si es ejercicio: Calcula calorías quemadas según el peso del usuario (${profile.weight}kg), el tipo de ejercicio e intensidad. Incluye la duración en durationMinutes.
        - Si es sueño: Extrae las horas.
        
        Si detectas cualquier dato que deba registrarse, SIEMPRE incluye el objeto logData en tu respuesta JSON.`,
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
    console.error("Failed to process chat with AI:", error);
    return null;
  }
};

export const getWeeklyAdvice = async (history: LogEntry[], profile: UserProfile): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analiza el progreso:
      Perfil: ${JSON.stringify(profile)}
      Historial: ${JSON.stringify(history.slice(-20))}`,
      config: {
        systemInstruction: "Eres un coach experto. Analiza el balance calórico y la calidad del descanso. Da un consejo breve y potente (máx 2 frases) para la semana."
      }
    });
    return response.text;
  } catch (error) {
    return "¡Sigue así! Tu constancia es la clave del éxito.";
  }
};
