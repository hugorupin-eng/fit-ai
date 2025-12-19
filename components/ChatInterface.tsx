
import React, { useState, useRef, useEffect } from 'react';
import { processChatMessage } from '../geminiService.ts';
import { LogEntry, UserProfile } from '../types.ts';

interface Props {
  onLogAdded: (log: LogEntry) => void;
  profile: UserProfile;
}

const ChatInterface: React.FC<Props> = ({ onLogAdded, profile }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: "¡Hola! Soy FitPulse AI. ¿Qué has comido hoy o qué ejercicio has hecho?" }
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

    const result = await processChatMessage(userText, profile);
    if (result) {
      if (result.logData && result.logData.type) {
        onLogAdded({
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString(),
          type: result.logData.type as any,
          description: result.logData.description || userText,
          calories: result.logData.calories || 0,
          protein: result.logData.protein || 0,
          carbs: result.logData.carbs || 0,
          fats: result.logData.fats || 0,
          sleepHours: result.logData.sleepHours || 0,
          durationMinutes: result.logData.durationMinutes || 0
        });
      }
      setMessages(prev => [...prev, { role: 'ai', content: result.textResponse }]);
    }
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-4 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe aquí..."
          className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 dark:text-white outline-none border dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
        />
      </form>
    </div>
  );
};

export default ChatInterface;
