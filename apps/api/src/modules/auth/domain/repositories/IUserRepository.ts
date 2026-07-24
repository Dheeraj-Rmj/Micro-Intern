import type { User } from '../entities/User.entity.js';

/**
 * User Repository Interface — domain layer contract.
 *
 * The domain layer defines what data operations it needs.
 * Infrastructure provides the implementation (Prisma, in-memory, etc.).
 * This inversion makes domain logic testable without a database.
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  
  createCandidate(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }): Promise<User>;

  createCompanyOwner(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    companyName: string;
    companyWebsite?: string;
  }): Promise<User>;

  incrementLoginAttempts(userId: string): Promise<void>;
  resetLoginAttempts(userId: string): Promise<void>;
  lockAccount(userId: string, until: Date): Promise<void>;
  updateLastLogin(userId: string, ipAddress: string): Promise<void>;
  setEmailVerified(userId: string): Promise<void>;
  setPasswordHash(userId: string, passwordHash: string): Promise<void>;
  updateAvatar(userId: string, avatarUrl: string): Promise<void>;
}
