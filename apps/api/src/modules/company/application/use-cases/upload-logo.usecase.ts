import { StorageBucket } from '@microintern/shared';
import sharp from 'sharp';

import { createModuleLogger } from '@/core/logger.js';

import {
  CompanyNotFoundError,
  NotCompanyOwnerError,
  InvalidFileTypeError,
  FileTooLargeError,
} from '../../domain/errors/company.errors.js';

import type { ICompanyRepository } from '../../domain/repositories/ICompanyRepository.js';
import type { StorageService } from '@/infrastructure/storage/StorageService.js';

const log = createModuleLogger('UploadLogoUseCase');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class UploadLogoUseCase {
  constructor(
    private readonly companyRepository: ICompanyRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(userId: string, file: Express.Multer.File | undefined): Promise<{ url: string }> {
    if (file === null || file === undefined) {
      throw new Error('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new InvalidFileTypeError(ALLOWED_MIME_TYPES);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new FileTooLargeError(5);
    }

    const company = await this.companyRepository.findByUserId(userId);
    if (company === null) {
      throw new CompanyNotFoundError();
    }

    const member = await this.companyRepository.findMember(company.id, userId);
    if (member?.isOwner() !== true) {
      throw new NotCompanyOwnerError();
    }

    log.info({ companyId: company.id, userId, originalSize: file.size }, 'Processing logo upload');

    let dataBuffer = file.buffer;
    let mimeType = file.mimetype;
    let ext = 'webp';

    if (file.mimetype === 'image/svg+xml') {
      ext = 'svg';
    } else {
      dataBuffer = await sharp(file.buffer)
        .rotate()
        .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
      mimeType = 'image/webp';
    }

    const timestamp = Date.now();
    const key = `logos/${company.id}/logo_v${timestamp}.${ext}`;

    const uploadResult = await this.storage.upload({
      key,
      data: dataBuffer,
      mimeType,
      bucket: StorageBucket.PUBLIC,
      metadata: {
        'x-amz-meta-company-id': company.id,
      },
    });

    await this.companyRepository.updateLogo(company.id, uploadResult.url);
    log.info({ companyId: company.id, url: uploadResult.url }, 'Company logo uploaded successfully');

    return { url: uploadResult.url };
  }
}
