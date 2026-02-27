import React, { useMemo } from "react";
import {
    Trophy,
    Target,
    Zap,
    Lock,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    ArrowRight
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { BADGE_LIBRARY, BadgeDefinition } from "../data/badges";
import { PremiumBadge } from "../components/PremiumBadge";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { cn } from "../components/ui/utils";

export default function AchievementsView() {
    const { user, milestones: userMilestones, activities, teams, userBadges } = useAppContext();
    const [searchQuery, setSearchQuery] = React.useState("");
    const [filter, setFilter] = React.useState<"all" | "unlocked" | "locked">("all");

    const unlockedIds = useMemo(() => {
        // Start with badges from database
        const ids = new Set((userBadges || []).map(b => b.badge_id));

        // Supplement with derived/fallback logic from milestones
        (userMilestones || []).forEach(m => ids.add(m.type));

        // Auto-unlock logic based on current stats (derived)
        const teamsLed = (teams || []).filter(t => (t.role || "").toLowerCase().includes("lead")).length;
        const projectsJoined = (teams || []).length;
        const followingCount = user?.following_count || 0;

        if (user?.reputation && user.reputation >= 1000) ids.add("merit_vanguard");
        if (activities?.length >= 50) ids.add("productivity_titan");
        if (user?.rank === 'Apex' || user?.rank === 'Legend') ids.add("elite_operative");
        if (teamsLed >= 1) ids.add("squad_leader_1");
        if (teamsLed >= 5) ids.add("battalion_commander");
        if (projectsJoined >= 10) ids.add("veteran_status");
        if (followingCount >= 10) ids.add("community_pulse");
        if (activities?.length > 0) ids.add("early_adopter");

        return ids;
    }, [userBadges, userMilestones, user, activities, teams]);


    const filteredBadges = useMemo(() => {
        return BADGE_LIBRARY.filter(badge => {
            const isUnlocked = unlockedIds.has(badge.id);
            const matchesSearch = badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                badge.description.toLowerCase().includes(searchQuery.toLowerCase());

            if (filter === "unlocked") return isUnlocked && matchesSearch;
            if (filter === "locked") return !isUnlocked && matchesSearch;
            return matchesSearch;
        });
    }, [searchQuery, filter, unlockedIds]);

    const stats = {
        total: BADGE_LIBRARY.length,
        unlocked: unlockedIds.size,
        progress: (unlockedIds.size / BADGE_LIBRARY.length) * 100
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-[40px] bg-card border border-border p-12 shadow-2xl">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-hack-blue/10 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-hack-blue/10 border border-hack-blue/20 text-hack-blue">
                            <Trophy className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Operational Excellence</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter leading-none">
                            ACHIEVEMENT <span className="text-hack-blue italic">LIBRARY</span>
                        </h1>
                        <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest max-w-lg leading-relaxed">
                            Track your evolution as an Operative. Unlock premium accolades by completing high-stakes objectives and dominating the HackMate ecosystem.
                        </p>

                        <div className="flex items-center gap-8 pt-4">
                            <div>
                                <p className="text-3xl font-black text-hack-blue">{stats.unlocked}/{stats.total}</p>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Badges Secured</p>
                            </div>
                            <div className="flex-1 max-w-[200px]">
                                <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.progress}%` }}
                                        className="h-full bg-hack-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                    />
                                </div>
                                <p className="text-[8px] font-black text-right mt-2 uppercase opacity-50">{Math.round(stats.progress)}% Mastery</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-shrink-0">
                        <div className="relative">
                            <div className="absolute -inset-8 bg-hack-blue/20 blur-[100px] rounded-full animate-pulse" />
                            <Trophy className="w-48 h-48 text-hack-blue relative drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-hack-blue transition-colors" />
                    <Input
                        placeholder="Search credentials..."
                        className="pl-12 bg-card/60 backdrop-blur-sm h-12 rounded-2xl border-border/50 focus:ring-hack-blue/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 p-1.5 bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50">
                    {(["all", "unlocked", "locked"] as const).map((opt) => (
                        <button
                            key={opt}
                            onClick={() => setFilter(opt)}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                filter === opt ? "bg-hack-blue text-white shadow-lg" : "hover:bg-secondary text-muted-foreground"
                            )}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
                {filteredBadges.map((badge) => {
                    const isUnlocked = unlockedIds.has(badge.id);
                    return (
                        <motion.div
                            layout
                            key={badge.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -8 }}
                            className="group"
                        >
                            <Card className={cn(
                                "h-full bg-card/30 backdrop-blur-xl border-border/40 transition-all duration-700 overflow-hidden relative rounded-[32px]",
                                "hover:bg-card/50 hover:border-hack-blue/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(59,130,246,0.1)]",
                                !isUnlocked && "grayscale-[0.5] opacity-90"
                            )}>
                                {/* Mouse Spotlight Effect (Simplified CSS Version) */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(59,130,246,0.1)_0%,transparent_70%)] transition-opacity duration-500 pointer-events-none" />

                                <CardContent
                                    className="p-8 flex flex-col items-center gap-8 relative z-10"
                                    onMouseMove={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                                        e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                                        e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
                                    }}
                                >
                                    <div className="relative">
                                        {isUnlocked && (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                                className="absolute -inset-6 bg-[conic-gradient(from_0deg,transparent,rgba(59,130,246,0.2),transparent)] rounded-full blur-xl"
                                            />
                                        )}
                                        <PremiumBadge
                                            badge={badge}
                                            locked={!isUnlocked}
                                            size="lg"
                                            showLabel={false}
                                        />
                                    </div>

                                    <div className="text-center space-y-3">
                                        <h3 className={cn(
                                            "text-xs font-black uppercase tracking-[0.2em] leading-tight",
                                            isUnlocked ? "text-foreground" : "text-muted-foreground/60"
                                        )}>
                                            {badge.name}
                                        </h3>
                                        <p className="text-[10px] text-muted-foreground/80 font-bold leading-relaxed uppercase tracking-wider line-clamp-2 min-h-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            {badge.description}
                                        </p>
                                    </div>

                                    {!isUnlocked ? (
                                        <div className="w-full pt-6 border-t border-border/20 flex flex-col items-center gap-3">
                                            <div className="flex items-center gap-2 text-[8px] font-black text-muted-foreground uppercase tracking-widest px-4 py-1.5 bg-secondary/30 rounded-full border border-border/20">
                                                <Lock className="w-2.5 h-2.5" />
                                                <span>Restricted Access</span>
                                            </div>
                                            <span className="text-[7px] font-black text-muted-foreground/50 uppercase tracking-[0.3em] font-mono italic">REQ: {badge.criteria}</span>
                                        </div>
                                    ) : (
                                        <div className="w-full pt-6 border-t border-border/20 flex items-center justify-center">
                                            <div className="flex items-center gap-2 px-4 py-1.5 bg-hack-blue/10 rounded-full text-hack-blue border border-hack-blue/20">
                                                <CheckCircle2 className="w-2.5 h-2.5" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Mastered</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {filteredBadges.length === 0 && (
                <div className="py-24 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mb-6">
                        <Filter className="w-8 h-8 text-muted-foreground opacity-20" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Threshold Not Met / No Accolades Found</p>
                </div>
            )}
        </div>
    );
}
