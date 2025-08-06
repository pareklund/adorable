import { Router, Request, Response } from 'express';
import { ApiResponse, HealthCheck } from '../types/index.js';

const router = Router();

router.get('/', (req: Request, res: Response<ApiResponse<HealthCheck>>) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
});

export default router;