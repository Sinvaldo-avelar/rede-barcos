// src/components/news/NewsCard.tsx
import Image from 'next/image';
import Link from 'next/link';

type NewsCardItem = {
  id: string;
  slug?: string;
  titulo?: string;
  subtitulo?: string;
  resumo?: string;
  conteudo?: string;
  categoria?: string;
  imagem_url?: string;
  legenda_imagem?: string;
  autor?: string;
  created_at?: string;
};

type NewsCardProps = {
  noticia: NewsCardItem;
  priority?: boolean;
};

const limparHtmlTotal = (html: string) => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, '') 
    .replace(/&nbsp;/g, ' ')   
    .replace(/&[a-z0-9]+;/gi, (match) => { 
      const entidades: { [key: string]: string } = {
        '&aacute;': 'á', '&eacute;': 'é', '&iacute;': 'í', '&oacute;': 'ó', '&uacute;': 'ú',
        '&atilde;': 'ã', '&otilde;': 'õ', '&ccedil;': 'ç', '&agrave;': 'à', '&circ;': 'â',
        '&ecirc;': 'ê', '&ocirc;': 'ô', '&quot;': '"', '&amp;': '&'
      };
      return entidades[match] || match;
    })
    .replace(/\s+/g, ' ')
    .trim();
};

export default function NewsCard({ noticia, priority = false }: NewsCardProps) {
  if (!noticia) return null;

  const categoria = noticia.categoria || "Geral";
  const slug = noticia.slug || noticia.id;
  
  const tituloLimpo = limparHtmlTotal(noticia.titulo || "");
  
  // AJUSTE AQUI: Prioriza o subtítulo real que o jornalista escreveu
  const resumoExibir = noticia.subtitulo || noticia.resumo || noticia.conteudo || "";
  const resumoLimpo = limparHtmlTotal(resumoExibir);

  const coresCores: { [key: string]: string } = {
    "Política": "border-red-600 text-red-600",
    "Polícia": "border-gray-900 text-gray-900",
    "Saúde": "border-green-600 text-green-600",
    "Esporte": "border-orange-500 text-orange-500",
    "Conceição da Barra": "border-blue-600 text-blue-600",
    "Geral": "border-blue-800 text-blue-800"
  };

  const estiloCategoria = coresCores[categoria] || coresCores["Geral"];
  const imagemFallback = process.env.NEXT_PUBLIC_NEWS_FALLBACK_IMAGE_URL || "https://images.unsplash.com/photo-1504333638930-c8787321eee0?q=80&w=2070&auto=format&fit=crop";
  const imagem = noticia.imagem_url || imagemFallback;

  return (
    <Link 
      href={`/noticia/${slug}`} 
      className="group flex flex-col md:flex-row gap-5 py-6 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-all items-start font-(family-name:--font-inter)"
    >
      {/* Imagem compacta */}
      <div className="w-full md:w-70 shrink-0">
        <div className="relative w-full h-45 overflow-hidden bg-gray-100 rounded-sm">
          <Image 
            src={imagem} 
            alt={tituloLimpo}
            fill
            priority={priority}
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </div>
        {noticia.legenda_imagem && (
          <p className="mt-1 text-[10px] text-gray-500 leading-tight line-clamp-2">
            {noticia.legenda_imagem}
          </p>
        )}
      </div>

      {/* Conteúdo do Texto */}
      <div className="flex flex-col flex-1 h-full pt-1">
        <div className="mb-2">
          <span className={`text-[11px] font-black uppercase tracking-tight border-b-2 ${estiloCategoria} pb-0.5`}>
            {categoria}
          </span>
        </div>

        <h3 className="text-xl md:text-2xl font-black leading-[1.15] text-[#1a1a1a] dark:text-white group-hover:text-blue-700 transition-colors mb-2 tracking-tight">
          {tituloLimpo}
        </h3>

        <p className="text-[14px] md:text-[15px] text-gray-600 dark:text-gray-400 font-normal leading-snug line-clamp-2 md:line-clamp-3">
          {resumoLimpo}
        </p>

        <div className="mt-auto pt-3 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
          <span>Por {noticia.autor || "Redação"}</span>
          <span className="opacity-30">•</span>
          <span>{noticia.created_at ? new Date(noticia.created_at).toLocaleDateString('pt-BR') : "Agora"}</span>
        </div>
      </div>
    </Link>
  );
}