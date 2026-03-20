import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/card";
import { 
   Trophy, 
   Search, 
   Filter, 
   ArrowUpRight, 
   ChevronRight, 
   Zap, 
   Shield, 
   Activity, 
   Globe,
   Target,
   Terminal,
   Binary,
   Users
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { useAppContext, User } from "../context/AppContext";
import { supabase } from "../../lib/supabase";
import { getLevelInfo } from "../utils/xpEngine";

export const LeaderboardView: React.FC = () => {
   const navigate = useNavigate();
   const { allProfiles, user: currentUser, systemStats } = useAppContext();
   const [searchQuery, setSearchQuery] = useState("");
   const [activeTab, setActiveTab] = useState<'global' | 'team' | 'regional'>('global');
   const [profiles, setProfiles] = useState<User[]>(allProfiles || []);

   // Sort profiles by reputation (XP)
   const sortedProfiles = useMemo(() => {
      const filtered = profiles.filter(p => 
         p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
         p.rank.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return [...filtered].sort((a, b) => (b.reputation || 0) - (a.reputation || 0));
   }, [profiles, searchQuery]);

   // Real-time listener for leaderboard updates
   useEffect(() => {
      const channel = supabase
         .channel('leaderboard_updates')
         .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'profiles' },
            (payload) => {
               if (payload.eventType === 'INSERT') {
                  setProfiles(prev => [...prev, { ...payload.new, role: payload.new.primary_role } as User]);
               } else if (payload.eventType === 'UPDATE') {
                  setProfiles(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new, role: payload.new.primary_role } as User : p));
               } else if (payload.eventType === 'DELETE') {
                  setProfiles(prev => prev.filter(p => p.id !== payload.old.id));
               }
            }
         )
         .subscribe();

      return () => {
         supabase.removeChannel(channel);
      };
   }, []);

   useEffect(() => {
      if (allProfiles) setProfiles(allProfiles);
   }, [allProfiles]);

   return (
      <div className="min-h-screen bg-transparent p-6 lg:p-12 space-y-12 max-w-7xl mx-auto">
         {/* Navigation / Header Section */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-hack-blue/10 rounded-2xl flex items-center justify-center border border-hack-blue/20 text-hack-blue shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                     <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                     <div className="text-[10px] font-black text-hack-blue uppercase tracking-[0.4em] mb-1 opacity-80">Network_Intelligence</div>
                     <h1 className="text-4xl font-black text-foreground uppercase tracking-tight">Leaderboard_Protocol</h1>
                  </div>
               </div>
               <p className="text-sm text-muted-foreground max-w-xl font-medium leading-relaxed">
                  Real-time synchronization with the global operative network. Ranking determined by multi-vector neural contribution analysis.
               </p>
            </div>

            <div className="flex items-center gap-3">
               <div className="relative group/search">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within/search:text-hack-blue transition-colors" />
                  <input 
                     type="text" 
                     placeholder="SEARCH_BY_NAME_OR_RANK..."
                     className="bg-card/40 border border-border/40 rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold uppercase tracking-widest text-foreground outline-none focus:border-hack-blue/50 focus:bg-card/60 transition-all w-full md:w-64 shadow-inner"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <Button variant="outline" className="border-border/40 bg-card/40 py-6 px-6 rounded-2xl group hover:border-hack-blue/40 transition-all">
                  <Filter className="w-4 h-4 text-muted-foreground group-hover:text-hack-blue transition-colors" />
               </Button>
            </div>
         </div>

         {/* Stats Overview */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
               { label: 'Active_Operatives', value: systemStats.activeOperatives, icon: Users, color: 'text-hack-blue', bg: 'bg-hack-blue/5' },
               { label: 'Network_Load', value: systemStats.networkLoad, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
               { label: 'System_Nodes', value: systemStats.systemNodes, icon: Globe, color: 'text-hack-purple', bg: 'bg-hack-purple/5' }
            ].map((stat, i) => (
               <Card key={i} className="border-border/40 bg-card shadow-lg relative overflow-hidden group hover:border-hack-blue/30 transition-all">
                  <div className={cn("absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none opacity-20", stat.bg)} />
                  <CardContent className="p-6 flex items-center gap-6">
                     <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border border-border/40 shadow-inner shrink-0", stat.bg)}>
                        <stat.icon className={cn("w-6 h-6", stat.color)} />
                     </div>
                     <div>
                        <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-1">{stat.label}</div>
                        <div className="text-2xl font-black text-foreground tracking-tight">{stat.value}</div>
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>

         {/* Leaderboard Table Section */}
         <Card className="border border-border/40 bg-card shadow-2xl relative overflow-hidden rounded-3xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-hack-blue via-hack-purple to-hack-blue animate-gradient-x" />
            <CardHeader className="p-8 border-b border-border/10 flex flex-row items-center justify-between">
               <div className="flex gap-2 p-1 bg-secondary/20 rounded-xl border border-border/15">
                  {(['global', 'team', 'regional'] as const).map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                           "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                           activeTab === tab 
                              ? "bg-hack-blue text-white shadow-lg shadow-hack-blue/20" 
                              : "text-muted-foreground/60 hover:text-foreground"
                        )}
                     >
                        {tab}_Matrix
                     </button>
                  ))}
               </div>
               <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] font-['Fira_Code']">
                  Sync_Cycle_Active // {new Date().toLocaleTimeString()}
               </div>
            </CardHeader>

            <CardContent className="p-0">
               <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                     <thead>
                        <tr className="border-b border-border/10 text-left bg-secondary/5">
                           <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] pl-10">Rank</th>
                           <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Operative_Node</th>
                           <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Specialization</th>
                           <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Reputation_XP</th>
                           <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Impact</th>
                           <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] pr-10">Status</th>
                        </tr>
                     </thead>
                     <tbody>
                        <AnimatePresence mode="popLayout">
                           {sortedProfiles.map((profile, i) => (
                              <motion.tr
                                 key={profile.id}
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0 }}
                                 transition={{ delay: i * 0.03 }}
                                 onClick={() => navigate(`/u/${profile.id}`)}
                                 className={cn(
                                    "border-b border-border/5 group cursor-pointer transition-all hover:bg-hack-blue/[0.02] relative z-10",
                                    profile.id === currentUser?.id && "bg-hack-blue/[0.03] border-l-2 border-l-hack-blue"
                                 )}
                              >
                                 <td className="p-6 pl-10">
                                    <div className="flex items-center gap-4">
                                       <div className={cn(
                                          "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border transition-all shadow-sm",
                                          i === 0 ? "bg-amber-400/10 border-amber-400/30 text-amber-400 shadow-amber-400/10" :
                                          i === 1 ? "bg-slate-300/10 border-slate-300/30 text-slate-300 shadow-slate-300/10" :
                                          i === 2 ? "bg-orange-800/10 border-orange-800/30 text-orange-800 shadow-orange-800/10" :
                                          "bg-card/50 border-border/20 text-muted-foreground"
                                       )}>
                                          {i + 1}
                                       </div>
                                       {i < 3 && <Zap className={cn("w-3 h-3 animate-pulse", 
                                          i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : "text-orange-800"
                                       )} />}
                                    </div>
                                 </td>
                                 <td className="p-6">
                                    <div className="flex items-center gap-4">
                                       <div className="relative">
                                          <Avatar className="w-11 h-11 border-2 border-border/40 group-hover:border-hack-blue/50 transition-all rounded-2xl overflow-hidden shadow-lg">
                                             <AvatarImage src={profile.avatar} />
                                             <AvatarFallback className="bg-secondary/20 uppercase font-black">{profile.name[0]}</AvatarFallback>
                                          </Avatar>
                                          <div className={cn(
                                             "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card z-10",
                                             i < 10 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-muted-foreground/30"
                                          )} />
                                       </div>
                                       <div className="flex flex-col min-w-0">
                                          <span className="text-sm font-black text-foreground truncate group-hover:text-hack-blue transition-colors uppercase tracking-tight">{profile.name}</span>
                                          <div className="flex items-center gap-2 mt-0.5">
                                             <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{profile.rank}</span>
                                             <span className={cn(
                                                "text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest",
                                                (profile.role || "Developer").toUpperCase().includes('SPECIALIST') 
                                                   ? "bg-hack-neon/10 border-hack-neon/50 text-hack-neon shadow-[0_0_8px_rgba(0,255,255,0.4)]"
                                                   : "bg-secondary/20 border-border/30 text-muted-foreground"
                                             )}>
                                                {profile.role || "Developer"}
                                             </span>
                                          </div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-6">
                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-3 py-1 border-border/40 text-muted-foreground bg-secondary/5 group-hover:border-hack-blue/30 transition-all">
                                       {profile.role || "Developer"}
                                    </Badge>
                                 </td>
                                 <td className="p-6">
                                    <div className="flex flex-col">
                                       <div className="flex items-center gap-2">
                                          <span className={cn(
                                             "text-lg font-black tracking-tighter",
                                             i < 3 ? "text-hack-blue" : "text-foreground"
                                          )}>
                                             {(profile.reputation || 0).toLocaleString()}
                                          </span>
                                          <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">PKTS</span>
                                       </div>
                                       <div className="w-24 h-1 bg-secondary/30 rounded-full mt-2 overflow-hidden">
                                          <div className="h-full bg-hack-blue rounded-full" style={{ width: `${getLevelInfo(profile.reputation || 0).progressPercent}%` }} />
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-6">
                                    <div className="flex items-center gap-3">
                                       <div className="flex flex-col text-right pr-3 border-r border-border/10">
                                          <span className="text-[10px] font-black text-foreground">{getLevelInfo(profile.reputation || 0).level}</span>
                                          <span className="text-[8px] font-bold text-muted-foreground/50 uppercase">Level</span>
                                       </div>
                                       <div className="flex flex-col">
                                          <span className="text-[10px] font-black text-emerald-500">+12%</span>
                                          <span className="text-[8px] font-bold text-muted-foreground/50 uppercase">Weekly</span>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-6 pr-10">
                                    <div className="flex items-center justify-end">
                                       <Button variant="ghost" className="p-2 hover:bg-hack-blue/10 rounded-xl text-muted-foreground group-hover:text-hack-blue transition-all">
                                          <ArrowUpRight className="w-4 h-4" />
                                       </Button>
                                    </div>
                                 </td>
                              </motion.tr>
                           ))}
                        </AnimatePresence>
                     </tbody>
                  </table>
               </div>
            </CardContent>

            <div className="p-8 border-t border-border/10 bg-secondary/5 flex items-center justify-between">
               <div className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">
                  Showing {sortedProfiles.length} of {profiles.length} detected operatives
               </div>
               <div className="flex gap-2">
                  <Button variant="outline" className="border-border/40 text-[10px] font-black uppercase tracking-widest py-5 rounded-xl disabled:opacity-30" disabled>Previous_Packet</Button>
                  <Button variant="outline" className="border-border/40 text-[10px] font-black uppercase tracking-widest py-5 rounded-xl">Next_Packet</Button>
               </div>
            </div>
         </Card>

         {/* Protocol Information Footer */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 opacity-60 hover:opacity-100 transition-opacity">
            {[
               { icon: Terminal, title: 'Rank_Sync', text: 'Real-time neural updates enabled' },
               { icon: Shield, title: 'Auth_Check', text: 'Verification protocol active' },
               { icon: Binary, title: 'Data_Stream', text: 'End-to-end impact encryption' },
               { icon: Target, title: 'Op_Focus', text: 'Mission-critical contribution' }
            ].map((info, i) => (
               <div key={i} className="flex flex-col items-center text-center p-6 space-y-3">
                  <info.icon className="w-5 h-5 text-hack-blue/60" />
                  <div>
                     <div className="text-[10px] font-black uppercase tracking-widest mb-1">{info.title}</div>
                     <p className="text-[8px] font-bold text-muted-foreground uppercase leading-relaxed">{info.text}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

export default LeaderboardView;
