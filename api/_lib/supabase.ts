import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (Logic runs in the cloud, bypassing ISP blocks)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: Missing Supabase URL or Key in server environment.');
    // In production (Vercel), these must be set in the dashboard.
}

export const supabaseServer = createClient(
    supabaseUrl || 'https://missing-url.supabase.co',
    supabaseKey || 'missing-key'
);
