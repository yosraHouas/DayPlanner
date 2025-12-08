/*
  # Create planning history tables

  1. New Tables
    - `plannings`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the planning
      - `created_at` (timestamptz) - When the planning was created
      - `file_name` (text) - Original Excel filename
    
    - `tasks`
      - `id` (uuid, primary key)
      - `planning_id` (uuid, foreign key) - Reference to planning
      - `title` (text) - Task title
      - `start_time` (text) - Start time (HH:MM format)
      - `end_time` (text) - End time (HH:MM format)
      - `duration` (integer) - Duration in minutes
      - `category` (text, optional) - Task category
      - `priority` (text, optional) - Priority level (low, medium, high)
      - `description` (text, optional) - Task description
      - `color` (text, optional) - Category color

  2. Security
    - Enable RLS on both tables
    - Public access for read operations (since this is a front-end only app)
    - Public access for insert/update/delete operations
*/

CREATE TABLE IF NOT EXISTS plannings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  file_name text NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  planning_id uuid NOT NULL REFERENCES plannings(id) ON DELETE CASCADE,
  title text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  duration integer NOT NULL DEFAULT 0,
  category text,
  priority text,
  description text,
  color text
);

ALTER TABLE plannings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plannings"
  ON plannings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert plannings"
  ON plannings FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update plannings"
  ON plannings FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete plannings"
  ON plannings FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Anyone can view tasks"
  ON tasks FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert tasks"
  ON tasks FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update tasks"
  ON tasks FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete tasks"
  ON tasks FOR DELETE
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_tasks_planning_id ON tasks(planning_id);
CREATE INDEX IF NOT EXISTS idx_plannings_created_at ON plannings(created_at DESC);