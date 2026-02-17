<template>
  <div class="expenses-wrapper">
    <!-- Main Content -->
    <main class="expenses-container custom-scrollbar">

      <!-- Summary Card (Mesh Gradient) -->
      <div class="summary-card mesh-gradient shadow-glow">
        <div class="summary-icon-bg">
          <span class="material-symbols-outlined">analytics</span>
        </div>
        <div class="summary-content">
          <p class="summary-badge">Resumen Mensual</p>
          <div class="total-spent-row">
            <span class="spent-label">Total gastado</span>
            <h2 class="spent-amount">$1,245.00</h2>
            <span class="budget-limit">de $2,000.00</span>
          </div>

          <div class="budget-progress-container">
            <div class="progress-info">
              <span>PROGRESO DEL PRESUPUESTO</span>
              <span>62%</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar" style="width: 62%"></div>
            </div>
          </div>

          <div class="summary-stats-grid">
            <div class="stat-box">
              <p class="stat-label">Resto del mes</p>
              <p class="stat-value">$755</p>
            </div>
            <div class="stat-box">
              <p class="stat-label">Promedio diario</p>
              <p class="stat-value">$41.50</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Grid: Form and AI Insight -->
      <div class="top-layout-grid">
        <!-- Register Expense Form -->
        <div class="card-glass register-card">
          <div class="card-accent-border"></div>
          <div class="card-header">
            <div class="header-icon">
              <span class="material-symbols-outlined">add_circle</span>
            </div>
            <h3>Registrar Gasto</h3>
          </div>

          <form @submit.prevent="handleSaveExpense" class="expense-form">
            <div class="ai-input-wrapper">
              <div class="ai-input-icon">
                <span class="material-symbols-outlined">magic_button</span>
              </div>
              <input v-model="aiExpensePrompt" type="text" class="ai-expense-input"
                placeholder="¿En qué gastaste hoy? Ej: 'Cena con amigos $50'" />
            </div>

            <div class="form-row">
              <div class="field-container">
                <label class="field-label">Monto</label>
                <div class="amount-input-wrapper">
                  <span class="currency-symbol">$</span>
                  <input v-model="form.amount" type="number" step="0.01" class="amount-input" placeholder="0.00" />
                </div>
              </div>

              <div class="field-container">
                <label class="field-label">Categoría</label>
                <select v-model="form.category" class="select-input">
                  <option value="Comida">🍔 Comida</option>
                  <option value="Transporte">🚗 Transporte</option>
                  <option value="Entretenimiento">🎬 Entretenimiento</option>
                  <option value="Hogar">🏠 Hogar</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="field-container">
                <label class="field-label">Vincular a Meta</label>
                <select v-model="form.goal" class="select-input">
                  <option value="">Ninguna</option>
                  <option value="Vacaciones">🌴 Vacaciones Japón</option>
                  <option value="MacBook">💻 Nuevo MacBook</option>
                </select>
              </div>
              <div class="field-container">
                <label class="field-label">Fecha</label>
                <input v-model="form.date" type="date" class="date-input" />
              </div>
            </div>

            <button type="submit" class="btn-primary-gradient">
              Guardar Gasto
            </button>
          </form>
        </div>

        <!-- AI Insight Card -->
        <div class="card-glass ai-insight-card">
          <div class="ai-insight-content">
            <div class="insight-icon-box">
              <span class="material-symbols-outlined">auto_fix_high</span>
            </div>
            <h4 class="insight-title">AI Insight</h4>
            <p class="insight-text">
              "Tu gasto en <span class="highlight-warning">Entretenimiento</span> aumentó un <span
                class="highlight-underline">35%</span>. Podrías ahorrar <span class="highlight-primary">$120</span> este
              mes si limitas las salidas de fin de semana."
            </p>
          </div>
          <button class="btn-link-action">
            <span>Ver plan de ahorro</span>
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>

      <!-- Bottom Grid: Categories and Goals -->
      <div class="bottom-layout-grid">
        <!-- Categories Breakdown -->
        <section class="card-glass categories-card">
          <h3 class="section-title">Por Categoría</h3>
          <div class="categories-list">
            <div class="category-item">
              <div class="cat-header">
                <div class="cat-info">
                  <div class="cat-icon-box bg-blue">
                    <span class="material-symbols-outlined">restaurant</span>
                  </div>
                  <span class="cat-name">Comida</span>
                </div>
                <span class="cat-amount">$485.50</span>
              </div>
              <div class="cat-progress-track">
                <div class="cat-progress-bar bg-blue" style="width: 39%"></div>
              </div>
            </div>

            <div class="category-item">
              <div class="cat-header">
                <div class="cat-info">
                  <div class="cat-icon-box bg-purple">
                    <span class="material-symbols-outlined">commute</span>
                  </div>
                  <span class="cat-name">Transporte</span>
                </div>
                <span class="cat-amount">$273.90</span>
              </div>
              <div class="cat-progress-track">
                <div class="cat-progress-bar bg-purple" style="width: 22%"></div>
              </div>
            </div>

            <div class="category-item">
              <div class="cat-header">
                <div class="cat-info">
                  <div class="cat-icon-box bg-warning">
                    <span class="material-symbols-outlined">theater_comedy</span>
                  </div>
                  <span class="cat-name">Entretenimiento</span>
                  <span class="material-symbols-outlined warn-icon">warning</span>
                </div>
                <span class="cat-amount text-warning">$174.30</span>
              </div>
              <div class="cat-progress-track">
                <div class="cat-progress-bar bg-warning" style="width: 14%"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Goal Card -->
        <section class="goal-image-card">
          <img src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200" alt="Japan travel"
            class="goal-bg-img" />
          <div class="goal-overlay"></div>
          <div class="goal-card-content">
            <div class="goal-badge">Meta Activa</div>
            <div class="goal-info">
              <h3 class="goal-title">Vacaciones a Japón</h3>
              <p class="goal-subtitle">Faltan $1,500 para tu gran aventura en Tokyo.</p>
              <div class="goal-progress-group">
                <div class="goal-progress-text">
                  <div class="goal-amounts">
                    <span class="curr-amount">$4,500</span>
                    <span class="target-amount">/ $6,000</span>
                  </div>
                  <span class="goal-percent">75%</span>
                </div>
                <div class="goal-progress-track">
                  <div class="goal-progress-bar" style="width: 75%"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Trend and Recent List -->
      <div class="trending-layout-grid">
        <!-- Weekly Trend -->
        <div class="card-glass trend-card">
          <h3 class="section-title-alt">Tendencia Semanal</h3>
          <div class="chart-container">
            <div class="bar-group">
              <div class="chart-bar" style="height: 40%"></div>
            </div>
            <div class="bar-group">
              <div class="chart-bar" style="height: 60%"></div>
            </div>
            <div class="bar-group">
              <div class="chart-bar" style="height: 45%"></div>
            </div>
            <div class="bar-group">
              <div class="chart-bar active" style="height: 90%"></div>
            </div>
            <div class="bar-group">
              <div class="chart-bar" style="height: 55%"></div>
            </div>
          </div>
          <div class="chart-labels">
            <span>Lun</span><span>Mar</span><span>Mie</span><span>Jue</span><span>Vie</span>
          </div>
        </div>

        <!-- Recent Expenses -->
        <div class="card-glass recent-card">
          <div class="recent-header">
            <h3 class="section-title-inline">Gastos Recientes</h3>
            <button class="btn-text-action">Ver Historial</button>
          </div>
          <div class="recent-list">
            <div class="recent-item">
              <div class="recent-left">
                <div class="recent-icon-box">
                  <span class="material-symbols-outlined">lunch_dining</span>
                </div>
                <div class="recent-text">
                  <p class="recent-name">Restaurante Almuerzo</p>
                  <p class="recent-meta">Hoy, 14:30 • Comida</p>
                </div>
              </div>
              <div class="recent-right">
                <p class="recent-amount">-$45.00</p>
              </div>
            </div>

            <div class="recent-item">
              <div class="recent-left">
                <div class="recent-icon-box">
                  <span class="material-symbols-outlined">coffee</span>
                </div>
                <div class="recent-text">
                  <p class="recent-name">Starbucks Coffee</p>
                  <p class="recent-meta">Hoy, 09:15 • Comida</p>
                </div>
              </div>
              <div class="recent-right">
                <p class="recent-amount">-$6.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

