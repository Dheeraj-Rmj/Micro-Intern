'use client';
import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export const LoadingScreen: React.FC = () => {
  const { setCurrentRoute } = useApp();

  useEffect(() => {
    setCurrentRoute('landing');
  }, [setCurrentRoute]);

  return null;
};
