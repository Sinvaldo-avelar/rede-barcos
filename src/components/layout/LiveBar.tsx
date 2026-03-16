"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { LiveConfig } from "@/lib/live";

export function LiveBar() {
  const [config, setConfig] = useState<LiveConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarLive() {
      const { data, error } = await supabase
        .from("configuracoes_live")
        .select("*")
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setConfig(data);
      }

      setLoading(false);
    }

    carregarLive();

    const channel = supabase
      .channel("livebar-config")
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

  if (loading || !config?.is_active) return null;

  return (
    <Link
      href="/ao-vivo"
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full border-b border-red-950/40 bg-linear-to-r from-red-950 via-red-800 to-red-950 text-white shadow-md"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-1 px-4 py-3 text-center">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-3 w-3 rounded-full bg-red-300 animate-pulse" />
          <span className="text-base font-black uppercase tracking-[0.22em] sm:text-lg">
            🔴 AO VIVO - ASSISTA AGORA
          </span>
        </div>
        {config?.descricao && (
          <p className="max-w-4xl truncate text-sm text-red-100 sm:text-base">
            {config.descricao}
          </p>
        )}
      </div>
    </Link>
  );
}