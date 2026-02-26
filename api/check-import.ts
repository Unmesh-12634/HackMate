import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Dynamic import to catch potential ESM resolution errors
        const mod = await import('./_lib/supabase.js');
        return res.status(200).json({
            success: true,
            message: 'Module loaded successfully',
            keys: Object.keys(mod)
        });
    } catch (error: any) {
        console.error('API [check-import] error:', error);
        return res.status(500).json({
            error: error.message || 'Import failed',
            stack: error.stack,
            context: 'api/check-import',
            nodeVer: process.version
        });
    }
}
