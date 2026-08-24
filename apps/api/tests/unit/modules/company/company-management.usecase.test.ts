import { StorageBucket } from "@microintern/shared";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { GetContextCompanyUseCase } from "@/modules/company/application/use-cases/get-context-company.usecase.js";
import { UpdateCompanyUseCase } from "@/modules/company/application/use-cases/update-company.usecase.js";
import { UploadLogoUseCase } from "@/modules/company/application/use-cases/upload-logo.usecase.js";
import {
  CompanyNotFoundError,
  NotCompanyOwnerError,
  InvalidFileTypeError,
  FileTooLargeError,
} from "@/modules/company/domain/errors/company.errors.js";

describe("Company Management & Branding Use Cases", () => {
  let mockRepo: any;
  let mockStorage: any;

  // Minimal valid transparent 1x1 PNG for Sharp testing without decoding failures
  const validPngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    "base64",
  );

  beforeEach(() => {
    mockRepo = {
      findByUserId: vi.fn(),
      findMember: vi.fn(),
      update: vi.fn().mockResolvedValue({ id: "comp-1", name: "Updated Name" }),
      updateLogo: vi.fn().mockResolvedValue({}),
    };
    mockStorage = {
      upload: vi
        .fn()
        .mockResolvedValue({ url: "https://storage.example.com/logos/comp-1/logo_v1000.webp" }),
    };
  });

  describe("GetContextCompanyUseCase", () => {
    it("should throw CompanyNotFoundError if user does not belong to any company", async () => {
      const useCase = new GetContextCompanyUseCase(mockRepo);
      mockRepo.findByUserId.mockResolvedValue(null);
      await expect(useCase.execute("user-no-company")).rejects.toThrow(CompanyNotFoundError);
    });

    it("should return context company when user is linked as a member or owner", async () => {
      const useCase = new GetContextCompanyUseCase(mockRepo);
      const company = { id: "comp-1", name: "Test Corp" };
      mockRepo.findByUserId.mockResolvedValue(company);
      const res = await useCase.execute("user-1");
      expect(res).toEqual(company);
    });
  });

  describe("UpdateCompanyUseCase", () => {
    it("should throw NotCompanyOwnerError when a non-owner attempts to update company configuration", async () => {
      const useCase = new UpdateCompanyUseCase(mockRepo);
      mockRepo.findByUserId.mockResolvedValue({ id: "comp-1" });
      mockRepo.findMember.mockResolvedValue({ isOwner: () => false }); // Recruiter, not owner

      await expect(
        useCase.execute("user-recruiter", { name: "Hacked Name" } as any),
      ).rejects.toThrow(NotCompanyOwnerError);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it("should execute update cleanly when user is verified as COMPANY_OWNER", async () => {
      const useCase = new UpdateCompanyUseCase(mockRepo);
      mockRepo.findByUserId.mockResolvedValue({ id: "comp-1" });
      mockRepo.findMember.mockResolvedValue({ isOwner: () => true });

      const res = await useCase.execute("user-owner", { name: "New Name" });
      expect(res).toEqual({ id: "comp-1", name: "Updated Name" });
      expect(mockRepo.update).toHaveBeenCalledWith("comp-1", { name: "New Name" });
    });
  });

  describe("UploadLogoUseCase", () => {
    it("should throw InvalidFileTypeError for prohibited MIME types (e.g., application/pdf)", async () => {
      const useCase = new UploadLogoUseCase(mockRepo, mockStorage);
      const file: any = { mimetype: "application/pdf", size: 1024, buffer: Buffer.from("test") };
      await expect(useCase.execute("user-1", file)).rejects.toThrow(InvalidFileTypeError);
    });

    it("should throw FileTooLargeError if branding logo file exceeds 5MB size ceiling", async () => {
      const useCase = new UploadLogoUseCase(mockRepo, mockStorage);
      const file: any = { mimetype: "image/png", size: 6 * 1024 * 1024, buffer: validPngBuffer };
      await expect(useCase.execute("user-1", file)).rejects.toThrow(FileTooLargeError);
    });

    it("should process logo via Sharp to WebP, upload to PUBLIC bucket, and record url in DB", async () => {
      const useCase = new UploadLogoUseCase(mockRepo, mockStorage);
      mockRepo.findByUserId.mockResolvedValue({ id: "comp-1" });
      mockRepo.findMember.mockResolvedValue({ isOwner: () => true });

      const file: any = { mimetype: "image/png", size: 2048, buffer: validPngBuffer };
      const res = await useCase.execute("user-owner", file);

      expect(res.url).toBe("https://storage.example.com/logos/comp-1/logo_v1000.webp");
      expect(mockStorage.upload).toHaveBeenCalledWith({
        key: expect.stringMatching(/^logos\/comp-1\/logo_v\d+\.webp$/),
        data: expect.any(Buffer),
        mimeType: "image/webp",
        bucket: StorageBucket.PUBLIC,
        metadata: { "x-amz-meta-company-id": "comp-1" },
      });
      expect(mockRepo.updateLogo).toHaveBeenCalledWith("comp-1", res.url);
    });

    it("should preserve image/svg+xml logos natively without Sharp conversion to retain scalability", async () => {
      const useCase = new UploadLogoUseCase(mockRepo, mockStorage);
      mockRepo.findByUserId.mockResolvedValue({ id: "comp-1" });
      mockRepo.findMember.mockResolvedValue({ isOwner: () => true });

      const svgContent = Buffer.from("<svg></svg>");
      const file: any = { mimetype: "image/svg+xml", size: 512, buffer: svgContent };
      const res = await useCase.execute("user-owner", file);

      expect(mockStorage.upload).toHaveBeenCalledWith({
        key: expect.stringMatching(/^logos\/comp-1\/logo_v\d+\.svg$/),
        data: svgContent, // Exactly unaltered buffer
        mimeType: "image/svg+xml",
        bucket: StorageBucket.PUBLIC,
        metadata: { "x-amz-meta-company-id": "comp-1" },
      });
    });
  });
});
