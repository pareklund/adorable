import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ArrowUp, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import adorableLogo from "@/assets/adorable-logo.png";
import { apiClient } from "@/lib/api-client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";

interface ChatMessage {
  id: string;
  message: string;
  issuer: 'user' | 'adorable';
  created_at: string;
}

interface ChatSidebarProps {
  user: User | null;
  onNewChat: () => void;
  isOpen: boolean;
  onChatHistoryChange: (hasHistory: boolean) => void;
}

const ChatSidebar = ({ user, onNewChat, isOpen, onChatHistoryChange }: ChatSidebarProps) => {
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const { toast } = useToast();

  // Listen for project changes
  useEffect(() => {
    const handleProjectChanged = () => {
      if (user) {
        fetchCurrentProject();
      }
    };

    window.addEventListener('projectChanged', handleProjectChanged);
    return () => window.removeEventListener('projectChanged', handleProjectChanged);
  }, [user]);

  // Fetch current project and chat history
  useEffect(() => {
    if (user) {
      fetchCurrentProject();
    }
  }, [user]);

  useEffect(() => {
    if (currentProject) {
      fetchChatHistory();
    }
  }, [currentProject]);

  const fetchCurrentProject = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('adorable_projects')
        .select('id, display_name')
        .eq('user_id', user.id)
        .eq('is_current', true)
        .maybeSingle();

      if (error) throw error;
      setCurrentProject(data);
    } catch (error) {
      console.error('Error fetching current project:', error);
      setCurrentProject(null);
    }
  };

  const fetchChatHistory = async () => {
    if (!currentProject) {
      setChatHistory([]);
      onChatHistoryChange(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('adorable_chat_history')
        .select('id, message, issuer, created_at')
        .eq('project_id', currentProject.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      const history = data || [];
      setChatHistory(history);
      onChatHistoryChange(history.length > 0);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setChatHistory([]);
      onChatHistoryChange(false);
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          console.log("Calling upload_image with:", file);
          toast({
            title: "Image Upload",
            description: "Image uploaded successfully!",
          });
        } catch (error) {
          toast({
            title: "Upload Error",
            description: "Failed to upload image",
            variant: "destructive",
          });
        }
      }
    };
    input.click();
  };

  const handlePromptSubmit = async () => {
    if (!prompt.trim()) return;
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the chat",
        variant: "destructive",
      });
      return;
    }

    if (!currentProject?.id) {
      toast({
        title: "No Project",
        description: "No current project found",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Calling prompt with:", prompt);
      
      const data = await apiClient.prompt({ prompt: prompt.trim() }, currentProject.id);
      
      toast({
        title: "Success",
        description: "Prompt processed successfully!",
      });
      setPrompt("");
    } catch (error) {
      console.error("Error submitting prompt:", error);
      toast({
        title: "Processing Error",
        description: "Failed to process prompt",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('adorable_chat_history')
        .delete()
        .eq('id', chatId);

      if (error) throw error;

      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      
      // Update chat history status
      const remainingHistory = chatHistory.filter(chat => chat.id !== chatId);
      onChatHistoryChange(remainingHistory.length > 0);
      toast({
        title: "Message deleted",
        description: "Chat message has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting chat message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message.",
        variant: "destructive",
      });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isOpen || !user || chatHistory.length === 0) {
    return null;
  }

  return (
    <Sidebar className="h-[calc(100vh-56px)] w-80 border-chat-input-border bg-chat-input rounded-tr-xl rounded-br-xl absolute left-0 top-0 bottom-0 z-10 shadow-2xl">
      <SidebarContent className="flex-1 overflow-auto bg-chat-input">
        <div className="p-4 space-y-4">
          {chatHistory.map((chat) => (
            <div key={chat.id}>
              {chat.issuer === 'user' ? (
                // User message in rounded box
                <div className="group relative">
                  <div className="bg-gradient-main rounded-2xl border border-chat-input-border p-3">
                    <p className="text-sm text-foreground break-words">{chat.message}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat.id);
                    }}
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 p-1 h-auto w-auto rounded-full hover:bg-destructive/10 bg-background border border-border"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              ) : (
                // Adorable response directly on background
                <div 
                  className="space-y-2"
                  onMouseEnter={() => setHoveredMessage(chat.id)}
                  onMouseLeave={() => setHoveredMessage(null)}
                >
                  <div className="flex items-center gap-2">
                    <img 
                      src={adorableLogo} 
                      alt="Adorable" 
                      className="w-5 h-5 object-contain flex-shrink-0"
                    />
                    <span className="text-sm font-medium text-foreground">Adorable</span>
                    {hoveredMessage === chat.id && (
                      <span className="text-xs text-foreground/70 ml-auto">
                        {formatTimestamp(chat.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="ml-7 group relative">
                    <p className="text-sm text-foreground break-words">{chat.message}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 p-1 h-auto w-auto rounded-full hover:bg-destructive/10 bg-background border border-border"
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-chat-input-border bg-chat-input">
        <div className="bg-gradient-main rounded-2xl border border-chat-input-border p-3">
          <div className="mb-2">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Adorable..."
              className="bg-transparent border-none text-sm placeholder:text-foreground/70 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleImageUpload}
              className="p-1.5 h-auto rounded-full hover:bg-icon-hover transition-colors text-foreground"
            >
              <Plus className="w-4 h-4" />
            </Button>

            <Button
              onClick={handlePromptSubmit}
              disabled={!prompt.trim()}
              className="p-1.5 h-auto rounded-full bg-foreground hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUp className="w-4 h-4 text-background" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default ChatSidebar;