import { defineStore } from 'pinia';
import type { Expense } from '../types/expense.types';
import { useExpenseService } from '../services/expense.service';

export const useExpenseStore = defineStore('expenses', {
    state: () => ({
        expenses: [] as Expense[],
        loading: false,
    }),

    actions: {
        async fetchExpenses() {
            this.loading = true;
            try {
                const res = await useExpenseService().findAll();
                if (res && res.data) {
                    this.expenses = res.data;
                }
            } catch (e) {
                console.error('Failed to fetch expenses', e);
            } finally {
                this.loading = false;
            }
        },

        async addExpense(expense: Partial<Expense>) {
            try {
                const res = await useExpenseService().create(expense);
                if (res && res.data) {
                    this.expenses.unshift(res.data);
                    return res.data;
                }
            } catch (e) {
                console.error('Failed to add expense', e);
            }
        },

        async updateExpense(id: string, updates: Partial<Expense>) {
            try {
                const res = await useExpenseService().update(id, updates);
                if (res && res.data) {
                    const index = this.expenses.findIndex(e => e.id === id);
                    if (index !== -1) {
                        this.expenses[index] = res.data;
                    }
                }
            } catch (e) {
                console.error('Failed to update expense', e);
            }
        },

        async deleteExpense(id: string) {
            try {
                await useExpenseService().delete(id);
                this.expenses = this.expenses.filter(e => e.id !== id);
            } catch (e) {
                console.error('Failed to delete expense', e);
            }
        }
    },

    getters: {
        allExpenses: (state) => state.expenses,
        totalExpenseAmount: (state) => state.expenses.reduce((total, expense) => total + Number(expense.amount), 0),
    }
});
