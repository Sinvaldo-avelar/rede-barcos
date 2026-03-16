"use client"

import { useEffect, useState } from "react";
import NewsGrid from "@/components/news/NewsGrid";

import { supabase } from "@/lib/supabaseClient";
import SkeletonGrid from "@/components/news/SkeletonCard";

export default function Home() {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function buscarNoticias() {
    setCarregando(true);

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
    buscarNoticias();
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <div className="pb-20 pt-6 px-4 md:px-8 max-w-7xl mx-auto">
        
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