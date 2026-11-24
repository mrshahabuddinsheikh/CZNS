/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'store.storeimages.cdn-apple.com',
      'www.apple.com',
      'images.samsung.com',
      'lh3.googleusercontent.com',
      'localhost',
      'czns.pk'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    NEXT_PUBLIC_STORE_NAME: 'CZNS',
    NEXT_PUBLIC_STORE_PHONE: '+923001234567',
  },
};

export default nextConfig;
