import { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../api/axios';
import { FiSearch, FiCalendar, FiMapPin, FiArrowRight, FiImage } from 'react-icons/fi';

interface LostItem {
  id: string;
  type: string;
  status: string;
  location: string;
  description: string;
  report_time: string;
  item: {
    name: string;
    category: string;
    photo_url?: string;
  };
  user?: {
    full_name: string;
  };
}

const LostItems = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<LostItem | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/pencari/laporan');
        setItems(res.data.filter((r: LostItem) => r.type === 'Kehilangan'));
      } catch (err: unknown) {
        console.error("Gagal mengambil data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredItems = items.filter(i => {
    const matchSearch = i.item.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter ? i.item.category.toLowerCase().includes(categoryFilter.toLowerCase()) : true;
    const matchDate = dateFilter ? new Date(i.report_time).toISOString().split('T')[0] === dateFilter : true;
    return matchSearch && matchCategory && matchDate;
  });

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen relative">
      <Navbar />
      <main className="flex-1 px-8 py-12 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Daftar Kehilangan Public</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">Bantu komunitas Anda menemukan barang yang hilang. Telusuri laporan kehilangan yang diajukan oleh sesama mahasiswa dan staf.</p>
        </div>

        <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl mb-12 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Cari Kata Kunci</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
                <FiSearch />
              </span>
              <input 
                type="text"
                placeholder="Dompet, Kunci..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Kategori</label>
            <select 
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium text-sm text-gray-600"
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

          <div className="flex-1 w-full space-y-1.5">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Waktu</label>
            <input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium text-sm text-gray-500"
            />
          </div>

          <button className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm shadow-blue-600/20 whitespace-nowrap text-sm">
            Terapkan Filter
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-gray-500 col-span-full text-center py-10">Memuat data...</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-10">Belum ada laporan kehilangan yang cocok.</p>
          ) : filteredItems.map((report) => (
            <Card key={report.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col border border-gray-100 p-0">
              <div className="h-48 bg-gray-100 w-full relative">
                {report.item.photo_url ? (
                  <img src={report.item.photo_url.replace('127.0.0.1', 'localhost')} alt={report.item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiImage size={32} className="opacity-20" />
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1 bg-white">
                <div className="mb-3">
                  <span className="bg-gray-100 text-gray-800 text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider">{report.item.category}</span>
                </div>
                <h3 className="text-lg font-bold mb-4 text-gray-900">{report.item.name}</h3>
                <div className="space-y-2 mb-6">
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <FiCalendar className="text-gray-400" size={14} />
                    {new Date(report.report_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ", " + new Date(report.report_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + " WIB"}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <FiMapPin className="text-gray-400" size={14} />
                    {report.location}
                  </p>
                </div>
                
                <button 
                  onClick={() => setSelectedReport(report)}
                  className="mt-auto w-full py-2.5 bg-[#0A2656] hover:bg-[#123670] text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  Lihat Detail <FiArrowRight />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </main>
      <Footer />

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
