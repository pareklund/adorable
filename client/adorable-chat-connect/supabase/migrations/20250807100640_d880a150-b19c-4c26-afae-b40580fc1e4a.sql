-- Create enum for chat message issuer
CREATE TYPE public.chat_issuer AS ENUM ('user', 'adorable');

-- Create adorable_chat_history table
CREATE TABLE public.adorable_chat_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.adorable_projects(id) ON DELETE CASCADE,
    chat_id TEXT NOT NULL,
    message TEXT NOT NULL,
    issuer public.chat_issuer NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Composite unique constraint for project_id + chat_id
    UNIQUE(project_id, chat_id)
);

-- Enable Row Level Security
ALTER TABLE public.adorable_chat_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view chat history for their projects"
ON public.adorable_chat_history
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.adorable_projects 
        WHERE id = adorable_chat_history.project_id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert chat history for their projects"
ON public.adorable_chat_history
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.adorable_projects 
        WHERE id = adorable_chat_history.project_id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can update chat history for their projects"
ON public.adorable_chat_history
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.adorable_projects 
        WHERE id = adorable_chat_history.project_id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete chat history for their projects"
ON public.adorable_chat_history
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.adorable_projects 
        WHERE id = adorable_chat_history.project_id 
        AND user_id = auth.uid()
    )
);

-- Create index for better performance on lookups
CREATE INDEX idx_adorable_chat_history_project_chat ON public.adorable_chat_history(project_id, chat_id);
CREATE INDEX idx_adorable_chat_history_created_at ON public.adorable_chat_history(created_at);