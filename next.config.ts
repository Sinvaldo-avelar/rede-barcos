/** @type {import('next').NextConfig} */
const nextConfig = {
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
        hostname: 'images.unsplash.com', // Autoriza o site das fotos de teste
      },
      {
        protocol: 'https',
        hostname: '**', // Autoriza QUALQUER outro site (seguro para a fase de criação)
      },
    ],
  },
};

export default nextConfig;