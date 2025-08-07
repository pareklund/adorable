import { supabase } from "./client";
import { Tables } from "./types";
import { v4 as uuidv4 } from 'uuid';

export type Project = Tables<'adorable_projects'>;

export async function getProjectsByUserId(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
        .from('adorable_projects')
        .select('*')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch projects for user ${userId}: ${error.message}`);
    }

    return data || [];
}


export async function unsetCurrentProjectForUser(userId: string, projectId: string): Promise<void> {
    const { error } = await supabase
        .from('adorable_projects')
        .update({ is_current: false })
        .eq('user_id', userId)
        .eq('id', projectId);

    if (error) {
        throw new Error(`Failed to unset current project ${projectId} for user ${userId}: ${error.message}`);
    }
}

export async function createNewCurrentProjectForUser(userId: string): Promise<Project> {
    const projectId = uuidv4();
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('adorable_projects')
        .insert({
            id: projectId,
            user_id: userId,
            display_name: projectId,
            created_at: now,
            last_updated: now,
            is_current: true,
            supabase_project_id: ''
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create new project for user ${userId}: ${error.message}`);
    }

    return data;
}
