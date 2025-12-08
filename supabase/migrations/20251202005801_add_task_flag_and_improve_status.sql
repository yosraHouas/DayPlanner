/*
  # Add task flag and improve status management

  1. Changes
    - Add `is_flagged` column to tasks table for red flag functionality
    - Ensure status column supports: 'to_do', 'in_progress', 'done'
    - Add default value for is_flagged (false)

  2. Notes
    - is_flagged allows users to mark important/urgent tasks with a red flag
    - status tracks the task progress through the workflow
    - Both columns can be updated independently
*/

-- Add is_flagged column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'is_flagged'
  ) THEN
    ALTER TABLE tasks ADD COLUMN is_flagged boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Ensure status column has proper default
ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'to_do';

-- Update any existing null or invalid status values
UPDATE tasks SET status = 'to_do' WHERE status IS NULL OR status NOT IN ('to_do', 'in_progress', 'done');
