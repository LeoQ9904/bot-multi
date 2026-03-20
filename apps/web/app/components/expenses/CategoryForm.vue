<template>
  <div class="card-glass register-card">
    <div class="card-accent-border category-border"></div>
    <div class="card-header">
      <div class="header-icon category-icon">
        <span class="material-symbols-outlined">category</span>
      </div>
      <h3>Nueva Categoría</h3>
    </div>

    <form @submit.prevent="handleSubmit" class="expense-form">
      <div class="form-row">
        <div class="field-container">
          <label class="field-label">Nombre</label>
          <input v-model="form.name" type="text" class="text-input" placeholder="Ej: Comida" required />
        </div>
        <div class="field-container">
          <label class="field-label">Tipo</label>
          <select v-model="form.type" class="select-input" required>
            <option value="GASTO">Gasto</option>
            <option value="INGRESO">Ingreso</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="field-container">
          <label class="field-label">Color</label>
          <input v-model="form.color" type="color" class="color-input" />
        </div>
        <div class="field-container preview-container">
          <label class="field-label">Vista Previa</label>
          <div class="icon-preview" :style="{ backgroundColor: form.color }">
            <span>{{ form.icon }}</span>
          </div>
        </div>
      </div>

      <div class="field-container">
        <label class="field-label">Icono</label>
        <div class="icon-selector-wrapper" v-click-outside="closeIconPicker">
          <button type="button" class="selector-btn shadow-glow" @click="toggleIconPicker"
            :class="{ active: showIconPicker }">
            <span class="selected-emoji">{{ form.icon }}</span>
            <span class="material-symbols-outlined dropdown-arrow">
              {{ showIconPicker ? 'expand_less' : 'expand_more' }}
            </span>
          </button>

          <transition name="fade-slide">
            <div v-if="showIconPicker" class="icon-dropdown card-glass shadow-glow">
              <div class="icon-grid custom-scrollbar">
                <button v-for="emoji in categoryStore.availableIcons" :key="emoji" type="button" class="emoji-btn"
                  :class="{ active: form.icon === emoji }" @click="selectIcon(emoji)">
                  {{ emoji }}
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <button type="submit" class="btn-primary-gradient category-btn" :disabled="loading">
        {{ loading ? 'Creando...' : 'Crear Categoría' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useCategoryStore } from '~/stores/category.store';
import { TransactionType } from '~/types/category.types';

const categoryStore = useCategoryStore();
const loading = ref(false);
const showIconPicker = ref(false);

const defaultForm = {
  name: '',
  type: TransactionType.GASTO,
  icon: categoryStore.defaultIcons,
  color: '#34d399',
};

const form = reactive(defaultForm);

const toggleIconPicker = () => {
  showIconPicker.value = !showIconPicker.value;
};

const closeIconPicker = () => {
  showIconPicker.value = false;
};

const selectIcon = (emoji: string) => {
  form.icon = emoji;
  showIconPicker.value = false;
};

const handleSubmit = async () => {
  if (!form.name) return;

  loading.value = true;
  try {
    await categoryStore.addCategory(form);
    // Reset form
    form.name = defaultForm.name;
    form.icon = defaultForm.icon;
    form.color = defaultForm.color;
  } finally {
    loading.value = false;
  }
};

// Directive mockup if not globally available
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el: any) {
    document.removeEventListener('click', el.clickOutsideEvent);
  },
};
</script>

<style scoped>
.register-card {
  padding: 0;
  position: relative;
}

.card-accent-border {
  height: 0.25rem;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-purple), var(--accent-primary));
}

.card-header {
  padding: 1.5rem 2rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--bg-tertiary);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
}

.expense-form {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  padding-left: 0.25rem;
}

.text-input,
.amount-input,
.select-input,
.date-input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  color: var(--text-primary);
  outline: none;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.btn-primary-gradient {
  margin-top: 1rem;
  width: 100%;
  padding: 1.25rem;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  color: white;
  font-weight: 800;
  border-radius: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

.btn-primary-gradient:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.2);
}

.btn-primary-gradient:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.category-border {
  background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b) !important;
}

.category-icon {
  color: #f59e0b !important;
}

.category-btn {
  background: linear-gradient(135deg, #92400e, #78350f) !important;
}

.color-input {
  height: 48px;
  width: 100%;
  padding: 0.25rem;
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  cursor: pointer;
}

.preview-container {
  align-items: center;
}

.icon-preview {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.icon-selector-wrapper {
  position: relative;
  width: 100%;
}

.selector-btn {
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;
}

.selector-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
}

.selector-btn.active {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
}

.selected-emoji {
  font-size: 1.25rem;
}

.dropdown-arrow {
  color: var(--text-tertiary);
  font-size: 1.25rem;
  transition: transform 0.2s;
}

.icon-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  z-index: 100;
  padding: 1rem;
  background: var(--bg-primary);
  /* Use solid bg to prevent excessive transparency overlap */
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 0.5rem;
  max-height: 12rem;
  overflow-y: auto;
  padding: 0.25rem;
}

.emoji-btn {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.emoji-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.emoji-btn.active {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
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

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 10px;
}
</style>
