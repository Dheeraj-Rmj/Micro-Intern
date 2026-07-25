import { UpdateCandidateGraphSchema } from '@microintern/shared';

import type { GetProfileUseCase } from '../application/use-cases/get-profile.usecase.js';
import type { GetResumeUrlUseCase } from '../application/use-cases/get-resume-url.usecase.js';
import type { UpdateProfileUseCase } from '../application/use-cases/update-profile.usecase.js';
import type { UploadAvatarUseCase } from '../application/use-cases/upload-avatar.usecase.js';
import type { UploadResumeUseCase } from '../application/use-cases/upload-resume.usecase.js';
import type { Request, Response } from 'express';


export class CandidateController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly uploadAvatarUseCase: UploadAvatarUseCase,
    private readonly uploadResumeUseCase: UploadResumeUseCase,
    private readonly getResumeUrlUseCase: GetResumeUrlUseCase
  ) {}

  /**
   * GET /api/v1/candidates/me
   */
  getProfile = async (req: Request, res: Response) => {
    // req.user is guaranteed to be set by auth.middleware.ts
    const userId = req.user?.id as string;
    const profile = await this.getProfileUseCase.execute(userId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  };

  /**
   * PUT /api/v1/candidates/me
   */
  updateProfile = async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const parsedData = UpdateCandidateGraphSchema.parse(req.body);
    const updatedProfile = await this.updateProfileUseCase.execute(userId, parsedData);

    res.status(200).json({
      success: true,
      data: updatedProfile,
    });
  };

  /**
   * POST /api/v1/candidates/me/avatar
   */
  uploadAvatar = async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const result = await this.uploadAvatarUseCase.execute(userId, file);

    res.status(200).json({
      success: true,
      data: result,
    });
  };

  /**
   * POST /api/v1/candidates/me/resume
   */
  uploadResume = async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const result = await this.uploadResumeUseCase.execute(userId, file);

    res.status(200).json({
      success: true,
      data: result,
    });
  };

  /**
   * GET /api/v1/candidates/me/resume
   */
  getResumeUrl = async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const result = await this.getResumeUrlUseCase.execute(userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  };
}
