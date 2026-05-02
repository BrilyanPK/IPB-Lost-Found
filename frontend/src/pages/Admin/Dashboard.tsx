import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import api from '../../api/axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_petugas: 0,
    total_logs: 0
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/logs');
        setRecentLogs(res.data.slice(0, 5)); // show only top 5 recent
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
    fetchLogs();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="Admin" />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Admin</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-l-4 border-indigo-500">
            <h3 className="text-gray-500 font-medium text-sm mb-1">Total Pengguna</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
          </Card>
          <Card className="p-6 border-l-4 border-blue-500">
            <h3 className="text-gray-500 font-medium text-sm mb-1">Total Petugas Aktif</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total_petugas}</p>
          </Card>
          <Card className="p-6 border-l-4 border-red-500">
            <h3 className="text-gray-500 font-medium text-sm mb-1">Total Log Aktivitas</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total_logs}</p>
          </Card>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Aktivitas Sistem Terbaru</h2>
        <Card className="overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Aktor</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Aksi</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Detail</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Belum ada aktivitas.</td></tr>
              ) : recentLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{log.user.full_name} ({log.user.role})</td>
                  <td className="px-6 py-4 text-sm text-blue-600 font-medium">{log.action}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.target_detail}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(log.timestamp).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
