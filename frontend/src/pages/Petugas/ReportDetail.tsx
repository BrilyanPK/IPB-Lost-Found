import React, { Component } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { withRouter } from '../../utils/withRouter';
import type { WithRouterProps } from '../../utils/withRouter';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import axios from 'axios';
import { 
  FiChevronLeft, 
  FiEdit3, 
  FiBriefcase, 
  FiCalendar, 
  FiMapPin, 
  FiUser,
  FiFileText,
  FiX,
  FiUploadCloud
} from 'react-icons/fi';

interface ReportItem {
  id: string;
  type: string;
  report_time: string;
  location: string;
  description: string;
  status: string;
  receiver_name?: string;
  item: {
    id: string;
    name: string;
    category: string;
    photo_url?: string;
  };
  user: {
    full_name: string;
  };
}

interface ReportDetailState {
  report: ReportItem | null;
  loading: boolean;
  isEditing: boolean;
  editData: {
    finder_name: string;
    item_name: string;
    category: string;
    occurrence_time: string;
    location: string;
    description: string;
    status: string;
    receiver_name: string;
  };
  selectedFile: File | null;
  previewUrl: string | null;
  updating: boolean;
}

class ReportDetailComponent extends Component<WithRouterProps, ReportDetailState> {
  constructor(props: WithRouterProps) {
    super(props);
    this.state = {
      report: null,
      loading: true,
      isEditing: false,
      editData: {
        finder_name: '',
        item_name: '',
        category: '',
        occurrence_time: '',
        location: '',
        description: '',
        status: '',
        receiver_name: ''
      },
      selectedFile: null,
      previewUrl: null,
      updating: false
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const { id } = this.props.params;
    try {
      const res = await api.get('/petugas/laporan');
      const report = res.data.find((r: ReportItem) => r.id === id);
      if (report) {
        // Extract finder name from description if it was prepended earlier
        let finder_name = '';
        let description = report.description;
        if (report.description.startsWith('Penemu: ')) {
          const parts = report.description.split('\n\n');
          finder_name = parts[0].replace('Penemu: ', '');
          description = parts.slice(1).join('\n\n');
        }

        this.setState({ 
          report, 
          loading: false,
          editData: {
            finder_name,
            item_name: report.item.name,
            category: report.item.category,
            occurrence_time: new Date(report.report_time).toISOString().slice(0, 16),
            location: report.location,
            description,
            status: report.status,
            receiver_name: report.receiver_name || ''
          },
          previewUrl: report.item.photo_url || null
        });
      } else {
        this.setState({ loading: false });
      }
    } catch (err) {
      console.error(err);
      this.setState({ loading: false });
    }
  };

  handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      this.setState({ 
        selectedFile: file,
        previewUrl: URL.createObjectURL(file)
      });
    }
  };

  handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    this.setState({ updating: true });
    const { report, editData, selectedFile } = this.state;
    if (!report) return;

    try {
      let uploadedPhotoUrl = report.item.photo_url;

      // Handle photo upload if a new file is selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        const uploadRes = await api.post('/upload/image', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedPhotoUrl = uploadRes.data.url;
      }

      const combinedDescription = editData.finder_name 
        ? `Penemu: ${editData.finder_name}\n\n${editData.description}` 
        : editData.description;

      await api.patch(`/petugas/laporan/${report.id}/status`, {
        status: editData.status,
        receiver_name: editData.receiver_name || null,
        description: combinedDescription,
        photo_url: uploadedPhotoUrl
      });

      toast.success('Laporan berhasil diperbarui!');
      this.setState({ isEditing: false, updating: false, selectedFile: null });
      this.fetchData();
    } catch (err: unknown) {
      console.error(err);
      let errorMessage = 'Gagal memperbarui laporan';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.detail || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error('Error: ' + errorMessage);
    } finally {this.setState({ updating: false });
    }
  };

  handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan laporan ini?')) return;
    toast.success('Laporan berhasil dibatalkan.');
    this.props.navigate('/petugas/reports');
  };

  render() {
    const { report, loading, isEditing, editData, previewUrl, updating } = this.state;
    const { navigate } = this.props;

    if (loading) return <div className="p-12 font-bold text-gray-400">Loading...</div>;
    if (!report) return <div className="p-12 font-bold text-red-500">Report not found</div>;

    if (isEditing) {
      return (
        <div className="flex min-h-screen bg-[#FDFDFD]">
          <Sidebar role="Petugas" />
          <main className="flex-1 p-12 overflow-y-auto">
            <header className="mb-12 flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold text-gray-900 tracking-tight">Edit Laporan</h1>
                <p className="text-gray-400 mt-3 text-lg">Perbarui informasi laporan dengan detail terbaru.</p>
              </div>
              <button 
                onClick={() => this.setState({ isEditing: false, selectedFile: null, previewUrl: report.item.photo_url || null })}
                className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:text-gray-900 transition-all border border-gray-100 flex items-center gap-2 font-bold text-sm tracking-wide"
              >
                <FiX size={20} />
                Cancel
              </button>
            </header>

            <form onSubmit={this.handleUpdate} className="flex gap-8 max-w-6xl pb-20">
              <div className="flex-1">
                <Card className="p-12 shadow-sm border-none ring-1 ring-gray-100">
                  <div className="flex items-center gap-3 mb-12">
                    <FiFileText className="text-gray-900" size={24} />
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Detail Laporan</h2>
                  </div>

                  <div>
                    <Input 
                      label="Nama Penemu"
                      placeholder="Tulis nama penemu"
                      value={editData.finder_name}
                      onChange={e => this.setState({ editData: { ...editData, finder_name: e.target.value } })}
                      
                    />

                    <Input 
                      label="Nama Barang"
                      placeholder="Contoh: Tumbler Hydroflask Biru"
                      value={editData.item_name}
                      onChange={e => this.setState({ editData: { ...editData, item_name: e.target.value } })}
                      required
                      disabled
                      
                    />

                    <div className="grid grid-cols-2 gap-6">
                        <Select 
                          label="Kategori"
                          value={editData.category}
                          onChange={e => this.setState({ editData: { ...editData, category: e.target.value } })}
                          required
                          disabled
                          
                          options={[
                            { label: "Elektronik", value: "Elektronik" },
                            { label: "Dokumen", value: "Dokumen" },
                            { label: "Aksesoris", value: "Aksesoris" },
                            { label: "Pakaian", value: "Pakaian" },
                            { label: "Lainnya", value: "Lainnya" }
                          ]}
                        />

                      <Input 
                        label="Waktu Kejadian"
                        type="datetime-local"
                        value={editData.occurrence_time}
                        onChange={e => this.setState({ editData: { ...editData, occurrence_time: e.target.value } })}
                        required
                        disabled
                        
                      />
                    </div>

                    <Input 
                      label="Lokasi Kejadian"
                      placeholder="Misal: Perpustakaan LSI"
                      value={editData.location}
                      onChange={e => this.setState({ editData: { ...editData, location: e.target.value } })}
                      required
                      disabled
                      
                    />

                    <Textarea 
                      label="Deskripsi"
                      placeholder="Jelaskan kondisi barang..."
                      value={editData.description}
                      onChange={e => this.setState({ editData: { ...editData, description: e.target.value } })}
                      required
                      
                    />

                    <div className="grid grid-cols-2 gap-6">
                        <Select 
                          label="Status"
                          value={editData.status}
                          onChange={e => this.setState({ editData: { ...editData, status: e.target.value } })}
                          required
                          
                          options={[
                            { label: "Hilang", value: "Hilang" },
                            { label: "Ditemukan", value: "Ditemukan" },
                            { label: "Diproses", value: "Diproses" },
                            { label: "Dikembalikan", value: "Dikembalikan" }
                          ]}
                        />

                      <Input 
                        label="Nama Penerima"
                        placeholder="Tulis Nama Penerima"
                        value={editData.receiver_name}
                        onChange={e => this.setState({ editData: { ...editData, receiver_name: e.target.value } })}
                        required={editData.status === 'Dikembalikan'}
                        
                      />
                    </div>

                    <div className="space-y-6">
                      <label className="text-sm font-bold text-gray-700 tracking-wide block">Foto Barang</label>
                      <div className="flex gap-8 items-start">
                        <div className="flex-1">
                          <div className="relative group">
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={this.handleFileChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={`h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 transition-all ${previewUrl ? 'border-blue-500 bg-blue-50/20' : 'border-gray-100 bg-gray-50/20 hover:border-blue-200'}`}>
                              {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded-3xl p-4" />
                              ) : (
                                <>
                                  <FiUploadCloud size={32} className="text-gray-400" />
                                  <p className="text-xs font-black text-gray-900 tracking-widest uppercase">Ganti Foto Barang</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="w-80 bg-blue-50/50 p-8 rounded-3xl border border-blue-100/50">
                          <p className="text-[10px] font-black text-blue-900/40 tracking-wide mb-3">Panduan Foto</p>
                          <p className="text-xs text-blue-900/60 font-medium italic leading-relaxed">
                            "Pastikan pencahayaan cukup dan foto memperlihatkan ciri khas benda untuk memudahkan proses verifikasi."
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 flex justify-end">
                      <button 
                        type="submit" 
                        disabled={updating}
                        className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm tracking-wide shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 transition-all flex items-center gap-3 disabled:opacity-50"
                      >
                        {updating && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {updating ? 'Sedang Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            </form>
          </main>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen bg-[#FDFDFD]">
        <Sidebar role="Petugas" />
        <main className="flex-1 p-12 overflow-y-auto">
          <nav className="flex items-center gap-2 mb-8 text-[11px] font-black tracking-wide text-gray-400">
            <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={() => navigate('/petugas/reports')}>Daftar Laporan</span>
            <span>&gt;</span>
            <span className="text-gray-900">Detail Laporan</span>
          </nav>

          <header className="mb-12">
            <div className="flex items-start gap-6">
              <button 
                onClick={() => navigate('/petugas/reports')}
                className="mt-2 w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <FiChevronLeft size={20} />
              </button>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 tracking-tight">Detail Laporan</h1>
                <p className="text-gray-400 mt-3 text-lg">Deskripsi detail dari barang yang temuan</p>
              </div>
            </div>
          </header>

          <div className="max-w-6xl space-y-10 pb-20">
            <Card className="shadow-sm border-none ring-1 ring-gray-100 overflow-hidden">
              <div className="aspect-[21/9] w-full bg-gray-50 relative border-b border-gray-50">
                {report.item.photo_url ? (
                  <img src={report.item.photo_url} alt={report.item.name} className="w-full h-full object-contain p-8" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-4">
                    <FiBriefcase size={64} className="opacity-20" />
                    <p className="text-xs font-bold tracking-wide opacity-40">Belum ada foto</p>
                  </div>
                )}
              </div>
              
              <div className="p-12">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <h2 className="text-5xl font-black text-gray-900 tracking-tight">{report.item.name}</h2>
                    <button 
                      onClick={() => this.setState({ isEditing: true })}
                      className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-gray-900 transition-colors border border-gray-100"
                    >
                      <FiEdit3 size={20} />
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-wide ${
                      report.type === 'Kehilangan' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {report.type}
                    </span>
                    <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-wide ${
                      report.status === 'Dikembalikan' ? 'bg-emerald-50 text-emerald-600' : 
                      report.status === 'Ditemukan' ? 'bg-blue-50 text-blue-600' :
                      report.status === 'Diproses' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-12 py-10 border-y border-gray-50">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 tracking-wide">Kategori</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-900/5 rounded-lg flex items-center justify-center text-blue-900/40">
                        <FiBriefcase size={14} />
                      </div>
                      <span className="text-xs font-black text-blue-900 tracking-wide bg-blue-900/5 px-3 py-1.5 rounded-lg">{report.item.category}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 tracking-wide">Tanggal Kejadian</p>
                    <div className="flex items-center gap-3">
                      <FiCalendar size={18} className="text-gray-900" />
                      <span className="text-sm font-bold text-gray-900">
                        {new Date(report.report_time).toLocaleDateString('id-ID', { 
                          month: 'long', day: 'numeric', year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 tracking-wide">Lokasi</p>
                    <div className="flex items-center gap-3">
                      <FiMapPin size={18} className="text-gray-900" />
                      <span className="text-sm font-bold text-gray-900 truncate">{report.location}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 tracking-wide">Nama Pelapor</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <FiUser size={14} />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{report.user.full_name}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-12 space-y-6">
                  <h3 className="text-[10px] font-black text-gray-400 tracking-wide">Deskripsi</h3>
                  <p className="text-gray-600 leading-relaxed text-sm font-medium whitespace-pre-wrap">
                    {report.description}
                  </p>
                </div>

                {report.receiver_name && (
                  <div className="mt-12 p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100/50 flex items-center gap-6">
                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <FiUser size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-900/40 tracking-wide">Telah Diterima Oleh</p>
                      <p className="text-xl font-black text-emerald-900">{report.receiver_name}</p>
                    </div>
                  </div>
                )}

                <div className="mt-12 pt-12 border-t border-gray-50 flex justify-end">
                  <button 
                    onClick={this.handleDelete}
                    className="px-10 py-4 bg-red-50 text-red-500 rounded-xl font-bold text-sm tracking-wide hover:bg-red-500 hover:text-white transition-all border border-red-100"
                  >
                    Batalkan Laporan
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }
}

export default withRouter(ReportDetailComponent);
