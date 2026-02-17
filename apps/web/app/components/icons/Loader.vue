<template>
    <div class="loading-wrapper" :class="[sizeClass, colorClass]">
        <!-- Spinner circular -->
        <svg v-if="variant === 'spinner'" class="loading-icon spin" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <circle class="track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5" />
            <path class="arc" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" />
        </svg>

        <!-- Dots -->
        <div v-else-if="variant === 'dots'" class="dots-wrapper">
            <span class="dot" style="animation-delay: 0ms" />
            <span class="dot" style="animation-delay: 150ms" />
            <span class="dot" style="animation-delay: 300ms" />
        </div>

        <!-- Pulse -->
        <div v-else-if="variant === 'pulse'" class="pulse-wrapper">
            <span class="pulse-ring" />
            <span class="pulse-core" />
        </div>

        <!-- Bars -->
        <div v-else-if="variant === 'bars'" class="bars-wrapper">
            <span class="bar" style="animation-delay: 0ms" />
            <span class="bar" style="animation-delay: 100ms" />
            <span class="bar" style="animation-delay: 200ms" />
            <span class="bar" style="animation-delay: 300ms" />
        </div>

        <!-- Label -->
        <span v-if="label" class="loading-label">{{ label }}</span>
    </div>
</template>

<script setup lang="ts">
type Variant = 'spinner' | 'dots' | 'pulse' | 'bars'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type Color = 'primary' | 'white' | 'success' | 'warning' | 'danger' | 'muted'

interface Props {
    variant?: Variant
    size?: Size
    color?: Color
    label?: string
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'spinner',
    size: 'md',
    color: 'primary',
})

const sizeClass = computed(() => `size-${props.size}`)
const colorClass = computed(() => `color-${props.color}`)
</script>

<style scoped>
/* ─── Wrapper ─────────────────────────── */
.loading-wrapper {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
}

/* ─── Sizes ───────────────────────────── */
.size-xs {
    --size: 16px;
    --dot-size: 5px;
    --bar-w: 3px;
    --bar-h: 12px;
    font-size: 0.65rem;
}

.size-sm {
    --size: 22px;
    --dot-size: 6px;
    --bar-w: 4px;
    --bar-h: 16px;
    font-size: 0.75rem;
}

.size-md {
    --size: 32px;
    --dot-size: 8px;
    --bar-w: 5px;
    --bar-h: 22px;
    font-size: 0.85rem;
}

.size-lg {
    --size: 48px;
    --dot-size: 11px;
    --bar-w: 6px;
    --bar-h: 30px;
    font-size: 1rem;
}

.size-xl {
    --size: 64px;
    --dot-size: 14px;
    --bar-w: 8px;
    --bar-h: 40px;
    font-size: 1.1rem;
}

/* ─── Colors ──────────────────────────── */
.color-primary {
    color: var(--accent-primary, #667eea);
}

.color-white {
    color: #ffffff;
}

.color-success {
    color: #10b981;
}

.color-warning {
    color: #f59e0b;
}

.color-danger {
    color: #ef4444;
}

.color-muted {
    color: var(--text-tertiary, #718096);
}

/* ─── Spinner ─────────────────────────── */
.loading-icon {
    width: var(--size);
    height: var(--size);
}

.track {
    opacity: 0.15;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.spin {
    animation: spin 0.8s linear infinite;
    transform-origin: center;
}

/* ─── Dots ────────────────────────────── */
.dots-wrapper {
    display: flex;
    align-items: center;
    gap: calc(var(--dot-size) * 0.6);
}

.dot {
    width: var(--dot-size);
    height: var(--dot-size);
    border-radius: 50%;
    background: currentColor;
    animation: dot-bounce 0.8s ease-in-out infinite;
}

@keyframes dot-bounce {

    0%,
    80%,
    100% {
        transform: scale(0.6);
        opacity: 0.4;
    }

    40% {
        transform: scale(1);
        opacity: 1;
    }
}

/* ─── Pulse ───────────────────────────── */
.pulse-wrapper {
    position: relative;
    width: var(--size);
    height: var(--size);
    display: flex;
    align-items: center;
    justify-content: center;
}

.pulse-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid currentColor;
    animation: pulse-ring 1.2s ease-out infinite;
    opacity: 0;
}

.pulse-core {
    width: 40%;
    height: 40%;
    border-radius: 50%;
    background: currentColor;
    animation: pulse-core 1.2s ease-in-out infinite;
}

@keyframes pulse-ring {
    0% {
        transform: scale(0.5);
        opacity: 0.8;
    }

    100% {
        transform: scale(1.5);
        opacity: 0;
    }
}

@keyframes pulse-core {

    0%,
    100% {
        transform: scale(0.9);
        opacity: 0.7;
    }

    50% {
        transform: scale(1.1);
        opacity: 1;
    }
}

/* ─── Bars ────────────────────────────── */
.bars-wrapper {
    display: flex;
    align-items: flex-end;
    gap: calc(var(--bar-w) * 0.6);
    height: var(--bar-h);
}

.bar {
    width: var(--bar-w);
    height: 100%;
    border-radius: var(--bar-w);
    background: currentColor;
    animation: bar-wave 0.8s ease-in-out infinite;
}

@keyframes bar-wave {

    0%,
    100% {
        transform: scaleY(0.4);
        opacity: 0.5;
    }

    50% {
        transform: scaleY(1);
        opacity: 1;
    }
}

/* ─── Label ───────────────────────────── */
.loading-label {
    color: currentColor;
    font-weight: 600;
    opacity: 0.8;
}
</style>