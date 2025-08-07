import { supabase } from "@/integrations/supabase/client";
import {Session} from "@supabase/supabase-js";

export async function getSession(): Promise<Session> {
    const {data, error} = await supabase.auth.getSession();
    return data.session;
}
