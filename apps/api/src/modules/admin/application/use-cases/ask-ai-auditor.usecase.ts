import { createModuleLogger } from "@/core/logger.js";
import type { IAdminRepository } from "../ports/IAdminRepository.js";
import { createAIGateway } from "@/infrastructure/ai/index.js";

const log = createModuleLogger("AskAIAuditorUseCase");

export class AskAIAuditorUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(prompt: string): Promise<string> {
    log.info("Processing AI Auditor query");
    
    // Fetch recent audit logs (up to 100) for context
    const recentLogs = await this.adminRepository.listAuditLogs({});
    const logsContext = recentLogs.slice(0, 100).map(log => {
      return `[${log.createdAt.toISOString()}] Action: ${log.action} | Actor: ${log.actor?.email || 'System'} | Target: ${log.entityType} (${log.entityId})`;
    }).join("\n");

    const systemPrompt = `You are the MicroIntern Super Admin AI Auditor. 
Your job is to analyze system history and accountability based on the provided audit logs and answer the Super Admin's queries accurately.
Do not hallucinate data. If the answer is not in the logs, state that you do not have enough information.
Output your response in clean Markdown.

Recent Audit Logs:
${logsContext || 'No recent logs available.'}`;

    const gateway = createAIGateway();
    const result = await gateway.complete({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.2, // Low temp for factual accuracy
    });

    return result.content;
  }
}
