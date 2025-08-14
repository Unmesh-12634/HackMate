import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  CheckSquare, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Plus,
  Bell,
  Settings,
  Search
} from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Team Dashboard</h1>
            <Badge variant="secondary">Awesome Team</Badge>
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
            <Avatar className="w-8 h-8">
              <AvatarFallback>JD</AvatarFallback>
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
              <CardDescription>Overall team progress for Hack2024</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">68%</span>
                </div>
                <Progress value={68} className="h-2" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">5</div>
                    <div className="text-xs text-muted-foreground">In Progress</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-muted-foreground">3</div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                </div>
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
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>Your assigned tasks and updates</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckSquare className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="font-medium">API Integration</div>
                      <div className="text-sm text-muted-foreground">Due in 2 hours</div>
                    </div>
                  </div>
                  <Badge variant="secondary">High</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckSquare className="w-4 h-4 text-yellow-600" />
                    <div>
                      <div className="font-medium">UI Design Review</div>
                      <div className="text-sm text-muted-foreground">Due tomorrow</div>
                    </div>
                  </div>
                  <Badge variant="outline">Medium</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckSquare className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Database Schema</div>
                      <div className="text-sm text-muted-foreground">Due in 3 days</div>
                    </div>
                  </div>
                  <Badge variant="outline">Low</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>5 active members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">John Doe</div>
                    <div className="text-xs text-muted-foreground">Team Leader</div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Alice Smith</div>
                    <div className="text-xs text-muted-foreground">Developer</div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>BJ</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Bob Johnson</div>
                    <div className="text-xs text-muted-foreground">Designer</div>
                  </div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-8 h-8 text-primary" />
              <div>
                <div className="font-medium">Team Chat</div>
                <div className="text-sm text-muted-foreground">5 new messages</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <div className="font-medium">Resources</div>
                <div className="text-sm text-muted-foreground">12 files shared</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <div className="font-medium">Schedule</div>
                <div className="text-sm text-muted-foreground">3 upcoming</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <div className="font-medium">AI Assistant</div>
                <div className="text-sm text-muted-foreground">Ask anything</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
