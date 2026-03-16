"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { Search, Menu, Zap, CloudSun, X } from 'lucide-react';
import { SearchBar } from '../navigation/SearchBar';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // NOVO: Controle da busca
  
  const categories = [
    { name: 'Espírito Santo', slug: 'espírito-santo' },
    { name: 'Polícia', slug: 'policia' },
    { name: 'Saúde', slug: 'saúde' },
    { name: 'política', slug: 'politíca' },
    { name: 'Esportes', slug: 'esportes' },
    { name: 'Geral', slug: 'geral' }
  ];

  return (
    <>
      <header className="w-full bg-[#eaf5f1] border-b border-[#cbdad5] sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="flex flex-row items-center justify-between py-4 lg:py-2 gap-2">
            
            {/* LADO ESQUERDO: Logo Secundária (Desktop) */}
            <div className="flex-1 hidden lg:flex items-center justify-start">
              <div className="relative w-56 h-20 md:w-96 md:h-32 shrink-0">
                <Image 
                  src="/logor.png" 
                  alt="Destaque Rede Barcos"
                  fill
                  className="object-contain object-left scale-110"
                  priority
                />
              </div>
            </div>

            {/* LOGO CENTRAL */}
            <Link href="/" className="flex flex-row items-center group shrink-0 max-w-[80%] sm:max-w-none">
              <div className="flex flex-col items-end shrink">
                <div className="relative">
                  <h1 className="text-[#003d73] font-sans text-[15px] xs:text-[18px] md:text-[45px] font-[1000] uppercase italic tracking-tighter leading-none whitespace-nowrap">
                    PORTAL DA <span className="text-transparent bg-clip-text bg-linear-to-r from-[#003d73] to-[#005bb5]">REDE BARCOS</span>
                  </h1>
                  <span className="absolute -bottom-1 right-0 w-0 h-0.5 md:h-0.75 bg-[#d4af37] transition-all duration-300 group-hover:w-full"></span>
                </div>
                
                <div className="flex items-center gap-1 mt-1 bg-white/40 px-2 py-0.5 rounded-full border border-[#003d73]/10 self-end">
                  <Zap className="w-2 md:w-3 h-2 md:h-3 text-[#d4af37] fill-[#d4af37]" />
                  <p className="text-[#003d73] text-[6px] md:text-[9px] font-black uppercase tracking-widest">Jornalismo com responsabilidade</p>
                </div>
              </div>

              <div className="relative w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 ml-1 md:-ml-1 transition-all duration-500 group-hover:scale-110 shrink-0">
                 <Image 
                   src="/logor.png" 
                   alt="Logo Barco"
                   fill
                   className="object-contain"
                 />
              </div>
            </Link>

            {/* LADO DIREITO */}
            <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4">
              <div className="hidden lg:flex items-center gap-6">
                
                {/* BOTÃO DE BUSCA ATUALIZADO (DESKTOP) */}
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="group flex items-center gap-2 bg-white border border-[#cbdad5] rounded-full px-4 py-1.5 hover:border-[#d4af37] transition-all shadow-sm"
                >
                  <Search className="w-4 h-4 text-[#003d73]/60 group-hover:text-[#d4af37]" />
                  <span className="text-xs font-bold text-[#003d73]/40 uppercase tracking-widest">Buscar...</span>
                </button>

                <div className="flex items-center gap-3 border-l border-[#cbdad5] pl-6">
                  <div className="leading-tight text-right">
                    <span className="text-[9px] font-bold text-[#003d73]/60 uppercase block tracking-wider">Conceição da Barra</span>
                    <span className="text-base font-black text-[#003d73]">28°C</span>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg shadow-sm">
                    <CloudSun className="w-5 h-5 text-[#d4af37]" />
                  </div>
                </div>
              </div>

              {/* LUPA MOBILE */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="lg:hidden p-2.5 bg-white text-[#003d73] rounded-xl shadow-md active:scale-95 transition-all border border-[#cbdad5]"
              >
                <Search className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden flex items-center gap-1.5 bg-[#003d73] text-white px-3 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all"
              >
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                <span className="hidden xs:inline">Menu</span>
              </button>
            </div>
          </div>

          {/* Categorias */}
          <nav className={`${isMenuOpen ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-4 pb-6 lg:pb-3`}>
            {categories.map((cat) => (
              <Link 
                key={cat.slug} 
                href={`/categoria/${cat.slug}`} 
                className="w-full lg:w-auto text-center bg-white/60 lg:bg-white/40 hover:bg-[#003d73] hover:text-white px-4 py-2.5 lg:py-1.5 rounded-lg text-[11px] lg:text-[10px] font-black uppercase tracking-widest text-[#003d73] transition-all border border-[#003d73]/5 lg:border-transparent"
                onClick={() => setIsMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* COMPONENTE DE BUSCA (Abre como um modal por cima de tudo) */}
      <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}