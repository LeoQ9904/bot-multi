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
        }
    };
};
