import React, { Component } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import api from '../../api/axios';
import { withRouter } from '../../utils/withRouter';
import type { WithRouterProps } from '../../utils/withRouter';
import { FiUsers, FiShield, FiSearch, FiFilter, FiUserPlus, FiTrash2, FiUserCheck } from 'react-icons/fi';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface UserManagementState {
  users: User[];
  loading: boolean;
  showEditModal: boolean;
  showFilterModal: boolean;
  searchTerm: string;
  selectedRole: string;
  formData: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
}

class UserManagementComponent extends Component<WithRouterProps, UserManagementState> {
  constructor(props: WithRouterProps) {
    super(props);
    this.state = {
      users: [],
      loading: true,
      showEditModal: false,
      showFilterModal: false,
      searchTerm: '',
      selectedRole: '',
      formData: {
        id: '',
        full_name: '',
        email: '',
        role: 'Pencari'
      }
    };
  }

  componentDidMount() {
    this.fetchUsers();
  }

  fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      this.setState({ users: res.data });
    } catch (err) {
      console.error(err);
    } finally {
      this.setState({ loading: false });
    }
  };

  openEditModal = (user: User) => {
    this.setState({
      showEditModal: true,
      formData: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  };

  closeEditModal = () => {
    this.setState({ showEditModal: false });
  };

  handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { formData } = this.state;
    try {
      await api.put(`/admin/users/${formData.id}`, {
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role
      });
      this.closeEditModal();
      this.fetchUsers();
    } catch (err: unknown) {
      console.error(err);
    }
  };

  handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        this.fetchUsers();
      } catch (err: unknown) {
        console.error(err);
      }
    }
  };

  handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: e.target.value });
  };

  toggleFilterModal = () => {
    this.setState({ showFilterModal: !this.state.showFilterModal });
  };

  setFilterRole = (role: string) => {
    this.setState({ selectedRole: role, showFilterModal: false });
  };

  render() {
    const { users, loading, showEditModal, showFilterModal, formData, searchTerm, selectedRole } = this.state;

    const filteredUsers = users.filter(user => {
      const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole ? user.role === selectedRole : true;
      return matchesSearch && matchesRole;
    });

    const columns: TableColumn<User>[] = [
      {
        key: 'full_name',
        header: 'Nama',
        render: (user) => (
          <button 
            onClick={() => this.openEditModal(user)}
            className="text-blue-600 font-bold hover:underline text-left"
          >
            {user.full_name}
          </button>
        )
      },
      {
        key: 'email',
        header: 'Email',
        render: (user) => <span className="text-gray-900 font-medium">{user.email}</span>
      },
      {
        key: 'role',
        header: 'Role',
        render: (user) => (
          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            user.role === 'Admin' ? 'bg-orange-50 text-orange-400' : 
            user.role === 'Petugas' ? 'bg-blue-50 text-blue-400' : 'bg-emerald-50 text-emerald-400'
          }`}>
            {user.role}
          </span>
        )
      },
      {
        key: 'actions',
        header: '',
        render: (user) => (
          <button onClick={() => this.handleDelete(user.id)} className="text-red-400 hover:text-red-600 font-black text-xs uppercase tracking-widest p-2 rounded-lg hover:bg-red-50 transition-colors">
            <FiTrash2 size={16} />
          </button>
        )
      }
    ];

    const totalAdmin = users.filter(u => u.role === 'Admin').length;
    const totalPetugas = users.filter(u => u.role === 'Petugas').length;

    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <Sidebar role="Admin" />
        <main className="flex-1 p-10">
          <header className="mb-10">
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Manajemen Pengguna</h1>
            <p className="text-gray-500 mt-2 text-lg font-medium">Manajemen akses sistem dan role pengguna</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <Card className="p-8 border-none ring-1 ring-gray-100 flex flex-col justify-between h-48 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                  <FiUsers size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total User</p>
              </div>
              <p className="text-6xl font-black text-gray-900 tracking-tighter">{users.length.toString().padStart(2, '0')}</p>
            </Card>
            <Card className="p-8 border-none ring-1 ring-gray-100 flex flex-col justify-between h-48 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                  <FiShield size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Admin</p>
              </div>
              <p className="text-6xl font-black text-gray-900 tracking-tighter">{totalAdmin.toString().padStart(2, '0')}</p>
            </Card>
            <Card className="p-8 border-none ring-1 ring-gray-100 flex flex-col justify-between h-48 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                  <FiUserCheck size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Petugas</p>
              </div>
              <p className="text-6xl font-black text-gray-900 tracking-tighter">{totalPetugas.toString().padStart(2, '0')}</p>
            </Card>
          </div>

          <Card className="overflow-hidden border-none ring-1 ring-gray-100 shadow-sm bg-white">
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">User Registry</h2>
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial">
                  <input 
                    type="text" 
                    placeholder="Search name or email..." 
                    value={searchTerm}
                    onChange={this.handleSearch}
                    className="pl-12 pr-4 py-3 bg-gray-50 border-none ring-1 ring-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-full md:w-80 transition-all font-medium"
                  />
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
                
                <div className="relative">
                  <Button 
                    variant="outline" 
                    onClick={this.toggleFilterModal}
                    className={`px-6 py-3 border-none ring-1 ring-gray-200 rounded-xl flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${selectedRole ? 'bg-blue-50 ring-blue-200 text-blue-600' : ''}`}
                  >
                    <FiFilter size={16} />
                    {selectedRole || 'Filter Role'}
                  </Button>
                  
                  {showFilterModal && (
                    <div className="absolute top-0 right-full mr-2 w-48 bg-white rounded-2xl shadow-2xl ring-1 ring-gray-100 z-[100] p-2 animate-in fade-in slide-in-from-right-2 duration-200">
                      <button onClick={() => this.setFilterRole('')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-xs font-black uppercase tracking-widest text-gray-600 transition-colors">Semua Role</button>
                      <button onClick={() => this.setFilterRole('Admin')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-orange-50 text-xs font-black uppercase tracking-widest text-orange-600 transition-colors">Admin</button>
                      <button onClick={() => this.setFilterRole('Petugas')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 text-xs font-black uppercase tracking-widest text-blue-600 transition-colors">Petugas</button>
                      <button onClick={() => this.setFilterRole('Pencari')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-emerald-50 text-xs font-black uppercase tracking-widest text-emerald-600 transition-colors">Pencari</button>
                    </div>
                  )}
                </div>

                <Button 
                  className="px-8 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2" 
                  onClick={() => this.props.navigate('/admin/users/create')}
                >
                  <FiUserPlus size={16} />
                  Create User
                </Button>
              </div>
            </div>
            <Table 
              columns={columns} 
              data={filteredUsers} 
              loading={loading}
              emptyMessage={searchTerm || selectedRole ? "Tidak ada user yang cocok dengan filter." : "Belum ada pengguna terdaftar."}
            />
          </Card>

          {showEditModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="max-w-md w-full p-10 animate-in fade-in zoom-in duration-300 shadow-2xl border-none">
                <h2 className="text-3xl font-black mb-8 text-gray-900 tracking-tight">Edit Pengguna</h2>
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
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Role</label>
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
                  <div className="flex gap-4 mt-10">
                    <Button type="button" variant="outline" className="flex-1 py-4 font-black text-xs uppercase tracking-widest border-none ring-1 ring-gray-200" onClick={this.closeEditModal}>Batal</Button>
                    <Button type="submit" className="flex-1 py-4 font-black text-xs uppercase tracking-widest bg-blue-600 shadow-lg shadow-blue-500/20">Simpan</Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </main>
      </div>
    );
  }
}

export default withRouter(UserManagementComponent);
