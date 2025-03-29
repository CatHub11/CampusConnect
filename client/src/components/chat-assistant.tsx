import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Send, X, Loader2, Bot, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface ChatAssistantProps {
  showByDefault?: boolean;
  onClose?: () => void;
}

const ChatAssistant = ({ showByDefault = false, onClose }: ChatAssistantProps) => {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create a new conversation if we don't have one
  const conversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/chat/conversations", {
        userId: null // In a real app, this would be the user's ID if logged in
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setConversationId(data.id);
    },
    onError: () => {
      toast({
        title: "Couldn't start conversation",
        description: "There was an issue connecting to the chat assistant.",
        variant: "destructive"
      });
    }
  });

  // Get chat messages
  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: [`/api/chat/conversations/${conversationId}/messages`],
    enabled: conversationId !== null && isExpanded,
  });

  // Send a message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId) return null;
      
      const response = await apiRequest("POST", `/api/chat/conversations/${conversationId}/messages`, {
        content
      });
      return await response.json();
    },
    onSuccess: () => {
      // Refetch messages after sending a new one
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: [`/api/chat/conversations/${conversationId}/messages`] });
      }
    },
    onError: () => {
      toast({
        title: "Message not sent",
        description: "There was an issue sending your message.",
        variant: "destructive"
      });
    }
  });

  // Create conversation on mount if showByDefault
  useEffect(() => {
    if (showByDefault && !conversationId) {
      conversationMutation.mutate();
    }
  }, [showByDefault]);

  // Scroll to the bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus the input when expanding
  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // If we don't have a conversation yet, create one first
    if (!conversationId) {
      conversationMutation.mutate();
      // Store message to send after conversation created
      setMessage(message);
      return;
    }
    
    sendMessageMutation.mutate(message);
    setMessage("");
  };

  const handleInputFocus = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      if (!conversationId) {
        conversationMutation.mutate();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (!isExpanded && e.target.value.trim()) {
      setIsExpanded(true);
      if (!conversationId) {
        conversationMutation.mutate();
      }
    }
  };

  const collapseChat = () => {
    setIsExpanded(false);
  };

  return (
    <Card className={`w-full transition-all duration-500 ease-spring shadow-lg ${
      isExpanded ? 'h-[450px]' : 'h-auto'
    }`}>
      <CardHeader className={`px-4 ${isExpanded ? 'py-3 border-b' : 'py-2'} flex flex-row items-center justify-between space-y-0 transition-all duration-300 ease-spring`}>
        {isExpanded ? (
          <>
            <CardTitle className="text-md font-medium flex items-center">
              <Bot className="h-5 w-5 mr-2 text-primary" />
              Campus Assistant
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={collapseChat}>
                <ChevronDown className="h-4 w-4" />
              </Button>
              {onClose && (
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="w-full">
            <form className="flex w-full items-center gap-2">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  ref={inputRef}
                  placeholder="Ask about events, clubs, or campus activities..."
                  value={message}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  className="pl-9 py-5 w-full"
                />
              </div>
            </form>
          </div>
        )}
      </CardHeader>
      
      <div className={`overflow-hidden transition-all duration-500 ease-spring ${
        isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {isExpanded && (
          <>
            <ScrollArea className="flex-1 p-4">
              {conversationId ? (
                <>
                  {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : messages && Array.isArray(messages) && messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((msg: any) => (
                        <div 
                          key={msg.id} 
                          className={`flex ${msg.isFromUser ? 'justify-end' : 'justify-start'}`}
                        >
                          {!msg.isFromUser && (
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-500 mr-2">
                              <Bot className="h-5 w-5" />
                            </div>
                          )}
                          
                          <div 
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.isFromUser 
                                ? 'bg-primary-100 text-primary-900' 
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          
                          {msg.isFromUser && (
                            <div className="h-8 w-8 rounded-full bg-secondary-500 flex items-center justify-center text-white ml-2">
                              <span className="text-xs">ME</span>
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Bot className="h-12 w-12 mx-auto text-primary mb-4" />
                      <h3 className="text-lg font-medium mb-2">Campus AI Assistant</h3>
                      <p className="text-gray-500 text-sm mb-6 px-6">
                        Ask me about events, clubs, campus activities, or anything else related to campus life!
                      </p>
                      <p className="text-xs text-gray-400">
                        Type your message below to get started.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="text-lg font-medium mb-2">Campus AI Assistant</h3>
                  <p className="text-gray-500 text-sm mb-6 px-6">
                    I can help you find events, learn about clubs, and navigate campus life.
                  </p>
                </div>
              )}
            </ScrollArea>
            
            <CardFooter className="p-3 border-t">
              <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Ask about events, clubs, or campus activities..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={!conversationId || sendMessageMutation.isPending}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!message.trim() || !conversationId || sendMessageMutation.isPending}
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardFooter>
          </>
        )}
      </div>
    </Card>
  );
};

export default ChatAssistant;
