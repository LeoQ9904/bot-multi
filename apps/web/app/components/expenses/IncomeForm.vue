<template>
  <div class="card-glass register-card">
    <div class="card-accent-border income-border"></div>
    <div class="card-header">
      <div class="header-icon income-icon">
        <span class="material-symbols-outlined">payments</span>
      </div>
      <h3>Registrar Ingreso</h3>
    </div>

    <form @submit.prevent="handleSubmit" class="expense-form">
      <div class="field-container">
        <label class="field-label">Descripción</label>
        <input v-model="form.description" type="text" class="text-input" placeholder="Ej: Salario Mensual" required />
      </div>

      <div class="form-row">
        <div class="field-container">
          <label class="field-label">Monto</label>
          <div class="amount-input-wrapper">
            <span class="currency-symbol">$</span>
            <input v-model="form.amount" type="number" step="0.01" class="amount-input" placeholder="0.00" required />
          </div>
        </div>

        <div class="field-container">
          <label class="field-label">Categoría</label>
          <select v-model="form.categoryId" class="select-input" required>
            <option value="" disabled>Seleccionar categoría</option>
            <option v-for="cat in categoryStore.incomeCategories" :key="cat.id" :value="cat.id">
              {{ cat.icon }} {{ cat.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="field-container">
          <label class="field-label">Fuente</label>
          <input v-model="form.source" type="text" class="text-input" placeholder="Ej: Google Inc" />
        </div>
        <div class="field-container">
          <label class="field-label">Fecha</label>
          <input v-model="form.date" type="date" class="date-input" required />
        </div>
      </div>

      <button type="submit" class="btn-primary-gradient income-btn" :disabled="loading">
        {{ loading ? 'Guardando...' : 'Guardar Ingreso' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useIncomeStore } from '~/stores/income.store';
import { useCategoryStore } from '~/stores/category.store';

const incomeStore = useIncomeStore();
const categoryStore = useCategoryStore();
const loading = ref(false);

const form = reactive({
  description: '',
  amount: undefined as number | undefined,
  categoryId: '',
  date: new Date().toISOString().split('T')[0],
  source: '',
});

const handleSubmit = async () => {
  if (!form.amount || !form.categoryId) return;
  
  loading.value = true;
  try {
    await incomeStore.addIncome({
      ...form,
      amount: Number(form.amount),
    });
    // Reset form
    form.description = '';
    form.amount = undefined;
    form.categoryId = '';
    form.source = '';
  } finally {
    loading.value = false;
  }
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

.amount-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 1rem;
  font-weight: 700;
  color: var(--text-tertiary);
}

.amount-input {
  padding-left: 2rem;
  font-weight: 700;
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

.income-border {
  background: linear-gradient(90deg, #10b981, #34d399, #10b981) !important;
}
.income-icon {
  color: #10b981 !important;
}
.income-btn {
  background: linear-gradient(135deg, #065f46, #064e3b) !important;
}
</style>
