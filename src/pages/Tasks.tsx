import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TasksList } from "@/components/dashboard/TasksList";
import { Button } from "@/components/ui/button";
import { Plus, Trash, MoreVertical, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "@/components/forms/TaskForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { tasksService } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const Tasks: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const queryClient = useQueryClient();
  
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksService.getAll
  });

  const handleSuccess = () => {
    setIsDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };
  
  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    
    try {
      await tasksService.delete(selectedTask.id);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleToggleComplete = async (task: any) => {
    try {
      // Update the task status
      await tasksService.update(task.id, {
        ...task,
        completed: !task.completed
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  const activeTasks = tasks.filter((task: any) => !task.completed);
  const completedTasks = tasks.filter((task: any) => task.completed);

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map(i => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );

  const renderEmptyState = (message: string) => (
    <div className="text-center py-8 text-muted-foreground">
      <p>{message}</p>
      <p className="text-sm mt-2">
        Click the "Add Task" button to create new tasks.
      </p>
    </div>
  );
  
  const renderTaskItem = (task: any) => (
    <div key={task.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50">
      <div className="flex items-start gap-3 flex-1">
        <Checkbox 
          id={`task-${task.id}`} 
          checked={task.completed} 
          onCheckedChange={() => handleToggleComplete(task)}
        />
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <label
              htmlFor={`task-${task.id}`}
              className={cn(
                "text-sm font-medium leading-none cursor-pointer",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </label>
            <div className="flex items-center mt-2 sm:mt-0">
              <Badge 
                variant={task.priority === 'high' ? "destructive" : 
                        task.priority === 'medium' ? "secondary" : "outline"}
                className="ml-0 sm:ml-2"
              >
                {task.priority}
              </Badge>
            </div>
          </div>
          {task.description && (
            <p className={cn(
              "text-xs text-muted-foreground mt-1",
              task.completed && "line-through"
            )}>
              {task.description}
            </p>
          )}
          {task.due_date && (
            <p className="text-xs font-medium mt-2">
              Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}
            </p>
          )}
        </div>
      </div>
      
      <div className="self-end sm:self-center ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => {
                // Edit functionality would go here
                toast("Edit functionality coming soon");
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => {
                setSelectedTask(task);
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-4 space-y-6 mb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader heading="Tasks" text="Manage your personal and work tasks" />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="self-end sm:self-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <TaskForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <Card>
            <CardHeader className="sm:flex-row sm:items-center">
              <CardTitle>Active Tasks</CardTitle>
              <div className="text-sm text-muted-foreground mt-1 sm:mt-0 sm:ml-auto">
                {activeTasks.length} task{activeTasks.length !== 1 ? 's' : ''}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                renderSkeleton()
              ) : activeTasks.length === 0 ? (
                renderEmptyState("No active tasks found.")
              ) : (
                <div className="space-y-4">
                  {activeTasks.map(renderTaskItem)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed">
          <Card>
            <CardHeader className="sm:flex-row sm:items-center">
              <CardTitle>Completed Tasks</CardTitle>
              <div className="text-sm text-muted-foreground mt-1 sm:mt-0 sm:ml-auto">
                {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                renderSkeleton()
              ) : completedTasks.length === 0 ? (
                renderEmptyState("No completed tasks yet.")
              ) : (
                <div className="space-y-4">
                  {completedTasks.map(renderTaskItem)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all">
          <TasksList className="h-auto" />
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Tasks;
