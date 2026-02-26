import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    return res.status(200).json({
        status: 'ok',
        env: {
            hasUrl: !!(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL),
            hasKey: !!(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
            nodeEnv: process.env.NODE_ENV,
            region: process.env.VERCEL_REGION || 'local',
            ver: '1.0.3'
        },
        time: new Date().toISOString()
    });
}
