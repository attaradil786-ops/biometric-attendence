import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let borderClass = 'border-sky-200 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100';
        let iconClass = 'text-sky-500 bg-sky-50 dark:bg-sky-950/60';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderClass = 'border-emerald-200 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100';
          iconClass = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-amber-200 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100';
          iconClass = 'text-amber-500 bg-amber-50 dark:bg-amber-950/60';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderClass = 'border-rose-200 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100';
          iconClass = 'text-rose-500 bg-rose-50 dark:bg-rose-950/60';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 ${borderClass}`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${iconClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                {toast.title}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
