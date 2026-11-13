import { z } from 'zod';

export const pageFeedback = z.object({
  opinion: z.enum(['good', 'bad']),
  url: z.string().startsWith('/docs/').max(300),
  message: z.string().max(2000).optional().default(''),
});
