// Service Worker for MovieFlix - 오프라인 캐싱 및 성능 최적화
const CACHE_NAME = 'moodflix-v1';
const API_CACHE_NAME = 'moodflix-api-v1';
const IMAGE_CACHE_NAME = 'moodflix-images-v1';

// 캐시할 리소스들
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.svg',
  '/favicon.ico'
];

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('Service Worker 설치 중...');
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      console.log('정적 리소스 캐싱 중...');
      await cache.addAll(STATIC_ASSETS);
    } catch (e) {
      console.warn('일부 리소스 캐싱 실패(설치 계속):', e);
    }
    console.log('Service Worker 설치 완료');
    await self.skipWaiting();
  })());
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('Service Worker 활성화 중...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== API_CACHE_NAME && 
                cacheName !== IMAGE_CACHE_NAME) {
              console.log('오래된 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker 활성화 완료');
        return self.clients.claim();
      })
  );
});

// fetch 이벤트 - 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 비-GET 요청은 가로채지 않음
  if (request.method !== 'GET') {
    return;
  }

  // API 요청 처리
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  }
  // 이미지 요청 처리
  else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  }
  // 정적 리소스 처리
  else {
    event.respondWith(handleStaticRequest(request));
  }
});

// API 요청 처리
async function handleApiRequest(request) {
  // 안전 가드: 비-GET은 캐싱하지 않음
  if (request.method !== 'GET') {
    return fetch(request);
  }

  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // 네트워크 우선 전략
    const networkResponse = await fetch(request);
    
    // 성공적인 응답만 캐시
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    // 네트워크 실패 시 캐시에서 반환
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('API 캐시에서 반환:', request.url);
      return cachedResponse;
    }
    
    // 캐시도 없으면 오프라인 응답
    return new Response(
      JSON.stringify({ 
        error: '오프라인 상태입니다. 네트워크 연결을 확인해주세요.' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// 이미지 요청 처리
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  
  // 캐시 우선 전략 (이미지는 자주 변경되지 않음)
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    // 이미지 로딩 실패 시 플레이스홀더 반환
    return new Response(
      '<svg width="300" height="450" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#333"/><text x="50%" y="50%" text-anchor="middle" fill="#999" font-family="Arial" font-size="14">이미지 로딩 실패</text></svg>',
      { 
        status: 200,
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
}

// 정적 리소스 요청 처리
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // 내비게이션 요청은 App Shell로 폴백
  if (request.mode === 'navigate') {
    const shell = await cache.match('/index.html');
    if (shell) return shell;
  }
  
  // 캐시 우선 전략
  const cachedResponse = await cache.match(request);
  if (cachedResponse) return cachedResponse;
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    // 오프라인 페이지 반환(최후 수단)
    return new Response(
      '<!DOCTYPE html><html><head><title>오프라인</title></head><body><h1>오프라인 상태입니다</h1><p>네트워크 연결을 확인해주세요.</p></body></html>',
      { 
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// 이미지 요청인지 확인
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(request.url);
}

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('백그라운드 동기화 실행');
    // 오프라인 중 저장된 데이터 동기화 로직
  }
});

// 푸시 알림 (선택사항)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});
