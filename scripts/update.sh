#!/bin/bash

set -e

echo "🔄 Actualizando Aether (sin perder datos)..."

# ─────────────────────────────────────────
# VARIABLES
# ─────────────────────────────────────────
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"

# Servicio a actualizar (por defecto todos, puedes pasar uno: ./update.sh api)
SERVICE=${1:-""}

# ─────────────────────────────────────────
# VALIDACIONES RÁPIDAS
# ─────────────────────────────────────────
if ! docker info &> /dev/null; then
    echo "❌ Docker no está corriendo."
    exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ No se encontró $COMPOSE_FILE. Ejecuta desde la raíz del proyecto."
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ No se encontró $ENV_FILE."
    exit 1
fi

# ─────────────────────────────────────────
# LIMPIAR CACHÉ DE BUILD (solo layers intermedios)
# ─────────────────────────────────────────
echo "🧹 Limpiando caché de build intermedio..."
docker builder prune -f --filter type=exec.cachemount 2>/dev/null || docker builder prune -f

# ─────────────────────────────────────────
# RECONSTRUIR SOLO LAS IMÁGENES QUE CAMBIARON
# ─────────────────────────────────────────
if [ -z "$SERVICE" ]; then
    echo "🏗️  Reconstruyendo imágenes de api y web..."
    docker compose -f $COMPOSE_FILE --env-file $ENV_FILE build api web
else
    echo "🏗️  Reconstruyendo imagen de $SERVICE..."
    docker compose -f $COMPOSE_FILE --env-file $ENV_FILE build $SERVICE
fi

# ─────────────────────────────────────────
# REINICIAR SOLO LOS CONTENEDORES AFECTADOS
# postgres y nginx NO se tocan → los datos se conservan
# ─────────────────────────────────────────
if [ -z "$SERVICE" ]; then
    echo "🔁 Reiniciando api y web (postgres y nginx intactos)..."
    docker compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d --no-deps api web
else
    echo "🔁 Reiniciando $SERVICE..."
    docker compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d --no-deps $SERVICE
fi

# ─────────────────────────────────────────
# ESPERAR A QUE LA API RESPONDA
# ─────────────────────────────────────────
echo "⏳ Esperando que la API esté lista..."
ATTEMPTS=0
MAX_ATTEMPTS=20

until docker exec aether-api sh -c "echo ok" &> /dev/null || [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; do
    echo "   Esperando... ($ATTEMPTS/$MAX_ATTEMPTS)"
    sleep 3
    ATTEMPTS=$((ATTEMPTS + 1))
done

if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
    echo "⚠️  La API tardó demasiado. Revisa los logs:"
    echo "   docker compose -f $COMPOSE_FILE logs -f api"
else
    echo "   ✅ API lista"
fi

# ─────────────────────────────────────────
# LIMPIAR IMÁGENES HUÉRFANAS (las viejas)
# ─────────────────────────────────────────
echo "🧹 Eliminando imágenes antiguas huérfanas..."
docker image prune -f

# ─────────────────────────────────────────
# ESTADO FINAL
# ─────────────────────────────────────────
echo ""
echo "✅ Actualización completada!"
echo ""
echo "📊 Estado de los contenedores:"
docker compose -f $COMPOSE_FILE ps
echo ""
echo "📝 Comandos útiles:"
echo "   Ver logs API:    docker compose -f $COMPOSE_FILE logs -f api"
echo "   Ver logs web:    docker compose -f $COMPOSE_FILE logs -f web"
echo "   Solo API:        ./update.sh api"
echo "   Solo web:        ./update.sh web"
