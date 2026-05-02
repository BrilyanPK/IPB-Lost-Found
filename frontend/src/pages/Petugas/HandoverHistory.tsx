import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import api from '../../api/axios';
import { useSort } from '../../hooks/useSort';

const HandoverHistory = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { sortedData, requestSort, getSortIcon } = useSort(reports);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/petugas/riwayat');
      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="Petugas" />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Riwayat Penyerahan</h1>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('id')}>ID Laporan{getSortIcon('id')}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('item.name')}>Nama Barang{getSortIcon('item.name')}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('user.full_name')}>Penerima{getSortIcon('user.full_name')}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('report_time')}>Tanggal Laporan{getSortIcon('report_time')}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-4">Memuat...</td></tr>
                ) : sortedData.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-gray-500">Belum ada riwayat penyerahan.</td></tr>
                ) : sortedData.map((report: any) => (
                  <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#REP-{report.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{report.item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{report.user.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(report.report_time).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">Selesai / Diserahkan</span>
                    </td>
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

export default HandoverHistory;
