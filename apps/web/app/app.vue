<template>
  <div class="app-shell" :class="{ 'light-theme': !isDarkMode }">
    <NavComponent v-if="user" @displayTheme="toggleTheme" />

    <main v-if="user" :class="{ 'with-nav': user }">
      <NuxtPage />
    </main>

    <LoadingOverlay :show="isLoading" :title="loadingTitle" :message="loadingMessage" />

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
/* CSS Variables for Theme System */
:root {
  /* Dark Theme (Default) */
  --bg-primary: #0a0e1a;
  --bg-secondary: #131825;
  --bg-tertiary: #1e2537;
  --text-primary: #ffffff;
  --text-secondary: #a0aec0;
  --text-tertiary: #718096;
  --accent-primary: #667eea;
  --accent-secondary: #764ba2;
  --accent-tertiary: #f093fb;
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --shadow: rgba(0, 0, 0, 0.4);
  --glow: rgba(102, 126, 234, 0.3);
}

.light-theme {
  /* Light Theme */
  --bg-primary: #f7fafc;
  --bg-secondary: #ffffff;
  --bg-tertiary: #edf2f7;
  --text-primary: #1a202c;
  --text-secondary: #4a5568;
  --text-tertiary: #718096;
  --accent-primary: #5a67d8;
  --accent-secondary: #667eea;
  --accent-tertiary: #9f7aea;
  --glass-bg: rgba(255, 255, 255, 0.9);
  --glass-border: rgba(0, 0, 0, 0.08);
  --shadow: rgba(0, 0, 0, 0.1);
  --glow: rgba(90, 103, 216, 0.2);
}

/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background: var(--bg-primary);
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text-primary);
  overflow-x: hidden;
  transition: background-color 0.4s ease, color 0.4s ease;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-shell {
  min-height: 100vh;
  background: var(--bg-primary);
  transition: background-color 0.4s ease;
}

/* ===== NAVIGATION ===== */
.glass-nav {
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 1000px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 100px;
  padding: 0.875rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 8px 32px var(--shadow);
  transition: all 0.3s ease;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 800;
  font-size: 1.5rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-icon {
  font-size: 1.5rem;
  filter: drop-shadow(0 0 8px var(--glow));
}

.hamburger-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 1001;
}

.hamburger-btn span {
  width: 26px;
  height: 3px;
  background: var(--text-primary);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.hamburger-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(8px, 8px);
}

.hamburger-btn.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--glass-bg);
}

.router-link-active {
  color: var(--accent-primary);
  background: var(--glass-bg);
}

.link-icon {
  font-size: 1.1rem;
}

.nav-btn-theme {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.3rem;
}

.nav-btn-theme:hover {
  transform: scale(1.1) rotate(20deg);
  box-shadow: 0 4px 12px var(--glow);
}

.nav-btn-logout {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 0.5rem 1.25rem;
  border-radius: 50px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.nav-btn-logout:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-1px);
}

/* ===== LANDING PAGE ===== */
.landing-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* Animated Background */
.animated-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--accent-primary), transparent);
  top: -10%;
  left: -10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, var(--accent-secondary), transparent);
  bottom: -10%;
  right: -10%;
  animation-delay: 7s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, var(--accent-tertiary), transparent);
  top: 40%;
  right: 20%;
  animation-delay: 14s;
}

@keyframes float {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(50px, -50px) scale(1.1);
  }

  66% {
    transform: translate(-50px, 50px) scale(0.9);
  }
}

/* Hero Section */
.hero-section {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 8rem 2rem 4rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  min-height: 90vh;
}

.hero-content {
  animation: fadeInUp 0.8s ease-out;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px var(--shadow);
}

