<template>
  <div class="page-container">
    <div class="page-content">
      <HeaderPage title="Mis Gastos" subtitle="Captura tus gastos e ingresos" />
      <!-- Summary Card (Resumen de Gastos) -->
      <section class="card-glass summary-card-modern">
        <div class="summary-bg-glow"></div>
        <div class="summary-grid">
          <div class="summary-main">
            <div>
              <span class="summary-kicker">Resumen de Gastos</span>
              <h1 class="summary-amount-title">
                <span class="text-primary">${{ totalExpenses.toLocaleString() }}</span>
                <span class="summary-limit">/ ${{ budgetLimit.toLocaleString() }}</span>
              </h1>
            </div>
            <div class="summary-progress-area">
              <div class="progress-track-modern">
                <div class="progress-bar-modern" :style="{ width: budgetProgress + '%' }"></div>
              </div>
              <div class="progress-labels">
                <span class="progress-label-left">Progreso del mes: {{ budgetProgress }}%</span>
                <span class="progress-label-right">Te quedan ${{ (budgetLimit - totalExpenses).toLocaleString()
                  }}</span>
              </div>
            </div>
          </div>
          <div class="summary-stats-side">
            <div class="stat-box-modern">
              <p class="stat-kicker">Promedio Diario</p>
              <p class="stat-value-modern">${{ (totalExpenses / 30).toFixed(2) }}</p>
            </div>
            <div class="stat-box-modern">
              <p class="stat-kicker">Resto del Mes</p>
              <p class="stat-value-modern">12 Días</p> <!-- ToDo: Calculate dynamically -->
            </div>
          </div>
        </div>
      </section>

      <!-- Smart Entry Grid (Entrada Inteligente) -->
      <section class="glass-card smart-entry-container">
        <div class="smart-entry-layout">
          <!-- Left side (AI Prompt Area) -->
          <div class="smart-entry-left">
            <div class="ai-badge">
              <span class="material-symbols-outlined ai-icon">magic_button</span>
              <span class="ai-badge-text">Entrada Inteligente</span>
            </div>

            <div class="transaction-toggle">
              <button @click="activeForm = 'expense'"
                :class="['toggle-btn', { active: activeForm === 'expense' }]">GASTO</button>
              <button @click="activeForm = 'income'"
                :class="['toggle-btn', { active: activeForm === 'income' }]">INGRESO</button>
            </div>

            <h2 class="prompt-title">¿En qué gastaste hoy?</h2>

            <div class="ai-input-wrapper-modern">
              <textarea v-model="quickDescription" class="ai-textarea"
                placeholder="Ej: Compré sushi para la cena con amigos por $45.00" rows="3"></textarea>
            </div>
            <p class="ai-hint">Aether categorizará automáticamente tu {{ activeForm === 'expense' ? 'gasto' :
              'ingreso' }} usando IA.</p>
          </div>

          <!-- Right side (Manual Form Area) -->
          <div class="smart-entry-right">
            <div class="smart-field">
              <BaseInput v-model="quickAmount" type="number" step="0.01" placeholder="0.00" label="Monto" isCurrency />
            </div>

            <div class="smart-field">
              <div class="flex-between">
                <label>Categoría</label>
                <button @click="isPanelOpen = true" class="link-btn">Gestionar</button>
              </div>
              <!-- Using standard select to match project style while retaining new layout structure -->
              <select v-model="quickCategoryId" class="select-input smart-select">
                <option value="" disabled>Seleccione...</option>
                <option
                  v-for="cat in (activeForm === 'expense' ? categoryStore.expenseCategories : categoryStore.incomeCategories)"
                  :key="cat.id" :value="cat.id">
                  {{ cat.icon }} {{ cat.name }}
                </option>
              </select>
            </div>

            <BaseDateTimePicker v-model="quickDate" label="FECHA Y HORA" :showQuickOptions="false" />

            <button @click="handleQuickSubmit" class="btn-primary-gradient mt-4 shadow-glow" :disabled="loadingSubmit">
              {{ loadingSubmit ? 'Registrando...' : (activeForm === 'expense' ? 'Registrar Gasto' : 'Registrar Ingreso')
              }}
            </button>
          </div>
        </div>
      </section>

      <!-- Bottom Grid: Categories, Recent, and Insights -->
      <div class="main-grid-layout">
        <div class="main-content-column">
          <!-- Categories Breakdown -->
          <section class="glass-panel categories-panel shadow-glow">
            <div class="panel-header">
              <div>
                <h3 class="font-bold text-xl">Gasto por Categoría</h3>
                <p class="text-tertiary text-sm">Distribución de tus gastos por categoría</p>
              </div>
              <button class="link-btn-alt" @click="isPanelOpen = true">Gestionar categorías</button>
            </div>

            <div class="categories-cards-grid">
              <div v-for="cat in categoryStore.allCategories" :key="cat.id" class="category-card-modern group"
                :style="{ '--var-cat-color': cat.color || 'var(--accent-primary)' }">
                <div class="cat-card-header">
                  <div class="cat-icon-lg group-hover-scale"
                    :style="{ color: 'var(--var-cat-color)', backgroundColor: `color-mix(in srgb, var(--var-cat-color) 20%, transparent)` }">
                    <span class="category-emoji">{{ cat.icon }}</span>
                  </div>
                  <h4 class="cat-kicker">{{ cat.name }}</h4>
                </div>
                <p class="cat-card-amount">${{ getCategoryTotal(cat.id).toLocaleString() }}</p>
                <div class="cat-progress-track-modern">
                  <div class="cat-progress-bar-modern group-hover-glow" :style="{
                    backgroundColor: 'var(--var-cat-color)',
                    width: Math.min((getCategoryTotal(cat.id) / (budgetLimit || 1)) * 100, 100) + '%'
                  }"></div>
                </div>
              </div>
              <div v-if="categoryStore.allCategories.length === 0" class="empty-state">
                No hay categorías definidas.
              </div>
            </div>
          </section>

          <!-- Recent Expenses -->
          <section class="glass-panel recent-panel">
            <div class="panel-header mb-6">
              <div class="panel-title-with-icon">
                <div class="title-icon-box">
                  <span class="material-symbols-outlined">receipt_long</span>
                </div>
                <div>
                  <h4 class="font-bold">Gastos Recientes</h4>
                  <p class="text-tertiary text-xs">Tus últimos movimientos detallados</p>
                </div>
              </div>
              <button class="link-btn-alt">Ver Historial</button>
            </div>

            <div class="recent-transactions-list">
              <div v-for="item in recentTransactions" :key="item.id" class="transaction-row-modern group">
                <div class="tx-left">
                  <div class="tx-icon-box" :style="{
                    color: item.type === 'GASTO' ? item.category?.color || 'var(--accent-primary)' : '#10b981',
                    backgroundColor: `color-mix(in srgb, ${item.type === 'GASTO' ? item.category?.color || 'var(--accent-primary)' : '#10b981'} 15%, transparent)`
                  }">
                    <span class="material-symbols-outlined">
                      {{ item.type === 'GASTO' ? 'shopping_cart' : 'payments' }}
                    </span>
                  </div>
                  <div>
                    <p class="tx-title">{{ item.description }}</p>
                    <p class="tx-meta">{{ new Date(item.date).toLocaleDateString() }} • {{ item.category?.name || 'S/C'
                      }}</p>
                  </div>
                </div>
                <div class="tx-right">
                  <p class="tx-amount" :class="{ 'text-income': item.type === 'INGRESO' }">
                    {{ item.type === 'GASTO' ? '-' : '+' }}${{ item.amount.toLocaleString() }}
                  </p>
                  <div class="tx-actions group-hover-show">
                    <button class="action-btn"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-btn text-danger" @click="deleteTransaction(item.id, item.type)"><span
                        class="material-symbols-outlined">delete</span></button>
                  </div>
                </div>
              </div>
              <div v-if="recentTransactions.length === 0" class="empty-state">
                No hay transacciones recientes.
              </div>
            </div>
          </section>
        </div>

        <!-- Sidebar: AI Insights -->
        <div class="sidebar-column">
          <section class="ai-side-panel">
            <div class="ai-side-bg"></div>
            <div class="p-6 relative z-1">
              <div class="ai-side-header">
                <div class="ai-side-icon">
                  <span class="material-symbols-outlined">psychology</span>
                </div>
                <h4 class="font-bold text-sm">Insights de Raya</h4>
              </div>
              <div class="ai-insights-list">
                <div class="insight-item border-warning">
                  <div class="insight-kicker text-warning">
                    <span class="material-symbols-outlined text-xs">warning</span>
                    <span>Presupuesto</span>
                  </div>
                  <p class="insight-text-small">
                    <span class="font-bold text-primary">Entretenimiento</span> subió 35%.
                  </p>
                </div>
                <div class="insight-item border-primary">
                  <div class="insight-kicker text-primary">
                    <span class="material-symbols-outlined text-xs">trending_down</span>
                    <span>Ahorro</span>
                  </div>
                  <p class="insight-text-small">
                    12% menos en <span class="font-bold text-primary">suscripciones</span>.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- Categories Side Panel -->
    <CategoryPanel :show="isPanelOpen" @close="isPanelOpen = false" @success="categoryStore.fetchCategories()" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCategoryStore } from '~/stores/category.store';
