import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/card";
import { 
  Shield, 
  Search, 
  Send, 
  Target, 
  ArrowUpRight, 
  X, 
  MessageSquare, 
  Zap, 
  Globe, 
  Clock, 
  ShieldCheck, 
  Edit3, 
  Trash2,
  Mail,
  Activity
} from "lucide-react";
import { cn } from "../ui/utils";
import { Button } from "../ui/button";
import { ChatMessage, DirectMessage, User, Bounty } from "../../context/AppContext";

// --- Sub-components (Global Relay) ---

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
                        className="w-9 h-9 rounded-xl border border-border/30 shrink-0 mt-1 shadow-2xl cursor-pointer hover:border-blue-500/50 transition-all"
                        onClick={() => navigate(`/u/${msg.user_id}`)}
                     >
                        <AvatarImage src={msg.avatar} />
                        <AvatarFallback>{msg.user[0]}</AvatarFallback>
                     </Avatar>
                  )}
                  <div className={cn(
                     "max-w-[85%] rounded-[1.25rem] px-5 py-3.5 transition-all text-xs font-medium leading-relaxed group/msg position-relative",
                     msg.type === 'system'
                        ? 'bg-card/60 border border-border/15 text-[10px] font-black text-muted-foreground/70 uppercase tracking-[0.2em] rounded-full px-8'
                        : 'bg-card/10 border border-border/15 text-foreground/80 hover:border-indigo-500/20 shadow-2xl'
                  )}>
                     {msg.type !== 'system' && (
                        <div className="flex items-center gap-3 mb-1.5">
                           <span
                              className="text-[11px] font-black text-foreground uppercase tracking-tight cursor-pointer hover:text-blue-400 transition-colors"
                              onClick={() => navigate(`/u/${msg.user_id}`)}
                           >
                              {msg.user}
                           </span>
                           <span className="text-[9px] font-bold text-muted-foreground/50 font-['Fira_Code']">{msg.time}</span>
                        </div>
                     )}
                     {msg.content}
                  </div>
               </div>
            ))}
         </div>

         <form onSubmit={handleSubmit} className="p-6 bg-card/20 border-t border-border/15">
            <div className="relative group/input">
               <input
                  className="w-full bg-card/30 border border-border/30 rounded-[1.5rem] py-4 pl-6 pr-14 text-xs font-medium text-foreground outline-none focus:border-indigo-500/50 transition-all placeholder:text-muted-foreground/30 shadow-inner"
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

