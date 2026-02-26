import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing environment variables: ' + JSON.stringify({ hasUrl: !!supabaseUrl, hasKey: !!supabaseKey }));
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: postsData, error: postsError } = await supabase
            .from('posts')
            .select(`
                id, content, created_at, author_id,
                profiles:author_id(full_name, avatar_url)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        if (postsError) throw postsError;

        return res.status(200).json({
            success: true,
            posts: postsData
        });
    } catch (error: any) {
        console.error('API [debug-posts] error:', error);
        return res.status(500).json({
            error: error.message || 'Unknown Server Error',
            context: 'api/debug-posts'
        });
    }
}
