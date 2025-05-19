import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import { tasksService } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

export const TasksList: React.FC<{ className?: string }> = ({ className }) => {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksService.getAll
  });

  if (isLoading) {
    return (
      <Card className={cn("card-hover h-full", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingTasks = tasks.filter((task: any) => !task.completed).slice(0, 5);
  
  // Calculate completion stats for the pie chart
  const completedTasks = tasks.filter((task: any) => task.completed).length;
  const totalTasks = tasks.length;
  const incompleteTasks = totalTasks - completedTasks;
  
  const taskCompletionData = [
    { name: "Completed", value: completedTasks },
    { name: "Incomplete", value: incompleteTasks }
  ];
  
  const COLORS = ['#4CAF50', '#F44336'];
  
  return (
    <Card className={cn("card-hover h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Tasks</CardTitle>
        <div className="h-16 w-16">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={taskCompletionData}
                cx="50%"
                cy="50%"
                innerRadius={15}
                outerRadius={30}
                paddingAngle={2}
                dataKey="value"
              >
                {taskCompletionData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    strokeWidth={0}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          You have completed {completedTasks} out of {totalTasks} tasks
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Upcoming Tasks</h4>
          {upcomingTasks.length === 0 ? (
            <div className="text-sm text-muted-foreground">No active tasks. Add some tasks to get started!</div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task: any) => (
                <div key={task.id} className="flex items-start gap-2">
                  <Checkbox id={task.id} className="mt-0.5" />
                  <div className="grid gap-0.5">
                    <label
                      htmlFor={task.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {task.title}
                    </label>
                    {task.due_date && (
                      <p className="text-xs text-muted-foreground">
                        Due: {formatDate(new Date(task.due_date), 'MMM dd')}
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
          )}
        </div>
      </CardContent>
    </Card>
  );
};
