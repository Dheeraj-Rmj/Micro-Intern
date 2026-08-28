import { createModuleLogger } from "@/core/logger.js";
import { AuthDomainError } from "@/shared/errors/DomainError.js";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";
import type { IPasswordService } from "../interfaces/IPasswordService.js";

const log = createModuleLogger("ChangePasswordUseCase");

export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
  ) {}

  async execute(userId: string, newPasswordPlain: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthDomainError("AUTH_INVALID_CREDENTIALS", "User not found");
    }

    const newPasswordHash = await this.passwordService.hash(newPasswordPlain);

    // Atomically update password and clear the force-change flag in a single DB write.
    // This prevents split-brain where the password is updated but the flag remains set.
    await this.userRepository.updatePasswordAndClearForceChange(userId, newPasswordHash);

    log.info({ userId }, "User password changed and forcePasswordChange cleared successfully");
  }
}
