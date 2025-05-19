
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { mockTasks, taskCompletionData } from "@/lib/mock-data";
import { formatDate } from "@/lib/helpers";

export const TasksList: React.FC<{ className?: string }> = ({ className }) => {
  const upcomingTasks = mockTasks.filter((task) => !task.completed).slice(0, 5);
  
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
          You have completed {taskCompletionData[0].value} out of {taskCompletionData.reduce((a, b) => a + b.value, 0)} tasks
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Upcoming Tasks</h4>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-2">
                <Checkbox id={task.id} className="mt-0.5" />
                <div className="grid gap-0.5">
                  <label
                    htmlFor={task.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {task.title}
                  </label>
                  {task.dueDate && (
                    <p className="text-xs text-muted-foreground">
                      Due: {formatDate(task.dueDate, 'MMM dd')}
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
        </div>
      </CardContent>
    </Card>
  );
};
