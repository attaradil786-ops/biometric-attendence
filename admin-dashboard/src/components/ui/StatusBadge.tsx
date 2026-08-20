import React from 'react';
import {
  AttendanceStatus,
  BreakStatus,
  DeviceStatus,
  EmployeeStatus,
} from '../../types';
import {
  getAttendanceStatusBadgeProps,
  getBreakStatusBadgeProps,
  getDeviceStatusBadgeProps,
} from '../../utils/formatters';

interface StatusBadgeProps {
  type: 'attendance' | 'break' | 'device' | 'employee';
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  status,
  size = 'sm',
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'text-[11px] px-2.5 py-0.5'
      : 'text-xs px-3 py-1 font-medium';

  if (type === 'attendance') {
    const props = getAttendanceStatusBadgeProps(status as AttendanceStatus);
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium border whitespace-nowrap ${props.bg} ${props.border} ${sizeClasses}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${props.dot}`} />
        {props.text}
      </span>
    );
  }

  if (type === 'break') {
    const props = getBreakStatusBadgeProps(status as BreakStatus);
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap ${props.bg} ${sizeClasses}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${props.dot}`} />
        {props.text}
      </span>
    );
  }

  if (type === 'device') {
    const props = getDeviceStatusBadgeProps(status as DeviceStatus);
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap ${props.bg} ${sizeClasses}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${props.dot}`} />
        {props.text}
      </span>
    );
  }

  if (type === 'employee') {
    const isAct = status === 'Active';
    const isLeave = status === 'On Leave';
    const bg = isAct
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
      : isLeave
      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap ${bg} ${sizeClasses}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isAct ? 'bg-emerald-500' : isLeave ? 'bg-amber-500' : 'bg-slate-400'
          }`}
        />
        {status}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-medium`}
    >
      {status}
    </span>
  );
};
