import {
    Zap,
    Users,
    ShieldCheck,
    Star,
    Gauge,
    Trophy,
    Code2,
    Cpu,
    Network,
    Terminal,
    Activity,
    Heart
} from "lucide-react";

export interface BadgeDefinition {
    id: string;
    name: string;
    description: string;
    icon: any;
    tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
    shape: "Hexagon" | "Circle" | "Shield" | "Diamond";
    color: string;
    glow: string;
    levelRequired?: number;
    criteria: string;
    secret?: boolean;
}

export const BADGE_LIBRARY: BadgeDefinition[] = [
    {
        id: "early_adopter",
        name: "Founder Status",
        description: "One of the original pioneers of the HackMate ecosystem.",
        icon: Zap,
        tier: "Platinum",
        shape: "Shield",
        color: "from-blue-400 to-cyan-500",
        glow: "shadow-cyan-500/50",
        criteria: "Join during Alpha phase"
    },
    {
        id: "squad_leader_1",
        name: "Squad Leader",
        description: "Successfully led your first team to mobilization.",
        icon: Users,
        tier: "Bronze",
        shape: "Circle",
        color: "from-purple-400 to-indigo-500",
        glow: "shadow-purple-500/30",
        criteria: "Lead 1 team"
    },
    {
        id: "battalion_commander",
        name: "Battalion Commander",
        description: "A seasoned veteran of multiple successful team campaigns.",
        icon: ShieldCheck,
        tier: "Gold",
        shape: "Shield",
        color: "from-amber-400 to-orange-600",
        glow: "shadow-orange-500/50",
        criteria: "Lead 5 teams"
    },
    {
        id: "productivity_titan",
        name: "Productivity Titan",
        description: "Consistently delivering high-velocity output in the workspace.",
        icon: Gauge,
        tier: "Platinum",
        shape: "Diamond",
        color: "from-hack-neon to-emerald-600",
        glow: "shadow-hack-neon/50",
        criteria: "50+ total activities logged"
    },
    {
        id: "code_architect",
        name: "Code Architect",
        description: "Building the skeletal structures of future software empires.",
        icon: Code2,
        tier: "Silver",
        shape: "Hexagon",
        color: "from-blue-600 to-blue-800",
        glow: "shadow-blue-500/30",
        criteria: "Complete 10 critical tasks"
    },
    {
        id: "neural_pioneer",
        name: "Neural Pioneer",
        description: "Mastering the AI-integrated workspace with finesse.",
        icon: Cpu,
        tier: "Diamond",
        shape: "Hexagon",
        color: "from-fuchsia-500 to-rose-600",
        glow: "shadow-fuchsia-500/60",
        criteria: "Interact with 5 AI intelligence modules"
    },
    {
        id: "community_pulse",
        name: "Neural Node",
        description: "A vital connection in the HackMate social fabric.",
        icon: Network,
        tier: "Silver",
        shape: "Circle",
        color: "from-hack-blue to-indigo-600",
        glow: "shadow-hack-blue/40",
        criteria: "Follow 10 other Operatives"
    },
    {
        id: "terminal_master",
        name: "Root Access",
        description: "Commands the terminal like an extension of their own mind.",
        icon: Terminal,
        tier: "Gold",
        shape: "Diamond",
        color: "from-slate-700 to-black",
        glow: "shadow-slate-500/40",
        criteria: "Log 100 CLI-based activities"
    },
    {
        id: "merit_vanguard",
        name: "Heart of the Squad",
        description: "Recognized for exceptional contribution and team spirit.",
        icon: Heart,
        tier: "Platinum",
        shape: "Shield",
        color: "from-red-400 to-pink-600",
        glow: "shadow-red-500/50",
        criteria: "Gain 1000 reputation points"
    },
    {
        id: "elite_operative",
        name: "Apex Predator",
        description: "Reaching the absolute peak of the HackMate hierarchy.",
        icon: Trophy,
        tier: "Diamond",
        shape: "Shield",
        color: "from-yellow-300 via-yellow-500 to-amber-700",
        glow: "shadow-yellow-500/70",
        criteria: "Reach Rank: Apex"
    }
];
