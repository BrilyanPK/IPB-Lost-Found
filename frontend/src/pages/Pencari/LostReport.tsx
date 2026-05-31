import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import api from '../../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { FiLock, FiUploadCloud, FiCamera } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const LostReport = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
    if (formErrors[e.target.name]) {
      setFormErrors({...formErrors, [e.target.name]: ''});
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Nama barang wajib diisi";
    if (!formData.category) errors.category = "Kategori wajib dipilih";
    if (!formData.location.trim()) errors.location = "Lokasi wajib diisi";
    if (!formData.description.trim()) errors.description = "Deskripsi wajib diisi";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      let uploadedPhotoUrl = '';

      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        
        const uploadRes = await api.post('/upload/image', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedPhotoUrl = uploadRes.data.url;
      }

      await api.post('/pencari/laporan', {
        type: 'Kehilangan',
        location: formData.location,
        description: formData.description,
        item: {
          name: formData.name,
          category: formData.category,
          photo_url: uploadedPhotoUrl || null
        }
      });
      toast.success('Laporan berhasil dikirim!');
      navigate('/my-reports');
    } catch (err: unknown) {
      const error = err as {
        response?: {
          status?: number;
          data?: {
            detail?: string;
          };
        };
      };
      if (error.response?.status === 401) {
        toast.error('Anda harus login terlebih dahulu!');
        navigate('/login');
      } else {
        setError(error.response?.data?.detail || 'Gagal mengirim laporan');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <Navbar />
      <main className="flex-1 px-8 py-12 max-w-5xl mx-auto w-full min-h-[75vh]">
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-12 text-center">Buat Laporan Kehilangan</h1>

        {!isLoggedIn ? (
          <Card className="p-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
              <FiLock className="w-10 h-10 text-[#203D7C]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Login Diperlukan</h2>
            <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
              Untuk membuat laporan kehilangan, Anda harus login terlebih dahulu. 
              Silakan login atau buat akun baru untuk melanjutkan.
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
          <Card className="p-8">
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">{error}</div>}
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid md:grid-cols-2 gap-6">
                <Input label="Nama Barang" name="name" value={formData.name} onChange={handleChange} placeholder="Misal: Dompet Hitam" required error={formErrors.name} />
                <Select
                  label="Kategori"
                  name="category"
                  className="w-full"
                  placeholder="Pilih Kategori"
                  value={formData.category}
                  onChange={handleChange as any}
                  required
                  error={formErrors.category}
                  options={[
                    { label: "Elektronik", value: "Elektronik" },
                    { label: "Dokumen", value: "Dokumen" },
                    { label: "Aksesoris", value: "Aksesoris" },
                    { label: "Pakaian", value: "Pakaian" },
                    { label: "Lainnya", value: "Lainnya" }
                  ]}
                />
              </div>
              <Input label="Lokasi Terakhir Terlihat" name="location" value={formData.location} onChange={handleChange} placeholder="Misal: Gedung Kuliah Umum (GKU)" required error={formErrors.location} />
              
              <Textarea 
                label="Deskripsi Detail"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Deskripsikan barang secara detail (warna, isi, ciri khusus)..."
                required
                error={formErrors.description}
              />

              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700 block">Foto Barang (Opsional)</label>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex-1 space-y-4 w-full">
                    <div className="relative group">
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
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
                      "Opsional: Tambahkan foto barang (jika ada foto lama) untuk memudahkan pencari mencocokkan barang temuan dengan laporan Anda."
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Batal</Button>
                <Button type="submit" className="px-8" disabled={loading}>
                  {loading ? 'Mengirim...' : 'Kirim Laporan'}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default LostReport;
