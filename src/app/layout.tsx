import { ThemeProvider } from "@/components/theme-provider"; 
import './globals.css';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdBanner } from "@/components/layout/AdBanner";
import { LiveBar } from "@/components/layout/LiveBar";
import { RadioDock } from "@/components/ui/RadioDock";

// 1. IMPORTANDO AS FONTES DO GOOGLE
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata = {
  title: 'Rede Barcos | Portal de Notícias',
  description: 'Informação com clareza e design.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      {/* 2. APLICANDO AS VARIÁVEIS NO BODY */}
      <body className={`${inter.variable} ${playfair.variable} flex flex-col min-h-screen transition-colors duration-300 antialiased bg-white dark:bg-[#0f172a] relative`}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <LiveBar />
          <AdBanner/>
          <RadioDock />
          
          <main className="grow pt-8">
            {children}
            <Footer/>
          </main>

          <footer className="border-t py-12 mt-20 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm font-serif italic">
              © 2026 Rede Barcos. Onde o design encontra a notícia.
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}