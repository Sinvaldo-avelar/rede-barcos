"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

type FotoMidia = {
  titulo: string;
  imagem_url: string;
  created_at: string;
};

function extrairNomeArquivo(url: string) {
  try {
    const pathname = new URL(url).pathname;
    return decodeURIComponent(pathname.split("/").pop() || "");
  } catch {
    const semQuery = url.split("?")[0] || "";
    return decodeURIComponent(semQuery.split("/").pop() || "");
  }
}

function extrairExtensaoArquivo(url: string) {
  const nomeArquivo = extrairNomeArquivo(url);
  const extensao = nomeArquivo.split(".").pop()?.toLowerCase() || "";

  if (extensao === "jpeg") return "JPG";
  if (extensao === "jpg") return "JPG";
  if (extensao === "png") return "PNG";
  if (extensao === "webp") return "WEBP";
  return extensao ? extensao.toUpperCase() : "IMG";
}

function obterClasseBadge(extensao: string) {
  if (extensao === "PNG") return "bg-blue-100/90 text-blue-700";
  if (extensao === "WEBP") return "bg-violet-100/90 text-violet-700";
  if (extensao === "JPG") return "bg-emerald-100/90 text-emerald-700";
  return "bg-slate-100/90 text-slate-700";
}

type MediaGalleryModalProps = {
  open: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  onUploadNew: (file: File) => Promise<void> | void;
  disabled?: boolean;
};

export default function MediaGalleryModal({
  open,
  onClose,
  onSelectImage,
  onUploadNew,
  disabled = false,
}: MediaGalleryModalProps) {
  const [fotos, setFotos] = useState<FotoMidia[]>([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    async function carregarFotos() {
      setLoading(true);
      const { data } = await supabase
        .from("noticias")
        .select("titulo, imagem_url, created_at")
        .not("imagem_url", "eq", "")
        .order("created_at", { ascending: false });
      setFotos((data || []) as FotoMidia[]);
      setLoading(false);
    }

    if (open) {
      carregarFotos();
    }
  }, [open]);

  const buscaNormalizada = busca.trim().toLowerCase();
  const fotosFiltradas = fotos.filter((foto) =>
    extrairNomeArquivo(foto.imagem_url).toLowerCase().includes(buscaNormalizada)
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-110 bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl max-h-[88vh] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900">Acervo de Mídia</h2>
            <p className="text-xs text-slate-500 mt-1">Escolha do acervo para editar e inserir na notícia.</p>
          </div>

          <label className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-bold ${disabled ? "bg-slate-300 text-white" : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"}`}>
            Upload do Computador
            <input
              type="file"
              className="hidden"
              accept="image/*"
              disabled={disabled}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                await onUploadNew(file);
                onClose();
              }}
            />
          </label>
        </div>

        <div className="p-4 md:p-5 overflow-auto space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Buscar imagem</label>
            <input
              type="text"
              placeholder="Digite o nome do arquivo do acervo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Carregando imagens...</p>
          ) : fotos.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma imagem encontrada no acervo.</p>
          ) : fotosFiltradas.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma imagem encontrada com esse nome</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {fotosFiltradas.map((foto, index) => (
                (() => {
                  const extensao = extrairExtensaoArquivo(foto.imagem_url);
                  return (
                <button
                  key={`${foto.imagem_url}-${index}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onSelectImage(foto.imagem_url);
                    onClose();
                  }}
                  className="group text-left rounded-xl border border-slate-200 overflow-hidden hover:border-blue-400 disabled:opacity-50"
                >
                  <div className="relative w-full aspect-video bg-slate-100">
                    <span className={`absolute top-2 right-2 z-10 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${obterClasseBadge(extensao)}`}>
                      {extensao}
                    </span>
                    <Image
                      src={foto.imagem_url}
                      alt={foto.titulo || "Imagem da galeria"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] text-slate-600 line-clamp-2">{foto.titulo || "Sem título"}</p>
                    <p
                      className="mt-1 text-xs text-slate-400 truncate"
                      title={extrairNomeArquivo(foto.imagem_url)}
                    >
                      {extrairNomeArquivo(foto.imagem_url)}
                    </p>
                  </div>
                </button>
                  );
                })()
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
