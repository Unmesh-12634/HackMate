import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Users } from 'lucide-react';

export default function CreateTeam() {
  const [formData, setFormData] = useState({
    teamName: '',
    description: '',
    category: '',
    size: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teamName || !formData.description || !formData.category || !formData.size) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate team creation - in a real app, this would call your API
    setTimeout(() => {
      // Get current user data
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        
        // Create new team
        const newTeam = {
          id: Date.now(),
          name: formData.teamName,
          description: formData.description,
          category: formData.category,
          targetSize: parseInt(formData.size),
          role: 'Team Leader',
          members: 1,
          progress: 0,
          lastActivity: 'Just now',
          unreadMessages: 0,
          upcomingTasks: 0,
          createdAt: new Date().toISOString()
        };
        
        // Update user with new team
        const updatedUser = {
          ...user,
          teams: [...(user.teams || []), newTeam],
          currentTeam: newTeam
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        navigate('/dashboard');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">HackMate</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Your Team</h1>
          <p className="text-muted-foreground">Set up your hackathon team workspace</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Link to="/teams">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <CardTitle>Team Setup</CardTitle>
                <CardDescription>
                  As the creator, you'll automatically become the Team Leader
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input 
                  id="teamName" 
                  placeholder="Awesome Team" 
                  value={formData.teamName}
                  onChange={(e) => handleInputChange('teamName', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Team Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Tell others about your project and what you're building..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Project Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web Development</SelectItem>
                    <SelectItem value="mobile">Mobile App</SelectItem>
                    <SelectItem value="ai">AI/Machine Learning</SelectItem>
                    <SelectItem value="blockchain">Blockchain</SelectItem>
                    <SelectItem value="iot">IoT/Hardware</SelectItem>
                    <SelectItem value="game">Game Development</SelectItem>
                    <SelectItem value="fintech">FinTech</SelectItem>
                    <SelectItem value="healthtech">HealthTech</SelectItem>
                    <SelectItem value="edtech">EdTech</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="size">Target Team Size</Label>
                <Select value={formData.size} onValueChange={(value) => handleInputChange('size', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="How many members?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 members</SelectItem>
                    <SelectItem value="3">3 members</SelectItem>
                    <SelectItem value="4">4 members</SelectItem>
                    <SelectItem value="5">5 members</SelectItem>
                    <SelectItem value="6">6 members</SelectItem>
                    <SelectItem value="7">7+ members</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-primary/10 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Users className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-primary">Team Leader Role</p>
                    <p className="text-sm text-muted-foreground">
                      You'll have full access to manage team members, assign roles, and control project settings.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Team...' : 'Create Team'}
              </Button>
            </form>
            
            <div className="text-center">
              <Link to="/teams" className="text-sm text-muted-foreground hover:text-foreground">
                ← Back to Teams
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
