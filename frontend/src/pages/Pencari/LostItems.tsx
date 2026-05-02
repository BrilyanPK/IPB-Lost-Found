import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const LostItems = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/pencari/laporan');
        // Show only Lost reports for Pencari
        setItems(res.data.filter((r: any) => r.type === 'Kehilangan'));
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          console.error("Gagal mengambil data", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [navigate]);

  const filteredItems = items.filter(i => {
    const matchSearch = i.item.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter ? i.item.category.toLowerCase().includes(categoryFilter.toLowerCase()) : true;
    return matchSearch && matchCategory;
  });

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen relative">
      <Navbar />
      <main className="flex-1 px-8 py-12 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Daftar Kehilangan</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Input 
              label="" 
              placeholder="Cari nama barang..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 mb-0" 
            />
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Dokumen">Dokumen</option>
              <option value="Aksesoris">Aksesoris</option>
              <option value="Kunci">Kunci</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-gray-500">Memuat data...</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-gray-500">Belum ada laporan kehilangan yang cocok.</p>
          ) : filteredItems.map((report) => (
            <Card key={report.id} className="p-6 hover:shadow-md transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">{report.item.category}</span>
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  report.status === 'Dikembalikan' ? 'bg-green-100 text-green-800' : 
                  report.status === 'Ditemukan' ? 'bg-blue-100 text-blue-800' :
                  report.status === 'Diproses' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {report.status}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{report.item.name}</h3>
              <p className="text-sm text-gray-500 mb-1">📍 {report.location}</p>
              <p className="text-sm text-gray-500 mb-4">🕒 {new Date(report.report_time).toLocaleDateString('id-ID')}</p>
              
              <Button variant="outline" className="mt-auto w-full" onClick={() => setSelectedReport(report)}>Lihat Detail</Button>
            </Card>
          ))}
        </div>
      </main>

      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedReport.item.name}</h2>
              <button onClick={() => setSelectedReport(null)} className="text-gray-500 hover:text-gray-900 text-xl font-bold">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Kategori</p>
                <p className="font-medium">{selectedReport.item.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lokasi Hilang</p>
                <p className="font-medium">{selectedReport.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Waktu Laporan</p>
                <p className="font-medium">{new Date(selectedReport.report_time).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pelapor</p>
                <p className="font-medium">{selectedReport.user?.full_name || 'NN'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-block mt-1 text-xs px-2 py-1 rounded font-medium ${
                  selectedReport.status === 'Dikembalikan' ? 'bg-green-100 text-green-800' : 
                  selectedReport.status === 'Ditemukan' ? 'bg-blue-100 text-blue-800' :
                  selectedReport.status === 'Diproses' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedReport.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Deskripsi Detail</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-1 text-sm border border-gray-100">{selectedReport.description}</p>
              </div>
            </div>
            <Button className="w-full mt-6" onClick={() => setSelectedReport(null)}>Tutup</Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LostItems;
