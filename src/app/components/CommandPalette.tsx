import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Search,
    Command,
    Terminal,
    Users,
    MessageSquare,
    Settings,
    Zap,
    Shield,
    Activity,
    X,
    FileText,
    LayoutDashboard,
    Trophy,
    Moon,
    Sun
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { cn } from './ui/utils';

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const { theme, toggleTheme, teams, logout, user } = useAppContext();

    const actions = useMemo(() => {
        const baseActions = [
            { id: 'dash', title: 'Dashboard', icon: LayoutDashboard, category: 'Navigation', shortcut: 'G D', action: () => navigate('/dashboard') },
            { id: 'comm', title: 'Community Feed', icon: Users, category: 'Navigation', shortcut: 'G C', action: () => navigate('/community') },
            { id: 'prod', title: 'Productivity Hub', icon: Activity, category: 'Navigation', shortcut: 'G P', action: () => navigate('/productivity') },
            { id: 'sett', title: 'Account Settings', icon: Settings, category: 'Navigation', shortcut: 'S', action: () => navigate('/settings') },
            { id: 'theme', title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, icon: theme === 'dark' ? Sun : Moon, category: 'System', shortcut: 'T', action: toggleTheme },
            { id: 'logout', title: 'Logout / Terminate Session', icon: X, category: 'System', shortcut: 'Q', action: logout },
        ];

        const teamActions = teams.map(team => ({
            id: `team-${team.id}`,
            title: `Jump to Workspace: ${team.name}`,
            icon: Terminal,
            category: 'Workspaces',
            shortcut: '',
            action: () => navigate(`/workspace/${team.id}`)
        }));

        return [...baseActions, ...teamActions];
    }, [navigate, theme, toggleTheme, logout, teams]);

    const filteredActions = useMemo(() => {
        if (!query) return actions;
        return actions.filter(action =>
            action.title.toLowerCase().includes(query.toLowerCase()) ||
            action.category.toLowerCase().includes(query.toLowerCase())
        );
    }, [actions, query]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredActions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredActions[selectedIndex]) {
                filteredActions[selectedIndex].action();
                setIsOpen(false);
                setQuery('');
            }
        }
    }, [filteredActions, selectedIndex]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-black/40 backdrop-blur-md pointer-events-auto"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="w-full max-w-2xl bg-card border border-border/50 rounded-[2rem] shadow-2xl shadow-blue-500/10 overflow-hidden pointer-events-auto relative z-10"
                    >
                        <div className="flex items-center gap-3 p-6 border-b border-border/30 bg-card/50">
                            <Search className="w-5 h-5 text-blue-500" />
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a command or search intel..."
                                className="flex-1 bg-transparent border-none focus:outline-none text-lg text-foreground placeholder:text-muted-foreground font-medium"
                            />
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/50 border border-border/50">
                                <Command className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">K</span>
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
                            {filteredActions.length > 0 ? (
                                <div className="space-y-1">
                                    {Object.entries(
                                        filteredActions.reduce((acc, action) => {
                                            if (!acc[action.category]) acc[action.category] = [];
                                            acc[action.category].push(action);
                                            return acc;
                                        }, {} as Record<string, typeof filteredActions>)
                                    ).map(([category, items]) => (
                                        <div key={category} className="mb-4 last:mb-0">
                                            <div className="px-4 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                                                {category}
                                            </div>
                                            {items.map((item) => {
                                                const globalIndex = filteredActions.indexOf(item);
                                                const isSelected = selectedIndex === globalIndex;
                                                const Icon = item.icon;

                                                return (
                                                    <button
                                                        key={item.id}
                                                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                        onClick={() => {
                                                            item.action();
                                                            setIsOpen(false);
                                                            setQuery('');
                                                        }}
                                                        className={cn(
                                                            "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group relative",
                                                            isSelected ? "bg-blue-600/15 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]" : "border border-transparent hover:bg-muted/30"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center border border-border/30",
                                                            isSelected ? "bg-blue-500 text-foreground ring-4 ring-blue-500/20" : "bg-card text-muted-foreground group-hover:text-foreground"
                                                        )}>
                                                            <Icon className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <div className={cn(
                                                                "text-sm font-bold",
                                                                isSelected ? "text-blue-400" : "text-foreground/80"
                                                            )}>
                                                                {item.title}
                                                            </div>
                                                        </div>
                                                        {item.shortcut && (
                                                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/30 border border-border/30">
                                                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{item.shortcut}</span>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-muted-foreground/50">
                                    <div className="w-16 h-16 rounded-full border border-dashed border-border/50 flex items-center justify-center mx-auto mb-4">
                                        <Activity className="w-8 h-8 opacity-20" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">No matching intel protocols found.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-border/30 bg-muted/20 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="px-1.5 py-0.5 rounded border border-border/50 bg-card text-[8px] font-black text-muted-foreground uppercase">↑↓</span>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Navigate</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="px-1.5 py-0.5 rounded border border-border/50 bg-card text-[10px] font-bold text-muted-foreground animate-pulse">↵</span>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Select</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="px-1.5 py-0.5 rounded border border-border/50 bg-card text-[8px] font-black text-muted-foreground uppercase">ESC</span>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Close</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Tactical Spotlight v1.0</span>
                                <Shield className="w-3 h-3 text-blue-500" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
