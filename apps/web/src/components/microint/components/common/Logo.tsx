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
  const heightClasses = {
    sm: 'h-7 sm:h-8',
    md: 'h-9 sm:h-10',
    lg: 'h-11 sm:h-12',
    xl: 'h-14 sm:h-16',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center cursor-pointer transition-transform hover:scale-[1.02] shrink-0 ${className}`}
    >
      <img
        src="/logo.png"
        alt="MicroIntern Logo"
        className={`${heightClasses[size]} w-auto object-contain shrink-0`}
      />
    </div>
  );
};
