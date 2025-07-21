import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountJson) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_KEY');

initializeApp({
  credential: cert(JSON.parse(serviceAccountJson) as ServiceAccount)
});

export const db = getFirestore(); 