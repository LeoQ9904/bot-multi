import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    type User
} from 'firebase/auth';
import { markRaw, ref } from 'vue';
import { useUserService } from '~/services/user.service';

// Global state to share across components/pages
const user = ref<User | null>(null);
const loading = ref<boolean>(true);

export const useFirebaseAuth = () => {
    const { $auth } = useNuxtApp();

    if (import.meta.client && loading.value) {
        onAuthStateChanged($auth, (firebaseUser) => {
            console.log('[useFirebaseAuth] Auth state changed:', firebaseUser?.email || 'Logged out');
            user.value = firebaseUser ? markRaw(firebaseUser) : null;
            loading.value = false;
        });
    }

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            console.log('[useFirebaseAuth] Initiating Google login...');
            const result = await signInWithPopup($auth, provider);
            console.log('[useFirebaseAuth] Login successful for:', result.user.email);

            // Explicitly set global state
            user.value = markRaw(result.user);
            console.log('[useFirebaseAuth] Global user state updated.');

            return user.value;
        } catch (error) {
            console.error('[useFirebaseAuth] Login failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Cleanup FCM tokens before logout
            const { cleanupTokens } = await import('~/composables/usePushNotifications')
                .then(m => m.usePushNotifications());
            await cleanupTokens();

            await signOut($auth);
            user.value = null;
            console.log('[useFirebaseAuth] Logged out.');
        } catch (error) {
            console.error('[useFirebaseAuth] Logout failed:', error);
        }
    };

    const syncProfile = async () => {
        console.log('[useFirebaseAuth] syncProfile called. Current user state:', user.value?.email);

        if (!user.value) {
            console.warn('[useFirebaseAuth] syncProfile aborted: No user in state.');
            return;
        }

        try {
            console.log('[useFirebaseAuth] Requesting ID token...');
            const token = await user.value.getIdToken();
            console.log('[useFirebaseAuth] ID Token obtained. Sending request to backend...');

            const response = await useUserService().getProfile(token);

            console.log('[useFirebaseAuth] Backend response status:', response.status);

            if (!response) {
                throw new Error('Failed to sync profile: No response from backend');
            }

            const data = response;
            console.log('[useFirebaseAuth] Profile sync completed successfully:', data);
            return data;
        } catch (error) {
            console.error('[useFirebaseAuth] Exception in syncProfile:', error);
            throw error;
        }
    };

    return {
        user,
        loading,
        loginWithGoogle,
        logout,
        syncProfile,
    };
};
