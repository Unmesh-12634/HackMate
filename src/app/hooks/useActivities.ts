import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAppContext } from '../context/AppContext';

export interface Activity {
    id: string;
    user_id: string;
    action_type: string;
    entity_type: string | null;
    entity_id: string | null;
    description: string;
    metadata: any;
    created_at: string;
}

export function useActivities() {
    const { user } = useAppContext();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchActivities = async () => {
        if (!user?.id) return;

        setLoading(true);
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error("Error fetching activities:", error);
        } else if (data) {
            setActivities(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!user?.id) {
            setActivities([]);
            setLoading(false);
            return;
        }

        fetchActivities();

        // Subscribe to realtime updates for activities
        const channel = supabase.channel(`activities_updates_${user.id}`)
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'activities',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    // Instantly add new activity to the feed without reloading
                    setActivities((prev) => [payload.new as Activity, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    // Expose a function to manually trigger an activity (useful for testing or direct inserts)
    const addActivity = async (action_type: string, description: string, entity_type: string | null = null, entity_id: string | null = null, metadata: any = {}) => {
        if (!user?.id) return;
        const { error } = await supabase.from('activities').insert({
            user_id: user.id,
            action_type,
            description,
            entity_type,
            entity_id,
            metadata
        });
        if (error) console.error("Failed to insert activity:", error);
    };

    return { activities, loading, addActivity, fetchActivities };
}
