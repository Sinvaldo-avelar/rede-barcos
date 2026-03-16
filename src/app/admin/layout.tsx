
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; // Verifique se o caminho está correto
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  LogOut, 
  Globe, 
  Radio,
  Video
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [autenticado, setAutenticado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // --- TRAVA DE SEGURANÇA ---
  useEffect(() => {
    const verificarSessao = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
      } else {
        setAutenticado(true);
      }
      setCarregando(false);
    };

    verificarSessao();
  }, [router]);

  // --- FUNÇÃO DE LOGOUT (SAIR) ---
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Erro ao sair do painel. Tente novamente.");
      return;
    }

    setAutenticado(false);
    router.replace("/login");
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { name: "Painel Geral", icon: LayoutDashboard, path: "/admin" },
    { name: "Nova Notícia", icon: PlusCircle, path: "/admin/noticias/nova" },
    { name: "Gerenciar Postagens", icon: FileText, path: "/admin/noticias" },
    { name: "Transmissão Ao Vivo", icon: Video, path: "/admin/ao-vivo" },
    { name: "Mídia e Rádio", icon: Radio, path: "/admin/midia" },
  ];

  // Tela de carregamento enquanto verifica se o jornalista está logado
  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eaf5f1]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#003d73] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#003d73] font-bold text-xs uppercase tracking-widest">Verificando Credenciais...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, não renderiza nada (o useEffect já está redirecionando)
  if (!autenticado) return null;

  return (
    <div className="flex min-h-screen bg-[#eaf5f1]">
      {/* SIDEBAR */}
      <aside className="w-56 md:w-56 w-16 bg-linear-to-b from-[#002f5a] to-[#003d73] text-slate-100 flex flex-col fixed inset-0 h-screen min-h-0 shadow-2xl z-50 border-r border-[#d4af37]/30 overflow-y-auto">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#d4af37] rounded-lg flex items-center justify-center text-[#003d73] font-black text-xl shadow-lg shadow-[#d4af37]/30">
              B
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Rede Barcos</h1>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37] font-bold">Portal Admin </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 mt-4">
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest px-4 mb-4">Menu Principal</p>
          
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive(item.path) 
                ? "bg-white text-[#003d73] shadow-lg shadow-black/20" 
                : "hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon size={20} className={isActive(item.path) ? "text-[#003d73]" : "text-white/60 group-hover:text-[#d4af37]"} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm">
            <Globe size={18} />
            Ver Site Público
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/15 hover:text-red-300 transition-colors text-sm text-white/70"
          >
            <LogOut size={18} />
            Sair do Painel
          </button>
        </div>
      </aside>

      <div className="flex-1 md:ml-56 ml-16">
        <header className="h-20 bg-white/95 backdrop-blur border-b border-[#cbdad5] flex items-center justify-between px-10 sticky top-0 z-40">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#003d73]/60 font-bold mb-1">Painel Editorial</p>
            <h2 className="text-[#003d73] font-black text-lg">
              {menuItems.find(item => isActive(item.path))?.name || "Painel de Controle"}
            </h2>
            <button
              onClick={handleLogout}
              className="mt-2 px-4 py-2 rounded-xl bg-[#fff8e8] border border-[#f1ddaa] text-[#7a5a12] text-xs font-black uppercase tracking-widest hover:bg-[#ffefc6] transition-colors"
            >
              Sair
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-bold text-[#003d73]">Redação Principal</p>
              <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-[0.14em]">Jornalista Online</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#003d73] border border-[#002f5a] flex items-center justify-center text-[#d4af37] font-black">
              JB
            </div>
          </div>
        </header>

        <main className="p-10">
          {children}
        </main>
      </div>
    </div>
  );
}