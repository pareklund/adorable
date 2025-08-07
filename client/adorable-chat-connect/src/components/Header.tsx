import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Settings, Users, Gift, HelpCircle, Moon, LogOut } from "lucide-react";
import adorableLogo from "@/assets/adorable-logo.png";
import ProjectSelector from "./ProjectSelector";

const Header = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="h-14 border-border bg-chat-input backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          {children}
          
          {/* Logo and Navigation */}
          <div className="flex items-center gap-2">
            <img 
              src={adorableLogo} 
              alt="Adorable" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-bold text-foreground">Adorable</span>
          </div>

          {/* Project Selector */}
          <ProjectSelector user={user} />
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-4 bg-popover border border-border" align="end">
                {/* User Profile Section */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Pär's Lovable</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                {/* Credits Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground font-medium">Credits</span>
                    <span className="text-foreground">84.5 left</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Daily credits used first</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Users className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                </div>

                <DropdownMenuSeparator className="my-2" />

                {/* Workspaces Section */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-foreground mb-2">Workspaces (2)</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">P</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <span className="text-sm font-medium">Pär's Lovable</span>
                        <span className="ml-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded">PRO</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-orange-500 text-white text-sm">T</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <span className="text-sm font-medium">Temp</span>
                        <span className="ml-2 px-2 py-1 text-xs bg-muted text-muted-foreground rounded">FREE</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-2 justify-start">
                    + Create new workspace
                  </Button>
                </div>

                <DropdownMenuSeparator className="my-2" />

                {/* Menu Items */}
                <DropdownMenuItem className="cursor-pointer">
                  <Gift className="w-4 h-4 mr-2" />
                  Get free credits
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help Center
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Moon className="w-4 h-4 mr-2" />
                  Appearance
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="my-2" />
                
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="text-sm font-medium"
              >
                Log in
              </Button>
              <Button 
                onClick={() => navigate('/signup')}
                className="text-sm font-medium"
              >
                Get started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;