import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  MessageSquare, 
  CheckSquare, 
  Calendar,
  Search,
  Bell,
  Settings,
  LogOut,
  Zap,
  UserPlus
} from 'lucide-react';

// Mock data for existing teams
const mockTeams = [
  {
    id: 1,
    name: "Awesome Team",
    role: "Team Leader",
    members: 5,
    progress: 68,
    lastActivity: "2 hours ago",
    unreadMessages: 3,
    upcomingTasks: 2
  }
];

// Mock data for recent activity
const recentChats = [
  {
    id: 1,
    teamName: "Awesome Team",
    lastMessage: "Great progress on the API integration!",
    sender: "Alice Smith",
    time: "2 min ago",
    unread: 2
  }
];

const upcomingTasks = [
  {
    id: 1,
    title: "API Integration",
    teamName: "Awesome Team",
    dueDate: "Today, 6:00 PM",
    priority: "high"
  },
  {
    id: 2,
    title: "UI Design Review",
    teamName: "Awesome Team", 
    dueDate: "Tomorrow, 10:00 AM",
    priority: "medium"
  }
];

export default function Teams() {
  const [user, setUser] = useState<any>(null);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Load user's teams (in real app, this would be an API call)
      const teams = parsedUser.teams || [];
      if (teams.length === 0) {
        // For demo, if user has no teams, show mock team for team leader demo
        setUserTeams(mockTeams);
      } else {
        setUserTeams(teams);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleJoinTeam = () => {
    navigate('/join-team');
  };

  const handleCreateTeam = () => {
    navigate('/create-team');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">HackMate</span>
            </div>
            <h1 className="text-xl font-semibold">Welcome, {user?.name?.split(' ')[0]}!</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="w-4 h-4" />
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarFallback>{user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Quick Overview */}
        {userTeams.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Chats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Recent Chats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentChats.map((chat) => (
                    <div key={chat.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{chat.teamName}</span>
                          {chat.unread > 0 && (
                            <Badge variant="destructive" className="h-5 text-xs">
                              {chat.unread}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                        <p className="text-xs text-muted-foreground">{chat.sender} • {chat.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckSquare className="w-5 h-5 mr-2" />
                  Upcoming Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{task.title}</span>
                          <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="h-5 text-xs">
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{task.teamName}</p>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {task.dueDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Team Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Teams</h2>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleJoinTeam}>
                <UserPlus className="w-4 h-4 mr-2" />
                Join Team
              </Button>
              <Button onClick={handleCreateTeam}>
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </div>
          </div>

          {/* Teams List */}
          {userTeams.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTeams.map((team) => (
                <Card key={team.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <Badge variant="secondary">{team.role}</Badge>
                    </div>
                    <CardDescription>
                      {team.members} members • Last active {team.lastActivity}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Project Progress</span>
                          <span>{team.progress}%</span>
                        </div>
                        <Progress value={team.progress} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {team.unreadMessages} new
                          </span>
                          <span className="flex items-center">
                            <CheckSquare className="w-4 h-4 mr-1" />
                            {team.upcomingTasks} tasks
                          </span>
                        </div>
                      </div>
                      
                      <Link to="/dashboard">
                        <Button className="w-full">Open Team</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
                <p className="text-muted-foreground mb-6">
                  Join an existing team or create your own to start collaborating!
                </p>
                <div className="flex justify-center space-x-3">
                  <Button variant="outline" onClick={handleJoinTeam}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Join Team
                  </Button>
                  <Button onClick={handleCreateTeam}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
