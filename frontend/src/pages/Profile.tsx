import React, { Component } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';
import { FiUser } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at?: string;
}

interface ProfileState {
  user: User | null;
  loading: boolean;
  role: string;
  isEditing: boolean;
  formData: {
    full_name: string;
    email: string;
  };
}

class Profile extends Component<Record<string, never>, ProfileState> {
  constructor(props: Record<string, never>) {
    super(props);
    let initialRole = 'pencari';
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        initialRole = (decoded.role || '').toLowerCase();
      } catch (e) {
        console.error('Invalid token');
      }
    }

    this.state = {
      user: null,
      loading: true,
      role: initialRole,
      isEditing: false,
      formData: {
        full_name: '',
        email: ''
      }
    };
  }

  componentDidMount() {
    this.fetchProfile();
  }

  fetchProfile = async () => {
    try {
      this.setState({ loading: true });
      const res = await api.get('/auth/me');
      this.setState({ 
        user: res.data,
        formData: {
          full_name: res.data.full_name,
          email: res.data.email
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      this.setState({ loading: true });
      const res = await api.patch('/auth/me', this.state.formData);
      this.setState({ 
        user: res.data,
        isEditing: false
      });
      toast.success("Profil berhasil diperbarui!");
    } catch (err: unknown) {
      console.error("Gagal update profil:", err);
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || "Gagal memperbarui profil.");
    } finally {
      this.setState({ loading: false });
    }
  };

  renderContent() {
    const { user, loading, isEditing, formData } = this.state;

    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex-1 p-10 flex items-center justify-center">
          <p className="text-gray-500 font-medium">Gagal memuat profil pengguna.</p>
        </div>
      );
    }

    let roleBg = 'bg-emerald-50 text-emerald-600';
    if (user.role === 'Admin') roleBg = 'bg-orange-50 text-orange-500';
    if (user.role === 'Petugas') roleBg = 'bg-blue-50 text-blue-500';

    return (
      <div className="flex-1 p-12 overflow-y-auto max-w-5xl mx-auto w-full">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 tracking-tight">Profil Saya</h1>
            <p className="text-gray-400 mt-3 text-lg">Kelola informasi pribadi dan preferensi akun Anda</p>
          </div>
          {!isEditing && (
            <Button 
              onClick={() => this.setState({ isEditing: true })}
              className="px-6 py-2.5"
            >
              Edit Profil
            </Button>
          )}
        </header>

        {isEditing ? (
          <Card className="p-10 shadow-sm border-none ring-1 ring-gray-100 bg-white animate-in fade-in zoom-in duration-300">
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Edit Informasi</h2>
            </div>
            <form onSubmit={this.handleEditSubmit} className="space-y-6">
              <Input 
                label="Nama Lengkap" 
                value={formData.full_name}
                onChange={e => this.setState({ formData: { ...formData, full_name: e.target.value } })}
                required 
              />
              <Input 
                label="Email Address" 
                type="email" 
                value={formData.email}
                onChange={e => this.setState({ formData: { ...formData, email: e.target.value } })}
                required 
              />
              <div className="flex gap-4 mt-10 pt-6 border-t border-gray-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => this.setState({ isEditing: false, formData: { full_name: user.full_name, email: user.email } })}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                >
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <div className="grid gap-8">
            <Card className="p-10 shadow-sm border-none ring-1 ring-gray-100 bg-white flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 shrink-0">
                <FiUser size={48} />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{user.full_name}</h2>
                <p className="text-gray-500 font-medium text-lg mt-1">{user.email}</p>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide mt-3 ${roleBg}`}>
                  {user.role}
                </div>
              </div>
            </Card>

            <Card className="p-10 shadow-sm border-none ring-1 ring-gray-100 bg-white">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Informasi Akun</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-sm text-gray-500 mb-1">ID Pengguna</p>
                  <p className="font-medium text-gray-900 break-all">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Alamat Email</p>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
                {user.created_at && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tanggal Bergabung</p>
                    <p className="font-medium text-gray-900">
                      {new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  render() {
    const { role } = this.state;
    
    // Admin & Petugas use Sidebar layout
    if (role === 'admin' || role === 'petugas') {
      const displayRole = role === 'admin' ? 'Admin' : 'Petugas';
      return (
        <div className="flex min-h-screen bg-[#FDFDFD]">
          <Sidebar role={displayRole} />
          {this.renderContent()}
        </div>
      );
    }

    // Pencari uses Navbar layout
    return (
      <div className="flex flex-col min-h-screen bg-[#FDFDFD]">
        <Navbar />
        <main className="flex-1 flex justify-center w-full">
          {this.renderContent()}
        </main>
        <Footer />
      </div>
    );
  }
}

export default Profile;
