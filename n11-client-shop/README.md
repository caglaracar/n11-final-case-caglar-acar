# n11-client-shop · Sepetify

Müşteri tarafı. **Next.js 15 (App Router) + React 19 + TypeScript + Tailwind + shadcn/ui**.

## Geliştirme

```bash
cp .env.example .env.local
npm install
npm run dev      # http://localhost:3000
```

Backend gateway varsayılanı: `http://localhost:8080`.

## Mimari

```
src/
  app/
    layout.tsx · providers.tsx · globals.css
    page.tsx                       # Home
    products/page.tsx
    products/[id]/page.tsx
    cart/page.tsx · checkout/page.tsx
    auth/{login,register}/page.tsx
    account/page.tsx · account/orders/page.tsx
  features/
    home/components/{Hero,FeaturedProducts}
    products/{api,components,types}
    cart/store.ts
    auth/{api,hooks,store}
  shared/
    components/ui/                 # shadcn primitives
    components/layout/{Header,Footer}
    components/Logo.tsx
    lib/{utils, api/{client,endpoints}}
```

- **`reactStrictMode: false`** → çift istek yok.
- Axios interceptor: bearer token + 401'de otomatik clear + toast.
- TanStack Query: 60s stale, focus refetch kapalı.
- Zustand persist: cart + auth localStorage'da.
- RHF + Zod form/validation.

## Komutlar

| | |
|--|--|
| `npm run dev` | dev sunucu |
| `npm run build` | prod build |
| `npm run start` | prod start |
| `npm run type-check` | TS kontrol |
| `npm run lint` | ESLint |
