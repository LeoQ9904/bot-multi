# Aether Web - Frontend

Aplicación web moderna con Nuxt 3 para interactuar con el asistente de IA Aether.

## 🛠️ Stack Tecnológico

- **Framework**: Nuxt 3.4
- **UI**: Vue 3.5 (Composition API)
- **Autenticación**: Firebase Auth 12.8
- **Router**: Vue Router 4.6
- **Estilos**: CSS Variables (Dark/Light theme)
- **HTTP**: Nuxt useFetch

## 📂 Estructura

```text
app/
├── components/
│   ├── NavComponent.vue      # Navegación principal
│   ├── LoadingOverlay.vue    # Loading reutilizable
│   ├── notes/                # Componentes de notas
│   └── tasks/                # Componentes de tareas
├── composables/
│   ├── useAuth.ts            # Firebase auth
│   └── useLoading.ts         # Estado de loading
├── constants/
│   └── api-endpoints.ts      # Endpoints de API
├── interfaces/
│   └── index.ts              # TypeScript interfaces
├── pages/
│   ├── index.vue             # Dashboard principal
│   ├── chat.vue              # Chat con IA
│   ├── notes.vue             # Gestión de notas
│   ├── task.vue              # Gestión de tareas
│   ├── identity.vue          # Configuración de identidad
│   ├── integrations.vue      # Gestión de integraciones
│   ├── calendar.vue          # Calendario (en desarrollo)
│   ├── expenses.vue          # Gastos (en desarrollo)
│   └── insights.vue          # Insights (en desarrollo)
├── plugins/
│   └── firebase.client.ts    # Inicialización Firebase
├── services/
│   ├── api.service.ts        # Cliente HTTP base
│   ├── ia.service.ts         # Servicios de IA
│   ├── user.service.ts       # Servicios de usuario
│   ├── integration.service.ts # Servicios de integración
│   ├── note.service.ts       # Servicios de notas
│   ├── task.service.ts       # Servicios de tareas
│   └── auth.service.ts       # Servicios de auth
├── stores/
│   ├── note.store.ts         # Estado de notas
│   └── task.store.ts         # Estado de tareas
└── app.vue                   # Layout principal
```

## 🔧 Configuración

### Variables de Entorno (`.env`)

```env
# Firebase
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# API
NUXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080

# Environment
NODE_ENV=development
```

### Configuración Nuxt (`nuxt.config.ts`)

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
      nodeEnv: process.env.NODE_ENV
    }
  }
})
```

## 🚀 Instalación

```bash
# Instalar dependencias
pnpm install

# Desarrollo
pnpm dev

# Build
pnpm build

# Preview producción
pnpm preview
```

## 🎨 Características

### Temas (Dark/Light)

- Sistema de temas con CSS Variables
- Persistencia en localStorage
- Transiciones suaves

### Autenticación

- Login con Google (Firebase)
- Sincronización automática con backend
- Guards de rutas

### Loading States

- Componente reutilizable `LoadingOverlay`
- Tiempo mínimo de 800ms
- Adaptado a tema actual

### Servicios HTTP

- Cliente centralizado con interceptors
- Manejo automático de errores
- Formato estándar de respuestas `ApiResponse<T>`

## 📄 Páginas

### `/` - Dashboard

- Página principal de bienvenida
- Acceso rápido a funcionalidades

### `/chat` - Chat

- Interfaz de chat con IA
- Historial de mensajes
- Indicador de escritura
- Scroll automático

### `/notes` - Notas

- CRUD completo de notas
- Filtros por búsqueda y etiquetas
- Modales de detalle y edición
- Integración con chat de IA

### `/task` - Tareas

- Gestión completa de tareas
- Secciones por fecha (Hoy, Mañana, Esta Semana, Próximamente)
- Filtros avanzados (proyectos, categorías, fechas, etiquetas)
- Estados de tarea (pendiente, en progreso, completada, cancelada)
- Integración con chat de IA

### `/identity` - Identidad

- Configurar nombre del bot
- Mensaje de saludo
- Personalidad e instrucciones

### `/integrations` - Integraciones

- Conectar Telegram bot
- Configurar Notion
- Estado de conexiones

### `/calendar` - Calendario (En Desarrollo)

- Integración con Google Calendar
- Vista de eventos

### `/expenses` - Gastos (En Desarrollo)

- Seguimiento de gastos
- Categorización

### `/insights` - Insights (En Desarrollo)

- Análisis con IA de datos del usuario
- Visualizaciones y recomendaciones

## 🎯 Composables

### `useFirebaseAuth()`

```typescript
const { user, loading, loginWithGoogle, logout, syncProfile } = useFirebaseAuth();
```

### `useLoading()`

```typescript
const { show, hide } = useLoading();
show('Cargando', 'Mensaje opcional');
// ... operación
hide();
```

## 🔐 Seguridad

- Tokens JWT de Firebase
- Headers de autorización automáticos
- Validación de sesión
- CORS configurado

## 🎨 Estilos

### Variables CSS

```css
:root {
  --bg-primary: #0a0e1a;
  --text-primary: #ffffff;
  --accent-primary: #667eea;
  --glass-bg: rgba(255, 255, 255, 0.05);
  /* ... */
}

.light-theme {
  --bg-primary: #f7fafc;
  --text-primary: #1a202c;
  /* ... */
}
```

## 📱 Responsive

- Mobile-first design
- Breakpoints: 480px, 768px, 1024px
- Menú hamburguesa en móvil
- Grid adaptativo

## 🐳 Docker

```bash
# Build
docker build -t aether-web .

# Run
docker run -p 3003:3003 aether-web
```

## 📝 Notas

- Puerto por defecto: `3003`
- SSR deshabilitado (SPA mode)
- Auto-imports de componentes y composables
- TypeScript strict mode
