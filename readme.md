# n11 E-Ticaret Bootcamp — Teknoloji Stack Dökümanı

> Bu doküman, projede kullanılacak tüm teknolojileri ve kullanıcı tarafından açıkça belirtilen mimari kararları kapsar. Hiçbir gereksinim atlanmamıştır.

---

## 1. Backend — Genel

| Alan | Teknoloji | Versiyon / Detay |
|------|-----------|------------------|
| Dil | Java | 17 |
| Framework | Spring Boot | 3.3.1 |
| Cloud Stack | Spring Cloud | 2023.0.x (Spring Cloud OpenFeign 4.1.3, Gateway, Eureka) |
| Build Tool | Maven (Multi-module) | Maven 3.9+ |
| Mimari | Microservices | 9 modül (gateway, discovery, auth, user, product, basket, order, payment, notification) |
| Inter-service iletişim | OpenFeign (sync) + Apache Kafka (async/event) | Eureka service-id ile name-based |
| API Stili | RESTful | `/dev/v1/...` env+version path stratejisi (mevcut `RestApis` patterni) |
| Pagination | Spring Data `Pageable` | Ürün listeleme dahil tüm liste endpoint'lerinde |

### 1.1. Maven Yapısı (önemli kullanıcı kuralı)
- **Root `pom.xml`** parent olarak `spring-boot-starter-parent:3.3.1`'i kullanır; tüm versiyonlar `<dependencyManagement>` (Spring Cloud BOM + properties) içinde tek yerde.
- Her microservice **sadece ihtiyacı olan** dependency'leri çeker; gereksiz dependency yüklenmez.
- Submodule pom'lar versiyon belirtmez, parent BOM'dan miras alır.

---

## 2. Common Library (`common` modülü)

Tüm servislerin paylaştığı altyapı. `<packaging>jar</packaging>` (Spring Boot maven plugin yok).

| Bileşen | Açıklama |
|---------|----------|
| `BaseEntity` | `@MappedSuperclass` — sequence id, `createdAt`, `updatedAt` (`@PrePersist` / `@PreUpdate`) |
| `BaseDocument` | Mongo için id (String), createdAt/updatedAt (`@CreatedDate` / `@LastModifiedDate` + `@EnableMongoAuditing`) |
| `BaseResponse<T>` | Record `(boolean result, String errorMessage, T data)` + `success(T)` / `fail(ErrorResponse)` factory'leri |
| `ErrorResponse` | Record `(hostName, path, createTime, message, code, detail)` — kullanıcı format'ı birebir |
| `BaseController` | Ortak `ResponseEntity<BaseResponse<T>>` döndüren helper'lar (`ok`, `created`) |
| `BusinessException` + `ErrorType` enum | Hata kodu (`1001`, `1003`...), mesaj, HTTP status |
| `GlobalExceptionHandler` | `@RestControllerAdvice` — `BusinessException`, `MethodArgumentNotValidException`, `AccessDeniedException`, generic `Exception` |
| `OpenApiConfig` | Kullanıcının verdiği `bearerAuth` SecurityScheme'li config (her servis title/version override eder) |
| `MyGenericRepository<T,ID>` | Mevcut `@NoRepositoryBean` JpaRepository extend; ek olarak softDelete/findAllActive |
| `JwtTokenManager` | Access + Refresh token üretim/doğrulama, claims: `sub` (authId), `role`, `jti` |
| `JwtAuthFilter` + `SecurityConfigBase` | Stateless security, gateway'den gelen header'a güven (downstream) |
| `RestApis` constants | `/dev` `/test` `/prod` env + `/v1` version sabitleri |
| `KafkaTopics` constants | `order.created`, `payment.requested`, `payment.completed`, `payment.failed`, `stock.reserve.requested`, `stock.reserve.failed`, `stock.released`, `notification.email`, `notification.slack`, `deploy.notification` |
| Event records | `OrderCreatedEvent`, `PaymentCompletedEvent`, `PaymentFailedEvent`, `StockReservedEvent`... (versiyonlu) |
| Swagger ApiDocs interfaces | Kullanıcının istediği gibi her controller `implements IXxxApi` (Swagger annotation'lar interface'de). `CrudApiDocs<TReq,TRes>` template (dinamik/generic) |

