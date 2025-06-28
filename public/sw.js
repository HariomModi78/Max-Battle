const CACHE_NAME = "maxBattle-cache-v1";
const urlsToCache = [
  "/",
  "/images/icon.png",  
  "/stylesheets/boiler.css",  
  "/stylesheets/deposit.css",  
  "/stylesheets/earn.css",  
  "/stylesheets/footer.css",  
  "/stylesheets/header.css",  
  "/stylesheets/home.css",  
  "/stylesheets/leadboard.css",  
  "/stylesheets/macCoin.css",  
  "/stylesheets/profile.css",  
  "/stylesheets/register.css",  
  "/stylesheets/start.css",  
  "/stylesheets/tournamentDetail.css",  
  "/stylesheets/tournamentDetail.css",  
  "/stylesheets/transaction.css",  
  "/stylesheets/upcomming.css",  
  "/stylesheets/wallet.css",  
  "/stylesheets/withdraw.css",  
  

  "/javaScripts/deposit.js",  
  "/javaScripts/earn.js",  
  "/javaScripts/home.js",  
  "/javaScripts/leadboard.js",  
  "/javaScripts/login.js",  
  "/javaScripts/ongoing.js",  
  "/javaScripts/profile.js",  
  "/javaScripts/refer.js",  
  "/javaScripts/register.js",  
  "/javaScripts/slot.js",  
  "/javaScripts/start.js",  
  "/javaScripts/tournamentDetail.js",  
  "/javaScripts/tournamentPayment.js",  
  "/javaScripts/transaction.js",  
  "/javaScripts/upcomming.js",  
  "/javaScripts/wallet.js",  
  "/javaScripts/withdraw.js",  
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
