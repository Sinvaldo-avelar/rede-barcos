"use client"
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type FotoMidia = {
  titulo?: string;
  imagem_url: string;
  created_at?: string;
};

export default function MidiaAdmin() {
  const [fotos, setFotos] = useState<FotoMidia[]>([]);
  const [fotoSelecionada, setFotoSelecionada] = useState<FotoMidia | null>(null);

  // Carrega fotos ao abrir a página
  useEffect(() => {
    let ativo = true;

    (async () => {
      const { data, error } = await supabase
        .from("noticias")
        .select("titulo, imagem_url, created_at")
        .not("imagem_url", "eq", "")
        .order("created_at", { ascending: false });

      if (!error && ativo) {
        setFotos((data || []) as FotoMidia[]);
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-8 bg-gray-50 min-h-screen text-black">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
            <h1 className="text-3xl font-black uppercase italic text-blue-900">📷 Acervo de Imagens</h1>
            <p className="text-xs text-gray-500 font-bold">IMAGENS PUBLICADAS NAS MATÉRIAS</p>
        </div>
        {/* BOTÃO VOLTAR PARA O PAINEL SEM PEDIR SENHA */}
        <Link href="/admin" className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-xs hover:bg-blue-700 transition shadow-md">
          ⬅ VOLTAR PARA POSTAGENS
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {fotos.map((item, index) => (
          <div 
            key={index} 
            className="group relative cursor-pointer border-2 border-white hover:border-blue-500 shadow-sm overflow-hidden rounded bg-gray-200 aspect-square transition"
            onClick={() => setFotoSelecionada(item)}
          >
            <Image src={item.imagem_url} alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2 text-center">
               <span className="text-white text-[10px] font-bold leading-tight">{item.titulo}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Visualizador de Imagem Expandida */}
      {fotoSelecionada && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4 transition-all" onClick={() => setFotoSelecionada(null)}>
          <button className="absolute top-5 right-5 text-white text-4xl">&times;</button>
          <Image src={fotoSelecionada.imagem_url} alt={fotoSelecionada.titulo || "Imagem selecionada"} width={1200} height={800} className="rounded shadow-2xl max-w-full max-h-[80vh] w-auto h-auto" />
          <div className="mt-6 text-center max-w-xl">
            <h2 className="text-white font-bold text-lg">{fotoSelecionada.titulo}</h2>
            <div className="mt-4 p-2 bg-gray-800 rounded border border-gray-700">
                <p className="text-blue-400 text-[10px] uppercase font-bold mb-1">Link da Imagem no Acervo:</p>
                <p className="text-gray-300 text-xs break-all select-all cursor-copy">{fotoSelecionada.imagem_url}</p>
            </div>
          </div>
        </div>
      )}

      {fotos.length === 0 && (
        <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest">
            Nenhuma imagem encontrada no acervo ⚓
        </div>
      )}
    </div>
  );
}