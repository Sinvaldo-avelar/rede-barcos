"use client"

import { use, useEffect, useState } from "react";
import NewsGrid from "@/components/news/NewsGrid";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// Interface para manter a consistência e o TypeScript feliz
interface Noticia {
  id: string;
  titulo: string;
  categoria: string;
  imagem_url?: string;
  created_at: string;
  slug: string;
}

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  // Desembrulhando os parâmetros da Promise (Padrão Next.js 15)
  const resolvedParams = use(params);
  const categoryParam = resolvedParams.category;

  const [noticiasFiltradas, setNoticiasFiltradas] = useState<Noticia[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Nome da categoria formatado para exibição (Ex: esportes -> Esportes)
  const nomeExibicao = decodeURIComponent(categoryParam);

  useEffect(() => {
    async function carregarPorCategoria() {
      setCarregando(true);
      
      // Decodifica acentos e espaços da URL para bater com o banco
      const categoriaFormatada = decodeURIComponent(categoryParam);

      // Busca no Supabase
      const { data, error } = await supabase
        .from("noticias")
        .select("*")
        .ilike("categoria", categoriaFormatada) // ilike ignora maiúsculas/minúsculas
        .order("created_at", { ascending: false });

      if (!error && data) {
        setNoticiasFiltradas(data as Noticia[]);
      } else {
        setNoticiasFiltradas([]);
      }
      
      setCarregando(false);
    }

    if (categoryParam) {
      carregarPorCategoria();
    }
  }, [categoryParam]);

  return (
    <main className="min-h-screen bg-white pt-12 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Botão Voltar */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 mb-6 text-xs font-bold uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> 
          Voltar para a Capa
        </Link>

        {/* Cabeçalho de Categoria Estilo Jornal */}
        <header className="mb-12 border-b-4 border-black pb-6">
          <h1 className="text-5xl md:text-7xl font-serif font-black uppercase italic tracking-tighter text-slate-900">
            {nomeExibicao}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Mostrando as últimas notícias em <span className="text-black capitalize">{nomeExibicao}</span>
          </p>
        </header>

        {carregando ? (
          /* Estado de Loading mais caprichado */
          <div className="py-20 text-center flex flex-col items-center gap-4">
             <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
             <p className="font-serif italic text-slate-400 text-xl animate-pulse">
               Buscando notícias...
             </p>
          </div>
        ) : noticiasFiltradas.length > 0 ? (
          /* Grid de Notícias */
          <NewsGrid noticias={noticiasFiltradas} />
        ) : (
          /* Estado Vazio */
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
            <p className="text-slate-400 font-serif italic text-xl">
              Nenhuma notícia publicada em "{nomeExibicao}" no momento.
            </p>
            <Link href="/" className="inline-block mt-4 text-blue-600 hover:underline font-medium">
              Ver outras notícias
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}