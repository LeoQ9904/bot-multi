<template>
    <div class="popover-container" ref="containerRef">
        <div class="popover-trigger" @click="toggle">
            <slot name="trigger"></slot>
        </div>

        <div v-if="isOpen" class="popover-content" :class="[position, size]">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Props {
    position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
    size?: 'small' | 'medium' | 'large';
}

withDefaults(defineProps<Props>(), {
    position: 'bottom-right',
    size: 'medium'
});

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const toggle = () => {
    isOpen.value = !isOpen.value;
};

const close = () => {
    isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
        close();
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

defineExpose({ close });
</script>

<style scoped>
.popover-container {
    position: relative;
    display: inline-block;
}

.popover-trigger {
    cursor: pointer;
}

.popover-content {
    position: absolute;
    z-index: 1000;
    margin-top: 0.5rem;
    background: var(--bg-secondary);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    box-shadow: 0 20px 40px var(--shadow);
    padding: 1rem;
    animation: popIn 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
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

/* Positions */
.bottom-right {
    top: 100%;
    right: 0;
}

.bottom-left {
    top: 100%;
    left: 0;
}

.top-right {
    bottom: 100%;
    right: 0;
    margin-bottom: 0.5rem;
}

.top-left {
    bottom: 100%;
    left: 0;
    margin-bottom: 0.5rem;
}

/* Sizes */
.small {
    width: 150px;
}

.medium {
    width: 220px;
}

.large {
    width: 300px;
}
</style>
