import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { aiSquadService } from "../../lib/ai_squad";

export type Theme = "light" | "dark";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  bio?: string;
  skills?: string[];
  socials?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  reputation: number;
  rank: string;
  github_id?: string;
  github_stats?: {
    repos: number;
    followers: number;
    streak: number;
    total_commits: number;
  };
  external_integrations?: {
    platform: string;
    linked_at: string;
    status: 'active' | 'inactive';
  }[];
  velocity: number[];
  github_username?: string;
  follower_count?: number;
  following_count?: number;
  preferences?: any;
  auth_methods?: string[];
  level: number;
}

export interface Task {
  id: string;
  title: string;
  priority: "high" | "medium" | "low" | "urgent";
  status: "todo" | "in_progress" | "review" | "done";
  labels: string[];
  members: string[];
  deadline?: string;
  assignee?: {
    id: string;
    name: string;
    avatar: string;
  };
  assignee_id?: string;
  createdAt: string;
  description?: string;
  is_critical?: boolean;
  updated_at?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  member_role?: string;
  avatar: string;
  online: boolean;
  tasksDone: number;
}

export interface HistoryItem {
  id: string;
  type: "task" | "member" | "milestone" | "deployment" | "system";
  action: string;
  user: string;
  time: string;
  details?: string;
}


export interface PersonalNote {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  is_favorite: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface PersonalReminder {
  id: string;
  user_id: string;
  content: string;
  due_at?: string;
  is_completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: string;
}

export interface UserMilestone {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  date: string;
  type: string;
}

export interface UserHistoryItem {
  id: string;
  user_id: string;
  team_id?: string;
  action: string;
  type: string;
  details?: string;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string;
  metadata: any;
  created_at: string;
}

export interface Bounty {
  id: string;
  created_at: string;
  created_by: string;
  title: string;
  description: string;
  type: 'hack' | 'design' | 'research' | 'bug' | 'mission';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  reward_xp: number;
  status: 'open' | 'claimed' | 'in_progress' | 'completed' | 'failed';
  claimed_by?: string;
  team_id?: string;
  github_issue_url?: string;
  deadline?: string;
  metadata?: any;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
}


export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  time: string;
}



export interface TeamDocument {
  id: string;
  team_id: string;
  title: string;
  content: string;
  type: string;
  url?: string;
  lastEditedBy: string;
  updatedAt: string;
}

export interface PerformanceMetric {
  date: string;
  value: number;
  label: string;
}

export interface Team {
  id: string;
  name: string;
  github_repo?: string; // Legacy: keeping for backward compatibility if needed temporarily
  github_repos?: string[]; // Array of owner/repo strings
  event: string;
  type: "Hackathon" | "Project" | "Research" | "Open Source";
  visibility: "Public" | "Private";
  status: string;
  maxMembers: number;
  currentMembers: TeamMember[];
  tasksCount: number;
  progress: number;
  color: string;
  role: "Leader" | "Member";
  tasks: Task[];
  deadline?: string;
  description?: string;
  history: HistoryItem[];
  performance: PerformanceMetric[];
  invite_code?: string;
  mission_objective?: string;
  settings?: {
    allow_task_creation: boolean;
    allow_invites: boolean;
  };
}

export interface Post {
  id: string;
  type?: "text" | "code" | "project";
  user: string;
  user_id: string;
  handle: string;
  content: string;
  codeSnippet?: string;
  codeLanguage?: string;
  projectDetails?: {
    name: string;
    description: string;
    techStack: string[];
    openRoles: string[];
    repoName?: string;
  };
  tags: string[];
  likes: number;
  comments: number;
  time: string;
  avatar: string;
  isLiked?: boolean;
  imageUrl?: string;
}

export interface ChatMessage {
  id: string;
  user: string;
  user_id?: string;
  content: string;
  time: string;
  type: "text" | "ai" | "system";
  avatar?: string;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name: string;
  sender_avatar?: string;
  receiver_name: string;
  receiver_avatar?: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  parent_id?: string; // For replies
  author_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  created_at: string;
  replies?: PostComment[]; // For UI nesting
}


interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  user: User | null;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  login: (data: any) => void;
  logout: () => void;

  // Teams State
  teams: Team[];
  addTeam: (team: Partial<Team>) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  activeTeamId: string | null;
  setActiveTeamId: (id: string | null) => void;
  updateTeamSettings: (teamId: string, settings: any) => Promise<void>;
  updateTeamDeadline: (teamId: string, deadline: string | null) => Promise<void>;
  joinTeam: (code: string) => Promise<boolean>;
  removeMember: (teamId: string, userId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task["status"]) => void;
  addTask: (teamId: string, task: Omit<Task, "id" | "createdAt">) => void;
  deleteTask: (taskId: string) => void;
  setMissionObjective: (teamId: string, objective: string) => Promise<void>;
  assignMemberRole: (teamId: string, userId: string, role: string) => Promise<void>;
  toggleCritical: (taskId: string, isCritical: boolean) => Promise<void>;
  syncGitHubRepo: (teamId: string, fullRepoName: string) => Promise<boolean>;
  disconnectGitHubRepo: (teamId: string, fullRepoName: string) => Promise<boolean>;

  // Community & Chat State
  posts: Post[];
  addPost: (post: Omit<Post, "id" | "likes" | "comments" | "time" | "handle" | "user" | "avatar">) => void;
  deletePost: (postId: string) => Promise<void>;
  likePost: (postId: string) => void;
  addComment: (postId: string, content: string, parentId?: string) => Promise<void>;
  fetchComments: (postId: string) => Promise<PostComment[]>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  followingIds: string[];
  globalMessages: ChatMessage[];
  sendGlobalMessage: (content: string) => void;

  // Direct Messaging
  directMessages: DirectMessage[];
  sendDirectMessage: (receiverId: string, content: string) => Promise<void>;
  fetchDirectMessages: () => void;
  markDMAsRead: (messageId: string) => Promise<void>;
  markAllDMsAsRead: () => Promise<void>;

  // Notifications
  notifications: Notification[];
  markAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  addNotification: (notif: Omit<Notification, "id" | "read" | "time">) => void;

  // User Discovery & Networking
  searchUsers: (query: string) => Promise<User[]>;
  fetchPublicProfiles: () => Promise<User[]>;
  fetchTargetUserMetadata: (userId: string) => Promise<{ profile: User, teams: Team[], activities: Activity[], milestones: any[] } | null>;
  allProfiles: User[];

  // User Performance & History
  userHistory: HistoryItem[];
  userPerformance: PerformanceMetric[];

  // Documentation
  documents: TeamDocument[];
  addDocument: (doc: Omit<TeamDocument, "id" | "updatedAt" | "lastEditedBy" | "team_id">, file?: File) => void;
  updateDocument: (id: string, content: string) => void;

  // Personal Productivity
  personalNotes: PersonalNote[];
  personalReminders: PersonalReminder[];
  milestones: UserMilestone[];
  professionalHistory: UserHistoryItem[];
  addPersonalNote: (note: Omit<PersonalNote, "id" | "user_id" | "updatedAt" | "createdAt" | "is_favorite">) => Promise<void>;
  updatePersonalNote: (id: string, updates: Partial<PersonalNote>) => Promise<void>;
  deletePersonalNote: (id: string) => Promise<void>;
  addPersonalReminder: (reminder: Omit<PersonalReminder, "id" | "user_id" | "is_completed" | "createdAt">) => Promise<void>;
  toggleReminder: (id: string, isCompleted: boolean) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  addUserMilestone: (milestone: Omit<UserMilestone, "id" | "user_id">) => Promise<void>;
  addUserHistory: (action: string, type: string, teamId?: string, details?: string) => Promise<void>;
  increaseReputation: (amount: number, reason: string) => Promise<void>;

  // Realtime Chat
  teamMessages: ChatMessage[];
  fetchTeamMessages: (teamId: string) => void;
  sendTeamMessage: (teamId: string, content: string) => void;

  // GitHub Integration
  githubData: any | null;
  githubToken: string | null;
  connectGitHub: () => Promise<boolean>;
  connectGitHubManual: (username: string) => Promise<boolean>;
  disconnectGitHub: () => Promise<void>;

  // Social Stats
  followerCount: number;
  followingCount: number;
  fetchFollowersList: (userId: string) => Promise<User[]>;
  fetchFollowingList: (userId: string) => Promise<User[]>;

  // Activity & History
  activities: Activity[];
  recordActivity: (action_type: string, description: string, reputation_gain?: number, entity_type?: string | null, entity_id?: string | null) => Promise<void>;

  // Settings & Security
  sessions: any[];
  fetchSessions: () => Promise<void>;
  updatePreferences: (updates: any) => Promise<void>;

  loading: boolean;

  // Intelligence Metrics (Derived)
  analytics: {
    efficiency: number;
    pulseCount: number;
    skillMatrix: { subject: string; A: number; fullMark: number }[];
    trends: {
      efficiency: { val: number }[];
      pulse: { val: number }[];
      merit: { val: number }[];
    };
  };

  // Bounty Matrix
  bounties: Bounty[];
  fetchBounties: () => Promise<void>;
  createBounty: (bounty: Omit<Bounty, "id" | "created_at" | "created_by" | "status">) => Promise<void>;
  claimBounty: (bountyId: string) => Promise<void>;
  completeBounty: (bountyId: string) => Promise<void>;

  // Badges & Achievements
  userBadges: UserBadge[];
  fetchUserBadges: () => Promise<void>;
  awardBadge: (badgeId: string) => Promise<void>;

  getStandup: (teamId: string) => Promise<any>;
  getTaskSuggestions: (query: string) => Promise<string[]>;
  deleteTeam: (teamId: string) => Promise<boolean>;
}


export const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to get from local storage or default
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    // Check if item looks like a JSON object or array, otherwise return as string if T is string
    try {
      return JSON.parse(item);
    } catch {
      return item as unknown as T;
    }
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultValue;
  }
};

