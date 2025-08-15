import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bot, Send, Minimize2, Maximize2, X } from 'lucide-react';

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIChatBoxProps {
  teamName?: string;
}

export default function AIChatBox({ teamName = 'your team' }: AIChatBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: `Hi! I'm your AI assistant for ${teamName}. I can help you with coding questions, project planning, task management, and more. How can I assist you today?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(newMessage);
      const aiMessage: Message = {
        id: Date.now() + 1,
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('task') || input.includes('todo')) {
      return "I can help you create and manage tasks! As a team leader, you can create tasks and assign them to team members. Would you like me to guide you through creating a new task?";
    }
    
    if (input.includes('code') || input.includes('programming') || input.includes('bug')) {
      return "I'd be happy to help with coding questions! Whether it's debugging, best practices, or implementing new features, feel free to share your code or describe the issue you're facing.";
    }
    
    if (input.includes('team') || input.includes('member')) {
      return "Team collaboration is key to success! I can help with team management strategies, communication tips, or adding new members to your team. What specific team-related challenge are you facing?";
    }
    
    if (input.includes('deadline') || input.includes('time') || input.includes('schedule')) {
      return "Time management is crucial in hackathons! I can help you break down your project into manageable milestones, set realistic deadlines, and track progress. What's your current timeline looking like?";
    }
    
    if (input.includes('idea') || input.includes('feature') || input.includes('project')) {
      return "That sounds interesting! I can help you brainstorm features, plan your project architecture, or evaluate the feasibility of ideas. Tell me more about what you're working on!";
    }

    if (input.includes('hi') || input.includes('hello') || input.includes('hey')) {
      return `Hello! Great to see you working hard on ${teamName}. I'm here to help with any questions about your project, coding challenges, or team coordination. What can I assist you with?`;
    }
    
    return "I'm here to help with any questions about your hackathon project! Whether it's coding, planning, team management, or brainstorming ideas, just let me know what you need assistance with.";
  };

  // Floating chat button
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300"
          size="icon"
        >
          <Bot className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-primary" />
              <CardTitle className="text-sm">AI Assistant</CardTitle>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsMinimized(false)}
              >
                <Maximize2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Full chat interface
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 h-[500px] shadow-lg flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-primary" />
            <CardTitle className="text-sm">AI Assistant</CardTitle>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsMinimized(true)}
            >
              <Minimize2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" style={{ maxHeight: '300px', minHeight: '200px' }}>
            <div className="space-y-4" style={{ minHeight: '100%' }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className={message.sender === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                        {message.sender === 'ai' ? 'AI' : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex space-x-2 max-w-[80%]">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-3 py-2 text-sm bg-muted">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                placeholder="Ask me anything about your project..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
