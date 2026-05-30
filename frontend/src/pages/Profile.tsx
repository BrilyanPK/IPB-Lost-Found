import React, { Component } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';
import { FiUser, FiMail, FiShield, FiCalendar } from 'react-icons/fi';

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
    // Since we don't have an endpoint for updating own profile yet,
    // we would typically call api.put('/users/me', formData) or similar.
    // Assuming such an endpoint exists or will exist:
    alert("Fitur update profil belum didukung oleh backend untuk saat ini.");
    this.setState({ isEditing: false });
  };

  renderContent() {
    const { user, loading, isEditing, formData, role } = this.state;

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
      <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Profil Saya</h1>
            <p className="text-gray-500 mt-2 text-base font-medium">Kelola informasi pribadi dan preferensi akun Anda</p>
          </div>
          {!isEditing && (
            <Button 
              onClick={() => this.setState({ isEditing: true })}
              className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
            >
              Edit Profil
            </Button>
          )}
        </header>

        {isEditing ? (
          <Card className="p-8 border-none ring-1 ring-gray-100 shadow-xl bg-white rounded-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Edit Informasi Dasar</h2>
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
          <div className="grid gap-6">
            <Card className="p-8 border-none ring-1 ring-gray-100 shadow-sm bg-white rounded-2xl flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 shrink-0">
                <FiUser size={48} />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">{user.full_name}</h2>
                <p className="text-gray-500 font-medium text-lg mt-1">{user.email}</p>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wide mt-3 ${roleBg}`}>
                  <FiShield size={12} />
                  {user.role}
                </div>
              </div>
            </Card>

            <Card className="p-8 border-none ring-1 ring-gray-100 shadow-sm bg-white rounded-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Informasi Akun</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-black text-gray-400 tracking-wide mb-2 flex items-center gap-2">
                    <FiUser size={14} /> ID Pengguna
                  </p>
                  <p className="text-gray-900 font-bold bg-gray-50 p-4 rounded-xl border border-gray-100 break-all">{user.id}</p>
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 tracking-wide mb-2 flex items-center gap-2">
                    <FiMail size={14} /> Alamat Email Terdaftar
                  </p>
                  <p className="text-gray-900 font-bold bg-gray-50 p-4 rounded-xl border border-gray-100">{user.email}</p>
                </div>
                {user.created_at && (
                  <div>
                    <p className="text-xs font-black text-gray-400 tracking-wide mb-2 flex items-center gap-2">
                      <FiCalendar size={14} /> Tanggal Bergabung
                    </p>
                    <p className="text-gray-900 font-bold bg-gray-50 p-4 rounded-xl border border-gray-100">
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
        <div className="flex min-h-screen bg-[#F8FAFC]">
          <Sidebar role={displayRole} />
          {this.renderContent()}
        </div>
      );
    }

    // Pencari uses Navbar layout
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        {this.renderContent()}
        <Footer />
      </div>
    );
  }
}

export default Profile;
