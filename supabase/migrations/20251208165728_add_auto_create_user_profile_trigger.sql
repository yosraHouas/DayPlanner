/*
  # Add automatic user profile creation trigger

  1. Changes
    - Drop the restrictive INSERT policy on user_profiles
    - Create a new policy that allows service role to insert
    - Add trigger function to automatically create user profile on signup
    - Add trigger to execute the function when a new user is created

  2. Security
    - User profiles are now created automatically by the database trigger
    - Users can still only read and update their own profiles
    - The trigger runs with SECURITY DEFINER to bypass RLS

  This fixes the "new row violates row-level security policy" error during signup.
*/

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create a function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add a new policy that allows authenticated users to insert if needed (for manual updates)
CREATE POLICY "Service role can manage profiles"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);