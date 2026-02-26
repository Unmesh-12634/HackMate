import React, { useState, useEffect } from "react";
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
    AlertTriangle
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useAppContext } from "../context/AppContext";
import { cn } from "../components/ui/utils";
import { toast } from "sonner";

// Placeholder components for the various workspace modules
// These will be fully implemented in follow-up tasks
import { CodebaseCenter } from "../components/workspace/CodebaseCenter";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AddTaskForm } from "../components/AddTaskForm";

// --- Tactical Board (Kanban) Sub-components ---

interface DragItem {
    id: string;
    type: string;
}

const TaskCard: React.FC<{ task: any }> = ({ task }) => {
    const { toggleCritical, deleteTask } = useAppContext();
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "TASK",
        item: { id: task.id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    const priorityColors = {
        urgent: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        high: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        medium: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        low: "text-slate-500 bg-slate-500/10 border-slate-500/20",
    };

    return (
        <div
            ref={drag as any}
            className={`group relative p-4 rounded-2xl bg-card/20 border border-border/50 hover:border-blue-500/30 transition-all duration-300 mb-3 shadow-lg shadow-black/20 ${isDragging ? "opacity-40 scale-95" : "opacity-100"
                } ${task.is_critical ? "ring-1 ring-blue-500/50 shadow-blue-500/10" : ""}`}
        >
            {task.is_critical && (
                <div className="absolute -left-px top-4 w-1 h-8 bg-blue-500 rounded-r-full shadow-[4px_0_12px_rgba(59,130,246,0.5)]" />
            )}

            <div className="flex items-start justify-between mb-3">
                <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-widest ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                    {task.priority}
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => toggleCritical(task.id, !task.is_critical)}
                        className={`p-1 rounded-lg hover:bg-white/5 transition-colors ${task.is_critical ? "text-blue-400" : "text-slate-500"}`}
                    >
                        <Zap className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <h4 className="text-sm font-bold text-foreground mb-1 group-hover:text-blue-400 transition-colors">
                {task.title}
            </h4>

            {task.description && (
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {task.description}
                </p>
            )}

            <div className="flex items-center justify-between mt-auto">
                <div className="flex -space-x-2">
                    {task.assignee ? (
                        <div className="w-6 h-6 rounded-full ring-2 ring-background bg-secondary border border-border/50 flex items-center justify-center overflow-hidden group/avatar">
                            <img src={task.assignee.avatar} alt={task.assignee.name} className="w-full h-full object-cover" />
                            <div className="absolute hidden group-hover/avatar:block bottom-full mb-2 px-2 py-1 bg-popover border border-border/50 rounded text-[10px] text-popover-foreground whitespace-nowrap z-50">
                                {task.assignee.name}
                            </div>
                        </div>
                    ) : (
                        <div className="w-6 h-6 rounded-full ring-2 ring-background bg-secondary border border-border/50 flex items-center justify-center">
                            <Users className="w-3 h-3 text-muted-foreground" />
                        </div>
                    )}
                </div>

                {task.deadline && (
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                        <Activity className="w-3 h-3 text-blue-500/50" />
                        {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                )}
            </div>
        </div>
    );
};

const KanbanColumn: React.FC<{
    status: "todo" | "in_progress" | "review" | "done",
    title: string,
    tasks: any[],
    onAddTask: (status: "todo" | "in_progress" | "review" | "done") => void
}> = ({ status, title, tasks, onAddTask }) => {
    const { updateTaskStatus } = useAppContext();
    const [{ isOver }, drop] = useDrop(() => ({
        accept: "TASK",
        drop: (item: DragItem) => updateTaskStatus(item.id, status),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const statusIcons = {
        todo: <Lock className="w-4 h-4 text-slate-500" />,
        in_progress: <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />,
        review: <Activity className="w-4 h-4 text-amber-400" />,
        done: <Shield className="w-4 h-4 text-blue-400" />,
    };

    return (
        <div
            ref={drop as any}
            className={`flex flex-col w-80 min-w-[320px] rounded-3xl bg-secondary/30 border border-border/50 p-4 transition-colors duration-300 ${isOver ? "bg-blue-500/5 border-blue-500/20" : ""}`}
        >
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center border border-border/50">
                        {statusIcons[status as keyof typeof statusIcons]}
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-foreground uppercase tracking-widest">{title}</h3>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{tasks.length} Operations</span>
                    </div>
                </div>
                <button
                    onClick={() => onAddTask(status)}
                    className="p-2 rounded-xl text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))}
                {tasks.length === 0 && (
                    <div className="h-32 rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-slate-600 gap-2">
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

    const handleAddTask = (status?: "todo" | "in_progress" | "review" | "done") => {
        setInitialTaskStatus(status);
        setIsAddingTask(true);
    };

    const columns = [
        { id: "todo" as const, title: "Backlog", tasks: team.tasks.filter((t: any) => t.status === "todo") },
        { id: "in_progress" as const, title: "In Operation", tasks: team.tasks.filter((t: any) => t.status === "in_progress") },
        { id: "review" as const, title: "Review Pulse", tasks: team.tasks.filter((t: any) => t.status === "review") },
        { id: "done" as const, title: "Mission Complete", tasks: team.tasks.filter((t: any) => t.status === "done") },
    ];

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="h-full flex flex-col p-8">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Real-time Link Active</span>
                        </div>
                        <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Tactical Board</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => handleAddTask()}
                            className="rounded-2xl bg-blue-600 hover:bg-blue-500 text-foreground border-0 shadow-lg shadow-blue-600/20 font-black uppercase tracking-widest text-[10px] h-10 px-6"
                        >
                            <Plus className="w-4 h-4 mr-2 stroke-[3px]" /> Deploy New Task
                        </Button>
                    </div>
                </header>

                <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
                    <div className="flex gap-6 h-full min-h-[500px]">
                        {columns.map((col) => (
                            <KanbanColumn
                                key={col.id}
                                status={col.id}
                                title={col.title}
                                tasks={col.tasks}
                                onAddTask={handleAddTask}
                            />
                        ))}
                    </div>
                </div>

                <AnimatePresence>
                    {isAddingTask && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="w-full max-w-2xl bg-slate-900 border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden"
                            >
                                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">New Tactical Deployment</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter">Deploy Task</h3>
                                    </div>
                                    <button
                                        onClick={() => setIsAddingTask(false)}
                                        className="p-3 rounded-2xl bg-white/5 text-slate-500 hover:text-foreground hover:bg-white/10 transition-all"
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
    const { user, teamMessages, fetchTeamMessages, sendTeamMessage, getStandup } = useAppContext();
    const [message, setMessage] = useState("");
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Initial fetch and subscription handled by AppContext for activeTeamId
    // But we should ensure messages are synced when the tab is active
    React.useEffect(() => {
        if (team.id) {
            fetchTeamMessages(team.id);
        }
    }, [team.id, fetchTeamMessages]);

    // Auto-scroll to bottom on new messages
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [teamMessages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        if (message.startsWith("/standup")) {
            const cmd = message.trim();
            setMessage("");
            const summary = await getStandup(team.id);
            if (summary) {
                sendTeamMessage(team.id, `Tactical Stand-up Summary:\n\n${summary.summary_text}\n\n🏆 Key Achievements:\n- ${summary.key_achievements.join('\n- ')}\n\n⚠️ Blockers:\n- ${summary.blockers.join('\n- ')}\n\n🔜 Next Steps:\n- ${summary.next_steps.join('\n- ')}`);
            }
            return;
        }

        sendTeamMessage(team.id, message.trim());
        setMessage("");
    };

    return (
        <div className="h-full flex flex-col bg-secondary/20">
            <header className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/40 backdrop-blur-md">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Encrypted Tactical Channel</span>
                    </div>
                    <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">Comms Link</h2>
                </div>
                <div className="flex -space-x-3">
                    {team.currentMembers.map((m: any) => (
                        <div key={m.id} className="w-10 h-10 rounded-2xl border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden ring-1 ring-white/10 group relative">
                            <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                            <div className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 border border-border/50 rounded text-[10px] text-foreground whitespace-nowrap z-50">
                                {m.name}
                            </div>
                        </div>
                    ))}
                </div>
            </header>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
            >
                {teamMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                        <div className="w-16 h-16 rounded-full border border-dashed border-border/50 flex items-center justify-center">
                            <MessageSquare className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30">No active transmissions in this sector.</p>
                    </div>
                )}

                {teamMessages.map((msg: any) => {
                    const isMe = msg.author_id === user?.id;
                    return (
                        <div key={msg.id} className={`flex items-end gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-border/50 overflow-hidden flex-shrink-0">
                                <img src={msg.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user}`} alt="" />
                            </div>
                            <div className={`max-w-[70%] group`}>
                                <div className={`flex items-center gap-2 mb-1 px-1 ${isMe ? "flex-row-reverse" : ""}`}>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{msg.user}</span>
                                    <span className="text-[9px] font-medium text-slate-600 uppercase">{msg.time}</span>
                                </div>
                                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed transition-all shadow-lg ${isMe
                                    ? "bg-blue-600 text-foreground rounded-br-none shadow-blue-500/10"
                                    : "bg-white/5 text-foreground border border-white/5 rounded-bl-none shadow-black/20"
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-6 border-t border-white/5">
                <form
                    onSubmit={handleSend}
                    className="relative group"
                >
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Transmit data to squadron..."
                        className="w-full bg-white/5 border border-border/50 rounded-2xl px-6 py-4 pr-16 text-sm text-foreground placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all group-hover:bg-white/10"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-blue-600 text-foreground hover:bg-blue-500 transition-all flex items-center justify-center shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};
const IntelArchives: React.FC<{ team: any }> = ({ team }) => {
    const { documents, addDocument, updateDocument, user } = useAppContext();
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newDocTitle, setNewDocTitle] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const selectedDoc = documents.find(d => d.id === selectedDocId);

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

    return (
        <div className="h-full flex bg-background">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
            />

            <aside className="w-80 border-r border-border/50 flex flex-col bg-card/20">
                <header className="p-6 border-b border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Document Vault</h3>
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
                                className="w-full bg-secondary border border-blue-500/30 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none"
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
                            className="w-full bg-white/5 border border-border/50 rounded-xl px-4 py-2 text-[10px] text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all font-bold"
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                    {documents.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase())).map((doc) => (
                        <button
                            key={doc.id}
                            onClick={() => setSelectedDocId(doc.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${selectedDocId === doc.id
                                ? "bg-blue-600/15 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                                : "border border-transparent hover:bg-white/5"
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 ${selectedDocId === doc.id ? "bg-blue-500/20 text-blue-400" : "bg-slate-900 text-slate-500"
                                }`}>
                                {getDocIcon(doc)}
                            </div>
                            <div className="text-left overflow-hidden">
                                <div className={`text-sm font-bold truncate ${selectedDocId === doc.id ? "text-blue-400" : "text-foreground"}`}>
                                    {doc.title}
                                </div>
                                <div className="text-[9px] text-slate-500 uppercase font-black">
                                    {doc.type} • {new Date(doc.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 bg-background relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent)] pointer-events-none" />

                {selectedDoc ? (
                    <>
                        <header className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/20 backdrop-blur-sm relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
                                    {getDocIcon(selectedDoc)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-foreground uppercase tracking-tighter">{selectedDoc.title}</h2>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
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
                                            className="rounded-xl border-border/50 hover:bg-white/5 h-9 font-bold uppercase text-[10px] tracking-widest"
                                            onClick={() => window.open(selectedDoc.url, '_blank')}
                                        >
                                            <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                            Live View
                                        </Button>
                                        <a href={selectedDoc.url} download={selectedDoc.title} className="contents">
                                            <Button variant="outline" size="sm" className="rounded-xl border-border/50 hover:bg-white/5 h-9 px-3">
                                                <Download className="w-3.5 h-3.5 text-slate-400" />
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
                                    className="w-full h-full bg-transparent text-slate-300 font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder:text-slate-800"
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
                                            className="relative max-w-full max-h-[60vh] rounded-3xl border border-border/50 shadow-2xl object-contain bg-slate-900/50 p-2"
                                        />
                                    </motion.div>
                                    <div className="flex gap-4">
                                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
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
                                    <p className="text-sm text-slate-400 mb-8 max-w-xs text-center font-medium">PDF assets require external visor for full decryption.</p>
                                    <Button
                                        onClick={() => window.open(selectedDoc.url, '_blank')}
                                        className="bg-red-600 hover:bg-red-500 text-foreground rounded-2xl px-8 h-12 font-black uppercase tracking-widest"
                                    >
                                        Open in Secondary Visor
                                    </Button>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center">
                                    <div className="w-24 h-24 rounded-3xl bg-slate-800/50 border border-white/5 flex items-center justify-center mb-6">
                                        <FileIcon className="w-10 h-10 text-slate-500" />
                                    </div>
                                    <h3 className="text-xl font-black text-foreground uppercase tracking-wider mb-2">Foreign Intel Structure</h3>
                                    <p className="text-sm text-slate-400 mb-8 font-medium">Unknown data protocol. Recommendation: Manual download.</p>
                                    <a href={selectedDoc.url} download={selectedDoc.title}>
                                        <Button className="bg-slate-800 hover:bg-slate-700 text-foreground rounded-2xl px-8 h-12 font-black uppercase tracking-widest">
                                            <Download className="w-4 h-4 mr-2" /> Extract Data
                                        </Button>
                                    </a>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
                            <div className="relative w-24 h-24 rounded-full border border-white/5 bg-slate-900/50 flex items-center justify-center shadow-2xl">
                                <Lock className="w-10 h-10 opacity-20" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Vault Standby</h3>
                            <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Select an asset from the archives to begin decryption.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
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
        <div className="h-full overflow-y-auto p-8 bg-[#020617] scrollbar-hide">
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
                        className="p-6 rounded-3xl bg-card/40 border border-border/50 backdrop-blur-sm group hover:border-blue-500/20 transition-all"
                    >
                        <div className={`p-3 rounded-2xl bg-secondary w-fit mb-4 border border-white/5 ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
                        <div className="text-2xl font-black text-foreground uppercase tracking-tighter">{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Chart */}
                <div className="lg:col-span-2 p-8 rounded-[2rem] bg-card/40 border border-border/50 backdrop-blur-sm">
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
                <div className="p-8 rounded-[2rem] bg-card/40 border border-border/50 backdrop-blur-sm">
                    <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-8">Sector Deployment</h3>
                    <div className="space-y-6">
                        {["Design", "Backend", "Frontend", "Research"].map((label, i) => {
                            const progress = Math.floor(Math.random() * 60) + 20;
                            const colors = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500"];
                            return (
                                <div key={label}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                                        <span className="text-[10px] font-black text-foreground">{progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
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

                    <div className="mt-12 p-6 rounded-3xl bg-secondary/50 border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency Rating</div>
                                <div className="text-lg font-black text-foreground uppercase tracking-tighter">Peak Operational</div>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed uppercase font-bold tracking-widest">
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
        syncGitHubRepo // <- Added this
    } = useAppContext();
    const [editingObjective, setEditingObjective] = useState(false);
    const [objective, setObjective] = useState(team.mission_objective || "");

    const [editingRepo, setEditingRepo] = useState(false); // <- Added this
    const [repoInput, setRepoInput] = useState(team.github_repo || ""); // <- Added this

    const isLeader = team.role === "Leader" || team.currentMembers.find((m: any) => m.id === user?.id)?.role === "Leader";

    const handleObjectiveSave = () => {
        setMissionObjective(team.id, objective);
        setEditingObjective(false);
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
        <div className="h-full overflow-y-auto p-8 bg-[#020617] scrollbar-hide">
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
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Auth Level</div>
                        <div className="text-sm font-black text-rose-400 uppercase tracking-tighter">{team.role} Access</div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    {/* Mission Objective Section */}
                    <section className="p-8 rounded-[2.5rem] bg-card/40 border border-border/50 backdrop-blur-md relative overflow-hidden group">
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
                                    className="w-full bg-secondary/50 border border-blue-500/30 rounded-[2rem] p-6 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[120px] resize-none"
                                    placeholder="Define the primary objective for this squadron..."
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleObjectiveSave} className="rounded-2xl bg-blue-600 hover:bg-blue-500 text-foreground px-8 font-black uppercase text-[10px] tracking-widest h-11">Sync Objective</Button>
                                    <Button onClick={() => setEditingObjective(false)} variant="ghost" className="rounded-2xl text-slate-400 hover:text-foreground hover:bg-white/5 font-black uppercase text-[10px] tracking-widest h-11 px-8">Abord</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 rounded-[2rem] bg-secondary/50 border border-white/5 relative z-10">
                                <p className="text-lg font-medium text-slate-300 italic leading-relaxed">
                                    "{team.mission_objective || "No primary objective set for this operation."}"
                                </p>
                            </div>
                        )}
                    </section>

                    {/* GitHub Repository Link Section */}
                    <section className="p-8 rounded-[2.5rem] bg-card/40 border border-border/50 backdrop-blur-md relative overflow-hidden group">
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
                                    <p className="text-xs text-slate-400">Manage connected GitHub repositories.</p>
                                </div>
                            </div>
                            <Button
                                onClick={onNavigateToCodebase}
                                className="rounded-2xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-400 hover:text-foreground px-6 font-black uppercase text-[10px] tracking-widest h-10 transition-all"
                            >
                                Manage Repositories
                            </Button>
                        </div>
                    </section>


                    {/* Member Management Section */}
                    <section className="p-8 rounded-[2.5rem] bg-card/40 border border-border/50 backdrop-blur-md">
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
                            {team.currentMembers.map((member: any) => (
                                <div key={member.id} className="p-4 rounded-[2rem] bg-secondary/50 border border-white/5 flex items-center gap-4 group hover:border-blue-500/30 transition-all duration-300 py-6 px-6">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-border/50 ring-1 ring-white/5 group-hover:ring-blue-500/50 transition-all">
                                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                        </div>
                                        {member.online && (
                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-black text-foreground uppercase tracking-tight mb-0.5">{member.name}</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{member.member_role || member.role}</div>
                                    </div>
                                    {isLeader && member.id !== user?.id && (
                                        <button
                                            onClick={() => removeMember(team.id, member.id)}
                                            className="p-3 rounded-2xl bg-white/5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
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
                    <section className="p-8 rounded-[2.5rem] bg-card/40 border border-border/50 backdrop-blur-md">
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
                                <div key={setting.key} className="p-5 rounded-[1.5rem] bg-secondary/50 border border-white/5 flex items-start gap-4">
                                    <div className="flex-1">
                                        <div className="text-[11px] font-black text-foreground uppercase tracking-widest mb-1">{setting.label}</div>
                                        <p className="text-[10px] text-slate-500 leading-tight pr-4 font-medium">{setting.desc}</p>
                                    </div>
                                    <button
                                        disabled={!isLeader}
                                        onClick={() => toggleSetting(setting.key)}
                                        className={`w-10 h-6 rounded-full relative transition-all duration-300 ${team.settings?.[setting.key as keyof typeof team.settings] ? "bg-blue-600" : "bg-slate-800"
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
                            <div className="flex items-center justify-between bg-secondary/80 rounded-2xl px-5 py-4 border border-white/5 group cursor-pointer active:scale-95 transition-all">
                                <span className="text-xl font-black text-foreground tracking-[0.4em] translate-x-1">{team.invite_code || "N/A"}</span>
                                <Activity className="w-4 h-4 text-blue-500 group-hover:animate-pulse" />
                            </div>
                            <p className="text-[9px] text-slate-600 mt-4 uppercase font-bold tracking-widest text-center">Share this uplink code to authorize new squadron members.</p>
                        </div>
                    </section>

                    {/* Audit Log / Pulse Section */}
                    <section className="p-8 rounded-[2.5rem] bg-card/40 border border-border/50 backdrop-blur-md flex-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-amber-600/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Audit Pulse</h3>
                        </div>

                        <div className="space-y-6 max-h-[300px] overflow-y-auto scrollbar-hide">
                            {(team.history || []).map((item: any) => (
                                <div key={item.id} className="relative pl-6 before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-blue-500 before:shadow-[0_0_8px_rgba(59,130,246,0.6)] border-l border-white/5 pb-2 ml-1">
                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-tight">{item.action}</div>
                                    <div className="flex items-center gap-2 text-[9px] text-slate-500 uppercase font-medium mt-0.5">
                                        <span className="text-blue-500/70 font-black">{item.user}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-800" />
                                        <span>{item.time}</span>
                                    </div>
                                    {item.details && (
                                        <div className="mt-2 text-[10px] text-slate-600 italic bg-white/5 rounded-xl px-3 py-1.5 border border-white/5">{item.details}</div>
                                    )}
                                </div>
                            ))}
                            {(team.history || []).length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-700 opacity-30">
                                    <Activity className="w-8 h-8 mb-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">No pulse detected</span>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
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
        <div className="h-full flex flex-col bg-[#020617] p-8 overflow-hidden relative">
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
                            <Target className="w-16 h-16 mb-4 text-slate-600" />
                            <span className="text-xs font-black uppercase tracking-widest text-slate-600">No_Active_Missions</span>
                        </motion.div>
                    ) : (
                        teamBounties.map((bounty, i) => (
                            <motion.div
                                key={bounty.id}
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ scale: 1.01, borderColor: 'rgba(99, 102, 241, 0.3)' }}
                                className="p-6 rounded-[2rem] bg-card/40 border border-border/50 backdrop-blur-sm group transition-all flex items-center justify-between"
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
                                            <Badge variant="outline" className="text-[8px] uppercase border-border/50 text-slate-500 pointer-events-none">{bounty.difficulty}</Badge>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium max-w-sm">{bounty.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Status</div>
                                    <div className={cn(
                                        "text-xs font-black uppercase tracking-widest",
                                        bounty.status === 'completed' ? "text-green-500" : "text-indigo-400 animate-pulse"
                                    )}>
                                        {bounty.status === 'in_progress' ? 'Running_Op' : bounty.status.toUpperCase()}
                                    </div>
                                    <div className="text-[10px] font-black text-slate-700 mt-2">+{bounty.reward_xp} XP</div>
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
                    <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase mb-2">
                        <span>XP Progress</span>
                        <span>{totalXP} / {nextLevelXP}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
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
    const [history, setHistory] = useState<string[]>([
        "HACKMATE CORE KERNEL v4.2.0-STABLE",
        "UPLINK ESTABLISHED WITH SQUADRON NODE...",
        "HANDSHAKE COMPLETE. SECURE CHANNEL OPEN.",
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

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const cmd = input.trim().toLowerCase();
        const newHistory = [...history, `> ${input}`];

        switch (cmd) {
            case 'help':
                newHistory.push(
                    "AVAILABLE COMMANDS:",
                    "  STATUS    - Output mission operational status",
                    "  MISSION   - Detailed mission deployment data",
                    "  SQUAD     - List all authenticated operatives",
                    "  NETWORK   - Display squadron network telemetry",
                    "  AUTH      - Show current authorization level",
                    "  INTEL     - Display archive metadata",
                    "  CLEAR     - Wipe terminal buffer",
                    "  SYSTEM    - Display OS environment data",
                    "  OBJECTIVE - Print current mission objective",
                    "  SCAN      - Perform sector security scan"
                );
                break;
            case 'status':
                newHistory.push(
                    `MISSION: ${team.name.toUpperCase()}`,
                    `PROGRESS: [${'#'.repeat(Math.floor(team.progress / 5))}${' '.repeat(20 - Math.floor(team.progress / 5))}] ${team.progress}%`,
                    `TASKS: ${team.tasks?.length || 0} ACTIVE`,
                    "STATUS: PEAK OPERATIONAL"
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
            default:
                newHistory.push(`ERR: COMMAND '${cmd}' NOT RECOGNIZED. ATTEMPTING TO LOG INCIDENT...`);
        }

        newHistory.push("");
        // Limit history size
        const finalHistory = newHistory.length > 50 ? newHistory.slice(newHistory.length - 50) : newHistory;
        setHistory(finalHistory);
        setInput("");
    };

    return (
        <div className="h-full bg-black p-8 font-mono text-emerald-500 overflow-hidden flex flex-col relative border border-white/5 rounded-[2rem] shadow-2xl">
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
    const { updateTeamDeadline, deleteTeam, user } = useAppContext();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showDeadlineModal, setShowDeadlineModal] = useState(false);
    const [showAbortModal, setShowAbortModal] = useState(false);
    const [deadlineInput, setDeadlineInput] = useState("");

    useEffect(() => {
        if (team.deadline) {
            // Format for datetime-local: YYYY-MM-DDThh:mm
            const date = new Date(team.deadline);
            const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
            setDeadlineInput(localDate.toISOString().slice(0, 16));
        }
    }, [team.deadline, showDeadlineModal]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Robust leader check: check if user is in memberships and has 'Leader' role
    const isLeader = team.currentMembers.some((m: any) => m.id === user?.id && m.role === 'Leader');
    const deadlineDate = team.deadline ? new Date(team.deadline) : null;
    const isOvertime = deadlineDate ? currentTime > deadlineDate : false;

    const getTimeRemaining = () => {
        if (!deadlineDate) return null;
        const diff = Math.abs(deadlineDate.getTime() - currentTime.getTime());
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        return { days, hours, mins, secs };
    };

    const remaining = getTimeRemaining();

    const handleSetDeadline = (e: React.FormEvent) => {
        e.preventDefault();
        if (!deadlineInput) return;
        // Convert local datetime-local value to ISO string for storage
        const selectedDate = new Date(deadlineInput);
        updateTeamDeadline(team.id, selectedDate.toISOString());
        setShowDeadlineModal(false);
    };

    const handleReset = () => {
        if (window.confirm("ARE YOU SURE YOU WANT TO ABORT THE MISSION TIMELINE?")) {
            updateTeamDeadline(team.id, null);
        }
    };

    return (
        <div className="flex items-center gap-6 px-6 py-3 bg-card/40 border-b border-border/50 backdrop-blur-xl relative z-30 min-h-[64px]">
            {/* Real-time Clock */}
            <div className="flex flex-col border-r border-border pr-6">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">System Time</span>
                <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                </span>
            </div>

            {/* Mission Countdown */}
            <div className="flex-1 flex items-center gap-8">
                {deadlineDate ? (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className={cn(
                                "w-1.5 h-1.5 rounded-full shadow-[0_0_8px]",
                                isOvertime ? "bg-rose-500 shadow-rose-500/50 animate-pulse" : "bg-blue-500 shadow-blue-500/50"
                            )} />
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-[0.2em]",
                                isOvertime ? "text-rose-500 animate-pulse" : "text-blue-500"
                            )}>
                                {isOvertime ? "Mission_Overtime" : "Time_Remaining"}
                            </span>
                        </div>
                        <div className="flex items-baseline gap-3">
                            <span className={cn(
                                "text-2xl font-black font-mono tracking-tighter tabular-nums",
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
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                Deadline: {deadlineDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-0.5">Status</span>
                        <div className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Shield className="w-3 h-3 opacity-30" />
                            Mission_Timeline_Not_Synchronized
                        </div>
                    </div>
                )}
            </div>

            {/* Leader Controls */}
            {isLeader && (
                <div className="flex gap-2">
                    <Button
                        onClick={() => setShowDeadlineModal(true)}
                        size="sm"
                        variant="ghost"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest border border-white/5 bg-white/5 hover:bg-white/10 text-slate-300 transition-all rounded-xl"
                    >
                        {deadlineDate ? "Adjust Timeline" : "Set Deadline"}
                    </Button>
                    {deadlineDate && (
                        <Button
                            onClick={handleReset}
                            size="sm"
                            variant="ghost"
                            className="h-9 px-4 text-[10px] font-black uppercase tracking-widest border border-rose-500/20 hover:bg-rose-500/10 text-rose-500/60 rounded-xl"
                        >
                            Reset
                        </Button>
                    )}
                    <Button
                        onClick={() => setShowAbortModal(true)}
                        size="sm"
                        variant="ghost"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest border border-rose-500 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-foreground transition-all rounded-xl"
                    >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Abort Mission
                    </Button>
                </div>
            )}

            {/* Abort Mission Modal */}
            <AnimatePresence>
                {showAbortModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAbortModal(false)}
                            className="absolute inset-0 bg-rose-950/20 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-slate-900 border border-rose-500/50 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(244,63,94,0.3)] relative z-10"
                        >
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center border-2 border-rose-500 animate-pulse">
                                    <AlertTriangle className="w-10 h-10 text-rose-500" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none mb-2">Critical Alpha Alert</h2>
                                    <p className="text-sm text-rose-400 font-bold uppercase tracking-widest animate-pulse">Confirm Mission Abortion</p>
                                </div>
                                <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-xs text-slate-400 font-mono leading-relaxed">
                                    WARNING: This action will permanently purge squadron <span className="text-rose-400 font-bold">"{team.name}"</span> and all associated tactical data (tasks, communications, archives). This cannot be reversed.
                                </div>
                                <div className="flex gap-4 w-full">
                                    <Button
                                        onClick={() => setShowAbortModal(false)}
                                        className="flex-1 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-foreground font-bold uppercase tracking-widest text-[10px]"
                                    >
                                        Cancel Protocol
                                    </Button>
                                    <Button
                                        onClick={async () => {
                                            const success = await deleteTeam(team.id);
                                            if (success) {
                                                setShowAbortModal(false);
                                                navigate('/dashboard');
                                            }
                                        }}
                                        className="flex-1 h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-foreground font-bold uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                                    >
                                        Execute Purge
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Deadline Modal */}
            <AnimatePresence>
                {showDeadlineModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeadlineModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-slate-900 border border-border/50 rounded-[2.5rem] p-8 shadow-2xl relative z-10"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">Mission Timeline</h2>
                                    <p className="text-xs text-slate-500 font-medium">Define the operational window for this sector.</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setShowDeadlineModal(false)} className="rounded-2xl bg-white/5 hover:bg-white/10">
                                    <X className="w-5 h-5 text-slate-500" />
                                </Button>
                            </div>

                            <form onSubmit={handleSetDeadline} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <Zap className="w-3 h-3 text-blue-500" />
                                        Target Timestamp (UTC)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={deadlineInput}
                                        onChange={(e) => setDeadlineInput(e.target.value)}
                                        className="w-full bg-secondary border border-border/50 rounded-2xl p-5 text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-center shadow-inner"
                                    />
                                    <p className="text-[10px] text-slate-600 text-center font-bold uppercase tracking-widest mt-2 px-4">
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
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] text-slate-400 p-4">
                <Activity className="w-12 h-12 text-blue-500/20 mb-4 animate-pulse" />
                <h2 className="text-xl font-bold text-foreground mb-2 uppercase tracking-widest">Uplink Lost</h2>
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
        { id: "console", name: "Console", icon: Activity, color: "text-slate-400" },
    ];

    return (
        <div className="flex h-screen bg-background overflow-hidden relative">
            {/* Workspace Sidebar */}
            <aside className="w-64 border-r border-border/50 bg-card/50 backdrop-blur-xl flex flex-col">
                <div className="p-4 border-b border-border/50">
                    <button
                        onClick={() => navigate("/workspace")}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-foreground hover:bg-white/5 transition-all group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Sector</span>
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20`}>
                            <Zap className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-foreground uppercase tracking-tighter truncate w-32">
                                {team.name}
                            </h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Operational</span>
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
                                        : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? tab.color : "text-slate-500 group-hover:text-slate-300"}`} />
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
                        <div className="text-[10px] text-slate-500 leading-tight">
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
