import { defineStore } from 'pinia';
import type { Income } from '../types/income.types';
import { useIncomeService } from '../services/income.service';

export const useIncomeStore = defineStore('incomes', {
    state: () => ({
        incomes: [] as Income[],
        loading: false,
    }),

    actions: {
        async fetchIncomes() {
            this.loading = true;
            try {
                const res = await useIncomeService().findAll();
                if (res && res.data) {
                    this.incomes = res.data;
                }
            } catch (e) {
                console.error('Failed to fetch incomes', e);
            } finally {
                this.loading = false;
            }
        },

        async addIncome(income: Partial<Income>) {
            try {
                const res = await useIncomeService().create(income);
                if (res && res.data) {
                    this.incomes.unshift(res.data);
                    return res.data;
                }
            } catch (e) {
                console.error('Failed to add income', e);
            }
        },

        async updateIncome(id: string, updates: Partial<Income>) {
            try {
                const res = await useIncomeService().update(id, updates);
                if (res && res.data) {
                    const index = this.incomes.findIndex(i => i.id === id);
                    if (index !== -1) {
                        this.incomes[index] = res.data;
                    }
                }
            } catch (e) {
                console.error('Failed to update income', e);
            }
        },

        async deleteIncome(id: string) {
            try {
                await useIncomeService().delete(id);
                this.incomes = this.incomes.filter(i => i.id !== id);
            } catch (e) {
                console.error('Failed to delete income', e);
            }
        }
    },

    getters: {
        allIncomes: (state) => state.incomes,
        totalIncomeAmount: (state) => state.incomes.reduce((total, income) => total + Number(income.amount), 0),
    }
});
