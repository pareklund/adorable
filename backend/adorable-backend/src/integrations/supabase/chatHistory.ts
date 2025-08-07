import { supabase } from "./client";
import { Enums } from "./types";

export type ChatIssuer = Enums<'chat_issuer'>;

export async function addToChatHistory(
    projectId: string, message: string, chatIssuer: ChatIssuer,
    userId: string, accessToken: string, refreshToken: string): Promise<void> {

    await supabase.auth.setSession({access_token: accessToken, refresh_token: refreshToken});

    const now = new Date().toISOString();

    const {data, error} = await supabase
        .from('adorable_chat_history')
        .insert({
            project_id: projectId,
            issuer: chatIssuer,
            created_at: now,
            message: message
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create new chat entry for user ${userId} and project ${projectId}: ${error.message}`);
    }
}