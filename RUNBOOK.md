# n11 Bootcamp — Faz Planı & Çalıştırma Rehberi

Bu doküman projenin **5 fazlık ilerleyişini** ve **lokal nasıl ayağa kalktığını** anlatır.

---

## 🗺️ Mimari Özet

```
                    ┌─────────────────────┐
                    │   gateway-service   │  :8080  (Spring Cloud Gateway, JWT filter)
                    └──────────┬──────────┘
                               │
   ┌───────────────┬───────────┼─────────────┬───────────────┬────────────────┐
   ▼               ▼           ▼             ▼               ▼                ▼
auth-svc      user-svc    product-svc    basket-svc       order-svc       payment-svc   notification-svc
 :9090         :9091        :9092         :9093          :9094            :9095            :9096
Postgres       Mongo        Mongo         Redis         Postgres         Postgres         (DB yok)
                                                       └──── Kafka choreography saga ────┘

                 ┌──────────────────────────────────────────────────────┐
                 │  discovery-service (Eureka)  :8761                   │
                 └──────────────────────────────────────────────────────┘
```

Servisler arası **senkron**: REST + OpenFeign + Eureka load balancing.
Servisler arası **asenkron**: Kafka (`order.created`, `payment.completed/failed`, `stock.reserve.requested/failed`, `notification.email/slack`).

---

## 📅 Faz Planı

### ✅ Faz 1 — Temel & Auth/User (Tamamlandı)

**Hedef**: Ortak altyapı + kimlik doğrulama omurgası.

- `common` — BaseEntity/BaseDocument, BaseResponse, BaseController, GlobalExceptionHandler, OpenApiConfig (bearerAuth), `MyGenericRepository`, `JwtTokenManager`, `RestApis`/`KafkaTopics`, event record'ları.
- `discovery-service` — Eureka Server (`:8761`).
- `auth-service` — Postgres `authdb`, BCrypt, JWT (access 15dk + refresh 14gün, rotation), Feign ile `user-service`'e profile create.
- `user-service` — Mongo `UserProfileDB`, `BaseDocument` + auditing, `/me`, paginated search.

**Çıktı**: register → login → refresh → logout akışı çalışır; `X-User-Id` header pattern'i hazır.

---

### ✅ Faz 2 — Edge & Catalog & Basket (Tamamlandı)

**Hedef**: Dış dünyaya açılan kapı + ürün katalogu + sepet.

- `gateway-service` — Spring Cloud Gateway (reactive), `JwtAuthFilter`, CORS, whitelist (register/login/refresh + product find-all/find-by-id + swagger). `lb://service-name` ile route. Downstream'e `X-User-Id`/`X-User-Role` enjekte eder.
- `product-service` — Mongo `ProductDB`, Category + Product, paginated CRUD, `StockSagaConsumer` (`stock.reserve.requested` → fail durumunda `stock.reserve.failed` publish).
- `basket-service` — Redis (`basket:{authId}` key, TTL 1 gün), GenericJackson serializer, add/update/remove/clear API'ları.

**Çıktı**: Kullanıcı gateway üzerinden ürün listeleyebilir, sepete ürün atabilir.

---

### ✅ Faz 3 — Order/Payment/Notification & Saga (Tamamlandı)

**Hedef**: Sipariş & ödeme akışı + olay tabanlı bildirim.

- `order-service` — Postgres `orderdb`, `Order` + `OrderItem` + `OrderStatus` enum (state machine: `CREATED → PAYMENT_PENDING → PAID/FAILED/CANCELLED → SHIPPED → DELIVERED`). Sipariş oluşturulduğunda `order.created` ve `stock.reserve.requested` publish. `OrderSagaConsumer` ödemeden gelen sonuca göre status günceller.
- `payment-service` — Postgres `paymentdb`. **Strategy** pattern (`PaymentProvider` arayüzü + `MockPaymentProvider` `@ConditionalOnProperty`). **Idempotency**: aynı `orderId` için tekrar charge yapmaz. `order.created` consume → charge → `payment.completed` veya `payment.failed` publish.
- `notification-service` — DB yok. Kafka consumer'lar: `notification.email` → JavaMailSender (MailHog dev), `notification.slack` → webhook RestTemplate, ayrıca `order.created`/`payment.completed`/`payment.failed`'i gözlemleyip Slack'e bildirir.

**Çıktı**: `POST /dev/v1/order/create` çağrısı → choreography saga başlar → siparişin durumu kendiliğinden ilerler.

---

### 🔜 Faz 4 — Gözlemlenebilirlik & Quality

**Hedef**: Production-ready hijyen.

- ELK stack: Logstash encoder, central logging.
- Spring Boot Actuator + Micrometer + Prometheus + Grafana dashboards.
- Sleuth/Micrometer Tracing + Zipkin (dağıtık trace).
- Test piramidi: JUnit 5 unit, Testcontainers ile entegrasyon (Postgres/Mongo/Redis/Kafka), MockMvc/WebTestClient API testleri, Cucumber BDD.
- SonarQube quality gate, JaCoCo coverage.
- Resilience4j: circuit breaker (Feign), retry, bulkhead, rate limiter.

---

