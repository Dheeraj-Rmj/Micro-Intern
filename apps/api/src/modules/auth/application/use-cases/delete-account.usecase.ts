import { IUserRepository } from "../../domain/repositories/IUserRepository.js";

export class DeleteAccountUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Since session repository might be separate, we can let Prisma's cascading delete 
    // handle removing sessions, profile data, etc. if properly configured in schema,
    // or the controller can clear the user's session cookie.
    
    await this.userRepository.delete(userId);
  }
}
