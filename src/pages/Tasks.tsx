
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTasks } from "@/lib/mock-data";
import { TasksList } from "@/components/dashboard/TasksList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "@/components/forms/TaskForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Tasks: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleSuccess = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
          <TabsTrigger value="active">Active Tasks</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTasks.filter(task => !task.completed).map(task => (
                  <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50">
                    <Checkbox id={`task-${task.id}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={`task-${task.id}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {task.title}
                        </label>
                        <Badge 
                          variant={task.priority === 'high' ? "destructive" : 
                                  task.priority === 'medium' ? "secondary" : "outline"}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                      )}
                      {task.dueDate && (
                        <p className="text-xs font-medium mt-2">
                          Due: {format(task.dueDate, 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTasks.filter(task => task.completed).map(task => (
                  <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 opacity-70">
                    <Checkbox id={`task-${task.id}`} checked />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={`task-${task.id}`}
                          className="text-sm font-medium leading-none cursor-pointer line-through"
                        >
                          {task.title}
                        </label>
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-through">{task.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all">
          <TasksList className="h-auto" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tasks;
