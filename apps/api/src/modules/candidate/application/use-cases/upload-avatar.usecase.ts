import { StorageBucket, AuditAction } from "@microintern/shared";
import sharp from "sharp";

import { createModuleLogger } from "@/core/logger.js";

import {
  InvalidFileTypeError,
  FileTooLargeError,
  CandidateProfileNotFoundError,
} from "../../domain/candidate.errors.js";

import type { CalculateCompletionUseCase } from "./calculate-completion.usecase.js";
import type { StorageService } from "@/infrastructure/storage/StorageService.js";
import type { PrismaClient } from "@microintern/database";

const log = createModuleLogger("UploadAvatarUseCase");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class UploadAvatarUseCase {
  constructor(
    private readonly db: PrismaClient,
    private readonly storage: StorageService,
    private readonly calculateCompletion: CalculateCompletionUseCase,
  ) {}

  async execute(userId: string, file: Express.Multer.File | undefined) {
    if (file === null || file === undefined) {
      throw new Error("No file provided");
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new InvalidFileTypeError(ALLOWED_MIME_TYPES);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new FileTooLargeError(5);
    }

    const currentProfile = await this.db.candidateProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!currentProfile) {
      throw new CandidateProfileNotFoundError(userId);
    }

    // 1. Image Processing Pipeline (Sharp)
    // Strip EXIF, normalize rotation, convert to WebP, resize.
    log.info({ userId, originalSize: file.size }, "Processing avatar upload");

    const processedBuffer = await sharp(file.buffer)
      .rotate() // Auto-orient based on EXIF
      .resize(512, 512, { fit: "cover" }) // Square crop
      .webp({ quality: 80 }) // Compress
      .toBuffer();

    log.info({ userId, newSize: processedBuffer.length }, "Avatar processed");

    // 2. Versioned Storage Key
    // Instead of overwriting, we append a timestamp to version the file
    const timestamp = Date.now();
    const key = `avatars/${currentProfile.id}/avatar_v${timestamp}.webp`;

    // 3. Upload to StorageService
    const uploadResult = await this.storage.upload({
      key,
      data: processedBuffer,
      mimeType: "image/webp",
      bucket: StorageBucket.PUBLIC,
      metadata: {
        "x-amz-meta-candidate-id": currentProfile.id,
      },
    });

    // 4. Update Database
    await this.db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { avatarUrl: uploadResult.url },
      });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: AuditAction.UPDATE,
          entityType: "User",
          entityId: userId,
          metadata: { message: "Avatar changed", url: uploadResult.url },
        },
      });
    });

    // Recalculate completion async
    void this.calculateCompletion.execute(userId).catch((err: unknown) => {
      log.error({ err, userId }, "Failed to recalculate profile completion");
    });

    return { url: uploadResult.url };
  }
}
