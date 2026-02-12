<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    }
})
</script>

<template>
    <div class="header-page">
        <h1 class="page-title">{{ title }}</h1>
        <p class="page-subtitle">{{ subtitle }}</p>
    </div>
</template>

<style scoped>
.header-page {
    margin-bottom: 2.5rem;
}

.page-title {
    font-size: 2.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
}

.page-subtitle {
    color: var(--text-tertiary);
    font-size: 1.1rem;
}

@media (max-width: 768px) {
    .page-title {
        font-size: 2rem;
    }
}
</style>