import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface Project {
  id: string;
  display_name: string;
  is_current: boolean;
}

interface ProjectSelectorProps {
  user: User | null;
}

const ProjectSelector = ({ user }: ProjectSelectorProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('adorable_projects')
        .select('id, display_name, is_current')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);
      const current = data?.find(p => p.is_current);
      setCurrentProject(current || null);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleRenameProject = async () => {
    if (!currentProject || !newProjectName.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('adorable_projects')
        .update({ display_name: newProjectName.trim() })
        .eq('id', currentProject.id);

      if (error) throw error;

      const updatedProject = { ...currentProject, display_name: newProjectName.trim() };
      setCurrentProject(updatedProject);
      setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p));
      setShowRenameModal(false);
      setNewProjectName("");

      toast({
        title: "Project renamed",
        description: "Your project has been successfully renamed.",
      });
    } catch (error) {
      console.error('Error renaming project:', error);
      toast({
        title: "Error",
        description: "Failed to rename project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = async (projectId: string) => {
    if (!user) return;

    try {
      // First, set all projects to not current
      await supabase
        .from('adorable_projects')
        .update({ is_current: false })
        .eq('user_id', user.id);

      // Then, set the selected project as current
      const { error } = await supabase
        .from('adorable_projects')
        .update({ is_current: true })
        .eq('id', projectId);

      if (error) throw error;

      await fetchProjects();

      toast({
        title: "Project selected",
        description: "Your current project has been changed.",
      });
    } catch (error) {
      console.error('Error selecting project:', error);
      toast({
        title: "Error",
        description: "Failed to select project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openRenameModal = () => {
    if (currentProject) {
      setNewProjectName(currentProject.display_name);
      setShowRenameModal(true);
    }
  };

  if (!user || projects.length === 0) {
    return null;
  }

  const displayText = currentProject 
    ? currentProject.display_name 
    : "[Please select a project]";

  const otherProjects = projects.filter(p => !p.is_current);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 text-foreground hover:bg-accent">
            <span className="font-medium">{displayText}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          {currentProject && (
            <>
              <DropdownMenuItem onClick={openRenameModal} className="cursor-pointer">
                <Edit className="w-4 h-4 mr-2" />
                Rename project
              </DropdownMenuItem>
              {otherProjects.length > 0 && <DropdownMenuSeparator />}
            </>
          )}
          {otherProjects.map((project) => (
            <DropdownMenuItem 
              key={project.id}
              onClick={() => handleSelectProject(project.id)}
              className="cursor-pointer"
            >
              {project.display_name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showRenameModal} onOpenChange={setShowRenameModal}>
        <DialogContent className="sm:max-w-[425px] bg-popover border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Rename project</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Give your project a new name.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="projectName" className="text-foreground">
                Project Name
              </Label>
              <Input
                id="projectName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="bg-background border-border text-foreground"
                placeholder="Enter project name"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newProjectName.trim()) {
                    handleRenameProject();
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Use lowercase letters, numbers, and hyphens only. Name must start with a lowercase letter. Example: my-awesome-project
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setShowRenameModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRenameProject}
              disabled={!newProjectName.trim() || loading}
            >
              {loading ? "Renaming..." : "Rename Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectSelector;