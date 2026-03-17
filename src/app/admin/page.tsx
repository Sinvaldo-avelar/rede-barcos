"use client";
import { 
  Newspaper, 
  Image as ImageIcon, 
  PlusCircle, 
  Settings, 
  BarChart3, 
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  Radio
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const menuItems = [
    {
      title: "Notícias",
      description: "Gerenciar matérias, artigos e reportagens.",
      icon: <Newspaper size={32} className="text-[#003d73]" />,
      link: "/admin/noticias",
      color: "hover:border-[#003d73]/30",
      btnColor: "bg-[#003d73] hover:bg-[#002f5a]"
    },
    {
      title: "Banners & Anúncios",
      description: "Gerenciar publicidade e avisos do portal.",
      icon: <ImageIcon size={32} className="text-[#003d73]" />,
      link: "/admin/banners",
      color: "hover:border-[#003d73]/30",
      btnColor: "bg-[#003d73] hover:bg-[#002f5a]"
    },
    {
      title: "Transmissão Ao Vivo",
      description: "Controlar o alerta da live e o link principal do YouTube.",
      icon: <Radio size={32} className="text-red-700" />,
      link: "/admin/ao-vivo",
      color: "hover:border-red-200",
      btnColor: "bg-red-700 hover:bg-red-800"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* CABEÇALHO */}
      <div className="bg-white border border-[#cbdad5] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm">
        <div>
          <p className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black text-[#003d73]/70 mb-3">
            <Sparkles size={12} className="text-[#d4af37]" />
            Centro de comando
          </p>
          <h1 className="text-4xl font-black text-[#003d73] flex items-center gap-3">
            <LayoutDashboard size={36} className="text-[#d4af37]" />
            Painel Geral
          </h1>
          <p className="text-[#003d73]/70 mt-2 font-medium">Bem-vindo de volta! O que vamos gerenciar hoje?</p>
        </div>
        
        <div className="flex gap-2">
          <div className="bg-[#eaf5f1] p-2 rounded-lg text-[#003d73] border border-[#cbdad5]">
            <BarChart3 size={20} />
          </div>
          <div className="bg-[#eaf5f1] p-2 rounded-lg text-[#003d73] border border-[#cbdad5]">
            <Settings size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Principal", value: "1" },
          { label: "Slider", value: "3" },
          { label: "Lateral", value: "6" },
          { label: "Feed", value: "Livre" },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-[#cbdad5] rounded-2xl px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#003d73]/60">Posição</p>
            <p className="text-sm font-black text-[#003d73] mt-1">{item.label}</p>
            <p className="text-xs text-[#003d73]/70 mt-1">Capacidade: {item.value}</p>
          </div>
        ))}
      </div>

      {/* CARDS DE ACESSO RÁPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {menuItems.map((item, index) => (
          <div 
            key={index}
            className={`bg-white border-2 border-[#cbdad5] rounded-3xl p-8 transition-all duration-300 shadow-sm ${item.color} group`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-[#eaf5f1] border border-[#cbdad5] rounded-2xl group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <Link 
                href={item.link === "/admin/noticias" ? "/admin/noticias/nova" : item.link}
                className="text-[#003d73]/40 hover:text-[#003d73] transition-colors"
                title="Criar Novo"
              >
                <PlusCircle size={28} />
              </Link>
            </div>

            <h2 className="text-2xl font-bold text-[#003d73]">{item.title}</h2>
            <p className="text-[#003d73]/70 mt-2 mb-8 leading-relaxed">
              {item.description}
            </p>

            <Link 
              href={item.link}
              className={`inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-bold transition-all shadow-lg active:scale-95 ${item.btnColor}`}
            >
              Ver Todos os Registros
              <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </div>

      {/* RODAPÉ INFORMATIVO */}
      <div className="bg-linear-to-r from-[#003d73] to-[#002f5a] rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative border border-[#d4af37]/30">
        <div className="relative z-10">
          <h3 className="text-xl font-bold italic">Dica de Redação</h3>
          <p className="text-white/80 text-sm mt-1">Use título objetivo e subtítulo claro para melhorar abertura e permanência na matéria.</p>
        </div>
          <div className="opacity-10 absolute -right-5 -bottom-5 rotate-12 text-[#d4af37]">
           <Newspaper size={140} />
        </div>
      </div>
    </div>
  );
}