import { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { DatePicker } from '../../components/ui/DatePicker';
import api from '../../api/axios';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { FiSearch, FiCalendar, FiMapPin, FiArrowRight, FiImage, FiX, FiCheckCircle } from 'react-icons/fi';
import HeroBg from '../../assets/Hero Bg.png';

interface LostItem {
  id: string;
  type: string;
  status: string;
  location: string;
  description: string;
  report_time: string;
  // Note: finder_id is used for claim tracking
  finder_id?: string | null;
  item: {
    name: string;
    category: string;
    photo_url?: string;
  };
  user?: {
    full_name: string;
  };
  user_id: string;
}

interface DecodedToken {
  sub?: string;
}

const Home = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<LostItem | null>(null);
  const [showClaimConfirm, setShowClaimConfirm] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/pencari/laporan');
        setItems(res.data.filter((r: LostItem) => r.type === 'Kehilangan' && r.status !== 'Dikembalikan'));
      } catch (err: unknown) {
        console.error("Gagal mengambil data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const token = localStorage.getItem('token');
  let currentUserId = '';
  if (token) {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      currentUserId = decoded.sub || '';
    } catch (e) {
      console.error("Invalid token");
    }
  }

  const handleClaimFound = async () => {
    if (!selectedReport) return;
    
    setIsClaiming(true);
    try {
      await api.patch(`/pencari/laporan/${selectedReport.id}/found`);
      toast.success("Berhasil! Laporan kini sedang diproses. Silakan serahkan barang ke pos satpam.");
      
      // Update local state
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === selectedReport.id 
            ? { ...item, status: 'Diproses', finder_id: currentUserId } 
            : item
        )
      );
      setSelectedReport(prev => prev ? { ...prev, status: 'Diproses', finder_id: currentUserId } : null);
      setShowClaimConfirm(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Gagal mengklaim penemuan barang");
    } finally {
      setIsClaiming(false);
    }
  };

  const filteredItems = items.filter(i => {
    const searchLower = search.toLowerCase();
    const matchSearch = searchLower === '' || (
      (i.item?.name?.toLowerCase().includes(searchLower) ?? false) ||
      (i.description?.toLowerCase().includes(searchLower) ?? false) ||
      (i.location?.toLowerCase().includes(searchLower) ?? false) ||
      (i.user?.full_name?.toLowerCase().includes(searchLower) ?? false)
    );
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedReport(null)}>
          <Card className="max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedReport.item?.name || 'Detail Laporan'}</h2>
                <span className="inline-block mt-2 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded">
                  Kehilangan
                </span>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full shrink-0 ml-4 transition-colors">
                <FiX size={20} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Kolom Kiri: Foto */}
              {selectedReport.item?.photo_url && (
                <div className="w-full md:w-5/12 shrink-0">
                  <div className="w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
                    <img 
                      src={selectedReport.item.photo_url.replace('127.0.0.1', 'localhost')} 
                      alt={selectedReport.item?.name || 'Item'} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                </div>
              )}
              
              {/* Kolom Kanan: Detail Informasi */}
              <div className="flex-1 flex flex-col space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Kategori</p>
                    <p className="font-medium text-gray-900">{selectedReport.item?.category || 'Umum'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lokasi Hilang</p>
                    <p className="font-medium text-gray-900">{selectedReport.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Waktu Laporan</p>
                    <p className="font-medium text-gray-900">{new Date(selectedReport.report_time).toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pelapor</p>
                    <p className="font-medium text-gray-900">{selectedReport.user?.full_name || 'NN'}</p>
                  </div>
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

                {token && (selectedReport.status === 'Hilang' || selectedReport.status === 'Diproses') && currentUserId && currentUserId !== selectedReport.user_id && currentUserId !== selectedReport.finder_id && (
                  <div className="pt-4 mt-auto border-t border-gray-100">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 py-3 text-base" 
                      onClick={() => setShowClaimConfirm(true)}
                    >
                      Saya Menemukan Barang Ini
                    </Button>
                  </div>
                )}

                {currentUserId && currentUserId === selectedReport.finder_id && selectedReport.status === 'Diproses' && (
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="w-full bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
                      <FiCheckCircle size={20} className="shrink-0" />
                      <p className="text-sm font-medium leading-snug">Anda telah mengklaim penemuan barang ini. Mohon serahkan ke pos satpam terdekat.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
      {/* Custom Claim Confirmation Modal */}
      {showClaimConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowClaimConfirm(false)}></div>
          <Card className="relative w-full max-w-sm p-8 bg-white border-none shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
              <FiCheckCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Klaim Barang</h3>
            <p className="text-gray-500 mb-8 leading-relaxed text-sm">
              Pastikan Anda benar-benar menemukan barang ini. Harap segera serahkan ke <strong>Pos Satpam</strong> setelah konfirmasi.
            </p>
            <div className="flex gap-3 w-full">
              <Button 
                variant="outline" 
                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50" 
                onClick={() => setShowClaimConfirm(false)}
                disabled={isClaiming}
              >
                Batal
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20" 
                onClick={handleClaimFound}
                disabled={isClaiming}
              >
                {isClaiming ? 'Memproses...' : 'Konfirmasi'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Home;
