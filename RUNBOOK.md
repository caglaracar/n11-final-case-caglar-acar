# Çalıştırma Rehberi

## Gereksinimler

- JDK 17, Maven 3.9+, Docker Desktop

## Lokal Başlatma

```bash
docker compose up -d
mvn -B -ntp clean package -DskipTests
```

Servis başlatma sırası (Eureka önce, gateway en son):

```bash
mvn -pl discovery-service spring-boot:run
mvn -pl auth-service spring-boot:run &
mvn -pl user-service spring-boot:run &
mvn -pl product-service spring-boot:run
mvn -pl basket-service spring-boot:run
mvn -pl order-service spring-boot:run
mvn -pl payment-service spring-boot:run
mvn -pl notification-service spring-boot:run
mvn -pl gateway-service spring-boot:run
```

Alternatif olarak `mprocs` çalıştırılabilir.

## Swagger UI

| Servis | URL |
|--------|-----|
| auth | http://localhost:9090/swagger-ui.html |
| user | http://localhost:9091/swagger-ui.html |
| product | http://localhost:9092/swagger-ui.html |
| basket | http://localhost:9093/swagger-ui.html |
| order | http://localhost:9094/swagger-ui.html |
| payment | http://localhost:9095/swagger-ui.html |

## Frontend

```bash
cd n11-client-shop && npm run dev   # http://localhost:3000
cd n11-client-admin && npm run dev  # http://localhost:5173
```

## Sık Karşılaşılan Sorunlar

**Kafka bağlanamıyor** — `docker compose up -d kafka` ile container'ın ayakta olduğunu doğrula.

**Servis Eureka'ya kayıt olmadı** — `defaultZone: http://localhost:8761/eureka/` ayarını kontrol et; discovery-service en az 15 saniye önce çalışıyor olmalı.

**Gateway 401** — Endpoint whitelist'te değilse `Authorization: Bearer <token>` header'ı zorunlu.

**PostgreSQL "database does not exist"** — `docker compose down -v && docker compose up -d` ile volume'u sıfırla.
