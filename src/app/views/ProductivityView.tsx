import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
   Zap,
   Shield,
   Target,
   History,
   Award,
   Activity,
   Cpu,
   Star,
   CheckCircle2,
   Lock,
   TrendingUp,
   Bookmark,
   Plus,
   Trash2,
   ChevronRight,
   LucideIcon,
   Bell,
   Layers,
   Hexagon,
   Milestone,
   Crown,
   Trophy,
   Terminal,
   Map,
   BarChart3,
   Activity as ActivityIcon
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/card";
import { useAppContext } from "../context/AppContext";
import {
   ResponsiveContainer,
   AreaChart,
   Area,
   XAxis,
   YAxis,
   Tooltip,
   RadarChart,
   PolarGrid,
   PolarAngleAxis,
   Radar
} from "recharts";
import { cn } from "../components/ui/utils";
import { toast } from "sonner";

// --- Types ---
interface Achievement {
   id: string;
   title: string;
   description: string;
   icon: LucideIcon;
   unlocked: boolean;
   requirement?: string;
}

// --- Sub-components (Intelligence Pro) ---

const RollingValue: React.FC<{ value: string | number }> = ({ value }) => (
   <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-block"
   >
      {value}
   </motion.span>
);

const KPICard: React.FC<{
   title: string;
   value: string | number;
   change?: string;
   icon: LucideIcon;
   color: string;
   data: { val: number }[]
}> = ({ title, value, change, icon: Icon, color, data }) => (
   <div className="p-6 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-3xl relative overflow-hidden group hover:border-border/60 hover:bg-card/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Focal Glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-[0.03] blur-3xl group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ color: color.includes('blue') ? '#3B82F6' : color.includes('emerald') ? '#10B981' : '#F97316' }} />

      <div className="flex items-start justify-between relative z-10 mb-4">
         <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-1 font-['Fira_Code']">{title}</p>
            <h3 className="text-4xl font-black text-foreground tracking-tighter drop-shadow-lg">
               <RollingValue value={value} />
            </h3>
            {change && <span className="text-[10px] font-black text-emerald-500/80 uppercase mt-2 inline-block tracking-widest">{change}</span>}
         </div>
         <div className={cn("p-3 rounded-xl bg-secondary border border-border shadow-2xl transition-transform duration-500 group-hover:scale-110", color)}>
            <Icon className="w-5 h-5" />
         </div>
      </div>
      <div className="h-12 w-full relative z-10 mt-auto">
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
               <Area type="monotone" dataKey="val" stroke="currentColor" fill="none" strokeWidth={2.5} className={color} />
            </AreaChart>
         </ResponsiveContainer>
      </div>
   </div>
);

