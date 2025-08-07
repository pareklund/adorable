import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ArrowUp, Users, ChevronDown, X, PanelLeft, PanelLeftClose } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import { useNavigate } from "react-router-dom";
import adorableLogo from "@/assets/adorable-logo.png";
import Header from "./Header";
import ChatSidebar from "./ChatSidebar";
import {apiClient} from "@/lib/api-client.ts";

const AdorableChat = () => {
  const [prompt, setPrompt] = useState("");
  const [mcpServers, setMcpServers] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasChatHistory, setHasChatHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          // Call backend function upload_image
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

  const handleGetMcpServers = async () => {
    try {
      // Call backend function get_mcp_servers
      console.log("Calling get_mcp_servers");
      // Mock response for now
      const servers = ["Server 1", "Server 2", "Server 3"];
      setMcpServers(servers);
      toast({
        title: "MCP Servers",
        description: `Found ${servers.length} available servers`,
      });
    } catch (error) {
      toast({
        title: "Server Error",
        description: "Failed to fetch MCP servers",
        variant: "destructive",
      });
    }
  };

  const handleSupabaseAction = () => {
    // Supabase functionality would go here
    toast({
      title: "Supabase",
      description: "Supabase integration activated",
    });
  };

  const handlePromptSubmit = async () => {
    if (!prompt.trim()) return;
    
    // If user is not logged in, show auth modal
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    setIsProcessing(true);
    setHasChatHistory(true);
    
    try {
      console.log("Calling prompt with:", prompt);

      const data = await apiClient.promptFirst({ prompt });

      // Trigger a custom event to notify other components about the new project
      window.dispatchEvent(new CustomEvent('projectCreated', { 
        detail: { 
          projectId: data.projectId, 
          projectName: data.projectName 
        } 
      }));

      toast({
        title: "Success",
        description: `Project "${data.projectName}" created successfully!`,
      });
      setPrompt("");
    } catch (error) {
      console.error("Error submitting prompt:", error);
      toast({
        title: "Processing Error",
        description: "Failed to process prompt",
        variant: "destructive",
      });
      setHasChatHistory(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
  };

  const handleNewChat = () => {
    setPrompt("");
    // Additional logic for starting a new chat can be added here
  };

  const handleChatHistoryChange = (hasHistory: boolean) => {
    setHasChatHistory(hasHistory);
    // Close sidebar if no chat history
    if (!hasHistory) {
      setSidebarOpen(false);
    }
  };

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="h-screen bg-gradient-main w-full flex flex-col overflow-hidden">
        <Header>
          {user && hasChatHistory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 h-auto rounded-md hover:bg-icon-hover transition-colors"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelLeft className="w-5 h-5" />
              )}
            </Button>
          )}
        </Header>
        
        <div className="flex relative" style={{ height: 'calc(100vh - 3.5rem)' }}>
          <ChatSidebar 
            user={user} 
            onNewChat={handleNewChat} 
            isOpen={sidebarOpen} 
            onChatHistoryChange={handleChatHistoryChange}
          />
          
          <div className="flex-1">
            {hasChatHistory ? (
              isProcessing ? (
                <div className="flex items-center justify-center h-full bg-background">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-24 h-24 opacity-50">
                      <img 
                        src={adorableLogo} 
                        alt="Adorable" 
                        className="w-full h-full object-contain filter grayscale"
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-foreground animate-pulse">
                        Spinning up preview...
                      </h3>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-1 h-1 bg-foreground rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-1 h-1 bg-foreground rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-1 h-1 bg-foreground rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <iframe
                  src="http://localhost:3002"
                  className="w-full h-full border-0"
                  title="Dev Server"
                />
              )
            ) : (
              <div className="flex items-center justify-center p-4 h-full">
                <div className="w-full max-w-4xl mx-auto">
                  {/* Header */}
                  <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <h1 className="text-5xl md:text-6xl font-bold text-foreground">
                        Build something
                      </h1>
                      <img 
                        src={adorableLogo} 
                        alt="Adorable" 
                        className="h-16 md:h-20 object-contain"
                      />
                      <h1 className="text-5xl md:text-6xl font-bold text-foreground">
                        Adorable
                      </h1>
                    </div>
                    <p className="text-xl text-muted-foreground">
                      Create apps and websites by chatting with AI
                    </p>
                  </div>

                  {/* Chat Interface */}
                  <div className="bg-chat-input rounded-3xl border border-chat-input-border p-6 shadow-2xl">
                    <div className="mb-4">
                      <Input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask Adorable to create a landing page for my..."
                        className="bg-transparent border-none text-lg placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                      />
                    </div>

                    {/* Toolbar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Upload Image Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleImageUpload}
                          className="p-2 h-auto rounded-full hover:bg-icon-hover transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>

                        {/* Services (MCP Servers) - Only show when logged in */}
                        {user && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleGetMcpServers}
                                className="flex items-center gap-2 px-3 py-2 h-auto rounded-full hover:bg-icon-hover transition-colors"
                              >
                                <Users className="w-4 h-4" />
                                <span className="text-sm">Services</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="bg-card border-border">
                              {mcpServers.length > 0 ? (
                                mcpServers.map((server, index) => (
                                  <DropdownMenuItem key={index}>
                                    {server}
                                  </DropdownMenuItem>
                                ))
                              ) : (
                                <DropdownMenuItem disabled>
                                  No servers available
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        {/* Supabase - Only show when logged in */}
                        {user && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSupabaseAction}
                                className="flex items-center gap-2 px-3 py-2 h-auto rounded-full hover:bg-icon-hover transition-colors"
                              >
                                <div className="w-4 h-4 bg-primary rounded flex items-center justify-center">
                                  <span className="text-xs font-bold text-primary-foreground">S</span>
                                </div>
                                <span className="text-sm">Supabase</span>
                                <ChevronDown className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="bg-card border-border">
                              <DropdownMenuItem>Connect Database</DropdownMenuItem>
                              <DropdownMenuItem>Manage Tables</DropdownMenuItem>
                              <DropdownMenuItem>Authentication</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      {/* Submit Button */}
                      <Button
                        onClick={handlePromptSubmit}
                        disabled={!prompt.trim()}
                        className="p-2 h-auto rounded-full bg-foreground hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-5 h-5 text-background" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md bg-card border-border p-0 gap-0">
          <div className="relative p-8 text-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 p-2 h-auto rounded-full hover:bg-icon-hover"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <img 
                src={adorableLogo} 
                alt="Adorable" 
                className="h-16 w-16 object-contain"
              />
            </div>

            {/* Title and Description */}
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Join and start building
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Log in or create a free account to start building your dream application
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full h-12 text-base font-medium"
              >
                Log in
              </Button>
              <Button
                onClick={() => navigate('/signup')}
                className="w-full h-12 text-base font-medium"
              >
                Sign up
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default AdorableChat;