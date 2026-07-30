import type { Request, Response, NextFunction } from 'express';
import type { InterviewService } from '../application/InterviewService.js';

export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  createInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorCompanyId = (req as any).user?.companyId || req.body.companyId;
      const interview = await this.interviewService.createInterview({
        ...req.body,
        companyId: actorCompanyId,
      });
      res.status(201).json({ success: true, data: interview });
    } catch (err) { next(err); }
  };

  publishInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const interview = await this.interviewService.publishInterview(req.params['id'] as string);
      res.status(200).json({ success: true, data: interview });
    } catch (err) { next(err); }
  };

  getInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const interview = await this.interviewService.getInterview(req.params['id'] as string);
      res.status(200).json({ success: true, data: interview });
    } catch (err) { next(err); }
  };

  listCompanyInterviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = (req as any).user?.companyId || req.params['companyId'];
      const interviews = await this.interviewService.listCompanyInterviews(companyId as string);
      res.status(200).json({ success: true, data: interviews });
    } catch (err) { next(err); }
  };

  inviteCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const session = await this.interviewService.inviteCandidate(
        req.params['id'] as string,
        req.body.candidateId,
        req.body.journeyId,
      );
      res.status(201).json({ success: true, data: session });
    } catch (err) { next(err); }
  };

  startSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const session = await this.interviewService.startSession(req.params['sessionId'] as string);
      res.status(200).json({ success: true, data: session });
    } catch (err) { next(err); }
  };

  submitAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const answer = await this.interviewService.submitAnswer({
        sessionId: req.params['sessionId'] as string,
        questionId: req.body.questionId,
        answerText: req.body.answerText,
      });
      res.status(200).json({ success: true, data: answer });
    } catch (err) { next(err); }
  };

  submitSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const session = await this.interviewService.submitSession(req.params['sessionId'] as string);
      res.status(200).json({ success: true, data: session });
    } catch (err) { next(err); }
  };

  getSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const session = await this.interviewService.getSession(req.params['sessionId'] as string);
      res.status(200).json({ success: true, data: session });
    } catch (err) { next(err); }
  };

  getMySessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidateId = (req as any).user?.id;
      const sessions = await this.interviewService.listCandidateSessions(candidateId);
      res.status(200).json({ success: true, data: sessions });
    } catch (err) { next(err); }
  };

  getSessionReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await this.interviewService.getSessionReport(req.params['sessionId'] as string);
      res.status(200).json({ success: true, data: report });
    } catch (err) { next(err); }
  };
}
