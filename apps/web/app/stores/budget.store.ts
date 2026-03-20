import { defineStore } from 'pinia';
import type { Budget } from '../types/budget.types';
import { useBudgetService } from '../services/budget.service';

export const useBudgetStore = defineStore('budgets', {
    state: () => ({
        budgets: [] as Budget[],
        loading: false,
    }),

    actions: {
        async fetchBudgets() {
            this.loading = true;
            try {
                const res = await useBudgetService().findAll();
                if (res && res.data) {
                    this.budgets = res.data;
                }
            } catch (e) {
                console.error('Failed to fetch budgets', e);
            } finally {
                this.loading = false;
            }
        },

        async addBudget(budget: Partial<Budget>) {
            try {
                const res = await useBudgetService().create(budget);
                if (res && res.data) {
                    this.budgets.push(res.data);
                    return res.data;
                }
            } catch (e) {
                console.error('Failed to add budget', e);
            }
        },

        async updateBudget(id: string, updates: Partial<Budget>) {
            try {
                const res = await useBudgetService().update(id, updates);
                if (res && res.data) {
                    const index = this.budgets.findIndex(b => b.id === id);
                    if (index !== -1) {
                        this.budgets[index] = res.data;
                    }
                }
            } catch (e) {
                console.error('Failed to update budget', e);
            }
        },

        async deleteBudget(id: string) {
            try {
                await useBudgetService().delete(id);
                this.budgets = this.budgets.filter(b => b.id !== id);
            } catch (e) {
                console.error('Failed to delete budget', e);
            }
        }
    },

    getters: {
        allBudgets: (state) => state.budgets,
    }
});
