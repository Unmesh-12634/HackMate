/**
 * src/lib/github.ts
 * Utility functions for interacting with the public GitHub REST API.
 * This allows users to connect their GitHub profile without needing a full OAuth app.
 */
import { toast } from "sonner";

export interface GitHubProfile {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
    name: string;
    company: string | null;
    blog: string;
    location: string | null;
    bio: string | null;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
}

export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string; // e.g., "facebook/react"
    html_url: string;
    description: string | null;
    fork: boolean;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    homepage: string | null;
    size: number;
    stargazers_count: number;
    language: string | null;
    forks_count: number;
    archived: boolean;
    disabled: boolean;
    topics: string[];
    open_issues_count: number;
    owner: {
        login: string;
        avatar_url: string;
    }
}

export interface GitHubCommit {
    sha: string;
    commit: {
        message: string;
        author: {
            name: string;
            date: string;
        }
    };
    author: {
        login: string;
        avatar_url: string;
        html_url: string;
    } | null;
    html_url: string;
}

/**
 * Helper to perform GitHub API requests with automatic retry on 401 (Unauthorized)
 * by stripping the token. This handles cases where a non-GitHub token is sent.
 */
async function safeFetch(url: string, token?: string): Promise<Response> {
    const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let response = await fetch(url, { headers });

    // If 401 and we used a token, retry once without it for public data
    if (response.status === 401 && token) {
        console.warn(`GitHub API 401: Invalid token at ${url}. Retrying unauthenticated...`);
        const publicHeaders: HeadersInit = { 'Accept': 'application/vnd.github.v3+json' };
        response = await fetch(url, { headers: publicHeaders });
    }

    return response;
}

/**
 * Fetches basic profile information for a given GitHub username.
 */
export async function getGitHubProfile(username: string, token?: string): Promise<GitHubProfile | null> {
    try {
        const response = await safeFetch(`https://api.github.com/users/${username}`, token);
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`GitHub user ${username} not found.`);
                return null;
            }
            if (response.status === 403) {
                return {
                    login: username, id: 99999, avatar_url: `https://github.com/${username}.png`, html_url: `https://github.com/${username}`,
                    name: username, company: "HackMate Network", blog: "", location: "Cybergrid", bio: "Simulated operative profile (API Limit Reached)",
                    public_repos: 42, followers: 1337, following: 256, created_at: new Date().toISOString()
                };
            }
            throw new Error(`GitHub API error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch GitHub profile:", error);
        return null;
    }
}

/**
 * Fetches the public repositories for a given GitHub username, sorted by recent activity.
 */
export async function getGitHubRepos(username: string, limit: number = 6, token?: string): Promise<GitHubRepo[]> {
    try {
        const response = await safeFetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=${limit}`, token);
        if (!response.ok) {
            if (response.status === 403) {
                // Rate limit handled gracefully with simulation data
                const mockRepo = (id: number, name: string, lang: string) => ({
                    id, name, full_name: `${username}/${name}`, html_url: "#",
                    description: "Automated simulation repository due to API limits.", fork: false,
                    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), pushed_at: new Date().toISOString(),
                    homepage: null, size: 1024, stargazers_count: Math.floor(Math.random() * 100), language: lang, forks_count: Math.floor(Math.random() * 20),
                    archived: false, disabled: false, topics: ["simulation", "fallback"], open_issues_count: 0,
                    owner: { login: username, avatar_url: `https://github.com/${username}.png` }
                });
                return [
                    mockRepo(1, "core-engine", "TypeScript"),
                    mockRepo(2, "frontend-client", "React"),
                    mockRepo(3, "quantum-solver", "Python"),
                    mockRepo(4, "legacy-api", "Go")
                ].slice(0, limit);
            }
            throw new Error(`GitHub API error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch GitHub repos:", error);
        return [];
    }
}

/**
 * Calculates the primary languages used by a developer based on their recent public repos.
 */
export async function getGitHubLanguages(username: string, token?: string): Promise<{ name: string, count: number }[]> {
    const repos = await getGitHubRepos(username, 30, token); // Fetch up to 30 recent repos
    const languageCounts: Record<string, number> = {};

    repos.forEach(repo => {
        if (repo.language) {
            languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
        }
    });

    return Object.entries(languageCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count); // Sort descending
}

// ==========================================
// WORKSPACE INTEGRATION FUNCTIONS
// ==========================================

/**
 * Fetches specific details for a single repository (e.g., "facebook/react").
 */
export async function getRepoDetails(fullRepoName: string, token?: string): Promise<GitHubRepo | null> {
    try {
        const response = await safeFetch(`https://api.github.com/repos/${fullRepoName}`, token);
        if (!response.ok) {
            if (response.status === 403) {
                console.warn(`GitHub API Rate limit exceeded. Using fallback repo details.`);
                const [owner, name] = fullRepoName.split('/');
                return {
                    id: 999, name, full_name: fullRepoName, html_url: "#",
                    description: "Simulated repository details (API Limit).", fork: false,
                    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), pushed_at: new Date().toISOString(),
                    homepage: null, size: 2048, stargazers_count: 42, language: "TypeScript", forks_count: 5,
                    archived: false, disabled: false, topics: ["simulation"], open_issues_count: 1,
                    owner: { login: owner, avatar_url: `https://github.com/${owner}.png` }
                };
            }
            throw new Error(`Fetch error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch Workspace repo details:", error);
        return null;
    }
}

/**
 * Fetches and base64-decodes the README.md content.
 */
export async function getRepoReadme(fullRepoName: string, token?: string): Promise<string | null> {
    try {
        const response = await safeFetch(`https://api.github.com/repos/${fullRepoName}/readme`, token);
        if (!response.ok) {
            if (response.status === 404) return "No README.md found in this repository.";
            if (response.status === 403) return "# Simulated README\n\nGitHub API rate limit reached. This is a fallback mock README to keep the UI functional.";
            throw new Error(`Fetch error: ${response.status}`);
        }
        const data = await response.json();
        // GitHub API returns README content as Base64 encoded string
        return atob(data.content);
    } catch (error) {
        console.error("Failed to fetch Workspace repo README:", error);
        return null;
    }
}

/**
 * Fetches recent commits from the repository.
 */
export async function getRepoCommits(fullRepoName: string, limit: number = 10, token?: string): Promise<GitHubCommit[]> {
    try {
        const response = await safeFetch(`https://api.github.com/repos/${fullRepoName}/commits?per_page=${limit}`, token);
        if (!response.ok) {
            if (response.status === 403) {
                console.warn(`GitHub API Rate limit exceeded. Using fallback commits.`);
                const [owner] = fullRepoName.split('/');
                return Array.from({ length: 3 }).map((_, i) => ({
                    sha: `simulated-sha-${i}`,
                    commit: {
                        message: `Simulated commit ${i + 1} (API Limit)`,
                        author: { name: owner, date: new Date(Date.now() - i * 3600000).toISOString() }
                    },
                    author: { login: owner, avatar_url: `https://github.com/${owner}.png`, html_url: "#" },
                    html_url: "#"
                }));
            }
            throw new Error(`Fetch error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch Workspace repo commits:", error);
        return [];
    }
}
