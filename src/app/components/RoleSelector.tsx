import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, Briefcase, CheckCircle2 } from "lucide-react";
import { cn } from "./ui/button";

// ------------------------------------
// ROLE DEFINITIONS (Technical + Non-technical)
// ------------------------------------
export const ROLE_GROUPS = [
    {
        group: "🛠️ Engineering & Dev",
        roles: [
            "Frontend Developer",
            "Backend Developer",
            "Full Stack Developer",
            "Mobile Developer (iOS)",
            "Mobile Developer (Android)",
            "Mobile Developer (React Native)",
            "Mobile Developer (Flutter)",
            "Systems Programmer",
            "Embedded Systems Engineer",
            "Game Developer",
            "Blockchain Developer",
            "Smart Contract Developer",
            "WebAssembly Engineer",
            "API Engineer",
            "SDK Engineer",
        ],
    },
    {
        group: "🤖 AI & Data",
        roles: [
            "AI/ML Engineer",
            "Deep Learning Researcher",
            "NLP Engineer",
            "Computer Vision Engineer",
            "AI Agent Developer",
            "LLM Fine-tuner",
            "Data Scientist",
            "Data Analyst",
            "Data Engineer",
            "MLOps Engineer",
            "Research Scientist",
            "Prompt Engineer",
        ],
    },
    {
        group: "☁️ Infrastructure & Platform",
        roles: [
            "DevOps Engineer",
            "Cloud Architect",
            "Site Reliability Engineer (SRE)",
            "Platform Engineer",
            "Database Administrator",
            "Network Engineer",
            "Infrastructure Engineer",
            "Kubernetes Administrator",
        ],
    },
    {
        group: "🔐 Security",
        roles: [
            "Security Engineer",
            "Security Analyst",
            "Penetration Tester",
            "Red Team Operator",
            "Bug Bounty Hunter",
            "Cryptography Engineer",
            "GRC Analyst",
        ],
    },
    {
        group: "🎨 Design & UX",
        roles: [
            "UI Designer",
            "UX Designer",
            "Product Designer",
            "Motion Designer",
            "Brand Designer",
            "3D Artist",
            "Graphic Designer",
        ],
    },
    {
        group: "📦 Product & Strategy",
        roles: [
            "Product Manager",
            "Technical Product Manager",
            "Product Strategist",
            "Growth Hacker",
            "Business Analyst",
            "Solutions Architect",
        ],
    },
    {
        group: "📣 Marketing & Community",
        roles: [
            "Marketing Strategist",
            "Content Creator",
            "Community Manager",
            "Developer Advocate",
            "SEO Specialist",
            "Social Media Manager",
            "Brand Strategist",
        ],
    },
    {
        group: "🏗️ Management & Leadership",
        roles: [
            "Engineering Manager",
            "CTO",
            "Founder / Co-Founder",
            "Project Manager",
            "Scrum Master",
            "Team Lead",
            "Technical Lead",
        ],
    },
    {
        group: "📝 Writing & Docs",
        roles: [
            "Technical Writer",
            "Documentation Engineer",
            "Developer Relations (DevRel)",
            "Content Strategist",
        ],
    },
    {
        group: "🎓 Other",
        roles: [
            "Student / Learner",
            "Open Source Contributor",
            "Indie Hacker",
            "Hobbyist",
            "Consultant",
            "Freelancer",
        ],
    },
];

interface RoleSelectorProps {
    value: string;
    onChange: (role: string) => void;
    variant?: "full" | "minimal";
}

export function RoleSelector({ value, onChange, variant = "full" }: RoleSelectorProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = ROLE_GROUPS
        .map(g => ({
            ...g,
            roles: g.roles.filter(r => r.toLowerCase().includes(search.toLowerCase())),
        }))
        .filter(g => g.roles.length > 0);

    const handleSelect = (role: string) => {
        onChange(role);
        setOpen(false);
        setSearch("");
    };

    if (variant === "minimal") {
        return (
            <div ref={ref} className="relative">
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className={cn(
                        "w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-secondary relative transition-all active:scale-95 shadow-sm border border-border/50",
                        open && "bg-secondary ring-2 ring-hack-blue/20"
                    )}
                    title="Select Primary Role"
                >
                    <Briefcase className={cn("w-5 h-5", open ? "text-hack-blue" : "text-muted-foreground")} />
                    {value && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-hack-blue shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                        </span>
                    )}
                </button>

                {open && (
                    <div className="absolute z-[100] top-full mt-4 right-0 w-[300px] bg-card border border-border shadow-2xl rounded-[24px] overflow-hidden flex flex-col origin-top-right">
                        <div className="p-4 border-b border-border bg-secondary/20">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Tactical Specialization</p>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                    autoFocus
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search specialization..."
                                    className="w-full h-9 pl-9 pr-3 text-xs font-bold bg-background/50 rounded-xl border border-border/50 focus:outline-none focus:ring-2 focus:ring-hack-blue/20 text-foreground placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto max-h-[350px] p-2 space-y-3 custom-scrollbar">
                            {filtered.length === 0 ? (
                                <p className="text-center py-6 text-xs text-muted-foreground italic">No signals found...</p>
                            ) : (
                                filtered.map(g => (
                                    <div key={g.group}>
                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-3 py-1.5">
                                            {g.group}
                                        </p>
                                        <div className="space-y-0.5">
                                            {g.roles.map(role => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => handleSelect(role)}
                                                    className={cn(
                                                        "w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all",
                                                        value === role
                                                            ? "bg-hack-blue/10 text-hack-blue"
                                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>{role}</span>
                                                        {value === role && <CheckCircle2 className="w-3 h-3 text-hack-blue" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-3 h-11 px-4 bg-background border border-input rounded-xl text-sm font-medium text-foreground hover:border-hack-blue/50 focus:outline-none focus:ring-2 focus:ring-hack-blue/20 transition-all shadow-sm"
            >
                <span className="flex items-center gap-2 truncate">
                    <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                    {value ? (
                        <span className="font-bold">{value}</span>
                    ) : (
                        <span className="text-muted-foreground font-normal">Select your primary role...</span>
                    )}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200", open && "rotate-180")} />
            </button>

            {open && (
                <div className="absolute z-[100] top-full mt-2 left-0 w-full max-h-72 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col translate-z-0">
                    {/* Search */}
                    <div className="p-3 border-b border-border bg-card">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input
                                autoFocus
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search roles..."
                                className="w-full h-8 pl-9 pr-3 text-xs font-medium bg-secondary/40 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-hack-blue/20 text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>
                    {/* List */}
                    <div className="overflow-y-auto flex-1 p-2 space-y-3 custom-scrollbar">
                        {filtered.length === 0 ? (
                            <p className="text-center py-6 text-xs text-muted-foreground">No roles found</p>
                        ) : (
                            filtered.map(g => (
                                <div key={g.group}>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1.5">
                                        {g.group}
                                    </p>
                                    <div className="space-y-0.5">
                                        {g.roles.map(role => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => handleSelect(role)}
                                                className={cn(
                                                    "w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                                                    value === role
                                                        ? "bg-hack-blue/10 text-hack-blue font-bold"
                                                        : "text-foreground hover:bg-secondary/80"
                                                )}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>{role}</span>
                                                    {value === role && <CheckCircle2 className="w-3 h-3 text-hack-blue" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
