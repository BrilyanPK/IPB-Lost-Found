import React from 'react';
import { Link } from 'react-router-dom';

// Object Oriented Data Models
class FooterLinkItem {
  label: string;
  url: string;
  constructor(label: string, url: string) {
    this.label = label;
    this.url = url;
  }
}

class FooterLinkColumn {
  links: FooterLinkItem[];
  constructor(links: FooterLinkItem[]) {
    this.links = links;
  }
}

export class Footer extends React.Component {
  private linkColumns: FooterLinkColumn[] = [
    new FooterLinkColumn([
      new FooterLinkItem('Beranda', '/home'),
      new FooterLinkItem('Laporanku', '/my-reports'),
    ]),
    new FooterLinkColumn([
      new FooterLinkItem('Buat Laporan', '/report-lost'),
    ]),
    new FooterLinkColumn([
      new FooterLinkItem('Daftar Kehilangan', '/lost-items'),
    ]),
  ];

  render() {
    return (
      <footer className="bg-[#1A2E51] text-white pt-16 pb-8 px-8 md:px-16 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
            
            {/* Left Section: Logo & Description */}
            <div className="max-w-md">
              <img 
                src="/assets/logo-balikin vertikal (light).png" 
                alt="Balikin Logo" 
                className="h-16 mb-6" 
              />
              <p className="text-gray-200 text-lg leading-relaxed font-light">
                Laporkan barang hilang, temukan barang tercecer, dan bantu ciptakan budaya kampus yang saling peduli dan aman.
              </p>
            </div>

            {/* Right Section: Links */}
            <div className="flex-1 md:ml-12 lg:ml-32">
              <h3 className="text-2xl font-bold mb-8">Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {this.linkColumns.map((col, index) => (
                  <div key={index} className="flex flex-col gap-6">
                    {col.links.map((link, idx) => (
                      <Link 
                        key={idx} 
                        to={link.url} 
                        className="text-gray-200 hover:text-white transition-colors text-base"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Divider & Copyright */}
          <div className="border-t border-gray-400/30 pt-8 mt-4">
            <p className="text-gray-300 text-sm">
              © Copyright 2026, All Rights Reserved by Balikin
            </p>
          </div>
        </div>
      </footer>
    );
  }
}
