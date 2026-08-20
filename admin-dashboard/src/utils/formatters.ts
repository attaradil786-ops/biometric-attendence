import { AttendanceStatus, BreakStatus, DeviceStatus } from '../types';

export function formatMinutesToHours(minutes: number): string {
  if (isNaN(minutes) || minutes <= 0) return '0h 00m';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
}

export function formatTimeString(time: string | null | undefined): string {
  if (!time) return '--:--';
  // If format is HH:mm:ss, convert to 12-hour AM/PM
  const parts = time.split(':');
  if (parts.length >= 2) {
    let hour = parseInt(parts[0], 10);
    const min = parts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    return `${hour}:${min} ${ampm}`;
  }
  return time;
}

export function formatDateString(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getAttendanceStatusBadgeProps(status: AttendanceStatus): {
  bg: string;
  text: string;
  dot: string;
  border: string;
} {
  switch (status) {
    case 'Present':
      return {
        bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
        text: 'Present',
        dot: 'bg-emerald-500',
        border: 'border-emerald-200 dark:border-emerald-800/40',
      };
    case 'Working':
      return {
        bg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
        text: 'Working Now',
        dot: 'bg-sky-500 animate-pulse',
        border: 'border-sky-200 dark:border-sky-800/40',
      };
    case 'Late':
      return {
        bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        text: 'Late Check-in',
        dot: 'bg-amber-500',
        border: 'border-amber-200 dark:border-amber-800/40',
      };
    case 'Early Checkout':
      return {
        bg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
        text: 'Early Checkout',
        dot: 'bg-orange-500',
        border: 'border-orange-200 dark:border-orange-800/40',
      };
    case 'Absent':
      return {
        bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
        text: 'Absent',
        dot: 'bg-rose-500',
        border: 'border-rose-200 dark:border-rose-800/40',
      };
    case 'On Leave':
      return {
        bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        text: 'On Leave',
        dot: 'bg-slate-400',
        border: 'border-slate-200 dark:border-slate-700',
      };
    default:
      return {
        bg: 'bg-gray-100 text-gray-700',
        text: status,
        dot: 'bg-gray-400',
        border: 'border-gray-200',
      };
  }
}

export function getBreakStatusBadgeProps(status: BreakStatus): {
  bg: string;
  text: string;
  dot: string;
} {
  switch (status) {
    case 'Active':
      return {
        bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200',
        text: 'On Break',
        dot: 'bg-amber-500 animate-ping',
      };
    case 'Completed':
      return {
        bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200',
        text: 'Completed',
        dot: 'bg-emerald-500',
      };
    case 'Overbreak':
      return {
        bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200',
        text: 'Exceeded Limit',
        dot: 'bg-rose-500',
      };
  }
}

export function getDeviceStatusBadgeProps(status: DeviceStatus): {
  bg: string;
  text: string;
  dot: string;
} {
  switch (status) {
    case 'Online':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        text: 'Online',
        dot: 'bg-emerald-500',
      };
    case 'Offline':
      return {
        bg: 'bg-rose-50 text-rose-700 border border-rose-200',
        text: 'Offline',
        dot: 'bg-rose-500',
      };
    case 'Syncing':
      return {
        bg: 'bg-sky-50 text-sky-700 border border-sky-200',
        text: 'Syncing...',
        dot: 'bg-sky-500 animate-spin',
      };
    case 'Error':
      return {
        bg: 'bg-amber-50 text-amber-700 border border-amber-200',
        text: 'Attention Needed',
        dot: 'bg-amber-500',
      };
  }
}

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
