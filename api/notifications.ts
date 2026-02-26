import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseServer } from './_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        const { data, error } = await supabaseServer
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json(data || []);
    } catch (error: any) {
        console.error('API [notifications] error:', error);
        return res.status(500).json({
            error: error.message || 'Unknown Server Error',
            context: 'api/notifications',
            envExists: !!(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL)
        });
    }
}
