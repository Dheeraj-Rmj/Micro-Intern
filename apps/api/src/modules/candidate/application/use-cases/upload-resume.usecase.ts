import { ResumeStatus } from '@microintern/database';
import { StorageBucket, AuditAction } from '@microintern/shared';

import { createModuleLogger } from '@/core/logger.js';


import { InvalidFileTypeError, FileTooLargeError, CandidateProfileNotFoundError } from '../../domain/candidate.errors.js';


import type { CalculateCompletionUseCase } from './calculate-completion.usecase.js';
import type { StorageService } from '@/infrastructure/storage/StorageService.js';
import type { PrismaClient } from '@microintern/database';
import type { Queue } from 'bullmq';

const log = createModuleLogger('UploadResumeUseCase');

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class UploadResumeUseCase {
  constructor(
    private readonly db: PrismaClient,
    private readonly storage: StorageService,
    private readonly calculateCompletion: CalculateCompletionUseCase,
    private readonly resumeParserQueue: Queue // BullMQ queue injected here
  ) {}

  async execute(userId: string, file: Express.Multer.File | undefined) {
    if (file === null || file === undefined) {
      throw new Error('No file provided');
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

    const ext = file.mimetype === 'application/pdf' ? 'pdf' : 'docx';
    const timestamp = Date.now();
    const key = `resumes/${currentProfile.id}/resume_v${timestamp}.${ext}`;

    log.info({ userId, size: file.size, key }, 'Uploading resume to private bucket');

    // 1. Upload to StorageService (PRIVATE bucket)
    await this.storage.upload({
      key,
      data: file.buffer,
      mimeType: file.mimetype,
      bucket: StorageBucket.PRIVATE,
      metadata: {
        'x-amz-meta-candidate-id': currentProfile.id,
      },
    });

    // 2. Update Database (ResumeStatus = PENDING_PARSE)
    await this.db.$transaction(async (tx) => {
      await tx.candidateProfile.update({
        where: { id: currentProfile.id },
        data: {
          resumeUrl: key, // We store the KEY, not the public URL, because it's private.
          resumeStatus: ResumeStatus.PENDING_PARSE,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: AuditAction.UPDATE,
          entityType: 'CandidateProfile',
          entityId: currentProfile.id,
          metadata: { message: 'Resume uploaded' },
        },
      });
    });

    // 3. Trigger Async AI Parsing via BullMQ
    log.info({ candidateId: currentProfile.id }, 'Queueing resume for AI parsing');
    await this.resumeParserQueue.add(
      'parse-resume',
      {
        candidateId: currentProfile.id,
        resumeKey: key,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      }
    );

    // 4. Recalculate completion async
    void this.calculateCompletion.execute(userId).catch((err: unknown) => {
      log.error({ err, userId }, 'Failed to recalculate profile completion');
    });

    return { status: ResumeStatus.PENDING_PARSE, message: 'Resume uploaded successfully' };
  }
}
