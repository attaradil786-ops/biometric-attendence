import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  accentColor: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple';
  onClick?: () => void;
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    border: 'hover:border-indigo-300 dark:hover:border-indigo-700',
    accent: 'bg-indigo-500',
  },
  emerald: {
    bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    border: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    accent: 'bg-emerald-500',
  },
  amber: {
    bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    border: 'hover:border-amber-300 dark:hover:border-amber-700',
    accent: 'bg-amber-500',
  },
  rose: {
    bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    border: 'hover:border-rose-300 dark:hover:border-rose-700',
    accent: 'bg-rose-500',
  },
  sky: {
    bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    border: 'hover:border-sky-300 dark:hover:border-sky-700',
    accent: 'bg-sky-500',
  },
  purple: {
    bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    border: 'hover:border-purple-300 dark:hover:border-purple-700',
    accent: 'bg-purple-500',
  },
};

export const KPICard: React.FC<KPICardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor,
  onClick,
}) => {
  const colors = colorMap[accentColor] || colorMap.indigo;

  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md ' + colors.border : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        {trend ? (
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                trend.isPositive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend.value}
            </span>
            <span>{trend.label || 'vs yesterday'}</span>
          </div>
        ) : (
          <span>{subtitle || 'Updated in real-time'}</span>
        )}
      </div>
    </div>
  );
};
