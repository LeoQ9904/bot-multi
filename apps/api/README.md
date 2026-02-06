# Aether API - Backend

Backend NestJS para la plataforma Aether con IA, autenticación y gestión de integraciones.

## 🛠️ Stack Tecnológico

- **Framework**: NestJS 11
- **Lenguaje**: TypeScript 5.7
- **Base de datos**: PostgreSQL 15 + Prisma ORM 5.22
- **Autenticación**: Firebase Admin SDK
- **IA**: AWS Bedrock (Claude 3.5 Sonnet)
- **Bots**: Telegraf 4.16
- **Search**: Tavily API

## 📂 Estructura

```
src/
├── common/
│   ├── filters/          # Exception filters
│   ├── guards/           # Firebase auth guard
│   └── interceptors/     # Response transformer
├── modules/
│   ├── ai/              # IA y gestión de identidad
│   ├── users/           # Gestión de usuarios
│   └── integrations/    # Telegram, Notion, etc.
├── interfaces/          # TypeScript interfaces
├── prisma.service.ts    # Prisma client
└── main.ts             # Bootstrap
```

## 🔧 Configuración

### Variables de Entorno (`.env`)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5433/aether_db?schema=public"

# AWS Bedrock
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# Firebase
FIREBASE_PROJECT_ID=your_project_id
GCLOUD_PROJECT=your_project_id

# APIs
TAVILY_API_KEY=your_tavily_key

# Server
PORT=8080
```

### Firebase Service Account

Colocar `serviceAccountKey.json` en la raíz del proyecto API.

## 🚀 Instalación

```bash
# Instalar dependencias
pnpm install

# Generar Prisma Client
pnpm prisma generate

# Ejecutar migraciones
pnpm prisma migrate dev

# Iniciar en desarrollo
pnpm start:dev
```

## 📡 Endpoints

### Autenticación
Todos los endpoints requieren header: `Authorization: Bearer <firebase_token>`

### AI
- `POST /ai/chat` - Chat con IA
- `GET /ai/identity` - Obtener identidad del bot
- `POST /ai/identity` - Actualizar identidad

### Users
- `GET /users/profile` - Perfil del usuario autenticado

### Integrations
- `GET /integrations` - Listar integraciones
- `POST /integrations` - Crear integración
- `DELETE /integrations/:id` - Eliminar integración

## 🗄️ Base de Datos

### Modelos Prisma

- **User**: Usuarios con Firebase UID
- **Integration**: Integraciones (Telegram, Notion, etc.)
- **Conversation**: Conversaciones por plataforma
- **Message**: Mensajes de chat

### Comandos Prisma

```bash
# Crear migración
pnpm prisma migrate dev --name nombre_migracion

# Aplicar migraciones
pnpm prisma migrate deploy

# Abrir Prisma Studio
pnpm prisma studio

# Reset database
pnpm prisma migrate reset
```

## 🔒 Seguridad

- **FirebaseGuard**: Valida tokens JWT de Firebase
- **HttpExceptionFilter**: Manejo global de errores
- **TransformInterceptor**: Formato estándar de respuestas
- **CORS**: Configurado para `http://localhost:3003`

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:cov
```

## 📦 Build & Deploy

```bash
# Build
pnpm build

# Producción
pnpm start:prod
```

## 🐳 Docker

```bash
# Build imagen
docker build -t aether-api .

# Run container
docker run -p 8080:8080 aether-api
```

## 🔍 Logs

Los logs incluyen:
- Peticiones HTTP (desarrollo)
- Errores de autenticación
- Operaciones de base de datos
- Eventos de Telegram bot

## 📝 Notas

- El puerto por defecto es `8080`
- La memoria de conversaciones se guarda en `storage/memory/`
- Los bots de Telegram se inician automáticamente al crear integración
