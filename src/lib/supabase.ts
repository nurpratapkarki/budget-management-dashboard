
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are not properly configured');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if user is logged in
export const isLoggedIn = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session !== null;
};
