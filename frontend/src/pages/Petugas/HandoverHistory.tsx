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

interface HistoryState {
  reports: ReportItem[];
  loading: boolean;
  totalHistory: number;
}

class HandoverHistory extends Component<Record<string, never>, HistoryState> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      reports: [],
      loading: true,
      totalHistory: 0
    };
  }

  componentDidMount() {
    this.fetchReports();
  }

  fetchReports = async () => {
    try {
      const res = await api.get('/petugas/riwayat');
      this.setState({ 
        reports: res.data, 
        totalHistory: res.data.length,
        loading: false 
      });
    } catch (err) {
      console.error(err);
      this.setState({ loading: false });
    }
  };

  render() {
    const { reports, loading, totalHistory } = this.state;

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
      { 
        key: 'category', 
        header: 'Tipe Barang',
        render: (report) => <span className="text-gray-600">{report.item.category}</span>
      },
      { 
        key: 'user', 
        header: 'Penerima',
        render: (report) => <span className="text-gray-800 font-medium">{report.user.full_name}</span>
      },
      { 
        key: 'status', 
        header: 'Status',
        render: () => (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
            Selesai / Diserahkan
          </span>
        )
      }
    ];

    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <Sidebar role="Petugas" />
        <main className="flex-1 p-10">
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Riwayat Penyerahan</h1>
            <p className="text-gray-500 mt-2">Daftar laporan yang telah selesai diproses dan barang telah diserahkan.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <Card className="p-6 border-none ring-1 ring-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 text-xl font-bold">H</div>
              <div>
                <p className="text-2xl font-black text-gray-900">{totalHistory}</p>
                <p className="text-xs text-gray-500 font-semibold uppercase">Total Penyerahan</p>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden shadow-sm">
            <Table 
              columns={columns} 
              data={reports} 
              loading={loading}
              emptyMessage="Belum ada riwayat penyerahan."
            />
          </Card>
        </main>
      </div>
    );
  }
}

export default HandoverHistory;
