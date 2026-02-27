import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { Button } from "./ui/button";
import { cn } from "./ui/button";
import {
    X, Zap, Target, Shield, CheckCircle2, Circle, Plus, Trash2,
    Calendar, Clock, User, AlertTriangle, ChevronRight, Flag,
    Eye, Edit3, Save, Users
} from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ConfirmDialog } from "./ui/ConfirmDialog";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Subtask {
    id: string;
    title: string;
    done: boolean;
}

interface TaskDetailPanelProps {
    task: any;
    team: any;
    onClose: () => void;
}

// ─── Deadline urgency helper ──────────────────────────────────────────────────
function getDeadlineUrgency(deadline?: string) {
    if (!deadline) return null;
    const now = Date.now();
    const dl = new Date(deadline).getTime();
    const diff = dl - now;
    if (diff < 0) return "overdue";
    if (diff < 24 * 60 * 60 * 1000) return "critical";
    if (diff < 3 * 24 * 60 * 60 * 1000) return "warning";
    return "ok";
}

const urgencyConfig = {
    overdue: { label: "OVERDUE", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30", dot: "bg-rose-500" },
    critical: { label: "DUE <24H", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", dot: "bg-amber-500" },
    warning: { label: "DUE SOON", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", dot: "bg-yellow-500" },
    ok: { label: "ON TRACK", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-500" },
};

const priorityConfig: Record<string, { color: string; label: string }> = {
    urgent: { color: "text-rose-500", label: "CRITICAL" },
    high: { color: "text-amber-500", label: "HIGH" },
    medium: { color: "text-blue-400", label: "STANDARD" },
    low: { color: "text-muted-foreground", label: "LOW" },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({ task, team, onClose }) => {
    const { user, updateTask, deleteTask, sendTaskForReview, updateSubtask } = useAppContext();

    const isLeader = team.currentMembers.some((m: any) => m.id === user?.id && m.role === 'Leader');
    const isAssignee = task.assignee_id === user?.id;
    const canEdit = isLeader || isAssignee;

    // ─── Local state ──────────────────────────────────────────────────────────
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(task.title || "");
    const [description, setDescription] = useState(task.description || "");
    const [priority, setPriority] = useState(task.priority || "medium");
    const [deadline, setDeadline] = useState(() => {
        if (!task.deadline) return "";
        const d = new Date(task.deadline);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    });
    const [estimatedHours, setEstimatedHours] = useState(task.estimated_hours || "");
    const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
    const [newSubtask, setNewSubtask] = useState("");
    const [showReviewPicker, setShowReviewPicker] = useState(false);
    const [reviewerId, setReviewerId] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const titleRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (isEditingTitle) titleRef.current?.focus(); }, [isEditingTitle]);
    useEffect(() => { setIsDirty(true); }, [title, description, priority, deadline, estimatedHours]);

    const urgency = getDeadlineUrgency(task.deadline);
    const urgencyStyle = urgency ? urgencyConfig[urgency] : null;
    const completedSubtasks = subtasks.filter(s => s.done).length;

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!canEdit) return;
        setIsSaving(true);
        const deadlineISO = deadline ? new Date(deadline).toISOString() : null;
        await updateTask(task.id, {
            title,
            description,
            priority,
            deadline: deadlineISO as any,
            estimated_hours: estimatedHours || null,
            subtasks,
        } as any);
        setIsDirty(false);
        setIsSaving(false);
    };

    const handleSubtaskToggle = async (subtaskId: string, done: boolean) => {
        if (!canEdit) return;
        const updated = subtasks.map(s => s.id === subtaskId ? { ...s, done } : s);
        setSubtasks(updated);
        await updateSubtask(task.id, subtaskId, done);
    };

    const handleAddSubtask = () => {
        if (!newSubtask.trim() || !canEdit) return;
        const newItem: Subtask = { id: crypto.randomUUID(), title: newSubtask.trim(), done: false };
        const updated = [...subtasks, newItem];
        setSubtasks(updated);
        setNewSubtask("");
        updateTask(task.id, { subtasks: updated } as any);
    };

    const handleRemoveSubtask = (id: string) => {
        if (!canEdit) return;
        const updated = subtasks.filter(s => s.id !== id);
        setSubtasks(updated);
        updateTask(task.id, { subtasks: updated } as any);
    };

    const handleSendForReview = async () => {
        if (!reviewerId) { toast.error("Select a reviewer first."); return; }
        await sendTaskForReview(task.id, reviewerId);
        setShowReviewPicker(false);
        onClose();
    };

    const handleDelete = async () => {
        if (!isLeader) return;
        await deleteTask(task.id);
        onClose();
    };

    return (
        <>
            <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 right-0 z-[80] w-full max-w-[480px] bg-card border-l border-border/40 shadow-[-40px_0_80px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
            >
                {/* ─── Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border/30 bg-card/80 backdrop-blur-xl shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px]", {
                            "bg-rose-500 shadow-rose-500/60 animate-pulse": task.priority === "urgent",
                            "bg-amber-500 shadow-amber-500/60": task.priority === "high",
                            "bg-blue-500 shadow-blue-500/60": task.priority === "medium",
                            "bg-slate-600": task.priority === "low",
                        })} />
                        <span className={cn("text-[10px] font-black uppercase tracking-[0.25em]", priorityConfig[task.priority]?.color)}>
                            {priorityConfig[task.priority]?.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isDirty && canEdit && (
                            <Button size="sm" onClick={handleSave} disabled={isSaving}
                                className="h-8 px-4 text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
                                <Save className="w-3 h-3 mr-1.5" />
                                {isSaving ? "Saving..." : "Save"}
                            </Button>
                        )}
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ─── Scrollable body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">

                    {/* Title */}
                    <div className="px-6 pt-6 pb-4">
                        {isEditingTitle && canEdit ? (
                            <input
                                ref={titleRef}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                onBlur={() => setIsEditingTitle(false)}
                                onKeyDown={e => e.key === "Enter" && setIsEditingTitle(false)}
                                className="w-full text-2xl font-black text-foreground bg-muted/30 border border-blue-500/40 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            />
                        ) : (
                            <div className="flex items-start gap-2 group/title">
                                <h2 className="text-2xl font-black text-foreground tracking-tight leading-tight flex-1">
                                    {title}
                                </h2>
                                {canEdit && (
                                    <button onClick={() => setIsEditingTitle(true)}
                                        className="opacity-0 group-hover/title:opacity-100 transition-opacity p-1 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-blue-400 mt-1 shrink-0">
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Meta row */}
                    <div className="px-6 pb-5 flex flex-wrap gap-3">
                        {/* Assignee */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30 border border-border/40">
                            {task.assignee?.avatar ? (
                                <img src={task.assignee.avatar} alt={task.assignee.name} className="w-5 h-5 rounded-full" />
                            ) : (
                                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                            <span className="text-[11px] font-bold text-foreground/80">
                                {task.assignee?.name || "Unassigned"}
                            </span>
                        </div>

                        {/* Deadline */}
                        {urgencyStyle && (
                            <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl border", urgencyStyle.bg)}>
                                <span className={cn("w-1.5 h-1.5 rounded-full", urgencyStyle.dot)} />
                                <span className={cn("text-[11px] font-black uppercase tracking-widest", urgencyStyle.color)}>
                                    {urgencyStyle.label}
                                </span>
                            </div>
                        )}

                        {/* Status chip */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30 border border-border/40">
                            <Target className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[11px] font-bold text-foreground/80 uppercase">{task.status?.replace("_", " ")}</span>
                        </div>
                    </div>

                    <div className="px-6 space-y-5 pb-8">
                        {/* Description */}
                        <section>
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Mission Brief</label>
                            {canEdit ? (
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Describe tactical objectives..."
                                    rows={4}
                                    className="w-full bg-muted/20 border border-border/40 rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none leading-relaxed transition-all"
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground leading-relaxed bg-muted/10 rounded-2xl px-4 py-3 border border-border/30">
                                    {description || <span className="italic opacity-50">No description.</span>}
                                </p>
                            )}
                        </section>

                        {/* Priority + Deadline + Estimated Hours */}
                        {canEdit && (
                            <section className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Priority</label>
                                    <Select value={priority} onValueChange={setPriority}>
                                        <SelectTrigger className="bg-muted/20 border-border/40 rounded-xl h-10 text-xs font-bold uppercase">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="urgent">🔴 Critical</SelectItem>
                                            <SelectItem value="high">🟠 High</SelectItem>
                                            <SelectItem value="medium">🔵 Standard</SelectItem>
                                            <SelectItem value="low">⚪ Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Est. Hours</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="e.g. 4"
                                        value={estimatedHours}
                                        onChange={e => setEstimatedHours(e.target.value)}
                                        className="w-full bg-muted/20 border border-border/40 rounded-xl h-10 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-blue-500" /> Task Deadline
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={deadline}
                                        onChange={e => setDeadline(e.target.value)}
                                        className="w-full bg-muted/20 border border-border/40 rounded-xl h-10 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-mono"
                                    />
                                </div>
                            </section>
                        )}

                        {/* Sub-tasks */}
                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-blue-500" /> Sub-Tasks
                                    {subtasks.length > 0 && (
                                        <span className="text-blue-400">({completedSubtasks}/{subtasks.length})</span>
                                    )}
                                </label>
                            </div>

                            {/* Progress bar */}
                            {subtasks.length > 0 && (
                                <div className="h-1.5 bg-muted/30 rounded-full mb-4 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-blue-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(completedSubtasks / subtasks.length) * 100}%` }}
                                        transition={{ type: "spring", damping: 20 }}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                {subtasks.map(st => (
                                    <div key={st.id} className="flex items-center gap-3 group/st p-2 rounded-xl hover:bg-muted/20 transition-all">
                                        <button
                                            onClick={() => handleSubtaskToggle(st.id, !st.done)}
                                            disabled={!canEdit}
                                            className="shrink-0 text-muted-foreground hover:text-blue-400 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {st.done ? (
                                                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                            ) : (
                                                <Circle className="w-4 h-4" />
                                            )}
                                        </button>
                                        <span className={cn("flex-1 text-sm", st.done ? "line-through text-muted-foreground/50" : "text-foreground/80")}>
                                            {st.title}
                                        </span>
                                        {canEdit && (
                                            <button onClick={() => handleRemoveSubtask(st.id)}
                                                className="opacity-0 group-hover/st:opacity-100 p-1 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-all">
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {canEdit && (
                                <div className="flex gap-2 mt-3">
                                    <input
                                        value={newSubtask}
                                        onChange={e => setNewSubtask(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleAddSubtask()}
                                        placeholder="Add sub-task..."
                                        className="flex-1 bg-muted/20 border border-border/40 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                    />
                                    <button onClick={handleAddSubtask}
                                        className="p-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 transition-all">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* ─── Review Workflow (Leader only) */}
                        {isLeader && task.status !== "done" && (
                            <section>
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Eye className="w-3 h-3 text-amber-500" /> Send for Review
                                </label>
                                {!showReviewPicker ? (
                                    <Button
                                        onClick={() => setShowReviewPicker(true)}
                                        className="w-full h-10 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-black uppercase tracking-widest text-[10px]"
                                    >
                                        <Eye className="w-3.5 h-3.5 mr-2" /> Assign Reviewer
                                    </Button>
                                ) : (
                                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                                        <Select value={reviewerId} onValueChange={setReviewerId}>
                                            <SelectTrigger className="bg-muted/20 border-border/40 rounded-xl h-10 text-xs font-bold">
                                                <SelectValue placeholder="Select reviewer..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {team.currentMembers
                                                    .filter((m: any) => m.id !== task.assignee_id)
                                                    .map((m: any) => (
                                                        <SelectItem key={m.id} value={m.id}>
                                                            <div className="flex items-center gap-2">
                                                                {m.avatar && <img src={m.avatar} className="w-5 h-5 rounded-full" alt={m.name} />}
                                                                {m.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="flex gap-2">
                                            <Button onClick={() => setShowReviewPicker(false)} variant="ghost"
                                                className="flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest">Cancel</Button>
                                            <Button onClick={handleSendForReview}
                                                className="flex-1 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-[10px]">
                                                Send
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* ─── Danger Zone (Leader only) */}
                        {isLeader && (
                            <section>
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3 text-rose-500" /> Danger Zone
                                </label>
                                <Button onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-black uppercase tracking-widest text-[10px]">
                                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Task
                                </Button>
                            </section>
                        )}
                    </div>
                </div>
            </motion.div>
            <ConfirmDialog
                open={showDeleteConfirm}
                title="Delete Task"
                message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                onConfirm={() => { setShowDeleteConfirm(false); handleDelete(); }}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </>
    );
};
