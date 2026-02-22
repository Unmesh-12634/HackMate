import React, { useState } from "react";
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
    Lock,
    ChevronLeft,
    X,
    Users,
    Plus,
    Send
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useAppContext } from "../context/AppContext";

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
            className={`group relative p-4 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-blue-500/30 transition-all duration-300 mb-3 shadow-lg shadow-black/20 ${isDragging ? "opacity-40 scale-95" : "opacity-100"
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

            <h4 className="text-sm font-bold text-slate-100 mb-1 group-hover:text-blue-400 transition-colors">
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
                        <div className="w-6 h-6 rounded-full ring-2 ring-slate-950 bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden group/avatar">
                            <img src={task.assignee.avatar} alt={task.assignee.name} className="w-full h-full object-cover" />
                            <div className="absolute hidden group-hover/avatar:block bottom-full mb-2 px-2 py-1 bg-slate-900 border border-white/10 rounded text-[10px] text-white whitespace-nowrap z-50">
                                {task.assignee.name}
                            </div>
                        </div>
                    ) : (
                        <div className="w-6 h-6 rounded-full ring-2 ring-slate-950 bg-slate-900 border border-white/5 flex items-center justify-center">
                            <Users className="w-3 h-3 text-slate-600" />
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
            className={`flex flex-col w-80 min-w-[320px] rounded-3xl bg-slate-950/30 border border-white/5 p-4 transition-colors duration-300 ${isOver ? "bg-blue-500/5 border-blue-500/20" : ""
                }`}
        >
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center border border-white/5">
                        {statusIcons[status as keyof typeof statusIcons]}
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">{title}</h3>
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
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Tactical Board</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => handleAddTask()}
                            className="rounded-2xl bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-600/20 font-black uppercase tracking-widest text-[10px] h-10 px-6"
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
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
                            >
                                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">New Tactical Deployment</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Deploy Task</h3>
                                    </div>
                                    <button
                                        onClick={() => setIsAddingTask(false)}
                                        className="p-3 rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all"
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
    const { user, teamMessages, fetchTeamMessages, sendTeamMessage } = useAppContext();
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

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        sendTeamMessage(team.id, message.trim());
        setMessage("");
    };

    return (
        <div className="h-full flex flex-col bg-slate-950/20">
            <header className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/40 backdrop-blur-md">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Encrypted Tactical Channel</span>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Comms Link</h2>
                </div>
                <div className="flex -space-x-3">
                    {team.currentMembers.map((m: any) => (
                        <div key={m.id} className="w-10 h-10 rounded-2xl border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden ring-1 ring-white/10 group relative">
                            <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                            <div className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 border border-white/10 rounded text-[10px] text-white whitespace-nowrap z-50">
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
                        <div className="w-16 h-16 rounded-full border border-dashed border-white/10 flex items-center justify-center">
                            <MessageSquare className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30">No active transmissions in this sector.</p>
                    </div>
                )}

                {teamMessages.map((msg: any) => {
                    const isMe = msg.author_id === user?.id;
                    return (
                        <div key={msg.id} className={`flex items-end gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 overflow-hidden flex-shrink-0">
                                <img src={msg.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user}`} alt="" />
                            </div>
                            <div className={`max-w-[70%] group`}>
                                <div className={`flex items-center gap-2 mb-1 px-1 ${isMe ? "flex-row-reverse" : ""}`}>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{msg.user}</span>
                                    <span className="text-[9px] font-medium text-slate-600 uppercase">{msg.time}</span>
                                </div>
                                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed transition-all shadow-lg ${isMe
                                    ? "bg-blue-600 text-white rounded-br-none shadow-blue-500/10"
                                    : "bg-white/5 text-slate-200 border border-white/5 rounded-bl-none shadow-black/20"
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
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-16 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all group-hover:bg-white/10"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all flex items-center justify-center shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};
const IntelArchives: React.FC<{ team: any }> = ({ team }) => {
    const { documents, addDocument, updateDocument } = useAppContext();
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newDocTitle, setNewDocTitle] = useState("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const selectedDoc = documents.find(d => d.id === selectedDocId);

    const handleCreate = () => {
        if (!newDocTitle.trim()) return;
        addDocument({ title: newDocTitle, content: "", type: "markdown" });
        setNewDocTitle("");
        setIsCreating(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Supported: PDF, JPG, PNG, PPTX, DOCX
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pptx|docx)$/i)) {
            // Basic fallback for types that might not have standard mime types in all browsers
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (!['pdf', 'jpg', 'jpeg', 'png', 'pptx', 'docx'].includes(ext || '')) {
                alert("ERR: PROTOCOL MISMATCH. ONLY PDF, JPG, PNG, PPTX, DOCX ALLOWED.");
                return;
            }
        }

        addDocument({
            title: file.name,
            content: `Uploaded file: ${file.name}`,
            type: "file"
        }, file);
    };

    return (
        <div className="h-full flex bg-[#020617]">
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png,.pptx,.docx"
            />

            {/* Doc List Sidebar */}
            <aside className="w-80 border-r border-white/5 flex flex-col bg-slate-900/20">
                <header className="p-6 border-b border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Document Vault</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-1.5 rounded-lg bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 transition-all"
                                title="Upload Asset"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="p-1.5 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 transition-all"
                                title="New Document"
                            >
                                <FileText className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    {isCreating && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2 mb-4"
                        >
                            <input
                                autoFocus
                                value={newDocTitle}
                                onChange={(e) => setNewDocTitle(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                                placeholder="Doc Title..."
                                className="w-full bg-slate-950 border border-blue-500/30 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleCreate} size="sm" className="flex-1 h-8 rounded-lg text-[10px] font-bold uppercase">Confirm</Button>
                                <Button onClick={() => setIsCreating(false)} size="sm" variant="ghost" className="flex-1 h-8 rounded-lg text-[10px] font-bold uppercase">Cancel</Button>
                            </div>
                        </motion.div>
                    )}

                    <div className="relative">
                        <input
                            placeholder="Search intel..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                    {documents.map((doc) => (
                        <button
                            key={doc.id}
                            onClick={() => setSelectedDocId(doc.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${selectedDocId === doc.id
                                ? "bg-blue-600/10 border border-blue-500/20"
                                : "border border-transparent hover:bg-white/5"
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 ${selectedDocId === doc.id ? "bg-blue-500/20 text-blue-400" : "bg-slate-900 text-slate-500 group-hover:text-slate-300"
                                }`}>
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="text-left overflow-hidden">
                                <div className={`text-sm font-bold truncate ${selectedDocId === doc.id ? "text-blue-400" : "text-slate-200"}`}>
                                    {doc.title}
                                </div>
                                <div className="text-[10px] text-slate-500 uppercase font-black">
                                    Updated {new Date(doc.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                            {doc.url && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
                        </button>
                    ))}

                    {documents.length === 0 && (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-600 space-y-4 px-8 text-center">
                            <div className="w-12 h-12 rounded-full border border-dashed border-white/10 flex items-center justify-center">
                                <FileText className="w-6 h-6 opacity-20" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">Archive data currently unavailable.</p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content / Editor */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#020617]">
                {selectedDoc ? (
                    <>
                        <header className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">{selectedDoc.title}</h2>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        <span>Markdown Asset</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                        <span>Last Edit: {new Date(selectedDoc.updatedAt).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedDoc.url && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl border-white/10 hover:bg-white/5 h-9"
                                        onClick={() => window.open(selectedDoc.url, '_blank')}
                                    >
                                        View Asset
                                    </Button>
                                )}
                                <Button size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-500 h-9 px-6 font-bold uppercase tracking-widest text-[10px]">
                                    Sync Changes
                                </Button>
                            </div>
                        </header>
                        <div className="flex-1 p-8">
                            <textarea
                                value={selectedDoc.content}
                                onChange={(e) => updateDocument(selectedDoc.id, e.target.value)}
                                className="w-full h-full bg-transparent text-slate-300 font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder:text-slate-800"
                                placeholder="# Start documenting mission intel..."
                            />
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
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Squad Intel</h2>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 backdrop-blur-sm group hover:border-blue-500/20 transition-all"
                    >
                        <div className={`p-3 rounded-2xl bg-slate-950 w-fit mb-4 border border-white/5 ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
                        <div className="text-2xl font-black text-white uppercase tracking-tighter">{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Chart */}
                <div className="lg:col-span-2 p-8 rounded-[2rem] bg-slate-900/40 border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Productivity Pulse</h3>
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
                <div className="p-8 rounded-[2rem] bg-slate-900/40 border border-white/5 backdrop-blur-sm">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8">Sector Deployment</h3>
                    <div className="space-y-6">
                        {["Design", "Backend", "Frontend", "Research"].map((label, i) => {
                            const progress = Math.floor(Math.random() * 60) + 20;
                            const colors = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500"];
                            return (
                                <div key={label}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                                        <span className="text-[10px] font-black text-white">{progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
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

                    <div className="mt-12 p-6 rounded-3xl bg-slate-950/50 border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency Rating</div>
                                <div className="text-lg font-black text-white uppercase tracking-tighter">Peak Operational</div>
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
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Command Center</h2>
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
                    <section className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap className="w-32 h-32 text-blue-500" />
                        </div>

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/5">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Main Mission Objective</h3>
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
                                    className="w-full bg-slate-950/50 border border-blue-500/30 rounded-[2rem] p-6 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[120px] resize-none"
                                    placeholder="Define the primary objective for this squadron..."
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleObjectiveSave} className="rounded-2xl bg-blue-600 hover:bg-blue-500 text-white px-8 font-black uppercase text-[10px] tracking-widest h-11">Sync Objective</Button>
                                    <Button onClick={() => setEditingObjective(false)} variant="ghost" className="rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 font-black uppercase text-[10px] tracking-widest h-11 px-8">Abord</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 rounded-[2rem] bg-slate-950/50 border border-white/5 relative z-10">
                                <p className="text-lg font-medium text-slate-300 italic leading-relaxed">
                                    "{team.mission_objective || "No primary objective set for this operation."}"
                                </p>
                            </div>
                        )}
                    </section>

                    {/* GitHub Repository Link Section */}
                    <section className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Activity className="w-32 h-32 text-emerald-500" />
                        </div>

                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                    <Terminal className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-1">Source Code Repositories</h3>
                                    <p className="text-xs text-slate-400">Manage connected GitHub repositories.</p>
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


                    {/* Member Management Section */}
                    <section className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                    <Users className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Active Squadron</h3>
                            </div>
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 uppercase text-[10px]">{team.currentMembers.length} Operatives</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {team.currentMembers.map((member: any) => (
                                <div key={member.id} className="p-4 rounded-[2rem] bg-slate-950/50 border border-white/5 flex items-center gap-4 group hover:border-blue-500/30 transition-all duration-300 py-6 px-6">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/10 ring-1 ring-white/5 group-hover:ring-blue-500/50 transition-all">
                                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                        </div>
                                        {member.online && (
                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-black text-white uppercase tracking-tight mb-0.5">{member.name}</div>
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
                    <section className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                                <Settings className="w-5 h-5" />
                            </div>
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Operational Protocols</h3>
                        </div>

                        <div className="space-y-4">
                            {[
                                { key: "allow_task_creation", label: "Permission: Global Deployment", desc: "Allow all squadron members to deploy new tasks." },
                                { key: "allow_invites", label: "Permission: Uplink Requests", desc: "Enable squadron members to invite more operatives." },
                            ].map((setting) => (
                                <div key={setting.key} className="p-5 rounded-[1.5rem] bg-slate-950/50 border border-white/5 flex items-start gap-4">
                                    <div className="flex-1">
                                        <div className="text-[11px] font-black text-slate-200 uppercase tracking-widest mb-1">{setting.label}</div>
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
                            <div className="flex items-center justify-between bg-slate-950/80 rounded-2xl px-5 py-4 border border-white/5 group cursor-pointer active:scale-95 transition-all">
                                <span className="text-xl font-black text-white tracking-[0.4em] translate-x-1">{team.invite_code || "N/A"}</span>
                                <Activity className="w-4 h-4 text-blue-500 group-hover:animate-pulse" />
                            </div>
                            <p className="text-[9px] text-slate-600 mt-4 uppercase font-bold tracking-widest text-center">Share this uplink code to authorize new squadron members.</p>
                        </div>
                    </section>

                    {/* Audit Log / Pulse Section */}
                    <section className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-md flex-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-amber-600/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Audit Pulse</h3>
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
                    "  OBJECTIVE - Print current mission objective"
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
                    newHistory.push(`  [${m.online ? 'ONLINE' : 'OFFLINE'}] ${m.name.toUpperCase()} - ${m.role.toUpperCase()}`);
                });
                break;
            case 'objective':
                newHistory.push(`CURRENT OBJECTIVE: ${team.mission_objective || 'NONE SET'}`);
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
        setHistory(newHistory);
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
                <h2 className="text-xl font-bold text-slate-200 mb-2 uppercase tracking-widest">Uplink Lost</h2>
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
        { id: "docs", name: "Intel Archives", icon: FileText, color: "text-amber-400" },
        { id: "codebase", name: "Codebase", icon: Terminal, color: "text-emerald-500" }, // NEW Codebase Tab
        { id: "intel", name: "Squad Intel", icon: BarChart2, color: "text-purple-400" },
        { id: "management", name: "Command", icon: Shield, color: "text-rose-400" },
        { id: "console", name: "Console", icon: Activity, color: "text-slate-400" },
    ];

    return (
        <div className="flex h-screen bg-[#020617] overflow-hidden">
            {/* Workspace Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-slate-950/50 backdrop-blur-xl flex flex-col">
                <div className="p-4 border-b border-white/5">
                    <button
                        onClick={() => navigate("/workspace")}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Sector</span>
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20`}>
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-white uppercase tracking-tighter truncate w-32">
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
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
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
            <main className="flex-1 overflow-hidden relative">
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
                        {activeTab === "docs" && <IntelArchives team={team} />}
                        {activeTab === "codebase" && <CodebaseCenter team={team} />}
                        {activeTab === "intel" && <SquadIntel team={team} />}
                        {activeTab === "management" && <CommandCenter team={team} onNavigateToCodebase={() => setActiveTab("codebase")} />}
                        {activeTab === "console" && <TerminalConsole team={team} />}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};
