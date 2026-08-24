import { describe, it, expect, vi, beforeEach } from "vitest";

import { AdminController } from "@/modules/admin/presentation/admin.controller.js";
import { ResponseFormatter } from "@/shared/response/ResponseFormatter.js";

import type { Request, Response, NextFunction } from "express";

describe("AdminController", () => {
  let controller: AdminController;
  let mockGetPlatformStatsUseCase: any;
  let mockListPendingCompaniesUseCase: any;
  let mockVerifyCompanyUseCase: any;
  let mockSuspendUserUseCase: any;

  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    mockGetPlatformStatsUseCase = {
      execute: vi.fn().mockResolvedValue({ users: { total: 10 }, aiUsage: { passRate: 75 } }),
    };
    mockListPendingCompaniesUseCase = {
      execute: vi.fn().mockResolvedValue([{ id: "comp-1", name: "Pending Co" }]),
    };
    mockVerifyCompanyUseCase = {
      execute: vi.fn().mockResolvedValue({ id: "comp-1", status: "ACTIVE" }),
    };
    mockSuspendUserUseCase = {
      execute: vi.fn().mockResolvedValue({ id: "usr-bad", status: "SUSPENDED" }),
    };

    controller = new AdminController(
      mockGetPlatformStatsUseCase,
      mockListPendingCompaniesUseCase,
      mockVerifyCompanyUseCase,
      mockSuspendUserUseCase,
    );

    req = {
      user: { id: "admin-user-id", role: "ADMIN" } as any,
      params: { id: "comp-or-usr-id" },
    };

    const statusFn = vi.fn().mockReturnThis();
    const jsonFn = vi.fn().mockReturnThis();
    res = {
      status: statusFn,
      json: jsonFn,
      req: { id: "req-uuid" } as any,
    } as any;

    next = vi.fn();

    vi.spyOn(ResponseFormatter, "success");
  });

  describe("getStats", () => {
    it("should retrieve aggregate monitoring statistics and return 200 Success", async () => {
      await controller.getStats(req as Request, res as Response, next);

      expect(mockGetPlatformStatsUseCase.execute).toHaveBeenCalledOnce();
      expect(ResponseFormatter.success).toHaveBeenCalledWith(
        res,
        expect.objectContaining({ users: { total: 10 } }),
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("listPendingCompanies", () => {
    it("should list unverified employer companies and return 200 Success", async () => {
      await controller.listPendingCompanies(req as Request, res as Response, next);

      expect(mockListPendingCompaniesUseCase.execute).toHaveBeenCalledOnce();
      expect(ResponseFormatter.success).toHaveBeenCalledWith(
        res,
        expect.arrayContaining([expect.objectContaining({ id: "comp-1" })]),
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("verifyCompany", () => {
    it("should approve company verification and return 200 Success", async () => {
      await controller.verifyCompany(req as Request, res as Response, next);

      expect(mockVerifyCompanyUseCase.execute).toHaveBeenCalledWith(
        "admin-user-id",
        "comp-or-usr-id",
      );
      expect(ResponseFormatter.success).toHaveBeenCalledWith(
        res,
        expect.objectContaining({ status: "ACTIVE" }),
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("suspendUser", () => {
    it("should block bad actor account and return 200 Success", async () => {
      await controller.suspendUser(req as Request, res as Response, next);

      expect(mockSuspendUserUseCase.execute).toHaveBeenCalledWith(
        "admin-user-id",
        "comp-or-usr-id",
      );
      expect(ResponseFormatter.success).toHaveBeenCalledWith(
        res,
        expect.objectContaining({ status: "SUSPENDED" }),
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
