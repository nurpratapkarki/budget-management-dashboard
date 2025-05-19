import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { expensesService } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

export const ExpenseBarChart: React.FC<{ className?: string }> = ({ className }) => {
  const { data: monthlyExpenses = [], isLoading } = useQuery({
    queryKey: ['monthlyExpenses'],
    queryFn: expensesService.getMonthlyExpenses
  });

  return (
    <Card className={cn("card-hover", className)}>
      <CardHeader className="pb-0">
        <CardTitle className="text-lg">Monthly Expenses</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-64">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyExpenses}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'var(--foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis 
                  tick={{ fill: 'var(--foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value: any) => [`$${value}`, 'Amount']}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{ 
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#4CAF50" 
                  radius={[4, 4, 0, 0]}
                  name="Amount"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
