import { useState, onMounted, watch } from '#imports';

export const useSidebar = () => {
    // Start with false to match server-side default
    const isCollapsed = useState<boolean>('sidebar-collapsed', () => false);
    const initialized = useState<boolean>('sidebar-initialized', () => false);

    // Initialize from localStorage on client-side
    onMounted(() => {
        if (!initialized.value) {
            const savedState = localStorage.getItem('sidebar-collapsed');
            if (savedState !== null) {
                isCollapsed.value = savedState === 'true';
            }
            initialized.value = true;
        }
    });

    // Watch for changes and save to localStorage
    watch(isCollapsed, (newValue) => {
        localStorage.setItem('sidebar-collapsed', String(newValue));
    });

    const toggleSidebar = () => {
        isCollapsed.value = !isCollapsed.value;
    };

    const setCollapsed = (value: boolean) => {
        isCollapsed.value = value;
    };

    return {
        isCollapsed,
        toggleSidebar,
        setCollapsed
    };
};
