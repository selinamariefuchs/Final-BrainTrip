import React, { useState, useEffect } from 'react';
import { Plane, Map, Camera, Bus, Ship } from 'lucide-react';
import { Logo } from './Logo';

interface LoadingProps {
  message: string;
}

export const Loading: React.FC<LoadingProps> = ({ message }) => {
  const [index, setIndex] = useState(0);
  
  const icons = [
    { Icon: Plane, color: "text-indigo-600" },
    { Icon: Bus, color: "text-blue-500" },
    { Icon: Map, color: "text-emerald-500" },
    { Icon: Ship, color: "text-cyan-500" },
    { Icon: Camera, color: "text-pink-500" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % icons.length);
    }, 1200);
    return () => clearInterval(timer);
  }, [icons.length]);

  const { Icon, color } = icons[index];

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-white p-6 text-center animate-fade-in">
      <div className="absolute top-12 animate-fade-in-up">
         <Logo size="md" variant="full" theme="dark" />
      </div>

      <div className="relative mb-8 mt-12">
        {/* Pulsing background circle */}
        <div className="absolute inset-0 rounded-full bg-indigo-50 animate-ping opacity-75"></div>
        <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center relative shadow-sm">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          
          <div key={index} className="animate-fade-in transform transition-all duration-300">
            <Icon className={`w-10 h-10 ${color}`} />
          </div>
        </div>
      </div>
      
      <div className="max-w-xs space-y-3 animate-fade-in-up">
        <h3 className="text-xl font-bold text-slate-800">Hang tight!</h3>
        <p className="text-slate-500 leading-relaxed font-medium">{message}</p>
      </div>
    </div>
  );
};