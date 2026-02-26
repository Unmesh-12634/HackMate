import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (Logic runs in the cloud, bypassing ISP blocks)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables on the server.');
}

export const supabaseServer = createClient(supabaseUrl, supabaseKey);
