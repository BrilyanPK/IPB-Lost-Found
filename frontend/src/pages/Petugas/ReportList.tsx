import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../api/axios';
import { useSort } from '../../hooks/useSort';

const ReportList = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { sortedData, requestSort, getSortIcon } = useSort(reports);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/petugas/laporan');
      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await api.patch(`/petugas/laporan/${id}/status`, { status: newStatus });
      alert('Status berhasil diperbarui!');
      fetchReports();
    } catch (err) {
      alert('Gagal memperbarui status');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="Petugas" />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Daftar Laporan</h1>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('id')}>ID Laporan{getSortIcon('id')}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('type')}>Tipe{getSortIcon('type')}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('user.full_name')}>Nama Pelapor{getSortIcon('user.full_name')}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('item.name')}>Barang{getSortIcon('item.name')}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('status')}>Status{getSortIcon('status')}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-4">Memuat...</td></tr>
                ) : sortedData.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4 text-gray-500">Belum ada laporan.</td></tr>
                ) : sortedData.map((report: any) => (
                  <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#REP-{report.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{report.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{report.user.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{report.item.name}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        report.status === 'Dikembalikan' ? 'bg-green-100 text-green-800' : 
                        report.status === 'Ditemukan' ? 'bg-blue-100 text-blue-800' :
                        report.status === 'Diproses' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {report.status === 'Hilang' && (
                        <Button variant="outline" className="py-1 px-3 text-sm" onClick={() => updateStatus(report.id, 'Diproses')}>Proses</Button>
                      )}
                      {report.status !== 'Dikembalikan' && (
                        <Button className="py-1 px-3 text-sm" onClick={() => updateStatus(report.id, 'Dikembalikan')}>Selesai</Button>
                      )}
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

export default ReportList;
