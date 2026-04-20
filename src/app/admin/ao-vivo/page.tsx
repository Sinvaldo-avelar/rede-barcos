"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save, Radio, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getYouTubeEmbedUrl, type LiveConfig } from "@/lib/live";

export default function AdminAoVivoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configId, setConfigId] = useState<number | string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [descricao, setDescricao] = useState("");

  const embedUrl = useMemo(() => getYouTubeEmbedUrl(videoUrl), [videoUrl]);

  useEffect(() => {
    async function carregarConfiguracao() {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("configuracoes_live")
          .select("*")
          .order("id", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          alert("Erro ao carregar configuração da live: " + error.message);
          return;
        }

        if (data) {
          const config = data as LiveConfig;
          setConfigId(config.id ?? null);
          setIsActive(Boolean(config.is_active));
          setVideoUrl(config.video_url || "");
          setDescricao(config.descricao || "");
        }
      } catch (error) {
        console.error("Erro de rede ao carregar live no admin:", error);
        alert("Falha de conexão ao carregar configuração da live.");
      } finally {
        setLoading(false);
      }
    }

    carregarConfiguracao();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const payloadComDescricao = {
        is_active: isActive,
        video_url: videoUrl.trim() || null,
        descricao: descricao.trim() || null,
      };

      let resultado = configId
        ? await supabase.from("configuracoes_live").update(payloadComDescricao).eq("id", configId)
        : await supabase.from("configuracoes_live").insert([payloadComDescricao]).select("id").single();

      const colunaDescricaoInexistente = resultado.error?.message?.toLowerCase().includes("could not find")
        && resultado.error?.message?.toLowerCase().includes("descricao");

      if (colunaDescricaoInexistente) {
        const payloadSemDescricao = {
          is_active: isActive,
          video_url: videoUrl.trim() || null,
        };

        resultado = configId
          ? await supabase.from("configuracoes_live").update(payloadSemDescricao).eq("id", configId)
          : await supabase.from("configuracoes_live").insert([payloadSemDescricao]).select("id").single();
      }

      if (resultado.error) {
        alert("Erro ao salvar live: " + resultado.error.message);
        return;
      }

      if (!configId && resultado.data && "id" in resultado.data) {
        setConfigId((resultado.data as { id: number | string }).id);
      }

      if (colunaDescricaoInexistente) {
        alert("Live salva, mas a coluna 'descricao' ainda não existe no banco. Adicione essa coluna para ativar o texto personalizado.");
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          const bc = new BroadcastChannel("live-updates");
          bc.postMessage({ type: "live-updated", at: Date.now() });
          bc.close();
        }
        return;
      }

      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("live-updates");
        bc.postMessage({ type: "live-updated", at: Date.now() });
        bc.close();
      }

      alert("Configuração da transmissão atualizada com sucesso.");
    } catch (error) {
      console.error("Erro de rede ao salvar live no admin:", error);
      alert("Falha de conexão ao salvar live.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#003d73] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      <Link href="/admin" className="flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-red-700">
        <ArrowLeft size={18} /> Voltar para o painel
      </Link>

      <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-red-700">Transmissão Ao Vivo</p>
            <h1 className="flex items-center gap-3 text-3xl font-black text-[#003d73]">
              <Radio size={28} className="text-red-700" /> Controle da Live
            </h1>
            <p className="mt-2 text-sm text-slate-500">Ative a barra de alerta do site e configure o link do YouTube da transmissão.</p>
          </div>

          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${isActive ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-500"}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-red-600" : "bg-slate-400"}`} />
            {isActive ? "No Ar" : "Desligado"}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 rounded-3xl border border-[#cbdad5] bg-white p-8 shadow-sm">
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-slate-800">Barra de alerta no site</p>
                <p className="text-xs text-slate-500">Quando ligada, mostra o aviso abaixo do cabeçalho.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive((current) => !current)}
                aria-pressed={isActive}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${isActive ? "bg-red-700" : "bg-slate-300"}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-9" : "translate-x-1"}`} />
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Link do YouTube</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Cole aqui o link da live do YouTube"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700 outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
            <p className="mt-2 text-xs text-slate-400">Aceita links como `youtube.com/watch?v=...`, `youtu.be/...`, `shorts/...` e `live/...`.</p>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Descrição do que está sendo transmitido</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Sessão da Câmara ao vivo direto de Conceição da Barra"
              rows={3}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-3 rounded-2xl bg-red-700 px-8 py-4 font-black text-white transition-all hover:bg-red-800 disabled:opacity-60"
            >
              <Save size={18} /> {saving ? "Salvando..." : "Salvar Transmissão"}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-[#cbdad5] bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Prévia</p>
              <h2 className="text-xl font-black text-[#003d73]">Página /ao-vivo</h2>
            </div>
            <Link href="/ao-vivo" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-700 hover:text-red-900">
              Abrir página <ExternalLink size={14} />
            </Link>
          </div>

          {embedUrl ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
              <div className="aspect-video w-full">
                <iframe
                  src={embedUrl}
                  title="Prévia da transmissão ao vivo"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              Cole um link válido do YouTube para visualizar a incorporação.
            </div>
          )}

          {descricao && (
            <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-900">
              {descricao}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}