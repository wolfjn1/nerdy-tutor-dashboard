-- Fix conversations table structure
-- First, let's check what columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'conversations'
ORDER BY ordinal_position;

-- Add missing columns to conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES students(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS parent_id UUID,
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_tutor_id ON conversations(tutor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_student_id ON conversations(student_id);
CREATE INDEX IF NOT EXISTS idx_conversations_tutor_student ON conversations(tutor_id, student_id);

-- Check if messages table has the correct structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- Verify the changes
SELECT * FROM conversations LIMIT 1; 