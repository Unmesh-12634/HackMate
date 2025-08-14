import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  CheckSquare,
  MessageSquare,
  Calendar,
  FileText,
  Plus,
  Bell,
  Settings,
  Search,
  LogOut,
  ArrowLeft
} from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);

      // Migrate existing data to ensure proper structure
      if (parsedUser.teams) {
        parsedUser.teams = parsedUser.teams.map((team: any) => ({
          ...team,
          members: Array.isArray(team.members) ? team.members : [
            {
              id: parsedUser.email,
              name: parsedUser.name,
              email: parsedUser.email,
              role: team.role || 'Team Leader',
              joinedAt: team.createdAt || new Date().toISOString()
            }
          ],
          tasks: Array.isArray(team.tasks) ? team.tasks : [],
          projects: Array.isArray(team.projects) ? team.projects : []
        }));

        // Update localStorage with migrated data
        localStorage.setItem('user', JSON.stringify(parsedUser));
      }

      setUser(parsedUser);

      // Get team from URL params or use first team
      const urlParams = new URLSearchParams(window.location.search);
      const teamId = urlParams.get('team');

      let currentTeam = null;
      if (teamId) {
        currentTeam = parsedUser.teams?.find((t: any) => t.id.toString() === teamId);
      } else {
        currentTeam = parsedUser.teams?.[0];
      }

      if (!currentTeam) {
        navigate('/teams');
      }
    } else {
      // Redirect to login if no user data
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p>Loading...</p>
    </div>;
  }

  // Get current team
  const urlParams = new URLSearchParams(window.location.search);
  const teamId = urlParams.get('team');
  const currentTeam = teamId
    ? user.teams?.find((t: any) => t.id.toString() === teamId)
    : user.teams?.[0];

  if (!currentTeam) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p>No team found. <Link to="/teams">Go to Teams</Link></p>
    </div>;
  }

  // Calculate dynamic data
  const tasks = currentTeam.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t: any) => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter((t: any) => t.status === 'pending').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get user's assigned tasks
  const userTasks = tasks.filter((t: any) => t.assignee === user.email && t.status !== 'completed').slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/teams">
              <Button variant="ghost" size="icon" title="Back to Teams">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Team Dashboard</h1>
            <Badge variant="secondary">{currentTeam.name}</Badge>
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
        {/* Project Overview */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Project Progress</CardTitle>
              <CardDescription>Overall team progress for {currentTeam.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{inProgressTasks}</div>
                    <div className="text-xs text-muted-foreground">In Progress</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-muted-foreground">{pendingTasks}</div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                </div>
                {totalTasks === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No tasks created yet!</p>
                    {user.email === currentTeam.createdBy && (
                      <Link to={`/tasks?team=${currentTeam.id}`}>
                        <Button size="sm" className="mt-2">Create First Task</Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time Remaining</CardTitle>
              <CardDescription>Until submission deadline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">47:23:15</div>
                <div className="text-sm text-muted-foreground">Hours : Minutes : Seconds</div>
                <Button className="w-full mt-4" variant="outline">
                  Set Focus Timer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Team */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Tasks</CardTitle>
                <CardDescription>Tasks assigned to you</CardDescription>
              </div>
              <Link to={`/tasks?team=${currentTeam.id}`}>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  View All Tasks
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {userTasks.length > 0 ? (
                <div className="space-y-3">
                  {userTasks.map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckSquare className={`w-4 h-4 ${
                          task.status === 'completed' ? 'text-green-600' :
                          task.status === 'in_progress' ? 'text-yellow-600' : 'text-muted-foreground'
                        }`} />
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge variant={
                        task.priority === 'high' ? 'destructive' :
                        task.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckSquare className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No tasks assigned to you</p>
                  <p className="text-sm text-muted-foreground">
                    {user.email === currentTeam.createdBy
                      ? "Create tasks for your team!"
                      : "Your team leader will assign tasks to you."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>{Array.isArray(currentTeam.members) ? currentTeam.members.length : 1} members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.isArray(currentTeam.members) ? currentTeam.members.map((member: any) => (
                  <div key={member.email} className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {member.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{member.name || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">{member.role || 'Member'}</div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                )) : (
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{user?.name || 'You'}</div>
                      <div className="text-xs text-muted-foreground">Team Leader</div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                )}
                {user.email === currentTeam.createdBy && (
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to={`/chat?team=${currentTeam.id}`}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-8 h-8 text-primary" />
                <div>
                  <div className="font-medium">Team Chat</div>
                  <div className="text-sm text-muted-foreground">Start chatting</div>
                </div>
              </div>
            </Card>
          </Link>
          <Link to={`/resources?team=${currentTeam.id}`}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-primary" />
                <div>
                  <div className="font-medium">Resources</div>
                  <div className="text-sm text-muted-foreground">Files & links</div>
                </div>
              </div>
            </Card>
          </Link>
          <Link to={`/calendar?team=${currentTeam.id}`}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-primary" />
                <div>
                  <div className="font-medium">Schedule</div>
                  <div className="text-sm text-muted-foreground">Team calendar</div>
                </div>
              </div>
            </Card>
          </Link>
          <Link to={`/chat?team=${currentTeam.id}`}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <div className="font-medium">AI Assistant</div>
                  <div className="text-sm text-muted-foreground">Get help</div>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
