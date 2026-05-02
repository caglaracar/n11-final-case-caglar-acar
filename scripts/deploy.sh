#!/usr/bin/env bash
# Manual deploy: build + push (Jib) + deploy to Cloud Run.
#
# Usage:
#   ./scripts/deploy.sh staging              # tüm servisleri staging'e
#   ./scripts/deploy.sh prod                 # tüm servisleri prod'a
#   ./scripts/deploy.sh staging auth-service # tek servis
#   ./scripts/deploy.sh prod auth-service product-service
#
# Önkoşul:
#   gcloud auth login
#   gcloud config set project n11-patika-final
#   gcloud auth configure-docker europe-west1-docker.pkg.dev

set -euo pipefail

ENV="${1:-}"
shift || true

if [[ "$ENV" != "staging" && "$ENV" != "prod" ]]; then
  echo "Kullanım: $0 <staging|prod> [service ...]"
  exit 1
fi

PROJECT="n11-patika-final"
REGION="europe-west1"
REGISTRY="europe-west1-docker.pkg.dev/${PROJECT}/n11-images"
CLOUDSQL="${PROJECT}:${REGION}:n11-postgres"

# discovery-service Cloud Run'a deploy edilmiyor (Eureka local kullanılıyor)
ALL_SERVICES=(
  auth-service user-service product-service basket-service
  order-service payment-service notification-service gateway-service
)

SERVICES=("$@")
if [[ ${#SERVICES[@]} -eq 0 ]]; then
  SERVICES=("${ALL_SERVICES[@]}")
fi

if [[ "$ENV" == "staging" ]]; then SUFFIX="-staging"; else SUFFIX=""; fi

echo "==> ENV=$ENV  PROJECT=$PROJECT  REGION=$REGION"
echo "==> Servisler: ${SERVICES[*]}"

# 1) Parent + common-lib bir kere
echo "==> Parent POM + common-lib install"
mvn -B -ntp -q -N install -DskipTests
mvn -B -ntp -q -pl common-lib -am install -DskipTests

# 2) Her servis için Jib build & push, sonra Cloud Run deploy
for svc in "${SERVICES[@]}"; do
  echo ""
  echo "============================================================"
  echo "  $svc → ${svc}${SUFFIX}"
  echo "============================================================"

  echo "--> Build & push image"
  mvn -B -ntp -q -pl "$svc" -am package -DskipTests
  mvn -B -ntp -pl "$svc" jib:build \
    -Djib.to.image="${REGISTRY}/${svc}:latest" \
    -Djib.to.tags="$(git rev-parse --short HEAD)" \
    -DskipTests

  echo "--> Cloud Run deploy"
  if [[ "$svc" == "gateway-service" ]]; then
    # gateway: downstream URL'leri topla
    get_url() {
      gcloud run services describe "$1${SUFFIX}" \
        --region="$REGION" --project="$PROJECT" \
        --format='value(status.url)' 2>/dev/null || echo ""
    }
    AUTH_URL=$(get_url auth-service)
    USER_URL=$(get_url user-service)
    PRODUCT_URL=$(get_url product-service)
    BASKET_URL=$(get_url basket-service)
    ORDER_URL=$(get_url order-service)
    PAYMENT_URL=$(get_url payment-service)
    NOTIFICATION_URL=$(get_url notification-service)

    gcloud run deploy "gateway-service${SUFFIX}" \
      --image="${REGISTRY}/gateway-service:latest" \
      --region="$REGION" --project="$PROJECT" --platform=managed \
      --allow-unauthenticated \
      --set-env-vars="SPRING_PROFILES_ACTIVE=${ENV},SERVER_PORT=8080,AUTH_SERVICE_URL=${AUTH_URL},USER_SERVICE_URL=${USER_URL},PRODUCT_SERVICE_URL=${PRODUCT_URL},BASKET_SERVICE_URL=${BASKET_URL},ORDER_SERVICE_URL=${ORDER_URL},PAYMENT_SERVICE_URL=${PAYMENT_URL},NOTIFICATION_SERVICE_URL=${NOTIFICATION_URL}" \
      --set-secrets="JWT_SECRET=JWT_SECRET:latest,REDIS_HOST=REDIS_HOST:latest" \
      --vpc-egress=private-ranges-only \
      --memory=512Mi --cpu=1
  else
    gcloud run deploy "${svc}${SUFFIX}" \
      --image="${REGISTRY}/${svc}:latest" \
      --region="$REGION" --project="$PROJECT" --platform=managed \
      --allow-unauthenticated \
      --add-cloudsql-instances="$CLOUDSQL" \
      --set-env-vars="SPRING_PROFILES_ACTIVE=${ENV},SERVER_PORT=8080" \
      --set-secrets="JWT_SECRET=JWT_SECRET:latest,DB_USER_PASSWORD=DB_USER_PASSWORD:latest,MONGODB_URI=MONGODB_URI:latest,REDIS_HOST=REDIS_HOST:latest,CLOUD_SQL_CONNECTION_NAME=CLOUD_SQL_CONNECTION_NAME:latest" \
      --vpc-egress=private-ranges-only \
      --memory=1Gi --cpu=1 --timeout=300 --cpu-boost
  fi
done

echo ""
echo "==> Tamamlandı: ${SERVICES[*]} ($ENV)"
