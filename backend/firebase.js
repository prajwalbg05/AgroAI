let admin = null;
let db = null;

try {
	// Initialize only if credentials are available
	// Prefer GOOGLE_APPLICATION_CREDENTIALS path or FIREBASE_SERVICE_ACCOUNT (JSON string)
	const hasCredPath = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
	const hasCredJson = !!process.env.FIREBASE_SERVICE_ACCOUNT;
	if (hasCredPath || hasCredJson) {
		admin = require('firebase-admin');
		if (!admin.apps.length) {
			const options = hasCredJson
				? { credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) }
				: { credential: admin.credential.applicationDefault() };
			admin.initializeApp(options);
		}
		db = admin.firestore();
	}
} catch (_) {
	admin = null;
	db = null;
}

async function logChat({ userId = 'anonymous', message, reply, intent, context }) {
	if (!db) return;
	const col = db.collection('chat_history');
	await col.add({
		userId,
		message,
		reply,
		intent,
		context,
		createdAt: new Date().toISOString(),
	});
}

module.exports = { logChat };


