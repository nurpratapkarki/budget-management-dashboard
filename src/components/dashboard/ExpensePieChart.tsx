
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { expensesByCategory } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#3F51B5', '#E91E63', '#607D8B'];

export const ExpensePieChart: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Card className={cn("card-hover", className)}>
      <CardHeader className="pb-0">
        <CardTitle className="text-lg">Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
                nameKey="category"
                label={({ category }) => `${category}`}
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Amount']} 
                labelFormatter={(label) => `Category: ${label}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
