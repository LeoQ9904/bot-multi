export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  devServer: {
    port: 3003
  },
  modules: ['@pinia/nuxt'],
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
      nodeEnv: process.env.NODE_ENV,
      vapidKey: process.env.FIREBASE_VAPI_KEY
    }
  }
})
