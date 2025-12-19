
import React, { useState, useRef, useEffect } from 'react';
import { parseLogRequest } from '../geminiService';
import { LogEntry } from '../types';

interface Props {
  onLogAdded: (log: LogEntry) => void;
}

const ChatInterface: React.FC<Props> = ({ onLogAdded }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: "Hi! Tell me what you ate or how long you slept, and I'll log it for you. For example: 'I had a bowl of oatmeal with blueberries' or 'Slept 7.5 hours'." }
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

      let responseText = '';
      if (newLog.type === 'meal') {
        responseText = `Got it! Logged: ${newLog.description} (${newLog.calories} kcal). Your macros are updated!`;
      } else {
        responseText = `Logged ${newLog.sleepHours} hours of sleep. Resting is key!`;
      }
      setMessages(prev => [...prev, { role: 'ai', content: responseText }]);
    } else {
      setMessages(prev => [...prev, { role: 'ai', content: "I couldn't quite catch the details. Try specifying the food or sleep duration more clearly!" }]);
    }
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-100 text-slate-800 rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1">
              <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="relative">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Talk to FitAI..."
            className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 hover:text-indigo-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
