import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import adorableLogo from "@/assets/adorable-logo.png";

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
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.email} (You)</p>
              </TooltipContent>
            </Tooltip>
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