const defaultTeams: Team[] = [
  {
    id: "1",
    name: "AI Visionary",
    event: "Global Hack 2026",
    type: "Hackathon",
    visibility: "Public",
    status: "Active",
    maxMembers: 5,
    currentMembers: [
      { id: "u1", name: "Alex Hacker", role: "Team Leader", avatar: "https://i.pravatar.cc/100?u=alex", online: true, tasksDone: 5 },
      { id: "u2", name: "Sarah Chen", role: "Frontend Dev", avatar: "https://i.pravatar.cc/100?u=sarah", online: true, tasksDone: 3 },
    ],
    tasksCount: 12,
    progress: 65,
    color: "bg-hack-blue",
    role: "Leader",
    deadline: "2026-03-01",
    tasks: [
      { id: "t1", title: "Design System Implementation", priority: "high", status: "todo", labels: ["Design"], members: ["u1"], deadline: "2026-02-20", createdAt: new Date().toISOString() },
      { id: "t2", title: "Supabase Setup", priority: "medium", status: "todo", labels: ["Backend"], members: ["u2"], deadline: "2026-02-22", createdAt: new Date().toISOString() },
      { id: "t3", title: "Frontend Implementation", priority: "high", status: "in_progress", labels: ["Frontend"], members: ["u1", "u2"], createdAt: new Date().toISOString() },
    ],
    history: [
      { id: "h1", type: "task", action: "Task Completed", user: "Sarah Chen", time: "2h ago", details: "Supabase Setup" },
      { id: "h2", type: "system", action: "Mission Initialized", user: "System", time: "2d ago", details: "Workspace created" }
    ],
    performance: [
      { date: "Feb 10", value: 45, label: "Efficiency" },
      { date: "Feb 11", value: 52, label: "Efficiency" },
      { date: "Feb 12", value: 48, label: "Efficiency" },
      { date: "Feb 13", value: 65, label: "Efficiency" },
      { date: "Feb 14", value: 72, label: "Efficiency" },
    ]
  }
];

const defaultPosts: Post[] = [];

