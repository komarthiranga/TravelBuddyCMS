/* Only the offline screen is cached. No CMS, API, HTML or location data is stored. */
const CACHE = 'travel-buddy-offline-v1'
self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE).then(cache => cache.add('/offline.html')).then(() => self.skipWaiting()))
})
self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('travel-buddy-offline-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url)
    const publicPage = ['/', '/attractions', '/guide', '/help', '/food', '/hotels', '/transport', '/emergency'].includes(url.pathname) || url.pathname.startsWith('/attractions/')
    if (event.request.method !== 'GET' || event.request.mode !== 'navigate' || url.origin !== self.location.origin || !publicPage) return
    event.respondWith(fetch(event.request).catch(async () => (await caches.match('/offline.html', {cacheName:CACHE})) || new Response('You are offline. Reconnect and reload Travel Buddy.', {status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})))
})
