import React from 'react';
import { Printer, X, Download, Fingerprint, Building2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { formatMinutesToHours, formatDateString, formatTimeString } from '../../utils/formatters';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: string;
  dateRange: { start: string; end: string };
  departmentName: string;
  data: any[];
  summaryStats: {
    totalRecords: number;
    totalHours: string;
    totalOvertime: string;
    presentCount: number;
    absentCount: number;
    lateCount: number;
  };
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  reportType,
  dateRange,
  departmentName,
  data,
  summaryStats,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Print Attendance & Payroll Report"
      subtitle="Review printable timesheet document"
      maxWidth="4xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-400">
            Official Biometric Time & Attendance Audit Document
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
          </div>
        </div>
      }
    >
      <div className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 space-y-6 print:p-0 print:border-none">
        {/* Report Document Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                BioSync Enterprise Workforce Systems
              </h3>
              <p className="text-xs text-slate-500">
                Official Biometric Time & Attendance Audit Sheet
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-semibold text-slate-800 uppercase tracking-wider">{reportType}</p>
            <p>Period: {formatDateString(dateRange.start)} - {formatDateString(dateRange.end)}</p>
            <p>Dept: {departmentName}</p>
          </div>
        </div>

        {/* Summary Metric Strip */}
        <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center text-xs">
          <div>
            <span className="text-slate-500">Present Turnout</span>
            <p className="font-bold text-sm text-slate-900">{summaryStats.presentCount} records</p>
          </div>
          <div>
            <span className="text-slate-500">Late Exceptions</span>
            <p className="font-bold text-sm text-amber-700">{summaryStats.lateCount} records</p>
          </div>
          <div>
            <span className="text-slate-500">Total Work Hours</span>
            <p className="font-bold text-sm text-indigo-700">{summaryStats.totalHours}</p>
          </div>
          <div>
            <span className="text-slate-500">Calculated Overtime</span>
            <p className="font-bold text-sm text-emerald-700">{summaryStats.totalOvertime}</p>
          </div>
        </div>

        {/* Printable Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] border-b border-slate-300">
                <th className="p-2">Date</th>
                <th className="p-2">Employee ID</th>
                <th className="p-2">Name</th>
                <th className="p-2">Department</th>
                <th className="p-2">Check-In</th>
                <th className="p-2">Check-Out</th>
                <th className="p-2">Total Hours</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-2 font-mono text-[11px]">{row.date}</td>
                  <td className="p-2 font-mono text-[11px] text-slate-500">{row.employeeId}</td>
                  <td className="p-2 font-semibold text-slate-900">{row.employeeName}</td>
                  <td className="p-2 text-slate-600">{row.departmentName}</td>
                  <td className="p-2 font-mono">{formatTimeString(row.checkIn)}</td>
                  <td className="p-2 font-mono">{formatTimeString(row.checkOut)}</td>
                  <td className="p-2 font-mono font-medium text-slate-800">
                    {formatMinutesToHours(row.workDurationMinutes || 0)}
                  </td>
                  <td className="p-2">
                    <span className="font-semibold text-[11px] text-slate-800">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signatures footer */}
        <div className="grid grid-cols-2 gap-12 pt-8 text-xs border-t border-slate-200">
          <div>
            <div className="border-b border-slate-400 pb-8" />
            <p className="pt-2 font-semibold text-slate-700">Prepared By: HR / Attendance Admin</p>
            <p className="text-[11px] text-slate-400">Date: August 18, 2026</p>
          </div>
          <div>
            <div className="border-b border-slate-400 pb-8" />
            <p className="pt-2 font-semibold text-slate-700">Verified & Approved By: Operations Director</p>
            <p className="text-[11px] text-slate-400">Signature & Official Stamp</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
