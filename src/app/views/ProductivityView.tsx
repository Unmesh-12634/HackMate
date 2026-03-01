import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
   Zap,
   Shield,
   Target,
   History as LucideHistory,
   Award,
   Activity,
   CheckCircle2,
   TrendingUp,
   Flame,
   Trophy,
   Star,
   Crown,
   ChevronRight,
   Search,
   Filter,
   Bell,
   Clock,
   Plus,
   Trash2,
   Layout,
   Globe,
   Cpu,
   Database,
   ShieldAlert,
   Play,
   Pause,
   RotateCcw,
   Gamepad2,
   Binary
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { useAppContext } from "../context/AppContext";
import { cn } from "../components/ui/utils";

// --- Sub-components ---

const StatCard: React.FC<{
   label: string,
   value: string | number,
   icon: any,
   color: string,
   delay: number
}> = ({ label, value, icon: Icon, color, delay }) => (
   <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-6 rounded-[2.5rem] bg-card/60 border border-border/40 backdrop-blur-xl flex flex-col justify-between group hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5"
   >
      <div className={`p-4 rounded-2xl bg-secondary w-fit border border-border/30 ${color} group-hover:scale-110 transition-transform duration-500`}>
         <Icon className="w-6 h-6" />
      </div>
      <div>
         <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1">{label}</div>
         <div className="text-2xl font-black text-foreground uppercase tracking-tighter font-mono">{value}</div>
      </div>
   </motion.div>
);

