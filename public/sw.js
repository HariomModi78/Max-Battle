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
  "/images/bindUpi.webp",  
  "/images/completed.webp",  
  "/images/disconnect.webp",  
  "/images/duoFullMap.webp",  
  "/images/earn.webp",  
  "/images/freeMatch.webp",  
  "/images/home.webp",  
  "/images/joiningBonus.webp",  
  "/images/leadboard.webp",  
  "/images/maxBattlePoster.webp",  
  "/images/maxBattlePoster1.webp",  
  "/images/maxBattlePoster2.webp",  
  "/images/maxBattlePoster3.webp",  
  "/images/name.png",  
  "/images/notification.webp",  
  "/images/ongoing.webp",  
  "/images/profile.webp",  
  "/images/screen.png",  
  "/images/solo.webp",  
  "/images/soloFullMap.webp",  
  "/images/squadFullMap.webp",  
  "/images/support.webp",  
  "/images/try.png",  
  "/images/upcoming.webp",  
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
  "/stylesheets/spin.css",  
  "/stylesheets/start.css",  
  "/stylesheets/teamBasedPrizeDistribution.css",  
  "/stylesheets/tournamentDetail.css",  
  "/stylesheets/tournamentLeadboard.css",  
  "/stylesheets/tournamentPayment.css",  
  "/stylesheets/transaction.css",  
  "/stylesheets/upcoming.css",  
  "/stylesheets/wallet.css",  
  "/stylesheets/withdraw.css",  
  "/stylesheets/withdrawRequest.css",  
  

  "/javaScripts/adminPanel.js",  
  "/javaScripts/back.js",  
  "/javaScripts/boiler.js",  
  "/javaScripts/footer.js",  
  "/javaScripts/header.js",  
  "/javaScripts/home.js",  
  "/javaScripts/prizeDistribution.js",  
  "/javaScripts/profile.js",  
  "/javaScripts/spin.js",  
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



