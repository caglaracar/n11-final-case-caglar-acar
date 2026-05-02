# n11-client-admin

Sepetify yönetim paneli. **Vite + React 19 + TypeScript + Tailwind + shadcn/ui**.

## Geliştirme

```bash
cp .env.example .env
npm install
npm run dev      # http://localhost:5174
```

Backend gateway varsayılanı: `http://localhost:8080`.

## Mimari

```
src/
  features/                  # her feature kendi içinde tam
    auth/{api,components,hooks,pages,store}
    dashboard/pages
    products/{api,hooks,pages,types}
    orders|users|categories/pages
  shared/
    components/
      ui/                    # shadcn primitives
      layout/                # AppShell, PageHeader
      Logo.tsx
    lib/
      api/{client,endpoints,query}
      utils.ts
```

- **StrictMode kapalı** → çift istek yok.
- **Axios** interceptor: bearer token + 401'de otomatik logout + toast'lı error.
- **TanStack Query** tek kaynak; 30s stale.
- **Zustand** auth store (localStorage persist).
- **react-hook-form + zod** form/doğrulama.

## Komutlar

| | |
|--|--|
| `npm run dev` | dev sunucu |
| `npm run build` | prod build |
| `npm run type-check` | TS kontrol |
| `npm run lint` | ESLint |
