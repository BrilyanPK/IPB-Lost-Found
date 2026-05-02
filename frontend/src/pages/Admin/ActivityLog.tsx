import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import api from '../../api/axios';
import { useSort } from '../../hooks/useSort';

const ActivityLog = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { sortedData, requestSort, getSortIcon } = useSort(logs);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/logs');
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="Admin" />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Log Aktivitas Sistem</h1>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('timestamp')}>Waktu{getSortIcon('timestamp')}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('user.full_name')}>Aktor{getSortIcon('user.full_name')}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('action')}>Aksi{getSortIcon('action')}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('target_detail')}>Detail{getSortIcon('target_detail')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Memuat...</td></tr>
                ) : sortedData.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Belum ada log aktivitas.</td></tr>
                ) : sortedData.map((log: any) => (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(log.timestamp).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.user.full_name} ({log.user.role})</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{log.action}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.target_detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ActivityLog;
