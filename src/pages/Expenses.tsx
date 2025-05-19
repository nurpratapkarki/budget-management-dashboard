
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockExpenses, expensesByCategory } from "@/lib/mock-data";
import { formatCurrency, formatDate, formatCategory } from "@/lib/helpers";
import { ExpensePieChart } from "@/components/dashboard/ExpensePieChart";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Expenses: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockExpenses.slice(0, 5).map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{formatDate(expense.date, 'MMM dd')}</TableCell>
                    <TableCell>{formatCategory(expense.category)}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <ExpensePieChart />
      </div>
    </div>
  );
};

export default Expenses;
