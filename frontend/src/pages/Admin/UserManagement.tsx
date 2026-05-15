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
import { FiUsers, FiShield, FiSearch, FiSliders, FiUserPlus, FiTrash2, FiUserCheck } from 'react-icons/fi';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface FilterState {
  time: string[];
  role: string[];
}

interface UserManagementState {
  users: User[];
  loading: boolean;
  showFilterModal: boolean;
  searchTerm: string;
  filters: FilterState;
  tempFilters: FilterState;
  currentPage: number;
  entriesPerPage: number;
  sortKey: string | null;
  sortDirection: 'asc' | 'desc' | null;
}

class UserManagementComponent extends Component<WithRouterProps, UserManagementState> {
  constructor(props: WithRouterProps) {
    super(props);
    this.state = {
      users: [],
      loading: true,
      showFilterModal: false,
      searchTerm: '',
      filters: { time: [], role: [] },
      tempFilters: { time: [], role: [] },
      currentPage: 1,
      entriesPerPage: 5,
      sortKey: null,
      sortDirection: null
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

  goToUserDetail = (id: string) => {
    this.props.navigate(`/admin/users/${id}`);
  };

  handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: e.target.value, currentPage: 1 });
  };

  handlePageChange = (page: number) => {
    this.setState({ currentPage: page });
  };

  handleSort = (key: string) => {
    this.setState(prevState => {
      if (prevState.sortKey === key) {
        if (prevState.sortDirection === 'desc') return { sortDirection: 'asc' };
        if (prevState.sortDirection === 'asc') return { sortKey: null, sortDirection: null };
      }
      return { sortKey: key, sortDirection: 'desc' };
    });
  };

  toggleFilterModal = () => {
    this.setState(prevState => ({
      showFilterModal: !prevState.showFilterModal,
      tempFilters: prevState.showFilterModal ? prevState.tempFilters : { ...prevState.filters }
    }));
  };

  handleCheckboxChange = (category: keyof FilterState, option: string, checked: boolean) => {
    this.setState(prevState => {
      const newTempFilters = { ...prevState.tempFilters };
      if (checked) {
        newTempFilters[category] = [...newTempFilters[category], option];
      } else {
        newTempFilters[category] = newTempFilters[category].filter(item => item !== option);
      }
      return { tempFilters: newTempFilters };
    });
  };

  applyFilters = () => {
    this.setState(prevState => ({
      showFilterModal: false,
      currentPage: 1,
      filters: { ...prevState.tempFilters }
    }));
  };

  render() {
    const { users, loading, showFilterModal, searchTerm, filters, tempFilters, currentPage, entriesPerPage, sortKey, sortDirection } = this.state;

    const now = new Date();

    const filteredUsers = users.filter(user => {
      // Search
      const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // Filter Time
      if (filters.time.length > 0) {
        const userDate = (user as any).created_at ? new Date((user as any).created_at) : new Date();
        const diffTime = Math.abs(now.getTime() - userDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let timeMatch = false;
        if (filters.time.includes('Hari Ini') && diffDays <= 1) timeMatch = true;
        if (filters.time.includes('7 Hari Terakhir') && diffDays <= 7) timeMatch = true;
        if (filters.time.includes('30 Hari Terakhir') && diffDays <= 30) timeMatch = true;

        if (!timeMatch) return false;
      }

      // Filter Role
      if (filters.role.length > 0) {
        if (!filters.role.includes(user.role)) return false;
      }

      return true;
    });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (!sortKey) return 0;

      let valA: any = a[sortKey as keyof User];
      let valB: any = b[sortKey as keyof User];

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentUsers = sortedUsers.slice(indexOfFirst, indexOfLast);

    const columns: TableColumn<User>[] = [
      {
        key: 'full_name',
        header: 'Nama',
        sortable: true,
        width: '35%',
        render: (user) => (
          <button
            onClick={() => this.goToUserDetail(user.id)}
            className="text-blue-600 font-medium hover:underline text-left"
          >
            {user.full_name}
          </button>
        )
      },
      {
        key: 'email',
        header: 'Email',
        sortable: true,
        width: '35%',
        render: (user) => <span className="text-gray-900 font-medium">{user.email}</span>
      },
      {
        key: 'role',
        header: 'Role',
        sortable: true,
        width: '20%',
        render: (user) => {
          let bg = 'bg-emerald-50';
          let text = 'text-emerald-600';
          if (user.role === 'Admin') {
            bg = 'bg-orange-50';
            text = 'text-orange-400';
          } else if (user.role === 'Petugas') {
            bg = 'bg-blue-50';
            text = 'text-blue-500';
          }
          return (
            <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-wide ${bg} ${text}`}>
              {user.role}
            </span>
          );
        }
      }
    ];

    const totalAdmin = users.filter(u => u.role === 'Admin').length;
    const totalPetugas = users.filter(u => u.role === 'Petugas').length;

    const topContent = (
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">List Pengguna</h2>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search user..."
              value={searchTerm}
              onChange={this.handleSearch}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-full md:w-64 transition-all"
            />
          </div>

          <div className="relative">
            <button
              onClick={this.toggleFilterModal}
              className={`p-2 border rounded-lg transition-colors flex items-center justify-center ${showFilterModal ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <FiSliders size={18} />
              {(filters.time.length > 0 || filters.role.length > 0) && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white translate-x-1/3 -translate-y-1/3"></span>
              )}
            </button>

            {showFilterModal && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-lg z-[100] p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Filter Users</h3>
                <div className="space-y-4 max-h-72 overflow-y-auto custom-scrollbar">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Rentang Waktu Dibuat</label>
                    <div className="space-y-2">
                      {['Hari Ini', '7 Hari Terakhir', '30 Hari Terakhir'].map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            checked={tempFilters.time.includes(opt)}
                            onChange={(e) => this.handleCheckboxChange('time', opt, e.target.checked)}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="w-full h-px bg-gray-100"></div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Role</label>
                    <div className="space-y-2 mb-2">
                      {['Admin', 'Petugas', 'Pencari'].map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            checked={tempFilters.role.includes(opt)}
                            onChange={(e) => this.handleCheckboxChange('role', opt, e.target.checked)}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={this.applyFilters}
                    className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors mt-2"
                  >
                    Terapkan Filter
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            className="px-6 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
            onClick={() => this.props.navigate('/admin/users/create')}
          >
            Buat Pengguna
          </button>
        </div>
      </div>
    );

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

          <Table
            columns={columns}
            data={currentUsers}
            loading={loading}
            topContent={topContent}
            sortKey={sortKey}
            sortDirection={sortDirection as 'asc' | 'desc' | undefined}
            onSort={this.handleSort}
            emptyMessage={searchTerm || filters.time.length > 0 || filters.role.length > 0 ? "Tidak ada user yang cocok dengan filter." : "Belum ada pengguna terdaftar."}
            pagination={{
              currentPage,
              totalPages: Math.ceil(filteredUsers.length / entriesPerPage),
              totalEntries: filteredUsers.length,
              entriesPerPage,
              onPageChange: this.handlePageChange
            }}
          />
        </main>
      </div>
    );
  }
}

export default withRouter(UserManagementComponent);
