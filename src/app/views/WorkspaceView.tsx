import React, { useState, useEffect, useRef, useCallback } from "react";

import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
    Columns,
    MessageSquare,
    FileText,
    BarChart2,
    Settings,
    Terminal,
    Shield,
    Activity,
    Zap,
    Plus,
    Send,
    Target,
    Image as ImageIcon,
    File as FileIcon,
    Download,
    Eye,
    ExternalLink,
    FileCode,
    Lock,
    ChevronLeft,
    X,
    Users,
    Trash2,
    AlertTriangle,
    Pin,
    PinOff,
    Trophy,
    Calendar,
    CheckCircle2,
    Circle
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useAppContext } from "../context/AppContext";
import { cn } from "../components/ui/utils";
import { ChatMessage } from "../components/chat/ChatMessage";
import { CodeSnippetInput } from "../components/chat/CodeSnippetInput";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";


// Placeholder components for the various workspace modules
// These will be fully implemented in follow-up tasks
import { CodebaseCenter } from "../components/workspace/CodebaseCenter";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AddTaskForm } from "../components/AddTaskForm";
import { MissionDebriefModal } from "../components/MissionDebriefModal";
import { TaskDetailPanel } from "../components/TaskDetailPanel";

// --- Tactical Board (Kanban) Sub-components ---

interface DragItem {
    id: string;
    type: string;
}

