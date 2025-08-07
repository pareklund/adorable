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

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
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
    const headers: Record<string, string> = {
      'X-Adorable-UserId': session.user.id,
      'X-Adorable-ProjectId': projectId,
      'X-Adorable-AccessToken': session.access_token,
      'X-Adorable-RefreshToken': session.refresh_token,
    };

    const response: AxiosResponse<PromptResponse> = await this.client.post(
        '/api/v1/prompt',
        data,
        { headers }
    );
    return response.data;
  }

  updateBaseURL(baseURL: string): void {
    this.client.defaults.baseURL = baseURL;
  }
}

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
export const apiClient = new ApiClient(baseURL);