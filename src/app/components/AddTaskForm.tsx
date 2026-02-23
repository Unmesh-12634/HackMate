import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext, TeamMember } from "../context/AppContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { CalendarIcon, User, Tag, AlertCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { cn } from "./ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface AddTaskFormProps {
    teamId: string;
    onClose?: () => void;
    initialStatus?: "todo" | "in_progress" | "review" | "done";
}

export function AddTaskForm({ teamId, onClose, initialStatus }: AddTaskFormProps) {
    const { addTask, teams, getTaskSuggestions } = useAppContext();
    const team = teams.find(t => t.id === teamId);
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
    const [status, setStatus] = useState<"todo" | "in_progress" | "review" | "done">(initialStatus || "todo");
    const [assigneeId, setAssigneeId] = useState<string>("none");
    const [date, setDate] = useState<Date>();
    const [tags, setTags] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Task title is required");
            return;
        }

        setIsLoading(true);
        try {
            await addTask(teamId, {
                title,
                description,
                priority,
                status,
                labels: tags.split(",").map(t => t.trim()).filter(Boolean),
                assignee_id: assigneeId === "none" ? "" : assigneeId,
                members: assigneeId && assigneeId !== "none" ? [assigneeId] : [], // Legacy support
                deadline: date ? date.toISOString() : undefined
            });
            toast.success("Task Initialized");
            onClose?.();
        } catch (error) {
            console.error("Failed to add task:", error);
            toast.error("Mission Initialization Failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 text-white">
                    <AlertCircle className="w-6 h-6 text-blue-500" /> Initialize New Protocol
                </h2>
                <div className="h-0.5 w-12 bg-blue-500 mt-2" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Protocol Name</Label>
                    <Input
                        placeholder="E.G. NEURAL NETWORK UPGRADE"
                        value={title}
                        onChange={async (e) => {
                            const val = e.target.value;
                            setTitle(val);
                            if (val.length > 2) {
                                const sug = await getTaskSuggestions(val);
                                setSuggestions(sug);
                            } else {
                                setSuggestions([]);
                            }
                        }}
                        className="bg-secondary/20 border-white/5 font-bold uppercase tracking-wide placeholder:normal-case"
                    />
                    <AnimatePresence>
                        {suggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute z-50 w-full mt-1 bg-slate-900/90 border border-indigo-500/20 rounded-xl shadow-2xl shadow-indigo-500/10 overflow-hidden backdrop-blur-xl"
                            >
                                {suggestions.map((sug, i) => (
                                    <motion.button
                                        key={i}
                                        type="button"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => {
                                            setTitle(sug);
                                            setSuggestions([]);
                                        }}
                                        className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-indigo-600 hover:text-white transition-all border-b border-white/5 last:border-0 flex items-center gap-2 group"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {sug}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Mission Brief</Label>
                    <Textarea
                        placeholder="Describe tactical objectives..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-secondary/20 border-white/5 font-medium min-h-[100px]"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Priority Level</Label>
                        <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                            <SelectTrigger className="bg-secondary/20 border-white/5 font-bold uppercase">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low Priority</SelectItem>
                                <SelectItem value="medium">Standard</SelectItem>
                                <SelectItem value="high">High Priority</SelectItem>
                                <SelectItem value="urgent">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Current Status</Label>
                        <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                            <SelectTrigger className="bg-secondary/20 border-white/5 font-bold uppercase">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todo">Pending</SelectItem>
                                <SelectItem value="in_progress">Active</SelectItem>
                                <SelectItem value="review">Audit</SelectItem>
                                <SelectItem value="done">Complete</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Assign Operative</Label>
                    <Select value={assigneeId} onValueChange={setAssigneeId}>
                        <SelectTrigger className="bg-secondary/20 border-white/5 font-bold uppercase flex items-center gap-2">
                            <User className="w-4 h-4 text-hack-blue" />
                            <SelectValue placeholder="Select Operative" />
                        </SelectTrigger>
                        <SelectContent>
                            {team?.currentMembers.map((member) => (
                                <SelectItem key={member.id} value={member.id} className="uppercase font-bold tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-5 h-5"><AvatarImage src={member.avatar} /></Avatar>
                                        {member.name}
                                    </div>
                                </SelectItem>
                            ))}
                            <SelectItem value="none">Unassigned</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Tags (Comma Separated)</Label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="FRONTEND, API, SECURITY"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="pl-10 bg-secondary/20 border-white/5 font-bold uppercase tracking-wide placeholder:text-[10px]"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Deadline</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-bold uppercase tracking-wider bg-secondary/20 border-white/5 hover:bg-secondary/30",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 text-hack-blue" />
                                {date ? format(date, "PPP") : <span className="text-[10px]">Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#020617] border-white/10" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                className="rounded-xl border-white/5"
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="pt-4 flex gap-3">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px]">Cancel</Button>
                    <Button type="submit" disabled={isLoading} className="flex-[2] h-12 rounded-xl font-black uppercase tracking-widest text-[10px] bg-hack-blue hover:bg-hack-blue/90 text-white shadow-lg shadow-hack-blue/20">
                        {isLoading ? "DEPLOYING..." : "DEPLOY PROTOCOL"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