export function ProductivityView() {
   const {
      user,
      teams,
      allProfiles,
      personalReminders,
      milestones,
      addPersonalReminder,
      toggleReminder,
      deleteReminder,
      fetchPublicProfiles,
      claimTacticalBounty,
      syncStreak
   } = useAppContext();

   const [newReminder, setNewReminder] = useState("");

   // Sync streak on load
   useEffect(() => {
      syncStreak();
   }, []);

   // Focus Timer State
   const [timeLeft, setTimeLeft] = useState(25 * 60);
   const [isFocusActive, setIsFocusActive] = useState(false);
   const [focusPhase, setFocusPhase] = useState<'work' | 'break'>('work');

   useEffect(() => {
      let interval: any;
      if (isFocusActive && timeLeft > 0) {
         interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
         }, 1000);
      } else if (timeLeft === 0) {
         setIsFocusActive(false);
         if (focusPhase === 'work') {
            setFocusPhase('break');
            setTimeLeft(5 * 60);
         } else {
            setFocusPhase('work');
            setTimeLeft(25 * 60);
         }
      }
      return () => clearInterval(interval);
   }, [isFocusActive, timeLeft, focusPhase]);

   const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
   };

   // Fetch profiles if not already present for global ranking
   useEffect(() => {
      if (!allProfiles || allProfiles.length === 0) {
         fetchPublicProfiles();
      }
   }, []);

   // Calculate personal stats from all teams
   const allPersonalTasks = (teams || []).flatMap((t: any) => (t.tasks || []).filter((task: any) => task.assignee_id === user?.id));
   const completedPersonalTasks = allPersonalTasks.filter((t: any) => t.status === 'done');
   const totalImpact = completedPersonalTasks.length;

   // Global Ranking Logic
   const sortedProfiles = [...(allProfiles || [])].sort((a, b) => (b.reputation || b.xp || 0) - (a.reputation || a.xp || 0));
   const globalRank = sortedProfiles.findIndex(p => p.id === user?.id) + 1 || "N/A";
   const topPerformers = sortedProfiles.slice(0, 5);

   // Domain Analysis Logic (Dynamic parsing of task labels)
   const domainMap: Record<string, number> = {
      "Frontend": 0,
      "Backend": 0,
      "Design": 0,
      "Security": 0,
      "Database": 0
   };

   completedPersonalTasks.forEach((task: any) => {
      const labels = (task.labels || []).map((l: string) => l.toLowerCase());
      if (labels.some((l: string) => l.includes('front') || l.includes('ui') || l.includes('css'))) domainMap["Frontend"]++;
      if (labels.some((l: string) => l.includes('back') || l.includes('node') || l.includes('api'))) domainMap["Backend"]++;
      if (labels.some((l: string) => l.includes('design') || l.includes('ux') || l.includes('figma'))) domainMap["Design"]++;
      if (labels.some((l: string) => l.includes('sec') || l.includes('auth') || l.includes('cyber'))) domainMap["Security"]++;
      if (labels.some((l: string) => l.includes('db') || l.includes('sql') || l.includes('mongo') || l.includes('supabase'))) domainMap["Database"]++;
   });

   const totalDomainScore = Object.values(domainMap).reduce((a, b) => a + b, 0) || 1;
   const masteryData = [
      { label: "Frontend Architecture", progress: Math.min(100, Math.floor((domainMap["Frontend"] / 5) * 100)), color: "bg-blue-500", glow: "shadow-blue-500/20", icon: Layout },
      { label: "Neural Backend", progress: Math.min(100, Math.floor((domainMap["Backend"] / 5) * 100)), color: "bg-emerald-500", glow: "shadow-emerald-500/20", icon: Cpu },
      { label: "Logic Security", progress: Math.min(100, Math.floor((domainMap["Security"] / 3) * 100)), color: "bg-rose-500", glow: "shadow-rose-500/20", icon: ShieldAlert },
      { label: "Data Mastery", progress: Math.min(100, Math.floor((domainMap["Database"] / 4) * 100)), color: "bg-amber-500", glow: "shadow-amber-500/20", icon: Database }
   ];

   const currentXP = user?.xp || 0;
   const currentLevel = user?.level || 1;
   const nextLevelXP = currentLevel * 100;
   const progressToNextLevel = (currentXP % 100);

   // Proper Real-time Stats
   const activeStreak = user?.streak_count || 0;

   const growthStats = [
      { label: "GLOBAL_STANDING", value: `#${globalRank}`, icon: Crown, color: "text-amber-400" },
      { label: "OPERATIONAL_IMPACT", value: totalImpact, icon: Target, color: "text-blue-500" },
      { label: "ACTIVE_STREAK", value: `${activeStreak} DAYS`, icon: Flame, color: "text-rose-500" },
      { label: "NEURAL_INTELLIGENCE", value: `${currentXP} XP`, icon: Zap, color: "text-emerald-400" },
   ];

   const handleAddReminder = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newReminder.trim()) return;
      addPersonalReminder({
         content: newReminder,
         priority: 'medium',
         due_at: new Date(Date.now() + 86400000).toISOString()
      });
      setNewReminder("");
   };

   return (
      <div className="h-full overflow-y-auto bg-background scrollbar-hide selection:bg-blue-500/30 text-foreground relative">
         {/* Glossy Overlay */}
         <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-600/[0.03] to-transparent pointer-events-none" />

         <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12 space-y-8 md:space-y-12 relative z-10">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/40 pb-12">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] animate-pulse">
                        PERSONAL_EVOLUTION_PROTOCOLS_V4
                     </div>
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black text-foreground uppercase tracking-tighter leading-none italic">
                     GROWTH_<span className="text-blue-500 not-italic">HUB</span>
                  </h1>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.4em] max-w-xl">
                     REAL-TIME BIOMETRIC TRACKING // NEURAL PROGRESSION // OPERATIONAL IMPACT
                  </p>
               </div>

               <div className="bg-card/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-border/40 shadow-2xl flex items-center gap-10">
                  <div className="text-right">
                     <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-2">CURRENT_REPUTATION</div>
                     <div className="text-4xl font-black text-foreground tracking-tighter uppercase font-mono">
                        {(user as any)?.reputation?.toLocaleString() || 0} <span className="text-blue-500 text-sm ml-1">RP</span>
                     </div>
                  </div>
                  <div className="h-12 w-[1px] bg-border/40" />
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                     <Trophy className="w-8 h-8 text-amber-500" />
                  </div>
               </div>
            </header>

            {/* Hero Progression Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-stretch">
               {/* Level Progress Hero */}
               <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="xl:col-span-2 p-10 md:p-14 rounded-[4rem] bg-card border border-border/40 relative overflow-hidden group shadow-2xl"
               >
                  {/* Dynamic Gloss Background */}
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] -mr-300 -mt-300 pointer-events-none group-hover:bg-blue-600/10 transition-all duration-1000" />

                  <div className="relative z-10">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="space-y-4">
                           <h3 className="text-sm font-black text-muted-foreground uppercase tracking-[0.5em]">Neural Rank Protocol</h3>
                           <div className="flex items-baseline gap-6 focus-within:">
                              <span className="text-8xl md:text-[10rem] font-black text-foreground tracking-tighter uppercase font-mono leading-none">
                                 {currentLevel}
                              </span>
                              <div className="flex flex-col">
                                 <span className="text-2xl font-black text-blue-500 uppercase tracking-widest">RANK_#{globalRank}</span>
                                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1 italic">{user?.rank || "Verified Operative"}</span>
                              </div>
                           </div>
                        </div>
                        <div className="text-right space-y-2">
                           <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">XP PACKETS_CAPTURED</div>
                           <div className="text-3xl font-black text-foreground font-mono italic">
                              {currentXP} <span className="text-muted-foreground/30 text-lg mx-2">/</span> {nextLevelXP} <span className="text-blue-500 text-xs ml-1 tracking-widest">X</span>
                           </div>
                        </div>
                     </div>

                     <div className="mt-16 space-y-6">
                        <div className="h-6 w-full bg-secondary rounded-full overflow-hidden border border-border/20 p-1.5 shadow-inner">
                           <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressToNextLevel}%` }}
                              transition={{ duration: 2, ease: "circOut" }}
                              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-[0_0_30px_rgba(37,99,235,0.5)] relative"
                           >
                              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shimmer scale-150" />
                           </motion.div>
                        </div>
                        <div className="flex justify-between text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] font-mono">
                           <span className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                              LVL_{currentLevel}_SYNC_STABLE
                           </span>
                           <span>{100 - progressToNextLevel} XP UNTIL LEVEL {currentLevel + 1}</span>
                        </div>
                     </div>
                  </div>
               </motion.div>

               {/* Neural Streak Sync */}
               <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-10 rounded-[4rem] bg-card border border-border/40 shadow-2xl relative overflow-hidden group"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                  <div className="relative z-10 flex flex-col justify-between h-full space-y-8">
                     <div className="space-y-2">
                        <h3 className="text-xs font-black text-foreground uppercase tracking-[0.5em] flex items-center gap-3">
                           <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                           Neural Streak Sync
                        </h3>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-7 italic font-mono">Continuous_Chain_v2.0</p>
                     </div>

                     <div className="flex items-end justify-between">
                        <div className="text-8xl font-black text-foreground tracking-tighter italic font-mono leading-none">
                           {user?.streak_count || 0}
                           <span className="text-rose-500 text-2xl not-italic ml-2 uppercase font-black tracking-widest">Days</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-7 gap-3 py-4">
                        {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                           const isActive = (user?.streak_count || 0) > day;
                           return (
                              <div key={day} className="space-y-3 flex flex-col items-center">
                                 <div className={cn(
                                    "w-full aspect-square rounded-2xl border transition-all duration-700 relative group/node",
                                    isActive
                                       ? "bg-rose-500/20 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                                       : "bg-secondary/40 border-border/40"
                                 )}>
                                    {isActive && (
                                       <div className="absolute inset-2 bg-rose-500 rounded-lg opacity-40 animate-pulse" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                                 </div>
                                 <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">D_0{day + 1}</span>
                              </div>
                           );
                        })}
                     </div>

                     <p className="text-[9px] text-rose-500/60 font-black uppercase tracking-widest leading-relaxed italic border-l-2 border-rose-500/20 pl-4">
                        // Streak sustained. Neural synapses optimizing for peak efficiency. Performance multiplier active: 1.2x XP.
                     </p>
                  </div>
               </motion.div>
            </div>

            {/* Active Performance Layer (Timer + Bounties) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Focus Timer */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="lg:col-span-2 p-10 rounded-[3.5rem] bg-card border border-border/40 shadow-2xl relative overflow-hidden group"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                     <div className="space-y-6 flex-1">
                        <div className="space-y-2">
                           <h3 className="text-xs font-black text-foreground uppercase tracking-[0.5em] flex items-center gap-3">
                              <Clock className={cn("w-4 h-4", isFocusActive ? "text-blue-500 animate-pulse" : "text-muted-foreground")} />
                              Biometric Focus Sync
                           </h3>
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-7 italic">
                              {focusPhase === 'work' ? "DEEP WORK PROTOCOL ACTIVE" : "NEURAL COOLDOWN INITIATED"}
                           </p>
                        </div>

                        <div className="flex items-center gap-8">
                           <div className="text-7xl md:text-8xl font-black text-foreground font-mono tracking-tighter tabular-nums italic">
                              {formatTime(timeLeft)}
                           </div>
                           <div className="flex flex-col gap-2">
                              <Button
                                 onClick={() => setIsFocusActive(!isFocusActive)}
                                 size="icon"
                                 className={cn(
                                    "h-14 w-14 rounded-2xl transition-all duration-500",
                                    isFocusActive ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                 )}
                              >
                                 {isFocusActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                              </Button>
                              <Button
                                 onClick={() => { setTimeLeft(focusPhase === 'work' ? 25 * 60 : 5 * 60); setIsFocusActive(false); }}
                                 variant="ghost"
                                 size="icon"
                                 className="h-10 w-10 rounded-xl hover:bg-secondary text-muted-foreground"
                              >
                                 <RotateCcw className="w-4 h-4" />
                              </Button>
                           </div>
                        </div>
                     </div>

                     <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                           <circle
                              cx="96"
                              cy="96"
                              r="88"
                              className="stroke-secondary fill-none stroke-[8px]"
                           />
                           <motion.circle
                              cx="96"
                              cy="96"
                              r="88"
                              className="stroke-blue-500 fill-none stroke-[8px]"
                              strokeDasharray="553"
                              animate={{
                                 strokeDashoffset: 553 - (553 * (timeLeft / (focusPhase === 'work' ? 25 * 60 : 5 * 60)))
                              }}
                              transition={{ duration: 1, ease: "linear" }}
                           />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Zap className={cn("w-10 h-10", isFocusActive ? "text-blue-500 animate-pulse" : "text-muted-foreground/20")} />
                        </div>
                     </div>
                  </div>
               </motion.div>

               {/* Daily Bounties */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-10 rounded-[3.5rem] bg-card border border-border/40 shadow-2xl space-y-8 relative overflow-hidden group"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                  <div className="space-y-2 relative z-10">
                     <h3 className="text-xs font-black text-foreground uppercase tracking-[0.5em] flex items-center gap-3">
                        <Gamepad2 className="w-4 h-4 text-amber-500" />
                        Tactical Bounties
                     </h3>
                     <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-7 italic">Daily Mission Parameters</p>
                  </div>

                  <div className="space-y-4 relative z-10">
                     {[
                        { id: "reminders_sync", label: "Sync 3 Reminders", reward: 50, done: personalReminders.length >= 3 },
                        { id: "deep_work", label: "Deep Work Session", reward: 75, done: false }, // Tie to timer later
                        { id: "secure_objective", label: "Secure 1 Objective", reward: 100, done: totalImpact > 0 }
                     ].map((mission, i) => {
                        const isClaimed = user?.bounties_claimed?.includes(mission.id);
                        return (
                           <div key={i} className={cn(
                              "group p-5 rounded-3xl bg-secondary/20 border border-border/20 flex items-center justify-between hover:border-blue-500/20 transition-all duration-500",
                              isClaimed && "opacity-50 grayscale-[0.5]"
                           )}>
                              <div className="flex items-center gap-4">
                                 <div className={cn(
                                    "w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-500",
                                    mission.done ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-secondary border-border/40 text-muted-foreground/40"
                                 )}>
                                    {isClaimed ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className={cn("text-[11px] font-black uppercase tracking-tight", mission.done ? "text-emerald-500" : "text-foreground")}>
                                       {mission.label}
                                    </span>
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Rewarding {mission.reward} XP</span>
                                 </div>
                              </div>

                              {mission.done && !isClaimed ? (
                                 <Button
                                    onClick={() => claimTacticalBounty(mission.id, mission.reward)}
                                    size="sm"
                                    className="h-8 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-[9px] font-black uppercase tracking-widest"
                                 >
                                    Claim
                                 </Button>
                              ) : isClaimed ? (
                                 <Badge variant="outline" className="text-[8px] font-black border-emerald-500/20 text-emerald-500 bg-emerald-500/5 uppercase tracking-widest">Claimed</Badge>
                              ) : (
                                 <Badge variant="outline" className="text-[8px] font-black border-border/40 text-muted-foreground/60 uppercase tracking-widest">{mission.reward} XP</Badge>
                              )}
                           </div>
                        );
                     })}
                  </div>
               </motion.div>
            </div>

            {/* Secondary Data Layer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Neural Reminders & Tactical Log */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-10 rounded-[3.5rem] bg-card border border-border/40 flex flex-col shadow-2xl space-y-8"
               >
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <h3 className="text-xs font-black text-foreground uppercase tracking-[0.5em] flex items-center gap-3">
                              <Bell className="w-4 h-4 text-blue-400" />
                              Neural Reminders
                           </h3>
                           <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-7 italic">Active personal beacons</p>
                        </div>
                        <Badge variant="outline" className="px-3 py-1 text-[9px] border-border/50 uppercase tracking-widest font-black">Live_Alerts</Badge>
                     </div>

                     <form onSubmit={handleAddReminder} className="flex gap-4">
                        <Input
                           value={newReminder}
                           onChange={(e) => setNewReminder(e.target.value)}
                           placeholder="ARM NEW REMINDER..."
                           className="bg-secondary/40 border-border/40 rounded-xl font-mono text-[10px] tracking-widest h-11"
                        />
                        <Button type="submit" size="icon" className="h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-500 shrink-0">
                           <Plus className="w-5 h-5 text-white" />
                        </Button>
                     </form>

                     <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {personalReminders.length === 0 ? (
                           <div className="py-8 text-center opacity-30 text-[9px] font-black uppercase tracking-widest">No active beacons detected.</div>
                        ) : (
                           personalReminders.map((rem: any) => (
                              <div key={rem.id} className="p-4 rounded-xl bg-secondary/20 border border-border/20 flex items-center justify-between group">
                                 <div className="flex items-center gap-4">
                                    <button
                                       onClick={() => toggleReminder(rem.id, !rem.is_completed)}
                                       className={cn(
                                          "w-5 h-5 rounded-md border transition-all flex items-center justify-center",
                                          rem.is_completed ? "bg-blue-500 border-blue-500 text-white" : "border-border/60 hover:border-blue-500/50"
                                       )}
                                    >
                                       {rem.is_completed && <CheckCircle2 className="w-3 h-3" />}
                                    </button>
                                    <span className={cn(
                                       "text-sm font-bold uppercase tracking-tight",
                                       rem.is_completed ? "text-muted-foreground/40 line-through" : "text-foreground/90"
                                    )}>
                                       {rem.content}
                                    </span>
                                 </div>
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteReminder(rem.id)}
                                    className="opacity-0 group-hover:opacity-100 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 h-8 w-8 transition-opacity"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </Button>
                              </div>
                           ))
                        )}
                     </div>
                  </div>

                  <div className="pt-8 border-t border-border/30">
                     <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                           <h3 className="text-xs font-black text-foreground uppercase tracking-[0.5em] flex items-center gap-3">
                              <LucideHistory className="w-4 h-4 text-emerald-400" />
                              Tactical Log
                           </h3>
                        </div>
                     </div>

                     <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {completedPersonalTasks.length === 0 ? (
                           <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
                              <Activity className="w-8 h-8 mb-4 animate-pulse" />
                              <div className="text-[9px] font-black uppercase tracking-[0.3em]">Neural Interface Idle</div>
                           </div>
                        ) : (
                           completedPersonalTasks.slice(0, 5).map((task: any, i: number) => (
                              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                 <span className="text-[11px] font-bold text-foreground/80 lowercase tracking-wide font-mono truncate flex-1">{task.title}</span>
                                 <span className="text-[9px] text-muted-foreground/40 font-mono">SECURED</span>
                              </div>
                           ))
                        )}
                     </div>
                  </div>
               </motion.div>

               {/* Neural Skill Tree & Domain Matrix */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-10 rounded-[3.5rem] bg-card border border-border/40 shadow-2xl relative overflow-hidden group"
               >
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.05),transparent)] pointer-events-none" />

                  <div className="flex items-center justify-between mb-10 relative z-10">
                     <div className="space-y-1">
                        <h3 className="text-xs font-black text-foreground uppercase tracking-[0.5em] flex items-center gap-3">
                           <Binary className="w-4 h-4 text-blue-400" />
                           Neural Skill Tree
                        </h3>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-7 italic">Path of the Elite Operative</p>
                     </div>
                     <Badge variant="outline" className="text-[9px] font-black border-border/40 text-blue-500 bg-blue-500/5 px-3 py-1">v4.2_STABLE</Badge>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 relative z-10">
                     {/* SVG Skill Tree Visualization */}
                     <div className="relative aspect-square max-w-[400px] mx-auto xl:mx-0">
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                           <defs>
                              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                 <stop offset="0%" stopColor="rgba(59,130,246,0.3)" />
                                 <stop offset="100%" stopColor="rgba(37,99,235,0.05)" />
                              </linearGradient>
                           </defs>

                           {/* Connecting Lines */}
                           <line x1="100" y1="100" x2="100" y2="40" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="4 4" />
                           <line x1="100" y1="100" x2="160" y2="100" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="4 4" />
                           <line x1="100" y1="100" x2="100" y2="160" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="4 4" />
                           <line x1="100" y1="100" x2="40" y2="100" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="4 4" />

                           {/* Center Node */}
                           <circle cx="100" cy="100" r="12" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.5)" strokeWidth="2" />

                           {/* Frontend Node */}
                           <g className="cursor-help">
                              <circle cx="100" cy="40" r="8" fill={domainMap["Frontend"] > 0 ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)"} stroke={domainMap["Frontend"] > 0 ? "#3b82f6" : "rgba(255,255,255,0.1)"} />
                              {domainMap["Frontend"] > 0 && <circle cx="100" cy="40" r="12" fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" className="animate-ping" style={{ animationDuration: '3s' }} />}
                           </g>

                           {/* Backend Node */}
                           <g className="cursor-help">
                              <circle cx="160" cy="100" r="8" fill={domainMap["Backend"] > 0 ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)"} stroke={domainMap["Backend"] > 0 ? "#10b981" : "rgba(255,255,255,0.1)"} />
                           </g>

                           {/* Security Node */}
                           <g className="cursor-help">
                              <circle cx="100" cy="160" r="8" fill={domainMap["Security"] > 0 ? "rgba(244,63,94,0.2)" : "rgba(255,255,255,0.05)"} stroke={domainMap["Security"] > 0 ? "#f43f5e" : "rgba(255,255,255,0.1)"} />
                           </g>

                           {/* Database Node */}
                           <g className="cursor-help">
                              <circle cx="40" cy="100" r="8" fill={domainMap["Database"] > 0 ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.05)"} stroke={domainMap["Database"] > 0 ? "#f59e0b" : "rgba(255,255,255,0.1)"} />
                           </g>
                        </svg>

                        {/* Floating Labels */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-[8px] font-black text-blue-500 uppercase tracking-widest">Architect</div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 text-[8px] font-black text-rose-500 uppercase tracking-widest">Guardian</div>
                        <div className="absolute left-0 top-1/2 -translate-x-4 -translate-y-1/2 text-[8px] font-black text-amber-500 uppercase tracking-widest -rotate-90">Master</div>
                        <div className="absolute right-0 top-1/2 translate-x-4 -translate-y-1/2 text-[8px] font-black text-emerald-500 uppercase tracking-widest rotate-90">Engine</div>
                     </div>

                     {/* Details / Legend */}
                     <div className="space-y-6 flex flex-col justify-center">
                        <div className="p-4 rounded-2xl bg-secondary/30 border border-border/20 space-y-4">
                           <h4 className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.3em]">Current Specialization</h4>
                           <div className="space-y-4">
                              {masteryData.map((skill, i) => (
                                 <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center text-[9px] font-black tracking-widest uppercase">
                                       <span className="text-muted-foreground">{skill.label}</span>
                                       <span className="text-foreground">{skill.progress}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                                       <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${skill.progress}%` }}
                                          className={cn("h-full rounded-full", skill.color)}
                                       />
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                        <p className="text-[9px] text-muted-foreground leading-relaxed font-black uppercase tracking-tight italic border-l-2 border-blue-500/20 pl-4">
                           // Neural mapping indicates high affinity for {Object.entries(domainMap).sort((a, b) => b[1] - a[1])[0][0]} protocols. Continue operations to unlock advanced nodes.
                        </p>
                     </div>
                  </div>
               </motion.div>

               {/* Leaderboard Hub */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="p-10 rounded-[3.5rem] bg-card border border-border/40 shadow-2xl relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                     <Globe className="w-32 h-32 text-blue-500 rotate-12" />
                  </div>
                  <div className="relative z-10">
                     <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                           <h3 className="text-xs font-black text-foreground uppercase tracking-[0.5em] flex items-center gap-3">
                              <Trophy className="w-4 h-4 text-amber-500" />
                              Global Collective Standing
                           </h3>
                           <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-7 italic">Top performing operatives</p>
                        </div>
                     </div>

                     <div className="space-y-4">
                        {topPerformers.map((profile: any, i: number) => (
                           <div key={profile.id} className={cn(
                              "p-4 rounded-2xl flex items-center justify-between transition-all",
                              profile.id === user?.id ? "bg-blue-500/10 border border-blue-500/20" : "bg-secondary/10 border border-transparent hover:border-border/40"
                           )}>
                              <div className="flex items-center gap-4">
                                 <div className="text-[10px] font-black text-muted-foreground/40 font-mono w-4">0{i + 1}</div>
                                 <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-border">
                                    <img src={profile.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile.id}`} alt="" className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-xs font-black text-foreground uppercase tracking-tight">{profile.name}</span>
                                    <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">{profile.rank}</span>
                                 </div>
                              </div>
                              <div className="text-[10px] font-black text-blue-500 font-mono">{(profile.reputation || profile.xp || 0).toLocaleString()} RP</div>
                           </div>
                        ))}
                     </div>

                     {allProfiles && allProfiles.length > 5 && (
                        <Button variant="ghost" className="w-full mt-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-blue-500">
                           View Full Leaderboard Protocol <ChevronRight className="w-3 h-3 ml-2" />
                        </Button>
                     )}
                  </div>
               </motion.div>
            </div>
         </div>
      </div>
   );
}
