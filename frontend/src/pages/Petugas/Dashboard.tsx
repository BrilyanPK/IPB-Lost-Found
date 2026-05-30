import { Component } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import { withRouter } from '../../utils/withRouter';
import type { WithRouterProps } from '../../utils/withRouter';
import api from '../../api/axios';
import { FiBox, FiActivity } from 'react-icons/fi';

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
  };
  recentReports: ReportItem[];
  loading: boolean;
}

class Dashboard extends Component<WithRouterProps, DashboardState> {
  constructor(props: WithRouterProps) {
    super(props);
    this.state = {
      stats: {
        total_inventory: 0,
        reports_today: 0,
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
        render: (report) => <span className="text-blue-600 font-bold">#{report.id.substring(0, 8).toUpperCase()}</span>
      },
      { 
        key: 'item', 
        header: 'Nama Barang',
        render: (report) => <span className="font-semibold text-gray-800">{report.item.name}</span>
      },
      { key: 'location', header: 'Lokasi Temuan' },
      { 
        key: 'report_time', 
        header: 'Waktu',
        render: (report) => (
          <span className="text-gray-500 font-medium">
            {new Date(report.report_time).toLocaleString('en-US', { 
              month: '2-digit', day: '2-digit', year: 'numeric', 
              hour: '2-digit', minute: '2-digit', hour12: false 
            })}
          </span>
        )
      },
      { 
        key: 'status', 
        header: 'Status',
        render: (report) => (
          <div className="flex justify-center">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wide ${
              report.status === 'Dikembalikan' ? 'bg-emerald-50 text-emerald-600' : 
              report.type === 'Penemuan' ? 'bg-blue-50 text-blue-600' :
              'bg-red-50 text-red-600'
            }`}>
              {report.status === 'Dikembalikan' ? 'Dikembalikan' : report.type}
            </span>
          </div>
        )
      }
    ];

    return (
      <div className="flex min-h-screen bg-[#FDFDFD]">
        <Sidebar role="Petugas" />
        <main className="flex-1 p-12">
          <header className="mb-12">
            <h1 className="text-5xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-400 mt-3 text-lg">Selamat datang kembali, Petugas. Berikut adalah status operasional hari ini.</p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            <Card className="p-10 hover:-translate-y-1">
              <div style={{ fontFamily: "'Roboto', sans-serif" }}>
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                    <FiBox size={28} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 tracking-wide">Total Inventori</p>
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-6xl font-bold text-gray-900" style={{ fontFamily: "'Montserrat', sans-serif" }}>{stats.total_inventory.toString().padStart(3, '0')}</p>
                  <p className="text-sm text-gray-400 mt-2">Barang di Pos</p>
                </div>
              </div>
            </Card>

            <Card className="p-10 hover:-translate-y-1">
              <div style={{ fontFamily: "'Roboto', sans-serif" }}>
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                    <FiActivity size={28} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 tracking-wide">24 Jam Terakhir</p>
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-6xl font-bold text-gray-900" style={{ fontFamily: "'Montserrat', sans-serif" }}>{stats.reports_today.toString().padStart(2, '0')}</p>
                  <p className="text-sm text-gray-400 mt-2">Laporan Baru Hari Ini</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Aktivitas Terbaru</h2>
            <Link to="/petugas/reports" className="text-[10px] text-gray-900 font-black tracking-widest uppercase hover:text-blue-600 transition-colors">Lihat Semua</Link>
          </div>
          
          <Card className="shadow-sm border-none ring-1 ring-gray-100 overflow-hidden">
            <Table 
              columns={columns} 
              data={recentReports} 
              loading={loading}
              emptyMessage="Belum ada aktivitas terbaru."
            />
          </Card>
        </main>
      </div>
    );
  }
}

export default withRouter(Dashboard);
