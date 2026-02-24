import { useState, onMounted, watch, computed } from '#imports';
import { useHead } from '#imports';

export const useTheme = () => {
    // Shared reactive state for the theme
    // Default to dark mode (true)
    const isDarkMode = useState<boolean>('aether-is-dark-mode', () => true);

    // Initialize from localStorage on the client side
    onMounted(() => {
        const savedTheme = localStorage.getItem('aether-theme');
        if (savedTheme) {
            isDarkMode.value = savedTheme === 'dark';
        }
    });

    // Watch for changes and save to localStorage
    watch(isDarkMode, (newValue) => {
        localStorage.setItem('aether-theme', newValue ? 'dark' : 'light');
    });

    // Handle body attributes via useHead
    useHead({
        bodyAttrs: {
            class: computed(() => isDarkMode.value ? '' : 'light-theme')
        }
    });

    const toggleTheme = () => {
        isDarkMode.value = !isDarkMode.value;
    };

    const setTheme = (theme: 'dark' | 'light') => {
        isDarkMode.value = theme === 'dark';
    };

    return {
        isDarkMode,
        toggleTheme,
        setTheme
    };
};
