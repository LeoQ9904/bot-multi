<template>
    <div class="filter-bar">
        <!-- Todas / Categorías Popover -->
        <BasePopover position="bottom-left" size="large">
            <template #trigger>
                <button class="filter-chip" :class="{ active: modelValue.type === 'all' }">
                    {{ selectedLabel }}
                    <span class="material-symbols-outlined">expand_more</span>
                </button>
            </template>
            <div class="filter-menu">
                <div class="menu-section">
                    <p class="section-label">Mostrar por:</p>
                    <div class="toggle-group">
                        <button class="toggle-item" :class="{ active: listType === 'projects' }"
                            @click="listType = 'projects'">Proyectos</button>
                        <button class="toggle-item" :class="{ active: listType === 'categories' }"
                            @click="listType = 'categories'">Categorías</button>
                    </div>
                </div>
                <div class="menu-list">
                    <button class="menu-item" @click="resetAll">Todas las tareas</button>
                    <button v-for="item in currentList" :key="item" class="menu-item"
                        :class="{ active: isItemSelected(item) }" @click="toggleItem(item)">
                        {{ item }}
                        <span v-if="isItemSelected(item)" class="material-symbols-outlined">check</span>
                    </button>
                </div>
            </div>
        </BasePopover>

        <!-- Fecha Popover -->
        <BasePopover position="bottom-left" size="large">
            <template #trigger>
                <button class="filter-chip" :class="{ active: modelValue.type === 'date' }">
                    Fecha
                    <span class="material-symbols-outlined">expand_more</span>
                </button>
            </template>
            <div class="filter-menu">
                <div class="menu-section">
                    <p class="section-label">Orden</p>
                    <div class="toggle-group">
                        <button class="toggle-item" :class="{ active: modelValue.sortOrder === 'desc' }"
                            @click="updateFilter({ sortOrder: 'desc' })">Más recientes</button>
                        <button class="toggle-item" :class="{ active: modelValue.sortOrder === 'asc' }"
                            @click="updateFilter({ sortOrder: 'asc' })">Más antiguas</button>
                    </div>
                </div>
                <div class="menu-section">
                    <p class="section-label">Rango Personalizado</p>
                    <div class="date-picker-container">
                        <VueDatePicker v-model="internalDateRange" range :teleport="true" dark format="dd/MM/yyyy"
                            auto-apply placeholder="Seleccionar rango" class="custom-datepicker"
                            :enable-time-picker="false" @update:model-value="handleManualDate" />
                    </div>
                </div>
                <div class="menu-section">
                    <p class="section-label">Atajos</p>
                    <div class="quick-options">
                        <button class="quick-btn" @click="setDateQuick('today')">Hoy</button>
                        <button class="quick-btn" @click="setDateQuick('tomorrow')">Mañana</button>
                        <button class="quick-btn" @click="setDateQuick('week')">Próx. 7 días</button>
                    </div>
                </div>
            </div>
        </BasePopover>

        <!-- Etiquetas Popover -->
        <BasePopover position="bottom-left" size="medium">
            <template #trigger>
                <button class="filter-chip" :class="{ active: modelValue.tags.length > 0 }">
                    Etiquetas
                    <span class="material-symbols-outlined">expand_more</span>
                </button>
            </template>
            <div class="filter-menu">
                <p class="section-label">Filtrar por color</p>
                <div class="tag-list">
                    <button v-for="tag in store.allTags" :key="tag" class="tag-item"
                        :class="[tag, { active: modelValue.tags.includes(tag) }]" @click="toggleTag(tag)">
                        <span class="tag-dot" :class="tag"></span>
                        {{ tagLabel(tag) }}
                    </button>
                </div>
            </div>
        </BasePopover>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useTaskStore } from '~/stores/task.store';
import BasePopover from '../ui/BasePopover.vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

interface FilterState {
    type: string;
    projects: string[];
    categories: string[];
    sortOrder: 'asc' | 'desc';
    dateRange: { start: number | null, end: number | null };
    tags: string[];
}

const props = defineProps<{
    modelValue: FilterState;
}>();

const emit = defineEmits(['update:modelValue']);

const store = useTaskStore();
const listType = ref<'projects' | 'categories'>('projects');

const internalDateRange = ref<[Date, Date] | null>(null);

// Sync internal range with props
watch(() => props.modelValue.dateRange, (newRange) => {
    if (newRange.start && newRange.end) {
        internalDateRange.value = [new Date(newRange.start), new Date(newRange.end)];
    } else {
        internalDateRange.value = null;
    }
}, { immediate: true });

const currentList = computed(() => {
    return listType.value === 'projects' ? store.allProjects : store.allCategories;
});

const selectedLabel = computed(() => {
    if (props.modelValue.projects.length > 0) return `Proyectos (${props.modelValue.projects.length})`;
    if (props.modelValue.categories.length > 0) return `Categorías (${props.modelValue.categories.length})`;
    return 'Todas';
});

const updateFilter = (updates: Partial<FilterState>) => {
    emit('update:modelValue', { ...props.modelValue, ...updates });
};

const isItemSelected = (item: string) => {
    return listType.value === 'projects'
        ? props.modelValue.projects.includes(item)
        : props.modelValue.categories.includes(item);
};

