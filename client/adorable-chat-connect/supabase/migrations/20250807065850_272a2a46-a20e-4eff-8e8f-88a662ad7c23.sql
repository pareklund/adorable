-- Add is_current column to adorable_projects table
ALTER TABLE public.adorable_projects 
ADD COLUMN is_current BOOLEAN NOT NULL DEFAULT false;