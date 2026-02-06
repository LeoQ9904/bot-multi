<template>
  <Transition name="fade">
    <div v-if="show" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-logo">
          <span class="logo-icon">✨</span>
          <div class="logo-pulse"></div>
        </div>
        <h3 class="loading-title">{{ title }}</h3>
        <p v-if="message" class="loading-text">{{ message }}</p>
        <div class="loading-bar">
          <div class="loading-progress"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  title?: string;
  message?: string;
}>();
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-primary);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.loading-content {
  text-align: center;
}

.loading-logo {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
}

.logo-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.5rem;
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

@keyframes float {
  0%, 100% {
    transform: translate(-50%, -50%) translateY(0);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-10px);
  }
}

.loading-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.loading-text {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.loading-bar {
  width: 180px;
  height: 3px;
  background: var(--glass-border);
  border-radius: 2px;
  margin: 0 auto;
  overflow: hidden;
}

.loading-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 2px;
  animation: progress 1.5s ease-in-out infinite;
}

@keyframes progress {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
