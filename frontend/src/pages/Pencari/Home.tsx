import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <Navbar />
      
      <main className="flex-1 px-8 py-12 max-w-7xl mx-auto w-full flex flex-col items-center justify-center">
        <div className="text-center mb-16 mt-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">Sistem Pelaporan <span className="text-primary">Barang Hilang</span></h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Platform terpusat untuk melaporkan dan mencari barang hilang di lingkungan kampus IPB University.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
          <Card className="p-8 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-6 text-2xl font-bold">
              !
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800">Kehilangan Barang?</h2>
            <p className="text-gray-500 mb-8 flex-1">Laporkan barang Anda yang hilang agar civitas akademik lain dan petugas dapat membantu mencarikannya.</p>
            <Link to="/report-lost" className="w-full">
              <Button className="w-full py-3">Buat Laporan Kehilangan</Button>
            </Link>
          </Card>

          <Card className="p-8 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 text-2xl font-bold">
              ?
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800">Mencari Barang?</h2>
            <p className="text-gray-500 mb-8 flex-1">Lihat daftar barang hilang yang dilaporkan atau temukan barang Anda di inventaris petugas.</p>
            <Link to="/lost-items" className="w-full">
              <Button variant="outline" className="w-full py-3">Lihat Daftar Kehilangan</Button>
            </Link>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
