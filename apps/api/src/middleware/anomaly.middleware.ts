import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { prisma } from '@/core/database.js';
import { logger } from '@/core/logger.js';

/**
 * Layer 2: Device Fingerprinting & IP Anomaly Detection Middleware
 * 
 * Intercepts authenticated requests. It fingerprints the user based on IP and User-Agent.
 * If the user's fingerprint is new, it records it.
 * If the fingerprint is marked as un-trusted (or if anomaly scoring was implemented),
 * it could force an MFA challenge or block the request.
 */
export const anomalyDetectionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    // Skip if not authenticated
    if (!userId) {
      return next();
    }

    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Create a deterministic fingerprint hash
    const fingerprint = crypto
      .createHash('sha256')
      .update(`${userId}-${ipAddress}-${userAgent}`)
      .digest('hex');

    // Attach fingerprint to request for downstream logging
    (req as any).deviceFingerprint = fingerprint;

    // Check against known devices in the database
    let device = await prisma.userDevice.findUnique({
      where: {
        userId_fingerprint: {
          userId,
          fingerprint
        }
      }
    });

    if (!device) {
      // New device detected. 
      // In a production strict zero-trust setup, this might trigger a "New Device" email
      // and force MFA before proceeding. Here we just log and create it.
      logger.warn({ userId, ipAddress, userAgent }, 'New device fingerprint detected for user');
      
      device = await prisma.userDevice.create({
        data: {
          userId,
          ipAddress,
          userAgent,
          fingerprint,
          isTrusted: true, // We trust it implicitly for now unless configured otherwise
        }
      });
    } else {
      // Update last seen (fire and forget to avoid blocking latency)
      prisma.userDevice.update({
        where: { id: device.id },
        data: { lastSeenAt: new Date() }
      }).catch(err => logger.error('Failed to update device lastSeenAt', err));
    }

    // If the device is explicitly distrusted (e.g. from a past attack), block it
    if (!device.isTrusted) {
      logger.error({ userId, fingerprint }, 'Blocked request from untrusted device fingerprint');
      return res.status(403).json({
        success: false,
        error: {
          code: 'SECURITY_ANOMALY',
          message: 'This device has been flagged for security reasons. Please contact support.'
        }
      });
    }

    next();
  } catch (error) {
    logger.error({ err: error }, 'Anomaly detection middleware failed');
    next(); // Fail open for the middleware if DB fails to avoid downtime, or fail closed for strict security.
  }
};