import { useIncomeStore } from '~/stores/income.store';
import { useExpenseStore } from '~/stores/expense.store';
import { useBudgetStore } from '~/stores/budget.store';
import { useSavingsProjectionStore } from '~/stores/savings-projection.store';

import CategoryPanel from '~/components/expenses/CategoryPanel.vue';
import BaseDateTimePicker from '~/components/ui/BaseDateTimePicker.vue';
import BaseInput from '~/components/ui/BaseInput.vue';
import { Frequency } from '~/types/income.types';

const categoryStore = useCategoryStore();
const incomeStore = useIncomeStore();
const expenseStore = useExpenseStore();
const budgetStore = useBudgetStore();
const projectionStore = useSavingsProjectionStore();

const activeForm = ref('expense');
const isPanelOpen = ref(false);
const loadingSubmit = ref(false);

const quickDescription = ref('');
const quickAmount = ref<number>();
const quickCategoryId = ref('');
const quickDate = ref<Date | number>(new Date());

const getCategoryTotal = (categoryId: string) => {
  return expenseStore.allExpenses
    .filter(e => e.categoryId === categoryId)
    .reduce((total, e) => total + Number(e.amount), 0);
};

const handleQuickSubmit = async () => {
  if (!quickAmount.value || !quickCategoryId.value) return;

  loadingSubmit.value = true;
  try {
    const payload = {
      description: quickDescription.value || (activeForm.value === 'expense' ? 'Gasto rápido' : 'Ingreso rápido'),
      amount: Number(quickAmount.value),
      categoryId: quickCategoryId.value,
      date: new Date(quickDate.value).toISOString(),
      frequency: Frequency.UNICO,
    };

    if (activeForm.value === 'expense') {
      await expenseStore.addExpense(payload);
    } else {
      await incomeStore.addIncome(payload);
    }

    quickDescription.value = '';
    quickAmount.value = undefined;
    quickCategoryId.value = '';
    quickDate.value = new Date();
  } finally {
    loadingSubmit.value = false;
  }
};

