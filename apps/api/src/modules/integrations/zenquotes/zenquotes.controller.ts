import type { Request, Response } from 'express';
import { ZenQuotesService } from './ZenQuotesService.js';
import { createModuleLogger } from '@/core/logger.js';

const log = createModuleLogger('ZenQuotesController');

export const getRandomQuote = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = (req.query['role'] as string) || 'developer';
    const quote = await ZenQuotesService.getRandomQuote(role);
    
    if (!quote) {
      res.status(503).json({
        success: false,
        error: { message: 'Quote service unavailable' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    log.error({ err: error }, 'Error in getRandomQuote controller');
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
};
