#!/bin/bash

set -e

echo "🚀 Desplegando Aether en EC2..."

# Variables
REPO_URL="https://github.com/LeoQ9904/bot-multi.git"
BRANCH="main"
APP_DIR="/home/ubuntu/aether"

# Actualizar sistema
echo "📦 Actualizando sistema..."
sudo apt-get update

# Instalar Docker si no está instalado
if ! command -v docker &> /dev/null; then
    echo "🐳 Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    rm get-docker.sh
fi

# Instalar Docker Compose si no está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Instalando Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Clonar o actualizar repositorio
if [ -d "$APP_DIR" ]; then
    echo "📥 Actualizando repositorio..."
    cd $APP_DIR
    git fetch origin
    git reset --hard origin/$BRANCH
else
    echo "📥 Clonando repositorio..."
    git clone -b $BRANCH $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Verificar que existe .env.prod
if [ ! -f .env.prod ]; then
    echo "❌ Error: No existe .env.prod en el repositorio"
    echo "Debes crear .env.prod con las variables de entorno de producción"
    exit 1
fi

# Detener contenedores anteriores
echo "🛑 Deteniendo contenedores anteriores..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod down || true

# Limpiar imágenes antiguas
echo "🧹 Limpiando imágenes antiguas..."
docker system prune -af --volumes || true

# Construir nuevas imágenes
echo "🏗️  Construyendo imágenes..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod build --no-cache

# Iniciar servicios
echo "🚀 Iniciando servicios..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 15

# Ejecutar migraciones
echo "📦 Ejecutando migraciones de base de datos..."
docker exec aether-api sh -c "cd /app/apps/api && npx prisma migrate deploy" || echo "⚠️  Migraciones fallaron, verifica manualmente"

# Mostrar estado
echo ""
echo "✅ Despliegue completado!"
echo ""
echo "📊 Estado de los contenedores:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "🌐 Accede a la aplicación en:"
echo "   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo ""
echo "📝 Ver logs:"
echo "   cd $APP_DIR && docker-compose -f docker-compose.prod.yml logs -f"
