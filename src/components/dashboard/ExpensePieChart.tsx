
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { expensesService } from "@/lib/supabase";

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#673AB7', '#3F51B5', '#009688', '#FFC107'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const ExpensePieChart: React.FC<{ className?: string }> = ({ className }) => {
  const { data: expensesByCategory, isLoading } = useQuery({
    queryKey: ['expensesByCategory'],
    queryFn: expensesService.getExpensesByCategory
  });

  return (
    <Card className={cn("card-hover", className)}>
      <CardHeader className="pb-0">
        <CardTitle className="text-lg">Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-4">
        <div className="w-full h-[250px] max-w-[300px] mx-auto">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesByCategory?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`$${value}`, 'Amount']}
                  contentStyle={{ 
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
