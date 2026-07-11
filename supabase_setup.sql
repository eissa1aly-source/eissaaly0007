-- Run this SQL script in your Supabase SQL Editor to create the vault_entries table

CREATE TABLE vault_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  encrypted_content TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Example RLS policies (Optional but recommended):
-- Enable Row Level Security
-- ALTER TABLE vault_entries ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own entries
-- CREATE POLICY "Users can view their own entries" 
-- ON vault_entries FOR SELECT 
-- USING (auth.uid() = user_id);

-- Allow users to insert their own entries
-- CREATE POLICY "Users can insert their own entries" 
-- ON vault_entries FOR INSERT 
-- WITH CHECK (auth.uid() = user_id);
