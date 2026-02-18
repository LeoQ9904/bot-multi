import { useNoteStore } from '~/stores/note.store';
import { useRouter, useRoute } from 'vue-router';
import type { Note } from '~/types/note.types';

export const useNoteActions = () => {
    const noteStore = useNoteStore();
    const router = useRouter();
    const route = useRoute();

    // Navigation Actions
    const openNewNote = async () => {
        await navigateTo({
            path: '/notes',
            query: { ...route.query, new: '' }
        });
    };

    const openEditNote = async (noteId: string) => {
        await navigateTo({
            path: '/notes',
            query: { ...route.query, edit: noteId, view: undefined }
        });
    };

    const openViewNote = async (noteId: string) => {
        await navigateTo({
            path: '/notes',
            query: { ...route.query, view: noteId, edit: undefined }
        });
    };

    // Store Actions
    const handleDelete = async (noteId: string) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta nota?')) {
            await noteStore.deleteNote(noteId);
            return true;
        }
        return false;
    };

    const handleSaveNote = async (formData: any, editingNote?: Note | null) => {
        if (editingNote) {
            await noteStore.updateNote(editingNote.id, formData);
        } else {
            await noteStore.addNote(formData);
        }
    };

    return {
        openNewNote,
        openEditNote,
        openViewNote,
        handleDelete,
        handleSaveNote
    };
};
