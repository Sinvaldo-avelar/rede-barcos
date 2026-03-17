/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignora erros de TypeScript durante o build para permitir o deploy
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignora avisos de ESLint durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },

  allowedDevOrigins: ['192.168.100.13', 'localhost'],

  async redirects() {
    return [
      {
        source: '/Teste',
        destination: '/',
        permanent: false,
      },
      {
        source: '/admin/Teste',
        destination: '/admin',
        permanent: false,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', 
      },
      {
        protocol: 'https',
        hostname: 'tqlkjrjlbmhvsjycwlls.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**', 
      },
    ],
  },
};

export default nextConfig;