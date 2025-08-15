import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import AIChatBox from '@/components/AIChatBox';
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
  ArrowLeft,
  UserPlus,
  Mail,
  User
} from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    email: '',
    name: '',
    role: 'Team Member'
  });
  const navigate = useNavigate();

  // Mock notifications data
  const notifications = [
    { id: 1, message: "New task assigned: API Integration", time: "2 min ago", unread: true },
    { id: 2, message: "Alice completed UI Design Review", time: "1 hour ago", unread: true },
    { id: 3, message: "Team deadline approaching in 2 days", time: "3 hours ago", unread: false }
  ];

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

      // Get team from URL params - require explicit team selection
      const urlParams = new URLSearchParams(window.location.search);
      const teamId = urlParams.get('team');

      if (!teamId) {
        // If no team specified, redirect to teams overview
        navigate('/teams');
        return;
      }

      // Find the specific team
      const currentTeam = parsedUser.teams?.find((t: any) => t.id.toString() === teamId);

      if (!currentTeam) {
        // If team not found or user not member, redirect to teams overview
        navigate('/teams');
        return;
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

  const handleAddMember = () => {
    if (!newMember.email || !newMember.name) return;

    // Get current team and update members
    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('team');
    const currentTeam = teamId
      ? user.teams?.find((t: any) => t.id.toString() === teamId)
      : user.teams?.[0];

    if (!currentTeam) return;

    const newMemberData = {
      id: newMember.email,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      joinedAt: new Date().toISOString()
    };

    // Update team members
    const updatedTeams = user.teams.map((team: any) =>
      team.id === currentTeam.id
        ? { ...team, members: [...team.members, newMemberData] }
        : team
    );

    const updatedUser = { ...user, teams: updatedTeams };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    // Reset form
    setNewMember({ email: '', name: '', role: 'Team Member' });
    setIsAddMemberOpen(false);
  };

  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p>Loading...</p>
    </div>;
  }

  // Get current team from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const teamId = urlParams.get('team');

  if (!teamId) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p>No team selected. <Link to="/teams">Go to Teams</Link></p>
    </div>;
  }

  const currentTeam = user.teams?.find((t: any) => t.id.toString() === teamId);

  if (!currentTeam) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p>Team not found or access denied. <Link to="/teams">Go to Teams</Link></p>
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

            {/* Notifications */}
            <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-4 h-4" />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {notifications.filter(n => n.unread).length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Notifications</SheetTitle>
                  <SheetDescription>
                    Stay updated with your team's activity
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`p-3 rounded-lg border ${notification.unread ? 'bg-blue-50 border-blue-200' : 'bg-muted/50'}`}>
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {/* Settings */}
            <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Settings</SheetTitle>
                  <SheetDescription>
                    Manage your team and account preferences
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Team Settings</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Manage Team Members
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Team Preferences
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Account</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        Profile Settings
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Bell className="w-4 h-4 mr-2" />
                        Notification Preferences
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/teams" className="flex items-center w-full">
                    <Users className="mr-2 h-4 w-4" />
                    <span>My Teams</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                  <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                        <DialogDescription>
                          Invite a new member to join your team
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="memberEmail">Email Address</Label>
                          <Input
                            id="memberEmail"
                            type="email"
                            placeholder="member@example.com"
                            value={newMember.email}
                            onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="memberName">Full Name</Label>
                          <Input
                            id="memberName"
                            placeholder="John Doe"
                            value={newMember.name}
                            onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="memberRole">Role</Label>
                          <Select value={newMember.role} onValueChange={(value) => setNewMember({...newMember, role: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Developer">Developer</SelectItem>
                              <SelectItem value="Designer">Designer</SelectItem>
                              <SelectItem value="Team Member">Team Member</SelectItem>
                              <SelectItem value="Researcher">Researcher</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <Mail className="w-4 h-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-primary">Invitation</p>
                              <p className="text-sm text-muted-foreground">
                                In a real app, this would send an email invitation to the member.
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button className="w-full" onClick={handleAddMember}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Member
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
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

      {/* AI Chat Box */}
      <AIChatBox teamName={currentTeam.name} />
    </div>
  );
}
