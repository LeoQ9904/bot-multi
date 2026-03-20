import { defineStore } from 'pinia';
import type { SavingsProjection } from '../types/savings-projection.types';
import { useSavingsProjectionService } from '../services/savings-projection.service';

export const useSavingsProjectionStore = defineStore('savingsProjections', {
    state: () => ({
        projections: [] as SavingsProjection[],
        loading: false,
    }),

    actions: {
        async fetchProjections() {
            this.loading = true;
            try {
                const res = await useSavingsProjectionService().findAll();
                if (res && res.data) {
                    this.projections = res.data;
                }
            } catch (e) {
                console.error('Failed to fetch projections', e);
            } finally {
                this.loading = false;
            }
        },

        async addProjection(projection: Partial<SavingsProjection>) {
            try {
                const res = await useSavingsProjectionService().create(projection);
                if (res && res.data) {
                    this.projections.push(res.data);
                    return res.data;
                }
            } catch (e) {
                console.error('Failed to add projection', e);
            }
        },

        async updateProjection(id: string, updates: Partial<SavingsProjection>) {
            try {
                const res = await useSavingsProjectionService().update(id, updates);
                if (res && res.data) {
                    const index = this.projections.findIndex(p => p.id === id);
                    if (index !== -1) {
                        this.projections[index] = res.data;
                    }
                }
            } catch (e) {
                console.error('Failed to update projection', e);
            }
        },

        async deleteProjection(id: string) {
            try {
                await useSavingsProjectionService().delete(id);
                this.projections = this.projections.filter(p => p.id !== id);
            } catch (e) {
                console.error('Failed to delete projection', e);
            }
        }
    },

    getters: {
        allProjections: (state) => state.projections,
    }
});
