"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdBanner } from "@/components/layout/AdBanner";
import { LiveBar } from "@/components/layout/LiveBar";
import { RadioDock } from "@/components/ui/RadioDock";
import { usePathname } from "next/navigation";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminArea = pathname?.startsWith("/admin");

  if (isAdminArea) {
    return <main className="grow">{children}</main>;
  }

  return (
    <>
      <Header />
      <LiveBar />
      <AdBanner />
      <RadioDock />

      <main className="grow pt-8">
        {children}
        <Footer />
      </main>

      <footer className="border-t py-12 mt-20 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm font-serif italic">
          © 2026 Rede Barcos. Onde o design encontra a notícia.
        </div>
      </footer>
    </>
  );
}
