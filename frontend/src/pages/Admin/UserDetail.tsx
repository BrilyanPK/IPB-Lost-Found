import React, { Component } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../api/axios';
import { withRouter } from '../../utils/withRouter';
import type { WithRouterProps } from '../../utils/withRouter';
import { FiArrowLeft, FiEdit2, FiTrash2, FiUser, FiMail, FiShield } from 'react-icons/fi';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at?: string;
}

interface UserDetailState {
  user: User | null;
  loading: boolean;
  isEditing: boolean;
  formData: {
    full_name: string;
    email: string;
    role: string;
  };
}

class UserDetailComponent extends Component<WithRouterProps, UserDetailState> {
  constructor(props: WithRouterProps) {
    super(props);
    this.state = {
      user: null,
      loading: true,
      isEditing: false,
      formData: {
        full_name: '',
        email: '',
        role: 'Pencari'
      }
    };
  }

  componentDidMount() {
    this.fetchUser();
  }

  fetchUser = async () => {
    const { id } = this.props.params;
    if (!id) return;
    
    try {
      this.setState({ loading: true });
      const res = await api.get(`/admin/users/${id}`);
      this.setState({ 
        user: res.data,
        formData: {
          full_name: res.data.full_name,
          email: res.data.email,
          role: res.data.role
        }
      });
    } catch (err) {
      console.error(err);
      // If error (e.g. not found), we can redirect back
      this.props.navigate('/admin/users');
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDelete = async () => {
    const { user } = this.state;
    if (!user) return;
    
    if (confirm(`Apakah Anda yakin ingin menghapus pengguna ${user.full_name}?`)) {
      try {
        await api.delete(`/admin/users/${user.id}`);
        this.props.navigate('/admin/users');
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus pengguna.');
      }
    }
  };

  handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { user, formData } = this.state;
    if (!user) return;

    try {
      const res = await api.put(`/admin/users/${user.id}`, formData);
      this.setState({ 
        user: res.data, 
        isEditing: false,
        formData: {
          full_name: res.data.full_name,
          email: res.data.email,
          role: res.data.role
        }
      });
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui pengguna.');
    }
  };

  render() {
    const { user, loading, isEditing, formData } = this.state;

    if (loading) {
      return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
          <Sidebar role="Admin" />
          <main className="flex-1 p-10 flex items-center justify-center">
            <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </main>
        </div>
      );
    }

    if (!user) return null;

    let roleBg = 'bg-emerald-50 text-emerald-600';
    if (user.role === 'Admin') roleBg = 'bg-orange-50 text-orange-500';
    if (user.role === 'Petugas') roleBg = 'bg-blue-50 text-blue-500';

    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <Sidebar role="Admin" />
        <main className="flex-1 p-10">
          <button 
            onClick={() => this.props.navigate('/admin/users')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-bold text-sm mb-8"
          >
            <FiArrowLeft size={16} />
            Kembali ke Manajemen Pengguna
          </button>

          <header className="mb-10 flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Detail Pengguna</h1>
              <p className="text-gray-500 mt-2 text-base font-medium">Lihat dan kelola informasi spesifik pengguna</p>
            </div>
            {!isEditing && (
              <div className="flex gap-4">
                <Button 
                  onClick={() => this.setState({ isEditing: true })}
                  className="px-6 py-2.5 bg-blue-50 text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-100 transition-all flex items-center gap-2 border-none"
                >
                  <FiEdit2 size={16} />
                  Edit Pengguna
                </Button>
                <Button 
                  onClick={this.handleDelete}
                  className="px-6 py-2.5 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition-all flex items-center gap-2 border-none"
                >
                  <FiTrash2 size={16} />
                  Hapus
                </Button>
              </div>
            )}
          </header>

          <div className="max-w-3xl">
            {isEditing ? (
              <Card className="p-8 border-none ring-1 ring-gray-100 shadow-xl bg-white rounded-2xl animate-in fade-in zoom-in duration-300">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Edit Informasi Pengguna</h2>
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
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Role</label>
                    <select 
                      className="w-full px-5 py-4 bg-gray-50 border-none ring-1 ring-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-900"
                      value={formData.role}
                      onChange={e => this.setState({ formData: { ...formData, role: e.target.value } })}
                    >
                      <option value="Pencari">Pencari</option>
                      <option value="Petugas">Petugas</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex gap-4 mt-10 pt-6 border-t border-gray-100">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 py-4 font-bold text-xs uppercase tracking-widest border-none ring-1 ring-gray-200 hover:bg-gray-50" 
                      onClick={() => this.setState({ isEditing: false, formData: { full_name: user.full_name, email: user.email, role: user.role } })}
                    >
                      Batal
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 py-4 font-bold text-xs uppercase tracking-widest bg-blue-600 shadow-lg shadow-blue-500/20 hover:bg-blue-700"
                    >
                      Simpan Perubahan
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <div className="grid gap-6">
                <Card className="p-8 border-none ring-1 ring-gray-100 shadow-sm bg-white rounded-2xl flex items-center gap-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl font-bold text-gray-400">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{user.full_name}</h2>
                    <p className="text-gray-500 font-medium text-lg mt-1">{user.email}</p>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mt-3 ${roleBg}`}>
                      <FiShield size={12} />
                      {user.role}
                    </div>
                  </div>
                </Card>

                <Card className="p-8 border-none ring-1 ring-gray-100 shadow-sm bg-white rounded-2xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Informasi Tambahan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FiUser size={14} /> ID Pengguna
                      </p>
                      <p className="text-gray-900 font-bold bg-gray-50 p-4 rounded-xl border border-gray-100 break-all">{user.id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FiMail size={14} /> Alamat Email
                      </p>
                      <p className="text-gray-900 font-bold bg-gray-50 p-4 rounded-xl border border-gray-100">{user.email}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }
}

export default withRouter(UserDetailComponent);