const BountyMatrixGrid: React.FC<{
  bounties: Bounty[];
  claimBounty: (bountyId: string) => Promise<void>;
  user: User | null;
}> = ({ bounties, claimBounty, user }) => {
   const [filter, setFilter] = useState<'all' | 'open' | 'claimed'>('all');
   const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);

   const filtered = bounties.filter(b => {
      if (filter === 'open') return b.status === 'open';
      if (filter === 'claimed') return b.claimed_by === user?.id;
      return true;
   });

   return (
      <div className="flex-1 flex flex-col overflow-hidden relative">
         <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] z-10 opacity-20" style={{ backgroundSize: '100% 3px' }} />

         <div className="p-4 flex items-center justify-between border-b border-border/15 bg-card/20 relative z-20">
            <div className="flex items-center gap-2">
               <div className="w-1 h-3 bg-indigo-500 rounded-full animate-pulse" />
               <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Active_Matrix</div>
            </div>
            <div className="flex gap-1 bg-card/50 p-1 rounded-lg border border-border/30">
               {(['all', 'open', 'claimed'] as const).map((f) => (
                  <button
                     key={f}
                     onClick={() => setFilter(f)}
                     className={cn(
                        "px-3 py-1 rounded-md text-[8px] font-black uppercase transition-all",
                        filter === f
                           ? "bg-indigo-600 text-foreground shadow-lg shadow-indigo-600/20"
                           : "text-muted-foreground/70 hover:text-muted-foreground"
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
                     <Target className="w-12 h-12 mb-4 text-muted-foreground/70" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">No_Missions_Detected</span>
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
                        className="p-4 rounded-2xl bg-card/40 border border-border/30 hover:border-indigo-500/40 hover:bg-indigo-500/[0.02] transition-all group cursor-pointer relative overflow-hidden"
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
                              <span className="text-[9px] font-black text-muted-foreground/70 uppercase tracking-tighter">{bounty.type}</span>
                           </div>
                           <div className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400">
                              +{bounty.reward_xp} XP
                           </div>
                        </div>

                        <h4 className="text-xs font-black text-foreground uppercase tracking-tight mb-1 group-hover:text-indigo-400 transition-colors">
                           {bounty.title}
                        </h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                           {bounty.description}
                        </p>

                        <div className="flex items-center justify-between relative z-10">
                           <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                 <Clock className="w-3 h-3 text-muted-foreground/50" />
                                 <span className="text-[8px] font-bold text-muted-foreground/70 uppercase">
                                    {bounty.deadline ? new Date(bounty.deadline).toLocaleDateString() : "INF_EXP"}
                                 </span>
                              </div>
                           </div>

                           <div className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-muted/30 flex items-center gap-2",
                              bounty.status === 'completed' ? "text-green-500" :
                                 (bounty.status === 'claimed' || bounty.status === 'in_progress')
                                    ? (bounty.claimed_by === user?.id ? "text-orange-400 animate-pulse" : "text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]")
                                    : "text-muted-foreground group-hover:text-indigo-400"
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
            className="absolute inset-0 bg-background/90 backdrop-blur-md"
         />
         <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-lg bg-card border border-border/40 rounded-3xl shadow-2xl relative z-10 overflow-hidden"
         >
            <div className="p-8 border-b border-border/25 relative overflow-hidden bg-indigo-500/[0.02]">
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
                  <button onClick={onClose} className="p-2 hover:bg-muted/50 rounded-full text-muted-foreground transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>

               <div className="flex gap-4 relative z-20">
                  <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/5 text-indigo-400 uppercase text-[9px] font-black px-3 py-1">
                     {bounty.difficulty}
                  </Badge>
                  <Badge variant="outline" className="border-border/50 bg-muted/30 text-muted-foreground uppercase text-[9px] font-black px-3 py-1">
                     {bounty.type}
                  </Badge>
                  <div className="ml-auto flex items-center gap-2 text-[11px] font-black text-indigo-400">
                     <Activity className="w-4 h-4" />
                     {bounty.reward_xp} XP REWARD
                  </div>
               </div>
            </div>

            <div className="p-8 space-y-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest flex items-center gap-2">
                     <ShieldCheck className="w-3.5 h-3.5" /> Objective_Intelligence
                  </label>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                     {bounty.description}
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 rounded-2xl bg-card/50 border border-border/30">
                     <div className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest mb-1">Priority_Rank</div>
                     <div className="text-lg font-black text-indigo-400">{bounty.reward_xp >= 1000 ? 'S-TIER' : bounty.reward_xp >= 500 ? 'A-TIER' : 'B-TIER'}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-card/50 border border-border/30">
                     <div className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest mb-1">Time_Window</div>
                     <div className="text-lg font-black text-foreground/80">
                        {bounty.deadline ? `${Math.ceil((new Date(bounty.deadline).getTime() - Date.now()) / (1000 * 3600 * 24))} Days` : 'PERMANENT'}
                     </div>
                  </div>
               </div>

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
                     <div className="w-full py-6 bg-muted/50 border border-border/30 text-muted-foreground text-center font-black uppercase tracking-[0.2em] rounded-2xl">
                        Mission_In_Progress
                     </div>
                  )}
               </div>
            </div>

            <div className="p-4 bg-card/60 border-t border-border/15 text-center">
               <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.5em]">System_Verified_Objective // HM_GRID_SYNC_v4.5</span>
            </div>
         </motion.div>
      </div>
   );
};

// --- Main Component ---

