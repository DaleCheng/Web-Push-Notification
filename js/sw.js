
'use strict';

// self 指的是 ServiceWorkerGlobalScope 物件，也就是 service worker

self.addEventListener('push', function(event) {
	console.log('[Service Worker] Push Received.');
	console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

	const title = '推送通知';
	const options = {
		body: '線上費用系統開始推播拉!',
		icon: 'images/icon.png',
		badge: 'images/badge.png'
	};

	//event.waitUntil(self.registration.showNotification(title, options));

	const notificationPromise = self.registration.showNotification(title, options);
	event.waitUntil(notificationPromise);
});

self.addEventListener('notificationclick', function(event) {
	console.log('[Service Worker] Notification click Received.');

	event.notification.close();

	event.waitUntil(
		clients.openWindow('https://www.google.com.tw/')
	);
});