const defaultUserHistory: HistoryItem[] = [
  { id: "uh1", type: "task", action: "Auth Logic Refactor", user: "Alex Hacker", time: "4h ago", details: "Optimized login flow" },
  { id: "uh2", type: "deployment", action: "Production Release", user: "Alex Hacker", time: "1d ago", details: "v2.4.0 live" }
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [user, setUser] = useState<User | null>(null);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [githubData, setGithubData] = useState<any | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeTeamId, _setActiveTeamId] = useState<string | null>(() => {
    // Specialized handler for activeTeam which might be a plain string
    const val = localStorage.getItem("hm_active_team");
    if (!val) return null;
    try {
      // It might be a quoted string '"team-id"' or just 'team-id'
      const parsed = JSON.parse(val);
      return typeof parsed === 'string' ? parsed : val;
    } catch {
      return val;
    }
  });

  useEffect(() => {
    if (activeTeamId) {
      // Store as JSON string to be consistent, or just raw string.
      // Let's store as JSON string to match getFromStorage expectation generally, 
      // but clean string is better for simple IDs. 
      // Current helper expects JSON. Let's use getFromStorage logic:
      // If we store it as a plain string, getFromStorage try-catch will handle it.
      localStorage.setItem("hm_active_team", activeTeamId);

      // Also fetch documents since team changed
      fetchDocuments(activeTeamId);
    } else {
      localStorage.removeItem("hm_active_team");
    }
  }, [activeTeamId]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);
  const [teams, setTeams] = useState<Team[]>([]);

  const setActiveTeamId = (id: string | null) => {
    if (id && teams.length > 0 && !teams.find(t => t.id === id)) {
      console.warn("Attempted to set invalid team ID:", id);
      toast.error("Access Denied: You are not a member of this unit.");
      return;
    }
    _setActiveTeamId(id);
  };
  const [loading, setLoading] = useState(true);

  // Centralized Supabase Error Handler
  const handleSupabaseError = (error: any, context: string) => {
    console.error(`Supabase Error [${context}]:`, error);

    const errorMsg = error.message || "";
    const isNetworkError = errorMsg.includes('fetch') ||
      errorMsg.includes('network') ||
      errorMsg.includes('AbortError') ||
      error.status === 0;

    if (isNetworkError) {
      toast.error("CONNECTION BLOCKED", {
        description: "Your ISP might be blocking the connection. If the issue persists, try changing your DNS to 8.8.8.8 or 1.1.1.1.",
        duration: 10000,
        id: "connection-blocked-toast" // Use fixed ID to prevent spamming
      });
    } else {
      toast.error(`SYSTEM ERROR: ${context}`, {
        description: errorMsg,
        id: `error-${context}`
      });
    }
  };


  const [posts, setPosts] = useState<Post[]>(defaultPosts);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [teamMessages, setTeamMessages] = useState<ChatMessage[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [bounties, setBounties] = useState<Bounty[]>([]);

  // Personal Productivity State
  const [personalNotes, setPersonalNotes] = useState<PersonalNote[]>([]);
  const [personalReminders, setPersonalReminders] = useState<PersonalReminder[]>([]);
  const [milestones, setMilestones] = useState<UserMilestone[]>([]);
  const [professionalHistory, setProfessionalHistory] = useState<UserHistoryItem[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);


  // User Management & Reputation
  const addUserHistory = async (action: string, type: string, teamId?: string, details?: string) => {
    if (!user) return;
    await supabase.from('user_history').insert({
      user_id: user.id,
      team_id: teamId,
      action,
      type,
      details
    });
  };

  const recordActivity = async (action_type: string, description: string, reputation_gain: number = 0, entity_type: string | null = null, entity_id: string | null = null) => {
    if (!user) return;

    // 1. Insert into activities table
    const { error: actError } = await supabase.from('activities').insert({
      user_id: user.id,
      action_type,
      description,
      entity_type,
      entity_id,
      metadata: { reputation_gain }
    });

    if (actError) console.error("Activity log failed:", actError);

    // 2. Increase reputation if needed
    if (reputation_gain > 0) {
      const newPoints = (user.reputation || 0) + reputation_gain;

      // Update DB (Rank is handled by DB Trigger)
      await supabase.from('profiles').update({
        reputation_points: newPoints,
        updated_at: new Date().toISOString()
      }).eq('id', user.id);

      // Local optimistic update
      setUser((prev: User | null) => prev ? { ...prev, reputation: newPoints } : null);
      toast.success(`REPUTATION GAINED: +${reputation_gain} XP`, {
        style: { background: '#1e293b', color: '#38bdf8', border: '1px solid #334155' }
      });
    }
  };

  const increaseReputation = async (amount: number, reason: string) => {
    if (!user) return;
    await recordActivity("engagement_boost", reason, amount);
  };

  const addUserMilestone = async (milestone: Omit<UserMilestone, "id" | "user_id">) => {
    if (!user) return;
    const { error } = await supabase.from('user_milestones').insert({
      ...milestone,
      user_id: user.id
    });
    if (error) toast.error("Failed to record milestone.");
    else {
      toast.success("Achievement recorded in service record.");
      recordActivity("milestone_achieved", `Achieved milestone: ${milestone.title}`, 50, "milestone");
    }
  };

  // Initial Fetch for Posts & Notifications + Realtime Subscriptions
  useEffect(() => {
    fetchPosts();
    fetchNotifications();
    fetchSocialStats();
    fetchActivities();
    fetchBounties();

    // Set up Realtime Subscriptions for Community Grid
    const socialChannel = supabase
      .channel('social_matrix')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'followers' }, () => fetchSocialStats())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities', filter: `user_id=eq.${user?.id}` }, (payload) => {
        setActivities((prev: Activity[]) => [(payload.new as Activity), ...prev]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bounties' }, () => fetchBounties())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user?.id}` }, (payload) => {
        if (payload.new) {
          setFollowerCount(payload.new.follower_count || 0);
          setFollowingCount(payload.new.following_count || 0);
          setUser((prev: User | null) => prev ? {
            ...prev,
            reputation: payload.new.reputation_points,
            rank: payload.new.prestige_rank,
            level: payload.new.level
          } : null);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(socialChannel);
    };
  }, [user]);

  const fetchSocialStats = async () => {
    if (!user) return;

    // Fetch following IDs for following state
    const { data: followingData } = await supabase.from('followers').select('following_id').eq('follower_id', user.id);
    if (followingData) {
      setFollowingIds(followingData.map((f: any) => f.following_id));
    }

    // Fetch counts from profile
    const { data: profileData } = await supabase.from('profiles').select('follower_count, following_count').eq('id', user.id).single();
    if (profileData) {
      setFollowerCount(profileData.follower_count || 0);
      setFollowingCount(profileData.following_count || 0);
    }
  };

  const fetchFollowersList = async (userId: string): Promise<User[]> => {
    const { data, error } = await supabase
      .from('followers')
      .select('follower_id, profiles!followers_follower_id_fkey(*)')
      .eq('following_id', userId);

    if (error) {
      console.error("Error fetching followers:", error);
      return [];
    }

    return data.map((d: any) => ({
      id: d.profiles.id,
      name: d.profiles.full_name || "Unknown",
      email: d.profiles.email || "",
      avatar: d.profiles.avatar_url,
      role: d.profiles.primary_role,
      reputation: d.profiles.reputation_points || 0,
      rank: d.profiles.prestige_rank || 'Operative',
      velocity: d.profiles.weekly_velocity || [0, 0, 0, 0, 0, 0, 0],
      level: d.profiles.level || 1
    }));
  };

  const fetchFollowingList = async (userId: string): Promise<User[]> => {
    const { data, error } = await supabase
      .from('followers')
      .select('following_id, profiles!followers_following_id_fkey(*)')
      .eq('follower_id', userId);

    if (error) {
      console.error("Error fetching following:", error);
      return [];
    }

    return data.map((d: any) => ({
      id: d.profiles.id,
      name: d.profiles.full_name || "Unknown",
      email: d.profiles.email || "",
      avatar: d.profiles.avatar_url,
      role: d.profiles.primary_role,
      reputation: d.profiles.reputation_points || 0,
      rank: d.profiles.prestige_rank || 'Operative',
      velocity: d.profiles.weekly_velocity || [0, 0, 0, 0, 0, 0, 0],
      level: d.profiles.level || 1
    }));
  };

  const followUser = async (targetId: string) => {
    if (!user) return;
    const { error } = await supabase.from('followers').insert({
      follower_id: user.id,
      following_id: targetId
    });
    if (error) toast.error("Failed to follow operative.");
    else {
      setFollowingIds(prev => [...prev, targetId]);
      toast.success("Connection established.");
      recordActivity("social_connection", `Followed operative ${targetId}`, 5, "user", targetId);
    }
  };

  const unfollowUser = async (targetId: string) => {
    if (!user) return;
    const { error } = await supabase.from('followers')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetId);
    if (error) toast.error("Failed to severe connection.");
    else {
      setFollowingIds(prev => prev.filter(id => id !== targetId));
      toast.success("Connection severed.");
      recordActivity("social_disconnection", `Unfollowed operative ${targetId}`, -2, "user", targetId);
    }
  };

  const fetchActivities = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setActivities(data);
  };

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id, content, type, code_snippet, code_language, project_details, tags, 
          likes_count, comments_count, created_at, author_id, image_url,
          profiles:author_id(*)
        `)
        .order('created_at', { ascending: false });

      if (postsError) {
        handleSupabaseError(postsError, "fetchPosts");
        const { data: fallbackData } = await supabase
          .from('posts')
          .select('id, content, author_id, tags, created_at, profiles:author_id(*)')
          .order('created_at', { ascending: false });

        if (fallbackData) {
          setPosts(fallbackData.map((p: any) => ({
            id: p.id,
            type: "text",
            user: p.profiles?.full_name || "Anon",
            user_id: p.author_id,
            handle: "@" + (p.profiles?.full_name?.toLowerCase().replace(/\s/g, "_") || "anon"),
            content: p.content,
            tags: p.tags || [],
            likes: 0,
            comments: 0,
            time: new Date(p.created_at).toLocaleDateString(),
            avatar: p.profiles?.avatar_url
          })));
        }
        return;
      }

      let likedPostIds: Set<string> = new Set();
      if (user) {
        const { data: likesData } = await supabase.from('post_likes').select('post_id').eq('user_id', user.id);
        if (likesData) {
          likedPostIds = new Set(likesData.map((l: any) => l.post_id));
        }
      }

      if (postsData && postsData.length > 0) {
        setPosts(postsData.map((p: any) => ({
          id: p.id,
          type: p.type || "text",
          user: p.profiles?.full_name || "Anon",
          user_id: p.author_id,
          handle: "@" + (p.profiles?.full_name?.toLowerCase().replace(/\s/g, "_") || "anon"),
          content: p.content,
          codeSnippet: p.code_snippet,
          codeLanguage: p.code_language,
          projectDetails: p.project_details,
          tags: p.tags || [],
          likes: p.likes_count || 0,
          comments: p.comments_count || 0,
          time: new Date(p.created_at).toLocaleDateString(),
          avatar: p.profiles?.avatar_url,
          isLiked: likedPostIds.has(p.id),
          imageUrl: p.image_url
        })));
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error("Critical error in fetchPosts:", err);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) {
      setNotifications(data.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.is_read,
        time: new Date(n.created_at).toLocaleTimeString()
      })));
    }
  };

  const [userHistory, setUserHistory] = useState<HistoryItem[]>(() => getFromStorage("hm_history", defaultUserHistory));
  const [globalMessages, setGlobalMessages] = useState<ChatMessage[]>(() => getFromStorage("hm_messages", [
    { id: "m1", user: "System", content: "Welcome to the global hacker lounge! ðŸŒ", time: "09:00 AM", type: "system" },
    { id: "m2", user: "HackerOne", content: "Anyone interested in joining a Solana project?", time: "10:15 AM", type: "text", avatar: "https://i.pravatar.cc/100?u=h1" }
  ]));

  const [userPerformance, setUserPerformance] = useState<PerformanceMetric[]>([
    { date: "Mon", value: 80, label: "Focus Score" },
    { date: "Tue", value: 65, label: "Focus Score" },
    { date: "Wed", value: 95, label: "Focus Score" },
    { date: "Thu", value: 70, label: "Focus Score" },
    { date: "Fri", value: 85, label: "Focus Score" },
  ]);

  const [documents, setDocuments] = useState<TeamDocument[]>([]);
  const [allProfiles, setAllProfiles] = useState<User[]>([]);

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Only set GitHub token if the current session provider is actually GitHub
        const provider = session.user.app_metadata.provider;
        const isGithub = provider === 'github';
        const token = isGithub ? (session.provider_token || null) : null;

        setGithubToken(token);
        try {
          await fetchProfile(session.user, token);
        } catch (e) {
          console.error("Profile fetch failed", e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const provider = session.user.app_metadata.provider;
        const isGithub = provider === 'github';
        const token = isGithub ? (session.provider_token || null) : null;

        setGithubToken(token);
        fetchProfile(session.user, token);
      }
      else {
        setUser(null);
        setTeams([]);
        setGithubData(null);
        setGithubToken(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser: any, token?: string | null) => {
    // 1. Try to fetch profile
    let { data, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();

    // 2. If no profile (error), create one immediately
    if (error || !data) {
      console.log("Profile missing, creating new profile for:", authUser.id);
      const newProfile = {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Agent',
        avatar_url: authUser.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${authUser.email}`,
        primary_role: 'Full Stack Developer', // Default
        updated_at: new Date().toISOString()
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .upsert(newProfile)
        .select()
        .single();

      if (createError) {
        handleSupabaseError(createError, "fetchProfile_create");
        return;
      }
      data = createdProfile;
    }

    if (data) {
      const authMethods = authUser.identities?.map((id: any) => id.provider) || [];

      // Auto-sync GitHub identity if present but missing in profile
      let githubUsername = data.github_username;
      if (authMethods.includes('github') && !githubUsername) {
        githubUsername = authUser.user_metadata?.preferred_username ||
          authUser.user_metadata?.user_name ||
          authUser.identities?.find((id: any) => id.provider === 'github')?.identity_data?.user_name;

        if (githubUsername) {
          await supabase.from('profiles').update({ github_username: githubUsername }).eq('id', data.id);
        }
      }

      const formattedUser: User = {
        id: data.id,
        name: data.full_name || authUser.email,
        email: authUser.email,
        avatar: data.avatar_url,
        role: data.primary_role,
        bio: data.bio || "",
        skills: data.skills || [],
        socials: data.social_links || {},
        reputation: data.reputation_points || 0,
        rank: data.prestige_rank || 'Operative',
        velocity: data.weekly_velocity || [0, 0, 0, 0, 0, 0, 0],
        github_username: githubUsername,
        follower_count: data.follower_count || 0,
        following_count: data.following_count || 0,
        preferences: data.preferences || {},
        auth_methods: authMethods,
        level: data.level || 1
      };
      setUser(formattedUser);
      // Pass the user object directly to avoid state race condition
      await fetchTeams(formattedUser);

      // Track session silently
      trackSession();
      fetchSessions();

      // Fetch GitHub data if connected
      if (githubUsername) {
        fetchGitHubData(githubUsername, token || githubToken);
      }
    }
  };

  const trackSession = async () => {
    // Basic session metadata tracking
    const ua = navigator.userAgent;
    const deviceType = /Mobile|Android|iPhone/i.test(ua) ? 'Mobile' : 'Desktop';
    const os = ua.match(/\(([^)]+)\)/)?.[1] || 'Unknown OS';
    const browser = (ua.match(/(Firefox|Chrome|Safari|Edge|Opera)/)?.[0]) || 'Unknown';

    await supabase.rpc('sync_user_session', {
      p_device_type: deviceType,
      p_browser: browser,
      p_os: os,
      p_ip: 'Dynamic',
      p_location: 'Auto-detected'
    });
  };

  const fetchSessions = async (forcedUser?: User) => {
    const targetUser = forcedUser || user;
    if (!targetUser) return;

    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', targetUser.id)
      .order('last_active', { ascending: false });

    if (data) {
      setSessions(data);
    }
  };

  const updatePreferences = async (updates: any) => {
    if (!user) return;

    // Merge updates deeply if it's an object, but keep it simple for now
    const newPrefs = { ...user.preferences, ...updates };

    // Optimistic Update
    setUser((prev: User | null) => prev ? { ...prev, preferences: newPrefs } : null);

    const { error } = await supabase
      .from('profiles')
      .update({
        preferences: newPrefs,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      console.error("Preference sync failed:", error);
      toast.error("Cloud sync failed. Reverting...");
      // In a real app, we'd fetch fresh data here to revert correctly
    }
  };

  const fetchGitHubData = async (username: string, tokenOverride?: string | null) => {
    try {
      const activeToken = tokenOverride || githubToken;
      const { getGitHubProfile, getGitHubRepos, getGitHubLanguages } = await import("../../lib/github");
      const profile = await getGitHubProfile(username, activeToken || undefined);
      if (!profile) return;
      const repos = await getGitHubRepos(username, 5, activeToken || undefined);
      const languages = await getGitHubLanguages(username, activeToken || undefined);

      setGithubData({
        profile,
        repos,
        languages
      });
    } catch (e) {
      console.error("Failed to load GitHub data:", e);
    }
  };

  const connectGitHub = async (): Promise<boolean> => {
    if (!user) return false;
    try {
      // Trigger Supabase Identity Linking
      const { error } = await supabase.auth.linkIdentity({
        provider: 'github',
        options: {
          redirectTo: window.location.origin + '/settings?status=github_link_success'
        }
      });

      if (error) throw error;
      return true;
    } catch (e: any) {
      console.error("GitHub Link Error:", e);
      // If error suggests identity already linked, we might need a different toast
      if (e.message?.includes('disabled')) {
        toast.error("Manual Linking is disabled in your Supabase Auth settings. Enable it in the Dashboard or enter username manually.");
      } else if (e.message?.includes('already linked')) {
        toast.error("This GitHub account is already linked to another profile.");
      } else {
        toast.error("Failed to initiate GitHub connection.");
      }
      return false;
    }
  };

  const connectGitHubManual = async (username: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const { getGitHubProfile } = await import("../../lib/github");
      const profile = await getGitHubProfile(username, githubToken || undefined);

      if (!profile) {
        toast.error(`GitHub user '${username}' not found.`);
        return false;
      }

      await supabase.from('profiles').update({ github_username: username }).eq('id', user.id);
      setUser(prev => prev ? { ...prev, github_username: username } : null);
      fetchGitHubData(username);
      recordActivity("github_integration", "Manually connected GitHub username", 5, "user");
      toast.success("GitHub Username Connected.");
      return true;
    } catch (e) {
      toast.error("Manual connection failed.");
      return false;
    }
  };

  const disconnectGitHub = async (): Promise<void> => {
    if (!user) return;
    try {
      const { error } = await supabase.from('profiles').update({
        github_username: null
      }).eq('id', user.id);

      if (error) throw error;

      setUser((prev: any) => ({ ...prev, github_username: undefined }));
      setGithubData(null);
      toast.success("GitHub Disconnected.");
      recordActivity("github_integration", "Disconnected GitHub account", -5, "user");
    } catch (e) {
      toast.error("Failed to disconnect GitHub.");
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    // Optimistic Update
    setUser((prev: User | null) => prev ? { ...prev, ...updates } : null);

    // Map frontend fields to DB columns
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.full_name = updates.name;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
    if (updates.socials !== undefined) dbUpdates.social_links = updates.socials;
    if (updates.role) dbUpdates.primary_role = updates.role;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id);

    if (error) {
      console.error("Failed to update profile:", error);
      // Revert if needed, or just toast error
    } else {
      recordActivity("profile_update", "Updated personal profile", 3, "user");
    }
  };


  const fetchDocuments = async (teamId: string) => {
    const { data } = await supabase.from('documents').select('*, profiles(full_name)').eq('team_id', teamId);
    if (data) {
      setDocuments(data.map((d: any) => ({
        id: d.id,
        team_id: d.team_id,
        title: d.title,
        content: d.content,
        type: d.type,
        url: d.url,
        updatedAt: new Date(d.updated_at).toLocaleDateString(),
        lastEditedBy: d.profiles?.full_name || 'Unknown'
      })));
    }
  };

  // Data Fetching
  const fetchTeams = async (currentUser?: any) => {
    const targetUser = currentUser || user;
    if (!targetUser) return;

    // 2-Step Fetch for Robustness
    // Step 1: Get IDs of teams I belong to
    const { data: myMemberships, error: memError } = await supabase
      .from('memberships')
      .select('*') // Select all to be safe, or just team_id. If joined_at missing, it won't crash here.
      .eq('user_id', targetUser.id);

    if (memError) {
      handleSupabaseError(memError, "fetchTeams_memberships");
      return;
    }

    if (!myMemberships || myMemberships.length === 0) {
      setTeams([]);
      setLoading(false);
      return;
    }

    const teamIds = myMemberships.map((m: any) => m.team_id);
    const joinedAtMap = new Map(myMemberships.map((m: any) => [m.team_id, m.joined_at]));

    // Step 2: Fetch full team details for these IDs
    const { data: teamsData, error } = await supabase
      .from('teams')
      .select(`
        *,
        memberships(*, profiles(*)),
        tasks(*, profiles:assignee_id(*))
      `)
      .in('id', teamIds);

    if (error) {
      handleSupabaseError(error, "fetchTeams_details");
      return;
    }

    // Step 3: Fetch Audit Logs for these teams (Last 50 events total, or per team?)
    // Fetching plenty to ensure each team has some.
    const { data: auditLogsData } = await supabase
      .from('audit_logs')
      .select(`*, profiles(full_name)`)
      .in('team_id', teamIds)
      .order('created_at', { ascending: false })
      .limit(100);

    const logsByTeam = new Map();
    if (auditLogsData) {
      auditLogsData.forEach((log: any) => {
        if (!logsByTeam.has(log.team_id)) logsByTeam.set(log.team_id, []);
        logsByTeam.get(log.team_id).push({
          id: log.id,
          action: log.action,
          details: log.details,
          type: log.type === 'task' ? 'task' : log.type === 'security' ? 'security' : 'system' as any,
          time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          user: log.profiles?.full_name || 'System', // Use profile name or System
          timestamp: log.created_at,
          date: new Date(log.created_at).toLocaleDateString()
        });
      });
    }

    // Manual Sort by joined_at if available in the data structure
    if (teamsData) {
      teamsData.sort((a: any, b: any) => {
        const dateA = new Date(joinedAtMap.get(a.id) || a.created_at).getTime();
        const dateB = new Date(joinedAtMap.get(b.id) || b.created_at).getTime();
        return dateB - dateA;
      });

      const formattedTeams: Team[] = teamsData.map((t: any) => {
        // Calculate Performance (Velocity: Tasks Done per Day over last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();

        const tasks = t.tasks || [];
        const performance: PerformanceMetric[] = last7Days.map(date => {
          // Count tasks completed on this date (approximate using updated_at for done tasks)
          // or created_at for activity? Let's use 'done' tasks status update if possible.
          // Since we don't have task history here, we'll map 'created_at' as activity volume for now
          // OR check if status is done and updated_at is this date.
          const activityCount = tasks.filter((task: any) => {
            const dateToUse = task.updated_at || task.created_at;
            if (!dateToUse) return false;
            const taskDate = dateToUse.split('T')[0];
            return taskDate === date && (task.status === 'done' || task.status === 'in_progress');
          }).length;

          // Scale it 0-100 based on some target (e.g. 5 tasks = 100%)
          return {
            date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
            value: Math.min(activityCount * 20, 100),
            label: "Efficiency"
          };
        });

        return {
          id: t.id,
          name: t.name,
          description: t.description,
          event: "Hackathon 2026",
          type: "Project",
          visibility: "Public",
          status: t.status,
          maxMembers: 5,
          currentMembers: t.memberships.map((m: any) => ({
            id: m.profiles.id,
            name: m.profiles.full_name,
            role: m.role,
            member_role: m.member_role || m.role,
            avatar: m.profiles.avatar_url,
            online: true,
            tasksDone: tasks.filter((task: any) => task.assignee_id === m.profiles.id && task.status === 'done').length
          })),
          tasksCount: t.tasks.length,
          progress: tasks.length > 0 ? Math.round((tasks.filter((task: any) => task.status === 'done').length / tasks.length) * 100) : 0,
          color: "bg-hack-blue",
          role: t.owner_id === targetUser.id ? "Leader" : (myMemberships.find((m: any) => m.team_id === t.id)?.role === 'Leader' ? "Leader" : "Member"),

          tasks: tasks.map((task: any) => ({
            id: task.id,
            title: task.title,
            priority: task.priority,
            status: task.status,
            labels: task.tags || [],
            members: [task.assignee_id].filter(Boolean),
            assignee_id: task.assignee_id,
            assignee: task.profiles ? {
              id: task.profiles.id,
              name: task.profiles.full_name,
              avatar: task.profiles.avatar_url
            } : undefined,
            deadline: task.deadline,
            description: task.description,
            is_critical: task.is_critical || false,
            updated_at: task.updated_at,
            createdAt: task.created_at
          })),
          mission_objective: t.mission_objective || "",
          deadline: t.deadline || undefined,
          invite_code: t.invite_code || undefined,
          github_repo: t.github_repo || undefined,
          github_repos: t.github_repos || [],
          settings: t.settings || { allow_task_creation: true, allow_invites: true },
          history: logsByTeam.get(t.id) || [],
          performance: performance
        };
      });
      setTeams(formattedTeams);
    }
  };

  // Realtime Subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`user_updates_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => {
        fetchTeams(user);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memberships', filter: `user_id=eq.${user.id}` }, () => {
        fetchTeams(user);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTeams(user);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
        if (payload.new) {
          const newData = payload.new as any;
          setUser((prev: User | null) => prev ? {
            ...prev,
            name: newData.full_name || prev.name,
            bio: newData.bio || prev.bio,
            skills: newData.skills || prev.skills,
            socials: newData.social_links || prev.socials,
            reputation: newData.reputation_points,
            rank: newData.prestige_rank,
            level: newData.level,
            preferences: newData.preferences || prev.preferences
          } : null);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_sessions', filter: `user_id=eq.${user.id}` }, () => {
        fetchSessions();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => fetchNotifications())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Team Chat Logic
  const fetchTeamMessages = async (teamId: string) => {
    const { data } = await supabase.from('messages')
      .select('*, profiles(*)')
      .eq('team_id', teamId)
      .order('created_at', { ascending: true });

    if (data) {
      setTeamMessages(data.map((m: any) => ({
        id: m.id,
        user: m.profiles?.full_name || "Anon",
        content: m.content,
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "text",
        avatar: m.profiles?.avatar_url
      })));
    }
  };

  const sendTeamMessage = async (teamId: string, content: string) => {
    if (!user) return;
    await supabase.from('messages').insert({
      content,
      author_id: user.id,
      team_id: teamId
    });
    recordActivity("team_chat", `Sent message in team chat: ${content.substring(0, 50)}...`, 1, "team", teamId);
  };

  useEffect(() => {
    if (!activeTeamId) return;
    fetchTeamMessages(activeTeamId);

    const chatChannel = supabase.channel(`team_chat_${activeTeamId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `team_id=eq.${activeTeamId}` }, () => fetchTeamMessages(activeTeamId))
      .subscribe();

    const docsChannel = supabase.channel(`team_docs_${activeTeamId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents', filter: `team_id=eq.${activeTeamId}` }, () => fetchDocuments(activeTeamId))
      .subscribe();

    const tasksChannel = supabase.channel(`team_tasks_${activeTeamId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `team_id=eq.${activeTeamId}`
      }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          // Fetch full task with joins since payload doesn't include them
          const { data: newTask } = await supabase
            .from('tasks')
            .select('*, profiles:assignee_id(*)')
            .eq('id', payload.new.id)
            .single();

          if (newTask) {
            const formatted = {
              id: newTask.id,
              title: newTask.title,
              priority: newTask.priority,
              status: newTask.status,
              labels: newTask.tags || [],
              members: [newTask.assignee_id].filter(Boolean),
              assignee_id: newTask.assignee_id,
              assignee: newTask.profiles ? {
                id: newTask.profiles.id,
                name: newTask.profiles.full_name,
                avatar: newTask.profiles.avatar_url
              } : undefined,
              deadline: newTask.deadline,
              description: newTask.description,
              createdAt: newTask.created_at,
              is_critical: newTask.is_critical
            };

            setTeams(prev => prev.map(t => {
              if (t.id === activeTeamId) {
                if (t.tasks.some(existing => existing.id === formatted.id)) return t;
                return { ...t, tasks: [...t.tasks, formatted] };
              }
              return t;
            }));
          }
        } else if (payload.eventType === 'UPDATE') {
          // Fetch full task with joins to ensure assignee profile is correct
          const { data: updatedTask } = await supabase
            .from('tasks')
            .select('*, profiles:assignee_id(*)')
            .eq('id', payload.new.id)
            .single();

          if (updatedTask) {
            const formatted = {
              id: updatedTask.id,
              title: updatedTask.title,
              priority: updatedTask.priority,
              status: updatedTask.status,
              labels: updatedTask.tags || [],
              members: [updatedTask.assignee_id].filter(Boolean),
              assignee_id: updatedTask.assignee_id,
              assignee: updatedTask.profiles ? {
                id: updatedTask.profiles.id,
                name: updatedTask.profiles.full_name,
                avatar: updatedTask.profiles.avatar_url
              } : undefined,
              deadline: updatedTask.deadline,
              description: updatedTask.description,
              createdAt: updatedTask.created_at,
              is_critical: updatedTask.is_critical
            };

            setTeams(prev => prev.map(team => {
              if (team.id === activeTeamId) {
                return {
                  ...team,
                  tasks: team.tasks.map(t => t.id === formatted.id ? formatted : t)
                };
              }
              return team;
            }));
          }
        } else if (payload.eventType === 'DELETE') {
          setTeams(prev => prev.map(team => {
            if (team.id === activeTeamId) {
              return {
                ...team,
                tasks: team.tasks.filter(t => t.id !== payload.old.id)
              };
            }
            return team;
          }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(docsChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, [activeTeamId]);


  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    updatePreferences({ theme: newTheme });
  };

  const login = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) handleSupabaseError(error, "login");
    } catch (err) {
      handleSupabaseError(err, "login_critical");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTeams([]);
    recordActivity("user_logout", "Logged out from the system", 0, "user");
  };

  const addTeam = async (teamData: Partial<Team>) => {
    if (!user) return;

    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const { data: team, error } = await supabase.from('teams').insert({
      name: teamData.name,
      description: teamData.description,
      owner_id: user.id,
      status: 'Building',
      invite_code: inviteCode,
      deadline: teamData.deadline
    }).select().single();

    if (team) {
      await supabase.from('memberships').insert({
        user_id: user.id,
        team_id: team.id,
        role: 'Leader'
      });
      await fetchTeams(user); // Pass user to avoid stale closure
      toast.success(`New squad "${team.name}" deployed.`);
      recordActivity("team_creation", `Deployed new squad: ${team.name}`, 30, "team", team.id);
    }
  };

  const syncGitHubRepo = async (teamId: string, fullRepoName: string): Promise<boolean> => {
    try {
      const teamToUpdate = teams.find(t => t.id === teamId);
      if (!teamToUpdate) throw new Error("Team not found");

      const currentRepos = teamToUpdate.github_repos || [];
      if (currentRepos.includes(fullRepoName)) {
        toast.info("Repository already linked.");
        return true;
      }

      const newRepos = [...currentRepos, fullRepoName];

      const { error } = await supabase.from('teams').update({
        github_repos: newRepos,
        github_repo: currentRepos.length === 0 ? fullRepoName : teamToUpdate.github_repo // Legacy fallback
      }).eq('id', teamId);

      if (error) {
        if (error.message?.includes('github_repos')) {
          // Fallback if SQL migration wasn't run
          const { error: fallbackError } = await supabase.from('teams').update({
            github_repo: fullRepoName
          }).eq('id', teamId);
          if (fallbackError) throw fallbackError;
        } else {
          throw error;
        }
      }

      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, github_repos: newRepos, github_repo: currentRepos.length === 0 ? fullRepoName : t.github_repo } : t));
      toast.success("Repository linked successfully!");
      recordActivity("github_repo_sync", `Synced GitHub repository ${fullRepoName} to team`, 15, "team", teamId);
      return true;
    } catch (e) {
      console.error("Failed to sync GitHub repo to team", e);
      toast.error("Failed to link repository to squad.");
      return false;
    }
  };

  const disconnectGitHubRepo = async (teamId: string, fullRepoName: string): Promise<boolean> => {
    try {
      const teamToUpdate = teams.find(t => t.id === teamId);
      if (!teamToUpdate) throw new Error("Team not found");

      const currentRepos = teamToUpdate.github_repos || [];
      const newRepos = currentRepos.filter(r => r !== fullRepoName);

      const { error } = await supabase.from('teams').update({
        github_repos: newRepos,
        github_repo: newRepos.length > 0 ? newRepos[0] : null
      }).eq('id', teamId);

      if (error) {
        if (error.message?.includes('github_repos')) {
          // Fallback if SQL migration wasn't run
          const { error: fallbackError } = await supabase.from('teams').update({
            github_repo: null
          }).eq('id', teamId);
          if (fallbackError) throw fallbackError;
        } else {
          throw error;
        }
      }

      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, github_repos: newRepos, github_repo: newRepos.length > 0 ? newRepos[0] : undefined } : t));
      toast.success("Repository disconnected successfully.");
      recordActivity("github_repo_disconnect", `Disconnected GitHub repository ${fullRepoName} from team`, -5, "team", teamId);
      return true;
    } catch (e) {
      console.error("Failed to disconnect GitHub repo", e);
      toast.error("Failed to disconnect repository.");
      return false;
    }
  };

  const joinTeam = async (code: string): Promise<boolean> => {
    if (!user) return false;
    const trimmedCode = code.trim().toUpperCase();

    // Find the team by invite code
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('invite_code', trimmedCode)
      .single();

    if (teamError || !team) {
      toast.error('Invalid invite code. Team not found.');
      return false;
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('memberships')
      .select('id')
      .eq('team_id', team.id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      toast.info('You are already a member of this team.');
      return true; // Treat as success to close modal, or false? Let's return true but specific toast.
    }

    // Join as Member
    const { error: joinError } = await supabase.from('memberships').insert({
      user_id: user.id,
      team_id: team.id,
      role: 'Member'
    });

    if (joinError) {
      toast.error('Failed to join team. Please try again.');
      return false;
    }

    toast.success(`Joined team: ${team.name}`);
    await fetchTeams(user);
    recordActivity("mobilization", `Mobilized into a new squad: ${team.name}`, 20, "team", team.id);
    return true;
  };

  const updateTeamDeadline = async (teamId: string, deadline: string | null) => {
    if (!user) return;

    // Optimistic update for immediate feedback
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, deadline: deadline || undefined } : t));

    const { error } = await supabase
      .from('teams')
      .update({ deadline })
      .eq('id', teamId);

    if (error) {
      console.error("Failed to update deadline:", error);
      toast.error("Signal failed. Deadline synchronization incomplete.");
      fetchTeams(user); // Revert to server state
    } else {
      toast.success(deadline ? "MISSION TIMELINE SYNCHRONIZED" : "MISSION TIMELINE RESET");
      fetchTeams(user);
    }
  };


  const updateTeam = (teamId: string, updates: Partial<Team>) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...updates } : t));
  };

  const updateTeamSettings = async (teamId: string, settings: any) => {
    // Optimistic Update
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, settings: { ...t.settings, ...settings } } : t));

    const { error } = await supabase.from('teams').update({ settings }).eq('id', teamId);
    if (error) {
      toast.error("Failed to update protocols");
      fetchTeams(); // Revert
    } else {
      toast.success("Protocols Updated");
      recordActivity("team_settings_update", "Updated team protocols", 5, "team", teamId);
    }
  };

  const removeMember = async (teamId: string, userId: string) => {
    if (!confirm("Are you sure you want to remove this operative?")) return;

    // Fetch member name for notification before removal
    const team = teams.find(t => t.id === teamId);
    const member = team?.currentMembers.find(m => m.id === userId);

    // Optimistic Update
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          currentMembers: t.currentMembers.filter(m => m.id !== userId)
        };
      }
      return t;
    }));

    const { error } = await supabase.from('memberships').delete().eq('team_id', teamId).eq('user_id', userId);

    if (error) {
      toast.error("Failed to remove operative");
      fetchTeams();
    } else {
      toast.success("Operative Removed");

      // Notify the removed member
      sendNotification(userId, "Neural Link Terminated", `You have been removed from squadron: ${team?.name || 'Unknown'}`, "warning");

      recordActivity("team_member_removal", `Removed operative ${member?.name || userId} from team`, -10, "team", teamId);
    }
  };

  const deleteTeam = async (teamId: string) => {
    if (!user) return false;

    const team = teams.find(t => t.id === teamId);
    if (!team) return false;

    // 1. Gather all member IDs to notify before deletion
    const memberIds = team.currentMembers.filter(m => m.id !== user.id).map(m => m.id);

    // 2. Perform deletion (cascading deletes handled by DB)
    const { error } = await supabase.from('teams').delete().eq('id', teamId);

    if (error) {
      console.error("Team deletion failed:", error);
      toast.error("Failed to abort mission. System override active.");
      return false;
    }

    // 3. Send notifications to all former members
    for (const memberId of memberIds) {
      sendNotification(memberId, "Mission Aborted", `Squadron "${team.name}" has been disbanded by the leader.`, "error");
    }

    toast.success(`MISSION ABORTED: ${team.name} has been purged.`);
    recordActivity("team_deletion", `Aborted mission and purged squad: ${team.name}`, -50, "team", teamId);

    // 4. Update local state
    setTeams(prev => prev.filter(t => t.id !== teamId));
    setActiveTeamId(null);
    return true;
  };

  const setMissionObjective = async (teamId: string, objective: string) => {
    // Optimistic update
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, mission_objective: objective } : t));
    const { error } = await supabase.from('teams').update({ mission_objective: objective }).eq('id', teamId);
    if (error) {
      toast.error("Failed to update mission objective");
      fetchTeams();
    } else {
      toast.success("Mission Objective Set");
      recordActivity("mission_objective_set", `Set mission objective: ${objective.substring(0, 50)}...`, 10, "team", teamId);
    }
  };

  const assignMemberRole = async (teamId: string, userId: string, role: string) => {
    // Optimistic update
    setTeams(prev => prev.map(t => {
      if (t.id !== teamId) return t;
      return {
        ...t,
        currentMembers: t.currentMembers.map(m => m.id === userId ? { ...m, member_role: role } : m)
      };
    }));
    const { error } = await supabase.from('memberships')
      .update({ member_role: role })
      .eq('team_id', teamId)
      .eq('user_id', userId);
    if (error) {
      toast.error("Failed to assign role");
      fetchTeams();
    } else {
      toast.success(`Role Updated: ${role}`);
      recordActivity("team_role_assignment", `Assigned role "${role}" to operative ${userId}`, 5, "team", teamId);
    }
  };

  const toggleCritical = async (taskId: string, isCritical: boolean) => {
    // Optimistic update
    setTeams(prev => prev.map(team => ({
      ...team,
      tasks: team.tasks.map(t => t.id === taskId ? { ...t, is_critical: isCritical } : t)
    })));
    const { error } = await supabase.from('tasks').update({ is_critical: isCritical }).eq('id', taskId);
    if (error) {
      toast.error("Failed to update task priority");
      fetchTeams();
    } else {
      toast.success(isCritical ? "âš¡ Task Marked Critical" : "Task Priority Normalized");
      recordActivity("task_criticality_toggle", `Task ${taskId} marked as critical: ${isCritical}`, isCritical ? 5 : 0, "task", taskId);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task["status"]) => {
    // Find task to check assignee and current status
    let taskToUpdate: Task | undefined;
    teams.forEach(t => {
      const found = t.tasks.find(tk => tk.id === taskId);
      if (found) taskToUpdate = found;
    });

    // Optimistic Update
    setTeams(prev => prev.map(team => {
      if (team.tasks.some(t => t.id === taskId)) {
        return {
          ...team,
          tasks: team.tasks.map(t => t.id === taskId ? { ...t, status } : t)
        };
      }
      return team;
    }));

    const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId);

    if (!error && status === 'done' && taskToUpdate && taskToUpdate.status !== 'done') {
      // Award reputation if the current user is the assignee
      if (user && taskToUpdate.assignee_id === user.id) {
        let xpReward = 25; // Base points
        if (taskToUpdate.priority === 'urgent') xpReward = 100;
        else if (taskToUpdate.priority === 'high') xpReward = 50;
        else if (taskToUpdate.priority === 'low') xpReward = 10;

        // Deadline Check
        const isOverdue = taskToUpdate.deadline && new Date().getTime() > new Date(taskToUpdate.deadline).getTime();
        if (isOverdue) {
          xpReward = Math.floor(xpReward * 0.5); // 50% penalty for late completion
          toast.warning(`OPERATIONAL DELAY: Mission deadline exceeded. XP reward halved.`, {
            style: { background: '#7f1d1d', color: '#fca5a5', border: '1px solid #991b1b' }
          });
        }

        await recordActivity(
          "task_reward",
          `Completed ${taskToUpdate.priority} priority protocol: ${taskToUpdate.title}${isOverdue ? ' (DELAYED)' : ''}`,
          xpReward,
          "task",
          taskId
        );
      }
    } else if (!error && status !== 'done' && taskToUpdate && taskToUpdate.status === 'done') {
      // If task was done and now changed to not done, deduct points
      if (user && taskToUpdate.assignee_id === user.id) {
        let penalty = -15; // Standard penalty for task reopening
        await recordActivity("task_reopened", `Reopened Protocol: ${taskToUpdate.title}`, penalty, "task", taskId);
      }
    }
  };

  const addTask = async (teamId: string, task: Omit<Task, "id" | "createdAt">) => {
    if (!user) {
      toast.error("User session expired. Please re-authenticate.");
      throw new Error("User not authenticated");
    }

    // Ensure assignee_id is null if empty string
    const validAssigneeId = task.assignee_id && task.assignee_id.trim() !== "" ? task.assignee_id : null;

    const { data: newTask, error } = await supabase.from('tasks').insert({
      title: task.title,
      priority: task.priority,
      status: task.status,
      team_id: teamId,
      assignee_id: validAssigneeId,
      tags: task.labels,
      description: task.description,
      deadline: task.deadline
    }).select('*, profiles:assignee_id(*)').single();

    if (error) {
      console.error("Supabase Error [addTask]:", error);
      throw error;
    }

    if (newTask) {
      const formattedTask = {
        id: newTask.id,
        title: newTask.title,
        priority: newTask.priority,
        status: newTask.status,
        labels: newTask.tags || [],
        members: [newTask.assignee_id].filter(Boolean),
        assignee_id: newTask.assignee_id,
        assignee: newTask.profiles ? {
          id: newTask.profiles.id,
          name: newTask.profiles.full_name,
          avatar: newTask.profiles.avatar_url
        } : undefined,
        deadline: newTask.deadline,
        description: newTask.description,
        createdAt: newTask.created_at
      };

      setTeams(prev => prev.map(t => {
        if (t.id === teamId) {
          if (t.tasks.some(existing => existing.id === newTask.id)) return t;
          return { ...t, tasks: [...t.tasks, formattedTask] };
        }
        return t;
      }));

      // Log activity to team audit logs
      await supabase.from('audit_logs').insert({
        team_id: teamId,
        user_id: user.id,
        action: `Deployed new protocol: ${task.title}`,
        type: 'task',
        details: task.description
      });
      recordActivity("task_creation", `Created new task: ${task.title}`, 5, "task", newTask.id);
    }
  };

  const deleteTask = async (taskId: string) => {
    // Optimistic Update
    setTeams(prev => prev.map(t => ({
      ...t,
      tasks: t.tasks.filter(task => task.id !== taskId)
    })));

    // We don't need to await this for the UI update, but we should handle errors if it fails
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);

    if (error) {
      console.error("Error deleting task:", error);
    } else {
      recordActivity("task_deletion", `Deleted task ${taskId}`, -5, "task", taskId);
    }
  };

  const addPost = async (post: Omit<Post, "id" | "likes" | "comments" | "time" | "handle" | "user" | "avatar">) => {
    if (!user) {
      toast.error("You must be logged in to broadcast.");
      return;
    }

    console.log("Broadcasting to Community:", post);

    const postData: any = {
      content: post.content,
      author_id: user.id,
      tags: post.tags,
      type: post.type || 'text',
      code_snippet: post.codeSnippet,
      code_language: post.codeLanguage,
      project_details: post.projectDetails,
      image_url: post.imageUrl
    };

    const { data, error } = await supabase.from('posts').insert(postData).select().single();

    if (error) {
      console.error("Supabase Error [addPost]:", error);

      // Fallback if schema is still stale/missing 'type'
      if (error.message?.includes('type') || error.code === 'PGRST204') {
        console.warn("Retrying post broadcast without 'type' column...");
        const fallbackData = {
          content: post.content,
          author_id: user.id,
          tags: post.tags
        };
        const { data: fallbackResult, error: retryError } = await supabase.from('posts').insert(fallbackData).select().single();
        if (retryError) {
          toast.error(`Broadcast failed: ${retryError.message}`);
        } else {
          toast.success("Intelligence broadcast transmitted (Basic Mode).");
          fetchPosts();
          if (fallbackResult) recordActivity("intel_broadcast", "Broadcasted new intel to the global grid (fallback)", 10, "post", fallbackResult.id);
        }
      } else {
        toast.error(`Broadcast failed: ${error.message}`);
      }
    } else {
      console.log("Broadcast success:", data);
      toast.success("Intelligence broadcast transmitted.");
      fetchPosts(); // Ensure immediate UI update
      recordActivity("intel_broadcast", "Broadcasted new intel to the global grid", 10, "post", data.id);
    }
  };

  const likePost = async (postId: string) => {
    if (!user) return;

    const postToToggle = posts.find(p => p.id === postId);
    if (!postToToggle) return;

    const wasLiked = postToToggle.isLiked;

    // Optimistic Update
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: wasLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !wasLiked
        };
      }
      return post;
    }));

    if (wasLiked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      recordActivity("recon_appreciation", "Removed appreciation from operative intel", -2, "post", postId);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      recordActivity("recon_appreciation", "Appreciated operative intel in the grid", 2, "post", postId);
    }
    fetchPosts(); // Refetch to sync state with DB
  };

  const deletePost = async (postId: string) => {
    if (!user) return;
    const { error } = await supabase.from('posts').delete().eq('id', postId).eq('author_id', user.id);
    if (error) {
      toast.error("Failed to shred intelligence broadcast.");
    } else {
      toast.success("Broadcast shredded from grid.");
      fetchPosts();
      recordActivity("intel_shredded", "Shredded intelligence broadcast from grid", -10, "post", postId);
    }
  };

  const addComment = async (postId: string, content: string, parentId?: string) => {
    if (!user) return;
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: user.id,
      content,
      parent_id: parentId
    });
    if (error) toast.error("Failed to transmit comment.");
    else {
      fetchPosts();
      recordActivity("intel_comment", `Commented on intel: ${content.substring(0, 50)}...`, 3, "post", postId);
    }
  };

  const fetchComments = async (postId: string): Promise<PostComment[]> => {
    const { data } = await supabase.from('comments')
      .select('*, profiles(*)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (data) {
      const allComments: PostComment[] = data.map((c: any) => ({
        id: c.id,
        post_id: c.post_id,
        parent_id: c.parent_id,
        author_id: c.author_id,
        author_name: c.profiles?.full_name || "Anon",
        author_avatar: c.profiles?.avatar_url,
        content: c.content,
        created_at: c.created_at,
        replies: []
      }));

      // Simple one-level threading
      const roots = allComments.filter(c => !c.parent_id);
      roots.forEach(root => {
        root.replies = allComments.filter(c => c.parent_id === root.id);
      });

      return roots;
    }
    return [];
  };

  const fetchDirectMessages = async () => {
    if (!user) return;
    const { data } = await supabase.from('direct_messages')
      .select('*, sender:profiles!direct_messages_sender_id_fkey(*), receiver:profiles!direct_messages_receiver_id_fkey(*)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: true });

    if (data) {
      setDirectMessages(data.map((m: any) => ({
        id: m.id,
        sender_id: m.sender_id,
        receiver_id: m.receiver_id,
        content: m.content,
        is_read: m.is_read,
        created_at: m.created_at,
        sender_name: m.sender?.full_name || "Unknown",
        sender_avatar: m.sender?.avatar_url,
        receiver_name: m.receiver?.full_name || "Unknown",
        receiver_avatar: m.receiver?.avatar_url
      })));
    }
  };

  const sendDirectMessage = async (receiverId: string, content: string) => {
    if (!user) return;
    const { error } = await supabase.from('direct_messages').insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content
    });
    if (error) toast.error("Failed to route intel packet.");
    else {
      fetchDirectMessages();
      recordActivity("direct_message", `Sent direct message to ${receiverId}: ${content.substring(0, 50)}...`, 1, "user", receiverId);
    }
  };

  const markDMAsRead = async (messageId: string) => {
    await supabase.from('direct_messages').update({ is_read: true }).eq('id', messageId);
    fetchDirectMessages();
    recordActivity("dm_read", `Marked direct message as read`, 0, "message", messageId);
  };

  const markAllDMsAsRead = async () => {
    if (!user) return;
    const { error } = await supabase.from('direct_messages').update({ is_read: true }).eq('receiver_id', user.id).eq('is_read', false);
    if (error) {
      console.error("Failed to mark all DMs as read:", error);
      return;
    }
    fetchDirectMessages();
    toast.success("Intelligence inbox cleared.");
  };

  const sendGlobalMessage = async (content: string) => {
    if (!user) return;
    await supabase.from('messages').insert({
      content,
      author_id: user.id
      // team_id null -> global
    });
    recordActivity("global_chat", `Sent global message: ${content.substring(0, 50)}...`, 1, "global_chat");
  };

  useEffect(() => {
    // Subscribe to global messages
    const channel = supabase.channel('global_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'team_id=is.null' }, (payload) => {
        fetchGlobalMessages();
      })
      .subscribe();

    fetchGlobalMessages();
    fetchDirectMessages();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    // Social Real-time: Posts, Likes, Comments
    const socialChannel = supabase.channel('social_matrix')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, () => fetchPosts())
      .subscribe();

    // DM Real-time
    const dmChannel = supabase.channel(`dms_${user?.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `receiver_id=eq.${user?.id}` }, (payload) => {
        fetchDirectMessages();
        addNotification({
          title: "New Intel Received",
          message: "A new strategic message has arrived in your inbox.",
          type: "info"
        });
      })
      .subscribe();

    // Badges Real-time
    const badgeChannel = supabase.channel(`badges_${user?.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_badges', filter: `user_id=eq.${user?.id}` }, () => {
        fetchUserBadges();
      })
      .subscribe();

    // Profile Real-time: Rank, Level, Reputation
    const profileChannel = supabase.channel(`profile_${user?.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user?.id}` }, (payload) => {
        setUser(prev => prev ? {
          ...prev,
          reputation: payload.new.reputation_points,
          rank: payload.new.prestige_rank,
          level: payload.new.level
        } : null);
      })
      .subscribe();

    fetchPosts();
    fetchUserBadges();
    fetchBounties();
    return () => {

      supabase.removeChannel(socialChannel);
      supabase.removeChannel(dmChannel);
      supabase.removeChannel(badgeChannel);
      supabase.removeChannel(profileChannel);
    };
  }, [user]);


  useEffect(() => {
    // Bounty Matrix Real-time
    const bountyChannel = supabase.channel('bounty_matrix')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bounties' }, (payload) => {
        console.log("Bounty update detected:", payload);
        fetchBounties();

        // Notification for new or completed missions
        if (payload.eventType === 'INSERT') {
          addNotification({
            title: "New Mission Detected",
            message: `A new ${payload.new.type} objective has been posted to the matrix.`,
            type: "info"
          });
        }
      })
      .subscribe();

    fetchBounties();
    return () => {
      supabase.removeChannel(bountyChannel);
    };
  }, []);

  const fetchGlobalMessages = async () => {
    const { data } = await supabase.from('messages')
      .select('*, profiles(*)')
      .is('team_id', null)
      .order('created_at', { ascending: true });

    if (data) {
      setGlobalMessages(data.map((m: any) => ({
        id: m.id,
        user: m.profiles?.full_name || "Anon",
        user_id: m.author_id,
        content: m.content,
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "text",
        avatar: m.profiles?.avatar_url
      })));
    }
  };

  // --- Personal Productivity Hub Logic ---

  // Fetch all personal data
  const fetchPersonalData = async (userId: string) => {
    const [notes, reminders, ms, hist] = await Promise.all([
      supabase.from('personal_notes').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
      supabase.from('personal_reminders').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('user_milestones').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('user_history').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    ]);

    if (notes.data) setPersonalNotes(notes.data);
    if (reminders.data) setPersonalReminders(reminders.data);
    if (ms.data) setMilestones(ms.data);
    if (hist.data) setProfessionalHistory(hist.data);
  };

  // CRUD Functions
  const addPersonalNote = async (note: Omit<PersonalNote, "id" | "user_id" | "updatedAt" | "createdAt" | "is_favorite">) => {
    if (!user) return;
    const { error } = await supabase.from('personal_notes').insert({
      user_id: user.id,
      title: note.title,
      content: note.content,
      is_favorite: false
    });
    if (error) toast.error("Failed to secure note.");
    else {
      toast.success("Intel secured in personal vault.");
      recordActivity("personal_note_created", `Created personal note: ${note.title || note.content.substring(0, 50)}...`, 5, "personal_note");
    }
  };

  const updatePersonalNote = async (id: string, updates: Partial<PersonalNote>) => {
    const { error } = await supabase.from('personal_notes').update(updates).eq('id', id);
    if (error) console.error("Update failed", error);
    else {
      recordActivity("personal_note_updated", `Updated personal note ${id}`, 2, "personal_note", id);
    }
  };

  const deletePersonalNote = async (id: string) => {
    const { error } = await supabase.from('personal_notes').delete().eq('id', id);
    if (error) toast.error("Failed to shred document.");
    else {
      recordActivity("personal_note_deleted", `Deleted personal note ${id}`, -3, "personal_note", id);
    }
  };

  const addPersonalReminder = async (reminder: Omit<PersonalReminder, "id" | "user_id" | "is_completed" | "createdAt">) => {
    if (!user) return;
    const { error } = await supabase.from('personal_reminders').insert({
      user_id: user.id,
      content: reminder.content,
      due_at: reminder.due_at,
      priority: reminder.priority,
      is_completed: false
    });
    if (error) toast.error("Failed to set beacon.");
    else {
      toast.success("Tactical reminder armed.");
      recordActivity("personal_reminder_set", `Set personal reminder: ${reminder.content.substring(0, 50)}...`, 5, "personal_reminder");
    }
  };

  const toggleReminder = async (id: string, isCompleted: boolean) => {
    await supabase.from('personal_reminders').update({ is_completed: isCompleted }).eq('id', id);
    recordActivity("personal_reminder_toggle", `Reminder ${id} marked as completed: ${isCompleted}`, isCompleted ? 5 : 0, "personal_reminder", id);
  };

  const deleteReminder = async (id: string) => {
    await supabase.from('personal_reminders').delete().eq('id', id);
    recordActivity("personal_reminder_deleted", `Deleted personal reminder ${id}`, -3, "personal_reminder", id);
  };

  const fetchPublicProfiles = async (): Promise<User[]> => {
    const { data } = await supabase.from('profiles').select('*').limit(20);
    if (data) {
      const formatted = data.map((d: any) => ({
        id: d.id,
        name: d.full_name || d.email || "Unknown",
        email: d.email || "",
        avatar: d.avatar_url,
        role: d.primary_role,
        bio: d.bio || "",
        skills: d.skills || [],
        socials: d.social_links || {},
        reputation: d.reputation_points || 0,
        rank: d.prestige_rank || 'Operative',
        velocity: d.weekly_velocity || [0, 0, 0, 0, 0, 0, 0],
        level: d.level || 1
      }));
      setAllProfiles(formatted);
      return formatted;
    }
    return [];
  };

  const searchUsers = async (query: string): Promise<User[]> => {
    const { data } = await supabase.from('profiles')
      .select('*')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (data) {
      return data.map((d: any) => ({
        id: d.id,
        name: d.full_name || d.email || "Unknown",
        email: d.email || "",
        avatar: d.avatar_url,
        role: d.primary_role,
        bio: d.bio || "",
        skills: d.skills || [],
        socials: d.social_links || {},
        reputation: d.reputation_points || 0,
        rank: d.prestige_rank || 'Operative',
        velocity: d.weekly_velocity || [0, 0, 0, 0, 0, 0, 0],
        level: d.level || 1
      }));
    }
    return [];
  };

  const fetchTargetUserMetadata = async (userId: string): Promise<{ profile: User, teams: Team[], activities: Activity[], milestones: any[] } | null> => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !profileData) return null;

      const formattedProfile: User = {
        id: profileData.id,
        name: profileData.full_name || "Unknown",
        email: profileData.email || "",
        avatar: profileData.avatar_url,
        role: profileData.primary_role,
        bio: profileData.bio || "",
        skills: profileData.skills || [],
        socials: profileData.social_links || {},
        reputation: profileData.reputation_points || 0,
        rank: profileData.prestige_rank || 'Operative',
        velocity: profileData.weekly_velocity || [0, 0, 0, 0, 0, 0, 0],
        follower_count: profileData.follower_count || 0,
        following_count: profileData.following_count || 0,
        preferences: profileData.preferences || {},
        auth_methods: [],
        level: profileData.level || 1
      };

      const { data: milestonesData } = await supabase.from('user_milestones').select('*').eq('user_id', userId);

      const { data: memberships } = await supabase.from('memberships').select('team_id, role, joined_at').eq('user_id', userId);
      let teamsList: Team[] = [];
      if (memberships && memberships.length > 0) {
        const teamIds = memberships.map(m => m.team_id);
        const { data: teamsData } = await supabase.from('teams').select('*').in('id', teamIds);
        if (teamsData) {
          teamsList = teamsData.map(t => ({
            id: t.id,
            name: t.name,
            description: t.description,
            role: memberships.find(m => m.team_id === t.id)?.role || 'Member',
            color: 'bg-hack-blue',
            progress: 0,
            tasksCount: 0,
            event: "Hackathon 2026",
            type: t.type || "Project",
            tasks: [],
            status: t.status,
            currentMembersCount: 0,
            maxMembers: 5,
            performance: []
          }) as any);
        }
      }

      const { data: activitiesData } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      return {
        profile: formattedProfile,
        teams: teamsList,
        activities: (activitiesData || []) as any[],
        milestones: (milestonesData || []) as any[]
      };
    } catch (e) {
      console.error("Fetch target user failed", e);
      return null;
    }
  };

  useEffect(() => {
    fetchPublicProfiles();
  }, []);

  // Real-time Listeners for Personal Data
  useEffect(() => {
    if (!user) return;
    fetchPersonalData(user.id);

    const channel = supabase.channel(`personal_updates_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'personal_notes', filter: `user_id=eq.${user.id}` }, () => fetchPersonalData(user.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'personal_reminders', filter: `user_id=eq.${user.id}` }, () => fetchPersonalData(user.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_milestones', filter: `user_id=eq.${user.id}` }, () => fetchPersonalData(user.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_history', filter: `user_id=eq.${user.id}` }, () => fetchPersonalData(user.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bounties' }, () => fetchBounties())
      .subscribe();


    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // --- End Personal Productivity Hub Logic ---

  const markAsRead = async (id: string) => {
    // 1. Update Supabase
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) {
      console.error("Failed to mark notification as read:", error);
      return;
    }

    // 2. Optimistic local update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    recordActivity("notification_read", `Notification marked as read`, 0, "notification", id);
  };

  const markAllNotificationsAsRead = async () => {
    if (!user) return;

    // 1. Update Supabase
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    if (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to clear signal indicators.");
      return;
    }

    // 2. Local update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All tactical signals cleared.");
  };

  const addNotification = (notif: Omit<Notification, "id" | "read" | "time">) => {
    const newNotif: Notification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      read: false,
      time: "Just now"
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const sendNotification = async (userId: string, title: string, message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      is_read: false
    });

    if (error) {
      console.error("Failed to send notification:", error);
    }
  };



  // ... existing code ...

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage.from('team-documents').upload(path, file);
    if (error) {
      console.error("Upload error:", error);
      throw error;
    }
    return data?.path;
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('team-documents').getPublicUrl(path);
    return data.publicUrl;
  };

  const addDocument = async (doc: Omit<TeamDocument, "id" | "updatedAt" | "lastEditedBy" | "team_id">, file?: File) => {
    if (!activeTeamId || !user) return;

    let fileUrl = doc.url;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${activeTeamId}/${fileName}`;

      try {
        await uploadFile(file, filePath);
        fileUrl = getPublicUrl(filePath);
      } catch (e) {
        toast.error("File upload failed");
        return;
      }
    }

    await supabase.from('documents').insert({
      team_id: activeTeamId,
      title: doc.title,
      content: doc.content,
      type: doc.type,
      url: fileUrl,
      last_edited_by: user.id
    });
    fetchDocuments(activeTeamId);
  };

  const updateDocument = async (id: string, content: string) => {
    if (!user) return;
    await supabase.from('documents').update({
      content,
      last_edited_by: user.id,
      updated_at: new Date().toISOString()
    }).eq('id', id);
    if (activeTeamId) fetchDocuments(activeTeamId);
  };

  const fetchBounties = async () => {
    const { data, error } = await supabase
      .from('bounties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error("Bounty fetch failed:", error);
    else setBounties(data || []);
  };

  const createBounty = async (bounty: Omit<Bounty, "id" | "created_at" | "created_by" | "status">) => {
    if (!user) return;
    const { error } = await supabase.from('bounties').insert({
      ...bounty,
      created_by: user.id,
      status: 'open'
    });
    if (error) toast.error("Failed to post bounty.");
    else {
      toast.success("Bounty issued to the Matrix.");
      fetchBounties();
    }
  };

  const claimBounty = async (bountyId: string) => {
    if (!user) return;

    // Optimistic Update
    const originalBounties = [...bounties];
    setBounties(prev => prev.map(b =>
      b.id === bountyId ? { ...b, status: 'claimed', claimed_by: user.id } : b
    ));

    const { error } = await supabase
      .from('bounties')
      .update({ status: 'claimed', claimed_by: user.id })
      .eq('id', bountyId)
      .eq('status', 'open');

    if (error) {
      toast.error("Mission claim failed. Objective may already be targeted.");
      setBounties(originalBounties); // Revert
    } else {
      toast.success("MISSION ACCEPTED: Objective locked in.");
      // recordActivity is handled in completeBounty or separately if needed. 
      // For now, just track the claim.
      recordActivity("bounty_claimed", `Claimed mission: ${bounties.find(b => b.id === bountyId)?.title}`, 5, "bounty", bountyId);
    }
  };

  const completeBounty = async (bountyId: string) => {
    if (!user) return;
    const bounty = bounties.find(b => b.id === bountyId);
    if (!bounty) return;

    const { error } = await supabase
      .from('bounties')
      .update({ status: 'completed' })
      .eq('id', bountyId);

    if (error) toast.error("Completion report failed.");
    else {
      toast.success(`MISSION ACCOMPLISHED: +${bounty.reward_xp} XP`);
      if (bounty.claimed_by === user.id) {
        recordActivity("bounty_completed", `Completed mission: ${bounty.title}`, bounty.reward_xp, "bounty", bounty.id);
      }
      fetchBounties();
    }
  };

  const fetchUserBadges = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user.id);

    if (error) console.error("Badge fetch failed:", error);
    else setUserBadges(data || []);
  };

  const awardBadge = async (badgeId: string) => {
    if (!user) return;

    // Check if already earned locally first
    if (userBadges.some(b => b.badge_id === badgeId)) return;

    const { error } = await supabase
      .from('user_badges')
      .insert({ user_id: user.id, badge_id: badgeId });

    if (error) {
      if (error.code !== '23505') { // Ignore unique constraint violation
        console.error("Badge award failed:", error);
      }
    } else {
      toast.success(`NEW ACHIEVEMENT UNLOCKED: ${badgeId.replace(/_/g, ' ').toUpperCase()}`, {
        icon: '🏆',
        style: { background: '#1e293b', color: '#fbbf24', border: '1px solid #fbbf24' }
      });
      fetchUserBadges();
      recordActivity("badge_earned", `Earned badge: ${badgeId}`, 100, "badge", badgeId);
    }
  };

  const getStandup = async (teamId: string) => {
    return await aiSquadService.generateStandup(teamId);
  };

  const getTaskSuggestions = async (query: string) => {
    return await aiSquadService.getTaskSuggestions(query);
  };

  const analytics = React.useMemo(() => {
    if (!user) return {
      efficiency: 0,
      pulseCount: 0,
      skillMatrix: [],
      trends: { efficiency: [], pulse: [], merit: [] }
    };

    // 1. Efficiency Analytics
    const myTasks = teams.flatMap(team => team.tasks?.filter(tk => tk.assignee_id === user.id) || []);
    const doneTasks = myTasks.filter(t => t.status === 'done');
    const efficiency = myTasks.length > 0 ? (doneTasks.length / myTasks.length) * 100 : 0;

    // 2. Time Intervals (Last 12 intervals for smoother sparklines)
    const now = Date.now();
    const intervals = Array.from({ length: 12 }).map((_, i) => now - (11 - i) * (2 * 60 * 60 * 1000)); // 2-hour chunks for last 24h

    // 3. Pulse Trend (Activity density)
    const pulseTrend = intervals.map(time => {
      const start = time - (2 * 60 * 60 * 1000);
      return activities.filter(a => {
        const t = new Date(a.created_at).getTime();
        return t >= start && t < time;
      }).length;
    });

    const pulseCount = activities.filter(a => new Date(a.created_at).getTime() > (now - 24 * 60 * 60 * 1000)).length;

    // 4. Merit Trend (Cumulative RP)
    let tempRP = user.reputation || 0;
    const meritTrend = intervals.slice().reverse().map(time => {
      const activityInInterval = activities.filter(a => new Date(a.created_at).getTime() > time);
      const rpLost = activityInInterval.reduce((acc, curr) => acc + (curr.metadata?.reputation_gain || 0), 0);
      const val = tempRP;
      tempRP -= rpLost;
      return val;
    }).reverse();

    // 5. Efficiency Trend (Task completions over time)
    const efficiencyTrend = intervals.map(time => {
      const doneAtThatTime = doneTasks.filter(t => t.updated_at && new Date(t.updated_at).getTime() < time).length;
      const totalAtThatTime = myTasks.filter(t => new Date(t.createdAt).getTime() < time).length;
      return totalAtThatTime > 0 ? (doneAtThatTime / totalAtThatTime) * 100 : 0;
    });

    // 6. Skill Matrix (Enhanced weighing)
    const categories: Record<string, number> = { 'FTD': 0, 'BKD': 0, 'DSN': 0, 'OPS': 0, 'SEC': 0, 'RSR': 0 };
    const mapping: Record<string, string> = { 'Frontend': 'FTD', 'Backend': 'BKD', 'Design': 'DSN', 'DevOps': 'OPS', 'Security': 'SEC', 'Research': 'RSR' };
    const weightMap: Record<string, number> = { 'high': 1.5, 'urgent': 2.5, 'medium': 1, 'low': 0.5 };

    doneTasks.forEach(task => {
      const code = mapping[task.labels?.[0] || ''] || 'RSR';
      categories[code] += (15 * (weightMap[task.priority] || 1));
    });

    const skillMatrix = Object.entries(categories).map(([subject, A]) => ({
      subject,
      A: Math.max(A, 20),
      fullMark: 200
    }));

    return {
      efficiency,
      pulseCount,
      skillMatrix,
      trends: {
        efficiency: efficiencyTrend.map(v => ({ val: v })),
        pulse: pulseTrend.map(v => ({ val: v })),
        merit: meritTrend.map(v => ({ val: v }))
      }
    };
  }, [teams, activities, user]);

  const value = {
    theme, toggleTheme, user, updateProfile, login, logout,
    teams, addTeam, updateTeam, activeTeamId, setActiveTeamId, updateTaskStatus, addTask, deleteTask, joinTeam, updateTeamSettings, updateTeamDeadline, removeMember,
    setMissionObjective, assignMemberRole, toggleCritical, syncGitHubRepo, disconnectGitHubRepo,
    posts,
    addPost,
    deletePost,
    likePost,
    addComment,
    fetchComments,
    globalMessages,
    sendGlobalMessage,
    followUser,
    unfollowUser,
    followingIds,
    directMessages,
    sendDirectMessage,
    fetchDirectMessages,
    markDMAsRead,
    markAllDMsAsRead,
    notifications,
    markAsRead,
    markAllNotificationsAsRead,
    addNotification,
    userHistory,
    userPerformance,
    documents, addDocument, updateDocument,
    teamMessages, fetchTeamMessages, sendTeamMessage,
    personalNotes, personalReminders, milestones, professionalHistory,
    addPersonalNote, updatePersonalNote, deletePersonalNote,
    addPersonalReminder, toggleReminder, deleteReminder,
    addUserMilestone, addUserHistory, increaseReputation,
    searchUsers, fetchPublicProfiles, fetchTargetUserMetadata, allProfiles,
    followerCount,
    followingCount,
    fetchFollowersList,
    fetchFollowingList,
    activities,
    recordActivity,
    sessions,
    fetchSessions,
    updatePreferences,
    analytics,
    loading,

    githubData, githubToken, connectGitHub, connectGitHubManual, disconnectGitHub,

    bounties, fetchBounties, createBounty, claimBounty, completeBounty,
    userBadges, fetchUserBadges, awardBadge,
    getStandup, getTaskSuggestions, deleteTeam

  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
