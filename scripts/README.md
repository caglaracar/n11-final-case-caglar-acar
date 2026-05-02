# Seed scripts

4 ayrı seed scripti. Hepsi gateway üzerinden (`http://localhost:8080`) çalışır.

## Kullanım

1. Admin olarak login ol, `accessToken` al.
2. Token'ı bir kez ortam değişkenine yaz:
   ```bash
   export ADMIN_TOKEN="<accessToken>"
   ```
   (Veya her komutun başına `ADMIN_TOKEN=... node ...` olarak ekle.)
3. `scripts/data/*.json` dosyalarına datayı doldur (formatları her dosyanın başında örnek var).
4. Sırayla çalıştır:

```bash
node scripts/seed-brands.mjs
node scripts/seed-categories.mjs
node scripts/seed-products.mjs   # categoryName → id otomatik resolve eder
node scripts/seed-banners.mjs
```

Her script: tek tek POST atar, başarılıyı `✓ name` olarak, hatayı `✗ name → message` olarak basar. Sonunda özet (ok / fail) verir.

İsteğe bağlı env:
- `API_BASE` (default `http://localhost:8080`)
