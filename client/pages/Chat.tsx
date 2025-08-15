import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Link, useNavigate } from 'react-router-dom';
import { useSocket, ChatMessage } from '@/hooks/useSocket';
import { 
  Send, 
  Paperclip, 
  Smile, 
  ArrowLeft, 
  Search, 
  Settings,
  Hash,
  Users,
  Bot,
  Pin,
  MoreVertical,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function Chat() {
  const [user, setUser] = useState<any>(null);
  const [currentTeam, setCurrentTeam] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize real-time chat
  const { 
    messages, 
    typingUsers, 
    isConnected, 
    sendMessage, 
    startTyping, 
    stopTyping 
  } = useSocket(
    currentTeam?.id?.toString() || null,
    user?.email || '',
    user?.name || ''
  );

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Get team from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const teamId = urlParams.get('team');

      if (!teamId) {
        navigate('/teams');
        return;
      }

      const team = parsedUser.teams?.find((t: any) => t.id.toString() === teamId);
      if (!team) {
        navigate('/teams');
        return;
      }

      setCurrentTeam(team);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Debounced auto-scroll to prevent layout thrashing
  const scrollToBottom = useCallback(() => {
    const element = messagesEndRef.current;
    if (element) {
      // Use requestAnimationFrame to avoid layout thrashing
      requestAnimationFrame(() => {
        element.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage("");
      stopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Trigger typing indicator
    if (e.target.value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "away": return "bg-yellow-500";
      default: return "bg-gray-400";
    }
  };

  if (!user || !currentTeam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card/50">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <Link to={`/dashboard?team=${currentTeam.id}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h2 className="font-semibold">Team Chat</h2>
            <div className="flex items-center">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
          <div className="mb-2">
            <Badge variant="secondary">{currentTeam.name}</Badge>
          </div>
        </div>

        {/* Team Members */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            TEAM MEMBERS ({currentTeam.members?.length || 1})
          </h3>
          <div className="space-y-2">
            {Array.isArray(currentTeam.members) ? currentTeam.members.map((member: any) => (
              <div key={member.email} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {member.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {member.name}
                    {member.email === user.email && ' (You)'}
                  </div>
                  <div className="text-xs text-muted-foreground">{member.role}</div>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  member.email === user.email ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
            )) : (
              <div className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{user?.name} (You)</div>
                  <div className="text-xs text-muted-foreground">Team Leader</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b p-4 bg-card/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Hash className="w-5 h-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold">General Chat</h1>
              <Badge variant="outline">
                {isConnected ? 'Connected' : 'Connecting...'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Pin className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="space-y-4" style={{ minHeight: '100%' }}>
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-2">
                  Welcome to the team chat!
                </div>
                <div className="text-sm text-muted-foreground">
                  Start chatting with your team members.
                </div>
              </div>
            )}
            
            {messages.map((message: ChatMessage) => (
              <div key={message.id} className={`flex items-start space-x-3 ${
                message.userId === 'system' ? 'justify-center' : ''
              }`}>
                {message.userId === 'system' ? (
                  <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {message.message}
                  </div>
                ) : (
                  <>
                    <Avatar className="w-8 h-8 mt-0.5">
                      <AvatarFallback className="text-xs">
                        {message.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">{message.userName}</span>
                        {message.userId === user.email && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <div className="text-sm text-foreground leading-relaxed">
                        {message.message}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Typing Indicators */}
            {typingUsers.filter(user => user.userId !== user.userId).map((typingUser) => (
              <div key={typingUser.userId} className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>{typingUser.userName} is typing...</span>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4 bg-card/50">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="w-4 h-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder={isConnected ? "Type a message..." : "Connecting..."}
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={!isConnected}
                className="pr-12"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
