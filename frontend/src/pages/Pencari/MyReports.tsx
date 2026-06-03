import { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { useSort } from '../../hooks/useSort';
import { FiLock, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';

interface UserReport {
  id: string;
  status: string;
  location: string;
  description: string;
  report_time: string;
  finder_id?: string | null;
  user_id?: string | null;
  contact_info?: string;
  item: {
    name: string;
    photo_url?: string;
    category?: string;
  };
}

const MyReports = () => {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    item_name: '',
    item_category: '',
    location: '',
    description: '',
    contact_info: ''
  });
  const { sortedData, requestSort, getSortIcon } = useSort(reports);

  useEffect(() => {
    if (selectedReport) {
      setEditForm({
        item_name: selectedReport.item.name,
        item_category: selectedReport.item.category || '',
        location: selectedReport.location,
        description: selectedReport.description,
        contact_info: selectedReport.contact_info || ''
      });
      setIsEditing(false);
      setShowCancelConfirm(false);
    }
  }, [selectedReport]);

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

  const handleDelete = async () => {
    if (!selectedReport) return;
    setIsDeleting(true);
    try {
      await api.delete(`/pencari/laporan/${selectedReport.id}`);
      setReports(prev => prev.filter(r => r.id !== selectedReport.id));
      setShowCancelConfirm(false);
      setSelectedReport(null);
      toast.success('Laporan berhasil dibatalkan dan dihapus.');
    } catch (err) {
      console.error("Gagal menghapus laporan", err);
      toast.error("Gagal membatalkan laporan. Silakan coba lagi.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedReport) return;
    setIsSaving(true);
    try {
      await api.patch(`/pencari/laporan/${selectedReport.id}`, editForm);
      setReports(prev => prev.map(r => r.id === selectedReport.id ? {
        ...r,
        location: editForm.location,
        description: editForm.description,
        contact_info: editForm.contact_info,
        item: { ...r.item, name: editForm.item_name, category: editForm.item_category }
      } : r));
      setSelectedReport(prev => prev ? {
        ...prev,
        location: editForm.location,
        description: editForm.description,
        contact_info: editForm.contact_info,
        item: { ...prev.item, name: editForm.item_name, category: editForm.item_category }
      } : null);
      setIsEditing(false);
      toast.success('Laporan berhasil diperbarui.');
    } catch (err) {
      console.error("Gagal menyimpan perubahan", err);
      toast.error("Gagal menyimpan perubahan. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen relative">
      <Navbar />
      <main className="flex-1 px-8 py-12 max-w-5xl mx-auto w-full min-h-[75vh]">
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-12 text-center">Laporanku</h1>

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
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-blue-600 transition-colors" onClick={() => requestSort('id')}><div className="flex items-center">ID Laporan {getSortIcon('id')}</div></th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-blue-600 transition-colors" onClick={() => requestSort('item.name')}><div className="flex items-center">Nama Barang {getSortIcon('item.name')}</div></th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-blue-600 transition-colors" onClick={() => requestSort('report_time')}><div className="flex items-center">Tanggal {getSortIcon('report_time')}</div></th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-blue-600 transition-colors" onClick={() => requestSort('status')}><div className="flex items-center">Status {getSortIcon('status')}</div></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">Memuat data laporan...</td>
                      </tr>
                    ) : sortedData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                              <span className="text-3xl">📄</span>
                            </div>
                            <p className="text-gray-500 font-medium">Belum ada laporan yang Anda buat.</p>
                            <Link to="/report-lost">
                              <Button variant="outline" className="mt-2 border-gray-200 text-gray-600">Buat Laporan Sekarang</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ) : sortedData.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50/80 transition-colors">
                        <td 
                          className="px-6 py-5 text-sm font-semibold text-blue-600 hover:text-blue-800 cursor-pointer transition-colors" 
                          onClick={() => setSelectedReport(report)}
                        >
                          #REP-{report.id.toString().padStart(3, '0')}
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-700">{report.item.name}</td>
                        <td className="px-6 py-5 text-sm text-gray-500">{new Date(report.report_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-block text-xs px-2.5 py-1 rounded font-medium ${
                            report.status === 'Dikembalikan' ? 'bg-green-100 text-green-800' : 
                            report.status === 'Ditemukan' ? 'bg-blue-100 text-blue-800' :
                            report.status === 'Diproses' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>{report.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {selectedReport && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedReport(null)}>
                <Card className="max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Laporan' : 'Detail Laporanku'}</h2>
                    <button onClick={() => setSelectedReport(null)} className="text-gray-500 hover:text-gray-900 text-xl font-bold">✕</button>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
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
                      {isEditing ? (
                        <div className="space-y-4">
                          <Input 
                            label="Nama Barang"
                            name="item_name"
                            value={editForm.item_name}
                            onChange={(e) => setEditForm({...editForm, item_name: e.target.value})}
                            required
                          />
                          <Select 
                            label="Kategori"
                            name="item_category"
                            value={editForm.item_category}
                            onChange={(e: any) => setEditForm({...editForm, item_category: e.target.value})}
                            options={[
                              { value: 'Elektronik', label: 'Elektronik' },
                              { value: 'Pakaian', label: 'Pakaian' },
                              { value: 'Dokumen', label: 'Dokumen' },
                              { value: 'Aksesoris', label: 'Aksesoris' },
                              { value: 'Lainnya', label: 'Lainnya' },
                            ]}
                            required
                          />
                          <Input 
                            label="Lokasi Hilang"
                            name="location"
                            value={editForm.location}
                            onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                            required
                          />
                          <Input 
                            label="Kontak (No HP / WA)"
                            name="contact_info"
                            value={editForm.contact_info}
                            onChange={(e) => setEditForm({...editForm, contact_info: e.target.value})}
                            required
                          />
                          <Textarea 
                            label="Deskripsi Detail"
                            name="description"
                            value={editForm.description}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          />
                          <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <Button 
                              variant="outline" 
                              className="flex-1" 
                              onClick={() => setIsEditing(false)}
                              disabled={isSaving}
                            >
                              Batal
                            </Button>
                            <Button 
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" 
                              onClick={handleSaveEdit}
                              disabled={isSaving}
                            >
                              {isSaving ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Nama Barang</p>
                              <p className="font-medium text-gray-900">{selectedReport.item?.name}</p>
                            </div>
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
                              <p className="text-sm text-gray-500">ID Laporan</p>
                              <p className="font-medium text-gray-900">#REP-{selectedReport.id.toString().padStart(3, '0')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Kontak</p>
                              <p className="font-medium text-gray-900">{selectedReport.contact_info || '-'}</p>
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
                          
                          {selectedReport.status === 'Hilang' && (
                            <div className="pt-4 mt-auto border-t border-gray-100 flex gap-3">
                              <Button 
                                variant="outline"
                                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors py-2.5" 
                                onClick={() => {
                                  setEditForm({
                                    item_name: selectedReport.item.name,
                                    item_category: selectedReport.item.category || 'Lainnya',
                                    location: selectedReport.location,
                                    description: selectedReport.description,
                                    contact_info: selectedReport.contact_info || ''
                                  });
                                  setIsEditing(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outline"
                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors py-2.5" 
                                onClick={() => setShowCancelConfirm(true)}
                              >
                                Batalkan
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )}
            {showCancelConfirm && selectedReport && (
              <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => !isDeleting && setShowCancelConfirm(false)}>
                <Card className="max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                      <FiX size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Batalkan Laporan?</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        Anda yakin ingin membatalkan laporan <strong className="text-gray-700">#REP-{selectedReport.id.toString().padStart(3, '0')}</strong>? Tindakan ini akan menghapus laporan secara permanen.
                      </p>
                    </div>
                    <div className="flex gap-3 w-full mt-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowCancelConfirm(false)}
                        disabled={isDeleting}
                      >
                        Kembali
                      </Button>
                      <Button 
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Memproses...' : 'Ya, Batalkan'}
                      </Button>
                    </div>
                  </div>
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
