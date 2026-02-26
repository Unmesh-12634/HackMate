import { createClient } from '@supabase/supabase-js';

// For production, we use a proxy through our own domain to bypass ISP DNS blocks
// In development, we use the direct Supabase URL
const isProd = import.meta.env.PROD;
const supabaseUrl = isProd
    ? (typeof window !== 'undefined' ? `${window.location.origin}/api/supabase` : import.meta.env.VITE_SUPABASE_URL)
    : import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase URL or Key. Please check your .env file.');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