const aiExpensePrompt = ref('');
const form = reactive({
  amount: undefined,
  category: 'Comida',
  goal: '',
  date: new Date().toISOString().split('T')[0]
});

const handleSaveExpense = () => {
  console.log('Saving expense:', form);
  alert('Gasto guardado correctamente (Modo Maquetación)');
};
</script>

<style scoped>
.expenses-wrapper {
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
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

/* ─── Mesh Gradient Summary Card ─── */
.summary-card {
  position: relative;
  border-radius: 1.5rem;
  padding: 2rem;
  color: white;
  overflow: hidden;
  min-height: 280px;
}

.mesh-gradient {
  background: radial-gradient(at 0% 0%, #1e3a8a 0%, transparent 50%),
    radial-gradient(at 100% 0%, #581c87 0%, transparent 50%),
    radial-gradient(at 100% 100%, #1e40af 0%, transparent 50%),
    radial-gradient(at 0% 100%, #312e81 0%, transparent 50%);
  background-color: #0f172a;
}

.summary-icon-bg {
  position: absolute;
  top: 1rem;
  right: 1rem;
  opacity: 0.1;
  pointer-events: none;
}

.summary-icon-bg span {
  font-size: 10rem;
}

.summary-badge {
  font-size: 0.75rem;
  font-weight: 800;
  color: #93c5fd;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 1rem;
}

.total-spent-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.spent-label {
  font-size: 0.875rem;
  color: rgba(147, 197, 253, 0.7);
  font-weight: 500;
}

.spent-amount {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.02em;
}

.budget-limit {
  font-size: 1.25rem;
  color: rgba(147, 197, 253, 0.5);
  font-weight: 300;
}

.budget-progress-container {
  max-width: 450px;
  margin-bottom: 2.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: #dbeafe;
}

.progress-track {
  height: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  overflow: hidden;
  backdrop-filter: blur(4px);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #60a5fa, #a78bfa);
  border-radius: 9999px;
}

.summary-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.5rem;
}

@media (min-width: 768px) {
  .summary-stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 800;
  color: rgba(147, 197, 253, 0.6);
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

/* ─── Glass Cards ─── */
.card-glass {
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: 1.5rem;
  overflow: hidden;
}

.top-layout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 1280px) {
  .top-layout-grid {
    grid-template-columns: 2fr 1fr;
  }
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

.ai-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.ai-input-icon {
  position: absolute;
  left: 1.25rem;
  color: var(--accent-primary);
}

.ai-expense-input {
  width: 100%;
  padding: 1.25rem 1rem 1.25rem 3.5rem;
  background: var(--bg-tertiary);
  border: 2px solid var(--glass-border);
  border-radius: 1.25rem;
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 500;
  outline: none;
  transition: all 0.2s;
}

.ai-expense-input:focus {
  border-color: rgba(var(--accent-primary-rgb, 102, 126, 234), 0.5);
  box-shadow: 0 0 0 4px var(--glow);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .form-row {
    grid-template-columns: 1fr 1fr;
  }
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

.amount-input {
  padding-left: 2rem;
  font-weight: 700;
}

.amount-input:focus,
.select-input:focus,
.date-input:focus {
  border-color: var(--accent-primary);
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

.light-theme .btn-primary-gradient {
  background: linear-gradient(135deg, #1e293b, #475569);
}

.btn-primary-gradient:hover {
  transform: translateY(-2px);
  filter: brightness(1.2);
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

/* ─── Categories & Goal Grid ─── */
.bottom-layout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .bottom-layout-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.categories-card {
  padding: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 800;
  margin-bottom: 2rem;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cat-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cat-icon-box {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-blue {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.bg-purple {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.bg-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.cat-name {
  font-size: 0.875rem;
  font-weight: 700;
}

.warn-icon {
  font-size: 0.875rem;
  color: var(--accent-amber);
}

.cat-amount {
  font-size: 0.875rem;
  font-weight: 900;
}

.cat-progress-track {
  height: 0.625rem;
  background: var(--bg-tertiary);
  border-radius: 999px;
  overflow: hidden;
}

.cat-progress-bar {
  height: 100%;
  border-radius: 999px;
}

.cat-progress-bar.bg-blue {
  background: #3b82f6;
}

.cat-progress-bar.bg-purple {
  background: #a855f7;
}

.cat-progress-bar.bg-warning {
  background: #f59e0b;
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
