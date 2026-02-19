import { ApiService } from './api.service';

export const useNotificationService = () => {
    return {
        registerToken: async (token: string, firebaseToken: string) => {
            return ApiService.post('/users/fcm-token', { token }, {
                headers: {
                    Authorization: `Bearer ${firebaseToken}`
                }
            });
        },

        broadcastTest: async (title: string, body: string, firebaseToken: string) => {
            return ApiService.post('/notifications/broadcast-test', { title, body }, {
                headers: {
                    Authorization: `Bearer ${firebaseToken}`
                }
            });
        },

        unregisterToken: async (token: string, firebaseToken: string) => {
            return ApiService.post('/users/fcm-token/unregister', { token }, {
                headers: {
                    Authorization: `Bearer ${firebaseToken}`
                }
            });
        },

        getNotifications: async (firebaseToken: string) => {
            return ApiService.get('/notifications', {
                headers: {
                    Authorization: `Bearer ${firebaseToken}`
                }
            });
        },

        markRead: async (id: string, firebaseToken: string) => {
            return ApiService.patch(`/notifications/${id}/read`, {}, {
                headers: {
                    Authorization: `Bearer ${firebaseToken}`
                }
            });
        },

        markAllRead: async (firebaseToken: string) => {
            return ApiService.post('/notifications/read-all', {}, {
                headers: {
                    Authorization: `Bearer ${firebaseToken}`
                }
            });
        }
    };
};
