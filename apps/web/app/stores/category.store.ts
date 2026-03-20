import { defineStore } from 'pinia';
import type { Category } from '../types/category.types';
import { useCategoryService } from '../services/category.service';

export const useCategoryStore = defineStore('categories', {
    state: () => ({
        categories: [] as Category[],
        loading: false,
        availableIcons: [
            '🍔', '🚗', '🛒', '🏠', '💡', '💊', '🎬', '👕', '✈️', '🎁',
            '💰', '🏦', '📈', '🎟️', '🍕', '☕', '🚌', '🚆', '📱', '💻',
            '🎮', '🏋️', '🧹', '🧴', '👗', '👟', '🕶️', '🐶', '🐱', '🪴',
            '⚽', '🎨', '📖', '🧳', '🛠️', '🔒', '🔑', '🧼', '🍽️', '🥂'
        ],
        defaultIcon: '📁',
    }),

    actions: {
        async fetchCategories() {
            this.loading = true;
            try {
                const res = await useCategoryService().findAll();
                if (res && res.data) {
                    this.categories = res.data;
                }
            } catch (e) {
                console.error('Failed to fetch categories', e);
            } finally {
                this.loading = false;
            }
        },

        async addCategory(category: Partial<Category>) {
            try {
                const res = await useCategoryService().create(category);
                if (res && res.data) {
                    this.categories.push(res.data);
                    return res.data;
                }
            } catch (e) {
                console.error('Failed to add category', e);
            }
        },

        async updateCategory(id: string, updates: Partial<Category>) {
            try {
                const res = await useCategoryService().update(id, updates);
                if (res && res.data) {
                    const index = this.categories.findIndex(c => c.id === id);
                    if (index !== -1) {
                        this.categories[index] = res.data;
                    }
                }
            } catch (e) {
                console.error('Failed to update category', e);
            }
        },

        async deleteCategory(id: string) {
            try {
                await useCategoryService().delete(id);
                this.categories = this.categories.filter(c => c.id !== id);
            } catch (e) {
                console.error('Failed to delete category', e);
            }
        }
    },

    getters: {
        allCategories: (state) => state.categories,
        incomeCategories: (state) => state.categories.filter(c => c.type === 'INGRESO'),
        expenseCategories: (state) => state.categories.filter(c => c.type === 'GASTO')
    }
});
