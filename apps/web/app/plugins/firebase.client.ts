import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export default defineNuxtPlugin((nuxtApp) => {
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

    return {
        provide: {
            auth,
        },
    };
});
