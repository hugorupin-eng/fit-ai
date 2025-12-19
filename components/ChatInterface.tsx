
import React, { useState, useRef, useEffect } from 'react';
import { processChatMessage } from '../geminiService';
import { LogEntry, UserProfile } from '../types';

interface Props {
  onLogAdded: (log: LogEntry) => void;
  profile: UserProfile;
}

const ChatInterface: React.FC<Props> = ({ onLogAdded, profile }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: "¡Hola! Soy FitPulse AI. ¿En qué puedo ayudarte hoy? Puedes decirme qué has comido, cuánto has dormido, el ejercicio que has hecho o pedirme consejos sobre tu salud." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsTyping(true);

    try {
      const result = await processChatMessage(userText, profile);

      if (result) {
        // Registramos los datos si existen, sin importar si la respuesta es tipo 'log' o 'advice'
        if (result.logData && result.logData.type) {
          const newLog: LogEntry = {
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
            type: result.logData.type as 'meal' | 'sleep' | 'activity',
            description: result.logData.description || userText,
            calories: result.logData.calories || 0,
            protein: result.logData.protein || 0,
            carbs: result.logData.carbs || 0,
            fats: result.logData.fats || 0,
            sleepHours: result.logData.sleepHours || 0,
            durationMinutes: result.logData.durationMinutes || 0
          };
          onLogAdded(newLog);
        }
        
        setMessages(prev => [...prev, { role: 'ai', content: result.textResponse }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: "Lo siento, tuve un pequeño problema técnico al procesar tu mensaje. ¿Podrías intentarlo de nuevo?" }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { role: 'ai', content: "Hubo un error al conectar con mi cerebro artificial. Por favor, verifica tu conexión." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm whitespace-pre-wrap ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
        <div className="relative group">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Comí ensalada, corrí 20 min..."
            className="w-full pl-6 pr-14 py-4.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm dark:text-white transition-all placeholder:text-slate-400"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:grayscale hover:bg-indigo-700 transition-all active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
