"use client"

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";

interface Noticia {
  id: string; // Adicionei o ID aqui
  titulo: string;
  categoria: string;
  autor?: string;
  created_at: string;
  imagem_url?: string;
  legenda_imagem?: string;
  conteudo: string;
}

export default function NoticiaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarNoticia() {
      setCarregando(true);

      // Primeiro tenta buscar pelo ID (caso mais comum, pois slug não é gerado ainda)
      let { data, error } = await supabase
        .from("noticias")
        .select("*")
        .eq("id", slug)
        .maybeSingle();

      // Se não encontrou pelo ID, tenta pelo slug (para quando slug for implementado)
      if (!data && !error) {
        const resultado = await supabase
          .from("noticias")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        data = resultado.data;
        error = resultado.error;
      }

      if (!error && data) {
        setNoticia(data);
      } else {
        setNoticia(null);
      }
      
      setCarregando(false);
    }

    if (slug) {
      carregarNoticia();
    }
  }, [slug]);

  if (carregando) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-(family-name:--font-inter) italic text-slate-400">Abrindo notícia...</p>
      </div>
    </div>
  );

  if (!noticia) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <h1 className="font-(family-name:--font-inter) text-2xl text-slate-800 font-bold">Notícia não encontrada.</h1>
      <Link href="/" className="text-blue-600 hover:underline font-medium">
        Voltar para o início
      </Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-white pb-20 font-(family-name:--font-inter)">
      <article className="max-w-4xl mx-auto px-4 pt-12">
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 mb-8 text-xs font-bold uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> 
          Voltar para a Home
        </Link>

        <header className="mb-8">
          <span className="text-blue-600 font-black uppercase tracking-widest text-[10px] px-2 py-1 bg-blue-50 rounded">
            {noticia.categoria}
          </span>
          <h1 className="text-3xl md:text-5xl font-black leading-tight text-slate-900 mt-6 mb-6 tracking-tight">
            {noticia.titulo.replace(/<[^>]*>?/gm, '')} {/* Limpando tags do título se houver */}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm border-y border-slate-100 py-4 font-bold uppercase text-[11px]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Por <strong className="text-slate-900">{noticia.autor || "Redação"}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(noticia.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </header>

        {noticia.imagem_url && (
          <div className="mb-10">
            <div className="relative aspect-video w-full overflow-hidden rounded-sm bg-slate-100 shadow-sm">
              <Image 
                src={noticia.imagem_url} 
                alt={noticia.titulo}
                fill
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
                priority
                unoptimized
              />
            </div>
            {noticia.legenda_imagem && (
              <p className="mt-2 text-xs text-slate-500 leading-tight">
                {noticia.legenda_imagem}
              </p>
            )}
          </div>
        )}

        {/* MUDANÇA AQUI: Renderizando o HTML do editor de texto com segurança */}
        <div 
          className="prose prose-slate prose-lg max-w-none font-(family-name:--font-playfair) leading-relaxed text-slate-800
                     prose-p:mb-6 prose-p:leading-relaxed
                     prose-strong:text-slate-900
                     prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: noticia.conteudo }}
        />

      </article>
    </main>
  );
}