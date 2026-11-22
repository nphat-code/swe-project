import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BrewLite — Đặt cà phê không dùng tiền mặt',
    short_name: 'BrewLite',
    description: 'Ứng dụng đặt đồ uống trực tuyến không dùng tiền mặt BrewLite.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f5f0',
    theme_color: '#006241',
    lang: 'vi',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}

