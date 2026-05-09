import { Component } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api from '../../api/axios';

interface InputState {
  formData: {
    name: string;
    category: string;
    location: string;
    description: string;
  };
  loading: boolean;
}

class InputFoundItem extends Component<Record<string, never>, InputState> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      formData: {
        name: '',
        category: 'Elektronik',
        location: '',
        description: ''
      },
      loading: false
    };
  }

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    this.setState({ loading: true });
    const { formData } = this.state;

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
      this.setState({
        formData: { name: '', category: 'Elektronik', location: '', description: '' },
        loading: false
      });
    } catch (err) {
      console.error(err);
      alert('Gagal menginput barang temuan');
      this.setState({ loading: false });
    }
  };

  render() {
    const { formData, loading } = this.state;

    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <Sidebar role="Petugas" />
        <main className="flex-1 p-10">
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Input Temuan Baru</h1>
            <p className="text-gray-500 mt-2">Daftarkan barang temuan baru ke dalam sistem Balikin.</p>
          </header>

          <Card className="max-w-3xl p-10 shadow-lg border-none ring-1 ring-gray-100">
            <form onSubmit={this.handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input 
                  label="Nama Barang" 
                  placeholder="Contoh: iPhone 13 Pro" 
                  required
                  value={formData.name}
                  onChange={e => this.setState({ formData: { ...formData, name: e.target.value } })}
                />
                
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Kategori</label>
                  <select 
                    className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 bg-white transition-all appearance-none cursor-pointer"
                    value={formData.category}
                    onChange={e => this.setState({ formData: { ...formData, category: e.target.value } })}
                  >
                    <option value="Elektronik">Elektronik</option>
                    <option value="Dokumen">Dokumen</option>
                    <option value="Aksesoris">Aksesoris</option>
                    <option value="Kunci">Kunci</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <Input 
                label="Lokasi Ditemukan" 
                placeholder="Contoh: Kantin Stevia" 
                required
                value={formData.location}
                onChange={e => this.setState({ formData: { ...formData, location: e.target.value } })}
              />
              
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Deskripsi Tambahan</label>
                <textarea 
                  className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 h-40 resize-none transition-all placeholder:text-gray-400"
                  placeholder="Berikan detail seperti warna, ciri khas, atau kondisi barang..."
                  required
                  value={formData.description}
                  onChange={e => this.setState({ formData: { ...formData, description: e.target.value } })}
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full py-4 text-lg shadow-xl shadow-blue-500/20" disabled={loading}>
                  {loading ? 'Sedang Menyimpan...' : 'Simpan Laporan & Inventaris'}
                </Button>
              </div>
            </form>
          </Card>
        </main>
      </div>
    );
  }
}

export default InputFoundItem;
