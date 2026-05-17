import React, { Component } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import api from '../../api/axios';
import { FiActivity, FiShield, FiAlertTriangle, FiSearch, FiSliders } from 'react-icons/fi';

interface LogItem {
  id: string;
  action: string;
  target_detail: string;
  timestamp: string;
  ip_address?: string;
  status?: string;
  user?: {
    full_name: string;
    role: string;
  };
}

interface FilterState {
  time: string[];
  activity: string[];
  status: string[];
}

interface ActivityLogState {
  logs: LogItem[];
  loading: boolean;
  searchTerm: string;
  currentPage: number;
  entriesPerPage: number;
  showFilterDropdown: boolean;
  filters: FilterState;
  tempFilters: FilterState;
  sortKey: string | null;
  sortDirection: 'asc' | 'desc' | null;
  stats: {
    system_health: string;
    total_logs: number;
    security_alerts: number;
  };
}

class ActivityLog extends Component<Record<string, never>, ActivityLogState> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      logs: [],
      loading: true,
      searchTerm: '',
      currentPage: 1,
      entriesPerPage: 5,
      showFilterDropdown: false,
      filters: { time: [], activity: [], status: [] },
      tempFilters: { time: [], activity: [], status: [] },
      sortKey: null,
      sortDirection: null,
      stats: {
        system_health: 'Logging Active',
        total_logs: 0,
        security_alerts: 0
      }
    };
  }

  componentDidMount() {
    this.fetchLogs();
  }

  fetchLogs = async () => {
    try {
      const res = await api.get('/admin/logs');
      this.setState({ 
        logs: res.data,
        stats: {
          system_health: 'Logging Active',
          total_logs: res.data.length,
          security_alerts: res.data.filter((l: LogItem) => l.status === 'Peringatan').length
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      this.setState({ loading: false });
    }
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

  toggleFilterDropdown = () => {
    this.setState(prevState => ({
      showFilterDropdown: !prevState.showFilterDropdown,
      tempFilters: prevState.showFilterDropdown ? prevState.tempFilters : { ...prevState.filters }
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
      showFilterDropdown: false,
      currentPage: 1,
      filters: { ...prevState.tempFilters }
    }));
  };

  render() {
    const { 
      logs, loading, stats, searchTerm, currentPage, entriesPerPage, 
      showFilterDropdown, filters, tempFilters,
      sortKey, sortDirection
    } = this.state;

    const now = new Date();
    
    const filteredLogs = logs.filter(log => {
      // Search
      const matchesSearch = 
        log.target_detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user?.full_name || 'Sistem').toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Filter Time
      if (filters.time.length > 0) {
        const logDate = new Date(log.timestamp);
        const diffTime = Math.abs(now.getTime() - logDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let timeMatch = false;
        if (filters.time.includes('Hari Ini') && diffDays <= 1) timeMatch = true;
        if (filters.time.includes('7 Hari Terakhir') && diffDays <= 7) timeMatch = true;
        if (filters.time.includes('30 Hari Terakhir') && diffDays <= 30) timeMatch = true;

        if (!timeMatch) return false;
      }

      // Filter Activity
      if (filters.activity.length > 0) {
        const actionLower = log.action.toLowerCase();
        let activityMatch = false;
        if (filters.activity.includes('Login/Logout') && (actionLower.includes('login') || actionLower.includes('logout'))) activityMatch = true;
        if (filters.activity.includes('Update Laporan') && actionLower.includes('update')) activityMatch = true;
        if (filters.activity.includes('Mengubah Role') && actionLower.includes('role')) activityMatch = true;
        if (filters.activity.includes('Menghapus Data') && actionLower.includes('hapus')) activityMatch = true;

        if (!activityMatch) return false;
      }

      // Filter Status
      if (filters.status.length > 0) {
        const currentStatus = log.status || 'Berhasil';
        if (!filters.status.includes(currentStatus)) return false;
      }

      return true;
    });

    const sortedLogs = [...filteredLogs].sort((a, b) => {
      if (!sortKey) return 0;
      
      let valA: any = a[sortKey as keyof LogItem];
      let valB: any = b[sortKey as keyof LogItem];

      if (sortKey === 'user') {
        valA = a.user?.full_name || 'Sistem';
        valB = b.user?.full_name || 'Sistem';
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentLogs = sortedLogs.slice(indexOfFirst, indexOfLast);

    const columns: TableColumn<LogItem>[] = [
      { 
        key: 'timestamp', 
        header: 'Waktu',
        sortable: true,
        width: '20%',
        render: (log) => {
          const date = new Date(log.timestamp);
          const formatted = date.toLocaleString('id-ID', { 
            day: 'numeric', month: 'long', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
          }).replace(' pukul', ',');
          return <span className="text-gray-700">{formatted}</span>;
        }
      },
      { 
        key: 'user', 
        header: 'Pengguna',
        sortable: true,
        width: '20%',
        render: (log) => (
          <span className="font-medium text-blue-500 hover:text-blue-700 cursor-pointer transition-colors">
            {log.user ? log.user.full_name : 'Sistem'}
          </span>
        )
      },
      { 
        key: 'action', 
        header: 'Aktivitas',
        sortable: true,
        width: '30%',
        render: (log) => (
          <div className="flex flex-col">
            <span className="text-gray-800 font-medium">{log.action}</span>
            <span className="text-gray-500 text-xs mt-0.5">{log.target_detail}</span>
          </div>
        )
      },
      { 
        key: 'ip_address', 
        header: 'Alamat IP',
        sortable: true,
        width: '15%',
        render: (log) => <span className="text-gray-700">{log.ip_address || '-'}</span>
      },
      { 
        key: 'status', 
        header: 'Status',
        sortable: true,
        width: '15%',
        render: (log) => {
          const status = log.status || 'Berhasil';
          let bg = 'bg-emerald-50';
          let text = 'text-emerald-600';
          if (status === 'Peringatan') {
            bg = 'bg-amber-50';
            text = 'text-amber-600';
          } else if (status === 'Gagal') {
            bg = 'bg-red-50';
            text = 'text-red-600';
          }
          return (
            <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide ${bg} ${text}`}>
              {status}
            </span>
          );
        }
      }
    ];

    const topContent = (
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">Activity Log</h2>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={this.handleSearch}
              className="pl-11 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full transition-all"
            />
          </div>
          <div className="relative">
            <button 
              onClick={this.toggleFilterDropdown}
              className={`p-2 border rounded-lg transition-colors flex items-center justify-center ${showFilterDropdown ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <FiSliders size={18} />
              {(filters.time.length > 0 || filters.activity.length > 0 || filters.status.length > 0) && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white translate-x-1/3 -translate-y-1/3"></span>
              )}
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-lg z-20 p-5 flex flex-col max-h-96">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex-none">Filter Logs</h3>
                <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Rentang Waktu</label>
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
                    <label className="block text-xs font-bold text-gray-700 mb-2">Aktivitas</label>
                    <div className="space-y-2">
                      {['Login/Logout', 'Update Laporan', 'Mengubah Role', 'Menghapus Data'].map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            checked={tempFilters.activity.includes(opt)}
                            onChange={(e) => this.handleCheckboxChange('activity', opt, e.target.checked)}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="w-full h-px bg-gray-100"></div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Status</label>
                    <div className="space-y-2 mb-2">
                      {['Berhasil', 'Peringatan', 'Gagal'].map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            checked={tempFilters.status.includes(opt)}
                            onChange={(e) => this.handleCheckboxChange('status', opt, e.target.checked)}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-100 flex-none">
                  <button 
                    onClick={this.applyFilters}
                    className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Terapkan Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <Sidebar role="Admin" />
        <main className="flex-1 p-10">
          <header className="mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 tracking-tighter">Log Aktivitas</h1>
              <p className="text-gray-500 mt-2 text-lg font-medium">Log Kendali Akses & Operasi Sistem</p>
            </div>
            <div className="p-3 bg-white ring-1 ring-gray-100 rounded-2xl shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Live</span>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <Card className="p-8 border-none ring-1 ring-gray-100 flex flex-col justify-between h-44 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                  <FiActivity size={20} />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Health</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats.system_health}</p>
            </Card>
            <Card className="p-8 border-none ring-1 ring-gray-100 flex flex-col justify-between h-44 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                  <FiShield size={20} />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Logs</p>
              </div>
              <p className="text-5xl font-bold text-gray-900 tracking-tighter">{stats.total_logs.toString().padStart(2, '0')}</p>
            </Card>
            <Card className="p-8 border-none ring-1 ring-gray-100 flex flex-col justify-between h-44 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                  <FiAlertTriangle size={20} />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alerts</p>
              </div>
              <p className="text-5xl font-bold text-gray-900 tracking-tighter text-red-600">{stats.security_alerts.toString().padStart(2, '0')}</p>
            </Card>
          </div>

          <Table 
            columns={columns} 
            data={currentLogs} 
            loading={loading}
            topContent={topContent}
            onSort={this.handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection as 'asc' | 'desc' | undefined}
            emptyMessage={searchTerm || filters.time.length > 0 || filters.activity.length > 0 || filters.status.length > 0 ? "Tidak ada log yang cocok dengan filter." : "Belum ada log aktivitas."}
            pagination={{
              currentPage,
              totalPages: Math.ceil(filteredLogs.length / entriesPerPage),
              totalEntries: filteredLogs.length,
              entriesPerPage,
              onPageChange: this.handlePageChange
            }}
          />
        </main>
      </div>
    );
  }
}

export default ActivityLog;
