"use client"
import Image from 'next/image';
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient'; 

type AdBannerProps = {
  slot?: 'top' | 'middle';
  inContainer?: boolean;
};

type Banner = {
  id: number | string;
  posicao?: string | null;
  imagem_url?: string | null;
  link_url?: string | null;
  link_destino?: string | null;
};

export function AdBanner({ slot = 'top', inContainer = true }: AdBannerProps) {
  const [ads, setAds] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const normalizarPosicao = (valor: string | null | undefined) => {
    const normalizado = String(valor || '').trim().toLowerCase();
    if (normalizado === 'top' || normalizado === 'topo') return 'top';
    if (normalizado === 'middle' || normalizado === 'meio') return 'middle';
    return null;
  };

  useEffect(() => {
    async function carregarBanners() {
      // Buscamos os banners ordenando pelo ID mais recente primeiro
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) {
        setAds([]);
        return;
      }

      if (data && data.length > 0) {
        setAds(data);
      }
    }
    carregarBanners();
  }, []);

  const adsDoSlot = useMemo(() => {
    const comPosicaoExplicita = ads.filter((ad) => normalizarPosicao(ad.posicao) === slot);
    if (comPosicaoExplicita.length > 0) return comPosicaoExplicita;

    if (ads.length <= 1) return ads;

    const filtrados = ads.filter((_, index) =>
      slot === 'top' ? index % 2 === 0 : index % 2 !== 0
    );

    return filtrados.length > 0 ? filtrados : ads;
  }, [ads, slot]);

  // Timer para girar os banners (muda a cada 5 segundos)
  useEffect(() => {
    if (adsDoSlot.length > 1) { // Só faz o timer se tiver mais de um banner
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev === adsDoSlot.length - 1 ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [adsDoSlot.length]);

  if (adsDoSlot.length === 0) return null;

  const activeIndex = currentIndex % adsDoSlot.length;

  const bannerContent = (
    <div className="relative w-full h-25 sm:h-37.5 md:h-55 overflow-hidden rounded-xl border border-gray-100 shadow-sm bg-gray-50">
      {adsDoSlot.map((ad, index) => (
        <a
          key={ad.id}
          href={ad.link_url || ad.link_destino || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {ad.imagem_url ? (
            <Image
              src={ad.imagem_url}
              alt="Publicidade Comercial"
              fill
              unoptimized
              className="object-cover md:object-fill"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <p className="text-gray-400">Imagem não disponível</p>
            </div>
          )}

          <div className="absolute bottom-2 right-2 bg-black/40 text-white text-[9px] px-2 py-0.5 rounded uppercase font-sans z-20">
            Publicidade
          </div>
        </a>
      ))}
    </div>
  );

  return (
    <section className="w-full bg-white py-2 md:py-4">
      {inContainer ? (
        <div className="max-w-7xl mx-auto px-4">{bannerContent}</div>
      ) : (
        bannerContent
      )}
    </section>
  );
}