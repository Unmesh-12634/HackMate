import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseServer } from './_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = req.query;

    try {
        // 1. Fetch posts with profiles
        const { data: postsData, error: postsError } = await supabaseServer
            .from('posts')
            .select(`
        id, content, type, code_snippet, code_language, project_details, tags, 
        likes_count, comments_count, created_at, author_id, image_url,
        profiles:author_id(*)
      `)
            .order('created_at', { ascending: false });

        if (postsError) throw postsError;

        // 2. Fetch liked post IDs if userId is provided
        let likedPostIds: string[] = [];
        if (userId && typeof userId === 'string') {
            const { data: likesData, error: likesError } = await supabaseServer
                .from('post_likes')
                .select('post_id')
                .eq('user_id', userId);

            if (!likesError && likesData) {
                likedPostIds = likesData.map((l: any) => l.post_id);
            }
        }

        return res.status(200).json({
            posts: postsData,
            likedPostIds
        });
    } catch (error: any) {
        console.error('API [posts] error:', error);
        return res.status(500).json({ error: error.message });
    }
}
