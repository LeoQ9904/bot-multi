<script setup lang="ts">
const emit = defineEmits(['manual', 'chat'])
defineProps({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    },
    manualText: {
        type: String,
        required: true
    },
    chatText: {
        type: String,
        required: true
    }
})
const handleManualTask = () => {
    emit('manual')
}
const handleChatTask = () => {
    emit('chat')
}
</script>
<template>
    <div class="empty-state-enhanced">
        <div class="empty-visual">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="empty-svg">
                <circle cx="100" cy="100" r="80" fill="url(#grad1)" fill-opacity="0.1" />
                <defs>
                    <linearGradient id="grad1" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                        <stop stop-color="var(--accent-primary)" />
                        <stop offset="1" stop-color="var(--accent-secondary)" />
                    </linearGradient>
                </defs>
                <!-- Abstract Robot/Icon -->
                <rect x="60" y="70" width="80" height="60" rx="12" stroke="url(#grad1)" stroke-width="2"
                    fill="var(--bg-tertiary)" />
                <circle cx="85" cy="95" r="4" fill="var(--accent-primary)">
                    <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="115" cy="95" r="4" fill="var(--accent-primary)">
                    <animate attributeName="opacity" values="1;0.3;1" dur="2s" begin="0.5s" repeatCount="indefinite" />
                </circle>
                <path d="M90 115C90 115 95 120 100 120C105 120 110 115 110 115" stroke="var(--accent-primary)"
                    stroke-width="2" stroke-linecap="round" />
                <!-- Floating particles -->
                <circle cx="40" cy="60" r="3" fill="var(--accent-tertiary)">
                    <animate attributeName="cy" values="60;50;60" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="160" cy="140" r="4" fill="var(--accent-primary)">
                    <animate attributeName="cy" values="140;150;140" dur="4s" repeatCount="indefinite" />
                </circle>
            </svg>
        </div>
        <h2 class="empty-title">{{ title }}</h2>
        <p class="empty-description">{{ subtitle }}</p>
        <button class="empty-cta" @click="handleManualTask">
            <span class="material-symbols-outlined">add_circle</span>
            {{ manualText }}
        </button>
        <button class="empty-cta" @click="handleChatTask">
            <span class="material-symbols-outlined">chat</span>
            {{ chatText }}
        </button>
    </div>
</template>

<style scoped>
/* Enhanced Empty State */
.empty-state-enhanced {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    text-align: center;
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
    border-radius: 32px;
    margin-top: 1rem;
    animation: fadeInDown 0.6s ease-out;
}

.empty-visual {
    width: 200px;
    height: 200px;
    margin-bottom: 0.5rem;
}

.empty-svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 0 20px var(--glow));
}

.empty-title {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.empty-description {
    color: var(--text-tertiary);
    font-size: 1.1rem;
    max-width: 400px;
    margin-bottom: 0.5rem;
    line-height: 1.6;
}

.empty-cta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    color: white;
    border: none;
    border-radius: 16px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 24px var(--glow);
    margin-bottom: 1rem;
}

.empty-cta:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px var(--glow);
}

@media (max-width: 768px) {
    .empty-state-enhanced {
        padding: 1rem 1rem;
        margin-top: 1rem;
    }

    .empty-title {
        font-size: 1.5rem;
    }

    .empty-description {
        font-size: 1rem;
    }
}
</style>