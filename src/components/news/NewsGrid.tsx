'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdBanner } from '@/components/layout/AdBanner';

export default function NewsGrid({ noticias = [] }: { noticias?: any[] }) {
  if (!noticias || noticias.length === 0) return (
    <div className="text-center py-20 text-slate-400">Nenhuma notícia encontrada.</div>
  );

  const limparHtmlTotal = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  };

  // --- LÓGICA DE ORGANIZAÇÃO (prioriza posicao, com fallback seguro) ---
  const getPosicao = (item: any) => {
    const valor = item?.posicao ?? item?.posicao_destaque ?? '';
    return String(valor).trim().toLowerCase();
  };

  const noticiasPrincipal = noticias.filter(n => getPosicao(n) === 'principal');
  const noticiasSlider = noticias.filter(n => getPosicao(n) === 'slider');
  const noticiasLateral = noticias.filter(n => getPosicao(n) === 'lateral');
  const noticiasFeed = noticias.filter(n => getPosicao(n) === 'feed');
  const noticiasSemPosicao = noticias.filter(n => !['principal', 'slider', 'lateral', 'feed'].includes(getPosicao(n)));

  const usados = new Set<any>();
  const adicionarUsado = (item: any) => {
    if (item) usados.add(item.id);
  };
  const naoUsada = (item: any) => !usados.has(item.id);

  const mancheteTopo = noticiasPrincipal[0] || noticiasSemPosicao[0] || noticias[0];
  adicionarUsado(mancheteTopo);

  const completarComSemPosicao = (lista: any[], limite: number) => {
    const base = lista.filter(naoUsada).slice(0, limite);
    const faltam = limite - base.length;
    const fallback = faltam > 0 ? noticiasSemPosicao.filter(naoUsada).slice(0, faltam) : [];
    const resultado = [...base, ...fallback];
    resultado.forEach(adicionarUsado);
    return resultado;
  };

  const paraOSlider = completarComSemPosicao(noticiasSlider, 3);
  const laterais = completarComSemPosicao(noticiasLateral, 6);
  const colunaEsquerda = laterais.slice(0, 3);
  const colunaDireita = laterais.slice(3, 6);

  // O QUE VEM EMBAIXO: feed explícito + sobras sem posição
  const feedCrescente = [
    ...noticiasFeed.filter(naoUsada),
    ...noticiasSemPosicao.filter(naoUsada),
  ];

  const [sliderIndex, setSliderIndex] = useState(0);

  useEffect(() => {
    if (paraOSlider.length <= 1) return;
    const timer = setInterval(() => {
      setSliderIndex(prev => (prev + 1) % paraOSlider.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paraOSlider.length]);

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 font-(family-name:--font-inter)">
      
      {/* 1. MANCHETE DE TOPO (GERAL) */}
      {mancheteTopo && (
        <div className="mb-8 border-b border-gray-100 pb-8">
          <Link href={`/noticia/${mancheteTopo.id}`} className="group">
            <span className="text-[#00427a] font-bold text-sm mb-2 block uppercase">{mancheteTopo.categoria}</span>
            <h1 className="text-4xl md:text-5xl font-serif font-black leading-tight text-slate-900 group-hover:text-gray-600 transition-colors">
              {limparHtmlTotal(mancheteTopo.titulo)}
            </h1>
            <p className="text-gray-500 mt-2 text-lg line-clamp-2 font-medium">
                {mancheteTopo.subtitulo || ""}
            </p>
          </Link>
        </div>
      )}

      {/* 2. O GRID TRIPARTIDO (Layout do Meio) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        
        {/* COLUNA ESQUERDA (MATÉRIA ESCRITA - SÓ TEXTO) */}
        <div className="lg:col-span-3 space-y-8">
          {colunaEsquerda.map(n => (
            <Link key={n.id} href={`/noticia/${n.id}`} className="block group border-b border-gray-50 pb-4 last:border-0">
              <span className="text-[#00427a] font-bold text-[11px] mb-1 block uppercase">{n.categoria}</span>
              <h3 className="font-bold text-lg leading-tight group-hover:text-blue-700">{limparHtmlTotal(n.titulo)}</h3>
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{n.subtitulo || limparHtmlTotal(n.conteudo)}</p>
            </Link>
          ))}
        </div>

        {/* MEIO (SLIDER) */}
        <div className="lg:col-span-6">
          {paraOSlider.length > 0 && (
            <div className="relative aspect-square md:aspect-video w-full overflow-hidden bg-slate-900 rounded-sm shadow-lg">
              {paraOSlider.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/noticia/${item.id}`}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    index === sliderIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <img
                    src={item.imagem_url}
                    className="object-cover w-full h-full"
                    alt={item.titulo}
                  />
                  
                  {/* CRÉDITO DA IMAGEM */}
                  {item.legenda_imagem && (
                    <div className="absolute top-2 right-2 bg-black/50 text-[9px] text-white px-2 py-0.5 rounded backdrop-blur-sm z-20">
                      {item.legenda_imagem}
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 p-6 bg-linear-to-t from-black/95 to-transparent w-full">
                    <span className="text-white text-xs font-bold uppercase mb-2 block border-l-2 border-white pl-2">
                      {item.categoria}
                    </span>
                    <h2 className="text-white text-2xl font-bold leading-tight">
                      {limparHtmlTotal(item.titulo)}
                    </h2>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* COLUNA DIREITA (ASSUNTOS COM FOTOS PEQUENAS) */}
        <div className="lg:col-span-3 space-y-6">
          {colunaDireita.map(n => (
            <Link key={n.id} href={`/noticia/${n.id}`} className="group block border-b border-gray-100 pb-6 last:border-0">
              <span className="text-[#00427a] font-bold text-[11px] mb-3 block uppercase">{n.categoria}</span>
              <div className="flex gap-4">
                <div className="w-20 shrink-0">
                  <div className="relative w-20 h-20 bg-gray-100 overflow-hidden rounded-sm">
                    <img 
                      src={n.imagem_url} 
                      className="object-cover w-full h-full" 
                      alt={n.titulo} 
                    />
                  </div>
                  {n.legenda_imagem && (
                    <p className="mt-1 text-[8px] leading-tight text-gray-500 line-clamp-2">
                      {n.legenda_imagem}
                    </p>
                  )}
                </div>
                <h4 className="font-bold text-sm leading-tight group-hover:text-blue-800 transition-colors line-clamp-3">
                  {limparHtmlTotal(n.titulo)}
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
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {feedCrescente.map(n => (
                <Link key={n.id} href={`/noticia/${n.id}`} className="group space-y-3">
                   <div className="aspect-video overflow-hidden bg-gray-100 rounded-sm">
                      <img 
                        src={n.imagem_url} 
                        className="w-full h-full object-cover transition-all duration-300" 
                        alt={n.titulo} 
                      />
                   </div>
                   {n.legenda_imagem && (
                     <p className="text-[10px] text-gray-500 leading-tight -mt-1 line-clamp-2">
                       {n.legenda_imagem}
                     </p>
                   )}
                   <div className="space-y-1">
                      <span className="text-[#00427a] font-bold text-[10px] uppercase block">{n.categoria}</span>
                      <h4 className="font-bold text-sm leading-snug text-slate-800 group-hover:text-blue-900 line-clamp-3">
                        {limparHtmlTotal(n.titulo)}
                      </h4>
                   </div>
                </Link>
              ))}
           </div>
        </div>
      )}

    </section>
  );
}