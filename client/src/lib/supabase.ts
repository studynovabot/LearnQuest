import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://nigjowsghhhtzlxuzjdx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2pvd3NnaGhodHpseHV6amR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NjQ4NTcsImV4cCI6MjA2NTU0MDg1N30.SkertvWzrpIlhZDk7_mIoiIvkikRDOoEnkIZfZ5ITzg';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);