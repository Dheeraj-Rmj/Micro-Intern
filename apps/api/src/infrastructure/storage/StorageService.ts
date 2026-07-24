import { Client as MinioClient, type BucketItem } from 'minio';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { config } from '@/core/config.js';
import { createModuleLogger } from '@/core/logger.js';
import { StorageBucket } from '@microintern/shared';
import { STORAGE } from '@microintern/shared';

const log = createModuleLogger('StorageService');

/**
 * Storage Service — unified interface over MinIO (dev) and AWS S3 (prod).
 *
 * Design: The service abstracts provider differences behind a clean API.
 * Switching from MinIO to S3 requires only changing STORAGE_PROVIDER in .env.
 *
 * File key strategy: `{entityType}/{entityId}/{uuid}.{extension}`
 * Example: `resumes/user-uuid/abc123.pdf`
 *
 * Access model:
 * - PUBLIC bucket: direct URL access (avatars, company logos)
 * - PRIVATE bucket: signed URL required (resumes, submissions, evaluations)
 */

export type UploadResult = {
  key: string;
  bucket: string;
  url: string;
  etag: string;
  sizeBytes: number;
};

export type SignedUrlResult = {
  url: string;
  expiresAt: Date;
};

export class StorageService {
  private readonly provider: 'minio' | 's3';
  private minioClient: MinioClient | null = null;
  private s3Client: S3Client | null = null;

  constructor() {
    this.provider = config.STORAGE_PROVIDER;

    if (this.provider === 'minio') {
      this.minioClient = new MinioClient({
        endPoint: config.MINIO_ENDPOINT,
        port: config.MINIO_PORT,
        useSSL: config.MINIO_USE_SSL,
        accessKey: config.MINIO_ACCESS_KEY,
        secretKey: config.MINIO_SECRET_KEY,
      });
    } else {
      this.s3Client = new S3Client({
        region: config.AWS_REGION ?? 'us-east-1',
        credentials: {
          accessKeyId: config.AWS_ACCESS_KEY_ID ?? '',
          secretAccessKey: config.AWS_SECRET_ACCESS_KEY ?? '',
        },
      });
    }
  }

  /**
   * Upload a file from a Buffer.
   */
  async upload(options: {
    key: string;
    data: Buffer;
    mimeType: string;
    bucket?: StorageBucket;
    metadata?: Record<string, string>;
  }): Promise<UploadResult> {
    const bucketName = this.getBucketName(options.bucket ?? StorageBucket.PRIVATE);
    const sizeBytes = options.data.byteLength;

    try {
      if (this.provider === 'minio' && this.minioClient !== null) {
        const etag = await this.minioClient.putObject(
          bucketName,
          options.key,
          options.data,
          sizeBytes,
          {
            'Content-Type': options.mimeType,
            ...options.metadata,
          },
        );

        const url = options.bucket === StorageBucket.PUBLIC
          ? this.getPublicUrl(bucketName, options.key)
          : '';

        log.info({ key: options.key, bucket: bucketName, sizeBytes }, 'File uploaded (MinIO)');

        return { key: options.key, bucket: bucketName, url, etag: etag.etag ?? '', sizeBytes };
      } else if (this.s3Client !== null) {
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: options.key,
          Body: options.data,
          ContentType: options.mimeType,
          Metadata: options.metadata,
        });

        const response = await this.s3Client.send(command);
        const url = options.bucket === StorageBucket.PUBLIC
          ? `https://${bucketName}.s3.amazonaws.com/${options.key}`
          : '';

        log.info({ key: options.key, bucket: bucketName, sizeBytes }, 'File uploaded (S3)');

        return {
          key: options.key,
          bucket: bucketName,
          url,
          etag: response.ETag ?? '',
          sizeBytes,
        };
      }

