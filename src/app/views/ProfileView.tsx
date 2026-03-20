import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { useAppContext, Activity as ActivityType } from "../context/AppContext";
import {
   Github,
   Linkedin,
   Globe,
   Mail,
   Edit3,
   Award,
   Zap,
   Users,
   Star,
   Calendar,
   Flame,
   CheckCircle2,
   Trophy,
   Activity as ActivityIcon,
   GitCommit,
   PlusCircle,
   Heart,
   ShieldCheck,
   Gauge,
   ChevronRight,
   Binary
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { SocialListModal } from "../components/SocialListModal";
import { ProfileShareModal } from "../components/ProfileShareModal";
import { User, Activity, Team } from "../context/AppContext";
import { supabase } from "../../lib/supabase";
import { getLevelInfo } from "../utils/xpEngine";

export function ProfileView() {
   const {
      user: currentUser,
      teams: currentTeams,
      followerCount: currentFollowerCount,
      followingCount: currentFollowingCount,
      milestones: currentMilestones,
      fetchFollowersList,
      fetchFollowingList,
      activities: currentActivities,
      recordActivity: addActivity,
      fetchTargetUserMetadata,
      followUser,
      unfollowUser,
      followingIds
   } = useAppContext();
   const navigate = useNavigate();
   const { userId } = useParams();

   const isOwner = !userId || userId === currentUser?.id;

   const [targetData, setTargetData] = useState<{ profile: User, teams: Team[], activities: Activity[], milestones: any[] } | null>(null);
   const [loading, setLoading] = useState(!isOwner);
   const [showShareModal, setShowShareModal] = useState(false);

   useEffect(() => {
      async function load() {
         if (!isOwner && userId) {
            setLoading(true);
            const data = await fetchTargetUserMetadata(userId);
            setTargetData(data);
            setLoading(false);
         } else {
            setTargetData(null);
            setLoading(false);
         }
      }
      load();

      // Real-time listener for visitor profile activities
      if (!isOwner && userId && supabase) { // Ensure supabase is available
         const channel = supabase.channel(`profile_activity_${userId}`)
            .on('postgres_changes',
               { event: 'INSERT', schema: 'public', table: 'activities', filter: `user_id=eq.${userId}` },
               (payload: any) => {
                  setTargetData(prev => {
                     if (!prev) return prev;
                     const newAct = payload.new as Activity;
                     return {
                        ...prev,
                        activities: [newAct, ...prev.activities].slice(0, 50)
                     };
                  });
               }
            )
            .subscribe();

         const milestoneChannel = supabase.channel(`profile_milestones_${userId}`)
            .on('postgres_changes',
               { event: 'INSERT', schema: 'public', table: 'user_milestones', filter: `user_id=eq.${userId}` },
               (payload: any) => {
                  setTargetData(prev => {
                     if (!prev) return prev;
                     return {
                        ...prev,
                        milestones: [payload.new, ...prev.milestones]
                     };
                  });
               }
            )
            .subscribe();

         const profileChannel = supabase.channel(`profile_stats_${userId}`)
            .on('postgres_changes',
               { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
               (payload: any) => {
                  setTargetData(prev => {
                     if (!prev) return prev;
                     return {
                        ...prev,
                        profile: { 
                           ...prev.profile, 
                           ...payload.new,
                           role: payload.new.primary_role !== undefined ? payload.new.primary_role : prev.profile.role 
                        }
                     };
                  });
               }
            )
            .subscribe();

         return () => {
            supabase.removeChannel(channel);
            supabase.removeChannel(milestoneChannel);
            supabase.removeChannel(profileChannel);
         };
      }
   }, [userId, isOwner, supabase]); // Add supabase to dependency array

   // Use target data if visiting, otherwise use current user context
   const user = isOwner ? currentUser : targetData?.profile;
   const teams = isOwner ? currentTeams : (targetData?.teams || []);
   const activities = isOwner ? currentActivities : (targetData?.activities || []);
   const milestones = isOwner ? currentMilestones : (targetData?.milestones || []);
   const followerCount = isOwner ? currentFollowerCount : (user?.follower_count || 0);
   const followingCount = isOwner ? currentFollowingCount : (user?.following_count || 0);

   const isFollowing = followingIds.includes(userId || "");

   const [socialListType, setSocialListType] = useState<"followers" | "following" | null>(null);
   const [socialListUsers, setSocialListUsers] = useState<User[]>([]);
   const [isSocialListLoading, setIsSocialListLoading] = useState(false);

   const handleOpenSocialList = async (type: "followers" | "following") => {
      if (!user) return;
      setSocialListType(type);
      setIsSocialListLoading(true);
      const list = type === "followers"
         ? await fetchFollowersList(user.id)
         : await fetchFollowingList(user.id);
      setSocialListUsers(list);
      setIsSocialListLoading(false);
   };

   const handleToggleFollow = async () => {
      if (!userId || !currentUser) return;
      if (isFollowing) {
         await unfollowUser(userId);
      } else {
         await followUser(userId);
      }
      // Re-fetch target data to update counts
      if (userId) {
         const data = await fetchTargetUserMetadata(userId);
         setTargetData(data);
      }
   };

   // Calculated Stats
   const teamsLed = teams.filter(t => (t.role || "").toLowerCase().includes("lead")).length;
   const projectsJoined = teams.length;
   const totalWins = milestones.filter((m: any) => (m.title || "").toLowerCase().includes("win") || (m.title || "").toLowerCase().includes("champion")).length;
   const reputation = user?.reputation || 0;

   const ALL_BADGES = [
      { id: 'early_adopter', name: "Early Adopter", icon: Zap, color: "text-hack-blue", bg: "bg-hack-blue/10", check: () => true },
      { id: 'squad_leader_1', name: "Squad Leader", icon: Users, color: "text-hack-purple", bg: "bg-hack-purple/10", check: () => teamsLed >= 1, hint: "Lead 1 team" },
      { id: 'battalion_commander', name: "Battalion Commander", icon: ShieldCheck, color: "text-hack-neon", bg: "bg-hack-neon/10", check: () => teamsLed >= 5, hint: "Lead 5 teams" },
      { id: 'veteran_status', name: "Veteran Researcher", icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10", check: () => projectsJoined >= 10, hint: "Join 10 projects" },
      { id: 'productivity_titan', name: "Productivity Titan", icon: Gauge, color: "text-orange-500", bg: "bg-orange-500/10", check: () => activities.length >= 50, hint: "50 pulses recorded" },
   ];

   const badges = ALL_BADGES.map(b => ({
      ...b,
      isUnlocked: b.check()
   }));

   const skills = user?.skills && user.skills.length > 0
      ? user.skills
      : ["No skills listed"];

   // Generate Activity Heatmap Data
   const heatmapWeeks = useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const counts = new Map<string, number>();
      activities.forEach(act => {
         const dateString = new Date(act.created_at).toISOString().split('T')[0];
         counts.set(dateString, (counts.get(dateString) || 0) + 1);
      });

      // 52 weeks * 7 days = 364 days. We generate exactly 52 columns.
      const days = [];
      for (let i = 363; i >= 0; i--) {
         const d = new Date(today.getTime());
         d.setDate(d.getDate() - i);
         const dateStr = d.toISOString().split('T')[0];
         days.push({
            date: dateStr,
            count: counts.get(dateStr) || 0,
         });
      }

      // chunk into weeks
      const weeks = [];
      for (let i = 0; i < days.length; i += 7) {
         weeks.push(days.slice(i, i + 7));
      }
      return weeks;
   }, [activities]);

   const groupedActivities = useMemo(() => {
      const groups: { title: string, items: Activity[] }[] = [
         { title: 'Today', items: [] },
         { title: 'Yesterday', items: [] },
         { title: 'Earlier Recorded pulses', items: [] }
      ];
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      activities.forEach(act => {
         const d = new Date(act.created_at);
         if (d >= today) groups[0].items.push(act);
         else if (d >= yesterday) groups[1].items.push(act);
         else groups[2].items.push(act);
      });
      return groups.filter(g => g.items.length > 0);
   }, [activities]);

   const getLevelClass = (count: number) => {
      if (count === 0) return "bg-secondary hover:bg-secondary/80";
      if (count <= 1) return "bg-hack-neon/30 hover:bg-hack-neon/50";
      if (count <= 3) return "bg-hack-neon/60 hover:bg-hack-neon/80";
      if (count <= 5) return "bg-hack-neon/90 hover:bg-hack-neon shadow-[0_0_8px_rgba(0,255,255,0.4)]";
      return "bg-hack-neon hover:bg-hack-neon shadow-[0_0_12px_rgba(0,255,255,0.8)]";
   };

   return (
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-20 px-4 md:px-0">
         {/* Profile Header */}
         <Card className="relative overflow-hidden border-border/40 shadow-xl rounded-[24px] md:rounded-[32px] bg-card/50">
            <div className="h-32 md:h-48 bg-gradient-to-r from-hack-blue via-indigo-600 to-indigo-900" />
            <div className="absolute top-4 right-4 z-20">
               <Button variant="secondary" size="sm" className="gap-2 bg-background/50 backdrop-blur-md border border-border/50 text-foreground hover:bg-background/80" onClick={() => navigate("/settings")}>
                  <Github className="w-4 h-4" /> Connect GitHub
               </Button>
            </div>
            <CardContent className="pt-0 relative px-8 pb-20">
               <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8 -mt-16 md:-mt-20 mb-6 md:mb-10 text-center md:text-left z-10 relative">
                  <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background ring-4 ring-hack-blue/20 shadow-2xl">
                     <AvatarImage src={user?.avatar} />
                     <AvatarFallback>AX</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center md:text-left">
                     <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                        <h1 className="text-3xl font-black tracking-tight text-white">{user?.name || "Operative"}</h1>
                        <div className="flex items-center gap-2">
                           <Badge variant="outline" className="border-hack-blue/50 text-hack-blue bg-hack-blue/5 px-2 py-0 text-[10px] uppercase font-black tracking-widest">
                              {user?.rank || "Operative"}
                           </Badge>
                           <div className="bg-hack-neon/10 border border-hack-neon/20 px-2 py-0.5 rounded text-[10px] font-black text-hack-neon uppercase">
                              Lvl {getLevelInfo(user?.reputation || 0).level}
                           </div>
                        </div>
                     </div>
                     <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2">
                        {user?.role || "Developer"} <span className="w-1 h-1 rounded-full bg-slate-600" /> {user?.email}
                     </p>
                  </div>
                  <div className="flex gap-3 pb-2">
                     {isOwner ? (
                        <>
                           <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/settings")}><Edit3 className="w-4 h-4" /> Edit Profile</Button>
                           <Button size="sm" className="gap-2" onClick={() => setShowShareModal(true)}>Share Profile</Button>
                        </>
                     ) : (
                        <>
                           <Button
                              size="sm"
                              className={cn("gap-2 w-32 font-bold", isFollowing ? "bg-slate-800 text-white" : "bg-hack-blue text-white shadow-lg shadow-hack-blue/20")}
                              onClick={handleToggleFollow}
                           >
                              {isFollowing ? "Unfollow" : "Follow"}
                           </Button>
                           <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => navigate('/community', { state: { mode: 'intel', targetId: user?.id } })}
                           >
                              <Mail className="w-4 h-4" /> Message
                           </Button>
                        </>
                     )}
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-6 gap-6 pt-6 border-t border-border/40">
                  {[
                     { label: "Teams Led", value: teamsLed, icon: Users },
                     { label: "Projects Joined", value: projectsJoined, icon: Star },
                     { label: "Total Wins", value: totalWins, icon: Award },
                     { label: "Reputation", value: reputation, icon: Flame },
                     { label: "Followers", value: followerCount, icon: Users, isSocial: true, type: "followers" },
                     { label: "Following", value: followingCount, icon: Users, isSocial: true, type: "following" },
                  ].map(stat => (
                     <div
                        key={stat.label}
                        className={cn(
                           "text-center md:text-left",
                           (stat as any).isSocial && "cursor-pointer group hover:opacity-80 transition-all"
                        )}
                        onClick={() => (stat as any).isSocial && handleOpenSocialList((stat as any).type)}
                     >
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center justify-center md:justify-start gap-2">
                           <stat.icon className={cn("w-3 h-3", (stat as any).isSocial && "group-hover:text-blue-400")} /> {stat.label}
                        </p>
                        <p className={cn(
                           "text-2xl font-black text-foreground font-['JetBrains_Mono']",
                           (stat as any).isSocial && "group-hover:text-blue-400"
                        )}>
                           {stat.label === "Reputation" ? new Intl.NumberFormat('en-US').format(user?.reputation || 0) : stat.value}
                        </p>
                     </div>
                  ))}
               </div>
            </CardContent>
            {/* ENHANCED XP PROGRESS BAR */}
            <div className="absolute bottom-0 left-0 w-full bg-black/40 backdrop-blur-md border-t border-white/5 px-8 flex items-center gap-4 h-16">
               <div className="flex flex-col justify-center">
                  <div className="text-[9px] font-black text-hack-neon uppercase tracking-[0.3em] mb-0.5">NEURAL_RANK_PROTOCOL</div>
                  <div className="flex items-center gap-2">
                     <Star className="w-5 h-5 text-hack-neon animate-pulse" />
                     <span className="text-2xl font-black text-white uppercase tracking-tighter">
                        LEVEL {getLevelInfo(reputation).level}
                     </span>
                  </div>
               </div>

               <div className="flex-1 relative h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/5 shadow-inner mx-4">
                  <motion.div
                     initial={{ width: 0 }}
                     animate={{ width: `${getLevelInfo(reputation).progressPercent}%` }}
                     transition={{ duration: 1.5 }}
                     className="absolute top-0 left-0 h-full bg-gradient-to-r from-hack-blue via-indigo-500 to-hack-neon shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                  >
                     <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shimmer" />
                  </motion.div>
               </div>

               <div className="text-right flex flex-col justify-center">
                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-0.5">XP PACKETS_CAPTURED</div>
                  <div className="text-2xl font-black text-foreground font-mono italic leading-none">
                     {reputation} <span className="text-muted-foreground/30 text-lg mx-1">/</span> {getLevelInfo(reputation).level === 50 ? 'MAX' : getLevelInfo(reputation).nextLevelXp} <span className="text-hack-blue text-xs ml-1 tracking-widest">X</span>
                  </div>
               </div>
            </div>
         </Card>

         <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6 md:space-y-8 order-2 lg:order-1">
               <Card>
                  <CardHeader><CardTitle className="text-sm uppercase tracking-wider">About Me</CardTitle></CardHeader>
                  <CardContent>
                     <p className="text-sm leading-relaxed text-muted-foreground">
                        {user?.bio || "No bio yet. Click 'Edit Profile' to add one!"}
                     </p>
                     <div className="mt-6 flex flex-wrap gap-4">
                        {user?.socials?.github && <a href={user.socials.github} target="_blank" rel="noreferrer"><Github className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" /></a>}
                        {user?.socials?.linkedin && <a href={user.socials.linkedin} target="_blank" rel="noreferrer"><Linkedin className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" /></a>}
                        {user?.socials?.website && <a href={user.socials.website} target="_blank" rel="noreferrer"><Globe className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" /></a>}
                        <a href={`mailto:${user?.email}`}><Mail className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" /></a>
                     </div>
                  </CardContent>
               </Card>

               <Card className="border border-border/40 bg-card shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-hack-blue/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-hack-blue/10 transition-all duration-500" />
                  <CardHeader><CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center justify-between">
                     <span>Neural Skills</span>
                     <Badge variant="secondary" className="text-[9px] font-black bg-hack-blue/10 text-hack-blue border-hack-blue/20">
                        {skills.filter((s: string) => s !== "No skills listed").length} NODES
                     </Badge>
                  </CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                     {skills.map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="bg-secondary/40 hover:bg-hack-blue/10 hover:text-hack-blue transition-all cursor-default text-[10px] font-black uppercase tracking-wider py-1.5 px-3 border border-border/20">
                           {skill}
                        </Badge>
                     ))}
                  </CardContent>
                  <div className="px-6 pb-4">
                     <Button variant="ghost" className="w-full text-[9px] uppercase font-black tracking-[0.3em] text-muted-foreground hover:text-hack-blue hover:bg-hack-blue/5" onClick={() => navigate('/achievements')}>
                        Advanced Credentials <ChevronRight className="w-3 h-3 ml-2" />
                     </Button>
                  </div>
               </Card>

               <Card className="border border-border/40 bg-card shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.05),transparent)] pointer-events-none" />
                  <CardHeader className="pb-2">
                     <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Binary className="w-4 h-4 text-hack-blue" />
                           <span>Neural Skill Tree</span>
                        </div>
                     </CardTitle></CardHeader>
                  <CardContent>
                     <div className="relative aspect-square max-w-[280px] mx-auto">
                        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                           <defs>
                              <linearGradient id="lineGradProfile" x1="0%" y1="0%" x2="100%" y2="100%">
                                 <stop offset="0%" stopColor="rgba(59,130,246,0.3)" />
                                 <stop offset="100%" stopColor="rgba(37,99,235,0.05)" />
                              </linearGradient>
                              <filter id="glowTree">
                                 <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                 <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                 </feMerge>
                              </filter>
                           </defs>

                           <motion.g
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 1, ease: "easeOut" }}
                           >
                              {/* Center Node */}
                              <circle cx="100" cy="100" r="10" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.5)" strokeWidth="1" />

                              {/* Perimeter mapping */}
                              {(() => {
                                 const activeSkills = user?.skills?.length ? user.skills : ['Recon', 'Tactical', 'Intel', 'Bypass', 'Exploit'];
                                 const totalNodes = activeSkills.length;
                                 const r = 65; 
                                 const textR = 85;
                                 const colors = ['#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899'];

                                 return activeSkills.map((skill, index) => {
                                    const angle = (Math.PI * 2 * index) / totalNodes - Math.PI / 2;
                                    const x = 100 + r * Math.cos(angle);
                                    const y = 100 + r * Math.sin(angle);
                                    
                                    const nextAngle = (Math.PI * 2 * ((index + 1) % totalNodes)) / totalNodes - Math.PI / 2;
                                    const nextX = 100 + r * Math.cos(nextAngle);
                                    const nextY = 100 + r * Math.sin(nextAngle);

                                    const textX = 100 + textR * Math.cos(angle);
                                    const textY = 100 + textR * Math.sin(angle);
                                    const skillColor = colors[index % colors.length];

                                    return (
                                       <g key={skill + index}>
                                          <line x1="100" y1="100" x2={x} y2={y} stroke="url(#lineGradProfile)" strokeWidth="1" strokeDasharray="3 3" />
                                          {totalNodes > 1 && (
                                             <line x1={x} y1={y} x2={nextX} y2={nextY} stroke="url(#lineGradProfile)" strokeWidth="1" strokeDasharray="3 3" />
                                          )}
                                          
                                          <motion.circle 
                                             animate={{ r: [6, 8, 6] }}
                                             transition={{ repeat: Infinity, duration: 3 + (index * 0.5) }}
                                             cx={x} cy={y} r="6" fill={`${skillColor}33`} stroke={skillColor} strokeWidth="1" filter="url(#glowTree)"
                                          />

                                          <text
                                             x={textX}
                                             y={textY}
                                             fill={skillColor}
                                             fontSize="8"
                                             fontFamily="monospace"
                                             fontWeight="black"
                                             textAnchor="middle"
                                             alignmentBaseline="middle"
                                             className="uppercase tracking-widest drop-shadow-[0_0_3px_rgba(255,255,255,0.3)]"
                                          >
                                             {skill}
                                          </text>
                                       </g>
                                    );
                                 });
                              })()}
                           </motion.g>
                        </svg>
                     </div>
                     <p className="text-[9px] text-muted-foreground text-center mt-4 font-black uppercase tracking-widest italic opacity-60">
                        Path of the Elite Operative
                     </p>
                  </CardContent>
               </Card>
            </div>

            <div className="lg:col-span-2 space-y-6 md:space-y-8 order-1 lg:order-2">
               {/* Real-Time Activity Graph */}
               <Card className="border border-border/50 shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-hack-neon/5 via-transparent to-transparent pointer-events-none" />
                  <CardHeader className="flex flex-row items-center justify-between relative z-10 pb-2">
                     <div className="flex items-center gap-2">
                        <ActivityIcon className="w-4 h-4 text-hack-neon" />
                        <CardTitle className="text-sm uppercase tracking-wider">Live Activity</CardTitle>
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/30 px-3 py-1.5 rounded-full">
                        <span>Less</span>
                        <div className="flex gap-1">
                           {[0, 1, 3, 5, 10].map(count => <div key={count} className={cn("w-[14px] h-[14px] rounded-[2px]", getLevelClass(count))} />)}
                        </div>
                        <span>More</span>
                     </div>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-4">
                     {activities.length === 0 ? (
                        <div className="h-40 flex items-center justify-center text-muted-foreground">No activity yet.</div>
                     ) : (
                        <div className="overflow-x-auto pb-4 custom-scrollbar">
                           <div className="grid grid-flow-col gap-1.5 w-max">
                              {heatmapWeeks.map((week, wIndex) => (
                                 <div key={wIndex} className="grid grid-rows-7 gap-1.5">
                                    {week.map((day, dIndex) => (
                                       <div
                                          key={dIndex}
                                          title={`${day.count} activities on ${day.date}`}
                                          className={cn("w-[14px] h-[14px] rounded-[3px] transition-all cursor-pointer", getLevelClass(day.count))}
                                       />
                                    ))}
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                     <div className="mt-4 flex justify-between items-center border-t border-white/[0.05] pt-4">
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                           <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hack-neon opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-hack-neon"></span>
                           </span>
                           Tactical Uplink Active
                        </p>
                     </div>
                  </CardContent>
               </Card>

               <div className="grid md:grid-cols-2 gap-8">
                  {/* Pinned Projects / Premium Live Projects View - Only for Owner */}
                  {isOwner && (
                   <Card className="flex flex-col h-full bg-gradient-to-b from-card to-background border-border/50 overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-hack-purple via-indigo-500 to-hack-blue" />
                      <CardHeader className="pb-4">
                         <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
                               <Trophy className="w-4 h-4 text-hack-purple" /> 
                               Path of the Elite Operative
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[8px] font-black border-cyan-500/20 text-cyan-400 bg-cyan-500/5 uppercase tracking-widest">v4.2_STABLE</Badge>
                                <Badge variant="outline" className="text-[8px] font-black border-hack-purple/20 text-hack-purple bg-hack-purple/5 uppercase tracking-widest">Live_Status</Badge>
                             </div>
                         </div>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-1">
                         {teams.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic h-full flex items-center justify-center">No projects joined yet.</p>
                         ) : (
                            <div className="space-y-3">
                               {teams.map(team => (
                                  <div key={team.id} className="p-4 rounded-2xl bg-secondary/20 border border-white/5 hover:border-hack-purple/30 hover:bg-secondary/40 transition-all group flex items-center gap-4 relative overflow-hidden" onClick={() => navigate(`/team/${team.id}`)}>
                                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-hack-purple opacity-40 group-hover:opacity-100 transition-opacity" />
                                     <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0", team.color)}>
                                        {team.name[0]}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                           <p className="text-sm font-black text-foreground truncate group-hover:text-hack-purple transition-colors uppercase tracking-tight">{team.name}</p>
                                           <div className="flex gap-1">
                                               <Badge variant="secondary" className="text-[8px] font-black bg-hack-purple/10 text-hack-purple border-hack-purple/20 uppercase tracking-widest px-1.5">{team.role}</Badge>
                                               <Badge variant="outline" className="text-[8px] font-black border-white/10 text-muted-foreground uppercase tracking-widest px-1.5 whitespace-nowrap">MISSION_COMPLETE</Badge>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest truncate mb-2">{team.event} // {team.tasks_completed || 0} TASKS SECURED</p>
                                        <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                                           <div className="h-full bg-hack-purple rounded-full" style={{ width: `${team.progress || 0}%` }} />
                                        </div>
                                     </div>
                                  </div>
                               ))}
                            </div>
                         )}
                      </CardContent>
                   </Card>
                  )}

                  <Card className={cn("flex flex-col h-full border-border/50 bg-secondary/5", !isOwner && "md:col-span-2")}>
                     <CardHeader className="pb-2">
                        <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
                           <ActivityIcon className="w-4 h-4 text-hack-blue animate-pulse" /> Mission Logs
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar space-y-6 pr-2">
                        {!isOwner ? (
                           <p className="text-sm text-muted-foreground italic h-full flex items-center justify-center">Operative logs are classified.</p>
                        ) : activities.length === 0 ? (
                           <p className="text-sm text-muted-foreground italic h-full flex items-center justify-center">No recorded activity pulses in the cloud.</p>
                        ) : (
                           <>
                              {groupedActivities.map((group) => (
                                 <div key={group.title} className="space-y-4">
                                    <div className="flex items-center gap-3">
                                       <span className="text-[10px] font-black uppercase text-hack-blue tracking-widest bg-hack-blue/10 px-2 py-0.5 rounded border border-hack-blue/20">
                                          {group.title}
                                       </span>
                                       <div className="h-[1px] flex-1 bg-gradient-to-r from-hack-blue/20 to-transparent" />
                                    </div>

                                    <div className="space-y-3">
                                       {group.items.map((act) => (
                                          <div key={act.id} className="group relative pl-6 pb-2 last:pb-0 transition-all hover:translate-x-1">
                                             {/* Tactical Timeline Design */}
                                             <div className="absolute left-[7px] top-6 bottom-0 w-[2px] bg-gradient-to-b from-border/60 to-transparent group-hover:from-hack-blue/40" />
                                             <div className="absolute left-0 top-1.5 w-[16px] h-[16px] rounded bg-secondary border border-border group-hover:border-hack-blue/50 flex items-center justify-center z-10 transition-colors">
                                                {act.action_type.includes('commit') || act.action_type.includes('code') ? <GitCommit className="w-2.5 h-2.5 text-hack-blue" /> :
                                                   act.action_type.includes('join') || act.action_type.includes('team') ? <Users className="w-2.5 h-2.5 text-hack-purple" /> :
                                                      act.action_type.includes('like') || act.action_type.includes('engagement') ? <Heart className="w-2.5 h-2.5 text-red-500" /> :
                                                         <Zap className="w-2.5 h-2.5 text-hack-neon" />}
                                             </div>

                                             <div className="bg-card/50 rounded-xl p-3 border border-border/30 hover:border-border hover:bg-card transition-all relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-hack-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="flex justify-between items-start gap-3 relative z-10">
                                                   <div className="flex-1 space-y-1">
                                                      <p className="text-[13px] font-bold text-foreground leading-tight transition-colors">
                                                         {act.description}
                                                      </p>
                                                      <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-black uppercase tracking-tighter">
                                                         <span className="text-hack-blue/80 font-mono">
                                                            {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                         </span>
                                                         {act.metadata?.reputation_gain > 0 && (
                                                            <span className="text-hack-neon bg-hack-neon/5 px-1 rounded shadow-[0_0_10px_rgba(0,255,255,0.1)] border border-hack-neon/10">
                                                               +{act.metadata.reputation_gain} XP
                                                            </span>
                                                         )}
                                                      </div>
                                                   </div>
                                                   <Badge variant="outline" className="text-[7px] px-1.5 py-0 rounded bg-black/20 border-white/5 opacity-50 group-hover:opacity-100 transition-opacity uppercase font-black">
                                                      {act.action_type.replace(/_/g, ' ')}
                                                   </Badge>
                                                </div>
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              ))}
                              {activities.length > 15 && (
                                 <div className="pt-4 border-t border-white/5">
                                    <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-hack-blue transition-all">
                                       Link to Full Neural Feed
                                    </Button>
                                 </div>
                              )}
                              {/* Assuming allProfiles is defined somewhere in your context or state */}
                              {/* {allProfiles && allProfiles.length > 5 && ( */}
                                 <Button 
                                    variant="ghost" 
                                    className="w-full mt-6 text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground hover:text-blue-500 hover:bg-blue-500/5 transition-all border border-dashed border-border/40 py-8 h-auto"
                                    onClick={() => navigate('/leaderboard')}
                                 >
                                    View Full Leaderboard Protocol <ChevronRight className="w-3 h-3 ml-2" />
                                 </Button>
                              {/* )} */}
                           </>
                        )}
                     </CardContent>
                  </Card>
               </div>
            </div>
         </div>
         <AnimatePresence>
            {socialListType && (
               <SocialListModal
                  type={socialListType}
                  users={socialListUsers}
                  loading={isSocialListLoading}
                  onClose={() => setSocialListType(null)}
                  onViewProfile={(targetId) => {
                     setSocialListType(null);
                     navigate(`/u/${targetId}`);
                  }}
               />
            )}
         </AnimatePresence>

         <ProfileShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            userId={user?.id || ""}
            userName={user?.name || ""}
         />
      </div>
   );
}
