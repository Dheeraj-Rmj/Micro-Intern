'use client';
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] shrink-0 ${className}`}
    >
      <img
        src="/MI.png"
        alt="MicroIntern Logo"
        className={`${sizeClasses[size]} shrink-0 w-auto object-contain`}
      />
    </div>
  );
};
