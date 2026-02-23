/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com', // Lägg till denna rad!
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;