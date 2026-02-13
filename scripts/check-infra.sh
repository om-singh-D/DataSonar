#!/bin/bash

# DataSonar Infrastructure Health Check
# Usage: ./scripts/check-infra.sh

echo "🔍 DataSonar Infrastructure Health Check"
echo "========================================="

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

check_service() {
    local name=$1
    local command=$2
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ $name${NC}"
    else
        echo -e "  ${RED}❌ $name${NC}"
    fi
}

echo ""
echo "📡 Message Brokers:"
check_service "Kafka        (localhost:9092)" "docker exec datasonar-kafka kafka-broker-api-versions --bootstrap-server localhost:9092"
check_service "Kafka UI     (localhost:8090)" "curl -s -o /dev/null -w '%{http_code}' http://localhost:8090 | grep -q 200"
check_service "RabbitMQ     (localhost:5672)" "docker exec datasonar-rabbitmq rabbitmq-diagnostics -q ping"
check_service "RabbitMQ UI  (localhost:15672)" "curl -s -o /dev/null -w '%{http_code}' http://localhost:15672 | grep -q 200"

echo ""
echo "💾 Databases:"
check_service "PostgreSQL   (localhost:5432)" "docker exec datasonar-postgres pg_isready -U datasonar"
check_service "MongoDB      (localhost:27017)" "docker exec datasonar-mongodb mongosh --eval 'db.runCommand({ping:1})' --quiet"
check_service "Redis        (localhost:6379)" "docker exec datasonar-redis redis-cli -a datasonar_secret ping"

echo ""
echo "📦 Storage:"
check_service "MinIO        (localhost:9000)" "curl -s -o /dev/null -w '%{http_code}' http://localhost:9000/minio/health/live | grep -q 200"
check_service "MinIO UI     (localhost:9001)" "curl -s -o /dev/null -w '%{http_code}' http://localhost:9001 | grep -q 200"

echo ""
echo "========================================="
echo "🌐 Access URLs:"
echo "  Kafka UI:      http://localhost:8090"
echo "  RabbitMQ UI:   http://localhost:15672  (datasonar / datasonar_secret)"
echo "  MinIO Console: http://localhost:9001   (datasonar / datasonar_secret)"
echo "========================================="