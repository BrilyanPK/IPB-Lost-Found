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
    total_completed_reports: number;
  };
  searchTerm: string;
  showFilterDropdown: boolean;
  filters: {
    status: string[];
  };
  tempFilters: {
    status: string[];
  };
  currentPage: number;
  entriesPerPage: number;
  sortKey: string | null;
  sortDirection: 'asc' | 'desc' | null;
}

class ReportListComponent extends Component<WithRouterProps, ReportListState> {
  constructor(props: WithRouterProps) {
    super(props);
    this.state = {
      reports: [],
      loading: true,
      stats: {
        total_active: 0,
        completion_rate: 0,
        total_completed_reports: 0
      },
      searchTerm: '',
      showFilterDropdown: false,
      filters: { status: [] },
      tempFilters: { status: [] },
      currentPage: 1,
      entriesPerPage: 5,
      sortKey: null,
      sortDirection: null
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
          completion_rate: reportsRes.data.length > 0 ? Math.round((completedReports.length / reportsRes.data.length) * 100) : 0,
          total_completed_reports: completedReports.length
        },
        loading: false 
      });
    } catch (err) {
      console.error(err);
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
        if (prevState.sortDirection === 'desc') return { sortDirection: 'asc', sortKey: key };
        if (prevState.sortDirection === 'asc') return { sortKey: null as string | null, sortDirection: null as 'asc' | 'desc' | null };
      }
      return { sortKey: key, sortDirection: 'desc' as 'desc' };
    });
  };

  toggleFilterDropdown = () => {
    this.setState(prevState => ({
      showFilterDropdown: !prevState.showFilterDropdown,
      tempFilters: { ...prevState.filters }
    }));
  };

  handleCheckboxChange = (category: 'status', value: string, checked: boolean) => {
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
      showFilterDropdown: false,
      currentPage: 1
    }));
  };

  render() {
    const { reports, loading, stats, searchTerm, showFilterDropdown, filters, tempFilters, currentPage, entriesPerPage, sortKey, sortDirection } = this.state;
    const { navigate } = this.props;

    const filteredReports = reports.filter(report => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = 
        report.id.toLowerCase().includes(searchLower) ||
        report.item.name.toLowerCase().includes(searchLower) ||
        report.location.toLowerCase().includes(searchLower);

      const matchStatus = filters.status.length === 0 || filters.status.includes(report.status);

      return matchSearch && matchStatus;
    });

    const sortedReports = [...filteredReports].sort((a, b) => {
      if (!sortKey) return 0;
      let valA: any = a[sortKey as keyof ReportItem];
      let valB: any = b[sortKey as keyof ReportItem];
      
      if (sortKey === 'item') {
        valA = a.item.name;
        valB = b.item.name;
      }
      
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentReports = sortedReports.slice(indexOfFirst, indexOfLast);

    const columns: TableColumn<ReportItem>[] = [
      { 
        key: 'id', 
        header: 'ID Laporan',
        sortable: true,
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
        sortable: true,
        render: (report) => <span className="font-semibold text-gray-800">{report.item.name}</span>
      },
      { key: 'location', header: 'Lokasi Temuan', sortable: true },
      { 
        key: 'report_time', 
        header: 'Waktu',
        sortable: true,
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
        sortable: true,
        render: (report) => (
          <div className="flex justify-center">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wide ${
              report.status === 'Dikembalikan' ? 'bg-emerald-50 text-emerald-600' : 
              report.status === 'Ditemukan' ? 'bg-blue-50 text-blue-600' :
              report.status === 'Diproses' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
            }`}>
              {report.status}
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
                    <p className="text-xs text-gray-400 tracking-wide">Total Aktif</p>
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-6xl font-bold text-gray-900" style={{ fontFamily: "'Montserrat', sans-serif" }}>{stats.total_active}</p>
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
                    <p className="text-xs text-gray-400 tracking-wide">Selesai/Kembali</p>
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-6xl font-bold text-gray-900" style={{ fontFamily: "'Montserrat', sans-serif" }}>{stats.total_completed_reports}</p>
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
                    className="pl-12 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm font-medium w-80"
                  />
                </div>
                <div className="relative">
                  <button 
                    onClick={this.toggleFilterDropdown}
                    className={`p-3 border rounded-xl transition-colors flex items-center justify-center ${showFilterDropdown ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-gray-50/50 border-gray-100 text-gray-400 hover:text-gray-900'}`}
                  >
                    <FiSliders size={20} />
                    {filters.status.length > 0 && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white translate-x-1/3 -translate-y-1/3"></span>
                    )}
                  </button>
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-lg z-[100] p-5 flex flex-col max-h-96">
                      <h3 className="text-sm font-bold text-gray-900 mb-4 flex-none">Filter Laporan</h3>
                      <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2">Status</label>
                          <div className="space-y-2 mb-2">
                            {['Hilang', 'Diproses', 'Ditemukan', 'Dikembalikan'].map(opt => (
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
              data={currentReports} 
              loading={loading}
              emptyMessage="Belum ada laporan yang ditemukan."
              sortKey={sortKey || undefined}
              sortDirection={sortDirection || undefined}
              onSort={this.handleSort}
              pagination={{
                currentPage,
                totalPages: Math.ceil(filteredReports.length / entriesPerPage),
                totalEntries: filteredReports.length,
                entriesPerPage,
                onPageChange: this.handlePageChange
              }}
            />
          </Card>
        </main>
      </div>
    );
  }
}

export default withRouter(ReportListComponent);
