import React, { useState, useEffect } from "react";
import {
    Activity,
    Terminal,
    Star,
    GitFork,
    CircleDot,
    Lock,
    ExternalLink,
    FileText,
    GitCommit,
    Plus,
    X,
    Download
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { getRepoDetails, getRepoReadme, getRepoCommits, getGitHubRepos, GitHubRepo, GitHubCommit } from "../../../lib/github";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../../context/AppContext";

interface CodebaseCenterProps {
    team: any;
}

export const CodebaseCenter: React.FC<CodebaseCenterProps> = ({ team }) => {
    const { user, githubToken, syncGitHubRepo, disconnectGitHubRepo } = useAppContext();
    const [loading, setLoading] = useState(false);

    // Core state
    const [activeRepoName, setActiveRepoName] = useState<string | null>(team.github_repos?.[0] || team.github_repo || null);
    const [isAddingRepo, setIsAddingRepo] = useState((team.github_repos?.length || 0) === 0 && !team.github_repo);

    const [repo, setRepo] = useState<GitHubRepo | null>(null);
    const [readme, setReadme] = useState<string | null>(null);
    const [commits, setCommits] = useState<GitHubCommit[]>([]);

    // For the selection screen
    const [userRepos, setUserRepos] = useState<GitHubRepo[]>([]);
    const [loadingRepos, setLoadingRepos] = useState(false);

    useEffect(() => {
        if (!activeRepoName && team.github_repos && team.github_repos.length > 0) {
            setActiveRepoName(team.github_repos[0]);
            setIsAddingRepo(false);
        } else if ((team.github_repos?.length || 0) === 0 && !team.github_repo) {
            setIsAddingRepo(true);
        }
    }, [team.github_repos, team.github_repo]);

    useEffect(() => {
        const fetchGitHubData = async () => {
            if (!activeRepoName || isAddingRepo) {
                return;
            }

            setLoading(true);
            try {
                const [repoData, readmeData, commitData] = await Promise.all([
                    getRepoDetails(activeRepoName, githubToken || undefined),
                    getRepoReadme(activeRepoName, githubToken || undefined),
                    getRepoCommits(activeRepoName, 10, githubToken || undefined)
                ]);

                setRepo(repoData);
                setReadme(readmeData);
                setCommits(commitData);
            } catch (error) {
                console.error("Failed to load Codebase data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGitHubData();
    }, [activeRepoName, isAddingRepo]);

    useEffect(() => {
        const fetchUserRepos = async () => {
            if (isAddingRepo && user?.github_username) {
                setLoadingRepos(true);
                const repos = await getGitHubRepos(user.github_username, 30, githubToken || undefined);
                setUserRepos(repos);
                setLoadingRepos(false);
            }
        };
        fetchUserRepos();
    }, [isAddingRepo, user?.github_username]);

    const handleLinkRepo = async (fullRepoName: string) => {
        if (!team) return;
        setLoading(true);
        const success = await syncGitHubRepo(team.id, fullRepoName);
        if (success) {
            setActiveRepoName(fullRepoName);
            setIsAddingRepo(false);
        }
        setLoading(false);
    };

    const handleDisconnectRepo = async (fullRepoName: string) => {
        if (!team || !confirm("Disconnect this repository?")) return;
        await disconnectGitHubRepo(team.id, fullRepoName);
        if (activeRepoName === fullRepoName) {
            setActiveRepoName(team.github_repos?.filter((r: string) => r !== fullRepoName)[0] || null);
        }
    };

    if (isAddingRepo || ((team.github_repos?.length || 0) === 0 && !team.github_repo)) {
        if (!user?.github_username) {
            return (
                <div className="h-full flex flex-col items-center justify-center bg-[#020617] p-8">
                    <div className="w-24 h-24 mb-6 rounded-3xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-center relative overflow-hidden group">
                        <Terminal className="w-10 h-10 text-emerald-500/40 group-hover:text-emerald-400 transition-colors relative z-10" />
                        <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                    </div>
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter mb-2">No Repository Linked</h2>
                    <p className="text-muted-foreground text-center max-w-md text-sm mb-8 leading-relaxed">
                        Your HackMate account is not connected to GitHub. Link your GitHub account in your Profile Settings to access your repositories here.
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={() => window.location.href = '/settings'} className="bg-emerald-600 hover:bg-emerald-500 text-foreground font-black uppercase tracking-widest text-[10px]">
                            Go to Settings
                        </Button>
                        {/* Allow cancelling adding if they have other repos */}
                        {(team.github_repos?.length || 0) > 0 && (
                            <Button variant="outline" onClick={() => setIsAddingRepo(false)} className="border-border/50 text-foreground/80">
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="h-full flex flex-col bg-[#020617] p-8 overflow-y-auto custom-scrollbar">
                <div className="max-w-5xl mx-auto w-full relative">
                    {/* Back button if there are existing repos */}
                    {(team.github_repos?.length || 0) > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute -top-12 left-0 text-muted-foreground hover:text-foreground mb-4"
                            onClick={() => setIsAddingRepo(false)}
                        >
                            <X className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                    )}

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-center relative overflow-hidden">
                            <Terminal className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">Codebase Integration</h2>
                            <p className="text-sm text-muted-foreground">Select a repository from your connected GitHub account to link to this squadron.</p>
                        </div>
                    </div>

                    {loadingRepos ? (
                        <div className="flex justify-center py-20">
                            <Activity className="w-8 h-8 text-emerald-500/50 animate-pulse" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userRepos.map((r, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={r.id}
                                    className="bg-card/40 border border-border/30 hover:border-emerald-500/30 rounded-3xl p-6 transition-all group flex flex-col h-full select-none"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="font-bold text-slate-200 text-lg truncate pr-4 group-hover:text-emerald-400 transition-colors">{r.name}</h3>
                                        {r.language && <Badge variant="outline" className="text-[9px] uppercase tracking-wider border-border/50">{r.language}</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                                        {r.description || "No description provided."}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
                                        <div className="flex items-center gap-4 text-muted-foreground text-xs font-mono">
                                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500/70" /> {r.stargazers_count}</span>
                                            <span className="flex items-center gap-1"><GitFork className="w-3 h-3" /> {r.forks_count}</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="h-8 text-[10px] font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-foreground"
                                            onClick={() => handleLinkRepo(r.full_name)}
                                            disabled={team.github_repos?.includes(r.full_name) || team.github_repo === r.full_name}
                                        >
                                            {team.github_repos?.includes(r.full_name) || team.github_repo === r.full_name ? 'Linked' : 'Link to Squadron'}
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Combine legacy repo and array for Sidebar
    const allRepos = Array.from(new Set([...(team.github_repos || []), team.github_repo].filter(Boolean)));

    return (
        <div className="h-full flex bg-[#020617] overflow-hidden">
            {/* Left Sidebar: Repo List */}
            <div className="w-64 border-r border-border/30 bg-card/40 flex flex-col shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
                <div className="p-4 border-b border-border/30 mb-2 flex items-center justify-between bg-card/50">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Repositories</h3>
                    <Button variant="ghost" size="icon" className="w-6 h-6 text-emerald-500 hover:bg-emerald-500/20" onClick={() => setIsAddingRepo(true)}>
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
                <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1 px-3 pb-4">
                    {allRepos.map((repoName: string) => (
                        <div key={repoName}
                            onClick={() => setActiveRepoName(repoName)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all group relative ${activeRepoName === repoName
                                ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                : 'border-transparent hover:bg-white/5'
                                }`}>
                            <p className={`text-sm font-bold truncate pr-6 transition-colors ${activeRepoName === repoName ? 'text-emerald-400' : 'text-foreground/80 group-hover:text-foreground'}`}>
                                {repoName.split('/')[1]}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">{repoName.split('/')[0]}</p>

                            {/* Disconnect button - only visible on hover */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDisconnectRepo(repoName); }}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded text-rose-500 flex items-center justify-center transition-all ${activeRepoName === repoName ? 'opacity-100 hover:bg-rose-500/20' : 'opacity-0 group-hover:opacity-100 hover:bg-rose-500/20'}`}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Dashboard Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative bg-[#020617]">
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md z-50 flex flex-col items-center justify-center"
                        >
                            <Activity className="w-12 h-12 text-emerald-500/50 animate-pulse mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 animate-pulse">Establishing Uplink...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!loading && !repo && (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-rose-500 font-bold">Failed to load repository. Check if it's correct or public.</p>
                    </div>
                )}

                {repo && (
                    <div className="h-full flex flex-col overflow-hidden w-full relative">
                        <header className="p-8 border-b border-border/30 bg-card/20 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 z-10">
                            <div className="flex items-center gap-6 overflow-hidden">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-emerald-500/20 border border-slate-950 shadow-xl shadow-emerald-500/10 shrink-0">
                                    <img src={repo.owner.avatar_url} alt="Owner Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] whitespace-nowrap">Live Telemetry</span>
                                        <Badge variant="outline" className="border-border/50 text-muted-foreground text-[10px] uppercase bg-card whitespace-nowrap">{repo.language || "Unknown"}</Badge>
                                    </div>
                                    <h2 className="text-3xl font-black text-foreground tracking-tighter hover:text-emerald-400 transition-colors cursor-pointer truncate" onClick={() => window.open(repo.html_url, '_blank')}>
                                        {repo.full_name} <ExternalLink className="inline w-5 h-5 opacity-50 relative -top-1 ml-1" />
                                    </h2>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 flex-wrap justify-end">
                                <div className="flex items-center gap-4 bg-card/50 p-3 rounded-2xl border border-border/30 whitespace-nowrap shrink-0">
                                    <div className="flex items-center gap-2 px-3">
                                        <Star className="w-4 h-4 text-amber-400" />
                                        <div>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Stars</p>
                                            <p className="text-sm font-black text-foreground">{repo.stargazers_count.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-white/10" />
                                    <div className="flex items-center gap-2 px-3">
                                        <GitFork className="w-4 h-4 text-emerald-400" />
                                        <div>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Forks</p>
                                            <p className="text-sm font-black text-foreground">{repo.forks_count.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-white/10" />
                                    <div className="flex items-center gap-2 px-3">
                                        <CircleDot className="w-4 h-4 text-rose-400" />
                                        <div>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Issues</p>
                                            <p className="text-sm font-black text-foreground">{repo.open_issues_count.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Download Button */}
                                <Button
                                    variant="outline"
                                    className="border-emerald-500/20 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 bg-card font-mono text-xs hidden lg:flex rounded-xl shrink-0 h-[48px]"
                                    onClick={() => window.open(`https://github.com/${repo.full_name}/archive/refs/heads/main.zip`, '_blank')}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Source
                                </Button>
                            </div>
                        </header>

                        <div className="flex-1 flex overflow-hidden">
                            {/* Left side: README viewer */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 border-r border-border/30 bg-card/10">
                                <div className="flex items-center gap-3 mb-8 static top-0">
                                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-black text-foreground/80 uppercase tracking-[0.2em]">Active Documentation</h3>
                                </div>

                                <div className="prose prose-invert prose-emerald max-w-none">
                                    {readme ? (
                                        <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/80 bg-transparent p-0">
                                            {/* Simple render just throwing the raw decoded markdown text */}
                                            {readme}
                                        </pre>
                                    ) : (
                                        <p className="italic text-slate-600">No README.md available.</p>
                                    )}
                                </div>
                            </div>

                            {/* Right side: Commit Feed */}
                            <div className="w-[400px] bg-[#020617] flex flex-col">
                                <div className="p-6 border-b border-border/30 shrink-0 bg-card/40">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Activity className="w-4 h-4 text-emerald-500" />
                                            <h3 className="text-sm font-black text-foreground uppercase tracking-[0.1em]">Commit Log</h3>
                                        </div>
                                        <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 font-mono text-[9px] bg-emerald-500/10">main</Badge>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                                    {commits.map((commit, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            key={commit.sha}
                                            className="relative pl-6"
                                        >
                                            {/* Timeline line */}
                                            {i !== commits.length - 1 && (
                                                <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-white/10" />
                                            )}

                                            {/* Timeline Node */}
                                            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-card border border-emerald-500/30 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                                            </div>

                                            <div className="bg-card/40 border border-border/30 rounded-2xl p-4 hover:border-emerald-500/30 transition-colors cursor-pointer group" onClick={() => window.open(commit.html_url, '_blank')}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-5 h-5 rounded-md overflow-hidden bg-slate-800 shrink-0">
                                                        {commit.author?.avatar_url
                                                            ? <img src={commit.author.avatar_url} alt="" className="w-full h-full object-cover" />
                                                            : <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-muted-foreground">GH</div>
                                                        }
                                                    </div>
                                                    <p className="text-xs font-bold text-foreground/80 truncate">{commit.commit.author.name}</p>
                                                    <span className="text-[10px] text-slate-600 ml-auto whitespace-nowrap">
                                                        {new Date(commit.commit.author.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-200 leading-snug break-words">
                                                    {commit.commit.message.split('\n')[0]} {/* Show only first line of commit */}
                                                </p>
                                                <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-emerald-500/70 group-hover:text-emerald-400 transition-colors">
                                                    <GitCommit className="w-3 h-3" />
                                                    {commit.sha.substring(0, 7)}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {commits.length === 0 && !loading && (
                                        <div className="text-center text-muted-foreground italic text-sm py-10">
                                            No recent commits found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
