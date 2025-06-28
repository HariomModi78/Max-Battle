const CACHE_NAME = "maxBattle-cache-v1";
const urlsToCache = [
  "/",
  "/images/icon.png",  
  "/stylesheets/adminPanel.css",  
  "/stylesheets/adminTotalUser.css",  
  "/stylesheets/back.css",  
  "/stylesheets/boiler.css",  
  "/stylesheets/deposit.css",  
  "/stylesheets/editProfile.css",  
  "/stylesheets/earn.css",  
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
  "/stylesheets/tournamentDetail.css",  
  "/stylesheets/tournamentDetail.css",  
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
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
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
