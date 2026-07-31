'use client';
import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-4 flex items-start gap-3 text-slate-800 dark:text-slate-100">
      <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800">
        {icons[toastMessage.type || 'success']}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm leading-tight">{toastMessage.title}</h4>
        {toastMessage.desc && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{toastMessage.desc}</p>}
      </div>
    </div>
  );
};
