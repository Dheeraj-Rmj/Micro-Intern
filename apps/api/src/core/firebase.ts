import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { config } from './config.js';
import { createModuleLogger } from './logger.js';

const log = createModuleLogger('Firebase');

/**
 * Initialize Firebase Admin SDK.
 * Expects FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY
 * to be present in the environment/config if using a service account.
 * Alternatively, it will use application default credentials if available.
 */
export function initFirebaseAdmin(): void {
  try {
    if (getApps().length === 0) {
      // In production/staging, you would pass credentials here if not using default creds
      // Example:
      // initializeApp({
      //   credential: cert({
      //     projectId: config.FIREBASE_PROJECT_ID,
      //     clientEmail: config.FIREBASE_CLIENT_EMAIL,
      //     privateKey: config.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      //   }),
      // });
      
      // Using application default credentials by default for simplicity:
      initializeApp();
      log.info('Firebase Admin SDK initialized successfully');
    }
  } catch (error) {
    log.error({ err: error }, 'Failed to initialize Firebase Admin SDK');
  }
}

export const firebaseAuth = getAuth;
