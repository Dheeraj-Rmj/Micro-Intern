import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { config } from './config.js';
import { createModuleLogger } from './logger.js';

const log = createModuleLogger('Firebase');

/**
 * Initialize Firebase Admin SDK.
 */
export function initFirebaseAdmin(): void {
  try {
    if (getApps().length === 0) {
      if (config.FIREBASE_PROJECT_ID && config.FIREBASE_CLIENT_EMAIL && config.FIREBASE_PRIVATE_KEY) {
        initializeApp({
          credential: cert({
            projectId: config.FIREBASE_PROJECT_ID,
            clientEmail: config.FIREBASE_CLIENT_EMAIL,
            privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
        });
        log.info('Firebase Admin SDK initialized with Service Account credentials');
      } else {
        // Fallback to default
        initializeApp();
        log.info('Firebase Admin SDK initialized with application default credentials');
      }
    }
  } catch (error) {
    log.error({ err: error }, 'Failed to initialize Firebase Admin SDK');
  }
}

export const firebaseAuth = getAuth;