.badge-icon {
  font-size: 1.2rem;
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.title-line {
  display: block;
}

.gradient-text {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary), var(--accent-tertiary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 6s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradientShift {

  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
  max-width: 500px;
}

.hero-cta {
  margin-bottom: 3rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  box-shadow: 0 8px 24px var(--glow);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px var(--glow);
}

.btn-icon {
  font-size: 1.3rem;
}

.btn-arrow {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.btn-primary:hover .btn-arrow {
  transform: translateX(4px);
}

.btn-large {
  padding: 1.25rem 2.5rem;
  font-size: 1.1rem;
}

.cta-note {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-tertiary);
}

/* Hero Stats */
.hero-stats {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 4px 12px var(--shadow);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin-top: 0.25rem;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--glass-border);
}

/* Hero Visual */
.hero-visual {
  animation: fadeInRight 0.8s ease-out 0.2s both;
}

.chat-preview {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 60px var(--shadow);
  animation: float 6s ease-in-out infinite;
}

.chat-message {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  animation: slideIn 0.5s ease-out;
}

.chat-message:last-child {
  margin-bottom: 0;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.user-message .message-avatar {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.ai-message .message-avatar {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.message-content {
  background: var(--bg-tertiary);
  padding: 1rem 1.25rem;
  border-radius: 16px;
  font-size: 0.95rem;
  line-height: 1.6;
  flex: 1;
}

.typing-indicator {
  display: flex;
  gap: 0.4rem;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: var(--accent-primary);
  border-radius: 50%;
  animation: typing 1.4s ease-in-out infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {

  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.7;
  }

  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Features Section */
.features-section {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 6rem 2rem;
}

.section-title {
  text-align: center;
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 4rem;
  background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px var(--shadow);
  border-color: var(--accent-primary);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 8px var(--glow));
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.feature-description {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* How It Works Section */
.how-it-works-section {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 6rem 2rem;
}

.steps-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.step-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 2rem;
  max-width: 280px;
  text-align: center;
  transition: all 0.3s ease;
}

.step-card:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 32px var(--shadow);
}

.step-number {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 800;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 16px var(--glow);
}

.step-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.step-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

.step-arrow {
  font-size: 2rem;
  color: var(--accent-primary);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* CTA Section */
.cta-section {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 6rem 2rem;
}

.cta-card {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 32px;
  padding: 4rem;
  text-align: center;
  box-shadow: 0 20px 60px var(--glow);
  position: relative;
  overflow: hidden;
}

.cta-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.cta-description {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
}

/* Footer */
.landing-footer {
  position: relative;
  z-index: 1;
  padding: 3rem 2rem;
  text-align: center;
  border-top: 1px solid var(--glass-border);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 800;
  font-size: 1.5rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

.footer-text {
  font-size: 0.95rem;
  color: var(--text-tertiary);
}

/* Loading State */
.loading-full {
  position: fixed;
  inset: 0;
  background: var(--bg-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  overflow: hidden;
}

.loading-full::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, var(--accent-primary) 0%, transparent 70%);
  opacity: 0.1;
  animation: pulse-bg 3s ease-in-out infinite;
}

@keyframes pulse-bg {
  0%, 100% { opacity: 0.1; transform: scale(1); }
  50% { opacity: 0.2; transform: scale(1.1); }
}

.loading-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.loading-logo {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 2rem;
}

.logo-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 0 20px var(--glow));
}

.logo-pulse {
  position: absolute;
  inset: 0;
  border: 3px solid var(--accent-primary);
  border-radius: 50%;
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.loading-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeInUp 0.6s ease-out;
}

.loading-text {
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: 2rem;
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.loading-bar {
  width: 200px;
  height: 4px;
  background: var(--glass-border);
  border-radius: 2px;
  margin: 0 auto;
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out 0.4s both;
}

.loading-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 2px;
  animation: progress 1.5s ease-in-out infinite;
}

@keyframes progress {
  0% { width: 0%; transform: translateX(0); }
  50% { width: 70%; }
  100% { width: 100%; transform: translateX(0); }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive Design */
.with-nav {
  padding-top: 6rem;
}

@media (max-width: 1024px) {
  .hero-section {
    grid-template-columns: 1fr;
    gap: 3rem;
    padding-top: 6rem;
  }

  .hero-title {
    font-size: 3rem;
  }

  .section-title {
    font-size: 2.5rem;
  }

  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .glass-nav {
    left: 1rem;
    right: 1rem;
    width: auto;
    max-width: none;
    transform: none;
    padding: 0.75rem 1.5rem;
    border-radius: 20px;
  }

  .hamburger-btn {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: 5rem;
    left: 1rem;
    right: 1rem;
    transform: none;
    width: auto;
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 1.5rem;
    flex-direction: column;
    gap: 0.75rem;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    box-shadow: 0 8px 32px var(--shadow);
  }

  .nav-links.mobile-open {
    opacity: 1;
    pointer-events: all;
  }

  .nav-link {
    width: 100%;
    justify-content: center;
    padding: 0.75rem;
    border-radius: 12px;
  }

  .nav-btn-theme,
  .nav-btn-logout {
    width: 100%;
    padding: 0.75rem;
  }

  .hero-section {
    padding: 5rem 1.5rem 3rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-description {
    font-size: 1.1rem;
  }

  .hero-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .stat-divider {
    display: none;
  }

  .section-title {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .steps-container {
    flex-direction: column;
  }

  .step-arrow {
    transform: rotate(90deg);
  }

  .cta-card {
    padding: 2.5rem 1.5rem;
  }

  .cta-title {
    font-size: 2rem;
  }

  .cta-description {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.75rem;
  }

  .btn {
    font-size: 0.95rem;
    padding: 0.875rem 1.5rem;
  }
}
</style>
