import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  id: string;
  message: string;
  userId: string;
  userName: string;
  timestamp: string;
  fileAttachment?: {
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    url: string;
  };
}

export interface TypingUser {
  userId: string;
  userName: string;
  isTyping: boolean;
}

export function useSocket(teamId: string | null, userId: string, userName: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!teamId) return;

    // Connect to Socket.io server
    const socketUrl = process.env.NODE_ENV === 'production'
      ? window.location.origin
      : 'http://localhost:3001';

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      // Join team chat room
      newSocket.emit('join_team', { teamId, userId, userName });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for new messages
    newSocket.on('receive_message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for user join/leave events
    newSocket.on('user_joined', (data) => {
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        message: data.message,
        userId: 'system',
        userName: 'System',
        timestamp: data.timestamp
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    newSocket.on('user_left', (data) => {
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        message: data.message,
        userId: 'system',
        userName: 'System',
        timestamp: data.timestamp
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    // Listen for typing indicators
    newSocket.on('user_typing', (data: TypingUser) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(user => user.userId !== data.userId);
        if (data.isTyping) {
          return [...filtered, data];
        }
        return filtered;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [teamId, userId, userName]);

  const sendMessage = (message: string, fileAttachment?: any) => {
    if (socket && teamId && (message.trim() || fileAttachment)) {
      socket.emit('send_message', {
        teamId,
        message: message.trim(),
        userId,
        userName,
        fileAttachment
      });
    }
  };

  const uploadFile = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const socketUrl = process.env.NODE_ENV === 'production'
        ? window.location.origin
        : 'http://localhost:3001';

      const response = await fetch(`${socketUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };

  const sendTyping = (isTyping: boolean) => {
    if (socket && teamId) {
      socket.emit('typing', {
        teamId,
        userId,
        userName,
        isTyping
      });
    }
  };

  const startTyping = () => {
    sendTyping(true);
    
    // Clear existing timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    
    // Set new timeout to stop typing after 3 seconds
    typingTimeout.current = setTimeout(() => {
      sendTyping(false);
    }, 3000);
  };

  const stopTyping = () => {
    sendTyping(false);
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
  };

  return {
    socket,
    messages,
    typingUsers,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping
  };
}
