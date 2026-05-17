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
  searchTerm: string;
  showFilterDropdown: boolean;
  filters: {
    status: string[];
    type: string[];
  };
  tempFilters: {
    status: string[];
    type: string[];
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
      },
      searchTerm: '',
      showFilterDropdown: false,
      filters: { status: [], type: [] },
      tempFilters: { status: [], type: [] }
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

  handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: e.target.value });
  };

  toggleFilterDropdown = () => {
    this.setState(prevState => ({
      showFilterDropdown: !prevState.showFilterDropdown,
      tempFilters: { ...prevState.filters }
    }));
  };

  handleCheckboxChange = (category: 'status' | 'type', value: string, checked: boolean) => {
    this.setState(prevState => {
      const currentList = prevState.tempFilters[category];
      const newList = checked 
        ? [...currentList, value] 
        : currentList.filter(item => item !== value);
      
      return {
        tempFilters: {
          ...prevState.tempFilters,
          [category]: newList
        }
      };
    });
  };

  applyFilters = () => {
    this.setState(prevState => ({
      filters: { ...prevState.tempFilters },
      showFilterDropdown: false
    }));
  };

  render() {
    const { reports, loading, stats, searchTerm, showFilterDropdown, filters, tempFilters } = this.state;
    const { navigate } = this.props;

    const filteredReports = reports.filter(report => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = 
        report.id.toLowerCase().includes(searchLower) ||
        report.item.name.toLowerCase().includes(searchLower) ||
        report.location.toLowerCase().includes(searchLower);

      const matchStatus = filters.status.length === 0 || filters.status.includes(report.status);
      const matchType = filters.type.length === 0 || filters.type.includes(report.type);

      return matchSearch && matchStatus && matchType;
    });

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
            <h1 className="text-5xl font-bold text-gray-900 tracking-tight">Daftar Laporan</h1>
            <p className="text-gray-400 mt-3 text-lg">Manajemen laporan kehilangan dan temuan barang di lingkungan IPB.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            <Card className="p-10 hover:-translate-y-1">
              <div style={{ fontFamily: "'Roboto', sans-serif" }}>
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                    <FiFileText size={28} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Total Aktif</p>
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-6xl font-bold text-gray-900" style={{ fontFamily: "'Montserrat', sans-serif" }}>{stats.total_active.toString().padStart(3, '0')}</p>
                  <p className="text-sm text-gray-400 mt-2">+12% Minggu Ini</p>
                </div>
              </div>
            </Card>

            <Card className="p-10 hover:-translate-y-1">
              <div style={{ fontFamily: "'Roboto', sans-serif" }}>
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                    <FiCheckCircle size={28} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Selesai/Kembali</p>
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-6xl font-bold text-gray-900" style={{ fontFamily: "'Montserrat', sans-serif" }}>{stats.completion_rate.toString().padStart(2, '0')}</p>
                  <p className="text-sm text-gray-400 mt-2">Rasio Kesuksesan: {stats.completion_rate}%</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="shadow-sm border-none ring-1 ring-gray-100 overflow-hidden">
            <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-white relative">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">List Laporan</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search data here" 
                    value={searchTerm}
                    onChange={this.handleSearch}
                    style={{ fontFamily: "'Roboto', sans-serif" }}
                    className="pl-12 pr-6 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-sm font-medium w-80"
                  />
                </div>
                <div className="relative">
                  <button 
                    onClick={this.toggleFilterDropdown}
                    className={`p-3 border rounded-xl transition-colors flex items-center justify-center ${showFilterDropdown ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-gray-50/50 border-gray-100 text-gray-400 hover:text-gray-900'}`}
                  >
                    <FiSliders size={20} />
                    {(filters.status.length > 0 || filters.type.length > 0) && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white translate-x-1/3 -translate-y-1/3"></span>
                    )}
                  </button>
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-lg z-[100] p-5 flex flex-col max-h-96">
                      <h3 className="text-sm font-bold text-gray-900 mb-4 flex-none">Filter Laporan</h3>
                      <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2">Tipe Laporan</label>
                          <div className="space-y-2">
                            {['Kehilangan', 'Penemuan'].map(opt => (
                              <label key={opt} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                  checked={tempFilters.type.includes(opt)}
                                  onChange={(e) => this.handleCheckboxChange('type', opt, e.target.checked)}
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
                            {['Diproses', 'Ditemukan', 'Dikembalikan'].map(opt => (
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
            
            <Table 
              columns={columns} 
              data={filteredReports} 
              loading={loading}
              emptyMessage="Belum ada laporan yang ditemukan."
            />

            <div className="p-10 bg-white border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                Menampilkan {filteredReports.length} dari {reports.length} entri
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
