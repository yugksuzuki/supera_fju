// Service worker do SUPERA: deixa o app instalável e abrindo rápido.
// Dados (Supabase) nunca são guardados aqui: sempre vêm da rede.
const VERSAO = 'supera-v1';
const CASCA = ['/', '/manifest.webmanifest', '/logo.webp', '/icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(CASCA)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // Páginas: rede primeiro (versão nova sempre), cópia guardada se estiver sem internet.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => {
          const copia = r.clone();
          caches.open(VERSAO).then((c) => c.put('/', copia));
          return r;
        })
        .catch(() => caches.match('/')),
    );
    return;
  }

  // Arquivos com hash no nome (/assets) e ícones: cache primeiro.
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/') || url.pathname === '/logo.webp') {
    e.respondWith(
      caches.match(req).then(
        (achou) =>
          achou ||
          fetch(req).then((r) => {
            const copia = r.clone();
            caches.open(VERSAO).then((c) => c.put(req, copia));
            return r;
          }),
      ),
    );
  }
});
