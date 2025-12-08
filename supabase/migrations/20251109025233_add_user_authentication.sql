/*
  # Add User Authentication

  1. Changes
    - Add `user_id` column to `plannings` table
    - Drop existing public RLS policies
    - Create new RLS policies for authenticated users only
    - Users can only access their own plannings and tasks

  2. Security
    - Restrict all operations to authenticated users
    - Users can only view/modify their own data
    - Cascade user_id through tasks via planning relationship
*/

-- Add user_id column to plannings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plannings' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE plannings ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view plannings" ON plannings;
DROP POLICY IF EXISTS "Anyone can insert plannings" ON plannings;
DROP POLICY IF EXISTS "Anyone can update plannings" ON plannings;
DROP POLICY IF EXISTS "Anyone can delete plannings" ON plannings;
DROP POLICY IF EXISTS "Anyone can view tasks" ON tasks;
DROP POLICY IF EXISTS "Anyone can insert tasks" ON tasks;
DROP POLICY IF EXISTS "Anyone can update tasks" ON tasks;
DROP POLICY IF EXISTS "Anyone can delete tasks" ON tasks;

-- Create policies for plannings (authenticated users only)
CREATE POLICY "Users can view own plannings"
  ON plannings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plannings"
  ON plannings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plannings"
  ON plannings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own plannings"
  ON plannings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for tasks (via planning ownership)
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM plannings
      WHERE plannings.id = tasks.planning_id
      AND plannings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plannings
      WHERE plannings.id = tasks.planning_id
      AND plannings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM plannings
      WHERE plannings.id = tasks.planning_id
      AND plannings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plannings
      WHERE plannings.id = tasks.planning_id
      AND plannings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM plannings
      WHERE plannings.id = tasks.planning_id
      AND plannings.user_id = auth.uid()
    )
  );

-- Add index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_plannings_user_id ON plannings(user_id);