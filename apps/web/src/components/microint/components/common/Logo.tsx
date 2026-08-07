'use client';
import React from 'react';
import Image from 'next/image';
import { useApp } from '../../context/AppContext';

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
  const { darkMode } = useApp();
  const sizeMap = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`inline-flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] shrink-0 ${className}`}
    >
      <Image
        src={darkMode ? "/MI_dark.png" : "/MI.png"}
        alt="MicroIntern Logo"
        width={sizeMap[size]}
        height={sizeMap[size]}
        className="shrink-0 object-contain"
      />
    </div>
  );
};
