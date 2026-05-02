import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const LostReport = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/pencari/laporan', {
        type: 'Kehilangan',
        location: formData.location,
        description: formData.description,
        item: {
          name: formData.name,
          category: formData.category
        }
      });
      alert('Laporan berhasil dikirim!');
      navigate('/my-reports');
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert('Anda harus login terlebih dahulu!');
        navigate('/login');
      } else {
        setError(err.response?.data?.detail || 'Gagal mengirim laporan');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <Navbar />
      <main className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Buat Laporan Kehilangan</h1>
        <Card className="p-8">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input label="Nama Barang" name="name" value={formData.name} onChange={handleChange} placeholder="Misal: Dompet Hitam" required />
              <Input label="Kategori" name="category" value={formData.category} onChange={handleChange} placeholder="Misal: Aksesoris" required />
            </div>
            <Input label="Lokasi Terakhir Terlihat" name="location" value={formData.location} onChange={handleChange} placeholder="Misal: Gedung Kuliah Umum (GKU)" required />
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Deskripsi Detail</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all min-h-[120px]"
                placeholder="Deskripsikan barang secara detail (warna, isi, ciri khusus)..."
                required
              />
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Batal</Button>
              <Button type="submit" className="px-8" disabled={loading}>
                {loading ? 'Mengirim...' : 'Kirim Laporan'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default LostReport;
