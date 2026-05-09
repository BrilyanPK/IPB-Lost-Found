import { Component } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import { withRouter } from '../../utils/withRouter';
import type { WithRouterProps } from '../../utils/withRouter';
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

interface ReportListState {
  reports: ReportItem[];
  loading: boolean;
  stats: {
    total_laporan: number;
    laporan_baru: number;
  };
}

class ReportListComponent extends Component<WithRouterProps, ReportListState> {
  constructor(props: WithRouterProps) {
    super(props);
    this.state = {
      reports: [],
      loading: true,
      stats: {
        total_laporan: 0,
        laporan_baru: 0
      }
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const [reportsRes, statsRes] = await Promise.all([
        api.get('/petugas/laporan'),
        api.get('/petugas/stats')
      ]);
      this.setState({ 
        reports: reportsRes.data, 
        stats: {
          total_laporan: reportsRes.data.length,
          laporan_baru: statsRes.data.reports_today
        },
        loading: false 
      });
    } catch (err) {
      console.error(err);
      this.setState({ loading: false });
    }
  };

  render() {
    const { reports, loading, stats } = this.state;
    const { navigate } = this.props;

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
      },
      {
        key: 'actions',
        header: '',
        render: (report) => (
          <button 
            onClick={() => navigate(`/petugas/reports/${report.id}`)}
            className="text-blue-600 font-bold hover:underline"
          >
            Detail
          </button>
        )
      }
    ];

    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <Sidebar role="Petugas" />
        <main className="flex-1 p-10">
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Daftar Laporan</h1>
            <p className="text-gray-500 mt-2">Kelola dan pantau semua laporan yang masuk ke sistem.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <Card className="p-6 border-none ring-1 ring-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-xl font-bold">L</div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stats.total_laporan}</p>
                <p className="text-xs text-gray-500 font-semibold uppercase">Total Laporan</p>
              </div>
            </Card>
            <Card className="p-6 border-none ring-1 ring-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 text-xl font-bold">N</div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stats.laporan_baru}</p>
                <p className="text-xs text-gray-500 font-semibold uppercase">Laporan Baru</p>
              </div>
            </Card>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Daftar Laporan</h2>
          </div>
          <Card className="overflow-hidden shadow-sm">
            <Table 
              columns={columns} 
              data={reports} 
              loading={loading}
              emptyMessage="Belum ada laporan."
            />
          </Card>
        </main>
      </div>
    );
  }
}

export default withRouter(ReportListComponent);
