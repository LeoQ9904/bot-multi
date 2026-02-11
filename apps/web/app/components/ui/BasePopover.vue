<template>
    <div class="popover-container" ref="containerRef">
        <div class="popover-trigger" @click="toggle">
            <slot name="trigger"></slot>
        </div>

        <Teleport to="body">
            <div v-if="isOpen" class="popover-wrapper-outer">
                <div class="popover-overlay" @click="close"></div>
                <div class="popover-content" :class="[position, size]" :style="floatingStyle">
                    <slot></slot>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';

interface Props {
    position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
    size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
    position: 'bottom-right',
    size: 'medium'
});

const isOpen = ref(false);
const isMobile = ref(false);
const containerRef = ref<HTMLElement | null>(null);
const coords = ref({ top: 0, left: 0, width: 0 });

const toggle = () => {
    if (!isOpen.value) {
        updateCoords();
    }
    isOpen.value = !isOpen.value;
};

const close = () => {
    isOpen.value = false;
};

const updateCoords = () => {
    if (containerRef.value) {
        const rect = containerRef.value.getBoundingClientRect();
        coords.value = {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width
        };
    }
};

const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768;
};

const floatingStyle = computed(() => {
    if (isMobile.value) return {};

    const style: any = {
        top: `${coords.value.top + (props.position.startsWith('bottom') ? 40 : -10)}px`,
    };

    if (props.position.endsWith('left')) {
        style.left = `${coords.value.left}px`;
    } else {
        style.left = `${coords.value.left + coords.value.width - (props.size === 'small' ? 150 : props.size === 'medium' ? 220 : 300)}px`;
    }

    return style;
});

const handleClickOutside = (event: MouseEvent) => {
    // If it's telported, containerRef.value won't contain the target if it's the popover itself
    // But we have the overlay now for mobile, and on desktop handle it carefully
    if (isMobile.value) return; // Overlay handles it

    const popoverEl = document.querySelector('.popover-content');
    if (containerRef.value && !containerRef.value.contains(event.target as Node) && popoverEl && !popoverEl.contains(event.target as Node)) {
        close();
    }
};

onMounted(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
    document.removeEventListener('click', handleClickOutside);
});

defineExpose({ close });
</script>

<style scoped>
.popover-container {
    display: inline-block;
}

.popover-trigger {
    cursor: pointer;
}

.popover-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(2px);
    z-index: 2500;
    animation: fadeIn 0.2s ease;
}

.popover-content {
    position: absolute;
    z-index: 2600;
    margin-top: 0.5rem;
    background: var(--bg-secondary);
    backdrop-filter: blur(30px);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    box-shadow: 0 10px 30px var(--shadow);
    padding: 1rem;
    animation: popIn 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes popIn {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

@media (max-width: 768px) {
    .popover-content {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 90% !important;
        max-width: 350px !important;
        margin-top: 0 !important;
        border-radius: 24px;
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
        animation: modalIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes modalIn {
        from {
            opacity: 0;
            transform: translate(-50%, -40%) scale(0.9);
        }

        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
}

/* Positions (Desktop only) */
@media (min-width: 769px) {}

/* ... the rest can be cleaned up or kept if needed for reference, but floatingStyle overrides it ... */
</style>
