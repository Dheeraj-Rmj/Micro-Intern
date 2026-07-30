import { prisma } from '@/core/database.js';
import { createModuleLogger } from '@/core/logger.js';

const log = createModuleLogger('SearchService');

export type SearchEntityType =
  | 'ASSESSMENT'
  | 'TEMPLATE'
  | 'COMPETENCY'
  | 'SKILL'
  | 'COMPANY'
  | 'RESOURCE';

export interface ISearchQuery {
  query: string;
  entityTypes?: SearchEntityType[];
  companyId?: string;
  page?: number;
  limit?: number;
}

export interface ISearchResultItem {
  id: string;
  entityType: SearchEntityType;
  title: string;
  description?: string;
  tags?: string[];
  url?: string;
  metadata?: Record<string, any>;
}

export interface ISearchService {
  search(query: ISearchQuery): Promise<{ results: ISearchResultItem[]; total: number }>;
}

/**
 * PostgreSQL adapter implementation of `ISearchService`.
 * Abstracted interface allows future zero-breaking drop-in replacement with OpenSearch,
 * Meilisearch, or Elasticsearch.
 */
export class PostgresSearchService implements ISearchService {
  public async search(query: ISearchQuery): Promise<{ results: ISearchResultItem[]; total: number }> {
    const q = query.query?.trim().toLowerCase() || '';
    const entityTypes = query.entityTypes || [
      'ASSESSMENT',
      'TEMPLATE',
      'COMPETENCY',
      'SKILL',
      'RESOURCE',
    ];
    const limit = query.limit || 20;

    const results: ISearchResultItem[] = [];

    try {
      // 1. Search Assessments
      if (entityTypes.includes('ASSESSMENT')) {
        const assessments = await prisma.assessment.findMany({
          where: {
            deletedAt: null,
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { roleTitle: { contains: q, mode: 'insensitive' } },
            ],
            ...(query.companyId ? { companyId: query.companyId } : {}),
          },
          take: limit,
        });

        for (const t of assessments) {
          results.push({
            id: t.id,
            entityType: 'ASSESSMENT',
            title: t.title,
            description: t.description || undefined,
            tags: t.skillsRequired || [],
            url: `/assessments/${t.id}`,
            metadata: {
              status: t.status,
              roleTitle: t.roleTitle,
              durationMinutes: t.durationMinutes,
            },
          });
        }
      }

      // 2. Search Templates
      if (entityTypes.includes('TEMPLATE')) {
        const templates = await prisma.assessmentTemplate.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: limit,
        });

        for (const tmpl of templates) {
          results.push({
            id: tmpl.id,
            entityType: 'TEMPLATE',
            title: tmpl.title,
            description: tmpl.description,
            tags: [tmpl.category],
            metadata: { isGlobal: tmpl.isGlobal },
          });
        }
      }

      // 3. Search Competencies
      if (entityTypes.includes('COMPETENCY')) {
        const competencies = await prisma.competency.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: limit,
        });

        for (const comp of competencies) {
          results.push({
            id: comp.id,
            entityType: 'COMPETENCY',
            title: comp.name,
            description: comp.description,
            tags: [comp.category],
          });
        }
      }

      // 4. Search Skills
      if (entityTypes.includes('SKILL')) {
        const skills = await prisma.skillTaxonomy.findMany({
          where: {
            name: { contains: q, mode: 'insensitive' },
          },
          take: limit,
        });

        for (const sk of skills) {
          results.push({
            id: sk.id,
            entityType: 'SKILL',
            title: sk.name,
            tags: [sk.category],
            metadata: { difficulty: sk.difficulty },
          });
        }
      }

      // 5. Search Resource Library Items
      if (entityTypes.includes('RESOURCE')) {
        const resources = await prisma.resourceLibraryItem.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
            ...(query.companyId ? { companyId: query.companyId } : {}),
          },
          take: limit,
        });

        for (const res of resources) {
          results.push({
            id: res.id,
            entityType: 'RESOURCE',
            title: res.title,
            description: res.description || undefined,
            url: res.url,
            metadata: { resourceType: res.resourceType },
          });
        }
      }

      return {
        results: results.slice(0, limit),
        total: results.length,
      };
    } catch (err) {
      log.error({ err, query }, 'Failed to execute database search query');
      return { results: [], total: 0 };
    }
  }
}

export const searchService = new PostgresSearchService();
