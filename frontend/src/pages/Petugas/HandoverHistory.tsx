import { Component } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import api from '../../api/axios';
import { FiBox, FiCheckCircle, FiSearch, FiSliders } from 'react-icons/fi';

interface HandoverItem {
  id: string;
  report_time: string;
  location: string;
  status: string;
  receiver_id?: string;
  receiver?: {
    full_name: string;
  };
  item: {
    name: string;
    category: string;
  };
  user: {
    full_name: string;
  };
}

interface HandoverHistoryState {
  history: HandoverItem[];
  loading: boolean;
  stats: {
    total_handover: number;
    today_handover: number;
  };
  searchTerm: string;
  showFilterDropdown: boolean;
  filters: {
    time: string[];
  };
  tempFilters: {
    time: string[];
  };
}

class HandoverHistory extends Component<Record<string, never>, HandoverHistoryState> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      history: [],
      loading: true,
      stats: {
        total_handover: 0,
        today_handover: 0
      },
      searchTerm: '',
      showFilterDropdown: false,
      filters: { time: [] },
      tempFilters: { time: [] }
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const res = await api.get('/petugas/riwayat');
      const today = new Date().toLocaleDateString();
      const todayHandover = res.data.filter((h: HandoverItem) => new Date(h.report_time).toLocaleDateString() === today);
      
      this.setState({ 
        history: res.data, 
        stats: {
          total_handover: res.data.length,
          today_handover: todayHandover.length
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

  handleCheckboxChange = (category: 'time', value: string, checked: boolean) => {
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
    const { history, loading, stats, searchTerm, showFilterDropdown, filters, tempFilters } = this.state;

    const filteredHistory = history.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = 
        item.id.toLowerCase().includes(searchLower) ||
        item.item.name.toLowerCase().includes(searchLower) ||
        (item.receiver?.full_name && item.receiver.full_name.toLowerCase().includes(searchLower)) ||
        item.user.full_name.toLowerCase().includes(searchLower);

      let matchTime = true;
      if (filters.time.length > 0) {
        const itemDate = new Date(item.report_time);
        const today = new Date();
        matchTime = filters.time.some(t => {
          if (t === 'Hari Ini') {
            return itemDate.toDateString() === today.toDateString();
          }
          if (t === '7 Hari Terakhir') {
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            return itemDate >= sevenDaysAgo;
          }
          if (t === '30 Hari Terakhir') {
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            return itemDate >= thirtyDaysAgo;
          }
          return false;
        });
      }

      return matchSearch && matchTime;
    });

    const columns: TableColumn<HandoverItem>[] = [
      { 
        key: 'id', 
        header: 'ID Laporan',
        render: (item) => <span className="text-blue-600 font-bold">#{item.id.substring(0, 8).toUpperCase()}</span>
      },
      { 
        key: 'item', 
        header: 'Nama Barang',
        render: (item) => <span className="font-semibold text-gray-800">{item.item.name}</span>
      },
      { 
        key: 'report_time', 
        header: 'Tanggal Selesai',
        render: (item) => (
          <span className="text-gray-500 font-medium">
            {new Date(item.report_time).toLocaleString('en-US', { 
              month: '2-digit', day: '2-digit', year: 'numeric', 
              hour: '2-digit', minute: '2-digit', hour12: false 
            })}
          </span>
        )
      },
      { 
        key: 'receiver_id', 
        header: 'Penerima', 
        render: (item) => <span className="text-gray-900 font-medium">{item.receiver?.full_name || '-'}</span>
      },
      { 
        key: 'petugas', 
        header: 'Petugas',
        render: (item) => <span className="text-gray-900 font-medium">{item.user.full_name}</span>
      }
    ];

    return (
      <div className="flex min-h-screen bg-[#FDFDFD]">
        <Sidebar role="Petugas" />
        <main className="flex-1 p-12">
          <header className="mb-12">
            <h1 className="text-5xl font-bold text-gray-900 tracking-tight">Riwayat Penyerahan</h1>
            <p className="text-gray-400 mt-3 text-lg">Manajemen laporan kehilangan dan temuan barang di lingkungan IPB.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            <Card className="p-10 hover:-translate-y-1">
              <div style={{ fontFamily: "'Roboto', sans-serif" }}>
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                    <FiBox size={28} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 tracking-wide">Total Penyerahan</p>
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-6xl font-bold text-gray-900" style={{ fontFamily: "'Montserrat', sans-serif" }}>{stats.total_handover}</p>
                  <p className="text-sm text-gray-400 mt-2">Kumulatif Semester Ini</p>
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
                    <p className="text-xs text-gray-400 tracking-wide">Penyelesaian Hari Ini</p>
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-6xl font-bold text-gray-900" style={{ fontFamily: "'Montserrat', sans-serif" }}>{stats.today_handover}</p>
                  <p className="text-sm text-gray-400 mt-2">+{stats.today_handover} dari Kemarin</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="shadow-sm border-none ring-1 ring-gray-100 overflow-hidden">
            <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-white relative">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Riwayat Penyerahan</h2>
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
                    {filters.time.length > 0 && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white translate-x-1/3 -translate-y-1/3"></span>
                    )}
                  </button>
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-lg z-[100] p-5 flex flex-col max-h-96">
                      <h3 className="text-sm font-bold text-gray-900 mb-4 flex-none">Filter Riwayat</h3>
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
              data={filteredHistory} 
              loading={loading}
              emptyMessage="Belum ada riwayat penyerahan."
            />

            <div className="p-10 bg-white border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400 font-bold tracking-wide">
                Menampilkan {filteredHistory.length} dari {history.length} entri
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

export default HandoverHistory;
