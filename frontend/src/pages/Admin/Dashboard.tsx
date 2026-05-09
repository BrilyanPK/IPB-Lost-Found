import { Component } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import api from '../../api/axios';
import { FiActivity, FiCheckCircle, FiAlertTriangle, FiLogOut, FiSearch, FiLayers } from 'react-icons/fi';

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

interface DashboardState {
  stats: {
    total_users: number;
    total_petugas: number;
    total_logs: number;
    total_login: number;
    total_login_success: number;
    total_login_failed: number;
    total_logout: number;
    monthly_activity: number[];
  };
  recentLogs: LogItem[];
  searchTerm: string;
  loadingLogs: boolean;
}

class Dashboard extends Component<Record<string, never>, DashboardState> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      stats: {
        total_users: 0,
        total_petugas: 0,
        total_logs: 0,
        total_login: 0,
        total_login_success: 0,
        total_login_failed: 0,
        total_logout: 0,
        monthly_activity: Array(12).fill(0)
      },
      recentLogs: [],
      searchTerm: '',
      loadingLogs: true
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/logs')
      ]);
      
      this.setState({ 
        stats: statsRes.data,
        recentLogs: logsRes.data,
        loadingLogs: false 
      });
    } catch (err) {
      console.error(err);
      this.setState({ loadingLogs: false });
    }
  };

  handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: e.target.value });
  };

  render() {
    const { stats, recentLogs, loadingLogs, searchTerm } = this.state;

    const filteredLogs = recentLogs.filter(log => 
      log.target_detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user?.full_name || 'Sistem').toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 8);

    const columns: TableColumn<LogItem>[] = [
      { 
        key: 'timestamp', 
        header: 'Timestamp',
        render: (log) => <span className="text-gray-500 font-medium">{new Date(log.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
      },
      { 
        key: 'user', 
        header: 'User',
        render: (log) => <span className="font-bold text-gray-900">{log.user ? log.user.full_name : 'Sistem'}</span>
      },
      { 
        key: 'action', 
        header: 'Detail Aktivitas',
        render: (log) => <span className="text-gray-700 font-semibold">{log.target_detail}</span>
      },
      { 
        key: 'ip_address', 
        header: 'IP Address',
        render: (log) => <span className="text-gray-500 font-mono text-xs">{log.ip_address || '127.0.0.1'}</span>
      },
      { 
        key: 'status', 
        header: 'Status',
        render: (log) => (
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
            log.status === 'Berhasil' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
          }`}>
            {log.status || 'Berhasil'}
          </span>
        )
      }
    ];

    const maxActivity = Math.max(...stats.monthly_activity, 1);

    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <Sidebar role="Admin" />
        <main className="flex-1 p-10">
          <header className="mb-10">
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Dasbor</h1>
            <p className="text-gray-500 mt-2 text-lg font-medium">Monitoring aktivitas sistem secara real-time</p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card className="p-8 border-none ring-1 ring-gray-100 flex flex-col justify-between h-44 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
                  <FiActivity size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Login</p>
              </div>
              <p className="text-5xl font-black text-gray-900 tracking-tighter">{stats.total_login.toString().padStart(2, '0')}</p>
            </Card>
            <Card className="p-8 border-none ring-1 ring-gray-100 flex flex-col justify-between h-44 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                  <FiCheckCircle size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Login Sukses</p>
              </div>
              <p className="text-5xl font-black text-gray-900 tracking-tighter text-blue-600">{stats.total_login_success.toString().padStart(2, '0')}</p>
            </Card>
            <Card className="p-8 border-none ring-1 ring-gray-100 flex flex-col justify-between h-44 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                  <FiAlertTriangle size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Login Gagal</p>
              </div>
              <p className="text-5xl font-black text-gray-900 tracking-tighter text-red-600">{stats.total_login_failed.toString().padStart(2, '0')}</p>
            </Card>
            <Card className="p-8 border-none ring-1 ring-gray-100 flex flex-col justify-between h-44 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                  <FiLogOut size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Logout</p>
              </div>
              <p className="text-5xl font-black text-gray-900 tracking-tighter">{stats.total_logout.toString().padStart(2, '0')}</p>
            </Card>
          </div>

          <Card className="p-10 mb-10 border-none ring-1 ring-gray-100 h-80 flex flex-col justify-between bg-white overflow-hidden shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <FiActivity size={18} className="text-blue-500" />
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Statistik Aktivitas Tahunan</h3>
              </div>
              <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Data real-time berdasarkan log sistem
              </div>
            </div>
            <div className="flex-1 w-full relative flex items-end justify-between gap-1">
              {stats.monthly_activity.map((count, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full bg-gray-50 rounded-t-lg transition-all hover:bg-blue-50 relative group min-h-[4px]" style={{ height: `${(count / maxActivity) * 100}%` }}>
                    <div className="absolute inset-x-0 bottom-0 bg-blue-500 rounded-t-lg transition-all h-1 group-hover:h-full opacity-20"></div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                      {count} Aktivitas
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][i]}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <FiLayers size={20} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Recent Activity</h2>
            </div>
            <div className="relative w-full md:w-80">
              <input 
                type="text" 
                placeholder="Search logs..." 
                value={searchTerm}
                onChange={this.handleSearch}
                className="pl-12 pr-4 py-3 bg-white border-none ring-1 ring-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-full transition-all font-medium"
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          <Card className="overflow-hidden shadow-sm border-none ring-1 ring-gray-100 bg-white">
            <Table 
              columns={columns} 
              data={filteredLogs} 
              loading={loadingLogs}
              emptyMessage="Belum ada aktivitas tercatat."
            />
          </Card>
        </main>
      </div>
    );
  }
}

export default Dashboard;
