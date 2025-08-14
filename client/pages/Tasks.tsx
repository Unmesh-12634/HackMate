import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Filter,
  Search,
  Calendar,
  User,
  Flag,
  Clock,
  CheckCircle2,
  Circle,
  PlayCircle,
  ArrowLeft,
  MoreHorizontal
} from 'lucide-react';

// Helper functions for task management
const updateTeamTasks = (user: any, teamId: string, updatedTasks: any[]) => {
  const updatedUser = {
    ...user,
    teams: user.teams.map((team: any) =>
      team.id.toString() === teamId
        ? { ...team, tasks: updatedTasks }
        : team
    )
  };
  localStorage.setItem('user', JSON.stringify(updatedUser));
  return updatedUser;
};

const priorityColors = {
  high: "destructive",
  medium: "default",
  low: "secondary"
};

const statusIcons = {
  pending: Circle,
  in_progress: PlayCircle,
  completed: CheckCircle2
};

export default function Tasks() {
  const [filter, setFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentTeam, setCurrentTeam] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
    dueDate: ''
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get('team');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Find current team
      const team = parsedUser.teams?.find((t: any) => t.id.toString() === teamId) || parsedUser.teams?.[0];
      if (team) {
        setCurrentTeam(team);
        setTasks(team.tasks || []);
      } else {
        navigate('/teams');
      }
    } else {
      navigate('/login');
    }
  }, [teamId, navigate]);

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "in_progress": return "text-yellow-600";
      default: return "text-muted-foreground";
    }
  };

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description || !newTask.assignee || !newTask.dueDate) {
      return;
    }

    const task = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
      status: 'pending',
      priority: newTask.priority,
      assignee: newTask.assignee,
      dueDate: newTask.dueDate,
      progress: 0,
      createdBy: user.email,
      createdAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);

    // Update user data
    const updatedUser = updateTeamTasks(user, currentTeam.id.toString(), updatedTasks);
    setUser(updatedUser);

    // Reset form
    setNewTask({
      title: '',
      description: '',
      assignee: '',
      priority: 'medium',
      dueDate: ''
    });
    setIsCreateOpen(false);
  };

  const handleTaskStatusChange = (taskId: number, newStatus: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            status: newStatus,
            progress: newStatus === 'completed' ? 100 : newStatus === 'in_progress' ? 50 : 0,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
          }
        : task
    );

    setTasks(updatedTasks);

    // Update user data
    const updatedUser = updateTeamTasks(user, currentTeam.id.toString(), updatedTasks);
    setUser(updatedUser);
  };

  if (!user || !currentTeam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Task Management</h1>
            <Badge variant="secondary">{currentTeam.name}</Badge>
            <Badge variant="outline">{totalTasks} Total Tasks</Badge>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            {user.email === currentTeam.createdBy && (
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your team's workflow
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Task description..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignee">Assignee</Label>
                    <Select value={newTask.assignee} onValueChange={(value) => setNewTask({...newTask, assignee: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentTeam.members?.map((member: any) => (
                          <SelectItem key={member.email} value={member.email}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
                {user.email === currentTeam.createdBy && (
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <p className="text-sm text-primary">
                      <strong>Team Leader:</strong> You can assign tasks to any team member.
                    </p>
                  </div>
                )}
                <Button className="w-full" onClick={handleCreateTask}>
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search tasks..." className="pl-10 w-64" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tasks Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{totalTasks}</p>
                </div>
                <Circle className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600">{inProgressTasks}</p>
                </div>
                <PlayCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingTasks}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const StatusIcon = statusIcons[task.status as keyof typeof statusIcons];
              const assignedMember = currentTeam.members?.find((m: any) => m.email === task.assignee);
              const canChangeStatus = user.email === task.assignee || user.email === currentTeam.createdBy;

              return (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <StatusIcon className={`w-6 h-6 mt-1 ${getStatusColor(task.status)}`} />
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">{task.title}</h3>
                            <Badge variant={priorityColors[task.priority as keyof typeof priorityColors] as any}>
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-4">{task.description}</p>

                          {task.status === "in_progress" && (
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{task.progress}%</span>
                              </div>
                              <Progress value={task.progress} className="h-2" />
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4" />
                                <span>{assignedMember?.name || task.assignee}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {canChangeStatus && (
                              <div className="flex space-x-2">
                                {task.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleTaskStatusChange(task.id, 'in_progress')}
                                  >
                                    Start Task
                                  </Button>
                                )}
                                {task.status === 'in_progress' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleTaskStatusChange(task.id, 'completed')}
                                  >
                                    Mark Complete
                                  </Button>
                                )}
                                {task.status === 'completed' && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    ✓ Completed
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <CheckCircle2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
                <p className="text-muted-foreground mb-4">
                  {user.email === currentTeam.createdBy
                    ? "Create your first task to get started!"
                    : "Your team leader will create tasks for the team."
                  }
                </p>
                {user.email === currentTeam.createdBy && (
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Task
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
