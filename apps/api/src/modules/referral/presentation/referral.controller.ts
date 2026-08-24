import type { Request, Response, NextFunction } from "express";
import type { ReferralService } from "../application/ReferralService.js";

export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  generateCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id as string;
      const result = await this.referralService.generateReferralCode(userId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  trackConversion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const success = await this.referralService.trackConversion(
        req.body.referralCode,
        req.body.refereeId,
      );
      res.status(200).json({ success, data: { converted: success } });
    } catch (err) {
      next(err);
    }
  };

  myReferrals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id as string;
      const referrals = await this.referralService.getUserReferrals(userId);
      res.status(200).json({ success: true, data: referrals });
    } catch (err) {
      next(err);
    }
  };

  myStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id as string;
      const stats = await this.referralService.getReferralStats(userId);
      res.status(200).json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  };
}