onMounted(async () => {
  await Promise.all([
    categoryStore.fetchCategories(),
    incomeStore.fetchIncomes(),
    expenseStore.fetchExpenses(),
    budgetStore.fetchBudgets(),
    projectionStore.fetchProjections(),
  ]);
});

// Computed values for summary
const totalExpenses = computed(() => expenseStore.totalExpenseAmount);
// Simple mockup for budget limit until multiple budgets are handled properly
const budgetLimit = computed(() => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const budgets = budgetStore.allBudgets.filter(b => b.month === currentMonth && b.year === currentYear);
  return budgets.reduce((total, b) => total + Number(b.limitAmount), 0) || 1;
});
const budgetProgress = computed(() => Math.min(Math.round((totalExpenses.value / budgetLimit.value) * 100), 100));

const recentTransactions = computed(() => {
  const e = expenseStore.allExpenses.map(item => ({ ...item, type: 'GASTO' }));
  const i = incomeStore.allIncomes.map(item => ({ ...item, type: 'INGRESO' }));
  return [...e, ...i].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
});

const deleteTransaction = async (id: string, tipo: string) => {
  if (tipo === 'GASTO') {
    await expenseStore.deleteExpense(id);
  } else {
    await incomeStore.deleteIncome(id);
  }
};
</script>

<style scoped>
.expenses-wrapper {
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
}

