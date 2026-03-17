"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  ImageIcon, 
  Layout
} from "lucide-react";
import Link from "next/link";

type BannerItem = {
  id: string;
  nome?: string;
  titulo?: string;
  nome_banner?: string;
  posicao?: string | null;
  imagem_url?: string;
  imagem?: string;
  url_imagem?: string;
  link_url?: string;
  link_destino?: string;
};

export default function ListaBanners() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);

  const extrairBucketECaminho = (publicUrl: string) => {
    try {
      const url = new URL(publicUrl);
      const marker = '/storage/v1/object/public/';
      const index = url.pathname.indexOf(marker);
      if (index === -1) return null;

      const resto = url.pathname.slice(index + marker.length);
      const partes = resto.split('/').filter(Boolean);
      if (partes.length < 2) return null;

      const [bucket, ...caminho] = partes;
      return {
        bucket,
        path: caminho.join('/'),
      };
    } catch {
      return null;
    }
  };

  const getLabelPosicao = (valor: string | null | undefined) => {
    const normalizado = String(valor || "").trim().toLowerCase();
    if (normalizado === "top" || normalizado === "topo") return "Topo";
    if (normalizado === "middle" || normalizado === "meio") return "Meio";
    return "Automático";
  };

  // Função para carregar banners do Supabase
  async function carregarBanners() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setBanners(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      alert("Erro ao carregar banners: " + message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarBanners();
  }, []);

  // Função para eliminar um banner
  async function eliminarBanner(id: string, imagemUrl: string) {
    if (!confirm("Tens a certeza que queres remover este anúncio?")) return;

    try {
      // 1. Remove do Banco de Dados
      const { error: dbError } = await supabase
        .from("banners")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      // 2. Opcional: Remover a imagem do Storage também (para não encher o servidor)
      // Extraímos o nome do ficheiro da URL
      const origem = extrairBucketECaminho(imagemUrl);
      if (origem?.bucket && origem.path) {
        await supabase.storage.from(origem.bucket).remove([origem.path]);
      }

      // Atualiza a lista na tela
      setBanners(banners.filter(b => b.id !== id));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      alert("Erro ao eliminar: " + message);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layout className="text-emerald-600" size={24} />
            Gestão de Publicidade
          </h1>
          <p className="text-slate-500 text-sm">Gerencie os banners e anúncios do seu portal</p>
        </div>

        <Link 
          href="/admin/banners/novo" 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
        >
          <Plus size={20} /> Novo Banner
        </Link>
      </div>

      {/* LISTAGEM */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : banners.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {banners.map((banner) => {
            const linkExibicao = banner.link_url || banner.link_destino || "";
            const tituloExibicao = banner.nome || banner.titulo || banner.nome_banner || `Banner #${banner.id}`;
            const imagemExibicao = banner.imagem_url || banner.imagem || banner.url_imagem || "";

            return (
              <div 
                key={banner.id} 
                className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                  {/* Preview da Imagem */}
                  <div className="relative w-full md:w-48 h-24 bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
                    {imagemExibicao ? (
                      <Image 
                        src={imagemExibicao} 
                        fill
                        unoptimized
                        className="object-cover" 
                        alt={tituloExibicao} 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Sem imagem</div>
                    )}
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-bold text-slate-800 text-lg">{tituloExibicao}</h3>
                    <div className="mt-2">
                      <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold px-3 py-1 uppercase tracking-wide">
                        Slot: {getLabelPosicao(banner.posicao)}
                      </span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-blue-500 text-sm mt-1">
                      <ExternalLink size={14} />
                      <a href={linkExibicao || "#"} target="_blank" className="hover:underline truncate max-w-62.5">
                        {linkExibicao || "Sem link de destino"}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => eliminarBanner(banner.id, imagemExibicao)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Eliminar Anúncio"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-20 text-center">
          <ImageIcon className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-slate-500 font-medium">Nenhum banner cadastrado ainda.</h3>
          <p className="text-slate-400 text-sm mt-1">Clique no botão acima para adicionar o primeiro.</p>
        </div>
      )}
    </div>
  );
}