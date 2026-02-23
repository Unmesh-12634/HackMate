import { describe, it, expect } from 'vitest'

// Reproduction of the logic in AppContext.tsx and Supabase
const calculateLevel = (points: number) => Math.floor(points / 1000) + 1;

const getXPReward = (priority: string, isOverdue: boolean) => {
    let xpReward = 25; // Base (medium)
    if (priority === 'urgent') xpReward = 100;
    else if (priority === 'high') xpReward = 50;
    else if (priority === 'low') xpReward = 10;

    if (isOverdue) {
        xpReward = Math.floor(xpReward * 0.5);
    }
    return xpReward;
};

describe('XP Engine Logic', () => {
    describe('Level Calculation', () => {
        it('should start at Level 1 for 0 XP', () => {
            expect(calculateLevel(0)).toBe(1);
        });

        it('should be Level 1 for 999 XP', () => {
            expect(calculateLevel(999)).toBe(1);
        });

        it('should reach Level 2 at 1000 XP', () => {
            expect(calculateLevel(1000)).toBe(2);
        });

        it('should be Level 3 at 2500 XP', () => {
            expect(calculateLevel(2500)).toBe(3);
        });
    });

    describe('Task XP Rewards', () => {
        it('should award 100 XP for urgent tasks', () => {
            expect(getXPReward('urgent', false)).toBe(100);
        });

        it('should award 50 XP for high tasks', () => {
            expect(getXPReward('high', false)).toBe(50);
        });

        it('should award 25 XP for medium tasks', () => {
            expect(getXPReward('medium', false)).toBe(25);
        });

        it('should award 10 XP for low tasks', () => {
            expect(getXPReward('low', false)).toBe(10);
        });
    });

    describe('Deadline Penalties', () => {
        it('should halve XP for overdue urgent tasks', () => {
            expect(getXPReward('urgent', true)).toBe(50);
        });

        it('should halve XP for overdue high tasks', () => {
            expect(getXPReward('high', true)).toBe(25);
        });

        it('should floor the halved XP for overdue medium tasks', () => {
            expect(getXPReward('medium', true)).toBe(12); // Math.floor(12.5)
        });

        it('should award 5 XP for overdue low tasks', () => {
            expect(getXPReward('low', true)).toBe(5);
        });
    });
});
