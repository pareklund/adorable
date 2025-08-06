import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ArrowUp, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";

interface ChatMessage {
  id: string;
  title: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  user: User | null;
  onNewChat: () => void;
  isOpen: boolean;
}

const ChatSidebar = ({ user, onNewChat, isOpen }: ChatSidebarProps) => {
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: "1", title: "Create a landing page for my...", timestamp: new Date() },
    { id: "2", title: "Build a todo app with...", timestamp: new Date(Date.now() - 86400000) },
    { id: "3", title: "Design a dashboard for...", timestamp: new Date(Date.now() - 172800000) },
  ]);
  const { toast } = useToast();

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
    
    try {
      console.log("Calling prompt with:", prompt);
      
      const { data, error } = await supabase.functions.invoke('prompt', {
        body: { prompt: prompt.trim() }
      });

      if (error) {
        console.error("Error calling prompt function:", error);
        toast({
          title: "Processing Error",
          description: "Failed to process prompt",
          variant: "destructive",
        });
        return;
      }

      console.log("Response from AI:", data.response);
      
      // Add to chat history
      const newChat: ChatMessage = {
        id: Date.now().toString(),
        title: prompt.trim().substring(0, 30) + (prompt.trim().length > 30 ? "..." : ""),
        timestamp: new Date(),
      };
      setChatHistory(prev => [newChat, ...prev]);
      
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

  const handleDeleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Sidebar className="h-[calc(100vh-56px)] w-80 border-chat-input-border bg-chat-input rounded-tr-xl rounded-br-xl absolute left-0 top-0 bottom-0 z-10 shadow-2xl">
      <SidebarContent className="flex-1 overflow-auto bg-chat-input">

        <div className="p-2 space-y-1">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className="group flex items-center justify-between p-3 rounded-md hover:bg-icon-hover cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{chat.title}</p>
                <p className="text-xs text-foreground/70">
                  {chat.timestamp.toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(chat.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 h-auto hover:bg-destructive/10"
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
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