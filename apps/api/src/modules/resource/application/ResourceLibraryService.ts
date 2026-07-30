import { prisma } from "@/core/database.js";
import { createModuleLogger } from "@/core/logger.js";

const log = createModuleLogger("ResourceLibraryService");

export class ResourceLibraryService {
  public async listResources(companyId?: string, includeGlobal = true): Promise<any[]> {
    return prisma.resourceLibraryItem.findMany({
      where: {
        OR: [...(includeGlobal ? [{ isGlobal: true }] : []), ...(companyId ? [{ companyId }] : [])],
      },
      orderBy: { createdAt: "desc" },
    });
  }

  public async createResource(data: {
    companyId?: string;
    title: string;
    resourceType: string;
    url: string;
    description?: string;
    isGlobal?: boolean;
    metadata?: Record<string, any>;
  }): Promise<any> {
    const res = await prisma.resourceLibraryItem.create({
      data: {
        companyId: data.companyId || null,
        title: data.title,
        resourceType: data.resourceType as any,
        url: data.url,
        description: data.description || null,
        isGlobal: data.isGlobal ?? false,
        metadata: data.metadata || {},
      },
    });
    log.info({ id: res.id, type: res.resourceType }, "Created reusable resource library item");
    return res;
  }

  public async deleteResource(resourceId: string): Promise<void> {
    await prisma.resourceLibraryItem.delete({
      where: { id: resourceId },
    });
  }
}

export const resourceLibraryService = new ResourceLibraryService();
