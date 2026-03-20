"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { Search, Menu, Zap, CloudSun, X } from 'lucide-react';
import { SearchBar } from '../navigation/SearchBar';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [temperature, setTemperature] = useState<string>('...');

  useEffect(() => {
    let isMounted = true;

    const fetchTemperature = async () => {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=-18.5933&longitude=-39.7322&current=temperature_2m&timezone=America%2FSao_Paulo'
        );

        if (!response.ok) {
          throw new Error('Falha ao buscar temperatura');
        }

        const data = await response.json();
        const currentTemperature = data?.current?.temperature_2m;

        if (isMounted && typeof currentTemperature === 'number') {
          setTemperature(`${Math.round(currentTemperature)}°C`);
        }
      } catch {
        if (isMounted) {
          setTemperature('--°C');
        }
      }
    };

    fetchTemperature();
    const interval = setInterval(fetchTemperature, 60_000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);
  
  const categories = [
    { name: 'Espírito Santo', slug: 'espirito-santo' },
    { name: 'Geral', slug: 'geral' },
    { name: 'Política', slug: 'politica' },
    { name: 'Brasil', slug: 'Brasil' },
    { name: 'Polícia', slug: 'policia' },
    { name: 'Esportes', slug: 'esportes' },
  ];

  return (
    <>
      <header className="w-full bg-[#eaf5f1]/95 backdrop-blur border-b border-[#cbdad5] sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          
          <div className="relative flex flex-row items-center justify-between py-3 lg:py-3 gap-2">
            
            {/* LOGO ESQUERDA */}
            <div className="flex-1 hidden lg:flex items-center justify-start">
              <div className="relative w-40 h-16 md:w-64 md:h-20 shrink-0">
                <Image 
                  src="/logor.png" 
                  alt="Destaque Rede Barcos"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </div>

            {/* MENU MOBILE (ESQUERDA) */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden flex items-center gap-2 bg-[#003d73] text-white px-3 py-2 rounded-xl text-[10px] font-black shadow-md active:scale-95 transition-all"
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span className="hidden xs:inline">Menu</span>
            </button>

            {/* LOGO CENTRAL */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex flex-row items-center justify-center group w-max max-w-[calc(100%-100px)] xs:max-w-[calc(100%-90px)] sm:max-w-[calc(100%-80px)] lg:static lg:left-auto lg:translate-x-0 lg:max-w-none lg:w-auto lg:shrink-0">
              <div className="flex flex-col items-center md:items-end shrink">
                <div className="relative">
                  <h1 className="text-[#003d73] font-sans text-[14px] xs:text-[16px] sm:text-[20px] md:text-[38px] lg:text-[44px] xl:text-[48px] font-[1000] uppercase italic tracking-tighter leading-none whitespace-nowrap">
                    PORTAL DA <span className="text-transparent bg-clip-text bg-linear-to-r from-[#003d73] to-[#005bb5]">REDE BARCOS</span>
                  </h1>

                  <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-[#d4af37] transition-all duration-300 group-hover:w-full"></span>
                </div>
                
                <div className="flex items-center gap-1 mt-1 bg-white/40 px-2 py-0.5 rounded-full border border-[#003d73]/10 self-center md:self-end">
                  <Zap className="w-2 md:w-3 h-2 md:h-3 text-[#d4af37] fill-[#d4af37]" />
                  <p className="text-[#003d73] text-[6px] md:text-[8px] lg:text-[10px] xl:text-[11px] font-black uppercase tracking-widest">
                    Jornalismo com responsabilidade
                  </p>
                </div>
              </div>

              <div className="relative w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 ml-1 transition-all duration-500 group-hover:scale-110 shrink-0">
                 <Image 
                   src="/logor.png" 
                   alt="Logo Barco"
                   fill
                   className="object-contain"
                 />
              </div>
            </Link>

            {/* LADO DIREITO */}
            <div className="relative z-10 ml-auto flex justify-end items-center gap-2 sm:gap-4 lg:flex-1">

              <div className="hidden lg:flex items-center gap-4">
                
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="group flex items-center gap-2 bg-white border border-[#cbdad5] rounded-full px-3 py-1 hover:border-[#d4af37] transition-all shadow-sm"
                >
                  <Search className="w-4 h-4 text-[#003d73]/60 group-hover:text-[#d4af37]" />
                  <span className="text-xs font-bold text-[#003d73]/40 uppercase tracking-widest">
                    Buscar...
                  </span>
                </button>

                <div className="flex items-center gap-2 border-l border-[#cbdad5] pl-4">
                  <div className="leading-tight text-right">
                    <span className="text-[9px] font-bold text-[#003d73]/60 uppercase block tracking-wider">
                      Conceição da Barra
                    </span>
                    <span className="text-sm font-black text-[#003d73]">
                      {temperature}
                    </span>
                  </div>

                  <div className="bg-white p-1.5 rounded-lg shadow-sm">
                    <CloudSun className="w-4 h-4 text-[#d4af37]" />
                  </div>
                </div>
              </div>

              {/* BUSCA MOBILE (DIREITA) */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="lg:hidden p-2 bg-white text-[#003d73] rounded-xl shadow-md active:scale-95 transition-all border border-[#cbdad5]"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MENU DE CATEGORIAS */}
          <nav className={`${isMenuOpen ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-3 pb-4 lg:pb-2 mt-2`}>
            {categories.map((cat) => (
              <Link 
                key={cat.slug} 
                href={`/categoria/${cat.slug}`} 
                className="w-full lg:w-auto text-center bg-white/60 lg:bg-white/40 hover:bg-[#003d73] hover:text-white px-4 py-2.5 lg:py-1 rounded-lg text-[12px] sm:text-[11px] font-black tracking-wide text-[#003d73] transition-all border border-[#003d73]/5 lg:border-transparent"
                onClick={() => setIsMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </nav>

        </div>
      </header>

      <SearchBar 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}