// ─── Deadline urgency helper ──────────────────────────────────────────────────
function getDeadlineInfo(deadline?: string) {
    if (!deadline) return null;
    const now = Date.now();
    const dl = new Date(deadline).getTime();
    const diff = dl - now;
    if (diff < 0) return { label: "OVERDUE", cls: "text-rose-400 bg-rose-500/10 border-rose-500/30", dot: "bg-rose-500 animate-pulse" };
    if (diff < 24 * 60 * 60 * 1000) return { label: "DUE <24H", cls: "text-amber-400 bg-amber-500/10 border-amber-500/30", dot: "bg-amber-500" };
    if (diff < 3 * 24 * 60 * 60 * 1000) return { label: "DUE SOON", cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30", dot: "bg-yellow-500" };
    return null; // no urgency chip for tasks with plenty of time
}

const TaskCard: React.FC<{ task: any; team: any; onOpenDetail: (task: any) => void }> = ({ task, team, onOpenDetail }) => {
    const { user, toggleCritical, pinTask, pinnedTasks } = useAppContext();
    const isPinned = pinnedTasks[team.id] === task.id;
    const isLeader = team.currentMembers.some((m: any) => m.id === user?.id && m.role === 'Leader');
    const isAssignee = task.assignee_id === user?.id;
    const canInteract = isLeader || isAssignee;

    const deadlineInfo = getDeadlineInfo(task.deadline);
    const subtasks: any[] = task.subtasks || [];
    const completedSubs = subtasks.filter((s: any) => s.done).length;
    const reviewAssignee = task.review_assignee_id ? team.currentMembers.find((m: any) => m.id === task.review_assignee_id) : null;

    const [{ isDragging }, drag] = useDrag(() => ({
        type: "TASK",
        item: { id: task.id },
        canDrag: canInteract,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    const priorityColors = {
        urgent: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        high: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        medium: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        low: "text-muted-foreground bg-slate-500/10 border-slate-500/20",
    };

    return (
        <div
            ref={canInteract ? (drag as any) : undefined}
            onClick={() => onOpenDetail(task)}
            className={cn(
                "group relative p-4 rounded-2xl bg-card/50 border border-border/30 hover:border-blue-500/30 transition-all duration-300 mb-3 shadow-lg shadow-black/20 cursor-pointer",
                isDragging ? "opacity-40 scale-95" : "opacity-100",
                !canInteract && "cursor-default",
                task.is_critical && "ring-1 ring-blue-500/50 shadow-blue-500/10",
                isPinned && "ring-2 ring-hack-blue shadow-[0_0_40px_rgba(37,99,235,0.2)] bg-hack-blue/5 border-hack-blue/40",
                deadlineInfo?.dot.includes("rose") && "border-rose-500/20",
            )}
        >
            {isPinned && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-hack-blue rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)] z-20 flex items-center gap-2">
                    <Pin className="w-3 h-3 text-white fill-white animate-pulse" />
                    <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Leader Focus</span>
                </div>
            )}

            {task.is_critical && (
                <div className="absolute -left-px top-4 w-1 h-8 bg-blue-500 rounded-r-full shadow-[4px_0_12px_rgba(59,130,246,0.5)]" />
            )}

            {/* Lock indicator for non-assignees */}
            {!canInteract && (
                <div className="absolute top-3 right-3 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                </div>
            )}

            <div className="flex items-start justify-between mb-3">
                <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-widest ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                    {task.priority}
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    {isLeader && (
                        <button
                            onClick={() => pinTask(team.id, isPinned ? null : task.id)}
                            className={`p-1 rounded-lg hover:bg-muted/50 transition-colors ${isPinned ? "text-hack-blue" : "text-muted-foreground"}`}
                        >
                            {isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                        </button>
                    )}
                    {canInteract && (
                        <button
                            onClick={() => toggleCritical(task.id, !task.is_critical)}
                            className={`p-1 rounded-lg hover:bg-muted/50 transition-colors ${task.is_critical ? "text-blue-400" : "text-muted-foreground"}`}
                        >
                            <Zap className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            <h4 className="text-sm font-bold text-foreground mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">
                {task.title}
            </h4>

            {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                    {task.description}
                </p>
            )}

            {/* Sub-task progress bar */}
            {subtasks.length > 0 && (
                <div className="mb-3">
                    <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Sub-Tasks</span>
                        <span className="text-[10px] text-muted-foreground">{completedSubs}/{subtasks.length}</span>
                    </div>
                    <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${(completedSubs / subtasks.length) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Review chip */}
            {task.status === "review" && reviewAssignee && (
                <div className="flex items-center gap-1.5 mb-3 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <Eye className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Review: {reviewAssignee.name}</span>
                </div>
            )}

            <div className="flex items-center justify-between mt-auto">
                <div className="flex -space-x-2">
                    {task.assignee ? (
                        <div className="w-6 h-6 rounded-full ring-2 ring-slate-950 bg-muted border border-border/50 flex items-center justify-center overflow-hidden">
                            <img src={task.assignee.avatar} alt={task.assignee.name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-6 h-6 rounded-full ring-2 ring-slate-950 bg-card border border-border/30 flex items-center justify-center">
                            <Users className="w-3 h-3 text-muted-foreground/70" />
                        </div>
                    )}
                </div>

                {deadlineInfo ? (
                    <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-widest", deadlineInfo.cls)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", deadlineInfo.dot)} />
                        {deadlineInfo.label}
                    </div>
                ) : task.deadline ? (
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                        <Calendar className="w-3 h-3 text-blue-500/50" />
                        {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

const KanbanColumn: React.FC<{
    status: "todo" | "in_progress" | "review" | "done",
    title: string,
    tasks: any[],
    onAddTask: (status: "todo" | "in_progress" | "review" | "done") => void,
    team: any,
    onOpenDetail: (task: any) => void,
}> = ({ status, title, tasks, onAddTask, team, onOpenDetail }) => {
    const { updateTaskStatus, user } = useAppContext();
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: "TASK",
        drop: (item: DragItem) => updateTaskStatus(item.id, status),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
        }),
    }));

    const statusIcons = {
        todo: <Lock className="w-4 h-4 text-muted-foreground" />,
        in_progress: <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />,
        review: <Activity className="w-4 h-4 text-amber-400" />,
        done: <Shield className="w-4 h-4 text-blue-400" />,
    };

    const isLeader = team.currentMembers.some((m: any) => m.id === user?.id && m.role === 'Leader');

    return (
        <div
            ref={drop as any}
            className={cn(
                "flex flex-col flex-1 min-w-[220px] rounded-3xl bg-card/50 border border-border/30 p-4 transition-colors duration-300 min-h-0",
                isOver && "bg-blue-500/5 border-blue-500/20",
            )}
        >
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-card flex items-center justify-center border border-border/30">
                        {statusIcons[status as keyof typeof statusIcons]}
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-foreground/90 uppercase tracking-widest">{title}</h3>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{tasks.length} Operations</span>
                    </div>
                </div>
                {isLeader && (
                    <button
                        onClick={() => onAddTask(status)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} team={team} onOpenDetail={onOpenDetail} />
                ))}
                {tasks.length === 0 && (
                    <div className="h-32 rounded-2xl border-2 border-dashed border-border/30 flex flex-col items-center justify-center text-muted-foreground/70 gap-2">
                        <div className="text-[10px] font-bold uppercase tracking-widest italic opacity-50">Empty Sector</div>
                    </div>
                )}
            </div>
        </div>
    );
};

const TacticalBoard: React.FC<{ team: any }> = ({ team }) => {
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [initialTaskStatus, setInitialTaskStatus] = useState<"todo" | "in_progress" | "review" | "done" | undefined>(undefined);
    const [activeMobileTab, setActiveMobileTab] = useState<"todo" | "in_progress" | "review" | "done">("todo");
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const { user } = useAppContext();
    const isLeader = team.currentMembers.some((m: any) => m.id === user?.id && m.role === 'Leader');

    const handleAddTask = (status?: "todo" | "in_progress" | "review" | "done") => {
        setInitialTaskStatus(status);
        setIsAddingTask(true);
    };

    const columns = [
        { id: "todo" as const, title: "Backlog", tasks: team.tasks.filter((t: any) => t.status === "todo") },
        { id: "in_progress" as const, title: "Execution", tasks: team.tasks.filter((t: any) => t.status === "in_progress") },
        { id: "review" as const, title: "Analysis", tasks: team.tasks.filter((t: any) => t.status === "review") },
        { id: "done" as const, title: "Secure", tasks: team.tasks.filter((t: any) => t.status === "done") },
    ];

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="h-full flex flex-col p-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 mb-4 md:mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] whitespace-nowrap">Real-time Link Active</span>
                        </div>
                        <h2 className="text-xl md:text-3xl font-black text-foreground tracking-tighter uppercase">Tactical Board</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => handleAddTask()}
                            className="rounded-2xl bg-blue-600 hover:bg-blue-500 text-foreground border-0 shadow-lg shadow-blue-600/20 font-black uppercase tracking-widest text-[10px] h-10 px-6 shrink-0"
                        >
                            <Plus className="w-4 h-4 mr-2 stroke-[3px]" /> Add Intel
                        </Button>
                    </div>
                </header>

                {/* Mobile Column Nav */}
                <div className="flex md:hidden bg-card/50 p-1 rounded-2xl border border-border/30 gap-1 overflow-x-auto no-scrollbar shrink-0 mb-4">
                    {columns.map((col) => (
                        <button
                            key={col.id}
                            onClick={() => setActiveMobileTab(col.id)}
                            className={cn(
                                "flex-1 py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                activeMobileTab === col.id
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                    : "text-muted-foreground hover:bg-muted/50"
                            )}
                        >
                            {col.title.split(' ')[0]}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
                    <div className="flex gap-4 h-full" style={{ minWidth: 'max(100%, 900px)' }}>
                        {columns.map((col) => (
                            <div
                                key={col.id}
                                className={cn(
                                    activeMobileTab === col.id ? "flex" : "hidden md:flex",
                                    "flex-col flex-1 min-w-[220px] min-h-0 h-full"
                                )}
                            >
                                <KanbanColumn
                                    status={col.id}
                                    title={col.title}
                                    tasks={col.tasks}
                                    onAddTask={handleAddTask}
                                    team={team}
                                    onOpenDetail={setSelectedTask}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <AnimatePresence>
                    {/* Task Detail Panel */}
                    {selectedTask && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedTask(null)}
                                className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
                            />
                            <TaskDetailPanel
                                task={selectedTask}
                                team={team}
                                onClose={() => setSelectedTask(null)}
                            />
                        </>
                    )}

                    {/* Add Task Modal */}
                    {isAddingTask && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card/90 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="w-full max-w-2xl bg-card border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden"
                            >
                                <div className="p-8 border-b border-border/30 flex items-center justify-between bg-card/50">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">New Tactical Deployment</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter">Deploy Task</h3>
                                    </div>
                                    <button
                                        onClick={() => setIsAddingTask(false)}
                                        className="p-3 rounded-2xl bg-muted/30 text-muted-foreground hover:text-white hover:bg-muted transition-all"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                    <AddTaskForm
                                        teamId={team.id}
                                        onClose={() => {
                                            setIsAddingTask(false);
                                            setInitialTaskStatus(undefined);
                                        }}
                                        initialStatus={initialTaskStatus}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </DndProvider>
    );
};
const CommsLink: React.FC<{ team: any }> = ({ team }) => {
    const { user, teamMessages, fetchTeamMessages, sendTeamMessage, getStandup, addReaction, removeReaction, sendTypingIndicator } = useAppContext();
    const [typingUsers, setTypingUsers] = useState<{ name: string; avatar?: string }[]>([]);
    const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    // Fetch messages on mount
    useEffect(() => {
        if (team.id) fetchTeamMessages(team.id);
    }, [team.id, fetchTeamMessages]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current)
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [teamMessages]);

    // Typing indicator + Presence channels
    useEffect(() => {
        if (!team.id || !user) return;

        // Typing broadcast channel
        const typingChannel = supabase
            .channel(`typing:${team.id}`)
            .on('broadcast', { event: 'typing' }, ({ payload }) => {
                if (payload.userId === user.id) return; // Don't show own typing
                setTypingUsers(prev => {
                    const exists = prev.some(u => u.name === payload.name);
                    if (!exists) return [...prev, { name: payload.name, avatar: payload.avatar }];
                    return prev;
                });
                // Clear after 3s of no new events
                clearTimeout(typingTimeouts.current[payload.userId]);
                typingTimeouts.current[payload.userId] = setTimeout(() => {
                    setTypingUsers(prev => prev.filter(u => u.name !== payload.name));
                }, 3000);
            })
            .subscribe();

        // Presence channel for online dots
        const presenceChannel = supabase
            .channel(`presence:${team.id}`, { config: { presence: { key: user.id } } })
            .on('presence', { event: 'sync' }, () => {
                const state = presenceChannel.presenceState<{ user_id: string }>();
                const ids = new Set(Object.values(state).flat().map((s: any) => s.user_id));
                setOnlineIds(ids);
            })
            .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                const leftIds = leftPresences.map((p: any) => p.user_id);
                setOnlineIds(prev => {
                    const next = new Set(prev);
                    leftIds.forEach((id: string) => next.delete(id));
                    return next;
                });
            });

        presenceChannel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await presenceChannel.track({ user_id: user.id });
            }
        });

        // Also subscribe to reaction changes
        const reactionChannel = supabase
            .channel(`reactions:${team.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' },
                () => fetchTeamMessages(team.id))
            .subscribe();

        return () => {
            supabase.removeChannel(typingChannel);
            supabase.removeChannel(presenceChannel);
            supabase.removeChannel(reactionChannel);
            Object.values(typingTimeouts.current).forEach(clearTimeout);
        };
    }, [team.id, user]);

    const handleSendText = async (content: string) => {
        if (content.startsWith("/standup")) {
            const summary = await getStandup(team.id);
            if (summary) {
                sendTeamMessage(team.id, `Tactical Stand-up Summary:\n\n${summary.summary_text}\n\nðŸ† Key Achievements:\n- ${summary.key_achievements.join('\n- ')}\n\nâš ï¸ Blockers:\n- ${summary.blockers.join('\n- ')}\n\nðŸ”œ Next Steps:\n- ${summary.next_steps.join('\n- ')}`);
            }
            return;
        }
        sendTeamMessage(team.id, content, "text");
    };

    const handleSendCode = (code: string, language: string) => {
        sendTeamMessage(team.id, code, "code", language);
    };

    const handleTyping = useCallback(() => {
        sendTypingIndicator(team.id);
    }, [team.id]);

    return (
        <div className="h-full flex flex-col bg-card/20">
            <header className="p-6 border-b border-border/30 flex items-center justify-between bg-card/40 backdrop-blur-md">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Encrypted Tactical Channel</span>
                    </div>
                    <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">Comms Link</h2>
                </div>
                {/* Member avatars with presence dots */}
                <div className="flex -space-x-3">
                    {team.currentMembers.map((m: any) => (
                        <div key={m.id} className="relative group">
                            <div className="w-10 h-10 rounded-2xl border-2 border-background bg-muted flex items-center justify-center overflow-hidden ring-1 ring-border/50">
                                <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                            </div>
                            {/* Presence dot */}
                            {onlineIds.has(m.id) && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                            )}
                            <div className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-card border border-border/50 rounded text-[10px] text-foreground whitespace-nowrap z-50">
                                {m.name}{onlineIds.has(m.id) ? " Â· ðŸŸ¢ Online" : ""}
                            </div>
                        </div>
                    ))}
                </div>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {teamMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground/70 space-y-4">
                        <div className="w-16 h-16 rounded-full border border-dashed border-border/50 flex items-center justify-center">
                            <MessageSquare className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30">No active transmissions in this sector.</p>
                    </div>
                )}

                {teamMessages.map((msg: any) => (
                    <ChatMessage
                        key={msg.id}
                        msg={msg}
                        isMe={msg.author_id === user?.id}
                        onAddReaction={addReaction}
                        onRemoveReaction={removeReaction}
                    />
                ))}

                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                    <div className="flex items-center gap-3 px-1">
                        <div className="flex -space-x-2">
                            {typingUsers.slice(0, 3).map(u => (
                                <div key={u.name} className="w-6 h-6 rounded-full border border-background overflow-hidden bg-muted">
                                    <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt={u.name} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground font-medium">
                                {typingUsers.map(u => u.name).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing
                            </span>
                            <div className="flex gap-0.5">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-border/30">
                <CodeSnippetInput
                    onSendText={handleSendText}
                    onSendCode={handleSendCode}
                />
            </div>
        </div>
    );
};

const IntelArchives: React.FC<{ team: any }> = ({ team }) => {
    const { documents, addDocument, updateDocument, deleteDocument, user } = useAppContext();
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newDocTitle, setNewDocTitle] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const selectedDoc = documents.find(d => d.id === selectedDocId);
    const isLeader = team.currentMembers.some((m: any) => m.id === user?.id && m.role === 'Leader');

    const handleDelete = (docId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteTarget(docId);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        if (selectedDocId === deleteTarget) setSelectedDocId(null);
        await deleteDocument(deleteTarget);
        setDeleteTarget(null);
    };

    const getDocIcon = (doc: any) => {
        if (doc.type === 'markdown') return <FileText className="w-5 h-5" />;
        if (doc.type === 'image') return <ImageIcon className="w-5 h-5" />;
        if (doc.type === 'pdf') return <FileIcon className="w-5 h-5" />;
        if (doc.type === 'code') return <FileCode className="w-5 h-5" />;
        return <FileIcon className="w-5 h-5" />;
    };

    const handleCreate = () => {
        if (!newDocTitle.trim()) return;
        addDocument({ title: newDocTitle, content: "", type: "markdown" });
        setNewDocTitle("");
        setIsCreating(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const ext = file.name.split('.').pop()?.toLowerCase();
        let type = 'file';

        if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) type = 'image';
        else if (ext === 'pdf') type = 'pdf';
        else if (['ts', 'tsx', 'js', 'jsx', 'py', 'json'].includes(ext || '')) type = 'code';

        toast.info(`Initiating upload protocol for ${file.name}...`);

        addDocument({
            title: file.name,
            content: `Archive entry for ${file.name}. Raw data protocol: ${file.type}`,
            type: type
        }, file);
    };

    return (<>
        <div className="h-full flex bg-background">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
            />

            <aside className="w-80 border-r border-border/30 flex flex-col bg-card/20">
                <header className="p-6 border-b border-border/30">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Document Vault</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-1.5 rounded-lg bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 transition-all"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="p-1.5 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 transition-all"
                            >
                                <FileText className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    {isCreating && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 mb-4">
                            <input
                                autoFocus
                                value={newDocTitle}
                                onChange={(e) => setNewDocTitle(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                                placeholder="Core Matrix Title..."
                                className="w-full bg-card border border-blue-500/30 rounded-xl px-3 py-2 text-xs text-foreground/90 focus:outline-none"
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleCreate} size="sm" className="flex-1 text-[10px] uppercase">Confirm</Button>
                                <Button onClick={() => setIsCreating(false)} size="sm" variant="ghost" className="flex-1 text-[10px] uppercase">Cancel</Button>
                            </div>
                        </motion.div>
                    )}

                    <div className="relative mt-2">
                        <input
                            placeholder="Search intel..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2 text-[10px] text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all font-bold"
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                    {documents.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase())).map((doc) => (
                        <button
                            key={doc.id}
                            onClick={() => setSelectedDocId(doc.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group relative ${selectedDocId === doc.id
                                ? "bg-blue-600/15 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                                : "border border-transparent hover:bg-muted/50"
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-border/30 shrink-0 ${selectedDocId === doc.id ? "bg-blue-500/20 text-blue-400" : "bg-card text-muted-foreground"
                                }`}>
                                {getDocIcon(doc)}
                            </div>
                            <div className="text-left overflow-hidden flex-1 min-w-0">
                                <div className={`text-sm font-bold truncate ${selectedDocId === doc.id ? "text-blue-400" : "text-foreground/90"}`}>
                                    {doc.title}
                                </div>
                                <div className="text-[9px] text-muted-foreground uppercase font-black">
                                    {doc.type} • {new Date(doc.updatedAt).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Delete button — leader OR uploader only */}
                            {(isLeader || doc.created_by === user?.id) && (
                                <button
                                    onClick={(e) => handleDelete(doc.id, e)}
                                    title="Delete file"
                                    className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-rose-500 opacity-0 group-hover:opacity-100 hover:bg-rose-500/15 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </button>
                    ))}
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 bg-background relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent)] pointer-events-none" />

                {selectedDoc ? (
                    <>
                        <header className="p-6 border-b border-border/30 flex items-center justify-between bg-card/20 backdrop-blur-sm relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
                                    {getDocIcon(selectedDoc)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-foreground uppercase tracking-tighter">{selectedDoc.title}</h2>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                        <Badge variant="outline" className="text-[8px] border-border/50">{selectedDoc.type}</Badge>
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                        <span>Vault Entry: {new Date(selectedDoc.updatedAt).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {selectedDoc.url && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl border-border/50 hover:bg-muted/50 h-9 font-bold uppercase text-[10px] tracking-widest"
                                            onClick={() => window.open(selectedDoc.url, '_blank')}
                                        >
                                            <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                            Live View
                                        </Button>
                                        <a href={selectedDoc.url} download={selectedDoc.title} className="contents">
                                            <Button variant="outline" size="sm" className="rounded-xl border-border/50 hover:bg-muted/50 h-9 px-3">
                                                <Download className="w-3.5 h-3.5 text-muted-foreground" />
                                            </Button>
                                        </a>
                                    </>
                                )}
                                {selectedDoc.type === 'markdown' && (
                                    <Button
                                        size="sm"
                                        className="rounded-xl bg-blue-600 hover:bg-blue-500 h-9 px-6 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20"
                                        onClick={() => updateDocument(selectedDoc.id, selectedDoc.content)}
                                    >
                                        Sync Changes
                                    </Button>
                                )}
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-8 relative z-10">
                            {selectedDoc.type === 'markdown' ? (
                                <textarea
                                    value={selectedDoc.content}
                                    onChange={(e) => updateDocument(selectedDoc.id, e.target.value)}
                                    className="w-full h-full bg-transparent text-foreground/80 font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder:text-slate-800"
                                    placeholder="# System protocols pending..."
                                />
                            ) : selectedDoc.type === 'image' ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-6">
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="relative group max-w-2xl"
                                    >
                                        <div className="absolute -inset-4 bg-blue-500/10 blur-2xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <img
                                            src={selectedDoc.url}
                                            alt={selectedDoc.title}
                                            className="relative max-w-full max-h-[60vh] rounded-3xl border border-border/50 shadow-2xl object-contain bg-card/50 p-2"
                                        />
                                    </motion.div>
                                    <div className="flex gap-4">
                                        <div className="px-4 py-2 rounded-xl bg-muted/30 border border-border/30 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            Asset Format: {selectedDoc.title.split('.').pop()?.toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            ) : selectedDoc.type === 'pdf' ? (
                                <div className="h-full flex flex-col items-center justify-center">
                                    <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                                        <FileIcon className="w-10 h-10 text-red-400" />
                                    </div>
                                    <h3 className="text-xl font-black text-foreground uppercase tracking-wider mb-2">Portable Intel Packet</h3>
                                    <p className="text-sm text-muted-foreground mb-8 max-w-xs text-center font-medium">PDF assets require external visor for full decryption.</p>
                                    <Button
                                        onClick={() => window.open(selectedDoc.url, '_blank')}
                                        className="bg-red-600 hover:bg-red-500 text-foreground rounded-2xl px-8 h-12 font-black uppercase tracking-widest"
                                    >
                                        Open in Secondary Visor
                                    </Button>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center">
                                    <div className="w-24 h-24 rounded-3xl bg-muted/50 border border-border/30 flex items-center justify-center mb-6">
                                        <FileIcon className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-black text-foreground uppercase tracking-wider mb-2">Foreign Intel Structure</h3>
                                    <p className="text-sm text-muted-foreground mb-8 font-medium">Unknown data protocol. Recommendation: Manual download.</p>
                                    <a href={selectedDoc.url} download={selectedDoc.title}>
                                        <Button className="bg-muted hover:bg-muted/80 text-foreground rounded-2xl px-8 h-12 font-black uppercase tracking-widest">
                                            <Download className="w-4 h-4 mr-2" /> Extract Data
                                        </Button>
                                    </a>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/70 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
                            <div className="relative w-24 h-24 rounded-full border border-border/30 bg-card/50 flex items-center justify-center shadow-2xl">
                                <Lock className="w-10 h-10 opacity-20" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-sm font-black text-muted-foreground uppercase tracking-[0.4em] mb-2">Vault Standby</h3>
                            <p className="text-[10px] text-muted-foreground/70 uppercase font-bold tracking-widest">Select an asset from the archives to begin decryption.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
        <ConfirmDialog
            open={!!deleteTarget}
            title="Delete from Vault"
            message={`Remove "${documents.find(d => d.id === deleteTarget)?.title ?? 'this file'}" permanently? This cannot be undone.`}
            confirmLabel="Delete"
            variant="danger"
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
        />
    </>);
};
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from "recharts";

const SquadIntel: React.FC<{ team: any }> = ({ team }) => {
    const productivityData = team.performance || [];

    const stats = [
        { label: "Operation Velocity", value: `${team.progress}%`, icon: Zap, color: "text-blue-400" },
        { label: "Squad Capacity", value: `${team.currentMembers.length}/${team.maxMembers}`, icon: Users, color: "text-emerald-400" },
        { label: "Protocol Compliance", value: "98.2%", icon: Shield, color: "text-purple-400" },
        { label: "Mission Runtime", value: "14d", icon: Activity, color: "text-rose-400" },
    ];

    return (
        <div className="h-full overflow-y-auto p-8 bg-background scrollbar-hide">
            <header className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Signal Processing Optimized</span>
                </div>
                <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Squad Intel</h2>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-3xl bg-card/40 border border-border/30 backdrop-blur-sm group hover:border-blue-500/20 transition-all"
                    >
                        <div className={`p-3 rounded-2xl bg-card w-fit mb-4 border border-border/30 ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</div>
                        <div className="text-2xl font-black text-foreground uppercase tracking-tighter">{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Chart */}
                <div className="lg:col-span-2 p-8 rounded-[2rem] bg-card/40 border border-border/30 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Productivity Pulse</h3>
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400 uppercase text-[10px]">Real-time Telemetry</Badge>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={productivityData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#475569"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#475569"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        fontSize: '12px',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#3b82f6' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Task Distribution */}
                <div className="p-8 rounded-[2rem] bg-card/40 border border-border/30 backdrop-blur-sm">
                    <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-8">Sector Deployment</h3>
                    <div className="space-y-6">
                        {["Design", "Backend", "Frontend", "Research"].map((label, i) => {
                            const progress = Math.floor(Math.random() * 60) + 20;
                            const colors = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500"];
                            return (
                                <div key={label}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
                                        <span className="text-[10px] font-black text-foreground">{progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-card rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1, delay: i * 0.2 }}
                                            className={`h-full ${colors[i % colors.length]} rounded-full shadow-[0_0_12px_rgba(0,0,0,0.5)]`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-12 p-6 rounded-3xl bg-card/60 border border-border/30">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Efficiency Rating</div>
                                <div className="text-lg font-black text-foreground uppercase tracking-tighter">Peak Operational</div>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed uppercase font-bold tracking-widest">
                            Signal strength optimal. All squadron members synchronized.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
const CommandCenter: React.FC<{ team: any, onNavigateToCodebase: () => void }> = ({ team, onNavigateToCodebase }) => {
    const {
        user,
        setMissionObjective,
        updateTeamSettings,
        removeMember,
        assignMemberRole,
        updateTeamDeadline,
        updateTask,
        updateTaskStatus: moveTask,
        toggleCritical,
        syncGitHubRepo
    } = useAppContext();
    const [editingObjective, setEditingObjective] = useState(false);
    const [objective, setObjective] = useState(team.mission_objective || "");
    const [deadlineInput, setDeadlineInput] = useState(
        team.deadline ? new Date(team.deadline).toISOString().slice(0, 16) : ""
    );
    const [taskCmd, setTaskCmd] = useState({ taskId: "", action: "assign", targetId: "", status: "todo" });
    const [cmdLoading, setCmdLoading] = useState(false);

    const [editingRepo, setEditingRepo] = useState(false);
    const [repoInput, setRepoInput] = useState(team.github_repo || "");

    const isLeader = team.role === "Leader" || team.currentMembers.find((m: any) => m.id === user?.id)?.role === "Leader";

    const handleObjectiveSave = () => {
        setMissionObjective(team.id, objective);
        setEditingObjective(false);
    };

    const handleDeadlineSave = async () => {
        await updateTeamDeadline(team.id, deadlineInput ? new Date(deadlineInput).toISOString() : null);
    };

    const handleTaskDispatch = async () => {
        if (!taskCmd.taskId) return;
        setCmdLoading(true);
        try {
            if (taskCmd.action === 'assign' && taskCmd.targetId) {
                await updateTask(taskCmd.taskId, { assignee_id: taskCmd.targetId } as any);
            } else if (taskCmd.action === 'move') {
                moveTask(taskCmd.taskId, taskCmd.status as any);
            } else if (taskCmd.action === 'critical') {
                const t = team.tasks.find((t: any) => t.id === taskCmd.taskId);
                if (t) await toggleCritical(t.id, !t.is_critical);
            }
        } finally {
            setCmdLoading(false);
        }
    };

    const handleRepoSave = async () => {
        await syncGitHubRepo(team.id, repoInput.trim() || null);
        setEditingRepo(false);
    };

    const toggleSetting = (key: string) => {
        const newSettings = { ...team.settings, [key]: !team.settings?.[key] };
        updateTeamSettings(team.id, newSettings);
    };

    return (
        <div className="h-full overflow-y-auto p-8 bg-background scrollbar-hide">
            <header className="mb-12 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] animate-pulse" />
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Command Authorization Required</span>
                    </div>
                    <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase">Command Center</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-12 w-[1px] bg-white/10 mx-2" />
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Auth Level</div>
                        <div className="text-sm font-black text-rose-400 uppercase tracking-tighter">{team.role} Access</div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    {/* Mission Objective Section */}
                    <section className="p-8 rounded-[2.5rem] bg-card/40 border border-border/30 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap className="w-32 h-32 text-blue-500" />
                        </div>

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/5">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Main Mission Objective</h3>
                            </div>
                            {isLeader && !editingObjective && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingObjective(true)}
                                    className="text-[10px] uppercase font-bold text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-4 rounded-xl"
                                >
                                    Modify Protocol
                                </Button>
                            )}
                        </div>

                        {editingObjective ? (
                            <div className="space-y-4 relative z-10">
                                <textarea
                                    value={objective}
                                    onChange={(e) => setObjective(e.target.value)}
                                    className="w-full bg-card/60 border border-blue-500/30 rounded-[2rem] p-6 text-sm text-foreground/90 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[120px] resize-none"
                                    placeholder="Define the primary objective for this squadron..."
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleObjectiveSave} className="rounded-2xl bg-blue-600 hover:bg-blue-500 text-foreground px-8 font-black uppercase text-[10px] tracking-widest h-11">Sync Objective</Button>
                                    <Button onClick={() => setEditingObjective(false)} variant="ghost" className="rounded-2xl text-muted-foreground hover:text-white hover:bg-muted/50 font-black uppercase text-[10px] tracking-widest h-11 px-8">Abord</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 rounded-[2rem] bg-card/60 border border-border/30 relative z-10">
                                <p className="text-lg font-medium text-foreground/80 italic leading-relaxed">
                                    "{team.mission_objective || "No primary objective set for this operation."}"
                                </p>
                            </div>
                        )}
                    </section>

                    {/* GitHub Repository Link Section */}
                    <section className="p-8 rounded-[2.5rem] bg-card/40 border border-border/30 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Activity className="w-32 h-32 text-emerald-500" />
                        </div>

                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                    <Terminal className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em] mb-1">Source Code Repositories</h3>
                                    <p className="text-xs text-muted-foreground">Manage connected GitHub repositories.</p>
                                </div>
                            </div>
                            <Button
                                onClick={onNavigateToCodebase}
                                className="rounded-2xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-400 hover:text-white px-6 font-black uppercase text-[10px] tracking-widest h-10 transition-all"
                            >
                                Manage Repositories
                            </Button>
                        </div>
                    </section>

                    {/* ── Project Timeline Section ─────────────────── */}
                    <section className="p-8 rounded-[2.5rem] bg-card/40 border border-border/30 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Calendar className="w-32 h-32 text-amber-500" />
                        </div>
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-600/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Project Timeline</h3>
                                    {team.deadline && (() => {
                                        const dl = new Date(team.deadline);
                                        const diff = Math.ceil((dl.getTime() - Date.now()) / 86400000);
                                        return (
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${diff < 0 ? 'text-rose-400' : diff <= 2 ? 'text-amber-400' : 'text-emerald-400'
                                                }`}>
                                                {diff < 0 ? `OVERDUE ${Math.abs(diff)}D` : diff === 0 ? 'DUE TODAY' : `${diff} DAYS LEFT`}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                        {isLeader ? (
                            <div className="flex gap-3 relative z-10">
                                <input
                                    type="datetime-local"
                                    value={deadlineInput}
                                    onChange={e => setDeadlineInput(e.target.value)}
                                    className="flex-1 bg-card/60 border border-amber-500/20 rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
                                />
                                <Button
                                    onClick={handleDeadlineSave}
                                    className="shrink-0 rounded-2xl bg-amber-600/20 hover:bg-amber-600 border border-amber-500/30 text-amber-400 hover:text-white px-6 h-12 font-black uppercase text-[10px] tracking-widest transition-all"
                                >
                                    Set
                                </Button>
                                {deadlineInput && (
                                    <Button
                                        onClick={() => { setDeadlineInput(""); updateTeamDeadline(team.id, null); }}
                                        variant="ghost"
                                        className="shrink-0 rounded-2xl text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 h-12 px-4 font-black text-[10px] uppercase"
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 rounded-2xl bg-muted/20 border border-border/20 text-sm text-muted-foreground flex items-center gap-2">
                                <Lock className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-bold uppercase tracking-widest">{team.deadline ? new Date(team.deadline).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No deadline set'}</span>
                            </div>
                        )}
                    </section>

                    {/* ── Task Control Panel ────────────────────────── */}
                    <section className={`p-8 rounded-[2.5rem] border backdrop-blur-md relative overflow-hidden ${isLeader ? 'bg-card/40 border-border/30' : 'bg-muted/10 border-border/10 opacity-60'
                        }`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                                <Target className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Task Control</h3>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{isLeader ? 'Leader Access' : 'Leader Only'}</p>
                            </div>
                        </div>

                        {isLeader ? (
                            <div className="space-y-4">
                                {/* Task selector */}
                                <div>
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 block">Select Task</label>
                                    <select
                                        value={taskCmd.taskId}
                                        onChange={e => setTaskCmd(p => ({ ...p, taskId: e.target.value }))}
                                        className="w-full bg-card/60 border border-border/40 rounded-2xl h-11 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                    >
                                        <option value="">-- Choose task --</option>
                                        {(team.tasks || []).map((t: any, i: number) => (
                                            <option key={t.id} value={t.id}>[{String(i + 1).padStart(2, '0')}] {t.title}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Action selector */}
                                <div className="grid grid-cols-3 gap-2">
                                    {[{ id: 'assign', label: 'Reassign' }, { id: 'move', label: 'Move Column' }, { id: 'critical', label: 'Toggle Critical' }].map(a => (
                                        <button
                                            key={a.id}
                                            onClick={() => setTaskCmd(p => ({ ...p, action: a.id }))}
                                            className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${taskCmd.action === a.id
                                                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20'
                                                : 'bg-muted/30 text-muted-foreground border-border/30 hover:bg-muted/60'
                                                }`}
                                        >{a.label}</button>
                                    ))}
                                </div>

                                {/* Conditional sub-selector */}
                                {taskCmd.action === 'assign' && (
                                    <div>
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 block">Assign To</label>
                                        <select
                                            value={taskCmd.targetId}
                                            onChange={e => setTaskCmd(p => ({ ...p, targetId: e.target.value }))}
                                            className="w-full bg-card/60 border border-border/40 rounded-2xl h-11 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                        >
                                            <option value="">-- Select operative --</option>
                                            {team.currentMembers.map((m: any) => (
                                                <option key={m.id} value={m.id}>{m.name} ({m.member_role || m.role})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {taskCmd.action === 'move' && (
                                    <div>
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 block">Move To Column</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[{ id: 'todo', label: 'Backlog' }, { id: 'in_progress', label: 'Exec' }, { id: 'review', label: 'Analysis' }, { id: 'done', label: 'Secure' }].map(s => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => setTaskCmd(p => ({ ...p, status: s.id }))}
                                                    className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${taskCmd.status === s.id
                                                        ? 'bg-emerald-600 text-white border-emerald-500'
                                                        : 'bg-muted/30 text-muted-foreground border-border/30 hover:bg-muted/60'
                                                        }`}
                                                >{s.label}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {taskCmd.action === 'critical' && taskCmd.taskId && (() => {
                                    const t = (team.tasks || []).find((t: any) => t.id === taskCmd.taskId);
                                    return (
                                        <div className={`p-4 rounded-2xl border text-[11px] font-black uppercase ${t?.is_critical ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-muted/20 border-border/20 text-muted-foreground'
                                            }`}>
                                            Currently: {t?.is_critical ? '🔴 Critical' : '⚪ Standard Priority'} — Click Dispatch to toggle
                                        </div>
                                    );
                                })()}

                                <Button
                                    onClick={handleTaskDispatch}
                                    disabled={!taskCmd.taskId || cmdLoading}
                                    className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20 disabled:opacity-40"
                                >
                                    {cmdLoading ? 'Dispatching...' : '⚡ Dispatch Order'}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-5 rounded-2xl bg-muted/20 border border-border/20">
                                <Lock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Leader clearance required to dispatch task orders</span>
                            </div>
                        )}
                    </section>

                    <section className="p-8 rounded-[2.5rem] bg-card/40 border border-border/30 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                    <Users className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Active Squadron</h3>
                            </div>
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 uppercase text-[10px]">{team.currentMembers.length} Operatives</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...team.currentMembers].sort((a: any, b: any) => (b.xp || 0) - (a.xp || 0)).map((member: any, index: number) => (
                                <div key={member.id} className="p-4 rounded-[2rem] bg-card/60 border border-border/30 flex items-center gap-4 group hover:border-blue-500/30 transition-all duration-300 py-6 px-6 relative overflow-hidden">
                                    {/* Leaderboard Rank Bubble */}
                                    <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500/10 rounded-bl-2xl border-b border-l border-blue-500/20 flex items-center justify-center">
                                        <span className="text-[10px] font-black text-blue-400">#{index + 1}</span>
                                    </div>

                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-border/50 ring-1 ring-white/5 group-hover:ring-blue-500/50 transition-all">
                                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                        </div>
                                        {member.online && (
                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-black text-foreground uppercase tracking-tight mb-0.5 truncate">{member.name}</div>
                                        <div className="flex items-center gap-2 mb-1">
                                            {isLeader && member.id !== user?.id ? (
                                                <button
                                                    onClick={() => assignMemberRole(
                                                        team.id, member.id,
                                                        (member.member_role || member.role) === 'Leader' ? 'Member' : 'Leader'
                                                    )}
                                                    title="Click to toggle role"
                                                    className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest border border-blue-500/20 rounded-lg px-2 py-0.5 hover:bg-blue-500/10 transition-all inline-flex items-center gap-1 shrink-0"
                                                >
                                                    {member.member_role || member.role} <span className="text-[8px] opacity-70">↑↓</span>
                                                </button>
                                            ) : (
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest shrink-0">{member.member_role || member.role}</div>
                                            )}

                                            <div className="h-3 w-[1px] bg-border/50 shrink-0" />

                                            <div className="text-[10px] font-black text-amber-400 truncate">
                                                LVL {Math.floor((member.xp || 0) / 100) + 1} <span className="text-muted-foreground/50">({member.xp || 0} XP)</span>
                                            </div>
                                        </div>

                                        {/* Badges row */}
                                        {member.badges && member.badges.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {member.badges.map((b: string, i: number) => (
                                                    <span key={i} className="text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-md truncate max-w-full">
                                                        🏆 {b}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {isLeader && member.id !== user?.id && (
                                        <button
                                            onClick={() => removeMember(team.id, member.id)}
                                            className="p-3 rounded-2xl bg-muted/30 text-muted-foreground/70 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 shrink-0 z-10"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    {/* Settings Section */}
                    <section className="p-8 rounded-[2.5rem] bg-card/40 border border-border/30 backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                                <Settings className="w-5 h-5" />
                            </div>
                            <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Operational Protocols</h3>
                        </div>

                        <div className="space-y-4">
                            {[
                                { key: "allow_task_creation", label: "Permission: Global Deployment", desc: "Allow all squadron members to deploy new tasks." },
                                { key: "allow_invites", label: "Permission: Uplink Requests", desc: "Enable squadron members to invite more operatives." },
                            ].map((setting) => (
                                <div key={setting.key} className="p-5 rounded-[1.5rem] bg-card/60 border border-border/30 flex items-start gap-4">
                                    <div className="flex-1">
                                        <div className="text-[11px] font-black text-foreground/90 uppercase tracking-widest mb-1">{setting.label}</div>
                                        <p className="text-[10px] text-muted-foreground leading-tight pr-4 font-medium">{setting.desc}</p>
                                    </div>
                                    <button
                                        disabled={!isLeader}
                                        onClick={() => toggleSetting(setting.key)}
                                        className={`w-10 h-6 rounded-full relative transition-all duration-300 ${team.settings?.[setting.key as keyof typeof team.settings] ? "bg-blue-600" : "bg-muted"
                                            } ${!isLeader ? "opacity-30 cursor-not-allowed" : ""}`}
                                    >
                                        <motion.div
                                            initial={false}
                                            animate={{ left: team.settings?.[setting.key as keyof typeof team.settings] ? 20 : 4 }}
                                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md shadow-black/20"
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-6 rounded-3xl bg-blue-600/5 border border-blue-500/10">
                            <div className="flex items-center gap-2 mb-3">
                                <Lock className="w-3 h-3 text-blue-500" />
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Encrypted Invite Code</span>
                            </div>
                            <div className="flex items-center justify-between bg-card/90 rounded-2xl px-5 py-4 border border-border/30 group cursor-pointer active:scale-95 transition-all">
                                <span className="text-xl font-black text-foreground tracking-[0.4em] translate-x-1">{team.invite_code || "N/A"}</span>
                                <Activity className="w-4 h-4 text-blue-500 group-hover:animate-pulse" />
                            </div>
                            <p className="text-[9px] text-muted-foreground/70 mt-4 uppercase font-bold tracking-widest text-center">Share this uplink code to authorize new squadron members.</p>
                        </div>
                    </section>

                    {/* Audit Log / Pulse Section */}
                    <section className="p-8 rounded-[2.5rem] bg-card/40 border border-border/30 backdrop-blur-md flex-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-amber-600/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Audit Pulse</h3>
                        </div>

                        <div className="space-y-6 max-h-[300px] overflow-y-auto scrollbar-hide">
                            {(team.history || []).map((item: any) => (
                                <div key={item.id} className="relative pl-6 before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-blue-500 before:shadow-[0_0_8px_rgba(59,130,246,0.6)] border-l border-border/30 pb-2 ml-1">
                                    <div className="text-[10px] font-black text-foreground/80 uppercase tracking-tight">{item.action}</div>
                                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground uppercase font-medium mt-0.5">
                                        <span className="text-blue-500/70 font-black">{item.user}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-800" />
                                        <span>{item.time}</span>
                                    </div>
                                    {item.details && (
                                        <div className="mt-2 text-[10px] text-muted-foreground/70 italic bg-muted/30 rounded-xl px-3 py-1.5 border border-border/30">{item.details}</div>
                                    )}
                                </div>
                            ))}
                            {(team.history || []).length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50 opacity-30">
                                    <Activity className="w-8 h-8 mb-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">No pulse detected</span>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div >
    );
};
const MissionLogs: React.FC<{ team: any }> = ({ team }) => {
    const { bounties, user } = useAppContext();
    const teamBounties = bounties.filter(b => b.claimed_by === user?.id || b.claimed_by === team.id);

    // Dynamic Reputation Logic
    const completedMissions = teamBounties.filter(b => b.status === 'completed').length;
    const completedTasks = team.tasks?.filter((t: any) => t.status === 'done').length || 0;
    const totalXP = (completedMissions * 500) + (completedTasks * 100);
    const level = Math.floor(totalXP / 1000) + 1;
    const nextLevelXP = level * 1000;
    const currentLevelXP = (level - 1) * 1000;
    const progress = Math.min(((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100, 100);

    return (
        <div className="h-full flex flex-col bg-background p-8 overflow-hidden relative">
            {/* Holographic Scanline Gradient */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] z-10 opacity-30" style={{ backgroundSize: '100% 4px' }} />

            <header className="mb-8 relative z-20">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 mb-1"
                >
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-pulse" />
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Tactical Mission Sync</span>
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl font-black text-foreground tracking-tighter uppercase"
                >
                    Mission Logs
                </motion.h2>
            </header>

            <div className="flex-1 overflow-y-auto pr-4 space-y-4 scrollbar-hide relative z-20">
                <AnimatePresence mode="popLayout">
                    {teamBounties.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-40 opacity-20"
                        >
                            <Target className="w-16 h-16 mb-4 text-muted-foreground/70" />
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">No_Active_Missions</span>
                        </motion.div>
                    ) : (
                        teamBounties.map((bounty, i) => (
                            <motion.div
                                key={bounty.id}
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ scale: 1.01, borderColor: 'rgba(99, 102, 241, 0.3)' }}
                                className="p-6 rounded-[2rem] bg-card/40 border border-border/30 backdrop-blur-sm group transition-all flex items-center justify-between"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500",
                                        bounty.status === 'completed' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                                    )}>
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-black text-foreground uppercase tracking-tighter">{bounty.title}</h3>
                                            <Badge variant="outline" className="text-[8px] uppercase border-border/50 text-muted-foreground pointer-events-none">{bounty.difficulty}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium max-w-sm">{bounty.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Status</div>
                                    <div className={cn(
                                        "text-xs font-black uppercase tracking-widest",
                                        bounty.status === 'completed' ? "text-green-500" : "text-indigo-400 animate-pulse"
                                    )}>
                                        {bounty.status === 'in_progress' ? 'Running_Op' : bounty.status.toUpperCase()}
                                    </div>
                                    <div className="text-[10px] font-black text-muted-foreground/50 mt-2">+{bounty.reward_xp} XP</div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-6 rounded-3xl bg-indigo-600/5 border border-indigo-500/10 flex items-center justify-between shadow-2xl shadow-indigo-500/5 relative z-20"
            >
                <div>
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Squad Reputation</div>
                    <div className="text-2xl font-black text-foreground">LEVEL_{level.toString().padStart(2, '0')}</div>
                </div>
                <div className="h-12 w-[1px] bg-indigo-500/20 mx-6" />
                <div className="flex-1">
                    <div className="flex justify-between text-[10px] font-black text-muted-foreground/70 uppercase mb-2">
                        <span>XP Progress</span>
                        <span>{totalXP} / {nextLevelXP}</span>
                    </div>
                    <div className="h-2 w-full bg-card rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className="h-full bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const TerminalConsole: React.FC<{ team: any }> = ({ team }) => {
    const { user, updateTeamDeadline, updateTask, updateTaskStatus: moveTask, removeMember, setMissionObjective, assignMemberRole, toggleCritical } = useAppContext();
    const isLeader = team.currentMembers.some((m: any) => m.id === user?.id && m.role === 'Leader');

    const [history, setHistory] = useState<string[]>([
        "HACKMATE CORE KERNEL v4.2.0-STABLE",
        "UPLINK ESTABLISHED WITH SQUADRON NODE...",
        "HANDSHAKE COMPLETE. SECURE CHANNEL OPEN.",
        `AUTH LEVEL: ${isLeader ? 'LEADER [ELEVATED CLEARANCE]' : 'OPERATIVE'}`,
        "TYPE 'HELP' FOR AVAILABLE COMMANDS.",
        ""
    ]);
    const [input, setInput] = useState("");
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    React.useEffect(() => {
        const intelFeed = [
            "[INTEL] SQUADRON SYNC DETECTED IN SECTOR 7",
            "[SYSTEM] MEMORY OPTIMIZATION COMPLETE",
            "[SCAN] NEW REPO COMMITS DETECTED IN PRODUCTION",
            "[INTEL] GLOBAL BOUNTY MATRIX UPDATED",
            "[ALERT] UNAUTHORIZED PING FROM EXTERNAL NODE",
            "[SYSTEM] NEURAL KERNEL AT 94% EFFICIENCY",
            "[INTEL] TEAM REPUTATION INCREASED",
            "[SCAN] KEYWORD DETECTED IN GLOBAL RELAY: 'DECRYPTION'"
        ];

        const interval = setInterval(() => {
            const randomMsg = intelFeed[Math.floor(Math.random() * intelFeed.length)];
            setHistory(prev => {
                const newHist = [...prev, `[${new Date().toLocaleTimeString()}] ${randomMsg}`];
                if (newHist.length > 50) return newHist.slice(newHist.length - 50);
                return newHist;
            });
        }, 15000 + Math.random() * 30000); // Random interval between 15-45 seconds

        return () => clearInterval(interval);
    }, []);

    const handleCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const raw = input.trim();
        const parts = raw.split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        const newHistory = [...history, `> ${raw}`];

        switch (cmd) {
            case 'help':
                newHistory.push(
                    "╔══════════════════════════════════════════╗",
                    "║    HACKMATE KERNEL — COMMAND REFERENCE    ║",
                    "╚══════════════════════════════════════════╝",
                    "",
                    "  GENERAL Commands:",
                    "  STATUS                          - Mission status",
                    "  MISSION                         - Deployment data",
                    "  SQUAD                           - List operatives",
                    "  TASKS                           - List all tasks",
                    "  DEADLINE                        - Show project deadline",
                    "  PROGRESS                        - Detailed mission progress",
                    "  STATS                           - Operative rank & badges",
                    "  OBJECTIVE                       - Current mission objective",
                    "  INTEL                           - Archive metadata",
                    "  SCAN                            - Security scan",
                    "  NETWORK                         - Network telemetry",
                    "  SYSTEM                          - OS environment data",
                    "  AUTH                            - Auth level",
                    "  CLEAR                           - Wipe buffer",
                    "",
                    isLeader ? "  ── LEADER COMMANDS [ELEVATED] ──" : "  ── LEADER COMMANDS [LOCKED] ──",
                    isLeader ? "  SET-DEADLINE <YYYY-MM-DD>       - Set project deadline" : "",
                    isLeader ? "  SET-TASK-DEADLINE <#> <date>    - Set individual task deadline" : "",
                    isLeader ? "  ASSIGN <#> <operative-name>     - Reassign task to operative" : "",
                    isLeader ? "  RETASK <#> <todo|exec|review|done> - Move task to column" : "",
                    isLeader ? "  CRITICAL <#>                    - Toggle task as critical" : "",
                    isLeader ? "  PROMOTE <name> <leader|member>  - Change operative role" : "",
                    isLeader ? "  SET-OBJECTIVE <text>            - Set mission objective" : "",
                    isLeader ? "  KICK <operative-name>           - Remove operative" : "",
                    isLeader ? "  REDEPLOY <name> <goal> <date>   - Start new mission cycle" : "",
                );
                break;
            case 'status':
                newHistory.push(
                    `MISSION: ${team.name.toUpperCase()}`,
                    `HACKATHON: ${(team.event || 'UNSET').toUpperCase()}`,
                    `PROGRESS: [${'█'.repeat(Math.min(20, Math.floor(team.progress / 5)))}${'░'.repeat(Math.max(0, 20 - Math.floor(team.progress / 5)))}] ${team.progress || 0}%`,
                    `TASKS: ${team.tasks?.length || 0} TOTAL | ${team.tasks?.filter((t: any) => t.status === 'done').length || 0} SECURED`,
                    `DEADLINE: ${team.deadline ? new Date(team.deadline).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'NOT SET'}`,
                    `STATUS: ${team.progress >= 100 ? 'MISSION COMPLETE' : 'OPERATIONAL'}`
                );
                break;
            case 'mission':
                newHistory.push(
                    `DEPLOYMENT ID: ${team.id.substring(0, 8).toUpperCase()}`,
                    `SECTOR: ${team.event.toUpperCase()}`,
                    `CREATED: ${new Date(team.created_at).toLocaleString()}`,
                    `INVITE_CODE: [ENCRYPTED]`
                );
                break;
            case 'network':
                newHistory.push(
                    "UPLINK: SUPABASE REALTIME V2",
                    "LATENCY: 12ms",
                    "ENCRYPTION: AES-4096-QUANTUM",
                    "SIGNAL STRENGTH: 98%"
                );
                break;
            case 'auth':
                newHistory.push(
                    `PROTOCOL: AUTH_BEARER_v3`,
                    `LEVEL: ${team.role.toUpperCase()}`,
                    `SIGNATURE: verified_by_hackmate_node`
                );
                break;
            case 'squad':
                team.currentMembers.forEach((m: any) => {
                    newHistory.push(`  [${m.online ? 'ONLINE' : 'OFFLINE'}] ${m.name.toUpperCase()} - ${m.member_role?.toUpperCase() || m.role?.toUpperCase()}`);
                });
                break;
            case 'objective':
                newHistory.push(`CURRENT OBJECTIVE: ${team.mission_objective || 'NONE SET'}`);
                break;
            case 'scan':
                newHistory.push(
                    "SCANNING SECTOR INTERRUPTS...",
                    "...",
                    "NO INTRUSIONS DETECTED. ALL SYSTEMS SECURE.",
                    `ACTIVE NODES: ${team.currentMembers.filter((m: any) => m.online).length}`
                );
                break;
            case 'intel':
                newHistory.push(
                    "INTEL ARCHIVE METADATA:",
                    `  TOTAL ASSETS: ${team.documents?.length || 0}`,
                    "  ENCRYPTION: ACTIVE",
                    "  VAULT STATUS: SECURED"
                );
                break;
            case 'clear':
                setHistory(["BUFFER CLEARED.", ""]);
                setInput("");
                return;
            case 'system':
                newHistory.push(
                    "OS: ANTIGRAVITY KERNEL 4.2.0",
                    "ARCH: X86_64 NEURAL",
                    "MEMORY: 128.4 GB / 256.0 GB USED",
                    "UPTIME: 147h 22m"
                );
                break;
            case 'tasks': {
                const teamTasks = (team.tasks || []) as any[];
                if (teamTasks.length === 0) {
                    newHistory.push("NO ACTIVE TASKS IN MISSION QUEUE.");
                } else {
                    newHistory.push(`MISSION TASK MANIFEST (${teamTasks.length} TOTAL):`);
                    teamTasks.forEach((t: any, i: number) => {
                        const assignee = team.currentMembers.find((m: any) => m.id === t.assignee_id);
                        const dl = t.deadline ? new Date(t.deadline).toLocaleDateString() : 'NO DEADLINE';
                        newHistory.push(`  [${String(i + 1).padStart(2, '0')}] ${(t.title || '').toUpperCase().substring(0, 35)} | ${(t.status || '').toUpperCase()} | ${assignee?.name?.toUpperCase() || 'UNASSIGNED'} | DL: ${dl}`);
                    });
                }
                break;
            }
            case 'set-deadline': {
                if (!isLeader) { newHistory.push("ERR: ELEVATED CLEARANCE REQUIRED. COMMAND DENIED."); break; }
                const dateStr = args[0];
                if (!dateStr || isNaN(Date.parse(dateStr))) {
                    newHistory.push("ERR: INVALID FORMAT. USAGE: SET-DEADLINE <YYYY-MM-DD>");
                } else {
                    const iso = new Date(dateStr).toISOString();
                    updateTeamDeadline(team.id, iso);
                    newHistory.push(`[OK] PROJECT TIMELINE UPDATED: ${new Date(dateStr).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
                    newHistory.push("[OK] ALL OPERATIVES NOTIFIED OF NEW DEADLINE.");
                }
                break;
            }
            case 'set-task-deadline': {
                if (!isLeader) { newHistory.push("ERR: ELEVATED CLEARANCE REQUIRED. COMMAND DENIED."); break; }
                const taskIndex = parseInt(args[0]) - 1;
                const taskDateStr = args[1];
                const teamTasksForDeadline = (team.tasks || []) as any[];
                if (isNaN(taskIndex) || taskIndex < 0 || taskIndex >= teamTasksForDeadline.length) {
                    newHistory.push(`ERR: INVALID TASK #. USE 'TASKS' TO LIST TASK NUMBERS.`);
                } else if (!taskDateStr || isNaN(Date.parse(taskDateStr))) {
                    newHistory.push("ERR: INVALID DATE. USAGE: SET-TASK-DEADLINE <task#> <YYYY-MM-DD>");
                } else {
                    const target = teamTasksForDeadline[taskIndex];
                    await updateTask(target.id, { deadline: new Date(taskDateStr).toISOString() } as any);
                    newHistory.push(`[OK] TASK "${(target.title || '').toUpperCase()}" DEADLINE SET: ${new Date(taskDateStr).toLocaleDateString()}`);
                }
                break;
            }
            case 'deadline': {
                const dl = team.deadline ? new Date(team.deadline) : null;
                if (!dl) {
                    newHistory.push("PROJECT DEADLINE: NOT SET");
                } else {
                    const msDiff = dl.getTime() - Date.now();
                    const daysLeft = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
                    const urgency = daysLeft < 0 ? 'OVERDUE' : daysLeft === 0 ? 'DUE TODAY' : daysLeft <= 2 ? `CRITICAL — ${daysLeft}D LEFT` : `${daysLeft} DAYS REMAINING`;
                    newHistory.push(
                        `PROJECT DEADLINE: ${dl.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
                        `STATUS: ${urgency}`
                    );
                }
                break;
            }
            case 'progress': {
                const allTasks = (team.tasks || []) as any[];
                const byStatus: Record<string, number> = { todo: 0, in_progress: 0, review: 0, done: 0 };
                allTasks.forEach((t: any) => { byStatus[t.status] = (byStatus[t.status] || 0) + 1; });
                const pct = team.progress || 0;
                newHistory.push(
                    `MISSION PROGRESS: ${pct}%`,
                    `${'█'.repeat(Math.min(40, Math.floor(pct / 2.5)))}${'░'.repeat(Math.max(0, 40 - Math.floor(pct / 2.5)))}`,
                    `  BACKLOG:   ${byStatus.todo}`,
                    `  EXECUTION: ${byStatus.in_progress}`,
                    `  ANALYSIS:  ${byStatus.review}`,
                    `  SECURE:    ${byStatus.done}`,
                    `  TOTAL:     ${allTasks.length} OPERATIONS`,
                    `  OPERATIVES: ${team.currentMembers?.length || 0} ACTIVE`,
                );
                break;
            }
            case 'stats': {
                const targetName = args.join(' ').toLowerCase();
                let op = team.currentMembers.find((m: any) => m.id === user?.id);
                if (targetName) {
                    op = team.currentMembers.find((m: any) => m.name?.toLowerCase().includes(targetName));
                }

                if (!op) {
                    newHistory.push(`ERR: OPERATIVE NOT FOUND IN SQUADRON.`);
                    break;
                }

                newHistory.push(
                    `OPERATIVE: ${op.name.toUpperCase()}`,
                    `ROLE: ${op.member_role || op.role}`.toUpperCase(),
                    `LEVEL: ${Math.floor((op.xp || 0) / 100) + 1}   |   XP: ${op.xp || 0}`,
                    `TASKS SECURED: ${op.tasks_completed || 0}`
                );

                if (op.badges && op.badges.length > 0) {
                    newHistory.push(`BADGES: ${op.badges.join(' | ').toUpperCase()}`);
                } else {
                    newHistory.push(`BADGES: NONE`);
                }
                break;
            }
            case 'assign': {
                if (!isLeader) { newHistory.push("ERR: ELEVATED CLEARANCE REQUIRED."); break; }
                const taskIdx = parseInt(args[0]) - 1;
                const operativeName = args.slice(1).join(' ').toLowerCase();
                const ttasks = (team.tasks || []) as any[];
                if (isNaN(taskIdx) || taskIdx < 0 || taskIdx >= ttasks.length) {
                    newHistory.push("ERR: INVALID TASK #. USE 'TASKS' TO LIST."); break;
                }
                const operative = team.currentMembers.find((m: any) => m.name?.toLowerCase().includes(operativeName));
                if (!operative) { newHistory.push(`ERR: OPERATIVE "${operativeName.toUpperCase()}" NOT FOUND.`); break; }
                await updateTask(ttasks[taskIdx].id, { assignee_id: operative.id } as any);
                newHistory.push(`[OK] TASK "${(ttasks[taskIdx].title || '').toUpperCase()}" REASSIGNED → ${operative.name.toUpperCase()}`);
                newHistory.push(`[OK] OPERATIVE NOTIFIED. REALTIME SYNC COMPLETE.`);
                break;
            }
            case 'retask': {
                if (!isLeader) { newHistory.push("ERR: ELEVATED CLEARANCE REQUIRED."); break; }
                const taskIdx = parseInt(args[0]) - 1;
                const statusMap: Record<string, string> = { todo: 'todo', backlog: 'todo', exec: 'in_progress', execution: 'in_progress', review: 'review', analysis: 'review', done: 'done', secure: 'done' };
                const newStatus = statusMap[args[1]?.toLowerCase() || ''];
                const ttasks = (team.tasks || []) as any[];
                if (isNaN(taskIdx) || taskIdx < 0 || taskIdx >= ttasks.length) {
                    newHistory.push("ERR: INVALID TASK #."); break;
                }
                if (!newStatus) {
                    newHistory.push("ERR: INVALID STATUS. USE: todo|exec|review|done"); break;
                }
                moveTask(ttasks[taskIdx].id, newStatus as any);
                newHistory.push(`[OK] TASK "${(ttasks[taskIdx].title || '').toUpperCase()}" MOVED → ${newStatus.toUpperCase()}`);
                newHistory.push(`[OK] TACTICAL BOARD UPDATED. REALTIME SYNC PUSHED.`);
                break;
            }
            case 'critical': {
                if (!isLeader) { newHistory.push("ERR: ELEVATED CLEARANCE REQUIRED."); break; }
                const taskIdx = parseInt(args[0]) - 1;
                const ttasks = (team.tasks || []) as any[];
                if (isNaN(taskIdx) || taskIdx < 0 || taskIdx >= ttasks.length) {
                    newHistory.push("ERR: INVALID TASK #. USE 'TASKS' TO LIST."); break;
                }
                const t = ttasks[taskIdx];
                const newCritical = !t.is_critical;
                await toggleCritical(t.id, newCritical);
                newHistory.push(`[OK] TASK "${(t.title || '').toUpperCase()}" MARKED ${newCritical ? '🔴 CRITICAL — PRIORITY ESCALATED' : '⚪ STANDARD PRIORITY'}`);
                break;
            }
            case 'promote': {
                if (!isLeader) { newHistory.push("ERR: ELEVATED CLEARANCE REQUIRED."); break; }
                const roleName = args[args.length - 1]?.toLowerCase();
                const roleMap: Record<string, string> = { leader: 'Leader', member: 'Member', operative: 'Member' };
                const targetRole = roleMap[roleName || ''];
                if (!targetRole) { newHistory.push("ERR: INVALID ROLE. USE: leader|member"); break; }
                const operativeName = args.slice(0, -1).join(' ').toLowerCase();
                const operative = team.currentMembers.find((m: any) =>
                    m.name?.toLowerCase().includes(operativeName) && m.id !== user?.id
                );
                if (!operative) { newHistory.push(`ERR: OPERATIVE "${operativeName.toUpperCase()}" NOT FOUND.`); break; }
                await assignMemberRole(team.id, operative.id, targetRole);
                newHistory.push(`[OK] OPERATIVE ${operative.name.toUpperCase()} → ROLE: ${targetRole.toUpperCase()}`);
                newHistory.push(`[OK] ACCESS MATRIX UPDATED. REALTIME SYNC COMPLETE.`);
                break;
            }
            case 'set-objective': {
                if (!isLeader) { newHistory.push("ERR: ELEVATED CLEARANCE REQUIRED."); break; }
                const objective = args.join(' ');
                if (!objective.trim()) { newHistory.push("ERR: PROVIDE AN OBJECTIVE TEXT."); break; }
                await setMissionObjective(team.id, objective);
                newHistory.push(`[OK] MISSION OBJECTIVE SET: "${objective.toUpperCase()}"`);
                newHistory.push(`[OK] ALL OPERATIVES NOTIFIED.`);
                break;
            }
            case 'redeploy': {
                if (!isLeader) { newHistory.push("ERR: ELEVATED CLEARANCE REQUIRED."); break; }
                newHistory.push("[!!] REDEPLOY requires: REDEPLOY <mission-name> | <goal> | <YYYY-MM-DD>");
                newHistory.push("[!!] Example: REDEPLOY HackFest24 | Build an AI product | 2025-04-10");
                newHistory.push("[!!] Type your command with | separators and confirm.");
                break;
            }
            case 'kick': {
                if (!isLeader) { newHistory.push("ERR: ELEVATED CLEARANCE REQUIRED. COMMAND DENIED."); break; }
                const namePart = args.join(' ').toLowerCase();
                const kickTarget = team.currentMembers.find((m: any) =>
                    m.name?.toLowerCase().includes(namePart) && m.id !== user?.id
                );
                if (!kickTarget) {
                    newHistory.push(`ERR: OPERATIVE "${args.join(' ').toUpperCase()}" NOT FOUND OR CANNOT REMOVE SELF.`);
                } else {
                    await removeMember(team.id, kickTarget.id);
                    newHistory.push(`[OK] OPERATIVE ${kickTarget.name.toUpperCase()} REMOVED FROM SQUADRON.`);
                    newHistory.push(`[OK] ACCESS CREDENTIALS REVOKED.`);
                }
                break;
            }
            default:
                newHistory.push(`ERR: COMMAND '${cmd.toUpperCase()}' NOT RECOGNIZED. TYPE 'HELP' FOR COMMANDS.`);
        }

        newHistory.push("");
        // Limit history size
        const finalHistory = newHistory.length > 50 ? newHistory.slice(newHistory.length - 50) : newHistory;
        setHistory(finalHistory);
        setInput("");
    };

    return (
        <div className="h-full bg-black p-8 font-mono text-emerald-500 overflow-hidden flex flex-col relative border border-border/30 rounded-[2rem] shadow-2xl">
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10" style={{ backgroundSize: '100% 2px, 3px 100%' }} />
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] z-10" />

            {/* Ambient Pulse */}
            <motion.div
                animate={{ opacity: [0.05, 0.1, 0.05] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-emerald-500/5 pointer-events-none z-0"
            />

            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1 relative z-0" ref={scrollRef}>
                {history.map((line, i) => (
                    <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={i}
                        className="leading-tight text-sm md:text-base min-h-[1.2em] flex gap-2"
                    >
                        {line}
                    </motion.div>
                ))}
            </div>

            <div className="mt-4 flex items-center gap-2 relative z-0 border-t border-emerald-500/10 pt-4">
                <span className="text-emerald-500 font-bold animate-pulse text-lg">{'>'}</span>
                <form onSubmit={handleCommand} className="flex-1">
                    <input
                        autoFocus
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-emerald-400 font-mono text-lg caret-emerald-500 selection:bg-emerald-500/30"
                        spellCheck={false}
                        autoComplete="off"
                    />
                </form>
            </div>

            <div className="absolute bottom-4 right-8 text-[10px] font-bold text-emerald-900 uppercase tracking-[0.3em] pointer-events-none flex items-center gap-4">
                <span className="animate-pulse flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    System Live
                </span>
                <span>Node: HM-01</span>
                <span className="flex items-center gap-1.5 ring-1 ring-emerald-500/20 px-2 py-0.5 rounded">
                    <Lock className="w-2.5 h-2.5" />
                    Secured
                </span>
            </div>
        </div>
    );
};

const MissionClock: React.FC<{ team: any }> = ({ team }) => {
    const {
        updateTeamDeadline,
        deleteTeam,
        user,
        calculateMissionXP,
        completeMission,
        redeploySquad
    } = useAppContext();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showDeadlineModal, setShowDeadlineModal] = useState(false);
    const [showAbortModal, setShowAbortModal] = useState(false);
    const [showDebrief, setShowDebrief] = useState(false);
    const [showRedeployModal, setShowRedeployModal] = useState(false);
    const [debriefStats, setDebriefStats] = useState<any[]>([]);
    const [missionXP, setMissionXP] = useState(0);
    const [deadlineInput, setDeadlineInput] = useState("");
    const [redeployForm, setRedeployForm] = useState({ name: "", goal: "", deadline: "" });
    const [isProcessing, setIsProcessing] = useState(false);

    // â”€â”€â”€ Clock tick â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // â”€â”€â”€ Sync deadline input when modal opens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        if (team.deadline && showDeadlineModal) {
            const date = new Date(team.deadline);
            const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
            setDeadlineInput(localDate.toISOString().slice(0, 16));
        }
    }, [team.deadline, showDeadlineModal]);

    // â”€â”€â”€ Real-time broadcast listener â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Non-leader members receive MISSION_COMPLETED / SQUAD_REDEPLOYED events
    // and open the debrief modal automatically
    useEffect(() => {
        if (!team?.id) return;
        const channel = supabase
            .channel(`team_commands_${team.id}`)
            .on('broadcast', { event: 'tactical_action' }, ({ payload }) => {
                if (payload.type === 'MISSION_COMPLETED' && payload.senderId !== user?.id) {
                    const { totalXP, memberStats } = payload.data;
                    setMissionXP(totalXP);
                    setDebriefStats(memberStats);
                    setShowDebrief(true);
                }
                if (payload.type === 'SQUAD_REDEPLOYED' && payload.senderId !== user?.id) {
                    setShowDebrief(false);
                    toast.success("NEW MISSION DEPLOYED: Check your notifications.", { icon: "ðŸš€" });
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [team?.id, user?.id]);

    // â”€â”€â”€ Derived state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const isLeader = team.currentMembers.some((m: any) => m.id === user?.id && m.role === 'Leader');
    const deadlineDate = team.deadline ? new Date(team.deadline) : null;
    const isOvertime = deadlineDate ? currentTime > deadlineDate : false;
    const remaining = (() => {
        if (!deadlineDate) return null;
        const diff = Math.abs(deadlineDate.getTime() - currentTime.getTime());
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            secs: Math.floor((diff % (1000 * 60)) / 1000),
        };
    })();

    // â”€â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleSetDeadline = (e: React.FormEvent) => {
        e.preventDefault();
        if (!deadlineInput) return;
        updateTeamDeadline(team.id, new Date(deadlineInput).toISOString());
        setShowDeadlineModal(false);
    };

    const handleCompleteMission = async () => {
        setIsProcessing(true);
        const stats = await calculateMissionXP(team.id);
        setDebriefStats(stats.memberStats);
        setMissionXP(stats.totalXP);
        // Persist mission archive + distribute XP to DB
        await completeMission(team.id, "Mission finalized by leader.");
        setShowDebrief(true);
        setIsProcessing(false);
    };

    const handleRedeploySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!redeployForm.name || !redeployForm.goal || !redeployForm.deadline) return;
        setIsProcessing(true);
        const deadline = new Date(redeployForm.deadline).toISOString();
        const success = await redeploySquad(team.id, redeployForm.name, redeployForm.goal, deadline);
        if (success) {
            setShowDebrief(false);
            setShowRedeployModal(false);
            setRedeployForm({ name: "", goal: "", deadline: "" });
        }
        setIsProcessing(false);
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 px-4 md:px-6 py-4 md:py-3 bg-card/40 border-b border-border/30 backdrop-blur-xl relative z-30 md:min-h-[64px]">
            {/* Real-time Clock */}
            <div className="flex md:flex-col border-r border-border/50 pr-4 md:pr-6 items-center md:items-start gap-3 md:gap-0.5">
                <span className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">System Time</span>
                <span className="text-xs md:text-sm font-mono font-bold text-emerald-400 tabular-nums">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                </span>
            </div>

            {/* Mission Countdown */}
            <div className="flex-1 flex items-center md:gap-8 overflow-hidden">
                {deadlineDate ? (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className={cn(
                                "w-1 h-1 md:w-1.5 md:h-1.5 rounded-full shadow-[0_0_8px]",
                                isOvertime ? "bg-rose-500 shadow-rose-500/50 animate-pulse" : "bg-blue-500 shadow-blue-500/50"
                            )} />
                            <span className={cn(
                                "text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]",
                                isOvertime ? "text-rose-500 animate-pulse" : "text-blue-500"
                            )}>
                                {isOvertime ? "Mission_Overtime" : "Time_Remaining"}
                            </span>
                        </div>
                        <div className="flex items-baseline gap-2 md:gap-3">
                            <span className={cn(
                                "text-lg md:text-2xl font-black font-mono tracking-tighter tabular-nums truncate",
                                isOvertime ? "text-rose-400" : "text-foreground"
                            )}>
                                {isOvertime && "-"}
                                {remaining && (
                                    <>
                                        {remaining.days > 0 && <span>{remaining.days}d </span>}
                                        {remaining.hours.toString().padStart(2, '0')}:
                                        {remaining.mins.toString().padStart(2, '0')}:
                                        {remaining.secs.toString().padStart(2, '0')}
                                    </>
                                )}
                            </span>
                            <span className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-tight hidden sm:block">
                                Deadline: {deadlineDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <span className="text-[8px] md:text-[10px] font-black text-muted-foreground/70 uppercase tracking-[0.2em] mb-0.5">Status</span>
                        <div className="text-[9px] md:text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Shield className="w-2.5 h-2.5 opacity-30" />
                            Mission_Timeline_Not_Sync'd
                        </div>
                    </div>
                )}
            </div>

            {/* Leader Controls */}
            {isLeader && (
                <div className="flex items-center gap-2">
                    {!deadlineDate ? (
                        <Button
                            size="sm"
                            onClick={() => setShowDeadlineModal(true)}
                            className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-5"
                        >
                            <Target className="w-3.5 h-3.5 mr-2" />
                            Launch Mission
                        </Button>
                    ) : (
                        <>
                            <Button
                                size="sm"
                                onClick={handleCompleteMission}
                                disabled={isProcessing}
                                className="bg-hack-blue hover:bg-blue-600 text-white shadow-lg shadow-hack-blue/20 rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-5 group disabled:opacity-60"
                            >
                                <Trophy className="w-3.5 h-3.5 mr-2 group-hover:rotate-12 transition-transform" />
                                {isProcessing ? "Processing..." : "End Mission"}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowDeadlineModal(true)}
                                className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl font-black uppercase tracking-widest text-[9px] h-10 px-3"
                            >
                                Adjust
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowAbortModal(true)}
                                className="text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl text-[9px] font-black uppercase tracking-widest h-10 px-3 border border-rose-500/20"
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </>
                    )}
                </div>
            )}

            {/* â”€â”€â”€ All Modals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <AnimatePresence>
                {/* Mission Debrief Modal (visible to all squad members) */}
                {showDebrief && (
                    <MissionDebriefModal
                        isOpen={showDebrief}
                        onClose={() => setShowDebrief(false)}
                        missionName={team.current_mission_name || team.name}
                        missionGoal={team.mission_goal || "Strategic Objective"}
                        stats={debriefStats}
                        totalXP={missionXP}
                        isLeader={isLeader}
                        onRedeploy={() => { setShowDebrief(false); setShowRedeployModal(true); }}
                    />
                )}

                {/* Redeploy Squad Modal â€” replaces browser prompt() */}
                {showRedeployModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRedeployModal(false)} className="absolute inset-0 bg-black/70 backdrop-blur-xl" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 24 }}
                            className="w-full max-w-md bg-card border border-blue-500/30 rounded-[2.5rem] p-8 shadow-[0_0_60px_rgba(59,130,246,0.2)] relative z-10"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-foreground uppercase tracking-tighter">Redeploy Squad</h2>
                                    <p className="text-xs text-muted-foreground font-medium">New hackathon, same squad. All history preserved.</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setShowRedeployModal(false)} className="ml-auto rounded-2xl bg-muted/30 hover:bg-muted">
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </Button>
                            </div>

                            <form onSubmit={handleRedeploySubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">New Mission Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Operation Hackfest 2026"
                                        value={redeployForm.name}
                                        onChange={e => setRedeployForm(p => ({ ...p, name: e.target.value }))}
                                        className="w-full bg-muted/30 border border-border/50 rounded-2xl px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Strategic Objective</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Build an AI-powered study assistant"
                                        value={redeployForm.goal}
                                        onChange={e => setRedeployForm(p => ({ ...p, goal: e.target.value }))}
                                        className="w-full bg-muted/30 border border-border/50 rounded-2xl px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">New Deadline</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={redeployForm.deadline}
                                        onChange={e => setRedeployForm(p => ({ ...p, deadline: e.target.value }))}
                                        className="w-full bg-muted/30 border border-border/50 rounded-2xl px-5 py-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                                    />
                                </div>
                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 text-xs text-blue-300/80 font-medium">
                                    ðŸ”— All team members, chat history, repositories and audit logs will be preserved. Only the task board will be cleared.
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm shadow-lg shadow-blue-500/20 disabled:opacity-60"
                                >
                                    {isProcessing ? "Deploying..." : "ðŸš€ Deploy New Mission"}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Abort Mission Modal */}
                {showAbortModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAbortModal(false)} className="absolute inset-0 bg-rose-950/20 backdrop-blur-xl" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-card border border-rose-500/50 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(244,63,94,0.3)] relative z-10"
                        >
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center border-2 border-rose-500 animate-pulse">
                                    <AlertTriangle className="w-10 h-10 text-rose-500" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none mb-2">Critical Alpha Alert</h2>
                                    <p className="text-sm text-rose-400 font-bold uppercase tracking-widest animate-pulse">Confirm Mission Abortion</p>
                                </div>
                                <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-xs text-muted-foreground font-mono leading-relaxed">
                                    WARNING: This will permanently purge team <span className="text-rose-400 font-bold">"{team.name}"</span> and ALL tactical data. This cannot be reversed.
                                </div>
                                <div className="flex gap-4 w-full">
                                    <Button onClick={() => setShowAbortModal(false)} className="flex-1 h-14 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-bold uppercase tracking-widest text-[10px]">
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={async () => {
                                            const success = await deleteTeam(team.id);
                                            if (success) { setShowAbortModal(false); navigate('/dashboard'); }
                                        }}
                                        className="flex-1 h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                                    >
                                        Execute Purge
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Deadline Modal */}
                {showDeadlineModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeadlineModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-2xl relative z-10"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">Mission Timeline</h2>
                                    <p className="text-xs text-muted-foreground font-medium">Define the operational window for this sector.</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setShowDeadlineModal(false)} className="rounded-2xl bg-muted/30 hover:bg-muted">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </Button>
                            </div>
                            <form onSubmit={handleSetDeadline} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <Zap className="w-3 h-3 text-blue-500" />
                                        Target Timestamp
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={deadlineInput}
                                        onChange={(e) => setDeadlineInput(e.target.value)}
                                        className="w-full bg-card border border-border/50 rounded-2xl p-5 text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-center shadow-inner"
                                    />
                                    <p className="text-[10px] text-muted-foreground/70 text-center font-bold uppercase tracking-widest mt-2 px-4">
                                        All squadron members will be synchronized to this timeline.
                                    </p>
                                </div>
                                <Button className="w-full h-16 rounded-[1.5rem] bg-blue-600 hover:bg-blue-500 text-foreground font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 text-sm active:scale-[0.98] transition-all">
                                    Synchronize Strategy
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};



export const WorkspaceView: React.FC = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const { teams, activeTeamId, setActiveTeamId } = useAppContext();
    const [activeTab, setActiveTab] = useState("kanban");

    // Find the current team
    const team = teams.find(t => t.id === teamId);

    // Sync active team context
    React.useEffect(() => {
        if (teamId && teamId !== activeTeamId) {
            setActiveTeamId(teamId);
        }
    }, [teamId, activeTeamId, setActiveTeamId]);

    if (!team) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground p-4">
                <Activity className="w-12 h-12 text-blue-500/20 mb-4 animate-pulse" />
                <h2 className="text-xl font-bold text-foreground/90 mb-2 uppercase tracking-widest">Uplink Lost</h2>
                <p className="mb-6 text-sm">Team profile not found in current signal range.</p>
                <Button
                    onClick={() => navigate("/workspace")}
                    variant="outline"
                    className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    const tabs = [
        { id: "kanban", name: "Tactical Board", icon: Columns, color: "text-blue-400" },
        { id: "chat", name: "Comms Link", icon: MessageSquare, color: "text-emerald-400" },
        { id: "bounties", name: "Mission Logs", icon: Target, color: "text-indigo-400" },
        { id: "docs", name: "Intel Archives", icon: FileText, color: "text-amber-400" },
        { id: "codebase", name: "Codebase", icon: Terminal, color: "text-emerald-500" }, // NEW Codebase Tab
        { id: "intel", name: "Squad Intel", icon: BarChart2, color: "text-purple-400" },
        { id: "management", name: "Command", icon: Shield, color: "text-rose-400" },
        { id: "console", name: "Console", icon: Activity, color: "text-muted-foreground" },
    ];

    return (
        <div className="flex h-screen bg-background relative overflow-hidden">
            {/* Workspace Sidebar - Desktop Only */}
            <aside className="w-64 border-r border-border/30 bg-card/60 backdrop-blur-xl flex flex-col hidden md:flex shrink-0">
                <div className="p-4 border-b border-border/30">
                    <button
                        onClick={() => navigate("/workspace")}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:text-white hover:bg-muted/50 transition-all group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Sector</span>
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-border`}>
                            <Zap className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-foreground uppercase tracking-tighter truncate w-32">
                                {team.name}
                            </h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Operational</span>
                            </div>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group ${isActive
                                        ? "bg-blue-600/10 text-blue-400"
                                        : "text-muted-foreground hover:text-foreground/90 hover:bg-muted/50"
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? tab.color : "text-muted-foreground group-hover:text-foreground/80"}`} />
                                    {tab.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="ml-auto w-1 h-4 bg-blue-500 rounded-full"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600/5 to-indigo-600/5 border border-blue-500/10 group cursor-pointer hover:border-blue-500/20 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock className="w-3 h-3 text-blue-500" />
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Security Status</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground leading-tight">
                            All communications on this channel are encrypted.
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative flex flex-col">
                <MissionClock team={team} />
                <div className="flex-1 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            {activeTab === "kanban" && <TacticalBoard team={team} />}
                            {activeTab === "chat" && <CommsLink team={team} />}
                            {activeTab === "bounties" && <MissionLogs team={team} />}
                            {activeTab === "docs" && <IntelArchives team={team} />}
                            {activeTab === "codebase" && <CodebaseCenter team={team} />}
                            {activeTab === "intel" && <SquadIntel team={team} />}
                            {activeTab === "management" && <CommandCenter team={team} onNavigateToCodebase={() => setActiveTab("codebase")} />}
                            {activeTab === "console" && <TerminalConsole team={team} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};
