"use client"

import { useState, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';


export function SearchBar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);

  const normalizarTexto = (valor: string) =>
    (valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const queryLimpa = query.trim();
  const podeBuscar = queryLimpa.length >= 3;

  // Busca em tempo real no Supabase
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!podeBuscar) {
        setBuscando(false);
        setResultados([]);
        return;
      }

      setBuscando(true);
      const termoBuscaNormalizado = normalizarTexto(queryLimpa);

      const { data, error } = await supabase
        .from("noticias")
        .select("id, titulo, subtitulo, categoria")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        setResultados([]);
      } else {
        const filtrados = (data || []).filter((noticia) => {
          const titulo = normalizarTexto(noticia.titulo || "");
          const subtitulo = normalizarTexto(noticia.subtitulo || "");
          const categoria = normalizarTexto(noticia.categoria || "");

          return (
            titulo.includes(termoBuscaNormalizado) ||
            subtitulo.includes(termoBuscaNormalizado) ||
            categoria.includes(termoBuscaNormalizado)
          );
        });

        setResultados(filtrados);
      }

      setBuscando(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [podeBuscar, queryLimpa]);

  useEffect(() => {
    if (!isOpen) {
      setResultados([]);
      setBuscando(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-white dark:bg-slate-950 p-4 md:p-12 animate-in fade-in zoom-in duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Header da Busca */}
        <div className="flex justify-between items-center mb-12">
          <span className="font-black uppercase text-xs tracking-widest text-blue-600">Busca Rede Barcos</span>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Input de Busca */}
        <div className="relative mb-12">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-300" />
          <input
            autoFocus
            type="text"
            placeholder="O que você está procurando?"
            className="w-full bg-transparent border-b-2 border-slate-100 py-6 pl-12 text-3xl md:text-5xl font-serif outline-none focus:border-blue-600 transition-colors"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Resultados */}
        <div className="grid gap-8 overflow-y-auto max-h-[60vh] pr-4">
          {buscando && (
            <div className="text-center py-10">
              <p className="text-slate-400 font-serif italic text-xl">
                Buscando...
              </p>
            </div>
          )}

          {resultados.map((noticia) => (
            <Link 
              key={noticia.id} 
              href={`/noticia/${noticia.id}`}
              onClick={() => {
                setQuery(""); // Limpa a busca ao clicar
                onClose();
              }}
              className="group flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-6 hover:bg-slate-50/50 transition-all p-4 rounded-xl"
            >
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 mb-2 block tracking-[0.2em]">
                  {noticia.categoria}
                </span>
                <h3 className="text-xl md:text-2xl font-serif font-bold group-hover:text-blue-600 transition-colors leading-tight text-slate-900 dark:text-white">
                  {noticia.titulo}
                </h3>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
            </Link>
          ))}

          {queryLimpa.length > 0 && !podeBuscar && (
            <div className="text-center py-10">
              <p className="text-slate-400 font-serif italic text-xl">
                Digite pelo menos 3 caracteres para buscar.
              </p>
            </div>
          )}

          {podeBuscar && !buscando && resultados.length === 0 && (
            <div className="text-center py-10">
              <p className="text-slate-400 font-serif italic text-xl">
                Nenhum resultado encontrado para "{queryLimpa}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}