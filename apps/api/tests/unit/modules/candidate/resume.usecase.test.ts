import { StorageBucket } from "@microintern/shared";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { GetResumeUrlUseCase } from "@/modules/candidate/application/use-cases/get-resume-url.usecase.js";
import { UploadResumeUseCase } from "@/modules/candidate/application/use-cases/upload-resume.usecase.js";
import {
  InvalidFileTypeError,
  FileTooLargeError,
  CandidateProfileNotFoundError,
} from "@/modules/candidate/domain/candidate.errors.js";

describe("Candidate Resume Use Cases", () => {
  let mockDb: any;
  let mockStorage: any;
  let mockCalcCompletion: any;
  let mockQueue: any;

  beforeEach(() => {
    mockDb = {
      candidateProfile: { findUnique: vi.fn() },
      $transaction: vi.fn(async (cb) => cb(mockTx)),
    };
    mockStorage = {
      upload: vi
        .fn()
        .mockResolvedValue({ url: "https://storage.example.com/private/resumes/resume.pdf" }),
      getSignedDownloadUrl: vi
        .fn()
        .mockResolvedValue({ url: "https://signed.example.com/resume.pdf?token=123" }),
    };
    mockCalcCompletion = { execute: vi.fn().mockResolvedValue(80) };
    mockQueue = { add: vi.fn().mockResolvedValue({}) };
  });

  const mockTx: any = {
    candidateProfile: { update: vi.fn().mockResolvedValue({}) },
    auditLog: { create: vi.fn().mockResolvedValue({}) },
  };

  describe("UploadResumeUseCase", () => {
    it("should reject non-PDF/DOCX file types (e.g. image/png)", async () => {
      const useCase = new UploadResumeUseCase(mockDb, mockStorage, mockCalcCompletion, mockQueue);
      const file: any = { mimetype: "image/png", size: 1024, buffer: Buffer.from("data") };
      await expect(useCase.execute("user-1", file)).rejects.toThrow(InvalidFileTypeError);
    });

    it("should reject resume exceeding 10MB max file size limit", async () => {
      const useCase = new UploadResumeUseCase(mockDb, mockStorage, mockCalcCompletion, mockQueue);
      const file: any = {
        mimetype: "application/pdf",
        size: 11 * 1024 * 1024,
        buffer: Buffer.from("data"),
      };
      await expect(useCase.execute("user-1", file)).rejects.toThrow(FileTooLargeError);
    });

    it("should upload resume to PRIVATE bucket, update database, and queue job for AI parsing", async () => {
      const useCase = new UploadResumeUseCase(mockDb, mockStorage, mockCalcCompletion, mockQueue);
      mockDb.candidateProfile.findUnique.mockResolvedValue({ id: "prof-1" });
      const file: any = {
        mimetype: "application/pdf",
        size: 2048,
        buffer: Buffer.from("pdf content"),
      };

      const res = await useCase.execute("user-1", file);
      expect(res.status).toBe("PENDING_PARSE");
      expect(mockStorage.upload).toHaveBeenCalledWith({
        key: expect.stringMatching(/^resumes\/prof-1\/resume_v\d+\.pdf$/),
        data: file.buffer,
        mimeType: "application/pdf",
        bucket: StorageBucket.PRIVATE,
        metadata: { "x-amz-meta-candidate-id": "prof-1" },
      });
      expect(mockQueue.add).toHaveBeenCalledWith(
        "parse-resume",
        { candidateId: "prof-1", resumeKey: expect.any(String) },
        expect.any(Object),
      );
      expect(mockTx.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("GetResumeUrlUseCase", () => {
    it("should throw error if resume has not been uploaded yet", async () => {
      const useCase = new GetResumeUrlUseCase(mockDb, mockStorage);
      mockDb.candidateProfile.findUnique.mockResolvedValue({ resumeUrl: null });
      await expect(useCase.execute("user-1")).rejects.toThrow("Resume not uploaded");
    });

    it("should generate a 15-minute signed S3 download URL from PRIVATE bucket", async () => {
      const useCase = new GetResumeUrlUseCase(mockDb, mockStorage);
      mockDb.candidateProfile.findUnique.mockResolvedValue({
        resumeUrl: "resumes/prof-1/resume_v1000.pdf",
      });

      const res = await useCase.execute("user-1");
      expect(res.url).toContain("signed.example.com/resume.pdf");
      expect(mockStorage.getSignedDownloadUrl).toHaveBeenCalledWith(
        "resumes/prof-1/resume_v1000.pdf",
        StorageBucket.PRIVATE,
        900,
      );
    });
  });
});
