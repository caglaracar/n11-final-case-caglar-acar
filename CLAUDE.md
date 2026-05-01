# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **n11 Bootcamp e-commerce microservices project** — a Spring Boot 3.3.1 / Java 17 multi-module Maven backend with a React (Vite) frontend client.

## Commands

### Backend (Maven multi-module)

Requires JDK 17 + Maven 3.9+.

```bash
# Build all modules (skip tests)
mvn -B -ntp clean package -DskipTests

# Build a single module (with its dependencies)
mvn -B -ntp -pl auth-service -am package -DskipTests

# Run a specific service
mvn -pl auth-service -am spring-boot:run

# Run all tests
mvn test

# Run tests for a specific module
mvn -pl auth-service test

# Run a single test class
mvn -pl auth-service test -Dtest=AuthServiceTest
```

### Infrastructure (Docker)

```bash
# Start all infrastructure (Postgres, Mongo, Redis, Kafka, MailHog)
docker compose up -d

# Stop and keep data
docker compose down

# Stop and wipe volumes
docker compose down -v
```

### Frontend (`n11-client/` — Vite + React)

```bash
cd n11-client
npm run dev          # start dev server
npm run build        # production build
npm run lint         # ESLint
npm run type-check   # TypeScript check without emit
```

### All-in-one (mprocs)

```bash
mprocs   # starts infra + discovery; other services toggled manually in TUI
```

## Service Startup Order

Eureka must be up before any client service; gateway last.

1. `discovery-service` (:8761)
2. `auth-service` (:9090), `user-service` (:9091) — parallel OK
3. `product-service` (:9092), `basket-service` (:9093)
4. `order-service` (:9094), `payment-service` (:9095), `notification-service` (:9096)
5. `gateway-service` (:8080)

## Architecture

### Backend — `com.caglar.*`

Nine Spring Boot microservices behind a single Spring Cloud Gateway entry point. Service-to-service calls use OpenFeign (sync) or Kafka (async/event). All services register with Eureka and are addressed by service-id (`lb://auth-service`).

**common** module is a plain `jar` (not a `bootJar`) shared by every service. It contains:
- `BaseEntity` / `BaseDocument` — JPA (`@MappedSuperclass`) and Mongo base classes with sequence ID + audit timestamps
- `BaseResponse<T>` / `BaseController` — uniform `{ result, errorMessage, data }` response envelope
- `GlobalExceptionHandler` — handles `BusinessException`, validation, and generic errors
- `JwtTokenManager` — JWT access (15 min) + refresh token creation/validation
- `HeaderAuthFilter` / `SecurityConfigBase` — downstream services trust `X-User-Id` / `X-User-Role` headers set by gateway
- `KafkaTopics` / `RestApis` constants, all event record types
- `MyGenericRepository` — `@NoRepositoryBean` JPA extension used by Postgres-backed repos

**Dependency management**: versions are managed in the root `pom.xml` `<dependencyManagement>` (Spring Cloud BOM + per-library `<properties>`). Each submodule declares only the artifacts it needs without versions.

**API path convention**: `/dev/v1/{service}/{endpoint}` (env + version prefix from `RestApis` constants).

**Controller pattern**: every controller implements an `IXxxApi` interface that carries all Swagger/OpenAPI annotations. The controller class is annotation-free. Response type is always `ResponseEntity<BaseResponse<T>>` via `BaseController` helpers.

**DTO convention**: all DTOs are Java `record`s. Mapping uses Lombok `@Builder` on entities.

**Service convention**: `XxxService` interface + `XxxServiceImpl` in an `impl` package.

### Databases

| Service | DB |
|---|---|
| auth, order, payment | PostgreSQL (Flyway migrations in `src/main/resources/db/migration`) |
| user, product | MongoDB (Spring Data Mongo Auditing) |
| basket, gateway rate-limit | Redis |

### Kafka Saga (Choreography)

Order flow: `order-service` publishes `order.created` + `stock.reserve.requested` → `payment-service` charges → publishes `payment.completed` or `payment.failed` → `order-service` + `product-service` consumers update state accordingly. All topic names are constants in `KafkaTopics`.

### Frontend (`n11-client/`)

React 19 + Vite SPA with Tailwind CSS, React Router, i18next, Recharts, and integrations for Firebase, Supabase, and Stripe. **Not** the planned Next.js frontend — this is the current working client.

## Key URLs (local)

| Resource | URL |
|---|---|
| Eureka dashboard | http://localhost:8761 |
| MailHog UI | http://localhost:8025 |
| Gateway entry | http://localhost:8080 |
| Swagger per-service | `http://localhost:{port}/swagger-ui.html` |
