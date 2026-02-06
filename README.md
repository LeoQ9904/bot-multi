# Aether - AI Assistant Platform

Plataforma de asistente de IA personalizable con integraciones multi-canal (Telegram, Web) y servicios externos (Notion, Google).

## 🏗️ Arquitectura

Monorepo con arquitectura modular:

```
bot-multi/
├── apps/
│   ├── api/          # Backend NestJS
│   └── web/          # Frontend Nuxt 3
├── packages/
│   └── config/       # Configuraciones compartidas
└── docker-compose.yml
```

## 🚀 Tecnologías

### Backend (API)
- **Framework**: NestJS 11
- **Base de datos**: PostgreSQL + Prisma ORM
- **Autenticación**: Firebase Admin SDK
- **IA**: AWS Bedrock (Claude)
- **Integraciones**: Telegraf (Telegram), Tavily (Search)

### Frontend (Web)
- **Framework**: Nuxt 3
- **UI**: Vue 3 + Composition API
- **Autenticación**: Firebase Auth
- **Estilos**: CSS Variables (Dark/Light theme)

### DevOps
- **Monorepo**: pnpm workspaces
- **Containerización**: Docker + Docker Compose
- **Linting**: ESLint + Prettier

## 📋 Requisitos

- Node.js 18+
- pnpm 10+
- Docker & Docker Compose
- PostgreSQL 15+

## 🔧 Instalación

1. **Clonar repositorio**
```bash
git clone <repository-url>
cd bot-multi
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**

Crear archivos `.env` en:
- `apps/api/.env`
- `apps/web/.env`

Ver secciones de configuración en READMEs individuales.

4. **Iniciar base de datos**
```bash
pnpm db:up
```

5. **Ejecutar migraciones**
```bash
cd apps/api
pnpm prisma migrate dev
```

## 🎯 Comandos

```bash
# Desarrollo (API + Web en paralelo)
pnpm dev

# Solo API
pnpm dev:api

# Solo Web
pnpm dev:web

# Base de datos
pnpm db:up      # Iniciar PostgreSQL
pnpm db:down    # Detener PostgreSQL
```

## 📁 Estructura del Proyecto

### `/apps/api`
Backend con arquitectura modular:
- `src/modules/ai` - Servicios de IA y gestión de identidad
- `src/modules/users` - Gestión de usuarios
- `src/modules/integrations` - Integraciones (Telegram, Notion)
- `src/common` - Guards, interceptors, filters

### `/apps/web`
Frontend con páginas:
- `/` - Chat principal
- `/identity` - Configuración de identidad del bot
- `/integrations` - Gestión de integraciones

## 🔐 Seguridad

- Autenticación con Firebase
- Guards de autorización en API
- Validación de entrada con DTOs
- Variables de entorno para secretos
- CORS configurado

## 🌐 Puertos

- **API**: `http://localhost:8080`
- **Web**: `http://localhost:3003`
- **PostgreSQL**: `localhost:5433`

## 📚 Documentación

Ver READMEs específicos:
- [API Documentation](./apps/api/README.md)
- [Web Documentation](./apps/web/README.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

UNLICENSED - Proyecto privado
