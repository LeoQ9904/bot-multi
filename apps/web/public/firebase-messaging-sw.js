importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCOkPPNeSB9oFvwmObJ7kwLozQiMGEBh8s",
    authDomain: "aether-ebb4e.firebaseapp.com",
    projectId: "aether-ebb4e",
    storageBucket: "aether-ebb4e.firebasestorage.app",
    messagingSenderId: "926675008848",
    appId: "1:926675008848:web:513c4c8a9bbbe7cac5c055"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.ico', // Replace with your icon
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
