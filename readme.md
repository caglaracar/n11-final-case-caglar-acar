# Sepetify — n11 Bootcamp Final Projesi

Spring Boot tabanlı mikroservis mimarisiyle geliştirilmiş e-ticaret uygulaması.

## Mimari

9 mikroservis, Spring Cloud Gateway üzerinden tek giriş noktasıyla dışarıya açılıyor. Servisler arası senkron iletişim OpenFeign, asenkron iletişim Kafka ile sağlanıyor.

```
Gateway (:8080)
├── auth-service     (:9090)  PostgreSQL
├── user-service     (:9091)  MongoDB
├── product-service  (:9092)  MongoDB
├── basket-service   (:9093)  Redis
├── order-service    (:9094)  PostgreSQL
├── payment-service  (:9095)  PostgreSQL  (İyzico Sandbox)
├── notification-service (:9096)  Gmail SMTP + Slack
└── discovery-service  (:8761)  Eureka
```

Ödeme akışı Kafka choreography saga ile yönetiliyor: sipariş oluşturulduğunda ödeme servisi tetikleniyor, sonuca göre sipariş durumu güncelleniyor ve bildirim gönderiliyor.

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Backend | Java 17, Spring Boot 3.3.1, Spring Cloud 2023.0.x |
| Veritabanları | PostgreSQL, MongoDB, Redis |
| Mesajlaşma | Apache Kafka (Confluent Cloud) |
| Ödeme | İyzico Sandbox |
| Frontend (Shop) | Next.js 15, TypeScript, Tailwind CSS |
| Frontend (Admin) | React + Vite, TypeScript, Tailwind CSS |
| CI/CD | GitHub Actions, Google Cloud Run, Artifact Registry |

## Hızlı Başlangıç

```bash
# Altyapıyı kaldır
docker compose up -d

# Servisleri sırayla başlat (detay için RUNBOOK.md)
mvn -pl discovery-service spring-boot:run
mvn -pl auth-service spring-boot:run
# ... diğer servisler
mvn -pl gateway-service spring-boot:run
```

Eureka: http://localhost:8761  
MailHog: http://localhost:8025  
Gateway: http://localhost:8080

## Testler

Servis katmanında JUnit 5 + Mockito ile unit testler yazıldı. Spring context yüklenmeden çalışır.

```bash
# Tüm modülleri test et
mvn test

# Belirli bir servis
mvn -pl order-service test

# Tek test sınıfı
mvn -pl auth-service test -Dtest=AuthServiceImplTest
```

Kapsanan servisler: `auth-service`, `basket-service`, `order-service`, `payment-service`

## Canlı Ortam

| Uygulama | URL |
|----------|-----|
| Shop | https://sepetify-shop.vercel.app |
| Admin | https://sepetify-admin.vercel.app |
