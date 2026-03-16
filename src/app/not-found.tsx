import Link from 'next/link';
import { Anchor } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <Anchor className="w-20 h-20 text-[#d4af37] mb-6 animate-bounce" />
      <h1 className="text-[#003d73] font-sans text-6xl md:text-9xl font-[1000] italic">404</h1>
      <h2 className="text-[#003d73] text-xl md:text-3xl font-black uppercase mt-4">Navegação Perdida</h2>
      <p className="text-slate-500 font-serif italic mt-4 max-w-md">
        Parece que esta notícia afundou ou mudou de rota. O Portal da Rede Barcos te ajuda a voltar ao porto seguro.
      </p>
      <Link href="/" className="mt-10 bg-[#003d73] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#d4af37] transition-all shadow-xl">
        Voltar para a Capa
      </Link>
    </div>
  );
}