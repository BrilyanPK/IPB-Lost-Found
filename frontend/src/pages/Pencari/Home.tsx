import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import HeroBg from '../../assets/Hero Bg.png';

const Home = () => {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen overflow-hidden">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        {/* Hero Section */}
        <section
          className="relative w-full bg-cover bg-center pt-24 pb-104 px-6 flex flex-col items-center min-h-[85vh] justify-start"
          style={{ backgroundImage: `url('${HeroBg}')` }}
        >
          <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10 mt-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 tracking-tight leading-tight">
              <span className="font-medium text-[#3B5B92]">Platform Bantuan</span> <span className="font-bold text-[#203D7C]">Kehilangan &</span> <br className="hidden md:block" />
              <span className="font-bold text-[#203D7C]">Penemuan</span> <span className="font-medium text-[#3B5B92]">Barang IPB</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
              Platform terintegrasi untuk melaporkan barang hilang dan menemukan pemiliknya dengan lebih mudah, aman, dan transparan.
            </p>
          </div>
        </section>


      </main>

      <Footer />
    </div>
  );
};

export default Home;
