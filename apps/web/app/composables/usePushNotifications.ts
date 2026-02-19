import { getToken, onMessage } from 'firebase/messaging';
import { useNotificationStore } from '~/stores/notification.store';
import { useNotificationService } from '~/services/notification.service';
import { useFirebaseAuth } from '~/composables/useAuth';

export const usePushNotifications = () => {
    const { $messaging } = useNuxtApp();
    const notificationStore = useNotificationStore();
    const notificationService = useNotificationService();
    const { user } = useFirebaseAuth();
    const runtimeConfig = useRuntimeConfig();

    const requestPermission = async () => {
        if (!import.meta.client || !('Notification' in window)) return;

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('[usePushNotifications] Notification permission granted.');
                await retrieveToken();
            } else {
                console.warn('[usePushNotifications] Notification permission denied.');
            }
        } catch (error) {
            console.error('[usePushNotifications] Error requesting permission:', error);
        }
    };

    const retrieveToken = async () => {

        if (!import.meta.client || !$messaging || !user.value) return;

        try {
            const currentToken = await getToken($messaging as any, {
                vapidKey: runtimeConfig.public.vapidKey
            });

            if (currentToken) {
                console.log('[usePushNotifications] FCM Token:', currentToken);
                const idToken = await user.value.getIdToken();
                await notificationService.registerToken(currentToken, idToken);
            } else {
                console.warn('[usePushNotifications] No registration token available. Request permission to generate one.');
            }
        } catch (error) {
            console.error('[usePushNotifications] An error occurred while retrieving token:', error);
        }
    };

    const initMessaging = () => {
        if (!import.meta.client || !$messaging) return;

        onMessage($messaging as any, (payload) => {
            console.log('[usePushNotifications] Foreground message received:', payload);
            if (payload.notification) {
                notificationStore.addNotification({
                    title: payload.notification.title || 'Notification',
                    body: payload.notification.body || '',
                    data: payload.data
                });

                // Show a browser notification even in foreground if desired
                new Notification(payload.notification.title || 'Aether', {
                    body: payload.notification.body,
                    icon: '/favicon.ico'
                });
            }
        });
    };

    const cleanupTokens = async () => {
        if (!import.meta.client || !$messaging || !user.value) return;

        try {
            const currentToken = await getToken($messaging as any, {
                vapidKey: 'BIBntEHyDkEEMKoWeKYiF67Ri8FV0ods74tRnQaOS7KHmowaEivGApb510_rOF3LIdKd-51YXtifhNhhrFc7qu0'
            });

            if (currentToken) {
                console.log('[usePushNotifications] Unregistering token before logout...');
                const idToken = await user.value.getIdToken();
                await notificationService.unregisterToken(currentToken, idToken);
                console.log('[usePushNotifications] Token unregistered successfully.');
            }
        } catch (error) {
            console.error('[usePushNotifications] Error during token cleanup:', error);
        }
    };

    return {
        requestPermission,
        retrieveToken,
        initMessaging,
        cleanupTokens
    };
};
