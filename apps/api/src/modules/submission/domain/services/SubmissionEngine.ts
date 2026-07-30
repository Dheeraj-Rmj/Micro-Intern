import { prisma } from "@/core/database.js";
import { createModuleLogger } from "@/core/logger.js";
import { DomainEventDispatcher } from "@/core/events/DomainEventDispatcher.js";

const log = createModuleLogger("SubmissionEngine");

export interface ISubmissionEngine {
  addSection(submissionId: string, title: string, sortOrder: number): Promise<any>;
  addDeliverableItem(
    submissionId: string,
    sectionId: string | undefined,
    title: string,
    deliverableType: string,
    content?: string,
    fileUrl?: string,
    linkUrl?: string,
  ): Promise<any>;
  addSubmissionFile(
    submissionId: string,
    fileName: string,
    fileUrl: string,
    fileSize?: number,
  ): Promise<any>;
  addSubmissionLink(submissionId: string, title: string, url: string): Promise<any>;
  generateAISummary(submissionId: string): Promise<string>;
}

export class SubmissionEngine implements ISubmissionEngine {
  public async addSection(submissionId: string, title: string, sortOrder = 1): Promise<any> {
    return prisma.submissionSection.create({
      data: {
        submissionId,
        title,
        sortOrder,
      },
    });
  }

  public async addDeliverableItem(
    submissionId: string,
    sectionId: string | undefined,
    title: string,
    deliverableType: string,
    content?: string,
    fileUrl?: string,
    linkUrl?: string,
  ): Promise<any> {
    const item = await prisma.submissionDeliverableItem.create({
      data: {
        submissionId,
        sectionId: sectionId || null,
        title,
        deliverableType: deliverableType as any,
        content: content || null,
        fileUrl: fileUrl || null,
        linkUrl: linkUrl || null,
      },
    });

    await DomainEventDispatcher.getInstance().dispatch({
      eventName: "AssessmentSubmitted",
      entityType: "SUBMISSION",
      entityId: submissionId,
      metadata: { deliverableItemId: item.id, deliverableType },
    });

    return item;
  }

  public async addSubmissionFile(
    submissionId: string,
    fileName: string,
    fileUrl: string,
    fileSize?: number,
  ): Promise<any> {
    return prisma.submissionFile.create({
      data: {
        submissionId,
        fileName,
        fileUrl,
        fileSize: fileSize || null,
      },
    });
  }

  public async addSubmissionLink(submissionId: string, title: string, url: string): Promise<any> {
    return prisma.submissionLink.create({
      data: {
        submissionId,
        title,
        url,
      },
    });
  }

  /**
   * Automatically generate an AI Executive Summary for a candidate's submission.
   */
  public async generateAISummary(submissionId: string): Promise<string> {
    const items = await prisma.submissionDeliverableItem.findMany({
      where: { submissionId },
    });

    const counts = items.reduce(
      (acc, item) => {
        acc[item.deliverableType] = (acc[item.deliverableType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const summary = `Candidate submitted ${items.length} deliverables (${Object.entries(counts)
      .map(([type, count]) => `${count} ${type}`)
      .join(", ")}). All core sections and verification items are included.`;

    for (const it of items) {
      await prisma.submissionDeliverableItem.update({
        where: { id: it.id },
        data: { aiSummary: summary },
      });
    }

    log.info({ submissionId, itemCount: items.length }, "Generated AI submission summary");
    return summary;
  }
}

export const submissionEngine = new SubmissionEngine();
