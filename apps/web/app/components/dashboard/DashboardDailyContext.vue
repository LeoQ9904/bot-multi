<template>
    <section class="dashboard-context">
        <div class="section-header">
            <h3 class="section-title-dashboard">Tu Contexto</h3>
        </div>

        <!-- Mobile: Carousel con snap -->
        <template v-if="!loading">
            <div class="context-carousel" ref="carouselRef" @scroll="onScroll">
                <div v-for="(item, index) in contextItems" :key="index" class="context-card"
                    :class="[item.type, item.colorClass, { clickable: !!item.link }]"
                    @click="item.link ? openLink(item.link) : null" @mouseenter="hoveredIndex = index"
                    @mouseleave="hoveredIndex = null">
                    <!-- Glow de fondo -->
                    <div class="card-glow"></div>

                    <div class="card-header">
                        <div class="icon-label">
                            <span class="material-symbols-outlined">{{ item.icon }}</span>
                        </div>
                        <span class="card-tag">{{ item.tag }}</span>
                        <span v-if="item.link" class="card-link-icon material-symbols-outlined">open_in_new</span>
                    </div>

                    <div class="card-body">
                        <h4 class="card-title">{{ item.title }}</h4>
                        <p class="card-desc">{{ item.description }}</p>
                    </div>

                    <div class="card-footer" v-if="item.footer">
                        <span class="footer-dot"></span>
                        <span class="footer-text">{{ item.footer }}</span>
                    </div>
                </div>
            </div>
            <!-- Dots móvil -->
            <div class="carousel-dots">
                <span v-for="(item, index) in contextItems" :key="index" class="dot"
                    :class="{ active: activeDot === index }" @click="scrollToCard(index)"></span>
            </div>
        </template>

        <div v-else class="context-carousel">
            <div v-for="index in 8" :key="`skeleton-${index}`" class="context-card skeleton-card">
                <div class="card-glow skeleton-glow"></div>

                <div class="card-header">
                    <div class="icon-label skeleton-icon">
                        <div class="skeleton-shimmer"></div>
                    </div>
                    <span class="card-tag skeleton-tag">
                        <div class="skeleton-shimmer"></div>
                    </span>
                </div>

                <div class="card-body">
                    <div class="skeleton-title">
                        <div class="skeleton-shimmer"></div>
                    </div>
                    <div class="skeleton-desc">
                        <div class="skeleton-shimmer"></div>
                    </div>
                    <div class="skeleton-desc short">
                        <div class="skeleton-shimmer"></div>
                    </div>
                </div>

                <div class="card-footer">
                    <span class="footer-dot skeleton-dot"></span>
                    <span class="skeleton-footer-text">
                        <div class="skeleton-shimmer"></div>
                    </span>
                </div>
            </div>
        </div>

    </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Interests } from '~/interfaces';
import { useIaService } from '~/services/ia.service';

const carouselRef = ref<HTMLElement | null>(null)
const hoveredIndex = ref<number | null>(null)
const activeDot = ref(0)
const contextItems = ref<Interests[]>([])
const loading = ref(false)

const fetchAllSettings = async () => {
    const { user } = useFirebaseAuth();
    if (!user.value) return;

    loading.value = true;
    const token = await user.value.getIdToken();

    // Fetch Integrations
    try {
        const response = await useIaService().getInterests(token);
        contextItems.value = response.data.interests
    } catch (e) {
        console.error('Failed to fetch integrations', e);
    } finally {
        loading.value = false;
    }
};

const openLink = (url: string) => {
    window.open(url, '_blank')
}

const onScroll = () => {
    if (!carouselRef.value) return
    const el = carouselRef.value
    const cardWidth = el.scrollWidth / contextItems.value.length
    activeDot.value = Math.round(el.scrollLeft / cardWidth)
}

const scrollToCard = (index: number) => {
    if (!carouselRef.value) return
    const cardWidth = carouselRef.value.scrollWidth / contextItems.value.length
    carouselRef.value.scrollTo({ left: cardWidth * index, behavior: 'smooth' })
}

onMounted(() => {
    fetchAllSettings();
});
</script>

<style scoped>
/* ─────────────────────────────────────────
   VARIABLES DE COLOR POR TEMA
───────────────────────────────────────── */
.color-blue {
    --card-accent: #60a5fa;
    --card-glow: rgba(96, 165, 250, 0.15);
    --card-border: rgba(96, 165, 250, 0.3);
    --icon-bg: rgba(96, 165, 250, 0.12);
    --tag-color: #93c5fd;
}

