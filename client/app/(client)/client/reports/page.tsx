'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Download, Eye, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface Report {
  id: string;
  title: string;
  type: string;
  period: string;
  sharedAt: string;
}

export default function ClientReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setReports([
        { id: '1', title: 'Q1 Financial Summary', type: 'Quarterly Statement', period: 'Jan - Mar 2026', sharedAt: '2026-04-05T00:00:00Z' },
        { id: '2', title: 'Annual Tax Document 2025', type: 'Tax Report', period: '2025', sharedAt: '2026-02-15T00:00:00Z' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <BarChart3 className="text-[var(--brand-primary,#2563EB)]" /> Financial Reports
        </h1>
        <p className="text-gray-500 mt-2">Access statements and performance reports shared by your account manager.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Report Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Period</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Shared On</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
               <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading reports...</td></tr>
            ) : reports.map(report => (
              <tr key={report.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900 flex items-center gap-2">
                    <FileIcon type={report.type} />
                    {report.title}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">{report.type}</span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-600 flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400"/> {report.period}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(report.sharedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                  <button className="p-2 text-gray-400 hover:text-[var(--brand-primary)] bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                    <Eye size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-[var(--brand-primary)] bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                    <Download size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FileIcon({ type }: { type: string }) {
  return (
    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[var(--brand-primary)]">
      <BarChart3 size={14} />
    </div>
  );
}
