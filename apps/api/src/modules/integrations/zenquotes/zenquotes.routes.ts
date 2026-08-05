import { Router } from 'express';
import { getRandomQuote } from './zenquotes.controller.js';

export function createZenQuotesRoutes(): Router {
  const router = Router();

  router.get('/random', getRandomQuote);

  return router;
}
