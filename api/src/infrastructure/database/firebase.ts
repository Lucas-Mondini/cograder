import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    readFileSync(join(process.cwd(), 'firebase.json'), 'utf-8')
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "cograder-4b7ff.firebasestorage.app",
  });
}

export const firebaseAdmin = admin;
export const firestore = firebaseAdmin.firestore();
export const storage = firebaseAdmin.storage().bucket();