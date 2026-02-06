# Scripts de Aether

Este directorio contiene scripts útiles para gestionar el despliegue de Aether en EC2.

## Uso Rápido

### En la EC2 (después del setup inicial)

```bash
# Ver todos los comandos disponibles
cd /home/ubuntu/aether

# Iniciar aplicación
docker compose up -d

# Detener aplicación
docker compose down

# Ver estado de contenedores
docker compose ps

# Ver logs
./scripts/logs.sh api          # Logs de API
./scripts/logs.sh web          # Logs de Web
./scripts/logs.sh follow-api   # Seguir logs en tiempo real

# Verificar salud
./scripts/health-check.sh

# Hacer backup de BD
./scripts/backup-db.sh

# Despliegue manual
./scripts/deploy-manual.sh

# Renovar certificado SSL
./scripts/renew-ssl.sh
```

---

## Scripts Disponibles

### `setup-ec2.sh` 🚀
**Descripción:** Configura la instancia EC2 desde cero.

**Uso:**
```bash
sudo bash /tmp/setup-ec2.sh
```

**Qué hace:**
- Actualiza el sistema
- Instala Docker, Docker Compose, Git, Certbot
- Clona el repositorio
- Crea directorios necesarios
- Configura firewall (ufw)
- Instala fail2ban para seguridad SSH

**Cuándo usar:** Una sola vez, al inicio

---

### `deploy-manual.sh` 🚀
**Descripción:** Despliega manualmente sin necesidad de push a GitHub.

**Uso:**
```bash
cd /home/ubuntu/aether
./scripts/deploy-manual.sh
```

**Qué hace:**
- Verifica el archivo `.env`
- Tira el código más reciente de GitHub
- Descarga las últimas imágenes Docker
- Para e inicia los contenedores
- Verifica que los servicios estén saludables
- Limpia imágenes viejas

**Cuándo usar:** Para despliegues manuales sin CI/CD, o para probar cambios rápidamente

---

### `health-check.sh` 🏥
**Descripción:** Verifica el estado de todos los servicios.

**Uso:**
```bash
./scripts/health-check.sh
```

**Qué verifica:**
- Estado de contenedores (API, Web, PostgreSQL, Nginx)
- Uso de disco
- Estado del daemon de Docker
- Puede enviar alertas a Slack

**Variables de entorno:**
- `SLACK_WEBHOOK`: (opcional) URL de webhook de Slack para alertas
- `ALERT_EMAIL`: (opcional) Email para alertas

**Cuándo usar:** Regularmente (recomendado via cron cada 5 minutos)

---

### `logs.sh` 📜
**Descripción:** Acceso fácil a logs de todos los contenedores.

**Uso:**
```bash
./scripts/logs.sh api          # Logs de API
./scripts/logs.sh web          # Logs de Web
./scripts/logs.sh db           # Logs de PostgreSQL
./scripts/logs.sh nginx        # Logs de Nginx
./scripts/logs.sh all          # Todos los logs
./scripts/logs.sh follow-api   # Seguir logs (Ctrl+C para salir)
./scripts/logs.sh follow-web   # Seguir logs del web
./scripts/logs.sh status       # Estado de contenedores
./scripts/logs.sh restart api  # Reiniciar API
./scripts/logs.sh events       # Ver eventos de Docker
```

**Cuándo usar:** Para debugging y monitoreo

---

### `backup-db.sh` 💾
**Descripción:** Crea backup comprimido de la base de datos.

**Uso:**
```bash
./scripts/backup-db.sh
```

**Qué hace:**
- Crea un dump de PostgreSQL comprimido
- Lo guarda en `backups/db_backup_YYYYMMDD_HHMMSS.sql.gz`
- Limpia backups más viejos que 30 días

**Cuándo usar:** Manualmente antes de cambios críticos, o via cron diariamente

---

### `renew-ssl.sh` 🔐
**Descripción:** Renueva certificado SSL de Let's Encrypt.

**Uso:**
```bash
./scripts/renew-ssl.sh
```

**Qué hace:**
- Ejecuta `certbot renew`
- Reinicia Nginx para usar nuevo certificado

**Variables requeridas:**
- `DOMAIN`: Dominio principal
- `LETSENCRYPT_EMAIL`: Email para Let's Encrypt

**Cuándo usar:** Automáticamente via cron (semanalamente), o manualmente si el certificado está por expirar

---

## Automatizar con Crontab

Para automatizar la ejecución de scripts:

```bash
# Editar crontab
crontab -e

# Agregar estas líneas:

# Daily backup a las 2 AM
0 2 * * * /home/ubuntu/aether/scripts/backup-db.sh >> /home/ubuntu/aether/logs/backup.log 2>&1

# SSL renewal cada domingo a las 3 AM
0 3 * * 0 /home/ubuntu/aether/scripts/renew-ssl.sh >> /home/ubuntu/aether/logs/ssl-renewal.log 2>&1

# Health check cada 5 minutos
*/5 * * * * /home/ubuntu/aether/scripts/health-check.sh >> /home/ubuntu/aether/logs/health-check.log 2>&1

# Docker cleanup cada domingo a las 4 AM
0 4 * * 0 docker system prune -f >> /home/ubuntu/aether/logs/docker-prune.log 2>&1
```

Puedes usar el archivo `crontab.example` como referencia.

---

## Monitoreo Avanzado

### Integración con Slack

Para recibir alertas en Slack:

1. Crea un webhook entrante en Slack desde tu espacio de trabajo
2. Establece la variable de entorno:
   ```bash
   export SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
   ```
3. Ejecuta `health-check.sh` regularmente via cron

---

## Troubleshooting

### "Permission denied" al ejecutar scripts

```bash
# Dale permisos de ejecución
chmod +x scripts/*.sh

# O para un script específico
chmod +x scripts/health-check.sh
```

### Script no encuentra Docker

```bash
# El usuario ubuntu debe estar en el grupo docker
sudo usermod -aG docker ubuntu

# Luego cierra sesión SSH y vuelve a conectar
```

### `.env` no encontrado

```bash
# Asegúrate de estar en el directorio correcto
cd /home/ubuntu/aether
ls -la .env

# Si no existe, cópialo de .env.example
cp .env.example .env
# Luego edítalo con tus credenciales
nano .env
```

---

## Variables de Entorno Importantes

Para que los scripts funcionen correctamente, asegúrate de que `.env` tenga:

```env
DB_USER=aether_user
DB_PASSWORD=tu_contraseña
DB_NAME=aether_db
DOCKERHUB_USERNAME=tu_usuario
API_URL=https://tu-dominio.com/api
```

---

## Más Información

Ver [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) para instrucciones completas de despliegue.

---

**Última actualización:** Febrero 2026
