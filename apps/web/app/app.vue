<template>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;display=swap"
        rel="stylesheet" />
    <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
        rel="stylesheet" />
  <div class="app-shell" :class="{ 'light-theme': !isDarkMode }">
    <Sidebar v-if="user" @displayTheme="toggleTheme" />

    <main v-if="user" :class="{ 'with-sidebar': user }">
      <NuxtPage />
    </main>

    <LoadingOverlay :show="isLoading" :title="loadingTitle" :message="loadingMessage" />
    <Toast />

    <!-- Login Overlay if not user -->
    <div v-if="!user && !loading" class="landing-page">
      <!-- Animated Background -->
      <div class="animated-bg">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-icon">🚀</span>
            <span>Potenciado por IA Avanzada</span>
          </div>

          <h1 class="hero-title">
            <span class="title-line">Tu Asistente IA</span>
            <span class="title-line gradient-text">Completamente Personalizado</span>
          </h1>

          <p class="hero-description">
            Aether aprende de ti y se adapta a tu forma de trabajo.
            Conecta tus herramientas favoritas y obtén respuestas contextuales
            que realmente entienden tus necesidades.
          </p>

          <div class="hero-cta">
            <button @click="handleLogin" class="btn btn-primary">
              <span class="btn-icon">🌟</span>
              Comenzar gratis con Google
              <span class="btn-arrow">→</span>
            </button>
            <p class="cta-note">No se requiere tarjeta de crédito</p>
          </div>

          <!-- Stats -->
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-number">10k+</div>
              <div class="stat-label">Conversaciones</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-number">99.9%</div>
              <div class="stat-label">Precisión</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-number">24/7</div>
              <div class="stat-label">Disponible</div>
            </div>
          </div>
        </div>

        <!-- Hero Visual -->
        <div class="hero-visual">
          <div class="chat-preview">
            <div class="chat-message user-message">
              <div class="message-avatar">👤</div>
              <div class="message-content">
                ¿Puedes resumir mis emails importantes de hoy?
              </div>
            </div>
            <div class="chat-message ai-message">
              <div class="message-avatar">✨</div>
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <h2 class="section-title">¿Por qué elegir Aether?</h2>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🧠</div>
            <h3 class="feature-title">IA Contextual</h3>
            <p class="feature-description">
              Entiende el contexto de tus conversaciones y se adapta a tu estilo de comunicación único.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🔗</div>
            <h3 class="feature-title">Integraciones Potentes</h3>
            <p class="feature-description">
              Conecta Gmail, Calendar, Drive y más. Accede a toda tu información en un solo lugar.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3 class="feature-title">Personalización Total</h3>
            <p class="feature-description">
              Define tu identidad digital y obtén respuestas alineadas con tus preferencias y valores.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3 class="feature-title">Privacidad Primero</h3>
            <p class="feature-description">
              Tus datos están encriptados y seguros. Nunca compartimos tu información con terceros.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3 class="feature-title">Respuestas Instantáneas</h3>
            <p class="feature-description">
              Tecnología de última generación para respuestas rápidas y precisas en tiempo real.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3 class="feature-title">Análisis Profundo</h3>
            <p class="feature-description">
              Obtén insights y análisis de tus datos para tomar mejores decisiones informadas.
            </p>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="how-it-works-section">
        <h2 class="section-title">Comienza en 3 simples pasos</h2>

        <div class="steps-container">
          <div class="step-card">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3 class="step-title">Inicia Sesión</h3>
              <p class="step-description">
                Conéctate de forma segura con tu cuenta de Google en segundos.
              </p>
            </div>
          </div>

          <div class="step-arrow">→</div>

          <div class="step-card">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3 class="step-title">Configura tu Identidad</h3>
              <p class="step-description">
                Define quién eres y cómo quieres que Aether te ayude.
              </p>
            </div>
          </div>

          <div class="step-arrow">→</div>

          <div class="step-card">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3 class="step-title">Conecta tus Herramientas</h3>
              <p class="step-description">
                Integra tus apps favoritas y comienza a conversar con Aether.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="cta-card">
          <h2 class="cta-title">¿Listo para transformar tu productividad?</h2>
          <p class="cta-description">
            Únete a miles de usuarios que ya están trabajando de forma más inteligente con Aether.
          </p>
          <button @click="handleLogin" class="btn btn-primary btn-large">
            <span class="btn-icon">🚀</span>
            Empieza ahora
            <span class="btn-arrow">→</span>
          </button>
        </div>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <div class="footer-content">
          <div class="footer-brand">
            <span class="brand-icon">✨</span>
            Aether
          </div>
          <p class="footer-text">
            © 2026 Aether. Impulsando el futuro del trabajo con IA.
          </p>
        </div>
      </footer>
    </div>

    <div v-if="loading" class="loading-full">
      <div class="loading-content">
        <div class="loading-logo">
          <span class="logo-icon">✨</span>
          <div class="logo-pulse"></div>
        </div>
        <h2 class="loading-title">Aether</h2>
        <p class="loading-text">Preparando tu experiencia...</p>
        <div class="loading-bar">
          <div class="loading-progress"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, onMounted } from 'vue';
const { user, loading, loginWithGoogle, syncProfile } = useFirebaseAuth();
const { isLoading, loadingTitle, loadingMessage } = useLoading();

// Theme management
const isDarkMode = ref(true);

onMounted(() => {
  // Load theme preference from localStorage
  const savedTheme = localStorage.getItem('aether-theme');
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark';
  }
});

const toggleTheme = (value: boolean) => {
  isDarkMode.value = value;
  localStorage.setItem('aether-theme', isDarkMode.value ? 'dark' : 'light');
};

const handleLogin = async () => {
  try {
    console.log('[app.vue] handleLogin: Starting...');
    const firebaseUser = await loginWithGoogle();

    if (firebaseUser) {
      console.log('[app.vue] handleLogin: Auth result received:', firebaseUser.email);
      await nextTick();
      console.log('[app.vue] handleLogin: State synced, calling syncProfile...');
      await syncProfile();
      console.log('[app.vue] handleLogin: Profile synced. Navigating...');
      await navigateTo('/', { replace: true });
    } else {
      console.warn('[app.vue] handleLogin: No firebaseUser returned.');
    }
  } catch (error) {
    console.error('[app.vue] handleLogin: Error:', error);
    alert('Error al iniciar sesión. Revisa la consola.');
  }
};
</script>

<style>
</style>
