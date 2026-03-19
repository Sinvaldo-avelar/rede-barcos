import { ThemeProvider } from "@/components/theme-provider"; 
import './globals.css';
import { PublicShell } from "@/components/layout/PublicShell";

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
          <PublicShell>{children}</PublicShell>
        </ThemeProvider>
      </body>
    </html>
  );
}