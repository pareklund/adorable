import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ApiResponse } from '../types';
import asyncHandler from "express-async-handler";
import {v4 as uuidv4} from 'uuid';
import { supabase } from "../integrations/supabase/client";

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

router.post("/v1/prompt/first", asyncHandler(async (req, res) => {
  // TODO: Check if dev-server is already created. If so, return with error.
  const body = req.body;

  const accessToken = req.header("X-Adorable-AccessToken");
  if (!accessToken) {
    const errorMessage = "Missing access token";
    console.error(errorMessage);
    res.status(400).json({ "error": errorMessage });
    return;
  }

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error) {
    const errorMessage = error.message;
    console.error(errorMessage);
    res.status(403).json({ "error": errorMessage });
    return;
  }

  const userId = req.header("X-Adorable-UserId");

  if (!userId) {
    const errorMessage = "Missing user id";
    console.error(errorMessage);
    res.status(400).json({ "error": errorMessage });
    return;
  }

  if (userId != data.user?.id) {
    const errorMessage = "Claimed / actual user id mismatch";
    console.error(errorMessage);
    res.status(400).json({ "error": errorMessage });
    return;
  }

  const projectId = uuidv4();

  // For now, just ignore the prompt and
    res.send({ "projectId": projectId, "userId": userId, "accessToken": accessToken });
}));

export default router;