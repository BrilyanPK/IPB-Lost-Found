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
  receiver_name?: string;
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
      }
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

  render() {
    const { history, loading, stats } = this.state;

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
        key: 'receiver_name', 
        header: 'Penerima',
        render: (item) => <span className="text-gray-900 font-medium">{item.receiver_name || '-'}</span>
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
            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Riwayat Penyerahan</h1>
            <p className="text-gray-400 mt-3 text-lg">Manajemen laporan kehilangan dan temuan barang di lingkungan IPB.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            <Card className="p-10 hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                  <FiBox size={28} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Penyerahan</p>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-6xl font-black text-gray-900">{stats.total_handover.toString().padStart(4, '0')}</p>
                <p className="text-sm text-gray-400 font-bold mt-2">Kumulatif Semester Ini</p>
              </div>
            </Card>

            <Card className="p-10 hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                  <FiCheckCircle size={28} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Penyelesaian Hari Ini</p>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-6xl font-black text-gray-900">{stats.today_handover.toString().padStart(2, '0')}</p>
                <p className="text-sm text-gray-400 font-bold mt-2">+{stats.today_handover} dari Kemarin</p>
              </div>
            </Card>
          </div>

          <Card className="shadow-sm border-none ring-1 ring-gray-100 overflow-hidden">
            <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Riwayat Penyerahan</h2>
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
              data={history} 
              loading={loading}
              emptyMessage="Belum ada riwayat penyerahan."
            />

            <div className="p-10 bg-white border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                Menampilkan {history.length} dari {history.length} entri
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