### Kullanıcının açıkça belirttiği kurallar (atlanmadı):
- **DTO'lar `record` olacak** ✅
- **Base entity** id sequence id, createdAt, updatedAt alanlarıyla ✅
- **Base controller** ortak `BaseResponse<T>` formatı dönecek ✅
- **OpenApiConfig** common'da olacak (verdiği şablon birebir) ✅
- **Her controller üstüne interface** + `@Operation` / `@ApiResponses` ile Swagger ✅
- **Builder pattern** maplemek için ✅
- **Global exception** yapısı ✅
- Service için **`impl` ayrımı** ✅
- Repository için **base repository** (mevcut `MyGenericRepository`) ✅

---

## 3. Microservice Listesi

| # | Servis | DB / Storage | Sorumluluk |
|---|--------|--------------|------------|
| 1 | **discovery-service** | — | Eureka Server (port 8761) |
| 2 | **gateway-service** | Redis (rate limit) | Spring Cloud Gateway, JWT validation, header forward, CORS |
| 3 | **auth-service** | PostgreSQL | Register, Login, Refresh (rotation), Logout, BCrypt |
| 4 | **user-service** | MongoDB | UserProfile CRUD, `me`, search (paginated) |
| 5 | **product-service** | MongoDB | Product/Category CRUD, **paginated listing**, stock reserve consumer |
| 6 | **basket-service** | Redis | Sepete ekleme/çıkarma/güncelleme/temizleme (TTL'li) |
| 7 | **order-service** | PostgreSQL | Sipariş oluşturma, status state machine (CREATED/PAYMENT_PENDING/PAID/FAILED/CANCELLED/SHIPPED/DELIVERED) |
| 8 | **payment-service** | PostgreSQL | Mock provider (Iyzico-ready interface), idempotency=orderId |
| 9 | **notification-service** | — (stateless) | Mail (MailHog dev), Slack webhook, deploy bildirimleri |

### Saga Pattern
- **Choreography** stili (kullanıcı onayı): order-service → `order.created` publish → payment-service consume → `payment.completed`/`payment.failed` publish → order-service ve product-service consume.
- Stock saga: order create → `stock.reserve.requested` → product-service reserve → fail durumda `stock.released`.

---

## 4. Veritabanları

| DB | Kullanım | Servis(ler) |
|----|----------|-------------|
| **PostgreSQL** | İlişkisel veri (kullanıcı kimlik, sipariş, ödeme) | auth, order, payment |
| **MongoDB** | Doküman tabanlı (esnek şema) | user, product |
| **Redis** | Cache + ephemeral state (sepet, rate limit) | basket, gateway |

- **Flyway** → Postgres schema migration (auth, order, payment için ayrı `db/migration` klasörleri)
- Mongo için **Spring Data Mongo Auditing** aktif

---

## 5. Authentication & Authorization

| Bileşen | Detay |
|---------|-------|
| Strategy | **JWT Access + Refresh Token (rotation)** — kullanıcı onayı |
| Access Token | Kısa ömürlü (15 dk), gateway'de validate |
| Refresh Token | DB'de saklı (`RefreshToken` entity: `jti`, `authId`, `expiresAt`, `revoked`), her refresh'te eski revoke + yeni üret |
| Password | BCrypt hash |
| Spring Security | Stateless, gateway'de filter, downstream `X-User-Id` + `X-User-Role` header trust |
| Authorization | Role-based (`USER`, `SELLER`, `ADMIN`) — `@PreAuthorize` |

---

## 6. Ödeme Entegrasyonu

| Aşama | Detay |
|-------|-------|
| Faz 1 | **Mock Payment Provider** (90% success, random) — kullanıcı onayı |
| Faz 2 | **Iyzico Sandbox** entegrasyonu (`IyzicoPaymentProvider implements PaymentProvider`) |
| Pattern | Strategy + Idempotency (key = orderId) |

---

## 7. Mesajlaşma

| Tool | Kullanım |
|------|----------|
| **Apache Kafka** | Saga choreography eventleri, async iş akışları |
| **Spring Kafka** | Producer/Consumer + `@KafkaListener` |
| Topic naming | Lowercase dotted (`order.created`, `payment.completed`...) |
| Serialization | JSON (Jackson) |
| Tracing | W3C Trace Context Kafka header'larında propagate |

---

## 8. Validation, Exception, Logging

- **Validation:** Bean Validation (`@NotBlank`, `@Email`, `@Min`, `@Pattern`...) + `@Valid` controller'da
- **Global Exception:** `GlobalExceptionHandler` (common-lib) → `BaseResponse(result=false, errorMessage, ErrorResponse)`
- **Logging:**
  - **Logback** + JSON encoder (`logstash-logback-encoder`)
  - **SLF4J** facade
  - **Micrometer Tracing** + `traceId`/`spanId` (W3C)
  - Hata takibi: structured log + correlation id

---

## 9. API Dokümantasyonu

| Tool | Detay |
|------|-------|
| **springdoc-openapi-starter-webmvc-ui** | 2.6.0 (mevcut) |
| **OpenAPI 3** | `OpenApiConfig` common'dan, her servis title/version override |
| Swagger UI | Gateway üzerinden `http://localhost:8080/{service}/swagger-ui.html` |
| Controller interface | Her controller `implements IXxxApi` (Swagger annotation'lar interface'de) |

---

## 10. Test

| Katman | Tool |
|--------|------|
| **Unit** | JUnit 5 + Mockito + AssertJ (service layer hedef %70+ coverage) |
| **Integration** | Spring Boot Test + **Testcontainers** (Postgres, Mongo, Kafka, Redis) |
| **API/E2E** | RestAssured (saga happy + failure path) |
| **Coverage** | JaCoCo |

---

## 11. Frontend — Next.js 15

> Kullanıcı onayı: **Next.js (App Router)** + **pnpm** (e-ticaret + SEO için)

| Alan | Teknoloji |
|------|-----------|
| Framework | **Next.js 15** (App Router, RSC) |
| Dil | TypeScript |
| Package Manager | **pnpm** |
| Styling | Tailwind CSS |
| State (global) | Zustand |
| State (local) | React Hooks (`useState`, `useEffect`, `useReducer`) |
| Form | react-hook-form + zod |
| HTTP | fetch + custom `apiClient` (token attach + 401 refresh rotation) |
| Linting | ESLint + Prettier |

### Klasör Yapısı (kullanıcı isteği: "service klasörlerini ayır güzelce")
```
frontend/
├── src/
│   ├── app/                    # App Router routes
│   │   ├── (shop)/products/
│   │   ├── (shop)/products/[id]/
│   │   ├── (shop)/basket/
│   │   ├── (shop)/checkout/
│   │   ├── (auth)/login/
│   │   ├── (auth)/register/
│   │   └── (account)/orders/
│   ├── services/               # Backend API client'lar
│   │   ├── authService.ts
│   │   ├── productService.ts
│   │   ├── cartService.ts
│   │   └── orderService.ts
│   ├── lib/
│   │   ├── apiClient.ts
│   │   └── auth.ts
│   ├── components/             # ProductCard, Pagination, CartItem, LoadingSpinner, ErrorBoundary, Toast
│   ├── hooks/                  # useCart, useAuth, useDebounce, usePagination
│   ├── store/                  # Zustand store'ları
│   └── types/                  # Backend DTO mirror'ları
├── public/
├── .env.local
├── next.config.ts
├── tsconfig.json
└── package.json
```

### Kullanıcının açıkça istediği frontend gereksinimleri (atlanmadı):
- Kullanıcı arayüzü: ürün listeleme + detay sayfaları ✅
- React Hooks: `useState`, `useEffect` ✅
- **Pagination UI** bileşeni ✅
- **Sepet UI** ✅
- **API entegrasyonu** ✅
- **Hata yönetimi** + loading state + kullanıcı dostu mesajlar (Toast) ✅

---

## 12. DevOps & Deployment

> ⚠️ Kullanıcı kararı: **AWS yerine GCP** kullanılacak.

### 12.1. Containerization
| Tool | Detay |
|------|-------|
| **Docker** | Backend container'lama |
| **Dockerfile** (multi-stage) | Maven build → JRE 17 slim image |
| Base image | `eclipse-temurin:21-jre-alpine` |
| Image registry | **Google Artifact Registry** (`europe-west1-docker.pkg.dev/<project>/n11/<service>:<ver>`) |
| docker-compose | Lokal dev stack: postgres, mongo, redis, kafka+zookeeper, mailhog, eureka, gateway, tüm servisler, frontend |

### 12.2. CI/CD
| Tool | Detay |
|------|-------|
| **GitHub Actions** | Pipeline (kullanıcı isteği) |
| Workflow `ci.yml` | PR + push: maven build/test, pnpm lint/build, docker publish (main only) |
| Workflow `deploy.yml` | `workflow_dispatch` veya tag-trigger; GCP credentials (Workload Identity Federation tercih); `gcloud run deploy` veya `gcloud app deploy`; Slack notify |
| **Jenkins karşılaştırması** | README'de eşdeğer `Jenkinsfile` (agent, stages: Build/Test/Docker/Deploy, post always/success/failure) — sadece dökümantasyon (kullanıcı isteği) |
| Notifications | **Slack** webhook (kullanıcı isteği) — `slackapi/slack-github-action` |

### 12.3. GCP Deployment Stack
| Bileşen | GCP Servisi | Notlar |
|---------|-------------|--------|
| Container Runtime | **Cloud Run** (önerilen, serverless, scale-to-zero) | Her microservice ayrı Cloud Run service. Alternatif: **GKE Autopilot** (full Kubernetes) |
| Postgres | **Cloud SQL for PostgreSQL** | auth/order/payment için tek instance, ayrı schema'lar |
| MongoDB | **MongoDB Atlas on GCP** (Atlas marketplace) | GCP-native değil ama VPC peering ile entegre |
| Redis | **Memorystore for Redis** | basket + rate limiting |
| Kafka | **Confluent Cloud on GCP** veya **Google Pub/Sub** alternatif | Confluent: Kafka API uyumu; Pub/Sub: native ama Kafka değil |
| Service Discovery | Eureka (gateway/discovery-service Cloud Run'da) veya **Cloud Run + internal DNS** | Eureka opsiyonel, Cloud Run zaten DNS sağlar |
| Image Registry | **Artifact Registry** | Jib hedefi |
| Secrets | **Secret Manager** | DB password, JWT secret, Iyzico key, Slack webhook |
| CDN/Static | **Cloud CDN + Cloud Storage** | Frontend (Next.js statik export) veya **Vercel** alternatif |
| Frontend Hosting | **Cloud Run** (Next.js SSR) veya **Vercel** | Next.js 15 App Router için Cloud Run önerilir (SSR) |
| Mail (prod) | **SendGrid on GCP Marketplace** veya **Mailgun** | Notification-service buradan gönderir |
| IAM | **Workload Identity Federation** | GitHub Actions → GCP keysiz auth |
| Monitoring | **Cloud Monitoring** + **Cloud Logging** | Logback JSON otomatik parse edilir |
| Tracing | **Cloud Trace** | Micrometer Tracing OTLP exporter |
| Build (alternatif) | **Cloud Build** | GitHub Actions yerine veya yanında |

### 12.4. Beklentiler (kullanıcının açıkça istediği)
- Backend servislerinin doğru çalışması ✅
- Frontend ↔ Backend entegrasyonu ✅
- Clean Code + SOLID ✅
- Test yazılması ✅
- CI/CD süreci anlaşılması ✅
- **Deploy edilebilir** uygulama ✅

---

## 13. Nice-to-have (Bonus Değerlendirme Aday)

Kullanıcının "ek değerlendirme kriteri" notu için aday özellikler:

1. **review-service** (Mongo) — Ürün yorum + puan
2. **coupon-service** — Kupon/indirim kodları
3. **SSE / WebSocket** — Sipariş status real-time güncelleme
4. **Wishlist** (Redis set)
5. **Recommendation** — Mongo aggregation co-occurrence ("bunu alanlar şunu da aldı")
6. **Admin Dashboard** — Next.js ayrı route group
7. **Prometheus + Grafana** — Cloud Monitoring yanında self-hosted
8. **ELK / Loki** — Log aggregation Cloud Logging yanında

---

## 14. Versiyon Özeti

```
Java          : 21
Spring Boot   : 3.3.1
Spring Cloud  : 2023.0.x
PostgreSQL    : 16 (Cloud SQL)
MongoDB       : 7 (Atlas)
Redis         : 7 (Memorystore)
Kafka         : 3.7 (Confluent Cloud)
Node.js       : 20 LTS
Next.js       : 15 (App Router)
pnpm          : 9
Docker        : 26+
Maven         : 3.9+
```

---

## 15. Kullanıcı Gereksinimleri Çapraz Kontrol Listesi

> Verdiğin tüm maddeler — hiçbiri atlanmadı:

### Backend
- [x] RESTful web servisi (ürün/sepet/sipariş)
- [x] PostgreSQL (ürün/sipariş/kullanıcı verisi — proje split: order/auth/payment Postgres, product Mongo)
- [x] Pagination (ürün listeleme)
- [x] Sepet işlemleri (ekle/çıkar/güncelle)
- [x] Sipariş yönetimi (oluştur + akış)
- [x] Iyzico ödeme entegrasyonu (mock → sandbox)
- [x] JWT auth + authorization
- [x] Unit + integration testler
- [x] Swagger/OpenAPI dokümantasyon
- [x] Loglama (Logback + JSON + tracing)

### Frontend (React.js / Next.js)
- [x] Ürün listeleme + detay sayfası
- [x] React Hooks (useState/useEffect)
- [x] Pagination UI
- [x] Sepet UI
- [x] API entegrasyonu
- [x] Hata yönetimi + loading state

### DevOps & Deployment
- [x] Docker container
- [x] Jib (Dockerfile'sız)
- [x] CI/CD (GitHub Actions)
- [x] Jenkins karşılaştırması (dökümantasyon)
- [x] **GCP Deployment** (Cloud Run + Cloud SQL — AWS EB/RDS yerine)
- [x] Slack deploy bildirimleri

### Mimari/Kod kalitesi (kullanıcı özel istek)
- [x] Maven merkezi `pom.xml` dependencyManagement (gereksiz dependency yok)
- [x] common-lib (BaseEntity: sequence id + createdAt + updatedAt)
- [x] DTO'lar `record`
- [x] BaseController + ortak response (`BaseResponse` formatı kullanıcı örneği)
- [x] OpenApiConfig common'da (kullanıcı şablonu)
- [x] Her controller üzerinde Swagger interface (`@Operation` / `@ApiResponses`)
- [x] Builder pattern (Lombok)
- [x] Global exception
- [x] Service `impl` ayrımı + base repository
- [x] Eureka + Kafka + Saga pattern
- [x] Mongo + Postgres ayrımı
- [x] Frontend Next.js + pnpm + service klasör organizasyonu
