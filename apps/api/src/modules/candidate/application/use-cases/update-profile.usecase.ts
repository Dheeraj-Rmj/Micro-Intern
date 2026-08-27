import { AuditAction } from "@microintern/shared";

import { createModuleLogger } from "@/core/logger.js";

import {
  CandidateProfileNotFoundError,
  CandidateProfileConflictError,
} from "../../domain/candidate.errors.js";

import type { CalculateCompletionUseCase } from "./calculate-completion.usecase.js";
import type { PrismaClient } from "@microintern/database";
import type { UpdateCandidateGraphDto } from "@microintern/shared";

const log = createModuleLogger("UpdateProfileUseCase");

export class UpdateProfileUseCase {
  constructor(
    private readonly db: PrismaClient,
    private readonly calculateCompletion: CalculateCompletionUseCase,
  ) {}

  /**
   * Updates a candidate profile and its relations, enforcing optimistic concurrency.
   */
  async execute(userId: string, data: UpdateCandidateGraphDto): Promise<any> {
    const { profile, skills, experiences, educations, certificates, socials, preferences } = data;

    const currentProfile = await this.db.candidateProfile.findUnique({
      where: { userId },
      select: { id: true, updatedAt: true },
    });

    if (!currentProfile) {
      throw new CandidateProfileNotFoundError(userId);
    }

    // Optimistic Concurrency Check
    if (profile.updatedAt !== null && profile.updatedAt !== undefined) {
      const clientUpdatedAt = new Date(profile.updatedAt).getTime();
      const serverUpdatedAt = new Date(currentProfile.updatedAt).getTime();

      // If the server has a newer version than what the client sent, abort to prevent overwrite.
      if (serverUpdatedAt > clientUpdatedAt) {
        log.warn(
          { userId, clientUpdatedAt, serverUpdatedAt },
          "Optimistic concurrency conflict detected",
        );
        throw new CandidateProfileConflictError();
      }
    }

    // Use a Prisma transaction to atomically update the entire graph
    const updatedProfile = await this.db.$transaction(async (tx) => {
      // 1. Update core profile fields
      const updated = await tx.candidateProfile.update({
        where: { id: currentProfile.id },
        data: {
          headline: profile.headline,
          bio: profile.bio,
          location: profile.location,
          yearsOfExperience: profile.yearsOfExperience,
          isOpenToWork: profile.isOpenToWork,
          isPublic: profile.isPublic,
        },
      });

      // 2. Full Replacement Strategy for relations (Soft Delete old, insert new)
      // This is simpler and less error-prone for nested forms than computing diffs.

      if (skills) {
        await tx.candidateSkill.updateMany({
          where: { candidateId: currentProfile.id, deletedAt: null },
          data: { deletedAt: new Date() },
        });
        if (skills.length > 0) {
          await tx.candidateSkill.createMany({
            data: skills.map((s) => ({
              candidateId: currentProfile.id,
              skill: s.skill,
              level: s.level,
            })),
          });
        }
      }

      if (experiences) {
        await tx.candidateExperience.updateMany({
          where: { candidateId: currentProfile.id, deletedAt: null },
          data: { deletedAt: new Date() },
        });
        if (experiences.length > 0) {
          await tx.candidateExperience.createMany({
            data: experiences.map((e) => ({
              candidateId: currentProfile.id,
              company: e.company,
              role: e.role,
              startDate: new Date(e.startDate),
              endDate: e.endDate !== null && e.endDate !== undefined ? new Date(e.endDate) : null,
              isCurrent: e.isCurrent,
              description: e.description,
            })),
          });
        }
      }

      if (educations) {
        await tx.candidateEducation.updateMany({
          where: { candidateId: currentProfile.id, deletedAt: null },
          data: { deletedAt: new Date() },
        });
        if (educations.length > 0) {
          await tx.candidateEducation.createMany({
            data: educations.map((e) => ({
              candidateId: currentProfile.id,
              institution: e.institution,
              degree: e.degree,
              fieldOfStudy: e.fieldOfStudy,
              startDate: new Date(e.startDate),
              endDate: e.endDate !== null && e.endDate !== undefined ? new Date(e.endDate) : null,
            })),
          });
        }
      }

      if (certificates) {
        await tx.candidateCertificate.updateMany({
          where: { candidateId: currentProfile.id, deletedAt: null },
          data: { deletedAt: new Date() },
        });
        if (certificates.length > 0) {
          await tx.candidateCertificate.createMany({
            data: certificates.map((c) => ({
              candidateId: currentProfile.id,
              name: c.name,
              issuer: c.issuer,
              issueDate: new Date(c.issueDate),
              expirationDate:
                c.expirationDate !== null && c.expirationDate !== undefined
                  ? new Date(c.expirationDate)
                  : null,
              url: c.url,
            })),
          });
        }
      }

      if (socials) {
        // Hard delete socials since they have a unique constraint on platform
        await tx.candidateSocial.deleteMany({
          where: { candidateId: currentProfile.id },
        });
        if (socials.length > 0) {
          await tx.candidateSocial.createMany({
            data: socials.map((s) => ({
              candidateId: currentProfile.id,
              platform: s.platform,
              url: s.url,
            })),
          });
        }
      }

      if (preferences) {
        await tx.candidatePreference.upsert({
          where: { candidateId: currentProfile.id },
          create: {
            candidateId: currentProfile.id,
            employmentType: preferences.employmentType,
            workMode: preferences.workMode,
            noticePeriod: preferences.noticePeriod,
            expectedSalary: preferences.expectedSalary,
          },
          update: {
            employmentType: preferences.employmentType,
            workMode: preferences.workMode,
            noticePeriod: preferences.noticePeriod,
            expectedSalary: preferences.expectedSalary,
          },
        });
      }

      // Audit Log for Timeline
      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: AuditAction.UPDATE,
          entityType: "CandidateProfile",
          entityId: currentProfile.id,
          metadata: { message: "Profile updated" },
        },
      });

      return updated;
    });

    // Recalculate completion async (no need to block response)
    void this.calculateCompletion.execute(userId).catch((err: unknown) => {
      log.error({ err, userId }, "Failed to recalculate profile completion");
    });

    return updatedProfile;
  }
}
