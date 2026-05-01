# ── Stage 1: Build ──────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS build
ARG SERVICE_NAME
WORKDIR /workspace
COPY . .
RUN mvn -B -ntp -pl ${SERVICE_NAME} -am clean package -DskipTests

# ── Stage 2: Runtime ─────────────────────────────────────────────
FROM eclipse-temurin:17-jre
ARG SERVICE_NAME
WORKDIR /app
COPY --from=build /workspace/${SERVICE_NAME}/target/${SERVICE_NAME}-v.0.1.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
