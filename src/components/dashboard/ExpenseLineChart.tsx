
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { monthlyExpensesData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const ExpenseLineChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={monthlyExpensesData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20,
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
          formatter={(value) => [`$${value}`, 'Amount']}
          labelFormatter={(label) => `Month: ${label}`}
          contentStyle={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)'
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#4CAF50"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Monthly Expenses"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
