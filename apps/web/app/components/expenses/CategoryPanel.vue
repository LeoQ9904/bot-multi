<template>
    <BaseSidePanel :show="show" title="Gestionar Categorías" @close="onClosePanel" maxWidth="560px">
        <div class="panel-container custom-scrollbar">
            <!-- Category Creator -->
            <section class="section-container">
                <div class="creator-card card-glass">
                    <div class="creator-layout">
                        <div class="icon-selector-column">
                            <div class="icon-display"
                                :style="{ backgroundColor: categoryForm.color + '33', color: categoryForm.color }"
                                @click="showIconPicker = !showIconPicker">
                                <span class="selected-emoji">{{ categoryForm.icon }}</span>

                                <transition name="fade-slide">
                                    <div v-if="showIconPicker" class="icon-dropdown card-glass shadow-glow" @click.stop>
                                        <div class="icon-grid custom-scrollbar">
                                            <button v-for="emoji in categoryStore.availableIcons" :key="emoji"
                                                type="button" class="emoji-btn"
                                                :class="{ active: categoryForm.icon === emoji }"
                                                @click="selectIcon(emoji)">
                                                {{ emoji }}
                                            </button>
                                        </div>
                                    </div>
                                </transition>
                            </div>
                        </div>

                        <div class="form-column">
                            <div class="field-group">
                                <label class="field-label">Nombre de Categoría</label>
                                <input v-model="categoryForm.name" class="text-input-minimal"
                                    placeholder="Ej: Entretenimiento" type="text" />
                            </div>

                            <div class="field-group">
                                <label class="field-label">Tipo</label>
                                <div class="type-toggle">
                                    <button type="button" class="type-btn expense-btn"
                                        :class="{ active: categoryForm.type === TransactionType.GASTO }"
                                        @click="categoryForm.type = TransactionType.GASTO">
                                        <span class="material-symbols-outlined" style="font-size: 1.1rem;">trending_down</span>
                                        Gasto
                                    </button>
                                    <button type="button" class="type-btn income-btn"
                                        :class="{ active: categoryForm.type === TransactionType.INGRESO }"
                                        @click="categoryForm.type = TransactionType.INGRESO">
                                        <span class="material-symbols-outlined" style="font-size: 1.1rem;">trending_up</span>
                                        Ingreso
                                    </button>
                                </div>
                            </div>

                            <div class="field-group">
                                <label class="field-label">Color</label>
                                <div class="color-selection-row">
                                    <div v-for="color in presetColors" :key="color" class="color-swatch"
                                        :style="{ backgroundColor: color, boxShadow: categoryForm.color === color ? `0 0 0 2px var(--bg-primary), 0 0 0 4px ${color}` : 'none' }"
                                        @click="categoryForm.color = color"></div>
                                    <div class="custom-color-wrapper">
                                        <input type="color" v-model="categoryForm.color" class="color-picker-input" />
                                        <span class="custom-label">Personalizado</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <template v-if="isEditing">
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button @click="handleCreateCategory(categoryForm)" class="btn-primary-gradient create-btn"
                            :disabled="loadingCategory || !categoryForm.name">
                            <span class="material-symbols-outlined">edit</span>
                            {{ loadingCategory ? 'Actualizando...' : 'Actualizar Categoría' }}
                        </button>
                        <button @click="onCancelEdit()" class="btn-primary-gradient create-btn">
                            <span class="material-symbols-outlined">cancel</span>
                            Cancelar
                        </button>
                    </div>
                </template>
                <template v-else>
                    <button @click="handleCreateCategory(categoryForm)" class="btn-primary-gradient create-btn"
                        :disabled="loadingCategory || !categoryForm.name">
                        <span class="material-symbols-outlined">add_circle</span>
                        {{ loadingCategory ? 'Creando...' : 'Crear Categoría' }}
                    </button>
                </template>

                <!-- Category List Preview -->
                <div class="existing-categories-section">
                    <div class="flex-between mb-4">
                        <h4 class="subsection-title">Categorías Existentes</h4>
                        <span class="count-badge">{{ categoryStore.allCategories.length }}</span>
                    </div>

                    <div class="categories-grid">
                        <div v-for="cat in categoryStore.allCategories" :key="cat.id" class="mini-category-card">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div class="mini-icon-box"
                                    :style="{ backgroundColor: cat.color + '20', color: cat.color }">
                                    <span>{{ cat.icon }}</span>
                                </div>
                                <span class="mini-cat-name">{{ cat.name }}</span>
                            </div>
                            <div class="tx-actions group-hover-show">
                                <button class="action-btn" @click="onEditCategory(cat)">
                                    <span class="material-symbols-outlined"
                                        style="font-size: 15px !important;">edit</span>
                                </button>
                                <button class="action-btn text-danger" @click="onDeleteCategory(cat.id)">
                                    <span class="material-symbols-outlined"
                                        style="font-size: 15px !important;">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div v-if="categoryStore.allCategories.length === 0" class="empty-mini-state">
                        No has creado categorías aún.
                    </div>
                </div>
            </section>
        </div>
    </BaseSidePanel>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCategoryStore } from '~/stores/category.store';
import { TransactionType, type Category } from '~/types/category.types';
import BaseSidePanel from '~/components/ui/BaseSidePanel.vue';

defineProps<{
    show: boolean;
}>();

const emit = defineEmits(['close', 'success']);

const categoryStore = useCategoryStore();
const showIconPicker = ref(false);
const loadingCategory = ref(false);
const isEditing = ref(false);

const presetColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];

const defaultCategory = {
    name: '',
    type: TransactionType.GASTO,
    icon: categoryStore.defaultIcon,
    color: '#6366f1',
    id: '',
};

