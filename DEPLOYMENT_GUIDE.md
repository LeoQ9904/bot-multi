# Guía Completa: Desplegar Aether en AWS EC2 con CI/CD

Este documento proporciona instrucciones paso a paso para desplegar la aplicación Aether en una instancia EC2 de AWS con integración automática de CI/CD mediante GitHub Actions.

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración en AWS](#configuración-en-aws)
3. [Configuración de GitHub Secrets](#configuración-de-github-secrets)
4. [Configuración Inicial de la EC2](#configuración-inicial-de-la-ec2)
5. [Configuración de SSL/HTTPS](#configuración-de-sslhttps)
6. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
7. [Troubleshooting](#troubleshooting)

---

## Requisitos Previos

### En tu máquina local:
- Acceso a AWS Console
- Git instalado
- SSH key generada (si no la tienes)

### Cuentas necesarias:
- Cuenta de AWS
- Cuenta de Docker Hub (para almacenar imágenes Docker)
- Cuenta de GitHub con repositorio de `bot-multi`
- Credenciales Firebase (si usas autenticación)
- Token de API de AWS (para Bedrock AI)

---

## Configuración en AWS

### 1. Crear instancia EC2

1. Ve a **AWS Console** → **EC2** → **Instancias**
2. Haz clic en **Lanzar instancia**
3. Selecciona una máquina Ubuntu (recomendado **Ubuntu 22.04 LTS**)
4. **Tipo de instancia**: Mínimo `t3.small` (1GB RAM es insuficiente)
   - Recomendado: `t3.medium` o superior
5. **Almacenamiento**: Mínimo 30GB de disco duro
6. Configura los **Grupos de Seguridad**:
   - Puerto 22 (SSH) - Only tu IP
   - Puerto 80 (HTTP) - Anywhere
   - Puerto 443 (HTTPS) - Anywhere
   - Puerto 5432 (PostgreSQL) - Only localhost (dentro de EC2)
7. Genera o importa una **llave SSH** y descárgala
8. Lanza la instancia

### 2. Configurar Elastic IP (opcional pero recomendado)

1. Ve a **EC2** → **IPs Elásticas**
2. Asigna una IP elástica a tu instancia
3. Esto garantiza que la IP no cambie si reinicas

### 3. Configurar Route53 o actualizar DNS

Si tienes un dominio, apunta tu DNS a la dirección IP de EC2:
```
your-domain.com → IP_EC2_AQUI
```

---

## Configuración de GitHub Secrets

Los GitHub Actions necesitan credenciales para funcionar. Configúralas así:

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Crea los siguientes secrets:

### Credenciales Docker Hub
```
DOCKERHUB_USERNAME=tu_usuario
DOCKERHUB_TOKEN=tu_token
```

Para obtener el token:
- Ve a https://hub.docker.com
- Cuenta → Tokens de acceso
- Crea nuevo token con permisos de lectura/escritura

### Credenciales EC2
```
EC2_HOST=tu-ip-publica-o-dominio.com
EC2_USER=ubuntu
EC2_SSH_KEY=tu_llave_privada_SSH
EC2_PORT=22
EC2_APP_DIR=/home/ubuntu/aether
```

Para obtener la llave SSH privada:
1. Abre el archivo `.pem` que descargaste de AWS
2. Copia todo el contenido (incluyendo `-----BEGIN PRIVATE KEY-----`)
3. Pégalo en el secret `EC2_SSH_KEY`

---

## Configuración Inicial de la EC2

### 1. Conectar vía SSH

```bash
ssh -i /ruta/a/tu/llave.pem ubuntu@tu-ip-publica
```

### 2. Descargar y ejecutar script de setup

```bash
cd /tmp
curl -O https://raw.githubusercontent.com/TU_USUARIO/bot-multi/main/scripts/setup-ec2.sh
chmod +x setup-ec2.sh
sudo ./setup-ec2.sh
```

### 3. Configurar variables de entorno

Después de que el script termine, edita el archivo `.env`:

```bash
nano /home/ubuntu/aether/.env
```

Llena todas las variables (ver `.env.example` para referencia):

```env
DOCKERHUB_USERNAME=tu_usuario
DOCKERHUB_TOKEN=tu_token

DB_USER=aether_user
DB_PASSWORD=tu_contraseña_segura_aqui
DB_NAME=aether_db

FIREBASE_PROJECT_ID=tu_firebase_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@...iam.gserviceaccount.com

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key

TELEGRAM_BOT_TOKEN=tu_token_de_bot

JWT_SECRET=una_cadena_aleatoria_muy_larga_y_segura

API_URL=https://tu-dominio.com/api
FIREBASE_CONFIG='{"apiKey":"...","authDomain":"...","projectId":"...",...}'

DOMAIN=tu-dominio.com
LETSENCRYPT_EMAIL=tu-email@example.com

NODE_ENV=production
```

Guarda con `Ctrl+X` → `Y` → `Enter`

### 4. Iniciar la aplicación

```bash
cd /home/ubuntu/aether
docker compose up -d
```

Verifica que todo esté corriendo:

```bash
docker compose ps
```

---

## Configuración de SSL/HTTPS

### 1. Instalar certificado Let's Encrypt

```bash
sudo certbot certonly --webroot -w /home/ubuntu/aether/certbot/www -d tu-dominio.com
```

### 2. Actualizar nginx.conf

1. Edita el archivo `nginx.conf`:
```bash
nano /home/ubuntu/aether/nginx.conf
```

2. Descomenta la sección `# HTTPS configuration`
3. Reemplaza `your-domain.com` con tu dominio actual
4. Cometa la sección de desarrollo (temporal)

3. Reinicia nginx:
```bash
cd /home/ubuntu/aether
docker compose restart nginx
```

### 3. Configurar renovación automática de certificados

```bash
# Configurar crontab
crontab -e

# Agrega esta línea (renueva certificados cada domingo a las 3 AM)
0 3 * * 0 /home/ubuntu/aether/scripts/renew-ssl.sh >> /home/ubuntu/aether/logs/ssl-renewal.log 2>&1
```

---

## Monitoreo y Mantenimiento

### Útiles Scripts Disponibles

#### Ver logs
```bash
# Logs de API
/home/ubuntu/aether/scripts/logs.sh api

# Logs de Web
/home/ubuntu/aether/scripts/logs.sh web

# Prueba todas las opciones
/home/ubuntu/aether/scripts/logs.sh
```

#### Verificar salud de servicios
```bash
/home/ubuntu/aether/scripts/health-check.sh
```

#### Backup manual de base de datos
```bash
/home/ubuntu/aether/scripts/backup-db.sh
```

#### Despliegue manual
```bash
/home/ubuntu/aether/scripts/deploy-manual.sh
```

### Configurar Crontab para automatización

```bash
crontab -e
```

Agrega las líneas del archivo `scripts/crontab.example`

---

## GitHub Actions CI/CD Workflow

El workflow automático se ejecuta en cada push a `main`:

1. **Lint y Tests**: Se ejecutan en cada pull request
2. **Build de imágenes**: Se realiza solo en pushes a main
3. **Push a Docker Hub**: Las imágenes se suben con etiquetas `latest` y `sha`
4. **Deploy a EC2**: Se ejecuta SSH y ejecuta los comandos de deployment

### Para hacer deployment manual

Si necesitas desplegar sin hacer push:

```bash
ssh -i tu_llave.pem ubuntu@tu-ip
cd /home/ubuntu/aether
./scripts/deploy-manual.sh
```

---

## Troubleshooting

### El deploy falla en GitHub Actions

**Verificar credenciales Docker Hub:**
```bash
# Localmente
docker login
# Ingresa credenciales
```

**Verificar SSH a EC2:**
```bash
# Desde tu máquina local, prueba conectarte
ssh -i tu_llave.pem -v ubuntu@tu-ip
```

### Los contenedores no inician

```bash
# Ver logs de todos los contenedores
docker compose logs

# Ver logs de un contenedor específico
docker compose logs aether-api

# Reiniciar un contenedor
docker compose restart aether-api
```

### Base de datos: Conexión rechazada

```bash
# Verifica que PostgreSQL esté health
docker compose ps aether-postgres

# Ver logs de PostgreSQL
docker compose logs aether-postgres

# Reinicia PostgreSQL
docker compose restart aether-postgres
```

### SSL Certificate Error

```bash
# Ver certificados existentes
sudo certbot certificates

# Si hay error, intenta nuevamente
sudo certbot certonly --webroot -w /home/ubuntu/aether/certbot/www -d tu-dominio.com

# Prueba tu certificado
curl -I https://tu-dominio.com
```

### Espacio en disco bajo

```bash
# Ver uso de disco
df -h /home/ubuntu/aether

# Limpiar imágenes viejas
docker image prune -f

# Limpiar volúmenes no usados
docker volume prune -f

# Limpiar todo lo no usado
docker system prune -a --volumes
```

### Puerto 80/443 en uso por otro proceso

```bash
# Ver qué está usando el puerto
sudo lsof -i :80
sudo lsof -i :443

# Si necesitas cambiar puerto en nginx
# Edita /home/ubuntu/aether/nginx.conf y cambia 'listen 80' a otro puerto
```

---

## Recursos Adicionales

- [Documentación de Docker Compose](https://docs.docker.com/compose/)
- [Documentación de Let's Encrypt](https://letsencrypt.org/docs/)
- [Documentación de GitHub Actions](https://docs.github.com/en/actions)
- [Documentación de AWS EC2](https://docs.aws.amazon.com/ec2/)

---

## Soporte

Si encuentras problemas:

1. Revisa los logs (usa `scripts/logs.sh`)
2. Verifica que las variables de `.env` sean correctas
3. Ejecuta `scripts/health-check.sh` para diagnósticos
4. Revisa el GitHub Actions workflow en tu repositorio para errores de CI/CD

---

**Última actualización:** Febrero 2026
