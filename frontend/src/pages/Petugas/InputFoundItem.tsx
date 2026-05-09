import React, { Component } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import api from '../../api/axios';
import axios from 'axios';
import { FiFileText, FiCamera, FiUploadCloud } from 'react-icons/fi';

interface InputState {
  formData: {
    finder_name: string;
    item_name: string;
    category: string;
    occurrence_time: string;
    location: string;
    description: string;
    photo_url: string;
  };
  selectedFile: File | null;
  previewUrl: string | null;
  loading: boolean;
}

class InputFoundItem extends Component<Record<string, never>, InputState> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      formData: {
        finder_name: '',
        item_name: '',
        category: '',
        occurrence_time: new Date().toISOString().slice(0, 16),
        location: '',
        description: '',
        photo_url: ''
      },
      selectedFile: null,
      previewUrl: null,
      loading: false
    };
  }

  handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      this.setState({ 
        selectedFile: file,
        previewUrl: URL.createObjectURL(file)
      });
    }
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    this.setState({ loading: true });
    const { formData, selectedFile } = this.state;

    try {
      let uploadedPhotoUrl = '';

      // Upload file first if selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        
        const uploadRes = await api.post('/upload/image', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedPhotoUrl = uploadRes.data.url;
      }

      // Append finder name to description as backend doesn't have a specific field yet
      const combinedDescription = `Penemu: ${formData.finder_name}\n\n${formData.description}`;
      
      const reportRes = await api.post('/petugas/laporan', {
        type: 'Penemuan',
        location: formData.location,
        description: combinedDescription,
        report_time: new Date(formData.occurrence_time).toISOString(),
        item: {
          name: formData.item_name,
          category: formData.category,
          photo_url: uploadedPhotoUrl || null
        }
      });

      await api.post('/petugas/inventory', {
        item_id: reportRes.data.item.id,
        quantity: 1
      });

      alert('Barang temuan berhasil diinput dan ditambahkan ke inventaris!');
      this.setState({
        formData: { 
          finder_name: '', 
          item_name: '', 
          category: '', 
          occurrence_time: new Date().toISOString().slice(0, 16),
          location: '', 
          description: '',
          photo_url: ''
        },
        selectedFile: null,
        previewUrl: null,
        loading: false
      });
    } catch (err: unknown) {
      console.error('Full Error:', err);
      let errorMessage = 'Gagal menginput barang temuan';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.detail || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      alert(`Error: ${errorMessage}`);
      this.setState({ loading: false });
    }
  };

  render() {
    const { formData, loading, previewUrl } = this.state;

    return (
      <div className="flex min-h-screen bg-[#FDFDFD]">
        <Sidebar role="Petugas" />
        <main className="flex-1 p-12 overflow-y-auto">
          <header className="mb-12">
            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Input Temuan Baru</h1>
            <p className="text-gray-400 mt-3 text-lg">Dokumentasikan barang temuan dengan detail untuk proses verifikasi.</p>
          </header>

          <form onSubmit={this.handleSubmit} className="flex gap-8 max-w-6xl pb-20">
            <div className="flex-1">
              <Card className="p-10 shadow-sm border-none ring-1 ring-gray-100">
                <div className="flex items-center gap-3 mb-10">
                  <FiFileText className="text-gray-900" size={24} />
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Detail Laporan</h2>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Nama Penemu</label>
                    <input 
                      className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-gray-400 font-medium bg-white"
                      placeholder="Tulis nama penemu di sini"
                      value={formData.finder_name}
                      onChange={e => this.setState({ formData: { ...formData, finder_name: e.target.value } })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Nama Barang</label>
                    <input 
                      className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-gray-400 font-medium bg-white"
                      placeholder="Contoh: Tumbler Hydroflask Biru 32oz"
                      value={formData.item_name}
                      onChange={e => this.setState({ formData: { ...formData, item_name: e.target.value } })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Kategori</label>
                      <select 
                        className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all bg-white font-medium appearance-none"
                        value={formData.category}
                        onChange={e => this.setState({ formData: { ...formData, category: e.target.value } })}
                        required
                      >
                        <option value="" disabled>Pilih Kategori</option>
                        <option value="Elektronik">Elektronik</option>
                        <option value="Dokumen">Dokumen</option>
                        <option value="Aksesoris">Aksesoris</option>
                        <option value="Pakaian">Pakaian</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Waktu Kejadian</label>
                      <input 
                        type="datetime-local"
                        className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium bg-white"
                        value={formData.occurrence_time}
                        onChange={e => this.setState({ formData: { ...formData, occurrence_time: e.target.value } })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Lokasi Kejadian</label>
                    <input 
                      className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-gray-400 font-medium bg-white"
                      placeholder="Misal: Perpustakaan LSI, Meja Belajar Utara"
                      value={formData.location}
                      onChange={e => this.setState({ formData: { ...formData, location: e.target.value } })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Deskripsi</label>
                    <textarea 
                      className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-gray-400 min-h-[120px] bg-white font-medium"
                      placeholder="Jelaskan kondisi barang, ciri khas, atau detail lainnya..."
                      value={formData.description}
                      onChange={e => this.setState({ formData: { ...formData, description: e.target.value } })}
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-700 block">Foto Barang</label>
                    <div className="flex gap-6 items-start">
                      <div className="flex-1 space-y-4">
                        <div className="relative group">
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={this.handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className={`h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${previewUrl ? 'border-blue-500 bg-blue-50/20' : 'border-gray-100 bg-gray-50/20 hover:border-blue-200'}`}>
                            {previewUrl ? (
                              <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded-2xl p-2" />
                            ) : (
                              <>
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                  <FiUploadCloud size={24} />
                                </div>
                                <div className="text-center">
                                  <p className="text-[10px] font-black text-gray-900 tracking-widest uppercase">Klik untuk upload foto</p>
                                  <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-widest">PNG, JPG SAMPAI 10MB</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-64 bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                        <div className="flex items-center gap-2 mb-2 text-blue-900/40">
                          <FiCamera size={14} />
                          <p className="text-[10px] font-black uppercase tracking-widest">Panduan Foto</p>
                        </div>
                        <p className="text-[11px] text-blue-900/60 font-medium italic leading-relaxed">
                          "Pastikan pencahayaan cukup dan foto memperlihatkan ciri khas benda untuk memudahkan proses verifikasi."
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="px-10 py-4 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {loading ? 'Sedang Menyimpan...' : 'Simpan Laporan'}
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
}

export default InputFoundItem;
