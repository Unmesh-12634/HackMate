import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (Logic runs in the cloud, bypassing ISP blocks)
// Server-side Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('SERVER_ERROR: Missing Supabase variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Vercel/Environment.');
}

export const supabaseServer = createClient(supabaseUrl, supabaseKey);
