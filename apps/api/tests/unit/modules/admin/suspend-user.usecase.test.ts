import { EntityStatus, Role } from "@microintern/shared";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { SuspendUserUseCase } from "@/modules/admin/application/index.js";
import {
  AdminUserNotFoundError,
  UserAlreadySuspendedError,
  CannotSuspendAdminError,
} from "@/modules/admin/domain/index.js";
import { eventBus, DOMAIN_EVENTS } from "@/shared/events/EventBus.js";

import type { IAdminRepository } from "@/modules/admin/application/index.js";
import type { ISessionService } from "@/modules/auth/application/interfaces/ISessionService.js";

describe("SuspendUserUseCase", () => {
  let useCase: SuspendUserUseCase;
  let mockRepository: any;
  let mockSessionService: any;

  beforeEach(() => {
    mockRepository = {
      getPlatformStatsProps: vi.fn(),
      findCompanyById: vi.fn(),
      updateCompanyStatus: vi.fn(),
      listPendingCompanies: vi.fn(),
      findUserById: vi.fn(),
      updateUserStatus: vi.fn(),
    };

    mockSessionService = {
      createSession: vi.fn(),
      isSessionValid: vi.fn(),
      revokeSession: vi.fn(),
      revokeAllSessions: vi.fn().mockResolvedValue(undefined),
    };

    useCase = new SuspendUserUseCase(mockRepository, mockSessionService);

    vi.spyOn(eventBus, "emit");
  });

  it("should throw AdminUserNotFoundError if user ID does not exist", async () => {
    mockRepository.findUserById.mockResolvedValue(null);
    await expect(useCase.execute("admin-1", "user-not-found")).rejects.toThrow(
      AdminUserNotFoundError,
    );
  });

  it("should throw CannotSuspendAdminError if target user has ADMIN or SUPER_ADMIN role", async () => {
    mockRepository.findUserById.mockResolvedValue({
      id: "admin-2",
      email: "admin2@microintern.com",
      role: Role.ADMIN,
      status: EntityStatus.ACTIVE,
    });

    await expect(useCase.execute("admin-1", "admin-2")).rejects.toThrow(CannotSuspendAdminError);
    expect(mockSessionService.revokeAllSessions).not.toHaveBeenCalled();
  });

  it("should throw UserAlreadySuspendedError if user is already suspended", async () => {
    mockRepository.findUserById.mockResolvedValue({
      id: "bad-actor",
      email: "bad@spam.com",
      role: Role.CANDIDATE,
      status: EntityStatus.SUSPENDED,
    });

    await expect(useCase.execute("admin-1", "bad-actor")).rejects.toThrow(
      UserAlreadySuspendedError,
    );
    expect(mockSessionService.revokeAllSessions).not.toHaveBeenCalled();
  });

  it("should update user status to SUSPENDED, invoke revokeAllSessions in Redis immediately, and emit USER_SUSPENDED", async () => {
    mockRepository.findUserById.mockResolvedValue({
      id: "bad-actor",
      email: "bad@spam.com",
      role: Role.CANDIDATE,
      status: EntityStatus.ACTIVE,
    });
    mockRepository.updateUserStatus.mockResolvedValue({
      id: "bad-actor",
      email: "bad@spam.com",
      role: Role.CANDIDATE,
      status: EntityStatus.SUSPENDED,
    });

    const result = await useCase.execute("admin-1", "bad-actor");

    expect(mockRepository.updateUserStatus).toHaveBeenCalledWith(
      "bad-actor",
      EntityStatus.SUSPENDED,
    );
    expect(mockSessionService.revokeAllSessions).toHaveBeenCalledWith("bad-actor");
    expect(eventBus.emit).toHaveBeenCalledWith(DOMAIN_EVENTS.USER_SUSPENDED, {
      userId: "bad-actor",
      email: "bad@spam.com",
      suspendedBy: "admin-1",
    });
    expect(result.status).toBe(EntityStatus.SUSPENDED);
  });
});
