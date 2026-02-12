#!/bin/bash

set -e

echo "🚀 Desplegando Aether en local (iMac)..."

# ─────────────────────────────────────────
# VARIABLES
# ─────────────────────────────────────────
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"

# ─────────────────────────────────────────
# VALIDACIONES PREVIAS
# ─────────────────────────────────────────
echo "🔍 Validando dependencias necesarias..."

# Validar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado."
    echo "   Descárgalo en: https://www.docker.com/products/docker-desktop"
    exit 1
fi
echo "   ✅ Docker: $(docker --version)"

# Validar Docker Compose (plugin moderno)
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose no está disponible."
    echo "   Asegúrate de tener Docker Desktop actualizado."
    exit 1
fi
echo "   ✅ Docker Compose: $(docker compose version)"

# Validar Git
if ! command -v git &> /dev/null; then
    echo "❌ Git no está instalado."
    echo "   Instálalo con: brew install git"
    exit 1
fi
echo "   ✅ Git: $(git --version)"

# Validar que Docker está corriendo
if ! docker info &> /dev/null; then
    echo "❌ Docker no está corriendo. Abre Docker Desktop e intenta de nuevo."
    exit 1
fi
echo "   ✅ Docker está corriendo"

# Validar archivo compose
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ No se encontró $COMPOSE_FILE en el directorio actual."
    echo "   Ejecuta este script desde la raíz del proyecto."
    exit 1
fi
echo "   ✅ $COMPOSE_FILE encontrado"

# Validar .env.prod
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ No se encontró $ENV_FILE en el directorio actual."
    echo "   Crea el archivo con las variables de entorno de producción."
    exit 1
fi
echo "   ✅ $ENV_FILE encontrado"

echo ""

# ─────────────────────────────────────────
# DETENER CONTENEDORES ANTERIORES
# ─────────────────────────────────────────
echo "🛑 Deteniendo contenedores anteriores..."
docker compose -f $COMPOSE_FILE --env-file $ENV_FILE down || true

# ─────────────────────────────────────────
# LIMPIAR IMÁGENES ANTIGUAS DEL PROYECTO
# Solo elimina imágenes de este proyecto, no todo Docker
# ─────────────────────────────────────────
echo "🧹 Limpiando imágenes antiguas del proyecto..."
docker compose -f $COMPOSE_FILE --env-file $ENV_FILE down --rmi local || true
docker builder prune -f

# ─────────────────────────────────────────
# CONSTRUIR E INICIAR
# ─────────────────────────────────────────
echo "🏗️  Construyendo imágenes..."
docker compose -f $COMPOSE_FILE --env-file $ENV_FILE build --no-cache

echo "🚀 Iniciando servicios..."
docker compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d

# ─────────────────────────────────────────
# ESPERAR A QUE LA API ESTÉ LISTA
# ─────────────────────────────────────────
echo "⏳ Esperando a que los servicios estén listos..."
ATTEMPTS=0
MAX_ATTEMPTS=20

until docker exec aether-api sh -c "echo ok" &> /dev/null || [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; do
    echo "   Esperando API... ($ATTEMPTS/$MAX_ATTEMPTS)"
    sleep 3
    ATTEMPTS=$((ATTEMPTS + 1))
done

if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
    echo "⚠️  La API tardó demasiado en iniciar. Revisa los logs:"
    echo "   docker compose -f $COMPOSE_FILE logs -f api"
else
    echo "   ✅ API lista"
fi

# ─────────────────────────────────────────
# ESTADO FINAL
# ─────────────────────────────────────────
echo ""
echo "✅ Despliegue completado!"
echo ""
echo "📊 Estado de los contenedores:"
docker compose -f $COMPOSE_FILE ps
echo ""
echo "📝 Comandos útiles:"
echo "   Ver logs:        docker compose -f $COMPOSE_FILE logs -f"
echo "   Ver logs API:    docker compose -f $COMPOSE_FILE logs -f api"
echo "   Actualizar:      ./update.sh"
echo "   Detener todo:    docker compose -f $COMPOSE_FILE down"
