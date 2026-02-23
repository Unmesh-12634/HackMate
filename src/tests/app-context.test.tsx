import { render, act } from '@testing-library/react'
import { AppProvider, useAppContext } from '../app/context/AppContext'
import { supabase } from '@/lib/supabase'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import React from 'react'

// Helper component to access context during tests
const TestComponent = ({ onContext }: { onContext: (context: any) => void }) => {
    const context = useAppContext();
    React.useEffect(() => {
        onContext(context);
    }, [context]);
    return null;
};

describe('AppContext Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock behavior to prevent initial fetch errors
        (supabase.from as any).mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
            then: (resolve: any) => resolve({ data: [], error: null }),
        });
    });

    it('provides the expected initial state', async () => {
        let context: any;
        await act(async () => {
            render(
                <AppProvider>
                    <TestComponent onContext={(c) => { context = c }} />
                </AppProvider>
            );
        });

        expect(context!.theme).toBe('dark');
    });

    it('updates task status and records activity for XP rewards', async () => {
        const mockUser = { id: 'u1', name: 'Test User', reputation: 0, level: 1 };
        const mockTask = { id: 't1', title: 'Test Task', priority: 'high', status: 'todo', assignee_id: 'u1', deadline: null };
        const mockTeam = { id: 'team1', name: 'Test Team', tasks: [mockTask] };

        // Setup more specific mock responses
        (supabase.from as any).mockImplementation((table: string) => {
            const base = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                update: vi.fn().mockResolvedValue({ error: null }),
                insert: vi.fn().mockResolvedValue({ error: null }),
                then: (resolve: any) => {
                    if (table === 'teams') return resolve({ data: [mockTeam], error: null });
                    if (table === 'profiles') return resolve({ data: mockUser, error: null });
                    return resolve({ data: [], error: null });
                }
            };
            return base;
        });

        let context: any;
        await act(async () => {
            render(
                <AppProvider>
                    <TestComponent onContext={(c) => { context = c }} />
                </AppProvider>
            );
        });

        // Mock successful login state
        await act(async () => {
            context.login({ user: mockUser });
            context.addTeam(mockTeam); // Force team into state
        });

        // Mark task as 'done'
        await act(async () => {
            await context.updateTaskStatus('t1', 'done');
        });

        // Verify activity recording was attempted
        expect(supabase.from).toHaveBeenCalledWith('activities');

        // Verify reputation update was attempted
        expect(supabase.from).toHaveBeenCalledWith('profiles');
    });
});
