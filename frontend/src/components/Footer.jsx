import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.png';

const Footer = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      window._Hasync = window._Hasync || [];
      window._Hasync.push(['Histats.start', '1,5058854,4,2051,280,25,00001010']);
      window._Hasync.push(['Histats.fasi', '1']);
      window._Hasync.push(['Histats.track_hits', '']);
      window._Hasync.push(['Histats.framed_page', '']);

      const hs = document.createElement('script');
      hs.type = 'text/javascript';
      hs.async = true;
      hs.src = '//s10.histats.com/js15_as.js';
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);
    } catch (e) {
      console.error('Histats error:', e);
    }
  }, []);

  const navButtonClass = "px-4 py-1.5 rounded-xl border border-purple-600/50 bg-purple-950/40 text-purple-200 hover:text-white hover:border-purple-400 hover:bg-purple-900/50 transition-all font-semibold text-xs uppercase tracking-wider shadow-sm";

  return (
    <footer className="bg-gray-900 pb-20 dark:bg-primary-950 text-gray-300 dark:text-gray-400 border-t border-gray-800 dark:border-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={Logo} 
              alt="NesiaNovel" 
              className="w-36 md:w-44 h-auto cursor-pointer" 
              onClick={() => navigate('/')}
            />
          </div>

          {/* Links with Purple Border */}
          <div className="flex flex-wrap justify-center gap-2.5 text-sm">
            <button
              onClick={() => navigate('/')}
              className={navButtonClass}
            >
              HOME
            </button>
            <button
              onClick={() => navigate('/novels')}
              className={navButtonClass}
            >
              DAFTAR NOVEL
            </button>
            <button
              onClick={() => navigate('/library')}
              className={navButtonClass}
            >
              LIBRARY
            </button>
            <button
              onClick={() => navigate('/contact')}
              className={navButtonClass}
            >
              KONTAK KAMI
            </button>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-300 dark:text-gray-300">
              Copyright ©2026 NesiaNovel, All Rights Reserved.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="text-center max-w-3xl">
            <p className="text-xs leading-relaxed text-gray-400 dark:text-gray-500">
              Semua novel di website ini hanya preview dari novel aslinya, mungkin terdapat banyak kesalahan bahasa, nama tokoh, dan alur cerita. Untuk versi aslinya, silahkan beli novelnya jika tersedia di kotamu.
            </p>
          </div>

          {/* Histats.com (div with counter) */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div id="histats_counter"></div>
            <noscript>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <img src="//sstatic1.histats.com/0.gif?5058854&101" alt="Histats Counter" border="0" />
              </a>
            </noscript>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
















