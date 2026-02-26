import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/card";
import { toast } from "sonner";
import {
   Shield,
   Activity,
   Search,
   Plus,
   Filter,
   Target,
   Send,
   Heart,
   Share2,
   ArrowUpRight,
   X,
   Terminal,
   MessageSquare,
   Zap,
   Globe,
   Users,
   Trophy,
   MoreHorizontal,
   Mail,
   Clock,
   ShieldCheck
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { useAppContext, Post, ChatMessage, Team, DirectMessage, PostComment, User, Bounty } from "../context/AppContext";
import { PostCard } from "../components/PostCard";
import { PostDetailModal } from "../components/PostDetailModal";
import { SocialListModal } from "../components/SocialListModal";

// --- Types ---
interface SystemEvent {
   id: string;
   type: 'project_launch' | 'prestige_up' | 'mission_success' | 'system';
   user: string;
   avatar?: string;
   action: string;
   details?: string;
   time: string;
}

// --- Sub-components (Intelligence Pro) ---

const TacticalBeacon: React.FC<{
   title: string;
   type: string;
   tags: string[];
   user: string;
   avatar?: string;
   time: string;
}> = ({ title, type, tags, user, avatar, time }) => (
   <div className="p-4 rounded-xl bg-card/40 border border-border/40 hover:border-blue-500/30 transition-all group cursor-pointer relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/[0.02] blur-2xl group-hover:bg-blue-500/[0.05] transition-all" />
      <div className="flex items-start gap-4 relative z-10">
         <Avatar className="w-8 h-8 rounded-lg border border-white/5">
            <AvatarImage src={avatar} />
            <AvatarFallback>{user[0]}</AvatarFallback>
         </Avatar>
         <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
               <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest font-['Fira_Code']">{type}</span>
               <span className="text-[9px] font-bold text-slate-600 uppercase font-['Fira_Code']">{time}</span>
            </div>
            <h4 className="text-sm font-bold text-foreground uppercase tracking-tight truncate group-hover:text-blue-400 transition-colors">{title}</h4>
            <div className="flex flex-wrap gap-1.5 mt-2">
               {tags.slice(0, 2).map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 rounded-sm bg-slate-900 border border-white/5 text-[8px] font-black text-slate-500 uppercase tracking-tighter">#{tag}</span>
               ))}
            </div>
         </div>
      </div>
   </div>
);

const GlobalRelay: React.FC<{
   messages: ChatMessage[];
   onSend: (content: string) => void;
   user: any;
}> = ({ messages, onSend, user }) => {
   const [input, setInput] = useState("");
   const scrollRef = React.useRef<HTMLDivElement>(null);
   const navigate = useNavigate();

   useEffect(() => {
      if (scrollRef.current) {
         scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
   }, [messages]);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;
      onSend(input);
      setInput("");
   };

   return (
      <div className="flex flex-col h-full bg-transparent overflow-hidden">
         <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide font-['Josefin_Sans']">
            {messages.map((msg, i) => (
               <div key={msg.id || i} className={cn("flex gap-4", msg.type === 'system' ? 'justify-center py-4' : '')}>
                  {msg.type !== 'system' && (
                     <Avatar
                        className="w-9 h-9 rounded-xl border border-white/5 shrink-0 mt-1 shadow-2xl cursor-pointer hover:border-blue-500/50 transition-all"
                        onClick={() => navigate(`/u/${msg.user_id}`)}
                     >
                        <AvatarImage src={msg.avatar} />
                        <AvatarFallback>{msg.user[0]}</AvatarFallback>
                     </Avatar>
                  )}
                  <div className={cn(
                     "max-w-[85%] rounded-[1.25rem] px-5 py-3.5 transition-all text-xs font-medium leading-relaxed group/msg position-relative",
                     msg.type === 'system'
                        ? 'bg-secondary/50 border border-white/[0.03] text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] rounded-full px-8'
                        : 'bg-secondary/10 border border-white/[0.03] text-slate-300 hover:border-indigo-500/20 shadow-2xl'
                  )}>
                     {msg.type !== 'system' && (
                        <div className="flex items-center gap-3 mb-1.5">
                           <span
                              className="text-[11px] font-black text-foreground uppercase tracking-tight cursor-pointer hover:text-blue-400 transition-colors"
                              onClick={() => navigate(`/u/${msg.user_id}`)}
                           >
                              {msg.user}
                           </span>
                           <span className="text-[9px] font-bold text-slate-700 font-['Fira_Code']">{msg.time}</span>
                        </div>
                     )}
                     {msg.content}
                  </div>
               </div>
            ))}
         </div>

         <form onSubmit={handleSubmit} className="p-6 bg-card/20 border-t border-border/40">
            <div className="relative group/input">
               <input
                  className="w-full bg-secondary/30 border border-white/5 rounded-[1.5rem] py-4 pl-6 pr-14 text-xs font-medium text-foreground outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-800 shadow-inner"
                  placeholder="TRANSMIT_DATA..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
               />
               <button className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-foreground rounded-[1rem] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 group-hover/input:scale-105">
                  <Send className="w-4 h-4" />
               </button>
            </div>
         </form>
      </div>
   );
};

// --- Bounty Matrix Grid ---

