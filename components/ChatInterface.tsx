
import React, { useState, useRef, useEffect } from 'react';
import { parseLogRequest } from '../geminiService';
import { LogEntry } from '../types';

interface Props {
  onLogAdded: (log: LogEntry) => void;
}

const ChatInterface: React.FC<Props> = ({ onLogAdded }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: "¡Hola! Soy tu asistente FitAI. Cuéntame qué has comido o cuántas horas has dormido y lo anotaré automáticamente." }
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

    const result = await parseLogRequest(userText);

    if (result && (result.calories || result.sleepHours)) {
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        type: result.type as 'meal' | 'sleep',
        description: result.description || userText,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fats: result.fats,
        sleepHours: result.sleepHours
      };
      onLogAdded(newLog);

      let responseText = result.type === 'meal' 
        ? `✅ Registrado: ${newLog.description} (${newLog.calories} kcal). Tus macros se han actualizado.`
        : `✅ Registradas ${newLog.sleepHours}h de sueño. El descanso es fundamental para tu progreso.`;
      
      setMessages(prev => [...prev, { role: 'ai', content: responseText }]);
    } else {
      setMessages(prev => [...prev, { role: 'ai', content: "Lo siento, no pude identificar los detalles. Prueba algo como: 'Comí 100g de pollo' o 'Dormí 7 horas'." }]);
    }
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-[65vh] md:h-[70vh] bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden transition-theme">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
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
            placeholder="¿Qué has hecho hoy?"
            className="w-full pl-5 pr-14 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm dark:text-white transition-all placeholder:text-slate-400"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:shadow-none hover:bg-indigo-700 transition-all active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
