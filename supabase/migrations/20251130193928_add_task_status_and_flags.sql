/*
  # Add Task Status and Flags

  1. Changes
    - Add `status` column to `tasks` table (to_do, in_progress, done)
    - Add `is_paused` column to `tasks` table (boolean flag for red flag)
    - Set default values for existing tasks

  2. Default Values
    - status: DEFAULT 'to_do'
    - is_paused: DEFAULT false

  3. Notes
    - Existing tasks will automatically get default values
    - Status tracks task progress: to_do, in_progress, done
    - is_paused flag marks tasks that need attention (red flag)
*/

-- Add status column to tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'status'
  ) THEN
    ALTER TABLE tasks ADD COLUMN status text DEFAULT 'to_do' NOT NULL;
  END IF;
END $$;

-- Add is_paused flag column to tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'is_paused'
  ) THEN
    ALTER TABLE tasks ADD COLUMN is_paused boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Add check constraint for status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'tasks_status_check'
  ) THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_status_check
      CHECK (status IN ('to_do', 'in_progress', 'done'));
  END IF;
END $$;

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_is_paused ON tasks(is_paused) WHERE is_paused = true;