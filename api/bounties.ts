import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseServer } from './_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { data, error } = await supabaseServer
            .from('bounties')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json(data || []);
    } catch (error: any) {
        console.error('API [bounties] error:', error);
        return res.status(500).json({ error: error.message });
    }
}