const categoryForm = ref<Partial<Category>>({ ...defaultCategory });

const selectIcon = (emoji: string) => {
    categoryForm.value.icon = emoji;
    showIconPicker.value = false;
};

const handleCreateCategory = async (category: Partial<Category>) => {
    if (!category.name) return;

    loadingCategory.value = true;
    try {
        if (isEditing.value) {
            await categoryStore.updateCategory(category.id!, category);
        } else {
            await categoryStore.addCategory(category);
        }
        resetCategoryForm();
        emit('success');
    } finally {
        loadingCategory.value = false;
    }
    isEditing.value = false;
};

const resetCategoryForm = () => {
    categoryForm.value = { ...defaultCategory };
};

const onDeleteCategory = (id: string) => {
    categoryStore.deleteCategory(id);
};

const onEditCategory = (category: Category) => {
    isEditing.value = true;
    categoryForm.value = { ...category };
    showIconPicker.value = false;
};

const onClosePanel = () => {
    resetCategoryForm();
    emit('close');
};

const onCancelEdit = () => {
    resetCategoryForm();
    isEditing.value = false;
};
</script>

<style scoped>
.panel-container {
    padding: 0.5rem;
}

.section-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.section-header {
    margin-bottom: 0.5rem;
}

.section-title {
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-tertiary);
}

.creator-card {
    padding: 1.5rem;
    border-radius: 1.25rem;
}

.creator-layout {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
}

.icon-selector-column {
    flex-shrink: 0;
}

.icon-display {
    width: 4rem;
    height: 4rem;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
    position: relative;
}

.icon-display:hover {
    transform: scale(1.05);
    border-color: currentColor;
}

.selected-emoji {
    font-size: 2rem;
}

.icon-dropdown {
    position: absolute;
    top: calc(100% + 0.75rem);
    left: 0;
    z-index: 100;
    width: 280px;
    padding: 1rem;
    background: var(--bg-primary);
    border: 1px solid var(--glass-border);
}

.icon-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
    padding-right: 0.5rem;
}

.emoji-btn {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
}

.emoji-btn:hover {
    background: var(--bg-tertiary);
    transform: scale(1.1);
}

.emoji-btn.active {
    background: var(--bg-tertiary);
    border-color: var(--accent-primary);
}

.form-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.field-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-tertiary);
    text-transform: uppercase;
}

.text-input-minimal {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 2px solid var(--glass-border);
    padding: 0.5rem 0;
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 600;
    outline: none;
    transition: border-color 0.2s;
}

.text-input-minimal:focus {
    border-color: var(--accent-primary);
}

.color-selection-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.color-swatch {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s;
}

.color-swatch:hover {
    transform: scale(1.2);
}

.custom-color-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: 0.5rem;
}

.color-picker-input {
    width: 1.5rem;
    height: 1.5rem;
    border: none;
    border-radius: 50%;
    padding: 0;
    cursor: pointer;
    overflow: hidden;
    background: none;
}

.color-picker-input::-webkit-color-swatch-wrapper {
    padding: 0;
}

.color-picker-input::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
}

.custom-label {
    font-size: 0.7rem;
    color: var(--text-tertiary);
    font-weight: 600;
}

.create-btn {
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
}

.existing-categories-section {
    margin-top: 1rem;
}

.flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.subsection-title {
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.count-badge {
    background: var(--bg-tertiary);
    color: var(--text-tertiary);
    padding: 0.25rem 0.625rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 800;
}

.categories-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 0.75rem;
}

.mini-category-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--bg-secondary);
    border: 1px solid var(--glass-border);
    border-radius: 0.75rem;
    transition: all 0.2s;
}

.mini-category-card:hover {
    border-color: var(--accent-primary);
    background: var(--bg-tertiary);
}

.mini-icon-box {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
}

.mini-cat-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
}

.empty-mini-state {
    text-align: center;
    padding: 2rem;
    color: var(--text-tertiary);
    font-size: 0.875rem;
    font-style: italic;
    background: var(--bg-secondary);
    border-radius: 1rem;
    border: 1px dashed var(--glass-border);
}

/* Base components reuse or local definition */
.btn-primary-gradient {
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-purple));
    color: white;
    border: none;
    border-radius: 1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    transition: all 0.2s;
}

.btn-primary-gradient:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.1);
    box-shadow: 0 6px 15px rgba(99, 102, 241, 0.3);
}

.btn-primary-gradient:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.card-glass {
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
}

.shadow-glow {
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.2s ease-out;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.tx-actions {
    display: flex;
    gap: 0.5rem;
    transition: opacity 0.2s;
}

.group:hover .group-hover-show {
    opacity: 1;
}

.action-btn {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    background: var(--bg-tertiary);
    color: var(--text-tertiary);
    border: none;
    cursor: pointer;
    transition: all 0.2s;
}

.action-btn:hover {
    color: var(--accent-primary);
}

.action-btn.text-danger:hover {
    color: #ef4444;
}

/* Type Toggle */
.type-toggle {
    display: flex;
    background: var(--bg-tertiary);
    border-radius: 0.75rem;
    padding: 0.25rem;
    gap: 0.25rem;
    border: 1px solid var(--glass-border);
}

.type-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.5rem;
    border: none;
    background: transparent;
    color: var(--text-tertiary);
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.type-btn:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
}

.type-btn.active {
    background: var(--bg-primary);
    color: var(--text-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.type-btn.expense-btn.active {
    color: #ef4444;
}

.type-btn.income-btn.active {
    color: #10b981;
}
</style>
