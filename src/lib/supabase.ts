import { createClient } from '@supabase/supabase-js';

// For production, we use a hybrid approach to bypass ISP DNS blocks:
// 1. WebSockets connect directly (Vercel proxy doesn't support them).
// 2. HTTP/API calls are routed through our /api/supabase proxy.
const isProd = import.meta.env.PROD;
const directUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!directUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase URL or Key. Please check your .env file.');
}

// Custom fetch to route through proxy in production
const customFetch = (url: string, options?: any) => {
    if (isProd && typeof window !== 'undefined' && url.startsWith(directUrl)) {
        const proxyUrl = url.replace(directUrl, `${window.location.origin}/api/supabase`);
        return fetch(proxyUrl, options);
    }
    return fetch(url, options);
};

export const supabase = createClient(
    directUrl || '',
    supabaseAnonKey || '',
    {
        global: {
            fetch: customFetch as any
        }
    }
);
