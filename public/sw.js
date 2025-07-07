importScripts("https://www.gstatic.com/firebasejs/10.1.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.1.0/firebase-messaging-compat.js");

// Your Firebase config again
firebase.initializeApp({
  apiKey: "AIzaSyCzQDzn_oEhFwws2rEQXszF51tgSmxNIdM",
  authDomain: "maxbattle-12a70.firebaseapp.com",
  projectId: "maxbattle-12a70",
  storageBucket: "maxbattle-12a70.firebasestorage.app",
  messagingSenderId: "964263252113",
  appId: "1:964263252113:web:d5b7854f4de30300e82f30",
  measurementId: "G-WT0HNT517L"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon.png" // ✅ Replace with your logo
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

const CACHE_NAME = "maxBattle-cache-v1";
const urlsToCache = [
  "/",
  "/images/icon.png",  
  "/images/1rsMatch.webp",  
  "/images/1v1.webp",  
  "/images/2v2.webp",  
  "/images/4v4.webp",  
  "/images/banner1.webp",  
  "/images/banner2.webp",  
  "/images/banner3.webp",  
  "/images/banner4.webp",  
  "/images/banner5.webp",  
  "/images/banner6.webp",  
  "/images/completed.webp",  
  "/images/duoFullMap.webp",  
  "/images/earn.webp",  
  "/images/freeMatch.webp",  
  "/images/home.webp",  
  "/images/leadboard.webp",  
  "/images/maxBattlePoster.webp",  
  "/images/maxBattlePoster1.webp",  
  "/images/maxBattlePoster2.webp",  
  "/images/maxBattlePoster3.webp",  
  "/images/notification.webp",  
  "/images/ongoing.webp",  
  "/images/profile.webp",  
  "/images/screen.png",  
  "/images/solo.webp",  
  "/images/soloFullMap.webp",  
  "/images/squadFullMap.webp",  
  "/images/support.webp",  
  "/images/upcomming.webp",  
  "/images/upi.webp",  
  "/images/wallet.webp",  


  "/stylesheets/adminCreateTournament.css",  
  "/stylesheets/adminPanel.css",  
  "/stylesheets/adminTotalUser.css",  
  "/stylesheets/back.css",  
  "/stylesheets/boiler.css",  
  "/stylesheets/deposit.css",  
  "/stylesheets/editProfile.css",  
  "/stylesheets/faq.css",  
  "/stylesheets/footer.css",  
  "/stylesheets/header.css",  
  "/stylesheets/home.css",  
  "/stylesheets/leadboard.css",  
  "/stylesheets/maxCoin.css",  
  "/stylesheets/prizeDistribution.css",  
  "/stylesheets/profile.css",  
  "/stylesheets/register.css",  
  "/stylesheets/start.css",  
  "/stylesheets/earn.css",  
  "/stylesheets/teamBasedPrizeDistribution.css",  
  "/stylesheets/tournamentDetail.css",  
  "/stylesheets/tournamentLeadboard.css",  
  "/stylesheets/tournamentPayment.css",  
  "/stylesheets/transaction.css",  
  "/stylesheets/upcomming.css",  
  "/stylesheets/wallet.css",  
  "/stylesheets/withdraw.css",  
  "/stylesheets/withdrawRequest.css",  
  

  "/javaScripts/adminPanel.js",  
  "/javaScripts/back.js",  
  "/javaScripts/boiler.js",  
  "/javaScripts/footer.js",  
  "/javaScripts/home.js",  
  "/javaScripts/prizeDistribution.js",  
  "/javaScripts/profile.js",  
  "/javaScripts/register.js",  
  "/javaScripts/start.js",  
  "/javaScripts/tournamentBar.js",  
  "/javaScripts/tournamentDetail.js",  
  "/javaScripts/tournamentPayment.js",  
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      try {
        await cache.addAll(urlsToCache);
        console.log("✅ All assets cached");
      } catch (err) {
        console.error("❌ Cache addAll failed:", err);
      }
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});



