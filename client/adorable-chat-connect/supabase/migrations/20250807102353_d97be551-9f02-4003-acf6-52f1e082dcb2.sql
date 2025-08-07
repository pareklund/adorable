-- Remove the composite unique constraint that includes chat_id
ALTER TABLE public.adorable_chat_history DROP CONSTRAINT IF EXISTS adorable_chat_history_project_id_chat_id_key;

-- Drop the index that includes chat_id
DROP INDEX IF EXISTS idx_adorable_chat_history_project_chat;

-- Remove the chat_id column
ALTER TABLE public.adorable_chat_history DROP COLUMN chat_id;