import { Request, Response, NextFunction } from 'express';
import { OnboardingUseCase } from '../application/use-cases/onboarding.usecase.js';
import { prisma } from '@/core/database.js';

const onboardingUseCase = new OnboardingUseCase(prisma);

export class OnboardingController {
  
  generateUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const superAdminId = req.user?.id;
      if (!superAdminId) throw new Error('Unauthorized');

      const token = await onboardingUseCase.generateUrl(superAdminId);
      
      res.json({
        success: true,
        data: {
          token,
          url: `${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/onboarding/${token}`
        }
      });
    } catch (error) {
      next(error);
    }
  };

  validateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.params['token'] as string;
      const onboarding = await onboardingUseCase.validateToken(token);
      
      res.json({
        success: true,
        data: onboarding
      });
    } catch (error) {
      next(error);
    }
  };

  submitData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.params['token'] as string;
      // Fixed size validation is expected to happen before calling usecase, 
      // or inside it. Frontend handles it primarily, backend can reject if needed.
      const data = req.body;
      const updated = await onboardingUseCase.submitData(token, data);
      
      res.json({
        success: true,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };

  approveSubmission = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params['id'] as string;
      const result = await onboardingUseCase.approveSubmission(id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getAllOnboardings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const onboardings = await onboardingUseCase.getAllOnboardings();
      res.json({
        success: true,
        data: onboardings
      });
    } catch (error) {
      next(error);
    }
  };
}

export const onboardingController = new OnboardingController();
