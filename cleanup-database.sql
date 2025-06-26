-- Optional cleanup script - run in Supabase SQL editor if you want to remove folders completely

-- Step 1: Remove folder references from all notes
UPDATE notes SET folder_id = NULL WHERE folder_id IS NOT NULL;

-- Step 2: Drop the folders table (optional - only if you want to completely remove it)
DROP TABLE IF EXISTS folders;

-- Your notes table will continue to work perfectly without folders!

-- Database cleanup script for unified tag system
-- This removes the old status column since we now use tags for everything

-- Remove status column from notes table
ALTER TABLE notes DROP COLUMN IF EXISTS status;

-- Ensure tags column is properly set up as text array
ALTER TABLE notes ALTER COLUMN tags SET DEFAULT '{}';

-- Update any notes that might have NULL tags
UPDATE notes SET tags = '{}' WHERE tags IS NULL;

-- Optional: If you want to migrate old status values to tags
-- Uncomment the following if you had important status data:
/*
-- Add old status as tags for existing notes (run before dropping the column)
UPDATE notes 
SET tags = CASE 
  WHEN tags = '{}' OR tags IS NULL THEN ARRAY[status]
  ELSE array_append(tags, status)
END
WHERE status IS NOT NULL AND status != '';
*/

-- Create index on tags for better query performance
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN (tags);

-- Verify the schema by selecting column information
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'notes' 
ORDER BY ordinal_position; 