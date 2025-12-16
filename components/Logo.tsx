import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className = '', variant = 'full', size = 'md', theme = 'dark' }) => {
  // Size mapping
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-20',
    xl: 'h-28'
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-6xl'
  };

  const subTextSizes = {
    sm: 'text-[0.6rem]',
    md: 'text-[0.7rem]',
    lg: 'text-sm',
    xl: 'text-base'
  };

  const textColor = theme === 'light' ? 'text-white' : 'text-slate-800';
  const subTextColor = theme === 'light' ? 'text-indigo-100' : 'text-slate-500';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Icon Graphic */}
      <div className={`${sizeClasses[size]} aspect-square relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
           {/* Suitcase Handle */}
           <path d="M35 25 V15 A10 10 0 0 1 65 15 V25" fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
           {/* Suitcase Body */}
           <rect x="10" y="25" width="80" height="65" rx="12" fill="#2dd4bf" stroke="#0f172a" strokeWidth="6" />
           {/* Vertical Stripe on Suitcase */}
           <rect x="22" y="25" width="10" height="65" fill="#fbbf24" opacity="0.9" />
           
           {/* Brain - Left Hemi (Teal/Dark) */}
           <path d="M35 45 C30 45 25 50 25 60 C25 75 35 80 48 80 V45 H35" fill="#0f766e" opacity="0.9" />
           {/* Brain - Right Hemi (Orange) */}
           <path d="M52 45 V80 C65 80 75 75 75 60 C75 50 70 45 65 45 H52" fill="#f59e0b" />
           {/* Brain Details */}
           <path d="M40 50 C38 50 35 52 35 55" fill="none" stroke="#ccfbf1" strokeWidth="2" strokeLinecap="round" />
           <path d="M60 50 C62 50 65 52 65 55" fill="none" stroke="#fef3c7" strokeWidth="2" strokeLinecap="round" />

           {/* Question Mark Bubble */}
           <circle cx="82" cy="22" r="14" fill="#fff" stroke="#0f172a" strokeWidth="4" />
           <text x="82" y="28" fontSize="20" fontWeight="900" fill="#0f172a" textAnchor="middle" fontFamily="sans-serif">?</text>
        </svg>
      </div>
      
      {/* Text */}
      {variant === 'full' && (
        <div className="text-center mt-2 leading-none">
          <h1 className={`font-black tracking-wider ${textSizes[size]} ${textColor}`}>
            BRAINTRIP
          </h1>
          <p className={`font-bold tracking-[0.2em] mt-1 ${subTextSizes[size]} ${subTextColor}`}>
            TRAVEL TRIVIA
          </p>
        </div>
      )}
    </div>
  );
};