      throw new Error('No storage provider configured');
    } catch (error) {
      log.error({ err: error, key: options.key }, 'Upload failed');
      throw error;
    }
  }

  /**
   * Generate a signed URL for private file access.
   */
  async getSignedDownloadUrl(
    key: string,
    bucket: StorageBucket = StorageBucket.PRIVATE,
    expirySeconds: number = STORAGE.SIGNED_URL_EXPIRY_SECONDS,
  ): Promise<SignedUrlResult> {
    const bucketName = this.getBucketName(bucket);
    const expiresAt = new Date(Date.now() + expirySeconds * 1000);

    if (this.provider === 'minio' && this.minioClient !== null) {
      const url = await this.minioClient.presignedGetObject(bucketName, key, expirySeconds);
      return { url, expiresAt };
    } else if (this.s3Client !== null) {
      const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
      const url = await getSignedUrl(this.s3Client, command, { expiresIn: expirySeconds });
      return { url, expiresAt };
    }

    throw new Error('No storage provider configured');
  }

  /**
   * Generate a signed URL for client-side upload.
   */
  async getSignedUploadUrl(
    key: string,
    mimeType: string,
    bucket: StorageBucket = StorageBucket.PRIVATE,
    expirySeconds = 900, // 15 minutes
  ): Promise<SignedUrlResult> {
    const bucketName = this.getBucketName(bucket);
    const expiresAt = new Date(Date.now() + expirySeconds * 1000);

    if (this.provider === 'minio' && this.minioClient !== null) {
      const url = await this.minioClient.presignedPutObject(bucketName, key, expirySeconds);
      return { url, expiresAt };
    } else if (this.s3Client !== null) {
      const { PutObjectCommand: Put } = await import('@aws-sdk/client-s3');
      const command = new Put({ Bucket: bucketName, Key: key, ContentType: mimeType });
      const url = await getSignedUrl(this.s3Client, command, { expiresIn: expirySeconds });
      return { url, expiresAt };
    }

    throw new Error('No storage provider configured');
  }

  /**
   * Delete a file.
   */
  async delete(key: string, bucket: StorageBucket = StorageBucket.PRIVATE): Promise<void> {
    const bucketName = this.getBucketName(bucket);

    if (this.provider === 'minio' && this.minioClient !== null) {
      await this.minioClient.removeObject(bucketName, key);
    } else if (this.s3Client !== null) {
      await this.s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
    }

    log.info({ key, bucket: bucketName }, 'File deleted');
  }

  /**
   * Generate a storage key for a specific entity and file.
   * Format: `{entityType}/{entityId}/{uuid}.{extension}`
   */
  static generateKey(entityType: string, entityId: string, filename: string): string {
    const ext = filename.split('.').pop() ?? 'bin';
    const uniqueId = crypto.randomUUID();
    return `${entityType}/${entityId}/${uniqueId}.${ext}`;
  }

  /**
   * Health check — verify connectivity to storage provider.
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; provider: string }> {
    try {
      if (this.provider === 'minio' && this.minioClient !== null) {
        const publicBucket = this.getBucketName(StorageBucket.PUBLIC);
        await this.minioClient.bucketExists(publicBucket);
      }
      return { status: 'healthy', provider: this.provider };
    } catch {
      return { status: 'unhealthy', provider: this.provider };
    }
  }

  private getBucketName(bucket: StorageBucket): string {
    if (this.provider === 'minio') {
      return bucket === StorageBucket.PUBLIC
        ? config.MINIO_BUCKET_PUBLIC
        : config.MINIO_BUCKET_PRIVATE;
    } else {
      return bucket === StorageBucket.PUBLIC
        ? (config.S3_BUCKET_PUBLIC ?? 'microintern-public')
        : (config.S3_BUCKET_PRIVATE ?? 'microintern-private');
    }
  }

  private getPublicUrl(bucket: string, key: string): string {
    if (this.provider === 'minio') {
      const protocol = config.MINIO_USE_SSL ? 'https' : 'http';
      return `${protocol}://${config.MINIO_ENDPOINT}:${config.MINIO_PORT}/${bucket}/${key}`;
    }
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
}

// Singleton
let storageService: StorageService | null = null;

export function getStorageService(): StorageService {
  if (storageService === null) {
    storageService = new StorageService();
  }
  return storageService;
}
