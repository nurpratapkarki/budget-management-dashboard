
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { TasksList } from "@/components/dashboard/TasksList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { mockTasks } from "@/lib/mock-data";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Tasks: React.FC = () => {
  const completedTasks = mockTasks.filter((task) => task.completed);
  const pendingTasks = mockTasks.filter((task) => !task.completed);
  
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="mt-4">
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-2 p-3 border rounded-md">
                    <Checkbox id={`pending-${task.id}`} className="mt-0.5" />
                    <div className="grid gap-1">
                      <label
                        htmlFor={`pending-${task.id}`}
                        className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {task.title}
                      </label>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                      {task.dueDate && (
                        <p className="text-xs text-muted-foreground">
                          Due: {formatDate(task.dueDate)}
                        </p>
                      )}
                    </div>
                    <div className={cn(
                      "ml-auto text-xs px-2 py-0.5 rounded-full",
                      task.priority === 'high' ? "bg-danger-light/20 text-danger" :
                      task.priority === 'medium' ? "bg-warning-light/20 text-warning" :
                      "bg-info-light/20 text-info"
                    )}>
                      {task.priority}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="completed" className="mt-4">
              <div className="space-y-4">
                {completedTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-2 p-3 border rounded-md bg-muted/30">
                    <Checkbox id={`completed-${task.id}`} checked className="mt-0.5" />
                    <div className="grid gap-1">
                      <label
                        htmlFor={`completed-${task.id}`}
                        className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 line-through"
                      >
                        {task.title}
                      </label>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-through">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tasks;