.color-amber {
    --card-accent: #fbbf24;
    --card-glow: rgba(251, 191, 36, 0.15);
    --card-border: rgba(251, 191, 36, 0.3);
    --icon-bg: rgba(251, 191, 36, 0.12);
    --tag-color: #fcd34d;
}

.color-purple {
    --card-accent: #c084fc;
    --card-glow: rgba(192, 132, 252, 0.15);
    --card-border: rgba(192, 132, 252, 0.3);
    --icon-bg: rgba(192, 132, 252, 0.12);
    --tag-color: #d8b4fe;
}

.color-emerald {
    --card-accent: #34d399;
    --card-glow: rgba(52, 211, 153, 0.15);
    --card-border: rgba(52, 211, 153, 0.3);
    --icon-bg: rgba(52, 211, 153, 0.12);
    --tag-color: #6ee7b7;
}

/* ─────────────────────────────────────────
   CONTENEDOR PRINCIPAL
───────────────────────────────────────── */
.dashboard-context {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    /* Evita desbordamiento */
    max-width: 100%;
    overflow: hidden;
    box-sizing: border-box;
}

/* ─────────────────────────────────────────
   HEADER
───────────────────────────────────────── */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0.25rem;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.section-title-dashboard {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
}

.weather-widgets {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
}

.widget {
    padding: 0.25rem 0.65rem;
    border-radius: 100px;
    font-size: 0.72rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    backdrop-filter: blur(8px);
    border: 1px solid;
    transition: transform 0.2s ease;
}

.widget:hover {
    transform: scale(1.05);
}

.widget .material-symbols-outlined {
    font-size: 0.9rem;
}

.widget-sun {
    background: rgba(251, 191, 36, 0.08);
    border-color: rgba(251, 191, 36, 0.25);
    color: #fcd34d;
}

.widget-fire {
    background: rgba(249, 115, 22, 0.08);
    border-color: rgba(249, 115, 22, 0.25);
    color: #fb923c;
}

/* ─────────────────────────────────────────
   CAROUSEL — FIX DE DESBORDAMIENTO MÓVIL
───────────────────────────────────────── */
.context-carousel {
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    /* Padding interno sin desbordar el padre */
    /* padding: 0.5rem 0.25rem 1rem 0.25rem; */
    /* Usa width: 100% para no salirse */
    max-width: 86vw;
    box-sizing: border-box;
}

.context-carousel::-webkit-scrollbar {
    display: none;
}

/* ─────────────────────────────────────────
   CARDS
───────────────────────────────────────── */
.context-card {
    position: relative;
    /* Ancho fijo que no desborda: usa calc con el gap */
    min-width: auto;
    max-width: 50vw;
    scroll-snap-align: center;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 200px;
    border-radius: 18px;
    padding: 1.1rem;
    box-sizing: border-box;
    cursor: default;
    overflow: hidden;
    /* Estilo base */
    background: rgba(var(--bg-secondary-rgb, 19, 24, 37), 0.6);
    border: 1px solid var(--card-border, rgba(255, 255, 255, 0.1));
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.context-card.clickable {
    cursor: pointer;
}

.context-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px -8px var(--card-glow, rgba(0, 0, 0, 0.2));
    border-color: var(--card-accent, rgba(255, 255, 255, 0.2));
}

.context-card:active {
    transform: scale(0.98);
}

/* Glow de fondo decorativo */
.card-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 20%, var(--card-glow, transparent) 0%, transparent 70%);
    pointer-events: none;
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.context-card:hover .card-glow {
    opacity: 1;
}

/* ─────────────────────────────────────────
   CARD HEADER
───────────────────────────────────────── */
.card-header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.65rem;
}

.icon-label {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--icon-bg, rgba(255, 255, 255, 0.07));
    flex-shrink: 0;
    transition: transform 0.2s ease;
}

.context-card:hover .icon-label {
    transform: scale(1.1) rotate(-3deg);
}

