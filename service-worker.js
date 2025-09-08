//service-worker.js
// ===== Service Worker for PWA =====

// Cache version
const CACHE_NAME = "expenses-cache-v1";
const urlsToCache = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./pic.jpg",
    "./reminder-tone.mp3"
];

// Install event
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

// Activate event (clean old caches)
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch event
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Background sync / push notification placeholder
self.addEventListener("push", (event) => {
    const options = {
        body: "💰 Reminder: Don’t forget to add today’s expenses!",
        icon: "./pic.jpg",
        vibrate: [200, 100, 200],
        sound: "./reminder-tone.mp3"
    };
    event.waitUntil(
        self.registration.showNotification("Expenses Reminder", options)
    );
});
