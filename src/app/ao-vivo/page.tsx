"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Radio } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { extractYouTubeVideoId, getYouTubeEmbedUrl, type LiveConfig } from "@/lib/live";

export default function AoVivoPage() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<LiveConfig | null>(null);
  const [startPlayer, setStartPlayer] = useState(false);

  useEffect(() => {
    async function carregarLive() {
      const { data, error } = await supabase
        .from("configuracoes_live")
        .select("*")
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const nextConfig = data as LiveConfig;
        setConfig((prev) => {
          if (
            prev?.id === nextConfig.id &&
            prev?.is_active === nextConfig.is_active &&
            prev?.video_url === nextConfig.video_url &&
            prev?.descricao === nextConfig.descricao
          ) {
            return prev;
          }

          return nextConfig;
        });
      }

      setLoading(false);
    }

    carregarLive();

    const channel = supabase
      .channel("aovivo-config")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "configuracoes_live" },
        () => {
          carregarLive();
        }
      )
      .subscribe();

    const pollingId = window.setInterval(() => {
      carregarLive();
    }, 12000);

    const bc = typeof window !== "undefined" && "BroadcastChannel" in window
      ? new BroadcastChannel("live-updates")
      : null;

    bc?.addEventListener("message", () => {
      carregarLive();
    });

    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(pollingId);
      bc?.close();
    };
  }, []);

  const embedUrl = useMemo(() => getYouTubeEmbedUrl(config?.video_url), [config?.video_url]);
  const videoId = useMemo(() => extractYouTubeVideoId(config?.video_url), [config?.video_url]);
  const thumbUrl = useMemo(() => (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null), [videoId]);

  useEffect(() => {
    setStartPlayer(false);
  }, [config?.video_url, config?.is_active]);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-white px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-700 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ffe5e5,#ffffff_45%)] px-4 pb-20 pt-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-red-700">
          <ArrowLeft size={18} /> Voltar para as Notícias
        </Link>

        <section className="overflow-hidden rounded-4xl border border-red-100 bg-white shadow-[0_20px_60px_rgba(127,29,29,0.12)]">
          <div className="border-b border-red-100 bg-linear-to-r from-red-950 via-red-800 to-red-950 px-6 py-5 text-white md:px-8">
            <p className="mb-2 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] text-red-200">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-300 animate-pulse" />
              Transmissão Ao Vivo
            </p>
            <h1 className="flex items-center gap-3 text-3xl font-black md:text-4xl">
              <Radio size={30} /> 🔴 AO VIVO - ASSISTA AGORA
            </h1>
            <p className="mt-2 max-w-3xl text-base text-red-100 md:text-lg">
              {config?.descricao || "Acompanhe a cobertura em tempo real direto do Portal da Rede Barcos."}
            </p>
          </div>

          <div className="p-5 md:p-8">
            {config?.is_active && embedUrl ? (
              <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl bg-black shadow-2xl">
                <div className="aspect-video w-full">
                  {!startPlayer ? (
                    <button
                      type="button"
                      onClick={() => setStartPlayer(true)}
                      className="relative h-full w-full bg-black text-left"
                    >
                      {thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt="Pré-visualização da transmissão ao vivo"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="h-full w-full bg-red-950" />
                      )}

                      <div className="absolute inset-0 bg-black/35" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center text-white">
                        <span className="rounded-full bg-red-700 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] shadow-lg sm:text-base">
                          ▶ Iniciar Transmissão
                        </span>
                        <span className="text-xs text-red-100 sm:text-sm">
                          O player será carregado ao clicar para reduzir travamentos.
                        </span>
                      </div>
                    </button>
                  ) : (
                    <iframe
                      src={embedUrl}
                      title="Transmissão ao vivo Rede Barcos"
                      className="h-full w-full"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex min-h-95 flex-col items-center justify-center rounded-3xl border border-dashed border-red-200 bg-red-50 px-6 text-center">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-red-700">Nenhuma transmissão ativa no momento</p>
                <p className="mt-3 max-w-xl text-sm text-slate-500">
                  Assim que a equipe ativar a live no painel administrativo, o player aparecerá aqui automaticamente.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}