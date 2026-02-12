/**
 * API Endpoints Constants
 * Centraliza todas las rutas de la API para mantener el código organizado
 */

// Base URL - Se configura desde variables de entorno
export const API_BASE_URL = process.env.NUXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080';

/**
 * Endpoints de IA
 */
export const IA_ENDPOINTS = {
    CHAT: '/ai/chat',
    IDENTITY: '/ai/identity',
} as const;

/**
 * Endpoints de Tareas
 */
export const TASK_ENDPOINTS = {
    LIST: '/tasks',
    CREATE: '/tasks',
    BY_ID: (id: string) => `/tasks/${id}`,
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`,
} as const;

/**
 * Endpoints de Notas
 */
export const NOTE_ENDPOINTS = {
    LIST: '/notes',
    CREATE: '/notes',
    BY_ID: (id: string) => `/notes/${id}`,
    UPDATE: (id: string) => `/notes/${id}`,
    DELETE: (id: string) => `/notes/${id}`,
} as const;

/**
 * Endpoints de Usuarios
 */
export const USER_ENDPOINTS = {
    PROFILE: '/users/profile',
    BY_ID: (id: string) => `/users/${id}`,
    UPDATE_PROFILE: (id: string) => `/users/${id}/profile`,
    UPDATE_AVATAR: (id: string) => `/users/${id}/avatar`,
    PREFERENCES: (id: string) => `/users/${id}/preferences`,
    DELETE: (id: string) => `/users/${id}`,
} as const;

/**
 * Endpoints de Integraciones
 */
export const INTEGRATION_ENDPOINTS = {
    LIST: '/integrations',
    BY_ID: (id: string) => `/integrations/${id}`,
} as const;

/**
 * Endpoints de Autenticación (Futuros)
 */
export const AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    PROFILE: '/auth/profile',
} as const;

/**
 * Tipo helper para construir URLs completas
 */
export const buildUrl = (endpoint: string, params?: Record<string, string | number>): string => {
    let url = `${API_BASE_URL}${endpoint}`;

    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            searchParams.append(key, String(value));
        });
        url += `?${searchParams.toString()}`;
    }

    return url;
};

/**
 * Helper para construir rutas dinámicas
 */
export const buildPath = (template: string, params: Record<string, string>): string => {
    let path = template;
    Object.entries(params).forEach(([key, value]) => {
        path = path.replace(`:${key}`, value);
    });
    return path;
};