### 🔜 Faz 5 — DevOps & Deploy

**Hedef**: CI/CD + container orkestrasyonu.

- Dockerfile per service (multi-stage build: Maven → JRE 17 slim).
- Docker Compose **prod** profili (uygulamalar + altyapı tek dosyada).
- Kubernetes manifests (`Deployment`, `Service`, `ConfigMap`, `Secret`, `Ingress`).
- GitHub Actions: lint → test → build → docker push → deploy.
- Spring Cloud Config Server + Vault opsiyonel.
- Iyzico gerçek entegrasyonu (`PaymentProvider` strategy ile drop-in).

---

## 🚀 Lokal Çalıştırma

### 1) Ön gereksinimler

| Araç | Versiyon |
|------|----------|
| JDK  | 17 |
| Docker Desktop | son sürüm |
| Maven | 3.9+ |

### 2) Altyapıyı başlat

```bash
docker compose up -d
```

Bu komut şunları kaldırır:

| Servis | Port | Not |
|--------|------|-----|
| Postgres | 5432 | `authdb`, `orderdb`, `paymentdb` otomatik oluşturulur |
| Mongo | 27017 | `UserProfileDB`, `ProductDB` ilk yazımda oluşur |
| Redis | 6379 | sepet TTL'li |
| Kafka | 9094 (host) / 9092 (container) | auto-create topics açık |
| Zookeeper | 2181 | |
| MailHog SMTP | 1025 | UI: http://localhost:8025 |

### 3) Build

```bash
mvn -B -ntp clean package -DskipTests
```

> Build tek seferde yapıldığında her servis için çalıştırılabilir bir Spring Boot jar üretir (`<service>/target/*.jar`).

### 4) Servis başlatma sırası

⚠️ **Sıra önemli** — Eureka önce ayakta olmalı, gateway en son.

```bash
# 1) Discovery
mvn -pl discovery-service -am spring-boot:run

# 2) Auth & User (paralel başlatabilirsin)
mvn -pl auth-service -am spring-boot:run
mvn -pl user-service -am spring-boot:run

# 3) Catalog & Basket
mvn -pl product-service -am spring-boot:run
mvn -pl basket-service -am spring-boot:run

# 4) Saga ekibi
mvn -pl order-service -am spring-boot:run
mvn -pl payment-service -am spring-boot:run
mvn -pl notification-service -am spring-boot:run

# 5) Edge
mvn -pl gateway-service -am spring-boot:run
```

> **IntelliJ tip**: her bir `XxxApplication.java` üzerinde sağ tık → Run, ya da Run Configurations'a 9'unu ekleyip `Compound` config oluştur.

### 5) Eureka panel

http://localhost:8761 — 8 client servisin de **UP** olduğunu gör.

### 6) Swagger UI

| Servis | Swagger |
|--------|---------|
| auth-service        | http://localhost:9090/swagger-ui.html |
| user-service        | http://localhost:9091/swagger-ui.html |
| product-service     | http://localhost:9092/swagger-ui.html |
| basket-service        | http://localhost:9093/swagger-ui.html |
| order-service       | http://localhost:9094/swagger-ui.html |
| payment-service     | http://localhost:9095/swagger-ui.html |

### 7) Smoke test (gateway üzerinden)

```bash
BASE=http://localhost:8080

# 1) register
curl -X POST $BASE/dev/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"a@a.com","password":"Pass1234!","rePassword":"Pass1234!","firstName":"Ali","lastName":"V"}'

# 2) login → token al
TOKEN=$(curl -s -X POST $BASE/dev/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@a.com","password":"Pass1234!"}' | jq -r '.data.accessToken')

# 3) ürün ara (whitelisted, token gerekmez)
curl "$BASE/dev/v1/product/find-all?page=0&size=10"

# 4) sepete ekle
curl -X POST $BASE/dev/v1/basket/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"p1","productName":"iPhone","quantity":1,"unitPrice":50000}'

# 5) sipariş oluştur (saga başlar)
curl -X POST $BASE/dev/v1/order/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currency":"TRY","items":[{"productId":"p1","productName":"iPhone","quantity":1,"unitPrice":50000}]}'

# 6) MailHog UI'da gelen bildirimi izle
open http://localhost:8025
```

### 8) Kapatma

```bash
# servisleri Ctrl+C ile durdur, sonra:
docker compose down
# verileri silmek istersen:
docker compose down -v
```

---

## 🧰 Sık karşılaşılan sorunlar

| Sorun | Çözüm |
|-------|-------|
| `Connection refused` Kafka | `docker compose up -d kafka zookeeper` çalıştığını doğrula; advertised listener `localhost:9094` |
| Mongo auth hatası | dev'de auth kapalı; `mongo://localhost:27017/UserProfileDB` |
| Postgres `database does not exist` | `docker volume rm n11-patika-final-case_postgres-data && docker compose up -d postgres` (ilk init script tetiklenir) |
| Eureka client görünmüyor | servis `application.yml` içinde `defaultZone: http://localhost:8761/eureka/` doğru mu? |
| Gateway 401 | endpoint whitelist'te değilse `Authorization: Bearer ...` header'ı şart |
