import React, { useState, useRef, useEffect } from "react";
import { Send, Code2, X, ChevronDown } from "lucide-react";
import { cn } from "../ui/utils";

const LANGUAGES = [
    { label: "TypeScript", value: "typescript" },
    { label: "JavaScript", value: "javascript" },
    { label: "Python", value: "python" },
    { label: "SQL", value: "sql" },
    { label: "Bash", value: "bash" },
    { label: "JSON", value: "json" },
    { label: "Rust", value: "rust" },
    { label: "Go", value: "go" },
    { label: "HTML", value: "html" },
    { label: "CSS", value: "css" },
    { label: "Java", value: "java" },
    { label: "C++", value: "cpp" },
    { label: "Plain text", value: "plaintext" },
];

interface Props {
    onSendText: (content: string) => void;
    onSendCode: (code: string, language: string) => void;
}

export function CodeSnippetInput({ onSendText, onSendCode }: Props) {
    const [message, setMessage] = useState("");
    const [codeMode, setCodeMode] = useState(false);
    const [codeContent, setCodeContent] = useState("");
    const [language, setLanguage] = useState("typescript");
    const [langOpen, setLangOpen] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Detect ``` trigger in normal input
    useEffect(() => {
        if (message.endsWith("```")) {
            setCodeMode(true);
            setMessage("");
            setTimeout(() => textareaRef.current?.focus(), 50);
        }
    }, [message]);

    // Close lang dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(e.target as Node))
                setLangOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleTextSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        onSendText(message.trim());
        setMessage("");
    };

    const handleCodeSend = () => {
        if (!codeContent.trim()) return;
        onSendCode(codeContent.trim(), language);
        setCodeContent("");
        setCodeMode(false);
    };

    const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Ctrl/Cmd + Enter to send code
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            handleCodeSend();
        }
        // Tab inserts spaces
        if (e.key === "Tab") {
            e.preventDefault();
            const el = e.currentTarget;
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const newValue = codeContent.substring(0, start) + "  " + codeContent.substring(end);
            setCodeContent(newValue);
            setTimeout(() => el.setSelectionRange(start + 2, start + 2), 0);
        }
    };

    const selectedLang = LANGUAGES.find((l) => l.value === language);

    // ── CODE MODE ──────────────────────────────────────────────────────────
    if (codeMode) {
        return (
            <div className="border border-hack-blue/30 rounded-2xl overflow-hidden bg-zinc-950/70 shadow-xl shadow-hack-blue/5 backdrop-blur-md">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-border/30">
                    <div className="flex items-center gap-3">
                        <Code2 className="w-4 h-4 text-hack-blue" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-hack-blue">
                            Code Snippet
                        </span>

                        {/* Language picker */}
                        <div ref={langRef} className="relative">
                            <button
                                onClick={() => setLangOpen(!langOpen)}
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 border border-border/30 rounded-lg text-[11px] font-bold text-foreground hover:border-hack-blue/40 transition-all"
                            >
                                {selectedLang?.label}
                                <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", langOpen && "rotate-180")} />
                            </button>
                            {langOpen && (
                                <div className="absolute top-full mt-1 left-0 z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden min-w-[140px]">
                                    {LANGUAGES.map((lang) => (
                                        <button
                                            key={lang.value}
                                            onClick={() => { setLanguage(lang.value); setLangOpen(false); }}
                                            className={cn(
                                                "w-full text-left px-3 py-2 text-xs font-medium hover:bg-secondary transition-all",
                                                language === lang.value ? "text-hack-blue font-bold" : "text-foreground"
                                            )}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-muted-foreground/60 hidden sm:block">
                            Ctrl+Enter to send · Tab for indent
                        </span>
                        <button
                            onClick={() => { setCodeMode(false); setCodeContent(""); }}
                            className="p-1.5 rounded-lg hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-all"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Code textarea */}
                <textarea
                    ref={textareaRef}
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    onKeyDown={handleCodeKeyDown}
                    placeholder={`// Write ${selectedLang?.label || "code"} here...`}
                    rows={6}
                    className="w-full bg-transparent px-5 py-4 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none leading-relaxed"
                    spellCheck={false}
                />

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-t border-border/30">
                    <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                    </div>
                    <button
                        onClick={handleCodeSend}
                        disabled={!codeContent.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-hack-blue hover:bg-hack-blue/90 disabled:bg-muted disabled:text-muted-foreground text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-hack-blue/20 active:scale-95"
                    >
                        <Send className="w-3.5 h-3.5" />
                        Send Snippet
                    </button>
                </div>
            </div>
        );
    }

    // ── NORMAL MODE ────────────────────────────────────────────────────────
    return (
        <form onSubmit={handleTextSend} className="relative group">
            <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder='Transmit data to squadron... (type ``` for code)'
                className="w-full bg-muted/30 border border-border/50 rounded-2xl px-6 py-4 pr-24 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all group-hover:bg-muted/50"
            />
            <div className="absolute right-2 top-2 bottom-2 flex gap-1">
                <button
                    type="button"
                    onClick={() => { setCodeMode(true); setTimeout(() => textareaRef.current?.focus(), 50); }}
                    title="Send code snippet (or type ```)"
                    className="px-2.5 rounded-xl bg-muted/60 border border-border/30 hover:bg-hack-blue/10 hover:border-hack-blue/30 text-muted-foreground hover:text-hack-blue transition-all"
                >
                    <Code2 className="w-4 h-4" />
                </button>
                <button
                    type="submit"
                    className="px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all flex items-center justify-center shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </form>
    );
}
