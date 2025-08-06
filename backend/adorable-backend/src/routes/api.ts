import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ApiResponse } from '../types/index.js';

const router = Router();

const ExampleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format')
});

router.get('/example', (req: Request, res: Response<ApiResponse>) => {
  res.json({
    success: true,
    data: {
      message: 'This is an example API endpoint',
      timestamp: new Date().toISOString()
    }
  });
});

router.post('/example', (req: Request, res: Response<ApiResponse>) => {
  try {
    const validatedData = ExampleSchema.parse(req.body);
    
    res.status(201).json({
      success: true,
      data: {
        message: 'Data received successfully',
        received: validatedData
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      });
    } else {
      throw error;
    }
  }
});

export default router;