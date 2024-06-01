/*
	Cache Service Worker template by mrc 2019
	mostly based in:
	https://github.com/GoogleChrome/samples/blob/gh-pages/service-worker/basic/service-worker.js
	https://github.com/chriscoyier/Simple-Offline-Site/blob/master/js/service-worker.js
	https://gist.github.com/kosamari/7c5d1e8449b2fbc97d372675f16b566e	
	
	Note for GitHub Pages:
	there can be an unexpected behaviour (cache not updating) when site is accessed from
	https://user.github.io/repo/ (without index.html) in some browsers (Firefox)
	use absolute paths if hosted in GitHub Pages in order to avoid it
	also invoke sw with an absolute path:
	navigator.serviceWorker.register('/repo/_cache_service_worker.js', {scope: '/repo/'})
*/

var PRECACHE_ID='rom-patcher-js';
var PRECACHE_VERSION='v281';
var PRECACHE_URLS=[
	'/RomPatcher/',
	'/RomPatcher/index.html',
	'/RomPatcher/manifest.json',
	'/RomPatcher/src/style/app_icon_16.png',
	'/RomPatcher/src/style/app_icon_114.png',
	'/RomPatcher/src/style/app_icon_144.png',
	'/RomPatcher/src/style/app_icon_192.png',
	'/RomPatcher/src/style/app_icon_maskable.png',
	'/RomPatcher/src/style/logo.png',
	'/RomPatcher/src/style/RomPatcher.css',
	'/RomPatcher/src/style/icon_close.svg',
	'/RomPatcher/src/style/icon_github.svg',
	'/RomPatcher/src/style/icon_heart.svg',
	'/RomPatcher/src/style/icon_settings.svg',
	'/RomPatcher/src/scripts/RomPatcher.js',
	'/RomPatcher/src/scripts/locale.js',
	'/RomPatcher/src/scripts/worker_apply.js',
	'/RomPatcher/src/scripts/worker_create.js',
	'/RomPatcher/src/scripts/worker_crc.js',
	'/RomPatcher/src/scripts/MarcFile.js',
	'/RomPatcher/src/scripts/crc.js',
	'/RomPatcher/src/scripts/zip.js/zip.js',
	'/RomPatcher/src/scripts/zip.js/z-worker.js',
	'/RomPatcher/src/scripts/zip.js/inflate.js',
	'/RomPatcher/src/scripts/formats/ips.js',
	'/RomPatcher/src/scripts/formats/ups.js',
	'/RomPatcher/src/scripts/formats/aps_n64.js',
	'/RomPatcher/src/scripts/formats/aps_gba.js',
	'/RomPatcher/src/scripts/formats/bps.js',
	'/RomPatcher/src/scripts/formats/rup.js',
	'/RomPatcher/src/scripts/formats/ppf.js',
	'/RomPatcher/src/scripts/formats/pmsr.js',
	'/RomPatcher/src/scripts/formats/vcdiff.js',
	'/RomPatcher/src/scripts/formats/zip.js'
];



// install event (fired when sw is first installed): opens a new cache
self.addEventListener('install', evt => {
	evt.waitUntil(
		caches.open('precache-'+PRECACHE_ID+'-'+PRECACHE_VERSION)
			.then(cache => cache.addAll(PRECACHE_URLS))
			.then(self.skipWaiting())
	);
});


// activate event (fired when sw is has been successfully installed): cleans up old outdated caches
self.addEventListener('activate', evt => {
	evt.waitUntil(
		caches.keys().then(cacheNames => {
			return cacheNames.filter(cacheName => (cacheName.startsWith('precache-'+PRECACHE_ID+'-') && !cacheName.endsWith('-'+PRECACHE_VERSION)));
		}).then(cachesToDelete => {
			return Promise.all(cachesToDelete.map(cacheToDelete => {
				console.log('delete '+cacheToDelete);
				return caches.delete(cacheToDelete);
			}));
		}).then(() => self.clients.claim())
	);
});


// fetch event (fired when requesting a resource): returns cached resource when possible
self.addEventListener('fetch', evt => {
	if(evt.request.url.startsWith(self.location.origin)){ //skip cross-origin requests
		evt.respondWith(
			caches.match(evt.request).then(cachedResource => {
				if (cachedResource) {
					return cachedResource;
				}else{
					return fetch(evt.request);
				}
			})
		);
	}
});