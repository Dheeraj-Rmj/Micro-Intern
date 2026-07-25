import { StorageBucket , ErrorCode } from '@microintern/shared';

import { createModuleLogger } from '@/core/logger.js';
import { AppError } from '@/shared/errors/AppError.js';

import { CandidateProfileNotFoundError } from '../../domain/candidate.errors.js';

import type { StorageService } from '@/infrastructure/storage/StorageService.js';
import type { PrismaClient } from '@microintern/database';

const log = createModuleLogger('GetResumeUrlUseCase');

export class GetResumeUrlUseCase {
  constructor(
    private readonly db: PrismaClient,
    private readonly storage: StorageService
  ) {}

  /**
   * Generates a time-limited signed URL for a candidate's private resume.
   */
  async execute(userId: string) {
    const profile = await this.db.candidateProfile.findUnique({
      where: { userId },
      select: { resumeUrl: true },
    });

    if (!profile) {
      throw new CandidateProfileNotFoundError(userId);
    }

    if (typeof profile.resumeUrl !== 'string' || profile.resumeUrl === '') {
      throw new AppError({ message: 'Resume not uploaded', code: ErrorCode.NOT_FOUND, statusCode: 404 });
    }

    log.info({ userId }, 'Generating signed URL for resume');

    // 15 minute expiry (900 seconds)
    const result = await this.storage.getSignedDownloadUrl(profile.resumeUrl, StorageBucket.PRIVATE, 900);

    return result;
  }
}
