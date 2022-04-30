import * as firebaseAdmin from 'firebase-admin'
import serviceAccount from 'config/firebase-service-account.json'

// Check whether Firebase Admin has been initialized
if (!firebaseAdmin.apps.length) {
	// Initialize Firebase Admin
	firebaseAdmin.initializeApp({
		credential: firebaseAdmin.credential.cert(serviceAccount as firebaseAdmin.ServiceAccount),
	})
}

export default firebaseAdmin
