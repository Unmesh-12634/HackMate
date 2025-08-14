import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Upload, 
  Link as LinkIcon, 
  File, 
  Image, 
  Video, 
  FileText, 
  Download,
  ArrowLeft,
  Search,
  Pin,
  ExternalLink,
  Github,
  Figma,
  Globe
} from 'lucide-react';

// Helper function to update team resources
const updateTeamResources = (user: any, teamId: string, updatedResources: any) => {
  const updatedUser = {
    ...user,
    teams: user.teams.map((team: any) =>
      team.id.toString() === teamId
        ? { ...team, resources: updatedResources }
        : team
    )
  };
  localStorage.setItem('user', JSON.stringify(updatedUser));
  return updatedUser;
};

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf": return <FileText className="w-5 h-5 text-red-500" />;
    case "figma": return <Figma className="w-5 h-5 text-purple-500" />;
    case "video": return <Video className="w-5 h-5 text-blue-500" />;
    case "image": return <Image className="w-5 h-5 text-green-500" />;
    default: return <File className="w-5 h-5 text-muted-foreground" />;
  }
};

const getLinkIcon = (type: string) => {
  switch (type) {
    case "github": return <Github className="w-5 h-5" />;
    case "figma": return <Figma className="w-5 h-5" />;
    default: return <Globe className="w-5 h-5" />;
  }
};

export default function Resources() {
  const [user, setUser] = useState<any>(null);
  const [currentTeam, setCurrentTeam] = useState<any>(null);
  const [resources, setResources] = useState({ files: [], links: [] });
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [newFile, setNewFile] = useState({
    name: '',
    type: 'pdf',
    size: ''
  });
  const [newLink, setNewLink] = useState({
    name: '',
    url: '',
    type: 'web'
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
        setResources(team.resources || { files: [], links: [] });
      } else {
        navigate('/teams');
      }
    } else {
      navigate('/login');
    }
  }, [teamId, navigate]);

  const handleUploadFile = () => {
    if (!newFile.name || !newFile.size) return;

    const fileData = {
      id: Date.now(),
      name: newFile.name,
      type: newFile.type,
      size: newFile.size,
      uploadedBy: user.name,
      date: new Date().toISOString(),
      pinned: false
    };

    const updatedResources = {
      ...resources,
      files: [...resources.files, fileData]
    };

    setResources(updatedResources);
    const updatedUser = updateTeamResources(user, currentTeam.id.toString(), updatedResources);
    setUser(updatedUser);

    setNewFile({ name: '', type: 'pdf', size: '' });
    setIsUploadOpen(false);
  };

  const handleAddLink = () => {
    if (!newLink.name || !newLink.url) return;

    const linkData = {
      id: Date.now(),
      name: newLink.name,
      url: newLink.url,
      type: newLink.type,
      addedBy: user.name,
      date: new Date().toISOString(),
      pinned: false
    };

    const updatedResources = {
      ...resources,
      links: [...resources.links, linkData]
    };

    setResources(updatedResources);
    const updatedUser = updateTeamResources(user, currentTeam.id.toString(), updatedResources);
    setUser(updatedUser);

    setNewLink({ name: '', url: '', type: 'web' });
    setIsLinkOpen(false);
  };

  const togglePin = (type: 'files' | 'links', id: number) => {
    const updatedResources = {
      ...resources,
      [type]: resources[type].map((item: any) =>
        item.id === id ? { ...item, pinned: !item.pinned } : item
      )
    };

    setResources(updatedResources);
    const updatedUser = updateTeamResources(user, currentTeam.id.toString(), updatedResources);
    setUser(updatedUser);
  };

  if (!user || !currentTeam) {
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
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Team Resources</h1>
            <Badge variant="secondary">{currentTeam.name}</Badge>
            <Badge variant="outline">
              {resources.files.length + resources.links.length} items
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload File</DialogTitle>
                  <DialogDescription>
                    Upload a file to share with your team
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop files here, or click to browse
                    </p>
                    <Button variant="outline" className="mt-4">
                      Choose Files
                    </Button>
                  </div>
                  <Button className="w-full" onClick={() => setIsUploadOpen(false)}>
                    Upload
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
              <DialogTrigger asChild>
                <Button>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Link</DialogTitle>
                  <DialogDescription>
                    Add a useful link for your team
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkName">Link Name</Label>
                    <Input id="linkName" placeholder="GitHub Repository" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkUrl">URL</Label>
                    <Input id="linkUrl" placeholder="https://github.com/..." />
                  </div>
                  <Button className="w-full" onClick={() => setIsLinkOpen(false)}>
                    Add Link
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Search */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search resources..." className="pl-10" />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Resources</TabsTrigger>
            <TabsTrigger value="files">Files ({resources.files.length})</TabsTrigger>
            <TabsTrigger value="links">Links ({resources.links.length})</TabsTrigger>
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Pinned Items */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Pin className="w-5 h-5 mr-2 text-primary" />
                Pinned Resources
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...resources.files.filter(f => f.pinned), ...resources.links.filter(l => l.pinned)].map((item) => (
                  <Card key={`${item.name}-${item.id}`} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {'type' in item ? getFileIcon(item.type) : getLinkIcon(item.type)}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {'uploadedBy' in item ? item.uploadedBy : item.addedBy}
                            </p>
                          </div>
                        </div>
                        <Pin className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {'size' in item ? item.size : 'Link'}
                        </span>
                        <Button size="sm" variant="outline">
                          {'url' in item ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* All Files */}
            <div>
              <h3 className="text-lg font-semibold mb-4">All Files</h3>
              <div className="space-y-3">
                {resources.files.map((file) => (
                  <Card key={file.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file.type)}
                          <div>
                            <h4 className="font-medium">{file.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {file.size} • Uploaded by {file.uploadedBy} • {file.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.pinned && <Pin className="w-4 h-4 text-primary" />}
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* All Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">All Links</h3>
              <div className="space-y-3">
                {resources.links.map((link) => (
                  <Card key={link.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getLinkIcon(link.type)}
                          <div>
                            <h4 className="font-medium">{link.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Added by {link.addedBy} • {link.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {link.pinned && <Pin className="w-4 h-4 text-primary" />}
                          <Button size="sm" variant="outline" asChild>
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files">
            <div className="space-y-3">
              {resources.files.map((file) => (
                <Card key={file.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.type)}
                        <div>
                          <h4 className="font-medium">{file.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {file.size} • Uploaded by {file.uploadedBy} • {file.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {file.pinned && <Pin className="w-4 h-4 text-primary" />}
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="links">
            <div className="space-y-3">
              {resources.links.map((link) => (
                <Card key={link.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getLinkIcon(link.type)}
                        <div>
                          <h4 className="font-medium">{link.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Added by {link.addedBy} • {link.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {link.pinned && <Pin className="w-4 h-4 text-primary" />}
                        <Button size="sm" variant="outline" asChild>
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pinned">
            <div className="space-y-3">
              {[...resources.files.filter(f => f.pinned), ...resources.links.filter(l => l.pinned)].map((item) => (
                <Card key={`pinned-${item.name}-${item.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {'type' in item ? getFileIcon(item.type) : getLinkIcon(item.type)}
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {'uploadedBy' in item ? 
                              `${item.size} • Uploaded by ${item.uploadedBy} • ${item.date}` :
                              `Added by ${item.addedBy} • ${item.date}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Pin className="w-4 h-4 text-primary" />
                        <Button size="sm" variant="outline">
                          {'url' in item ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
