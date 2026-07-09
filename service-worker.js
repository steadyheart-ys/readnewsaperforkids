// 아주 가벼운 서비스워커 - 홈 화면 추가(설치) 조건을 만족시키기 위한 용도
// 데이터는 항상 Firebase에서 최신으로 받아오므로, 오프라인 캐싱은 껍데기(HTML/아이콘)만 최소로 처리해요
const CACHE_NAME = 'news-questions-shell-v1';
const SHELL_FILES = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 신문/질문 데이터(Firebase 요청)는 캐싱하지 않고 항상 네트워크로 보내고,
// 앱 껍데기 파일만 네트워크 실패 시 캐시로 대체해요.
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const isShellFile = SHELL_FILES.some((f) => url.includes(f.replace('./', '')));
  if (!isShellFile) return; // Firebase 등 나머지 요청은 그대로 통과

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
