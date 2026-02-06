<script setup>
  import { ref, onMounted } from 'vue';
  const { logout } = useFirebaseAuth();


  const isMobileMenuOpen = ref(false);
  // Theme management
  const isDarkMode = ref(true);

  // Define the emits
  const emit = defineEmits(['displayTheme']);

  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false;
  };

  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
  };

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem('aether-theme', isDarkMode.value ? 'dark' : 'light');
    emit('displayTheme', isDarkMode.value);
  };

  onMounted(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('aether-theme');
    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark';
    }
  });
</script>
<template>
    <nav class="glass-nav">
      <div class="nav-brand">Aether</div>
      
      <!-- Hamburger Menu Button (Mobile Only) -->
      <button @click="toggleMobileMenu" class="hamburger-btn">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Navigation Links -->
      <div class="nav-links" :class="{ 'mobile-open': isMobileMenuOpen }">
        <NuxtLink to="/" class="nav-link" @click="closeMobileMenu">Chat</NuxtLink>
        <NuxtLink to="/identity" class="nav-link" @click="closeMobileMenu">Identidad</NuxtLink>
        <NuxtLink to="/integrations" class="nav-link" @click="closeMobileMenu">Integraciones</NuxtLink>
        <button @click="toggleTheme" class="nav-btn-theme" :title="isDarkMode ? 'Tema claro' : 'Tema oscuro'">
          {{ isDarkMode ? '☀️' : '🌙' }}
        </button>
        <button @click="logout" class="nav-btn-logout">Cerrar sesión</button>
      </div>
    </nav>
</template>