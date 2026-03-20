"use client"

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Share2, User } from "lucide-react";
import DOMPurify from "dompurify";
import SimpleToast from "@/components/ui/SimpleToast";

interface Noticia {
  id: string; // Adicionei o ID aqui
  slug?: string;
  titulo: string;
  subtitulo?: string;
  categoria: string;
  autor?: string;
  created_at: string;
  foto_destaque?: string;
  imagem_url?: string;
  legenda_imagem?: string;
  conteudo: string;
}

export default function NoticiaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const normalizarQuebrasDeLinha = (texto?: string) =>
    (texto || "").replace(/\\n/g, "\n").replace(/\r\n?/g, "\n");

  const escaparHtml = (texto: string) =>
    texto
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const formatarConteudoParaRender = (conteudo?: string) => {
    const normalizado = normalizarQuebrasDeLinha(conteudo);
    if (!normalizado) return "";

    const temHtml = /<\/?[a-z][\s\S]*>/i.test(normalizado);
    if (temHtml) return normalizado;

    return normalizado
      .split(/\n{2,}/)
      .map((bloco) => `<p>${escaparHtml(bloco).replace(/\n/g, "<br />")}</p>`)
      .join("");
  };

  const DOMINIOS_IMAGEM_CONFIAVEIS = ["supabase.co"];
  const RESTRINGIR_IMAGEM_A_DOMINIOS_CONFIAVEIS = false;

  const isImagemSrcPermitido = (src: string) => {
    if (!src?.startsWith("https://")) return false;

    if (!RESTRINGIR_IMAGEM_A_DOMINIOS_CONFIAVEIS) {
      return true;
    }

    try {
      const { hostname } = new URL(src);
      return DOMINIOS_IMAGEM_CONFIAVEIS.some(
        (dominio) => hostname === dominio || hostname.endsWith(`.${dominio}`)
      );
    } catch {
      return false;
    }
  };

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

  DOMPurify.removeHooks("uponSanitizeAttribute");
  DOMPurify.addHook("uponSanitizeAttribute", (currentNode, data) => {
    if (
      currentNode.tagName?.toLowerCase() === "img" &&
      data.attrName?.toLowerCase() === "src" &&
      !isImagemSrcPermitido(data.attrValue)
    ) {
      data.keepAttr = false;
    }
  });

  const conteudoSanitizado = DOMPurify.sanitize(formatarConteudoParaRender(noticia.conteudo), {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "h2", "h3", "ul", "ol", "li", "a", "img"],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title"],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });
  DOMPurify.removeHooks("uponSanitizeAttribute");

  const fotoCapaUrl = noticia.foto_destaque || noticia.imagem_url;

  const compartilharNoticia = async () => {
    const noticiaPath = `/noticia/${noticia.slug || noticia.id || slug}`;
    const urlAtual = new URL(noticiaPath, window.location.origin).toString();
    const tituloNoticia = noticia.titulo.replace(/<[^>]*>?/gm, "");

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: tituloNoticia,
          url: urlAtual,
        });
      } catch {
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(urlAtual);
      setToastMessage("Copiado para a área de transferência!");
    } catch {
    }
  };

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
          <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm border-y border-slate-100 py-4 mt-6 font-bold uppercase text-[11px]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Por <strong className="text-slate-900">{noticia.autor || "Redação"}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(noticia.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <button
              type="button"
              onClick={compartilharNoticia}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartilhar</span>
            </button>
          </div>
          <h1 className="font-headline text-3xl md:text-5xl font-black leading-tight text-slate-900 mt-6 mb-6 tracking-tight">
            {noticia.titulo.replace(/<[^>]*>?/gm, '')} {/* Limpando tags do título se houver */}
          </h1>

          {fotoCapaUrl && (
            <div className="mt-6">
              <div className="relative w-full aspect-video overflow-hidden rounded-sm bg-slate-100 shadow-sm">
                <Image
                  src={fotoCapaUrl}
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

          {noticia.subtitulo && (
            <p className="font-(family-name:--font-inter) text-gray-700 mt-8 text-base md:text-xl font-medium leading-relaxed">
              <span className="whitespace-pre-line">
                {normalizarQuebrasDeLinha(noticia.subtitulo)}
              </span>
            </p>
          )}
        </header>

        {/* Renderizando o HTML do editor de texto com espaçamento editorial */}
        <div 
          className="news-content mt-8 max-w-none space-y-4 font-(family-name:--font-playfair) leading-relaxed text-slate-800"
          dangerouslySetInnerHTML={{ __html: conteudoSanitizado }}
        />

      </article>

      <SimpleToast
        message={toastMessage}
        variant="success"
        onClose={() => setToastMessage(null)}
      />
    </main>
  );
}