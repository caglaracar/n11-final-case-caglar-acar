# LUXE E-Ticaret Projesi - Bootcamp

## 1. Proje Açıklaması
Premium ve modern bir çok kategorili e-ticaret web sitesi. Elektronik, ev & yaşam, moda, güzellik, spor, kitap ve daha fazlası. Hedef: A'dan Z'ye tam bir e-ticaret deneyimi + Admin Panel.

## 2. Müşteri Sayfa Yapısı (Frontend)
- `/` - Ana Sayfa (Hero + Kategoriler + Öne Çıkan Ürünler + Kampanyalar + Markalar + Newsletter)
- `/products` - Ürün Listesi (Filtreleme, Sıralama, Sayfalama)
- `/product/:id` - Ürün Detayı (Galeri, Yorumlar, Benzer Ürünler)
- `/basket` - Alışveriş Sepeti
- `/checkout` - Ödeme Akışı (Shipping → Payment → Onay)
- `/login` - Giriş / Kayıt
- `/account` - Hesabım (Profil, Siparişler, Wishlist, Ayarlar)
- `/about` - Hakkımızda
- `/contact` - İletişim
- `/faq` - Sıkça Sorulan Sorular
- `/blog` - Blog / İçerik
- `/search` - Arama Sonuçları
- `/track-order` - Sipariş Takibi

## 3. Admin Panel Sayfa Yapısı
- `/admin` - Dashboard (İstatistikler, Grafikler, Son Siparişler)
- `/admin/products` - Ürün Yönetimi (CRUD, Stok, Kategori)
- `/admin/orders` - Sipariş Yönetimi (Durum, Detay, Fatura)
- `/admin/customers` - Müşteri Yönetimi (Liste, Detay, İstatistik)

## 4. Temel Özellikler
- [x] Kullanıcı kayıt/giriş sistemi (UI)
- [x] Ürün listeleme, filtreleme, sıralama
- [x] Ürün detay sayfası
- [x] Sepet yönetimi
- [x] Ödeme akışı
- [x] Admin panel (Dashboard, Ürünler, Siparişler, Müşteriler)
- [ ] Supabase bağlantısı
- [ ] Stripe ödeme entegrasyonu
- [ ] Gerçek veritabanı

## 5. Veri Modeli
(Supabase bağlandıktan sonra tanımlanacak)

## 6. Backend / Üçüncü Taraf Entegrasyonları
- Supabase: Kullanıcı yetkilendirme, veritabanı, Edge Functions
- Shopify: Ürün entegrasyonu (isteğe bağlı)
- Stripe: Ödeme işlemleri (isteğe bağlı)

## 7. Geliştirme Aşamaları

### Aşama 1: UI Tasarımı (Tamamlandı)
- Tüm müşteri sayfaları
- Admin panel sayfaları
- Mock data ile çalışan frontend

### Aşama 2: Backend Entegrasyonu
- Supabase bağlantısı
- Kullanıcı sistemi
- Veritabanı

### Aşama 3: Ödeme ve Tamamlama
- Stripe entegrasyonu
- Sipariş yönetimi
- Tam çalışan sistem
