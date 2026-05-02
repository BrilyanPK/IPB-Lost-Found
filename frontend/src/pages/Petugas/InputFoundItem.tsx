import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api from '../../api/axios';

const InputFoundItem = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Elektronik',
    location: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const reportRes = await api.post('/petugas/laporan', {
        type: 'Penemuan',
        location: formData.location,
        description: formData.description,
        item: {
          name: formData.name,
          category: formData.category
        }
      });

      await api.post('/petugas/inventory', {
        item_id: reportRes.data.item.id,
        quantity: 1
      });

      alert('Barang temuan berhasil diinput dan ditambahkan ke inventaris!');
      setFormData({ name: '', category: 'Elektronik', location: '', description: '' });
    } catch (err) {
      console.error(err);
      alert('Gagal menginput barang temuan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="Petugas" />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Input Barang Temuan</h1>
        <Card className="max-w-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Nama Barang" 
              placeholder="Contoh: Dompet Hitam" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Kategori</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="Elektronik">Elektronik</option>
                <option value="Dokumen">Dokumen</option>
                <option value="Aksesoris">Aksesoris</option>
                <option value="Kunci">Kunci</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <Input 
              label="Lokasi Ditemukan" 
              placeholder="Contoh: Perpustakaan L1" 
              required
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Deskripsi Tambahan</label>
              <textarea 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 h-32 resize-none"
                placeholder="Deskripsikan barang secara detail..."
                required
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan ke Inventaris'}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default InputFoundItem;
