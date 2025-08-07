import { Router, Request, Response } from 'express';
import asyncHandler from "express-async-handler";
import { supabase } from "../integrations/supabase/client";
import {getProjectsByUserId} from "../integrations/supabase/project";
import {Project} from "../integrations/supabase/project";
import {unsetCurrentProjectForUser} from "../integrations/supabase/project";
import {createNewCurrentProjectForUser} from "../integrations/supabase/project";
import {addToChatHistory} from "../integrations/supabase/chatHistory";
import {CodeGenerationResult, generateCodeWithClaude} from "../integrations/claudeCode/claudeCode";
import {ensureWorkspaceIsCreated, syncCurrentWorkspace} from "../lib/workspace";

export interface PromptRequest {
  prompt: string;
}

export interface PromptResponse {
  userId: string;
  projectId: string;
  projectName: string;
}

export interface Error {
  error: string;
}

export type PromptFirstResponseType = PromptResponse | Error;

const router = Router();

router.post("/v1/prompt/first", asyncHandler(
    async (req: Request<PromptRequest>, res: Response<PromptFirstResponseType>) => {

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

  if (userId !== data.user?.id) {
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

  await ensureWorkspaceIsCreated(newProject.id);

  const promptFirstRequest: PromptRequest = req.body;

  await addToChatHistory(newProject.id, promptFirstRequest.prompt, "user" , userId, accessToken, refreshToken);

  const result: CodeGenerationResult = await generateCodeWithClaude(promptFirstRequest.prompt, newProject.id);

  if (result.error) {
    res.status(500).json({ "error": result.error})
    return;
  }

  result.messages.forEach((message) => {
    addToChatHistory(newProject.id, JSON.stringify(message), "adorable", userId, accessToken, refreshToken );
  });

  await syncCurrentWorkspace(newProject.id);

  res.send({ "userId": userId, "projectId": newProject.id, "projectName": newProject.display_name });
}));

router.post("/v1/prompt", asyncHandler(
    async (req: Request<PromptRequest>, res: Response<PromptFirstResponseType>) => {

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

      if (userId !== data.user?.id) {
        const errorMessage = "Claimed / actual user id mismatch";
        console.error(errorMessage);
        res.status(400).json({ "error": errorMessage });
        return;
      }

      const projectId = req.header("X-Adorable-ProjectId");
      if (!projectId) {
        const errorMessage = "Missing project id";
        console.error(errorMessage);
        res.status(400).json({ "error": errorMessage });
        return;
      }

      const projectIds: Project[] = await getProjectsByUserId(userId, accessToken, refreshToken);

      const currentProject: Project | undefined = projectIds.find(p => p.is_current);

      if (!currentProject || currentProject.id !== projectId) {
        const errorMessage = "No or conflicting current project configuration";
        console.error(errorMessage);
        res.status(400).json({ "error": errorMessage });
        return;
      }

      await ensureWorkspaceIsCreated(projectId);

      const promptRequest: PromptRequest = req.body;

      await addToChatHistory(currentProject?.id, promptRequest.prompt, "user", userId, accessToken, refreshToken);

      const result: CodeGenerationResult = await generateCodeWithClaude(promptRequest.prompt, currentProject.id);

      if (result.error) {
        res.status(500).json({ "error": result.error})
        return;
      }

      result.messages.forEach((message) => {
        addToChatHistory(currentProject.id, JSON.stringify(message), "adorable", userId, accessToken, refreshToken );
      });

      await syncCurrentWorkspace(currentProject.id);

      res.send({ "userId": userId, "projectId": currentProject.id, "projectName": currentProject.display_name });
    }));

export interface SwitchWorkspaceRequest {
    projectId: string;
}

export interface SwitchWorkspaceResponse {
    projectId: string;
}

export interface Error {
    error: string;
}

export type SwitchProjectResponseType = SwitchWorkspaceResponse | Error;

router.post("/v1/project/switchWorkspace", asyncHandler(
    async (req: Request<SwitchWorkspaceRequest>, res: Response<SwitchProjectResponseType>) => {

        console.info("Switch workspace called");

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

        if (userId !== data.user?.id) {
            const errorMessage = "Claimed / actual user id mismatch";
            console.error(errorMessage);
            res.status(400).json({ "error": errorMessage });
            return;
        }

        const request: SwitchWorkspaceRequest = req.body;

        const projects: Project[] = await getProjectsByUserId(userId, accessToken, refreshToken);

        console.info("request.projectId: ", request.projectId);

        const projectToSwitchTo: Project | undefined =
            projects.find(p => {
                console.info("p.id: ", p.id);
                return p.id === request.projectId;
            });

        if (!projectToSwitchTo) {
            const errorMessage = "Non-existing project";
            console.error(errorMessage);
            res.status(400).json({ "error": errorMessage });
            return;
        }

        console.info("projectToSwitchTo.id", projectToSwitchTo.id);
        await ensureWorkspaceIsCreated(projectToSwitchTo.id);
        await syncCurrentWorkspace(projectToSwitchTo.id);
        console.info("Returning from switchWorkspace handler", projectToSwitchTo.id);

        res.send({ "projectId": projectToSwitchTo.id });
    }));

export default router;