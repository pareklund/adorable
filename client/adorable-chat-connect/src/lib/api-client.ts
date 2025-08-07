import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {getSession} from "@/lib/utils/session.ts";
import {Session} from "@supabase/supabase-js";

export interface PromptFirstRequest {
  prompt: string;
}

export interface PromptFirstResponse {
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

  async promptFirst(data: PromptFirstRequest): Promise<PromptFirstResponse> {
    const session: Session = await getSession();
    const response: AxiosResponse<PromptFirstResponse> = await this.client.post(
      '/api/v1/prompt/first',
      data,
        {
          headers: {
            'X-Adorable-UserId': session.user.id,
            'X-Adorable-AccessToken': session.access_token
          }
        }
    );
    return response.data;
  }

  updateBaseURL(baseURL: string): void {
    this.client.defaults.baseURL = baseURL;
  }
}

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
export const apiClient = new ApiClient(baseURL);