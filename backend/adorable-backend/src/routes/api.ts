import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ApiResponse } from '../types';
import asyncHandler from "express-async-handler";
import { supabase } from "../integrations/supabase/client";
import {getProjectsByUserId} from "../integrations/supabase/project";
import {Project} from "../integrations/supabase/project";
import {unsetCurrentProjectForUser} from "../integrations/supabase/project";
import {createNewCurrentProjectForUser} from "../integrations/supabase/project";
import {addToChatHistory} from "../integrations/supabase/chatHistory";
import {ChatIssuer} from "../integrations/supabase/chatHistory";

export interface PromptFirstRequest {
  prompt: string;
}

export interface PromptFirstResponse {
  userId: string;
  projectId: string;
  projectName: string;
}

export interface Error {
  error: string;
}

export type PromptFirstResponseType = PromptFirstResponse | Error;

const router = Router();

router.post("/v1/prompt/first", asyncHandler(
    async (req: Request<PromptFirstRequest>, res: Response<PromptFirstResponseType>) => {

  const accessToken = req.header("X-Adorable-AccessToken");
  if (!accessToken) {
    const errorMessage = "Missing access token";
    console.error(errorMessage);
    res.status(400).json({ "error": errorMessage });
    return;
  }

  const refreshToken = req.header("X-Adorable-RefreshToken");
  if (!refreshToken) {
    const errorMessage = "Missing refresh token";
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

  const projectIds: Project[] = await getProjectsByUserId(userId, accessToken, refreshToken);

  if (projectIds.length > 0) {
    projectIds
        .filter(p => p.is_current)
        .forEach(p => unsetCurrentProjectForUser(userId, p.id, accessToken, refreshToken));
  }
  const newProject:Project = await createNewCurrentProjectForUser(userId, accessToken, refreshToken);

  const promptFirstRequest: PromptFirstRequest = req.body;

  await addToChatHistory(newProject.id, promptFirstRequest.prompt, "user" , userId, accessToken, refreshToken);

  res.send({ "userId": userId, "projectId": newProject.id, "projectName": newProject.display_name });
}));

export default router;