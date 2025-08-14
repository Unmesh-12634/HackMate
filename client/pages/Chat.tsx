import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
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
  MoreVertical
} from 'lucide-react';

const channels = [
  { id: 1, name: "general", type: "channel", unread: 0 },
  { id: 2, name: "development", type: "channel", unread: 3 },
  { id: 3, name: "design", type: "channel", unread: 1 },
  { id: 4, name: "ai-assistant", type: "ai", unread: 0 }
];

const messages = [
  {
    id: 1,
    user: "John Doe",
    avatar: "JD",
    message: "Hey team! Just pushed the latest API changes to the repo.",
    timestamp: "10:30 AM",
    isAI: false
  },
  {
    id: 2,
    user: "Alice Smith",
    avatar: "AS",
    message: "Great! I'll test the integration with the frontend.",
    timestamp: "10:32 AM",
    isAI: false
  },
  {
    id: 3,
    user: "HackMate AI",
    avatar: "AI",
    message: "I can help with testing strategies! Would you like me to suggest some test cases for the API integration?",
    timestamp: "10:33 AM",
    isAI: true
  },
  {
    id: 4,
    user: "Bob Johnson",
    avatar: "BJ",
    message: "The new design mockups are ready. Check them out in the #design channel.",
    timestamp: "10:45 AM",
    isAI: false
  },
  {
    id: 5,
    user: "Carol White",
    avatar: "CW",
    message: "@John Can you review the database schema changes when you have a chance?",
    timestamp: "11:15 AM",
    isAI: false
  }
];

const teamMembers = [
  { name: "John Doe", avatar: "JD", status: "online", role: "Team Leader" },
  { name: "Alice Smith", avatar: "AS", status: "online", role: "Developer" },
  { name: "Bob Johnson", avatar: "BJ", status: "away", role: "Designer" },
  { name: "Carol White", avatar: "CW", status: "offline", role: "Developer" }
];

export default function Chat() {
  const [currentChannel, setCurrentChannel] = useState("general");
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to the server
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "away": return "bg-yellow-500";
      default: return "bg-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card/50">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h2 className="font-semibold">Team Chat</h2>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search..." className="pl-10" />
          </div>
        </div>

        {/* Channels */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">CHANNELS</h3>
          <div className="space-y-1">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setCurrentChannel(channel.name)}
                className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded text-sm transition-colors ${
                  currentChannel === channel.name
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {channel.type === "ai" ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <Hash className="w-4 h-4" />
                )}
                <span className="flex-1 text-left">{channel.name}</span>
                {channel.unread > 0 && (
                  <Badge variant="destructive" className="h-5 text-xs">
                    {channel.unread}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Team Members */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            TEAM MEMBERS
          </h3>
          <div className="space-y-2">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex items-center space-x-2 p-1">
                <div className="relative">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">{member.avatar}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b p-4 bg-card/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Hash className="w-5 h-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold">{currentChannel}</h1>
              <Badge variant="secondary">4 members</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Pin className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Team discussions and collaboration
          </p>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className={message.isAI ? "bg-primary text-primary-foreground" : ""}>
                    {message.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">{message.user}</span>
                    {message.isAI && (
                      <Badge variant="secondary" className="text-xs">
                        AI
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                  </div>
                  <p className="text-sm">{message.message}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="w-4 h-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder={`Message #${currentChannel}`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Smile className="w-4 h-4" />
                </Button>
                <Button size="icon" className="h-6 w-6" onClick={handleSendMessage}>
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Type @ to mention someone</span>
            <span>⌘ + Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
}