const toggleItem = (item: string) => {
    const list = listType.value === 'projects' ? [...props.modelValue.projects] : [...props.modelValue.categories];
    const index = list.indexOf(item);

    if (index === -1) {
        list.push(item);
    } else {
        list.splice(index, 1);
    }

    if (listType.value === 'projects') {
        updateFilter({ projects: list, categories: [], type: list.length > 0 ? 'all' : 'all' });
    } else {
        updateFilter({ categories: list, projects: [], type: list.length > 0 ? 'all' : 'all' });
    }
};

const resetAll = () => {
    updateFilter({ projects: [], categories: [], type: 'all', dateRange: { start: null, end: null } });
};

const toggleTag = (tag: string) => {
    const tags = [...props.modelValue.tags];
    const index = tags.indexOf(tag);
    if (index === -1) tags.push(tag);
    else tags.splice(index, 1);
    updateFilter({ tags });
};

const tagLabel = (tag: string) => {
    const map: Record<string, string> = {
        'red': 'Alta prioridad',
        'amber': 'Media prioridad',
        'emerald': 'Normal'
    };
    return map[tag] || tag;
};

const setDateQuick = (option: 'today' | 'tomorrow' | 'week') => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    let start = now.getTime();
    let end = now.getTime() + 86400000 - 1; // End of day

    if (option === 'tomorrow') {
        start += 86400000;
        end += 86400000;
    } else if (option === 'week') {
        end = start + (86400000 * 7) - 1;
    }

    updateFilter({ dateRange: { start, end }, type: 'date' });
};

const handleManualDate = (value: any) => {
    if (value && value[0] && value[1]) {
        const start = new Date(value[0]);
        start.setHours(0, 0, 0, 0);

        const end = new Date(value[1]);
        end.setHours(23, 59, 59, 999);

        updateFilter({
            dateRange: { start: start.getTime(), end: end.getTime() },
            type: 'date'
        });
    } else {
        updateFilter({
            dateRange: { start: null, end: null },
            type: props.modelValue.projects.length > 0 || props.modelValue.categories.length > 0 ? 'all' : 'all'
        });
    }
};
</script>

<style scoped>
.filter-bar {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
    overflow-x: visible;
    padding-bottom: 0.5rem;
}

.filter-chip {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 1rem;
    border-radius: 100px;
    background: var(--bg-secondary);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
}

.filter-chip:hover {
    border-color: var(--accent-primary);
}

.filter-chip.active {
    background: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);
    box-shadow: 0 4px 12px var(--glow);
}

.filter-menu {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.menu-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.section-label {
    font-size: 0.7rem;
    font-weight: 800;
    color: var(--text-tertiary);
    text-transform: uppercase;
    margin: 0;
}

.toggle-group {
    display: flex;
    background: var(--bg-tertiary);
    padding: 2px;
    border-radius: 10px;
}

.toggle-item {
    flex: 1;
    padding: 0.4rem;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 0.7rem;
    font-weight: 700;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.toggle-item.active {
    background: var(--bg-secondary);
    color: var(--accent-primary);
    box-shadow: 0 2px 8px var(--shadow);
}

.menu-list {
    display: flex;
    flex-direction: column;
    max-height: 200px;
    overflow-y: auto;
}

.menu-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0.5rem;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    text-align: left;
}

.menu-item:hover {
    background: var(--bg-tertiary);
}

.menu-item.active {
    color: var(--accent-primary);
}

.quick-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.quick-btn {
    padding: 0.4rem 0.75rem;
    border-radius: 8px;
    border: 1px solid var(--glass-border);
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.quick-btn:hover {
    border-color: var(--accent-primary);
    background: var(--bg-secondary);
    color: var(--accent-primary);
}

.tag-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.tag-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 10px;
    border: 1px solid transparent;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
}

.tag-item.active {
    border-color: var(--accent-primary);
    background: var(--bg-secondary);
    color: var(--accent-primary);
}

.tag-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.date-picker-container {
    padding: 0.25rem 0;
}

:deep(.dp__theme_dark) {
    --dp-background-color: var(--bg-tertiary);
    --dp-text-color: var(--text-primary);
    --dp-hover-color: var(--bg-secondary);
    --dp-hover-text-color: var(--text-primary);
    --dp-hover-icon-color: var(--accent-primary);
    --dp-primary-color: var(--accent-primary);
    --dp-primary-text-color: #ffffff;
    --dp-secondary-color: var(--text-tertiary);
    --dp-border-color: var(--glass-border);
    --dp-menu-border-color: var(--glass-border);
    --dp-border-radius: 12px;
}

:deep(.dp__input) {
    background: var(--bg-tertiary);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 0.5rem 1rem 0.5rem 2.5rem;
    font-family: inherit;
    font-size: 0.8rem;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    color: var(--text-primary);
}

:deep(.dp__input:focus) {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 4px var(--glow);
}

:deep(.dp__input_icon) {
    left: 0.75rem;
    color: var(--text-tertiary);
}

.tag-dot.red {
    background: #ef4444;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
}

.tag-dot.amber {
    background: #f59e0b;
    box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
}

.tag-dot.emerald {
    background: #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

@media (max-width: 768px) {

    /* Allow the filter bar to overflow but make popovers work */
    .filter-bar {
        overflow-x: auto;
        padding-right: 2rem;
    }
}
</style>
