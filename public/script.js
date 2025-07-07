// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-messaging.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCzQDzn_oEhFwws2rEQXszF51tgSmxNIdM",
  authDomain: "maxbattle-12a70.firebaseapp.com",
  projectId: "maxbattle-12a70",
  storageBucket: "maxbattle-12a70.firebasestorage.app",
  messagingSenderId: "964263252113",
  appId: "1:964263252113:web:d5b7854f4de30300e82f30",
  measurementId: "G-WT0HNT517L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Register service worker and get token
navigator.serviceWorker.register("/sw.js");

navigator.serviceWorker.ready.then((registration) => {
  console.log("✅ Service Worker ready");

  getToken(messaging, {
    vapidKey: "BGsQJ7vYEWs6x4IfyymjGWhbG2pMPd_z9w6o2mCoDFs4rB9ZU10NMaMEWyOyLTwJ8rCVGTQEycmfnsuRWtJaDFQ",
    serviceWorkerRegistration: registration
  }).then((currentToken) => {

    if (currentToken) {
      if(localStorage.getItem("fcmToken")!=currentToken){
        localStorage.setItem("fcmToken",currentToken);
      fetch("/saveFcmToken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: currentToken })
      });

      console.log("✅ FCM Token:", currentToken);
      }
      
    } else {
      console.warn("❌ No token available");
    }
  }).catch((err) => {
    console.error("❌ Error while retrieving token:", err);
  });
});


// Handle notification when app is open
onMessage(messaging, (payload) => {
  console.log("🔔 Foreground push received:", payload);

  if (Notification.permission === "granted") {
    new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: "/images/icon.png" // ✅ replace with your app icon
    });
  }
});


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('Service Worker Registered'))
    .catch((err) => console.error('SW Error:', err));
}

