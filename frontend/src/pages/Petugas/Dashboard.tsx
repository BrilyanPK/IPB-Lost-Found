import { Component } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import api from '../../api/axios';

interface ReportItem {
  id: string;
  type: string;
  report_time: string;
  location: string;
  status: string;
  item: {
    name: string;
    category: string;
  };
  user: {
    full_name: string;
  };
}

interface DashboardState {
  stats: {
    total_inventory: number;
    reports_today: number;
    total_lost: number;
    total_found: number;
  };
  recentReports: ReportItem[];
  loading: boolean;
}

class Dashboard extends Component<Record<string, never>, DashboardState> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      stats: {
        total_inventory: 0,
        reports_today: 0,
        total_lost: 0,
        total_found: 0
      },
      recentReports: [],
      loading: true
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const [statsRes, reportsRes] = await Promise.all([
        api.get('/petugas/stats'),
        api.get('/petugas/laporan')
      ]);
      this.setState({
        stats: statsRes.data,
        recentReports: reportsRes.data.slice(0, 5),
        loading: false
      });
    } catch (err) {
      console.error(err);
      this.setState({ loading: false });
    }
  };

  render() {
    const { stats, recentReports, loading } = this.state;

    const columns: TableColumn<ReportItem>[] = [
      { 
        key: 'id', 
        header: 'ID Laporan',
        render: (report) => <span className="text-blue-600 font-bold">#{report.id.substring(0, 5).toUpperCase()}</span>
      },
      { 
        key: 'item', 
        header: 'Nama Barang',
        render: (report) => <span className="font-semibold text-gray-800">{report.item.name}</span>
      },
      { key: 'location', header: 'Lokasi' },
      { 
        key: 'type', 
        header: 'Tipe Laporan',
        render: (report) => (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            report.type === 'Kehilangan' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
          }`}>
            {report.type}
          </span>
        )
      },
      { 
        key: 'status', 
        header: 'Status',
        render: (report) => (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            report.status === 'Dikembalikan' ? 'bg-emerald-50 text-emerald-600' : 
            report.status === 'Ditemukan' ? 'bg-blue-50 text-blue-600' :
            report.status === 'Diproses' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600'
          }`}>
            {report.status}
          </span>
        )
      }
    ];

    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <Sidebar role="Petugas" />
        <main className="flex-1 p-10">
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-2">Selamat datang kembali, Petugas. Berikut adalah ringkasan hari ini.</p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <Card className="p-8 border-l-4 border-l-blue-600 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 font-semibold text-sm mb-2 uppercase tracking-wider">Total Barang di Inventaris</h3>
                  <p className="text-5xl font-black text-gray-900">{stats.total_inventory}</p>
                </div>
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-bold">
                  📦
                </div>
              </div>
            </Card>
            <Card className="p-8 border-l-4 border-l-emerald-500 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 font-semibold text-sm mb-2 uppercase tracking-wider">Laporan Baru Hari Ini</h3>
                  <p className="text-5xl font-black text-gray-900">{stats.reports_today}</p>
                </div>
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 text-2xl font-bold">
                  📝
                </div>
              </div>
            </Card>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Daftar Laporan Terbaru</h2>
            <button className="text-blue-600 font-bold hover:underline">Lihat Semua</button>
          </div>
          <Card className="overflow-hidden shadow-sm">
            <Table 
              columns={columns} 
              data={recentReports} 
              loading={loading}
              emptyMessage="Belum ada laporan terbaru."
            />
          </Card>
        </main>
      </div>
    );
  }
}

export default Dashboard;
