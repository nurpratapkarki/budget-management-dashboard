
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { expensesByCategory } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#3F51B5', '#E91E63', '#607D8B'];

export const ExpensePieChart: React.FC<{ className?: string }> = ({ className }) => {
  const chartConfig = {
    housing: { label: 'Housing', color: COLORS[0] },
    food: { label: 'Food', color: COLORS[1] },
    transportation: { label: 'Transportation', color: COLORS[2] },
    utilities: { label: 'Utilities', color: COLORS[3] },
    healthcare: { label: 'Healthcare', color: COLORS[4] },
    entertainment: { label: 'Entertainment', color: COLORS[5] },
    shopping: { label: 'Shopping', color: COLORS[6] },
    other: { label: 'Other', color: COLORS[7] }
  };
  
  return (
    <Card className={cn("card-hover", className)}>
      <CardHeader className="pb-0">
        <CardTitle className="text-lg">Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-80">
          <ChartContainer config={chartConfig} className="h-full">
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="45%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
                nameKey="category"
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold uppercase text-muted-foreground">
                            {data.category}
                          </span>
                          <span className="text-sm font-bold">
                            ${data.amount}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {data.percentage}% of total
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                content={({ payload }) => {
                  if (payload && payload.length) {
                    return (
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        {payload.map((entry, index) => (
                          <div key={`legend-${index}`} className="flex items-center gap-1">
                            <div
                              className="h-3 w-3 rounded-sm"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="capitalize">{entry.value}</span>
                            <span className="ml-auto font-medium">
                              ${expensesByCategory[index].amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
