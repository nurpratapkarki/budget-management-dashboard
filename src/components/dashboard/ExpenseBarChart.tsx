
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
import { monthlyExpensesData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const ExpenseBarChart: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Card className={cn("card-hover", className)}>
      <CardHeader className="pb-0">
        <CardTitle className="text-lg">Monthly Expenses</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyExpensesData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Amount']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar 
                dataKey="amount" 
                fill="#4CAF50" 
                radius={[4, 4, 0, 0]}
                name="Amount"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
