import { StorageBucket } from '@microintern/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { UploadAvatarUseCase } from '@/modules/candidate/application/use-cases/upload-avatar.usecase.js';
import { InvalidFileTypeError, FileTooLargeError, CandidateProfileNotFoundError } from '@/modules/candidate/domain/candidate.errors.js';

describe('UploadAvatarUseCase', () => {
  let useCase: UploadAvatarUseCase;
  let mockDb: any;
  let mockStorage: any;
  let mockCalcCompletion: any;

  // Minimal valid 1x1 transparent PNG buffer to satisfy sharp() image transformation without errors
  const validPngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64'
  );

  beforeEach(() => {
    mockDb = {
      candidateProfile: { findUnique: vi.fn() },
      $transaction: vi.fn(async (cb) => cb(mockTx)),
    };
    mockStorage = {
      upload: vi.fn().mockResolvedValue({ url: 'https://storage.example.com/avatars/prof-1/avatar_v123.webp' }),
    };
    mockCalcCompletion = {
      execute: vi.fn().mockResolvedValue(100),
    };
    useCase = new UploadAvatarUseCase(mockDb, mockStorage, mockCalcCompletion);
  });

  const mockTx: any = {
    user: { update: vi.fn().mockResolvedValue({}) },
    auditLog: { create: vi.fn().mockResolvedValue({}) },
  };

  it('should throw an error when no file is provided', async () => {
    await expect(useCase.execute('user-1', undefined)).rejects.toThrow('No file provided');
  });

  it('should throw InvalidFileTypeError for unauthorized MIME types (e.g. text/plain)', async () => {
    const file: any = { mimetype: 'text/plain', size: 1024, buffer: Buffer.from('test') };
    await expect(useCase.execute('user-1', file)).rejects.toThrow(InvalidFileTypeError);
  });

  it('should throw FileTooLargeError if file exceeds 5MB limit', async () => {
    const file: any = { mimetype: 'image/jpeg', size: 6 * 1024 * 1024, buffer: validPngBuffer };
    await expect(useCase.execute('user-1', file)).rejects.toThrow(FileTooLargeError);
  });

  it('should throw CandidateProfileNotFoundError if candidate profile does not exist', async () => {
    mockDb.candidateProfile.findUnique.mockResolvedValue(null);
    const file: any = { mimetype: 'image/png', size: 1024, buffer: validPngBuffer };
    await expect(useCase.execute('user-1', file)).rejects.toThrow(CandidateProfileNotFoundError);
  });

  it('should process image with Sharp, upload to public storage bucket, and record audit log', async () => {
    mockDb.candidateProfile.findUnique.mockResolvedValue({ id: 'prof-1' });
    const file: any = { mimetype: 'image/png', size: 2048, buffer: validPngBuffer };

    const result = await useCase.execute('user-1', file);
    expect(result.url).toContain('storage.example.com/avatars/prof-1');
    expect(mockStorage.upload).toHaveBeenCalledWith({
      key: expect.stringMatching(/^avatars\/prof-1\/avatar_v\d+\.webp$/),
      data: expect.any(Buffer),
      mimeType: 'image/webp',
      bucket: StorageBucket.PUBLIC,
      metadata: { 'x-amz-meta-candidate-id': 'prof-1' },
    });
    expect(mockTx.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { avatarUrl: result.url },
    });
    expect(mockTx.auditLog.create).toHaveBeenCalled();
  });
});
