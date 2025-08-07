import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {getSession} from "@/lib/utils/session.ts";
import {Session} from "@supabase/supabase-js";

export interface PromptRequest {
  prompt: string;
}

export interface PromptResponse {
  userId: string;
  projectId: string;
  projectName: string;
}

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

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async promptFirst(data: PromptRequest): Promise<PromptResponse> {
    const session: Session = await getSession();
    const response: AxiosResponse<PromptResponse> = await this.client.post(
      '/api/v1/prompt/first',
      data,
        {
          timeout: 180000,
          headers: {
            'X-Adorable-UserId': session.user.id,
            'X-Adorable-AccessToken': session.access_token,
            'X-Adorable-RefreshToken': session.refresh_token
          }
        }
    );
    return response.data;
  }

  async prompt(data: PromptRequest, projectId: string): Promise<PromptResponse> {
    const session: Session = await getSession();

    const response: AxiosResponse<PromptResponse> = await this.client.post(
        '/api/v1/prompt',
        data,
        {
          timeout: 180000,
          headers: {
            'X-Adorable-UserId': session.user.id,
            'X-Adorable-ProjectId': projectId,
            'X-Adorable-AccessToken': session.access_token,
            'X-Adorable-RefreshToken': session.refresh_token
          }
        }
    );
    return response.data;
  }

  async switchWorkspace(data: SwitchWorkspaceRequest): Promise<SwitchProjectResponseType> {
    const session: Session = await getSession();

    const response: AxiosResponse<SwitchProjectResponseType> = await this.client.post(
        '/api/v1/project/switchWorkspace',
        data,
        {
          timeout: 30000,
          headers: {
            'X-Adorable-UserId': session.user.id,
            'X-Adorable-AccessToken': session.access_token,
            'X-Adorable-RefreshToken': session.refresh_token
          }
        }
    );
    return response.data;
  }
}

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
export const apiClient = new ApiClient(baseURL);