.icon-label .material-symbols-outlined {
    font-size: 1.1rem;
    color: var(--card-accent, #fff);
}

.card-tag {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--tag-color, rgba(255, 255, 255, 0.4));
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.card-link-icon {
    font-size: 0.85rem;
    color: var(--card-accent, rgba(255, 255, 255, 0.3));
    opacity: 0;
    transition: opacity 0.2s ease;
    flex-shrink: 0;
}

.context-card:hover .card-link-icon {
    opacity: 1;
}

/* ─────────────────────────────────────────
   CARD BODY
───────────────────────────────────────── */
.card-body {
    flex: 1;
    overflow: hidden;
}

.card-title {
    font-weight: 700;
    color: var(--text-primary, #fff);
    margin: 0 0 0.35rem 0;
    font-size: 0.95rem;
    line-height: 1.3;
}

.card-desc {
    font-size: 0.8rem;
    color: var(--text-secondary, rgba(255, 255, 255, 0.55));
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
}

/* ─────────────────────────────────────────
   CARD FOOTER
───────────────────────────────────────── */
.card-footer {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 0.65rem;
    padding-top: 0.65rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.footer-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--card-accent, rgba(255, 255, 255, 0.3));
    flex-shrink: 0;
}

.footer-text {
    font-size: 0.7rem;
    color: var(--text-tertiary, rgba(255, 255, 255, 0.35));
    font-weight: 600;
}

/* ─────────────────────────────────────────
   DOTS NAVEGACIÓN MÓVIL
───────────────────────────────────────── */
.carousel-dots {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-top: -0.25rem;
}

.dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    transition: all 0.3s ease;
    cursor: pointer;
}

.dot.active {
    background: var(--accent-primary, #60a5fa);
    width: 18px;
    border-radius: 100px;
}

/* ─────────────────────────────────────────
   TABLET / DESKTOP
───────────────────────────────────────── */
@media (min-width: 768px) {
    .context-carousel {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        overflow-x: visible;
        padding: 0.25rem;
        gap: 0.75rem;
        width: 100%;
    }

    .context-card {
        min-width: auto;
        max-width: none;
        scroll-snap-align: none;
        height: 210px;
    }

    .carousel-dots {
        display: none;
    }
}

@media (min-width: 1400px) {
    .context-carousel {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* ─────────────────────────────────────────
   SKELETON LOADING - DUAL THEME
───────────────────────────────────────── */
.skeleton-card {
    pointer-events: none;
    border-color: var(--glass-border) !important;
    background: var(--bg-secondary) !important;
}

.skeleton-card:hover {
    transform: none;
    box-shadow: none;
}

.skeleton-glow {
    background: radial-gradient(circle at 20% 20%,
            var(--glass-bg) 0%,
            transparent 70%);
    opacity: 1;
}

.skeleton-icon {
    background: var(--glass-bg) !important;
    overflow: hidden;
    position: relative;
}

.skeleton-tag {
    height: 12px;
    width: 80px;
    border-radius: 4px;
    background: var(--glass-bg);
    overflow: hidden;
    position: relative;
}

.skeleton-title {
    height: 18px;
    width: 70%;
    border-radius: 4px;
    background: var(--glass-bg);
    margin-bottom: 0.5rem;
    overflow: hidden;
    position: relative;
}

.skeleton-desc {
    height: 14px;
    width: 100%;
    border-radius: 4px;
    background: var(--glass-bg);
    margin-bottom: 0.35rem;
    overflow: hidden;
    position: relative;
}

.skeleton-desc.short {
    width: 85%;
    margin-bottom: 0;
}

.skeleton-dot {
    background: var(--glass-border);
}

.skeleton-footer-text {
    height: 10px;
    width: 60px;
    border-radius: 4px;
    background: var(--glass-bg);
    overflow: hidden;
    position: relative;
}

/* Animación shimmer - Adaptada para ambos temas */
.skeleton-shimmer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
            transparent 0%,
            var(--shimmer-color, rgba(255, 255, 255, 0.1)) 50%,
            transparent 100%);
    animation: shimmer 2s infinite;
}

/* Dark theme shimmer */
:root .skeleton-shimmer {
    --shimmer-color: rgba(255, 255, 255, 0.08);
}

/* Light theme shimmer */
.light-theme .skeleton-shimmer {
    --shimmer-color: rgba(0, 0, 0, 0.06);
}

@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

/* Pulso suave en el skeleton card */
.skeleton-card {
    animation: skeleton-pulse 2s ease-in-out infinite;
}

@keyframes skeleton-pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.8;
    }
}

/* Ajuste adicional para tema claro - bordes más visibles */
.light-theme .skeleton-card {
    box-shadow: 0 1px 3px var(--shadow);
}

.light-theme .skeleton-title,
.light-theme .skeleton-desc,
.light-theme .skeleton-tag,
.light-theme .skeleton-footer-text {
    background: var(--bg-tertiary);
}

.light-theme .skeleton-icon {
    background: var(--bg-tertiary) !important;
}
</style>