import { ref } from 'vue';

const isLoading = ref(false);
const loadingTitle = ref('Cargando');
const loadingMessage = ref('');
const MIN_LOADING_TIME = 800; // ms

export const useLoading = () => {
  let startTime = 0;

  const show = (title = 'Cargando', message = '') => {
    loadingTitle.value = title;
    loadingMessage.value = message;
    isLoading.value = true;
    startTime = Date.now();
  };

  const hide = async () => {
    const elapsed = Date.now() - startTime;
    const remaining = MIN_LOADING_TIME - elapsed;
    
    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining));
    }
    
    isLoading.value = false;
  };

  return {
    isLoading,
    loadingTitle,
    loadingMessage,
    show,
    hide,
  };
};
