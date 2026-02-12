<template>
    <section class="dashboard-context">
        <div class="section-header">
            <h3 class="section-title-dashboard">Tu Contexto</h3>
            <div class="weather-widgets">
                <div class="widget">
                    <span class="material-symbols-outlined icon-sun">light_mode</span>
                    <span>22°C</span>
                </div>
                <div class="widget">
                    <span class="material-symbols-outlined icon-fire">local_fire_department</span>
                    <span>5 d</span>
                </div>
            </div>
        </div>

        <div class="context-cards">
            <!-- Tech Trend -->
            <div class="context-card glass-panel" @click="openLink('https://astro.build/blog/astro-4/')">
                <div class="card-header">
                    <div class="icon-label primary">
                        <span class="material-symbols-outlined">trending_up</span>
                    </div>
                    <span class="card-tag">Tech Trend</span>
                </div>
                <h4 class="card-title">Astro 5.0 lanzado</h4>
                <p class="card-desc">Mejoras en Content Layer y rendimiento optimizado.</p>
            </div>

            <!-- Efemérides -->
            <div class="context-card glass-panel">
                <div class="card-header">
                    <div class="icon-label amber">
                        <span class="material-symbols-outlined">history</span>
                    </div>
                    <span class="card-tag">Efeméride</span>
                </div>
                <h4 class="card-title">Aniversario de Java</h4>
                <p class="card-desc">Hoy se cumplen 29 años del lanzamiento oficial de Java.</p>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
const openLink = (url: string) => {
    window.open(url, '_blank');
}
</script>

<style scoped>
.dashboard-context {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.section-title-dashboard {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
}

.weather-widgets {
    display: flex;
    gap: 0.5rem;
}

.widget {
    background: var(--bg-tertiary);
    border: 1px solid var(--glass-border);
    padding: 0.25rem 0.75rem;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    color: var(--text-secondary);
}

.icon-sun {
    color: #fbbf24;
    font-size: 1rem;
}

.icon-fire {
    color: #f97316;
    font-size: 1rem;
}

.context-cards {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.glass-panel {
    background: var(--bg-tertiary);
    background: rgba(var(--bg-secondary-rgb, 19, 24, 37), 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 1rem 1.25rem;
    transition: all 0.3s ease;
    cursor: pointer;
}

.glass-panel:hover {
    border-color: var(--accent-primary);
    transform: translateX(4px);
}

.card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
}

.icon-label {
    padding: 0.35rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-label .material-symbols-outlined {
    font-size: 1.1rem;
}

.icon-label.primary {
    background: rgba(var(--accent-primary-rgb), 0.1);
    color: var(--accent-primary);
    background: rgba(102, 126, 234, 0.1);
    /* fallback */
}

.icon-label.amber {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
}

.card-tag {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-tertiary);
}

.card-title {
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
    font-size: 1rem;
}

.card-desc {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.4;
}
</style>
