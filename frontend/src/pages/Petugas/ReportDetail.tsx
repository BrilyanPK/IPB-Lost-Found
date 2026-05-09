import { Component } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { withRouter } from '../../utils/withRouter';
import type { WithRouterProps } from '../../utils/withRouter';
import api from '../../api/axios';

interface Report {
  id: string;
  type: string;
  status: string;
  location: string;
  description: string;
  report_time: string;
  item: {
    name: string;
    photo_url?: string;
  };
  user: {
    full_name: string;
    email: string;
  };
}

interface ReportDetailState {
  report: Report | null;
  loading: boolean;
  updating: boolean;
}

class ReportDetailComponent extends Component<WithRouterProps, ReportDetailState> {
  constructor(props: WithRouterProps) {
    super(props);
    this.state = {
      report: null,
      loading: true,
      updating: false
    };
  }

  componentDidMount() {
    this.fetchReport();
  }

  fetchReport = async () => {
    const { params } = this.props;
    try {
      const res = await api.get('/petugas/laporan');
      const report = res.data.find((r: Report) => r.id === params.id);
      this.setState({ report, loading: false });
    } catch (err) {
      console.error('Error fetching report:', err);
      this.setState({ loading: false });
    }
  };

  updateStatus = async (newStatus: string) => {
    const { report } = this.state;
    this.setState({ updating: true });
    try {
      await api.patch(`/petugas/laporan/${report.id}/status`, { status: newStatus });
      alert('Status berhasil diperbarui!');
      this.fetchReport();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Gagal memperbarui status');
    } finally {
      this.setState({ updating: false });
    }
  };

  render() {
    const { report, loading, updating } = this.state;
    const { navigate } = this.props;

    if (loading) return <div className="p-10 text-center">Memuat...</div>;
    if (!report) return <div className="p-10 text-center text-red-600 font-bold">Laporan tidak ditemukan!</div>;

    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <Sidebar role="Petugas" />
        <main className="flex-1 p-10">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 font-bold hover:text-gray-900 mb-8 transition-colors"
          >
            <span className="mr-2">←</span> Detail Laporan
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-8">
              <Card className="overflow-hidden p-0 border-none shadow-2xl shadow-blue-500/5">
                <img 
                  src={report.item.photo_url || 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=1000'} 
                  alt={report.item.name}
                  className="w-full aspect-[4/3] object-cover"
                />
              </Card>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex gap-3 mb-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                    report.type === 'Kehilangan' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {report.type}
                  </span>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                    report.status === 'Dikembalikan' ? 'bg-emerald-50 text-emerald-600' : 
                    report.status === 'Ditemukan' ? 'bg-blue-50 text-blue-600' :
                    report.status === 'Diproses' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-4">{report.item.name}</h1>
                <div className="flex items-center gap-2 text-gray-500 font-semibold mb-8">
                  <span>📍 {report.location}</span>
                  <span>•</span>
                  <span>🕒 {new Date(report.report_time).toLocaleDateString('id-ID')}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Deskripsi Barang</h3>
                <p className="text-xl text-gray-700 leading-relaxed font-medium">
                  {report.description}
                </p>
              </div>

              <Card className="p-8 border-none ring-1 ring-gray-100 bg-gray-50/50">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Aksi Petugas</h3>
                <div className="flex flex-wrap gap-4">
                  {report.status !== 'Dikembalikan' && (
                    <>
                      <Button 
                        onClick={() => this.updateStatus('Diproses')}
                        disabled={updating || report.status === 'Diproses'}
                        variant="outline"
                        className="flex-1 py-4 border-2 border-amber-200 text-amber-700 hover:bg-amber-50"
                      >
                        Tandai Diproses
                      </Button>
                      <Button 
                        onClick={() => this.updateStatus('Dikembalikan')}
                        disabled={updating}
                        className="flex-1 py-4 shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700"
                      >
                        Selesai / Diserahkan
                      </Button>
                    </>
                  )}
                  {report.status === 'Dikembalikan' && (
                    <div className="w-full p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                      <span className="text-2xl">✅</span>
                      <p className="text-emerald-800 font-bold">Laporan ini telah diselesaikan.</p>
                    </div>
                  )}
                </div>
              </Card>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Informasi Pelapor</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                    {report.user.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{report.user.full_name}</p>
                    <p className="text-sm text-gray-500 font-medium">{report.user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default withRouter(ReportDetailComponent);
