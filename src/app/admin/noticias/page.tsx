"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import SimpleToast from "@/components/ui/SimpleToast";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search,
  ExternalLink
} from "lucide-react";

export default function GerenciarNoticias() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  type NoticiaItem = {
    id: string;
    slug?: string;
    titulo?: string;
    imagem_url?: string;
    created_at: string;
    posicao?: string;
    posicao_destaque?: string;
  };

  const [noticias, setNoticias] = useState<NoticiaItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroPosicao, setFiltroPosicao] = useState("todas");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<"success" | "error" | "warning">("success");

  const normalizarTexto = (valor: string) =>
    (valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  useEffect(() => {
    const buscaUrl = searchParams.get("q") || "";
    const posicaoUrl = searchParams.get("posicao") || "todas";
    const posicaoValida = ["todas", "principal", "slider", "lateral", "feed"].includes(posicaoUrl) ? posicaoUrl : "todas";

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBusca(buscaUrl);
    setFiltroPosicao(posicaoValida);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (busca) params.set("q", busca);
    else params.delete("q");

    if (filtroPosicao !== "todas") params.set("posicao", filtroPosicao);
    else params.delete("posicao");

    const atual = searchParams.toString();
    const proximo = params.toString();

    if (proximo !== atual) {
      router.replace(proximo ? `${pathname}?${proximo}` : pathname, { scroll: false });
    }
  }, [busca, filtroPosicao, pathname, router, searchParams]);

  async function fetchNoticias() {
    setCarregando(true);
    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setNoticias(data || []);
    setCarregando(false);
  }

  // Buscar notícias do banco
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNoticias();
  }, []);

  // Função para deletar notícia
  async function handleDeletar(id: string) {
    if (confirm("Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita.")) {
      const { error } = await supabase.from("noticias").delete().eq("id", id);
      if (error) {
        setToastVariant("error");
        setToastMessage("Erro ao deletar");
      }
      else {
        setToastVariant("success");
        setToastMessage("Notícia excluída com sucesso!");
        fetchNoticias(); // Atualiza a lista
      }
    }
  }

  // Filtrar notícias pela busca
  const noticiasFiltradas = noticias.filter(n => {
    const termoBusca = normalizarTexto(busca);
    const titulo = normalizarTexto(n?.titulo || "");
    const correspondeBusca = titulo.includes(termoBusca);
    const posicaoAtual = n?.posicao || n?.posicao_destaque;
    const correspondePosicao = filtroPosicao === "todas" || posicaoAtual === filtroPosicao;
    return correspondeBusca && correspondePosicao;
  });

  const contagemPosicoes = noticias.reduce((acc, item) => {
    const posicaoAtual = item?.posicao || item?.posicao_destaque;
    if (posicaoAtual === "principal") acc.principal += 1;
    if (posicaoAtual === "slider") acc.slider += 1;
    if (posicaoAtual === "lateral") acc.lateral += 1;
    if (posicaoAtual === "feed") acc.feed += 1;
    return acc;
  }, { principal: 0, slider: 0, lateral: 0, feed: 0 });

  const posicoesVazias = Object.entries(contagemPosicoes)
    .filter(([, total]) => total === 0)
    .map(([posicao]) => posicao);

  function getPosicaoLabel(item: NoticiaItem) {
    const valor = item?.posicao || item?.posicao_destaque;
    if (valor === "principal") return "Principal";
    if (valor === "slider") return "Slider";
    if (valor === "lateral") return "Lateral";
    if (valor === "feed") return "Feed";
    return "-";
  }

  return (
    <div className="space-y-6">
      {/* CABEÇALHO DA PÁGINA */}
      <div className="bg-white border border-[#cbdad5] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#003d73]/60 font-black mb-2">Redação</p>
          <h1 className="text-3xl font-black text-[#003d73]">Gerenciar Postagens</h1>
          <p className="text-[#003d73]/70 text-sm font-medium mt-1">Você tem {noticias.length} notícias publicadas.</p>
        </div>
        
        <Link 
          href="/admin/noticias/nova" 
          className="bg-[#003d73] hover:bg-[#002f5a] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#003d73]/25"
        >
          <Plus size={20} />
          Nova Notícia
        </Link>
      </div>

      {/* BARRA DE BUSCA */}
      <div className="bg-white p-4 rounded-2xl border border-[#cbdad5] shadow-sm flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Search className="text-[#003d73]/40" size={20} />
          <input 
            type="text" 
            placeholder="Buscar pelo título da notícia..." 
            className="flex-1 outline-none text-[#003d73] font-medium placeholder:text-[#003d73]/35"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <select
          value={filtroPosicao}
          onChange={(e) => setFiltroPosicao(e.target.value)}
          className="w-full md:w-48 bg-white border border-[#cbdad5] rounded-xl px-3 py-2 text-sm font-bold text-[#003d73] outline-none"
        >
          <option value="todas">Todas posições</option>
          <option value="principal">Principal</option>
          <option value="slider">Slider</option>
          <option value="lateral">Lateral</option>
          <option value="feed">Feed</option>
        </select>
      </div>

      {posicoesVazias.length > 0 && (
        <div className="bg-[#fff8e8] border border-[#f1ddaa] rounded-2xl px-4 py-3">
          <p className="text-[#7a5a12] text-sm font-bold">
            Posições sem notícia: {posicoesVazias.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(", ")}
          </p>
        </div>
      )}

      {/* TABELA DE NOTÍCIAS */}
      <div className="bg-white rounded-2xl border border-[#cbdad5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#eaf5f1] border-b border-[#cbdad5]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-[#003d73]/60 tracking-widest">Capa</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-[#003d73]/60 tracking-widest">Título / Data</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-[#003d73]/60 tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef3f1]">
              {carregando ? (
                <tr><td colSpan={3} className="p-10 text-center text-[#003d73]/55 font-medium">Carregando notícias...</td></tr>
              ) : noticiasFiltradas.length === 0 ? (
                <tr><td colSpan={3} className="p-10 text-center text-[#003d73]/55 font-medium">Nenhuma notícia encontrada.</td></tr>
              ) : (
                noticiasFiltradas.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f7fbfa] transition-colors group">
                    <td className="px-6 py-4 w-24">
                      {item.imagem_url ? (
                        <div className="relative w-16 h-12 rounded-lg shadow-sm border border-[#cbdad5] overflow-hidden">
                          <Image 
                            src={item.imagem_url} 
                            alt="Capa" 
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-12 bg-[#eef5f2] rounded-lg flex items-center justify-center text-[#003d73]/40">
                          -
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[#003d73] line-clamp-1 group-hover:text-[#002f5a] transition-colors">
                        {item.titulo}
                      </p>
                      <p className="mt-2">
                        <span className="inline-flex items-center rounded-full bg-[#eaf5f1] border border-[#cbdad5] px-2 py-0.5 text-[10px] font-bold uppercase text-[#003d73]/80">
                          Posição: {getPosicaoLabel(item)}
                        </span>
                      </p>
                      <p className="text-[10px] text-[#003d73]/50 font-medium mt-1 uppercase">
                        {new Date(item.created_at).toLocaleDateString('pt-BR')} às {new Date(item.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          href={`/noticia/${item.slug || item.id}`}
                          target="_blank"
                          className="p-2 text-[#003d73]/45 hover:text-[#003d73] hover:bg-[#eaf5f1] rounded-lg transition-all"
                          title="Visualizar no site"
                        >
                          <ExternalLink size={18} />
                        </Link>
                        <Link 
                          href={`/admin/noticias/editar/${item.id}`}
                          className="p-2 text-[#003d73]/45 hover:text-[#7a5a12] hover:bg-[#fff8e8] rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDeletar(item.id)}
                          className="p-2 text-[#003d73]/45 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SimpleToast
        message={toastMessage}
        variant={toastVariant}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}