const BountyMatrixGrid: React.FC = () => {
   const { bounties, claimBounty, user } = useAppContext();
   const [filter, setFilter] = useState<'all' | 'open' | 'claimed'>('all');
   const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);

   const filtered = bounties.filter(b => {
      if (filter === 'open') return b.status === 'open';
      if (filter === 'claimed') return b.claimed_by === user?.id;
      return true;
   });

   return (
      <div className="flex-1 flex flex-col overflow-hidden relative">
         {/* Holographic Scanline Overlay */}
         <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] z-10 opacity-20" style={{ backgroundSize: '100% 3px' }} />

         <div className="p-4 flex items-center justify-between border-b border-border/40 bg-card/20 relative z-20">
            <div className="flex items-center gap-2">
               <div className="w-1 h-3 bg-indigo-500 rounded-full animate-pulse" />
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Active_Matrix</div>
            </div>
            <div className="flex gap-1 bg-card/50 p-1 rounded-lg border border-border/50">
               {(['all', 'open', 'claimed'] as const).map((f) => (
                  <button
                     key={f}
                     onClick={() => setFilter(f)}
                     className={cn(
                        "px-3 py-1 rounded-md text-[8px] font-black uppercase transition-all",
                        filter === f
                           ? "bg-indigo-600 text-foreground shadow-lg shadow-indigo-600/20"
                           : "text-slate-600 hover:text-slate-400"
                     )}
                  >
                     {f === 'claimed' ? 'My_Ops' : f}
                  </button>
               ))}
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide relative z-20">
            <AnimatePresence mode="popLayout">
               {filtered.length === 0 ? (
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="flex flex-col items-center justify-center py-24 opacity-20"
                  >
                     <Target className="w-12 h-12 mb-4 text-slate-600" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">No_Missions_Detected</span>
                  </motion.div>
               ) : (
                  filtered.map((bounty, i) => (
                     <motion.div
                        key={bounty.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedBounty(bounty)}
                        className="p-4 rounded-2xl bg-card/40 border border-border/50 hover:border-indigo-500/40 hover:bg-indigo-500/[0.02] transition-all group cursor-pointer relative overflow-hidden"
                     >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.03] blur-3xl group-hover:bg-indigo-500/[0.08] transition-all" />

                        <div className="flex justify-between items-start mb-3 relative z-10">
                           <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn(
                                 "text-[8px] font-black uppercase px-2 py-0.5 rounded-sm border-border/50",
                                 bounty.difficulty === 'legendary' ? "text-orange-400 bg-orange-400/10" :
                                    bounty.difficulty === 'hard' ? "text-red-400 bg-red-400/10" :
                                       "text-indigo-400 bg-indigo-400/10"
                              )}>
                                 {bounty.difficulty}
                              </Badge>
                              <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{bounty.type}</span>
                           </div>
                           <div className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400">
                              +{bounty.reward_xp} XP
                           </div>
                        </div>

                        <h4 className="text-xs font-black text-foreground uppercase tracking-tight mb-1 group-hover:text-indigo-400 transition-colors">
                           {bounty.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 mb-4">
                           {bounty.description}
                        </p>

                        <div className="flex items-center justify-between relative z-10">
                           <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                 <Clock className="w-3 h-3 text-slate-700" />
                                 <span className="text-[8px] font-bold text-slate-600 uppercase">
                                    {bounty.deadline ? new Date(bounty.deadline).toLocaleDateString() : "INF_EXP"}
                                 </span>
                              </div>
                           </div>

                           <div className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white/5 flex items-center gap-2",
                              bounty.status === 'completed' ? "text-green-500" :
                                 (bounty.status === 'claimed' || bounty.status === 'in_progress')
                                    ? (bounty.claimed_by === user?.id ? "text-orange-400 animate-pulse" : "text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]")
                                    : "text-slate-500 group-hover:text-indigo-400"
                           )}>
                              {(bounty.status === 'claimed' || bounty.status === 'in_progress') ? (
                                 bounty.claimed_by === user?.id ? (
                                    <>
                                       <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
                                       TARGET_LOCKED
                                    </>
                                 ) : 'OP_ACTIVE'
                              ) : bounty.status.toUpperCase()}
                           </div>
                        </div>
                     </motion.div>
                  ))
               )}
            </AnimatePresence>
         </div>

         {/* Bounty Detail Modal */}
         <AnimatePresence>
            {selectedBounty && (
               <BountyDetailModal
                  bounty={selectedBounty}
                  onClose={() => setSelectedBounty(null)}
                  onClaim={() => {
                     claimBounty(selectedBounty.id);
                     setSelectedBounty(null);
                  }}
               />
            )}
         </AnimatePresence>
      </div>
   );
};

// --- Bounty Detail Modal ---

const BountyDetailModal: React.FC<{
   bounty: Bounty;
   onClose: () => void;
   onClaim: () => void;
}> = ({ bounty, onClose, onClaim }) => {
   return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-popover/90 backdrop-blur-md"
         />
         <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-lg bg-[#0F172A] border border-white/[0.08] rounded-3xl shadow-2xl relative z-10 overflow-hidden"
         >
            {/* Holographic Header */}
            <div className="p-8 border-b border-white/[0.05] relative overflow-hidden bg-indigo-500/[0.02]">
               <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] z-10 opacity-30" style={{ backgroundSize: '100% 4px' }} />
               <div className="flex items-center justify-between mb-6 relative z-20">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                        <Target className="w-6 h-6" />
                     </div>
                     <div>
                        <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1">Mission_Details</div>
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight">{bounty.title}</h3>
                     </div>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>

               <div className="flex gap-4 relative z-20">
                  <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/5 text-indigo-400 uppercase text-[9px] font-black px-3 py-1">
                     {bounty.difficulty}
                  </Badge>
                  <Badge variant="outline" className="border-border/50 bg-white/5 text-slate-400 uppercase text-[9px] font-black px-3 py-1">
                     {bounty.type}
                  </Badge>
                  <div className="ml-auto flex items-center gap-2 text-[11px] font-black text-indigo-400">
                     <Activity className="w-4 h-4" />
                     {bounty.reward_xp} XP REWARD
                  </div>
               </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                     <ShieldCheck className="w-3.5 h-3.5" /> Objective_Intelligence
                  </label>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                     {bounty.description}
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                     <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Priority_Rank</div>
                     <div className="text-lg font-black text-indigo-400">{bounty.reward_xp >= 1000 ? 'S-TIER' : bounty.reward_xp >= 500 ? 'A-TIER' : 'B-TIER'}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                     <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Time_Window</div>
                     <div className="text-lg font-black text-slate-300">
                        {bounty.deadline ? `${Math.ceil((new Date(bounty.deadline).getTime() - Date.now()) / (1000 * 3600 * 24))} Days` : 'PERMANENT'}
                     </div>
                  </div>
               </div>

               {/* Action */}
               <div className="pt-4">
                  {bounty.status === 'open' ? (
                     <Button
                        onClick={onClaim}
                        className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-foreground font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] group"
                     >
                        <span className="flex items-center gap-2">
                           Accept_Mission <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </span>
                     </Button>
                  ) : (
                     <div className="w-full py-6 bg-slate-800/50 border border-white/5 text-slate-500 text-center font-black uppercase tracking-[0.2em] rounded-2xl">
                        Mission_In_Progress
                     </div>
                  )}
               </div>
            </div>

            {/* Footer Intel */}
            <div className="p-4 bg-secondary/50 border-t border-white/[0.03] text-center">
               <span className="text-[8px] font-bold text-slate-700 uppercase tracking-[0.5em]">System_Verified_Objective // HM_GRID_SYNC_v4.5</span>
            </div>
         </motion.div>
      </div>
   );
};


// --- Unified Communication Matrix (Chat Switcher) ---

