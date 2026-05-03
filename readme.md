# Sepetify — n11 Bootcamp Final Projesi

Spring Boot tabanlı mikroservis mimarisiyle geliştirilmiş tam fonksiyonlu e-ticaret uygulaması.

## Mimari

10 mikroservis, Spring Cloud Gateway üzerinden tek giriş noktasıyla dışarıya açılıyor. Servisler arası senkron iletişim OpenFeign, ödeme saga'sı için asenkron iletişim Kafka ile sağlanıyor.

```
Gateway (:8080)
├── auth-service          (:9090)  PostgreSQL
├── user-service          (:9091)  MongoDB
├── product-service       (:9092)  MongoDB
├── basket-service        (:9093)  MongoDB
├── stock-service         (:9097)  MongoDB
├── order-service         (:9094)  PostgreSQL
├── payment-service       (:9095)  PostgreSQL  (İyzico Sandbox)
├── notification-service  (:9096)  Gmail SMTP + Slack
└── discovery-service     (:8761)  Eureka
```

**Ödeme akışı (Kafka Saga):**
```
payment-service → payment.completed / payment.failed → order-service
```

**Bildirim akışı (direkt HTTP):**
```
order-service → POST /notification/order-confirmed → notification-service → Gmail + Slack
```

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Backend | Java 17, Spring Boot 3.3.1, Spring Cloud 2023.0.x |
| Veritabanları | PostgreSQL (auth/order/payment), MongoDB (user/product/basket/stock) |
| Mesajlaşma | Apache Kafka — Confluent Cloud (sadece ödeme saga'sı) |
| Ödeme | İyzico Sandbox |
| Frontend (Shop) | Next.js 15, TypeScript, Tailwind CSS |
| Frontend (Admin) | React + Vite, TypeScript, Tailwind CSS |
| CI/CD | GitHub Actions → Google Cloud Run + Artifact Registry |

## Servis Sorumlulukları

| Servis | Sorumluluk |
|--------|------------|
| **auth-service** | JWT access/refresh token, BCrypt, register/login/logout |
| **user-service** | Kullanıcı profili CRUD, adres yönetimi |
| **product-service** | Ürün/kategori/marka/banner CRUD, arama, kampanya |
| **basket-service** | Sepet işlemleri (ekle/çıkar/güncelle/temizle) |
| **stock-service** | Stok yönetimi, atomik rezervasyon ve iade |
| **order-service** | Sipariş oluşturma, ödeme saga koordinatörü |
| **payment-service** | İyzico ödeme başlatma ve callback işleme |
| **notification-service** | Sipariş onay maili (Gmail) + Slack bildirimi |
| **discovery-service** | Eureka Service Registry |
| **gateway-service** | JWT doğrulama, CORS, route yönetimi |

## Hızlı Başlangıç

```bash
# Altyapıyı başlat (PostgreSQL, MongoDB, Redis, Kafka)
docker compose up -d

# Servisleri sırayla başlat (detay için RUNBOOK.md)
mvn -pl discovery-service spring-boot:run
mvn -pl auth-service spring-boot:run
mvn -pl user-service spring-boot:run
mvn -pl product-service spring-boot:run
mvn -pl basket-service spring-boot:run
mvn -pl stock-service spring-boot:run
mvn -pl order-service spring-boot:run
mvn -pl payment-service spring-boot:run
mvn -pl notification-service spring-boot:run
mvn -pl gateway-service spring-boot:run
```

Eureka: http://localhost:8761  
Gateway: http://localhost:8080

## Testler

JUnit 5 + Mockito ile servis katmanı unit testleri. Spring context yüklenmeden çalışır.

```bash
# Tüm modülleri test et
mvn test

# Belirli bir servis
mvn -pl order-service test

# Tek test sınıfı
mvn -pl auth-service test -Dtest=AuthServiceImplTest
```

Kapsanan servisler: `auth-service`, `basket-service`, `order-service`, `payment-service`, `user-service`, `stock-service`

## Canlı Ortam

| Uygulama | URL |
|----------|-----|
| Shop | https://sepetify-shop.vercel.app |
| Admin | https://sepetify-admin.vercel.app |
