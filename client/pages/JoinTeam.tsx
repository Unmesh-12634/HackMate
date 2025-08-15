import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Users, Search, Calendar, Star } from 'lucide-react';

// Available teams will be loaded from a real backend or team sharing system
const availableTeams: any[] = [];

export default function JoinTeam() {
  const [inviteCode, setInviteCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    
    setIsLoading(true);
    
    // Simulate joining team by invite code
    setTimeout(() => {
      // In a real app, you'd validate the invite code and join the team
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        
        // Mock joining a team
        const joinedTeam = {
          id: Date.now(),
          name: "Invited Team",
          description: "You've joined via invite code",
          role: "Team Member",
          members: 4,
          progress: 25,
          lastActivity: 'Just now',
          unreadMessages: 1,
          upcomingTasks: 2
        };
        
        const updatedUser = {
          ...user,
          teams: [...(user.teams || []), joinedTeam],
          currentTeam: joinedTeam
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        navigate('/dashboard');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleJoinTeam = (team: any) => {
    setIsLoading(true);
    
    // Simulate joining a public team
    setTimeout(() => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        
        const joinedTeam = {
          id: team.id,
          name: team.name,
          description: team.description,
          role: "Team Member",
          members: team.members + 1,
          progress: Math.floor(Math.random() * 60) + 20,
          lastActivity: 'Just now',
          unreadMessages: 1,
          upcomingTasks: 3
        };
        
        const updatedUser = {
          ...user,
          teams: [...(user.teams || []), joinedTeam],
          currentTeam: joinedTeam
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        navigate('/dashboard');
      }
      setIsLoading(false);
    }, 1000);
  };

  const filteredTeams = availableTeams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center space-x-4">
          <Link to="/teams">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold">HackMate</span>
          </div>
          <h1 className="text-xl font-semibold">Join a Team</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">Browse Teams</TabsTrigger>
              <TabsTrigger value="invite">Join by Invite</TabsTrigger>
            </TabsList>
            
            <TabsContent value="browse" className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search teams by name, description, or category..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Teams Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {filteredTeams.map((team) => (
                  <Card key={team.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{team.name}</CardTitle>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="secondary">{team.category}</Badge>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-muted-foreground">{team.rating}</span>
                            </div>
                          </div>
                          <CardDescription>{team.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{team.members}/{team.targetSize} members</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{team.timeLeft}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Looking for:</p>
                          <div className="flex flex-wrap gap-1">
                            {team.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {team.leader.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">Led by {team.leader}</span>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleJoinTeam(team)}
                            disabled={isLoading}
                          >
                            Join Team
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredTeams.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No teams found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or check back later for new teams.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="invite" className="space-y-6">
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>Join by Invite Code</CardTitle>
                  <CardDescription>
                    Enter the invite code shared by your team leader
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleJoinByCode} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="inviteCode">Invite Code</Label>
                      <Input
                        id="inviteCode"
                        placeholder="Enter invite code (e.g., TEAM-ABC-123)"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Joining Team...' : 'Join Team'}
                    </Button>
                  </form>
                  
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Don't have an invite code?</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Ask your team leader for the invite code, or browse available teams instead.
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/teams">← Browse Available Teams</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
