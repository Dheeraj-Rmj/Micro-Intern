import { AppError } from '@/shared/errors/AppError.js';

export class AdminUserNotFoundError extends AppError {
  constructor(userId: string) {
    super({ code: 'ADMIN_USER_NOT_FOUND' as any, message: `User with ID ${userId} was not found`, statusCode: 404 });
  }
}

export class AdminCompanyNotFoundError extends AppError {
  constructor(companyId: string) {
    super({ code: 'ADMIN_COMPANY_NOT_FOUND' as any, message: `Company with ID ${companyId} was not found`, statusCode: 404 });
  }
}

export class CompanyAlreadyVerifiedError extends AppError {
  constructor(companyId: string) {
    super({ code: 'COMPANY_ALREADY_VERIFIED' as any, message: `Company with ID ${companyId} is already verified and active`, statusCode: 400 });
  }
}

export class UserAlreadySuspendedError extends AppError {
  constructor(userId: string) {
    super({ code: 'USER_ALREADY_SUSPENDED' as any, message: `User with ID ${userId} is already suspended`, statusCode: 400 });
  }
}

export class CannotSuspendAdminError extends AppError {
  constructor(userId: string) {
    super({ code: 'CANNOT_SUSPEND_ADMIN' as any, message: `Cannot suspend administrator account with ID ${userId}`, statusCode: 400 });
  }
}
