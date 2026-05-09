import React, { Component } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import api from '../../api/axios';
import { FiActivity, FiShield, FiAlertTriangle, FiSearch, FiClock, FiTerminal } from 'react-icons/fi';

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

interface ActivityLogState {
  logs: LogItem[];
  loading: boolean;
  searchTerm: string;
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
    this.setState({ searchTerm: e.target.value });
  };

  render() {
    const { logs, loading, stats, searchTerm } = this.state;

    const filteredLogs = logs.filter(log => 
      log.target_detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user?.full_name || 'Sistem').toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns: TableColumn<LogItem>[] = [
      { 
        key: 'timestamp', 
        header: 'Waktu',
        render: (log) => (
          <div className="flex items-center gap-2 text-gray-500 font-medium">
            <FiClock size={14} />
            {new Date(log.timestamp).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        )
      },
      { 
        key: 'user', 
        header: 'User',
        render: (log) => (
          <span className="font-bold text-gray-900 flex items-center gap-2">
            {log.user ? log.user.full_name : 'Sistem'}
            {log.user && <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-black uppercase tracking-widest text-gray-400">{log.user.role}</span>}
          </span>
        )
      },
      { 
        key: 'action', 
        header: 'Aksi & Detail',
        render: (log) => (
          <div className="flex flex-col">
            <span className="text-gray-900 font-bold text-xs uppercase tracking-wider">{log.action}</span>
            <span className="text-gray-500 font-medium text-sm">{log.target_detail}</span>
          </div>
        )
      },
      { 
        key: 'ip_address', 
        header: 'IP Address',
        render: (log) => <span className="text-gray-500 font-mono text-xs">{log.ip_address || '-'}</span>
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

    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <Sidebar role="Admin" />
        <main className="flex-1 p-10">
          <header className="mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Log Aktivitas</h1>
              <p className="text-gray-500 mt-2 text-lg font-medium">Log Kendali Akses & Operasi Sistem</p>
            </div>
            <div className="p-3 bg-white ring-1 ring-gray-100 rounded-2xl shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Live</span>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <Card className="p-8 border-none ring-1 ring-gray-100 flex flex-col justify-between h-44 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                  <FiActivity size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Health</p>
              </div>
              <p className="text-3xl font-black text-gray-900 tracking-tight">{stats.system_health}</p>
            </Card>
            <Card className="p-8 border-none ring-1 ring-gray-100 flex flex-col justify-between h-44 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                  <FiShield size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Logs</p>
              </div>
              <p className="text-5xl font-black text-gray-900 tracking-tighter">{stats.total_logs.toString().padStart(2, '0')}</p>
            </Card>
            <Card className="p-8 border-none ring-1 ring-gray-100 flex flex-col justify-between h-44 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                  <FiAlertTriangle size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alerts</p>
              </div>
              <p className="text-5xl font-black text-gray-900 tracking-tighter text-red-600">{stats.security_alerts.toString().padStart(2, '0')}</p>
            </Card>
          </div>

          <Card className="overflow-hidden shadow-sm border-none ring-1 ring-gray-100 bg-white">
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-900 rounded-lg text-white">
                  <FiTerminal size={20} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">System Registry</h2>
              </div>
              <div className="relative w-full md:w-80">
                <input 
                  type="text" 
                  placeholder="Search logs..." 
                  value={searchTerm}
                  onChange={this.handleSearch}
                  className="pl-12 pr-4 py-3 bg-gray-50 border-none ring-1 ring-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-full transition-all font-medium"
                />
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
            <Table 
              columns={columns} 
              data={filteredLogs} 
              loading={loading}
              emptyMessage={searchTerm ? "Tidak ada log yang cocok." : "Belum ada log aktivitas."}
            />
          </Card>
        </main>
      </div>
    );
  }
}

export default ActivityLog;
