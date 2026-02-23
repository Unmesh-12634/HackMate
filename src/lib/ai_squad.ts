import { supabase } from "./supabase";
import { User, Task } from "../app/context/AppContext";

/**
 * AI Squad Leader Service
 * Handles automated coordination, mission synthesis, and role matching.
 */

export interface StandupSummary {
    id: string;
    team_id: string;
    summary_text: string;
    key_achievements: string[];
    blockers: string[];
    next_steps: string[];
    created_at: string;
}

export const aiSquadService = {
    /**
     * Generates a tactical stand-up summary based on recent activity.
     */
    async generateStandup(teamId: string): Promise<StandupSummary | null> {
        // 1. Fetch recent activity and tasks
        const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('team_id', teamId)
            .order('updated_at', { ascending: false })
            .limit(10);

        const { data: members } = await supabase
            .from('team_members')
            .select('profiles(*)')
            .eq('team_id', teamId);

        // simulated AI processing for now
        // In a real implementation, this would call a Supabase Edge Function or LLM API
        const summary: StandupSummary = {
            id: Math.random().toString(36).substr(2, 9),
            team_id: teamId,
            summary_text: "Squadron activity shows high velocity in technical sectors.",
            key_achievements: [
                "Database schema for Bounty Matrix deployed.",
                "Tactical UI components integrated into Workspace."
            ],
            blockers: [
                "Signal interference detected in role-matching logic.",
                "Token limit reached on autonomous agents."
            ],
            next_steps: [
                "Initialize AI Squad Leader service.",
                "Synchronize GitHub repositories for pulse tracking."
            ],
            created_at: new Date().toISOString()
        };

        return summary;
    },

    /**
     * Matches operatives to roles based on skills and reputation.
     */
    async suggestRoleMatching(skillsRequired: string[], allProfiles: User[]): Promise<User[]> {
        return allProfiles
            .filter(profile =>
                profile.skills?.some(skill =>
                    skillsRequired.map(s => s.toLowerCase()).includes(skill.toLowerCase())
                )
            )
            .sort((a, b) => b.reputation - a.reputation)
            .slice(0, 5);
    },

    /**
     * Provides tactical autocomplete suggestions for task creation.
     */
    async getTaskSuggestions(query: string): Promise<string[]> {
        const commonTasks = [
            "Implement Auth Protocol",
            "Refactor UI Components",
            "Deploy Edge Functions",
            "Optimize Database Queries",
            "Audit Security Layer",
            "Integrate GitHub Pulse"
        ];

        return commonTasks.filter(task =>
            task.toLowerCase().includes(query.toLowerCase())
        );
    }
};
