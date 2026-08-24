import { EntityStatus } from "@microintern/shared";
import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  VerifyCompanyUseCase,
  ListPendingCompaniesUseCase,
} from "@/modules/admin/application/index.js";
import {
  AdminCompanyNotFoundError,
  CompanyAlreadyVerifiedError,
} from "@/modules/admin/domain/index.js";
import { eventBus, DOMAIN_EVENTS } from "@/shared/events/EventBus.js";

import type { IAdminRepository } from "@/modules/admin/application/index.js";

describe("VerifyCompany & ListPendingCompanies Use Cases", () => {
  let verifyUseCase: VerifyCompanyUseCase;
  let listUseCase: ListPendingCompaniesUseCase;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      getPlatformStatsProps: vi.fn(),
      findCompanyById: vi.fn(),
      updateCompanyStatus: vi.fn(),
      listPendingCompanies: vi.fn(),
      findUserById: vi.fn(),
      updateUserStatus: vi.fn(),
    };

    verifyUseCase = new VerifyCompanyUseCase(mockRepository);
    listUseCase = new ListPendingCompaniesUseCase(mockRepository);

    vi.spyOn(eventBus, "emit");
  });

  describe("VerifyCompanyUseCase", () => {
    it("should throw AdminCompanyNotFoundError if company ID does not exist", async () => {
      mockRepository.findCompanyById.mockResolvedValue(null);
      await expect(verifyUseCase.execute("admin-1", "comp-not-found")).rejects.toThrow(
        AdminCompanyNotFoundError,
      );
    });

    it("should throw CompanyAlreadyVerifiedError if company is already ACTIVE", async () => {
      mockRepository.findCompanyById.mockResolvedValue({
        id: "comp-100",
        name: "Acme Corp",
        slug: "acme-corp",
        status: EntityStatus.ACTIVE,
        createdAt: new Date(),
      });

      await expect(verifyUseCase.execute("admin-1", "comp-100")).rejects.toThrow(
        CompanyAlreadyVerifiedError,
      );
    });

    it("should update company status to ACTIVE and emit COMPANY_VERIFIED domain event", async () => {
      mockRepository.findCompanyById.mockResolvedValue({
        id: "comp-100",
        name: "Acme Corp",
        slug: "acme-corp",
        status: EntityStatus.PENDING_VERIFICATION,
        createdAt: new Date(),
      });
      mockRepository.updateCompanyStatus.mockResolvedValue({
        id: "comp-100",
        name: "Acme Corp",
        slug: "acme-corp",
        status: EntityStatus.ACTIVE,
        createdAt: new Date(),
      });

      const res = await verifyUseCase.execute("admin-1", "comp-100");

      expect(mockRepository.updateCompanyStatus).toHaveBeenCalledWith(
        "comp-100",
        EntityStatus.ACTIVE,
      );
      expect(eventBus.emit).toHaveBeenCalledWith(DOMAIN_EVENTS.COMPANY_VERIFIED, {
        companyId: "comp-100",
        companyName: "Acme Corp",
        verifiedBy: "admin-1",
      });
      expect(res.status).toBe(EntityStatus.ACTIVE);
    });
  });

  describe("ListPendingCompaniesUseCase", () => {
    it("should list all companies waiting for verification in repository", async () => {
      const pending = [
        {
          id: "comp-1",
          name: "A",
          slug: "a",
          status: EntityStatus.PENDING_VERIFICATION,
          createdAt: new Date(),
        },
      ];
      mockRepository.listPendingCompanies.mockResolvedValue(pending);

      const result = await listUseCase.execute();

      expect(mockRepository.listPendingCompanies).toHaveBeenCalledOnce();
      expect(result).toEqual(pending);
    });
  });
});
