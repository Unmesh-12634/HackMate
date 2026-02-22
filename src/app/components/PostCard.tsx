import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
    Heart,
    MessageSquare,
    Share2,
    MoreHorizontal,
    Globe,
    Shield,
    Terminal,
    Target,
    X,
    Zap,
    Mail
} from "lucide-react";
import { cn } from "./ui/utils";
import { Post, useAppContext } from "../context/AppContext";

interface PostCardProps {
    post: Post;
    onViewDetail?: (post: Post) => void;
    onDirectMessage: (userId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onViewDetail, onDirectMessage }) => {
    const { likePost, deletePost, user, followingIds, followUser, unfollowUser } = useAppContext();
    const navigate = useNavigate();

    const isFollowing = followingIds.includes(post.user_id);
    const isOwner = user?.id === post.user_id;

    const [showMenu, setShowMenu] = React.useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0F172A] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden hover:border-blue-500/30 transition-all group"
        >
            <div className="p-5">
                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                    <Avatar
                        className="w-12 h-12 rounded-xl border border-white/5 cursor-pointer hover:border-blue-500/50 transition-all shrink-0 shadow-lg"
                        onClick={() => navigate(`/u/${post.user_id}`)}
                    >
                        <AvatarImage src={post.avatar} />
                        <AvatarFallback>{post.user[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3
                                className="text-sm font-black text-white hover:text-blue-400 transition-colors cursor-pointer truncate tracking-tight"
                                onClick={() => navigate(`/u/${post.user_id}`)}
                            >
                                {post.user}
                            </h3>
                            {!isOwner && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => isFollowing ? unfollowUser(post.user_id) : followUser(post.user_id)}
                                        className={cn(
                                            "text-[10px] font-black uppercase tracking-widest transition-colors",
                                            isFollowing ? "text-slate-500 hover:text-red-400" : "text-blue-500 hover:text-blue-400"
                                        )}
                                    >
                                        {isFollowing ? "• Secured" : "• Connect"}
                                    </button>
                                    <button
                                        onClick={() => onDirectMessage(post.user_id)}
                                        className="p-1 hover:bg-blue-500/10 rounded-lg text-blue-500/60 hover:text-blue-500 transition-all"
                                        title="Direct Message"
                                    >
                                        <Mail className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Operative @ Grid_Network</p>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                            <span>{post.time}</span>
                            <span className="text-slate-800">•</span>
                            <Globe className="w-2.5 h-2.5" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 relative">
                        {isOwner && (
                            <button
                                onClick={(e) => { e.stopPropagation(); deletePost(post.id); }}
                                className="text-slate-600 hover:text-red-400 p-2 rounded-xl hover:bg-red-400/10 transition-all"
                                title="Shred Broadcast"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                            className="text-slate-600 hover:text-slate-300 p-2 rounded-xl hover:bg-white/5 transition-all"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>

                        <AnimatePresence>
                            {showMenu && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                    className="absolute right-0 top-12 w-48 bg-[#1e293b] border border-white/[0.08] rounded-xl shadow-2xl z-[100] py-2 overflow-hidden"
                                >
                                    <button className="w-full px-4 py-2.5 text-left text-[10px] font-black text-slate-400 hover:text-blue-400 hover:bg-white/5 transition-all uppercase tracking-widest flex items-center gap-2">
                                        <Zap className="w-3.5 h-3.5" /> High Pulse Boost
                                    </button>
                                    <button className="w-full px-4 py-2.5 text-left text-[10px] font-black text-slate-400 hover:text-blue-400 hover:bg-white/5 transition-all uppercase tracking-widest flex items-center gap-2">
                                        <Shield className="w-3.5 h-3.5" /> Report Intel
                                    </button>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`); toast.success("Intel link copied."); setShowMenu(false); }}
                                        className="w-full px-4 py-2.5 text-left text-[10px] font-black text-slate-400 hover:text-blue-400 hover:bg-white/5 transition-all uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <Share2 className="w-3.5 h-3.5" /> Copy Intel Link
                                    </button>
                                    {isOwner && (
                                        <button
                                            onClick={() => { deletePost(post.id); setShowMenu(false); }}
                                            className="w-full px-4 py-2.5 text-left text-[10px] font-black text-red-500 hover:bg-red-500/10 transition-all uppercase tracking-widest flex items-center gap-2 border-t border-white/[0.03] mt-1"
                                        >
                                            <X className="w-3.5 h-3.5" /> Shred Broadcast
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Content */}
                <div
                    className="cursor-pointer"
                    onClick={() => onViewDetail?.(post)}
                >
                    <p className="text-sm text-slate-300 leading-relaxed mb-4 whitespace-pre-wrap font-medium">
                        {post.content}
                    </p>

                    {/* Post Image Support */}
                    {post.imageUrl && (
                        <div className="mb-4 rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                            <img
                                src={post.imageUrl}
                                alt="Post visual"
                                className="w-full h-auto max-h-[500px] object-cover hover:scale-[1.01] transition-transform duration-500"
                            />
                        </div>
                    )}

                    {/* Rich Code Snippet */}
                    {post.type === 'code' && post.codeSnippet && (
                        <div className="mb-4 rounded-xl bg-black/40 border border-white/[0.05] overflow-hidden group/code">
                            <div className="px-4 py-2 border-b border-white/[0.05] bg-white/[0.02] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="text-[10px] font-black text-slate-500 font-['JetBrains_Mono'] uppercase tracking-widest">
                                        {post.codeLanguage || 'terminal_output'}
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500/20" />
                                    <div className="w-2 h-2 rounded-full bg-amber-500/20" />
                                    <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
                                </div>
                            </div>
                            <pre className="p-4 overflow-x-auto text-[11px] font-['JetBrains_Mono'] text-blue-400/80 leading-relaxed scrollbar-hide">
                                <code>{post.codeSnippet}</code>
                            </pre>
                        </div>
                    )}

                    {/* Rich Project Card - LinkedIn Style Enhance */}
                    {post.type === 'project' && post.projectDetails && (
                        <div className="mb-4 rounded-2xl border border-blue-500/20 bg-blue-500/[0.02] overflow-hidden hover:bg-blue-500/[0.04] transition-all group/project">
                            <div className="p-5 space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
                                            <Target className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-xs font-black text-white uppercase tracking-wider block">
                                                {post.projectDetails.name}
                                            </span>
                                            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">
                                                {post.projectDetails.openRoles?.length > 0 ? "MISSION_RECRUITMENT" : "PROJECT_INTEL"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap justify-end gap-1.5">
                                        {post.projectDetails.techStack?.slice(0, 3).map((tech: string) => (
                                            <span key={tech} className="px-2 py-0.5 bg-slate-950 border border-white/5 rounded-md text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                                    {post.projectDetails.description}
                                </p>

                                {post.projectDetails.openRoles?.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">
                                            OPEN_ROLES
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {post.projectDetails.openRoles?.map((role: string) => (
                                                <div key={role} className="flex items-center gap-2 p-2 bg-slate-950/50 border border-white/[0.03] rounded-xl text-[10px] font-bold text-slate-300">
                                                    <div className="w-1 h-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                                    {role}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={(e) => { e.stopPropagation(); onDirectMessage(post.user_id); }}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.15em] text-[10px] py-6 rounded-xl border-0 shadow-lg shadow-blue-600/20 group-hover/project:scale-[0.99] transition-all"
                                >
                                    {post.projectDetails.openRoles?.length > 0 ? "ENLIST_IN_SQUAD" : "VIEW_MISSION_INTEL"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 rounded-lg bg-slate-950 border border-white/[0.03] text-[9px] font-black text-blue-500 uppercase tracking-widest">
                            #{tag.toUpperCase()}
                        </span>
                    ))}
                </div>

                {/* Reactions Stats */}
                <div className="flex items-center justify-between py-3 border-t border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer transition-colors group/stat">
                        <div className="w-5 h-5 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover/stat:bg-blue-500 transition-all">
                            <Heart className="w-3 h-3 text-blue-500 group-hover/stat:text-white fill-current" />
                        </div>
                        <span>{post.likes} LIKES</span>
                    </div>
                    <div
                        className="flex items-center gap-3 hover:text-blue-400 cursor-pointer transition-colors"
                        onClick={() => onViewDetail?.(post)}
                    >
                        <span>{post.comments} COMMENTS</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-4 gap-1 pt-3 border-t border-white/[0.03]">
                    <button
                        onClick={(e) => { e.stopPropagation(); likePost(post.id); }}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 py-2 rounded-xl hover:bg-white/5 transition-all text-[9px] font-black uppercase tracking-widest",
                            post.isLiked ? "text-blue-500 bg-blue-500/5 shadow-inner" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <Heart className={cn("w-3.5 h-3.5", post.isLiked && "fill-current")} />
                        {post.isLiked ? "LIKED" : "LIKE"}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onViewDetail?.(post); }}
                        className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl hover:bg-white/5 transition-all text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300"
                    >
                        <MessageSquare className="w-3.5 h-3.5" /> COMMENT
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onViewDetail?.(post); }}
                        className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl hover:bg-white/5 transition-all text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300"
                    >
                        <Zap className="w-3.5 h-3.5" /> REPOST
                    </button>
                    <button className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl hover:bg-white/5 transition-all text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300">
                        <Share2 className="w-3.5 h-3.5" /> SHARE
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
