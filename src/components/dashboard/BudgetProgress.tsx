
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, calculateBudgetProgress } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { mockBudgets } from "@/lib/mock-data";

export const BudgetProgress: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Card className={cn("card-hover h-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Budget Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockBudgets.slice(0, 5).map((budget) => {
            const percentage = calculateBudgetProgress(budget.spent, budget.amount);
            const remaining = budget.amount - budget.spent;
            
            let progressColor = "bg-budget-high";
            if (percentage >= 90) {
              progressColor = "bg-budget-low";
            } else if (percentage >= 75) {
              progressColor = "bg-budget-medium";
            }
            
            return (
              <div key={budget.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium capitalize">{budget.category}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className={cn("h-2", `[&>div]:${progressColor}`)} 
                />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{percentage}%</span>
                  <span className={cn(
                    remaining < 0 ? "text-budget-low" : "text-budget-saved"
                  )}>
                    {remaining < 0 ? "Over by " : "Remaining "} 
                    {formatCurrency(Math.abs(remaining))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
