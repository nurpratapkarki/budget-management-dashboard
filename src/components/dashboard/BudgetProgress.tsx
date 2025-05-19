import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, calculateBudgetProgress } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { budgetsService, expensesService } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

export const BudgetProgress: React.FC<{ className?: string }> = ({ className }) => {
  const { data: budgets = [], isLoading: loadingBudgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: budgetsService.getAll
  });

  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: expensesService.getAll
  });

  // Calculate how much has been spent in each budget category
  const getBudgetWithSpending = () => {
    if (!budgets.length || !expenses.length) return [];

    return budgets.map((budget: any) => {
      const spent = expenses
        .filter((exp: any) => exp.category === budget.category)
        .reduce((total: number, exp: any) => total + Number(exp.amount), 0);

      return {
        ...budget,
        spent: spent,
      };
    });
  };

  const budgetsWithSpending = getBudgetWithSpending();

  if (loadingBudgets || loadingExpenses) {
    return (
      <Card className={cn("card-hover h-full", className)}>
        <CardHeader>
          <CardTitle className="text-lg">Budget Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("card-hover h-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Budget Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {budgetsWithSpending.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No budgets set up yet.</p>
            <p className="text-sm mt-2">
              Create budgets in the budget section to track your spending progress.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgetsWithSpending.slice(0, 5).map((budget: any) => {
              const percentage = calculateBudgetProgress(budget.spent, budget.amount);
              const remaining = Number(budget.amount) - budget.spent;
              
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
        )}
      </CardContent>
    </Card>
  );
};
