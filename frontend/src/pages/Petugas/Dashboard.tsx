import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import api from '../../api/axios';
import { useSort } from '../../hooks/useSort';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_inventory: 0,
    reports_today: 0,
    total_lost: 0,
    total_found: 0
  });
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const { sortedData, requestSort, getSortIcon } = useSort(recentReports);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/petugas/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchRecentReports = async () => {
      try {
        const res = await api.get('/petugas/laporan');
        setRecentReports(res.data.slice(0, 10));
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
    fetchRecentReports();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="Petugas" />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Petugas</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-l-4 border-primary">
            <h3 className="text-gray-500 font-medium text-sm mb-1">Total Barang di Inventaris</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total_inventory}</p>
          </Card>
          <Card className="p-6 border-l-4 border-green-500">
            <h3 className="text-gray-500 font-medium text-sm mb-1">Laporan Baru Hari Ini</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.reports_today}</p>
          </Card>
          <Card className="p-6 border-l-4 border-yellow-500">
            <h3 className="text-gray-500 font-medium text-sm mb-1">Total Laporan Kehilangan</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total_lost}</p>
          </Card>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Aktivitas Terbaru</h2>
        <Card className="overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('item.name')}>Barang{getSortIcon('item.name')}</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('type')}>Tipe{getSortIcon('type')}</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('user.full_name')}>Pelapor{getSortIcon('user.full_name')}</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('report_time')}>Waktu{getSortIcon('report_time')}</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('status')}>Status{getSortIcon('status')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Belum ada aktivitas.</td></tr>
              ) : sortedData.map((report: any) => (
                <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{report.item?.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${report.type === 'Kehilangan' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>{report.type === 'Kehilangan' ? 'Kehilangan' : 'Temuan'}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{report.user?.full_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(report.report_time).toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      report.status === 'Dikembalikan' ? 'bg-green-100 text-green-800' : 
                      report.status === 'Ditemukan' ? 'bg-blue-100 text-blue-800' :
                      report.status === 'Diproses' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>{report.status}</span>
                  </td>
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
