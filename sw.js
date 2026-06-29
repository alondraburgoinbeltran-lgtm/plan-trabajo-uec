const CACHE='plan-trabajo-uec-v3';
const ASSETS=['./','./index.html','./manifest.json','./assets/logo.png','./assets/icon-192.png','./assets/icon-512.png','./css/reset.css','./css/variables.css','./css/layout.css','./css/header.css','./css/cards.css','./css/charts.css','./css/tables.css','./css/responsive.css','./js/config.js','./js/utils.js','./js/api.js','./js/filters.js','./js/charts.js','./js/kpis.js','./js/table.js','./js/sections.js','./js/app.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));});
