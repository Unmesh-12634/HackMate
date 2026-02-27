import React, { useState, useEffect, useRef } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import { cn } from "../ui/utils";
import { Copy, Check, Smile } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────
export interface ChatMsg {
    id: string;
    user: string;
    user_id?: string;
    content: string;
    time: string;
    avatar?: string;
    message_type?: "text" | "code";
    language?: string;
    reactions?: { emoji: string; count: number; reacted: boolean }[];
    author_id?: string;
}

interface Props {
    msg: ChatMsg;
    isMe: boolean;
    onAddReaction: (messageId: string, emoji: string) => void;
    onRemoveReaction: (messageId: string, emoji: string) => void;
}

const QUICK_REACTIONS = ["👍", "❤️", "🔥", "😂", "🚀", "👀"];

// ── Code Block ─────────────────────────────────────────────────────────
function CodeBlock({ code, language }: { code: string; language?: string }) {
    const [copied, setCopied] = useState(false);
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeRef.current) {
            if (language && hljs.getLanguage(language)) {
                codeRef.current.innerHTML = hljs.highlight(code, { language }).value;
            } else {
                codeRef.current.innerHTML = hljs.highlightAuto(code).value;
            }
        }
    }, [code, language]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative rounded-xl overflow-hidden border border-border/50 my-1 text-left">
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-border/30">
                <span className="text-[9px] font-black tracking-[0.2em] uppercase text-zinc-500">
                    {language || "code"}
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    {copied ? (
                        <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
                    ) : (
                        <><Copy className="w-3 h-3" /> Copy</>
                    )}
                </button>
            </div>
            {/* Code */}
            <pre className="p-4 overflow-x-auto bg-zinc-950 text-[12px] leading-relaxed m-0">
                <code ref={codeRef} className={`hljs language-${language || "plaintext"}`} />
            </pre>
        </div>
    );
}

// ── Reaction Bar ────────────────────────────────────────────────────────
function ReactionBar({
    reactions,
    messageId,
    onAdd,
    onRemove,
}: {
    reactions: ChatMsg["reactions"];
    messageId: string;
    onAdd: (id: string, emoji: string) => void;
    onRemove: (id: string, emoji: string) => void;
}) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node))
                setPickerOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const groups = (reactions || []).filter((r) => r.count > 0);

    return (
        <div className="flex items-center flex-wrap gap-1 mt-1.5">
            {groups.map((r) => (
                <button
                    key={r.emoji}
                    onClick={() => (r.reacted ? onRemove(messageId, r.emoji) : onAdd(messageId, r.emoji))}
                    className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border transition-all",
                        r.reacted
                            ? "bg-hack-blue/15 border-hack-blue/40 text-hack-blue"
                            : "bg-secondary/50 border-border/30 text-foreground hover:bg-secondary"
                    )}
                >
                    <span>{r.emoji}</span>
                    <span className="text-[10px]">{r.count}</span>
                </button>
            ))}

            {/* Add reaction button */}
            <div ref={pickerRef} className="relative">
                <button
                    onClick={() => setPickerOpen(!pickerOpen)}
                    className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/30 border border-border/20 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                >
                    <Smile className="w-3 h-3" />
                </button>

                {pickerOpen && (
                    <div className="absolute bottom-full mb-2 left-0 z-50 flex gap-1 p-2 bg-card border border-border rounded-2xl shadow-2xl">
                        {QUICK_REACTIONS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => {
                                    const existing = reactions?.find((r) => r.emoji === emoji);
                                    if (existing?.reacted) {
                                        onRemove(messageId, emoji);
                                    } else {
                                        onAdd(messageId, emoji);
                                    }
                                    setPickerOpen(false);
                                }}
                                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-secondary text-lg transition-all hover:scale-125"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main ChatMessage ────────────────────────────────────────────────────
export function ChatMessage({ msg, isMe, onAddReaction, onRemoveReaction }: Props) {
    const isCode = msg.message_type === "code";

    return (
        <div className={`flex items-end gap-3 group ${isMe ? "flex-row-reverse" : ""}`}>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-xl bg-muted border border-border/50 overflow-hidden flex-shrink-0">
                <img
                    src={msg.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user}`}
                    alt={msg.user}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Bubble */}
            <div className={`max-w-[72%]`}>
                {/* Name + time */}
                <div className={`flex items-center gap-2 mb-1 px-1 ${isMe ? "flex-row-reverse" : ""}`}>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {msg.user}
                    </span>
                    <span className="text-[9px] font-medium text-muted-foreground/70 uppercase">
                        {msg.time}
                    </span>
                </div>

                {/* Bubble content */}
                <div
                    className={cn(
                        "px-4 py-3 rounded-2xl text-sm leading-relaxed transition-all shadow-lg",
                        isCode
                            ? "bg-zinc-950 border border-border/30 rounded-bl-none p-0 overflow-hidden"
                            : isMe
                                ? "bg-blue-600 text-white rounded-br-none shadow-blue-500/10"
                                : "bg-muted/30 text-foreground/90 border border-border/30 rounded-bl-none shadow-black/20"
                    )}
                >
                    {isCode ? (
                        <CodeBlock code={msg.content} language={msg.language} />
                    ) : (
                        <span className="break-words">{msg.content}</span>
                    )}
                </div>

                {/* Reaction bar */}
                <ReactionBar
                    reactions={msg.reactions}
                    messageId={msg.id}
                    onAdd={onAddReaction}
                    onRemove={onRemoveReaction}
                />
            </div>
        </div>
    );
}
