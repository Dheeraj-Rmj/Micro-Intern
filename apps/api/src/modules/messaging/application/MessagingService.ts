import { createModuleLogger } from "@/core/logger.js";
import type { PrismaClient } from "@microintern/database";

const log = createModuleLogger("MessagingService");

export type SendMessageDTO = {
  journeyId: string;
  senderId: string;
  senderRole: string;
  body: string;
};

export class MessagingService {
  constructor(private readonly db: PrismaClient) {}

  private async ensureThread(journeyId: string) {
    return this.db.messageThread.upsert({
      where: { journeyId },
      create: { journeyId },
      update: {},
    });
  }

  async sendMessage(dto: SendMessageDTO) {
    const thread = await this.ensureThread(dto.journeyId);
    const message = await this.db.message.create({
      data: {
        threadId: thread.id,
        senderId: dto.senderId,
        senderRole: dto.senderRole,
        body: dto.body,
      },
    });
    log.info({ journeyId: dto.journeyId, senderId: dto.senderId }, "Message sent");
    return message;
  }

  async getThread(journeyId: string) {
    const thread = await this.db.messageThread.findUnique({
      where: { journeyId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!thread) return { journeyId, messages: [] };
    return thread;
  }

  async markAsRead(journeyId: string, readerId: string) {
    const thread = await this.db.messageThread.findUnique({ where: { journeyId } });
    if (!thread) return;
    await this.db.message.updateMany({
      where: {
        threadId: thread.id,
        senderId: { not: readerId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });
    return { success: true };
  }

  async getUnreadCount(journeyId: string, userId: string): Promise<number> {
    const thread = await this.db.messageThread.findUnique({ where: { journeyId } });
    if (!thread) return 0;
    return this.db.message.count({
      where: {
        threadId: thread.id,
        senderId: { not: userId },
        readAt: null,
      },
    });
  }
}
