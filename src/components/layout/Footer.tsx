// src/components/layout/Footer.tsx
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const editorias = ['Cidades', 'Politica', 'Brasil', 'Esportes', 'Economia'];

  return (
    <footer className="bg-[#001a33] text-white pt-20 pb-10 border-t-4 border-[#d4af37]">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Coluna 1: Sobre */}
        <div className="col-span-1 md:col-span-1">
          <h3 className="font-sans font-[1000] italic text-2xl uppercase tracking-tighter mb-6 text-[#d4af37]">
            REDE BARCOS
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed font-serif italic border-l-2 border-[#d4af37]/30 pl-4">
            O maior portal de notícias do norte capixaba. Compromisso com a verdade, agilidade e a comunidade de Conceição da Barra.
          </p>
        </div>

        {/* Coluna 2: Editorias */}
        <div>
          <h4 className="font-black uppercase text-[10px] tracking-widest text-[#d4af37] mb-8">
            Editorias
          </h4>
          <ul className="flex flex-col gap-3">
            {editorias.map((item) => (
              <li key={item}>
                <Link 
                  href={`/categoria/${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`} 
                  className="group flex items-center gap-0 hover:gap-3 text-sm font-bold uppercase text-slate-300 hover:text-white transition-all duration-300"
                >
                  <span className="w-0 h-0.5 bg-[#d4af37] transition-all duration-300 group-hover:w-6 shadow-[0_0_8px_#d4af37]"></span>
                  <span>{item}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna 3: Contato */}
        <div>
          <h4 className="font-black uppercase text-[10px] tracking-widest text-[#d4af37] mb-8">
            Contato
          </h4>
          <ul className="space-y-4 text-sm text-slate-300">
            {[
              { icon: Mail, label: 'redebarcos.com.br' },
              { icon: Phone, label: '(27) 99976-9805' },
              { icon: MapPin, label: 'Conceição da Barra, ES' }
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 group cursor-pointer">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#d4af37] group-hover:text-[#001a33] group-hover:rotate-360 transition-all duration-500">
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="group-hover:text-white transition-colors">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna 4: Redes Sociais */}
        <div>
          <h4 className="font-black uppercase text-[10px] tracking-widest text-[#d4af37] mb-8">
            Siga-nos
          </h4>
          <div className="flex gap-4">
            {[
              { icon: Facebook, url: 'https://www.facebook.com/redebarcos' },
              { icon: Instagram, url: 'https://www.instagram.com/redebarcos98.5?igsh=M3lwdjlicXpya3Vx' },
              { icon: Youtube, url: 'https://www.youtube.com/@canalbarcostv' }
            ].map((social, idx) => (
              <Link 
                key={idx} 
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/5 border border-white/10 rounded-xl text-[#d4af37] hover:bg-[#d4af37] hover:text-[#001a33] hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(212,175,55,0.2)] transition-all duration-300"
              >
                <social.icon className="w-5 h-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Rodapé Final */}
      <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        <p>© 2026 Portal da Rede Barcos. Excelência em Informação.</p>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-[#d4af37] transition-colors">Privacidade</Link>
          <Link href="#" className="hover:text-[#d4af37] transition-colors">Anuncie</Link>
        </div>
      </div>
    </footer>
  );
}