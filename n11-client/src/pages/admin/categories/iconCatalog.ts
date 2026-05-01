/**
 * Admin kategori formu için curated Remix Icon kataloğu.
 * Sıra önemli — en sık kullanılanlar üstte.
 */
export const CATEGORY_ICON_CATALOG: { group: string; icons: string[] }[] = [
  {
    group: 'Popüler',
    icons: [
      'ri-cpu-line',
      'ri-smartphone-line',
      'ri-computer-line',
      'ri-tv-line',
      'ri-headphone-line',
      'ri-camera-line',
      'ri-gamepad-line',
      'ri-shopping-bag-line',
      'ri-shirt-line',
      'ri-handbag-line',
      'ri-footprint-line',
      'ri-store-2-line',
    ],
  },
  {
    group: 'Ev & Yaşam',
    icons: [
      'ri-home-2-line',
      'ri-home-smile-line',
      'ri-sofa-line',
      'ri-restaurant-line',
      'ri-fridge-line',
      'ri-paint-brush-line',
      'ri-plant-line',
      'ri-lightbulb-line',
      'ri-tools-line',
      'ri-hammer-line',
      'ri-leaf-line',
      'ri-water-flash-line',
    ],
  },
  {
    group: 'Moda & Aksesuar',
    icons: [
      'ri-t-shirt-line',
      'ri-t-shirt-2-line',
      'ri-handbag-line',
      'ri-suitcase-line',
      'ri-vip-crown-line',
      'ri-ring-line',
      'ri-glasses-line',
      'ri-shirt-line',
    ],
  },
  {
    group: 'Spor & Outdoor',
    icons: [
      'ri-football-line',
      'ri-basketball-line',
      'ri-bike-line',
      'ri-run-line',
      'ri-boxing-line',
      'ri-ping-pong-line',
      'ri-walk-line',
      'ri-mountain-line',
    ],
  },
  {
    group: 'Güzellik & Sağlık',
    icons: [
      'ri-magic-line',
      'ri-heart-pulse-line',
      'ri-medicine-bottle-line',
      'ri-emotion-happy-line',
      'ri-flask-line',
      'ri-scissors-line',
      'ri-spy-line',
      'ri-mental-health-line',
    ],
  },
  {
    group: 'Çocuk & Oyuncak',
    icons: [
      'ri-bear-smile-line',
      'ri-gamepad-2-line',
      'ri-puzzle-line',
      'ri-cake-2-line',
      'ri-music-2-line',
      'ri-pencil-ruler-2-line',
    ],
  },
  {
    group: 'Kitap & Hobi',
    icons: [
      'ri-book-2-line',
      'ri-book-open-line',
      'ri-pencil-line',
      'ri-quill-pen-line',
      'ri-palette-line',
      'ri-camera-3-line',
      'ri-music-line',
      'ri-mic-line',
    ],
  },
  {
    group: 'Otomotiv & Araç',
    icons: [
      'ri-car-line',
      'ri-roadster-line',
      'ri-motorbike-line',
      'ri-truck-line',
      'ri-gas-station-line',
      'ri-steering-2-line',
    ],
  },
  {
    group: 'Süpermarket & Yiyecek',
    icons: [
      'ri-shopping-cart-line',
      'ri-shopping-basket-line',
      'ri-cup-line',
      'ri-cake-line',
      'ri-restaurant-2-line',
      'ri-goblet-line',
    ],
  },
  {
    group: 'Diğer',
    icons: [
      'ri-gift-line',
      'ri-flashlight-line',
      'ri-medal-line',
      'ri-fire-line',
      'ri-flag-line',
      'ri-price-tag-3-line',
      'ri-percent-line',
      'ri-star-line',
      'ri-bookmark-line',
      'ri-apps-line',
    ],
  },
];

export const ALL_CATEGORY_ICONS = Array.from(
  new Set(CATEGORY_ICON_CATALOG.flatMap((g) => g.icons))
);
