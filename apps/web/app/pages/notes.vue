<template>
  <div class="page-container">
    <div class="page-content">
      <HeaderPage title="Mis Notas" subtitle="Captura tus ideas y pensamientos importantes" />

      <NoteFilters v-model:search="searchQuery" v-model:selectedTag="selectedTag" />

      <div v-if="noteStore.loading" class="loading-state">
        <div class="loader"></div>
        <p>Cargando notas...</p>
      </div>

      <div v-else-if="filteredNotes.length === 0" class="empty-state glass">
        <span class="material-symbols-outlined empty-icon">note_stack</span>
        <h3>No se encontraron notas</h3>
        <p v-if="searchQuery || selectedTag">Prueba ajustando tus filtros.</p>
        <p v-else>Comienza creando tu primera nota para organizar mejor tus ideas.</p>
        <button class="btn-primary" @click="openCreateModal">
          <span class="material-symbols-outlined">add</span>
          Crear Nota
        </button>
      </div>

      <div v-else class="notes-sections-wrapper">
        <NoteSection :notes="filteredNotes" @preview="handlePreview" @edit="handleEdit" @delete="handleDelete" />
      </div>
    </div>

    <!-- Modals -->
    <NoteDetailModal :is-open="isDetailModalOpen" :note="selectedNote" @close="isDetailModalOpen = false"
      @edit="handleEditFromDetail" @delete="handleDelete" />

    <NoteFormModal :is-open="isFormModalOpen" :note="selectedNote" @close="isFormModalOpen = false"
      @save="handleSaveNote" />

    <NoteFab @click="openCreateModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useNoteStore } from '../stores/note.store';
import type { Note } from '../types/note.types';
import NoteFilters from '../components/notes/NoteFilters.vue';
import NoteSection from '../components/notes/NoteSection.vue';
import NoteDetailModal from '../components/notes/NoteDetailModal.vue';
import NoteFormModal from '../components/notes/NoteFormModal.vue';
import NoteFab from '../components/notes/NoteFab.vue';
import HeaderPage from '~/components/HeaderPage.vue';

const noteStore = useNoteStore();

// State
const searchQuery = ref('');
const selectedTag = ref('');
const selectedNote = ref<Note | null>(null);
const isDetailModalOpen = ref(false);
const isFormModalOpen = ref(false);

// Load data
onMounted(async () => {
  await noteStore.fetchNotes();
});

// Computed
const filteredNotes = computed(() => {
  return noteStore.notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesTag = !selectedTag.value || note.tagColor === selectedTag.value;
    return matchesSearch && matchesTag;
  });
});

// Handlers
const openCreateModal = () => {
  selectedNote.value = null;
  isFormModalOpen.value = true;
};

const handlePreview = (note: Note) => {
  selectedNote.value = note;
  isDetailModalOpen.value = true;
};

const handleEdit = (note: Note) => {
  selectedNote.value = note;
  isFormModalOpen.value = true;
};

const handleEditFromDetail = (note: Note) => {
  isDetailModalOpen.value = false;
  handleEdit(note);
};

const handleSaveNote = async (formData: any) => {
  if (selectedNote.value) {
    await noteStore.updateNote(selectedNote.value.id, formData);
  } else {
    await noteStore.addNote(formData);
  }
  isFormModalOpen.value = false;
};

const handleDelete = async (note: Note) => {
  if (confirm('¿Estás seguro de que deseas eliminar esta nota?')) {
    await noteStore.deleteNote(note.id);
    isDetailModalOpen.value = false;
  }
};
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
  gap: 1.5rem;
  color: var(--text-secondary);
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid var(--bg-tertiary);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
  border-radius: 32px;
  gap: 1.25rem;
}

.empty-icon {
  font-size: 4rem;
  color: var(--text-tertiary);
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin: 0;
}

.empty-state p {
  color: var(--text-secondary);
  max-width: 400px;
  margin: 0;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -4px rgba(var(--accent-primary-rgb), 0.4);
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
}
</style>