export const CommunicationMatrix: React.FC<{
   globalMessages: ChatMessage[];
   directMessages: DirectMessage[];
   onSendGlobal: (content: string) => void;
   onSendDirect: (receiverId: string, content: string, replyToId?: string) => void;
   editDirectMessage: (messageId: string, newContent: string) => Promise<void>;
   deleteDirectMessage: (messageId: string) => Promise<void>;
   reactToDirectMessage: (messageId: string, emoji: string) => Promise<void>;
   currentUser: User;
   allProfiles: User[];
   searchUsers: (query: string) => Promise<User[]>;
   initialMode?: "global" | "intel" | "operatives" | "bounties";
   initialTargetUserId?: string | null;
   onMarkAllRead?: () => Promise<void>;
   bounties?: Bounty[];
   claimBounty?: (bountyId: string) => Promise<void>;
   hideHeader?: boolean;
}> = ({
   globalMessages,
   directMessages,
   onSendGlobal,
   onSendDirect,
   editDirectMessage,
   deleteDirectMessage,
   reactToDirectMessage,
   currentUser,
   allProfiles,
   searchUsers,
   initialMode = "global",
   initialTargetUserId = null,
   onMarkAllRead,
   bounties = [],
   claimBounty = async () => {},
   hideHeader = false
}) => {
      const navigate = useNavigate();
      const [mode, setMode] = useState<"global" | "intel" | "operatives" | "bounties">(initialMode);
      const [selectedThread, setSelectedThread] = useState<string | null>(initialTargetUserId);
      const [searchQuery, setSearchQuery] = useState("");
      const [searchResults, setSearchResults] = useState<User[]>([]);
      const [replyingTo, setReplyingTo] = useState<DirectMessage | null>(null);
      const [editingMessage, setEditingMessage] = useState<DirectMessage | null>(null);
      const [chatInput, setChatInput] = useState("");

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
      }, [searchQuery, searchUsers]);

      return (
         <div className="flex flex-col h-full bg-slate-900/5 border border-border/15 rounded-[2.5rem] overflow-hidden shadow-2xl">
            {/* Switcher Header */}
            {!hideHeader && (
               <div className="p-3 bg-card/40 border-b border-border/15 flex items-center gap-1.5">
                  <button
                     onClick={() => setMode("global")}
                     className={cn(
                        "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1",
                        mode === "global" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-muted-foreground/70 hover:text-foreground/80"
                     )}
                  >
                     <Globe className="w-3 h-3" /> Global
                  </button>
                  <button
                     onClick={() => setMode("intel")}
                     className={cn(
                        "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1",
                        mode === "intel" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-muted-foreground/70 hover:text-foreground/80"
                     )}
                  >
                     <Shield className="w-3 h-3" /> Intel
                  </button>
                  <button
                     onClick={() => setMode("bounties")}
                     className={cn(
                        "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1",
                        mode === "bounties" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-muted-foreground/70 hover:text-foreground/80"
                     )}
                  >
                     <Target className="w-3 h-3" /> Bounty
                  </button>
               </div>
            )}

            {mode === "global" ? (
               <GlobalRelay messages={globalMessages} onSend={onSendGlobal} user={currentUser} />
            ) : mode === "bounties" ? (
               <BountyMatrixGrid bounties={bounties} claimBounty={claimBounty} user={currentUser} />
            ) : mode === "operatives" ? (
               <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                  <div className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-4 text-center">Network_Operatives</div>
                  {allProfiles.filter(p => p.id !== currentUser.id).map(u => (
                     <div
                        key={u.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-card/40 border border-white/[0.02] hover:border-indigo-500/20 transition-all group"
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
                           <div className="text-[8px] font-bold text-muted-foreground/70 uppercase mt-0.5">{u.role}</div>
                        </div>
                        <button
                           onClick={() => { setMode("intel"); setSelectedThread(u.id); }}
                           className="p-2 hover:bg-muted/50 rounded-lg text-muted-foreground/50 hover:text-indigo-400 transition-colors"
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
                        <div className="relative mb-4">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/50" />
                           <input
                              className="w-full h-8 bg-card/60 border border-border/30 rounded-lg pl-8 pr-4 text-[9px] font-bold text-foreground uppercase outline-none focus:border-indigo-500/30 transition-all placeholder:text-muted-foreground/30"
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
                                    className="flex items-center gap-3 p-3 rounded-xl bg-card/40 border border-white/[0.02] hover:border-indigo-500/20 cursor-pointer transition-all"
                                 >
                                    <Avatar className="w-8 h-8 rounded-lg">
                                       <AvatarImage src={partnerAvatar} />
                                       <AvatarFallback>{partnerName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                       <div className="flex items-center justify-between mb-0.5">
                                          <span className="text-[10px] font-black text-foreground truncate">{partnerName}</span>
                                          <span className="text-[7px] font-bold text-muted-foreground/50">{new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                       </div>
                                       <p className="text-[9px] font-medium text-muted-foreground truncate">{lastMsg.content}</p>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  ) : (
                     <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-3 bg-card/40 border-b border-border/15 flex items-center gap-3">
                           <button
                              onClick={() => setSelectedThread(null)}
                              className="p-1.5 hover:bg-indigo-500/10 rounded-lg text-indigo-500 transition-colors shrink-0"
                              title="Back to Intel"
                           >
                              <ArrowUpRight className="w-4 h-4 rotate-180" />
                           </button>
                           <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => navigate(`/u/${selectedThread}`)}>
                              <Avatar className="w-7 h-7 rounded-md border border-border/50">
                                 <AvatarImage src={allProfiles.find(p => p.id === selectedThread)?.avatar} />
                                 <AvatarFallback>{allProfiles.find(p => p.id === selectedThread)?.name?.[0] || '?'}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                 <span className="text-[11px] font-black uppercase tracking-widest text-foreground font-['JetBrains_Mono'] leading-none">
                                    {allProfiles.find(p => p.id === selectedThread)?.name || 'Unknown Operative'}
                                 </span>
                                 <span className="text-[8px] font-bold text-muted-foreground uppercase mt-0.5">Secure Channel Active</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                           {threads[selectedThread]?.map(msg => {
                              const isMe = msg.sender_id === currentUser.id;
                              const repliedMsg = msg.reply_to_id ? threads[selectedThread]?.find(m => m.id === msg.reply_to_id) : null;

                              return (
                                 <div key={msg.id} className={cn("flex flex-col group/msg", isMe ? "items-end" : "items-start")}>
                                    {repliedMsg && (
                                       <div className={cn("flex items-center gap-1.5 mb-1 px-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer max-w-[70%]", isMe ? "flex-row-reverse text-right" : "text-left")}>
                                          <ArrowUpRight className={cn("w-2.5 h-2.5", isMe ? "-scale-x-100" : "")} />
                                          <span className="text-[8px] font-bold uppercase truncate">
                                             Replying to {repliedMsg.sender_id === currentUser.id ? "yourself" : repliedMsg.sender_name}
                                          </span>
                                       </div>
                                    )}

                                    <div className="relative flex items-center gap-2 max-w-full">
                                       <div className={cn(
                                          "absolute -top-8 flex gap-1 bg-card/90 border border-border/40 p-1 rounded-lg opacity-0 group-hover/msg:opacity-100 transition-all z-10 backdrop-blur-sm shadow-xl",
                                          isMe ? "right-0" : "left-0"
                                       )}>
                                          <button
                                             onClick={() => setReplyingTo(msg)}
                                             className="p-1 hover:bg-indigo-500/20 rounded text-muted-foreground hover:text-indigo-400 transition-colors"
                                             title="Reply"
                                          >
                                             <MessageSquare className="w-3 h-3" />
                                          </button>
                                          <button
                                             onClick={() => {
                                                const emoji = ["👍", "❤️", "🚀", "🔥"][Math.floor(Math.random() * 4)];
                                                reactToDirectMessage(msg.id, emoji);
                                             }}
                                             className="p-1 hover:bg-yellow-500/20 rounded text-muted-foreground hover:text-yellow-500 transition-colors"
                                             title="React"
                                          >
                                             <Zap className="w-3 h-3" />
                                          </button>
                                          {isMe && !msg.is_deleted && (
                                             <>
                                                <button
                                                   onClick={() => {
                                                      setEditingMessage(msg);
                                                      setChatInput(msg.content);
                                                   }}
                                                   className="p-1 hover:bg-blue-500/20 rounded text-muted-foreground hover:text-blue-400 transition-colors"
                                                   title="Edit"
                                                >
                                                   <Edit3 className="w-3 h-3" />
                                                </button>
                                                <button
                                                   onClick={() => deleteDirectMessage(msg.id)}
                                                   className="p-1 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive transition-colors"
                                                   title="Delete"
                                                >
                                                   <Trash2 className="w-3 h-3" />
                                                </button>
                                             </>
                                          )}
                                       </div>

                                       <div className={cn(
                                          "rounded-[1rem] px-4 py-2 text-[10px] font-medium leading-relaxed shadow-lg relative group overflow-hidden",
                                          isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-card/60 text-foreground/80 border border-border/30 rounded-bl-none",
                                          msg.is_deleted && "opacity-50 italic font-normal"
                                       )}>
                                          {isMe && !msg.is_deleted && (
                                             <div className="absolute top-0 right-0 w-8 h-8 bg-white/5 blur-xl -rotate-45" />
                                          )}

                                          <p className="relative z-10 break-words">
                                             {msg.is_deleted ? "Intel purged by operative." : msg.content}
                                             {msg.is_edited && !msg.is_deleted && (
                                                <span className="ml-1 opacity-40 text-[7px] uppercase font-black tracking-tighter">(Edited)</span>
                                             )}
                                          </p>
                                       </div>
                                    </div>

                                    {Object.keys(msg.reactions || {}).length > 0 && (
                                       <div className={cn("flex flex-wrap gap-1 mt-1", isMe ? "justify-end" : "justify-start")}>
                                          {Object.entries(msg.reactions || {}).map(([emoji, users]) => (
                                             <button
                                                key={emoji}
                                                onClick={() => reactToDirectMessage(msg.id, emoji)}
                                                className={cn(
                                                   "flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8px] font-bold transition-all",
                                                   Array.isArray(users) && (users as string[]).includes(currentUser.id)
                                                      ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-400"
                                                      : "bg-card/40 border-border/20 text-muted-foreground hover:border-border/40"
                                                )}
                                             >
                                                <span>{emoji}</span>
                                                <span>{Array.isArray(users) ? (users as string[]).length : 0}</span>
                                             </button>
                                          ))}
                                       </div>
                                    )}
                                 </div>
                              );
                           })}
                        </div>
                        {(replyingTo || editingMessage) && (
                           <div className="px-4 py-2 bg-indigo-500/10 border-t border-border/15 flex items-center justify-between animate-in slide-in-from-bottom-2">
                              <div className="flex items-center gap-2 overflow-hidden">
                                 <div className="p-1.5 bg-indigo-500/20 rounded text-indigo-400">
                                    {replyingTo ? <MessageSquare className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-[8px] font-black uppercase text-indigo-400 tracking-widest">
                                       {replyingTo ? `Replying to ${replyingTo.sender_name}` : "Editing Payload"}
                                    </p>
                                    <p className="text-[9px] text-muted-foreground truncate italic">
                                       {replyingTo ? replyingTo.content : editingMessage?.content}
                                    </p>
                                 </div>
                              </div>
                              <button
                                 onClick={() => { setReplyingTo(null); setEditingMessage(null); setChatInput(""); }}
                                 className="p-1 hover:bg-card rounded-full text-muted-foreground hover:text-foreground transition-colors"
                              >
                                 <X className="w-3 h-3" />
                              </button>
                           </div>
                        )}

                        <form
                           onSubmit={(e) => {
                              e.preventDefault();
                              if (!chatInput.trim() || !selectedThread) return;

                              if (editingMessage) {
                                 editDirectMessage(editingMessage.id, chatInput);
                                 setEditingMessage(null);
                              } else {
                                 onSendDirect(selectedThread, chatInput, replyingTo?.id);
                                 setReplyingTo(null);
                              }
                              setChatInput("");
                           }}
                           className="p-3 bg-card/70 border-t border-border/20"
                        >
                           <div className="relative">
                              <input
                                 value={chatInput}
                                 onChange={(e) => setChatInput(e.target.value)}
                                 autoFocus
                                 className="w-full bg-card/30 border border-border/30 rounded-full py-2 pl-4 pr-10 text-[10px] font-medium text-foreground outline-none focus:border-indigo-500/50 transition-all placeholder:text-muted-foreground/30"
                                 placeholder={editingMessage ? "SAVE_CHANGES..." : "TRANSMIT_DATA..."}
                              />
                              <button className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all">
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
