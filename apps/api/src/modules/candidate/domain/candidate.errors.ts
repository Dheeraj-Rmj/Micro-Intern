import { NotFoundError, ConflictError, ValidationError } from '@/shared/errors/AppError.js';

export class CandidateProfileNotFoundError extends NotFoundError {
  constructor(userId: string) {
    super('Candidate profile', userId);
    this.name = 'CandidateProfileNotFoundError';
  }
}

export class CandidateProfileConflictError extends ConflictError {
  constructor(message = 'Profile has been modified by another process. Please refresh and try again.') {
    super(message);
    this.name = 'CandidateProfileConflictError';
  }
}

export class InvalidFileTypeError extends ValidationError {
  constructor(allowedTypes: string[]) {
    super(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
    this.name = 'InvalidFileTypeError';
  }
}

export class FileTooLargeError extends ValidationError {
  constructor(maxSizeMb: number) {
    super(`File too large. Maximum size is ${maxSizeMb}MB.`);
    this.name = 'FileTooLargeError';
  }
}
