import React, { Component } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { id } from 'date-fns/locale';
import api from '../../api/axios';
import axios from 'axios';
import { FiFileText, FiCamera, FiUploadCloud } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface InputState {
  formData: {
    finder_id: string;
    item_name: string;
    category: string;
    occurrence_time: string;
    location: string;
    description: string;
    contact: string;
    photo_url: string;
  };
  selectedFile: File | null;
  previewUrl: string | null;
  loading: boolean;
  formErrors: Record<string, string>;
  users: {label: string, value: string}[];
}

class InputFoundItem extends Component<Record<string, never>, InputState> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      formData: {
        finder_id: '',
        item_name: '',
        category: '',
        occurrence_time: new Date().toISOString().slice(0, 16),
        location: '',
        description: '',
        contact: '',
        photo_url: ''
      },
      selectedFile: null,
      previewUrl: null,
      loading: false,
      formErrors: {},
      users: []
    };
  }

  async componentDidMount() {
    try {
      const res = await api.get('/petugas/users');
      const formattedUsers = res.data.map((u: any) => ({
        label: `${u.full_name} (${u.role})`,
        value: u.id
      }));
      this.setState({ users: formattedUsers });
    } catch (err) {
      console.error("Gagal mengambil data pengguna", err);
    }
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

  handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { formData, formErrors } = this.state;
    let newValue = e.target.value;

    // Only allow digits and leading '+' for contact field
    if (e.target.name === 'contact') {
      newValue = newValue.replace(/[^0-9+]/g, '');
      // Only allow '+' at the beginning
      if (newValue.indexOf('+') > 0) {
        newValue = newValue.replace(/\+/g, '');
      }
    }

    this.setState({
      formData: { ...formData, [e.target.name]: newValue }
    });
    
    if (formErrors[e.target.name]) {
      this.setState({
        formErrors: { ...formErrors, [e.target.name]: '' }
      });
    }
  };

  validateForm = () => {
    const { formData } = this.state;
    const errors: Record<string, string> = {};
    
    if (!formData.finder_id) errors.finder_id = "Nama penemu wajib dipilih";
    if (!formData.item_name.trim()) errors.item_name = "Nama barang wajib diisi";
    if (!formData.category) errors.category = "Kategori wajib dipilih";
    if (!formData.location.trim()) errors.location = "Lokasi temuan wajib diisi";
    if (!formData.description.trim()) errors.description = "Deskripsi wajib diisi";
    if (!formData.occurrence_time) errors.occurrence_time = "Waktu kejadian wajib diisi";
    if (!formData.contact.trim()) {
      errors.contact = "Kontak wajib diisi";
    } else {
      const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;
      if (!phoneRegex.test(formData.contact.trim())) {
        errors.contact = "Format nomor HP tidak valid (contoh: 08123456789 atau +628123456789)";
      }
    }
    
    this.setState({ formErrors: errors });
    return Object.keys(errors).length === 0;
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!this.validateForm()) return;
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

      const reportRes = await api.post('/petugas/laporan', {
        contact_info: formData.contact,
        location: formData.location,
        description: formData.description,
        report_time: new Date(formData.occurrence_time).toISOString(),
        finder_id: formData.finder_id,
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

      toast.success('Barang temuan berhasil diinput dan ditambahkan ke inventaris!');
      this.setState({
        formData: {
          finder_id: '',
          item_name: '',
          category: '',
          occurrence_time: new Date().toISOString().slice(0, 16),
          location: '',
          description: '',
          contact: '',
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
      toast.error(`Error: ${errorMessage}`);
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
            <h1 className="text-5xl font-bold text-gray-900 tracking-tight">Input Temuan Baru</h1>
            <p className="text-gray-400 mt-3 text-lg">Dokumentasikan barang temuan dengan detail untuk proses verifikasi.</p>
          </header>

          <form onSubmit={this.handleSubmit} noValidate className="flex gap-8 max-w-6xl pb-20">
            <div className="flex-1">
              <Card className="p-10 shadow-sm border-none ring-1 ring-gray-100">
                <div className="flex items-center gap-3 mb-10">
                  <FiFileText className="text-gray-900" size={24} />
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Detail Laporan</h2>
                </div>

                <div>
                  <Select
                    label="Nama Penemu"
                    name="finder_id"
                    placeholder="Pilih nama penemu..."
                    value={formData.finder_id}
                    onChange={this.handleChange}
                    required
                    error={this.state.formErrors.finder_id}
                    options={this.state.users}
                    className="w-full"
                    searchable
                  />

                  <Input
                    label="Nama Barang"
                    placeholder="Contoh: Tumbler Hydroflask Biru 32oz"
                    name="item_name"
                    value={formData.item_name}
                    onChange={this.handleChange}
                    required
                    error={this.state.formErrors.item_name}
                  />

                  <div className="grid grid-cols-2 gap-6">
                    <Select
                      label="Kategori"
                      name="category"
                      className="w-full"
                      placeholder="Pilih Kategori"
                      value={formData.category}
                      onChange={this.handleChange}
                      required
                      error={this.state.formErrors.category}
                      options={[
                        { label: "Elektronik", value: "Elektronik" },
                        { label: "Dokumen", value: "Dokumen" },
                        { label: "Aksesoris", value: "Aksesoris" },
                        { label: "Pakaian", value: "Pakaian" },
                        { label: "Lainnya", value: "Lainnya" }
                      ]}
                    />

                    <DatePicker
                      label="Waktu Kejadian"
                      selected={formData.occurrence_time ? new Date(formData.occurrence_time) : null}
                      onChange={(date: any) => this.setState({ 
                        formData: { 
                          ...formData, 
                          occurrence_time: date ? new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '' 
                        } 
                      })}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      timeCaption="Jam"
                      dateFormat="dd MMMM yyyy HH:mm"
                      placeholderText="Pilih waktu kejadian..."
                      locale={id}
                      required
                      error={this.state.formErrors.occurrence_time}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      label="Lokasi Kejadian"
                      name="location"
                      placeholder="Misal: Perpustakaan LSI, Meja Belajar Utara"
                      value={formData.location}
                      onChange={this.handleChange}
                      required
                      error={this.state.formErrors.location}
                      className="w-full"
                    />

                    <Input
                      label="Kontak (No HP / WA)"
                      name="contact"
                      placeholder="Misal: 08123456789"
                      value={formData.contact}
                      onChange={this.handleChange}
                      required
                      error={this.state.formErrors.contact}
                      className="w-full"
                      type="tel"
                      maxLength={15}
                    />
                  </div>

                  <Textarea
                    label="Deskripsi Detail"
                    name="description"
                    placeholder="Deskripsikan barang temuan (warna, merk, ciri khusus, isi di dalamnya)..."
                    value={formData.description}
                    onChange={this.handleChange}
                    required
                    error={this.state.formErrors.description}
                    className="w-full"
                  />

                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700 block">Foto Barang (Opsional)</label>
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      <div className="flex-1 space-y-4 w-full">
                        <div className="relative group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={this.handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className={`h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${previewUrl ? 'border-blue-500 bg-blue-50/20' : 'border-gray-300 bg-gray-50/50 hover:border-blue-300'}`}>
                            {previewUrl ? (
                              <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded-2xl p-2" />
                            ) : (
                              <>
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                  <FiUploadCloud size={24} />
                                </div>
                                <div className="text-center px-4">
                                  <p className="text-sm font-bold text-gray-700 tracking-wide">Klik untuk upload foto</p>
                                  <p className="text-xs text-gray-500 font-medium mt-1 tracking-wide">PNG, JPG maksimal 10MB</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-full sm:w-72 bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                        <div className="flex items-center gap-2 mb-3 text-blue-900/50">
                          <FiCamera size={16} />
                          <p className="text-xs font-bold tracking-wide">Panduan Foto</p>
                        </div>
                        <p className="text-xs text-blue-900/70 font-medium italic leading-relaxed">
                          "Pastikan pencahayaan cukup dan foto memperlihatkan ciri khas benda untuk memudahkan proses verifikasi."
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center gap-2"
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
