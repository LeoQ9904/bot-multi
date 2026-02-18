<template>
  <div class="page-container">
    <div class="page-content">
      <HeaderPage title="Mis Notas" subtitle="Captura tus ideas y pensamientos importantes" />

      <NoteFilters v-model:search="searchQuery" v-model:selectedTag="selectedTag" />

      <div v-if="noteStore.loading" class="loading-state">
        <div class="loader"></div>
        <p>Cargando notas...</p>
      </div>

      <EmptyPage v-else-if="filteredNotes.length === 0" title="¿Listo para empezar tu día?"
        subtitle="Aún no tienes notas por aquí. Organiza tus pensamientos y deja que Aether te ayude a ser más productivo, lo puedes hacer creando las notas manualmente o puedes pedirle a Aether que te ayude a crearlas."
        manualText="Crear mi primera nota" chatText="Chat con Aether" @manual="openCreateModal"
        @chat="handleChatTask" />

      <div v-else class="notes-sections-wrapper">
        <NoteSection :notes="filteredNotes" @preview="handlePreview" @edit="handleEdit" @delete="handleDelete" />
      </div>
    </div>

    <!-- Modals -->
    <NoteDetailModal :is-open="isDetailModalOpen" :note="selectedNote" @close="closeDetailModal"
      @edit="handleEditFromDetail" @delete="handleDelete" />

    <NoteFormModal :is-open="isFormModalOpen" :note="selectedNote" @close="closeFormModal" @save="handleSaveNote" />

    <FabNew @manual="openCreateModal" @chat="handleChatTask" iaText="Nota por Chat" manualText="Manual" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNoteStore } from '../stores/note.store';
import { useNoteActions } from '~/composables/useNoteActions';
import type { Note } from '../types/note.types';
import NoteFilters from '../components/notes/NoteFilters.vue';
import NoteSection from '../components/notes/NoteSection.vue';
import NoteDetailModal from '../components/notes/NoteDetailModal.vue';
import NoteFormModal from '../components/notes/NoteFormModal.vue';
import FabNew from '~/components/FabNew.vue';
import HeaderPage from '~/components/HeaderPage.vue';
import EmptyPage from '~/components/EmptyPage.vue';

const noteStore = useNoteStore();
const route = useRoute();
const router = useRouter();

const {
  openNewNote,
  openEditNote,
  openViewNote,
  handleDelete: deleteNoteAction,
  handleSaveNote: saveNoteAction
} = useNoteActions();

// State
const searchQuery = ref('');
const selectedTag = ref('');
const selectedNote = ref<Note | null>(null);
const isDetailModalOpen = ref(false);
const isFormModalOpen = ref(false);

// Load data
onMounted(async () => {
  await noteStore.fetchNotes();
  handleQueryActions();
});

watch(() => route.query, () => {
  handleQueryActions();
}, { deep: true });

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
const handleQueryActions = () => {
  if (route.query.new !== undefined) {
    selectedNote.value = null;
    isFormModalOpen.value = true;
  } else if (route.query.edit) {
    const note = noteStore.notes.find(n => String(n.id) === String(route.query.edit));
    if (note) {
      selectedNote.value = { ...note };
      isFormModalOpen.value = true;
    } else if (noteStore.notes.length > 0) {
      closeFormModal();
    }
  } else if (route.query.view) {
    const note = noteStore.notes.find(n => String(n.id) === String(route.query.view));
    if (note) {
      selectedNote.value = note;
      isDetailModalOpen.value = true;
    } else if (noteStore.notes.length > 0) {
      closeDetailModal();
    }
  } else {
    isFormModalOpen.value = false;
    selectedNote.value = null;
    isDetailModalOpen.value = false;
  }
};

const openCreateModal = () => openNewNote();

const closeFormModal = () => {
  const query = { ...route.query };
  delete query.new;
  delete query.edit;
  router.push({ query });
};

const closeDetailModal = () => {
  const query = { ...route.query };
  delete query.view;
  router.push({ query });
};

// Event Handlers
const handleChatTask = () => {
  navigateTo({
    path: '/chat',
    query: {
      initialMessage: 'Hola! Quiero que me ayudes a crear la siguiente nota: '
    }
  });
};

const handlePreview = (note: Note) => openViewNote(note.id);
const handleEdit = (note: Note) => openEditNote(note.id);

const handleEditFromDetail = (note: Note) => {
  openEditNote(note.id);
};

const handleSaveNote = async (formData: any) => {
  await saveNoteAction(formData, selectedNote.value);
  closeFormModal();
};

const handleDelete = async (note: Note) => {
  const deleted = await deleteNoteAction(note.id);
  if (deleted) {
    isDetailModalOpen.value = false;
    closeDetailModal();
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
