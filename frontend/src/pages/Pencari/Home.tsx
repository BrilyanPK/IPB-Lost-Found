import { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { DatePicker } from '../../components/ui/DatePicker';
import api from '../../api/axios';
import { FiSearch, FiCalendar, FiMapPin, FiArrowRight, FiImage, FiX } from 'react-icons/fi';
import HeroBg from '../../assets/Hero Bg.png';

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

const Home = () => {
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
    const matchSearch = i.item?.name?.toLowerCase().includes(search.toLowerCase()) ?? false;
    const matchCategory = categoryFilter ? i.item?.category?.toLowerCase().includes(categoryFilter.toLowerCase()) : true;
    const matchDate = dateFilter ? new Date(i.report_time).toISOString().split('T')[0] === dateFilter : true;
    return matchSearch && matchCategory && matchDate;
  });

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen overflow-hidden relative">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        {/* Hero Section */}
        <section
          className="relative w-full bg-cover bg-center pt-24 pb-104 px-6 flex flex-col items-center min-h-[85vh] justify-start"
          style={{ backgroundImage: `url('${HeroBg}')` }}
        >
          <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10 mt-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 tracking-tight leading-tight">
              <span className="font-medium text-[#3B5B92]">Platform Bantuan</span> <span className="font-bold text-[#203D7C]">Kehilangan &</span> <br className="hidden md:block" />
              <span className="font-bold text-[#203D7C]">Penemuan</span> <span className="font-medium text-[#3B5B92]">Barang IPB</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
              Platform terintegrasi untuk melaporkan barang hilang dan menemukan pemiliknya dengan lebih mudah, aman, dan transparan.
            </p>
          </div>
        </section>

        {/* Lost Items Section */}
        <section className="px-8 py-12 max-w-6xl mx-auto w-full relative z-20">
          <div className="bg-white/80 backdrop-blur-md border border-gray-100 shadow-xl shadow-blue-900/5 p-6 rounded-2xl mb-12 flex flex-col md:flex-row gap-6 items-end relative z-50">
            <Input 
              label="Cari Kata Kunci"
              icon={<FiSearch />}
              placeholder="Dompet, Kunci..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 w-full !mb-0"
            />
            
            <Select 
              label="Kategori"
              className="flex-1 w-full !mb-0"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="Semua Kategori"
              options={[
                { label: "Semua Kategori", value: "" },
                { label: "Elektronik", value: "Elektronik" },
                { label: "Dokumen", value: "Dokumen" },
                { label: "Aksesoris", value: "Aksesoris" },
                { label: "Kunci", value: "Kunci" },
                { label: "Lainnya", value: "Lainnya" }
              ]}
            />

            <DatePicker 
              label="Waktu"
              selected={dateFilter ? new Date(dateFilter) : null}
              onChange={(date: Date | null) => setDateFilter(date ? date.toISOString().split('T')[0] : '')}
              dateFormat="dd/MM/yyyy"
              placeholderText="Semua Waktu"
              className="flex-1 w-full !mb-0"
              isClearable
            />

            {(search || categoryFilter || dateFilter) && (
              <Button 
                onClick={() => { setSearch(''); setCategoryFilter(''); setDateFilter(''); }}
                variant="outline"
                className="w-full md:w-auto px-6 whitespace-nowrap shadow-sm bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 animate-in fade-in slide-in-from-right-4 duration-300 flex items-center justify-center gap-2"
              >
                <FiX size={16} />
                Reset
              </Button>
            )}
          </div>

          <header className="text-center mb-12 mt-8">
            <h2 className="text-5xl font-bold text-gray-900 tracking-tight">Daftar Kehilangan</h2>
            <p className="text-gray-400 mt-3 text-lg max-w-2xl mx-auto">Bantu komunitas Anda menemukan barang yang hilang. Telusuri laporan kehilangan yang diajukan oleh sesama mahasiswa dan staf.</p>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p className="text-gray-500 col-span-full text-center py-10">Memuat data...</p>
            ) : filteredItems.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center py-10">Belum ada laporan kehilangan yang cocok.</p>
            ) : filteredItems.map((report) => (
              <Card key={report.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col border border-gray-100 p-0 bg-white">
                <div className="h-48 bg-gray-100 w-full relative">
                  {report.item?.photo_url ? (
                    <img src={report.item.photo_url.replace('127.0.0.1', 'localhost')} alt={report.item?.name || 'Item'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FiImage size={32} className="opacity-20" />
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-3">
                    <span className="bg-gray-100 text-gray-800 text-[10px] px-2.5 py-1 rounded font-bold tracking-wide">{report.item?.category || 'Umum'}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-4 text-gray-900">{report.item?.name || 'Barang Hilang'}</h3>
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
        </section>
      </main>

      <Footer />

      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedReport.item?.name || 'Barang Hilang'}</h2>
              <button onClick={() => setSelectedReport(null)} className="text-gray-500 hover:text-gray-900 text-xl font-bold">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Kategori</p>
                <p className="font-medium">{selectedReport.item?.category || 'Umum'}</p>
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

export default Home;
