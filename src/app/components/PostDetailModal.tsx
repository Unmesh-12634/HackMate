import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, MessageSquare, Share2, Globe, Shield, Terminal, Target } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Post, useAppContext, PostComment } from "../context/AppContext";
import { cn } from "./ui/utils";

interface PostDetailModalProps {
    post: Post;
    onClose: () => void;
    onDirectMessage: (userId: string) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, onClose, onDirectMessage }) => {
    const { fetchComments, addComment, likePost, user } = useAppContext();
    const [comments, setComments] = useState<PostComment[]>([]);
    const [commentInput, setCommentInput] = useState("");
    const [isLoadingComments, setIsLoadingComments] = useState(true);
    const [replyTo, setReplyTo] = useState<PostComment | null>(null);

    const loadComments = async () => {
        setIsLoadingComments(true);
        try {
            const data = await fetchComments(post.id);
            setComments(data);
        } catch (error) {
            console.error("Failed to load intel reports:", error);
        } finally {
            setIsLoadingComments(false);
        }
    };

    useEffect(() => {
        loadComments();
    }, [post.id]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentInput.trim() || !user) return;

        try {
            await addComment(post.id, commentInput, replyTo?.id);
            setCommentInput("");
            setReplyTo(null);
            await loadComments();
        } catch (error) {
            console.error("Failed to transmit report:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-5xl h-full max-h-[85vh] bg-slate-900 border border-border/50 rounded-[2.5rem] relative z-10 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-[1.5fr_1fr]"
            >
                {/* Left Side: Post Content */}
                <div className="flex flex-col h-full border-r border-border/30 bg-card/50">
                    <div className="p-4 border-b border-border/30 flex items-center justify-between lg:hidden">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SIGNAL_DETAILS</span>
                        <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-8">
                            <Avatar className="w-14 h-14 rounded-2xl border border-border/50 shadow-2xl">
                                <AvatarImage src={post.avatar} />
                                <AvatarFallback>{post.user[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-xl font-black text-foreground tracking-tight">{post.user}</h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                    <span>{post.time}</span>
                                    <span className="text-slate-800">•</span>
                                    <Globe className="w-3 h-3" />
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="prose prose-invert max-w-none">
                            <p className="text-lg text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                                {post.content}
                            </p>
                        </div>

                        {/* Attachments (Widgets) */}
                        <div className="mt-8 space-y-6">
                            {post.type === 'code' && post.codeSnippet && (
                                <div className="rounded-2xl bg-black/40 border border-border/50 overflow-hidden shadow-2xl">
                                    <div className="px-6 py-3 border-b border-border/30 bg-white/[0.02] flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Terminal className="w-4 h-4 text-blue-500" />
                                            <span className="text-[11px] font-black text-muted-foreground font-['JetBrains_Mono'] uppercase tracking-widest">
                                                {post.codeLanguage || 'SOURCE_CODE'}
                                            </span>
                                        </div>
                                    </div>
                                    <pre className="p-6 overflow-x-auto text-[13px] font-['JetBrains_Mono'] text-blue-400 leading-relaxed scrollbar-hide">
                                        <code>{post.codeSnippet}</code>
                                    </pre>
                                </div>
                            )}

                            {post.type === 'project' && post.projectDetails && (
                                <div className="rounded-[2rem] border border-blue-500/30 bg-blue-500/[0.03] shadow-2xl shadow-blue-500/5 p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-blue-600 rounded-2xl text-foreground shadow-xl shadow-blue-600/30">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-foreground uppercase tracking-tight">{post.projectDetails.name}</h4>
                                            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-1">SQUAD_ENLISTMENT_ACTIVE</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">
                                        {post.projectDetails.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">TECH_STACK</div>
                                            <div className="flex flex-wrap gap-2">
                                                {post.projectDetails.techStack?.map(tech => (
                                                    <span key={tech} className="px-3 py-1 bg-slate-950 border border-border/50 rounded-lg text-xs font-bold text-slate-300">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">OPEN_ROLES</div>
                                            <div className="flex flex-wrap gap-2">
                                                {post.projectDetails.openRoles?.map(role => (
                                                    <div key={role} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] font-bold text-blue-400">
                                                        {role}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => onDirectMessage(post.user_id)}
                                        className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-foreground font-black uppercase tracking-widest py-8 rounded-2xl shadow-2xl shadow-blue-600/30 border-0 transition-all text-sm"
                                    >
                                        TRANSMIT_APPLICATION
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex flex-wrap gap-2">
                            {post.tags.map(tag => (
                                <span key={tag} className="px-4 py-2 rounded-xl bg-slate-950 border border-border/30 text-[11px] font-black text-blue-500 uppercase tracking-widest shadow-inner">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Interaction Footer */}
                    <div className="p-8 border-t border-border/30 bg-slate-950/30 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <button
                                onClick={() => likePost(post.id)}
                                className={cn(
                                    "flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all",
                                    post.isLiked ? "text-blue-500" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Heart className={cn("w-5 h-5", post.isLiked && "fill-current")} />
                                <span>{post.likes} ENDORSEMENTS</span>
                            </button>
                            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-muted-foreground">
                                <MessageSquare className="w-5 h-5" />
                                <span>{post.comments} INTEL_REPORTS</span>
                            </div>
                        </div>
                        <button className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all">
                            <Share2 className="w-5 h-5" />
                            <span>RELAY</span>
                        </button>
                    </div>
                </div>

                {/* Right Side: Comments/Reports */}
                <div className="flex flex-col h-full bg-slate-900/30 overflow-hidden relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-3 bg-card/60 hover:bg-slate-800 rounded-2xl text-muted-foreground hover:text-foreground transition-all z-20 border border-border/30 shadow-2xl hidden lg:block"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-6 border-b border-border/30 bg-white/[0.01]">
                        <h4 className="text-[11px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            Intelligence_Reports
                        </h4>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                        {isLoadingComments ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-4">
                                <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest animate-pulse">Scanning_Comms...</span>
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-40">
                                <MessageSquare className="w-12 h-12 text-slate-700" />
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Silence_On_Channel</span>
                            </div>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="flex gap-4 group/comment">
                                        <Avatar className="w-10 h-10 rounded-xl border border-border/50 shrink-0 shadow-lg transition-transform group-hover/comment:scale-105">
                                            <AvatarImage src={comment.author_avatar} />
                                            <AvatarFallback>{comment.author_name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[11px] font-extrabold text-foreground tracking-tight">{comment.author_name}</span>
                                                <span className="text-[8px] font-bold text-slate-600 uppercase font-['JetBrains_Mono']">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="bg-card/60 border border-white/[0.03] p-3.5 rounded-2xl text-[12px] font-medium text-slate-300 leading-relaxed group-hover/comment:border-blue-500/20 transition-all shadow-inner">
                                                {comment.content}
                                            </div>
                                            <button
                                                onClick={() => setReplyTo(comment)}
                                                className="mt-2 text-[9px] font-black text-slate-600 hover:text-blue-500 uppercase tracking-widest transition-all flex items-center gap-1.5"
                                            >
                                                REP_TRANS_REPORT
                                            </button>
                                        </div>
                                    </div>

                                    {/* Replies nested here if needed */}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Comment Input */}
                    <div className="p-6 bg-slate-950/40 border-t border-border/30">
                        <AnimatePresence>
                            {replyTo && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mb-4 flex items-center justify-between px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                                >
                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Targeting response: {replyTo.author_name}</span>
                                    <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground transition-all"><X className="w-3.5 h-3.5" /></button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleCommentSubmit} className="relative group/form">
                            <textarea
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                placeholder={replyTo ? "TRANSMIT_DETAILED_REPLY..." : "TRANSMIT_VALUABLE_INTEL..."}
                                className="w-full h-24 bg-card/50 border border-border/50 rounded-[1.5rem] p-4 text-xs font-medium text-foreground outline-none focus:border-blue-500/50 transition-all placeholder:text-muted-foreground/40 resize-none shadow-inner"
                            />
                            <button
                                type="submit"
                                disabled={!commentInput.trim()}
                                className="absolute bottom-3 right-3 p-3 bg-blue-600 text-foreground rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none hover:scale-105 active:scale-95"
                            >
                                <Target className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
