import { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { useSort } from '../../hooks/useSort';
import { FiLock } from 'react-icons/fi';

interface UserReport {
  id: string;
  status: string;
  location: string;
  description: string;
  report_time: string;
  item: {
    name: string;
  };
}

const MyReports = () => {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const { sortedData, requestSort, getSortIcon } = useSort(reports);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchMyReports = async () => {
      try {
        const res = await api.get('/pencari/laporan/me');
        setReports(res.data);
      } catch (err: unknown) {
        console.error("Gagal mengambil data laporan", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyReports();
  }, [isLoggedIn]);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen relative">
      <Navbar />
      <main className="flex-1 px-8 py-12 max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Laporanku</h1>

        {!isLoggedIn ? (
          <Card className="p-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
              <FiLock className="w-10 h-10 text-[#203D7C]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Login Diperlukan</h2>
            <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
              Untuk melihat laporan Anda, silakan login terlebih dahulu. 
              Jika belum memiliki akun, Anda dapat membuat akun baru.
            </p>
            <div className="flex gap-4">
              <Link to="/login">
                <Button className="px-8">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" className="px-8">Buat Akun</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('id')}>ID Laporan{getSortIcon('id')}</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('item.name')}>Nama Barang{getSortIcon('item.name')}</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('report_time')}>Tanggal{getSortIcon('report_time')}</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-primary" onClick={() => requestSort('status')}>Status{getSortIcon('status')}</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Memuat...</td>
                      </tr>
                    ) : sortedData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Belum ada laporan.</td>
                      </tr>
                    ) : sortedData.map((report) => (
                      <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#REP-{report.id.toString().padStart(3, '0')}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{report.item.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(report.report_time).toLocaleDateString('id-ID')}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            report.status === 'Dikembalikan' ? 'bg-green-100 text-green-800' : 
                            report.status === 'Ditemukan' ? 'bg-blue-100 text-blue-800' :
                            report.status === 'Diproses' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>{report.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="outline" className="py-1 px-3 text-sm" onClick={() => setSelectedReport(report)}>Detail</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {selectedReport && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Detail Laporanku</h2>
                    <button onClick={() => setSelectedReport(null)} className="text-gray-500 hover:text-gray-900 text-xl font-bold">✕</button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Nama Barang</p>
                      <p className="font-medium text-lg">{selectedReport.item.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status Laporan</p>
                      <span className={`inline-block mt-1 text-xs px-2 py-1 rounded font-medium ${
                        selectedReport.status === 'Dikembalikan' ? 'bg-green-100 text-green-800' : 
                        selectedReport.status === 'Ditemukan' ? 'bg-blue-100 text-blue-800' :
                        selectedReport.status === 'Diproses' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedReport.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Lokasi Terakhir</p>
                      <p className="font-medium">{selectedReport.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Waktu Pelaporan</p>
                      <p className="font-medium">{new Date(selectedReport.report_time).toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Deskripsi Barang</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-1 text-sm border border-gray-100">{selectedReport.description}</p>
                    </div>
                  </div>
                  <Button className="w-full mt-6" onClick={() => setSelectedReport(null)}>Tutup</Button>
                </Card>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyReports;
