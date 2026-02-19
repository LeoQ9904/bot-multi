import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export default defineNuxtPlugin(async (nuxtApp) => {
    const runtimeConfig = useRuntimeConfig();

    const firebaseConfig = {
        apiKey: runtimeConfig.public.firebaseApiKey,
        authDomain: runtimeConfig.public.firebaseAuthDomain,
        projectId: runtimeConfig.public.firebaseProjectId,
        storageBucket: runtimeConfig.public.firebaseStorageBucket,
        messagingSenderId: runtimeConfig.public.firebaseMessagingSenderId,
        appId: runtimeConfig.public.firebaseAppId,
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    let messaging = null;
    if (import.meta.client) {
        const { isSupported, getMessaging } = await import('firebase/messaging');
        const supported = await isSupported();
        if (supported) {
            messaging = getMessaging(app);
        } else {
            console.warn('[Firebase] Messaging is not supported in this browser environment (likely due to insecure context/HTTP).');
        }
    }

    return {
        provide: {
            auth,
            messaging,
        },
    };
});
