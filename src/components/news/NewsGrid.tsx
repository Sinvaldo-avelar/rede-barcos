'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdBanner } from '@/components/layout/AdBanner';

type NewsItem = {
  id: string;
  slug?: string;
  titulo?: string;
  subtitulo?: string;
  conteudo?: string;
  categoria?: string;
  imagem_url?: string;
  legenda_imagem?: string;
  posicao?: string;
  posicao_destaque?: string;
};

export default function NewsGrid({ noticias = [] }: { noticias?: NewsItem[] }) {
  const limparHtmlTotal = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const normalizarQuebrasDeLinha = (texto?: string) =>
    (texto || '').replace(/\\n/g, '\n').replace(/\r\n?/g, '\n');

  const normalizarCaixaFrase = (texto: string) => {
    const limpo = limparHtmlTotal(texto);
    if (!limpo) return "";

    const letras = limpo.replace(/[^A-Za-zÀ-ÿ]/g, "");
    if (!letras) return limpo;

    const qtdMaiusculas = letras.replace(/[^A-ZÀ-Ý]/g, "").length;
    const proporcaoMaiusculas = qtdMaiusculas / letras.length;

    if (proporcaoMaiusculas < 0.8) {
      return limpo;
    }

    const emMinusculo = limpo.toLocaleLowerCase("pt-BR");
    return emMinusculo.replace(/(^\s*[a-zà-ÿ]|[.!?]\s+[a-zà-ÿ])/g, (trecho) => trecho.toLocaleUpperCase("pt-BR"));
  };

  // --- LÓGICA DE ORGANIZAÇÃO (prioriza posicao, com fallback seguro) ---
  const getPosicao = (item: NewsItem) => {
    const valor = item?.posicao ?? item?.posicao_destaque ?? '';
    return String(valor).trim().toLowerCase();
  };

  const noticiasPrincipal = noticias.filter(n => getPosicao(n) === 'principal');
  const noticiasSlider = noticias.filter(n => getPosicao(n) === 'slider');
  const noticiasLateral = noticias.filter(n => getPosicao(n) === 'lateral');
  const noticiasFeed = noticias.filter(n => getPosicao(n) === 'feed');
  const noticiasSemPosicao = noticias.filter(n => !['principal', 'slider', 'lateral', 'feed'].includes(getPosicao(n)));

  const usados = new Set<string>();
  const adicionarUsado = (item?: NewsItem) => {
    if (item) usados.add(item.id);
  };
  const naoUsada = (item: NewsItem) => !usados.has(item.id);

  const mancheteTopo = noticiasPrincipal[0] || noticiasSemPosicao[0] || noticias[0];
  adicionarUsado(mancheteTopo);

  const paraOSlider = (
    noticiasSlider.filter(naoUsada).slice(0, 3).length > 0
      ? noticiasSlider.filter(naoUsada).slice(0, 3)
      : noticiasSemPosicao.filter(naoUsada).slice(0, 3).length > 0
        ? noticiasSemPosicao.filter(naoUsada).slice(0, 3)
        : noticias.filter(naoUsada).slice(0, 3)
  );
  paraOSlider.forEach(adicionarUsado);

  const lateraisBase = noticiasLateral.filter(naoUsada).slice(0, 6);
  const laterais =
    lateraisBase.length >= 6
      ? lateraisBase
      : [
          ...lateraisBase,
          ...noticias.filter(
            (item) =>
              naoUsada(item) &&
              getPosicao(item) !== 'principal' &&
              getPosicao(item) !== 'slider' &&
              getPosicao(item) !== 'lateral'
          ),
        ].slice(0, 6);
  laterais.forEach(adicionarUsado);
  const colunaEsquerda = laterais.slice(0, 3);
  const colunaDireita = laterais.slice(3, 6);

  // O QUE VEM EMBAIXO: feed explícito + sobras sem posição
  const feedCrescente = [
    ...noticiasFeed.filter(naoUsada),
    ...noticiasSemPosicao.filter(naoUsada),
  ];
  const blocosFeed = Array.from({ length: Math.ceil(feedCrescente.length / 12) }, (_, blocoIndex) => {
    const inicio = blocoIndex * 12;
    const noticiasBloco = feedCrescente.slice(inicio, inicio + 12);
    return {
      compactas: noticiasBloco.slice(0, 6),
      maiores: noticiasBloco.slice(6, 12),
    };
  });

  const [sliderIndex, setSliderIndex] = useState(0);
  const sliderAtual = paraOSlider[sliderIndex];

  useEffect(() => {
    if (paraOSlider.length <= 1) return;
    const timer = setInterval(() => {
      setSliderIndex(prev => (prev + 1) % paraOSlider.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paraOSlider.length]);

  if (!noticias || noticias.length === 0) return (
    <div className="text-center py-20 text-slate-400">Nenhuma notícia encontrada.</div>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 pt-0 md:pt-2 pb-6 font-(family-name:--font-inter)">
      
      {/* 1. MANCHETE DE TOPO (GERAL) */}
      {mancheteTopo && (
        <div className="mb-8 border-b border-gray-100 pb-8 text-left">
          <Link href={`/noticia/${mancheteTopo.id}`} className="group">
            {mancheteTopo.categoria && mancheteTopo.categoria.trim().toLowerCase() !== 'geral' && (
              <span className="text-[#00427a] font-bold text-sm mb-2 block">{mancheteTopo.categoria}</span>
            )}
            <h1 className="font-headline normal-case text-2xl sm:text-2xl md:text-5xl font-black leading-tight text-slate-900 group-hover:text-gray-600 transition-colors">
              {normalizarCaixaFrase(mancheteTopo.titulo || "")}
            </h1>
          </Link>

          <Link href={`/noticia/${mancheteTopo.id}`} className="group">
            <p className="font-(family-name:--font-inter) text-gray-500 mt-2 text-lg font-medium leading-relaxed text-justify">
              <span className="whitespace-pre-line">
                {normalizarQuebrasDeLinha(mancheteTopo.subtitulo)}
              </span>
            </p>
          </Link>
        </div>
      )}

      {/* 2. O GRID TRIPARTIDO (Layout do Meio) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 sm:gap-y-8 md:gap-y-10 lg:gap-x-8 mb-16">
        
        {/* COLUNA ESQUERDA (MATÉRIA ESCRITA - SÓ TEXTO) */}
        <div className="order-3 lg:order-1 lg:col-span-3 space-y-8">
          {colunaEsquerda.map(n => (
            <Link key={n.id} href={`/noticia/${n.id}`} className="block group border-b border-gray-50 pb-4 last:border-0">
              <span className="text-[#00427a] font-bold text-[11px] mb-1 block uppercase">{n.categoria}</span>
              <h3 className="font-headline font-bold text-lg leading-tight group-hover:text-blue-700">{limparHtmlTotal(n.titulo || "")}</h3>
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{n.subtitulo || limparHtmlTotal(n.conteudo || "")}</p>
            </Link>
          ))}
        </div>

        {/* MEIO (SLIDER) */}
        <div className="order-2 lg:order-2 lg:col-span-6">
          {paraOSlider.length > 0 && (
            <>
              <div className="relative aspect-4/3 md:aspect-video w-full overflow-hidden bg-slate-900 rounded-3xl md:rounded-lg shadow-lg">
                {paraOSlider.map((item, index) => (
                  <Link
                    key={item.id}
                    href={`/noticia/${item.id}`}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      index === sliderIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  >
                    <Image
                      src={item.imagem_url || ''}
                      fill
                      className="object-cover"
                      alt={item.titulo || ''}
                    />
                  </Link>
                ))}
              </div>

              {sliderAtual && (
                <Link href={`/noticia/${sliderAtual.id}`} className="block mt-3 sm:mt-4">
                  <span className="text-[#00427a] font-bold text-[12px] sm:text-[13px] uppercase mb-1.5 block">
                    {sliderAtual.categoria}
                  </span>
                  <h2 className="font-headline text-slate-900 text-xl sm:text-2xl font-bold leading-tight">
                    {limparHtmlTotal(sliderAtual.titulo || "")}
                  </h2>
                </Link>
              )}
            </>
          )}
        </div>

        {/* COLUNA DIREITA (ASSUNTOS COM FOTOS PEQUENAS) */}
        <div className="order-3 lg:order-3 lg:col-span-3 space-y-6">
          {colunaDireita.map(n => (
            <Link key={n.id} href={`/noticia/${n.id}`} className="group block border-b border-gray-100 pb-6 last:border-0">
              <span className="text-[#00427a] font-bold text-[11px] mb-3 block uppercase">{n.categoria}</span>
              <div className="flex gap-4">
                <div className="w-20 shrink-0">
                  <div className="relative w-20 h-20 bg-gray-100 overflow-hidden rounded-sm">
                    <Image 
                      src={n.imagem_url || ''} 
                      fill
                      className="object-cover" 
                      alt={n.titulo || ''} 
                    />
                  </div>
                </div>
                <h4 className="font-headline font-bold text-sm leading-tight group-hover:text-blue-800 transition-colors line-clamp-3">
                  {limparHtmlTotal(n.titulo || "")}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-14">
        <AdBanner slot="middle" inContainer={false} />
      </div>

      {/* 3. E DEPOIS EMBAIXO (O FEED QUE CRESCE) */}
      {feedCrescente.length > 0 && (
        <div className="pt-10 border-t border-gray-200">
          <div className="space-y-10">
            {blocosFeed.map((bloco, blocoIndex) => (
              <div key={`bloco-${blocoIndex}`} className="space-y-8">
                {bloco.compactas.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bloco.compactas.map((n) => (
                      <Link key={`compacta-${n.id}`} href={`/noticia/${n.id}`} className="group block border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex items-start gap-3.5">
                          <div className="relative w-34 h-22 lg:w-36 lg:h-24 bg-gray-100 overflow-hidden rounded-xl shrink-0">
                            <Image
                              src={n.imagem_url || ''}
                              fill
                              className="object-cover"
                              alt={n.titulo || ''}
                            />
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-headline font-bold text-base leading-tight text-slate-800 group-hover:text-blue-900 line-clamp-3">
                              {limparHtmlTotal(n.titulo || "")}
                            </h4>
                            <span className="text-[#00427a] font-bold text-[11px] mt-2 block uppercase line-clamp-1">
                              {n.categoria || 'Geral'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {bloco.maiores.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {bloco.maiores.map((n) => (
                      <Link key={`maior-${n.id}`} href={`/noticia/${n.id}`} className="group block">
                        <div className="space-y-3">
                          <div
                            className="relative w-full bg-gray-100 overflow-hidden rounded-2xl"
                            style={{ aspectRatio: '12 / 5' }}
                          >
                            <Image
                              src={n.imagem_url || ''}
                              fill
                              className="object-cover transition-all duration-300"
                              alt={n.titulo || ''}
                            />
                          </div>
                          <span className="text-[#00427a] font-bold text-[11px] mt-1 block uppercase line-clamp-1">
                            {n.categoria || 'Geral'}
                          </span>
                          <h4 className="font-headline font-bold text-base sm:text-lg lg:text-[26px] leading-[1.2] text-slate-800 group-hover:text-blue-900 line-clamp-3">
                            {limparHtmlTotal(n.titulo || "")}
                          </h4>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {blocoIndex === 0 && (
                  <div className="pt-4">
                    <AdBanner slot="bottom" inContainer={false} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </section>
  );
}