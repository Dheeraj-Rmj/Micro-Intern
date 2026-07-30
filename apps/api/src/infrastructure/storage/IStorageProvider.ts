import { StorageBucket } from "@microintern/shared";
import type { UploadResult, SignedUrlResult } from "./StorageService.js";

export interface IStorageProvider {
  uploadFile(
    bucket: StorageBucket,
    key: string,
    buffer: Buffer,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<UploadResult>;

  deleteFile(bucket: StorageBucket, key: string): Promise<void>;

  getSignedDownloadUrl(
    bucket: StorageBucket,
    key: string,
    expiresInSeconds?: number,
  ): Promise<SignedUrlResult>;

  getSignedUploadUrl(
    bucket: StorageBucket,
    key: string,
    contentType: string,
    expiresInSeconds?: number,
  ): Promise<SignedUrlResult>;

  getFileBuffer(bucket: StorageBucket, key: string): Promise<Buffer>;
}
