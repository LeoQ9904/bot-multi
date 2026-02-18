import { defineStore } from 'pinia';
import type { Note } from '../types/note.types';
import { useNoteService } from '../services/note.service';
import { useFirebaseAuth } from '~/composables/useAuth';

export const DEFAULT_TAG_COLORS = ['#0000FF', '#800080', '#2ECC71', '#F39C12', '#E74C3C', '#FF0000', '#00FF00'];

export const useNoteStore = defineStore('notes', {
    state: () => ({
        notes: [] as Note[],
        loading: false,
    }),

    // ... actions ... (actions are unchanged, so I don't need to touch them if I use the right range or multi_replace)
    // actually replace_file_content is for contiguous. I'll just add the constant at top and getter at bottom.
    // wait, I need to be careful with replace_file_content.
    // simpler to use 2 chunks if I can, but replace_file_content is single contiguous.
    // I'll use multi_replace for safety.

    actions: {
        async fetchNotes() {
            const { user } = useFirebaseAuth();
            if (!user.value) return;
            this.loading = true;
            try {
                const token = await user.value.getIdToken();
                const res = await useNoteService().findAll(token);
                if (res && res.data) {
                    this.notes = res.data;
                }
            } catch (e) {
                console.error('Failed to fetch notes', e);
            } finally {
                this.loading = false;
            }
        },

        async addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) {
            const { user } = useFirebaseAuth();
            if (!user.value) return;
            try {
                const token = await user.value.getIdToken();
                const res = await useNoteService().create(note, token);
                if (res && res.data) {
                    this.notes.unshift(res.data);
                    return res.data;
                }
            } catch (e) {
                console.error('Failed to add note', e);
            }
        },

        async updateNote(id: string, updates: Partial<Note>) {
            const { user } = useFirebaseAuth();
            if (!user.value) return;
            try {
                const token = await user.value.getIdToken();
                const res = await useNoteService().update(id, updates, token);
                if (res && res.data) {
                    const index = this.notes.findIndex(n => n.id === id);
                    if (index !== -1) {
                        this.notes[index] = res.data;
                    }
                }
            } catch (e) {
                console.error('Failed to update note', e);
            }
        },

        async deleteNote(id: string) {
            const { user } = useFirebaseAuth();
            if (!user.value) return;
            try {
                const token = await user.value.getIdToken();
                await useNoteService().delete(id, token);
                this.notes = this.notes.filter(n => n.id !== id);
            } catch (e) {
                console.error('Failed to delete note', e);
            }
        }
    },

    getters: {
        allNotes: (state) => state.notes,
        noteCount: (state) => state.notes.length,
        allTagColors: (state) => {
            const customColors = new Set<string>();
            state.notes.forEach(note => {
                const color = note.tagColor;
                if (!DEFAULT_TAG_COLORS.includes(color) && color.startsWith('#')) {
                    customColors.add(color);
                }
            });
            return [...DEFAULT_TAG_COLORS, ...Array.from(customColors)];
        }
    }
});
