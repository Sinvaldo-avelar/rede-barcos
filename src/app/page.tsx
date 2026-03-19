"use client"

import { useEffect, useState } from "react";
import NewsGrid from "@/components/news/NewsGrid";

import { supabase } from "@/lib/supabaseClient";
import SkeletonGrid from "@/components/news/SkeletonCard";

type Noticia = {
  id: string;
  titulo?: string;
  subtitulo?: string;
  categoria?: string;
  conteudo?: string;
  imagem_url?: string;
  legenda_imagem?: string;
  posicao?: string;
  created_at?: string;
};

export default function Home() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function buscarNoticias() {
    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setNoticias([]);
    } else if (data) {
      setNoticias(data);
    }
    
    setCarregando(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    buscarNoticias();
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <div className="pb-36 md:pb-20 pt-0 md:pt-2 px-4 md:px-8 max-w-7xl mx-auto">
        
        {carregando ? (
          /* SAI: Aquela frase simples de carregando
             ENTRA: O esqueleto com o desenho do seu site (3 colunas, slider, etc)
          */
          <SkeletonGrid /> 
        ) : (
          /* Quando carrega, entra o NewsGrid com as fotos coloridas */
          <NewsGrid noticias={noticias} />
        )}

      </div>
    </main>
  );
}