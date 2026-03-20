import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
   Activity,
   CheckCircle2,
   Crown,
   ChevronRight,
   Bell,
   Clock,
   Plus,
   Trash2,
   Layout,
   Cpu,
   Database,
   ShieldAlert,
   Play,
   Pause,
   RotateCcw,
   Sparkles,
   Target,
   Flame
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAppContext } from "../context/AppContext";
import { cn } from "../components/ui/utils";
import { Badge } from "../components/ui/badge";

export function ProductivityView() {
   const navigate = useNavigate();
   const {
      user,
      teams,
      allProfiles,
      personalReminders,
      addPersonalReminder,
      toggleReminder,
      deleteReminder,
      fetchPublicProfiles,
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

   // Calculate personal stats from all teams (Real-time tracking)
   const allPersonalTasks = (teams || []).flatMap((t: any) => (t.tasks || []).filter((task: any) => task.assignee_id === user?.id));
   const completedPersonalTasks = allPersonalTasks.filter((t: any) => t.status === 'done');

   // Global Ranking Logic (Real-time tracking)
   const sortedProfiles = [...(allProfiles || [])].sort((a, b) => (b.reputation || b.xp || 0) - (a.reputation || a.xp || 0));
   const globalRank = sortedProfiles.findIndex(p => p.id === user?.id) + 1 || "N/A";
   const topPerformers = sortedProfiles.slice(0, 5);

   // Domain Analysis Logic (Dynamic parsing of task labels & specific roles real-time)
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

   // Inject assigned technical roles directly into domain mastery (Real-time tracking)
   const myMemberships = (teams || []).map(t => t.currentMembers.find((m:any) => m.id === user?.id)).filter(Boolean);
   myMemberships.forEach((m: any) => {
      (m.technical_roles || []).forEach((role: string) => {
         if (role === "Frontend") domainMap["Frontend"] += 3;
         else if (role === "Backend") domainMap["Backend"] += 3;
         else if (role === "Design") domainMap["Design"] += 3;
         else if (role === "Security") domainMap["Security"] += 3;
         else if (role === "DevOps" || role === "Database") domainMap["Database"] += 3;
         else if (role === "Full-stack") {
             domainMap["Frontend"] += 2;
             domainMap["Backend"] += 2;
             domainMap["Database"] += 1;
         }
      });
   });

   const maxDomainScore = Math.max(...Object.values(domainMap), 5); // Base of 5 for scaling
   
   const masteryData = [
      { label: "Frontend", progress: Math.min(100, Math.floor((domainMap["Frontend"] / maxDomainScore) * 100)), icon: Layout, color: "from-blue-500 to-indigo-500" },
      { label: "Backend", progress: Math.min(100, Math.floor((domainMap["Backend"] / maxDomainScore) * 100)), icon: Cpu, color: "from-emerald-400 to-emerald-600" },
      { label: "Security", progress: Math.min(100, Math.floor((domainMap["Security"] / (maxDomainScore * 0.8)) * 100)), icon: ShieldAlert, color: "from-rose-500 to-orange-500" },
      { label: "Data & DevOps", progress: Math.min(100, Math.floor((domainMap["Database"] / maxDomainScore) * 100)), icon: Database, color: "from-amber-400 to-orange-500" }
   ];

   const currentXP = user?.xp || 0;
   const currentLevel = user?.level || 1;
   const nextLevelXP = currentLevel * 100;
   const progressToNextLevel = (currentXP % 100);

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
      <div className="h-full overflow-y-auto bg-[#0A0A0A] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] text-foreground relative font-sans selection:bg-indigo-500/30">
         
         <div className="max-w-[1400px] mx-auto p-4 md:p-8 lg:p-12 space-y-8 relative z-10">
            
            {/* Ultra-Premium Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-white/5">
               <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground backdrop-blur-md">
                     <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Professional Overview
                  </div>
                  <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40">
                     Performance Hub
                  </h1>
                  <p className="text-sm font-medium text-muted-foreground/80 max-w-lg leading-relaxed">
                     A comprehensive oversight of your real-time analytics, skill mapping, and network standing. Designed for elite execution.
                  </p>
               </div>

               <div className="bg-white/[0.02] backdrop-blur-2xl px-8 py-6 rounded-[2rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center gap-8 group hover:border-white/20 transition-colors">
                  <div className="text-right">
                     <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Verified Reputation</div>
                     <div className="text-4xl font-bold tracking-tighter text-white drop-shadow-sm">
                        {(user as any)?.reputation?.toLocaleString() || 0} <span className="text-indigo-400 text-lg">RP</span>
                     </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                     <Crown className="w-6 h-6 text-indigo-400" />
                  </div>
               </div>
            </header>

            {/* Top Bento Grid - Rank & Streak */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               
               {/* Level & XP progression (Spans 2 columns) */}
               <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="md:col-span-2 p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500"
               >
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none group-hover:bg-indigo-500/15 transition-colors duration-700" />
                  <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />

                  <div className="relative z-10 flex flex-col h-full justify-between">
                     <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
                        <div className="space-y-2">
                           <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                              <Target className="w-4 h-4" /> Global Rank
                           </h3>
                           <div className="flex items-center gap-6 mt-2">
                              <span className="text-7xl md:text-8xl font-semibold tracking-tighter text-white drop-shadow-md">
                                 #{globalRank}
                              </span>
                              <div className="flex flex-col justify-center">
                                 <span className="text-2xl font-semibold text-white/90">Level {currentLevel}</span>
                                 <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                                    {user?.rank || "Verified Member"}
                                 </span>
                              </div>
                           </div>
                        </div>
                        <div className="sm:text-right bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
                           <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Accumulated Experience</div>
                           <div className="text-3xl font-bold tracking-tight text-white">
                              {currentXP} <span className="text-muted-foreground/60 text-lg font-medium">/ {nextLevelXP}</span>
                           </div>
                        </div>
                     </div>

                     <div className="mt-16 space-y-4">
                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                           <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressToNextLevel}%` }}
                              transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 rounded-full relative"
                           >
                              <div className="absolute inset-0 bg-white/20 w-full h-full [mask-image:linear-gradient(90deg,transparent,white,transparent)] -translate-x-full animate-[shimmer_2s_infinite]" />
                           </motion.div>
                        </div>
                        <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-widest">
                           <span className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> Tracking Active
                           </span>
                           <span>{100 - progressToNextLevel} XP Remainder</span>
                        </div>
                     </div>
                  </div>
               </motion.div>

               {/* Streak tracking */}
               <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                  className="p-8 md:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 shadow-2xl hover:border-white/20 transition-all duration-500 flex flex-col justify-between relative overflow-hidden group"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative z-10 space-y-1">
                     <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-widest flex items-center gap-2">
                        <Flame className="w-4 h-4" /> Active Streak
                     </h3>
                     <div className="flex items-baseline gap-3 mt-4">
                        <span className="text-7xl font-semibold tracking-tighter text-white drop-shadow-md">{user?.streak_count || 0}</span>
                        <span className="text-lg font-medium text-muted-foreground">Days</span>
                     </div>
                  </div>

                  <div className="relative z-10 grid grid-cols-7 gap-2 mt-auto pt-8">
                     {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                        const isActive = (user?.streak_count || 0) > day;
                        return (
                           <div key={day} className="flex flex-col items-center gap-2">
                              <div className={cn(
                                 "w-full aspect-square rounded-[8px] border transition-all duration-700",
                                 isActive ? "bg-gradient-to-br from-orange-400 to-rose-500 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]" : "bg-white/5 border-white/10"
                              )} />
                              <span className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-widest">D{day+1}</span>
                           </div>
                        );
                     })}
                  </div>
               </motion.div>
            </div>

            {/* Middle Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               
               {/* Focus Timer */}
               <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-8 md:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 shadow-2xl flex items-center justify-between group hover:border-white/20 transition-all duration-500 relative overflow-hidden"
               >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 space-y-8 flex-1">
                     <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                           <Clock className="w-4 h-4" /> Focus Session
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground">
                           {focusPhase === 'work' ? "Deep work interval activated." : "Rest interval activated."}
                        </p>
                     </div>

                     <div className="text-7xl lg:text-8xl font-semibold tracking-tighter tabular-nums text-white drop-shadow-md py-4">
                        {formatTime(timeLeft)}
                     </div>

                     <div className="flex gap-4">
                        <Button
                           onClick={() => setIsFocusActive(!isFocusActive)}
                           className={cn(
                              "h-14 px-8 rounded-2xl font-semibold text-base transition-all shadow-xl",
                              isFocusActive ? "bg-white/10 text-white hover:bg-white/20 border border-white/10" : "bg-blue-600 text-white hover:bg-blue-500 border-none hover:shadow-blue-500/25"
                           )}
                        >
                           {isFocusActive ? <Pause className="w-5 h-5 mr-3" /> : <Play className="w-5 h-5 mr-3 ml-1" />}
                           {isFocusActive ? "Pause" : "Start Focus"}
                        </Button>
                        <Button
                           onClick={() => { setTimeLeft(focusPhase === 'work' ? 25 * 60 : 5 * 60); setIsFocusActive(false); }}
                           variant="outline"
                           className="h-14 w-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                        >
                           <RotateCcw className="w-5 h-5" />
                        </Button>
                     </div>
                  </div>

                  {/* Stunning animated ring */}
                  <div className="relative w-48 h-48 hidden sm:flex items-center justify-center shrink-0 ml-8 z-10">
                     <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                        <circle cx="96" cy="96" r="88" className="stroke-white/5 fill-none stroke-[6px]" />
                        <motion.circle
                           cx="96"
                           cy="96"
                           r="88"
                           className={cn(
                              "fill-none stroke-[6px] transition-colors duration-500",
                              isFocusActive ? "stroke-blue-500" : "stroke-white/20"
                           )}
                           strokeDasharray="552.9"
                           animate={{ strokeDashoffset: 552.9 - (552.9 * (timeLeft / (focusPhase === 'work' ? 25 * 60 : 5 * 60))) }}
                           transition={{ duration: 1, ease: "linear" }}
                           strokeLinecap="round"
                        />
                     </svg>
                  </div>
               </motion.div>

               {/* Real-time Activity Log */}
               <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-8 md:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 shadow-2xl flex flex-col h-[340px] hover:border-white/20 transition-all duration-500"
               >
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Activity Log
                     </h3>
                     <Badge variant="secondary" className="bg-white/10 border-white/5 text-white font-semibold text-xs py-1 px-3 rounded-full">
                        {completedPersonalTasks.length} Secured
                     </Badge>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                     {completedPersonalTasks.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                           <div className="text-sm font-medium text-white">No recent completions recorded.</div>
                        </div>
                     ) : (
                        completedPersonalTasks.slice(0, 10).map((task: any, i: number) => (
                           <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group">
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50 group-hover:bg-emerald-400 group-hover:shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all" />
                              <span className="text-[15px] font-medium tracking-tight text-white/90 truncate flex-1">{task.title}</span>
                              <span className="text-[11px] text-muted-foreground font-mono bg-black/20 px-2 py-1 rounded-md hidden sm:block">#{task.id?.substring(0,6)}</span>
                           </div>
                        ))
                     )}
                  </div>
               </motion.div>
            </div>

            {/* Bottom Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               
               {/* Skill Matrix */}
               <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="md:col-span-2 p-8 md:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 shadow-2xl flex flex-col justify-between hover:border-white/20 transition-all duration-500 relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.03),transparent_50%)] pointer-events-none" />
                  
                  <div className="mb-10 relative z-10">
                     <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest flex items-center gap-2">
                        <Layout className="w-4 h-4 text-purple-400" /> Skill & Mastery Matrix
                     </h3>
                     <p className="text-sm font-medium text-muted-foreground/80 mt-2 max-w-md leading-relaxed">
                        Evaluated from real-time task completions and assigned team roles across your workspaces. The brighter the gradient, the higher the proficiency.
                     </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-10 relative z-10">
                     {masteryData.map((skill, i) => (
                        <div key={i} className="space-y-4">
                           <div className="flex justify-between items-center text-sm font-semibold">
                              <span className="flex items-center gap-2 text-white/90">
                                 <skill.icon className="w-4 h-4 text-muted-foreground/60" /> {skill.label}
                              </span>
                              <span className="text-sm text-white font-mono">{skill.progress}%</span>
                           </div>
                           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <motion.div
                                 initial={{ width: 0 }}
                                 animate={{ width: `${skill.progress}%` }}
                                 transition={{ duration: 1.2, delay: 0.5 + (i * 0.1), ease: "circOut" }}
                                 className={cn("h-full rounded-full shadow-[0_0_15px_rgba(0,0,0,0.2)]", `bg-gradient-to-r ${skill.color}`)}
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               </motion.div>

               {/* Reminders list */}
               <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-8 md:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 shadow-2xl flex flex-col h-[400px] hover:border-white/20 transition-all duration-500"
               >
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest flex items-center gap-2">
                        <Bell className="w-4 h-4 text-rose-400" /> Pending Objectives
                     </h3>
                  </div>

                  <form onSubmit={handleAddReminder} className="flex gap-3 mb-6">
                     <Input
                        value={newReminder}
                        onChange={(e) => setNewReminder(e.target.value)}
                        placeholder="Define new objective..."
                        className="bg-white/5 border-white/10 rounded-2xl text-sm focus-visible:ring-1 focus-visible:ring-white/30 h-12 px-5 text-white placeholder:text-muted-foreground/50 transition-colors"
                     />
                     <Button type="submit" size="icon" className="rounded-2xl shrink-0 p-0 w-12 h-12 bg-white text-black hover:bg-white/90 shadow-md">
                        <Plus className="w-5 h-5" />
                     </Button>
                  </form>

                  <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                     <AnimatePresence>
                        {personalReminders.length === 0 ? (
                           <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="h-full flex text-center flex-col items-center justify-center opacity-40 mt-8"
                           >
                              <CheckCircle2 className="w-8 h-8 mb-3 opacity-50 text-white" />
                              <span className="text-sm font-medium text-white">Your queue is thoroughly cleared.</span>
                           </motion.div>
                        ) : (
                           personalReminders.map((rem: any) => (
                              <motion.div 
                                 key={rem.id}
                                 layout
                                 initial={{ opacity: 0, scale: 0.95 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 exit={{ opacity: 0, scale: 0.9 }}
                                 className="p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 flex items-center justify-between group transition-colors"
                              >
                                 <div className="flex items-center gap-4">
                                    <button
                                       onClick={() => toggleReminder(rem.id, !rem.is_completed)}
                                       className={cn(
                                          "w-5 h-5 rounded-full border transition-all flex items-center justify-center shrink-0",
                                          rem.is_completed ? "bg-white border-white text-black" : "border-white/20 hover:border-white/40 bg-transparent"
                                       )}
                                    >
                                       {rem.is_completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    </button>
                                    <span className={cn(
                                       "text-[15px] tracking-tight line-clamp-2",
                                       rem.is_completed ? "text-muted-foreground/40 line-through font-normal" : "text-white/90 font-medium"
                                    )}>
                                       {rem.content}
                                    </span>
                                 </div>
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteReminder(rem.id)}
                                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 h-8 w-8 transition-opacity shrink-0 ml-2 rounded-xl"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </Button>
                              </motion.div>
                           ))
                        )}
                     </AnimatePresence>
                  </div>
               </motion.div>
            </div>

            {/* Leaderboard minimal strip */}
            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.6 }}
               className="p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-white/10 shadow-2xl mt-4 hover:border-white/20 transition-all duration-500 cursor-pointer group inline-block w-full"
               onClick={() => navigate('/leaderboard')}
            >
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-2">
                     <h3 className="text-sm font-semibold text-amber-400/90 uppercase tracking-widest flex items-center gap-2">
                        <Crown className="w-4 h-4" /> Network Standing
                     </h3>
                     <p className="text-sm font-medium text-muted-foreground/80">Compare your reputation amongst the top active performers globally.</p>
                  </div>

                  <div className="flex items-center gap-6">
                     <div className="flex -space-x-4">
                        {topPerformers.map((profile: any, i: number) => (
                           <div key={profile.id} className={cn(
                              "relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-500 hover:z-10 hover:scale-110",
                              profile.id === user?.id ? "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]" : "border-[#111] hover:border-white/50",
                              `z-[${5 - i}]`
                           )}>
                              <img src={profile.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile.id}`} alt={profile.name} className="w-full h-full object-cover bg-black" />
                           </div>
                        ))}
                     </div>
                     <span className="text-xs font-semibold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors flex items-center pl-4 border-l border-white/10">
                        View Leaderboard <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                     </span>
                  </div>
               </div>
            </motion.div>
         </div>
      </div>
   );
}
