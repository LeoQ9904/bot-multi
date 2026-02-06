#!/bin/bash

set -e

echo "🧪 Probando despliegue de producción localmente..."

# Verificar que existe .env.prod
if [ ! -f .env.prod ]; then
    echo "❌ Error: No existe .env.prod"
    echo "Copia .env.prod de ejemplo y configúralo con tus valores reales"
    exit 1
fi

# Limpiar contenedores anteriores
echo "🧹 Limpiando contenedores anteriores..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod down -v

# Construir imágenes
echo "🏗️  Construyendo imágenes..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod build --no-cache

# Iniciar servicios
echo "🚀 Iniciando servicios..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Esperar a que postgres esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

# Verificar que postgres está corriendo
echo "🔍 Verificando PostgreSQL..."
docker exec aether-postgres pg_isready -U aether_user -d aether_db || {
    echo "❌ PostgreSQL no está listo"
    docker-compose -f docker-compose.prod.yml logs postgres
    exit 1
}

# Ejecutar migraciones
echo "📦 Ejecutando migraciones de base de datos..."
docker exec aether-api sh -c "cd /app/apps/api && npx prisma migrate deploy" || {
    echo "⚠️  Error en migraciones, intentando crear la base de datos..."
    docker exec aether-api sh -c "cd /app/apps/api && npx prisma db push"
}

# Reiniciar API para que tome los cambios
echo "🔄 Reiniciando API..."
docker-compose -f docker-compose.prod.yml restart api

# Esperar un poco más
sleep 5

# Mostrar estado
echo ""
echo "✅ Despliegue completado!"
echo ""
echo "📊 Estado de los contenedores:"
docker-compose -f docker-compose.prod.yml --env-file .env.prod ps
echo ""
echo "🌐 Accede a la aplicación en:"
echo "   Web: http://localhost"
echo "   API: http://localhost/api"
echo "   Health: http://localhost/health"
echo ""
echo "📝 Ver logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 Detener:"
echo "   docker-compose -f docker-compose.prod.yml --env-file .env.prod down"