const ActivityHeatmap: React.FC<{ history: any[] }> = ({ history }) => {
   const days = 70; // 10 weeks
   const data = useMemo(() => {
      const counts: Record<string, number> = {};
      history?.forEach(h => {
         const date = new Date(h.created_at).toLocaleDateString();
         counts[date] = (counts[date] || 0) + 1;
      });

      return Array.from({ length: days }).map((_, i) => {
         const d = new Date();
         d.setDate(d.getDate() - (days - 1 - i));
         const dateStr = d.toLocaleDateString();
         const level = counts[dateStr] ? Math.min(counts[dateStr], 4) : 0;
         return { level, date: dateStr };
      });
   }, [history]);

   return (
      <div className="p-8 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-3xl relative overflow-hidden group h-full hover:border-border/60 transition-all duration-300">
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <Terminal className="w-4 h-4 text-blue-500" />
               <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">Operational Pulse</h3>
            </div>
            <div className="flex items-center gap-1.5 font-['Fira_Code'] text-[9px] text-slate-500">
               <span>LOW</span>
               {[0, 1, 2, 3, 4].map(l => (
                  <div key={l} className={cn(
                     "w-2.5 h-2.5 rounded-sm border border-border/50",
                     l === 0 ? "bg-muted" :
                        l === 1 ? "bg-blue-900/50" :
                           l === 2 ? "bg-blue-700/50" :
                              l === 3 ? "bg-blue-500/50" : "bg-blue-400"
                  )} />
               ))}
               <span>HIGH</span>
            </div>
         </div>
         <div className="grid grid-flow-col grid-rows-7 gap-1.5">
            {data.map((d, i) => (
               <div
                  key={i}
                  title={`${d.date}: ${d.level} operations`}
                  className={cn(
                     "w-full pt-[100%] rounded-sm transition-all duration-300 hover:scale-150 hover:z-10 cursor-crosshair border border-white/[0.02]",
                     d.level === 0 ? "bg-slate-800/20" :
                        d.level === 1 ? "bg-blue-900/60" :
                           d.level === 2 ? "bg-blue-700/60" :
                              d.level === 3 ? "bg-blue-500/60" : "bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                  )}
               />
            ))}
         </div>
         <div className="mt-8 flex justify-between text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] font-['Fira_Code']">
            <span>OCT_SYNC</span>
            <span>NOV_SYNC</span>
            <span>DEC_SYNC</span>
            <span>JAN_SYNC</span>
            <span>FEB_SYNC</span>
         </div>
      </div>
   );
};

const CustomTooltip = ({ active, payload, label }: any) => {
   if (active && payload && payload.length) {
      return (
         <div className="bg-slate-950 border border-white/10 p-4 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)] font-['Fira_Code'] backdrop-blur-xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-2">{label || "DATA_PACKET"}</p>
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
               <p className="text-sm font-black text-white uppercase tracking-tight">INTENSITY: {payload[0].value.toLocaleString()}</p>
            </div>
         </div>
      );
   }
   return null;
};

// --- Main View ---

export function ProductivityView() {

   const {
      user,
      personalNotes,
      personalReminders,
      milestones,
      professionalHistory,
      teams,
      addPersonalNote,
      deletePersonalNote,
      addPersonalReminder,
      toggleReminder,
      deleteReminder,
      analytics
   } = useAppContext();

   const [noteDraft, setNoteDraft] = useState("");
   const [noteTitle, setNoteTitle] = useState("");
   const [isAddingNote, setIsAddingNote] = useState(false);
   const [reminderText, setReminderText] = useState("");

   // --- Calculated Data ---
   // Individual sparklines are handled directly in the cards via analytics.trends

   const achievements: Achievement[] = [
      { id: 'a1', title: 'Tactical Breach', description: 'Immediate urgent task resolution.', icon: Target, unlocked: true },
      { id: 'a2', title: 'Ghost Protocol', description: 'Maintain zero latency for 7 cycles.', icon: Shield, unlocked: true },
      { id: 'a3', title: 'Deep Scribe', description: 'Commit 10 strategic intel nodes.', icon: Bookmark, unlocked: (personalNotes?.length || 0) >= 10, requirement: '10 Intel Nodes' },
      { id: 'a4', title: 'Nexus Node', description: 'Inter-squad collaboration link.', icon: Layers, unlocked: (teams?.length || 0) >= 3, requirement: '3 Squad Connections' },
   ];

   const handleSubmitNote = async () => {
      if (!noteDraft.trim()) return;
      await addPersonalNote({ title: noteTitle || "Untitled Intel", content: noteDraft });
      setNoteDraft(""); setNoteTitle(""); setIsAddingNote(false);
   };

   return (
      <div className="h-full overflow-y-auto bg-background scrollbar-hide font-['Fira_Sans'] selection:bg-blue-500/30 text-muted-foreground">
         {/* Intel Grid Overlay */}
         <div className="fixed inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
         <div className="fixed inset-0 pointer-events-none bg-gradient-to-tr from-blue-600/[0.03] via-transparent to-orange-600/[0.03]" />

         <div className="max-w-[1700px] mx-auto p-12 space-y-10 relative z-10">

            {/* HEADER: INTELLIGENCE HUB */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/[0.04] pb-12">
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 px-3 py-1 rounded-sm bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] font-['Fira_Code'] animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-current" /> SYSTEM_ONLINE
                     </div>
                     <div className="text-[10px] font-bold text-slate-700 uppercase tracking-widest font-['Fira_Code']">NODE_ID: {user?.id.split('-')[0]}</div>
                  </div>
                  <h1 className="text-7xl font-black text-foreground uppercase tracking-[calc(-0.05em)] leading-none italic">
                     INTEL_<span className="text-blue-500 not-italic">PRO</span>
                  </h1>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.3em] max-w-xl font-['Fira_Code']">EXECUTIVE ANALYSIS // TACTICAL TELEMETRY STREAM // V.4.0.2</p>
               </div>
               <div className="flex items-center gap-12 bg-card/40 p-8 rounded-2xl border border-border/40 backdrop-blur-xl">
                  <div className="text-right">
                     <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-2 font-['Fira_Code']">PRESTIGE_RANK</div>
                     <div className="text-4xl font-black text-foreground uppercase tracking-tighter flex items-center gap-4 justify-end">
                        <RollingValue value={user?.rank || ""} />
                        <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                           <Trophy className="w-6 h-6 text-orange-500" />
                        </div>
                     </div>
                  </div>
                  <div className="h-14 w-[1px] bg-white/[0.08]" />
                  <div className="text-right">
                     <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-2 font-['Fira_Code']">REPUTATION_AGGREGATE</div>
                     <div className="text-4xl font-black text-foreground tracking-tighter shadow-orange-500/20">
                        <RollingValue value={user?.reputation?.toLocaleString() || 0} /> <span className="text-blue-500 text-sm ml-1 font-['Fira_Code']">RP</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* BENTO GRID SHOWCASE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">

               {/* TOP KPI CARDS */}
               <div className="xl:col-span-2">
                  <KPICard title="OPS_EFFICIENCY" value={`${analytics.efficiency.toFixed(1)}%`} change="SYNC: STABLE" icon={TrendingUp} color="text-blue-500" data={analytics.trends.efficiency} />
               </div>
               <div className="xl:col-span-2">
                  <KPICard title="INTEL_PULSE" value={analytics.pulseCount} change="LAST_24H" icon={CheckCircle2} color="text-emerald-500" data={analytics.trends.pulse} />
               </div>
               <div className="xl:col-span-2">
                  <KPICard title="MERIT_VOLTAGE" value={user?.reputation?.toLocaleString() || 0} change="SYSTEM_XP" icon={Award} color="text-orange-500" data={analytics.trends.merit} />
               </div>

               {/* ACTIVITY HEATMAP (Large Bento) */}
               <div className="md:col-span-2 lg:col-span-4 xl:col-span-4 row-span-2">
                  <ActivityHeatmap history={professionalHistory || []} />
               </div>

               {/* RADAR DOSSIER */}
               <div className="md:col-span-2 lg:col-span-2 xl:col-span-2 row-span-2 p-10 rounded-2xl bg-card/50 border border-border/40 backdrop-blur-3xl group hover:border-blue-500/20 transition-all duration-500">
                  <div className="flex items-center justify-between mb-10">
                     <div>
                        <h3 className="text-sm font-black text-foreground uppercase tracking-[0.3em]">EXPERT_SPECTRUM</h3>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1 font-['Fira_Code']">QUALITATIVE ANALYSIS</p>
                     </div>
                     <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <Hexagon className="w-5 h-5 text-blue-500 animate-spin-slow" />
                     </div>
                  </div>
                  <div className="h-[260px] w-full filter contrast-125">
                     <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analytics.skillMatrix}>
                           <PolarGrid stroke="rgba(255,255,255,0.05)" gridType="polygon" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900, fontFamily: 'Fira Code', letterSpacing: '0.1em' }} />
                           {/* Glow Layer */}
                           <Radar name="Expertise" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.05} strokeWidth={8} strokeLinecap="round" />
                           {/* Primary Layer */}
                           <Radar name="Level" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={3} />
                           <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="mt-8 space-y-4">
                     {analytics.skillMatrix.map(s => (
                        <div key={s.subject} className="flex items-center justify-between group/row">
                           <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30 group-hover/row:bg-blue-500 transition-colors" />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-['Fira_Code']">{s.subject}</span>
                           </div>
                           <div className="flex-1 mx-6 h-[2px] bg-white/[0.03] rounded-full overflow-hidden">
                              <motion.div
                                 initial={{ width: 0 }}
                                 animate={{ width: `${(s.A / 150) * 100}%` }}
                                 className="h-full bg-blue-500/50 group-hover/row:bg-blue-500 transition-all duration-500"
                              />
                           </div>
                           <span className="text-[10px] font-black text-white font-['Fira_Code']">{s.A}</span>
                        </div>
                     ))}
                  </div>
               </div>

               {/* MERIT PORTFOLIO BENTO */}
               <div className="md:col-span-2 lg:col-span-2 xl:col-span-2 p-10 rounded-2xl bg-slate-900/50 border border-white/[0.04] backdrop-blur-3xl group hover:border-orange-500/20 transition-all duration-500">
                  <div className="flex items-center justify-between mb-10">
                     <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">MERIT_PORTFOLIO</h3>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1 font-['Fira_Code']">CERTIFIED ACHIEVEMENTS</p>
                     </div>
                     <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                        <Award className="w-5 h-5 text-orange-500" />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     {achievements.map((ach) => (
                        <div key={ach.id} className={cn(
                           "p-5 rounded-2xl border transition-all duration-500 relative overflow-hidden group/ach",
                           ach.unlocked ? "bg-slate-950/60 border-white/[0.04] hover:border-blue-500/40 shadow-xl" : "bg-slate-950/20 border-white/[0.01] opacity-30 grayscale"
                        )}>
                           {!ach.unlocked && <Lock className="absolute top-3 right-3 w-3 h-3 text-slate-800" />}
                           <ach.icon className={cn("w-6 h-6 mb-4 transition-all duration-500 group-hover/ach:scale-110 group-hover/ach:rotate-3", ach.unlocked ? "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "text-slate-700")} />
                           <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1 truncate">{ach.title}</h4>
                           <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter line-clamp-2 leading-relaxed">{ach.description}</p>
                        </div>
                     ))}
                  </div>
               </div>

               {/* MISSION CHRONOLOGY (Large Centered Bento) */}
               <div className="md:col-span-2 lg:col-span-4 xl:col-span-4 row-span-2 p-10 rounded-2xl bg-slate-900/50 border border-white/[0.04] backdrop-blur-3xl overflow-hidden flex flex-col group hover:border-white/10 transition-all duration-500">
                  <div className="flex items-center justify-between mb-10">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                           <Terminal className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                           <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">MISSION_CHRONOLOGY</h3>
                           <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1 font-['Fira_Code']">SECURE_TELEMETRY_STREAM</p>
                        </div>
                     </div>
                     <div className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] font-['Fira_Code']">ENTRIES: {professionalHistory?.length || 0} // BUFFER_OK</div>
                  </div>
                  <div className="flex-1 space-y-4 overflow-y-auto pr-4 scrollbar-hide font-['Fira_Code']">
                     {professionalHistory?.slice(0, 20).map((log, i) => (
                        <div key={log.id} className="relative pl-12 group/log cursor-default py-4 border-l border-white/[0.03] ml-3 hover:bg-white/[0.01] transition-all rounded-r-xl">
                           <div className="absolute -left-[7px] top-6 w-3 h-3 rounded-full bg-slate-950 border-2 border-slate-900 group-hover/log:border-blue-500 transition-all duration-300 z-10 shadow-2xl">
                              <div className={cn("w-full h-full rounded-full", log.type === 'task' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]')} />
                           </div>
                           <div className="flex items-center justify-between mb-2">
                              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                 [{new Date(log.created_at).toLocaleTimeString([], { hour12: false })}] // TYPE::{log.type.toUpperCase()}
                              </div>
                              <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest opacity-0 group-hover/log:opacity-100 transition-opacity">PID_{log.id.split('-')[0]}</div>
                           </div>
                           <h4 className="text-sm font-bold text-white uppercase tracking-tight group-hover/log:text-blue-400 transition-all duration-300 leading-none">{log.action}</h4>
                           {log.details && <p className="text-[10px] text-slate-600 mt-3 italic leading-relaxed max-w-2xl border-l-2 border-white/[0.02] pl-4 opacity-60 group-hover/log:opacity-100 group-hover/log:text-slate-400 group-hover/log:border-blue-500/30 transition-all">"{log.details}"</p>}
                        </div>
                     ))}
                     {professionalHistory?.length === 0 && (
                        <div className="text-center py-24 border border-dashed border-white/[0.05] rounded-3xl opacity-20">
                           <History className="w-12 h-12 mx-auto mb-6 opacity-50" />
                           <p className="text-xs font-black uppercase tracking-[0.5em]">NO_TELEMETRY_DETECTED</p>
                        </div>
                     )}
                  </div>
               </div>

               {/* STRATEGIC TRAY (Right Column) */}
               <div className="md:col-span-2 lg:col-span-2 xl:col-span-2 row-span-2 space-y-6">
                  {/* INTEL ENTRY BENTO */}
                  <div className="p-10 rounded-2xl bg-slate-900/50 border border-white/[0.04] backdrop-blur-3xl group hover:border-blue-500/20 transition-all duration-500">
                     <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                              <Plus className="w-5 h-5 text-blue-500" />
                           </div>
                           <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">INTEL_ENTRY</h3>
                        </div>
                     </div>
                     <div className="space-y-5 font-['Fira_Code']">
                        <div className="space-y-2">
                           <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-1">CLASSIFICATION_HEADER</label>
                           <input
                              className="w-full bg-slate-950 border border-white/[0.06] rounded-xl p-4 text-xs font-bold text-white uppercase tracking-tight outline-none focus:border-blue-500 transition-all placeholder:text-slate-800 shadow-inner"
                              placeholder="INPUT_SUBJECT..."
                              value={noteTitle}
                              onChange={e => setNoteTitle(e.target.value)}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-1">DATA_PAYLOAD</label>
                           <textarea
                              className="w-full bg-slate-950 border border-white/[0.06] rounded-xl p-5 text-xs font-medium text-slate-400 min-h-[140px] outline-none focus:border-blue-500 transition-all resize-none placeholder:text-slate-800 shadow-inner leading-relaxed"
                              placeholder="SECURE_TRANSMISSION_INPUT..."
                              value={noteDraft}
                              onChange={e => setNoteDraft(e.target.value)}
                           />
                        </div>
                        <Button onClick={handleSubmitNote} className="w-full h-14 bg-blue-600 hover:bg-blue-500 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all hover:shadow-[0_15px_40px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 active:translate-y-0">EXECUTE_APPEND</Button>
                     </div>
                  </div>

                  {/* ACTIVE BEACONS BENTO */}
                  <div className="p-10 rounded-2xl bg-slate-900/50 border border-white/[0.04] backdrop-blur-3xl group hover:border-orange-500/20 transition-all duration-500">
                     <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                              <Bell className="w-5 h-5 text-orange-500" />
                           </div>
                           <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">ACTIVE_BEACONS</h3>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                     </div>
                     <div className="space-y-4 font-['Fira_Code']">
                        {personalReminders?.slice(0, 5).map(rem => (
                           <div key={rem.id} className="group/rem flex items-center gap-5 p-4 rounded-xl bg-slate-950/60 border border-white/[0.02] hover:border-orange-500/30 transition-all cursor-pointer">
                              <div
                                 onClick={() => toggleReminder(rem.id, !rem.is_completed)}
                                 className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300", rem.is_completed ? "bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "border-slate-800 group-hover/rem:border-orange-500/50")}
                              >
                                 {rem.is_completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <span className={cn("text-[11px] font-bold uppercase truncate flex-1 tracking-tight transition-colors", rem.is_completed ? "line-through text-slate-700" : "text-slate-400 group-hover/rem:text-white")}>{rem.content}</span>
                              <Trash2 onClick={() => deleteReminder(rem.id)} className="w-4 h-4 text-slate-800 hover:text-red-500 opacity-0 group-hover/rem:opacity-100 transition-all duration-300" />
                           </div>
                        ))}
                        {personalReminders?.length === 0 && <p className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.4em] text-center py-8 border border-dashed border-white/[0.02] rounded-2xl">NO_BEACONS_ACTIVE</p>}
                     </div>
                  </div>
               </div>

            </div>
         </div>
      </div>
   );
}
