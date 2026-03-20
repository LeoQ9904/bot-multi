/**
 * API Service Base
 * Servicio centralizado para realizar peticiones HTTP con manejo de errores,
 * autenticación y transformación de respuestas
 */

import type { UseFetchOptions } from 'nuxt/app';

/**
 * Tipo para las respuestas de la API
 */
export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status: number;
    success: boolean;
}

/**
 * Tipo para errores de la API
 */
export interface ApiError {
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
}

/**
 * Configuración base para las peticiones
 */
const getBaseConfig = (): any => {
    const config = useRuntimeConfig();
    const nuxtApp = useNuxtApp();

    return {
        baseURL: config.public.apiBaseUrl || 'http://127.0.0.1:8080',

        // Interceptor para agregar el token de autenticación
        async onRequest({ options }: any) {
            const { $auth } = nuxtApp as any;

            // Intentar obtener el token de Firebase si hay un usuario logueado
            if ($auth?.currentUser) {
                try {
                    const token = await $auth.currentUser.getIdToken();
                    if (token) {
                        options.headers = options.headers || {};
                        if (options.headers instanceof Headers) {
                            options.headers.set('Authorization', `Bearer ${token}`);
                        } else {
                            (options.headers as any).Authorization = `Bearer ${token}`;
                        }
                    }
                } catch (error) {
                    console.error('❌ Error getting Firebase ID token:', error);
                }
            } else {
                // Fallback a la cookie por si acaso (aunque Firebase es la fuente de verdad)
                const token = useCookie('auth_token').value;
                if (token) {
                    options.headers = options.headers || {};
                    if (options.headers instanceof Headers) {
                        options.headers.set('Authorization', `Bearer ${token}`);
                    } else {
                        (options.headers as any).Authorization = `Bearer ${token}`;
                    }
                }
            }

            // Log de la petición en desarrollo
            if (config.public.nodeEnv === 'development') {
                console.log('🚀 API Request:', options.method, options.baseURL);
            }
        },

        // Interceptor para manejar respuestas exitosas
        onResponse({ response }: any) {
            if (config.public.nodeEnv === 'development') {
                console.log('✅ API Response:', response.status, response._data);
            }
        },

        // Interceptor para manejar errores
        onResponseError({ response }: any) {
            const statusCode = response.status;
            const errorData = response._data;

            console.error('❌ API Error:', statusCode, errorData);

            // Manejar errores específicos
            switch (statusCode) {
                case 401:
                    // Token expirado o inválido
                    console.warn('⚠️ Unauthorized - Redirecting to login');
                    const authToken = useCookie('auth_token');
                    authToken.value = null;
                    navigateTo('/');
                    break;

                case 403:
                    console.warn('⚠️ Forbidden - Insufficient permissions');
                    break;

                case 404:
                    console.warn('⚠️ Not Found');
                    break;

                case 422:
                    console.warn('⚠️ Validation Error:', errorData.errors);
                    break;

                case 500:
                    console.error('⚠️ Server Error');
                    break;

                default:
                    console.error('⚠️ Unknown Error:', statusCode);
            }

            // Mostrar notificación de error al usuario (si tienes un sistema de notificaciones)
            // useNotification().error(errorData.message || 'Ha ocurrido un error');
        },
    };
};

/**
 * Clase ApiService con métodos HTTP comunes
 */
export class ApiService {
    /**
     * GET Request
     */
    static async get<T = any>(
        url: string,
        options?: UseFetchOptions<T>
    ): Promise<ApiResponse<T>> {
        const { data, error } = await useFetch<ApiResponse<T>>(url, {
            ...getBaseConfig(),
            ...options,
            method: 'GET',
        });

        if (error.value) {
            throw this.handleError(error.value);
        }

        return data.value as ApiResponse<T>;
    }

    /**
     * POST Request
     */
    static async post<T = any>(
        url: string,
        body?: any,
        options?: UseFetchOptions<T>
    ): Promise<ApiResponse<T>> {
        const { data, error } = await useFetch<ApiResponse<T>>(url, {
            ...getBaseConfig(),
            ...options,
            method: 'POST',
            body,
        });

        if (error.value) {
            throw this.handleError(error.value);
        }

        return data.value as ApiResponse<T>;
    }

    /**
     * PUT Request
     */
    static async put<T = any>(
        url: string,
        body?: any,
        options?: UseFetchOptions<T>
    ): Promise<ApiResponse<T>> {
        const { data, error } = await useFetch<ApiResponse<T>>(url, {
            ...getBaseConfig(),
            ...options,
            method: 'PUT',
            body,
        });

        if (error.value) {
            throw this.handleError(error.value);
        }

        return data.value as ApiResponse<T>;
    }

    /**
     * PATCH Request
     */
    static async patch<T = any>(
        url: string,
        body?: any,
        options?: UseFetchOptions<T>
    ): Promise<ApiResponse<T>> {
        const { data, error } = await useFetch<ApiResponse<T>>(url, {
            ...getBaseConfig(),
            ...options,
            method: 'PATCH',
            body,
        });

        if (error.value) {
            throw this.handleError(error.value);
        }

        return data.value as ApiResponse<T>;
    }

    /**
     * DELETE Request
     */
    static async delete<T = any>(
        url: string,
        options?: UseFetchOptions<T>
    ): Promise<ApiResponse<T>> {
        const { data, error } = await useFetch<ApiResponse<T>>(url, {
            ...getBaseConfig(),
            ...options,
            method: 'DELETE',
        });

        if (error.value) {
            throw this.handleError(error.value);
        }

        return data.value as ApiResponse<T>;
    }

    /**
     * Upload File
     */
    static async uploadFile<T = any>(
        url: string,
        file: File,
        fieldName: string = 'file',
        additionalData?: Record<string, any>
    ): Promise<ApiResponse<T>> {
        const formData = new FormData();
        formData.append(fieldName, file);

        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                formData.append(key, value);
            });
        }

        return this.post<T>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    /**
     * Manejo centralizado de errores
     */
    private static handleError(error: any): ApiError {
        return {
            message: error.data?.message || error.message || 'Error desconocido',
            statusCode: error.statusCode || 500,
            errors: error.data?.errors,
        };
    }
}

/**
 * Helper para usar con composables
 */
export const useApi = () => {
    return {
        get: ApiService.get,
        post: ApiService.post,
        put: ApiService.put,
        patch: ApiService.patch,
        delete: ApiService.delete,
        uploadFile: ApiService.uploadFile,
    };
};
