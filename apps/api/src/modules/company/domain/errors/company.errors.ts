import { NotFoundError, ConflictError, ForbiddenError, ValidationError } from '@/shared/errors/index.js';

export class CompanyNotFoundError extends NotFoundError {
  constructor(identifier?: string) {
    super('Company', identifier);
    this.name = 'CompanyNotFoundError';
  }
}

export class CompanyAlreadyExistsError extends ConflictError {
  constructor(message = 'User already owns or belongs to an active company.') {
    super(message, 'COMPANY_ALREADY_EXISTS');
    this.name = 'CompanyAlreadyExistsError';
  }
}

export class NotCompanyOwnerError extends ForbiddenError {
  constructor(message = 'Only the company owner can perform this action.') {
    super(message, 'COMPANY_NOT_OWNER');
    this.name = 'NotCompanyOwnerError';
  }
}

export class MemberNotFoundError extends NotFoundError {
  constructor(userId?: string) {
    super('Company member', userId);
    this.name = 'MemberNotFoundError';
  }
}

export class MemberAlreadyExistsError extends ConflictError {
  constructor(email: string) {
    super(`User with email "${email}" is already a member or invited to this company.`, 'COMPANY_MEMBER_ALREADY_EXISTS');
    this.name = 'MemberAlreadyExistsError';
  }
}

export class CannotRemoveOwnerError extends ForbiddenError {
  constructor(message = 'Cannot remove the company owner from the team.') {
    super(message, 'COMPANY_CANNOT_REMOVE_OWNER');
    this.name = 'CannotRemoveOwnerError';
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