.forms-container {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.tabs-header {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem;
  margin-bottom: -1px;
  z-index: 1;
}

.tabs-header button {
  padding: 0.75rem 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-bottom: none;
  border-radius: 0.75rem 0.75rem 0 0;
  color: var(--text-tertiary);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.7;
}

.tabs-header button.active {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  opacity: 1;
  border-color: var(--accent-primary);
  padding-bottom: 1rem;
  transform: translateY(-2px);
}

.tab-content {
  position: relative;
}

.category-emoji {
  font-size: 1.25rem;
}

.text-income {
  color: #10b981 !important;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-tertiary);
  font-style: italic;
}

.expenses-container {
  flex: 1;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  overflow-y: auto;
}

.summary-card-modern {
  padding: 2rem;
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.summary-bg-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 16rem;
  height: 16rem;
  background: var(--accent-primary);
  opacity: 0.05;
  filter: blur(80px);
  border-radius: 50%;
  transform: translate(50%, -50%);
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: flex-end;
  position: relative;
  z-index: 1;
}

@media (min-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.summary-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.summary-kicker {
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 0.5rem;
  display: block;
}

.summary-amount-title {
  font-size: 3rem;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: -0.025em;
  line-height: 1;
}

.summary-limit {
  color: var(--text-tertiary);
  font-weight: 500;
  font-size: 1.5rem;
}

.summary-progress-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.progress-track-modern {
  width: 100%;
  height: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 9999px;
  overflow: hidden;
  padding: 0.125rem;
  border: 1px solid var(--glass-border);
}

.progress-bar-modern {
  height: 100%;
  background: linear-gradient(to right, var(--accent-primary), var(--accent-purple), var(--accent-primary));
  background-size: 200% auto;
  border-radius: 9999px;
  transition: all 1s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.progress-label-left {
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.progress-label-right {
  color: var(--accent-primary);
}

.summary-stats-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-box-modern {
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: 1rem;
  border: 1px solid var(--glass-border);
}

.stat-kicker {
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.25rem;
}

.stat-value-modern {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* ─── Glass Cards ─── */
.btn-primary-gradient {
  width: 100%;
  padding: 1.25rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-purple));
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

/* ─── Smart Entry Component ─── */
.smart-entry-container {
  overflow: hidden;
  border-radius: 1.5rem;
  margin-bottom: 2.5rem;
  border: 1px solid var(--glass-border);
  background: linear-gradient(135deg, rgba(var(--accent-primary-rgb, 99, 102, 241), 0.05) 0%, rgba(var(--accent-purple-rgb, 168, 85, 247), 0.02) 100%);
  backdrop-filter: blur(8px);
}

.smart-entry-layout {
  display: flex;
  flex-direction: column;
  background: rgba(var(--bg-secondary-rgb, 15, 23, 42), 0.6);
}

@media (min-width: 1024px) {
  .smart-entry-layout {
    flex-direction: row;
  }
}

.smart-entry-left {
  flex: 1;
  padding: 2rem;
  border-bottom: 1px solid var(--glass-border);
}

@media (min-width: 1024px) {
  .smart-entry-left {
    padding: 2.5rem;
    border-bottom: none;
    border-right: 1px solid var(--glass-border);
  }
}

.ai-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.ai-icon {
  color: var(--accent-primary);
  font-variation-settings: 'FILL' 1;
}

.ai-badge-text {
  font-size: 0.875rem;
  font-weight: 800;
  background: linear-gradient(to right, var(--accent-primary), var(--accent-purple));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.transaction-toggle {
  display: flex;
  padding: 0.25rem;
  background: var(--bg-tertiary);
  border-radius: 0.75rem;
  width: fit-content;
  margin-bottom: 1.5rem;
  border: 1px solid var(--glass-border);
}

.toggle-btn {
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 800;
  transition: all 0.2s;
  color: var(--text-tertiary);
  border: none;
  background: transparent;
  cursor: pointer;
}

.toggle-btn:hover {
  color: var(--text-primary);
}

.toggle-btn.active {
  background: var(--accent-primary);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.prompt-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.ai-input-wrapper-modern {
  position: relative;
}

.ai-textarea {
  width: 80%;
  background: var(--bg-primary);
  border: 2px solid var(--glass-border);
  border-radius: 1rem;
  padding: 1.25rem;
  font-size: 1.125rem;
  color: var(--text-primary);
  resize: none;
  transition: all 0.2s;
}

.ai-textarea:focus {
  border-color: rgba(var(--accent-primary-rgb, 99, 102, 241), 0.5);
  outline: none;
}

.ai-input-actions {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
}

.icon-mic {
  color: var(--text-tertiary);
  cursor: pointer;
  transition: color 0.2s;
}

.icon-mic:hover {
  color: var(--text-primary);
}

.ai-hint {
  margin-top: 1rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-style: italic;
}

.smart-entry-right {
  width: 100%;
  padding: 2rem;
  background: rgba(var(--bg-tertiary-rgb, 30, 41, 59), 0.2);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .smart-entry-right {
    width: 420px;
    padding: 2.5rem;
  }
}

.smart-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.smart-field label {
  font-size: 0.625rem;
  font-weight: 800;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.smart-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.link-btn {
  font-size: 0.625rem;
  font-weight: 800;
  color: var(--accent-primary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.link-btn:hover {
  text-decoration: underline;
}

.smart-select,
.smart-date {
  background: var(--bg-tertiary);
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  border: 1px solid var(--glass-border);
}

/* ─── AI Insight Card ─── */
.ai-insight-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(var(--bg-secondary-rgb), 0.5) 0%, rgba(var(--accent-primary-rgb), 0.1) 100%);
  position: relative;
}

.ai-insight-card::after {
  content: "";
  position: absolute;
  top: -10%;
  right: -10%;
  width: 10rem;
  height: 10rem;
  background: var(--accent-primary);
  filter: blur(5rem);
  opacity: 0.15;
  border-radius: 50%;
}

.insight-icon-box {
  width: 3rem;
  height: 3rem;
  background: var(--bg-secondary);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 16px var(--shadow);
}

.insight-icon-box span {
  font-size: 1.75rem;
  color: var(--accent-primary);
}

.insight-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.insight-text {
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

.highlight-warning {
  color: var(--accent-amber);
  font-weight: 700;
}

.highlight-underline {
  font-weight: 900;
  text-decoration: underline;
  text-decoration-color: rgba(var(--accent-amber-rgb, 251, 191, 36), 0.5);
  text-underline-offset: 4px;
}

.highlight-primary {
  color: var(--accent-primary);
  font-weight: 800;
}

.btn-link-action {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-primary);
  font-weight: 800;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-link-action:hover {
  gap: 0.75rem;
}

/* ─── Main Grid Layout ─── */
.main-grid-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}

@media (min-width: 1024px) {
  .main-grid-layout {
    grid-template-columns: 8fr 4fr;
  }
}

.main-content-column {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.glass-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: 1.5rem;
  padding: 2rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.font-bold {
  font-weight: 700;
}

.text-xl {
  font-size: 1.25rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-xs {
  font-size: 0.75rem;
}

.text-tertiary {
  color: var(--text-tertiary);
}

.text-primary {
  color: var(--text-primary);
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.p-6 {
  padding: 1.5rem;
}

.link-btn-alt {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.link-btn-alt:hover {
  color: var(--accent-purple);
}

.categories-cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .categories-cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.category-card-modern {
  padding: 1.5rem;
  border-radius: 1rem;
  background: rgba(var(--bg-tertiary-rgb, 30, 41, 59), 0.4);
  border: 1px solid var(--glass-border);
  transition: all 0.2s;
  cursor: default;
}

.category-card-modern:hover {
  border-color: rgba(var(--accent-primary-rgb, 99, 102, 241), 0.5);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.cat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.cat-icon-lg {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.group:hover .group-hover-scale {
  transform: scale(1.1);
}

.cat-percent {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--text-primary);
}

.cat-kicker {
  color: var(--text-tertiary);
  font-weight: 800;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.25rem;
}

.cat-card-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.cat-progress-track-modern {
  height: 0.375rem;
  width: 100%;
  background: var(--bg-tertiary);
  border-radius: 9999px;
  overflow: hidden;
}

.cat-progress-bar-modern {
  height: 100%;
  border-radius: 9999px;
  transition: all 0.2s;
}

.group:hover .group-hover-glow {
  box-shadow: 0 0 12px var(--var-cat-color);
}

/* ─── Recent Panel ─── */
.panel-title-with-icon {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon-box {
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(var(--accent-primary-rgb, 99, 102, 241), 0.2);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
}

.recent-transactions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.transaction-row-modern {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(var(--bg-tertiary-rgb, 30, 41, 59), 0.4);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  transition: all 0.2s;
}

.transaction-row-modern:hover {
  border-color: rgba(var(--accent-primary-rgb, 99, 102, 241), 0.3);
}

.tx-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tx-icon-box {
  width: 2.75rem;
  height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
}

.tx-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
}

.tx-meta {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.tx-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.tx-amount {
  font-size: 1.125rem;
  font-weight: 900;
  color: var(--text-primary);
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

/* ─── AI Side Panel ─── */
.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.ai-side-panel {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  border: 1px solid var(--glass-border);
}

.ai-side-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom right, rgba(79, 70, 229, 0.2), rgba(147, 51, 234, 0.2));
  z-index: 0;
}

.relative.z-1 {
  position: relative;
  z-index: 1;
}

.ai-side-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.ai-side-icon {
  width: 2rem;
  height: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  color: var(--accent-purple);
}

.ai-insights-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.insight-item {
  background: rgba(var(--bg-secondary-rgb, 15, 23, 42), 0.6);
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid;
}

.border-warning {
  border-color: rgba(245, 158, 11, 0.3);
}

.border-primary {
  border-color: rgba(99, 102, 241, 0.3);
}

.insight-kicker {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  font-size: 0.5625rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.text-warning {
  color: #f59e0b;
}

.insight-text-small {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* ─── Goal Card ─── */
.goal-image-card {
  position: relative;
  border-radius: 1.5rem;
  overflow: hidden;
  height: 400px;
}

.goal-bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s;
}

.goal-image-card:hover .goal-bg-img {
  transform: scale(1.05);
}

.goal-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #0f172a 0%, rgba(15, 23, 42, 0.4) 100%);
}

.goal-card-content {
  position: absolute;
  inset: 0;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: white;
}

.goal-badge {
  position: absolute;
  top: 2rem;
  left: 2rem;
  padding: 0.25rem 0.75rem;
  background: rgba(var(--accent-primary-rgb), 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(var(--accent-primary-rgb), 0.3);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 900;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.goal-title {
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
}

.goal-subtitle {
  font-size: 0.875rem;
  color: #cbd5e1;
  margin-bottom: 1.5rem;
}

.goal-progress-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.goal-progress-text {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.curr-amount {
  font-size: 2rem;
  font-weight: 900;
}

.target-amount {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-left: 0.25rem;
}

.goal-percent {
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--accent-primary);
}

.goal-progress-track {
  height: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  overflow: hidden;
  backdrop-filter: blur(4px);
}

.goal-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), #60a5fa);
  border-radius: 999px;
}

/* ─── Trending Grid ─── */
.trending-layout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

@media (min-width: 1280px) {
  .trending-layout-grid {
    grid-template-columns: 1fr 2fr;
  }
}

.section-title-alt {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 2rem;
}

.trend-card {
  padding: 2rem;
}

.chart-container {
  height: 12rem;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0 0.5rem;
}

.bar-group {
  flex: 1;
  background: var(--bg-tertiary);
  border-radius: 999px;
  height: 100%;
  position: relative;
  display: flex;
  align-items: flex-end;
}

.chart-bar {
  width: 100%;
  background: rgba(var(--accent-primary-rgb), 0.4);
  border-radius: 999px;
  transition: background 0.2s;
}

.bar-group:hover .chart-bar {
  background: var(--accent-primary);
}

.chart-bar.active {
  background: var(--accent-primary);
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
  padding: 0 0.25rem;
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
}

/* ─── Recent Expenses ─── */
.recent-card {
  padding: 2rem;
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title-inline {
  font-size: 1.125rem;
  font-weight: 800;
}

.btn-text-action {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--accent-primary);
  background: transparent;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-text-action:hover {
  background: var(--glass-bg);
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.recent-item:hover {
  background: var(--bg-tertiary);
  border-color: var(--glass-border);
}

.recent-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.recent-icon-box {
  width: 3rem;
  height: 3rem;
  background: var(--bg-tertiary);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.recent-item:hover .recent-icon-box {
  background: var(--accent-primary);
  color: white;
}

.recent-name {
  font-weight: 700;
  color: var(--text-primary);
}

.recent-meta {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-weight: 500;
}

.recent-amount {
  font-size: 1.125rem;
  font-weight: 900;
}

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--bg-tertiary);
  border-radius: 10px;
}

@media (max-width: 768px) {
  .expenses-container {
    padding: 1rem;
    gap: 1.5rem;
  }

  .mesh-gradient {
    padding: 1.5rem;
    min-height: auto;
  }

  .spent-amount {
    font-size: 2.5rem;
  }

  .summary-stats-grid {
    gap: 1rem;
  }
}
</style>