const CommunicationMatrix: React.FC<{
   globalMessages: ChatMessage[];
   directMessages: DirectMessage[];
   onSendGlobal: (content: string) => void;
   onSendDirect: (receiverId: string, content: string) => void;
   currentUser: User;
   allProfiles: User[];
   searchUsers: (query: string) => Promise<User[]>;
   initialMode?: "global" | "intel" | "operatives" | "bounties";
   initialTargetUserId?: string | null;
   onMarkAllRead?: () => Promise<void>;
}> = ({ globalMessages, directMessages, onSendGlobal, onSendDirect, currentUser, allProfiles, searchUsers, initialMode = "global", initialTargetUserId = null, onMarkAllRead }) => {
   const navigate = useNavigate();
   const [mode, setMode] = useState<"global" | "intel" | "operatives" | "bounties">(initialMode);
   const [selectedThread, setSelectedThread] = useState<string | null>(initialTargetUserId);
   const [searchQuery, setSearchQuery] = useState("");
   const [searchResults, setSearchResults] = useState<User[]>([]);

   useEffect(() => {
      setMode(initialMode);
   }, [initialMode]);

   useEffect(() => {
      if (initialTargetUserId) {
         setSelectedThread(initialTargetUserId);
      }
   }, [initialTargetUserId]);

   const threads = useMemo(() => {
      const threadMap: Record<string, DirectMessage[]> = {};
      directMessages.forEach(m => {
         const partnerId = m.sender_id === currentUser.id ? m.receiver_id : m.sender_id;
         if (!threadMap[partnerId]) threadMap[partnerId] = [];
         threadMap[partnerId].push(m);
      });
      return threadMap;
   }, [directMessages, currentUser.id]);

   useEffect(() => {
      if (searchQuery.trim().length > 1) {
         searchUsers(searchQuery).then(setSearchResults);
      } else {
         setSearchResults([]);
      }
   }, [searchQuery]);

   return (
      <div className="flex flex-col h-full bg-slate-900/5 border border-white/[0.03] rounded-[2.5rem] overflow-hidden shadow-2xl">
         {/* Switcher Header */}
         <div className="p-3 bg-secondary/40 border-b border-white/[0.03] flex items-center gap-1.5">
            <button
               onClick={() => setMode("global")}
               className={cn(
                  "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1",
                  mode === "global" ? "bg-indigo-600 text-foreground shadow-lg shadow-indigo-600/20" : "text-slate-600 hover:text-slate-300"
               )}
            >
               <Globe className="w-3 h-3" /> Global
            </button>
            <button
               onClick={() => setMode("intel")}
               className={cn(
                  "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1",
                  mode === "intel" ? "bg-indigo-600 text-foreground shadow-lg shadow-indigo-600/20" : "text-slate-600 hover:text-slate-300"
               )}
            >
               <Shield className="w-3 h-3" /> Intel
            </button>
            <button
               onClick={() => setMode("bounties")}
               className={cn(
                  "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1",
                  mode === "bounties" ? "bg-indigo-600 text-foreground shadow-lg shadow-indigo-600/20" : "text-slate-600 hover:text-slate-300"
               )}
            >
               <Target className="w-3 h-3" /> Bounty
            </button>
         </div>

         {mode === "global" ? (
            <GlobalRelay messages={globalMessages} onSend={onSendGlobal} user={currentUser} />
         ) : mode === "bounties" ? (
            <BountyMatrixGrid />
         ) : mode === "operatives" ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
               <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] mb-4 text-center">Network_Operatives</div>
               {allProfiles.filter(p => p.id !== currentUser.id).map(u => (
                  <div
                     key={u.id}
                     className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-white/[0.02] hover:border-indigo-500/20 transition-all group"
                  >
                     <Avatar
                        className="w-10 h-10 rounded-xl group-hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => navigate(`/u/${u.id}`)}
                     >
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback>{u.name[0]}</AvatarFallback>
                     </Avatar>
                     <div className="min-w-0 flex-1 cursor-pointer" onClick={() => navigate(`/u/${u.id}`)}>
                        <div className="text-[10px] font-black text-foreground truncate">{u.name}</div>
                        <div className="text-[8px] font-bold text-slate-600 uppercase mt-0.5">{u.role}</div>
                     </div>
                     <button
                        onClick={() => { setMode("intel"); setSelectedThread(u.id); }}
                        className="p-2 hover:bg-white/5 rounded-lg text-slate-700 hover:text-indigo-400 transition-colors"
                        title="Send Intel Packet"
                     >
                        <Mail className="w-3.5 h-3.5" />
                     </button>
                  </div>
               ))}
            </div>
         ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
               {!selectedThread ? (
                  <div className="flex-1 flex flex-col p-4 overflow-hidden">
                     {/* User Search for DMs */}
                     <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-700" />
                        <input
                           className="w-full h-8 bg-secondary/50 border border-white/5 rounded-lg pl-8 pr-4 text-[9px] font-bold text-foreground uppercase outline-none focus:border-indigo-500/30 transition-all placeholder:text-slate-800"
                           placeholder="FIND_OPERATIVE..."
                           value={searchQuery}
                           onChange={e => setSearchQuery(e.target.value)}
                        />
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
                        {searchQuery.trim().length > 1 ? (
                           searchResults.map(u => (
                              <div
                                 key={u.id}
                                 className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 hover:border-indigo-500/30 transition-all group"
                              >
                                 <Avatar
                                    className="w-8 h-8 rounded-lg cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-indigo-500/10"
                                    onClick={() => navigate(`/u/${u.id}`)}
                                 >
                                    <AvatarImage src={u.avatar} />
                                    <AvatarFallback>{u.name[0]}</AvatarFallback>
                                 </Avatar>
                                 <div className="min-w-0 flex-1 cursor-pointer" onClick={() => navigate(`/u/${u.id}`)}>
                                    <div className="text-[10px] font-black text-foreground truncate">{u.name}</div>
                                    <div className="text-[8px] font-bold text-indigo-500/60 uppercase">{u.rank}</div>
                                 </div>
                                 <button
                                    onClick={() => setSelectedThread(u.id)}
                                    className="p-1.5 hover:bg-indigo-500/20 rounded-lg text-indigo-500/40 hover:text-indigo-500 transition-all"
                                    title="Initialize Connection"
                                 >
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                 </button>
                              </div>
                           ))
                        ) : Object.entries(threads).map(([partnerId, thread]) => {
                           const lastMsg = thread[thread.length - 1];
                           const partnerName = lastMsg.sender_id === partnerId ? lastMsg.sender_name : lastMsg.receiver_name;
                           const partnerAvatar = lastMsg.sender_id === partnerId ? lastMsg.sender_avatar : lastMsg.receiver_avatar;

                           return (
                              <div
                                 key={partnerId}
                                 onClick={() => setSelectedThread(partnerId)}
                                 className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-white/[0.02] hover:border-indigo-500/20 cursor-pointer transition-all"
                              >
                                 <Avatar className="w-8 h-8 rounded-lg">
                                    <AvatarImage src={partnerAvatar} />
                                    <AvatarFallback>{partnerName[0]}</AvatarFallback>
                                 </Avatar>
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                       <span className="text-[10px] font-black text-foreground truncate">{partnerName}</span>
                                       <span className="text-[7px] font-bold text-slate-700">{new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-[9px] font-medium text-slate-500 truncate">{lastMsg.content}</p>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               ) : (
                  <div className="flex-1 flex flex-col overflow-hidden">
                     <button
                        onClick={() => setSelectedThread(null)}
                        className="p-3 bg-secondary/40 border-b border-white/[0.03] text-[9px] font-black text-indigo-500 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2"
                     >
                        <ArrowUpRight className="w-3 h-3 rotate-180" /> BACK_TO_INTEL
                     </button>
                     <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {threads[selectedThread]?.map(msg => (
                           <div key={msg.id} className={cn("flex flex-col", msg.sender_id === currentUser.id ? "items-end" : "items-start")}>
                              <div className={cn(
                                 "max-w-[85%] rounded-[1rem] px-4 py-2 text-[10px] font-medium leading-relaxed shadow-lg",
                                 msg.sender_id === currentUser.id ? "bg-indigo-600 text-foreground rounded-br-none" : "bg-secondary/60 text-slate-300 border border-white/5 rounded-bl-none"
                              )}>
                                 {msg.content}
                              </div>
                           </div>
                        ))}
                     </div>
                     <form
                        onSubmit={(e) => {
                           e.preventDefault();
                           const input = (e.target as any).elements.msg.value;
                           if (!input.trim() || !selectedThread) return;
                           onSendDirect(selectedThread, input);
                           (e.target as any).reset();
                        }}
                        className="p-3 bg-slate-950/60 border-t border-white/[0.04]"
                     >
                        <div className="relative">
                           <input
                              name="msg"
                              className="w-full bg-secondary/30 border border-white/5 rounded-full py-2 pl-4 pr-10 text-[10px] font-medium text-foreground outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-800"
                              placeholder="TRANSMIT_DATA..."
                           />
                           <button className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-foreground rounded-lg hover:bg-indigo-500 transition-all">
                              <Send className="w-3 h-3" />
                           </button>
                        </div>
                     </form>
                  </div>
               )}
            </div>
         )}
      </div>
   );
};

const PostShareWidget: React.FC<{
   user: User;
   onPost: (content: string) => void;
}> = ({ user, onPost }) => {
   const [input, setInput] = useState("");

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;
      onPost(input);
      setInput("");
   };

   return (
      <div className="p-6 rounded-[2rem] bg-secondary/10 border border-white/[0.03] shadow-lg">
         <div className="flex gap-4">
            <Avatar className="w-12 h-12 rounded-2xl border border-white/5 shadow-2xl">
               <AvatarImage src={user.avatar} />
               <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <form onSubmit={handleSubmit} className="flex-1">
               <input
                  className="w-full bg-secondary/50 border border-white/5 rounded-[1.25rem] py-4 px-6 text-[11px] font-medium text-foreground outline-none focus:border-indigo-500/30 transition-all placeholder:text-slate-800"
                  placeholder={`SHARE_NEW_INTEL, ${user.name.toUpperCase()}...`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
               />
               <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                     <button type="button" className="p-2 rounded-lg hover:bg-white/5 text-slate-600 hover:text-indigo-400 transition-all"><Plus className="w-4 h-4" /></button>
                     <button type="button" className="p-2 rounded-lg hover:bg-white/5 text-slate-600 hover:text-indigo-400 transition-all"><Globe className="w-4 h-4" /></button>
                  </div>
                  <Button type="submit" className="px-8 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">POST_PACKET</Button>
               </div>
            </form>
         </div>
      </div>
   );
};

// --- Intel Relay (DMs/Inbox) ---

// --- Community Components ---

const PostCommentSection: React.FC<{
   postId: string;
}> = ({ postId }) => {
   const { fetchComments, addComment, user } = useAppContext();
   const navigate = useNavigate();
   const [comments, setComments] = useState<PostComment[]>([]);
   const [input, setInput] = useState("");
   const [loading, setLoading] = useState(true);
   const [replyTo, setReplyTo] = useState<PostComment | null>(null);

   const load = async () => {
      const data = await fetchComments(postId);
      setComments(data);
      setLoading(false);
   };

   useEffect(() => {
      load();
   }, [postId]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || !user) return;
      await addComment(postId, input, replyTo?.id);
      setInput("");
      setReplyTo(null);
      await load();
   };

   return (
      <div className="mt-6 pt-6 border-t border-white/[0.03] space-y-4">
         <div className="space-y-6">
            {loading ? (
               <div className="py-2 text-center text-[9px] font-bold text-slate-700 uppercase animate-pulse font-['Fira_Code']">SCANNING_COMMS...</div>
            ) : comments.map(c => (
               <div key={c.id} className="space-y-4">
                  <div className="flex gap-3 group/comment">
                     <Avatar className="w-8 h-8 rounded-lg border border-white/5 shrink-0">
                        <AvatarImage src={c.author_avatar} />
                        <AvatarFallback>{c.author_name[0]}</AvatarFallback>
                     </Avatar>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                           <span
                              className="text-[10px] font-black text-foreground cursor-pointer hover:text-blue-400"
                              onClick={() => navigate(`/u/${c.author_id}`)}
                           >
                              {c.author_name}
                           </span>
                           <span className="text-[8px] font-bold text-slate-700 font-['Fira_Code']">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-white/[0.03]">{c.content}</p>
                        <button
                           onClick={() => setReplyTo(c)}
                           className="mt-2 text-[9px] font-black text-slate-500 hover:text-blue-400 uppercase tracking-widest transition-colors flex items-center gap-1.5"
                        >
                           <MessageSquare className="w-3 h-3" /> Reply
                        </button>
                     </div>
                  </div>

                  {/* Nested Replies */}
                  {c.replies && c.replies.length > 0 && (
                     <div className="ml-11 space-y-4 border-l border-white/[0.03] pl-4">
                        {c.replies.map(r => (
                           <div key={r.id} className="flex gap-3">
                              <Avatar className="w-6 h-6 rounded-md border border-white/5 shrink-0">
                                 <AvatarImage src={r.author_avatar} />
                                 <AvatarFallback>{r.author_name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[9px] font-black text-foreground">{r.author_name}</span>
                                    <span className="text-[7px] font-bold text-slate-700">{new Date(r.created_at).toLocaleDateString()}</span>
                                 </div>
                                 <p className="text-[10px] font-medium text-slate-400 leading-relaxed bg-secondary/30 p-2 rounded-lg">{r.content}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            ))}
         </div>

         <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-2">
            {replyTo && (
               <div className="flex items-center justify-between px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Replying to {replyTo.author_name}</span>
                  <button onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-foreground"><X className="w-3 h-3" /></button>
               </div>
            )}
            <div className="flex-1 relative">
               <input
                  className="w-full h-10 bg-secondary/50 border border-border/50 rounded-xl px-4 text-[11px] font-medium text-foreground outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                  placeholder={replyTo ? "TRANSMIT_DATA_REPLY..." : "TRANSMIT_SIGNAL..."}
                  value={input}
                  onChange={e => setInput(e.target.value)}
               />
               <button className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-blue-500">
                  <Send className="w-4 h-4" />
               </button>
            </div>
         </form>
      </div>
   );
};

// --- Status Beacons (Stories/Pulse) ---

const StatusBeacons: React.FC<{ teams: Team[], onShare: (team: Team) => void }> = ({ teams, onShare }) => {
   return (
      <div className="grid grid-cols-2 gap-4 pb-2 scrollbar-hide">
         <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="w-full aspect-square rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-indigo-500/50 transition-all shadow-inner">
               <Plus className="w-5 h-5 text-slate-600 group-hover:text-indigo-500" />
            </div>
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest font-['Fira_Code']">NEW_PULSE</span>
         </div>
         {teams.map(team => (
            <div
               key={team.id}
               onClick={() => onShare(team)}
               className="flex flex-col items-center gap-2 group cursor-pointer"
            >
               <div className="w-full aspect-square rounded-2xl p-[2px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 group-hover:scale-105 transition-transform shadow-xl shadow-indigo-500/10">
                  <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center border-2 border-slate-950 overflow-hidden">
                     <span className="text-[10px] font-black text-foreground italic">{team.name[0]}</span>
                  </div>
               </div>
               <span className="text-[8px] font-black text-slate-300 uppercase tracking-tight truncate w-full text-center">{team.name}</span>
            </div>
         ))}
      </div>
   );
};

// --- Main View ---

export function CommunityView() {
   const {
      posts,
      addPost,
      likePost,
      user,
      globalMessages,
      sendGlobalMessage,
      teams,
      directMessages,
      sendDirectMessage,
      searchUsers,
      allProfiles,
      followingIds,
      followUser,
      unfollowUser,
      followerCount,
      followingCount,
      fetchFollowersList,
      fetchFollowingList,
      markAllDMsAsRead
   } = useAppContext();
   const navigate = useNavigate();
   const location = useLocation();

   const [searchQuery, setSearchQuery] = useState("");
   const [searchResults, setSearchResults] = useState<User[]>([]);
   const [isSearching, setIsSearching] = useState(false);
   const [beaconFilter, setBeaconFilter] = useState("all");
   const [activeComments, setActiveComments] = useState<Record<string, boolean>>({});
   const [showBroadcastModal, setShowBroadcastModal] = useState(false);
   const [newPostContent, setNewPostContent] = useState("");
   const [selectedTag, setSelectedTag] = useState("Update");
   const [selectedPost, setSelectedPost] = useState<Post | null>(null);
   const [chatMatrixMode, setChatMatrixMode] = useState<"global" | "intel" | "operatives">("global");
   const [chatTargetUserId, setChatTargetUserId] = useState<string | null>(null);
   const [isChatOpen, setIsChatOpen] = useState(false);
   const [showRecruitModal, setShowRecruitModal] = useState(false);
   const [selectedRecruitTeam, setSelectedRecruitTeam] = useState<Team | null>(null);
   const [socialListType, setSocialListType] = useState<"followers" | "following" | null>(null);
   const [socialListUsers, setSocialListUsers] = useState<User[]>([]);
   const [isSocialListLoading, setIsSocialListLoading] = useState(false);

   const leadTeams = useMemo(() => teams.filter(t => t.role === "Leader"), [teams]);

   useEffect(() => {
      if (location.state?.mode === 'intel' && location.state?.targetId) {
         setChatMatrixMode('intel');
         setChatTargetUserId(location.state.targetId);
         setIsChatOpen(true);
         // Clear state so it doesn't reopen on every render/refresh
         window.history.replaceState({}, document.title);
      }
   }, [location.state]);

   useEffect(() => {
      const delayDebounceFn = setTimeout(async () => {
         if (searchQuery.trim().length > 1) {
            setIsSearching(true);
            const results = await searchUsers(searchQuery);
            setSearchResults(results);
            setIsSearching(false);
         } else {
            setSearchResults([]);
         }
      }, 300);

      return () => clearTimeout(delayDebounceFn);
   }, [searchQuery, searchUsers]);

   const handleDirectMessageUser = (userId: string) => {
      setChatMatrixMode("intel");
      setChatTargetUserId(userId);
      setIsChatOpen(true);
      setSearchQuery(""); // Clear search on select
      setSearchResults([]);
      setSocialListType(null); // Close social list if open
   };

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

   // --- Calculated Data ---
   const filteredPosts = useMemo(() => {
      let filtered = posts;
      if (beaconFilter === "PROJECTS") filtered = filtered.filter(p => p.type === 'project');
      else if (beaconFilter === "CODE_SNIPPETS") filtered = filtered.filter(p => p.type === 'code');
      else if (beaconFilter === "DISCUSSIONS") filtered = filtered.filter(p => p.type === 'text');

      return filtered.filter(post =>
         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
         post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
   }, [posts, searchQuery, beaconFilter]);

   const [newPostImageUrl, setNewPostImageUrl] = useState("");

   const handleBroadcast = () => {
      if (!newPostContent.trim()) return;
      const typeMap: Record<string, "text" | "code" | "project"> = { "Update": "text", "Code": "code", "Project": "project" };
      addPost({
         content: newPostContent,
         user_id: user?.id || "",
         tags: [selectedTag],
         type: typeMap[selectedTag] || "text",
         imageUrl: newPostImageUrl
      });
      setNewPostContent("");
      setNewPostImageUrl("");
      setShowBroadcastModal(false);
   };

   const handleShareProject = (team: Team) => {
      addPost({
         content: `System Update: Mission ${team.name} has been deployed to the global grid.`,
         user_id: user?.id || "",
         tags: ["Mission_Update", team.type],
         type: "project",
         imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop",
         projectDetails: {
            name: team.name,
            description: team.mission_objective || team.description || "Deploying strategic objective in the community sector.",
            techStack: ["System_Core", team.type],
            openRoles: []
         }
      });
      toast.success(`Broadcasting ${team.name} telemetry.`);
   };

   return (
      <div className="h-full overflow-y-auto bg-background scrollbar-hide font-['IBM_Plex_Sans'] selection:bg-blue-500/30 text-foreground relative">
         <div className="max-w-[1440px] mx-auto p-6 md:p-8 space-y-8 relative z-10 transition-all">

            {/* TOP BAR: SEARCH & NAV */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.05] pb-6">
               <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 text-slate-100">
                     <Shield className="w-6 h-6 text-blue-500" />
                     <h1 className="text-2xl font-bold tracking-tight">HackMate <span className="text-blue-500">Explore</span></h1>
                  </div>
               </div>

               <div className="flex-1 max-w-xl mx-auto">
                  <div className="relative group">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                     <input
                        className="w-full h-11 bg-slate-900 border border-slate-800 rounded-lg pl-11 pr-4 text-sm font-medium text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500"
                        placeholder="Search operatives or squads..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                     />

                     {/* SEARCH RESULTS DROPDOWN */}
                     <AnimatePresence>
                        {(searchResults.length > 0 || isSearching) && (
                           <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-14 left-0 w-full bg-[#0F172A] border border-slate-800 rounded-xl shadow-2xl z-[60] overflow-hidden"
                           >
                              <div className="p-2 max-h-[400px] overflow-y-auto">
                                 {isSearching ? (
                                    <div className="flex items-center justify-center py-8">
                                       <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                    </div>
                                 ) : (
                                    <div className="space-y-1">
                                       {searchResults.map(res => (
                                          <div
                                             key={res.id}
                                             className="flex items-center justify-between p-3 hover:bg-white/[0.03] rounded-lg transition-colors group cursor-pointer"
                                             onClick={() => navigate(`/u/${res.id}`)}
                                          >
                                             <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10 border border-slate-700">
                                                   <AvatarFallback className="bg-slate-800 text-slate-300 font-bold">{res.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                   <span className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                                                      {res.name}
                                                      <Shield className="w-3 h-3 text-blue-500" />
                                                   </span>
                                                   <span className="text-xs text-slate-500">{res.role}</span>
                                                </div>
                                             </div>
                                             <button
                                                className="p-2 rounded-full hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-all opacity-0 group-hover:opacity-100"
                                                onClick={(e) => { e.stopPropagation(); handleDirectMessageUser(res.id); }}
                                             >
                                                <MessageSquare className="w-4 h-4" />
                                             </button>
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </div>
                              <div className="p-3 bg-white/[0.02] border-t border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest font-bold text-center">
                                 Security Verified Operatives
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <button
                     onClick={() => setIsChatOpen(!isChatOpen)}
                     className={cn(
                        "relative p-2.5 bg-slate-900 border border-slate-800 rounded-lg hover:border-blue-500/50 hover:bg-slate-800 transition-all cursor-pointer",
                        isChatOpen && "border-blue-500 bg-slate-800"
                     )}
                  >
                     <MessageSquare className={cn("w-5 h-5", isChatOpen ? "text-blue-500" : "text-slate-400")} />
                     {directMessages.some(m => !m.is_read && m.receiver_id === user?.id) && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#0F172A]" />
                     )}
                  </button>
               </div>
            </div>

            {/* MAIN GRID: LINKEDIN PIVOT */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr_1fr] gap-6">

               {/* LEFT SIDEBAR: PROFILE & SQUADS */}
               <div className="hidden lg:flex flex-col gap-6">
                  {/* Minified Profile Card */}
                  {user && (
                     <div className="bg-[#0F172A] rounded-xl border border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer">
                        <div className="h-16 bg-blue-600/20 border-b border-slate-800 w-full relative">
                           <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                              <Avatar className="w-20 h-20 rounded-xl border-4 border-[#0F172A] bg-[#0F172A]">
                                 <AvatarImage src={user.avatar} className="object-cover" />
                                 <AvatarFallback>{user.name[0]}</AvatarFallback>
                              </Avatar>
                           </div>
                        </div>
                        <div className="pt-12 pb-6 px-6 text-center">
                           <h3 className="text-lg font-bold text-slate-100 hover:underline">{user.name}</h3>
                           <p className="text-sm font-medium text-slate-400 mt-1">{user.rank}</p>

                           <div className="w-full h-px bg-slate-800 my-4" />

                           <div className="flex flex-col gap-3 text-sm font-medium text-slate-400">
                              <div className="flex justify-between items-center hover:text-foreground transition-colors">
                                 <span>Network Rank</span>
                                 <span className="font-['JetBrains_Mono'] text-blue-400 font-semibold">{user.reputation}</span>
                              </div>
                              <div className="flex justify-between items-center hover:text-foreground transition-colors">
                                 <span>Active Squads</span>
                                 <span className="font-['JetBrains_Mono'] text-slate-100 font-semibold">{teams.length}</span>
                              </div>
                              <div
                                 onClick={() => handleOpenSocialList("followers")}
                                 className="flex justify-between items-center hover:text-foreground transition-colors cursor-pointer group/stat"
                              >
                                 <span className="group-hover/stat:text-blue-400">Followers</span>
                                 <span className="font-['JetBrains_Mono'] text-slate-100 font-semibold group-hover/stat:text-blue-400">{followerCount}</span>
                              </div>
                              <div
                                 onClick={() => handleOpenSocialList("following")}
                                 className="flex justify-between items-center hover:text-foreground transition-colors cursor-pointer group/stat"
                              >
                                 <span className="group-hover/stat:text-blue-400">Following</span>
                                 <span className="font-['JetBrains_Mono'] text-slate-100 font-semibold group-hover/stat:text-blue-400">{followingCount}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* ACTIVE SQUADS */}
                  <div className="bg-[#0F172A] rounded-xl border border-slate-800 p-5 shadow-sm">
                     <h3 className="text-sm font-semibold text-slate-100 mb-4">Lead Your Teams</h3>
                     <div className="space-y-3 relative z-10 overflow-y-auto max-h-64 scrollbar-hide">
                        {leadTeams.length === 0 ? (
                           <div className="text-center py-4 text-sm font-medium text-slate-500 italic">No squads under your command</div>
                        ) : leadTeams.map(team => (
                           <div key={team.id} className="group/squad flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                              <div className="flex items-center gap-3 overflow-hidden" onClick={() => window.location.href = `/team/${team.id}`}>
                                 <div className="w-10 h-10 rounded shadow-sm bg-slate-800 border border-slate-700 flex items-center justify-center font-['JetBrains_Mono'] text-blue-400 font-bold shrink-0">
                                    {team.name[0]}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-slate-200 truncate group-hover/squad:text-blue-400 transition-colors">{team.name}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">{team.currentMembers.length} members</p>
                                 </div>
                              </div>
                              <button
                                 onClick={(e) => { e.stopPropagation(); setSelectedRecruitTeam(team); setShowRecruitModal(true); }}
                                 className="p-2 mr-1 rounded-md hover:bg-blue-500/10 text-slate-500 hover:text-blue-500 transition-all opacity-0 group-hover/squad:opacity-100"
                                 title="Recruit for this squad"
                              >
                                 <Share2 className="w-4 h-4" />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* CENTER: FEED */}
               <div className="lg:col-span-1 md:col-span-2 col-span-1 flex flex-col gap-6 overflow-y-auto scrollbar-hide pb-20">
                  {/* Post Composer */}
                  {user && (
                     <div className="bg-[#0F172A] rounded-xl border border-slate-800 p-4 shadow-sm flex flex-col gap-3">
                        <div className="flex gap-3">
                           <Avatar className="w-12 h-12 rounded-full border border-slate-800 shrink-0">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                           </Avatar>
                           <button
                              onClick={() => setShowBroadcastModal(true)}
                              className="w-full text-left bg-slate-900 border border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 transition-colors rounded-full px-5 py-3 text-sm text-slate-400 font-medium"
                           >
                              Start a post, share a snippet...
                           </button>
                        </div>
                        <div className="flex items-center justify-between pt-2 px-1">
                           <div className="flex gap-1 flex-wrap">
                              <button onClick={() => setShowBroadcastModal(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors text-sm font-semibold">
                                 <Plus className="w-4 h-4" /> Media
                              </button>
                              <button onClick={() => setShowBroadcastModal(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors text-sm font-semibold">
                                 <Terminal className="w-4 h-4" /> Code
                              </button>
                              <button onClick={() => setShowBroadcastModal(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors text-sm font-semibold">
                                 <Target className="w-4 h-4" /> Event
                              </button>
                           </div>
                        </div>
                     </div>
                  )}

                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-hide">
                     {["all", "PROJECTS", "CODE_SNIPPETS", "DISCUSSIONS"].map(filter => (
                        <button key={filter} onClick={() => setBeaconFilter(filter)} className={cn("px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all relative shrink-0", beaconFilter === filter ? "text-blue-500 bg-blue-500/5" : "text-slate-500 hover:text-slate-300 hover:bg-white/5")}>
                           {filter === 'all' ? 'All Activity' : filter.replace('_', ' ')}
                           {beaconFilter === filter && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 rounded-t-sm shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                        </button>
                     ))}
                  </div>

                  {/* Feed */}
                  <div className="space-y-4">
                     <AnimatePresence mode="popLayout">
                        {filteredPosts.length > 0 ? (
                           filteredPosts.map(post => (
                              <PostCard
                                 key={post.id}
                                 post={post}
                                 onViewDetail={(p) => setSelectedPost(p)}
                                 onDirectMessage={handleDirectMessageUser}
                              />
                           ))
                        ) : (
                           <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="p-12 flex flex-col items-center justify-center text-center space-y-4 bg-[#0F172A] rounded-2xl border border-slate-800 border-dashed"
                           >
                              <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center text-slate-700 border border-slate-800">
                                 <Activity className="w-8 h-8 opacity-20" />
                              </div>
                              <div className="space-y-1">
                                 <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No Intelligence Detected</h3>
                                 <p className="text-xs text-slate-600 font-bold uppercase tracking-tighter">Broadcast your first mission update to initialize the grid.</p>
                              </div>
                              <Button
                                 onClick={() => setShowBroadcastModal(true)}
                                 className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-500/20 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest mt-2"
                              >
                                 Initialize_Broadcast
                              </Button>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               </div>

               {/* RIGHT SIDEBAR: RADAR */}
               <div className="hidden lg:flex col-span-1 flex-col gap-6">

                  {/* HackMate News */}
                  <div className="bg-[#0F172A] rounded-xl border border-slate-800 p-5 shadow-sm">
                     <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <h3 className="text-sm font-semibold text-slate-100">HackMate News</h3>
                     </div>
                     <div className="flex flex-col gap-3">
                        {[
                           { tag: "Rust adoption increasing", time: "Top news • 14.2k readers" },
                           { tag: "React 19 release features", time: "Frontend • 12.8k readers" },
                           { tag: "AI Agents in SaaS", time: "Trending • 9.4k readers" },
                           { tag: "Web3 Gaming revival", time: "Gaming • 8.1k readers" }
                        ].map((t, i) => (
                           <div key={i} className="flex flex-col gap-0.5 group cursor-pointer">
                              <span className="text-sm font-semibold text-slate-300 group-hover:text-blue-400 hover:underline transition-colors">{t.tag}</span>
                              <span className="text-xs text-slate-500">{t.time}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Suggested Connections */}
                  <div className="bg-[#0F172A] rounded-xl border border-slate-800 p-5 shadow-sm">
                     <div className="flex items-center gap-2 mb-4">
                        <Users className="w-4 h-4 text-blue-500" />
                        <h3 className="text-sm font-semibold text-slate-100">Suggested Connections</h3>
                     </div>
                     <div className="space-y-4">
                        {allProfiles.filter(p => p.id !== user?.id).slice(0, 4).map((op, i) => (
                           <div key={i} className="flex gap-3">
                              <Avatar className="w-10 h-10 rounded-full border border-slate-800 cursor-pointer hover:border-blue-500/50 transition-colors">
                                 <AvatarFallback>{op.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col flex-1 min-w-0">
                                 <h4 className="text-sm font-semibold text-slate-200 truncate hover:text-blue-400 hover:underline cursor-pointer transition-colors">{op.name}</h4>
                                 <p className="text-xs text-slate-500 truncate mb-1">{op.role}</p>
                                 <button
                                    onClick={() => followingIds.includes(op.id) ? unfollowUser(op.id) : followUser(op.id)}
                                    className={cn(
                                       "self-start px-4 py-1.5 rounded-full border text-xs font-semibold transition-colors cursor-pointer",
                                       followingIds.includes(op.id) ? "border-slate-800 text-slate-500 hover:bg-slate-800" : "border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                                    )}
                                 >
                                    {followingIds.includes(op.id) ? "Following" : "Connect"}
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>


               </div>
            </div>
         </div>

         {/* FLOATING ACTION: NEW POST (Replaced Broadcast) */}
         <button
            onClick={() => setShowBroadcastModal(true)}
            className="fixed bottom-10 right-10 md:hidden p-4 bg-blue-600 text-foreground rounded-full shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all z-50 cursor-pointer"
         >
            <Plus className="w-6 h-6" />
         </button>

         {/* POST MODAL */}
         <AnimatePresence>
            {showBroadcastModal && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setShowBroadcastModal(false)}
                     className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                  />
                  <motion.div
                     initial={{ scale: 0.95, opacity: 0, y: 10 }}
                     animate={{ scale: 1, opacity: 1, y: 0 }}
                     exit={{ scale: 0.95, opacity: 0, y: 10 }}
                     className="w-full max-w-lg bg-[#0F172A] border border-slate-700 rounded-xl relative z-10 shadow-2xl overflow-hidden flex flex-col"
                  >
                     <div className="flex items-center justify-between p-4 border-b border-slate-800">
                        <h3 className="text-lg font-bold text-slate-100">Create a post</h3>
                        <button onClick={() => setShowBroadcastModal(false)} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors cursor-pointer">
                           <X className="w-5 h-5" />
                        </button>
                     </div>

                     <div className="p-4 flex items-center gap-3">
                        <Avatar className="w-12 h-12 rounded-full border border-slate-800">
                           <AvatarImage src={user?.avatar} />
                           <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                           <h4 className="text-sm font-bold text-slate-100">{user?.name}</h4>
                           <p className="text-xs font-semibold text-slate-500">Post to anyone</p>
                        </div>
                     </div>

                     <div className="px-4 pb-4">
                        <textarea
                           autoFocus
                           value={newPostContent}
                           onChange={e => setNewPostContent(e.target.value)}
                           placeholder="What do you want to talk about?"
                           className="w-full h-24 bg-transparent border-none text-sm text-slate-100 outline-none resize-none placeholder:text-slate-500"
                        />

                        <div className="mt-2 space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Upgrade_Visual_Telemetry (Image URL)</label>
                           <input
                              value={newPostImageUrl}
                              onChange={e => setNewPostImageUrl(e.target.value)}
                              placeholder="https://example.com/mission_intel.png"
                              className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2 text-xs text-slate-300 outline-none focus:border-blue-500/30 transition-all font-medium"
                           />
                        </div>
                     </div>
                     <div className="flex items-center justify-between p-4 border-t border-slate-800">
                        <div className="flex items-center gap-2">
                           {["Update", "Project", "Code"].map(tag => (
                              <button
                                 key={tag}
                                 onClick={() => setSelectedTag(tag)}
                                 className={cn(
                                    "px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer",
                                    selectedTag === tag
                                       ? "border-blue-500 bg-blue-500/10 text-blue-400"
                                       : "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                                 )}
                              >
                                 {tag === "Project" ? "Recruiting" : tag}
                              </button>
                           ))}
                        </div>
                        <Button
                           onClick={handleBroadcast}
                           disabled={!newPostContent.trim()}
                           className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-foreground rounded-full text-sm font-semibold transition-colors cursor-pointer shadow-sm"
                        >
                           Broadcast
                        </Button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* POST DETAIL MODAL */}
         <AnimatePresence>
            {selectedPost && (
               <PostDetailModal
                  post={selectedPost}
                  onClose={() => setSelectedPost(null)}
                  onDirectMessage={handleDirectMessageUser}
               />
            )}
         </AnimatePresence>

         {/* Recruit Team Modal */}
         <AnimatePresence>
            {showRecruitModal && selectedRecruitTeam && (
               <RecruitTeamModal
                  team={selectedRecruitTeam}
                  onClose={() => setShowRecruitModal(false)}
                  onShare={(data) => {
                     addPost({
                        content: data.description,
                        user_id: user?.id || "",
                        tags: ["Recruitment", data.teamType],
                        type: "project",
                        imageUrl: data.imageUrl,
                        projectDetails: {
                           name: data.teamName,
                           description: data.mission,
                           techStack: data.techStack,
                           openRoles: data.roles,
                        }
                     });
                     setShowRecruitModal(false);
                     toast.success("Recruitment mission broadcasted to the grid.");
                  }}
               />
            )}
         </AnimatePresence>

         <AnimatePresence>
            {isChatOpen && (
               <>
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setIsChatOpen(false)}
                     className="fixed inset-0 z-[110] bg-slate-950/20 backdrop-blur-[2px]"
                  />
                  <motion.div
                     initial={{ x: "100%" }}
                     animate={{ x: 0 }}
                     exit={{ x: "100%" }}
                     transition={{ type: "spring", damping: 25, stiffness: 200 }}
                     className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0F172A] border-l border-white/[0.05] z-[120] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]"
                  >
                     <div className="flex flex-col h-full bg-[#0F172A]">
                        <div className="p-4 border-b border-white/[0.05] flex items-center justify-between">
                           <h2 className="text-sm font-black uppercase tracking-widest text-slate-100 font-['JetBrains_Mono']">Communication_Matrix</h2>
                           <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
                              <X className="w-5 h-5" />
                           </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                           <CommunicationMatrix
                              globalMessages={globalMessages}
                              directMessages={directMessages}
                              onSendGlobal={sendGlobalMessage}
                              onSendDirect={sendDirectMessage}
                              currentUser={user!}
                              allProfiles={allProfiles}
                              searchUsers={searchUsers}
                              onMarkAllRead={markAllDMsAsRead}
                              initialMode={chatMatrixMode}
                              initialTargetUserId={chatTargetUserId}
                           />
                        </div>
                     </div>
                  </motion.div>
               </>
            )}
         </AnimatePresence>

         <AnimatePresence>
            {socialListType && (
               <SocialListModal
                  type={socialListType}
                  users={socialListUsers}
                  loading={isSocialListLoading}
                  onClose={() => setSocialListType(null)}
                  onViewProfile={(userId) => {
                     setSocialListType(null);
                     handleDirectMessageUser(userId);
                  }}
               />
            )}
         </AnimatePresence>
      </div>
   );
}

// --- SUB-COMPONENTS ---

const RECRUITMENT_ROLES = [
   "Frontend Engineer", "Backend Engineer", "Fullstack Developer",
   "AI/ML Researcher", "AI Agent Developer", "DevOps Architect",
   "Systems Programmer", "Rust Developer", "Security Analyst",
   "Data Scientist", "UI/UX Designer", "Product Manager",
   "Growth Hacker", "Technical Writer", "Community Manager",
   "QA Lead", "Creative Director", "Marketing Strategist"
];

function RecruitTeamModal({ team, onClose, onShare }: { team: Team, onClose: () => void, onShare: (data: any) => void }) {
   const [rolesQuery, setRolesQuery] = useState("");
   const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
   const [description, setDescription] = useState("");
   const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"); // Default space/tech image

   const filteredRoles = useMemo(() => {
      return RECRUITMENT_ROLES.filter(r =>
         r.toLowerCase().includes(rolesQuery.toLowerCase()) && !selectedRoles.includes(r)
      );
   }, [rolesQuery, selectedRoles]);

   return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
         />
         <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-2xl bg-[#0F172A] border border-white/[0.08] rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
         >
            {/* Header */}
            <div className="p-6 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.02]">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                     <Target className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-slate-100 uppercase tracking-tight">Deploy Recruitment Post</h3>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Project: {team.name}</p>
                  </div>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                  <X className="w-5 h-5" />
               </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-8 overflow-y-auto space-y-8 scrollbar-hide">

               {/* Description / Requirements */}
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Mission Intel & Requirements</label>
                  <textarea
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                     placeholder="Deploy a brief description of the mission, technical requirements, and any critical objectives..."
                     className="w-full h-32 bg-slate-900/50 border border-white/[0.05] rounded-xl p-4 text-sm text-slate-200 outline-none focus:border-blue-500/50 transition-all resize-none placeholder:text-slate-600"
                  />
               </div>

               {/* Image Update */}
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Visual_Upgrade (Mission Image)</label>
                  <input
                     value={imageUrl}
                     onChange={(e) => setImageUrl(e.target.value)}
                     placeholder="https://example.com/mission_visual.jpg"
                     className="w-full bg-slate-900/50 border border-white/[0.05] rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500/50 transition-all font-medium"
                  />
               </div>

               {/* Roles Dropdown Section */}
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Select Open Roles</label>

                  {/* Selected Roles Chips */}
                  {selectedRoles.length > 0 && (
                     <div className="flex flex-wrap gap-2 mb-3">
                        {selectedRoles.map(role => (
                           <div key={role} className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-wider group">
                              {role}
                              <button onClick={() => setSelectedRoles(prev => prev.filter(r => r !== role))} className="hover:text-foreground transition-colors">
                                 <X className="w-3 h-3" />
                              </button>
                           </div>
                        ))}
                     </div>
                  )}

                  <div className="relative">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <Search className="w-4 h-4" />
                     </div>
                     <input
                        value={rolesQuery}
                        onChange={(e) => setRolesQuery(e.target.value)}
                        placeholder="Search for roles (e.g. AI, Backend, Designer)..."
                        className="w-full h-12 bg-slate-900/50 border border-white/[0.05] rounded-xl pl-11 pr-4 text-sm text-slate-200 outline-none focus:border-blue-500/50 transition-all font-medium"
                     />

                     {/* Search Results */}
                     <AnimatePresence>
                        {rolesQuery.trim() !== "" && (
                           <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-14 left-0 w-full bg-[#1e293b] border border-white/[0.08] rounded-xl shadow-2xl z-20 max-h-48 overflow-y-auto p-2 border-t-0"
                           >
                              {filteredRoles.length === 0 ? (
                                 <div className="p-4 text-center text-xs text-slate-500 font-bold uppercase tracking-widest">No matching roles found</div>
                              ) : filteredRoles.map(role => (
                                 <div
                                    key={role}
                                    onClick={() => {
                                       setSelectedRoles(prev => [...prev, role]);
                                       setRolesQuery("");
                                    }}
                                    className="p-3 hover:bg-white/5 rounded-lg text-sm text-slate-300 font-bold cursor-pointer transition-colors flex items-center justify-between group"
                                 >
                                    {role}
                                    <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                                 </div>
                              ))}
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               </div>

               {/* Auto-populated Mission Objective (Preview) */}
               <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     <Activity className="w-3.5 h-3.5" /> Data Feed Sync
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Mission Prototype</span>
                        <div className="text-sm font-bold text-slate-200">{team.name}</div>
                     </div>
                     <div className="space-y-1 text-right">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Target Objective</span>
                        <div className="text-sm font-bold text-slate-400">{team.event}</div>
                     </div>
                  </div>
               </div>

            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-white/[0.01] border-t border-white/[0.05] flex items-center justify-end gap-3">
               <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all">
                  Cancel
               </button>
               <Button
                  disabled={!description.trim() || selectedRoles.length === 0}
                  onClick={() => onShare({
                     description,
                     roles: selectedRoles,
                     teamName: team.name,
                     mission: team.mission_objective || team.description || "",
                     techStack: ["React", "TypeScript"], // Fallback if no specific stack in team model yet
                     teamType: team.type,
                     imageUrl: imageUrl
                  })}
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-foreground rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
               >
                  Broadcast Recruitment Mission
               </Button>
            </div>
         </motion.div>
      </div>
   );
}
