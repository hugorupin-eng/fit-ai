
import React, { useState, useEffect } from 'react';

const InstallPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar si ya está instalada
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (!isStandalone) {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIphone = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIphone);
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] animate-bounce">
      <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-2xl border-2 border-white flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-bold">¡Instala FitAI en tu móvil! 📱</p>
          <p className="text-xs opacity-90">
            {isIOS 
              ? 'Pulsa el botón "Compartir" y luego "Añadir a pantalla de inicio"' 
              : 'Pulsa los 3 puntos arriba y selecciona "Instalar aplicación"'}
          </p>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="ml-2 p-1 hover:bg-white/20 rounded-full"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
