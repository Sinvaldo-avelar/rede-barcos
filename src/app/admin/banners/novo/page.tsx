"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Image as ImageIcon, UploadCloud, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

export default function NovoBanner() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Estados do Formulário
  const [nome, setNome] = useState("");
  const [linkDestino, setLinkDestino] = useState("");
  const [posicao, setPosicao] = useState<"top" | "middle" | "bottom">("top");
  const [imagemUrl, setImagemUrl] = useState(""); 
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  type BannerPayload = {
    [key: string]: string | undefined;
    nome?: string;
    titulo?: string;
    nome_banner?: string;
    imagem_url?: string;
    imagem?: string;
    url_imagem?: string;
    posicao?: "top" | "middle" | "bottom";
    link_url?: string;
    link_destino?: string;
    url?: string;
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- FUNÇÃO DE UPLOAD PARA O BUCKET 'BANNERS' ---
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const bucketsPreferidos = ['banners', 'noticias_fotos'];
      let ultimoErro: Error | null = null;

      for (const bucket of bucketsPreferidos) {
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

          if (urlData?.publicUrl) {
            setImagemUrl(urlData.publicUrl);
            setPreviewUrl(URL.createObjectURL(file));
            return;
          }
        }

        ultimoErro = uploadError ? new Error(uploadError.message) : null;
      }

      throw ultimoErro || new Error('Falha no upload da imagem.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'erro desconhecido';
      alert('Erro no upload do banner: ' + message);
    } finally {
      setUploading(false);
    }
  }

  // --- SALVAR NO BANCO DE DADOS ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !imagemUrl) {
      alert("Por favor, preencha o nome e selecione uma imagem.");
      return;
    }

    setCarregando(true);

    const colunasIgnoradas = new Set<string>();
    let erroFinal: Error | null = null;
    let salvou = false;

    const escolherColunaDisponivel = (candidatas: string[]) => {
      return candidatas.find((coluna) => !colunasIgnoradas.has(coluna));
    };

    const linkFinal = linkDestino.trim() || "#";

    for (let tentativa = 0; tentativa < 6; tentativa++) {
      const payload: BannerPayload = {};

      const colunaNome = escolherColunaDisponivel(["nome", "titulo", "nome_banner"]);
      if (colunaNome) payload[colunaNome] = nome;

      const colunaImagem = escolherColunaDisponivel(["imagem_url", "imagem", "url_imagem"]);
      if (colunaImagem) payload[colunaImagem] = imagemUrl;

      if (!colunasIgnoradas.has("posicao")) {
        payload.posicao = posicao;
      }

      ["link_url", "link_destino", "url"].forEach((coluna) => {
        if (!colunasIgnoradas.has(coluna)) {
          payload[coluna] = linkFinal;
        }
      });

      if (Object.keys(payload).length === 0) {
        erroFinal = new Error("Nenhuma coluna compatível encontrada para inserir banner.");
        break;
      }

      const { error } = await supabase
        .from("banners")
        .insert([payload]);

      if (!error) {
        salvou = true;
        break;
      }

      erroFinal = new Error(String(error.message || "erro desconhecido"));
      const mensagem = String(error.message || "");
      const colunaAusente = mensagem.match(/Could not find the '([^']+)' column/i)?.[1];

      if (colunaAusente) {
        colunasIgnoradas.add(colunaAusente);
        continue;
      }

      const msgLower = mensagem.toLowerCase();
      if (msgLower.includes("column") && msgLower.includes("posicao")) {
        colunasIgnoradas.add("posicao");
        continue;
      }
      if (msgLower.includes("column") && msgLower.includes("nome")) {
        colunasIgnoradas.add("nome");
        continue;
      }
      if (msgLower.includes("column") && msgLower.includes("titulo")) {
        colunasIgnoradas.add("titulo");
        continue;
      }
      if (msgLower.includes("column") && msgLower.includes("nome_banner")) {
        colunasIgnoradas.add("nome_banner");
        continue;
      }
      if (msgLower.includes("column") && msgLower.includes("link_url")) {
        colunasIgnoradas.add("link_url");
        continue;
      }
      if (msgLower.includes("column") && msgLower.includes("link_destino")) {
        colunasIgnoradas.add("link_destino");
        continue;
      }
      if (msgLower.includes("column") && msgLower.includes("url")) {
        colunasIgnoradas.add("url");
        continue;
      }
      if (msgLower.includes("column") && msgLower.includes("imagem_url")) {
        colunasIgnoradas.add("imagem_url");
        continue;
      }
      if (msgLower.includes("column") && msgLower.includes("imagem")) {
        colunasIgnoradas.add("imagem");
        continue;
      }
      if (msgLower.includes("column") && msgLower.includes("url_imagem")) {
        colunasIgnoradas.add("url_imagem");
        continue;
      }

      break;
    }

    if (!salvou) {
      alert("Erro ao salvar banner: " + (erroFinal?.message || "erro desconhecido"));
      setCarregando(false);
      return;
    }

    if (colunasIgnoradas.has("posicao")) {
      alert("Banner salvo, mas a coluna de posição ainda não existe no banco. Rode a migração para ativar o controle manual de slot.");
    }

    router.push("/admin/banners");
    router.refresh();
    setCarregando(false);
  }

  if (!isMounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <Link href="/admin/banners" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm">
        <ArrowLeft size={18} /> Voltar para anúncios
      </Link>

      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Novo Banner Publicitário</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
          
          {/* NOME DO ANUNCIANTE */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest">Nome do Anunciante / Campanha</label>
            <input 
              type="text" required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              placeholder="Ex: Supermercado Silva - Ofertas da Semana"
              value={nome} onChange={(e) => setNome(e.target.value)}
            />
          </div>

          {/* LINK DE DESTINO */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest flex items-center gap-2">
              <LinkIcon size={14} /> Link de Destino (URL)
            </label>
            <input 
              type="url"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all text-blue-600"
              placeholder="https://www.site-do-cliente.com.br"
              value={linkDestino} onChange={(e) => setLinkDestino(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest">Posição do Banner</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPosicao("top")}
                className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${posicao === "top" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"}`}
              >
                Topo (abaixo do cabeçalho)
              </button>
              <button
                type="button"
                onClick={() => setPosicao("middle")}
                className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${posicao === "middle" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"}`}
              >
                Meio (dentro da home)
              </button>
              <button
                type="button"
                onClick={() => setPosicao("bottom")}
                className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${posicao === "bottom" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"}`}
              >
                Final (após cards)
              </button>
            </div>
          </div>

          {/* UPLOAD DO BANNER */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-4 tracking-widest">Arte do Banner</label>
            
            <div className="space-y-4">
              {/* Área de Preview larga para simular um banner */}
              <div className="w-full h-48 bg-white rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner relative">
                {previewUrl ? (
                  <Image src={previewUrl} fill className="object-contain" alt="Preview Banner" unoptimized />
                ) : (
                  <div className="text-center space-y-2">
                    <ImageIcon className="text-slate-300 mx-auto" size={48} />
                    <p className="text-slate-400 text-xs">A imagem aparecerá aqui</p>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20">
                  <UploadCloud size={20} />
                  {uploading ? "Subindo imagem..." : "Selecionar Arte do Banner"}
                  <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                </label>
              </div>
              <p className="text-center text-[11px] text-slate-400 italic">Formatos aceitos: JPG, PNG ou GIF. Tamanho ideal depende do local do site.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" disabled={carregando || uploading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-12 py-4 rounded-2xl font-black flex items-center gap-3 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
          >
            {carregando ? "Salvando..." : <><Save size={20} /> Ativar Anúncio</>}
          </button>
        </div>
      </form>
    </div>
  );
}