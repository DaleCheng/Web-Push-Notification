
'use strict';

const applicationServerPublicKey = 'BOHxSAJrvjreUd6yyWmAj5szi2YL-vx1SmRpzVHhHfPqbOaQ4oUmFT3j8rdUgOsm2idvgbvG3ZgVthLkWP9YG-8';

const pushButton = $('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, '+')
		.replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

// 初始化
function initialiseUI() {
	if (!isSubscribed) {
		// 允許「顯示通知」
		subscribeUser();
	}

	$('.js-push-btn').on('click', function() {
		$('.js-push-btn').prop('disabled', true);

		console.log('isSubscribed:' + isSubscribed);

		if (isSubscribed) {
			// 不允許「顯示通知」
		  	unsubscribeUser();
		} else {
			// 允許「顯示通知」
			subscribeUser();
		}
	});

	// get subscription value, return resolves to a PushSubscription object or null.
	swRegistration.pushManager.getSubscription()
	.then(function(subscription) {
		isSubscribed = !(subscription === null);

		updateSubscriptionOnServer(subscription);

		console.log('======================>');
		console.log(subscription);
		console.log('======================>');

		if (isSubscribed) {
		  console.log('User IS subscribed.');
		} else {
		  console.log('User is NOT subscribed.');
		}

		updateBtn();
	});
}

function unsubscribeUser() {
	swRegistration.pushManager.getSubscription()
	.then(function(subscription) {
		if (subscription) {
			return subscription.unsubscribe();
		}
	})
	.catch(function(error) {
		console.log('Error unsubscribing', error);
	})
	.then(function() {
		updateSubscriptionOnServer(null);

		console.log('User is unsubscribed.');
		isSubscribed = false;

		updateBtn();
	});
}

// 允許「顯示通知」
function subscribeUser() {
	const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
	swRegistration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: applicationServerKey
	})
	.then(function(subscription) {
		console.log('User is subscribed:', subscription);

		updateSubscriptionOnServer(subscription);

		isSubscribed = true;

		updateBtn();
	})
	.catch(function(err) {
		console.log('Failed to subscribe the user: ', err);
		updateBtn();
	});
}

function updateSubscriptionOnServer(subscription) {
	// TODO: Send subscription to application server
	$.ajax({
		url: 'http://localhost:8081/oes/notification/saveNotification.ug',
		type: 'get',
		data: JSON.stringify(subscription)
	})

	const subscriptionJson = document.querySelector('.js-subscription-json');
	const subscriptionDetails = document.querySelector('.js-subscription-details');

	if (subscription) {
		$('#natDiv').html(JSON.stringify(subscription))
	} else {
		$('#natDiv').empty();
	}
}

function updateBtn() {
	if (Notification.permission === 'denied') {

		$('.js-push-btn').text('Push Messaging Blocked.');
		$('.js-push-btn').prop('disabled', true);
		updateSubscriptionOnServer(null);
		return;
	}

	if (isSubscribed) {
		$('.js-push-btn').text('Disable Push Messaging');
	} else {
		$('.js-push-btn').text('Enable Push Messaging');
	}

	$('.js-push-btn').prop('disabled', false);
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
	console.log('Service Worker and Push is supported');

	navigator.serviceWorker.register('sw.js')
	.then(function(swReg) {
		console.log('Service Worker is registered', swReg);

		swRegistration = swReg;
		initialiseUI();
	})
	.catch(function(error) {
		console.error('Service Worker Error', error);
	});
} else {
	console.warn('Push messaging is not supported');
	$('.js-push-btn').text('Push Not Supported.');
}

