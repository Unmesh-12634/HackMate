import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseServer } from './_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        // 1. Get IDs of teams user belongs to
        const { data: myMemberships, error: memError } = await supabaseServer
            .from('memberships')
            .select('*')
            .eq('user_id', userId);

        if (memError) throw memError;

        if (!myMemberships || myMemberships.length === 0) {
            return res.status(200).json({ teams: [], memberships: [] });
        }

        const teamIds = myMemberships.map((m: any) => m.team_id);

        // 2. Fetch full team details
        const { data: teamsData, error: teamsError } = await supabaseServer
            .from('teams')
            .select(`
        *,
        memberships(*, profiles(*)),
        tasks(*, profiles:assignee_id(*))
      `)
            .in('id', teamIds);

        if (teamsError) throw teamsError;

        // 3. Fetch Audit Logs
        const { data: auditLogsData } = await supabaseServer
            .from('audit_logs')
            .select(`*, profiles(full_name)`)
            .in('team_id', teamIds)
            .order('created_at', { ascending: false })
            .limit(100);

        return res.status(200).json({
            teams: teamsData,
            memberships: myMemberships,
            auditLogs: auditLogsData
        });
    } catch (error: any) {
        console.error('API [teams] error:', error);
        return res.status(500).json({
            error: error.message || 'Unknown Server Error',
            context: 'api/teams',
            envExists: !!(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL)
        });
    }
}
