import { Component } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import { withRouter } from '../../utils/withRouter';
import type { WithRouterProps } from '../../utils/withRouter';
import api from '../../api/axios';
import { FiFileText, FiCheckCircle, FiSearch, FiSliders } from 'react-icons/fi';

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
    total_active: number;
    completion_rate: number;
  };
}

class ReportListComponent extends Component<WithRouterProps, ReportListState> {
  constructor(props: WithRouterProps) {
    super(props);
    this.state = {
      reports: [],
      loading: true,
      stats: {
        total_active: 0,
        completion_rate: 0
      }
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const reportsRes = await api.get('/petugas/laporan');
      const activeReports = reportsRes.data.filter((r: ReportItem) => r.status !== 'Dikembalikan');
      const completedReports = reportsRes.data.filter((r: ReportItem) => r.status === 'Dikembalikan');
      
      this.setState({ 
        reports: reportsRes.data, 
        stats: {
          total_active: activeReports.length,
          completion_rate: reportsRes.data.length > 0 ? Math.round((completedReports.length / reportsRes.data.length) * 100) : 0
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
        render: (report) => (
          <button 
            onClick={() => navigate(`/petugas/reports/${report.id}`)}
            className="text-blue-600 font-bold hover:underline"
          >
            #{report.id.substring(0, 8).toUpperCase()}
          </button>
        )
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
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Daftar Laporan</h1>
            <p className="text-gray-400 mt-3 text-lg">Manajemen laporan kehilangan dan temuan barang di lingkungan IPB.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            <Card className="p-10 hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                  <FiFileText size={28} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Aktif</p>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-6xl font-black text-gray-900">{stats.total_active.toString().padStart(3, '0')}</p>
                <p className="text-sm text-gray-400 font-bold mt-2">+12% Minggu Ini</p>
              </div>
            </Card>

            <Card className="p-10 hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                  <FiCheckCircle size={28} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Selesai/Kembali</p>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-6xl font-black text-gray-900">{stats.completion_rate.toString().padStart(2, '0')}</p>
                <p className="text-sm text-gray-400 font-bold mt-2">Rasio Kesuksesan: {stats.completion_rate}%</p>
              </div>
            </Card>
          </div>

          <Card className="shadow-sm border-none ring-1 ring-gray-100 overflow-hidden">
            <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">List Laporan</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search data here" 
                    className="pl-12 pr-6 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-sm font-medium w-80"
                  />
                </div>
                <button className="p-3 bg-gray-50/50 border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-colors">
                  <FiSliders size={20} />
                </button>
              </div>
            </div>
            
            <Table 
              columns={columns} 
              data={reports} 
              loading={loading}
              emptyMessage="Belum ada laporan yang ditemukan."
            />

            <div className="p-10 bg-white border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                Menampilkan {reports.length} dari {reports.length} entri
              </p>
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900">
                  &lt;
                </button>
                <button className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20">
                  1
                </button>
                <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 font-bold">
                  2
                </button>
                <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 font-bold">
                  3
                </button>
                <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 font-bold">
                  4
                </button>
                <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900">
                  &gt;
                </button>
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  }
}

export default withRouter(ReportListComponent);
